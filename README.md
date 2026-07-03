# EduTrack AI Frontend

Interfaz web de EduTrack AI desarrollada con React, TypeScript, Tailwind CSS y Vite.

## Arquitectura del proyecto

```text
src/
â”œâ”€â”€ assets/
â”‚   â”œâ”€â”€ fonts/
â”‚   â”œâ”€â”€ icons/
â”‚   â””â”€â”€ images/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ common/
â”‚   â”œâ”€â”€ layout/
â”‚   â””â”€â”€ ui/
â”‚       â”œâ”€â”€ Button.tsx
â”‚       â”œâ”€â”€ Card.tsx
â”‚       â”œâ”€â”€ Input.tsx
â”‚       â””â”€â”€ PasswordInput.tsx
â”œâ”€â”€ constants/
â”œâ”€â”€ hooks/
â”œâ”€â”€ layouts/
â”œâ”€â”€ pages/
â”‚   â””â”€â”€ login/
â”‚       â””â”€â”€ Login.tsx
â”œâ”€â”€ routes/
â”œâ”€â”€ services/
â”œâ”€â”€ types/
â”œâ”€â”€ utils/
â”œâ”€â”€ App.tsx
â”œâ”€â”€ index.css
â””â”€â”€ main.tsx
```

## Responsabilidades

- `assets/`: imÃ¡genes, iconos y fuentes.
- `components/common/`: componentes compartidos propios de EduTrack AI.
- `components/layout/`: piezas estructurales como Sidebar, Header y Footer.
- `components/ui/`: componentes visuales reutilizables y sin lÃ³gica de negocio.
- `constants/`: constantes globales y tokens de configuraciÃ³n.
- `hooks/`: hooks reutilizables.
- `layouts/`: composiciones generales de pÃ¡ginas.
- `pages/`: vistas completas de la aplicaciÃ³n.
- `routes/`: definiciÃ³n y protecciÃ³n de rutas.
- `services/`: comunicaciÃ³n con la API.
- `types/`: tipos e interfaces compartidos.
- `utils/`: funciones auxiliares.

## Convenciones

- Componentes React y sus archivos: `PascalCase`, por ejemplo `Button.tsx`.
- Carpetas: minÃºsculas, por ejemplo `pages/login/`.
- Hooks: prefijo `use`, por ejemplo `useAuth.ts`.
- Servicios: sufijo `.service.ts`, por ejemplo `auth.service.ts`.
- Tipos compartidos: sufijo `.types.ts`, por ejemplo `user.types.ts`.
- Los componentes de `components/ui/` no deben contener lÃ³gica de negocio.

## Paleta de colores

| Elemento | CÃ³digo |
|---|---|
| Fondo principal | `#0F172A` |
| Fondo de Card | `#1E293B` |
| Bordes | `#334155` |
| BotÃ³n principal | `#3B82F6` |
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

## TecnologÃ­as

- React
- TypeScript
- Tailwind CSS
- Vite
