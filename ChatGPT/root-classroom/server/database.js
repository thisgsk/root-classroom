const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL 연결 풀
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'root_classroom',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool;
pool.getConnection().then(conn => {
  console.log('✅ MySQL 연결 성공');
  conn.release();
}).catch(err => {
  console.error('DB 연결 실패:', err);
});

// 테이블 생성 (async 함수)
const initDatabase = async () => {
  try {
    const conn = await pool.getConnection();

    // users 테이블
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ users 테이블 준비됨');

    // exam_results 테이블
    await conn.query(`
      CREATE TABLE IF NOT EXISTS exam_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        lesson_id VARCHAR(255) NOT NULL,
        score INT NOT NULL,
        answers LONGTEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ exam_results 테이블 준비됨');

    // user_progress 테이블
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        lesson_id VARCHAR(255) NOT NULL,
        best_score INT DEFAULT 0,
        attempt_count INT DEFAULT 0,
        last_attempted TIMESTAMP,
        UNIQUE(user_id, lesson_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ user_progress 테이블 준비됨');

    conn.release();
  } catch (err) {
    console.error('테이블 생성 실패:', err);
  }
};

module.exports = {
  db,
  initDatabase
};
