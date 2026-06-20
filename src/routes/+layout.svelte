<script lang="ts">
  import './layout.css'; 
  import LeftSidebar from '$lib/components/LeftSidebar.svelte';
  import RightSidebar from '$lib/components/RightSidebar.svelte';

  // Svelte 5: รับค่า children สำหรับส่วนกลาง
  let { children } = $props();
</script>

<div class="notebook-shell">
  <LeftSidebar />

  <main class="main-view">
    {@render children()}
  </main>

  <RightSidebar />
</div>
