# [프론트→백엔드] PWA 홈·프레젠테이션 목록 API 공조 요청

**발신**: pro-presenter-front-end  
**수신**: pro-presenter-back-end  
**참고**: PWA https://pro-app.iwhya.kr · API https://pro-api.iwhya.kr

---

## 1. 요약

| 항목 | 내용 |
|------|------|
| 프론트 배포 | `main` 푸시 시 GHA → NAS rsync (자동) |
| 화면 흐름 | **연결**(`/`) probe 성공 → **홈**(`/home`) 자동 이동 |
| 신규 API 필요 | `GET /venues/{venue_id}/presentations` (제안, 상세 §3) |
| 당분간 | 라이브 빌드는 위 API **404** 시 홈에 에러 표시 · mock은 로컬만 |

worship `build`/`trigger`·`probe`·`GET /venues` 연동은 기존 안내 기준 유지합니다.  
이번 메일은 **홈 프레젠테이션·그룹·슬라이드 수 목록** API 협의용입니다.

---

## 2. 프론트에서 이미 반영한 pro-api 정합 (참고)

| 이슈 | 프론트 처리 |
|------|-------------|
| `GET /venues` | 응답 `{ "venues": [...] }` 래핑 정규화 |
| `GET /venues/{id}/probe` | 응답 `ok` → UI `agent_reachable` 매핑 |
| worship build/trigger | 경로·body(`text`, `index`) 변경 없음 |

---

## 3. 제안 API — 프레젠테이션 목록

### 엔드포인트 (프론트 정본 초안)

```
GET /venues/{venue_id}/presentations
```

- **인증**: worship·probe와 동일 (당분간 `X-API-Key` 없음)
- **데이터 소스**: ProPresenter API (NAS → Tailscale → 현장 `pp_port`)
- **표시 정책**: 프론트는 **라벨 + 슬라이드/그룹 수치만** 표시 (본문·미리보기·썸네일 없음)

### 응답 예시

```json
{
  "venue_id": "test",
  "presentations": [
    {
      "id": "pres-uuid-or-path-id",
      "label": "주일 1부",
      "group_count": 3,
      "slide_count": 42,
      "groups": [
        { "label": "찬양", "slide_count": 8 },
        { "label": "말씀", "slide_count": 24 },
        { "label": "봉헌", "slide_count": 10 }
      ]
    }
  ]
}
```

| 필드 | 설명 |
|------|------|
| `presentations[].id` | PP 식별자 (UUID·경로 등 — 백엔드 정의) |
| `presentations[].label` | 프레젠테이션 표시명 |
| `presentations[].group_count` | 그룹 개수 (`groups.length`와 동일 권장) |
| `presentations[].slide_count` | 프레젠테이션 전체 슬라이드 수 |
| `groups[].label` | 그룹(룩/섹션) 라벨 |
| `groups[].slide_count` | 해당 그룹 슬라이드 수 |

### 에러 (참고)

| HTTP | 의미 |
|------|------|
| 404 | `venue_id` 미등록 |
| 502 | PP/Tailscale 미연결 (probe 실패와 유사) |
| 200 + `presentations: []` | 빈 라이브러리 (권장) |

레포 상세: `docs/api-presentations.md`  
프론트 호출: `src/api/presentations.ts` · `useVenuePresentations`

---

## 4. 화면·라우팅 (백엔드 영향 없음)

| 경로 | 탭 | 설명 |
|------|-----|------|
| `/` | 연결 | 장소 선택 · probe · 성공 시 `/home` |
| `/home` | 홈 | 위 API 결과 목록 |
| `/worship/build`, `/worship/trigger` | 기존 | 변경 없음 |
| `/venue` | — | `/` 리다이렉트 (호환) |

---

## 5. 협의 질문

1. 경로 확정: `/presentations` vs 다른 네이밍 (`/presenter/inventory` 등)
2. `id` 형식 (PP UUID, 파일 경로, 인덱스)
3. 그룹 정의 (PP presentation group / look / section 매핑)
4. 빈 목록·PP 권한 없음 시 `[]` vs 4xx
5. 배포 일정 알려주시면 PWA 재배포 없이 API만으로 홈 동작 가능 (이미 경로 하드코딩)

---

## 6. 로컬·운영 확인용 curl (API 배포 후)

```bash
curl -s https://pro-api.iwhya.kr/venues/test/presentations
```

브라우저: 연결(probe OK) → **홈** 탭에서 목록 표시.

---

## 7. 레포·커밋

| 항목 | 값 |
|------|-----|
| 프론트 레포 | EHWIYA/pro-presenter-front-end |
| 최근 커밋 | `8b33132` feat 연결·홈·mock · `docs` presentations 스펙 |
| 스펙 문서 | `docs/api-presentations.md` |

이슈(404, 필드명 불일치, CORS)는 `venue_id`·응답 JSON 샘플과 함께 공유 부탁드립니다.

감사합니다.
