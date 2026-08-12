# EduTrack Student Copilot Experience

The student experience is intentionally small.

## Main navigation

- Inicio: one next action, nearest important date and lightweight weekly progress.
- Practicar: adaptive activities and quizzes in one place.
- Materias: the subjects the student is actually taking now.
- Progreso: simple status, trend and grades without exposing engine internals.

Notifications and account settings remain utilities. They do not compete with the primary learning flow.

## Quick capture

The global `Añadir` action is used only for information EduTrack cannot know automatically:

- a grade received by the student;
- an important date such as an exam or project deadline;
- a class material URL from a professor or learning platform.

Important dates are converted by the backend into plan activities. Class materials are prioritized during resource discovery.

## Focus

Focus removes normal navigation and keeps one objective visible. The intended sequence is:

objective → relevant material → optional practice → short reflection → save study session → adaptive recalculation.

## Design rule

Do not expose raw risk scores, component weights or engine terminology as the default student language. The student should see a useful decision, not the implementation behind that decision.
