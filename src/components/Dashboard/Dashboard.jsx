import { useEffect, useState } from "react";
import api, { authHeaders, mensajeError, obtenerUsuario } from "../../services/api";
import { fechaHora } from "../../utils/formato";

const PILL_TIPO = { Entrada: "ok", Salida: "out", Ajuste: "low" };

const Dashboard = () => {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const usuario = obtenerUsuario();

  useEffect(() => {
    let activo = true;
    api
      .get("/api/dashboard", authHeaders())
      .then((response) => {
        if (activo) setDatos(response.data);
      })
      .catch((err) => {
        if (activo) setError(mensajeError(err));
      });
    return () => {
      activo = false;
    };
  }, []);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!datos) {
    return <p className="text-muted">Cargando indicadores...</p>;
  }

  const { kpis, movimientosRecientes, productosPorCategoria } = datos;
  const maximoCategoria = Math.max(1, ...productosPorCategoria.map((c) => c.total));

  const tarjetas = [
    { label: "Total de productos", valor: kpis.totalProductos, icono: "bi-box-seam" },
    { label: "Categorías", valor: kpis.totalCategorias, icono: "bi-folder2" },
    { label: "Proveedores", valor: kpis.totalProveedores, icono: "bi-people" },
    { label: `Bajo stock (≤ ${kpis.umbralBajoStock})`, valor: kpis.bajoStock, icono: "bi-exclamation-triangle", alerta: true },
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Inicio</h1>
          <p>Hola, {usuario?.nombre || "usuario"}. Este es el resumen de tu inventario.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="hero">
            <div className="hero-label">Unidades en stock</div>
            <div className="hero-value">{kpis.unidades}</div>
            <span className="chip"><i className="bi bi-box"></i> {kpis.totalProductos} productos</span>
            <span className="chip"><i className="bi bi-exclamation-triangle"></i> {kpis.bajoStock} con bajo stock</span>
          </div>
        </div>
        {tarjetas.map((t) => (
          <div className="col-sm-6 col-lg-3" key={t.label}>
            <div className="stat">
              <div className={`stat-icon${t.alerta ? " warn" : ""}`}>
                <i className={`bi ${t.icono}`}></i>
              </div>
              <div className="stat-label">{t.label}</div>
              <div className="stat-value">{t.valor}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="panel">
            <h4 className="panel-title mb-3">Movimientos recientes (Kardex)</h4>
            <div className="table-responsive">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosRecientes.map((m) => (
                    <tr key={m.id}>
                      <td>{fechaHora(m.fecha_hora)}</td>
                      <td>{m.Producto?.nombre || "-"}</td>
                      <td><span className={`pill ${PILL_TIPO[m.tipo_movimiento]}`}>{m.tipo_movimiento}</span></td>
                      <td className={`fw-bold ${m.cantidad < 0 ? "text-danger" : "text-success"}`}>
                        {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                      </td>
                      <td>{m.Usuario?.nombre || "-"}</td>
                    </tr>
                  ))}
                  {movimientosRecientes.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty">Aún no hay movimientos registrados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="panel h-100">
            <h4 className="panel-title mb-3">Productos por categoría</h4>
            {productosPorCategoria.length === 0 && (
              <p className="text-muted small mb-0">No hay categorías registradas.</p>
            )}
            {productosPorCategoria.map((c) => (
              <div key={c.id} className="mb-3">
                <div className="d-flex justify-content-between small fw-bold mb-1">
                  <span>{c.nombre}</span>
                  <span>{c.total}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(c.total / maximoCategoria) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
