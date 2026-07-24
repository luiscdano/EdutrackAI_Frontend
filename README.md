# EduTrack AI Frontend

Interfaz web de EduTrack AI desarrollada con React, TypeScript, Tailwind CSS y Vite, conectada al backend de `JRJ24/EdutrackAI_Backend`.

## Requisitos

- Node.js 20 o superior.
- Backend ejecutándose en el puerto configurado.
- Base de datos y migraciones del backend aplicadas.

## Configuración

Crea o revisa el archivo `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Comandos

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Rutas principales

| Ruta | Módulo | Acceso |
|---|---|---|
| `/` | Dashboard académico | Autenticado |
| `/subjects` | Materias | Autenticado |
| `/progress` | Progreso y calificaciones | Autenticado |
| `/study-sessions` | Hábitos y sesiones | Autenticado |
| `/resources` | Biblioteca de recursos | Autenticado |
| `/recommendations` | Sugerencias de estudio | Autenticado |
| `/notifications` | Centro de notificaciones | Autenticado |
| `/academic-setup` | Configuración académica | Autenticado |
| `/profile` | Cuenta y contraseña | Autenticado |
| `/admin` | Dashboard administrativo | Rol admin |
| `/admin/academic-management` | Materias y resultados | Rol admin |

## Arquitectura

- `components/ui`: componentes visuales reutilizables.
- `components/content`: estructura compartida de pantallas conectadas a la API.
- `pages`: módulos completos de estudiante y administración.
- `services`: autenticación y comunicación con endpoints.
- `types`: contratos TypeScript compartidos.
- `hooks`: carga y estado reutilizable del dashboard.

## Manejo de sesión

Las peticiones protegidas adjuntan el token almacenado. Una respuesta `401` invalida la sesión local. Los módulos muestran estados de carga, error, vacío y reintento.

## Limitaciones conocidas

- La aplicación mantiene navegación por `window.location` hasta completar el issue de React Router.
- La edición general de la cuenta permanece bloqueada hasta que el backend ofrezca un endpoint seguro para actualizar el perfil propio.
- GitHub Actions todavía no ejecuta build, lint o pruebas automáticamente.

Consulta `docs/FRONTEND_DELIVERY.md` para el estado de entrega y la matriz de módulos.
