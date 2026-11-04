import { useEffect, useState } from "react";
import api, { authHeaders, mensajeError, obtenerUsuario } from "../../services/api";
import { fechaHora, soles } from "../../utils/formato";

const COLORES = ["#2dd4bf", "#f59e0b", "#818cf8", "#f472b6", "#38bdf8", "#a3e635"];
const ICONO_TIPO = {
  Entrada: { clase: "ok", icono: "bi-arrow-down-left" },
  Salida: { clase: "out", icono: "bi-arrow-up-right" },
  Ajuste: { clase: "low", icono: "bi-sliders" },
};

// Entradas y salidas de los últimos 7 días (Ajustes cuentan según su signo)
const ultimos7Dias = (movimientos) => {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    dias.push({ fecha: d, entradas: 0, salidas: 0 });
  }
  movimientos.forEach((m) => {
    const f = new Date(m.fecha_hora);
    f.setHours(0, 0, 0, 0);
    const dia = dias.find((d) => d.fecha.getTime() === f.getTime());
    if (!dia) return;
    if (m.cantidad > 0) dia.entradas += m.cantidad;
    else dia.salidas += Math.abs(m.cantidad);
  });
  return dias;
};

const Donut = ({ datos }) => {
  const total = datos.reduce((t, d) => t + d.total, 0);
  const radio = 52;
  const circ = 2 * Math.PI * radio;
  let acumulado = 0;
  return (
    <svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Productos por categoría">
      <circle cx="70" cy="70" r={radio} fill="none" stroke="var(--surface-2)" strokeWidth="16" />
      {total > 0 &&
        datos.map((d, i) => {
          const largo = (d.total / total) * circ;
          const segmento = (
            <circle
              key={d.id}
              cx="70"
              cy="70"
              r={radio}
              fill="none"
              stroke={COLORES[i % COLORES.length]}
              strokeWidth="16"
              strokeDasharray={`${largo} ${circ - largo}`}
              strokeDashoffset={-acumulado}
              transform="rotate(-90 70 70)"
            />
          );
          acumulado += largo;
          return segmento;
        })}
      <text x="70" y="70" textAnchor="middle" className="donut-center">{total}</text>
      <text x="70" y="88" textAnchor="middle" className="donut-caption">PRODUCTOS</text>
    </svg>
  );
};

const Dashboard = () => {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const usuario = obtenerUsuario();

  useEffect(() => {
    let activo = true;
    Promise.all([
      api.get("/api/dashboard", authHeaders()),
      api.get("/api/productos", authHeaders()),
      api.get("/api/movimientos", authHeaders()),
    ])
      .then(([resumen, productos, movimientos]) => {
        if (activo) setDatos({ ...resumen.data, productos: productos.data, movimientos: movimientos.data });
      })
      .catch((err) => {
        if (activo) setError(mensajeError(err));
      });
    return () => {
      activo = false;
    };
  }, []);

  const hoy = new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });

  const encabezado = (
    <div className="topbar">
      <div>
        <div className="eyebrow mb-1">{hoy}</div>
        <h1>Hola, {usuario?.nombre?.split(" ")[0] || "equipo"} 👋</h1>
        <p>Así está tu inventario hoy.</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <>
        {encabezado}
        <div className="alert alert-danger">{error}</div>
      </>
    );
  }

  if (!datos) {
    return (
      <>
        {encabezado}
        <p className="text-muted">Cargando indicadores...</p>
      </>
    );
  }

  const { kpis, movimientosRecientes, productosPorCategoria, productos, movimientos } = datos;
  const valorInventario = productos.reduce((t, p) => t + Number(p.precio) * Number(p.stock), 0);
  const semana = ultimos7Dias(movimientos);
  const maxSemana = Math.max(1, ...semana.map((d) => Math.max(d.entradas, d.salidas)));
  const entradasSemana = semana.reduce((t, d) => t + d.entradas, 0);
  const salidasSemana = semana.reduce((t, d) => t + d.salidas, 0);
  const criticos = productos
    .filter((p) => Number(p.stock) <= kpis.umbralBajoStock)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const tarjetas = [
    { label: "Productos", valor: kpis.totalProductos, icono: "bi-box-seam" },
    { label: "Categorías", valor: kpis.totalCategorias, icono: "bi-tags", clase: "alt" },
    { label: "Proveedores", valor: kpis.totalProveedores, icono: "bi-truck" },
    { label: `Bajo stock (≤ ${kpis.umbralBajoStock})`, valor: kpis.bajoStock, icono: "bi-exclamation-triangle", clase: kpis.bajoStock > 0 ? "bad" : "warn" },
  ];

  return (
    <>
      {encabezado}

      <div className="row g-4 mb-4">
        <div className="col-xl-5">
          <div className="hero">
            <div className="hero-label">Valor total del inventario</div>
            <div className="hero-value">{soles(valorInventario)}</div>
            <div>
              <span className="chip"><i className="bi bi-stack"></i> {kpis.unidades} unidades</span>
              <span className="chip"><i className="bi bi-arrow-down-left"></i> +{entradasSemana} esta semana</span>
              <span className="chip"><i className="bi bi-arrow-up-right"></i> −{salidasSemana} esta semana</span>
            </div>
          </div>
        </div>
        <div className="col-xl-7">
          <div className="row g-4 h-100">
            {tarjetas.map((t) => (
              <div className="col-6" key={t.label}>
                <div className="stat">
                  <div className="stat-top">
                    <div className={`stat-icon ${t.clase || ""}`}><i className={`bi ${t.icono}`}></i></div>
                  </div>
                  <div className="stat-label">{t.label}</div>
                  <div className="stat-value">{t.valor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-8">
          <div className="panel h-100">
            <div className="panel-head">
              <div>
                <h4 className="panel-title">Flujo de stock</h4>
                <p className="panel-sub">Unidades que entraron y salieron en los últimos 7 días</p>
              </div>
              <div className="legend">
                <span><i style={{ background: "var(--accent)" }}></i>Entradas</span>
                <span><i style={{ background: "var(--accent-2)" }}></i>Salidas</span>
              </div>
            </div>
            <div className="chart-bars">
              {semana.map((d) => (
                <div className="chart-col" key={d.fecha.toISOString()}>
                  <div className="chart-pair">
                    <div
                      className="chart-bar in"
                      style={{ height: `${(d.entradas / maxSemana) * 100}%` }}
                      title={`Entradas: ${d.entradas}`}
                    ></div>
                    <div
                      className="chart-bar out"
                      style={{ height: `${(d.salidas / maxSemana) * 100}%` }}
                      title={`Salidas: ${d.salidas}`}
                    ></div>
                  </div>
                  <div className="chart-day">
                    {d.fecha.toLocaleDateString("es-PE", { weekday: "short" }).replace(".", "")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="panel h-100">
            <div className="panel-head">
              <div>
                <h4 className="panel-title">Catálogo por categoría</h4>
                <p className="panel-sub">Distribución de productos</p>
              </div>
            </div>
            {productosPorCategoria.length === 0 ? (
              <p className="text-muted small mb-0">No hay categorías registradas.</p>
            ) : (
              <div className="donut-wrap">
                <Donut datos={productosPorCategoria} />
                <div className="donut-list">
                  {productosPorCategoria.map((c, i) => (
                    <div className="donut-item" key={c.id}>
                      <i style={{ background: COLORES[i % COLORES.length] }}></i>
                      <span>{c.nombre}</span>
                      <strong>{c.total}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <div className="panel h-100">
            <div className="panel-head">
              <div>
                <h4 className="panel-title">Requieren reposición</h4>
                <p className="panel-sub">Productos con stock bajo o agotado</p>
              </div>
              <span className="pill out">{kpis.bajoStock}</span>
            </div>
            {criticos.length === 0 && (
              <p className="text-muted small mb-0">
                <i className="bi bi-check2-circle me-1"></i>Todo el stock está por encima del mínimo.
              </p>
            )}
            {criticos.map((p) => {
              const nivel = Math.min(100, (Number(p.stock) / (kpis.umbralBajoStock * 2)) * 100);
              const color = Number(p.stock) === 0 ? "var(--bad)" : "var(--warn)";
              return (
                <div className="alert-row" key={p.id}>
                  <div className="prod-avatar">{p.nombre?.charAt(0).toUpperCase()}</div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex justify-content-between">
                      <span className="prod-name text-truncate">{p.nombre}</span>
                      <span className="fw-bold" style={{ color }}>{p.stock} u.</span>
                    </div>
                    <div className="mini-bar"><div style={{ width: `${nivel}%`, background: color }}></div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-xl-7">
          <div className="panel h-100">
            <div className="panel-head">
              <div>
                <h4 className="panel-title">Actividad reciente</h4>
                <p className="panel-sub">Últimos movimientos del Kardex</p>
              </div>
            </div>
            {movimientosRecientes.length === 0 && (
              <p className="text-muted small mb-0">Aún no hay movimientos registrados.</p>
            )}
            {movimientosRecientes.map((m) => {
              const tipo = ICONO_TIPO[m.tipo_movimiento] || ICONO_TIPO.Ajuste;
              return (
                <div className="feed-item" key={m.id}>
                  <div className={`feed-dot ${tipo.clase}`}><i className={`bi ${tipo.icono}`}></i></div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex justify-content-between gap-2">
                      <span className="prod-name text-truncate">{m.Producto?.nombre || "-"}</span>
                      <span className={`fw-bold ${m.cantidad < 0 ? "text-danger" : "text-success"}`}>
                        {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                      </span>
                    </div>
                    <div className="prod-desc">
                      {m.tipo_movimiento} · {m.Usuario?.nombre || "Sistema"} · {fechaHora(m.fecha_hora)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
