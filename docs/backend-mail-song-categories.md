# [프론트→백엔드] 찬양 곡 라이브러리 · 장르(카테고리) API 공조 요청

> **상태: 보류** — 프론트는 UI·페이지 흐름만 먼저 완성 중입니다. 백엔드 작업은 **한꺼번에** 진행할 때 이 문서를 기준으로 메일·스펙 확정하세요.

**발신**: pro-presenter-front-end  
**수신**: pro-presenter-back-end  
**참고**: PWA https://pro-app.iwhya.kr · API https://pro-api.iwhya.kr  
**관련 화면**: `/worship/song` (찬양 탭)

---

## 1. 요약

| 항목 | 내용 |
|------|------|
| 프론트 현황 | 기본 장르 **3종**(찬양·성가곡·특송) + **사용자 추가 카테고리** · 장르 선택은 **검수·저장** 단계만 |
| 사용자 카테고리 저장 | **당분간 브라우저 `localStorage`만** (기기·브라우저별, API 미연동) |
| 백엔드 필요 시점 | 곡 `category` 필드 영속화 · 목록 필터 · **팀 공통 카테고리** 동기화가 필요할 때 |
| 기존 API | `GET/POST /api/v1/songs`, `PUT .../sections`, `build-song` 등 — `category` 쿼리·필드 추가 제안 |

song analyze·build-song·trigger 흐름은 기존과 동일합니다.  
이번 공조는 **곡 메타데이터 `category` + (선택) 카테고리 마스터 API** 입니다.

---

## 2. 프론트 정본 — 카테고리 ID

### 2.1 기본 장르 (고정 3종)

| `category` 값 | UI 라벨 | 비고 |
|---------------|---------|------|
| `praise` | 찬양 | 현대 찬양·워십 |
| `hymn` | 성가곡 | 전통 성가 |
| `special` | 특송 | 특별 찬양·연주 |

### 2.2 사용자 추가 카테고리

| 규칙 | 예시 |
|------|------|
| ID 형식 | `custom:<slug>` (`slug`: 소문자·숫자·한글·하이픈) |
| 라벨 | 사용자 입력 문자열 (최대 24자) |
| 프론트 저장 | `localStorage` 키 `pro-presenter:song-categories:custom` |

예: `custom:주일-1부` · 라벨 `주일 1부`

### 2.3 하위 호환 (프론트 정규화)

백엔드에 예전 값이 남아 있으면 프론트가 아래처럼 매핑합니다.

| 구 값 | → 신 값 |
|------|---------|
| `chantsong`, `gospel`, `worship` | `special` |
| `contemporary`, `other` | `praise` |

---

## 3. 제안 API — 곡 `category` 필드 (필수에 가깝음)

### 3.1 곡 상세·목록·생성·수정

다음 스키마에 **`category: string`** 추가를 요청합니다.

```json
{
  "songId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "주님의 마음",
  "artist": null,
  "category": "praise",
  "tags": [],
  "sectionCount": 2,
  "updatedAt": "2026-06-02T05:13:17+00:00"
}
```

| 엔드포인트 | 변경 |
|------------|------|
| `GET /api/v1/songs` | 응답 `items[].category` · 쿼리 `?category=praise` (필터) |
| `GET /api/v1/songs/{songId}` | `category` |
| `POST /api/v1/songs` | body `{ "title", "sections", "category"? }` |
| `PUT /api/v1/songs/{songId}/sections` | body `{ "sections", "title?", "category"? }` |

- **기본값**: `category` 생략 시 `praise` 권장  
- **검증**: `praise` \| `hymn` \| `special` \| `custom:*` 패턴 (백엔드 정의)

프론트 코드: `src/api/types.ts` · `src/api/normalize.ts` · `src/api/songs.ts`

### 3.2 목록 필터 (이미 프론트 전송)

```
GET /api/v1/songs?q=주님&category=hymn&limit=20&offset=0
```

| 쿼리 | 설명 |
|------|------|
| `q` | 제목·아티스트 검색 (기존) |
| `category` | 장르 ID (`praise`, `custom:주일-1부` 등) |

---

## 4. 제안 API — 카테고리 마스터 (선택, 2단계)

팀·venue 단위로 **사용자 추가 카테고리를 서버에 저장**하려면 아래 API가 필요합니다.  
(프론트는 1단계로 localStorage만 사용 중 → **백엔드 배포 전에도 PWA 동작**)

### 4.1 카테고리 목록

```
GET /api/v1/song-categories
```

```json
{
  "builtin": ["praise", "hymn", "special"],
  "custom": [
    { "id": "custom:주일-1부", "label": "주일 1부", "createdAt": "2026-06-05T00:00:00Z" }
  ]
}
```

### 4.2 카테고리 추가·삭제

```
POST /api/v1/song-categories
{ "label": "주일 1부" }
→ 201 { "id": "custom:주일-1부", "label": "주일 1부" }

DELETE /api/v1/song-categories/custom:%EC%A3%BC%EC%9D%BC-1%EB%B6%80
```

- 삭제 시 해당 `category`를 쓰는 곡 처리: `praise`로 fallback vs 삭제 불가 — **협의 필요**

### 4.3 스코프 (협의)

| 옵션 | 설명 |
|------|------|
| A. 전역 | 모든 venue·사용자 공통 |
| B. venue | `?venue_id=` 또는 path에 venue (연결 탭 venue와 동일) |
| C. 사용자 | 인증 도입 후 |

---

## 5. 프론트 구현 상태 (백엔드 없이)

| 기능 | 상태 |
|------|------|
| UI 기본 3종 선택 | ✅ |
| 사용자 카테고리 추가·삭제 | ✅ (localStorage) |
| 라이브러리 장르 필터 | ✅ (mock·API `category` 쿼리) |
| 곡 저장 시 `category` 전송 | ✅ body에 포함 (mock·실 API) |
| 서버 카테고리 목록 동기화 | ❌ → §4 API 후 연동 예정 |

레포: `src/lib/songCategoryStore.ts` · `src/hooks/useSongCategories.ts` · `src/features/song/SongCategory*.tsx`

---

## 6. 협의 질문

1. **`special` / 「특송」** ID·라벨 확정 (프론트 정본)
2. 곡 `category` 필드 **배포 일정** (`GET/POST/PUT` + 목록 `?category=`)
3. 사용자 카테고리 **서버 저장 시 스코프** (§4.3 A/B/C)
4. `custom:*` ID 생성 규칙을 프론트 slug와 동일하게 할지
5. 카테고리 삭제 시 **참조 중인 곡** 처리 정책
6. analyze·library hit 응답에 `category` 포함 여부

---

## 7. 로컬·운영 확인용 curl (API 배포 후)

```bash
# 목록 + 장르 필터
curl -s -H "X-API-Key: $KEY" \
  "https://pro-api.iwhya.kr/api/v1/songs?category=hymn&limit=10"

# 곡 생성
curl -s -X POST -H "Content-Type: application/json" -H "X-API-Key: $KEY" \
  -d '{"title":"테스트","category":"praise","sections":[]}' \
  "https://pro-api.iwhya.kr/api/v1/songs"
```

PWA: **찬양 → 라이브러리** 장르 칩 · **신규·악보** 장르 선택 · **카테고리 추가·관리**

---

## 8. 백엔드 작업이 필요할 때

| 상황 | 프론트 | 백엔드 |
|------|--------|--------|
| 지금 (데모·소수 인원) | localStorage 카테고리로 충분 | 곡 `category`만 DB에 저장해도 목록·필터 가능 |
| 여러 기기·운영팀 공통 분류 | §4 카테고리 API 연동 PR | §4 + 곡 `category` FK/문자열 검증 |
| analyze가 장르 추론 | UI만 | `parsed.suggested_category` 등 선택 |

**이 메일(§3 필수, §4 선택)을내면 백엔드 일정·스키마 확정 후 프론트가 localStorage → API 동기화 PR** 을 올리면 됩니다.

---

## 9. 레포·문서

| 항목 | 값 |
|------|-----|
| 프론트 레포 | EHWIYA/pro-presenter-front-end |
| 화면 | `src/features/song/SongPage.tsx` |
| 타입 | `SongCategory`, `BuiltinSongCategory` in `src/api/types.ts` |
| 공조 템플릿 | `docs/backend-mail-presentations.md` (동일 형식) |

이슈(필드 누락, `category` 422, 필터 무시)는 **요청 URL·응답 JSON 샘플**과 함께 공유 부탁드립니다.

감사합니다.
