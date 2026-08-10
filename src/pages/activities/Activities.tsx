import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ActivitiesHeader from "../../components/activities/ActivitiesHeader";
import ActivityFilters from "../../components/activities/ActivityFilters";
import ActivityForm from "../../components/activities/ActivityForm";
import ActivityList from "../../components/activities/ActivityList";
import ActivitySummary from "../../components/activities/ActivitySummary";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  getStudyPlanActivity,
  updateStudyPlanActivity,
} from "../../services/adaptive.service";
import {
  createStudySession,
  deleteStudySession,
  getStudySessions,
  getSubjects,
  updateStudySession,
} from "../../services/study-session.service";
import type { StudyPlanActivity } from "../../types/adaptive.types";
import type {
  StudySession,
  StudySessionFilters,
  StudySessionFormData,
  SubjectOption,
} from "../../types/study-session.types";

interface ActivitiesProps {
  userId: string;
  onBack: () => void;
}

const emptyFilters: StudySessionFilters = {
  subjectId: "",
  startDate: "",
  endDate: "",
};

const methodForActivity = (activity: StudyPlanActivity) => {
  if (activity.activityType === "quiz_review") return "Práctica";
  if (activity.activityType === "exam_preparation") return "Repaso";
  if (activity.recommendation?.resource?.resourceType?.toLowerCase().includes("video")) return "Videos";
  return "Repaso";
};

const plannedSessionData = (activity: StudyPlanActivity): Partial<StudySessionFormData> => {
  const startedAt = new Date();
  const endedAt = new Date(startedAt.getTime() + activity.durationMinutes * 60_000);

  return {
    subjectId: activity.subject.id,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    notes: `${activity.title}. ${activity.reason}`,
    studyMethod: methodForActivity(activity),
    productivityRating: 3,
  };
};

const Activities = ({ userId, onBack }: ActivitiesProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const planActivityId = searchParams.get("planActivityId");
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [filters, setFilters] = useState<StudySessionFilters>(emptyFilters);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [plannedActivity, setPlannedActivity] = useState<StudyPlanActivity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [sessionData, subjectData] = await Promise.all([
        getStudySessions(),
        getSubjects(),
      ]);
      setSessions(sessionData);
      setSubjects(subjectData.filter((subject) => subject.isActive !== false));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar las actividades.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  useEffect(() => {
    if (!planActivityId) {
      setPlannedActivity(null);
      setPlanError(null);
      return;
    }

    let active = true;
    setPlanLoading(true);
    setPlanError(null);

    void getStudyPlanActivity(planActivityId)
      .then((activity) => {
        if (!active) return;
        setPlannedActivity(activity);
        setEditingSession(null);
        setShowForm(true);
      })
      .catch((loadError) => {
        if (!active) return;
        setPlannedActivity(null);
        setPlanError(
          loadError instanceof Error
            ? loadError.message
            : "No fue posible abrir la actividad sugerida.",
        );
      })
      .finally(() => {
        if (active) setPlanLoading(false);
      });

    return () => {
      active = false;
    };
  }, [planActivityId]);

  const filteredSessions = useMemo(() => sessions.filter((session) => {
    if (filters.subjectId && session.subject.id !== filters.subjectId) return false;
    const startedAt = new Date(session.startedAt);
    if (filters.startDate && startedAt < new Date(`${filters.startDate}T00:00:00`)) return false;
    if (filters.endDate && startedAt > new Date(`${filters.endDate}T23:59:59`)) return false;
    return true;
  }), [filters, sessions]);

  const clearPlannedContext = () => {
    setPlannedActivity(null);
    setPlanError(null);
    if (planActivityId) setSearchParams({}, { replace: true });
  };

  const handleOpenCreate = () => {
    clearPlannedContext();
    setEditingSession(null);
    setShowForm(true);
  };

  const handleEdit = (session: StudySession) => {
    clearPlannedContext();
    setEditingSession(session);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (data: StudySessionFormData) => {
    setSaving(true);

    try {
      if (editingSession) {
        const updatedSession = await updateStudySession(editingSession.id, data);
        setSessions((current) => current.map((session) => session.id === updatedSession.id ? updatedSession : session));
      } else {
        const createdSession = await createStudySession(userId, data);
        setSessions((current) => [createdSession, ...current]);

        if (plannedActivity) {
          try {
            await updateStudyPlanActivity(plannedActivity.id, { status: "completed" });
          } catch (planUpdateError) {
            window.alert(
              planUpdateError instanceof Error
                ? `La sesión se guardó, pero no fue posible cerrar la actividad del plan: ${planUpdateError.message}`
                : "La sesión se guardó, pero no fue posible cerrar la actividad del plan.",
            );
          }

          navigate("/practices", { replace: true });
          return;
        }
      }
      setEditingSession(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (session: StudySession) => {
    if (!window.confirm(`¿Eliminar la actividad de ${session.subject.name}?`)) return;
    setDeletingId(session.id);

    try {
      await deleteStudySession(session.id);
      setSessions((current) => current.filter((item) => item.id !== session.id));
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : "No fue posible eliminar la actividad.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelForm = () => {
    setEditingSession(null);
    setShowForm(false);
    if (plannedActivity || planActivityId) {
      clearPlannedContext();
      navigate("/practices");
    }
  };

  return (
    <section className="flex w-full flex-col gap-6">
      <ActivitiesHeader onCreate={handleOpenCreate} onBack={onBack} />

      {planLoading && (
        <Card padding="md">
          <p className="text-sm text-muted">Preparando la sesión recomendada…</p>
        </Card>
      )}

      {planError && (
        <Card padding="md" className="border-danger/40">
          <p className="text-sm text-danger">{planError}</p>
          <Button className="mt-3" size="sm" variant="outline" onClick={() => navigate("/practices")}>
            Volver a Mi plan
          </Button>
        </Card>
      )}

      {plannedActivity && (
        <Card padding="md" className="border-primary/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="prototype-eyebrow">Sesión sugerida por EduTrack</span>
              <h2 className="mt-1 text-xl font-bold text-content">{plannedActivity.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{plannedActivity.reason}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="prototype-badge">{plannedActivity.subject.name}</span>
                <span className="rounded-lg bg-surface-muted px-2.5 py-1.5 text-xs text-muted">{plannedActivity.durationMinutes} min</span>
                {plannedActivity.topic && (
                  <span className="rounded-lg bg-surface-muted px-2.5 py-1.5 text-xs text-muted">Tema: {plannedActivity.topic}</span>
                )}
              </div>
            </div>

            {plannedActivity.recommendation?.resource?.url && (
              <a
                href={plannedActivity.recommendation.resource.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-control border border-border bg-surface-muted px-4 text-sm font-semibold text-content transition hover:bg-primary/10"
              >
                Abrir recurso sugerido
              </a>
            )}
          </div>
        </Card>
      )}

      {showForm && (
        <ActivityForm
          key={editingSession?.id ?? plannedActivity?.id ?? "new-session"}
          subjects={subjects}
          initialSession={editingSession}
          initialData={plannedActivity ? plannedSessionData(plannedActivity) : undefined}
          lockSubject={Boolean(plannedActivity)}
          guidedTitle={plannedActivity ? "Completa tu sesión guiada" : undefined}
          saving={saving}
          onSubmit={handleSave}
          onCancel={handleCancelForm}
        />
      )}
      <ActivitySummary sessions={filteredSessions} />
      <ActivityFilters filters={filters} subjects={subjects} onChange={setFilters} onClear={() => setFilters(emptyFilters)} />
      <ActivityList sessions={filteredSessions} loading={loading} error={error} deletingId={deletingId} onRetry={() => void loadData()} onEdit={handleEdit} onDelete={(session) => void handleDelete(session)} />
    </section>
  );
};

export default Activities;
