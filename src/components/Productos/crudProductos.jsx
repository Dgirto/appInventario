import { useState, useEffect } from "react";
import api from "../../services/api";

const formVacio = { id: null, nombre: "", descripcion: "", precio: "", stock: "" };

const soles = (n) =>
  `S/ ${Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const estadoStock = (stock) => {
  const s = Number(stock);
  if (s === 0) return { clase: "out", texto: "Agotado" };
  if (s <= 5) return { clase: "low", texto: "Stock bajo" };
  return { clase: "ok", texto: "Disponible" };
};

const CrudProductos = () => {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    const response = await api.get("/productos");
    setProductos(response.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.id) {
      await api.put(`/productos/${form.id}`, form);
    } else {
      await api.post("/productos", form);
    }
    setForm(formVacio);
    obtenerProductos();
  };

  const handleEdit = (producto) => {
    setForm(producto);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      await api.delete(`/productos/${id}`);
      obtenerProductos();
    }
  };

  const filtrados = productos.filter((p) =>
    `${p.nombre} ${p.descripcion || ""}`.toLowerCase().includes(busqueda.toLowerCase())
  );
  const valorTotal = productos.reduce((t, p) => t + Number(p.precio) * Number(p.stock), 0);
  const unidades = productos.reduce((t, p) => t + Number(p.stock), 0);
  const stockBajo = productos.filter((p) => Number(p.stock) <= 5).length;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Gestión de Productos</h1>
          <p>Administra tu inventario en tiempo real</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="search">
            <i className="bi bi-search"></i>
            <input
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

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
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  name="stock"
                  className="form-control"
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-main">
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
                        <td className="fw-bold">{soles(prod.precio)}</td>
                        <td>{prod.stock}</td>
                        <td><span className={`pill ${estado.clase}`}>{estado.texto}</span></td>
                        <td className="text-end">
                          <button className="icon-btn me-2" title="Editar" onClick={() => handleEdit(prod)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="icon-btn danger" title="Eliminar" onClick={() => handleDelete(prod.id)}>
                            <i className="bi bi-trash3"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty">
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
