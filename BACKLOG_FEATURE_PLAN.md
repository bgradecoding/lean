# 린 캔버스 - 고객 문제 백로그 기능 추가 계획

## 📋 목차
1. [개요](#개요)
2. [기능 요구사항](#기능-요구사항)
3. [구현 Task 목록](#구현-task-목록)
4. [데이터 모델 설계](#데이터-모델-설계)
5. [UI/UX 설계](#uiux-설계)
6. [API 설계](#api-설계)
7. [구현 우선순위](#구현-우선순위)

---

## 개요

### 현재 상태
- 린 캔버스 9개 블록을 관리하는 MVP 시스템
- Canvas별로 문제, 솔루션, 가치 제안 등을 작성하고 관리

### 목표
- **고객 문제 백로그 시스템** 추가
- 고객 미팅, 인터뷰, 설문조사 등에서 수집한 문제들을 백로그로 관리
- 백로그의 문제들을 린 캔버스의 "문제(Problem)" 블록과 연결
- 문제 검증 및 우선순위 관리 기능

### 기대 효과
1. 고객 문제를 체계적으로 수집하고 관리
2. 린 캔버스 작성 시 실제 고객 데이터 기반 의사결정
3. 문제 검증 추적 및 우선순위 관리

---

## 기능 요구사항

### 1. 백로그 관리
- [ ] 고객 문제 백로그 생성
- [ ] 백로그 편집 및 삭제
- [ ] 백로그 목록 조회
- [ ] 백로그 검색 및 필터링

### 2. 백로그 상세 정보
- [ ] 문제 제목 및 상세 설명
- [ ] 문제 출처 (고객 미팅, 인터뷰, 설문 등)
- [ ] 우선순위 (High, Medium, Low)
- [ ] 상태 (New, Validated, In Canvas, Rejected)
- [ ] 태그 (고객 세그먼트별, 카테고리별)
- [ ] 날짜 정보 (발견일, 최종 수정일)

### 3. 린 캔버스 연동
- [ ] 백로그를 린 캔버스 "문제" 블록으로 연결
- [ ] 하나의 백로그를 여러 캔버스에 연결 가능
- [ ] 캔버스에서 연결된 백로그 목록 표시
- [ ] 백로그에서 연결된 캔버스 목록 표시

### 4. AI 지원
- [ ] 고객 인터뷰 노트에서 문제 자동 추출
- [ ] 백로그 기반 린 캔버스 문제 블록 자동 생성
- [ ] 유사한 문제 그룹화 제안

### 5. 협업 기능
- [ ] 백로그 공유 링크
- [ ] 백로그 댓글 (선택적)
- [ ] 백로그 히스토리 추적

---

## 구현 Task 목록

### Phase 1: 데이터 모델 및 API 기초 (Week 1) ✅ 완료

#### Task 1.1: 데이터베이스 스키마 설계 및 마이그레이션
**예상 시간**: 2-3시간
**상태**: ✅ 완료

- [x] `Backlog` 모델 정의
  - id, slug, title, description
  - source, priority, status
  - tags, discoveredAt
  - userId (소유자)

- [x] `CanvasBacklogLink` 모델 정의 (다대다 관계)
  - id, canvasId, backlogId
  - notes (연결 시 메모)

- [x] Prisma 스키마 작성
- [x] 마이그레이션 실행
- [x] 기존 데이터 영향도 확인

**파일**:
- `prisma/schema.prisma`
- `prisma/migrations/20251116110446_add_backlog_models/`

#### Task 1.2: TypeScript 타입 정의
**예상 시간**: 1시간
**상태**: ✅ 완료

- [x] `Backlog` 인터페이스 정의
- [x] `BacklogSource` enum (Meeting, Interview, Survey, Research, Other)
- [x] `BacklogPriority` enum (High, Medium, Low)
- [x] `BacklogStatus` enum (New, Validated, InCanvas, Rejected)
- [x] `CanvasBacklogLink` 인터페이스

**파일**:
- `types/index.ts` (업데이트 완료)

#### Task 1.3: 백로그 CRUD API 구현
**예상 시간**: 4-5시간
**상태**: ✅ 완료

- [x] `POST /api/backlog` - 새 백로그 생성
- [x] `GET /api/backlog` - 사용자의 모든 백로그 조회 (검색, 필터링 지원)
- [x] `GET /api/backlog/[slug]` - 특정 백로그 조회
- [x] `PATCH /api/backlog/[slug]` - 백로그 업데이트
- [x] `DELETE /api/backlog/[slug]` - 백로그 삭제

**파일**:
- `app/api/backlog/route.ts` (생성 완료)
- `app/api/backlog/[slug]/route.ts` (생성 완료)

#### Task 1.4: Canvas-Backlog 연결 API 구현
**예상 시간**: 3-4시간
**상태**: ✅ 완료

- [x] `POST /api/canvas/[slug]/backlog` - 캔버스에 백로그 연결
- [x] `GET /api/canvas/[slug]/backlog` - 캔버스 연결된 백로그 목록
- [x] `DELETE /api/canvas/[slug]/backlog/[backlogId]` - 연결 해제
- [x] `GET /api/backlog/[slug]/canvas` - 백로그와 연결된 캔버스 목록

**파일**:
- `app/api/canvas/[slug]/backlog/route.ts` (생성 완료)
- `app/api/canvas/[slug]/backlog/[backlogId]/route.ts` (생성 완료)
- `app/api/backlog/[slug]/canvas/route.ts` (생성 완료)

---

### Phase 2: 백로그 관리 UI (Week 2) ✅ 완료

#### Task 2.1: 백로그 목록 페이지
**예상 시간**: 4-5시간
**상태**: ✅ 완료

- [x] `/backlog` 라우트 페이지 생성
- [x] 백로그 목록 표시 (카드 그리드)
- [x] 검색 기능 (제목, 설명)
- [x] 필터링 (우선순위, 상태, 태그)
- [x] 정렬 (최신순, 우선순위순)
- [x] "새 백로그 추가" 버튼

**파일**:
- `app/backlog/page.tsx` (생성 완료)
- `components/backlog/backlog-list.tsx` (생성 완료)
- `components/backlog/backlog-card.tsx` (생성 완료)
- `components/backlog/backlog-filters.tsx` (생성 완료)

#### Task 2.2: 백로그 상세 페이지
**예상 시간**: 3-4시간
**상태**: ✅ 완료

- [x] `/backlog/[slug]` 라우트 페이지 생성
- [x] 백로그 상세 정보 표시
- [x] 인라인 편집 기능
- [x] 연결된 캔버스 목록 표시
- [x] 캔버스 연결 다이얼로그
- [x] 삭제 버튼 및 확인 모달

**파일**:
- `app/backlog/[slug]/page.tsx` (생성 완료)
- `components/backlog/linked-canvas-list.tsx` (생성 완료)
- `components/backlog/link-canvas-dialog.tsx` (생성 완료)

#### Task 2.3: 백로그 생성/편집 폼
**예상 시간**: 3-4시간
**상태**: ✅ 완료

- [x] 백로그 생성 다이얼로그
- [x] 폼 필드: 제목, 설명, 출처, 우선순위, 태그
- [x] 유효성 검사
- [x] 제출 및 에러 처리
- [x] 편집 모드 지원

**파일**:
- `components/backlog/backlog-form-dialog.tsx` (생성 완료)
- `components/backlog/backlog-form.tsx` (생성 완료)

#### Task 2.4: 백로그 카드 컴포넌트
**예상 시간**: 2-3시간
**상태**: ✅ 완료

- [x] 백로그 카드 UI 디자인
- [x] 우선순위 배지 (High: Red, Medium: Yellow, Low: Green)
- [x] 상태 배지 (New, Validated, In Canvas, Rejected)
- [x] 태그 표시
- [x] 출처 아이콘
- [x] 연결된 캔버스 수 표시
- [x] 호버 효과 및 클릭 동작

**파일**:
- `components/backlog/backlog-card.tsx` (생성 완료)
- `components/ui/badge.tsx` (생성 완료)
- `components/ui/label.tsx` (생성 완료)
- `components/ui/select.tsx` (생성 완료)

---

### Phase 3: 린 캔버스 통합 (Week 3) ✅ 완료

#### Task 3.1: 캔버스 페이지에 백로그 패널 추가
**예상 시간**: 4-5시간
**상태**: ✅ 완료

- [x] 캔버스 레이아웃 수정 (2칼럼 → 3칼럼 또는 사이드 패널)
- [x] 백로그 사이드 패널 컴포넌트
- [x] 연결된 백로그 목록 표시
- [x] "백로그 추가" 버튼
- [x] 백로그 빠른 미리보기
- [x] 토글 버튼으로 패널 숨김/표시

**파일**:
- `app/canvas/[slug]/page.tsx` (업데이트 완료)
- `components/canvas/canvas-layout.tsx` (생성 완료)
- `components/canvas/backlog-panel.tsx` (생성 완료)

#### Task 3.2: 백로그 → 캔버스 문제 블록 연동
**예상 시간**: 3-4시간
**상태**: ✅ 완료

- [x] 백로그 패널에서 "문제 블록에 추가" 버튼
- [x] 백로그 내용을 문제 블록에 자동 삽입
- [x] 여러 백로그 내용 병합 (자동 추가 방식)
- [x] 문제 블록에서 원본 백로그 링크 표시
- [x] 백로그 업데이트 시 캔버스 알림

**파일**:
- `components/canvas/backlog-panel.tsx` (업데이트 완료)
- `components/canvas/canvas-layout.tsx` (업데이트 완료)
- `components/canvas/canvas-grid.tsx` (업데이트 완료)

#### Task 3.3: 캔버스에서 백로그 생성
**예상 시간**: 2-3시간
**상태**: ✅ 완료

- [x] 문제 블록에서 "백로그로 저장" 버튼
- [x] 문제 블록 내용 → 백로그 자동 생성
- [x] 자동으로 캔버스와 연결
- [x] 성공 메시지 및 백로그 페이지 링크

**파일**:
- `components/canvas/canvas-block.tsx` (업데이트 완료)
- `components/canvas/save-to-backlog-dialog.tsx` (생성 완료)

#### Task 3.4: 백로그 필터링 및 정렬
**예상 시간**: 2시간

- [ ] 캔버스 백로그 패널에 필터 추가
- [ ] 우선순위별 필터
- [ ] 상태별 필터
- [ ] 정렬 옵션 (최신순, 우선순위순)

**파일**:
- `components/canvas/backlog-panel.tsx` (업데이트)

---

### Phase 4: AI 기능 통합 (Week 4)

#### Task 4.1: AI 백로그 추출 API
**예상 시간**: 3-4시간

- [ ] `POST /api/ai/extract-problems` 엔드포인트
- [ ] 고객 인터뷰 노트 입력
- [ ] Claude API로 문제 추출
- [ ] 구조화된 백로그 형태로 반환
- [ ] 우선순위 자동 제안

**파일**:
- `app/api/ai/extract-problems/route.ts` (신규)

#### Task 4.2: AI 백로그 → 캔버스 문제 블록 생성
**예상 시간**: 2-3시간

- [ ] 여러 백로그를 기반으로 문제 블록 자동 생성
- [ ] 백로그들의 공통 패턴 추출
- [ ] 린 캔버스 문제 블록 형식으로 요약
- [ ] 프롬프트 최적화

**파일**:
- `app/api/ai/generate/route.ts` (업데이트)

#### Task 4.3: 유사 백로그 그룹화 제안
**예상 시간**: 3-4시간

- [ ] `POST /api/ai/group-backlogs` 엔드포인트
- [ ] 백로그들의 유사도 분석
- [ ] 그룹화 제안 반환
- [ ] UI에서 그룹화 제안 표시
- [ ] 사용자가 그룹 수락/거부 가능

**파일**:
- `app/api/ai/group-backlogs/route.ts` (신규)
- `components/backlog/backlog-grouping.tsx` (신규)

#### Task 4.4: AI 기능 UI 통합
**예상 시간**: 3시간

- [ ] 백로그 목록에 "인터뷰 노트에서 추출" 버튼
- [ ] 인터뷰 노트 입력 모달
- [ ] AI 추출 결과 미리보기
- [ ] 추출된 백로그 일괄 생성
- [ ] 로딩 상태 및 에러 처리

**파일**:
- `components/backlog/ai-extract-dialog.tsx` (신규)

---

### Phase 5: 추가 기능 및 개선 (Week 5)

#### Task 5.1: 백로그 태그 시스템
**예상 시간**: 3-4시간

- [ ] 태그 자동완성 입력
- [ ] 태그별 필터링
- [ ] 태그 색상 코딩
- [ ] 인기 태그 표시
- [ ] 태그 관리 페이지

**파일**:
- `components/backlog/tag-input.tsx` (신규)
- `components/backlog/tag-filter.tsx` (신규)

#### Task 5.2: 백로그 공유 기능
**예상 시간**: 2-3시간

- [ ] 백로그 공유 링크 생성
- [ ] 공개/비공개 설정
- [ ] 공유 링크 복사 버튼
- [ ] 공유된 백로그 읽기 전용 뷰

**파일**:
- `components/backlog/share-dialog.tsx` (신규)
- `app/backlog/[slug]/page.tsx` (업데이트)

#### Task 5.3: 대시보드에 백로그 요약 추가
**예상 시간**: 2-3시간

- [ ] 대시보드에 백로그 통계 카드
- [ ] 최근 백로그 목록
- [ ] 우선순위별 백로그 수
- [ ] 미연결 백로그 알림
- [ ] "백로그 보기" 링크

**파일**:
- `app/page.tsx` (업데이트)
- `components/dashboard/backlog-summary.tsx` (신규)

#### Task 5.4: 백로그 검색 최적화
**예상 시간**: 2시간

- [ ] 전체 텍스트 검색 (제목 + 설명)
- [ ] 검색 결과 하이라이팅
- [ ] 검색 히스토리
- [ ] 검색어 자동완성

**파일**:
- `components/backlog/backlog-search.tsx` (신규)
- `app/api/backlog/search/route.ts` (신규)

#### Task 5.5: 백로그 히스토리 추적
**예상 시간**: 3-4시간

- [ ] `BacklogHistory` 모델 추가
- [ ] 백로그 변경 이력 저장
- [ ] 히스토리 뷰어 컴포넌트
- [ ] 변경 사항 diff 표시

**파일**:
- `prisma/schema.prisma` (업데이트)
- `components/backlog/backlog-history.tsx` (신규)

---

### Phase 6: 테스트 및 최적화 (Week 6)

#### Task 6.1: API 테스트
**예상 시간**: 4-5시간

- [ ] 백로그 CRUD API 테스트
- [ ] Canvas-Backlog 연결 API 테스트
- [ ] AI API 테스트
- [ ] 에러 케이스 테스트
- [ ] 권한 검증 테스트

**파일**:
- `__tests__/api/backlog.test.ts` (신규)
- `__tests__/api/canvas-backlog.test.ts` (신규)

#### Task 6.2: 컴포넌트 테스트
**예상 시간**: 3-4시간

- [ ] BacklogCard 테스트
- [ ] BacklogList 테스트
- [ ] BacklogForm 테스트
- [ ] BacklogPanel 테스트

**파일**:
- `__tests__/components/backlog/*.test.tsx` (신규)

#### Task 6.3: 데이터베이스 쿼리 최적화
**예상 시간**: 2-3시간

- [ ] N+1 쿼리 문제 확인
- [ ] 적절한 인덱스 추가
- [ ] 페이지네이션 구현
- [ ] 쿼리 성능 측정

**파일**:
- `prisma/schema.prisma` (업데이트)
- `app/api/backlog/route.ts` (업데이트)

#### Task 6.4: UI/UX 개선
**예상 시간**: 3-4시간

- [ ] 반응형 디자인 확인
- [ ] 모바일 최적화
- [ ] 로딩 스켈레톤 추가
- [ ] 애니메이션 및 트랜지션
- [ ] 접근성 개선 (aria-labels, 키보드 네비게이션)

**파일**:
- `components/backlog/*.tsx` (업데이트)
- `components/canvas/*.tsx` (업데이트)

#### Task 6.5: 문서화
**예상 시간**: 2-3시간

- [ ] README 업데이트
- [ ] API 문서 작성
- [ ] 사용자 가이드 작성
- [ ] 코드 주석 추가

**파일**:
- `README.md` (업데이트)
- `docs/BACKLOG_API.md` (신규)
- `docs/USER_GUIDE.md` (신규)

---

## 데이터 모델 설계

### Backlog 모델

```prisma
model Backlog {
  id          String   @id @default(cuid())
  slug        String   @unique

  // 기본 정보
  title       String
  description String?  @db.Text

  // 메타데이터
  source      String?  // Meeting, Interview, Survey, Research, Other
  priority    String   @default("Medium")  // High, Medium, Low
  status      String   @default("New")     // New, Validated, InCanvas, Rejected
  tags        String?  // 쉼표로 구분된 태그

  // 날짜
  discoveredAt DateTime @default(now())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // 관계
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  canvasLinks  CanvasBacklogLink[]
  history      BacklogHistory[]

  @@index([userId])
  @@index([status])
  @@index([priority])
}
```

### CanvasBacklogLink 모델 (다대다 관계)

```prisma
model CanvasBacklogLink {
  id         String   @id @default(cuid())

  canvasId   String
  canvas     Canvas   @relation(fields: [canvasId], references: [id], onDelete: Cascade)

  backlogId  String
  backlog    Backlog  @relation(fields: [backlogId], references: [id], onDelete: Cascade)

  notes      String?  @db.Text  // 연결 시 메모
  createdAt  DateTime @default(now())

  @@unique([canvasId, backlogId])
  @@index([canvasId])
  @@index([backlogId])
}
```

### Canvas 모델 업데이트

```prisma
model Canvas {
  // ... 기존 필드들

  backlogLinks CanvasBacklogLink[]
}
```

### User 모델 업데이트

```prisma
model User {
  // ... 기존 필드들

  backlogs Backlog[]
}
```

### BacklogHistory 모델 (선택적)

```prisma
model BacklogHistory {
  id         String   @id @default(cuid())

  backlogId  String
  backlog    Backlog  @relation(fields: [backlogId], references: [id], onDelete: Cascade)

  field      String   // 변경된 필드명
  oldValue   String?  @db.Text
  newValue   String?  @db.Text

  userId     String
  createdAt  DateTime @default(now())

  @@index([backlogId])
}
```

---

## UI/UX 설계

### 1. 백로그 목록 페이지 (`/backlog`)

```
┌─────────────────────────────────────────────────────────┐
│ 🏠 Dashboard  |  📋 Backlogs  |  🎨 Canvases           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  백로그 관리                          [+ 새 백로그 추가] │
│                                                         │
│  🔍 [검색...]                                           │
│  필터: [전체 ▾] [우선순위 ▾] [상태 ▾]   정렬: [최신순 ▾] │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ 🔴 High     │  │ 🟡 Medium   │  │ 🟢 Low      │    │
│  │ 로그인 속도 │  │ 가격 비교   │  │ 다크모드     │    │
│  │ 개선 필요    │  │ 기능 요청   │  │ 지원         │    │
│  │             │  │             │  │             │    │
│  │ 📌 2 Canvas │  │ 📌 1 Canvas │  │ 📌 0 Canvas │    │
│  │ #성능 #UX   │  │ #기능       │  │ #UI         │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. 백로그 상세 페이지 (`/backlog/[slug]`)

```
┌─────────────────────────────────────────────────────────┐
│ ← 백로그 목록                          [편집] [삭제]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  로그인 속도 개선 필요                      🔴 High     │
│  New                                                    │
│  #성능 #UX #로그인                                      │
│                                                         │
│  📝 설명:                                               │
│  고객 인터뷰에서 반복적으로 언급된 문제.                │
│  모바일 환경에서 로그인 시 3-5초 소요됨.                │
│                                                         │
│  📍 출처: Customer Interview                            │
│  📅 발견일: 2025-01-15                                  │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  연결된 캔버스 (2)                    [+ 캔버스 연결]   │
│                                                         │
│  • 모바일 앱 개선 프로젝트                              │
│  • 사용자 경험 최적화                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. 캔버스 페이지 with 백로그 패널

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← 대시보드    My Business Idea            [공유] [삭제] [백로그 ▾] │
├──────────────────────────────────┬──────────────────────────────────┤
│                                  │  📋 연결된 백로그 (3)           │
│  📕 문제                         │  ──────────────────────────      │
│  1. 로그인 속도 느림              │  🔴 로그인 속도 개선             │
│  2. 가격 비교 어려움              │      [문제 블록에 추가 ↓]       │
│  3. 모바일 UI 복잡함              │                                  │
│                                  │  🟡 가격 비교 기능               │
│  [✨ AI 생성]                    │      [문제 블록에 추가 ↓]       │
│                                  │                                  │
│  💡 솔루션                       │  🟢 다크모드 지원                │
│  ...                             │      [문제 블록에 추가 ↓]       │
│                                  │                                  │
│  🎯 고유 가치 제안               │  [+ 백로그 연결]                │
│  ...                             │                                  │
│                                  │  [모든 백로그 보기 →]           │
│                                  │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
```

### 4. 백로그 생성 다이얼로그

```
┌────────────────────────────────────────────┐
│  새 백로그 추가                      [✕]   │
├────────────────────────────────────────────┤
│                                            │
│  제목 *                                    │
│  [___________________________________]     │
│                                            │
│  설명                                      │
│  [                                    ]    │
│  [                                    ]    │
│  [                                    ]    │
│                                            │
│  출처                                      │
│  [Meeting ▾]                               │
│                                            │
│  우선순위                                  │
│  ○ High  ● Medium  ○ Low                  │
│                                            │
│  태그                                      │
│  [#성능, #UX                          ]    │
│                                            │
│              [취소]  [백로그 추가]         │
│                                            │
└────────────────────────────────────────────┘
```

---

## API 설계

### 백로그 API

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| `GET` | `/api/backlog` | 모든 백로그 조회 | 인증 필요 |
| `POST` | `/api/backlog` | 새 백로그 생성 | 인증 필요 |
| `GET` | `/api/backlog/[slug]` | 특정 백로그 조회 | 공개 |
| `PATCH` | `/api/backlog/[slug]` | 백로그 업데이트 | 소유자 |
| `DELETE` | `/api/backlog/[slug]` | 백로그 삭제 | 소유자 |

### Canvas-Backlog 연결 API

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| `GET` | `/api/canvas/[slug]/backlog` | 캔버스의 백로그 목록 | 공개 |
| `POST` | `/api/canvas/[slug]/backlog` | 백로그 연결 | 캔버스 소유자 |
| `DELETE` | `/api/canvas/[slug]/backlog/[backlogId]` | 연결 해제 | 캔버스 소유자 |
| `GET` | `/api/backlog/[slug]/canvas` | 백로그의 캔버스 목록 | 공개 |

### AI API

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| `POST` | `/api/ai/extract-problems` | 인터뷰 노트에서 문제 추출 | 인증 필요 |
| `POST` | `/api/ai/group-backlogs` | 유사 백로그 그룹화 제안 | 인증 필요 |

---

## 구현 우선순위

### 🔴 Critical (Must Have) - Phase 1-3

1. **백로그 CRUD 기능** (Task 1.1 ~ 1.3)
2. **백로그 목록 UI** (Task 2.1 ~ 2.4)
3. **Canvas-Backlog 연결** (Task 1.4, 3.1, 3.2)

**목표**: 기본적인 백로그 관리 및 캔버스 연동 기능 완성

### 🟡 Important (Should Have) - Phase 4

4. **AI 백로그 추출** (Task 4.1, 4.4)
5. **AI 문제 블록 생성** (Task 4.2)
6. **백로그 상세 페이지** (Task 2.2)

**목표**: AI 기능으로 사용자 편의성 향상

### 🟢 Nice to Have - Phase 5

7. **태그 시스템** (Task 5.1)
8. **공유 기능** (Task 5.2)
9. **대시보드 통계** (Task 5.3)
10. **검색 최적화** (Task 5.4)
11. **히스토리 추적** (Task 5.5)

**목표**: 고급 기능으로 사용자 경험 강화

### 🔵 Polish - Phase 6

12. **테스트 작성** (Task 6.1, 6.2)
13. **성능 최적화** (Task 6.3)
14. **UI/UX 개선** (Task 6.4)
15. **문서화** (Task 6.5)

**목표**: 제품 품질 및 유지보수성 향상

---

## 예상 일정

| Phase | 기간 | 핵심 결과물 |
|-------|------|------------|
| **Phase 1** | Week 1 | 백로그 데이터 모델 + API |
| **Phase 2** | Week 2 | 백로그 관리 UI |
| **Phase 3** | Week 3 | 캔버스 통합 |
| **Phase 4** | Week 4 | AI 기능 |
| **Phase 5** | Week 5 | 추가 기능 |
| **Phase 6** | Week 6 | 테스트 & 최적화 |

**총 예상 기간**: 6주 (1.5개월)

---

## 기술 스택 (추가 없음)

현재 프로젝트의 기술 스택을 그대로 사용:
- Next.js 14 + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- NextAuth.js
- Anthropic Claude API

---

## 다음 단계

1. ✅ 이 계획서 검토 및 승인
2. ✅ Phase 1 완료: 데이터 모델 설계 및 API 구현
3. ✅ Prisma 스키마 작성 및 마이그레이션
4. ✅ 백로그 CRUD API 구현
5. ✅ Canvas-Backlog 연결 API 구현
6. ✅ Phase 2 완료: 백로그 관리 UI 개발
7. ✅ 백로그 목록 페이지 구현
8. ✅ 백로그 상세 페이지 구현
9. ✅ Phase 3 완료: 린 캔버스 통합
10. ✅ 캔버스 페이지에 백로그 패널 추가
11. ✅ 백로그 → 캔버스 문제 블록 연동
12. ✅ 문제 블록에서 백로그 생성 기능
13. ⬜ Phase 4 시작: AI 기능 통합
14. ⬜ AI 백로그 추출 기능
15. ⬜ AI 문제 블록 생성 기능

---

---

## 버그 수정 이력

### 2025-11-16
1. **link-canvas-dialog.tsx**: API 호출 시 `backlogSlug` 대신 `backlogId` 전송하도록 수정
   - 문제: 백로그 상세 페이지에서 캔버스 연결 시 400 에러 발생
   - 해결: `LinkCanvasDialog` 컴포넌트에 `backlogId` prop 추가 및 전달

2. **backlog-panel.tsx**: 백로그 연결 시 사용자 피드백 개선
   - 백로그 미선택 시 알림 추가
   - 에러 메시지 상세화
   - 성공 알림 추가

3. **link-canvas-dialog.tsx**: API 응답 데이터 형식 수정
   - `canvases` 배열을 올바르게 추출하도록 수정

---

**문서 버전**: 1.4
**작성일**: 2025-01-16
**최종 수정일**: 2025-11-16 (Phase 3 완료 + 버그 수정)
**작성자**: Claude Code Agent
