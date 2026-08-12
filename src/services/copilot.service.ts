import { apiRequest } from "./api-client";
import type { CopilotPulse, CopilotReply } from "../types/copilot.types";

export const getCopilotPulse = () =>
  apiRequest<CopilotPulse>("/copilot/pulse");

export const askCopilot = (message: string) =>
  apiRequest<CopilotReply>("/copilot/ask", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
