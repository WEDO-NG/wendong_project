import app from './app';
import dotenv from 'dotenv';
import prisma from './infra/db';
import { VectorStoreService } from './infra/rag/vector-store';

dotenv.config();

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const shouldIndexOnBoot = !['0', 'false', 'no'].includes(
  String(process.env.RAG_INDEX_ON_BOOT || '1').toLowerCase()
);
const forceReindex = ['1', 'true', 'yes'].includes(
  String(process.env.RAG_FORCE_REINDEX || '1').toLowerCase()
);

if (shouldIndexOnBoot) {
  VectorStoreService.getInstance()
    .ensureIndexed({ force: forceReindex })
    .catch((e) => console.warn('[RAG] Failed to ensure vector index:', e));
}

// 优雅停机 (Graceful Shutdown)
const gracefulShutdown = async () => {
  console.log('Received kill signal, shutting down gracefully');
  server.close(() => {
    console.log('Closed out remaining connections');
    prisma.$disconnect().then(() => {
      console.log('Prisma disconnected');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
