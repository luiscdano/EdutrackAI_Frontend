import { useState } from "react";

import Input, { type InputProps } from "./Input";

type PasswordInputProps = Omit<
  InputProps,
  "type" | "rightElement" | "label"
> & {
  label?: string;
};

const PasswordInput = ({
  label = "Contraseña",
  placeholder = "Ingrese su contraseña",
  autoComplete = "current-password",
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] =
    useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((currentValue) => !currentValue);
  };

  return (
    <Input
      {...props}
      label={label}
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      autoComplete={autoComplete}
      rightElement={
        <button
          type="button"
          onClick={togglePasswordVisibility}
          onMouseDown={(event) => event.preventDefault()}
          aria-label={
            showPassword
              ? "Ocultar contraseña"
              : "Mostrar contraseña"
          }
          aria-pressed={showPassword}
          className="rounded-md px-1 py-1 text-sm font-medium text-muted transition-colors hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {showPassword ? "Ocultar" : "Mostrar"}
        </button>
      }
    />
  );
};

export default PasswordInput;