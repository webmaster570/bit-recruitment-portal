import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  tryConnectDb,
  getDbStatus,
  getFullState,
  updateBrandingDb,
  updateRolePermissionsDb,
  createDriveDb,
  updateDriveDb,
  deleteDriveDb,
  addPostToDriveDb,
  updatePostInDriveDb,
  deletePostFromDriveDb,
  createApplicationDb,
  updateApplicationDb,
  createDepartmentDb,
  createAuditLogDb,
  markNotificationReadDb,
  updateWeightageConfigDb,
  createUserDb,
  updateUserDb,
  deleteUserDb,
  resetDatabaseToFactory,
  verifyLoginDb,
} from './server/db';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '15mb' }));

  // Blocking database connection on startup to ensure state is ready
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  try {
    await tryConnectDb();
  } catch (err) {
    console.error('[Server] Critical: Database connection failed on startup.');
  }

  // ----------------------------------------------------
  // API ROUTES (Always return valid data with fallback)
  // ----------------------------------------------------

  // 1. Health & Database connection status
  app.get('/api/health', (req, res) => {
    const status = getDbStatus();
    res.json({ status: 'ok', database: status });
  });

  // 2. Full State for Real-Time synchronization
  app.get('/api/state', async (req, res) => {
    try {
      const state = await getFullState();
      res.json(state);
    } catch (err: any) {
      console.warn('[API] /api/state warning:', err?.message);
      // Even on unexpected error, getFullState handles memory fallback
      const fallback = await getFullState();
      res.json(fallback);
    }
  });

  // 3. Update Branding
  app.post('/api/branding', async (req, res) => {
    try {
      const updated = await updateBrandingDb(req.body);
      res.json({ success: true, branding: updated });
    } catch (err: any) {
      console.error('[API] /api/branding error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Update Role Permissions
  app.post('/api/roles/permissions', async (req, res) => {
    try {
      const { roleId, permissions } = req.body;
      await updateRolePermissionsDb(roleId, permissions);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Drives CRUD
  app.post('/api/drives', async (req, res) => {
    try {
      const newDrive = await createDriveDb(req.body);
      res.json({ success: true, drive: newDrive });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/drives/:id', async (req, res) => {
    try {
      await updateDriveDb(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/drives/:id', async (req, res) => {
    try {
      await deleteDriveDb(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/drives/:id/posts', async (req, res) => {
    try {
      await addPostToDriveDb(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/drives/:driveId/posts/:postId', async (req, res) => {
    try {
      await updatePostInDriveDb(req.params.driveId, req.params.postId, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/drives/:driveId/posts/:postId', async (req, res) => {
    try {
      await deletePostFromDriveDb(req.params.driveId, req.params.postId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Applications CRUD & Stages
  app.post('/api/applications', async (req, res) => {
    try {
      const appDoc = await createApplicationDb(req.body);
      res.json({ success: true, application: appDoc });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/applications/:id', async (req, res) => {
    try {
      await updateApplicationDb(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Departments CRUD
  app.post('/api/departments', async (req, res) => {
    try {
      const dept = await createDepartmentDb(req.body);
      res.json({ success: true, department: dept });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Audit Logs
  app.post('/api/audit-logs', async (req, res) => {
    try {
      const log = await createAuditLogDb(req.body);
      res.json({ success: true, log });
    } catch (err: any) {
      res.json({ success: true, log: req.body });
    }
  });

  // 9. Notifications
  app.put('/api/notifications/:id/read', async (req, res) => {
    try {
      await markNotificationReadDb(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10. Weightage Config
  app.post('/api/weightage-config', async (req, res) => {
    try {
      await updateWeightageConfigDb(req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. User Management CRUD
  app.post('/api/users', async (req, res) => {
    try {
      const user = await createUserDb(req.body);
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const updated = await updateUserDb(req.params.id, req.body);
      res.json({ success: true, user: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      await deleteUserDb(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 12. Factory Reset Database
  app.post('/api/reset-data', async (req, res) => {
    try {
      await resetDatabaseToFactory();
      const freshState = await getFullState();
      res.json({ success: true, state: freshState });
    } catch (err: any) {
      const freshState = await getFullState();
      res.json({ success: true, state: freshState });
    }
  });

  // 13. Login Authentication
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await verifyLoginDb(email, password);
      if (user) {
        res.json({ success: true, user });
      } else {
        res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------
  // VITE OR STATIC ASSETS MIDDLEWARE
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Recruitment Portal Server running on http://0.0.0.0:${PORT}`);
    });
  }

  return app;
}

export const appPromise = startServer();
export default startServer;
