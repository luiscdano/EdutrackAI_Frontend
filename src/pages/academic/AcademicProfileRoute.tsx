import { useEffect, useState } from "react";
import AcademicSetup from "./AcademicSetup";
import { createAcademicProfile, getAcademicProfileByUser, updateAcademicProfile } from "../../services/academic-profile.service";
import type { AcademicSettings } from "../../types/academic.types";

export default function AcademicProfileRoute({ userId }: { userId: string }) {
  const [id, setId] = useState<string | null>(null);
  const [data, setData] = useState<AcademicSettings | null>(null);

  useEffect(() => {
    getAcademicProfileByUser(userId).then((profile) => {
      setId(profile?.id ?? null);
      setData(profile?.settings ?? null);
    }).catch(() => undefined);
  }, [userId]);

  const save = async (settings: AcademicSettings) => {
    const profile = id
      ? await updateAcademicProfile(id, settings)
      : await createAcademicProfile(userId, settings);
    setId(profile.id);
    setData(profile.settings);
  };

  return <AcademicSetup initialData={data} onSubmit={save} onContinueToDashboard={() => window.location.assign("/")} />;
}
