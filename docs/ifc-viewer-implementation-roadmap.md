# IFC Viewer 단계별 TDD 로드맵

## 1. 목적

이 문서는 `ifc-e` IFC 뷰어/에디터를 단계적으로 구현하기 위한 실행 로드맵이다.

진행 방식은 항상 아래 순서를 따른다.

1. 작은 단위 기능 구현
2. 사용자 개발모드에서 실행
3. 동작 확인
4. 문제가 있으면 즉시 수정
5. 현재 단계 통과 후 다음 단계 진행

이 문서는 한 번에 전부 만드는 계획이 아니라,  
작게 만들고 바로 검증하면서 올라가는 계획이다.

기본 전제:

- 기본 UI/UX는 `ifc-ln` 또는 `ifc-lite`에서 재사용한다
- IFC 파싱/지오메트리 백엔드는 `web-ifc` + `web-ifc.wasm`을 사용한다
- UI 셸과 사용자 흐름은 최대한 유지하고, 엔진/데이터 계층만 교체한다

---

## 2. 작업 원칙

모든 단계는 반드시 아래 사이클을 따른다.

### 단계 진행 사이클

- `구현`
  - 현재 단계에 필요한 코드만 작성한다
- `개발모드 테스트`
  - 로컬 dev server를 실행한다
  - 브라우저에서 현재 단계 기능만 집중 확인한다
- `검토`
  - 무엇이 정상 동작했는지 확인한다
  - 무엇이 깨졌는지 기록한다
- `수정`
  - 현재 단계에서 발견된 문제만 우선 수정한다
- `다음 단계 진행`
  - 현재 단계 통과 후에만 다음 단계로 간다

### 단계 완료 조건

- 기능이 dev mode에서 직접 보이거나 테스트 가능해야 한다
- 치명적인 runtime error가 없어야 한다
- 현재 단계의 주요 사용자 흐름이 막히지 않아야 한다
- 다음 단계가 현재 결과물 위에서 자연스럽게 이어질 수 있어야 한다

---

## 3. 구현 범위

### `ifc-ln`에서 재사용할 범위

- viewer shell 레이아웃
- 상단 툴바
- 좌측 계층 패널
- 중앙 viewport container
- 우측 properties panel
- status bar
- 기본 사용자 interaction flow

### `web-ifc`로 교체할 범위

- 파일 로딩 파이프라인
- worker bridge
- geometry 추출
- spatial structure 추출
- property 조회
- 저장/export mutation 경로

### 초기 단계에서 제외할 범위

- 고급 BCF 기능
- IDS 기능
- Lens 시스템
- Chat/Script 도구
- 2D Drawing 워크플로우
- 복잡한 형상 생성/편집

---

## 4. Phase 개요

| Phase | 주제 | 주요 결과 |
|------|------|-----------|
| Phase 1 | Shell Boot | `ifc-e`에서 UI 셸이 실행된다 |
| Phase 2 | Engine Boot | `web-ifc` worker로 파일이 로드된다 |
| Phase 3 | First Render | 첫 IFC geometry가 화면에 보인다 |
| Phase 4 | Inspect | 선택, 트리, 속성 패널이 동작한다 |
| Phase 5 | Operate | hide/show/isolate/filter/focus가 동작한다 |
| Phase 6 | Edit v1 | 속성 편집과 save/export가 동작한다 |
| Phase 7 | Harden | 멀티 모델과 안정화가 완료된다 |

---

## 5. Phase 1 - Shell Boot

### Phase 목표

`ifc-ln` 스타일의 viewer shell을 `ifc-e`로 가져오고, 실제 `web-ifc` 엔진이 아직 없어도 개발모드에서 동작하게 만든다.

### Phase 종료 결과

- 앱이 로컬에서 실행된다
- 레이아웃이 렌더링된다
- viewport 영역이 보인다
- 패널 열기/닫기가 가능하다
- backend 구현 없이도 shell 개발이 가능하다

### Step 1.1 - 앱 골격 만들기

#### 구현

- [ ] 기본 frontend 앱 구조 생성
- [ ] `src/main.tsx` 생성
- [ ] `src/App.tsx` 생성
- [ ] 전역 스타일 추가
- [ ] alias 설정 추가

#### 개발모드 테스트

- [ ] dev server 실행
- [ ] 빈 앱이 에러 없이 렌더링되는지 확인

#### 통과 조건

- [ ] 브라우저에서 앱이 열린다
- [ ] 시작 시 치명적인 에러가 없다

---

### Step 1.2 - 최소 Viewer Layout 구성

#### 구현

- [ ] `ViewerLayout` 생성
- [ ] 아래 placeholder shell 구성
  - [ ] toolbar
  - [ ] left panel
  - [ ] viewport
  - [ ] right panel
  - [ ] status bar

#### 개발모드 테스트

- [ ] 전체 화면 레이아웃이 보이는지 확인
- [ ] 패널 구역이 시각적으로 구분되는지 확인

#### 통과 조건

- [ ] 앱이 이미 viewer shell 형태를 갖춘다

---

### Step 1.3 - 최소 Store 구성

#### 구현

- [ ] 최소 Zustand store 생성
- [ ] 지금 필요한 slice만 추가
  - [ ] `ui`
  - [ ] `loading`
  - [ ] `selection`
  - [ ] `visibility`
  - [ ] `data`

#### 개발모드 테스트

- [ ] mock action으로 panel collapse 상태 변경
- [ ] UI가 crash 없이 반응하는지 확인

#### 통과 조건

- [ ] shell 상태가 임시 local state가 아니라 공용 store로 제어된다

---

### Step 1.4 - `ifc-ln` Shell 컴포넌트 이식

#### 구현

- [ ] 아래 컴포넌트를 포팅 또는 경량화 이식
  - [ ] `ViewerLayout`
  - [ ] `MainToolbar`
  - [ ] `ViewportContainer`
  - [ ] `HierarchyPanel`
  - [ ] `PropertiesPanel`
  - [ ] `StatusBar`
- [ ] 초기 단계에서 불필요한 기능 제거
  - [ ] BCF
  - [ ] IDS
  - [ ] Lens
  - [ ] Script
  - [ ] Chat
  - [ ] 2D drawings

#### 개발모드 테스트

- [ ] 이식한 shell이 렌더링되는지 확인
- [ ] 누락 dependency로 인한 crash가 없는지 확인

#### 통과 조건

- [ ] `ifc-e` 내부에서 재사용 shell이 실제로 동작한다

---

### Step 1.5 - Mock Engine Contract 만들기

#### 구현

- [ ] `useWebIfc()` placeholder hook 생성
- [ ] 아래 contract 정의
  - [ ] `loadFile`
  - [ ] `loading`
  - [ ] `progress`
  - [ ] `error`
  - [ ] `geometryResult`
  - [ ] `spatialTree`
  - [ ] `properties`
- [ ] UI가 mock contract를 사용하도록 연결

#### 개발모드 테스트

- [ ] file-open mock action 클릭
- [ ] loading/progress/error placeholder가 보이는지 확인

#### 통과 조건

- [ ] UI가 backend 연결 준비 상태가 된다

---

### Phase 1 최종 체크

- [ ] dev server가 정상 실행된다
- [ ] viewer shell이 렌더링된다
- [ ] shell이 공용 app state를 사용한다
- [ ] mock load 흐름이 동작한다
- [ ] 실제 `web-ifc` 연결을 시작할 준비가 되었다

---

## 6. Phase 2 - Engine Boot

### Phase 목표

실제 `web-ifc` worker 경계를 만들고, 개발모드에서 IFC 파일 1개를 로드할 수 있게 한다.

### Step 2.1 - Worker 설정

#### 구현

- [ ] `web-ifc` 추가
- [ ] wasm asset 서빙 설정 추가
- [ ] `ifc.worker.ts` 생성
- [ ] worker client service 생성
- [ ] `INIT` 구현

#### 개발모드 테스트

- [ ] dev server 실행
- [ ] wasm path 오류 없이 worker가 초기화되는지 확인

#### 통과 조건

- [ ] worker가 살아 있고 호출 가능하다

---

### Step 2.2 - IFC 파일 1개 로드

#### 구현

- [ ] `LOAD_MODEL` 구현
- [ ] `CLOSE_MODEL` 구현
- [ ] `loadFile()`을 worker와 연결
- [ ] progress/error를 UI에 전달

#### 개발모드 테스트

- [ ] IFC 파일 1개 열기
- [ ] UI의 load state가 바뀌는지 확인
- [ ] 다시 로드해도 crash가 없는지 확인

#### 통과 조건

- [ ] 실제 IFC 파일이 worker를 통해 열릴 수 있다

---

### Phase 2 최종 체크

- [ ] worker가 dev mode에서 안정적으로 동작한다
- [ ] IFC 파일 1개가 실제 파이프라인으로 로드된다
- [ ] loading 상태가 UI에서 보인다

---

## 7. Phase 3 - First Render

### Phase 목표

`web-ifc`가 추출한 실제 geometry를 viewport에 처음 렌더링한다.

### Step 3.1 - Geometry Streaming

#### 구현

- [ ] `StreamAllMeshes` 구현
- [ ] typed array를 Transferable로 전달
- [ ] geometry payload 정규화

#### 개발모드 테스트

- [ ] IFC 로드
- [ ] geometry payload가 main thread까지 오는지 확인

#### 통과 조건

- [ ] geometry 데이터가 main thread에 도착한다

---

### Step 3.2 - Viewport Rendering

#### 구현

- [ ] geometry adapter 생성
- [ ] payload를 render 가능한 mesh 형식으로 변환
- [ ] viewport에 실제 geometry 연결

#### 개발모드 테스트

- [ ] sample IFC 로드
- [ ] 첫 모델이 화면에 보이는지 확인
- [ ] 카메라로 모델을 볼 수 있는지 확인

#### 통과 조건

- [ ] 첫 IFC 렌더링이 성공한다

---

## 8. Phase 4 - Inspect

### Phase 목표

렌더링된 모델을 실제로 확인하고 탐색할 수 있는 수준의 viewer로 만든다.

### Step 4.1 - Selection

#### 구현

- [ ] picking 구현
- [ ] expressID 매핑
- [ ] 선택 하이라이트 구현

#### 개발모드 테스트

- [ ] 모델 클릭
- [ ] 선택한 객체가 시각적으로 바뀌는지 확인

#### 통과 조건

- [ ] viewport selection이 동작한다

---

### Step 4.2 - Hierarchy Tree

#### 구현

- [ ] spatial structure 요청 구현
- [ ] tree 형식으로 매핑
- [ ] 좌측 panel과 연결

#### 개발모드 테스트

- [ ] IFC 로드
- [ ] hierarchy tree가 보이는지 확인
- [ ] tree node 클릭 시 선택/포커스가 되는지 확인

#### 통과 조건

- [ ] tree와 viewport가 연결된다

---

### Step 4.3 - Properties Panel

#### 구현

- [ ] property 요청 구현
- [ ] on-demand property loading 구현
- [ ] 우측 panel과 연결

#### 개발모드 테스트

- [ ] 객체 클릭
- [ ] 속성과 attribute 값이 보이는지 확인

#### 통과 조건

- [ ] 속성 조회가 end-to-end로 동작한다

---

## 9. Phase 5 - Operate

### Phase 목표

실제 모델 검토에 필요한 기본 viewer 조작 기능을 붙인다.

### Step 5.1 - Visibility Control

#### 구현

- [ ] 선택 객체 hide
- [ ] hidden 객체 show
- [ ] visibility reset

#### 개발모드 테스트

- [ ] 객체를 숨기고 다시 복구할 수 있는지 확인

#### 통과 조건

- [ ] visibility 조작이 정상 동작한다

---

### Step 5.2 - Isolation

#### 구현

- [ ] 선택 객체 isolate
- [ ] isolate 해제

#### 개발모드 테스트

- [ ] 대상만 남고 나머지가 숨겨지는지 확인

#### 통과 조건

- [ ] isolate 기능이 정상 동작한다

---

### Step 5.3 - Filter And Focus

#### 구현

- [ ] type filter
- [ ] storey filter
- [ ] fit/focus selected
- [ ] home camera

#### 개발모드 테스트

- [ ] toolbar 조작이 viewport에 정확히 반영되는지 확인

#### 통과 조건

- [ ] 기본 검토용 viewer 흐름이 완성된다

---

### Phase 5 최종 체크

- [ ] reload 없이 일상적인 inspection workflow가 가능하다

---

## 10. Phase 6 - Edit v1

### Phase 목표

안전한 범위의 속성 편집과 save/export를 지원하는 editor v1을 만든다.

### Step 6.1 - Mutation Base

#### 구현

- [ ] mutation service 생성
- [ ] dirty state 생성
- [ ] undo/redo 기반 생성

#### 개발모드 테스트

- [ ] 속성 하나를 로컬 상태에서 변경
- [ ] panel이 즉시 갱신되는지 확인

#### 통과 조건

- [ ] 로컬 mutation 흐름이 존재한다

---

### Step 6.2 - Property Editing

#### 구현

- [ ] attribute 수정
- [ ] property value 수정
- [ ] property 추가/삭제

#### 개발모드 테스트

- [ ] attribute 수정
- [ ] pset property 수정
- [ ] undo/redo 확인

#### 통과 조건

- [ ] viewer 내부에서 편집이 가능하다

---

### Step 6.3 - Save Or Export

#### 구현

- [ ] 변경된 IFC export
- [ ] discard/reset changes
- [ ] toolbar save action

#### 개발모드 테스트

- [ ] 수정된 파일 export
- [ ] export 결과를 다시 열기
- [ ] 변경 내용이 유지되는지 확인

#### 통과 조건

- [ ] editor v1이 완료된다

---

## 11. Phase 7 - Harden

### Phase 목표

실사용을 위한 안정성과 확장성을 확보한다.

### 구현

- [ ] multi-model support 추가
- [ ] global ID offset 전략 추가
- [ ] 반복 load/unload 테스트
- [ ] 대용량 sample 파일 테스트
- [ ] memory cleanup 점검
- [ ] 에러 처리 안정화

### 개발모드 테스트

- [ ] 열기/닫기 반복
- [ ] IFC 여러 개 로드
- [ ] 깨진 파일/지원하지 않는 파일 테스트

### 통과 조건

- [ ] 눈에 띄는 안정성 blocker가 없다

---

## 12. Phase 1 즉시 시작 순서

지금은 아래 순서만 시작한다.

1. 앱 골격 생성
2. 최소 viewer layout 생성
3. 최소 store 생성
4. 경량화한 shell component 이식
5. `useWebIfc()` mock contract 생성
6. dev server 실행
7. 브라우저에서 shell 검증

아직 worker나 실제 `web-ifc` 연동은 시작하지 않는다.  
Phase 1 통과 후에만 Phase 2로 간다.

---

## 13. 현재 진행 상태

- [ ] Phase 1 / Step 1.1 시작 전
- [ ] 다음 작업: 앱 골격 생성

