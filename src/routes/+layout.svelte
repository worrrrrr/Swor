<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import './layout.css'; // นำเข้าไฟล์ CSS ที่คุณเตรียมไว้
  import LeftSidebar from '$lib/components/LeftSidebar.svelte';
  import RightSidebar from '$lib/components/RightSidebar.svelte';

  // Svelte 5: รับค่า children สำหรับส่วนกลาง
  let { children } = $props();
</script>

<div class="notebook-shell">
  <!-- คอลัมน์ที่ 1 (ซ้าย: 320px) - แหล่งข้อมูล Sources -->
  <LeftSidebar></LeftSidebar>

  <!-- คอลัมน์ที่ 2 (กลาง: 1fr) - ส่วนแสดงผลเอกสาร Doc Sheet -->
  <main class="main-view">
    {@render children()}
  </main>

  <!-- คอลัมน์ที่ 3 (ขวา: 360px) - ส่วนแชตสนทนา Chat Panel -->
  <RightSidebar></RightSidebar>
</div>