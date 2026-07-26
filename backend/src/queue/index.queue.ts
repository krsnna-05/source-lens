import { Queue } from "bullmq"
import { redisConnection } from "./connection"

export const indexQueue = new Queue("repository-index", {
  connection: redisConnection,
})
