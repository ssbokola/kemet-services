// Wrapper script to start Vite dev server from the correct working directory
// This is needed because the preview tool runs from the parent directory,
// but PostCSS/Tailwind need CWD to be the project root to find their configs.
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Change CWD to the project root so PostCSS/Tailwind find their configs
process.chdir(__dirname);

// Now dynamically import vite after CWD is set
const { createServer } = await import('vite');

const server = await createServer({
  configFile: path.resolve(__dirname, 'vite.config.ts'),
  root: path.resolve(__dirname, 'client'),
  server: {
    port: 5000,
    host: '0.0.0.0',
  },
});
await server.listen();
server.printUrls();
