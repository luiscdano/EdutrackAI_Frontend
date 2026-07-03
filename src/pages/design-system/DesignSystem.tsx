import {
  useState,
  type ReactNode,
} from "react";

import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Checkbox from "../../components/ui/Checkbox";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Dropdown, {
  DropdownItem,
} from "../../components/ui/Dropdown";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import PasswordInput from "../../components/ui/PasswordInput";
import Radio from "../../components/ui/Radio";
import Select from "../../components/ui/Select";
import Skeleton from "../../components/ui/Skeleton";
import Tabs from "../../components/ui/Tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import Textarea from "../../components/ui/Textarea";
import Toast from "../../components/ui/Toast";
import Tooltip from "../../components/ui/Tooltip";

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const Section = ({
  title,
  description,
  children,
}: SectionProps) => {
  return (
    <Card
      variant="bordered"
      padding="md"
      className="space-y-5"
    >
      <div>
        <h2 className="text-xl font-semibold text-content">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-muted">
            {description}
          </p>
        )}
      </div>

      {children}
    </Card>
  );
};

const DesignSystem = () => {
  const [page, setPage] = useState(3);
  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [isConfirmOpen, setIsConfirmOpen] =
    useState(false);
  const [isToastOpen, setIsToastOpen] =
    useState(false);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-app-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              EduTrack AI
            </p>

            <h1 className="mt-2 text-3xl font-bold text-content sm:text-4xl">
              Sistema de diseño
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Galería temporal para revisar los componentes,
              variantes, estados y comportamiento responsive.
            </p>
          </div>

          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-control border border-border bg-surface px-4 text-sm font-semibold text-content transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Volver al Login
          </a>
        </header>

        <Section
          title="Botones"
          description="Variantes, tamaños y estados."
        >
          <div className="flex flex-wrap gap-3">
            <Button>
              Primario
            </Button>

            <Button variant="secondary">
              Secundario
            </Button>

            <Button variant="outline">
              Outline
            </Button>

            <Button variant="ghost">
              Ghost
            </Button>

            <Button variant="danger">
              Eliminar
            </Button>

            <Button loading>
              Guardando
            </Button>

            <Button disabled>
              Deshabilitado
            </Button>
          </div>
        </Section>

        <Section
          title="Formularios"
          description="Campos normales, obligatorios, auxiliares y con error."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Nombre completo"
              placeholder="Escribe el nombre"
              required
            />

            <Input
              label="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              helperText="Utiliza un correo institucional."
            />

            <Input
              label="Matrícula"
              placeholder="2026-0001"
              error="La matrícula introducida no es válida."
            />

            <PasswordInput
              label="Contraseña"
              helperText="Debe tener al menos ocho caracteres."
            />

            <Select
              label="Rol"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Selecciona un rol
              </option>

              <option value="student">
                Estudiante
              </option>

              <option value="teacher">
                Docente
              </option>

              <option value="admin">
                Administrador
              </option>
            </Select>

            <Textarea
              label="Descripción"
              placeholder="Escribe una descripción"
              helperText="Máximo 500 caracteres."
              maxLength={500}
            />
          </div>
        </Section>

        <Section
          title="Selección"
          description="Checkbox, radios y estados deshabilitados."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Checkbox
                label="Recordarme"
                defaultChecked
              />

              <Checkbox
                label="Acepto los términos y condiciones"
                description="Debes aceptar los términos para continuar."
                required
              />

              <Checkbox
                label="Opción deshabilitada"
                disabled
              />
            </div>

            <div
              role="radiogroup"
              aria-labelledby="user-type-label"
              className="space-y-4"
            >
              <p
                id="user-type-label"
                className="text-sm font-medium text-content"
              >
                Tipo de usuario
              </p>

              <Radio
                name="user-type"
                value="student"
                label="Estudiante"
                defaultChecked
              />

              <Radio
                name="user-type"
                value="teacher"
                label="Docente"
              />

              <Radio
                name="user-type"
                value="admin"
                label="Administrador"
              />
            </div>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-3">
            <Badge>
              Inactivo
            </Badge>

            <Badge variant="primary">
              En progreso
            </Badge>

            <Badge variant="success">
              Aprobado
            </Badge>

            <Badge variant="warning">
              Pendiente
            </Badge>

            <Badge variant="danger">
              Rechazado
            </Badge>

            <Badge variant="info">
              Información
            </Badge>

            <Badge variant="outline">
              Borrador
            </Badge>
          </div>
        </Section>

        <Section
          title="Mensajes"
          description="Alertas informativas y de estado."
        >
          <div className="space-y-4">
            <Alert title="Información">
              Los cambios se guardarán automáticamente.
            </Alert>

            <Alert
              variant="success"
              title="Operación completada"
            >
              El registro fue creado correctamente.
            </Alert>

            <Alert
              variant="warning"
              title="Revisión necesaria"
            >
              Algunos campos todavía están incompletos.
            </Alert>

            <Alert
              variant="danger"
              title="No se pudo guardar"
            >
              Revisa los campos e intenta nuevamente.
            </Alert>
          </div>
        </Section>

        <Section title="Carga">
          <div className="flex flex-wrap items-center gap-8">
            <Loader size="sm" />

            <Loader
              size="md"
              label="Cargando"
              showLabel
            />

            <Loader
              size="lg"
              label="Cargando estudiantes"
              showLabel
            />
          </div>

          <div className="mt-6 max-w-md space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton
                variant="circular"
                className="h-12 w-12"
              />

              <div className="flex-1 space-y-2">
                <Skeleton
                  variant="text"
                  className="w-1/2"
                />

                <Skeleton
                  variant="text"
                  className="w-3/4"
                />
              </div>
            </div>

            <Skeleton className="h-28 w-full" />
          </div>
        </Section>

        <Section title="Estados de página">
          <div className="grid gap-5 lg:grid-cols-2">
            <EmptyState
              title="No hay estudiantes registrados"
              description="Cuando agregues estudiantes, aparecerán en esta sección."
              action={
                <Button>
                  Agregar estudiante
                </Button>
              }
            />

            <ErrorState
              title="No se pudieron cargar los datos"
              description="Comprueba tu conexión e intenta nuevamente."
              action={
                <Button variant="outline">
                  Reintentar
                </Button>
              }
            />
          </div>
        </Section>

        <Section
          title="Tabla y paginación"
          description="En pantallas pequeñas la tabla permite desplazamiento horizontal."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Nombre
                </TableHead>

                <TableHead>
                  Rol
                </TableHead>

                <TableHead>
                  Estado
                </TableHead>

                <TableHead>
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell>
                  Ana Martínez
                </TableCell>

                <TableCell>
                  Estudiante
                </TableCell>

                <TableCell>
                  <Badge variant="success">
                    Activo
                  </Badge>
                </TableCell>

                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    Ver
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  Carlos Pérez
                </TableCell>

                <TableCell>
                  Docente
                </TableCell>

                <TableCell>
                  <Badge variant="warning">
                    Pendiente
                  </Badge>
                </TableCell>

                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Pagination
            page={page}
            totalPages={10}
            onPageChange={setPage}
            className="mt-6"
          />
        </Section>

        <Section title="Pestañas">
          <Tabs
            items={[
              {
                value: "general",
                label: "Información general",
                content: (
                  <p className="text-sm text-muted">
                    Contenido de la información general.
                  </p>
                ),
              },
              {
                value: "academic",
                label: "Información académica",
                content: (
                  <p className="text-sm text-muted">
                    Contenido de la información académica.
                  </p>
                ),
              },
              {
                value: "history",
                label: "Historial",
                content: (
                  <p className="text-sm text-muted">
                    Historial de cambios del registro.
                  </p>
                ),
              },
              {
                value: "disabled",
                label: "Deshabilitada",
                content: null,
                disabled: true,
              },
            ]}
          />
        </Section>

        <Section title="Tooltip y Dropdown">
          <div className="flex flex-wrap items-center gap-4">
            <Tooltip content="Muestra información adicional">
              <Button variant="outline">
                Coloca el cursor aquí
              </Button>
            </Tooltip>

            <Dropdown trigger="Acciones">
              <DropdownItem>
                Ver detalles
              </DropdownItem>

              <DropdownItem>
                Editar
              </DropdownItem>

              <DropdownItem danger>
                Eliminar
              </DropdownItem>
            </Dropdown>
          </div>
        </Section>

        <Section title="Modal, confirmación y Toast">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
            >
              Abrir modal
            </Button>

            <Button
              variant="danger"
              onClick={() => setIsConfirmOpen(true)}
            >
              Abrir confirmación
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsToastOpen(true)}
            >
              Mostrar Toast
            </Button>
          </div>
        </Section>
      </div>

      <Modal
        isOpen={isModalOpen}
        title="Registrar estudiante"
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              onClick={() => {
                setIsModalOpen(false);
                setIsToastOpen(true);
              }}
            >
              Guardar
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label="Nombre"
            placeholder="Nombre del estudiante"
          />

          <Select
            label="Nivel"
            defaultValue=""
          >
            <option value="" disabled>
              Selecciona un nivel
            </option>

            <option value="primary">
              Primaria
            </option>

            <option value="secondary">
              Secundaria
            </option>
          </Select>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Eliminar estudiante"
        description="Esta acción eliminará el registro permanentemente."
        confirmText="Eliminar"
        danger
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          setIsToastOpen(true);
        }}
      />

      {isToastOpen && (
        <Toast
          variant="success"
          title="Operación completada"
          onClose={() => setIsToastOpen(false)}
        >
          Los cambios fueron procesados correctamente.
        </Toast>
      )}
    </main>
  );
};

export default DesignSystem;