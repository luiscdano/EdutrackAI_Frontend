import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AdminAcademicManagement from "../../components/admin-academic/AdminAcademicManagement";
import {
  createAdminSubject,
  getAdminAcademicSnapshot,
  toggleAdminSubjectStatus,
  updateAdminSubject,
  upsertAcademicResult,
  type AdminAcademicSnapshot,
} from "../../services/admin-academic.service";
import type {
  ResultFormData,
  SubjectFormData,
  SubjectStatus,
} from "../../types/adminAcademic.types";

const emptySnapshot: AdminAcademicSnapshot = {
  subjects: [],
  assignments: [],
  results: [],
  history: [],
};

const AcademicManagement = () => {
  const [snapshot, setSnapshot] =
    useState<AdminAcademicSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setSnapshot(await getAdminAcademicSnapshot());
      setRevision((current) => current + 1);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar la gestión académica.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const execute = useCallback(
    async (operation: () => Promise<unknown>) => {
      try {
        await operation();
      } catch (operationError) {
        window.alert(
          operationError instanceof Error
            ? operationError.message
            : "No fue posible completar la operación.",
        );
      } finally {
        await load();
      }
    },
    [load],
  );

  const handleCreate = (data: SubjectFormData) =>
    execute(() => createAdminSubject(data));

  const handleUpdate = (
    subjectId: string,
    data: SubjectFormData,
  ) => execute(() => updateAdminSubject(subjectId, data));

  const handleToggle = (
    subjectId: string,
    status: SubjectStatus,
  ) => execute(() => toggleAdminSubjectStatus(subjectId, status));

  const handleUpsertResult = (data: ResultFormData) =>
    execute(() => upsertAcademicResult(data, snapshot));

  return (
    <AdminAcademicManagement
      key={revision}
      subjects={snapshot.subjects}
      assignments={snapshot.assignments}
      results={snapshot.results}
      history={snapshot.history}
      loading={loading}
      error={error}
      onRetry={() => void load()}
      onCreateSubject={handleCreate}
      onUpdateSubject={handleUpdate}
      onToggleSubjectStatus={handleToggle}
      onUpsertResult={handleUpsertResult}
    />
  );
};

export default AcademicManagement;
