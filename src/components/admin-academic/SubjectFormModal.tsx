import {
  useState,
  type FormEvent,
} from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Select from "../ui/Select";

import {
  subjectDifficultyOptions,
  subjectStatusOptions,
} from "../../data/adminAcademic.options";
import type {
  AdminSubject,
  SubjectDifficulty,
  SubjectFormData,
  SubjectFormErrors,
  SubjectStatus,
} from "../../types/adminAcademic.types";

interface SubjectFormModalProps {
  isOpen: boolean;
  subjects: AdminSubject[];
  subject?: AdminSubject | null;
  onClose: () => void;
  onSubmit: (data: SubjectFormData) => void;
}

const emptySubjectForm: SubjectFormData = {
  code: "",
  name: "",
  program: "",
  semester: "",
  credits: "",
  difficulty: "medium",
  status: "active",
};

const createFormData = (
  subject?: AdminSubject | null,
): SubjectFormData => {
  if (!subject) {
    return emptySubjectForm;
  }

  return {
    code: subject.code,
    name: subject.name,
    program: subject.program,
    semester: subject.semester,
    credits: subject.credits,
    difficulty: subject.difficulty,
    status: subject.status,
  };
};

const normalizeValue = (value: string) =>
  value.trim().toLowerCase();

const validateSubjectForm = (
  data: SubjectFormData,
) => {
  const errors: SubjectFormErrors = {};

  if (!data.code.trim()) {
    errors.code = "El código de la materia es requerido.";
  }

  if (!data.name.trim()) {
    errors.name = "El nombre de la materia es requerido.";
  }

  if (!data.program.trim()) {
    errors.program = "El programa académico es requerido.";
  }

  if (
    data.semester === "" ||
    data.semester < 1 ||
    data.semester > 12
  ) {
    errors.semester =
      "El semestre debe estar entre 1 y 12.";
  }

  if (
    data.credits === "" ||
    data.credits < 1 ||
    data.credits > 8
  ) {
    errors.credits =
      "Los créditos deben estar entre 1 y 8.";
  }

  return errors;
};

const SubjectFormModal = ({
  isOpen,
  subjects,
  subject,
  onClose,
  onSubmit,
}: SubjectFormModalProps) => {
  const [formData, setFormData] =
    useState<SubjectFormData>(() =>
      createFormData(subject),
    );
  const [errors, setErrors] =
    useState<SubjectFormErrors>({});

  const duplicateSubject = subjects.find(
    (currentSubject) => {
      if (currentSubject.id === subject?.id) {
        return false;
      }

      const sameCode =
        normalizeValue(currentSubject.code) ===
        normalizeValue(formData.code);

      const sameNameInProgram =
        normalizeValue(currentSubject.name) ===
          normalizeValue(formData.name) &&
        normalizeValue(currentSubject.program) ===
          normalizeValue(formData.program);

      return sameCode || sameNameInProgram;
    },
  );

  const updateField = <Field extends keyof SubjectFormData>(
    field: Field,
    value: SubjectFormData[Field],
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

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const nextErrors =
      validateSubjectForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (duplicateSubject) {
      return;
    }

    onSubmit({
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      program: formData.program.trim(),
    });
  };

  const modalTitle = subject
    ? "Editar materia"
    : "Crear materia";

  return (
    <Modal
      isOpen={isOpen}
      title={modalTitle}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            type="submit"
            form="subject-form"
            disabled={Boolean(duplicateSubject)}
          >
            {subject ? "Guardar cambios" : "Crear materia"}
          </Button>
        </>
      }
    >
      <form
        id="subject-form"
        className="space-y-5"
        onSubmit={handleSubmit}
      >
        {duplicateSubject && (
          <Alert
            variant="warning"
            title="Materia duplicada"
          >
            Ya existe una materia con ese código o con el mismo nombre
            dentro del programa seleccionado. Ajusta los datos antes de
            guardar.
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Código"
            value={formData.code}
            error={errors.code}
            helperText="Ejemplo: PRO-101"
            required
            onChange={(event) =>
              updateField("code", event.target.value)
            }
          />

          <Input
            label="Nombre"
            value={formData.name}
            error={errors.name}
            required
            onChange={(event) =>
              updateField("name", event.target.value)
            }
          />

          <Input
            label="Programa"
            value={formData.program}
            error={errors.program}
            required
            onChange={(event) =>
              updateField("program", event.target.value)
            }
          />

          <Select
            label="Dificultad"
            value={formData.difficulty}
            onChange={(event) =>
              updateField(
                "difficulty",
                event.target.value as SubjectDifficulty,
              )
            }
          >
            {subjectDifficultyOptions.map(
              (difficultyOption) => (
                <option
                  key={difficultyOption.value}
                  value={difficultyOption.value}
                >
                  {difficultyOption.label}
                </option>
              ),
            )}
          </Select>

          <Input
            label="Semestre"
            type="number"
            min={1}
            max={12}
            value={
              formData.semester === ""
                ? ""
                : String(formData.semester)
            }
            error={errors.semester}
            required
            onChange={(event) =>
              updateField(
                "semester",
                event.target.value === ""
                  ? ""
                  : Number(event.target.value),
              )
            }
          />

          <Input
            label="Créditos"
            type="number"
            min={1}
            max={8}
            value={
              formData.credits === ""
                ? ""
                : String(formData.credits)
            }
            error={errors.credits}
            required
            onChange={(event) =>
              updateField(
                "credits",
                event.target.value === ""
                  ? ""
                  : Number(event.target.value),
              )
            }
          />

          <Select
            label="Estado"
            value={formData.status}
            onChange={(event) =>
              updateField(
                "status",
                event.target.value as SubjectStatus,
              )
            }
          >
            {subjectStatusOptions.map((statusOption) => (
              <option
                key={statusOption.value}
                value={statusOption.value}
              >
                {statusOption.label}
              </option>
            ))}
          </Select>
        </div>
      </form>
    </Modal>
  );
};

export default SubjectFormModal;
