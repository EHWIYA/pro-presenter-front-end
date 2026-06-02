# NAS GHA 배포 (IoT Web·백엔드 Deploy NAS 동일 패턴)

운영 URL: **https://pro-app.iwhya.kr**

## GitHub Secrets (필수)

| Secret | 설명 |
|--------|------|
| `TS_AUTH_KEY` | Tailscale reusable auth key (IoT Web 또는 백엔드 Deploy NAS와 **동일 키 재사용**) |
| `NAS_SSH_KEY` | NAS SSH private key (IoT·백엔드 GHA와 **동일 배포 키**) |

## GitHub Secrets / Variables (선택 — 미설정 시 아래 기본값)

| 이름 | 기본값 (NAS 공조 회신) |
|------|------------------------|
| `NAS_HOST` 또는 `DEPLOY_HOST` | `100.88.40.125` |
| `NAS_DEPLOY_PATH` 또는 `DEPLOY_PATH` | `/home/iwh/pro-presenter/web/dist` |
| `NAS_DEPLOY_USER` 또는 `DEPLOY_USER` | `iwh` |

## Repository Variables (선택)

| Variable | 권장값 |
|----------|--------|
| `VITE_API_BASE_URL` | `https://pro-api.iwhya.kr` |

## 배포 흐름

1. `npm run build` → `dist/`
2. `tailscale/github-action` + `authkey: TS_AUTH_KEY`
3. `rsync -avz --delete dist/` → `iwh@100.88.40.125:/home/iwh/pro-presenter/web/dist/`
4. (선택) NAS `post-deploy.sh` 실행

## 수동 실행

Actions → **Deploy PWA to NAS** → Run workflow

## pro-api

- HTTPS·CORS(`https://pro-app.iwhya.kr`) — NAS 준비 완료
- worship·song — PWA → NAS만 호출, 별도 API Key 없음

## 첫 배포 후 확인

- https://pro-app.iwhya.kr — 플레이스홀더 HTML → 실제 PWA `dist/`로 교체되었는지
- PWA manifest / Service Worker (HTTPS 필수)
