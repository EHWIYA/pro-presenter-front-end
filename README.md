# pro-presenter-front-end

성경 구절 빌드 및 ProPresenter 송출용 **모바일 퍼스트 PWA**.  
**pro-api(NAS)** 만 호출하며, 에이전트·ProPresenter·Home Assistant에는 직접 연결하지 않습니다.

## 스택

- React 19 + TypeScript (strict)
- Vite 6 · React Router 7 · TanStack Query 5
- CSS Modules · 자체 UI 컴포넌트 (Tailwind/MUI 없음)
- PWA (`vite-plugin-pwa`)

## 로컬 개발

```bash
npm install
npm run icons   # public/icons 생성
npm run dev     # http://localhost:5174
```

`.env` 기본값: `VITE_USE_MOCK=true` (API 없이 동작)

실 API 연동:

```bash
cp .env.example .env
# VITE_USE_MOCK=false 로 변경
npm run dev
```

## 검증 (IoT Web 패턴)

```powershell
npm run test:dev
# 또는
npm run lint
npm run build
```

## MVP 흐름

1. **연결** — venue 선택 · probe → 성공 시 **홈** 이동
2. **홈** — 프레젠테이션·그룹·슬라이드 수 목록
3. **구절** — 성경 구절 입력 → POST build → `slide_map`
4. **찬양** — analyze → 구간 편집 → build-song → `slide_map` + trigger
5. **송출** — 구절 flow용 trigger (찬양은 찬양 탭에서 직접 송출)

## 환경 변수

| 변수 | 설명 |
|------|------|
| `VITE_API_BASE_URL` | pro-api 베이스 URL |
| `VITE_USE_MOCK` | `true` 시 mock (네트워크 없음) |

## 배포

`main` 푸시 시 GitHub Actions → **Tailscale (`TS_AUTH_KEY`)** → **rsync (`NAS_SSH_KEY`)** → NAS.

Hwiya IoT Web·백엔드 Deploy NAS와 **동일 패턴** (OAuth 미사용).

| Secret | 설명 |
|--------|------|
| `TS_AUTH_KEY` | Tailscale auth key (IoT/백엔드와 재사용 가능) |
| `NAS_SSH_KEY` | NAS SSH 배포 키 (IoT/백엔드와 동일) |

선택: `NAS_HOST` · `NAS_DEPLOY_PATH` · `NAS_DEPLOY_USER` (미설정 시 NAS 공조 기본값 사용)  
자세한 내용: [.github/DEPLOY.md](.github/DEPLOY.md)

운영: PWA **https://pro-app.iwhya.kr** · API **https://pro-api.iwhya.kr**

## 프로젝트 구조

```
src/
  api/           # fetch client, types, mock
  hooks/
  features/      # venue, worship, settings
  components/
  layouts/       # AppShell
  styles/
scripts/
  generate-pwa-icons.mjs
```
