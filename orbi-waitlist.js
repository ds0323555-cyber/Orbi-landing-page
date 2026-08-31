/* ============================================================
   ORBI SELLER — Lista de Espera
   Webhook: Make / Integromat
   ============================================================ */

/* ---- CSS inline para o formulário ---- */
(function injectWaitlistStyles() {
  const css = `
/* ---------------- LISTA DE ESPERA ---------------- */
.waitlist { text-align: center; position: relative; overflow: hidden; }
.waitlist::before {
  content: ""; position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  width: 900px; height: 900px; max-width: 130%;
  background: radial-gradient(circle, rgba(99,102,241,0.18), rgba(99,102,241,0.04) 40%, transparent 65%);
  pointer-events: none;
}
.waitlist .h2 { text-align: center; max-width: 22ch; margin: 0 auto; }
.waitlist .h2 span { color: #6366F1; }
.wl-form { margin: 40px auto 0; max-width: 480px; }
.wl-fields { display: flex; flex-direction: column; gap: 12px; }
.wl-input-wrap { position: relative; }
.wl-input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.3); pointer-events: none; }
.wl-input {
  width: 100%; padding: 16px 16px 16px 46px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; color: #fff; font-size: 15px; font-family: inherit;
  transition: border-color 200ms, background 200ms; outline: none;
}
.wl-input::placeholder { color: rgba(255,255,255,0.25); }
.wl-input:focus { border-color: rgba(99,102,241,0.6); background: rgba(99,102,241,0.06); }
.wl-btn {
  width: 100%; padding: 17px; margin-top: 4px;
  background: #6366F1; color: #fff; border: none; border-radius: 12px;
  font-size: 16px; font-weight: 700; letter-spacing: -0.01em;
  cursor: pointer; transition: background 200ms, transform 150ms;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  animation: ctaPulse 2.6s ease-out infinite;
}
.wl-btn:hover { background: #4f46e5; transform: translateY(-1px); animation-play-state: paused; }
.wl-btn:active { transform: translateY(0); }
.wl-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; animation: none; }
.wl-btn-spinner {
  width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%; animation: wlSpin 0.7s linear infinite;
}
@keyframes wlSpin { to { transform: rotate(360deg); } }
.wl-success {
  display: none; flex-direction: column; align-items: center; gap: 16px;
  padding: 32px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);
  border-radius: 16px; margin-top: 16px;
}
.wl-success.show { display: flex; }
.wl-success-icon { width: 56px; height: 56px; background: rgba(16,185,129,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.wl-success h4 { font-size: 20px; font-weight: 700; color: #fff; margin: 0; }
.wl-success p { color: rgba(255,255,255,0.6); font-size: 15px; text-align: center; max-width: 36ch; margin: 0; }
.wl-error { margin-top: 10px; color: #f87171; font-size: 13px; display: none; text-align: center; }
.wl-error.show { display: block; }
@media (max-width: 520px) { .wl-form { padding: 0 4px; } }
`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();

/* ---- Máscara WhatsApp ---- */
document.addEventListener('DOMContentLoaded', function () {
  const wlWa = document.getElementById('wlWhatsapp');
  if (wlWa) {
    wlWa.addEventListener('input', function (e) {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 6) v = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
      else if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
      else if (v.length > 0) v = '(' + v;
      e.target.value = v;
    });
    wlWa.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitWaitlist();
    });
  }
  const wlNome = document.getElementById('wlNome');
  if (wlNome) {
    wlNome.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const wa = document.getElementById('wlWhatsapp');
        if (wa) wa.focus();
      }
    });
  }
});

/* ---- Submit ---- */
async function submitWaitlist() {
  const nome = (document.getElementById('wlNome').value || '').trim();
  const email = (document.getElementById('wlEmail').value || '').trim();
  const whatsapp = (document.getElementById('wlWhatsapp').value || '').trim();
  const btn = document.getElementById('wlBtn');
  const btnText = document.getElementById('wlBtnText');
  const spinner = document.getElementById('wlBtnSpinner');
  const errorEl = document.getElementById('wlError');
  const successEl = document.getElementById('wlSuccess');
  const fieldsEl = document.getElementById('wlFields');

  errorEl.textContent = '';
  errorEl.classList.remove('show');

  if (!nome) {
    errorEl.textContent = 'Por favor, informe seu nome.';
    errorEl.classList.add('show');
    document.getElementById('wlNome').focus();
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorEl.textContent = 'Informe um e-mail válido. Ex: voce@email.com';
    errorEl.classList.add('show');
    document.getElementById('wlEmail').focus();
    return;
  }
  const digitos = whatsapp.replace(/\D/g, '');
  if (digitos.length < 10) {
    errorEl.textContent = 'Informe um WhatsApp válido com DDD. Ex: (11) 99999-9999';
    errorEl.classList.add('show');
    document.getElementById('wlWhatsapp').focus();
    return;
  }

  btn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'block';

  try {
    await fetch('https://n8n.srv1749628.hstgr.cloud/webhook/orbi-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome,
        email: email,
        whatsapp: digitos,
        origem: 'landing-orbiseller',
        data: new Date().toISOString()
      })
    });
    if (typeof gtag === 'function') {
      gtag('event', 'gerar_lead', {
        event_category: 'waitlist',
        event_label: 'formulario-landing'
      });
    }
    fieldsEl.style.display = 'none';
    successEl.classList.add('show');
  } catch (err) {
    btn.disabled = false;
    btnText.style.display = 'block';
    spinner.style.display = 'none';
    errorEl.textContent = 'Erro ao enviar. Tente novamente ou fale conosco no WhatsApp.';
    errorEl.classList.add('show');
  }
}
