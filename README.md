# EduTrack AI Frontend

Interfaz web de EduTrack AI desarrollada con React, TypeScript, Tailwind CSS y Vite.

## Arquitectura del proyecto

```text
src/
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
├── components/
│   ├── common/
│   ├── layout/
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── PasswordInput.tsx
├── constants/
├── hooks/
├── layouts/
├── pages/
│   └── login/
│       └── Login.tsx
├── routes/
├── services/
├── types/
├── utils/
├── App.tsx
├── index.css
└── main.tsx
```

## Responsabilidades

- `assets/`: imágenes, iconos y fuentes.
- `components/common/`: componentes compartidos propios de EduTrack AI.
- `components/layout/`: piezas estructurales como Sidebar, Header y Footer.
- `components/ui/`: componentes visuales reutilizables y sin lógica de negocio.
- `constants/`: constantes globales y tokens de configuración.
- `hooks/`: hooks reutilizables.
- `layouts/`: composiciones generales de páginas.
- `pages/`: vistas completas de la aplicación.
- `routes/`: definición y protección de rutas.
- `services/`: comunicación con la API.
- `types/`: tipos e interfaces compartidos.
- `utils/`: funciones auxiliares.

## Convenciones

- Componentes React y sus archivos: `PascalCase`, por ejemplo `Button.tsx`.
- Carpetas: minúsculas, por ejemplo `pages/login/`.
- Hooks: prefijo `use`, por ejemplo `useAuth.ts`.
- Servicios: sufijo `.service.ts`, por ejemplo `auth.service.ts`.
- Tipos compartidos: sufijo `.types.ts`, por ejemplo `user.types.ts`.
- Los componentes de `components/ui/` no deben contener lógica de negocio.

## Paleta de colores

| Elemento | Código |
|---|---|
| Fondo principal | `#0F172A` |
| Fondo de Card | `#1E293B` |
| Bordes | `#334155` |
| Botón principal | `#3B82F6` |
| Hover principal | `#2563EB` |
| Texto principal | `#FFFFFF` |
| Texto secundario | `#94A3B8` |
| Placeholder | `#64748B` |

## Comandos

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Tecnologías

- React
- TypeScript
- Tailwind CSS
- Vite
