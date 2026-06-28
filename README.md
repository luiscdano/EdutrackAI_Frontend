# Login - EduTrack AI

## Desarrollo del Login

Para desarrollar el Login de EduTrack AI se creó una interfaz moderna, limpia y completamente responsiva utilizando React, TypeScript y Tailwind CSS. Se organizó el proyecto siguiendo una estructura basada en componentes reutilizables con el objetivo de facilitar el mantenimiento del código y permitir que las mismas piezas puedan utilizarse en otras pantallas del sistema.

Se crearon componentes reutilizables para los botones, las tarjetas (Card) y el logo de la aplicación, manteniendo un diseño uniforme en toda la interfaz. Además, el Login fue desarrollado pensando en la escalabilidad del proyecto, separando los componentes de la página principal para mantener una mejor organización del código.

La estructura utilizada fue la siguiente:

```text
src/
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   │
│   └── Logo.tsx
│
├── pages/
│   └── Login/
│       └── Login.tsx
│
├── assets/
├── App.tsx
└── main.tsx
```

---

## Paleta de colores

La interfaz utiliza una combinación de colores oscuros con tonos azules para transmitir una apariencia moderna y tecnológica.

| Elemento | Color | Código |
|----------|--------|---------|
| Fondo principal | Azul oscuro | `#0F172A` |
| Fondo del formulario (Card) | Gris azulado | `#1E293B` |
| Bordes | Gris | `#334155` |
| Botón principal | Azul | `#3B82F6` |
| Hover del botón | Azul oscuro | `#2563EB` |
| Texto principal | Blanco | `#FFFFFF` |
| Texto secundario | Gris claro | `#94A3B8` |
| Placeholder | Gris | `#64748B` |

---

## Tecnologías utilizadas

- React
- TypeScript
- Tailwind CSS
- Vite
