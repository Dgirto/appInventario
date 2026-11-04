import { useState, useEffect } from "react";
import api, { authHeaders, mensajeError, obtenerUsuario } from "../../services/api";

const formVacio = { id: null, razon_social: "", contacto: "", telefono: "", email: "" };

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const esAdmin = obtenerUsuario()?.rol === "Administrador";

  const cargar = async () => {
    try {
      const response = await api.get("/api/proveedores", authHeaders());
      setProveedores(response.data);
    } catch (error) {
      setMensaje({ tipo: "danger", texto: mensajeError(error) });
    }
  };

  useEffect(() => {
    let activo = true;
    api
      .get("/api/proveedores", authHeaders())
      .then((response) => activo && setProveedores(response.data))
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
      const { id, ...datos } = form;
      if (id) {
        await api.put(`/api/proveedores/${id}`, datos, authHeaders());
        setMensaje({ tipo: "success", texto: "Proveedor actualizado." });
      } else {
        await api.post("/api/proveedores", datos, authHeaders());
        setMensaje({ tipo: "success", texto: "Proveedor creado." });
      }
      setForm(formVacio);
      cargar();
    } catch (error) {
      setMensaje({ tipo: "danger", texto: mensajeError(error) });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este proveedor?")) return;
    try {
      await api.delete(`/api/proveedores/${id}`, authHeaders());
      setMensaje({ tipo: "success", texto: "Proveedor eliminado." });
      cargar();
    } catch (error) {
      setMensaje({ tipo: "danger", texto: mensajeError(error) });
    }
  };

  const filtrados = proveedores.filter((p) =>
    `${p.razon_social} ${p.contacto || ""} ${p.email || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const campos = [
    { name: "razon_social", label: "Razón social", required: true },
    { name: "contacto", label: "Contacto" },
    { name: "telefono", label: "Teléfono" },
    { name: "email", label: "Email", type: "email" },
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Proveedores</h1>
          <p>Empresas o personas que suministran tus artículos</p>
        </div>
        <div className="search">
          <i className="bi bi-search"></i>
          <input
            placeholder="Buscar por razón social o contacto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {mensaje.texto && <div className={`alert alert-${mensaje.tipo} py-2`}>{mensaje.texto}</div>}

      <div className="row g-4">
        <div className="col-xl-4">
          <form onSubmit={handleSubmit} className="panel">
            <h4 className="panel-title mb-1">{form.id ? "Editar proveedor" : "Nuevo proveedor"}</h4>
            <p className="panel-sub mb-3">{form.id ? `Editando #${form.id}` : "Completa los datos"}</p>
            {campos.map((c) => (
              <div className="mb-3" key={c.name}>
                <label className="form-label">{c.label}</label>
                <input
                  type={c.type || "text"}
                  name={c.name}
                  className="form-control"
                  value={form[c.name] || ""}
                  onChange={handleChange}
                  required={c.required}
                />
              </div>
            ))}
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
            <h4 className="panel-title mb-3">Lista de proveedores</h4>
            <div className="table-responsive">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Razón social</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="prod-name">{p.razon_social}</div>
                        <div className="prod-desc">#{p.id}</div>
                      </td>
                      <td>{p.contacto || "-"}</td>
                      <td>{p.telefono || "-"}</td>
                      <td>{p.email || "-"}</td>
                      <td className="text-end">
                        <button
                          className="icon-btn me-2"
                          title="Editar"
                          onClick={() => setForm({
                            id: p.id,
                            razon_social: p.razon_social,
                            contacto: p.contacto || "",
                            telefono: p.telefono || "",
                            email: p.email || "",
                          })}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {esAdmin && (
                          <button className="icon-btn danger" title="Eliminar" onClick={() => handleDelete(p.id)}>
                            <i className="bi bi-trash3"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty">No hay proveedores para mostrar</td>
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

export default Proveedores;
