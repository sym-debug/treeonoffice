# TreeON Office 웹 서비스

정적 사이트(HTML/CSS/JS)입니다. 빌드 없이 폴더째 호스팅하면 됩니다.
배포: Vercel + Supabase 실서비스 배포는 `DEPLOY.md`를 따르세요. (Netlify에 드래그 앤 드롭으로 올리면 Supabase 없이 체험 모드로도 동작합니다.)

## 페이지 구성
| 경로 | 내용 |
|---|---|
| `index.html` | 메인 랜딩 (문제·이용 4단계·공간·보안·요금·사전 신청 폼·FAQ) |
| `signup.html` / `login.html` | 회원가입 / 로그인 (데모 계정 버튼 포함) |
| `privacy.html` | 개인정보 수집·이용 안내 |
| `app/index.html` | 로그인 후 홈 (다가오는 예약, 시작 체크리스트, 바로 가기) |
| `app/reserve.html` | 오피스 예약 (공간·패키지·달력·인원·보안 수준 → 금액 계산, 내 예약/취소) |
| `app/office.html` | 오피스 이용 (모바일 키·일회용 비밀번호, 보안 수칙 동의, 출퇴근 태그, 퇴실 체크, 팀 현황, 회의 공간 예약, 근무 기록) |
| `app/report.html` | 업무 집중도 리포트 샘플 (생산성 / 만족도 / ESG·지역 상생, PDF 저장) |
| `app/approval.html` | 결재 서류 신청 (견적서·품의서 초안 즉시 미리보기·출력, 확인서·세금계산서 신청 내역) |
| `admin/index.html` | 관리자 (대시보드·문의 관리·데모/체험·예약/서류·이용 리포트·정보 수정·설정) |
| `app/guide.html` | 이용 안내 (이용 순서, 평면도·조감도, 보안 수칙, 연락처, 주변 식당·카페 필터) |

## 디자인 시스템
`DESIGN.md` — awesome-design-md의 Stripe 레퍼런스를 트리온 브랜드에 맞춘 토큰·규칙. 새 화면을 추가할 때 이 기준을 따르세요.

## 고칠 곳
- **설정** `assets/js/config.js`
  - `CONTACT_EMAIL` — 지금은 임시 주소(hello@treeon.kr)입니다. 실제 주소로 바꾸세요.
  - `FORM_MODE` — `netlify`(기본) / `formspree` / `email`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY` — 넣으면 실제 회원가입·로그인(이메일 인증)으로 전환됩니다.
- **데이터** `assets/js/data.js` — 공간, 패키지 단가, 보안 단계, 서류 종류, 보안 수칙, 장비, 주변 식당·카페(현재 예시), 리포트 샘플 수치
- **페이지 문구** `_build/build.py` 수정 후 `python3 _build/build.py` 실행 → HTML 재생성
- **도메인** `_build/build.py` 의 `BASE_URL` (canonical, OG, sitemap)

## 로그인·데이터 저장 방식
- Supabase 미설정(기본) = 체험 모드: 회원 정보·예약·근태·서류 신청이 이용자 브라우저(localStorage)에 저장됩니다. 시장검증 인터뷰·사용성 테스트용입니다. 비밀번호는 해시로 저장되지만 서버 보안이 아니므로 실제 운영 전 Supabase로 전환하세요.
- Supabase 설정 시: Authentication > URL Configuration 의 Site URL·Redirect URL 에 배포 주소를 넣으세요. 예약 등 앱 데이터는 계속 브라우저에 저장됩니다.
- 회원가입 시 이름·회사·이메일 등(비밀번호 제외)은 `signup` 폼으로 함께 수집됩니다.

## 이미지
`assets/img/a/` — 폐교형 리모델링 컨셉 이미지 18종(원본 1600px + 썸네일 `-t`). 설명·방 연결은 `assets/js/data.js` 의 `gallery` 에서 고칩니다. 랜딩 공간 섹션(도면 클릭 → 사진), 갤러리 라이트박스, 앱 이용 안내·오피스 이용·예약 화면에 쓰입니다.
`assets/img` — IR Deck에서 추출한 로고·현장 사진·리모델링 컨셉, 평면도·조감도(설계 초안). 1호점 실사진이 나오면 같은 파일명으로 교체하면 됩니다.

## 주변 시설 대표 사진
`assets/img/places/` 에 아래 파일명으로 사진(가로형 jpg 권장, 1200px 이하)을 넣으면 이용 안내 화면에 자동으로 표시됩니다. 파일이 없으면 기본 아이콘 이미지가 나옵니다. 업체 사진은 직접 촬영했거나 업체 허락을 받은 것만 쓰세요.

| 업체 | 파일명 |
|---|---|
| 소풍닭갈비 | `sopung-dakgalbi.jpg` |
| 역전분식 | `yeokjeon-bunsik.jpg` |
| 초원닭갈비막국수 | `chowon-dakgalbi.jpg` |
| 토담식당 | `todam.jpg` |
| 가평축산농협 한우명가 | `hanu-myeongga.jpg` |
| 두물머리 | `dumulmeori.jpg` |
| 송원막국수 | `songwon-makguksu.jpg` |
| 카페 바이 스테이션 | `by-station.jpg` |
| 이디야커피 가평역점 | `ediya-gapyeong.jpg` |
| 카페 더스틸 | `the-steel.jpg` |
| 다이소 가평점 | `daiso-gapyeong.jpg` |

## 관리자 페이지 (`/admin/`)
| 메뉴 | 하는 일 |
|---|---|
| 대시보드 | 새 문의·사전 신청·체험 진행·유료 전환·확정 예약·공개 리포트 수, 전환 단계, 회사 규모·이용 목적 분포, 다가오는 체험 |
| 문의 관리 | 사전 신청·회원가입·이용자 문의(앱 이용 안내 화면) 목록, 상태·메모, 체험 일정 만들기, 메일 보내기, CSV 내려받기 |
| 데모·체험 | 요청 → 일정 확정 → 진행 중 → 완료 → 유료 전환 보드, 일정·인원·패키지 편집, 리포트 작성으로 연결 |
| 예약·서류 | 이용자 예약 상태 변경(확정·상담 대기·이용 완료·취소), 결재 서류 발급 완료 처리 |
| 이용 리포트 | 팀별 실제 측정값으로 리포트 작성·공개 → 해당 이메일 이용자의 리포트 화면이 샘플 대신 이 내용으로 바뀜. 샘플 리포트도 편집 가능 |
| 정보 수정 | 패키지 이름·설명·요금, 주변 시설(추가·삭제·순서·사진 업로드), 앱 홈 공지, 공간 사진 설명, 문의 이메일, 데모 로그인 버튼 |
| 설정 | data.js 내보내기, 백업·복원, 시연용 데이터 넣기, 초기화 |

### 저장 방식
- **체험 모드(기본)**: 비밀번호 `config.js`의 `ADMIN_PASSCODE`(기본 treeon-admin — 꼭 바꾸세요). 데이터가 관리자 브라우저에만 저장되므로 시연·내부 테스트용입니다. 정보 수정 내용을 모든 방문자에게 보이게 하려면 설정 > data.js 내려받기 → `assets/js/data.js` 교체 후 재배포하세요. 사전 신청은 Netlify Forms에도 쌓입니다.
- **Supabase 모드(실서비스)**: ① Supabase 프로젝트 생성 ② SQL Editor에서 `supabase/schema.sql` 실행 ③ 맨 아래 `insert into admins` 에 관리자 이메일 등록 ④ `config.js`에 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 입력 ⑤ 사이트에서 그 이메일로 회원가입·인증 후 `/admin/` 로그인. 문의·체험·리포트·정보 수정·이용자 예약 데이터가 서버에 저장되고 모든 방문자에게 반영됩니다. 권한은 행 단위 보안(RLS)으로 관리자만 조회·수정할 수 있습니다.
