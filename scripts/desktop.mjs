import { spawn } from 'node:child_process';
import { createServer } from 'vite';
import electron from 'electron';
const server = await createServer();
await server.listen();
const child = spawn(electron, ['.'], { stdio: 'inherit', env: { ...process.env, SCREENWRITR_DEV_URL: 'http://127.0.0.1:5194' } });
child.on('close', async code => { await server.close(); process.exit(code ?? 0); });
