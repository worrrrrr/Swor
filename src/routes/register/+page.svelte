<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';

  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let birthDate = $state('');
  let birthTime = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleRegister(e: Event) {
    e.preventDefault();
    error = '';

    if (!email || !password || !confirmPassword || !birthDate || !birthTime) {
      error = 'กรุณากรอกข้อมูลให้ครบทุกช่อง';
      return;
    }

    if (password !== confirmPassword) {
      error = 'รหัสผ่านไม่ตรงกัน';
      return;
    }

    if (password.length < 6) {
      error = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      return;
    }

    loading = true;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          birth_date: birthDate,
          birth_time: birthTime,
        }
      }
    });

    loading = false;

    if (signUpError) {
      error = signUpError.message;
      return;
    }

    if (data.user?.identities?.length === 0) {
      error = 'อีเมลนี้ลงทะเบียนไปแล้ว';
      return;
    }

    goto('/test');
  }
</script>

<div class="register-page">
  <div class="register-card">
    <h1>🔮 Grounded Oracle</h1>
    <p class="subtitle">สมัครสมาชิกเพื่อเริ่มต้น</p>

    <form onsubmit={handleRegister}>
      <div class="form-group">
        <label for="email">อีเมล</label>
        <input id="email" type="email" bind:value={email} placeholder="your@email.com" required />
      </div>

      <div class="form-group">
        <label for="password">รหัสผ่าน</label>
        <input id="password" type="password" bind:value={password} placeholder="••••••••" required />
      </div>

      <div class="form-group">
        <label for="confirmPassword">ยืนยันรหัสผ่าน</label>
        <input id="confirmPassword" type="password" bind:value={confirmPassword} placeholder="••••••••" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="birthDate">วันเดือนปีเกิด</label>
          <input id="birthDate" type="date" bind:value={birthDate} required />
        </div>
        <div class="form-group">
          <label for="birthTime">เวลาเกิด</label>
          <input id="birthTime" type="time" bind:value={birthTime} required />
        </div>
      </div>

      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <button type="submit" class="submit-btn" disabled={loading}>
        {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
      </button>
    </form>

    <div class="footer-text">
      มีบัญชีอยู่แล้ว? <a href="/login">เข้าสู่ระบบ</a>
    </div>
  </div>
</div>

<style>
  .register-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
  }

  .register-card {
    background: white;
    padding: 40px;
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    max-width: 420px;
    width: 100%;
  }

  .register-card h1 {
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

  .form-row {
    display: flex;
    gap: 12px;
  }

  .form-row .form-group {
    flex: 1;
  }

  .form-row .form-group input {
    width: 100%;
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
