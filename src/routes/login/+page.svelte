<!-- src/routes/login/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { Auth } from '@supabase/auth-ui-svelte';
  import { ThemeSupa } from '@supabase/auth-ui-shared';

  let mounted = false;

  onMount(() => {
    mounted = true;
  });
</script>

<div class="login-page">
  <div class="login-card">
    <h1>🔮 Grounded Oracle</h1>
    <p class="subtitle">เข้าสู่ระบบเพื่อเริ่มต้น</p>

    {#if mounted}
      <Auth 
        supabaseClient={supabase}
        view="sign_in"
        providers={['google']}
        redirectTo={`${window.location.origin}/`}
        appearance={{ theme: ThemeSupa }}
      />
    {/if}

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