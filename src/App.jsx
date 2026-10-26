import './App.css'
import CrudProductos from './components/Productos/crudProductos'

function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><i className="bi bi-box-seam"></i></span>
          Inventario
        </div>

        <div className="nav-label">Menú</div>
        <div className="nav-item active"><i className="bi bi-box"></i> Productos</div>

        <div className="sidebar-card">
          <div className="fw-bold mb-1">SENATI</div>
          <div style={{ opacity: .85 }}>React CRUD API Rest · Laboratorio #8</div>
        </div>
      </aside>

      <main className="workspace">
        <CrudProductos />
      </main>
    </div>
  );
}

export default App
