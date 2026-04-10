// ─── EmergiSoft Shared Utilities ───────────────────────────────────────────

// ─── STORAGE ────────────────────────────────────────────────────────────────
const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem('emergisoft_' + key)) || []; }
    catch { return []; }
  },
  set(key, val) {
    localStorage.setItem('emergisoft_' + key, JSON.stringify(val));
  }
};

// ─── SEED DATA ───────────────────────────────────────────────────────────────
function seedData() {
  if (!localStorage.getItem('emergisoft_seeded')) {
    DB.set('alertas', [
      { id: 'A001', tipo: 'Inundación', ubicacion: 'Cartago Centro', lat: 9.8644, lng: -83.9194, gravedad: 'critico', descripcion: 'Desbordamiento del río Reventado afecta barrios aledaños.', estado: 'activa', fecha: '2025-04-04T07:30:00', reportadoPor: 'Ciudadano' },
      { id: 'A002', tipo: 'Incendio', ubicacion: 'San José, Barrio Cuba', lat: 9.9281, lng: -84.0907, gravedad: 'alto', descripcion: 'Incendio estructural en edificio de 3 plantas.', estado: 'activa', fecha: '2025-04-04T08:15:00', reportadoPor: 'Bomberos' },
      { id: 'A003', tipo: 'Accidente vial', ubicacion: 'Ruta 2, km 14', lat: 9.8920, lng: -84.0520, gravedad: 'medio', descripcion: 'Colisión múltiple con heridos leves.', estado: 'en_atencion', fecha: '2025-04-04T09:00:00', reportadoPor: 'Cruz Roja' },
      { id: 'A004', tipo: 'Deslizamiento', ubicacion: 'Turrialba, sector norte', lat: 9.9009, lng: -83.6812, gravedad: 'alto', descripcion: 'Deslizamiento bloquea vía principal al sector.', estado: 'activa', fecha: '2025-04-04T06:45:00', reportadoPor: 'CNE' },
      { id: 'A005', tipo: 'Falla eléctrica', ubicacion: 'Desamparados', lat: 9.8890, lng: -84.0600, gravedad: 'bajo', descripcion: 'Falla en subestación afecta 800 hogares.', estado: 'resuelta', fecha: '2025-04-03T22:10:00', reportadoPor: 'ICE' },
    ]);

    DB.set('recursos', [
      { id: 'R001', tipo: 'Hospital', nombre: 'Hospital Max Peralta', ubicacion: 'Cartago', lat: 9.8638, lng: -83.9170, estado: 'disponible', capacidad: 250, cantidad: 1 },
      { id: 'R002', tipo: 'Albergue', nombre: 'Albergue Estadio Fello Meza', ubicacion: 'Cartago', lat: 9.8621, lng: -83.9205, estado: 'disponible', capacidad: 400, cantidad: 1 },
      { id: 'R003', tipo: 'Vehículo', nombre: 'Ambulancia CR-201', ubicacion: 'San José Central', lat: 9.9325, lng: -84.0795, estado: 'ocupado', capacidad: 2, cantidad: 1 },
      { id: 'R004', tipo: 'Vehículo', nombre: 'Camión Bomberos B-05', ubicacion: 'Barrio Cuba', lat: 9.9280, lng: -84.0910, estado: 'ocupado', capacidad: 6, cantidad: 1 },
      { id: 'R005', tipo: 'Personal', nombre: 'Equipo Rescate Montaña', ubicacion: 'Turrialba', lat: 9.9008, lng: -83.6809, estado: 'disponible', capacidad: 12, cantidad: 1 },
      { id: 'R006', tipo: 'Hospital', nombre: 'CAIS Desamparados', ubicacion: 'Desamparados', lat: 9.8891, lng: -84.0601, estado: 'disponible', capacidad: 80, cantidad: 1 },
    ]);

    DB.set('usuarios', [
      { id: 'U001', nombre: 'María Solano', correo: 'msolano@cne.go.cr', rol: 'administrador', estado: 'activo', fecha: '2024-01-15' },
      { id: 'U002', nombre: 'Carlos Jiménez', correo: 'cjimenez@bomberos.go.cr', rol: 'autoridad', estado: 'activo', fecha: '2024-02-20' },
      { id: 'U003', nombre: 'Ana Torres', correo: 'atorres@cruzroja.or.cr', rol: 'rescatista', estado: 'activo', fecha: '2024-03-10' },
      { id: 'U004', nombre: 'Luis Mora', correo: 'lmora@ciudadano.cr', rol: 'ciudadano', estado: 'activo', fecha: '2024-04-01' },
      { id: 'U005', nombre: 'Sandra Vargas', correo: 'svargas@cne.go.cr', rol: 'autoridad', estado: 'inactivo', fecha: '2024-01-30' },
    ]);

    localStorage.setItem('emergisoft_seeded', '1');
  }
}

// ─── ID GENERATOR ─────────────────────────────────────────────────────────
function genId(prefix) {
  return prefix + Date.now().toString(36).toUpperCase().slice(-4);
}

// ─── DATE HELPERS ──────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short' }) + ' ' +
    d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff/60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff/3600)}h`;
  return `hace ${Math.floor(diff/86400)}d`;
}

// ─── LIVE CLOCK ───────────────────────────────────────────────────────────
function startClock() {
  const el = document.querySelector('.topbar-time');
  if (!el) return;
  function tick() {
    const n = new Date();
    el.textContent = n.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  setInterval(tick, 1000);
}

// ─── TOAST NOTIFICATIONS ──────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-size:15px">${icons[type]||'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity='0'; toast.style.transition='opacity 0.3s'; }, 2800);
  setTimeout(() => toast.remove(), 3200);
}

// ─── MODAL HELPERS ────────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ─── GRAVEDAD / ESTADO BADGE HELPERS ─────────────────────────────────────
function gravedadBadge(g) {
  const map = {
    critico: 'badge-red', alto: 'badge-orange',
    medio: 'badge-yellow', bajo: 'badge-green'
  };
  const labels = { critico: '⬤ CRÍTICO', alto: '▲ ALTO', medio: '◆ MEDIO', bajo: '▼ BAJO' };
  return `<span class="badge ${map[g]||'badge-gray'}">${labels[g]||g}</span>`;
}

function estadoBadge(e) {
  const map = {
    activa: 'badge-red', en_atencion: 'badge-orange',
    resuelta: 'badge-green', disponible: 'badge-green',
    ocupado: 'badge-orange', inactivo: 'badge-gray',
    activo: 'badge-green'
  };
  const labels = {
    activa: 'ACTIVA', en_atencion: 'EN ATENCIÓN', resuelta: 'RESUELTA',
    disponible: 'DISPONIBLE', ocupado: 'OCUPADO',
    activo: 'ACTIVO', inactivo: 'INACTIVO'
  };
  return `<span class="badge ${map[e]||'badge-gray'}">${labels[e]||e}</span>`;
}

function rolBadge(r) {
  const map = {
    administrador: 'badge-purple', autoridad: 'badge-blue',
    rescatista: 'badge-orange', ciudadano: 'badge-gray'
  };
  const labels = {
    administrador: '👑 ADMIN', autoridad: '🛡 AUTORIDAD',
    rescatista: '🚑 RESCATISTA', ciudadano: '👤 CIUDADANO'
  };
  return `<span class="badge ${map[r]||'badge-gray'}">${labels[r]||r}</span>`;
}

function gravedadColor(g) {
  const map = { critico: '#e84242', alto: '#f5852a', medio: '#f0c040', bajo: '#2dd08a' };
  return map[g] || '#8a93a8';
}

// ─── HAMBURGER / SIDEBAR MOBILE ───────────────────────────────────────────
function initHamburger() {
  const btn     = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!btn || !sidebar || !overlay) return;

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', openSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Delegación de eventos en el sidebar: cierra al hacer clic en cualquier link
  // (incluso links que auth.js inyecte dinámicamente después)
  sidebar.addEventListener('click', function(e) {
    const link = e.target.closest('.sidebar-link');
    if (link) closeSidebar();
  });
}

// ─── INIT ─────────────────────────────────────────────────────────────────
// initHamburger se llama directo: los scripts están al final del <body>
// por lo que el DOM ya está listo cuando este archivo se ejecuta.
initHamburger();

document.addEventListener('DOMContentLoaded', () => {
  seedData();
  startClock();
});
