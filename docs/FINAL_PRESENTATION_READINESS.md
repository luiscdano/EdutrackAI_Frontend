# EduTrack AI — final presentation verification

This branch is presentation-ready only after the complete student/admin story can be demonstrated without a dead end.

## Student

- Create an account with institution/career context when available.
- Continue to onboarding without re-entering the same career from zero.
- Combine subjects from different curriculum periods and search the whole plan.
- Home describes the configured period as a reference and exposes mixed-period enrollment when applicable.
- See one clear next action on Home.
- Add a grade, important date or class material.
- Ask EduTrack about a concrete topic; the written topic must win over plan/deadline labels.
- `No entiendo MAUI` should resolve to the active mobile-applications subject when that subject exists; it must not inherit an unrelated priority such as Inglés Técnico.
- Open contextual resources with visible source/provider.
- Enter Practice even when no adaptive plan exists yet.
- Complete a published quiz and return to Progress/Home.

## Demo account

- `Ver una cuenta de demostración` enters an already configured student experience.
- A valid demo session must never be trapped in onboarding.
- Browser history that points to an Admin-only route redirects a student safely to Home instead of showing a 403 trap.

## Admin

- The academic catalog is visible as `institución → carrera → período → materias` instead of being an opaque sync button.
- Admin can inspect official program sources and selectively bring chosen subjects into the operational catalog.
- Admin can register a subject for an external university/program; students from institutions not cataloged use the manual onboarding path.
- Manage subjects, evaluations and academic results.
- Manage resources, recommendations and notifications.
- Create quizzes as drafts, add questions/options, preview them and publish only when complete.
- `Recursos guardados` counts persisted platform resources; external discovery results are intentionally not included.
- `Auditoría administrativa` is explicitly separate from student study activity.

## Final browser path

1. Login with the demo account and confirm it opens Home directly.
2. Ask `No entiendo MAUI` and confirm the reply uses Introducción al desarrollo de aplicaciones móviles.
3. Open the resource action and confirm MAUI sources remain contextual.
4. Login as Admin and open Gestión académica.
5. Browse ITLA → Desarrollo de Software, filter a period and verify the subject checkboxes/statuses.
6. Add or synchronize a subject and confirm it becomes available for evaluations/resources/quizzes.
7. Open Quizzes, create a draft, add at least one complete question and publish it.
8. Return as student, complete the quiz and confirm Progress/Home reflect the attempt.

## Safety

The feature branches stay separate from their frozen reference bases and are not merged automatically.
