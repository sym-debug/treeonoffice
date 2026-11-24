// TreeON Office 사이트 설정 — 퍼블리싱 전에 이 파일만 확인하면 됩니다.
window.TREEON_CONFIG = {
  // 문의·접수 이메일 (사이트 푸터, 폼 전송 실패 시 대체 경로)
  CONTACT_EMAIL: "sohn7857@gmail.com",

  // 사전 신청·회원가입 리드 수집 방식
  //  "netlify"  : Netlify에 올리면 별도 설정 없이 Netlify 대시보드 > Forms 에 쌓입니다 (기본값)
  //  "formspree": FORMSPREE_ENDPOINT 로 전송 (예: "https://formspree.io/f/abcdwxyz")
  //  "email"    : 메일 앱을 열어 CONTACT_EMAIL 로 보내게 합니다
  //  "none"     : 별도 전송 없음 — Supabase 를 쓰면 사전 신청은 leads 테이블에 저장되므로 Vercel 배포 시 이 값을 쓰세요
  FORM_MODE: "none",
  FORMSPREE_ENDPOINT: "",

  // 로그인 방식
  //  비워두면 "체험(브라우저 저장) 모드" — 회원 정보와 예약 데이터가 이용자 브라우저에만 저장됩니다.
  //  Supabase 프로젝트 URL·anon key 를 넣으면 실제 회원가입/로그인(이메일 인증 포함)으로 바뀝니다.
  SUPABASE_URL: "https://utsvmmrjsjjsotcmeees.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_PVHZMThEV4xzitYMmX5jdQ_2ijSop8V",

  // 로그인 화면의 "데모 계정으로 둘러보기" 버튼 노출 여부 (시장검증 인터뷰용) — 관리자 페이지에서도 바꿀 수 있음
  SHOW_DEMO_LOGIN: true,

  // 관리자 페이지(/admin) 접속 비밀번호 — 체험 모드(Supabase 미설정)에서만 사용. 배포 전에 꼭 바꾸세요.
  // Supabase 모드에서는 supabase/schema.sql 의 admins 테이블에 등록된 이메일 계정으로 로그인합니다.
  ADMIN_PASSCODE: "treeon-admin"
};
