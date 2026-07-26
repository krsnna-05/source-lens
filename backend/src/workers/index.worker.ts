import { Worker } from "bullmq";
import { redisConnection } from "../queue/connection";

new Worker(
  "repository-index",

  async (job) => {
    console.log(job.data);
  },

  {
    connection: redisConnection,
  },
);
