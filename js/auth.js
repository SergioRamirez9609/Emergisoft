// ─── EmergiSoft Auth Module ─────────────────────────────────────────────────

const USERS = [
  { id: 'U001', usuario: 'admin',       password: 'admin',       nombre: 'María Solano',     rol: 'administrador', correo: 'msolano@cne.go.cr' },
  { id: 'U002', usuario: 'autoridad',   password: 'autoridad',   nombre: 'Carlos Jiménez',   rol: 'autoridad',     correo: 'cjimenez@bomberos.go.cr' },
  { id: 'U003', usuario: 'rescatista',  password: 'rescatista',  nombre: 'Ana Torres',       rol: 'rescatista',    correo: 'atorres@cruzroja.or.cr' },
  { id: 'U004', usuario: 'ciudadano',   password: 'ciudadano',   nombre: 'Luis Mora',        rol: 'ciudadano',     correo: 'lmora@ciudadano.cr' },
];

// ─── PERMISOS POR ROL ────────────────────────────────────────────────────────
const PERMISOS = {
  administrador: {
    verDashboard:    true,
    verAlertas:      true,
    registrarAlerta: true,
    gestionarAlerta: true,   // cambiar estado, eliminar
    verRecursos:     true,
    gestionarRecurso:true,   // registrar, editar, eliminar
    verUsuarios:     true,
  },
  autoridad: {
    verDashboard:    true,
    verAlertas:      true,
    registrarAlerta: true,
    gestionarAlerta: true,
    verRecursos:     true,
    gestionarRecurso:true,
    verUsuarios:     false,
  },
  rescatista: {
    verDashboard:    true,
    verAlertas:      true,
    registrarAlerta: true,
    gestionarAlerta: false,
    verRecursos:     true,
    gestionarRecurso:false,
    verUsuarios:     false,
  },
  ciudadano: {
    verDashboard:    true,
    verAlertas:      true,
    registrarAlerta: true,
    gestionarAlerta: false,
    verRecursos:     false,
    gestionarRecurso:false,
    verUsuarios:     false,
  },
};

// ─── SESSION ─────────────────────────────────────────────────────────────────
const Auth = {
  login(usuario, password) {
    const user = USERS.find(u => u.usuario === usuario && u.password === password);
    if (!user) return false;
    sessionStorage.setItem('emergisoft_session', JSON.stringify({
      id: user.id, usuario: user.usuario, nombre: user.nombre,
      rol: user.rol, correo: user.correo,
      loginAt: new Date().toISOString()
    }));
    return true;
  },

  logout() {
    sessionStorage.removeItem('emergisoft_session');
    window.location.href = 'login.html';
  },

  getSession() {
    try {
      return JSON.parse(sessionStorage.getItem('emergisoft_session'));
    } catch { return null; }
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  // Protege la página — si no hay sesión redirige al login
  require() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return null;
    }
    return this.getSession();
  },

  // Verifica un permiso específico del usuario actual
  can(permiso) {
    const session = this.getSession();
    if (!session) return false;
    return PERMISOS[session.rol]?.[permiso] ?? false;
  },

  // Redirige si no tiene permiso
  requirePermiso(permiso) {
    if (!this.can(permiso)) {
      window.location.href = 'index.html';
    }
  }
};

// ─── SIDEBAR: inyectar info del usuario y controlar visibilidad ───────────────
function initSidebar() {
  const session = Auth.getSession();
  if (!session) return;

  // Badge del rol
  const rolColors = {
    administrador: '#8b5cf6', autoridad: '#4a9eff',
    rescatista: '#f5852a', ciudadano: '#2dd08a'
  };
  const rolLabels = {
    administrador: 'Administrador', autoridad: 'Autoridad',
    rescatista: 'Rescatista', ciudadano: 'Ciudadano'
  };
  const color = rolColors[session.rol] || '#8a93a8';

  // Inyectar usuario en sidebar
  const statusEl = document.querySelector('.sidebar-status');
  if (statusEl) {
    statusEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="width:30px;height:30px;border-radius:50%;background:${color}22;color:${color};border:1px solid ${color}44;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">
          ${session.nombre.split(' ').slice(0,2).map(n=>n[0]).join('')}
        </div>
        <div style="overflow:hidden">
          <div style="font-size:11px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${session.nombre}</div>
          <div style="font-size:9px;color:${color};font-weight:700;letter-spacing:0.08em;text-transform:uppercase">${rolLabels[session.rol]}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <div class="status-dot"></div>
        <span style="font-size:10px;color:var(--text-muted)">Sesión activa</span>
      </div>
      <button onclick="Auth.logout()" style="width:100%;padding:6px;background:rgba(232,66,66,0.1);border:1px solid rgba(232,66,66,0.25);border-radius:4px;color:var(--accent-red);font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;letter-spacing:0.04em">
        ⏻ Cerrar Sesión
      </button>
      <div style="font-size:9px;color:var(--text-muted);margin-top:6px;text-align:center">v1.0 · Fidélitas</div>
    `;
  }

  // Ocultar módulo Usuarios si no tiene permiso
  if (!Auth.can('verUsuarios')) {
    document.querySelectorAll('a[href="usuarios.html"]').forEach(el => {
      el.closest('.sidebar-link') ? el.style.display = 'none' : el.style.display = 'none';
      el.style.display = 'none';
    });
  }

  // Ocultar Recursos en sidebar si no tiene permiso
  if (!Auth.can('verRecursos')) {
    document.querySelectorAll('a[href="recursos.html"]').forEach(el => {
      el.style.display = 'none';
    });
  }

  // Ocultar Reportes si no es admin ni autoridad
  if (!['administrador','autoridad'].includes(session.rol)) {
    document.querySelectorAll('a[href="reportes.html"]').forEach(el => {
      el.style.display = 'none';
    });
  }
}

// ─── AUTO-INIT en páginas protegidas ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop();
  if (page !== 'login.html') {
    Auth.require();
    initSidebar();
  }
});
