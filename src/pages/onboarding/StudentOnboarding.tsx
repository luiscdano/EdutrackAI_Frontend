import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import {
  addCustomSubject,
  applyAcademicCatalog,
  getAcademicCatalog,
  getStudentContext,
  saveCustomAcademicContext,
} from "../../services/student-context.service";
import type { CatalogSubject, InstitutionCatalog } from "../../types/student-context.types";

type SetupMode = "catalog" | "manual";

const StudentOnboarding = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [catalog, setCatalog] = useState<InstitutionCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<SetupMode>("catalog");
  const [institutionKey, setInstitutionKey] = useState("");
  const [programKey, setProgramKey] = useState("");
  const [period, setPeriod] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [visitedPeriods, setVisitedPeriods] = useState<string[]>([]);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [manualInstitution, setManualInstitution] = useState("");
  const [manualProgram, setManualProgram] = useState("");
  const [manualPeriod, setManualPeriod] = useState(1);
  const [manualSubjects, setManualSubjects] = useState("");

  useEffect(() => {
    let active = true;

    void Promise.all([
      getAcademicCatalog(),
      getStudentContext().catch(() => null),
    ])
      .then(([items, current]) => {
        if (!active) return;
        setCatalog(items);

        const existingContext = current?.context;
        if (existingContext?.institutionKey === "custom") {
          setMode("manual");
          setManualInstitution(existingContext.institutionName);
          setManualProgram(existingContext.programName);
          setManualPeriod(existingContext.currentPeriod);
          setManualSubjects(
            (current?.subjects ?? [])
              .filter((item) => item.status === "active")
              .map((item) => item.subject.name)
              .join("\n"),
          );
          return;
        }

        const existingInstitution = existingContext
          ? items.find((item) => item.key === existingContext.institutionKey)
          : null;
        const existingProgram = existingInstitution?.programs.find(
          (item) => item.key === existingContext?.programKey,
        );

        if (existingInstitution && existingProgram && current) {
          setInstitutionKey(existingInstitution.key);
          setProgramKey(existingProgram.key);
          setPeriod(existingContext?.currentPeriod ?? 1);
          setSelectedKeys(
            current.subjects
              .filter((item) => item.status === "active" && item.curriculumCode)
              .map((item) => item.curriculumCode as string),
          );
          setVisitedPeriods([`${existingProgram.key}:${existingContext?.currentPeriod ?? 1}`]);
          return;
        }

        const firstInstitution = items[0];
        const firstProgram = firstInstitution?.programs[0];
        if (firstInstitution) setInstitutionKey(firstInstitution.key);
        if (firstProgram) setProgramKey(firstProgram.key);
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "No fue posible cargar los catálogos académicos.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const institution = useMemo(
    () => catalog.find((item) => item.key === institutionKey) ?? null,
    [catalog, institutionKey],
  );

  const program = useMemo(
    () => institution?.programs.find((item) => item.key === programKey) ?? null,
    [institution, programKey],
  );

  const periodSubjects = useMemo(
    () => program?.subjects.filter((subject) => subject.period === period) ?? [],
    [period, program],
  );

  const selectedSubjects = useMemo(
    () => program?.subjects.filter((subject) => selectedKeys.includes(subject.key)) ?? [],
    [program, selectedKeys],
  );

  const searchResults = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase();
    if (!program || query.length < 2) return [];

    return program.subjects
      .filter((subject) => `${subject.name} ${subject.code ?? ""}`.toLowerCase().includes(query))
      .slice(0, 12);
  }, [program, subjectSearch]);

  useEffect(() => {
    if (!program) return;
    const visitKey = `${program.key}:${period}`;
    if (visitedPeriods.includes(visitKey)) return;

    const timeoutId = window.setTimeout(() => {
      setSelectedKeys((current) => Array.from(new Set([
        ...current,
        ...periodSubjects.map((subject) => subject.key),
      ])));
      setVisitedPeriods((current) => current.includes(visitKey) ? current : [...current, visitKey]);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [period, periodSubjects, program, visitedPeriods]);

  if (isAdmin) return <Navigate to="/admin" replace />;

  const toggleSubject = (key: string) => {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  const resetCatalogSelection = (nextProgramKey: string, nextPeriod = 1) => {
    setProgramKey(nextProgramKey);
    setPeriod(nextPeriod);
    setSelectedKeys([]);
    setVisitedPeriods([]);
    setSubjectSearch("");
  };

  const subjectChoice = (subject: CatalogSubject, compact = false) => {
    const selected = selectedKeys.includes(subject.key);
    return (
      <button
        key={subject.key}
        type="button"
        onClick={() => toggleSubject(subject.key)}
        className={`flex items-start gap-3 rounded-2xl border text-left transition ${compact ? "p-3" : "p-4"} ${selected ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/35"}`}
      >
        <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border text-xs font-bold ${selected ? "border-primary bg-primary text-white" : "border-border"}`}>
          {selected ? "✓" : ""}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block text-sm text-content">{subject.name}</strong>
          <span className="mt-1 block text-xs text-muted">
            {subject.code ?? "Electiva"} · {subject.credits} créditos · Período {subject.period}
          </span>
        </span>
      </button>
    );
  };

  const saveCatalog = async () => {
    if (!institution || !program || selectedKeys.length === 0) return;
    setSaving(true);
    setError(null);

    try {
      await applyAcademicCatalog({
        institutionKey: institution.key,
        programKey: program.key,
        currentPeriod: period,
        selectedSubjectKeys: selectedKeys,
      });
      navigate("/", { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No fue posible preparar tu semestre.");
    } finally {
      setSaving(false);
    }
  };

  const saveManual = async () => {
    const subjects = manualSubjects
      .split(/\n|,/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (!manualInstitution.trim() || !manualProgram.trim() || subjects.length === 0) {
      setError("Indica tu institución, carrera y al menos una materia actual.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveCustomAcademicContext({
        institutionName: manualInstitution.trim(),
        programName: manualProgram.trim(),
        currentPeriod: manualPeriod,
      });

      await Promise.all(
        subjects.map((name) => addCustomSubject({ name, difficultyLevel: "medium" })),
      );

      navigate("/", { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No fue posible preparar tu semestre.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8 text-content sm:px-6 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-sm font-extrabold text-white">ET</div>
            <div>
              <strong className="block text-base">EduTrack AI</strong>
              <span className="text-xs text-muted">Tu semestre, sin ruido.</span>
            </div>
          </div>
          <span className="hidden rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted sm:inline-flex">
            Configuración inicial · 2 minutos
          </span>
        </header>

        <section className="mb-6 max-w-3xl">
          <span className="prototype-eyebrow">Hola {user?.firstName ?? ""}</span>
          <h1 className="mt-2 text-[clamp(1.9rem,4vw,3.1rem)] font-bold leading-[1.04] tracking-[-0.045em]">
            Primero necesito entender qué estás estudiando.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            Tu período sirve de referencia, pero tus materias reales pueden venir de cualquier período. Tú confirmas la combinación final.
          </p>
        </section>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => { setMode("catalog"); setError(null); }}
            className={`rounded-2xl border p-4 text-left transition ${mode === "catalog" ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/40"}`}
          >
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Automático</span>
            <strong className="mt-1 block text-lg">Mi institución está disponible</strong>
            <span className="mt-1 block text-sm text-muted">Cargamos el pensum y tú construyes tu período real.</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode("manual"); setError(null); }}
            className={`rounded-2xl border p-4 text-left transition ${mode === "manual" ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/40"}`}
          >
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Flexible</span>
            <strong className="mt-1 block text-lg">Configurar manualmente</strong>
            <span className="mt-1 block text-sm text-muted">Para cualquier universidad o programa todavía no catalogado.</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
        )}

        {loading ? (
          <Card padding="lg" className="grid min-h-72 place-items-center"><Loader showLabel label="Buscando planes académicos..." /></Card>
        ) : mode === "catalog" ? (
          <Card padding="lg">
            <div className="grid gap-5 lg:grid-cols-3">
              <label className="grid gap-2 text-sm font-semibold">
                Institución
                <select
                  value={institutionKey}
                  onChange={(event) => {
                    const nextKey = event.target.value;
                    setInstitutionKey(nextKey);
                    const nextInstitution = catalog.find((item) => item.key === nextKey);
                    resetCatalogSelection(nextInstitution?.programs[0]?.key ?? "");
                  }}
                  className="min-h-12 rounded-control border border-border bg-app-bg px-3 text-content"
                >
                  {catalog.map((item) => <option key={item.key} value={item.key}>{item.shortName} · {item.name}</option>)}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Carrera
                <select
                  value={programKey}
                  onChange={(event) => resetCatalogSelection(event.target.value)}
                  className="min-h-12 rounded-control border border-border bg-app-bg px-3 text-content"
                >
                  {institution?.programs.map((item) => <option key={item.key} value={item.key}>{item.name}</option>)}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Período de referencia
                <select
                  value={period}
                  onChange={(event) => setPeriod(Number(event.target.value))}
                  className="min-h-12 rounded-control border border-border bg-app-bg px-3 text-content"
                >
                  {Array.from({ length: program?.periods ?? 1 }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>Período {value}</option>
                  ))}
                </select>
              </label>
            </div>

            {program && (
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className="rounded-full bg-surface-muted px-3 py-1.5">{program.totalCredits} créditos</span>
                <span className="rounded-full bg-surface-muted px-3 py-1.5">{program.periods} períodos</span>
                <a href={program.sourceUrl} target="_blank" rel="noreferrer" className="rounded-full bg-primary/10 px-3 py-1.5 font-semibold text-primary hover:bg-primary/15">
                  Ver fuente oficial
                </a>
              </div>
            )}

            <div className="mt-6 border-t border-border pt-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-end">
                <div>
                  <span className="prototype-eyebrow">Construye tu período real</span>
                  <h2 className="mt-1 text-xl font-bold">Materias del período {period}</h2>
                  <p className="mt-1 text-sm text-muted">Puedes quitar cualquiera y luego buscar materias de otros períodos sin perder lo ya elegido.</p>
                </div>
                <label className="grid gap-2 text-xs font-semibold text-muted">
                  Buscar en todo el pensum
                  <input
                    value={subjectSearch}
                    onChange={(event) => setSubjectSearch(event.target.value)}
                    placeholder="Ej. Programación Web, TDS-008..."
                    className="min-h-11 rounded-control border border-border bg-app-bg px-4 text-sm text-content outline-none focus:border-primary"
                  />
                </label>
              </div>

              {subjectSearch.trim().length >= 2 && (
                <div className="mt-4 rounded-2xl border border-border bg-surface-muted/40 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <strong className="text-sm text-content">Resultados en toda la carrera</strong>
                    <span className="text-xs text-muted">{searchResults.length} encontrados</span>
                  </div>
                  {searchResults.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted">No encontré esa materia en este pensum.</p>
                  ) : (
                    <div className="grid gap-2 md:grid-cols-2">
                      {searchResults.map((subject) => subjectChoice(subject, true))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {periodSubjects.map((subject) => subjectChoice(subject))}
              </div>
            </div>

            {selectedSubjects.length > 0 && (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="prototype-eyebrow">Tu selección final</span>
                    <h3 className="mt-1 font-bold text-content">{selectedSubjects.length} materias activas</h3>
                  </div>
                  <span className="text-xs text-muted">Pueden ser de períodos distintos</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSubjects.map((subject) => (
                    <button
                      key={subject.key}
                      type="button"
                      onClick={() => toggleSubject(subject.key)}
                      className="rounded-full border border-primary/20 bg-surface px-3 py-2 text-xs text-content transition hover:border-danger/40 hover:text-danger"
                      title="Quitar de tu selección"
                    >
                      {subject.name} · P{subject.period} ×
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">El período indica dónde estás; la selección indica lo que realmente cursas.</p>
              <Button loading={saving} disabled={selectedKeys.length === 0} onClick={() => void saveCatalog()}>
                Preparar mi EduTrack · {selectedKeys.length}
              </Button>
            </div>
          </Card>
        ) : (
          <Card padding="lg">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Universidad o instituto
                <input value={manualInstitution} onChange={(event) => setManualInstitution(event.target.value)} placeholder="Ej. UASD, UNAPEC, INTEC..." className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Carrera
                <input value={manualProgram} onChange={(event) => setManualProgram(event.target.value)} placeholder="Ej. Ingeniería de Software" className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
              </label>
              <label className="grid gap-2 text-sm font-semibold md:max-w-xs">
                Período actual
                <input type="number" min={1} max={20} value={manualPeriod} onChange={(event) => setManualPeriod(Number(event.target.value))} className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
              </label>
              <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                Materias que cursas ahora
                <textarea
                  value={manualSubjects}
                  onChange={(event) => setManualSubjects(event.target.value)}
                  placeholder={"Escribe una por línea:\nProgramación II\nBase de Datos\nCálculo"}
                  rows={6}
                  className="rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary"
                />
                <span className="text-xs font-normal text-muted">Después podrás agregar, quitar o ajustar materias desde tu sección Materias.</span>
              </label>
            </div>
            <div className="mt-7 flex justify-end">
              <Button loading={saving} onClick={() => void saveManual()}>Preparar mi EduTrack</Button>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
};

export default StudentOnboarding;
