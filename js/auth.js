// =============================================
//  EcoTrack — auth.js
//  Cadastro, Login, Avatar + Alertas visuais
// =============================================

const STORAGE_KEY = 'ecotrack_users';
const SESSION_KEY = 'ecotrack_session';

// ---------- Utilitários de dados ----------

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ---------- Sistema de Alertas Visuais ----------

const alertStyles = `
  @keyframes ecoSlideDown {
    from { opacity: 0; transform: translateY(-24px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes ecoSlideUp {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to   { opacity: 0; transform: translateY(-24px) scale(0.95); }
  }
  .ecoalert-overlay {
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 9998;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .ecoalert-box {
    background: #fff;
    border-radius: 28px;
    padding: 40px 32px 32px;
    max-width: 360px; width: 100%;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
    animation: ecoSlideDown 0.35s cubic-bezier(.34,1.56,.64,1) forwards;
    text-align: center;
    font-family: 'Poppins', sans-serif;
    position: relative;
    z-index: 9999;
  }
  .ecoalert-box.saindo {
    animation: ecoSlideUp 0.22s ease forwards;
  }
  .ecoalert-icon-wrap {
    width: 72px; height: 72px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 34px;
    margin: 0 auto 18px;
  }
  .ecoalert-icon-wrap.success { background: #e8f5ee; }
  .ecoalert-icon-wrap.error   { background: #fef2f2; }
  .ecoalert-icon-wrap.info    { background: #eef1f6; }
  .ecoalert-icon-wrap.warning { background: #fffbea; }
  .ecoalert-title {
    font-size: 19px; font-weight: 800;
    color: #1c2b3a; margin: 0 0 10px;
  }
  .ecoalert-msg {
    font-size: 13px; color: #7a8fa6;
    margin: 0 0 28px; line-height: 1.65;
  }
  .ecoalert-btn {
    width: 100%; padding: 14px;
    border: none; border-radius: 14px;
    font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: 'Poppins', sans-serif;
    transition: transform 0.15s, opacity 0.15s;
    letter-spacing: 0.2px;
  }
  .ecoalert-btn:hover  { opacity: 0.88; transform: translateY(-1px); }
  .ecoalert-btn:active { transform: translateY(0); }
  .ecoalert-btn.success { background: #1a6641; color: #fff; }
  .ecoalert-btn.error   { background: #fef2f2; color: #e05252; }
  .ecoalert-btn.info    { background: #eef1f6; color: #1c2b3a; }
  .ecoalert-btn.warning { background: #fffbea; color: #b45309; }
`;

function injectAlertStyles() {
  if (document.getElementById('ecoalert-styles')) return;
  const style = document.createElement('style');
  style.id = 'ecoalert-styles';
  style.textContent = alertStyles;
  document.head.appendChild(style);
}

/**
 * showAlert({ icon, title, msg, btnText, type, onClose })
 * type: 'success' | 'error' | 'info' | 'warning'
 */
function showAlert({ icon, title, msg, btnText = 'OK', type = 'info', onClose = null }) {
  injectAlertStyles();

  const overlay = document.createElement('div');
  overlay.className = 'ecoalert-overlay';
  overlay.innerHTML = `
    <div class="ecoalert-box">
      <div class="ecoalert-icon-wrap ${type}">${icon}</div>
      <p class="ecoalert-title">${title}</p>
      <p class="ecoalert-msg">${msg}</p>
      <button class="ecoalert-btn ${type}">${btnText}</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const box = overlay.querySelector('.ecoalert-box');
  const btn = overlay.querySelector('.ecoalert-btn');

  function fechar() {
    box.classList.add('saindo');
    setTimeout(() => {
      overlay.remove();
      if (typeof onClose === 'function') onClose();
    }, 220);
  }

  btn.addEventListener('click', fechar);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) fechar(); });
}

// ---------- Erros de campo ----------

function showError(inputEl, msg) {
  const prev = inputEl.parentElement.parentElement.querySelector('.error-msg');
  if (prev) prev.remove();

  inputEl.style.borderColor = '#e05252';
  inputEl.style.boxShadow = '0 0 0 3px rgba(224,82,82,0.12)';

  const err = document.createElement('span');
  err.className = 'error-msg';
  err.textContent = '⚠ ' + msg;
  err.style.cssText = `
    color: #e05252; font-size: 11px; margin-top: 5px;
    display: block; font-family: 'Poppins', sans-serif;
  `;
  inputEl.parentElement.after(err);
}

function clearErrors(form) {
  form.querySelectorAll('.error-msg').forEach(e => e.remove());
  form.querySelectorAll('input').forEach(i => {
    i.style.borderColor = '';
    i.style.boxShadow  = '';
  });
}

// ---------- Cadastro ----------

function initCadastro() {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors(form);

    const inputs   = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    const nome     = inputs[0];
    const email    = inputs[1];
    const senha    = inputs[2];
    const confirma = inputs[3];
    const privacy  = form.querySelector('#privacy');

    let valid = true;

    if (!nome.value.trim()) {
      showError(nome, 'Informe seu nome completo.'); valid = false;
    }
    if (!email.value.includes('@')) {
      showError(email, 'Informe um e-mail válido.'); valid = false;
    }
    if (senha.value.length < 6) {
      showError(senha, 'A senha deve ter pelo menos 6 caracteres.'); valid = false;
    }
    if (confirma.value !== senha.value) {
      showError(confirma, 'As senhas não coincidem.'); valid = false;
    }
    if (!privacy || !privacy.checked) {
      const err = document.createElement('span');
      err.className = 'error-msg';
      err.textContent = '⚠ Aceite a política de privacidade.';
      err.style.cssText = `
        color:#e05252; font-size:11px; display:block;
        margin-top:4px; font-family:'Poppins',sans-serif;
      `;
      if (privacy) privacy.parentElement.after(err);
      valid = false;
    }

    if (!valid) {
      showAlert({
        icon: '⚠️',
        title: 'Campos inválidos',
        msg: 'Corrija os campos destacados em vermelho antes de continuar.',
        btnText: 'Entendido',
        type: 'error'
      });
      return;
    }

    const users = getUsers();

    if (users.find(u => u.email === email.value.trim().toLowerCase())) {
      showError(email, 'Este e-mail já está cadastrado.');
      showAlert({
        icon: '📧',
        title: 'E-mail já cadastrado',
        msg: 'Já existe uma conta com esse e-mail. Faça login ou use outro endereço.',
        btnText: 'Ir para o login',
        type: 'warning',
        onClose: () => { window.location.href = 'login.html'; }
      });
      return;
    }

    const newUser = {
      nome:  nome.value.trim(),
      email: email.value.trim().toLowerCase(),
      senha: senha.value,
    };

    users.push(newUser);
    saveUsers(users);
    setSession(newUser);

    showAlert({
      icon: '🌿',
      title: `Bem-vindo(a), ${newUser.nome.split(' ')[0]}!`,
      msg: 'Conta criada com sucesso. Vamos começar a transformar sua pegada ecológica.',
      btnText: 'Ir para o início →',
      type: 'success',
      onClose: () => { window.location.href = 'home.html'; }
    });
  });
}

// ---------- Login ----------

function initLogin() {
  const form = document.querySelector('form');
  if (!form) return;

  // Já logado? Redireciona
  if (getSession()) {
    window.location.href = 'home.html';
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors(form);

    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    const email  = inputs[1];
    const senha  = inputs[2];

    let valid = true;

    if (!email.value.includes('@')) {
      showError(email, 'Informe um e-mail válido.'); valid = false;
    }
    if (!senha.value) {
      showError(senha, 'Informe sua senha.'); valid = false;
    }

    if (!valid) {
      showAlert({
        icon: '⚠️',
        title: 'Campos obrigatórios',
        msg: 'Preencha seu e-mail e senha para entrar.',
        btnText: 'OK',
        type: 'error'
      });
      return;
    }

    const users = getUsers();
    const user  = users.find(
      u => u.email === email.value.trim().toLowerCase() && u.senha === senha.value
    );

    if (!user) {
      const emailExiste = users.find(u => u.email === email.value.trim().toLowerCase());

      if (emailExiste) {
        showError(senha, 'Senha incorreta.');
        showAlert({
          icon: '🔒',
          title: 'Senha incorreta',
          msg: 'Esse e-mail existe, mas a senha não confere. Verifique e tente de novo.',
          btnText: 'Tentar novamente',
          type: 'error'
        });
      } else {
        showError(email, 'E-mail não encontrado.');
        showAlert({
          icon: '🔍',
          title: 'Conta não encontrada',
          msg: 'Nenhuma conta com esse e-mail. Que tal criar uma agora?',
          btnText: 'Criar conta grátis',
          type: 'info',
          onClose: () => { window.location.href = 'cadastro.html'; }
        });
      }
      return;
    }

    setSession(user);

    showAlert({
      icon: '👋',
      title: `Olá, ${user.nome.split(' ')[0]}!`,
      msg: 'Login realizado com sucesso. Bem-vindo(a) de volta ao EcoTrack.',
      btnText: 'Entrar na Eco →',
      type: 'success',
      onClose: () => { window.location.href = 'home.html'; }
    });
  });
}

// ---------- Avatar no Header ----------

function initAvatar() {
  const avatarEl = document.querySelector('.user-avatar');
  if (!avatarEl) return;

  const session = getSession();

  if (session && session.nome) {
    const inicial = session.nome.trim().charAt(0).toUpperCase();

    avatarEl.textContent = inicial;
    avatarEl.style.cssText = `
      width: 38px; height: 38px; border-radius: 50%;
      background-color: #1a6641; color: #fff;
      font-size: 16px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; user-select: none;
      font-family: 'Poppins', sans-serif;
      position: relative;
    `;

    avatarEl.addEventListener('click', function () {
      const existing = document.querySelector('.avatar-menu');
      if (existing) { existing.remove(); return; }

      const menu = document.createElement('div');
      menu.className = 'avatar-menu';
      menu.innerHTML = `
        <div style="font-weight:800;font-size:14px;color:#1c2b3a;">${session.nome.split(' ')[0]}</div>
        <div style="color:#7a8fa6;font-size:11px;margin-top:3px;">${session.email}</div>
        <hr style="border:none;border-top:1px solid #eef1f6;margin:12px 0;">
        <button class="avatar-logout-btn">🚪 &nbsp;Sair da conta</button>
      `;
      menu.style.cssText = `
        position: absolute; right: 0; top: calc(100% + 10px);
        background: #fff; border-radius: 18px; padding: 18px 20px;
        box-shadow: 0 12px 48px rgba(0,0,0,0.14);
        min-width: 210px; z-index: 999;
        font-family: 'Poppins', sans-serif; font-size: 13px;
      `;

      const logoutBtn = menu.querySelector('.avatar-logout-btn');
      logoutBtn.style.cssText = `
        width:100%; padding:11px; background:#fef2f2;
        border:none; border-radius:12px; color:#e05252;
        font-weight:700; font-size:13px; cursor:pointer;
        font-family:'Poppins',sans-serif; text-align:left;
        transition: opacity 0.15s;
      `;

      logoutBtn.addEventListener('mouseenter', () => logoutBtn.style.opacity = '0.8');
      logoutBtn.addEventListener('mouseleave', () => logoutBtn.style.opacity = '1');

      logoutBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        menu.remove();
        showAlert({
          icon: '👋',
          title: 'Até logo!',
          msg: 'Você saiu da sua conta. Volte sempre ao EcoTrack!',
          btnText: 'OK',
          type: 'info',
          onClose: () => {
            clearSession();
            window.location.href = 'login.html';
          }
        });
      });

      avatarEl.appendChild(menu);

      setTimeout(() => {
        document.addEventListener('click', function handler(ev) {
          if (!avatarEl.contains(ev.target)) {
            menu.remove();
            document.removeEventListener('click', handler);
          }
        });
      }, 10);
    });

  } else {
    // Sem sessão: exibe link de login
    avatarEl.innerHTML = '<a href="login.html" style="text-decoration:none;color:inherit;font-size:12px;font-weight:600;font-family:Poppins,sans-serif;">Entrar</a>';
    avatarEl.style.cssText = 'display:flex;align-items:center;justify-content:center;cursor:pointer;';
  }
}

// ---------- Init ----------

document.addEventListener('DOMContentLoaded', function () {
  const path = window.location.pathname;

  if (path.includes('cadastro')) {
    initCadastro();
  } else if (path.includes('login')) {
    initLogin();
  }

  initAvatar();
});