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
  saveCustomAcademicContext,
} from "../../services/student-context.service";
import type { InstitutionCatalog } from "../../types/student-context.types";

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
  const [manualInstitution, setManualInstitution] = useState("");
  const [manualProgram, setManualProgram] = useState("");
  const [manualPeriod, setManualPeriod] = useState(1);
  const [manualSubjects, setManualSubjects] = useState("");

  useEffect(() => {
    let active = true;
    void getAcademicCatalog()
      .then((items) => {
        if (!active) return;
        setCatalog(items);
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSelectedKeys(periodSubjects.map((subject) => subject.key));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [periodSubjects]);

  if (isAdmin) return <Navigate to="/admin" replace />;

  const toggleSubject = (key: string) => {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
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
    <main className="min-h-screen bg-app-bg px-4 py-8 text-content sm:px-6 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7 flex items-center justify-between gap-4">
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

        <section className="mb-7 max-w-3xl">
          <span className="prototype-eyebrow">Hola {user?.firstName ?? ""}</span>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.045em]">
            Primero necesito entender qué estás estudiando.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            No vas a configurar una plataforma completa. Dime dónde estudias y qué materias llevas; EduTrack se encarga del resto.
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
            <span className="mt-1 block text-sm text-muted">Cargamos el pensum y tú confirmas lo que cursas.</span>
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
                    setProgramKey(nextInstitution?.programs[0]?.key ?? "");
                    setPeriod(1);
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
                  onChange={(event) => { setProgramKey(event.target.value); setPeriod(1); }}
                  className="min-h-12 rounded-control border border-border bg-app-bg px-3 text-content"
                >
                  {institution?.programs.map((item) => <option key={item.key} value={item.key}>{item.name}</option>)}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Período actual
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

            <div className="mt-7 border-t border-border pt-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="prototype-eyebrow">Confirma tu realidad</span>
                  <h2 className="mt-1 text-xl font-bold">¿Cuáles de estas materias llevas ahora?</h2>
                  <p className="mt-1 text-sm text-muted">Las encontramos en tu período. Quita cualquiera que no estés cursando.</p>
                </div>
                <span className="text-sm font-semibold text-primary">{selectedKeys.length} seleccionadas</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {periodSubjects.map((subject) => {
                  const selected = selectedKeys.includes(subject.key);
                  return (
                    <button
                      key={subject.key}
                      type="button"
                      onClick={() => toggleSubject(subject.key)}
                      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${selected ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/35"}`}
                    >
                      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border text-xs font-bold ${selected ? "border-primary bg-primary text-white" : "border-border"}`}>
                        {selected ? "✓" : ""}
                      </span>
                      <span className="min-w-0">
                        <strong className="block text-sm text-content">{subject.name}</strong>
                        <span className="mt-1 block text-xs text-muted">{subject.code ?? "Electiva"} · {subject.credits} créditos</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 flex justify-end">
              <Button loading={saving} disabled={selectedKeys.length === 0} onClick={() => void saveCatalog()}>
                Preparar mi EduTrack
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
