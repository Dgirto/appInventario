import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cerrarSesion, obtenerUsuario } from '../../services/api';
import { aplicarTema, leerTema } from '../../utils/tema';

const MENU = [
  { seccion: 'General' },
  { to: '/dashboard', icono: 'bi-grid-1x2', texto: 'Inicio' },
  { seccion: 'Inventario' },
  { to: '/productos', icono: 'bi-box-seam', texto: 'Productos' },
  { to: '/categorias', icono: 'bi-tags', texto: 'Categorías' },
  { to: '/proveedores', icono: 'bi-truck', texto: 'Proveedores' },
  { to: '/kardex', icono: 'bi-arrow-left-right', texto: 'Kardex / Movimientos' },
];

const iniciales = (nombre = '') =>
  nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || 'U';

// Estructura común de las vistas privadas: menú lateral + contenido (Outlet)
const Layout = () => {
  const navigate = useNavigate();
  const usuario = obtenerUsuario();
  const [tema, setTema] = useState(leerTema);

  const alternarTema = () => {
    const nuevo = tema === 'dark' ? 'light' : 'dark';
    aplicarTema(nuevo);
    setTema(nuevo);
  };

  const handleLogout = () => {
    cerrarSesion();
    navigate('/', { replace: true });
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><i className="bi bi-box-seam"></i></span>
          <div>
            Inventario
            <small>SENATI · Panel administrativo</small>
          </div>
        </div>

        {MENU.map((item) =>
          item.seccion ? (
            <div className="nav-label" key={item.seccion}>{item.seccion}</div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <i className={`bi ${item.icono}`}></i> {item.texto}
            </NavLink>
          )
        )}

        <div className="sidebar-card">
          <div className="user-row">
            <span className="avatar">{iniciales(usuario?.nombre)}</span>
            <div style={{ minWidth: 0 }}>
              <div className="fw-bold text-truncate">{usuario?.nombre || 'Usuario'}</div>
              <div style={{ opacity: .7 }}>{usuario?.rol || '-'}</div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="side-btn" onClick={alternarTema} title="Cambiar tema">
              <i className={`bi ${tema === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`}></i>
              {tema === 'dark' ? 'Claro' : 'Oscuro'}
            </button>
            <button type="button" className="side-btn" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Salir
            </button>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
