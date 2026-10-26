# appInventario

Laboratorio #8 – Desarrollo de Frontend con React y consumo de API REST
Fullstack Developer Software – Seminario IA 501 · SENATI
Estudiante: Dorian David Giron Prato · Instructor: Giancarlos Barboza N.

## Descripción

Interfaz en React para gestionar productos (CRUD completo: crear, listar, editar y eliminar). Consume la API REST de `miApi` (Node.js + Express + Sequelize + MySQL).

Incluye buscador por nombre o descripción, tarjetas de resumen (valor del inventario, unidades y productos con stock bajo) y estado del stock por producto (Disponible, Stock bajo o Agotado).

## Tecnologías

- React + Vite
- Axios
- Bootstrap y Bootstrap Icons
- Backend: Node.js, Express, Sequelize, MySQL

## Requisitos

- Node.js 18 o superior
- Backend `miApi` ejecutándose en el puerto 3006
- Base de datos MySQL activa (`APIDB`, tabla `productos`)

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abrir http://localhost:5173

El backend debe estar corriendo en otra terminal:

```bash
cd ../miApi
npm run dev
```

Debe mostrar: `Base de datos conectada y sincronizada.` y `Servidor corriendo en http://localhost:3006`.

## Estructura

```
appInventario/
├── src/
│   ├── components/Productos/crudProductos.jsx   # Componente CRUD
│   ├── services/api.js                          # Cliente Axios (baseURL: http://localhost:3006)
│   ├── App.jsx                                  # Layout: sidebar + contenido
│   ├── main.jsx                                 # Punto de entrada (Bootstrap)
│   └── index.css                                # Estilos
└── package.json
```

## Endpoints consumidos

| Método | Ruta              | Acción               |
|--------|-------------------|----------------------|
| GET    | `/productos`      | Listar productos     |
| POST   | `/productos`      | Crear producto       |
| PUT    | `/productos/:id`  | Actualizar producto  |
| DELETE | `/productos/:id`  | Eliminar producto    |

Ejemplo de cuerpo para POST (Postman, `http://localhost:3006/productos`):

```json
{
  "nombre": "Teclado Ergonómico",
  "descripcion": "Teclado RGB con switches azules",
  "precio": 150.00,
  "stock": 15
}
```

## Cómo funciona

- `api.js` centraliza la conexión al backend con Axios.
- `crudProductos.jsx` maneja el estado de la lista y del formulario. Si el formulario tiene `id` hace `PUT`; si no, `POST`.
- Después de cada operación se vuelve a consultar la lista con `GET`.
- Valor del inventario = suma de (precio × stock) de cada producto.
- Stock bajo = productos con 5 unidades o menos.

## Pruebas realizadas

- Navegador: crear, editar y eliminar productos desde la interfaz.
- Postman: `POST /productos` con respuesta `200 OK`.
- HeidiSQL: `SELECT * FROM productos;` muestra los datos guardados desde el navegador y desde Postman.
