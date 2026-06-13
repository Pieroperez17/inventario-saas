# 📦 Sistema de Gestión de Inventario SaaS

Sistema **SaaS multiempresa (multitenant)** de gestión de inventario, con arquitectura
**MVC** en el backend, frontend en **React** con **modo oscuro**, y todo el código en
**español**. Pensado para ser serio, modular y desplegable con un solo comando.

> **Estado:** ✅ Proyecto completo (Fases 1 a 6).

---

## ✨ Funcionalidades

- **Multiempresa:** cualquiera puede registrar su empresa; se crea automáticamente su usuario Administrador. Aislamiento total por `empresaId`.
- **Autenticación JWT** (access + refresh con rotación), contraseñas con bcrypt, cambio y restablecimiento de contraseña.
- **Roles y permisos:** Administrador, Editor y Visualizador, con autorización por rol en cada endpoint y en la interfaz.
- **Dashboard** con tarjetas de resumen, gráficos (existencias por ubicación, top de productos) y movimientos recientes.
- **CRUD completo** de almacenes, tiendas, categorías, productos y proveedores, con búsqueda, filtros, ordenamiento y **paginación del lado del servidor**.
- **Inventario** por ubicación y consolidado, con **alertas de stock mínimo**.
- **Movimientos** de inventario: entradas, salidas y **transferencias** entre ubicaciones (transaccionales, validan stock).
- **Reportes:** inventario valorizado y **kardex** por producto.
- **Exportación a Excel** (con estilo, moneda en soles y fecha) en productos, inventario, movimientos, usuarios y reportes.
- **Notificaciones** del sistema (stock mínimo, transferencias, nuevos usuarios) con badge de no leídas.
- **Mensajería interna** entre usuarios de la empresa.
- **Auditoría:** bitácora de acciones (solo Administrador).
- **Modo oscuro** por defecto (con toggle), responsivo, con toasts, modales y estados de carga.

---

## 🧱 Stack tecnológico

| Capa          | Tecnología                                                       |
|---------------|------------------------------------------------------------------|
| Backend       | Node.js + Express + TypeScript (MVC estricto)                    |
| ORM           | Prisma sobre PostgreSQL                                          |
| Autenticación | JWT (access + refresh) · bcrypt · Zod                           |
| Exportación   | ExcelJS                                                          |
| Frontend      | React + TypeScript + Vite + Tailwind CSS (modo oscuro)          |
| Estado/datos  | Zustand + TanStack Query + Axios + React Hook Form + Zod        |
| Gráficos      | Recharts                                                        |
| Contenedores  | Docker + docker-compose (db · api · web)                        |

---

## 📁 Estructura del proyecto

```
inventario-saas/
├── backend/                     # API REST — arquitectura MVC
│   ├── prisma/
│   │   ├── schema.prisma          # Modelo de datos (17 tablas)
│   │   ├── seed.ts                # Datos demo
│   │   └── migrations/            # Migraciones SQL versionadas
│   ├── src/
│   │   ├── config/                # entorno, conexión BD, constantes
│   │   ├── modelos/               # (acceso a datos vía Prisma)
│   │   ├── servicios/             # Lógica de negocio
│   │   ├── controladores/         # Orquestan petición/respuesta
│   │   ├── rutas/                 # Endpoints + middlewares por recurso
│   │   ├── vistas/                # Respuestas JSON estructuradas
│   │   ├── middlewares/           # Auth, roles, errores, multitenancy
│   │   ├── validadores/           # Esquemas Zod
│   │   ├── utilidades/            # Fechas Lima, paginación, Excel, JWT…
│   │   ├── app.ts                 # App Express
│   │   └── servidor.ts            # Punto de entrada
│   └── Dockerfile
├── frontend/                    # SPA React + Vite + Tailwind
│   ├── src/
│   │   ├── api/                   # Cliente Axios + servicios
│   │   ├── store/                 # Zustand (auth, tema)
│   │   ├── componentes/           # Layout, tabla, modal, campos, CRUD…
│   │   ├── paginas/               # Dashboard, productos, inventario…
│   │   ├── hooks/ · tipos/ · utilidades/
│   │   └── App.tsx · main.tsx
│   ├── Dockerfile · nginx.conf
├── docker-compose.yml           # db (PostgreSQL) + api + web
└── README.md
```

**Regla MVC:** el _controlador_ nunca accede directo a la base de datos → usa _servicios_,
que usan los _modelos_ (Prisma). Cada recurso tiene su trío **ruta → controlador → servicio**.

---

## ✅ Requisitos

- **Opción A (recomendada):** [Docker Desktop](https://www.docker.com/products/docker-desktop/) con `docker compose`.
- **Opción B (local):** Node.js ≥ 20 y un PostgreSQL accesible.

---

## 🚀 Puesta en marcha

### Opción A — Con Docker (todo con un comando)

```bash
docker compose up --build
```

Levanta tres servicios:

| Servicio | Descripción                              | URL                              |
|----------|------------------------------------------|----------------------------------|
| `db`     | PostgreSQL 16                            | localhost:5432                   |
| `api`    | Backend (migra y siembra al arrancar)    | http://localhost:4000/api/v1     |
| `web`    | Frontend (Nginx, proxy `/api` → api)     | **http://localhost:5173**        |

Abre **http://localhost:5173** e inicia sesión con una cuenta demo.

> El backend aplica migraciones y ejecuta el seed automáticamente
> (`SEMBRAR_AL_INICIAR=true`). La primera construcción descarga dependencias (requiere red).

### Opción B — Local (sin Docker)

**Backend:**

```bash
cd backend
cp .env.example .env          # ajusta DATABASE_URL a tu PostgreSQL
npm install
npm run prisma:migrate         # crea/aplica migraciones
npm run seed                   # datos demo
npm run dev                    # API en http://localhost:4000
```

**Frontend (otra terminal):**

```bash
cd frontend
npm install
npm run dev                    # SPA en http://localhost:5173
```

El frontend en desarrollo apunta a `http://localhost:4000/api/v1` (`frontend/.env`).

---

## 🔑 Credenciales demo

Empresa: **Comercial Demo S.A.C.** (RUC 20123456789)

| Rol           | Email             | Contraseña   |
|---------------|-------------------|--------------|
| Administrador | `admin@demo.com`  | `Admin123!`  |
| Editor        | `editor@demo.com` | `Editor123!` |
| Visualizador  | `visor@demo.com`  | `Visor123!`  |

---

## 👥 Roles y permisos

| Rol           | Permisos |
|---------------|----------|
| Administrador | Acceso total: empresa, usuarios, roles, almacenes, tiendas, inventario, configuración, auditoría y exportaciones. |
| Editor        | Ver y editar inventario, productos, categorías, movimientos y proveedores; exportar; **no** gestiona usuarios ni empresa. |
| Visualizador  | Solo lectura: ve inventario y reportes y puede exportar; no edita nada. |

La autorización se aplica por **middleware** (`verificarRol`) en cada endpoint y la interfaz
oculta o deshabilita las acciones según el rol.

---

## 🌐 API (resumen, prefijo `/api/v1`)

| Recurso        | Endpoints                                                            |
|----------------|---------------------------------------------------------------------|
| Auth           | `POST /auth/registro` · `/auth/login` · `/auth/refrescar` · `/auth/logout` · `GET /auth/yo` · `POST /auth/cambiar-contrasena` |
| Empresa        | `GET /empresa` · `PUT /empresa`                                     |
| Usuarios       | `GET/POST /usuarios` · `GET/PUT /usuarios/:id` · `PATCH /usuarios/:id/estado` · `POST /usuarios/:id/restablecer-contrasena` |
| Almacenes/Tiendas/Categorías/Productos/Proveedores | CRUD REST estándar |
| Inventario     | `GET /inventario` · `/inventario/consolidado` · `/inventario/alertas` |
| Movimientos    | `GET /movimientos` · `POST /movimientos`                           |
| Reportes       | `GET /reportes/valorizado` · `/reportes/kardex/:productoId` · `/reportes/movimientos` |
| Exportar       | `GET /exportar/{productos,inventario,movimientos,usuarios,valorizado,kardex/:id}` |
| Notificaciones | `GET /notificaciones` · `/notificaciones/no-leidas` · `PATCH /:id/leer` · `POST /leer-todas` |
| Mensajes       | `GET /mensajes` · `/mensajes/enviados` · `/mensajes/contactos` · `POST /mensajes` · `GET /mensajes/:id` |
| Auditoría      | `GET /auditoria` (solo Administrador)                              |
| Dashboard      | `GET /dashboard`                                                   |
| Salud          | `GET /salud` · `/salud/bd`                                         |

Todas las respuestas usan el envoltorio `{ exito, datos, meta? }` o `{ exito:false, error }`.

---

## 🛠️ Comandos

**Backend** (`/backend`):

| Comando                  | Descripción                              |
|--------------------------|------------------------------------------|
| `npm run dev`            | API en desarrollo (recarga en caliente)  |
| `npm run build`          | Genera cliente Prisma y compila          |
| `npm start`              | API compilada (producción)               |
| `npm run prisma:migrate` | Crea/aplica migraciones                  |
| `npm run seed`           | Siembra datos demo                       |
| `npm run prisma:studio`  | Explorador visual de la BD               |

**Frontend** (`/frontend`):

| Comando            | Descripción                    |
|--------------------|--------------------------------|
| `npm run dev`      | SPA en desarrollo (Vite)       |
| `npm run build`    | Type-check + build de producción |
| `npm run preview`  | Previsualiza el build          |

---

## 🔐 Variables de entorno (backend)

Ver `backend/.env.example`. Claves principales: `DATABASE_URL`, `JWT_ACCESO_SECRETO`,
`JWT_REFRESH_SECRETO`, `CORS_ORIGEN`, `ZONA_HORARIA` (por defecto `America/Lima`),
`PORT`, `SEMBRAR_AL_INICIAR`.

> ⚠️ Nunca subas `.env` ni secretos reales al repositorio. En producción cambia los secretos JWT.

---

## 🗺️ Fases (todas completadas)

- [x] **Fase 1 — Cimientos:** estructura MVC, PostgreSQL, Docker, modelo de datos, migraciones y seed.
- [x] **Fase 2 — Auth y multitenancy:** registro, login, refresh, roles y aislamiento por empresa.
- [x] **Fase 3 — Núcleo de inventario:** almacenes, tiendas, categorías, productos, stock y movimientos.
- [x] **Fase 4 — Frontend:** layout modo oscuro, dashboard y CRUDs conectados a la API.
- [x] **Fase 5 — SaaS extra:** Excel, reportes, auditoría, notificaciones y mensajería.
- [x] **Fase 6 — Pulido:** validaciones, manejo de errores, responsive, Docker y documentación.

---

## 📝 Notas de implementación

- **Zona horaria** America/Lima (UTC-5) en todo el manejo de fechas (dayjs).
- Seguridad: Helmet, CORS, **rate limiting**, validación con Zod, hashing de contraseñas y JWT.
- La ubicación del inventario es **polimórfica** (`ALMACEN`/`TIENDA`); su integridad se valida en la capa de servicios.
- Las **notificaciones en tiempo real con WebSockets** quedan como mejora futura; la interfaz consulta el badge de no leídas por sondeo (cada 30 s).
- Herramienta de ejecución TypeScript: `ts-node` (sin binarios nativos).
