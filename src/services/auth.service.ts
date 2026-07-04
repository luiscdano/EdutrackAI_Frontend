import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  AuthData,
  AuthenticatedUser,
  LoginCredentials,
  RegisterData,
  ValidationErrorTree,
} from "../types/auth.types";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const TOKEN_KEY = "edutrack_token";
const USER_KEY = "edutrack_user";

if (!API_URL) {
  throw new Error(
    "VITE_API_URL no está configurada en el archivo .env.",
  );
}

const findFirstValidationError = (
  errorTree?: ValidationErrorTree,
): string | null => {
  if (!errorTree) {
    return null;
  }

  if (errorTree.errors && errorTree.errors.length > 0) {
    return errorTree.errors[0];
  }

  if (errorTree.properties) {
    for (const propertyError of Object.values(
      errorTree.properties,
    )) {
      const message = findFirstValidationError(propertyError);

      if (message) {
        return message;
      }
    }
  }

  if (errorTree.items) {
    for (const itemError of errorTree.items) {
      if (!itemError) {
        continue;
      }

      const message = findFirstValidationError(itemError);

      if (message) {
        return message;
      }
    }
  }

  return null;
};

const translateApiMessage = (message: string): string => {
  const messages: Record<string, string> = {
    "Invalid email address":
      "Introduce un correo electrónico válido.",
    "Password must contain at least 8 characters":
      "La contraseña debe tener al menos 8 caracteres.",
    "Email is already registered":
      "Este correo electrónico ya está registrado.",
    "Student code is already registered":
      "Esta matrícula ya está registrada.",
    "Invalid credentials":
      "Correo o contraseña incorrectos.",
    "Default student role is not configured":
      "El rol de estudiante no está configurado en el servidor.",
    "Failed to register user":
      "El servidor no pudo completar el registro.",
    "Failed to authenticate user":
      "El servidor no pudo iniciar la sesión.",
    "Validation error":
      "Verifica los datos introducidos.",
    "Route not found":
      "La ruta solicitada no existe.",
    "Internal server error":
      "Ocurrió un error interno en el servidor.",
  };

  return messages[message] ?? message;
};

const getApiErrorMessage = (
  errorResponse: ApiErrorResponse,
): string => {
  const validationMessage = findFirstValidationError(
    errorResponse.errors,
  );

  if (validationMessage) {
    return translateApiMessage(validationMessage);
  }

  return translateApiMessage(errorResponse.message);
};

const request = async <T>(
  endpoint: string,
  options: RequestInit,
): Promise<ApiSuccessResponse<T>> => {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor.",
    );
  }

  let responseData:
    | ApiSuccessResponse<T>
    | ApiErrorResponse;

  try {
    responseData = (await response.json()) as
      | ApiSuccessResponse<T>
      | ApiErrorResponse;
  } catch {
    throw new Error(
      "El servidor devolvió una respuesta no válida.",
    );
  }

  if (!response.ok || !responseData.ok) {
    throw new Error(
      getApiErrorMessage(responseData as ApiErrorResponse),
    );
  }

  return responseData;
};

export const saveAuthSession = (
  authData: AuthData,
): void => {
  localStorage.setItem(TOKEN_KEY, authData.token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(authData.user),
  );
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getAuthenticatedUser =
  (): AuthenticatedUser | null => {
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(
        storedUser,
      ) as AuthenticatedUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  };

export const clearAuthSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<AuthData> => {
  const response = await request<AuthData>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    },
  );

  saveAuthSession(response.data);

  return response.data;
};

export const registerUser = async (
  registerData: RegisterData,
): Promise<AuthData> => {
  const response = await request<AuthData>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(registerData),
    },
  );

  saveAuthSession(response.data);

  return response.data;
};