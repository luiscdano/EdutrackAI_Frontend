import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ActivitiesHeader from "../../components/activities/ActivitiesHeader";
import ActivityFilters from "../../components/activities/ActivityFilters";
import ActivityForm from "../../components/activities/ActivityForm";
import ActivityList from "../../components/activities/ActivityList";
import ActivitySummary from "../../components/activities/ActivitySummary";

import {
  createStudySession,
  deleteStudySession,
  getStudySessions,
  getSubjects,
  updateStudySession,
} from "../../services/study-session.service";

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

const Activities = ({ userId, onBack }: ActivitiesProps) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [filters, setFilters] =
    useState<StudySessionFilters>(emptyFilters);
  const [editingSession, setEditingSession] =
    useState<StudySession | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar las actividades.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (filters.subjectId && session.subject.id !== filters.subjectId) {
        return false;
      }

      const startedAt = new Date(session.startedAt);

      if (
        filters.startDate &&
        startedAt < new Date(`${filters.startDate}T00:00:00`)
      ) {
        return false;
      }

      if (
        filters.endDate &&
        startedAt > new Date(`${filters.endDate}T23:59:59`)
      ) {
        return false;
      }

      return true;
    });
  }, [filters, sessions]);

  const handleOpenCreate = () => {
    setEditingSession(null);
    setShowForm(true);
  };

  const handleEdit = (session: StudySession) => {
    setEditingSession(session);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (data: StudySessionFormData) => {
    setSaving(true);

    try {
      if (editingSession) {
        const updatedSession = await updateStudySession(
          editingSession.id,
          data,
        );

        setSessions((current) =>
          current.map((session) =>
            session.id === updatedSession.id ? updatedSession : session,
          ),
        );
      } else {
        const createdSession = await createStudySession(userId, data);
        setSessions((current) => [createdSession, ...current]);
      }

      setEditingSession(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (session: StudySession) => {
    const confirmed = window.confirm(
      `¿Eliminar la actividad de ${session.subject.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(session.id);

    try {
      await deleteStudySession(session.id);
      setSessions((current) =>
        current.filter((item) => item.id !== session.id),
      );
    } catch (deleteError) {
      window.alert(
        deleteError instanceof Error
          ? deleteError.message
          : "No fue posible eliminar la actividad.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <ActivitiesHeader onCreate={handleOpenCreate} onBack={onBack} />

        {showForm && (
          <ActivityForm
            key={editingSession?.id ?? "new-session"}
            subjects={subjects}
            initialSession={editingSession}
            saving={saving}
            onSubmit={handleSave}
            onCancel={() => {
              setEditingSession(null);
              setShowForm(false);
            }}
          />
        )}

        <ActivitySummary sessions={filteredSessions} />

        <ActivityFilters
          filters={filters}
          subjects={subjects}
          onChange={setFilters}
          onClear={() => setFilters(emptyFilters)}
        />

        <ActivityList
          sessions={filteredSessions}
          loading={loading}
          error={error}
          deletingId={deletingId}
          onRetry={() => void loadData()}
          onEdit={handleEdit}
          onDelete={(session) => void handleDelete(session)}
        />
      </div>
    </main>
  );
};

export default Activities;
