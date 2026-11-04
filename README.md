# appInventario

Fullstack Developer Software – Seminario IA 501 · SENATI
Estudiante: Dorian David Giron Prato · Instructor: Giancarlos Barboza N.

Panel administrativo de inventario en React (Guías Prácticas #8 a #11). Consume la API REST de `miApi`.

## Funcionalidades

- **Login** con JWT. El token se guarda en `localStorage` y se envía en cada petición.
- **Rutas protegidas**: sin sesión no se puede entrar a ninguna vista (redirige al login). Si el token expira, se cierra sesión automáticamente.
- **Navegación** con React Router: Inicio (Dashboard), Productos, Categorías, Proveedores y Kardex / Movimientos.
- **Dashboard**: tarjetas KPI (productos, categorías, proveedores, bajo stock), movimientos recientes y productos por categoría.
- **Productos**: CRUD. La categoría se elige de un `<select>` alimentado por el endpoint de categorías; no se puede guardar sin categoría. El stock se modifica desde el Kardex.
- **Categorías** y **Proveedores**: CRUD completo.
- **Kardex**: registrar Entradas, Salidas y Ajustes. Cada movimiento actualiza el stock en el backend.
- Eliminar elementos está reservado al rol `Administrador`.

## Tecnologías

- React 19 + Vite
- React Router (`react-router-dom`)
- Axios
- Bootstrap y Bootstrap Icons

## Requisitos

- Node.js 18 o superior
- Backend `miApi` en ejecución en el puerto 3006 (ver su README)
- MySQL activo

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abrir http://localhost:5173

En otra terminal, dentro de `miApi`:

```bash
npm run dev
```

> Si Vite usa otro puerto (por ejemplo 5174), actualiza `CORS_ORIGIN` en el `.env` de `miApi`.

## Primer uso

1. Inicia el backend. El primer usuario que registres con `POST /api/auth/register` queda como `Administrador`.
2. Inicia sesión en http://localhost:5173.
3. Crea al menos una **Categoría**.
4. Crea **Productos** asignándoles esa categoría.
5. Registra **Movimientos** en el Kardex.

## Estructura

```
appInventario/
├── src/
│   ├── components/
│   │   ├── Login/Login.jsx                      # Formulario de inicio de sesión (Guía #11)
│   │   ├── ProtectedRoute/ProtectedRoute.jsx    # Guardián de rutas (Guía #11)
│   │   ├── Layout/Layout.jsx                    # Menú lateral y cierre de sesión
│   │   ├── Dashboard/Dashboard.jsx              # Inicio con indicadores KPI
│   │   ├── Productos/crudProductos.jsx          # CRUD de productos (Guía #8)
│   │   ├── Categorias/Categorias.jsx            # CRUD de categorías
│   │   ├── Proveedores/Proveedores.jsx          # CRUD de proveedores
│   │   └── Kardex/Kardex.jsx                    # Movimientos de inventario
│   ├── services/api.js                          # Axios, cabeceras con token y manejo de 401
│   ├── utils/formato.js                         # Formato de moneda, fechas y estado de stock
│   ├── App.jsx                                  # Rutas públicas y privadas
│   ├── main.jsx                                 # Punto de entrada (Bootstrap)
│   └── index.css                                # Estilos
└── package.json
```

## Endpoints consumidos

Todos requieren `Authorization: Bearer <token>`, salvo el login.

| Método | Ruta                    | Uso                                |
|--------|-------------------------|------------------------------------|
| POST   | `/api/auth/login`       | Iniciar sesión                     |
| GET    | `/api/dashboard`        | Indicadores de Inicio              |
| GET    | `/api/productos`        | Listar productos                   |
| POST   | `/api/productos`        | Crear producto                     |
| PUT    | `/api/productos/:id`    | Actualizar producto                |
| DELETE | `/api/productos/:id`    | Eliminar producto (Administrador)  |
| GET    | `/api/categorias`       | Listar categorías                  |
| POST   | `/api/categorias`       | Crear categoría                    |
| PUT    | `/api/categorias/:id`   | Actualizar categoría               |
| DELETE | `/api/categorias/:id`   | Eliminar categoría (Administrador) |
| GET    | `/api/proveedores`      | Listar proveedores                 |
| POST   | `/api/proveedores`      | Crear proveedor                    |
| PUT    | `/api/proveedores/:id`  | Actualizar proveedor               |
| DELETE | `/api/proveedores/:id`  | Eliminar proveedor (Administrador) |
| GET    | `/api/movimientos`      | Kardex                             |
| POST   | `/api/movimientos`      | Registrar movimiento               |

## Cómo funciona

- `services/api.js` centraliza Axios. `authHeaders()` agrega `Authorization: Bearer <token>` a cada petición. Si el backend responde `401`, se borra la sesión y se vuelve al login.
- `ProtectedRoute` revisa si existe el token antes de mostrar una vista privada.
- `crudProductos.jsx` usa `POST` si el formulario no tiene `id` y `PUT` si lo tiene. Tras cada operación vuelve a consultar la lista.
- Valor del inventario = suma de (precio × stock). Stock bajo = 5 unidades o menos.
