import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AdminAcademicManagement from "../../components/admin-academic/AdminAcademicManagement";
import EvaluationsManager from "../../components/admin-academic/EvaluationsManager";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  createAdminSubject,
  getAdminAcademicSnapshot,
  toggleAdminSubjectStatus,
  updateAdminSubject,
  upsertAcademicResult,
  type AdminAcademicSnapshot,
} from "../../services/admin-academic.service";
import {
  syncAcademicCatalog,
  type CatalogSyncResult,
} from "../../services/admin-catalog-sync.service";
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
  const [catalogSyncing, setCatalogSyncing] = useState(false);
  const [catalogSyncResult, setCatalogSyncResult] = useState<CatalogSyncResult | null>(null);

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

  const handleCatalogSync = async () => {
    setCatalogSyncing(true);
    try {
      const result = await syncAcademicCatalog();
      setCatalogSyncResult(result);
      await load();
    } catch (syncError) {
      window.alert(syncError instanceof Error ? syncError.message : "No fue posible sincronizar el catálogo institucional.");
    } finally {
      setCatalogSyncing(false);
    }
  };

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
      <Card padding="md" className="border-primary/25">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="prototype-eyebrow">Preparación de contenido</span>
            <h2 className="mt-1 text-xl font-bold text-content">Traer materias del catálogo oficial al Admin</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Sincroniza las materias institucionales para poder cargar evaluaciones, recursos y quizzes desde Administración antes de que un estudiante las seleccione.
            </p>
            {catalogSyncResult && (
              <p className="mt-3 text-xs font-semibold text-primary">
                {catalogSyncResult.uniqueSubjects} materias disponibles · {catalogSyncResult.created} nuevas · {catalogSyncResult.reused} ya existentes · {catalogSyncResult.reactivated} reactivadas.
              </p>
            )}
          </div>
          <Button loading={catalogSyncing} onClick={() => void handleCatalogSync()}>
            Sincronizar catálogo institucional
          </Button>
        </div>
      </Card>

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
