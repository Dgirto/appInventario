import { useState, useEffect } from "react";
import api, { authHeaders, mensajeError } from "../../services/api";
import { fechaHora } from "../../utils/formato";

const formVacio = {
  producto_id: "",
  tipo_movimiento: "Entrada",
  cantidad: "",
  proveedor_id: "",
  observaciones: "",
};

const PILL_TIPO = { Entrada: "ok", Salida: "out", Ajuste: "low" };

const Kardex = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const cargarTodo = async () => {
    try {
      const [mov, prod, prov] = await Promise.all([
        api.get("/api/movimientos", authHeaders()),
        api.get("/api/productos", authHeaders()),
        api.get("/api/proveedores", authHeaders()),
      ]);
      setMovimientos(mov.data);
      setProductos(prod.data);
      setProveedores(prov.data);
    } catch (error) {
      setMensaje({ tipo: "danger", texto: mensajeError(error) });
    }
  };

  useEffect(() => {
    let activo = true;
    Promise.all([
      api.get("/api/movimientos", authHeaders()),
      api.get("/api/productos", authHeaders()),
      api.get("/api/proveedores", authHeaders()),
    ])
      .then(([mov, prod, prov]) => {
        if (!activo) return;
        setMovimientos(mov.data);
        setProductos(prod.data);
        setProveedores(prov.data);
      })
      .catch((error) => activo && setMensaje({ tipo: "danger", texto: mensajeError(error) }));
    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: "", texto: "" });
    try {
      // La cantidad siempre se ingresa positiva; en "Ajuste" puede ser negativa para restar
      const payload = {
        producto_id: form.producto_id,
        tipo_movimiento: form.tipo_movimiento,
        cantidad: Number(form.cantidad),
        observaciones: form.observaciones,
        proveedor_id: form.tipo_movimiento === "Entrada" && form.proveedor_id ? form.proveedor_id : null,
      };
      await api.post("/api/movimientos", payload, authHeaders());
      setMensaje({ tipo: "success", texto: "Movimiento registrado y stock actualizado." });
      setForm(formVacio);
      cargarTodo();
    } catch (error) {
      setMensaje({ tipo: "danger", texto: mensajeError(error) });
    }
  };

  const filtrados = movimientos.filter((m) =>
    `${m.Producto?.nombre || ""} ${m.Usuario?.nombre || ""} ${m.tipo_movimiento}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const sinProductos = productos.length === 0;
  const productoSeleccionado = productos.find((p) => String(p.id) === String(form.producto_id));

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Kardex / Movimientos</h1>
          <p>Historial de entradas, salidas y ajustes de stock</p>
        </div>
        <div className="search">
          <i className="bi bi-search"></i>
          <input
            placeholder="Buscar por producto, tipo o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {mensaje.texto && <div className={`alert alert-${mensaje.tipo} py-2`}>{mensaje.texto}</div>}

      <div className="row g-4">
        <div className="col-xl-4">
          <form onSubmit={handleSubmit} className="panel">
            <h4 className="panel-title mb-1">Registrar movimiento</h4>
            <p className="panel-sub mb-3">Cada movimiento actualiza el stock del producto</p>

            {sinProductos && (
              <div className="alert alert-warning py-2 small">
                Primero registra productos para poder hacer movimientos.
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Producto</label>
              <select
                name="producto_id"
                className="form-control"
                value={form.producto_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un producto...</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="col-6 mb-3">
                <label className="form-label">Tipo</label>
                <select
                  name="tipo_movimiento"
                  className="form-control"
                  value={form.tipo_movimiento}
                  onChange={handleChange}
                >
                  <option value="Entrada">Entrada</option>
                  <option value="Salida">Salida</option>
                  <option value="Ajuste">Ajuste</option>
                </select>
              </div>
              <div className="col-6 mb-3">
                <label className="form-label">Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  className="form-control"
                  step="1"
                  min={form.tipo_movimiento === "Ajuste" ? undefined : 1}
                  placeholder={form.tipo_movimiento === "Ajuste" ? "+5 o -2" : "0"}
                  value={form.cantidad}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {form.tipo_movimiento === "Entrada" && (
              <div className="mb-3">
                <label className="form-label">Proveedor (opcional)</label>
                <select
                  name="proveedor_id"
                  className="form-control"
                  value={form.proveedor_id}
                  onChange={handleChange}
                >
                  <option value="">Sin proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>{p.razon_social}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Observaciones</label>
              <input
                type="text"
                name="observaciones"
                className="form-control"
                placeholder="Ej. Compra del 04/11"
                value={form.observaciones}
                onChange={handleChange}
              />
            </div>

            {productoSeleccionado && (
              <p className="small text-muted mb-2">
                Stock actual: <strong>{productoSeleccionado.stock}</strong>
              </p>
            )}

            <button type="submit" className="btn-main" disabled={sinProductos}>
              <i className="bi bi-check2-circle me-2"></i>Registrar movimiento
            </button>
          </form>
        </div>

        <div className="col-xl-8">
          <div className="panel">
            <h4 className="panel-title mb-3">Lista de movimientos</h4>
            <div className="table-responsive">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Fecha / Hora</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Usuario</th>
                    <th>Proveedor</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((m) => (
                    <tr key={m.id}>
                      <td>{fechaHora(m.fecha_hora)}</td>
                      <td>
                        <div className="prod-name">{m.Producto?.nombre || "-"}</div>
                        {m.observaciones && <div className="prod-desc">{m.observaciones}</div>}
                      </td>
                      <td><span className={`pill ${PILL_TIPO[m.tipo_movimiento]}`}>{m.tipo_movimiento}</span></td>
                      <td className={`fw-bold ${m.cantidad < 0 ? "text-danger" : "text-success"}`}>
                        {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                      </td>
                      <td>{m.Usuario?.nombre || "-"}</td>
                      <td>{m.Proveedor?.razon_social || "-"}</td>
                    </tr>
                  ))}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty">No hay movimientos registrados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Kardex;
