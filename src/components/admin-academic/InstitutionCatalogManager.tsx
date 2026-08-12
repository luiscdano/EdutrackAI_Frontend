import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { createAdminSubject } from "../../services/admin-academic.service";
import {
  createManagedCatalogSubject,
  createManagedInstitution,
  createManagedProgram,
  getManagedAcademicCatalog,
  type ManagedInstitution,
} from "../../services/admin-managed-catalog.service";
import { getAcademicCatalog } from "../../services/student-context.service";
import type { AdminSubject, SubjectFormData } from "../../types/adminAcademic.types";
import type { CatalogSubject, InstitutionCatalog } from "../../types/student-context.types";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface InstitutionCatalogManagerProps {
  operationalSubjects: AdminSubject[];
  onRefresh: () => Promise<void> | void;
}

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const InstitutionCatalogManager = ({ operationalSubjects, onRefresh }: InstitutionCatalogManagerProps) => {
  const [catalog, setCatalog] = useState<InstitutionCatalog[]>([]);
  const [managed, setManaged] = useState<ManagedInstitution[]>([]);
  const [institutionKey, setInstitutionKey] = useState("");
  const [programKey, setProgramKey] = useState("");
  const [period, setPeriod] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [managedInstitutionId, setManagedInstitutionId] = useState("");
  const [managedProgramId, setManagedProgramId] = useState("");
  const [savingManaged, setSavingManaged] = useState(false);
  const [institutionForm, setInstitutionForm] = useState({
    name: "",
    shortName: "",
    country: "República Dominicana",
    websiteUrl: "",
  });
  const [programForm, setProgramForm] = useState({
    name: "",
    degreeType: "Programa académico",
    periods: 4,
    totalCredits: 0,
    sourceUrl: "",
  });
  const [subjectForm, setSubjectForm] = useState({
    code: "",
    name: "",
    period: 1,
    credits: 3,
  });

  const loadCatalogs = useCallback(async () => {
    setLoading(true);
    try {
      const [publicCatalog, managedCatalog] = await Promise.all([
        getAcademicCatalog(),
        getManagedAcademicCatalog(),
      ]);
      setCatalog(publicCatalog);
      setManaged(managedCatalog);

      const firstInstitution = publicCatalog[0];
      const firstProgram = firstInstitution?.programs[0];
      setInstitutionKey((current) => current || firstInstitution?.key || "");
      setProgramKey((current) => current || firstProgram?.key || "");

      const firstManagedInstitution = managedCatalog[0];
      const firstManagedProgram = firstManagedInstitution?.programs[0];
      setManagedInstitutionId((current) =>
        current && managedCatalog.some((item) => item.id === current)
          ? current
          : firstManagedInstitution?.id ?? "",
      );
      setManagedProgramId((current) =>
        current && managedCatalog.some((item) => item.programs.some((program) => program.id === current))
          ? current
          : firstManagedProgram?.id ?? "",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible cargar el catálogo académico.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  const institution = useMemo(
    () => catalog.find((item) => item.key === institutionKey) ?? null,
    [catalog, institutionKey],
  );

  const program = useMemo(
    () => institution?.programs.find((item) => item.key === programKey) ?? null,
    [institution, programKey],
  );

  const managedInstitution = useMemo(
    () => managed.find((item) => item.id === managedInstitutionId) ?? null,
    [managed, managedInstitutionId],
  );

  const managedProgram = useMemo(
    () => managedInstitution?.programs.find((item) => item.id === managedProgramId) ?? null,
    [managedInstitution, managedProgramId],
  );

  const existingNames = useMemo(
    () => new Set(operationalSubjects.map((item) => normalize(item.name))),
    [operationalSubjects],
  );

  const visibleSubjects = useMemo(() => {
    const query = normalize(search);
    return (program?.subjects ?? []).filter((subject) => {
      const matchesPeriod = period === "all" || subject.period === period;
      const matchesSearch = !query || normalize(`${subject.code ?? ""} ${subject.name}`).includes(query);
      return matchesPeriod && matchesSearch;
    });
  }, [period, program, search]);

  const isExisting = (subject: CatalogSubject) => existingNames.has(normalize(subject.name));

  const toggle = (key: string) => {
    setSelectedKeys((current) => current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key]);
  };

  const selectVisible = () => {
    const available = visibleSubjects.filter((subject) => !isExisting(subject)).map((subject) => subject.key);
    setSelectedKeys((current) => Array.from(new Set([...current, ...available])));
  };

  const syncSelected = async () => {
    if (!institution || !program || selectedKeys.length === 0) return;
    const selected = program.subjects.filter((subject) => selectedKeys.includes(subject.key) && !isExisting(subject));
    if (selected.length === 0) {
      setMessage("Las materias seleccionadas ya están disponibles en el catálogo operativo.");
      return;
    }

    setSyncing(true);
    setMessage(null);
    try {
      let created = 0;
      for (const subject of selected) {
        const payload: SubjectFormData = {
          code: subject.code ?? subject.key,
          name: subject.name,
          program: `${institution.shortName} · ${program.name}`,
          semester: subject.period,
          credits: subject.credits,
          difficulty: "medium",
          status: "active",
        };
        await createAdminSubject(payload);
        created += 1;
      }
      setSelectedKeys([]);
      setMessage(`${created} materia${created === 1 ? "" : "s"} sincronizada${created === 1 ? "" : "s"}. Ya puedes crear evaluaciones, recursos y quizzes para ellas.`);
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible sincronizar las materias seleccionadas.");
    } finally {
      setSyncing(false);
    }
  };

  const submitInstitution = async (event: FormEvent) => {
    event.preventDefault();
    setSavingManaged(true);
    setMessage(null);
    try {
      const next = await createManagedInstitution({
        name: institutionForm.name.trim(),
        shortName: institutionForm.shortName.trim(),
        country: institutionForm.country.trim(),
        websiteUrl: institutionForm.websiteUrl.trim() || undefined,
      });
      setManaged(next);
      const created = next[next.length - 1] ?? next.find((item) => item.name === institutionForm.name.trim());
      if (created) {
        setManagedInstitutionId(created.id);
        setManagedProgramId(created.programs[0]?.id ?? "");
      }
      setInstitutionForm({ name: "", shortName: "", country: "República Dominicana", websiteUrl: "" });
      setMessage("Institución creada. Ahora puedes agregarle una o varias carreras.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible crear la institución.");
    } finally {
      setSavingManaged(false);
    }
  };

  const submitProgram = async (event: FormEvent) => {
    event.preventDefault();
    if (!managedInstitutionId) {
      setMessage("Primero crea o selecciona una institución administrable.");
      return;
    }
    setSavingManaged(true);
    setMessage(null);
    try {
      const next = await createManagedProgram(managedInstitutionId, {
        name: programForm.name.trim(),
        degreeType: programForm.degreeType.trim(),
        periods: programForm.periods,
        totalCredits: programForm.totalCredits,
        sourceUrl: programForm.sourceUrl.trim() || undefined,
      });
      setManaged(next);
      const parent = next.find((item) => item.id === managedInstitutionId);
      const created = parent?.programs.find((item) => item.name === programForm.name.trim());
      if (created) setManagedProgramId(created.id);
      setProgramForm({ name: "", degreeType: "Programa académico", periods: 4, totalCredits: 0, sourceUrl: "" });
      setMessage("Carrera creada. Agrega sus materias para que pueda aparecer en registro y onboarding.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible crear la carrera.");
    } finally {
      setSavingManaged(false);
    }
  };

  const submitManagedSubject = async (event: FormEvent) => {
    event.preventDefault();
    if (!managedProgramId) {
      setMessage("Primero crea o selecciona una carrera administrable.");
      return;
    }
    setSavingManaged(true);
    setMessage(null);
    try {
      const next = await createManagedCatalogSubject(managedProgramId, {
        code: subjectForm.code.trim() || undefined,
        name: subjectForm.name.trim(),
        period: subjectForm.period,
        credits: subjectForm.credits,
      });
      setManaged(next);
      setSubjectForm({ code: "", name: "", period: 1, credits: 3 });
      setMessage("Materia agregada al pensum. La carrera ya puede formar parte del catálogo de estudiantes cuando tenga materias activas.");
      const publicCatalog = await getAcademicCatalog();
      setCatalog(publicCatalog);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible agregar la materia al pensum.");
    } finally {
      setSavingManaged(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card padding="lg" className="border-primary/25">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="prototype-eyebrow">Catálogo académico</span>
            <h2 className="mt-1 text-2xl font-bold text-content">Instituciones, carreras y materias</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              El administrador decide qué materias del pensum pasan al catálogo operativo para evaluaciones, recursos y quizzes.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            {operationalSubjects.length} materias operativas
          </span>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-content">{message}</div>
        )}

        <section className="mt-6 rounded-2xl border border-border p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 text-xs font-semibold text-muted">
              Institución
              <select
                value={institutionKey}
                disabled={loading}
                onChange={(event) => {
                  const key = event.target.value;
                  const next = catalog.find((item) => item.key === key);
                  setInstitutionKey(key);
                  setProgramKey(next?.programs[0]?.key ?? "");
                  setSelectedKeys([]);
                  setPeriod("all");
                }}
                className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content"
              >
                {catalog.map((item) => <option key={item.key} value={item.key}>{item.shortName} · {item.name}</option>)}
              </select>
            </label>

            <label className="grid gap-2 text-xs font-semibold text-muted">
              Carrera / programa
              <select
                value={programKey}
                onChange={(event) => { setProgramKey(event.target.value); setSelectedKeys([]); setPeriod("all"); }}
                className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content"
              >
                {institution?.programs.map((item) => <option key={item.key} value={item.key}>{item.name}</option>)}
              </select>
            </label>

            <label className="grid gap-2 text-xs font-semibold text-muted">
              Período
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value === "all" ? "all" : Number(event.target.value))}
                className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content"
              >
                <option value="all">Todos</option>
                {Array.from({ length: program?.periods ?? 0 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>Período {value}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label className="grid flex-1 gap-2 text-xs font-semibold text-muted">
              Buscar materia
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ej. Programación Web, TDS-011" className="min-h-11 rounded-control border border-border bg-app-bg px-4 text-sm text-content" />
            </label>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={selectVisible}>Seleccionar visibles</Button>
              <Button size="sm" loading={syncing} disabled={selectedKeys.length === 0} onClick={() => void syncSelected()}>
                Sincronizar {selectedKeys.length || ""}
              </Button>
            </div>
          </div>

          {program && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{program.degreeType}</span><span>·</span><span>{program.periods} períodos</span><span>·</span><span>{program.totalCredits} créditos</span>
              {program.sourceUrl && <a href={program.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">Fuente del pensum</a>}
            </div>
          )}

          <div className="mt-4 max-h-[430px] space-y-2 overflow-y-auto pr-1">
            {visibleSubjects.map((subject) => {
              const existing = isExisting(subject);
              const selected = selectedKeys.includes(subject.key);
              return (
                <button
                  key={subject.key}
                  type="button"
                  disabled={existing}
                  onClick={() => toggle(subject.key)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${existing ? "border-success/25 bg-success/8 opacity-75" : selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/35"}`}
                >
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-bold ${existing ? "border-success text-success" : selected ? "border-primary bg-primary text-white" : "border-border"}`}>
                    {existing ? "✓" : selected ? "✓" : ""}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm text-content">{subject.name}</strong>
                    <span className="mt-1 block text-xs text-muted">{subject.code ?? "Electiva"} · Período {subject.period} · {subject.credits} créditos</span>
                  </span>
                  {existing && <span className="text-[10px] font-bold uppercase tracking-wide text-success">Disponible</span>}
                </button>
              );
            })}
            {!loading && visibleSubjects.length === 0 && <p className="py-8 text-center text-sm text-muted">No hay materias con esos filtros.</p>}
          </div>
        </section>
      </Card>

      <Card padding="lg" className="border-primary/25">
        <div className="max-w-3xl">
          <span className="prototype-eyebrow">Administrar catálogo</span>
          <h2 className="mt-1 text-2xl font-bold text-content">Crear universidad → carrera → pensum</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Esto sí crea estructura académica persistente. Cuando una carrera tiene al menos una materia, aparece automáticamente en el registro y onboarding del estudiante.
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <form onSubmit={(event) => void submitInstitution(event)} className="rounded-2xl border border-border p-4">
            <span className="text-xs font-bold text-primary">1 · Institución</span>
            <h3 className="mt-1 font-bold text-content">Agregar universidad o instituto</h3>
            <div className="mt-4 grid gap-3">
              <input required value={institutionForm.name} onChange={(event) => setInstitutionForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre completo" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              <input required value={institutionForm.shortName} onChange={(event) => setInstitutionForm((current) => ({ ...current, shortName: event.target.value }))} placeholder="Siglas, ej. UASD" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              <input required value={institutionForm.country} onChange={(event) => setInstitutionForm((current) => ({ ...current, country: event.target.value }))} placeholder="País" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              <input value={institutionForm.websiteUrl} onChange={(event) => setInstitutionForm((current) => ({ ...current, websiteUrl: event.target.value }))} placeholder="Sitio web (opcional)" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              <Button type="submit" loading={savingManaged}>Crear institución</Button>
            </div>
          </form>

          <form onSubmit={(event) => void submitProgram(event)} className="rounded-2xl border border-border p-4">
            <span className="text-xs font-bold text-primary">2 · Carrera</span>
            <h3 className="mt-1 font-bold text-content">Agregar programa académico</h3>
            <div className="mt-4 grid gap-3">
              <select
                value={managedInstitutionId}
                onChange={(event) => {
                  const id = event.target.value;
                  const next = managed.find((item) => item.id === id);
                  setManagedInstitutionId(id);
                  setManagedProgramId(next?.programs[0]?.id ?? "");
                }}
                className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content"
              >
                <option value="">Selecciona institución</option>
                {managed.map((item) => <option key={item.id} value={item.id}>{item.shortName} · {item.name}</option>)}
              </select>
              <input required value={programForm.name} onChange={(event) => setProgramForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre de la carrera" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              <input required value={programForm.degreeType} onChange={(event) => setProgramForm((current) => ({ ...current, degreeType: event.target.value }))} placeholder="Tipo de título" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min={1} max={20} value={programForm.periods} onChange={(event) => setProgramForm((current) => ({ ...current, periods: Number(event.target.value) }))} aria-label="Cantidad de períodos" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
                <input type="number" min={0} max={400} value={programForm.totalCredits} onChange={(event) => setProgramForm((current) => ({ ...current, totalCredits: Number(event.target.value) }))} aria-label="Créditos totales" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              </div>
              <input value={programForm.sourceUrl} onChange={(event) => setProgramForm((current) => ({ ...current, sourceUrl: event.target.value }))} placeholder="Fuente del pensum (opcional)" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              <Button type="submit" loading={savingManaged} disabled={!managedInstitutionId}>Crear carrera</Button>
            </div>
          </form>

          <form onSubmit={(event) => void submitManagedSubject(event)} className="rounded-2xl border border-border p-4">
            <span className="text-xs font-bold text-primary">3 · Materia</span>
            <h3 className="mt-1 font-bold text-content">Construir el pensum</h3>
            <div className="mt-4 grid gap-3">
              <select
                value={managedProgramId}
                onChange={(event) => setManagedProgramId(event.target.value)}
                className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content"
              >
                <option value="">Selecciona carrera</option>
                {managedInstitution?.programs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <input required value={subjectForm.name} onChange={(event) => setSubjectForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre de la materia" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              <input value={subjectForm.code} onChange={(event) => setSubjectForm((current) => ({ ...current, code: event.target.value }))} placeholder="Código (opcional)" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min={1} max={managedProgram?.periods ?? 20} value={subjectForm.period} onChange={(event) => setSubjectForm((current) => ({ ...current, period: Number(event.target.value) }))} aria-label="Período de la materia" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
                <input type="number" min={0} max={30} value={subjectForm.credits} onChange={(event) => setSubjectForm((current) => ({ ...current, credits: Number(event.target.value) }))} aria-label="Créditos de la materia" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              </div>
              <Button type="submit" loading={savingManaged} disabled={!managedProgramId}>Agregar materia</Button>
            </div>
          </form>
        </div>

        <div className="mt-6 rounded-2xl bg-surface-muted/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong className="text-sm text-content">Catálogos creados desde Admin</strong>
              <p className="mt-1 text-xs text-muted">{managed.length} instituciones · {managed.reduce((total, item) => total + item.programs.length, 0)} carreras · {managed.reduce((total, item) => total + item.programs.reduce((sum, programItem) => sum + programItem.subjects.length, 0), 0)} materias</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => void loadCatalogs()}>Actualizar</Button>
          </div>
          {managed.length > 0 && (
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {managed.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-surface p-3">
                  <strong className="block text-sm text-content">{item.shortName} · {item.name}</strong>
                  <span className="mt-1 block text-xs text-muted">{item.programs.length} carrera{item.programs.length === 1 ? "" : "s"}</span>
                  <div className="mt-2 space-y-1">
                    {item.programs.map((programItem) => (
                      <p key={programItem.id} className="text-xs text-muted">• {programItem.name} · {programItem.subjects.length} materias</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InstitutionCatalogManager;
