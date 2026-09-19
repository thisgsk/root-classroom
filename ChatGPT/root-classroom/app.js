// ========== 전역 변수 설정 ==========
// 메인 화면을 표시할 HTML 요소 가져오기
const app = document.querySelector('#app');
// 백엔드 API 서버 주소
const API_URL = 'https://root-classroom-api2.onrender.com/api';
// 브라우저에 저장될 학습 기록의 이름 (로컬스토리지 키)
const STORE = 'root-classroom-lesson2-history-v1';
// 사용자의 과거 시험 기록 배열
let history = [];
// 브라우저 로컬스토리지 사용 가능 여부
let storageAvailable = true;
// 현재 로그인한 사용자 정보
let currentUser = null;
// 로그인 토큰 (서버 인증용)
let token = localStorage.getItem('token');

// 저장된 학습 기록 불러오기 (유효성 검사 포함)
try {
  const saved = JSON.parse(localStorage.getItem(STORE) || '[]');
  if (Array.isArray(saved)) history = saved.filter(r => r && LESSONS.some(l => l.id === r.lesson) && Number.isFinite(r.score) && r.score >= 0 && r.score <= 100 && Number.isFinite(r.date)).slice(0, 50);
} catch { storageAvailable = false; }
// 현재 응시 중인 시험 정보
let exam = null;

// ========== 로그인/회원가입 함수 ==========

// 사용자 로그인 처리 (이메일과 비밀번호로 인증)
async function login(email, password) {
  try {
    // 서버의 로그인 API 호출
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify({email, password})
    });
    const data = await response.json();

    // 로그인 실패 시 처리
    if (!response.ok) {
      alert(data.error || '로그인 실패');
      return false;
    }

    // 로그인 성공 시 토큰과 사용자 정보 저장
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    // 홈 페이지로 이동
    home();
    return true;
  } catch (error) {
    alert('서버 연결 실패: ' + error.message);
    return false;
  }
}

// 새로운 계정 생성 (회원가입)
async function signup(email, username, password) {
  try {
    // 서버의 회원가입 API 호출
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify({email, username, password})
    });
    const data = await response.json();

    // 회원가입 실패 시 처리
    if (!response.ok) {
      alert(data.error || '회원가입 실패');
      return false;
    }

    // 회원가입 성공 시 자동 로그인
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    // 홈 페이지로 이동
    home();
    return true;
  } catch (error) {
    alert('서버 연결 실패: ' + error.message);
    return false;
  }
}

// 사용자 로그아웃 처리
function logout() {
  // 토큰과 사용자 정보 삭제
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  // 로그인 페이지로 이동
  showLoginPage();
}
// ========== 유틸리티 함수 ==========

// HTML 특수문자를 이스케이프 (XSS 공격 방지)
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

// 배열 항목을 랜덤하게 섞기 (시험 문제 순서 무작위화)
function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}

// HTML을 화면에 표시하고 상단으로 스크롤
function render(html) {
  app.innerHTML = html;
  window.scrollTo(0, 0);
  // 제목이 있으면 포커스 설정 (접근성)
  const title = app.querySelector('h1');
  if (title) { title.tabIndex = -1; title.focus({preventScroll:true}); }
}
// 로그인 페이지 표시
function showLoginPage() {
  render(`<section class="hero"><div><div class="eyebrow">UNDERSTAND. PRACTICE. GROW.</div><h1>뿌리노트<br>로그인</h1><p>계정에 로그인하면 모든 기기에서<br>학습 기록을 동기화할 수 있습니다.</p></div></section>
    <section class="cards" style="max-width: 900px; margin: 30px auto; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
      <article class="card" style="padding: 30px; text-align: center;">
        <div style="font-size: 60px; margin-bottom: 15px;">📚</div>
        <h3 style="margin-bottom: 10px;">비디오 강의</h3>
        <p style="color: #666; margin-bottom: 15px; font-size: 14px;">YouTube에서 명확한 설명을 받으세요</p>
        <a href="https://www.youtube.com/@root-classroom" target="_blank" style="display: inline-block; padding: 10px 20px; background: #FF0000; color: white; border-radius: 4px; text-decoration: none; font-weight: bold;">📺 채널 방문</a>
      </article>
      <article class="card" style="padding: 30px;">
        <h2 style="margin-bottom: 20px;">로그인</h2>
        <input type="text" id="login-email" placeholder="이메일 또는 사용자명" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
        <input type="password" id="login-password" placeholder="비밀번호" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
        <button class="wide" onclick="handleLogin()" style="margin-top: 20px; width: 100%;">로그인 →</button>
        <button class="secondary" onclick="toggleSignup()" style="margin-top: 10px; width: 100%;">계정이 없으신가요? 회원가입</button>
      </article>
    </section>
    <div class="notice" style="max-width: 900px; margin: 20px auto;"><b>로그인 또는 회원가입</b><br>계정으로 로그인하면 학습 진도가 서버에 저장됩니다.</div>`);

  document.querySelector('#login-email').addEventListener('keypress', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.querySelector('#login-password').addEventListener('keypress', e => {
    if (e.key === 'Enter') handleLogin();
  });
}

function toggleSignup() {
  showSignupPage();
}

function showSignupPage() {
  render(`<section class="hero"><div><div class="eyebrow">UNDERSTAND. PRACTICE. GROW.</div><h1>뿌리노트<br>회원가입</h1><p>계정을 만들면 모든 기기에서<br>학습 기록을 동기화할 수 있습니다.</p></div></section>
    <section class="cards" style="max-width: 900px; margin: 30px auto; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
      <article class="card" style="padding: 30px; text-align: center;">
        <div style="font-size: 60px; margin-bottom: 15px;">📚</div>
        <h3 style="margin-bottom: 10px;">비디오 강의</h3>
        <p style="color: #666; margin-bottom: 15px; font-size: 14px;">YouTube에서 명확한 설명을 받으세요</p>
        <a href="https://www.youtube.com/@root-classroom" target="_blank" style="display: inline-block; padding: 10px 20px; background: #FF0000; color: white; border-radius: 4px; text-decoration: none; font-weight: bold;">📺 채널 방문</a>
      </article>
      <article class="card" style="padding: 30px;">
        <h2 style="margin-bottom: 20px;">회원가입</h2>
        <input type="email" id="signup-email" placeholder="이메일" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
        <input type="text" id="signup-username" placeholder="사용자명" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
        <input type="password" id="signup-password" placeholder="비밀번호" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
        <button class="wide" onclick="handleSignup()" style="margin-top: 20px; width: 100%;">회원가입 →</button>
        <button class="secondary" onclick="showLoginPage()" style="margin-top: 10px; width: 100%;">이미 계정이 있으신가요? 로그인</button>
      </article>
    </section>
    <div class="notice" style="max-width: 900px; margin: 20px auto;"><b>새 계정 생성</b><br>회원가입 후 학습을 시작하세요.</div>`);
}

async function handleLogin() {
  const email = document.querySelector('#login-email').value;
  const password = document.querySelector('#login-password').value;

  if (!email || !password) {
    alert('이메일과 비밀번호를 입력해주세요');
    return;
  }

  await login(email, password);
}

async function handleSignup() {
  const email = document.querySelector('#signup-email').value;
  const username = document.querySelector('#signup-username').value;
  const password = document.querySelector('#signup-password').value;

  if (!email || !username || !password) {
    alert('모든 필드를 입력해주세요');
    return;
  }

  if (password.length < 6) {
    alert('비밀번호는 최소 6글자 이상이어야 합니다');
    return;
  }

  await signup(email, username, password);
}

function home() {
  exam = null;
  const leafContent = currentUser ? `<div style="background: #e8f0e8; border: 1px solid #dde3d8; border-radius: 20px; padding: 40px; max-width: 900px;"><div style="display: flex; gap: 30px; align-items: center; flex-direction: row-reverse;"><div style="flex: 0 0 auto;"><h3 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #1a1a1a;">환영합니다</h3><div style="font-size: 14px; color: #2d5a3d; line-height: 1.8;"><div>${currentUser.username}님</div><button class="quiet" onclick="logout()" style="padding: 0; font-size: 14px; margin-top: 6px;">로그아웃</button></div></div><div id="welcome-card" style="width: 250px; height: 250px; flex-shrink: 0; overflow: hidden; border-radius: 12px;"></div></div></div>` : '';

  render(`<section class="hero"><div><div class="eyebrow">UNDERSTAND. PRACTICE. GROW.</div><h1>들은 내용을,<br>내 지식으로 만드는 시간.</h1><p>강의를 보고 끝내지 말고, 20문제로 확인해 보세요.<br>틀린 문제는 다음 배움의 시작이 됩니다.</p></div>${leafContent ? `<div class="leaf">${leafContent}</div>` : ''}</section>
    <div class="notice"><b>강의별 공개 목차에 맞춘 20문제입니다.</b><br>원본 영상 설명의 챕터를 기준으로 출제했습니다. 자막 전체와 대조한 버전은 아닙니다. 강의 번호는 재생목록 순서이며 영상 설명의 번호와 다를 수 있습니다. 채점 후 해설에서 관련 챕터로 돌아갈 수 있습니다.</div>
    <div class="section-heading"><h2>뿌리강의 이해도 시험</h2>${LESSONS.length}개 강의 · 각 20문제</div>
    <section class="cards">${LESSONS.map(l => {
      const records = history.filter(r => r.lesson === l.id);
      return `<article class="card"><span class="number">${Number(l.number)}강 · 목차 기반</span><h2>${l.title}</h2><p>${l.description}</p><a href="${l.videoUrl}" target="_blank" rel="noopener noreferrer">원본 강의 보기 ↗</a><div class="tags">${l.topics.map(t => `<span>${t}</span>`).join('')}</div><div class="meta">객관식 20문제 · 문제당 5점 · 시간 제한 없음<br>${records.length ? `최근 ${records[0].score}점 · 최고 ${Math.max(...records.map(r => r.score))}점` : '아직 응시 기록이 없어요'}</div><button class="wide" data-start="${l.id}">이해도 확인하기 →</button></article>`;
    }).join('')}</section>
    <div class="notice"><b>강의별 공개 목차에 맞춘 20문제입니다.</b><br>원본 영상 설명의 챕터를 기준으로 출제했습니다. 자막 전체와 대조한 버전은 아닙니다. 강의 번호는 재생목록 순서이며 영상 설명의 번호와 다를 수 있습니다. 채점 후 해설에서 관련 챕터로 돌아갈 수 있습니다.</div>
    <div class="section-heading"><h2>뿌리강의 이해도 시험</h2>${LESSONS.length}개 강의 · 각 20문제</div>
    <section class="cards">${LESSONS.map(l => {
      const records = history.filter(r => r.lesson === l.id);
      return `<article class="card"><span class="number">${Number(l.number)}강 · 목차 기반</span><h2>${l.title}</h2><p>${l.description}</p><a href="${l.videoUrl}" target="_blank" rel="noopener noreferrer">원본 강의 보기 ↗</a><div class="tags">${l.topics.map(t => `<span>${t}</span>`).join('')}</div><div class="meta">객관식 20문제 · 문제당 5점 · 시간 제한 없음<br>${records.length ? `최근 ${records[0].score}점 · 최고 ${Math.max(...records.map(r => r.score))}점` : '아직 응시 기록이 없어요'}</div><button class="wide" data-start="${l.id}">이해도 확인하기 →</button></article>`;
    }).join('')}</section>
    <div class="section-heading"><h2>나의 학습 기록</h2><span>최근 50회까지 저장</span></div>
    ${!storageAvailable ? '<p class="status">브라우저 저장소를 사용할 수 없어 기록이 저장되지 않을 수 있습니다.</p>' : ''}
    ${history.length ? `<table class="history"><thead><tr><th>응시일</th><th>강의</th><th>점수</th><th>결과</th></tr></thead><tbody>${history.slice(0,10).map(r => `<tr><td>${escapeHtml(new Date(r.date).toLocaleString('ko-KR'))}</td><td>${LESSONS.find(l => l.id === r.lesson).title}</td><td>${r.score}점</td><td>${grade(r.score)}</td></tr>`).join('')}</tbody></table>` : '<p class="empty">첫 시험을 마치면 이곳에 학습 기록이 쌓입니다.</p>'}`);
  app.querySelectorAll('[data-start]').forEach(b => b.onclick = () => start(b.dataset.start));

  // 웰컴카드 초기화
  if (currentUser) {
    setTimeout(() => initWelcomeCard(currentUser.username), 100);
  }

}
function start(id) {
  const lesson = LESSONS.find(l => l.id === id);
  exam = {lesson, index:0, answers:Array(lesson.questions.length).fill(null), options:lesson.questions.map(q => shuffle(q[2].map((text, original) => ({text, original})))), started:Date.now(), submitted:false};
  quiz();
}
function quiz() {
  const {lesson,index,answers,options} = exam;
  const q = lesson.questions[index];
  const count = answers.filter(a => a !== null).length;
  render(`<section class="quiz"><div class="topline"><button class="quiet" id="leave">← 강의 목록</button><span class="muted">${lesson.number}강 ${lesson.title} · 목차 기반</span></div><div class="progress" aria-label="${count}개 답변 완료"><div style="width:${count / answers.length * 100}%"></div></div><div class="topline"><span class="eyebrow">QUESTION ${String(index+1).padStart(2,'0')} / ${answers.length}</span><span class="muted">${count}개 답변 완료</span></div><h1 class="question">${q[1]}</h1><div role="group" aria-label="답안 선택">${options[index].map((o,j) => `<button class="option" data-answer="${j}" aria-pressed="${answers[index] === j}"><b>${j+1}</b><span>${o.text}</span></button>`).join('')}</div><div class="actions"><button class="secondary" id="prev" ${index === 0 ? 'disabled' : ''}>← 이전</button>${index < answers.length-1 ? '<button id="next">다음 문제 →</button>' : '<button id="submit">제출하고 결과 보기</button>'}</div><p class="status" id="status" role="status"></p><nav class="question-nav" aria-label="문제 이동">${answers.map((a,i) => `<button data-go="${i}" aria-label="${i+1}번 문제${a !== null ? ', 답변 완료' : ', 미응답'}" ${i===index ? 'aria-current="step"' : ''} class="${a !== null ? 'answered' : ''} ${i===index ? 'current' : ''}">${i+1}</button>`).join('')}</nav><p class="muted" style="font-size:12px">모든 문제에 답한 뒤 제출할 수 있습니다. 응시 중 새로고침하면 답안이 초기화됩니다.</p></section>`);
  app.querySelectorAll('[data-answer]').forEach(b => b.onclick = () => {
    exam.answers[index] = Number(b.dataset.answer);
    quiz();
    app.querySelector(`[data-answer="${b.dataset.answer}"]`).focus();
  });
  app.querySelectorAll('[data-go]').forEach(b => b.onclick = () => {exam.index=Number(b.dataset.go);quiz();});
  document.querySelector('#prev').onclick=()=>{exam.index--;quiz();};
  const next = document.querySelector('#next');
  if(next) next.onclick=()=>{exam.index++;quiz();};
  const submit = document.querySelector('#submit');
  if(submit) submit.onclick=()=>{
    if (count < answers.length) { document.querySelector('#status').textContent=`아직 ${answers.length-count}문제가 남았습니다. 아래 번호로 이동해 답을 선택해 주세요.`;return; }
    finish();
  };
  document.querySelector('#leave').onclick=()=>{if(window.confirm('응시를 종료하고 목록으로 돌아갈까요? 현재 답안은 저장되지 않습니다.'))home();};
}
function formatTime(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
function grade(score) {return score >= 80 ? '기초 이해 양호' : score >= 60 ? '핵심 개념 복습' : '기초부터 다시 확인';}
function finish() {
  if(exam.submitted) return;
  exam.submitted=true;
  exam.correct=exam.answers.map((a,i)=>exam.options[i][a].original===0);
  exam.score=exam.correct.filter(Boolean).length*5;
  exam.seconds=Math.round((Date.now()-exam.started)/1000);
  history.unshift({lesson:exam.lesson.id,score:exam.score,date:Date.now()});
  history=history.slice(0,50);
  try{localStorage.setItem(STORE,JSON.stringify(history));storageAvailable=true;}catch{storageAvailable=false;}
  results(false);
}
function results(onlyWrong) {
  const {lesson,score,correct,answers,options,seconds} = exam;
  const topics = {};
  lesson.questions.forEach((q,i)=>{topics[q[0]] ??= {total:0,right:0};topics[q[0]].total++;if(correct[i])topics[q[0]].right++;});
  const weak=Object.entries(topics).filter(([,v])=>v.right<v.total).map(([t])=>t);
  render(`<section class="quiz"><div class="topline"><button class="quiet" id="home">← 강의 목록</button><span class="muted">${lesson.number}강 ${lesson.title} · 시험 결과</span></div><div class="score"><div class="eyebrow">YOUR LEARNING REPORT</div><strong>${score}<span style="font-size:22px;letter-spacing:0"> 점</span></strong><h1>${grade(score)}</h1><p class="muted">${weak.length ? `다음 복습 주제: ${weak.join(', ')}` : '모든 문제를 맞혔어요. 배운 개념을 작은 프로젝트에 적용해 보세요.'}</p></div><div class="summary"><div><strong>${correct.filter(Boolean).length}/20</strong><span>맞힌 문제</span></div><div><strong>${20-correct.filter(Boolean).length}개</strong><span>복습할 문제</span></div><div><strong>${Math.floor(seconds/60)}분 ${seconds%60}초</strong><span>응시 시간</span></div></div><div class="notice">이 점수는 공개 목차 기반 20문제의 정답률입니다. 80점 이상은 기초 이해 양호, 60점 이상은 핵심 개념 복습으로 안내합니다.</div>${!storageAvailable ? '<p class="status" role="status">이번 결과를 브라우저에 저장하지 못했습니다. 현재 화면에서 점수를 확인해 주세요.</p>' : ''}<h2>주제별 이해도</h2>${Object.entries(topics).map(([t,v])=>`<div class="topic-row"><span>${t}</span><span>${v.right} / ${v.total} 정답</span></div>`).join('')}<div class="section-heading"><h2>답안과 해설</h2><button class="secondary" id="filter" aria-pressed="${onlyWrong}">${onlyWrong ? '전체 문제 보기' : '오답만 보기'}</button></div>${onlyWrong && correct.every(Boolean) ? '<p class="empty">틀린 문제가 없습니다.</p>' : ''}${lesson.questions.map((q,i)=>onlyWrong&&correct[i]?'':`<article class="review"><span class="badge ${correct[i]?'correct':''}">${correct[i]?'정답':'복습 필요'} · ${q[0]}</span><h3>${i+1}. ${q[1]}</h3><p>내 답: ${options[i][answers[i]].text}</p>${!correct[i]?`<p><b>정답: ${q[2][0]}</b></p>`:''}<p class="explanation">${q[3]}</p><a href="${lesson.videoUrl}&amp;t=${q[4]}s" target="_blank" rel="noopener noreferrer">${formatTime(q[4])} 관련 챕터 다시 보기 ↗</a></article>`).join('')}<div class="actions"><button class="secondary" id="list">강의 목록</button><button id="retry">다시 도전하기 →</button></div></section>`);
  document.querySelector('#home').onclick=home;
  document.querySelector('#list').onclick=home;
  document.querySelector('#filter').onclick=()=>results(!onlyWrong);
  document.querySelector('#retry').onclick=()=>start(lesson.id);
}
window.addEventListener('beforeunload',event=>{if(exam&&!exam.submitted){event.preventDefault();event.returnValue='';}});

// 초기화: 토큰이 있으면 홈, 없으면 로그인 페이지
if (token) {
  currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (currentUser.id) {
    home();
  } else {
    showLoginPage();
  }
} else {
  showLoginPage();
}
