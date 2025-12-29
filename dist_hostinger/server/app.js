import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

app.use(cors());
app.use(express.json());

// Serve Static Files (Frontend)
// Hostinger usually expects the backend to serve the frontend if it's a VPS or single Node app
app.use(express.static(path.join(__dirname, '../dist')));

// Middleware to authenticate
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// --- SESSION VALIDATION ---
app.post('/api/functions/validateSession', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(401).json({ valid: false });
    }

    const userResponse = {
      ...user,
      roles: user.roles ? JSON.parse(user.roles) : [],
      role_prices: user.role_prices ? JSON.parse(user.role_prices) : {}
    };

    res.json({ valid: true, user: userResponse });
  } catch (error) {
    res.status(500).json({ valid: false, error: error.message });
  }
});

// --- AUTH ROUTES ---

// Helper
const generateToken = (user) => {
  return jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });
};

// Send Verification Code (Mock)
app.post('/api/functions/sendVerificationCode', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone required' });

  // In a real app, send SMS. Here we just set a fixed code '123456' for demo
  // or store a random code in DB.
  const code = '123456';
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  // Upsert user to store code
  await prisma.user.upsert({
    where: { phone },
    update: { verification_code: code, verification_code_expires: expires },
    create: { phone, verification_code: code, verification_code_expires: expires }
  });

  console.log(`Code for ${phone}: ${code}`);
  res.json({ success: true, message: 'Code sent' });
});

// Phone Login
app.post('/api/functions/phoneLogin', async (req, res) => {
  const { phone, code } = req.body;
  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user || user.verification_code !== code) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  if (new Date() > user.verification_code_expires) {
    return res.status(400).json({ error: 'Code expired' });
  }

  // Clear code
  await prisma.user.update({
    where: { id: user.id },
    data: { verification_code: null, verification_code_expires: null }
  });

  const token = generateToken(user);

  // Format user for frontend
  const userResponse = {
    ...user,
    roles: user.roles ? JSON.parse(user.roles) : [],
    role_prices: user.role_prices ? JSON.parse(user.role_prices) : {}
  };

  res.json({ success: true, session_token: token, user: userResponse });
});

// Password Login
app.post('/api/functions/loginWithPassword', async (req, res) => {
  const { phone, password } = req.body;
  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user || !user.password) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);
  // Format user for frontend
  const userResponse = {
    ...user,
    roles: user.roles ? JSON.parse(user.roles) : [],
    role_prices: user.role_prices ? JSON.parse(user.role_prices) : {}
  };

  res.json({ success: true, session_token: token, user: userResponse });
});

// --- USER ROUTES ---

app.post('/api/functions/updateUserProfile', authenticate, async (req, res) => {
  const { user_id, data, hash_password } = req.body;

  // Authorization check
  if (parseInt(user_id) !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const updateData = { ...data };

  if (hash_password && updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
    updateData.has_password = true;
  }

  // Handle JSON fields
  if (updateData.roles) updateData.roles = JSON.stringify(updateData.roles);
  if (updateData.role_prices) updateData.role_prices = JSON.stringify(updateData.role_prices);

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(user_id) },
      data: updateData
    });

    const userResponse = {
      ...updatedUser,
      roles: updatedUser.roles ? JSON.parse(updatedUser.roles) : [],
      role_prices: updatedUser.role_prices ? JSON.parse(updatedUser.role_prices) : {}
    };

    res.json(userResponse);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Update failed' });
  }
});

// --- ENTITIES ---

app.get('/api/entities/JobRequest', authenticate, async (req, res) => {
  const { waiter_id, event_manager_id } = req.query;
  let where = {};
  if (waiter_id) where.waiter_id = parseInt(waiter_id);
  if (event_manager_id) where.event_manager_id = parseInt(event_manager_id);

  try {
    const jobs = await prisma.jobRequest.findMany({
      where,
      include: {
        waiter: { select: { full_name: true, phone: true } },
        event_manager: { select: { full_name: true, phone: true } }
      },
      orderBy: { created_date: 'desc' }
    });

    // Map to flat structure expected by frontend
    const mappedJobs = jobs.map(j => ({
      ...j,
      waiter_name: j.waiter?.full_name,
      waiter_phone: j.waiter?.phone,
      event_manager_name: j.event_manager?.full_name,
      event_manager_phone: j.event_manager?.phone
    }));

    res.json(mappedJobs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/functions/updateJobRequestStatus', authenticate, async (req, res) => {
  const { job_request_id, status, cancellation_reason } = req.body;

  try {
    const updated = await prisma.jobRequest.update({
      where: { id: parseInt(job_request_id) },
      data: { status, cancellation_reason }
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/entities/Rating', authenticate, async (req, res) => {
  const { waiter_id, event_manager_id } = req.query;
  let where = {};
  if (waiter_id) where.waiter_id = parseInt(waiter_id);
  if (event_manager_id) where.event_manager_id = parseInt(event_manager_id);

  const ratings = await prisma.rating.findMany({
    where,
    include: {
      event_manager: { select: { full_name: true } }
    }
  });

  // Map for frontend
  const mapped = ratings.map(r => ({
    ...r,
    event_manager_name: r.event_manager?.full_name
  }));

  res.json(mapped);
});

// --- FILE UPLOAD MOCK ---
app.post('/api/integrations/Core/UploadFile', (req, res) => {
  res.json({ file_url: 'https://via.placeholder.com/150' });
});

// CATCH-ALL ROUTE (For React Router)
// This must be AFTER all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
