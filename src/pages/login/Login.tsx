import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";

const Login = () => {
  return (
    <main className="flex min-h-screen w-full overflow-x-hidden bg-app-bg">
      {/* Panel izquierdo: solo escritorio */}
      <section className="hidden min-h-screen min-w-0 w-1/2 items-center justify-center bg-slate-950 lg:flex">
        <div className="w-full max-w-2xl px-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-content">
            EduTrack <span className="text-primary">AI</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted">
            Plataforma educativa inteligente para mejorar el rendimiento
            académico mediante recomendaciones personalizadas.
          </p>
        </div>
      </section>

      {/* Panel derecho */}
      <section className="flex min-h-screen min-w-0 w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-1/2 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Logo móvil */}
          <div className="mb-8 w-full text-center lg:hidden">
            <h1 className="text-3xl font-bold tracking-tight text-content sm:text-4xl">
              EduTrack <span className="text-primary">AI</span>
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
              Plataforma educativa inteligente
            </p>
          </div>

          <Card padding="md">
            <h2 className="mb-6 text-center text-2xl font-bold text-content">
              Iniciar sesión
            </h2>

            <div className="space-y-5">
              <Input
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
              />

              <PasswordInput
                name="password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="mb-6 mt-3 text-right">
              <a
                href="#"
                className="text-sm text-primary transition-colors hover:text-blue-300"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button fullWidth>
              Iniciar sesión
            </Button>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Login;