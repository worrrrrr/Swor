<script>
  let { darkMode = $bindable(false) } = $props();
  let hue = $state(234);

  $effect(() => {
    document.documentElement.style.setProperty('--hue-primary', hue.toString());
  });

  $effect(() => {
    const savedHue = localStorage.getItem('primaryHue');
    if (savedHue) hue = parseInt(savedHue);
  });

  function updateHue(newHue) {
    hue = newHue;
    localStorage.setItem('primaryHue', hue.toString());
  }
</script>

<div class="flex items-center gap-3">
  <input type="range" min="0" max="360" bind:value={hue} oninput={() => updateHue(hue)} class="w-24 h-2 rounded-lg appearance-none cursor-pointer" style="background: linear-gradient(to right, hsl(0 85% 55%), hsl(60 85% 55%), hsl(120 85% 55%), hsl(180 85% 55%), hsl(240 85% 55%), hsl(300 85% 55%), hsl(360 85% 55%))" />
  <button onclick={() => { darkMode = !darkMode; document.documentElement.classList.toggle('dark', darkMode); localStorage.setItem('darkMode', darkMode.toString()); }} class="glass-button p-2 rounded-lg">
    {darkMode ? '☀️' : '🌙'}
  </button>
</div>