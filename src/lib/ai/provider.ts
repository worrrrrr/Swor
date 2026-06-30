import { env } from '$env/dynamic/private';

const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions';

const PROVIDER = env.AI_PROVIDER || 'groq';
const OLLAMA_BASE = env.OLLAMA_BASE_URL || 'http://localhost:11434';

function getKey(name: string): string {
  return env[name] || '';
}

interface Message {
  role: string;
  content: string;
}

interface ProviderConfig {
  baseUrl: string;
  model: string;
  authHeader?: string;
  formatMessages: (msgs: Message[], systemPrompt: string) => any;
  parseResponse: (raw: any) => string;
}

function groqConfig(): ProviderConfig {
  return {
    baseUrl: GROQ_BASE,
    model: 'llama-3.3-70b-versatile',
    authHeader: `Bearer ${getKey('GROQ_API_KEY')}`,
    formatMessages(msgs, system) {
      return {
        messages: [{ role: 'system', content: system }, ...msgs],
        temperature: 0.7,
      };
    },
    parseResponse(raw) {
      return raw.choices?.[0]?.message?.content || '';
    },
  };
}

function geminiConfig(): ProviderConfig {
  return {
    baseUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${getKey('GEMINI_API_KEY')}`,
    model: 'models/gemini-3.5-flash',
    formatMessages(msgs, system) {
      const contents: any[] = [];
      if (system) {
        contents.push({ role: 'user', parts: [{ text: `[System]\n${system}` }] });
        contents.push({ role: 'model', parts: [{ text: 'Ok' }] });
      }
      for (const m of msgs) {
        const role = m.role === 'assistant' ? 'model' : 'user';
        contents.push({ role, parts: [{ text: m.content }] });
      }
      return { contents, generationConfig: { temperature: 0.7, maxOutputTokens: 4096 } };
    },
    parseResponse(raw) {
      return raw.candidates?.[0]?.content?.parts?.[0]?.text || '';
    },
  };
}

function deepseekConfig(): ProviderConfig {
  return {
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    authHeader: `Bearer ${getKey('DEEPSEEK_API_KEY')}`,
    formatMessages(msgs, system) {
      return {
        messages: [{ role: 'system', content: system }, ...msgs],
        temperature: 0.7,
      };
    },
    parseResponse(raw) {
      return raw.choices?.[0]?.message?.content || '';
    },
  };
}

function ollamaConfig(): ProviderConfig {
  return {
    baseUrl: `${OLLAMA_BASE}/v1/chat/completions`,
    model: getKey('OLLAMA_MODEL') || 'llama3.2',
    formatMessages(msgs, system) {
      return {
        messages: [{ role: 'system', content: system }, ...msgs],
        temperature: 0.7,
      };
    },
    parseResponse(raw) {
      return raw.choices?.[0]?.message?.content || '';
    },
  };
}

function getConfig(): ProviderConfig {
  switch (PROVIDER) {
    case 'gemini': return geminiConfig();
    case 'deepseek': return deepseekConfig();
    case 'ollama': return ollamaConfig();
    default: return groqConfig();
  }
}

export async function callAI(
  messages: Message[],
  systemPrompt: string,
  maxTokens = 4096,
): Promise<string> {
  const config = getConfig();

  const body: any = config.formatMessages(messages, systemPrompt);
  body.max_tokens = maxTokens;
  body.model = config.model;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.authHeader) {
    headers['Authorization'] = config.authHeader;
  }

  const res = await fetch(config.baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${PROVIDER} API error (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return config.parseResponse(data);
}

export function getCurrentProvider(): string {
  return PROVIDER;
}
