# [공통] pro-presenter-data 동기화 · 5팀 책임 정리

**작성**: pro-presenter-front-end (찬양 라이브러리 장애 조사 기반)  
**일자**: 2026-07-01  
**참고 URL**: PWA https://pro-app.iwhya.kr · API https://pro-api.iwhya.kr  
**관련 화면**: `/worship/song` (찬양 · 라이브러리)

---

## 0. 왜 이 문서인가

찬양 라이브러리에서 곡 선택 시 아래 오류가 발생했습니다.

```json
{
  "detail": {
    "message": "곡 파일을 찾을 수 없습니다: Libraries/성가곡/성가테스트.pro",
    "hint": "agent URL: http://100.99.47.84:8787/library/songs/..."
  }
}
```

**근본 원인**: `pro-presenter-data` Git 정본이 **NAS(카탈로그)** 와 **현장 PC(에이전트 런타임)** 에서 **서로 다른 내용**을 가리키고 있었음.

| 위치 | 당시 상태 | 담당 성격 |
|------|-----------|-----------|
| NAS `live/data/pro-presenter-data` | pytest **fixture 5곡** (테스트곡·주님의 마음 등) | 서버 + 백엔드 카탈로그 |
| PC `%USERPROFILE%\Documents\pro-presenter` | **실제 예배용** 곡 (찬양 10곡, 성가곡 2곡 등) | 데이터 + 에이전트 |

5팀 레포 분리는 맞으나, **동일 Git 정본을 두 복사본에 맞추는 운영 계약**이 없어 틈이 났습니다.  
이 문서는 팀별 **해야 할 일·하지 말 것·완료 기준**을 공유합니다.

---

## 1. 공통 정본 (모든 팀 합의)

| 항목 | 정본 |
|------|------|
| PP 자산·곡 `.pro` | GitHub **`EHWIYA/pro-presenter-data`** `main` |
| 곡 ID (`songId`) | `{libraryCategory}/{제목}` — 예: `찬양/먼저 그 나라와 의를 구하라` |
| 카탈로그 API | NAS BFF가 마운트된 data repo `Libraries/*.pro` 스캔 |
| 구간·빌드 런타임 | 현장 에이전트가 PC `Documents\pro-presenter\Libraries\` 의 `.pro` 읽기/쓰기 |
| pytest fixture | `pro-presenter-back-end/api/data/fixtures/pro-presenter-data` — **운영 NAS에 복사 금지** |

**원칙**: 목록(NAS)과 선택(PC)이 같은 commit의 같은 파일명을 가리켜야 합니다.

---

## 2. 데이터 팀 (pro-presenter-data)

**수신**: `EHWIYA/pro-presenter-data` 관리자

### 현재 문제

- NAS 카탈로그에 **fixture 전용 곡**(성가테스트, 테스트곡, 빌드곡 등)만 보였고, 실제 PC repo와 불일치.
- 찬송가 파일명 예: 카탈로그 `413.내 평생` vs PC `413.내 평생에 가는 길` — **stem 불일치 시 songId 불일치**.

### 요청 사항

| # | 작업 | 우선순위 |
|---|------|----------|
| 1 | **정본은 Git `main`만** — NAS·PC는 clone/pull 사본 | 필수 |
| 2 | 신규·수정 곡은 `Libraries/{찬양\|찬송가\|성가곡}/<제목>.pro` 로 commit | 필수 |
| 3 | `.pro` stem = API `songId`의 제목 부분과 **완전 일치** (공백·번호·마침표 포함) | 필수 |
| 4 | fixture용 테스트 곡을 **data repo에 넣지 않음** (pytest는 back-end fixture만) | 필수 |
| 5 | 예배 후 워크플로: PP에서 편집 → `Libraries/` commit/push → 서버·현장 pull | 필수 |

### 하지 말 것

- BFF API로 곡 저장 기대 (410 — data repo에서만 편집)
- `worship-2.pro` 단일 정본 개념으로 신규 곡 추가

### 완료 기준

- [ ] `main`에 운영 곡만 존재 (테스트곡·성가테스트 등 fixture명 없음)
- [ ] `paths.standard.json` · agent handoff의 폴더명(찬양/찬송가/성가곡)과 일치
- [ ] push 후 서버팀·현장 PC pull 안내 (Slack/메일 1줄)

### 참고 문서

- data repo `docs/data/repo.md`, `docs/handoff/theme-profiles.md`
- back-end `docs/handoff/song-catalog.md`

---

## 3. 서버 팀 (NAS · GHA · Tailscale)

**수신**: NAS `~/pro-presenter/live` 운영

### 현재 문제

- `data/pro-presenter-data`가 **Git clone이 아닌 pytest fixture 복사본**으로 보임.
- `deploy.sh`에 data repo 동기화 단계가 없었음 (2026-07-01 back-end PR에 `sync-data-repo.sh` 추가됨 — **배포 필요**).

### 요청 사항

| # | 작업 | 우선순위 |
|---|------|----------|
| 1 | NAS에서 **1회** `./bin/sync-data-repo.sh` 실행 — fixture 디렉터리를 Git clone으로 교체 | **즉시** |
| 2 | `install-live-remote.sh` 또는 수동으로 `ops/bin/sync-data-repo.sh`·갱신 `deploy.sh` 반영 | 필수 |
| 3 | 이후 **매 배포** 시 `deploy.sh`가 `sync-data-repo.sh` 자동 실행 | 필수 |
| 4 | `GET https://pro-api.iwhya.kr/health` → `song_catalog.revision`이 Git short SHA인지 확인 | 필수 |
| 5 | `song_catalog.count`가 fixture 5곡이 아닌 **실제 곡 수**(현재 PC 기준 10+곡)인지 확인 | 필수 |

### NAS 1회 실행 예시

```bash
cd /home/iwh/pro-presenter/live
# back-end ops 반영 후
chmod +x bin/sync-data-repo.sh
./bin/sync-data-repo.sh
docker compose restart pro-presenter-api
curl -s http://127.0.0.1:8003/health | jq .song_catalog
```

### 하지 말 것

- `api/data/fixtures/pro-presenter-data` 를 NAS `data/pro-presenter-data`에 rsync
- Docker 이미지 내부 `/app/data/fixtures` 를 `DATA_REPO_PATH`로 사용 (volume 마운트만 정본)

### 완료 기준

- [ ] `data/pro-presenter-data/.git` 존재, `origin` = `EHWIYA/pro-presenter-data`
- [ ] `/health` → `song_catalog.configured: true`, `revision` ≠ null, `count` ≥ 실제 운영 곡 수
- [ ] `GET /api/v1/songs?limit=5` 에 **성가테스트·테스트곡 없음**, 실제 곡명 표시

### 참고

- `ops/data/README.md` (갱신됨)
- `ops/bin/sync-data-repo.sh`, `deploy.sh`

---

## 4. 백엔드 팀 (pro-presenter-back-end)

**수신**: BFF · pro-api

### 현재 문제

- 카탈로그(NAS data mount)와 에이전트(PC) 불일치 시 `GET /songs/{id}?venueId=` 가 **404**로 실패해 프론트 곡 선택 불가.
- `docs/system/overview.md`에 **폐기된 Postgres 곡 DB** 언급 잔존 (문서 드리프트).

### 이미 반영된 코드 (배포 대기)

| 변경 | 내용 |
|------|------|
| `songs_api.py` | agent sections 실패 시 **200 + sectionsHint** (곡 메타는 반환) |
| `ops/bin/sync-data-repo.sh` | NAS data repo Git sync |
| `deploy.sh` | 배포 전 sync 호출 |
| 테스트 | `test_catalog_get_detail_with_venue_agent_miss` 추가 |

### 추가 요청 사항

| # | 작업 | 우선순위 |
|---|------|----------|
| 1 | 위 변경 **`main` 머지 + NAS 배포** | **즉시** |
| 2 | `/health` `song_catalog`에 `path`·`revision`·`count` — 서버팀 모니터링용 유지 | 필수 |
| 3 | `docs/system/overview.md` 갱신: 곡 DB 제거, data repo catalog 명시 | 권장 |
| 4 | `GET /venues/{id}/library/songs/{id}/sections` 는 agent 실패 시 **502/404 유지** (명시적 프록시) — get_song만 soft-fail | 참고 |

### API 계약 (에이전트·프론트 공유)

```
GET /api/v1/songs                           ← NAS data repo 스캔
GET /api/v1/songs/{songId}?venueId=         ← 메타 + (가능 시) sections / sectionsHint
GET /api/v1/venues/{venueId}/library/songs/{songId}/sections  ← 에이전트 프록시
POST /api/v1/worship/build-song             ← songId 또는 sections
```

정본: `docs/handoff/song-catalog.md`

### 완료 기준

- [ ] NAS 배포 후 `GET /songs/찬양/먼저%20그%20나라와%20의를%20구하라?venueId=hwiya-pc` → **200**, sections 또는 sectionsHint
- [ ] fixture 곡 ID로 목록 조회 시 **항목 없음** (서버 sync 후)

---

## 5. 에이전트 팀 (pro-presenter-agent)

**수신**: 현장 Windows 에이전트 · 런처

### 현재 문제

- 에이전트는 정상 (`/health` OK)이나 **PC 로컬 Libraries에 NAS 카탈로그 곡 파일 없음**.
- `GET /library/songs/{category}/{stem}/sections` → `Libraries/{category}/{stem}.pro` 경로 조회.

### 요청 사항

| # | 작업 | 우선순위 |
|---|------|----------|
| 1 | `config.json` → `pp_show_directory` = `%USERPROFILE%\Documents\pro-presenter` 확인 | 필수 |
| 2 | `sync_assets_on_launch: true` → 예배 시작 시 **data repo `git pull`** 동작 확인 | 필수 |
| 3 | 수동: `scripts\sync-assets-repo.ps1` 또는 `Documents\pro-presenter`에서 `git pull --ff-only` | **즉시** |
| 4 | `/library/songs/.../sections` 계약 유지 — stem = `.pro` 파일명(확장자 제외) | 필수 |
| 5 | `paths.standard.json`(data repo)과 library_category 폴더명 정합 | 필수 |

### 하지 말 것

- NAS 마운트 경로를 에이전트가 직접 읽기 (에이전트는 **항상 로컬 PP show directory**)

### 완료 기준

- [ ] `GET http://127.0.0.1:8787/library/songs/찬양/먼저%20그%20나라와%20의를%20구하라/sections` → 200 + sections
- [ ] PC `Documents\pro-presenter` git revision ≈ NAS `/health` `song_catalog.revision` (동기화 후)

### 참고

- `pro-presenter/docs/handoff/agent.md`

---

## 6. 프론트 팀 (pro-presenter-front-end)

**수신**: PWA

### 현재 문제

- 곡 로드 실패 시 라이브러리 홈에 에러 미표시, BFF `detail: { message, hint }` 파싱 누락으로 메시지 깨짐/누락.

### 이미 반영된 코드 (배포 대기)

| 변경 | 내용 |
|------|------|
| `songAnalyzeError.ts` | `detail.message` + `hint` 객체 파싱 |
| `client.ts` / `song.ts` | `Accept: application/json; charset=utf-8` |
| `SongPage.tsx` | 라이브러리·후보 목록에서 `loadError` 배너 |

### 배포 후 기대 동작

1. 서버·데이터 sync 후 라이브러리 목록 = **실제 운영 곡**
2. 곡 선택 → 상세 화면 진입 (sections 있으면 표시, 없으면 `sectionsHint`)
3. PC에 `.pro` 없어도 **404로 화면 전체 실패하지 않음** (백엔드 배포 후)

### 프론트가 기대하는 백엔드·데이터 전제

- `songId` URL encoding: `encodeURIComponent` (슬래시 포함)
- 목록 `GET /api/v1/songs` items에 `libraryCategory`, `presentationFilename` 포함
- 곡 편집 API 없음 (410) — UI는 “data repo에서 관리” 안내 유지

### 완료 기준

- [ ] PWA 배포 후 라이브러리에 fixture 곡명 없음
- [ ] 실제 곡 선택 → 상세 → PP 빌드 가능 (agent·PP 연결 시)

---

## 7. RACI (요약)

| 활동 | 데이터 | 서버 | 백엔드 | 에이전트 | 프론트 |
|------|:------:|:----:|:------:|:--------:|:------:|
| `.pro` 내용·Git commit | **R/A** | I | I | C | I |
| NAS data repo clone/pull | C | **R/A** | C | I | I |
| 카탈로그 API (`/songs`) | C | C | **R/A** | I | I |
| PC data repo pull | **R** | I | I | **A** (런처) | I |
| agent sections/build | C | I | C | **R/A** | I |
| PWA UI | I | I | C | I | **R/A** |
| 배포 (NAS API·PWA) | I | **R/A** | C | I | C |

R = 실행, A = 책임, C = 협의, I = 참고

---

## 8. 통합 검증 체크리스트 (5팀 공동)

배포·sync 완료 후 **한 곡**으로 end-to-end 확인:

```bash
# 1) NAS 카탈로그 revision
curl -s -H "X-API-Key: $KEY" https://pro-api.iwhya.kr/health | jq .song_catalog

# 2) 목록에 실제 곡 존재 (예: 찬양/먼저 그 나라와 의를 구하라)
curl -s -H "X-API-Key: $KEY" \
  "https://pro-api.iwhya.kr/api/v1/songs?q=먼저&limit=5"

# 3) venue 연동 상세 (200 + sections 또는 sectionsHint)
curl -s -H "X-API-Key: $KEY" \
  "https://pro-api.iwhya.kr/api/v1/songs/%EC%B0%AC%EC%96%91/%EB%A8%BC%EC%A0%80%20%EA%B7%B8%20%EB%82%98%EB%9D%BC%EC%99%80%20%EC%9D%98%EB%A5%BC%20%EA%B5%AC%ED%95%98%EB%9D%BC?venueId=hwiya-pc"

# 4) 현장 에이전트 (PC에서)
curl -s "http://127.0.0.1:8787/library/songs/찬양/먼저%20그%20나라와%20의를%20구하라/sections"
```

**PWA**: 찬양 → 라이브러리 → 곡 선택 → 상세 → PP 빌드

---

## 9. 팀별 메일/슬랙 복사용 한 줄

| 팀 | 복사용 |
|----|--------|
| **데이터** | NAS·PC 카탈로그 불일치 원인 조사됨. **pro-presenter-data `main`만 정본**, fixture 곡은 data repo에 넣지 말 것. push 후 서버·현장 pull 부탁. |
| **서버** | NAS `data/pro-presenter-data`가 pytest fixture로 채워져 있었음. **`./bin/sync-data-repo.sh` 1회 + deploy 연동** 후 `/health` song_catalog revision 확인 부탁. |
| **백엔드** | agent miss 시 get_song 404 → **200+sectionsHint** 패치 준비됨. **main 배포** + overview.md 곡 DB 문구 정리 부탁. |
| **에이전트** | 에이전트 정상, PC에 `.pro` 없어서 404. **`Documents\pro-presenter` git pull** + launch 시 sync 확인 부탁. |
| **프론트** | 에러 표시·한글 API 파싱 패치 준비됨. **서버 data sync + 백엔드 배포 후** PWA 배포하면 라이브러리 정상화 예상. |

---

## 10. 레포·문서

| 항목 | 경로 |
|------|------|
| 이 문서 | `pro-presenter-front-end/docs/handoff/five-teams-data-sync.md` |
| 곡 카탈로그 계약 | `pro-presenter-back-end/docs/handoff/song-catalog.md` |
| 에이전트 handoff | `pro-presenter/docs/handoff/agent.md` |
| NAS data sync | `pro-presenter-back-end/ops/bin/sync-data-repo.sh` |

이슈 재발 시 **요청 URL · `/health` song_catalog · PC `git rev-parse HEAD` · 에이전트 hint 경로** 네 가지를 함께 공유해 주세요.
