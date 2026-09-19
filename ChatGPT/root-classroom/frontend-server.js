const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;

// 정적 파일 제공
app.use(express.static(__dirname));

// 모든 요청을 index.html로 라우팅 (SPA)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎯 프론트엔드 서버: http://localhost:${PORT}`);
  console.log(`🚀 백엔드 서버: http://localhost:3001`);
  console.log(`\n브라우저에서 http://localhost:${PORT} 를 열어주세요`);
});
