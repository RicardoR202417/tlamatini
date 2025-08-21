import { Router } from 'express';
import { dbPing } from '../config/database.js';

const router = Router();

router.get('/', (_req, res) => res.json({ ok: true, service: 'tlamatini-api' }));
router.get('/db-ping', async (_req, res) => {
  try {
    await dbPing();
    res.json({ ok: true, db: 'connected' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
