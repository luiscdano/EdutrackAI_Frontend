# Revisión responsive y accesibilidad del frontend

## Alcance

Esta revisión cubre las pantallas públicas, el área del estudiante y el área administrativa. La implementación utiliza un ancho mínimo de 320 px, navegación adaptable, tablas con desplazamiento controlado y tarjetas alternativas en móvil.

## Matriz responsive

| Ancho de referencia | Comportamiento esperado |
|---|---|
| 320 px | Una columna, menú lateral como panel superpuesto, botones táctiles y formularios apilados. |
| 768 px | Cuadrículas de dos columnas cuando existe espacio, tablas administrativas visibles con desplazamiento horizontal interno. |
| 1280 px o más | Sidebar persistente y colapsable, contenido en cuadrículas amplias y editores divididos en paneles. |

## Navegación

- Sidebar diferente para estudiante y administrador.
- Estado activo visible mediante `NavLink`.
- Menú móvil con overlay y cierre mediante `Escape`.
- Sidebar de escritorio colapsable.
- Encabezado con título contextual, acceso a notificaciones y cuenta.
- Rutas públicas, privadas y administrativas protegidas.
- Pantallas 403 y 404.
- Restauración de sesión antes de mostrar contenido protegido.

## Formularios y acciones

- Campos nuevos asociados a etiquetas visibles.
- Botones principales con altura mínima de 44 px.
- Estados `disabled` y `loading` para evitar acciones repetidas.
- Confirmación antes de eliminaciones, desactivaciones y finalización de quizzes.
- Modales cerrables con `Escape`, botón visible y overlay.
- Errores de servidor presentados sin perder el contexto principal.

## Teclado y foco

- Foco global visible con contraste azul.
- Enlaces y botones utilizan elementos semánticos.
- Navegación principal etiquetada con `aria-label`.
- Tabs y grupos de opciones incluyen roles o etiquetas accesibles.
- El intento de quiz permite recorrer preguntas y opciones mediante teclado.

## Movimiento reducido

`prefers-reduced-motion: reduce` desactiva animaciones y desplazamiento suave para usuarios que lo soliciten en el sistema operativo.

## Contraste y estados

- Texto principal blanco sobre fondos oscuros.
- Texto secundario gris claro con contraste suficiente para lectura normal.
- Estados de éxito, advertencia y error no dependen únicamente del color: también muestran texto como Activo, Inactivo, Correcta o Incorrecta.

## Validación recomendada antes de entrega

1. Ejecutar `npm install`.
2. Ejecutar `npm run build`.
3. Ejecutar `npm run lint`.
4. Probar con un usuario estudiante y otro administrador.
5. Revisar manualmente 320 px, 768 px y 1280 px en DevTools.
6. Recorrer login, sidebar, formularios, modales y quiz utilizando solamente teclado.
7. Confirmar que las tablas no provocan desplazamiento horizontal en toda la página.
8. Activar movimiento reducido en el sistema y verificar que no existan transiciones molestas.

## Limitación de esta revisión

La revisión estructural y de código queda cubierta por este documento y por el workflow de build/lint. Las capturas comparativas de dispositivos deben producirse durante la validación local, porque el repositorio no dispone actualmente de pruebas visuales automatizadas ni navegador de CI.
