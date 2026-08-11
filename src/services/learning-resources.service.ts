import { apiRequest, buildQuery } from "./api-client";
import type { LearningResourceDiscovery } from "../types/student-context.types";

export const discoverLearningResources = (subjectId: string, topic?: string) =>
  apiRequest<LearningResourceDiscovery>(
    `/learning-resources/${subjectId}${buildQuery({ topic })}`,
  );
