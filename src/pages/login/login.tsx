import Button from "../../components/ui/button";
import Card from "../../components/ui/card";
import Input from "../../components/ui/input";
import PasswordInput from "../../components/ui/passwordinput";

const Login = () => {
  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Lado izquierdo (Solo Desktop) */}
      <div className="hidden min-h-screen w-1/2 items-center justify-center bg-slate-950 lg:flex">
        <div className="flex max-w-2xl flex-col items-center justify-center px-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            EduTrack <span className="text-blue-500">AI</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            Plataforma educativa inteligente para mejorar el rendimiento
            académico mediante recomendaciones personalizadas.
          </p>
        </div>
      </div>

      {/* Lado derecho */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-6 lg:w-1/2">

        {/* Logo para móvil */}
        <div className="mb-8 text-center lg:hidden">
          <h1 className="text-4xl font-bold text-white">
            EduTrack <span className="text-blue-500">AI</span>
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Plataforma educativa inteligente
          </p>
        </div>

        <Card>
          <h2 className="mb-6 text-center text-2xl font-bold text-white">
            Iniciar sesión
          </h2>

          <Input
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
          />

          <PasswordInput />

          <div className="mb-6 mt-3 text-right">
            <a
              href="#"
              className="text-sm text-blue-400 transition-colors hover:text-blue-300"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button text="Iniciar sesión" />
        </Card>
      </div>
    </div>
  );
};

export default Login;