import {
  useState,
  type FormEvent,
} from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";

import {
  academicPeriodOptions,
  resultStatusOptions,
} from "../../data/adminAcademic.options";
import type {
  AcademicResult,
  AdminSubject,
  ResultFormData,
  ResultFormErrors,
  ResultStatus,
  SubjectAssignment,
} from "../../types/adminAcademic.types";

interface ResultFormModalProps {
  isOpen: boolean;
  subject: AdminSubject;
  assignments: SubjectAssignment[];
  results: AcademicResult[];
  onClose: () => void;
  onSubmit: (data: ResultFormData) => void;
}

const createInitialFormData = (
  subjectId: string,
): ResultFormData => ({
  subjectId,
  studentName: "",
  studentCode: "",
  period: "2026-1",
  score: "",
  status: "pending",
  note: "",
});

const validateResultForm = (
  data: ResultFormData,
) => {
  const errors: ResultFormErrors = {};

  if (!data.studentName.trim()) {
    errors.studentName =
      "El nombre del estudiante es requerido.";
  }

  if (!data.studentCode.trim()) {
    errors.studentCode =
      "El código del estudiante es requerido.";
  }

  if (!data.period.trim()) {
    errors.period = "El periodo académico es requerido.";
  }

  if (
    data.score === "" ||
    data.score < 0 ||
    data.score > 100
  ) {
    errors.score =
      "La calificación debe estar entre 0 y 100.";
  }

  return errors;
};

const ResultFormModal = ({
  isOpen,
  subject,
  assignments,
  results,
  onClose,
  onSubmit,
}: ResultFormModalProps) => {
  const [formData, setFormData] =
    useState<ResultFormData>(() =>
      createInitialFormData(subject.id),
    );
  const [selectedAssignmentId, setSelectedAssignmentId] =
    useState("");
  const [errors, setErrors] =
    useState<ResultFormErrors>({});

  const existingResult = results.find(
    (result) =>
      result.subjectId === subject.id &&
      result.studentCode.trim().toLowerCase() ===
        formData.studentCode.trim().toLowerCase() &&
      result.period === formData.period,
  );

  const updateField = <Field extends keyof ResultFormData>(
    field: Field,
    value: ResultFormData[Field],
  ) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleAssignmentChange = (
    assignmentId: string,
  ) => {
    setSelectedAssignmentId(assignmentId);

    const selectedAssignment = assignments.find(
      (assignment) => assignment.id === assignmentId,
    );

    if (!selectedAssignment) {
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      studentName: selectedAssignment.studentName,
      studentCode: selectedAssignment.studentCode,
    }));
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const nextErrors = validateResultForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      ...formData,
      studentName: formData.studentName.trim(),
      studentCode: formData.studentCode.trim(),
      period: formData.period.trim(),
      note: formData.note.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`Resultado académico: ${subject.name}`}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <Button type="submit" form="result-form">
            {existingResult
              ? "Actualizar resultado"
              : "Registrar resultado"}
          </Button>
        </>
      }
    >
      <form
        id="result-form"
        className="space-y-5"
        onSubmit={handleSubmit}
      >
        {existingResult && (
          <Alert
            variant="info"
            title="Resultado existente"
          >
            Ya existe un resultado para este estudiante en el periodo
            seleccionado. Al guardar, se actualizará visualmente el registro.
          </Alert>
        )}

        {assignments.length > 0 && (
          <Select
            label="Estudiante asignado"
            value={selectedAssignmentId}
            helperText="Selecciona una asignación para completar los datos del estudiante."
            onChange={(event) =>
              handleAssignmentChange(event.target.value)
            }
          >
            <option value="">
              Seleccionar manualmente
            </option>
            {assignments.map((assignment) => (
              <option
                key={assignment.id}
                value={assignment.id}
              >
                {assignment.studentName} - {assignment.studentCode}
              </option>
            ))}
          </Select>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Estudiante"
            value={formData.studentName}
            error={errors.studentName}
            required
            onChange={(event) =>
              updateField(
                "studentName",
                event.target.value,
              )
            }
          />

          <Input
            label="Código del estudiante"
            value={formData.studentCode}
            error={errors.studentCode}
            required
            onChange={(event) =>
              updateField(
                "studentCode",
                event.target.value,
              )
            }
          />

          <Select
            label="Periodo"
            value={formData.period}
            error={errors.period}
            required
            onChange={(event) =>
              updateField("period", event.target.value)
            }
          >
            {academicPeriodOptions.map((periodOption) => (
              <option
                key={periodOption.value}
                value={periodOption.value}
              >
                {periodOption.label}
              </option>
            ))}
          </Select>

          <Input
            label="Calificación"
            type="number"
            min={0}
            max={100}
            value={
              formData.score === ""
                ? ""
                : String(formData.score)
            }
            error={errors.score}
            required
            onChange={(event) =>
              updateField(
                "score",
                event.target.value === ""
                  ? ""
                  : Number(event.target.value),
              )
            }
          />

          <Select
            label="Estado del resultado"
            value={formData.status}
            onChange={(event) =>
              updateField(
                "status",
                event.target.value as ResultStatus,
              )
            }
          >
            {resultStatusOptions.map((statusOption) => (
              <option
                key={statusOption.value}
                value={statusOption.value}
              >
                {statusOption.label}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          label="Observación"
          value={formData.note}
          helperText="Describe cualquier condición académica relevante."
          onChange={(event) =>
            updateField("note", event.target.value)
          }
        />
      </form>
    </Modal>
  );
};

export default ResultFormModal;
