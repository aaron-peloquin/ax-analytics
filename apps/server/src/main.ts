import { createAXServer } from './createAXServer.js';

export function startServer(): void {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4400;
  const app = createAXServer();
  app.listen(port, () => {
    console.log(`🚀 AX Analytics Ingestion Server running on port ${port}`);
  });
}

startServer();
