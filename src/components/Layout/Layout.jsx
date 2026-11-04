import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { cerrarSesion, obtenerUsuario } from '../../services/api';

const MENU = [
  { to: '/dashboard', icono: 'bi-speedometer2', texto: 'Inicio (Dashboard)' },
  { to: '/productos', icono: 'bi-box-seam', texto: 'Productos' },
  { to: '/categorias', icono: 'bi-folder2', texto: 'Categorías' },
  { to: '/proveedores', icono: 'bi-people', texto: 'Proveedores' },
  { to: '/kardex', icono: 'bi-arrow-left-right', texto: 'Kardex / Movimientos' },
];

// Estructura común de las vistas privadas: menú lateral + contenido (Outlet)
const Layout = () => {
  const navigate = useNavigate();
  const usuario = obtenerUsuario();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/', { replace: true });
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><i className="bi bi-box-seam"></i></span>
          Inventario
        </div>

        <div className="nav-label">Menú</div>
        {MENU.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <i className={`bi ${item.icono}`}></i> {item.texto}
          </NavLink>
        ))}

        <div className="sidebar-card">
          <div className="fw-bold mb-1">{usuario?.nombre || 'Usuario'}</div>
          <div style={{ opacity: .85 }} className="mb-3">Rol: {usuario?.rol || '-'}</div>
          <button type="button" className="btn btn-sm btn-light w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="workspace">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
