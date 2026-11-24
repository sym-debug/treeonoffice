# Vercel + Supabase 배포 가이드

빌드 과정이 없는 정적 사이트입니다. Supabase가 회원·문의·체험·리포트·예약 데이터를 맡고, Vercel은 파일을 그대로 서비스합니다.

## 1. Supabase 프로젝트 만들기
1. supabase.com 가입 → New project
2. Region: Northeast Asia (Seoul) 권장, Database password는 따로 보관

## 2. 데이터베이스 만들기
1. 왼쪽 메뉴 SQL Editor → New query
2. `supabase/schema.sql` 전체를 붙여넣고 Run
3. 맨 아래 줄 주석을 풀고 관리자 이메일(소문자)로 바꿔 실행
   ```sql
   insert into admins (email) values ('admin@yourcompany.com');
   ```
   관리자를 더 늘릴 때도 같은 줄을 실행합니다.

## 3. 키 복사
Project Settings → API (또는 API Keys)
- Project URL → `SUPABASE_URL`
- anon / publishable 키 → `SUPABASE_ANON_KEY`
- service_role / secret 키는 절대 사이트 파일에 넣지 마세요. anon 키는 공개되어도 schema.sql의 행 단위 보안(RLS)으로 보호됩니다.

## 4. 로그인(Auth) 설정
Authentication 메뉴
- **Providers → Email**: 켜기
- **이메일 인증(Confirm email)** — 둘 중 하나를 고르세요
  - 시장검증 단계: 끄기. 가입 즉시 로그인됩니다.
  - 정식 운영: Emails → SMTP Settings에서 커스텀 SMTP(Resend, Brevo 등 · 회사 도메인 필요)를 연결한 뒤 켜기. 기본 메일 서버는 테스트용이라 일반 사용자에게 인증 메일이 가지 않습니다.
- **URL Configuration**(Vercel 배포 후 주소가 나오면 입력)
  - Site URL: `https://<배포 주소>`
  - Redirect URLs: `https://<배포 주소>/login.html`, `https://<배포 주소>/**`
- (선택) Emails → Templates: 인증·비밀번호 재설정 메일 문구를 한국어로

## 5. 사이트 설정 파일 수정
`assets/js/config.js`
```js
CONTACT_EMAIL: "실제 문의 이메일",
FORM_MODE: "none",                 // Vercel에서는 Netlify Forms가 없으므로 none (문의는 Supabase에 저장)
SUPABASE_URL: "https://xxxx.supabase.co",
SUPABASE_ANON_KEY: "eyJ...",
```
- Supabase 모드에서는 로그인 화면의 데모 버튼과 `ADMIN_PASSCODE`는 쓰이지 않습니다.
- (선택) `_build/build.py`의 `BASE_URL`을 배포 주소로 바꾸고 `python3 _build/build.py` 실행 → 공유 미리보기·사이트맵 주소가 맞춰집니다.

## 6. GitHub에 올리기
1. GitHub에서 새 저장소(Private 가능) 만들기
2. 이 폴더의 파일 전체를 업로드 (웹에서 Add file → Upload files로 드래그해도 됩니다)

## 7. Vercel 배포
1. vercel.com → Add New → Project → 6번 저장소 Import
2. Framework Preset: **Other** / Build Command: 비움 / Output Directory: 비움(루트)
3. Deploy → `https://<프로젝트명>.vercel.app` 주소 확인
4. 4번 URL Configuration에 이 주소 입력
5. 이후에는 GitHub에 파일을 올릴 때마다 자동으로 다시 배포됩니다

CLI를 쓰려면 폴더에서 `npx vercel` (미리보기) → `npx vercel --prod` (운영)

## 8. 관리자 계정 만들기
1. 배포된 사이트 `/signup.html`에서 2-3번에 등록한 이메일로 가입
2. `/admin/` 접속 → 같은 이메일·비밀번호로 로그인

## 9. 배포 후 점검
| 확인할 것 | 방법 |
|---|---|
| 사전 신청 저장 | 랜딩에서 신청 → 관리자 > 문의 관리에 표시 |
| 회원가입·로그인 | 새 이메일로 가입 → 앱 홈 진입 |
| 예약 연동 | 앱에서 예약 → 관리자 > 예약·서류에 표시, 상태 변경이 앱에 반영 |
| 리포트 공개 | 관리자에서 그 이메일로 리포트 공개 → 이용자 리포트 화면이 "우리 팀" 리포트로 바뀜 |
| 정보 수정 | 관리자에서 요금 변경 → 시크릿 창에서 랜딩 요금 확인 |
| 이용자 문의 | 앱 이용 안내 > 문의 보내기 → 관리자 문의 관리 |
| 비밀번호 찾기 | 커스텀 SMTP 연결 시 메일 링크 → 새 비밀번호 설정 화면 |
| 권한 | 관리자가 아닌 계정으로 `/admin/` 접속 시 거부 |

## 10. 운영 시 알아둘 것
- Supabase 무료 플랜은 7일간 활동이 적으면 프로젝트가 일시 중지됩니다(대시보드에서 다시 켤 수 있음). 실제 고객이 쓰면 Pro 플랜을 권장합니다.
- 무료 플랜은 자동 백업이 없으니 관리자 > 설정 > 백업을 주기적으로 받아 두세요.
- 자체 도메인 연결: Vercel 프로젝트 > Settings > Domains. 연결 후 Supabase URL Configuration도 새 도메인으로 바꾸세요.
- 사이트 파일에 보이는 anon 키는 정상입니다. 데이터 접근은 schema.sql의 정책으로 제한됩니다(문의는 누구나 등록, 조회·수정은 관리자만).
