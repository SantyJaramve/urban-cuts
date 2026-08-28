# 💈 Barbería Urbana Medellín — Sistema de Gestión de Citas

Plataforma web completa para la gestión de citas de una barbería. Permite a los **clientes** reservar citas en línea, a los **barberos** administrar su agenda diaria, y al **administrador** gestionar servicios, barberos, horarios y métricas del negocio.

> Proyecto académico de Desarrollo Web. Desplegado en la nube (Supabase + Render).

---

## ✨ Funcionalidades

### Cliente
- Registro e inicio de sesión
- Explorar catálogo de servicios y barberos
- Reservar cita seleccionando servicio, barbero, fecha y hora
- Validación de disponibilidad en tiempo real (horarios y capacidad diaria)
- Consultar y cancelar sus citas (con código de reserva único)

### Barbero
- Ver citas próximas confirmadas y pendientes
- Agenda diaria por fecha
- Historial de citas completadas/canceladas
- Cambiar estado de las citas (confirmar, completar, cancelar)

### Administrador
- Dashboard con métricas (total de citas, barberos, servicios, servicios más demandados)
- CRUD completo de servicios
- CRUD completo de barberos (con capacidad diaria)
- Configuración de horarios por barbero
- Tabla general de todas las citas
- Barras de búsqueda en barberos y citas

---

## 🧱 Tecnologías

### Frontend
- **React 18** con **Vite**
- **React Router** (navegación)
- **Axios** (consumo de API)
- **Tailwind CSS** (estilos — tema oscuro con acentos rojo escarlata)
- **React Icons** (iconografía)
- **React Hot Toast** (notificaciones)

### Backend
- **Node.js** + **Express**
- **JSON Web Token** (autenticación por roles)
- **Bcryptjs** (hash de contraseñas)
- **express-validator** (validación)
- **pg** (cliente PostgreSQL)
- Arquitectura por capas: routes → controllers → services

### Base de datos
- **PostgreSQL** con esquema `barberia` (roles, usuarios, barberos, servicios, horarios, citas)
- Índices, triggers de timestamps y restricciones de integridad

---

## 📁 Estructura del proyecto

```
├── backend/                  # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/           # Conexión a base de datos
│   │   ├── controllers/      # Lógica de manejo de peticiones HTTP
│   │   ├── middlewares/      # Auth, validación, manejo de errores
│   │   ├── routes/           # Definición de endpoints
│   │   ├── services/         # Lógica de negocio (acceso a datos)
│   │   └── utils/            # Helpers (códigos, fechas, respuestas)
│   ├── .env.example          # Plantilla de variables de entorno
│   └── package.json
│
├── frontend/                 # Aplicación React (Vite)
│   ├── src/
│   │   ├── components/       # Navbar, Footer, Modal, etc.
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── pages/            # Home, Login, Booking, dashboards...
│   │   └── services/         # Cliente Axios (api.js)
│   ├── vite.config.js        # Proxy /api → backend local
│   └── package.json
│
├── db-schema.sql             # Creación de la base de datos (esquema + datos)
├── crear-base-datos.js       # Script Node para crear la BD automáticamente
└── render.yaml               # Configuración de despliegue en Render
```

---

## 🚀 Instalación y ejecución local

### Requisitos previos
- **Node.js** 18 o superior
- **PostgreSQL** corriendo localmente (por defecto puerto 5433)

### 1. Clonar el repositorio

```bash
git clone https://github.com/SantyJaramve/urban-cuts.git
cd urban-cuts
```

### 2. Crear la base de datos

Ejecuta el script de la raíz (crea el esquema, las tablas y los datos de prueba):

```bash
node crear-base-datos.js
```

> Crea la base `barberia` con conexión local por defecto (`127.0.0.1:5433`, usuario `postgres`, password `1234`). Para conectarse a otra base, configura las variables de entorno `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL` (ver `crear-base-datos.js`).

O ejecuta el SQL directamente:

```bash
psql -U postgres -d postgres -f db-schema.sql
```

### 3. Configurar y ejecutar el backend

```bash
cd backend
cp .env.example .env      # y rellena los datos de tu conexión
npm install
npm run dev               # o: npm start
```

El backend corre en `http://localhost:4000` y expone una API REST bajo `/api/v1`.

Verifica que funcione: `http://localhost:4000/api/v1/health`

### 4. Configurar y ejecutar el frontend

```bash
cd frontend
npm install
npm run dev               # Vite con proxy a /api/v1
```

Abre **http://localhost:3000** en el navegador.

> En desarrollo, el frontend usa el proxy de Vite (`/api/v1` → `http://localhost:4000`), así que no hace falta configurar la URL de la API. En producción se configura la variable `VITE_API_URL`.

---

## 🔐 Variables de entorno

### Backend (`backend/.env`)
| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (4000 local) |
| `DB_HOST` | Host de PostgreSQL (local o Supabase pooler) |
| `DB_PORT` | Puerto de la base (5433 local, 5432 Supabase) |
| `DB_NAME` | Nombre de la base (`barberia` o `postgres`) |
| `DB_USER` | Usuario de la base |
| `DB_PASSWORD` | Contraseña de la base |
| `DB_SCHEMA` | Esquema (`barberia`) |
| `DB_SSL` | `true` si la conexión usa SSL (Supabase) |
| `JWT_SECRET` | Clave secreta para firmar tokens |
| `JWT_EXPIRES_IN` | Vigencia del token (`24h`) |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma |

### Frontend (`frontend/.env`)
| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL del backend en producción (ej. `https://...onrender.com/api/v1`) |

---

## 🔑 Credenciales de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | `admin@urbancuts.com` | `admin123` |
| Barbero | `carlos@urbancuts.com` | `barbero123` |
| Barbero | `andres@urbancuts.com` | `barbero123` |
| Cliente | `juan@email.com` | `cliente123` |

---

## ☁️ Despliegue en la nube

El proyecto está desplegado en producción:

- **Frontend (React):** https://urban-cuts-frontend.onrender.com
- **Backend (API):** https://urban-cuts-backend.onrender.com
- **Base de datos:** Supabase (PostgreSQL)

### Backend en Render (Web Service)
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Salud: `/api/v1/health`
- Usa el **Session Pooler de Supabase** para la conexión (necesario porque el host directo da `ENETUNREACH` desde Render free).

### Frontend en Render (Static Site)
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Variable `VITE_API_URL` apunta al backend desplegado.

El archivo `render.yaml` documenta la configuración de los servicios.

---

## 🧪 Pruebas

No se usa framework de testing automatizado. La API se prueba manualmente (por ejemplo con PowerShell `Invoke-WebRequest` o Postman) contra los endpoints bajo `/api/v1`.

---

## 📝 Notas
- El diseño usa un tema **oscuro** con acentos **rojo escarlata** y tipografía serif, sin bordes redondeados.
- `capacidad_diaria` limita el máximo de citas por barbero por día; además hay validación anti-solapamiento de horarios.
