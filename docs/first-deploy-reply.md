# NAS 공조 회신 — 첫 배포 일정 메일 (초안)

**제목:** Re: [공조] Pro Presenter PWA — 첫 GHA 배포 일정 안내

안녕하세요,

회신 주신 NAS GHA 수신 설정을 반영해 `pro-presenter-front-end` 배포 workflow를 **TS_AUTH_KEY + NAS_SSH_KEY** 방식(IoT Web·백엔드 Deploy NAS와 동일)으로 수정했습니다.

**레포 측 준비**
- workflow: Tailscale `authkey` → rsync `iwh@100.88.40.125:/home/iwh/pro-presenter/web/dist/`
- Secrets: `TS_AUTH_KEY`, `NAS_SSH_KEY` (등록 완료 확인)
- 선택 Secret 미설정 시 호스트·경로·사용자는 공조 회신 기본값 사용

**첫 배포 예정:** [날짜/시간 기입]  
**실행 방법:** `main` merge 후 Actions 자동 실행, 또는 workflow_dispatch 수동 실행

배포 직후 https://pro-app.iwhya.kr 에서 플레이스홀더 → PWA 교체 여부 확인하겠습니다.  
해당 시각에 rsync·nginx 로그 함께 봐 주시면 감사하겠습니다.

pro-api worship(build/trigger) 운영 배포 완료 — 경로·body 변경 없음. API Key(P1) 도입 시 `VITE_API_KEY` 재빌드 예정.

감사합니다.
