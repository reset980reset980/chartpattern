import express from 'express';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

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
            name TEXT
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

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, password, name } = req.body;
    if (!username || !password || !name) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }
    try {
        // Simple plain text password for demo
        await db.run('INSERT INTO users (username, password, name) VALUES (?, ?, ?)', [username, password, name]);
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: '이미 존재하는 아이디입니다.' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (user) {
        // Login Persistence: 30 Days
        res.cookie('userId', user.id, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.json({ success: true, user: { id: user.id, username: user.username, name: user.name } });
    } else {
        res.status(401).json({ error: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('userId');
    res.json({ success: true });
});

// Google Auth (Mock Verification)
app.post('/api/auth/google', async (req, res) => {
    const { credential } = req.body;
    try {
        const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
        const { email, name, sub: googleId } = payload;

        let user = await db.get('SELECT * FROM users WHERE username = ?', [email]);
        if (!user) {
            await db.run('INSERT INTO users (username, password, name) VALUES (?, ?, ?)', [email, 'google-auth-' + googleId, name]);
            user = await db.get('SELECT * FROM users WHERE username = ?', [email]);
        }

        res.cookie('userId', user.id, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.json({ success: true, user: { id: user.id, username: user.username, name: user.name } });
    } catch (e) {
        res.status(400).json({ error: '인증 처리 실패' });
    }
});

// Current User
app.get('/api/auth/me', async (req, res) => {
    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ user: null });
    const user = await db.get('SELECT id, username FROM users WHERE id = ?', [userId]);
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
