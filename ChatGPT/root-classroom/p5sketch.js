// p5 스케치 객체를 저장하는 변수 (여러 번 호출될 때 이전 것을 지우기 위해)
let welcomeSketch = null;
// 현재 로그인한 사용자의 이름을 저장
let currentUsername = '';

// 문자열을 숫자로 변환하는 함수
// 같은 이름이면 같은 숫자가 나오므로 패턴을 일관되게 생성할 수 있음
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// 웰컴 카드에 사용자별 패턴을 그리는 함수
function initWelcomeCard(username) {
  // 사용자 이름 저장
  currentUsername = username;

  // 이미 존재하는 스케치가 있으면 제거 (중복 방지)
  if (welcomeSketch) {
    welcomeSketch.remove();
  }

  // HTML에서 'welcome-card' id를 가진 요소 찾기
  const container = document.querySelector('#welcome-card');
  if (!container) return;

  // p5.js 스케치 생성 (인스턴스 모드: 전역 오염 방지)
  welcomeSketch = new p5((p) => {
    // ===== 초기 설정 (한 번만 실행) =====
    p.setup = function() {
      // 정사각형 캔버스 생성 (가로 250px, 세로 250px)
      p.createCanvas(250, 250);
      // 반복 그리기 없이 한 번만 그리기 (성능 향상)
      p.noLoop();
    };

    // ===== 그리기 (화면에 패턴 표현) =====
    p.draw = function() {
      // 캔버스의 가로, 세로 길이 저장
      const w = p.width;
      const h = p.height;

      // 배경색 설정 (밝은 크림색)
      p.background('#f0f5f0');

      // 같은 사용자는 같은 패턴이 나오도록 난수 시드 설정
      p.randomSeed(hashString(currentUsername));

      // 선의 색상 (검은색) 및 굵기 설정
      p.stroke('#1a1a1a');
      p.strokeWeight(1.5);
      p.noFill(); // 선만 그리고 내부는 채우지 않음

      // 격자 간격 (픽셀 단위)
      const step = 35;

      // ===== 첫 번째 대각선 패턴: 좌상단 → 우하단 =====
      for (let startX = -h; startX < w + h; startX += step) {
        p.line(startX, 0, startX + h, h);
        p.line(startX + h/2, 0, startX + h/2 + h, h);
      }

      // ===== 두 번째 대각선 패턴: 우상단 → 좌하단 (교차 형성) =====
      for (let startY = -w; startY < h + w; startY += step) {
        p.line(w, startY, 0, startY + w);
        p.line(w, startY + w/2, 0, startY + w/2 + w);
      }

      // ===== 정사각형 추가 (교차점 주변에 배치) =====
      // 다시 같은 난수로 시작 (정사각형 위치 일정하게)
      p.randomSeed(hashString(currentUsername));
      // 격자 위치마다 검사
      for (let x = 0; x < w; x += step * 0.8) {
        for (let y = 0; y < h; y += step * 0.8) {
          // 50% 확률로 정사각형 그리기
          if (p.random() > 0.5) {
            // 정사각형 크기 (10~16px 사이의 랜덤)
            const size = 10 + p.random() * 6;
            // 정사각형 내부 색 (검은색)
            p.fill('#1a1a1a');
            // 위치에 약간의 랜덤성 추가해서 더 자연스럽게
            p.rect(x + p.random() * 8, y + p.random() * 8, size, size);
            // 다음 요소를 위해 채우기 해제
            p.noFill();
          }
        }
      }
    };
  }, 'welcome-card');
}
