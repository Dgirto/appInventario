import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // Si no hay token, lo mandamos de regreso al login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si hay token, renderizamos el contenido protegido
  return children;
};

export default ProtectedRoute;
