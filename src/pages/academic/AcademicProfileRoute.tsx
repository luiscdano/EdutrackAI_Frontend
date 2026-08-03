import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AcademicSetup from "./AcademicSetup";
import {
  createAcademicProfile,
  getAcademicProfileByUser,
  updateAcademicProfile,
} from "../../services/academic-profile.service";
import type { AcademicSettings } from "../../types/academic.types";

export default function AcademicProfileRoute({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [id, setId] = useState<string | null>(null);
  const [data, setData] = useState<AcademicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const profile = await getAcademicProfileByUser(userId);
      setId(profile?.id ?? null);
      setData(profile?.settings ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar el perfil académico.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const save = async (settings: AcademicSettings) => {
    const profile = id
      ? await updateAcademicProfile(id, settings)
      : await createAcademicProfile(userId, settings);
    setId(profile.id);
    setData(profile.settings);
  };

  return <AcademicSetup initialData={data} loading={loading} error={error} onRetry={() => void load()} onSubmit={save} onContinueToDashboard={() => navigate("/")} />;
}
