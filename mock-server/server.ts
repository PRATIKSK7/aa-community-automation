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

// 1. POST /auth
app.post('/v1/authentication', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Bad Request: Missing username or password' });
  }
  res.status(200).json({ token: 'mock-jwt-token-123456789' });
});

// 2. GET /folders/me (mapped from GET_MY_FOLDER)
app.get('/v2/repository/workspaces/private', requireAuth, (req, res) => {
  res.status(200).json({
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    name: 'Private Workspace'
  });
});

// 3. POST /files (Create form or process)
app.post('/v2/repository/files', requireAuth, (req, res) => {
  const { name, parentId, contentType } = req.body;

  if (!name || !parentId || !contentType) {
    return res.status(400).json({ error: 'Bad Request: Missing required file metadata' });
  }

  // Generate a mock UUID
  const mockId = `mock-file-${Math.floor(Math.random() * 1000000)}`;

  res.status(201).json({
    id: mockId,
    name,
    contentType,
    parentId
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

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: `Mock server route not found: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
  console.log(`Use USE_MOCK_API=true to route requests to this server.`);
});
