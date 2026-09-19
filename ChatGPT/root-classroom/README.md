# 뿌리노트

브라우저에서 `index.html`을 열면 실행되는 개인 학습용 웹사이트입니다. 빌드나 패키지 설치는 필요 없습니다. 외부 웹폰트를 불러오지 못하면 시스템 글꼴로 표시됩니다.

- 뿌리강의 재생목록 2~9번째 영상, 각 20문제씩 총 160문제, 객관식 4지선다
- 보기 순서 무작위, 문항 간 이동, 미응답 제출 방지
- 100점 기준 채점, 주제별 정답 수, 오답과 해설, 재응시
- 브라우저 저장소에 최근 50회 점수 저장, 홈에는 최근 10회 표시

## 콘텐츠 상태

출제 범위는 [원본 영상](https://www.youtube.com/watch?v=Kl5EcYd3G2E)의 업로더가 제공한 설명과 챕터입니다. 2026-09-14에 공개 페이지에서 확인했습니다. 영상 제목은 “비개발자 바이브코더를 위해 만든, 가볍게 들어도 깊게 남는 프론트엔드 기본 지식”이며 길이는 29분 12초입니다. 자막 본문은 가져오지 못했으므로 전체 발언을 대조한 시험은 아닙니다. 강사의 표현이나 세부 사례 대신 목차에 명시된 개념과 적용 판단을 묻습니다.

각 문제 형식은 `[주제, 질문, [정답, 오답1, 오답2, 오답3], 해설, 챕터 시작 초]`입니다. 첫 보기가 정답이며 화면에서는 보기 순서를 섞습니다. 문제당 5점입니다. 해설의 영상 링크는 해당 개념이 속한 챕터 시작점이며 개별 발언의 정확한 시점은 아닙니다.

2강 범위: 웹의 기본 4문제, 브라우저와 UI 6문제, 개발 도구 5문제, 웹 앱 구조 5문제. 3강은 백엔드와 데이터, API와 로그인, 성능과 안정성, 확장과 배포 각 5문제입니다. 이전 예시 시험과 점수를 혼합하지 않도록 저장 키를 분리했으며 이전 브라우저 기록은 삭제하지 않습니다. 3강 추가 시에는 2강 저장 키를 그대로 유지하여 기존 2강 기록을 보존하고 강의 ID로 성적을 구분합니다.

개념 교차 확인: [MDN 렌더링](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work), [React 렌더와 커밋](https://react.dev/learn/render-and-commit), [React 하이드레이션](https://react.dev/reference/react-dom/client/hydrateRoot), [Node.js 소개](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs), [webpack 트리 쉐이킹](https://webpack.js.org/guides/tree-shaking/).

## 저장 범위

서버, 회원가입, 기기 간 동기화는 없습니다. 시험 도중의 답안은 메모리에만 남고 페이지를 새로고침하면 초기화됩니다. 완료된 점수만 localStorage에 저장되며 브라우저 설정이나 파일 URL 정책에 따라 저장이 제한될 수 있습니다. 객관식 정답률을 제공하며 실제 실무 능력을 검증하지는 않습니다.

## 3강 출처

[원본 영상](https://www.youtube.com/watch?v=0SGfDKMLdaI): “비개발자 바이브코더가 가장 두려워하는 단어 백엔드 딱 이 내용만 알면 됩니다”, 27분 18초. 2026-09-14에 공개 영상 설명과 챕터를 확인했습니다. 2강과 동일하게 공개 목차 기반이며 전체 자막 대조는 하지 않았습니다.

추가 개념 확인: [PostgreSQL 트랜잭션](https://www.postgresql.org/docs/current/tutorial-transactions.html), [JWT 소개](https://www.jwt.io/introduction), [Docker 개요](https://docs.docker.com/get-started/docker-overview/).

## 4~9강 추가

번호는 사용자가 지정한 기존 2·3강과 일관되게 재생목록 순서를 사용합니다. 영상 설명에서는 5번째 영상을 4강, 마지막 9번째 영상을 8강으로 부릅니다. 실제 영상 연결은 아래 표를 기준으로 합니다. 공개 설명·챕터에 명시된 주제에 맞춘 개념·응용 문제이며, 영상의 모든 발언과 실습 결과를 확인한 시험은 아닙니다. 링크는 관련 챕터 시작점이며 개별 문제의 정확한 발언 시점은 아닙니다. 상세 출처는 `lecture-sources.json`에 기록했습니다.

| 표시 | 주제 | 원본 | 문제 수 |
|---|---|---|---|
| 4강 | DB와 스토리지 | [영상](https://www.youtube.com/watch?v=yFuxjOHKips) | 20 |
| 5강 | 웹서버와 배포 | [영상](https://www.youtube.com/watch?v=rESpjQLptUs) | 20 |
| 6강 | AI와 딥러닝 기초 | [영상](https://www.youtube.com/watch?v=4iP-KGCKOx4) | 20 |
| 7강 | LLM의 작동 원리 | [영상](https://www.youtube.com/watch?v=Z_zR-WanGuQ) | 20 |
| 8강 | RAG 챗봇 | [영상](https://www.youtube.com/watch?v=l1Q4MoKRpkA) | 20 |
| 9강 | AI 업무 자동화 | [영상](https://www.youtube.com/watch?v=4f1kveGwI70) | 20 |

2·3강의 데이터와 저장 키는 유지합니다. 새 강의는 고유 ID로 점수를 구분합니다.

추가 개념 확인: [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html), [Supabase](https://supabase.com/docs), [Hugging Face LLM 과정](https://huggingface.co/learn/llm-course/en/chapter1/1), [LangChain](https://docs.langchain.com/oss/python/langchain/overview), [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview), [LangSmith](https://docs.langchain.com/langsmith/observability), [검색과 RAG](https://docs.langchain.com/oss/python/deepagents/retrieval).
