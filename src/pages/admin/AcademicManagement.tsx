import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AdminAcademicManagement from "../../components/admin-academic/AdminAcademicManagement";
import EvaluationsManager from "../../components/admin-academic/EvaluationsManager";
import InstitutionCatalogManager from "../../components/admin-academic/InstitutionCatalogManager";
import {
  createAdminSubject,
  getAdminAcademicSnapshot,
  toggleAdminSubjectStatus,
  updateAdminSubject,
  upsertAcademicResult,
  type AdminAcademicSnapshot,
} from "../../services/admin-academic.service";
import {
  createEvaluation,
  deactivateEvaluation,
  getEvaluations,
  updateEvaluation,
} from "../../services/adaptive.service";
import type {
  ResultFormData,
  SubjectFormData,
  SubjectStatus,
} from "../../types/adminAcademic.types";
import type {
  EvaluationPayload,
  EvaluationSummary,
} from "../../types/adaptive.types";

const emptySnapshot: AdminAcademicSnapshot = {
  subjects: [],
  assignments: [],
  results: [],
  history: [],
};

const AcademicManagement = () => {
  const [snapshot, setSnapshot] =
    useState<AdminAcademicSnapshot>(emptySnapshot);
  const [evaluations, setEvaluations] =
    useState<EvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextSnapshot, nextEvaluations] = await Promise.all([
        getAdminAcademicSnapshot(),
        getEvaluations(),
      ]);
      setSnapshot(nextSnapshot);
      setEvaluations(nextEvaluations);
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

  const refreshEvaluations = useCallback(async () => {
    setEvaluationLoading(true);
    try {
      setEvaluations(await getEvaluations());
    } finally {
      setEvaluationLoading(false);
    }
  }, []);

  const handleCreateEvaluation = async (payload: EvaluationPayload) => {
    await createEvaluation(payload);
    await refreshEvaluations();
  };

  const handleUpdateEvaluation = async (
    evaluationId: string,
    payload: Partial<Omit<EvaluationPayload, "subjectId">>,
  ) => {
    await updateEvaluation(evaluationId, payload);
    await refreshEvaluations();
  };

  const handleDeactivateEvaluation = async (evaluationId: string) => {
    await deactivateEvaluation(evaluationId);
    await refreshEvaluations();
  };

  return (
    <div className="space-y-8">
      <InstitutionCatalogManager
        operationalSubjects={snapshot.subjects}
        onRefresh={load}
      />

      <EvaluationsManager
        subjects={snapshot.subjects}
        evaluations={evaluations}
        loading={evaluationLoading}
        onCreate={handleCreateEvaluation}
        onUpdate={handleUpdateEvaluation}
        onDeactivate={handleDeactivateEvaluation}
      />

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
    </div>
  );
};

export default AcademicManagement;
