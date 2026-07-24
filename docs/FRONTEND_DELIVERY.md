# Cierre técnico parcial del frontend

## Estado alcanzado

La rama `Yeliana` contiene una versión funcional conectada a la API para los siguientes issues:

- #10 Dashboard académico del estudiante.
- #11 Pantalla de materias.
- #12 Cuenta y preferencias.
- #13 Progreso académico.
- #14 Configuración académica inicial.
- #15 Hábitos de estudio.
- #16 Biblioteca de recursos.
- #20 Sugerencias de estudio.
- #21 Centro de notificaciones.
- #22 Dashboard administrativo.
- #24 Gestión académica administrativa.
- #31 Documentación y cierre técnico parcial.

## Endpoints utilizados

- `/api/dashboard/*`
- `/api/subjects`
- `/api/grades`
- `/api/study-sessions`
- `/api/resources`
- `/api/recommendations`
- `/api/notifications`
- `/api/users/me`
- `/api/users/me/password`
- `/api/admin/stats`
- `/api/admin/audit-logs`

## Validación manual recomendada

1. Iniciar backend en `http://localhost:5000`.
2. Iniciar frontend con `npm run dev`.
3. Probar usuario estudiante y usuario administrador.
4. Verificar estados con datos y sin datos.
5. Marcar una notificación y todas las notificaciones como leídas.
6. Abrir recursos externos.
7. Filtrar materias, progreso, recursos y recomendaciones.
8. Confirmar restricciones de las rutas administrativas.
9. Ejecutar `npm run build` y `npm run lint`.

## Pendientes fuera de este cierre

- React Router y layout global.
- Administración completa de usuarios y roles.
- Flujo completo y administración de quizzes.
- Auditoría integral de accesibilidad.
- Pruebas automatizadas y CI.
