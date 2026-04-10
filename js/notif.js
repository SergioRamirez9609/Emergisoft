// ─── EmergiSoft Notifications Module ────────────────────────────────────────

const Notif = {

  // ─ Reglas: qué roles reciben qué gravedades
  REGLAS: {
    administrador: ['critico', 'alto', 'medio', 'bajo'],
    autoridad:     ['critico', 'alto', 'medio', 'bajo'],
    rescatista:    ['critico', 'alto'],
    ciudadano:     [],
  },

  // ─ Guardar notificación
  push(data) {
    const all = this.getAll();
    all.unshift({
      id: 'N' + Date.now(),
      titulo: data.titulo,
      mensaje: data.mensaje,
      gravedad: data.gravedad || 'info',
      fecha: new Date().toISOString(),
      leida: false,
      alertaId: data.alertaId || null,
    });
    // Máximo 50 notificaciones
    DB.set('notificaciones', all.slice(0, 50));
    this.updateBadge();
  },

  // ─ Obtener todas
  getAll() {
    return DB.get('notificaciones');
  },

  // ─ Sin leer para el usuario actual
  getSinLeer() {
    return this.getAll().filter(n => !n.leida);
  },

  // ─ Marcar una como leída
  marcarLeida(id) {
    const all = this.getAll().map(n => n.id === id ? { ...n, leida: true } : n);
    DB.set('notificaciones', all);
    this.updateBadge();
    this.renderPanel();
  },

  // ─ Marcar todas como leídas
  marcarTodasLeidas() {
    const all = this.getAll().map(n => ({ ...n, leida: true }));
    DB.set('notificaciones', all);
    this.updateBadge();
    this.renderPanel();
  },

  // ─ Actualizar badge del topbar
  updateBadge() {
    const count = this.getSinLeer().length;
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  },

  // ─ Render del panel desplegable
  renderPanel() {
    const panel = document.getElementById('notif-panel');
    if (!panel) return;
    const all = this.getAll();
    const sinLeer = this.getSinLeer().length;

    if (!all.length) {
      panel.querySelector('.notif-list').innerHTML = `
        <div style="padding:32px 20px;text-align:center;color:var(--text-muted)">
          <div style="font-size:28px;margin-bottom:8px;opacity:0.4">🔕</div>
          <div style="font-size:12px">Sin notificaciones</div>
        </div>`;
      return;
    }

    panel.querySelector('.notif-list').innerHTML = all.slice(0, 20).map(n => {
      const color = gravedadColor(n.gravedad) || 'var(--accent-blue)';
      const timeStr = timeAgo(n.fecha);
      return `
        <div class="notif-item ${n.leida ? 'leida' : ''}" onclick="Notif.marcarLeida('${n.id}')">
          <div class="notif-dot" style="background:${color};box-shadow:0 0 6px ${color}40"></div>
          <div class="notif-body">
            <div class="notif-titulo">${n.titulo}</div>
            <div class="notif-msg">${n.mensaje}</div>
            <div class="notif-time">${timeStr}</div>
          </div>
          ${!n.leida ? '<div class="notif-unread-dot"></div>' : ''}
        </div>`;
    }).join('');

    // Header count
    const headerCount = panel.querySelector('.notif-header-count');
    if (headerCount) {
      headerCount.textContent = sinLeer > 0 ? `${sinLeer} sin leer` : 'Todo al día';
      headerCount.style.color = sinLeer > 0 ? 'var(--accent-red)' : 'var(--accent-green)';
    }
  },

  // ─ Toggle del panel
  togglePanel() {
    const panel = document.getElementById('notif-panel');
    if (!panel) return;
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      panel.classList.remove('open');
    } else {
      this.renderPanel();
      panel.classList.add('open');
    }
  },

  // ─ Generar notificación al crear una alerta (llamar desde alertas.html)
  notificarAlerta(alerta) {
    const session = Auth.getSession();
    if (!session) return;
    const rolesQueReciben = this.REGLAS[session.rol] || [];
    if (!rolesQueReciben.includes(alerta.gravedad)) return;

    const labelGravedad = { critico: 'CRÍTICO', alto: 'ALTO', medio: 'MEDIO', bajo: 'BAJO' };

    this.push({
      titulo: `Nueva alerta: ${alerta.tipo}`,
      mensaje: `${labelGravedad[alerta.gravedad]} · ${alerta.ubicacion} · Reportado por ${alerta.reportadoPor}`,
      gravedad: alerta.gravedad,
      alertaId: alerta.id,
    });
  },

  // ─ Inyectar campana en el topbar (llamar en cada página)
  injectBell() {
    const actions = document.querySelector('.topbar-actions');
    if (!actions || document.getElementById('notif-btn')) return;

    // Botón campana
    const btn = document.createElement('div');
    btn.id = 'notif-btn';
    btn.style.cssText = 'position:relative;cursor:pointer;display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:6px;border:1px solid var(--border-bright);background:var(--bg-tertiary);transition:background 0.15s;flex-shrink:0';
    btn.innerHTML = `
      <span style="font-size:16px;line-height:1">🔔</span>
      <span id="notif-badge" style="display:none;position:absolute;top:-4px;right:-4px;background:var(--accent-red);color:#fff;font-size:9px;font-weight:700;min-width:16px;height:16px;border-radius:8px;align-items:center;justify-content:center;padding:0 3px;font-family:'Space Mono',monospace">0</span>
    `;
    btn.addEventListener('mouseenter', () => btn.style.background = 'var(--bg-secondary)');
    btn.addEventListener('mouseleave', () => btn.style.background = 'var(--bg-tertiary)');
    btn.addEventListener('click', (e) => { e.stopPropagation(); Notif.togglePanel(); });

    // Insertar antes del primer hijo de actions
    actions.insertBefore(btn, actions.firstChild);

    // Panel desplegable
    const panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.innerHTML = `
      <div class="notif-header">
        <span style="font-family:'Space Mono',monospace;font-size:11px;font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.06em">Notificaciones</span>
        <span class="notif-header-count" style="font-size:10px">—</span>
        <button onclick="Notif.marcarTodasLeidas()" style="margin-left:auto;background:none;border:none;color:var(--text-muted);font-size:10px;cursor:pointer;font-family:inherit;padding:0">Marcar todas leídas</button>
      </div>
      <div class="notif-list"></div>
    `;
    document.body.appendChild(panel);

    // Cerrar al hacer clic afuera
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !panel.contains(e.target)) {
        panel.classList.remove('open');
      }
    });

    this.updateBadge();
  },
};

// ─── CSS del panel de notificaciones ────────────────────────────────────────
(function injectNotifStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #notif-panel {
      display: none;
      position: fixed;
      top: calc(var(--header-height) + 6px);
      right: 16px;
      width: 320px;
      max-height: 480px;
      background: var(--bg-card);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 500;
      flex-direction: column;
      overflow: hidden;
      animation: notifIn 0.18s ease;
    }

    #notif-panel.open { display: flex; }

    @keyframes notifIn {
      from { opacity: 0; transform: translateY(-6px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .notif-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }

    .notif-list {
      overflow-y: auto;
      flex: 1;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 11px 14px;
      border-bottom: 1px solid rgba(37,42,53,0.5);
      cursor: pointer;
      transition: background 0.12s;
      position: relative;
    }

    .notif-item:last-child { border-bottom: none; }
    .notif-item:hover { background: rgba(255,255,255,0.025); }
    .notif-item.leida { opacity: 0.55; }

    .notif-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 4px;
    }

    .notif-body { flex: 1; min-width: 0; }

    .notif-titulo {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .notif-msg {
      font-size: 11px;
      color: var(--text-muted);
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .notif-time {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      color: var(--text-muted);
      opacity: 0.7;
    }

    .notif-unread-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--accent-blue);
      flex-shrink: 0;
      margin-top: 6px;
    }
  `;
  document.head.appendChild(style);
})();

// ─── AUTO-INIT ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop();
  if (page !== 'login.html') {
    // Esperar a que el DOM esté listo y el topbar exista
    setTimeout(() => Notif.injectBell(), 0);
  }
});
