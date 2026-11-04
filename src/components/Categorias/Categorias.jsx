import { useState, useEffect } from "react";
import api, { authHeaders, mensajeError, obtenerUsuario } from "../../services/api";

const formVacio = { id: null, nombre: "", descripcion: "" };

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const esAdmin = obtenerUsuario()?.rol === "Administrador";

  const cargar = async () => {
    try {
      const response = await api.get("/api/categorias", authHeaders());
      setCategorias(response.data);
    } catch (error) {
      setMensaje({ tipo: "danger", texto: mensajeError(error) });
    }
  };

  useEffect(() => {
    let activo = true;
    api
      .get("/api/categorias", authHeaders())
      .then((response) => activo && setCategorias(response.data))
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
      const datos = { nombre: form.nombre, descripcion: form.descripcion };
      if (form.id) {
        await api.put(`/api/categorias/${form.id}`, datos, authHeaders());
        setMensaje({ tipo: "success", texto: "Categoría actualizada." });
      } else {
        await api.post("/api/categorias", datos, authHeaders());
        setMensaje({ tipo: "success", texto: "Categoría creada." });
      }
      setForm(formVacio);
      cargar();
    } catch (error) {
      setMensaje({ tipo: "danger", texto: mensajeError(error) });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      await api.delete(`/api/categorias/${id}`, authHeaders());
      setMensaje({ tipo: "success", texto: "Categoría eliminada." });
      cargar();
    } catch (error) {
      setMensaje({ tipo: "danger", texto: mensajeError(error) });
    }
  };

  const filtradas = categorias.filter((c) =>
    `${c.nombre} ${c.descripcion || ""}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Categorías</h1>
          <p>Clasifica el catálogo de productos</p>
        </div>
        <div className="search">
          <i className="bi bi-search"></i>
          <input
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {mensaje.texto && <div className={`alert alert-${mensaje.tipo} py-2`}>{mensaje.texto}</div>}

      <div className="row g-4">
        <div className="col-xl-4">
          <form onSubmit={handleSubmit} className="panel">
            <h4 className="panel-title mb-1">{form.id ? "Editar categoría" : "Nueva categoría"}</h4>
            <p className="panel-sub mb-3">{form.id ? `Editando #${form.id}` : "Completa los datos"}</p>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                placeholder="Ej. Periféricos"
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
                value={form.descripcion || ""}
                onChange={handleChange}
              />
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
            <h4 className="panel-title mb-3">Lista de categorías</h4>
            <div className="table-responsive">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Productos</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="prod-name">{c.nombre}</div>
                        <div className="prod-desc">#{c.id}</div>
                      </td>
                      <td>{c.descripcion || "-"}</td>
                      <td><span className="chip-soft">{c.total_productos}</span></td>
                      <td className="text-end">
                        <button
                          className="icon-btn me-2"
                          title="Editar"
                          onClick={() => setForm({ id: c.id, nombre: c.nombre, descripcion: c.descripcion || "" })}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {esAdmin && (
                          <button className="icon-btn danger" title="Eliminar" onClick={() => handleDelete(c.id)}>
                            <i className="bi bi-trash3"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtradas.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty">No hay categorías para mostrar</td>
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

export default Categorias;
