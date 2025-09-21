import cluster from "cluster";
import { app } from "./app";
import logger from "./utils/logger";
import { QueueService } from "./infra/queue";

let isShuttingDown = false;

const numCPUs = +(process.env.APP_CLUSTERS || 1) || 1;

const startWorker = (): void => {
  const worker = cluster.fork();

  worker.on("exit", code => {
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      logger.error(`Worker ${worker.process.pid} died`);
      cluster.fork();
    }
  });
};

const gracefulShutdown = (): void => {
  if (isShuttingDown) return;

  isShuttingDown = true;
  logger.info("Received SIGTERM. Starting graceful shutdown...");

  // Impede a criação de novos trabalhadores
  cluster.removeAllListeners("exit");

  // Desliga todos os trabalhadores graciosamente
  for (const id in cluster.workers) {
    if (Object.prototype.hasOwnProperty.call(cluster.workers, id)) {
      cluster.workers[id]?.send({ cmd: "shutdown" });
    }
  }
};

if (cluster.isPrimary) {
  logger.info(`Master process ${process.pid} is running`);

  // Inicializar o Queue Service no processo master
  QueueService.getInstance()
    .initialize()
    .catch(error => {
      logger.error(
        "Failed to initialize Queue Service in master process:",
        error,
      );
      process.exit(1);
    });

  for (let i = 0; i < numCPUs; i++) {
    startWorker();
  }

  cluster.on("exit", (worker, code) => {
    if (code === 0) {
      logger.info(`Worker ${worker.process.pid} has gracefully exited`);
    } else {
      logger.error(`Worker ${worker.process.pid} has died`);
    }

    if (!worker.exitedAfterDisconnect) {
      startWorker();
    }
  });

  process.on("SIGTERM", gracefulShutdown);
} else {
  // Inicializar Queue Service no worker também (para garantir que está disponível)
  QueueService.getInstance()
    .initialize()
    .catch(error => {
      logger.error(
        "Failed to initialize Queue Service in worker process:",
        error,
      );
      // Não mata o worker se o queue falhar, apenas loga o erro
    });

  const server = app.listen(process.env.PORT || 3333, () => {
    logger.info(
      `Worker ${process.pid} started. Server is running on port ${
        process.env.PORT || 3333
      }`,
    );
  });

  process.on("message", (message: unknown) => {
    if ((message as { cmd?: string }).cmd === "shutdown") {
      // Desconectar o Queue Service no worker
      QueueService.getInstance()
        .disconnect()
        .catch(error => {
          logger.error("Error disconnecting Queue Service in worker:", error);
        });

      // Lida com o comando de desligamento do cluster principal
      logger.info(`Worker ${process.pid} is shutting down gracefully...`);

      // Encerre o servidor Express graciosamente
      server.close(() => {
        logger.info(`Worker ${process.pid} has closed its server.`);
        process.exit(0);
      });
    }
  });
}
