<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleLogin(e: Event) {
    e.preventDefault();
    error = '';

    if (!email || !password) {
      error = 'กรุณากรอกอีเมลและรหัสผ่าน';
      return;
    }

    loading = true;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    loading = false;

    if (signInError) {
      error = signInError.message === 'Invalid login credentials'
        ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        : signInError.message;
      return;
    }

    goto('/');
  }
</script>

<div class="login-page">
  <div class="login-card">
    <h1>🔮 Grounded Oracle</h1>
    <p class="subtitle">เข้าสู่ระบบเพื่อเริ่มต้น</p>

    <form onsubmit={handleLogin}>
      <div class="form-group">
        <label for="email">อีเมล</label>
        <input id="email" type="email" bind:value={email} placeholder="your@email.com" required />
      </div>

      <div class="form-group">
        <label for="password">รหัสผ่าน</label>
        <input id="password" type="password" bind:value={password} placeholder="••••••••" required />
      </div>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <button type="submit" class="submit-btn" disabled={loading}>
        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
      </button>
    </form>

    <div class="footer-text">
      ยังไม่มีบัญชี? <a href="/register">สมัครสมาชิก</a>
    </div>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
  }

  .login-card {
    background: white;
    padding: 40px;
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    max-width: 420px;
    width: 100%;
  }

  .login-card h1 {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px 0;
    text-align: center;
  }

  .subtitle {
    color: #64748b;
    text-align: center;
    margin-bottom: 28px;
    font-size: 14px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 6px;
  }

  .form-group input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  .form-group input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }

  .error-message {
    background: #fef2f2;
    color: #dc2626;
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .submit-btn {
    width: 100%;
    padding: 12px;
    background: #0f172a;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }

  .submit-btn:hover {
    background: #1e293b;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .footer-text {
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: #64748b;
  }

  .footer-text a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
  }

  .footer-text a:hover {
    text-decoration: underline;
  }
</style>
