const { google } = require('googleapis');
const express = require('express');

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',
];

// 2.1 — OAuth2 client from env vars
const authClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

function getAuthUrl() {
  return authClient.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

async function getTokensFromCode(code) {
  const { tokens } = await authClient.getToken(code);
  return tokens;
}

async function refreshAccessToken(session) {
  const now = Date.now();
  if (session.expiresAt && now < session.expiresAt - 60000) return;
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  client.setCredentials({ refresh_token: session.refreshToken });
  const { credentials } = await client.refreshAccessToken();
  session.accessToken = credentials.access_token;
  session.expiresAt = credentials.expiry_date;
}

// 2.6 — requireAuth middleware
function requireAuth(req, res, next) {
  if (process.env.NODE_ENV === 'test') return next();
  if (req.session && req.session.email) return next();

  const isApiRequest =
    req.originalUrl.startsWith('/api/') ||
    (req.headers.accept && req.headers.accept.includes('application/json'));

  if (isApiRequest) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  res.redirect('/login.html');
}

// 2.2–2.5 — Auth routes
const router = express.Router();

// GET /auth/login — accepts optional ?returnTo= to redirect back after auth
router.get('/login', (req, res) => {
  const returnTo = req.query.returnTo;
  if (returnTo && returnTo.startsWith('/')) {
    req.session.returnTo = returnTo;
  }
  res.redirect(getAuthUrl());
});

// GET /auth/callback
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) {
    return res.redirect('/login.html?error=access_denied');
  }
  try {
    const tokens = await getTokensFromCode(code);

    const tempClient = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    tempClient.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: tempClient });
    const { data: userInfo } = await oauth2.userinfo.get();

    const allowedDomain = process.env.GOOGLE_ALLOWED_DOMAIN;
    const allowedEmails = process.env.GOOGLE_ALLOWED_EMAILS
      ? process.env.GOOGLE_ALLOWED_EMAILS.split(',').map(e => e.trim())
      : null;

    const email = userInfo.email;
    const allowed =
      (allowedDomain && email.endsWith('@' + allowedDomain)) ||
      (allowedEmails && allowedEmails.includes(email));

    if (!allowed) {
      return res.redirect('/login.html?error=access_denied');
    }

    req.session.email = email;
    req.session.name = userInfo.name;
    req.session.picture = userInfo.picture;
    req.session.accessToken = tokens.access_token;
    req.session.refreshToken = tokens.refresh_token;
    req.session.expiresAt = tokens.expiry_date;

    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    console.error('Auth callback error:', err);
    res.redirect('/login.html?error=access_denied');
  }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// GET /auth/me
router.get('/me', (req, res) => {
  if (!req.session || !req.session.email) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    email: req.session.email,
    name: req.session.name,
    picture: req.session.picture,
  });
});

module.exports = { authClient, getAuthUrl, getTokensFromCode, refreshAccessToken, router, requireAuth };
