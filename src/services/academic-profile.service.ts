import { getAuthToken } from "./auth.service";

import type {
  AcademicProfileApi,
  AcademicProfileResult,
  AcademicSettings,
  DifficultyOption,
} from "../types/academic.types";

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "");

if (!API_URL) {
  throw new Error(
    "VITE_API_URL no está configurada en el archivo .env.",
  );
}

interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data?: T;
}

class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

const difficultyValues = new Set<string>([
  "time_management",
  "mathematics",
  "reading_comprehension",
  "programming",
  "concentration",
  "teamwork",
  "communication",
  "exam_anxiety",
]);

const parseDifficulties = (
  value: string,
): DifficultyOption[] => {
  try {
    const parsedValue = JSON.parse(value);

    if (Array.isArray(parsedValue)) {
      return parsedValue.filter(
        (difficulty): difficulty is DifficultyOption =>
          typeof difficulty === "string" &&
          difficultyValues.has(difficulty),
      );
    }
  } catch {
    // También soporta registros antiguos separados por comas.
  }

  return value
    .split(",")
    .map((difficulty) => difficulty.trim())
    .filter(
      (difficulty): difficulty is DifficultyOption =>
        difficultyValues.has(difficulty),
    );
};

const mapProfileToSettings = (
  profile: AcademicProfileApi,
): AcademicProfileResult => {
  return {
    id: profile.id,
    settings: {
      academicLevel: profile.academicLevel,
      learningStyle: profile.learningStyle,
      preferredSchedule: profile.preferredStudyTime,
      weeklyGoal: profile.weeklyStudyGoalHours,
      difficulties: parseDifficulties(
        profile.mainDifficulties,
      ),
    },
  };
};

const createPayload = (
  settings: AcademicSettings,
) => {
  return {
    academicLevel: settings.academicLevel,
    learningStyle: settings.learningStyle,
    preferredStudyTime:
      settings.preferredSchedule,
    weeklyStudyGoalHours:
      settings.weeklyGoal,
    mainDifficulties: JSON.stringify(
      settings.difficulties,
    ),
  };
};

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "No existe una sesión activa.",
    );
  }

  const headers = new Headers(options.headers);

  headers.set(
    "Authorization",
    `Bearer ${token}`,
  );

  if (options.body) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers,
      },
    );
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor.",
    );
  }

  const responseData = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (
    !response.ok ||
    !responseData ||
    responseData.ok !== true
  ) {
    throw new ApiRequestError(
      response.status,
      responseData?.message ??
        "El servidor devolvió un error.",
    );
  }

  if (responseData.data === undefined) {
    throw new Error(
      "El servidor no devolvió los datos esperados.",
    );
  }

  return responseData.data;
};

export const getAcademicProfileByUser =
  async (
    userId: string,
  ): Promise<AcademicProfileResult | null> => {
    try {
      const profile =
        await request<AcademicProfileApi>(
          `/academic-profile/by-user/${userId}`,
        );

      return mapProfileToSettings(profile);
    } catch (error) {
      if (
        error instanceof ApiRequestError &&
        error.status === 404
      ) {
        return null;
      }

      throw error;
    }
  };

export const createAcademicProfile =
  async (
    userId: string,
    settings: AcademicSettings,
  ): Promise<AcademicProfileResult> => {
    const profile =
      await request<AcademicProfileApi>(
        "/academic-profile",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: userId,
            ...createPayload(settings),
          }),
        },
      );

    return mapProfileToSettings(profile);
  };

export const updateAcademicProfile =
  async (
    profileId: string,
    settings: AcademicSettings,
  ): Promise<AcademicProfileResult> => {
    const profile =
      await request<AcademicProfileApi>(
        `/academic-profile/${profileId}`,
        {
          method: "PUT",
          body: JSON.stringify(
            createPayload(settings),
          ),
        },
      );

    return mapProfileToSettings(profile);
  };