import { useState, useEffect } from "react";
import api, { authHeaders, mensajeError, obtenerUsuario } from "../../services/api";
import { soles, estadoStock } from "../../utils/formato";

const formVacio = { id: null, nombre: "", descripcion: "", precio: "", stock: "", categoria_id: "" };

const CrudProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const esAdmin = obtenerUsuario()?.rol === "Administrador";

  const obtenerProductos = async () => {
    try {
      const response = await api.get("/api/productos", authHeaders());
      setProductos(response.data);
    } catch (error) {
      setMensaje({ tipo: "danger", texto: mensajeError(error) });
    }
  };

  // Carga inicial de productos y categorías (el select se llena con las categorías existentes)
  useEffect(() => {
    let activo = true;
    api
      .get("/api/productos", authHeaders())
      .then((response) => activo && setProductos(response.data))
      .catch((error) => activo && setMensaje({ tipo: "danger", texto: mensajeError(error) }));
    api
      .get("/api/categorias", authHeaders())
      .then((response) => activo && setCategorias(response.data))
      .catch((error) => activo && setMensaje({ tipo: "danger", texto: mensajeError(error) }));
    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: "", texto: "" });
    try {
      const datos = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: form.precio,
        categoria_id: form.categoria_id,
      };
      if (form.id) {
        // Al editar no se envía el stock: se modifica desde el Kardex
        await api.put(`/api/productos/${form.id}`, datos, authHeaders());
        setMensaje({ tipo: "success", texto: "Producto actualizado correctamente." });
      } else {
        await api.post("/api/productos", { ...datos, stock: form.stock || 0 }, authHeaders());
        setMensaje({ tipo: "success", texto: "Producto guardado correctamente." });
      }
      setForm(formVacio);
      obtenerProductos();
    } catch (error) {
      setMensaje({ tipo: "danger", texto: mensajeError(error) });
    }
  };

  const handleEdit = (producto) => {
    setMensaje({ tipo: "", texto: "" });
    setForm({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      stock: producto.stock,
      categoria_id: producto.categoria_id,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      await api.delete(`/api/productos/${id}`, authHeaders());
      setMensaje({ tipo: "success", texto: "Producto eliminado." });
      obtenerProductos();
    } catch (error) {
      setMensaje({ tipo: "danger", texto: mensajeError(error) });
    }
  };

  const filtrados = productos.filter((p) =>
    `${p.nombre} ${p.descripcion || ""} ${p.categoria?.nombre || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );
  const valorTotal = productos.reduce((t, p) => t + Number(p.precio) * Number(p.stock), 0);
  const unidades = productos.reduce((t, p) => t + Number(p.stock), 0);
  const stockBajo = productos.filter((p) => Number(p.stock) <= 5).length;
  const sinCategorias = categorias.length === 0;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Gestión de Productos</h1>
          <p>Administra tu catálogo. El stock se ajusta desde el Kardex.</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="search">
            <i className="bi bi-search"></i>
            <input
              placeholder="Buscar producto o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo} py-2`}>{mensaje.texto}</div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="hero">
            <div className="hero-label">Valor total del inventario</div>
            <div className="hero-value">{soles(valorTotal)}</div>
            <span className="chip"><i className="bi bi-box"></i> {productos.length} {productos.length === 1 ? "producto" : "productos"}</span>
            <span className="chip"><i className="bi bi-stack"></i> {unidades} unidades</span>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="stat">
            <div className="stat-icon"><i className="bi bi-boxes"></i></div>
            <div className="stat-label">Unidades en stock</div>
            <div className="stat-value">{unidades}</div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="stat">
            <div className="stat-icon warn"><i className="bi bi-exclamation-triangle"></i></div>
            <div className="stat-label">Con stock bajo</div>
            <div className="stat-value">{stockBajo}</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-4">
          <form onSubmit={handleSubmit} className="panel">
            <div className="panel-head">
              <div>
                <h4 className="panel-title">{form.id ? "Editar producto" : "Nuevo producto"}</h4>
                <p className="panel-sub">{form.id ? `Editando #${form.id}` : "Completa los datos"}</p>
              </div>
            </div>

            {sinCategorias && (
              <div className="alert alert-warning py-2 small">
                Primero registra una categoría en la sección <strong>Categorías</strong>.
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                placeholder="Ej. Mouse inalámbrico"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <select
                name="categoria_id"
                className="form-control"
                value={form.categoria_id}
                onChange={handleChange}
                required
                disabled={sinCategorias}
              >
                <option value="">Selecciona una categoría...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <input
                type="text"
                name="descripcion"
                className="form-control"
                placeholder="Ej. Marca Logitech"
                value={form.descripcion || ""}
                onChange={handleChange}
              />
            </div>
            <div className="row">
              <div className="col-6 mb-3">
                <label className="form-label">Precio</label>
                <div className="input-prefix">
                  <span>S/</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="precio"
                    className="form-control"
                    placeholder="0.00"
                    value={form.precio}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-6 mb-3">
                <label className="form-label">Stock inicial</label>
                <input
                  type="number"
                  min="0"
                  name="stock"
                  className="form-control"
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange}
                  disabled={!!form.id}
                  title={form.id ? "El stock se modifica desde Kardex / Movimientos" : ""}
                />
              </div>
            </div>
            {form.id && (
              <p className="small text-muted mb-2">
                El stock actual es {form.stock}. Para cambiarlo registra un movimiento en Kardex.
              </p>
            )}
            <button type="submit" className="btn-main" disabled={sinCategorias}>
              <i className={`bi ${form.id ? "bi-check2-circle" : "bi-plus-lg"} me-2`}></i>
              {form.id ? "Actualizar" : "Guardar"}
            </button>
            {form.id && (
              <button type="button" className="btn-ghost" onClick={() => setForm(formVacio)}>
                Cancelar
              </button>
            )}
          </form>
        </div>

        <div className="col-xl-8">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h4 className="panel-title">Lista de productos</h4>
                <p className="panel-sub">{filtrados.length} {filtrados.length === 1 ? "resultado" : "resultados"}</p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((prod) => {
                    const estado = estadoStock(prod.stock);
                    return (
                      <tr key={prod.id}>
                        <td>
                          <div className="prod">
                            <div className="prod-avatar">{prod.nombre?.charAt(0).toUpperCase()}</div>
                            <div>
                              <div className="prod-name">{prod.nombre}</div>
                              <div className="prod-desc">#{prod.id} · {prod.descripcion || "Sin descripción"}</div>
                            </div>
                          </div>
                        </td>
                        <td>{prod.categoria?.nombre || "-"}</td>
                        <td className="fw-bold">{soles(prod.precio)}</td>
                        <td>{prod.stock}</td>
                        <td><span className={`pill ${estado.clase}`}>{estado.texto}</span></td>
                        <td className="text-end">
                          <button className="icon-btn me-2" title="Editar" onClick={() => handleEdit(prod)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          {esAdmin && (
                            <button className="icon-btn danger" title="Eliminar" onClick={() => handleDelete(prod.id)}>
                              <i className="bi bi-trash3"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty">
                        <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                        No hay productos para mostrar
                      </td>
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

export default CrudProductos;
