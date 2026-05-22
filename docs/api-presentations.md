# 프레젠테이션 목록 API (프론트 초안 · 백엔드 협의용)

홈 화면: 연결(probe) 성공 후, 선택 현장 PC의 **프레젠테이션·그룹·슬라이드 수**만 표시 (본문·미리보기 없음).

## 제안 엔드포인트

```
GET /venues/{venue_id}/presentations
```

- 인증: worship·probe와 동일 (당분간 X-API-Key 없음)
- 데이터 소스: ProPresenter API (NAS → Tailscale → `pp_port`)

## 응답 (프론트 정본)

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
| `presentations[].label` | 프레젠테이션 표시명 |
| `presentations[].group_count` | 그룹 개수 (UI 배지용, `groups.length`와 동일 권장) |
| `presentations[].slide_count` | 프레젠테이션 전체 슬라이드 수 |
| `groups[].label` | 그룹(룩/섹션) 라벨 |
| `groups[].slide_count` | 해당 그룹 슬라이드 수만 (수치) |

## 에러 (참고)

| HTTP | 의미 |
|------|------|
| 404 | venue 미등록 |
| 502 | PP/Tailscale 미연결 (probe 실패와 유사) |

## 프론트 연동

- `src/api/presentations.ts` — `fetchVenuePresentations`
- `VITE_USE_MOCK=true` 시 `mockFetchVenuePresentations`
- 라이브: 위 경로 배포 전까지 404 → 홈에서 에러 배너

## 질문 (백엔드 협의)

1. 경로 `/presentations` vs `/presenter/inventory` 등 네이밍
2. `id` 형식 (PP UUID, 경로, 인덱스)
3. 빈 라이브러리·권한 없음 시 `presentations: []` vs 4xx
