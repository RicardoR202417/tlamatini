import express from 'express';

console.log('[SANITY] Entré a sanity_server.js');

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/health', (_, res) => res.json({ ok: true, t: Date.now() }));

app.listen(PORT, () => {
  console.log(`[SANITY] Escuchando en http://localhost:${PORT}`);
});

// Evita que se “muera” sin logs si algo raro pasa
process.on('beforeExit', (code) => console.log('[SANITY][beforeExit]', code));
process.on('exit', (code) => console.log('[SANITY][exit]', code));
process.on('unhandledRejection', (e) => console.error('[SANITY][unhandledRejection]', e));
process.on('uncaughtException', (e) => console.error('[SANITY][uncaughtException]', e));
