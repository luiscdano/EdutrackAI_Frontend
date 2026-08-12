import { useEffect, useMemo, useState, type FormEvent } from "react";

import Button from "../../components/ui/Button";
import { getAcademicCatalog } from "../../services/student-context.service";
import { registerUser } from "../../services/auth.service";
import type { AuthenticatedUser } from "../../types/auth.types";
import type { InstitutionCatalog } from "../../types/student-context.types";

interface Props {
  onRegisterSuccess: (user: AuthenticatedUser) => void;
}

type AcademicMode = "catalog" | "manual";

const fieldClass = "min-h-12 w-full rounded-control border border-border bg-app-bg px-4 text-sm text-content outline-none transition focus:border-primary";

const StudentRegister = ({ onRegisterSuccess }: Props) => {
  const [catalog, setCatalog] = useState<InstitutionCatalog[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [mode, setMode] = useState<AcademicMode>("catalog");
  const [institutionKey, setInstitutionKey] = useState("");
  const [programKey, setProgramKey] = useState("");
  const [manualInstitution, setManualInstitution] = useState("");
  const [manualCareer, setManualCareer] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getAcademicCatalog()
      .then((items) => {
        if (!active) return;
        setCatalog(items);
        const institution = items[0];
        const program = institution?.programs[0];
        setInstitutionKey(institution?.key ?? "");
        setProgramKey(program?.key ?? "");
        if (!institution || !program) setMode("manual");
      })
      .catch(() => {
        if (active) setMode("manual");
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !studentCode.trim() || !email.trim()) {
      setError("Completa tus datos personales.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (mode === "catalog" && (!institution || !program)) {
      setError("Selecciona tu institución y carrera.");
      return;
    }
    if (mode === "manual" && (!manualInstitution.trim() || !manualCareer.trim())) {
      setError("Indica tu institución y carrera.");
      return;
    }

    setSaving(true);
    try {
      const auth = await registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentCode: studentCode.trim(),
        email: email.trim(),
        password,
        career: mode === "catalog" ? program?.name ?? "" : manualCareer.trim(),
        ...(mode === "catalog" && institution && program
          ? { institutionKey: institution.key, programKey: program.key }
          : {}),
      });
      onRegisterSuccess(auth.user);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No fue posible crear tu cuenta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-app-bg text-content lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden min-h-screen bg-primary px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-14">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-sm font-extrabold text-primary">ET</span>
          <div>
            <strong className="block text-lg">EduTrack AI</strong>
            <span className="text-xs text-white/70">Tu copiloto universitario</span>
          </div>
        </div>

        <div className="max-w-xl">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">Menos configuración. Más contexto.</span>
          <h1 className="mt-6 text-[clamp(2.6rem,5vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.055em]">
            Dime qué estudias. EduTrack se encarga de conectar el resto.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/75">
            Tu universidad y carrera se guardan desde el inicio. Después solo confirmas el período y las materias que realmente estás cursando.
          </p>
        </div>

        <p className="text-xs text-white/60">Cuenta → contexto → materias reales → siguiente acción</p>
      </section>

      <section className="min-h-screen px-4 py-7 sm:px-8 lg:max-h-screen lg:overflow-y-auto lg:px-10 xl:px-14">
        <div className="mx-auto max-w-2xl pb-10">
          <div className="mb-7 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-xs font-extrabold text-white">ET</span>
              <strong>EduTrack AI</strong>
            </div>
            <button type="button" onClick={() => window.location.assign("/login")} className="ml-auto text-sm font-semibold text-primary">
              Ya tengo cuenta
            </button>
          </div>

          <header>
            <span className="prototype-eyebrow">Crear perfil</span>
            <h1 className="mt-2 text-[clamp(2rem,4vw,3rem)] font-bold leading-tight tracking-[-0.045em]">Empecemos por lo que sí importa.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Datos de tu cuenta, universidad y carrera. El siguiente paso será confirmar tu período y tus materias reales.</p>
          </header>

          {error && <div className="mt-5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

          <form onSubmit={(event) => void submit(event)} className="mt-7 space-y-7">
            <section>
              <div className="mb-4">
                <span className="prototype-eyebrow">1 · Tu cuenta</span>
                <h2 className="mt-1 text-lg font-bold">Información personal</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">Nombre<input className={fieldClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" /></label>
                <label className="grid gap-2 text-sm font-semibold">Apellido<input className={fieldClass} value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" /></label>
                <label className="grid gap-2 text-sm font-semibold">Matrícula<input className={fieldClass} value={studentCode} onChange={(e) => setStudentCode(e.target.value)} placeholder="Ej. 2024-0196" /></label>
                <label className="grid gap-2 text-sm font-semibold">Correo<input className={fieldClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
                <label className="grid gap-2 text-sm font-semibold">Contraseña<input className={fieldClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label>
                <label className="grid gap-2 text-sm font-semibold">Confirmar contraseña<input className={fieldClass} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" /></label>
              </div>
            </section>

            <section className="border-t border-border pt-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="prototype-eyebrow">2 · Contexto académico</span>
                  <h2 className="mt-1 text-lg font-bold">¿Dónde y qué estudias?</h2>
                </div>
                {catalogLoading && <span className="text-xs text-muted">Cargando catálogo...</span>}
              </div>

              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                <button type="button" disabled={catalog.length === 0} onClick={() => setMode("catalog")} className={`rounded-2xl border p-3 text-left text-sm transition ${mode === "catalog" ? "border-primary bg-primary/10" : "border-border bg-surface"} disabled:opacity-50`}>
                  <strong className="block">Usar catálogo oficial</strong>
                  <span className="mt-1 block text-xs text-muted">Carreras disponibles en EduTrack.</span>
                </button>
                <button type="button" onClick={() => setMode("manual")} className={`rounded-2xl border p-3 text-left text-sm transition ${mode === "manual" ? "border-primary bg-primary/10" : "border-border bg-surface"}`}>
                  <strong className="block">Mi carrera no aparece</strong>
                  <span className="mt-1 block text-xs text-muted">Continúa manualmente sin bloquearte.</span>
                </button>
              </div>

              {mode === "catalog" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold">Institución
                    <select className={fieldClass} value={institutionKey} onChange={(e) => {
                      const nextInstitution = catalog.find((item) => item.key === e.target.value) ?? null;
                      setInstitutionKey(e.target.value);
                      setProgramKey(nextInstitution?.programs[0]?.key ?? "");
                    }}>
                      {catalog.map((item) => <option key={item.key} value={item.key}>{item.shortName} · {item.name}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">Carrera
                    <select className={fieldClass} value={programKey} onChange={(e) => setProgramKey(e.target.value)}>
                      {institution?.programs.map((item) => <option key={item.key} value={item.key}>{item.name}</option>)}
                    </select>
                  </label>
                  {program && <div className="sm:col-span-2 rounded-2xl bg-primary/8 px-4 py-3 text-sm"><strong>{program.name}</strong><span className="ml-2 text-muted">· {program.periods} períodos · {program.totalCredits} créditos</span></div>}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold">Universidad o instituto<input className={fieldClass} value={manualInstitution} onChange={(e) => setManualInstitution(e.target.value)} placeholder="Ej. UASD, INTEC..." /></label>
                  <label className="grid gap-2 text-sm font-semibold">Carrera<input className={fieldClass} value={manualCareer} onChange={(e) => setManualCareer(e.target.value)} placeholder="Ej. Ingeniería de Software" /></label>
                  <p className="sm:col-span-2 text-xs leading-5 text-muted">Guardaremos tu carrera ahora. En el siguiente paso podrás indicar manualmente institución, período y materias si todavía no existe un catálogo oficial en EduTrack.</p>
                </div>
              )}
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs leading-5 text-muted">No necesitas configurar todo tu semestre aquí. EduTrack te pedirá las materias reales justo después de crear la cuenta.</p>
              <Button type="submit" size="lg" loading={saving}>Crear cuenta y continuar</Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default StudentRegister;
