import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Auth middleware for endpoints that require it
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers['x-authorization'] || req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing auth token' });
  }
  next();
};

// Root health check for wait-on
app.get('/', (_req, res) => {
  res.status(200).send('OK');
});

// 1. Authentication (v2 and v1)
app.get(['/v2/authentication', '/v1/authentication'], (_req, res) => {
  res.status(200).json({ status: 'HEALTHY', message: 'Authentication endpoint reachable' });
});

app.post(['/v2/authentication', '/v1/authentication'], (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Bad Request: Missing username or password' });
  }
  res.status(200).json({ token: 'mock-jwt-token-123456789' });
});

// 2. GET/POST private workspace folder
const workspaceHandler = (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    name: 'Private Workspace',
    list: [
      {
        id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
        name: 'Private Workspace',
        folder: true
      }
    ]
  });
};

app.get(
  ['/v2/repository/workspaces/private', '/v2/repository/workspaces/private/files/list'],
  requireAuth,
  workspaceHandler
);
app.post(
  ['/v2/repository/workspaces/private', '/v2/repository/workspaces/private/files/list'],
  requireAuth,
  workspaceHandler
);

// 3. POST /files (Create form or process)
app.post('/v2/repository/files', requireAuth, (req, res) => {
  const { name, contentType } = req.body;
  const parentId =
    req.body.parentId || req.query.parentId || req.body.folderId || req.query.folderId;

  if (!name || !contentType) {
    return res
      .status(400)
      .json({ error: 'Bad Request: Missing required file name or contentType metadata' });
  }

  // Generate a mock UUID
  const mockId = `mock-file-${Math.floor(Math.random() * 1000000)}`;

  res.status(201).json({
    id: mockId,
    name,
    contentType,
    parentId: parentId || 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6'
  });
});

// 4. PUT /files/:id/content (Save content payload)
app.put('/v2/repository/files/:fileId/content', requireAuth, (req, res) => {
  const { fileId } = req.params;
  const payload = req.body;

  if (!payload || Object.keys(payload).length === 0) {
    return res.status(400).json({ error: 'Bad Request: Empty content payload' });
  }

  res.status(200).json({
    message: 'Content saved successfully',
    fileId
  });
});

// 5. PUT /files/:id/dependencies (Save dependencies)
app.put('/v2/repository/files/:fileId/dependencies', requireAuth, (req, res) => {
  const { fileId } = req.params;
  const { dependencies } = req.body;

  if (!dependencies || !Array.isArray(dependencies)) {
    return res.status(400).json({ error: 'Bad Request: Missing or invalid dependencies array' });
  }

  res.status(200).json({
    message: 'Dependencies saved successfully',
    fileId,
    dependencies
  });
});

// 6. DELETE /files/:id (Delete file)
app.delete('/v2/repository/files/:fileId', requireAuth, (req, res) => {
  const { fileId } = req.params;
  res.status(200).json({
    message: 'Resource deleted successfully',
    fileId
  });
});

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: `Mock server route not found: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
  console.log(`Use USE_MOCK_API=true to route requests to this server.`);
});
