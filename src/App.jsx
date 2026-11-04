import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login/Login'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import CrudProductos from './components/Productos/crudProductos'
import Categorias from './components/Categorias/Categorias'
import Proveedores from './components/Proveedores/Proveedores'
import Kardex from './components/Kardex/Kardex'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Rutas privadas: solo usuarios logueados, con menú lateral común */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/productos" element={<CrudProductos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/kardex" element={<Kardex />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
