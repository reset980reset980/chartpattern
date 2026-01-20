import express from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
import axios from 'axios';
import bcrypt from 'bcrypt';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3006; // Vite(3005)와 충돌 방지

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Database Initialization
let db;
(async () => {
    db = await open({
        filename: path.join(__dirname, '../../chart_patterns.db'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            name TEXT,
            provider TEXT,
            oauthId TEXT,
            profilePicture TEXT
        );

        CREATE TABLE IF NOT EXISTS analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            imageUrl TEXT,
            result JSON,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            isShared BOOLEAN DEFAULT 0
        );
    `);
    console.log('SQLite Database Initialized.');
})();

// --- Auth APIs ---

// Helper: Find or Create OAuth User
async function findOrCreateUser(userData) {
    const { provider, oauthId, email, name, picture } = userData;
    let user = await db.get('SELECT * FROM users WHERE (provider = ? AND oauthId = ?) OR username = ?', [provider, oauthId, email]);

    if (!user) {
        const result = await db.run(
            'INSERT INTO users (username, name, provider, oauthId, profilePicture) VALUES (?, ?, ?, ?, ?)',
            [email || oauthId, name, provider, oauthId, picture]
        );
        user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    } else if (!user.provider) {
        // Upgrade existing email user to OAuth
        await db.run(
            'UPDATE users SET provider = ?, oauthId = ?, profilePicture = ?, name = ? WHERE id = ?',
            [provider, oauthId, picture, name, user.id]
        );
        user = await db.get('SELECT * FROM users WHERE id = ?', [user.id]);
    }
    return user;
}

// Register (Legacy)
app.post('/api/auth/register', async (req, res) => {
    const { username, password, name } = req.body;
    if (!username || !password || !name) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }
    try {
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run('INSERT INTO users (username, password, name, provider) VALUES (?, ?, ?, ?)', [username, hashedPassword, name, 'local']);
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: '이미 존재하는 아이디입니다.' });
    }
});

// Login (Legacy)
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (user && user.password) {
        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            res.cookie('userId', user.id, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, secure: true, sameSite: 'none' });
            res.json({ success: true, user: { id: user.id, username: user.username, name: user.name } });
        } else {
            res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다.' });
        }
    } else {
        res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('userId');
    res.json({ success: true });
});

// Google OAuth
app.get('/api/auth/google', (req, res) => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
    res.redirect(url);
});

app.get('/api/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code'
        });
        const { access_token } = tokenRes.data;
        const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        const user = await findOrCreateUser({
            provider: 'google',
            oauthId: userRes.data.id,
            email: userRes.data.email,
            name: userRes.data.name,
            picture: userRes.data.picture
        });
        res.cookie('userId', user.id, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, secure: true, sameSite: 'none' });
        res.redirect(`${process.env.CLIENT_URL}/`);
    } catch (err) {
        console.error('Google Callback Error:', err.response?.data || err.message);
        res.redirect(`${process.env.CLIENT_URL}/?error=auth_failed`);
    }
});

// Kakao OAuth
app.get('/api/auth/kakao', (req, res) => {
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
    res.redirect(url);
});

app.get('/api/auth/kakao/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const tokenRes = await axios.post('https://kauth.kakao.com/oauth/token', new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.KAKAO_CLIENT_ID,
            redirect_uri: process.env.KAKAO_REDIRECT_URI,
            code
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        const { access_token } = tokenRes.data;
        const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        const user = await findOrCreateUser({
            provider: 'kakao',
            oauthId: userRes.data.id.toString(),
            email: userRes.data.kakao_account?.email,
            name: userRes.data.kakao_account?.profile?.nickname || 'Kakao User',
            picture: userRes.data.kakao_account?.profile?.profile_image_url
        });
        res.cookie('userId', user.id, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, secure: true, sameSite: 'none' });
        res.redirect(`${process.env.CLIENT_URL}/`);
    } catch (err) {
        console.error('Kakao Callback Error:', err.response?.data || err.message);
        res.redirect(`${process.env.CLIENT_URL}/?error=auth_failed`);
    }
});

// Naver OAuth
app.get('/api/auth/naver', (req, res) => {
    const state = Math.random().toString(36).substring(7);
    const url = `https://nid.naver.com/oauth2.0/authorize?client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&response_type=code&state=${state}`;
    res.redirect(url);
});

app.get('/api/auth/naver/callback', async (req, res) => {
    const { code, state } = req.query;
    try {
        const tokenRes = await axios.post('https://nid.naver.com/oauth2.0/token', new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.NAVER_CLIENT_ID,
            client_secret: process.env.NAVER_CLIENT_SECRET,
            code,
            state
        }));
        const { access_token } = tokenRes.data;
        const userRes = await axios.get('https://openapi.naver.com/v1/nid/me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        const userData = userRes.data.response;
        const user = await findOrCreateUser({
            provider: 'naver',
            oauthId: userData.id,
            email: userData.email,
            name: userData.name || userData.nickname || 'Naver User',
            picture: userData.profile_image
        });
        res.cookie('userId', user.id, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, secure: true, sameSite: 'none' });
        res.redirect(`${process.env.CLIENT_URL}/`);
    } catch (err) {
        console.error('Naver Callback Error:', err.response?.data || err.message);
        res.redirect(`${process.env.CLIENT_URL}/?error=auth_failed`);
    }
});

// Current User
app.get('/api/auth/me', async (req, res) => {
    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ user: null });
    const user = await db.get('SELECT id, username, name, profilePicture FROM users WHERE id = ?', [userId]);
    res.json({ user });
});

// --- Chart Analysis APIs ---

// Save Result
app.post('/api/chart/save', async (req, res) => {
    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { imageUrl, result } = req.body;
    await db.run('INSERT INTO analysis_history (userId, imageUrl, result) VALUES (?, ?, ?)',
        [userId, imageUrl, JSON.stringify(result)]);
    res.json({ success: true });
});

// Get Single Chart (For View/Share)
app.get('/api/chart/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.cookies.userId;

    try {
        const chart = await db.get('SELECT * FROM analysis_history WHERE id = ?', [id]);
        if (!chart) return res.status(404).json({ error: 'Chart not found' });

        // Access Control: Allow if shared OR belongs to user
        if (chart.isShared || (userId && chart.userId == userId)) {
            res.json({
                success: true,
                data: {
                    ...chart,
                    result: JSON.parse(chart.result)
                }
            });
        } else {
            res.status(403).json({ error: 'Access denied' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

// List My Charts
app.get('/api/chart/list', async (req, res) => {
    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const rows = await db.all('SELECT id, createdAt, result, isShared FROM analysis_history WHERE userId = ? ORDER BY createdAt DESC', [userId]);
        const parsed = rows.map(r => {
            const resultFn = JSON.parse(r.result);
            return {
                id: r.id,
                createdAt: r.createdAt,
                patternName: resultFn.patternName,
                patternType: resultFn.patternType,
                confidence: resultFn.confidence,
                isShared: r.isShared
            };
        });
        res.json({ list: parsed });
    } catch (e) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Share Chart (Generate Public Link)
app.post('/api/chart/share/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.cookies.userId;

    // Verify ownership before sharing
    const chart = await db.get('SELECT userId FROM analysis_history WHERE id = ?', [id]);
    if (!chart || (userId && chart.userId != userId)) {
        return res.status(403).json({ error: 'Permission denied' });
    }

    await db.run('UPDATE analysis_history SET isShared = 1 WHERE id = ?', [id]);

    // Return the viewer URL (Assuming SPA handles ?id= query)
    const shareUrl = `https://chartpattern.xsw.kr/?id=${id}`;
    res.json({ success: true, url: shareUrl });
});

app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});
