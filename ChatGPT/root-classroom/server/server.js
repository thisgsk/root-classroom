require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db: pool, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// 데이터베이스 초기화
(async () => {
  await initDatabase();
})();

// JWT 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '토큰이 없습니다' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '토큰이 유효하지 않습니다' });
    }
    req.user = user;
    next();
  });
};

// ============ 인증 API ============

// 회원가입
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // 유효성 검사
    if (!email || !username || !password) {
      return res.status(400).json({ error: '모든 필드를 입력해주세요' });
    }

    const conn = await pool.getConnection();

    try {
      // 비밀번호 해싱
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // DB에 저장
      const result = await conn.query(
        'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)',
        [email, username, hashedPassword]
      );

      const userId = result[0].insertId;

      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: userId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: userId,
          email,
          username
        }
      });
    } catch (err) {
      if (err.message.includes('Duplicate entry')) {
        return res.status(400).json({ error: '이미 존재하는 이메일입니다' });
      }
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ error: '회원가입 실패' });
  }
});

// 로그인
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '이메일 또는 사용자명과 비밀번호를 입력해주세요' });
    }

    const conn = await pool.getConnection();

    try {
      const [users] = await conn.query(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [email, email]
      );

      const user = users[0];
      if (!user) {
        return res.status(401).json({ error: '사용자를 찾을 수 없습니다' });
      }

      // 비밀번호 검증
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: '비밀번호가 일치하지 않습니다' });
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 로그아웃
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // JWT는 stateless이므로 클라이언트에서 토큰만 삭제하면 됨
  res.json({ success: true });
});

// ============ 시험 API ============

// 시험 결과 제출
app.post('/api/exam/submit', authenticateToken, async (req, res) => {
  try {
    const { lesson_id, score, answers } = req.body;
    const userId = req.user.userId;

    if (!lesson_id || score === undefined || !answers) {
      return res.status(400).json({ error: '필수 정보가 없습니다' });
    }

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // exam_results에 저장
      const result = await conn.query(
        'INSERT INTO exam_results (user_id, lesson_id, score, answers) VALUES (?, ?, ?, ?)',
        [userId, lesson_id, score, JSON.stringify(answers)]
      );

      // user_progress 조회
      const [progressRows] = await conn.query(
        'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?',
        [userId, lesson_id]
      );

      if (progressRows.length > 0) {
        // 기존 기록 업데이트
        const newBestScore = Math.max(progressRows[0].best_score, score);
        await conn.query(
          'UPDATE user_progress SET best_score = ?, attempt_count = attempt_count + 1, last_attempted = NOW() WHERE user_id = ? AND lesson_id = ?',
          [newBestScore, userId, lesson_id]
        );
      } else {
        // 새 기록 생성
        await conn.query(
          'INSERT INTO user_progress (user_id, lesson_id, best_score, attempt_count, last_attempted) VALUES (?, ?, ?, 1, NOW())',
          [userId, lesson_id, score]
        );
      }

      await conn.commit();

      res.json({
        success: true,
        result_id: result[0].insertId
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('시험 제출 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 사용자 기록 조회
app.get('/api/user/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const conn = await pool.getConnection();

    try {
      const [rows] = await conn.query(
        'SELECT * FROM user_progress WHERE user_id = ? ORDER BY last_attempted DESC',
        [userId]
      );

      res.json({
        progress: rows || []
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('기록 조회 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 특정 강의의 시험 결과 조회
app.get('/api/exam/history/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.userId;

    const conn = await pool.getConnection();

    try {
      const [rows] = await conn.query(
        'SELECT * FROM exam_results WHERE user_id = ? AND lesson_id = ? ORDER BY submitted_at DESC',
        [userId, lessonId]
      );

      res.json({
        results: rows || []
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('시험 결과 조회 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// ============ 헬스 체크 ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
