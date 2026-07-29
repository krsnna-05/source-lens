import { Worker } from "bullmq";
import { redisConnection } from "../queue/connection";
import { indexRepository } from "../services/indexing.service";

new Worker(
  "repository-index",
  async (job) => {
    const { repositoryId } = job.data;
    console.log(`Processing indexing job for repository: ${repositoryId}`);
    await indexRepository(repositoryId);
  },
  {
    connection: redisConnection,
  },
);
