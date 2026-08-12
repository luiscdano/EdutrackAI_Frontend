import { useEffect, useMemo, useState, type FormEvent } from "react";

import { createAdminSubject } from "../../services/admin-academic.service";
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
  const [institutionKey, setInstitutionKey] = useState("");
  const [programKey, setProgramKey] = useState("");
  const [period, setPeriod] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [external, setExternal] = useState({
    institution: "",
    program: "",
    code: "",
    name: "",
    period: 1,
    credits: 3,
  });
  const [savingExternal, setSavingExternal] = useState(false);

  useEffect(() => {
    let active = true;
    void getAcademicCatalog()
      .then((items) => {
        if (!active) return;
        setCatalog(items);
        const firstInstitution = items[0];
        const firstProgram = firstInstitution?.programs[0];
        setInstitutionKey(firstInstitution?.key ?? "");
        setProgramKey(firstProgram?.key ?? "");
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "No fue posible cargar el catálogo institucional.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const institution = useMemo(
    () => catalog.find((item) => item.key === institutionKey) ?? null,
    [catalog, institutionKey],
  );

  const program = useMemo(
    () => institution?.programs.find((item) => item.key === programKey) ?? null,
    [institution, programKey],
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

  const submitExternal = async (event: FormEvent) => {
    event.preventDefault();
    if (!external.institution.trim() || !external.program.trim() || !external.name.trim()) return;
    setSavingExternal(true);
    setMessage(null);
    try {
      await createAdminSubject({
        code: external.code.trim() || `EXT-${Date.now().toString().slice(-6)}`,
        name: external.name.trim(),
        program: `${external.institution.trim()} · ${external.program.trim()}`,
        semester: external.period,
        credits: external.credits,
        difficulty: "medium",
        status: "active",
      });
      setMessage(`${external.name.trim()} quedó disponible en Administración para cargar contenido académico.`);
      setExternal({ institution: "", program: "", code: "", name: "", period: 1, credits: 3 });
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible registrar la materia externa.");
    } finally {
      setSavingExternal(false);
    }
  };

  return (
    <Card padding="lg" className="border-primary/25">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <span className="prototype-eyebrow">Catálogo académico</span>
          <h2 className="mt-1 text-2xl font-bold text-content">Instituciones, carreras y materias</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            El catálogo oficial no aparece por arte de magia: aquí el administrador puede inspeccionarlo y decidir qué materias llevar al catálogo operativo. Para otra universidad, registra sus materias en el bloque de institución externa.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          {operationalSubjects.length} materias operativas
        </span>
      </div>

      {message && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-content">{message}</div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <section className="rounded-2xl border border-border p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 text-xs font-semibold text-muted">
              Institución catalogada
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
              <a href={program.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">Fuente del pensum</a>
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

        <section className="rounded-2xl border border-border p-4 sm:p-5">
          <span className="prototype-eyebrow">Institución externa</span>
          <h3 className="mt-1 text-lg font-bold text-content">Agregar otra universidad o programa</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Para instituciones que todavía no tienen un pensum oficial catalogado, registra sus materias manualmente. Los estudiantes pueden elegir “Configurar manualmente” en onboarding.
          </p>

          <form onSubmit={(event) => void submitExternal(event)} className="mt-4 grid gap-3">
            <input required value={external.institution} onChange={(event) => setExternal((current) => ({ ...current, institution: event.target.value }))} placeholder="Universidad / instituto" className="min-h-11 rounded-control border border-border bg-app-bg px-4 text-sm text-content" />
            <input required value={external.program} onChange={(event) => setExternal((current) => ({ ...current, program: event.target.value }))} placeholder="Carrera / programa" className="min-h-11 rounded-control border border-border bg-app-bg px-4 text-sm text-content" />
            <input required value={external.name} onChange={(event) => setExternal((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre de la materia" className="min-h-11 rounded-control border border-border bg-app-bg px-4 text-sm text-content" />
            <div className="grid grid-cols-3 gap-2">
              <input value={external.code} onChange={(event) => setExternal((current) => ({ ...current, code: event.target.value }))} placeholder="Código" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              <input type="number" min={1} max={20} value={external.period} onChange={(event) => setExternal((current) => ({ ...current, period: Number(event.target.value) }))} aria-label="Período" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
              <input type="number" min={0} max={20} value={external.credits} onChange={(event) => setExternal((current) => ({ ...current, credits: Number(event.target.value) }))} aria-label="Créditos" className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content" />
            </div>
            <Button type="submit" loading={savingExternal}>Agregar al catálogo operativo</Button>
          </form>
        </section>
      </div>
    </Card>
  );
};

export default InstitutionCatalogManager;
