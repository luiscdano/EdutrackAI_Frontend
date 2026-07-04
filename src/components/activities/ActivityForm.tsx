import { useState } from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

import type {
  StudySession,
  StudySessionFormData,
  SubjectOption,
} from "../../types/study-session.types";

interface ActivityFormProps {
  subjects: SubjectOption[];
  initialSession?: StudySession | null;
  saving: boolean;
  onSubmit: (data: StudySessionFormData) => Promise<void>;
  onCancel: () => void;
}

const toLocalDateTime = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};

const createInitialData = (
  initialSession?: StudySession | null,
): StudySessionFormData => {
  if (initialSession) {
    return {
      subjectId: initialSession.subject.id,
      startedAt: toLocalDateTime(initialSession.startedAt),
      endedAt: toLocalDateTime(initialSession.endedAt),
      notes: initialSession.notes,
      studyMethod: initialSession.studyMethod,
      productivityRating: initialSession.productivityRating,
    };
  }

  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60_000);

  return {
    subjectId: "",
    startedAt: toLocalDateTime(now.toISOString()),
    endedAt: toLocalDateTime(later.toISOString()),
    notes: "",
    studyMethod: "",
    productivityRating: 3,
  };
};

const ActivityForm = ({
  subjects,
  initialSession = null,
  saving,
  onSubmit,
  onCancel,
}: ActivityFormProps) => {
  const [formData, setFormData] = useState<StudySessionFormData>(() =>
    createInitialData(initialSession),
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);

    if (!formData.subjectId) {
      setError("Selecciona una materia.");
      return;
    }

    if (!formData.studyMethod.trim() || !formData.notes.trim()) {
      setError("Completa el método y las notas.");
      return;
    }

    if (new Date(formData.endedAt) < new Date(formData.startedAt)) {
      setError("La fecha final debe ser posterior a la fecha inicial.");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No fue posible guardar la actividad.",
      );
    }
  };

  return (
    <Card padding="md">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <h2 className="text-xl font-bold text-content">
            {initialSession ? "Editar actividad" : "Nueva actividad"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Registra el tiempo, método y productividad de la sesión.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-control border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="activity-subject" className="mb-2 block text-sm font-medium text-content">
            Materia <span className="text-danger">*</span>
          </label>
          <select
            id="activity-subject"
            value={formData.subjectId}
            disabled={Boolean(initialSession)}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                subjectId: event.target.value,
              }))
            }
            className="min-h-11 w-full rounded-control border border-border bg-surface-muted px-4 py-2.5 text-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
          >
            <option value="">Selecciona una materia</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} - {subject.level}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Fecha y hora inicial"
            type="datetime-local"
            required
            value={formData.startedAt}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                startedAt: event.target.value,
              }))
            }
          />
          <Input
            label="Fecha y hora final"
            type="datetime-local"
            required
            value={formData.endedAt}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                endedAt: event.target.value,
              }))
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="study-method" className="mb-2 block text-sm font-medium text-content">
              Método de estudio <span className="text-danger">*</span>
            </label>
            <select
              id="study-method"
              value={formData.studyMethod}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  studyMethod: event.target.value,
                }))
              }
              className="min-h-11 w-full rounded-control border border-border bg-surface-muted px-4 py-2.5 text-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Selecciona un método</option>
              <option value="Lectura">Lectura</option>
              <option value="Práctica">Práctica</option>
              <option value="Videos">Videos</option>
              <option value="Repaso">Repaso</option>
              <option value="Proyecto">Proyecto</option>
            </select>
          </div>

          <div>
            <label htmlFor="productivity-rating" className="mb-2 block text-sm font-medium text-content">
              Productividad
            </label>
            <select
              id="productivity-rating"
              value={formData.productivityRating}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  productivityRating: Number(event.target.value),
                }))
              }
              className="min-h-11 w-full rounded-control border border-border bg-surface-muted px-4 py-2.5 text-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} de 5
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="activity-notes" className="mb-2 block text-sm font-medium text-content">
            Notas <span className="text-danger">*</span>
          </label>
          <textarea
            id="activity-notes"
            rows={4}
            value={formData.notes}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
            className="w-full rounded-control border border-border bg-surface-muted px-4 py-3 text-content outline-none placeholder:text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Describe lo que estudiaste..."
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            {initialSession ? "Guardar cambios" : "Registrar actividad"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ActivityForm;
