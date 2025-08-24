import { Router } from 'express';
import { dbHealthCheck } from '../config/database.js';

const router = Router();

router.get('/', (_req, res) => res.json({ ok: true, service: 'tlamatini-api' }));
router.get('/db-ping', async (_req, res) => {
  try {
    const health = await dbHealthCheck();
    res.json({ ok: health.healthy, db: health });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
