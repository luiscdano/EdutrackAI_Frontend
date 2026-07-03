import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  AuthData,
  AuthenticatedUser,
  LoginCredentials,
  RegisterData,
} from "../types/auth.types";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const TOKEN_KEY = "edutrack_token";
const USER_KEY = "edutrack_user";

if (!API_URL) {
  throw new Error(
    "VITE_API_URL no está configurada en el archivo .env.",
  );
}

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
      responseData.message ||
        "Ocurrió un error inesperado.",
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