import type { RepositoryStatus } from "../generated/prisma/client";

export interface ProgressStage {
  status: RepositoryStatus;
  progress: number;
  label: string;
}

export const PROGRESS_STAGES: Record<string, ProgressStage> = {
  pending: { status: "pending", progress: 0, label: "Pending" },
  cloning: { status: "cloning", progress: 10, label: "Cloning repository" },
  scanning: { status: "scanning", progress: 25, label: "Scanning files" },
  parsing: { status: "parsing", progress: 45, label: "Parsing code" },
  chunking: { status: "chunking", progress: 60, label: "Chunking files" },
  embedding: { status: "embedding", progress: 85, label: "Generating embeddings" },
  storing: { status: "storing", progress: 95, label: "Storing data" },
  ready: { status: "ready", progress: 100, label: "Ready" },
  failed: { status: "failed", progress: 0, label: "Failed" },
};

export function getProgressStage(status: RepositoryStatus): ProgressStage {
  return PROGRESS_STAGES[status] || PROGRESS_STAGES.pending;
}
