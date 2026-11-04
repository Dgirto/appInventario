import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { mensajeError } from '../../services/api';

const Login = () => {
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      // Petición al backend para iniciar sesión
      const response = await api.post('/api/auth/login', credenciales);

      // 1. Guardar el token y los datos del usuario en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

      // 2. Redirigir al panel administrativo
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Credenciales inválidas. Intente nuevamente.'
          : mensajeError(err)
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="text-center mb-4 text-white">
          <span className="brand-mark mx-auto mb-3" style={{ width: 44, height: 44, fontSize: '1.25rem' }}>
            <i className="bi bi-box-seam"></i>
          </span>
          <h3 className="fw-bold mb-1">Iniciar sesión</h3>
          <p className="small mb-0 opacity-75">Sistema de Inventario SENATI</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="panel">
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={credenciales.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={credenciales.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-main" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
