import { useState } from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ConfirmDialog from "../ui/ConfirmDialog";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import Loader from "../ui/Loader";
import Pagination from "../ui/Pagination";

import AssignmentsModal from "./AssignmentsModal";
import HistoryModal from "./HistoryModal";
import ResultFormModal from "./ResultFormModal";
import SubjectCards from "./SubjectCards";
import SubjectFilters from "./SubjectFilters";
import SubjectFormModal from "./SubjectFormModal";
import SubjectTable from "./SubjectTable";

import type {
  AcademicHistoryEntry,
  AcademicResult,
  AdminSubject,
  ResultFormData,
  SubjectAssignment,
  SubjectFiltersState,
  SubjectFormData,
  SubjectStatus,
} from "../../types/adminAcademic.types";

interface AdminAcademicManagementProps {
  subjects: AdminSubject[];
  assignments: SubjectAssignment[];
  results: AcademicResult[];
  history: AcademicHistoryEntry[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onCreateSubject?: (
    data: SubjectFormData,
  ) => void | Promise<void>;
  onUpdateSubject?: (
    subjectId: string,
    data: SubjectFormData,
  ) => void | Promise<void>;
  onToggleSubjectStatus?: (
    subjectId: string,
    nextStatus: SubjectStatus,
  ) => void | Promise<void>;
  onUpsertResult?: (
    data: ResultFormData,
  ) => void | Promise<void>;
}

const pageSize = 4;

const defaultFilters: SubjectFiltersState = {
  search: "",
  status: "all",
  difficulty: "all",
  program: "all",
};

const normalizeValue = (value: string) =>
  value.trim().toLowerCase();

const getToday = () =>
  new Date().toISOString().slice(0, 10);

const getDateTime = () =>
  new Date().toISOString().slice(0, 16).replace("T", " ");

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.round(
    Math.random() * 1000,
  )}`;

const calculateAverage = (
  subjectId: string,
  results: AcademicResult[],
  fallbackAverage: number,
) => {
  const subjectResults = results.filter(
    (result) => result.subjectId === subjectId,
  );

  if (subjectResults.length === 0) {
    return fallbackAverage;
  }

  const total = subjectResults.reduce(
    (sum, result) => sum + result.score,
    0,
  );

  return Math.round(total / subjectResults.length);
};

const AdminAcademicManagement = ({
  subjects,
  assignments,
  results,
  history,
  loading = false,
  error = null,
  onRetry,
  onCreateSubject,
  onUpdateSubject,
  onToggleSubjectStatus,
  onUpsertResult,
}: AdminAcademicManagementProps) => {
  const [subjectList, setSubjectList] =
    useState<AdminSubject[]>(subjects);
  const [assignmentList] =
    useState<SubjectAssignment[]>(assignments);
  const [resultList, setResultList] =
    useState<AcademicResult[]>(results);
  const [historyList, setHistoryList] =
    useState<AcademicHistoryEntry[]>(history);
  const [filters, setFilters] =
    useState<SubjectFiltersState>(defaultFilters);
  const [page, setPage] = useState(1);
  const [subjectModalMode, setSubjectModalMode] =
    useState<"create" | "edit" | null>(null);
  const [editingSubject, setEditingSubject] =
    useState<AdminSubject | null>(null);
  const [resultSubject, setResultSubject] =
    useState<AdminSubject | null>(null);
  const [assignmentsSubject, setAssignmentsSubject] =
    useState<AdminSubject | null>(null);
  const [historySubject, setHistorySubject] =
    useState<AdminSubject | null>(null);
  const [pendingToggleSubject, setPendingToggleSubject] =
    useState<AdminSubject | null>(null);
  const [feedbackMessage, setFeedbackMessage] =
    useState("");
  const [integrityMessage, setIntegrityMessage] =
    useState("");

  const programs = Array.from(
    new Set(
      subjectList.map((subject) => subject.program),
    ),
  ).sort();

  const filteredSubjects = subjectList.filter(
    (subject) => {
      const searchableText = [
        subject.code,
        subject.name,
        subject.program,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        filters.search.trim().toLowerCase(),
      );

      const matchesStatus =
        filters.status === "all" ||
        subject.status === filters.status;

      const matchesDifficulty =
        filters.difficulty === "all" ||
        subject.difficulty === filters.difficulty;

      const matchesProgram =
        filters.program === "all" ||
        subject.program === filters.program;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDifficulty &&
        matchesProgram
      );
    },
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubjects.length / pageSize),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const activeSubjects = subjectList.filter(
    (subject) => subject.status === "active",
  ).length;
  const globalAverage =
    subjectList.length === 0
      ? 0
      : Math.round(
          subjectList.reduce(
            (sum, subject) => sum + subject.average,
            0,
          ) / subjectList.length,
        );
  const highDifficultySubjects = subjectList.filter(
    (subject) => subject.difficulty === "high",
  ).length;

  const closeSubjectModal = () => {
    setSubjectModalMode(null);
    setEditingSubject(null);
  };

  const appendHistory = (
    subjectId: string,
    description: string,
    action: AcademicHistoryEntry["action"],
  ) => {
    setHistoryList((currentHistory) => [
      {
        id: createId("history"),
        subjectId,
        action,
        description,
        author: "Administrador académico",
        createdAt: getDateTime(),
      },
      ...currentHistory,
    ]);
  };

  const isDuplicateSubject = (
    formData: SubjectFormData,
    excludedSubjectId?: string,
  ) => {
    return subjectList.some((subject) => {
      if (subject.id === excludedSubjectId) {
        return false;
      }

      const sameCode =
        normalizeValue(subject.code) ===
        normalizeValue(formData.code);
      const sameNameInProgram =
        normalizeValue(subject.name) ===
          normalizeValue(formData.name) &&
        normalizeValue(subject.program) ===
          normalizeValue(formData.program);

      return sameCode || sameNameInProgram;
    });
  };

  const handleCreateSubject = (
    formData: SubjectFormData,
  ) => {
    if (
      formData.semester === "" ||
      formData.credits === ""
    ) {
      return;
    }

    const semester = formData.semester;
    const credits = formData.credits;

    if (isDuplicateSubject(formData)) {
      setIntegrityMessage(
        "No se puede crear la materia porque ya existe un código igual o el mismo nombre dentro del programa seleccionado.",
      );
      return;
    }

    const newSubject: AdminSubject = {
      id: createId("subject"),
      code: formData.code,
      name: formData.name,
      program: formData.program,
      semester,
      credits,
      difficulty: formData.difficulty,
      status: formData.status,
      average: 0,
      assignmentsCount: 0,
      resultsCount: 0,
      updatedAt: getToday(),
    };

    void onCreateSubject?.(formData);
    setSubjectList((currentSubjects) => [
      newSubject,
      ...currentSubjects,
    ]);
    appendHistory(
      newSubject.id,
      `Materia ${newSubject.code} creada.`,
      "created",
    );
    setFeedbackMessage("Materia creada correctamente.");
    setIntegrityMessage("");
    closeSubjectModal();
  };

  const handleUpdateSubject = (
    subjectId: string,
    formData: SubjectFormData,
  ) => {
    if (
      formData.semester === "" ||
      formData.credits === ""
    ) {
      return;
    }

    const semester = formData.semester;
    const credits = formData.credits;

    if (isDuplicateSubject(formData, subjectId)) {
      setIntegrityMessage(
        "No se puede actualizar la materia porque duplicaría un código o nombre existente.",
      );
      return;
    }

    void onUpdateSubject?.(subjectId, formData);
    setSubjectList((currentSubjects) =>
      currentSubjects.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              code: formData.code,
              name: formData.name,
              program: formData.program,
              semester,
              credits,
              difficulty: formData.difficulty,
              status: formData.status,
              updatedAt: getToday(),
            }
          : subject,
      ),
    );
    appendHistory(
      subjectId,
      `Materia ${formData.code} actualizada.`,
      "updated",
    );
    setFeedbackMessage("Materia actualizada correctamente.");
    setIntegrityMessage("");
    closeSubjectModal();
  };

  const confirmToggleStatus = () => {
    if (!pendingToggleSubject) {
      return;
    }

    const nextStatus: SubjectStatus =
      pendingToggleSubject.status === "active"
        ? "inactive"
        : "active";

    void onToggleSubjectStatus?.(
      pendingToggleSubject.id,
      nextStatus,
    );

    setSubjectList((currentSubjects) =>
      currentSubjects.map((subject) =>
        subject.id === pendingToggleSubject.id
          ? {
              ...subject,
              status: nextStatus,
              updatedAt: getToday(),
            }
          : subject,
      ),
    );
    appendHistory(
      pendingToggleSubject.id,
      `Estado cambiado a ${
        nextStatus === "active" ? "activa" : "inactiva"
      }.`,
      "status_changed",
    );
    setFeedbackMessage(
      `Materia ${
        nextStatus === "active" ? "activada" : "desactivada"
      } correctamente.`,
    );
    setIntegrityMessage("");
    setPendingToggleSubject(null);
  };

  const handleUpsertResult = (
    formData: ResultFormData,
  ) => {
    if (formData.score === "") {
      return;
    }

    const score = formData.score;

    const existingResult = resultList.find(
      (result) =>
        result.subjectId === formData.subjectId &&
        normalizeValue(result.studentCode) ===
          normalizeValue(formData.studentCode) &&
        result.period === formData.period,
    );

    const nextResultList = existingResult
      ? resultList.map((result) =>
          result.id === existingResult.id
            ? {
                ...result,
                studentName: formData.studentName,
                studentCode: formData.studentCode,
                period: formData.period,
                score,
                status: formData.status,
                note: formData.note,
                updatedAt: getToday(),
              }
            : result,
        )
      : [
          {
            id: createId("result"),
            subjectId: formData.subjectId,
            studentName: formData.studentName,
            studentCode: formData.studentCode,
            period: formData.period,
            score,
            status: formData.status,
            note: formData.note,
            updatedAt: getToday(),
          },
          ...resultList,
        ];

    void onUpsertResult?.(formData);
    setResultList(nextResultList);
    setSubjectList((currentSubjects) =>
      currentSubjects.map((subject) => {
        if (subject.id !== formData.subjectId) {
          return subject;
        }

        return {
          ...subject,
          average: calculateAverage(
            subject.id,
            nextResultList,
            subject.average,
          ),
          resultsCount: nextResultList.filter(
            (result) => result.subjectId === subject.id,
          ).length,
          updatedAt: getToday(),
        };
      }),
    );
    appendHistory(
      formData.subjectId,
      `${existingResult ? "Actualizado" : "Registrado"} resultado de ${formData.studentName} para ${formData.period}.`,
      "result_updated",
    );
    setFeedbackMessage(
      existingResult
        ? "Resultado actualizado correctamente."
        : "Resultado registrado correctamente.",
    );
    setIntegrityMessage("");
    setResultSubject(null);
  };

  const updateFilters = (
    nextFilters: SubjectFiltersState,
  ) => {
    setFilters(nextFilters);
    setPage(1);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-8">
        <Loader
          size="lg"
          showLabel
          label="Cargando gestión académica..."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-8">
        <div className="w-full max-w-xl">
          <ErrorState
            title="No fue posible cargar las materias"
            description={error}
            icon="!"
            action={
              onRetry ? (
                <Button onClick={onRetry}>
                  Reintentar
                </Button>
              ) : undefined
            }
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Panel administrativo
            </p>

            <h1 className="mt-2 text-2xl font-bold text-content sm:text-3xl">
              Gestión académica de materias y resultados
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              Administra materias, asignaciones, resultados académicos,
              estados e historial desde una interfaz preparada para conectar
              backend mediante props.
            </p>
          </div>

          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setSubjectModalMode("create");
              setEditingSubject(null);
            }}
          >
            Crear materia
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card padding="md">
            <p className="text-sm text-muted">Materias activas</p>
            <p className="mt-2 text-3xl font-bold text-content">
              {activeSubjects}
            </p>
          </Card>

          <Card padding="md">
            <p className="text-sm text-muted">Promedio general</p>
            <p className="mt-2 text-3xl font-bold text-content">
              {globalAverage}
            </p>
          </Card>

          <Card padding="md">
            <p className="text-sm text-muted">Dificultad alta</p>
            <p className="mt-2 text-3xl font-bold text-content">
              {highDifficultySubjects}
            </p>
          </Card>
        </div>

        {feedbackMessage && (
          <Alert
            variant="success"
            title="Operación completada"
            onClose={() => setFeedbackMessage("")}
          >
            {feedbackMessage}
          </Alert>
        )}

        {integrityMessage && (
          <Alert
            variant="warning"
            title="Revisión de integridad"
            onClose={() => setIntegrityMessage("")}
          >
            {integrityMessage}
          </Alert>
        )}

        <SubjectFilters
          filters={filters}
          programs={programs}
          totalResults={filteredSubjects.length}
          onChange={updateFilters}
          onReset={() => updateFilters(defaultFilters)}
        />

        {filteredSubjects.length === 0 ? (
          <EmptyState
            title="No hay materias para mostrar"
            description="Ajusta la búsqueda o los filtros para consultar otras materias."
            icon="i"
            action={
              <Button
                variant="outline"
                onClick={() => updateFilters(defaultFilters)}
              >
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <>
            <SubjectTable
              subjects={paginatedSubjects}
              onEdit={(subject) => {
                setEditingSubject(subject);
                setSubjectModalMode("edit");
              }}
              onToggleStatus={setPendingToggleSubject}
              onOpenAssignments={setAssignmentsSubject}
              onOpenResult={setResultSubject}
              onOpenHistory={setHistorySubject}
            />

            <SubjectCards
              subjects={paginatedSubjects}
              onEdit={(subject) => {
                setEditingSubject(subject);
                setSubjectModalMode("edit");
              }}
              onToggleStatus={setPendingToggleSubject}
              onOpenAssignments={setAssignmentsSubject}
              onOpenResult={setResultSubject}
              onOpenHistory={setHistorySubject}
            />

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              className="pt-2"
            />
          </>
        )}
      </div>

      {subjectModalMode && (
        <SubjectFormModal
          key={`${subjectModalMode}-${editingSubject?.id ?? "new"}`}
          isOpen
          subjects={subjectList}
          subject={editingSubject}
          onClose={closeSubjectModal}
          onSubmit={(formData) => {
            if (subjectModalMode === "create") {
              handleCreateSubject(formData);
              return;
            }

            if (editingSubject) {
              handleUpdateSubject(
                editingSubject.id,
                formData,
              );
            }
          }}
        />
      )}

      {resultSubject && (
        <ResultFormModal
          key={resultSubject.id}
          isOpen
          subject={resultSubject}
          assignments={assignmentList.filter(
            (assignment) =>
              assignment.subjectId === resultSubject.id,
          )}
          results={resultList.filter(
            (result) =>
              result.subjectId === resultSubject.id,
          )}
          onClose={() => setResultSubject(null)}
          onSubmit={handleUpsertResult}
        />
      )}

      {assignmentsSubject && (
        <AssignmentsModal
          isOpen
          subject={assignmentsSubject}
          assignments={assignmentList.filter(
            (assignment) =>
              assignment.subjectId === assignmentsSubject.id,
          )}
          onClose={() => setAssignmentsSubject(null)}
        />
      )}

      {historySubject && (
        <HistoryModal
          isOpen
          subject={historySubject}
          history={historyList.filter(
            (entry) => entry.subjectId === historySubject.id,
          )}
          onClose={() => setHistorySubject(null)}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingToggleSubject)}
        title={
          pendingToggleSubject?.status === "active"
            ? "Desactivar materia"
            : "Activar materia"
        }
        description={
          pendingToggleSubject ? (
            <div className="space-y-3">
              <p>
                Esta acción cambiará el estado de{" "}
                <span className="font-semibold text-content">
                  {pendingToggleSubject.name}
                </span>
                .
              </p>
              <p>
                Tiene {pendingToggleSubject.assignmentsCount} asignaciones y{" "}
                {pendingToggleSubject.resultsCount} resultados asociados. La
                información se conservará para consulta e historial.
              </p>
            </div>
          ) : (
            ""
          )
        }
        confirmText={
          pendingToggleSubject?.status === "active"
            ? "Desactivar"
            : "Activar"
        }
        danger={pendingToggleSubject?.status === "active"}
        onCancel={() => setPendingToggleSubject(null)}
        onConfirm={confirmToggleStatus}
      />
    </main>
  );
};

export default AdminAcademicManagement;
