# Login - EduTrack AI

## Desarrollo del Login

Para desarrollar el Login de **EduTrack AI** se creó una interfaz moderna, limpia y completamente responsiva utilizando **React**, **TypeScript** y **Tailwind CSS**.

El proyecto fue organizado siguiendo una arquitectura basada en componentes reutilizables y una separación clara de responsabilidades, permitiendo que la aplicación pueda crecer de forma ordenada a medida que se desarrollen nuevos módulos como Dashboard, Quizzes, Recomendaciones y Perfil.

Los componentes visuales reutilizables se encuentran separados de las páginas, mientras que también se preparó la estructura del proyecto para incorporar servicios, hooks, layouts, rutas, tipos, utilidades y constantes sin afectar la organización del código.

---

## Estructura del proyecto

```text
src/
│
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
│
├── components/
│   ├── common/
│   │   └── Logo.tsx
│   │
│   ├── layout/
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── PasswordInput.tsx
│
├── constants/
│
├── hooks/
│
├── layouts/
│
├── pages/
│   └── Login/
│       └── Login.tsx
│
├── routes/
│
├── services/
│
├── types/
│
├── utils/
│
├── App.tsx
└── main.tsx
```

---

## Organización del proyecto

La estructura fue diseñada para facilitar el mantenimiento y la escalabilidad de la aplicación.

- **assets/**: Recursos estáticos como imágenes, iconos y fuentes.
- **components/common/**: Componentes reutilizables propios de la aplicación, como el Logo.
- **components/layout/**: Componentes destinados a la estructura general de las páginas, como Navbar, Sidebar y Footer.
- **components/ui/**: Componentes visuales reutilizables como Button, Card, Input y PasswordInput.
- **constants/**: Constantes globales y configuraciones del proyecto.
- **hooks/**: Hooks personalizados de React.
- **layouts/**: Layouts reutilizables para las diferentes vistas.
- **pages/**: Páginas principales de la aplicación.
- **routes/**: Configuración de las rutas del proyecto.
- **services/**: Comunicación con la API REST.
- **types/**: Interfaces y tipos de TypeScript.
- **utils/**: Funciones auxiliares reutilizables.

---

## Responsive Design

El Login fue desarrollado utilizando las utilidades de **Tailwind CSS**, permitiendo reutilizar los mismos componentes en dispositivos móviles, tablets y escritorio sin duplicar código.

---

## Paleta de colores

La interfaz utiliza una combinación de colores oscuros con tonos azules para transmitir una apariencia moderna y tecnológica.

| Elemento | Color | Código |
|----------|-------|--------|
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
