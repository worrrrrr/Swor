<script lang="ts">
  // Svelte 5: จัดการสองทาง (Two-way binding) ผ่าน $bindable() ร่วมกับ $props()
  let { darkMode = $bindable(false) } = $props();
  let hue = $state(234);

  $effect(() => {
    document.documentElement.style.setProperty('--hue-primary', hue.toString());
  });

  $effect(() => {
    const savedHue = localStorage.getItem('primaryHue');
    if (savedHue) hue = parseInt(savedHue, 10);
    
    const savedDark = localStorage.getItem('darkMode');
    if (savedDark !== null) {
      darkMode = savedDark === 'true';
      document.documentElement.classList.toggle('dark', darkMode);
    }
  });

  function updateHue(newHue: number) {
    hue = newHue;
    localStorage.setItem('primaryHue', hue.toString());
  }

  function toggleMode() {
    darkMode = !darkMode;
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }
</script>

<div class="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
  <input 
    type="range" 
    min="0" 
    max="360" 
    bind:value={hue} 
    oninput={() => updateHue(hue)} 
    class="w-16 h-1.5 rounded-lg appearance-none cursor-pointer" 
    style="background: linear-gradient(to right, hsl(0 85% 55%), hsl(60 85% 55%), hsl(120 85% 55%), hsl(180 85% 55%), hsl(240 85% 55%), hsl(300 85% 55%), hsl(360 85% 55%))" 
  />
  <button onclick={toggleMode} class="p-1 rounded text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
    {darkMode ? '☀️' : '🌙'}
  </button>
</div>