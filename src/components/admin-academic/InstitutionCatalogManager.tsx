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

interface Props {
  operationalSubjects: AdminSubject[];
  onRefresh: () => Promise<void> | void;
}

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

const Field = ({ children }: { children: React.ReactNode }) => (
  <label className="grid gap-2 text-xs font-semibold text-muted">{children}</label>
);

const inputClass = "min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content";

const InstitutionCatalogManager = ({ operationalSubjects, onRefresh }: Props) => {
  const [catalog, setCatalog] = useState<InstitutionCatalog[]>([]);
  const [managed, setManaged] = useState<ManagedInstitution[]>([]);
  const [institutionKey, setInstitutionKey] = useState("");
  const [programKey, setProgramKey] = useState("");
  const [period, setPeriod] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [managedInstitutionId, setManagedInstitutionId] = useState("");
  const [managedProgramId, setManagedProgramId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [institutionForm, setInstitutionForm] = useState({ name: "", shortName: "", country: "República Dominicana", websiteUrl: "" });
  const [programForm, setProgramForm] = useState({ name: "", degreeType: "Programa académico", periods: 4, totalCredits: 0, sourceUrl: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", period: 1, credits: 3 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [publicCatalog, managedCatalog] = await Promise.all([getAcademicCatalog(), getManagedAcademicCatalog()]);
      setCatalog(publicCatalog);
      setManaged(managedCatalog);
      setInstitutionKey((current) => current || publicCatalog[0]?.key || "");
      setProgramKey((current) => current || publicCatalog[0]?.programs[0]?.key || "");
      setManagedInstitutionId((current) =>
        current && managedCatalog.some((item) => item.id === current) ? current : managedCatalog[0]?.id ?? "",
      );
      setManagedProgramId((current) =>
        current && managedCatalog.some((item) => item.programs.some((program) => program.id === current))
          ? current
          : managedCatalog[0]?.programs[0]?.id ?? "",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible cargar el catálogo académico.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const institution = useMemo(() => catalog.find((item) => item.key === institutionKey) ?? null, [catalog, institutionKey]);
  const program = useMemo(() => institution?.programs.find((item) => item.key === programKey) ?? null, [institution, programKey]);
  const managedInstitution = useMemo(() => managed.find((item) => item.id === managedInstitutionId) ?? null, [managed, managedInstitutionId]);
  const managedProgram = useMemo(() => managedInstitution?.programs.find((item) => item.id === managedProgramId) ?? null, [managedInstitution, managedProgramId]);
  const existingNames = useMemo(() => new Set(operationalSubjects.map((item) => normalize(item.name))), [operationalSubjects]);

  const visibleSubjects = useMemo(() => {
    const query = normalize(search);
    return (program?.subjects ?? []).filter((subject) =>
      (period === "all" || subject.period === period)
      && (!query || normalize(`${subject.code ?? ""} ${subject.name}`).includes(query)),
    );
  }, [period, program, search]);

  const isExisting = (subject: CatalogSubject) => existingNames.has(normalize(subject.name));
  const selectedManagedCount = managed.reduce(
    (total, item) => total + item.programs.reduce((programTotal, currentProgram) => programTotal + currentProgram.subjects.length, 0),
    0,
  );

  const selectInstitution = (key: string) => {
    const next = catalog.find((item) => item.key === key);
    setInstitutionKey(key);
    setProgramKey(next?.programs[0]?.key ?? "");
    setSelectedKeys([]);
    setPeriod("all");
  };

  const toggleSubject = (key: string) => {
    setSelectedKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  const syncSelected = async () => {
    if (!institution || !program) return;
    const selected = program.subjects.filter((subject) => selectedKeys.includes(subject.key) && !isExisting(subject));
    if (selected.length === 0) {
      setMessage("Selecciona al menos una materia que todavía no esté disponible.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
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
      }
      setSelectedKeys([]);
      setMessage(`${selected.length} materia${selected.length === 1 ? "" : "s"} sincronizada${selected.length === 1 ? "" : "s"}. Ya puedes crear quizzes, evaluaciones y recursos.`);
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible sincronizar las materias.");
    } finally {
      setBusy(false);
    }
  };

  const submitInstitution = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const next = await createManagedInstitution({
        name: institutionForm.name.trim(),
        shortName: institutionForm.shortName.trim(),
        country: institutionForm.country.trim(),
        websiteUrl: institutionForm.websiteUrl.trim() || undefined,
      });
      setManaged(next);
      const created = next.find((item) => item.name === institutionForm.name.trim()) ?? next[0];
      setManagedInstitutionId(created?.id ?? "");
      setManagedProgramId(created?.programs[0]?.id ?? "");
      setInstitutionForm({ name: "", shortName: "", country: "República Dominicana", websiteUrl: "" });
      setMessage("Institución creada. Ahora agrégale una carrera.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible crear la institución.");
    } finally {
      setBusy(false);
    }
  };

  const submitProgram = async (event: FormEvent) => {
    event.preventDefault();
    if (!managedInstitutionId) return setMessage("Primero crea o selecciona una institución.");
    setBusy(true);
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
      setManagedProgramId(parent?.programs.find((item) => item.name === programForm.name.trim())?.id ?? parent?.programs[0]?.id ?? "");
      setProgramForm({ name: "", degreeType: "Programa académico", periods: 4, totalCredits: 0, sourceUrl: "" });
      setMessage("Carrera creada. Agrega materias para publicar su pensum a los estudiantes.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible crear la carrera.");
    } finally {
      setBusy(false);
    }
  };

  const submitManagedSubject = async (event: FormEvent) => {
    event.preventDefault();
    if (!managedProgramId) return setMessage("Primero crea o selecciona una carrera.");
    setBusy(true);
    setMessage(null);
    try {
      const next = await createManagedCatalogSubject(managedProgramId, {
        name: subjectForm.name.trim(),
        code: subjectForm.code.trim() || undefined,
        period: subjectForm.period,
        credits: subjectForm.credits,
      });
      setManaged(next);
      setSubjectForm({ name: "", code: "", period: 1, credits: 3 });
      setCatalog(await getAcademicCatalog());
      setMessage("Materia agregada. La carrera ya aparece en registro/onboarding cuando tiene al menos una materia activa.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible agregar la materia.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card padding="lg" className="border-primary/25">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="prototype-eyebrow">Catálogo académico</span>
            <h2 className="mt-1 text-2xl font-bold text-content">Institución → carrera → período → materias</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">El Admin puede inspeccionar el pensum, elegir qué materias usar y sincronizarlas al catálogo operativo.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">{operationalSubjects.length} materias operativas</span>
        </div>

        {message && <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-content">{message}</div>}

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Field>Institución
            <select value={institutionKey} disabled={loading} onChange={(event) => selectInstitution(event.target.value)} className={inputClass}>
              {catalog.map((item) => <option key={item.key} value={item.key}>{item.shortName} · {item.name}</option>)}
            </select>
          </Field>
          <Field>Carrera
            <select value={programKey} onChange={(event) => { setProgramKey(event.target.value); setSelectedKeys([]); setPeriod("all"); }} className={inputClass}>
              {institution?.programs.map((item) => <option key={item.key} value={item.key}>{item.name}</option>)}
            </select>
          </Field>
          <Field>Período
            <select value={period} onChange={(event) => setPeriod(event.target.value === "all" ? "all" : Number(event.target.value))} className={inputClass}>
              <option value="all">Todos</option>
              {Array.from({ length: program?.periods ?? 0 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>Período {value}</option>)}
            </select>
          </Field>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field>Buscar materia
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Programación Web, TDS-011..." className={inputClass} />
          </Field>
          <Button size="sm" variant="outline" onClick={() => setSelectedKeys((current) => Array.from(new Set([...current, ...visibleSubjects.filter((subject) => !isExisting(subject)).map((subject) => subject.key)])))}>Seleccionar visibles</Button>
          <Button size="sm" loading={busy} disabled={selectedKeys.length === 0} onClick={() => void syncSelected()}>Sincronizar {selectedKeys.length || ""}</Button>
        </div>

        {program && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
            <span>{program.degreeType}</span><span>·</span><span>{program.periods} períodos</span><span>·</span><span>{program.totalCredits} créditos</span>
            {program.sourceUrl && <a href={program.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary">Fuente del pensum</a>}
          </div>
        )}

        <div className="mt-4 grid max-h-[430px] gap-2 overflow-y-auto md:grid-cols-2">
          {visibleSubjects.map((subject) => {
            const existing = isExisting(subject);
            const selected = selectedKeys.includes(subject.key);
            return (
              <button key={subject.key} type="button" disabled={existing} onClick={() => toggleSubject(subject.key)} className={`flex items-start gap-3 rounded-xl border p-3 text-left ${existing ? "border-success/25 bg-success/8" : selected ? "border-primary bg-primary/10" : "border-border"}`}>
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-bold ${existing ? "border-success text-success" : selected ? "border-primary bg-primary text-white" : "border-border"}`}>{existing || selected ? "✓" : ""}</span>
                <span><strong className="block text-sm text-content">{subject.name}</strong><small className="text-muted">{subject.code ?? "Electiva"} · P{subject.period} · {subject.credits} créditos</small></span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card padding="lg" className="border-primary/25">
        <span className="prototype-eyebrow">Administrar estructura académica</span>
        <h2 className="mt-1 text-2xl font-bold text-content">Crear universidad → carrera → pensum</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Estas entidades quedan guardadas en la base de datos. En cuanto una carrera tenga materias, pasa al catálogo usado por registro y onboarding.</p>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <form onSubmit={(event) => void submitInstitution(event)} className="rounded-2xl border border-border p-4">
            <strong className="text-sm text-primary">1 · Nueva institución</strong>
            <div className="mt-3 grid gap-3">
              <input required value={institutionForm.name} onChange={(event) => setInstitutionForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre completo" className={inputClass} />
              <input required value={institutionForm.shortName} onChange={(event) => setInstitutionForm((current) => ({ ...current, shortName: event.target.value }))} placeholder="Siglas" className={inputClass} />
              <input required value={institutionForm.country} onChange={(event) => setInstitutionForm((current) => ({ ...current, country: event.target.value }))} placeholder="País" className={inputClass} />
              <input value={institutionForm.websiteUrl} onChange={(event) => setInstitutionForm((current) => ({ ...current, websiteUrl: event.target.value }))} placeholder="Sitio web (opcional)" className={inputClass} />
              <Button type="submit" loading={busy}>Crear institución</Button>
            </div>
          </form>

          <form onSubmit={(event) => void submitProgram(event)} className="rounded-2xl border border-border p-4">
            <strong className="text-sm text-primary">2 · Nueva carrera</strong>
            <div className="mt-3 grid gap-3">
              <select value={managedInstitutionId} onChange={(event) => { const id = event.target.value; setManagedInstitutionId(id); setManagedProgramId(managed.find((item) => item.id === id)?.programs[0]?.id ?? ""); }} className={inputClass}>
                <option value="">Selecciona institución</option>
                {managed.map((item) => <option key={item.id} value={item.id}>{item.shortName} · {item.name}</option>)}
              </select>
              <input required value={programForm.name} onChange={(event) => setProgramForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre de la carrera" className={inputClass} />
              <input required value={programForm.degreeType} onChange={(event) => setProgramForm((current) => ({ ...current, degreeType: event.target.value }))} placeholder="Tipo de título" className={inputClass} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min={1} max={20} value={programForm.periods} onChange={(event) => setProgramForm((current) => ({ ...current, periods: Number(event.target.value) }))} aria-label="Períodos" className={inputClass} />
                <input type="number" min={0} max={400} value={programForm.totalCredits} onChange={(event) => setProgramForm((current) => ({ ...current, totalCredits: Number(event.target.value) }))} aria-label="Créditos totales" className={inputClass} />
              </div>
              <input value={programForm.sourceUrl} onChange={(event) => setProgramForm((current) => ({ ...current, sourceUrl: event.target.value }))} placeholder="Fuente del pensum (opcional)" className={inputClass} />
              <Button type="submit" loading={busy} disabled={!managedInstitutionId}>Crear carrera</Button>
            </div>
          </form>

          <form onSubmit={(event) => void submitManagedSubject(event)} className="rounded-2xl border border-border p-4">
            <strong className="text-sm text-primary">3 · Agregar materia al pensum</strong>
            <div className="mt-3 grid gap-3">
              <select value={managedProgramId} onChange={(event) => setManagedProgramId(event.target.value)} className={inputClass}>
                <option value="">Selecciona carrera</option>
                {managedInstitution?.programs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <input required value={subjectForm.name} onChange={(event) => setSubjectForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre de la materia" className={inputClass} />
              <input value={subjectForm.code} onChange={(event) => setSubjectForm((current) => ({ ...current, code: event.target.value }))} placeholder="Código (opcional)" className={inputClass} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min={1} max={managedProgram?.periods ?? 20} value={subjectForm.period} onChange={(event) => setSubjectForm((current) => ({ ...current, period: Number(event.target.value) }))} aria-label="Período de materia" className={inputClass} />
                <input type="number" min={0} max={30} value={subjectForm.credits} onChange={(event) => setSubjectForm((current) => ({ ...current, credits: Number(event.target.value) }))} aria-label="Créditos" className={inputClass} />
              </div>
              <Button type="submit" loading={busy} disabled={!managedProgramId}>Agregar materia</Button>
            </div>
          </form>
        </div>

        <div className="mt-5 rounded-2xl bg-surface-muted/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-content"><strong>{managed.length}</strong> instituciones · <strong>{managed.reduce((total, item) => total + item.programs.length, 0)}</strong> carreras · <strong>{selectedManagedCount}</strong> materias creadas desde Admin</p>
            <Button size="sm" variant="outline" onClick={() => void load()}>Actualizar</Button>
          </div>
          {managed.length > 0 && <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">{managed.map((item) => <div key={item.id} className="rounded-xl border border-border bg-surface p-3"><strong className="text-sm text-content">{item.shortName} · {item.name}</strong>{item.programs.map((currentProgram) => <p key={currentProgram.id} className="mt-1 text-xs text-muted">• {currentProgram.name} · {currentProgram.subjects.length} materias</p>)}</div>)}</div>}
        </div>
      </Card>
    </div>
  );
};

export default InstitutionCatalogManager;
