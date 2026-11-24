#!/usr/bin/env python3
"""TreeON Office 웹 서비스 빌드 스크립트.
페이지 문구를 이 파일에서 고친 뒤 실행:  python3 _build/build.py
(요금·공간·주변 식당 같은 데이터는 assets/js/data.js, 폼·로그인 설정은 assets/js/config.js)"""
import os, datetime

BASE_URL = "https://treeon.netlify.app"   # 최종 도메인으로 바꾸세요 (canonical, OG, sitemap)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "TreeON Office"
VER = datetime.date.today().strftime("%Y%m%d")

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
           "%3Crect width='64' height='64' rx='14' fill='%23134a92'/%3E"
           "%3Cpath d='M18 50V26l14-10 14 10v24M26 50V34h12v16' fill='none' stroke='white' stroke-width='4' stroke-linejoin='round'/%3E"
           "%3Ccircle cx='32' cy='27' r='3' fill='%2300a394'/%3E%3C/svg%3E")
FONT = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">'


def head(path, title, desc, prefix="", index=True):
    url = BASE_URL + "/" + ("" if path == "index.html" else path)
    robots = "" if index else '<meta name="robots" content="noindex">\n'
    return f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
{robots}<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{SITE}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE_URL}/assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0d2f5f">
<meta name="img-base" content="{prefix}assets/img/">
<link rel="icon" href="{FAVICON}">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
{FONT}
<link rel="stylesheet" href="{prefix}assets/css/style.css?v={VER}">
</head>
"""


def scripts(prefix, names):
    return "".join(f'<script src="{prefix}assets/js/{n}.js?v={VER}"></script>\n' for n in names)


def write(path, html):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", path)


# ================= 공개 페이지 공통 =================
def site_header():
    return """<body>
<a class="skip" href="#main">본문으로 건너뛰기</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="TreeON Office 홈"><img src="assets/img/logo.png" alt="TreeON Office 몰입형 보안 오피스" width="163" height="30"></a>
    <button class="menu-btn" aria-label="메뉴 열기" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button>
    <nav class="nav" id="site-nav" aria-label="주 메뉴">
      <a href="index.html#how">이용 방법</a>
      <a href="index.html#spaces">공간</a>
      <a href="index.html#security">보안</a>
      <a href="index.html#pricing">요금</a>
      <a href="login.html" data-auth-link>로그인</a>
      <a class="btn sm" href="index.html#apply">사전 신청</a>
    </nav>
  </div>
</header>
<main id="main">
"""


FOOTER = """</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <img src="assets/img/logo.png" alt="TreeON Office" width="151" height="28" loading="lazy">
        <p>지역 유휴 공간을 기업 TF팀 보안 오피스로.<br>한 팀 단독 사용, 고객사 보안 수준별 접속, 근태·정산·성과 리포트를 한 패키지로.</p>
      </div>
      <div>
        <h4>서비스</h4>
        <ul>
          <li><a href="index.html#how">이용 방법</a></li>
          <li><a href="index.html#spaces">공간</a></li>
          <li><a href="index.html#pricing">요금</a></li>
          <li><a href="index.html#apply">사전 신청</a></li>
        </ul>
      </div>
      <div>
        <h4>계정</h4>
        <ul>
          <li><a href="login.html">로그인</a></li>
          <li><a href="signup.html" data-hide-authed>회원가입</a></li>
          <li><a href="privacy.html">개인정보 처리방침</a></li>
          <li><a data-contact-mail href="#">문의 메일</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-legal">
      <p>TreeON(트리온) · 대표 손형주 · 2026년 11월 법인 설립 예정</p>
      <p>요금과 공간 구성은 1호점 실증 전 예시이며 확정 시 바뀔 수 있습니다.</p>
      <p>© <span id="yr">2026</span> TreeON. All rights reserved.</p>
    </div>
  </div>
</footer>
""" + scripts("", ["config", "data", "auth", "db", "gallery", "main"]) + """</body>
</html>
"""

# ================= 히어로 도면 (폐교형 설계 초안을 단순화) =================
K, OX, OY = 0.05, 46, 52


def P(v):
    return round(v * K, 1)


def rect(x, y, w, h, cls, extra=""):
    return f'<rect class="{cls}" x="{OX+P(x)}" y="{OY+P(y)}" width="{P(w)}" height="{P(h)}"{extra}/>'


ROOMS = [
    # (이름, 메타, 설명, x, y, w, h, 라벨 위치)
    ("집중업무실", "10석 · 약 13평", "1인 책상 10석, QHD 듀얼 모니터, 인체공학 의자. 대화와 통화는 다른 방에서 해서 조용히 유지합니다.", 6700, 5100, 7596, 5700),
    ("프로젝트룸", "12인 · 빔프로젝터", "12인 회의 테이블과 75인치 전자칠판, 빔프로젝터. 스마트글라스 창으로 바깥 시선을 막습니다.", 8000, 0, 6296, 5100),
    ("회복라운지", "소파 · 간이 주방", "소파와 원형 테이블, 커피와 간식이 있는 휴식 공간. 몰입 사이사이 머리를 식힙니다.", 3000, 0, 5000, 3700),
    ("통화실", "1인 부스 2개", "본사 화상회의와 통화를 위한 1인 부스. 앱에서 1시간 단위로 예약합니다.", 1500, 0, 1500, 3700),
    ("로비", "안면인식 출입", "입구와 실 사이마다 안면인식기가 있어 예약한 팀원만 드나듭니다. 출입 동선에만 CCTV가 있습니다.", 0, 3700, 6700, 3700),
    ("입구·신발장", "모바일 키 · 일회용 비밀번호", "예약자에게만 모바일 키와 일회용 비밀번호가 발급됩니다. 실내화로 갈아 신고 들어갑니다.", 0, 7400, 2500, 3400),
    ("화장실", "남 · 여 분리", "남녀 화장실이 분리되어 있습니다.", 2500, 7400, 4200, 3400),
]


def plan_svg():
    s = ['<svg viewBox="0 10 800 640" role="group" aria-label="폐교형 50평 평면도. 공간을 누르면 설명이 바뀝니다.">']
    # 치수선 (상단·좌측)
    xs = [0, 1500, 3000, 8000, 14296]
    labels = ["1,500", "1,500", "5,000", "6,296"]
    y = OY - 26
    s.append(f'<line class="dim" x1="{OX}" y1="{y}" x2="{OX+P(14296)}" y2="{y}"/>')
    for i, x in enumerate(xs):
        s.append(f'<line class="dim" x1="{OX+P(x)}" y1="{y-6}" x2="{OX+P(x)}" y2="{y+6}"/>')
        if i < len(labels):
            s.append(f'<text class="dimt" x="{OX+P((x+xs[i+1])/2)}" y="{y-8}" text-anchor="middle">{labels[i]}</text>')
    ys = [0, 3700, 7400, 10800]
    xl = OX - 24
    s.append(f'<line class="dim" x1="{xl}" y1="{OY}" x2="{xl}" y2="{OY+P(10800)}"/>')
    for i, yy in enumerate(ys):
        s.append(f'<line class="dim" x1="{xl-6}" y1="{OY+P(yy)}" x2="{xl+6}" y2="{OY+P(yy)}"/>')
        if i < 3:
            cy = OY + P((yy + ys[i+1]) / 2)
            s.append(f'<text class="dimt" x="{xl-8}" y="{cy}" text-anchor="middle" transform="rotate(-90 {xl-8} {cy})">{["3,700","3,700","3,400"][i]}</text>')
    # 방 (인터랙션 영역)
    for i, (n, meta, desc, x, yy, w, h) in enumerate(ROOMS):
        s.append(rect(x, yy, w, h, "room", f' tabindex="0" role="button" aria-label="{n}" data-name="{n}" data-meta="{meta}" data-desc="{desc}"' + (' ' if i else ' ')))
    # 벽
    s.append(rect(0, 0, 14296, 10800, "wall"))
    for (n, meta, desc, x, yy, w, h) in ROOMS:
        if n != "로비":
            s.append(rect(x, yy, w, h, "wall"))
    s.append(f'<line class="thin" x1="{OX+P(4700)}" y1="{OY+P(7400)}" x2="{OX+P(4700)}" y2="{OY+P(10800)}"/>')
    # 가구
    f = []
    for row, cy in ((6500, 6150), (7900, 8950)):
        for dx in (7100, 8500, 9900, 11650, 13050):
            if dx > 13100:
                continue
            f.append(rect(dx, row, 1300, 650, "fur"))
            f.append(f'<circle class="fur" cx="{OX+P(dx+650)}" cy="{OY+P(cy)}" r="{P(300)}"/>')
    f.append(rect(8000, 10300, 6100, 400, "fur"))
    f.append(rect(9300, 1800, 3900, 1300, "fur"))
    for dx in range(9550, 13200, 650):
        f.append(f'<circle class="fur" cx="{OX+P(dx)}" cy="{OY+P(1350)}" r="{P(240)}"/>')
        f.append(f'<circle class="fur" cx="{OX+P(dx)}" cy="{OY+P(3550)}" r="{P(240)}"/>')
    f.append(f'<line class="thin" x1="{OX+P(13950)}" y1="{OY+P(700)}" x2="{OX+P(13950)}" y2="{OY+P(4200)}"/>')
    f.append(f'<circle class="fur" cx="{OX+P(5600)}" cy="{OY+P(1600)}" r="{P(650)}"/>')
    for ang in ((0, -1050), (0, 1050), (-1050, 0), (1050, 0)):
        f.append(f'<circle class="fur" cx="{OX+P(5600+ang[0])}" cy="{OY+P(1600+ang[1])}" r="{P(230)}"/>')
    f.append(rect(3200, 400, 550, 1700, "fur"))
    f.append(rect(4900, 3050, 3000, 550, "fur"))
    f.append(rect(1750, 450, 700, 600, "fur"))
    f.append(rect(1750, 1700, 700, 600, "fur"))
    f.append(rect(3600, 4300, 1300, 1300, "fur"))
    f.append(rect(200, 7700, 700, 1600, "fur"))
    for dx in (2900, 3500, 4100):
        f.append(f'<circle class="fur" cx="{OX+P(dx)}" cy="{OY+P(10300)}" r="{P(260)}"/>')
    for dx in (5200, 6100):
        f.append(f'<circle class="fur" cx="{OX+P(dx)}" cy="{OY+P(10300)}" r="{P(260)}"/>')
    s.append("<g>" + "".join(f) + "</g>")
    # 안면인식기 위치
    for (x, yy) in ((6700, 3950), (6700, 4350), (2500, 7600), (1200, 7400)):
        s.append(f'<circle class="dot" cx="{OX+P(x)}" cy="{OY+P(yy)}" r="6"/>')
    # 라벨
    labs = [("집중업무실", 10500, 8000), ("프로젝트룸", 11150, 4500), ("회복라운지", 5500, 2850), ("통화실", 2250, 3050),
            ("로비", 2000, 5900), ("입구", 1500, 9900), ("화장실", 4600, 9200)]
    for n, x, yy in labs:
        s.append(f'<text class="lbl" x="{OX+P(x)}" y="{OY+P(yy)}" text-anchor="middle">{n}</text>')
    s.append(f'<circle class="dot" cx="{OX+6}" cy="{OY+P(10800)+30}" r="6"/><text class="lbl-s" x="{OX+20}" y="{OY+P(10800)+36}">안면인식기 위치</text>')
    s.append("</svg>")
    return "\n".join(s)


MESH = '<div class="mesh" aria-hidden="true"><i class="m1"></i><i class="m2"></i><i class="m3"></i><i class="m4"></i><i class="m5"></i><i class="m6"></i></div>'

PLAN_CARD = f"""<div class="plan-card">
  <div class="mock-bar"><i></i><i></i><i></i><span>폐교형 · 50평 평면도 (설계 초안)</span></div>
  <div class="plan">
    {plan_svg()}
    <div class="plan-cap" aria-live="polite"><b>폐교형 전체</b><span class="meta">50평 · 최대 10인</span><p>방을 누르면 그 공간의 사진과 설명이 나옵니다.</p></div>
  </div>
</div>"""


def mini_bars(vals, base, w=220, h=70, color="#134a92"):
    n = len(vals); band = w / n; bw = band * .58; mx = 8
    out = [f'<svg viewBox="0 0 {w} {h+2}" aria-hidden="true">']
    for i, v in enumerate(vals):
        bh = v / mx * h; x = i * band + (band - bw) / 2
        out.append(f'<rect x="{x:.1f}" y="{h-bh:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="2.5" fill="{color}"/>')
    yb = h - base / mx * h
    out.append(f'<line x1="0" x2="{w}" y1="{yb:.1f}" y2="{yb:.1f}" stroke="#273951" stroke-dasharray="3 3" stroke-width="1"/>')
    out.append("</svg>")
    return "".join(out)


DAILY = [5.2, 5.8, 6.0, 6.3, 5.9, 6.0, 6.4, 6.5, 6.2, 6.6]

COMPOSITE = f"""<div class="composite" aria-label="예약, 모바일 키, 몰입 리포트 화면 예시" role="img">
  <div class="mock m-res">
    <div class="mock-bar"><i></i><i></i><i></i><span>오피스 예약</span></div>
    <div class="mock-body">
      <div class="between"><span class="mh">AX 신사업 TF</span><span class="chip ok">예약 확정</span></div>
      <div class="dates num"><span class="wk">5</span><span class="se">6</span><span class="in">7</span><span class="in">8</span><span class="in">9</span><span class="in">10</span><span class="wk">11</span></div>
      <table><tbody>
        <tr><td class="mt">공간</td><td>폐교형 · 50평</td></tr>
        <tr><td class="mt">패키지</td><td>중기 체류형</td></tr>
        <tr><td class="mt">기간 · 인원</td><td>평일 10일 · 6명</td></tr>
        <tr><td class="mt">보안</td><td>고객사 VPN 연동</td></tr>
      </tbody></table>
      <div class="total"><span class="mt">합계 · 법인 일괄 정산</span><b>3,850,000원</b></div>
    </div>
  </div>
  <div class="mock m-phone">
    <div class="scr">
      <div class="notch"><i></i></div>
      <div class="key"><span class="mt">모바일 키 · 폐교형</span><div class="otp-s">482 913</div><div class="bar"><i></i></div></div>
      <div class="tag">출근 태그</div>
      <ul>
        <li><span class="dotl">인사시스템 전송</span><span class="num">09:02</span></li>
        <li><span class="dotl">고객사 VPN</span><span>연결됨</span></li>
        <li><span>오늘 우리 팀</span><span class="num">6 / 6명</span></li>
      </ul>
    </div>
  </div>
  <div class="mock m-rep">
    <div class="mock-body">
      <div class="between"><span class="mt">하루 몰입 시간 · 팀 평균</span><span class="delta">1.5배</span></div>
      <div class="big">6.1<small>시간</small> <small>이용 전 4.0시간</small></div>
      {mini_bars(DAILY, 4.0, 300, 64)}
    </div>
  </div>
</div>"""

home = f"""
<section class="hero">
  {MESH}
  <div class="wrap">
    <div class="hero-copy">
      <a class="hero-badge" href="#apply"><b>모집 중</b>1호점 무료 체험 사전 신청</a>
      <h1>본사에서 1시간,<br>우리 팀만 쓰는<br>보안 오피스</h1>
      <p class="lead">지역의 폐교를 기업 TF팀 전용 거점으로 고쳤습니다. 한 팀이 독채를 통째로 쓰고, 보안 접속과 근태, 법인 정산, 성과 리포트까지 한 번에 처리합니다.</p>
      <div class="btn-row">
        <a class="btn" href="#apply">사전 신청하기 <span class="arr" aria-hidden="true">›</span></a>
        <a class="btn line" href="login.html">이용 화면 미리 써보기</a>
      </div>
      <div class="hero-facts">
        <div><b data-min-price>20만원~</b><span>팀 1일 · 법인 정산</span></div>
        <div><b>최대 10인</b><span>독채 단독 사용</span></div>
        <div><b>3단계</b><span>고객사 보안 수준별</span></div>
      </div>
    </div>
    {COMPOSITE}
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <h2>TF가 본사에 있으면<br>몰입할 시간이 사라집니다</h2>
      <p class="lead">마감이 정해진 신사업·AX·기획 TF일수록 호출과 회의에 하루가 쪼개집니다. 도심 공유오피스는 월 고정 계약에 여러 회사가 같은 동선을 쓰고, 워케이션은 근태와 법인 결제를 확인하기 어렵습니다.</p>
    </div>
    <div class="stats">
      <div class="stat"><span class="big">58<small>%</small></span><p>직장인이 근무 시간 중 본업이 아닌 일에 쓰는 비율</p></div>
      <div class="stat"><span class="big">11<small>/ 14명</small></span><p>하루 몰입 시간이 4시간이 안 된다고 답한 수도권 중견·대기업 실무자</p></div>
      <div class="stat"><span class="big">420<small>만원</small></span><p>몰입 방해로 생기는 직원 1명당 연간 생산성 손실 추정</p></div>
    </div>
    <p class="note" style="margin-top:20px">출처: Asana(2023), TreeON 기업 임직원 설문(2026.07, 실무자 14명), Gallup(2006·2019) 기반 추정</p>
  </div>
</section>

<section class="soft" id="how">
  <div class="wrap">
    <div class="sec-head">
      <h2>예약부터 리포트까지<br>네 단계로 끝납니다</h2>
      <p class="lead">총무·인사·IT가 나눠 하던 외부 공간 견적, 결재, 보안 설정, 근태 확인을 한 화면에서 처리합니다.</p>
    </div>
    <div class="features">
      <article class="feat">
        <div class="mini" aria-hidden="true">
          <div class="chips-d"><span class="on">6</span><span class="in">7</span><span class="in">8</span><span class="in">9</span><span class="on">10</span></div>
          <div class="ln"><span>폐교형 · 6명</span><b>평일 5일</b></div>
          <div class="ln"><span>합계</span><b>1,925,000원</b></div>
        </div>
        <div class="bd"><span class="step">1단계</span><h3>예약</h3><p>공간·날짜·인원·보안 수준을 고르면 금액이 바로 나옵니다. 견적서와 사내 품의서 초안도 같은 화면에서 받습니다.</p><p class="goal">외부 공간 준비 <b>3~5일 → 45분</b></p></div>
      </article>
      <article class="feat">
        <div class="mini" aria-hidden="true">
          <span class="small">일회용 비밀번호</span>
          <div class="otp-m">482 913</div>
          <div class="ln"><span class="dotl">출근 09:02</span><b>인사시스템 전송</b></div>
        </div>
        <div class="bd"><span class="step">2단계</span><h3>입실·근무</h3><p>예약자에게만 모바일 키와 일회용 비밀번호가 나갑니다. 출퇴근 태그는 본사 인사시스템으로 자동 전송됩니다.</p><p class="goal">투입 담당자 <b>3~4명 → 1명</b></p></div>
      </article>
      <article class="feat">
        <div class="mini" aria-hidden="true">
          <div class="ln"><span>세금계산서 · 법인 일괄</span><b>발행</b></div>
          <div class="ln"><span>공급가액</span><b>3,500,000원</b></div>
          <div class="ln"><span>입금 기한</span><b>발행 후 15일</b></div>
        </div>
        <div class="bd"><span class="step">3단계</span><h3>정산</h3><p>이용이 끝나면 세금계산서를 법인으로 한 번에 발행합니다. 개인 결제와 영수증 정리가 없습니다.</p><p class="goal">계약 단위 <b>일 단위</b></p></div>
      </article>
      <article class="feat">
        <div class="mini" aria-hidden="true">
          <div class="ln"><span>하루 몰입 시간</span><b>4.0 → 6.1시간</b></div>
          {mini_bars(DAILY, 4.0, 220, 56)}
        </div>
        <div class="bd"><span class="step">4단계</span><h3>리포트</h3><p>이용 전후 몰입 시간, 업무가 끊긴 횟수, 일정 변화를 리포트로 받아 경영진 보고에 씁니다.</p><p class="goal">하루 몰입 <b>4시간 → 6시간</b></p></div>
      </article>
    </div>
    <div class="cream">
      <div class="stack-sm"><h3>1호점 실증 목표</h3><p class="note">출처: TreeON 기업 임직원 설문(2026.07), 보안 전문기업 자문</p></div>
      <div class="targets">
        <div><span class="lb">하루 몰입 시간</span><span class="from">4시간</span><span class="to">6시간</span></div>
        <div><span class="lb">업무 생산성</span><span class="from">현재 대비</span><span class="to">1.5배</span></div>
        <div><span class="lb">프로젝트 리드타임</span><span class="from">현재 대비</span><span class="to">25% 단축</span></div>
        <div><span class="lb">견적·결재·보안 설정</span><span class="from">3~5일</span><span class="to">45분</span></div>
      </div>
    </div>
  </div>
</section>

<section id="spaces">
  <div class="wrap">
    <div class="sec-head">
      <h2>폐교 50평 독채,<br>한 팀이 통째로 씁니다</h2>
      <p class="lead">지자체가 리모델링한 유휴시설을 팀 거점으로 운영합니다. 도면에서 방을 누르면 그 공간의 모습이 나옵니다.</p>
    </div>
    <div class="tour">
      {PLAN_CARD}
      <div class="viewer">
        <button type="button" class="viewer-img" id="tour-open" data-lightbox="01-aerial" data-room="" aria-label="사진 크게 보기"><img id="tour-img" src="assets/img/a/01-aerial.webp" alt="폐교형 전체 공간 조감도" width="1600" height="900"><span class="zoom" aria-hidden="true">크게 보기</span></button>
        <div class="viewer-bar">
          <div class="stack-sm" style="gap:2px"><b id="tour-title">전체 공간 조감도</b><span id="tour-desc" class="small">50평 전체 구성. 위쪽이 통화실·회복라운지·프로젝트룸, 아래쪽이 집중업무실과 입구·화장실입니다.</span></div>
          <div class="row" style="gap:8px">
            <div class="seg" id="glass-seg" hidden><button type="button" aria-pressed="true" data-glass="04a-glass-clear">스마트글라스 투명</button><button type="button" aria-pressed="false" data-glass="04b-glass-frosted">불투명</button></div>
            <button type="button" class="btn sm line" id="tour-more" data-lightbox="01-aerial" data-room="">사진 전체 보기</button>
          </div>
        </div>
      </div>
    </div>
    <div class="gstrip" data-gallery-grid=""></div>
    <p class="note" style="margin-top:12px">폐교형 리모델링 컨셉 이미지입니다. 실제 공간은 현장 여건에 따라 달라질 수 있습니다.</p>

    <article class="space wide" style="margin-top:56px">
      <div class="ph"><img src="assets/img/a/17-exterior.webp" alt="폐교형 거점 리모델링 후 외관 컨셉 이미지" loading="lazy" width="1600" height="900"></div>
      <div class="bd">
        <div class="between"><h3>폐교형 거점</h3><span class="chip navy">50평 · 최대 10인</span></div>
        <p class="small">폐교 교실을 고친 독채. 큰 TF나 기획·개발 스프린트에 맞습니다.</p>
        <dl class="spec"><dt>업무</dt><dd>집중업무실 10석, 프로젝트룸 12인 (스마트글라스)</dd><dt>휴식</dt><dd>회복라운지, 탕비시설, 중앙 휴게 벤치</dd><dt>통화</dt><dd>1인 통화실</dd><dt>출입</dt><dd>안면인식, 신발장</dd><dt>장비</dt><dd>인체공학 의자, QHD 듀얼 모니터, 75인치 전자칠판, 기가 인터넷</dd></dl>
        <a class="btn line sm" style="align-self:flex-start" href="#apply">이 공간 체험 신청</a>
      </div>
    </article>
      </div>
</section>

<section class="dark" id="security">
  <div class="wrap">
    <div class="sec-head">
      <h2>고객사 보안 수준에 맞춰<br>세 가지 방식으로 접속합니다</h2>
      <p class="lead">거점에 장비를 쌓지 않고 클라우드에서 중앙 관리합니다. 거점이 늘어나도 같은 보안 기준이 그대로 적용됩니다.</p>
    </div>
    <div class="tiers">
      <div class="tier"><span class="lv" aria-hidden="true"><i class="on"></i><i></i><i></i></span><h3>고객사 VPN 연동</h3><p>본사 보안망을 그대로 씁니다. 고객사 IT팀이 발급한 VPN 계정으로 접속합니다.</p><p class="who">VPN을 이미 쓰는 기업 · 추가 비용 없음</p></div>
      <div class="tier"><span class="lv" aria-hidden="true"><i class="on"></i><i class="on"></i><i></i></span><h3>트리온 보안 접속</h3><p>VPN이 없는 단기 TF용. 트리온 클라우드 보안 플랫폼으로 업무 자료에 접속합니다.</p><p class="who">단기 TF · 패키지에 포함</p></div>
      <div class="tier"><span class="lv" aria-hidden="true"><i class="on"></i><i class="on"></i><i class="on"></i></span><h3>고보안 전용</h3><p>장기 TF, 망분리·전용 회선처럼 별도 요구가 있으면 따로 협의해 구성합니다.</p><p class="who">장기·시크릿 프로젝트 · 별도 협의</p></div>
    </div>
    <div class="base-sec">
      <div>예약자에게만 모바일 키와 일회용 비밀번호</div>
      <div>퇴실 후 공용 기기 초기화, 클린 데스크</div>
      <div>출입 동선 CCTV, 업무 공간 내부는 촬영 안 함</div>
      <div>이용 전 보안 수칙 동의</div>
    </div>
  </div>
</section>

<section id="pricing">
  <div class="wrap">
    <div class="sec-head">
      <h2>팀 1일 단위로,<br>쓴 만큼만 냅니다</h2>
      <p class="lead">월 고정 계약이 없습니다. 이용이 끝나면 세금계산서를 법인으로 한 번에 발행합니다.</p>
    </div>
    <div class="pricing">
      <div class="price-card">
        <h3 data-pkg-name="commute">출퇴근형</h3><p class="desc">당일 출퇴근하며 낮 시간 몰입이 필요한 TF</p>
        <div class="rows"><div><span>팀 1일 · 최대 10인</span><b><span data-price="commute">200,000</span><small>원</small></b></div></div>
        <ul><li>점심 식사 포함</li><li>출퇴근 태그·근태 연동</li><li>몰입 리포트</li></ul>
        <a class="btn line" href="#apply">사전 신청</a>
      </div>
      <div class="price-card featured">
        <span class="flag">마감 TF 추천</span>
        <h3 data-pkg-name="mid">중기 체류형</h3><p class="desc">2박 3일~1주, 숙박하며 마감을 끝내는 TF</p>
        <div class="rows"><div><span>팀 1일 · 최대 10인</span><b><span data-price="mid">350,000</span><small>원</small></b></div></div>
        <ul><li>숙박·식사 포함 (지역 제휴)</li><li>출퇴근 태그·근태 연동</li><li>몰입·만족도·ESG 리포트</li></ul>
        <a class="btn light" href="#apply">사전 신청</a>
      </div>
      <div class="price-card">
        <h3 data-pkg-name="long">장기 체류형</h3><p class="desc">1주 이상 머무는 장기·시크릿 프로젝트</p>
        <div class="rows"><div><span>팀 1일 · 최대 10인</span><b><span data-price="long">450,000</span><small>원</small></b></div></div>
        <ul><li>숙박·식사 포함 (지역 제휴)</li><li>고보안 전용 구성 협의</li><li>연간 이용 계약 전환 가능</li></ul>
        <a class="btn line" href="#apply">사전 신청</a>
      </div>
    </div>
    <p class="note" style="margin-top:14px">팀 1일 기준, 부가세 별도. 1호점 실증 전 예시 단가로 확정 시 바뀔 수 있습니다. 사전 신청 기업은 2~7일 무료 체험을 먼저 안내합니다.</p>

    <h3 style="margin:72px 0 18px;font-weight:300;font-size:1.6rem;letter-spacing:-.03em">다른 선택지와 비교하면</h3>
    <div class="table-wrap">
      <table>
        <thead><tr><th></th><th class="us">TreeON Office</th><th>도심 공유오피스</th><th>관광형 워케이션</th></tr></thead>
        <tbody>
          <tr><th>공간</th><td class="us">한 팀이 독채를 단독 사용</td><td>전용실이 있어도 공용 동선</td><td>공용 라운지 중심</td></tr>
          <tr><th>보안</th><td class="us">고객사 보안 수준별 3가지</td><td>여러 회사가 같은 층 사용</td><td>공용 와이파이와 공간</td></tr>
          <tr><th>가격</th><td class="us num" data-price-range>팀 1일 20만~45만원</td><td class="num">월 150만~400만원</td><td class="num">1인 1일 5만~20만원</td></tr>
          <tr><th>계약·정산</th><td class="us">일 단위, 법인 일괄 정산</td><td>월 단위 이상 고정 계약</td><td>개인 신청 위주, 증빙 미흡</td></tr>
          <tr><th>업무 환경</th><td class="us">본사에서 1시간, 호출과 소음 차단</td><td>도심 그대로, 환경 변화 적음</td><td>관광 위주 설계</td></tr>
        </tbody>
      </table>
    </div>
    <p class="note" style="margin-top:12px">출처: 경쟁 사업장 현장 조사(서울 도심형, 완도, 남해, 2026.06~07)</p>
  </div>
</section>

<section class="soft" id="apply">
  <div class="wrap apply-grid">
    <div class="aside">
      <h2>1호점 사전 신청</h2>
      <p class="lead">서울에서 1시간 거리의 1호점 실증을 준비하고 있습니다. 사전 신청한 기업에 2~7일 무료 체험을 먼저 안내합니다.</p>
      <ol>
        <li>신청서를 보내면 2영업일 안에 담당자가 연락합니다</li>
        <li>TF 일정과 보안 요구에 맞춰 체험 일정을 잡습니다</li>
        <li>체험이 끝나면 팀 몰입 리포트를 드립니다</li>
      </ol>
      <p class="small">이미 회원이라면 <a class="link" href="login.html">로그인</a>해서 예약 화면을 먼저 써 볼 수 있습니다.</p>
    </div>
    <div class="apply-box">
      <form id="apply-form" class="form" name="apply" method="POST" data-netlify="true" netlify-honeypot="bot-field" novalidate>
        <input type="hidden" name="form-name" value="apply">
        <p hidden><label>비워 두세요 <input name="bot-field"></label></p>
        <div class="field"><label for="a-company">회사명<span class="req">*</span></label><input id="a-company" name="company" type="text" required autocomplete="organization"></div>
        <div class="field"><label for="a-size">회사 규모<span class="req">*</span></label>
          <select id="a-size" name="size" required><option value="">선택하세요</option><option>100인 미만</option><option>100~299인</option><option>300~999인</option><option>1,000인 이상</option></select></div>
        <div class="field"><label for="a-name">담당자 이름<span class="req">*</span></label><input id="a-name" name="name" type="text" required autocomplete="name"></div>
        <div class="field"><label for="a-role">부서·직급</label><input id="a-role" name="role" type="text" placeholder="예: 신사업전략팀 팀장" autocomplete="organization-title"></div>
        <div class="field"><label for="a-email">회사 이메일<span class="req">*</span></label><input id="a-email" name="email" type="email" required autocomplete="email"></div>
        <div class="field"><label for="a-phone">연락처<span class="req">*</span></label><input id="a-phone" name="phone" type="tel" required autocomplete="tel" placeholder="010-0000-0000"></div>
        <fieldset class="field full" style="border:0;padding:0;margin:0"><legend class="lab" style="margin-bottom:7px;font-size:.9rem;font-weight:650">이용 목적 <span class="hint">(여러 개 선택)</span></legend>
          <div class="opts">
            <label class="opt"><input type="checkbox" name="purpose" value="신사업 TF"><span>신사업 TF</span></label>
            <label class="opt"><input type="checkbox" name="purpose" value="AX·DX TF"><span>AX·DX TF</span></label>
            <label class="opt"><input type="checkbox" name="purpose" value="전략·기획 보고"><span>전략·기획 보고</span></label>
            <label class="opt"><input type="checkbox" name="purpose" value="개발 스프린트"><span>개발 스프린트</span></label>
            <label class="opt"><input type="checkbox" name="purpose" value="시크릿 프로젝트"><span>시크릿 프로젝트</span></label>
            <label class="opt"><input type="checkbox" name="purpose" value="팀 워크숍"><span>팀 워크숍</span></label>
          </div>
        </fieldset>
        <div class="field"><label for="a-team">예상 인원<span class="req">*</span></label>
          <select id="a-team" name="team" required><option value="">선택하세요</option><option>2~3명</option><option>4~6명</option><option>7~10명</option><option>10명 초과 (분할 이용)</option></select></div>
        <div class="field"><label for="a-when">희망 시기</label>
          <select id="a-when" name="when"><option>2027년 1분기</option><option selected>2027년 2분기</option><option>2027년 하반기</option><option>아직 미정</option></select></div>
        <div class="field"><label for="a-pkg">관심 패키지</label>
          <select id="a-pkg" name="package"><option>출퇴근형</option><option>중기 체류형 (숙박)</option><option>장기 체류형 (숙박)</option><option>아직 모름</option></select></div>
        <div class="field"><label for="a-sec">필요한 보안 수준</label>
          <select id="a-sec" name="security"><option>고객사 VPN 연동</option><option>트리온 보안 접속</option><option>고보안 전용 (별도 협의)</option><option>사내 확인 필요</option></select></div>
        <fieldset class="field full" style="border:0;padding:0;margin:0"><legend class="lab" style="margin-bottom:7px;font-size:.9rem;font-weight:650">2~7일 무료 체험</legend>
          <div class="opts">
            <label class="opt"><input type="radio" name="trial" value="희망" checked><span>체험해 보고 싶습니다</span></label>
            <label class="opt"><input type="radio" name="trial" value="정보만"><span>우선 자료만 받겠습니다</span></label>
          </div>
        </fieldset>
        <div class="field full"><label for="a-msg">궁금한 점</label><textarea id="a-msg" name="message" placeholder="TF 일정, 보안 규정, 식사·숙박 요구 등을 적어 주세요."></textarea></div>
        <label class="check full"><input type="checkbox" name="privacy" value="동의" required> <span>사전 신청 처리를 위한 개인정보 수집·이용에 동의합니다. <a class="link" href="privacy.html" target="_blank">내용 보기</a></span></label>
        <div class="full stack-sm">
          <p id="apply-status" class="form-status" role="alert" hidden></p>
          <div class="btn-row"><button class="btn teal" type="submit">사전 신청하기</button><button class="btn line" type="button" id="apply-mail" hidden>메일로 보내기</button></div>
        </div>
      </form>
      <div id="apply-done" class="done" hidden>
        <span class="mark" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
        <h3>사전 신청을 받았습니다</h3>
        <p class="lead"><b data-company></b>의 신청 내용을 확인한 뒤 2영업일 안에 <b data-email></b>로 연락드립니다.</p>
        <p class="small">기다리는 동안 예약·근태·리포트 화면을 먼저 써 볼 수 있습니다.</p>
        <div class="btn-row"><a class="btn" href="signup.html">회원가입하고 둘러보기</a><a class="btn line" href="login.html">데모 계정으로 보기</a></div>
    </div>
  </div>
</section>

<section>
  <div class="wrap faq-grid">
    <div class="stack-sm"><h2>자주 묻는 질문</h2><p class="small">더 궁금한 점은 사전 신청서의 '궁금한 점'에 남겨 주세요.</p></div>
    <div class="faq">
      <details><summary>개인도 이용할 수 있나요?</summary><p>TreeON Office는 기업 TF팀 단위로 운영합니다. 계약과 정산은 법인 기준이며, 한 팀이 거점을 단독으로 씁니다.</p></details>
      <details><summary>1호점은 어디에 생기나요?</summary><p>서울에서 1시간 안에 닿는 지역의 유휴시설을 지자체와 협의하고 있습니다. 위치가 확정되면 사전 신청한 기업에 가장 먼저 알려 드립니다.</p></details>
      <details><summary>회사 보안 규정이 까다로운데 괜찮을까요?</summary><p>고객사 VPN 연동, 트리온 보안 접속, 고보안 전용 중에서 고를 수 있습니다. 망분리 같은 별도 요구는 고보안 전용으로 협의합니다. 모든 거점에 예약자 전용 출입, 퇴실 후 기기 초기화, 클린 데스크가 기본으로 들어갑니다.</p></details>
      <details><summary>외부 근무 중 근태는 어떻게 확인하나요?</summary><p>팀원이 앱에서 출퇴근 태그를 하면 시각이 본사 인사시스템으로 자동 전송됩니다. 이용이 끝나면 근태 확인서를 결재 서류로 받을 수 있습니다.</p></details>
      <details><summary>결제는 어떻게 하나요?</summary><p>이용 중 결제는 없습니다. 이용이 끝나면 세금계산서를 법인으로 한 번에 발행하고, 발행일로부터 15일 안에 입금하면 됩니다.</p></details>
      <details><summary>식사와 숙박은 어떻게 되나요?</summary><p>출퇴근형은 점심이, 체류형은 숙박과 식사가 포함됩니다. 거점 주변 제휴 식당과 카페는 따로 결제하지 않고 이용 금액에 함께 정산됩니다.</p></details>
      <details><summary>무료 체험은 어떻게 하나요?</summary><p>사전 신청한 기업 중 일정이 맞는 곳부터 2~7일 무료 체험을 안내합니다. 체험이 끝나면 이용 전후 몰입 시간을 비교한 리포트를 드립니다.</p></details>
    </div>
  </div>
</section>

<section class="cta-band">
  {MESH}
  <div class="wrap cta-inner">
    <h2>다음 TF는 본사 밖, 우리 팀만의 거점에서</h2>
    <div class="btn-row"><a class="btn" href="#apply">사전 신청하기 <span class="arr" aria-hidden="true">›</span></a><a class="btn line" href="login.html">이용 화면 미리 써보기</a></div>
  </div>
</section>
"""
write("index.html", head("index.html", "TreeON Office | 본사에서 1시간, 우리 팀만 쓰는 보안 오피스",
                         "지역의 폐교를 기업 TF팀 전용 보안 오피스로. 한 팀 단독 사용, 고객사 보안 수준별 접속, 근태·법인 정산·몰입 리포트까지 한 번에. 1호점 사전 신청 중.")
      + site_header() + home + FOOTER)

# ================= 회원가입 / 로그인 =================
AUTH_SIDE = """<aside class="auth-side">
  <div class="mesh" aria-hidden="true"><i class="m1"></i><i class="m2"></i><i class="m3"></i><i class="m4"></i><i class="m5"></i><i class="m6"></i></div>
  <a href="index.html" aria-label="TreeON Office 홈"><img class="logo" src="assets/img/logo.png" alt="TreeON Office" width="163" height="30"></a>
  <div class="stack">
    <h2>{title}</h2>
    <ul class="hide-m">
      <li>공간·날짜·인원을 고르면 팀 1일 금액이 바로 계산됩니다</li>
      <li>모바일 키와 출퇴근 태그, 회의 공간 예약을 한 화면에서</li>
      <li>견적서·품의서 초안·근태 확인서를 바로 받습니다</li>
      <li>이용 전후 몰입 시간을 비교한 리포트 샘플을 볼 수 있습니다</li>
    </ul>
  </div>
  <p class="small hide-m">시장검증용 체험 버전입니다. 실제 예약·결제·출입은 이루어지지 않습니다.</p>
</aside>"""

signup = head("signup.html", "회원가입 | TreeON Office", "TreeON Office 회원가입. 예약, 오피스 이용, 몰입 리포트, 결재 서류를 한 곳에서.") + """<body>
<div class="auth">
""" + AUTH_SIDE.format(title="팀 거점 예약부터 리포트까지,<br>먼저 써 보세요") + """
<main class="auth-main" id="main">
  <div class="auth-card">
    <div class="stack-sm"><h1>회원가입</h1><p class="small">이미 계정이 있나요? <a class="link" href="login.html">로그인</a></p></div>
    <form id="signup-form" class="form" name="signup" method="POST" data-netlify="true" netlify-honeypot="bot-field" novalidate>
      <input type="hidden" name="form-name" value="signup">
      <p hidden><label>비워 두세요 <input name="bot-field"></label></p>
      <div class="field"><label for="s-name">이름<span class="req">*</span></label><input id="s-name" name="name" type="text" required autocomplete="name"></div>
      <div class="field"><label for="s-company">회사명<span class="req">*</span></label><input id="s-company" name="company" type="text" required autocomplete="organization"></div>
      <div class="field"><label for="s-dept">부서·직급</label><input id="s-dept" name="dept" type="text" placeholder="예: 인사팀 매니저" autocomplete="organization-title"></div>
      <div class="field"><label for="s-email">회사 이메일<span class="req">*</span></label><input id="s-email" name="email" type="email" required autocomplete="email"><span class="hint">로그인 아이디로 씁니다.</span></div>
      <div class="field"><label for="s-phone">연락처</label><input id="s-phone" name="phone" type="tel" autocomplete="tel" placeholder="010-0000-0000"></div>
      <div class="field"><label for="pw">비밀번호<span class="req">*</span></label><input id="pw" type="password" required minlength="8" autocomplete="new-password"><span class="hint">8자 이상</span></div>
      <div class="field"><label for="pw2">비밀번호 확인<span class="req">*</span></label><input id="pw2" type="password" required minlength="8" autocomplete="new-password"></div>
      <label class="check"><input type="checkbox" name="privacy" value="동의" required> <span>서비스 이용을 위한 개인정보 수집·이용에 동의합니다. <a class="link" href="privacy.html" target="_blank">내용 보기</a></span></label>
      <label class="check"><input type="checkbox" name="marketing" value="수신 동의"> <span>1호점 오픈·무료 체험 소식을 이메일로 받겠습니다 (선택)</span></label>
      <p id="signup-status" class="form-status" role="alert" hidden></p>
      <button class="btn block" type="submit">가입하고 시작하기</button>
    </form>
    <div id="signup-confirm" class="done" hidden>
      <h2>인증 메일을 보냈습니다</h2>
      <p class="lead"><b data-email></b>로 온 메일의 링크를 누르면 가입이 끝납니다.</p>
      <a class="btn" href="login.html">로그인 화면으로</a>
    </div>
  </div>
</main>
</div>
""" + scripts("", ["config", "data", "auth", "db", "main"]) + "</body>\n</html>\n"
write("signup.html", signup)

login = head("login.html", "로그인 | TreeON Office", "TreeON Office 로그인") + """<body>
<div class="auth">
""" + AUTH_SIDE.format(title="우리 팀 거점,<br>이 화면에서 관리합니다") + """
<main class="auth-main" id="main">
  <div class="auth-card">
    <div class="stack-sm"><h1>로그인</h1><p class="small">처음이신가요? <a class="link" href="signup.html">회원가입</a></p></div>
    <form id="login-form" class="form" novalidate>
      <div class="field"><label for="l-email">회사 이메일</label><input id="l-email" name="email" type="email" required autocomplete="email"></div>
      <div class="field"><label for="l-pw">비밀번호</label><input id="l-pw" name="password" type="password" required autocomplete="current-password"></div>
      <p id="login-status" class="form-status" role="alert" hidden></p>
      <button class="btn block" type="submit">로그인</button>
      <a href="#" id="forgot" class="small link" style="justify-self:start">비밀번호를 잊으셨나요?</a>
    </form>
    <form id="reset-form" class="form" hidden novalidate>
      <div class="field"><label for="np">새 비밀번호</label><input id="np" type="password" required minlength="8" autocomplete="new-password"><span class="hint">8자 이상</span></div>
      <div class="field"><label for="np2">새 비밀번호 확인</label><input id="np2" type="password" required minlength="8" autocomplete="new-password"></div>
      <p id="reset-status" class="form-status" role="alert" hidden></p>
      <button class="btn block" type="submit">비밀번호 바꾸기</button>
    </form>
    <div class="divider" id="demo-divider">또는</div>
    <button class="btn line block" id="demo-login" type="button">데모 계정으로 둘러보기</button>
    <p class="small">데모 계정은 가입 없이 예약·이용·리포트 화면을 미리 보는 용도입니다.</p>
  </div>
</main>
</div>
""" + scripts("", ["config", "data", "auth", "db", "main"]) + "</body>\n</html>\n"
write("login.html", login)

privacy = head("privacy.html", "개인정보 처리방침 | TreeON Office", "TreeON Office 개인정보 수집·이용 안내") + site_header() + """
<section>
  <div class="wrap stack" style="max-width:780px">
    <h1 style="font-size:2rem">개인정보 수집·이용 안내</h1>
    <p class="lead">TreeON(이하 "회사")은 사전 신청과 서비스 이용에 필요한 최소한의 개인정보만 받습니다.</p>
    <div class="table-wrap"><table>
      <thead><tr><th>구분</th><th>수집 항목</th><th>이용 목적</th><th>보유 기간</th></tr></thead>
      <tbody>
        <tr><th>사전 신청</th><td>회사명, 담당자 이름, 부서·직급, 이메일, 연락처, 이용 희망 정보</td><td>사전 신청 확인, 무료 체험 안내, 상담</td><td>신청일로부터 1년 또는 삭제 요청 시까지</td></tr>
        <tr><th>회원가입</th><td>이름, 회사명, 부서·직급, 이메일, 연락처, 비밀번호(암호화)</td><td>로그인, 예약·이용 관리, 서류 발급</td><td>회원 탈퇴 시까지</td></tr>
        <tr><th>서비스 이용</th><td>예약 내역, 출퇴근 태그 시각, 서류 신청 내역</td><td>근태 연동, 정산, 리포트 작성</td><td>계약 종료 후 관계 법령에 따른 기간</td></tr>
      </tbody>
    </table></div>
    <p>동의를 거부할 수 있으며, 이 경우 사전 신청과 회원가입이 제한됩니다. 개인정보 열람·정정·삭제는 <a class="link" data-contact-mail href="#">문의 메일</a>로 요청하세요.</p>
    <p class="small">시행일: 2026년 11월 · 법인 설립 후 정식 처리방침으로 교체됩니다.</p>
  </div>
</section>
""" + FOOTER
write("privacy.html", privacy)

# ================= 로그인 후 앱 =================
I = {
    "home": '<path d="M4 11l8-6.5 8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
    "reserve": '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3M8 17h6"/>',
    "office": '<circle cx="8" cy="15" r="4"/><path d="M11 12.5l8.5-8.5M16 7l2.5 2.5M14 9l2 2"/>',
    "report": '<path d="M4 20V4M4 20h16"/><rect x="7.5" y="12" width="3" height="5" rx=".6"/><rect x="12.5" y="8" width="3" height="9" rx=".6"/><rect x="17.5" y="5" width="2.5" height="12" rx=".6"/>',
    "approval": '<path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5M9 13l2 2 4-4"/>',
    "guide": '<path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
}
I.update({
    "inbox": '<path d="M3.5 13.5 6 5h12l2.5 8.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z"/><path d="M3.5 13.5H9l1 2h4l1-2h5.5"/>',
    "edit": '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    "gear": '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 6.6l2 1.2M17.8 16.2l2 1.2M4.2 17.4l2-1.2M17.8 7.8l2-1.2"/>',
})
APP_NAV = [("index.html", "home", "홈", "홈"), ("reserve.html", "reserve", "오피스 예약", "예약"),
           ("office.html", "office", "오피스 이용", "이용"), ("report.html", "report", "집중도 리포트", "리포트"),
           ("approval.html", "approval", "결재 서류", "서류"), ("guide.html", "guide", "이용 안내", "안내")]


def icon(k):
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{I[k]}</svg>'


def app_page(file, key, title, body, extra=""):
    side = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == file else ""}>{icon(k)}<span>{t}</span></a>' for h, k, t, _ in APP_NAV)
    tabs = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == file else ""}>{icon(k)}<span>{s}</span></a>' for h, k, _, s in APP_NAV)
    html = head("app/" + file, f"{title} | TreeON Office", "TreeON Office 이용자 화면", prefix="../", index=False) + f"""<body class="app auth-pending" data-page="{key}">
<a class="skip" href="#main">본문으로 건너뛰기</a>
<div class="shell">
  <aside class="side">
    <a href="../index.html" aria-label="TreeON Office 소개 페이지"><img class="logo" src="../assets/img/logo-white.png" alt="TreeON Office" width="151" height="28"></a>
    <nav aria-label="이용자 메뉴">{side}</nav>
    <div class="me"><b data-me-name></b><span data-me-company></span><button type="button" data-logout>로그아웃</button></div>
  </aside>
  <div>
    <header class="topbar"><a href="index.html" aria-label="홈"><img src="../assets/img/logo.png" alt="TreeON Office" width="130" height="24"></a><button type="button" data-logout>로그아웃</button></header>
    <main class="main" id="main">
      <p class="sample-flag no-print" style="margin-bottom:18px">시장검증용 체험 버전 · 실제 예약·결제·출입은 이루어지지 않습니다</p>
{body}
    </main>
  </div>
</div>
<nav class="tabbar" aria-label="이용자 메뉴">{tabs}</nav>
{extra}
{scripts("../", ["config", "data", "auth", "db", "gallery", "app"])}</body>
</html>
"""
    write("app/" + file, html)


app_page("index.html", "home", "홈", f"""
      <div class="page-head"><div><h1>안녕하세요, <span data-me-name></span>님</h1><p data-me-company></p></div><a class="btn" href="reserve.html">오피스 예약하기</a></div>
      <div class="panel navy" id="welcome" hidden style="margin-bottom:18px"><h2>가입을 환영합니다</h2><p class="small">오른쪽 체크리스트 순서대로 보안 수칙 동의, 첫 예약, 서류 신청을 해 보세요. 이용 화면은 '오늘 이용하는 것으로 체험하기'로 바로 써 볼 수 있습니다.</p></div>
      <div class="grid-app">
        <div class="panel c8" id="next-res"></div>
        <div class="panel c4"><div class="between"><h2>시작하기</h2><span class="small num" id="todo-count"></span></div><ul class="todo" id="todo"></ul></div>
        <div class="c12 quick">
          <a href="reserve.html">{icon("reserve")}<b>오피스 예약</b><span>공간·날짜·인원 고르고 금액 확인</span></a>
          <a href="office.html">{icon("office")}<b>오피스 이용</b><span>모바일 키, 출퇴근 태그, 회의실</span></a>
          <a href="report.html">{icon("report")}<b>집중도 리포트</b><span>이용 전후 몰입 시간 비교 샘플</span></a>
          <a href="approval.html">{icon("approval")}<b>결재 서류</b><span>견적서·품의서·근태 확인서</span></a>
          <a href="guide.html">{icon("guide")}<b>이용 안내</b><span>공간 사용법, 주변 식당·카페</span></a>
        </div>
        <div class="panel promo c12" id="notice"><div class="mesh" aria-hidden="true"><i class="m1"></i><i class="m2"></i><i class="m3"></i><i class="m4"></i><i class="m5"></i><i class="m6"></i></div><div class="between"><div class="stack-sm"><h2 id="notice-title">1호점 무료 체험을 모집합니다</h2><p class="small" id="notice-body">서울에서 1시간 거리 1호점 실증 기간에 TF팀 2~7일 무료 체험을 운영합니다. 체험이 끝나면 팀 몰입 리포트를 드립니다.</p></div><a class="btn" id="notice-cta" href="../index.html#apply">무료 체험 신청</a></div></div>
      </div>""")

app_page("reserve.html", "reserve", "오피스 예약", """
      <div class="page-head"><div><h1>오피스 예약</h1><p>팀 1일 단위로 예약하고, 이용이 끝나면 법인으로 한 번에 정산합니다.</p></div></div>
      <form id="reserve-form" class="grid-app" novalidate>
        <div class="c8 stack">
          <div class="panel"><h2>공간</h2><div class="pick one" id="space-pick"></div></div>
          <div class="panel"><h2>패키지</h2><div class="pick three" id="pkg-pick"></div></div>
          <div class="panel">
            <h2>날짜와 인원</h2>
            <div class="g2" style="align-items:start;gap:28px">
              <div class="cal">
                <div class="cal-head"><button type="button" id="cal-prev" aria-label="이전 달">‹</button><b id="cal-title"></b><button type="button" id="cal-next" aria-label="다음 달">›</button></div>
                <div class="cal-grid" id="cal-grid"></div>
              </div>
              <div class="stack">
                <div class="field"><span class="lab">선택한 기간</span><p class="small" id="date-hint" aria-live="polite"></p></div>
                <div class="field"><span class="lab">팀 인원</span><div class="row"><div class="stepper"><button type="button" id="team-minus" aria-label="인원 줄이기">−</button><output id="team-out" aria-live="polite"></output><button type="button" id="team-plus" aria-label="인원 늘리기">+</button></div><span class="small" id="team-hint"></span></div></div>
                <div class="field"><label for="project">프로젝트 이름</label><input id="project" type="text" placeholder="예: AX 신사업 TF" maxlength="40"><span class="hint">견적서와 품의서에 들어갑니다.</span></div>
              </div>
            </div>
          </div>
          <div class="panel"><h2>보안 수준</h2><div class="pick three" id="sec-pick"></div></div>
          <div class="panel"><div class="field"><label for="note" style="font-size:1.12rem;font-weight:750">요청 사항</label><textarea id="note" placeholder="식사 알레르기, 장비 추가, 셔틀 문의 등을 적어 주세요."></textarea></div></div>
        </div>
        <div class="c4">
          <div class="panel navy summary">
            <h2>예약 요약</h2>
            <div id="sum"></div>
            <button class="btn teal block" id="reserve-btn" type="submit" disabled>예약 신청하기</button>
            <p class="small">이용 중 결제는 없습니다. 이용이 끝나면 세금계산서를 법인으로 한 번에 발행합니다.</p>
          </div>
        </div>
      </form>
      <div class="panel" id="my-res" style="margin-top:18px"><h2>내 예약</h2><div id="res-list"></div></div>""")

app_page("office.html", "office", "오피스 이용", """
      <div class="page-head"><div><h1>오피스 이용</h1><p>모바일 키, 출퇴근 태그, 회의 공간 예약을 이 화면에서 씁니다.</p></div><a class="btn line" href="guide.html">이용 안내 보기</a></div>
      <div class="grid-app" id="office"></div>""")

app_page("report.html", "report", "업무 집중도 리포트", """
      <div class="page-head"><div><h1>업무 집중도 리포트</h1><p id="rep-meta"></p></div><div class="btn-row no-print"><button class="btn line sm" id="copy-report" type="button">요약 복사</button><button class="btn sm" id="print-report" type="button">PDF로 저장</button></div></div>
      <p class="small" id="rep-note" style="margin:-12px 0 18px">실제 이용 데이터가 아닌 샘플입니다. 이용이 끝나면 우리 팀 데이터로 같은 형식의 리포트를 받습니다.</p>
      <div class="tabs no-print" role="tablist">
        <button type="button" role="tab" aria-selected="true" data-tab="prod">생산성</button>
        <button type="button" role="tab" aria-selected="false" data-tab="sat">만족도</button>
        <button type="button" role="tab" aria-selected="false" data-tab="esg">ESG·지역 상생</button>
      </div>
      <div data-tabpanel="prod" class="stack">
        <div class="kpis" id="kpis"></div>
        <div class="grid-app">
          <div class="panel c7"><div class="stack-sm" style="gap:2px"><h2>하루 몰입 시간</h2><p class="small">이용 기간 평일 10일 · 팀 평균(시간)</p></div><div class="chart" id="chart-daily"></div></div>
          <div class="panel c5"><div class="stack-sm" style="gap:2px"><h2>시간대별 끊김 횟수</h2><p class="small">호출·메신저·비계획 회의 · 팀 평균(회)</p></div>
            <div class="legend"><span><i style="background:#9db0c8"></i>이용 전 2주</span><span><i style="background:#134a92"></i>이용 기간</span></div>
            <div class="chart" id="chart-int"></div>
            <details><summary class="small" style="cursor:pointer">표로 보기</summary><div class="table-wrap" style="margin-top:10px"><table id="int-table"></table></div></details>
          </div>
          <div class="panel c12"><h2>일정 변화</h2><div class="table-wrap"><table id="milestones"></table></div></div>
        </div>
      </div>
      <div data-tabpanel="sat" class="grid-app" hidden>
        <div class="panel c6"><h2>좋았던 점</h2><div class="stack" id="pos"></div></div>
        <div class="panel c6"><h2>아쉬웠던 점</h2><div class="stack" id="neg"></div></div>
        <div class="panel c12"><h2>항목별 평가</h2><p class="small">팀원 6명 · 5점 만점 평균</p><div class="stack-sm" id="sat"></div></div>
      </div>
      <div data-tabpanel="esg" class="stack" hidden>
        <div class="kpis" id="esg-kpis"></div>
        <div class="grid-app">
          <div class="panel c7"><h2>지역 소비 내역</h2><p class="small">이용 기간 팀 전체 · 만원</p><div class="stack-sm" id="spend"></div></div>
          <div class="panel c5"><h2>이 리포트를 어디에 쓰나요</h2><p class="small" style="font-size:.93rem">팀의 평일 체류는 해당 지역의 생활인구로 집계됩니다. 지역 소비, 유휴시설 가동, 지역 고용 수치는 회사 ESG 보고서의 지역사회 공헌 항목에 그대로 옮길 수 있습니다.</p><p class="small" style="font-size:.93rem">종이 없는 결재 건수는 외부 근무 준비에 들던 서류 작업이 줄었음을 보여 줍니다.</p></div>
        </div>
      </div>""")

app_page("approval.html", "approval", "결재 서류", """
      <div class="page-head"><div><h1>결재 서류 신청</h1><p>사내 결재와 정산에 필요한 서류를 한 번에 신청합니다.</p></div></div>
      <div class="grid-app">
        <form id="doc-form" class="panel c8 form" novalidate>
          <div class="field full"><label for="doc-res">연결할 예약</label><select id="doc-res" name="res"></select></div>
          <fieldset class="field full" style="border:0;padding:0;margin:0"><legend class="lab" style="margin-bottom:8px;font-size:.9rem;font-weight:650">필요한 서류</legend><div class="docs" id="doc-types"></div></fieldset>
          <div class="field"><label for="d-company">회사명<span class="req">*</span></label><input id="d-company" name="company" type="text" required></div>
          <div class="field"><label for="d-biz">사업자등록번호</label><input id="d-biz" name="bizno" type="text" inputmode="numeric" placeholder="000-00-00000" pattern="\\d{3}-\\d{2}-\\d{5}"><span class="hint">세금계산서 발행에 필요합니다.</span></div>
          <div class="field"><label for="d-email">받을 이메일<span class="req">*</span></label><input id="d-email" name="email" type="email" required></div>
          <div class="field"><label for="d-due">필요한 날짜<span class="req">*</span></label><input id="d-due" name="due" type="date" required></div>
          <div class="field full"><label for="d-memo">요청 사항</label><textarea id="d-memo" name="memo" placeholder="회사 품의서 양식, 수신자 추가, 영문 서류 필요 여부 등"></textarea></div>
          <div class="full"><button class="btn" type="submit">서류 신청하기</button></div>
        </form>
        <div class="panel c4">
          <h2>처리 방식</h2>
          <ul class="list">
            <li><div class="stack-sm" style="gap:2px"><span class="t">견적서 · 품의서 초안</span><span class="s">신청 즉시 미리보기·출력</span></div></li>
            <li><div class="stack-sm" style="gap:2px"><span class="t">이용·근태·보안 확인서</span><span class="s">검토 후 발급, 이메일로도 발송</span></div></li>
            <li><div class="stack-sm" style="gap:2px"><span class="t">세금계산서 · 거래명세서</span><span class="s">이용 종료 뒤 법인 일괄 발행, 15일 내 입금</span></div></li>
          </ul>
          <p class="small">외부 공간 견적과 결재, 보안 설정에 3~5일 걸리던 일을 45분 안에 끝내는 것이 목표입니다.</p>
        </div>
        <div class="panel c12"><h2>신청 내역</h2><div id="doc-list"></div></div>
      </div>""", extra="""<dialog class="doc-modal" id="doc-modal" aria-labelledby="doc-title">
  <div class="doc-bar"><b id="doc-title">문서 미리보기</b><div class="btn-row"><button class="btn sm" type="button" data-doc-print>인쇄 · PDF 저장</button><button class="btn sm line" type="button" data-doc-close>닫기</button></div></div>
  <div class="doc" id="doc-body"></div>
</dialog>""")

app_page("guide.html", "guide", "이용 안내", """
      <div class="page-head"><div><h1>이용 안내</h1><p>공간 사용법, 보안 수칙, 주변 식당과 카페를 정리했습니다.</p></div></div>
      <div class="grid-app">
        <div class="panel c5">
          <h2>이용 순서</h2>
          <ol class="howto">
            <li><b>이용 전날</b><p>모바일 키가 활성화되면 알림이 옵니다. 보안 수칙에 동의하고, VPN 계정을 회사 IT팀에서 받아 둡니다.</p></li>
            <li><b>도착·입실</b><p>입구 안면인식기 또는 '오피스 이용' 화면의 일회용 비밀번호로 들어갑니다. 실내화로 갈아 신습니다.</p></li>
            <li><b>출근 태그</b><p>'오피스 이용'에서 출근 태그를 누릅니다. 시각이 본사 인사시스템으로 전송되고 보안 접속이 열립니다.</p></li>
            <li><b>근무</b><p>집중업무실은 조용히 씁니다. 대화와 회의는 프로젝트룸, 통화는 통화실에서 합니다. 둘 다 앱에서 1시간 단위로 예약합니다.</p></li>
            <li><b>퇴실</b><p>클린 데스크와 공용 기기 로그아웃을 확인하고 퇴근 태그를 누릅니다. 공용 기기는 자동으로 초기화됩니다.</p></li>
            <li><b>정산·리포트</b><p>이용이 끝난 다음 영업일에 몰입 리포트가 나오고, 세금계산서는 법인으로 한 번에 발행됩니다.</p></li>
          </ol>
        </div>
        <div class="panel c7">
          <h2>공간 안내</h2>
          <p class="small" id="plan-title"></p>
          <div class="planimg" id="plan-img"></div>
          <div class="zones" id="zones"></div>
          <div class="stack-sm" id="gallery-mini"></div>
          <h3>공용 장비</h3><div class="chips" id="equip"></div>
        </div>
        <div class="panel c6"><h2>보안 수칙</h2><ol id="rules" style="margin:0;padding-left:20px;color:var(--sub);display:flex;flex-direction:column;gap:8px;font-size:.94rem"></ol></div>
        <div class="panel c6"><h2>문의·긴급 연락</h2>
          <dl class="kv"><dt>운영 문의</dt><dd><a class="link" data-contact-mail href="#"></a></dd><dt>현장 관리</dt><dd>평일 08:00–19:00 상주</dd><dt>야간·주말</dt><dd>무인 관제 24시간</dd><dt>입실 가능</dt><dd>08:00–22:00</dd><dt>Wi-Fi</dt><dd>입실 후 '오피스 이용'에 표시</dd></dl>
          <form id="contact-form" class="stack-sm" novalidate>
            <label for="c-msg" class="lab" style="font-size:.88rem;font-weight:500">운영팀에 문의하기</label>
            <textarea id="c-msg" required placeholder="예약 변경, 장비 추가, 보안 설정 등 궁금한 점을 적어 주세요." style="min-height:90px"></textarea>
            <div class="between"><span class="small">답변은 가입한 이메일로 보내 드립니다.</span><button class="btn sm" type="submit">문의 보내기</button></div>
          </form>
        </div>
        <div class="panel c12">
          <div class="between"><h2>가평역 주변 식당·카페·편의시설</h2><div class="seg" id="place-filter"><button type="button" aria-pressed="true" data-f="전체">전체</button><button type="button" aria-pressed="false" data-f="역 도보">역 도보</button><button type="button" aria-pressed="false" data-f="식당">식당</button><button type="button" aria-pressed="false" data-f="카페">카페</button><button type="button" aria-pressed="false" data-f="편의">편의</button></div></div>
          <p class="small" id="places-note"></p>
          <div class="places" id="places"></div>
        </div>
      </div>""")

# ================= sitemap / robots / netlify =================
today = datetime.date.today().isoformat()
urls = ["", "signup.html", "login.html", "privacy.html"]
write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      "".join(f"  <url><loc>{BASE_URL}/{u}</loc><lastmod>{today}</lastmod></url>\n" for u in urls) + "</urlset>\n")
write("robots.txt", f"User-agent: *\nDisallow: /app/\nDisallow: /admin/\nSitemap: {BASE_URL}/sitemap.xml\n")
write("vercel.json", """{
  "cleanUrls": false,
  "trailingSlash": false,
  "headers": [
    { "source": "/app/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex" }, { "key": "Cache-Control", "value": "no-cache" }] },
    { "source": "/admin/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex" }, { "key": "Cache-Control", "value": "no-cache" }] },
    { "source": "/assets/js/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }] },
    { "source": "/(_build|supabase)/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex" }] }
  ],
  "redirects": [
    { "source": "/admin", "destination": "/admin/index.html", "permanent": false },
    { "source": "/app", "destination": "/app/index.html", "permanent": false }
  ]
}
""")
write("netlify.toml", """[build]
  publish = "."

[[headers]]
  for = "/app/*"
  [headers.values]
    X-Robots-Tag = "noindex"
    Cache-Control = "no-cache"

[[headers]]
  for = "/admin/*"
  [headers.values]
    X-Robots-Tag = "noindex"
    Cache-Control = "no-cache"
""")


# ================= 관리자 =================
ADMIN_NAV = [("dash", "home", "대시보드"), ("leads", "inbox", "문의 관리"), ("trials", "reserve", "데모·체험"),
             ("reservations", "office", "예약·서류"), ("reports", "report", "이용 리포트"), ("content", "edit", "정보 수정"), ("settings", "gear", "설정")]
admin_nav = "".join(f'<a href="#{k}" data-nav="{k}">{icon(ic)}<span>{t}</span></a>' for k, ic, t in ADMIN_NAV)
admin_tabs = "".join(f'<a href="#{k}" data-nav="{k}">{icon(ic)}<span>{t.split("·")[0].replace(" 관리","").replace("이용 ","")}</span></a>' for k, ic, t in ADMIN_NAV)
admin = head("admin/index.html", "관리자 | TreeON Office", "TreeON Office 관리자", prefix="../", index=False) + f"""<body class="app admin auth-pending">
<div class="gate" id="gate" hidden>
  <div class="gate-card">
    <img src="../assets/img/logo.png" alt="TreeON Office" width="163" height="30">
    <div class="stack-sm"><h1>관리자 로그인</h1><p class="small">문의·체험·리포트·사이트 정보를 관리합니다.</p></div>
    <form id="gate-form" class="form" novalidate></form>
    <a class="small link" href="../index.html">사이트로 돌아가기</a>
  </div>
</div>
<div class="shell" id="shell" hidden>
  <aside class="side">
    <a href="#dash" aria-label="관리자 홈"><img class="logo" src="../assets/img/logo-white.png" alt="TreeON Office" width="151" height="28"></a>
    <span class="admin-badge">관리자</span>
    <nav aria-label="관리자 메뉴">{admin_nav}</nav>
    <div class="me"><b>관리자</b><span id="mode-label"></span><div class="row" style="gap:6px;margin-top:12px"><a class="side-link" href="../index.html" target="_blank" rel="noopener">사이트 보기</a><button type="button" data-admin-logout style="margin-top:0">로그아웃</button></div></div>
  </aside>
  <div>
    <header class="topbar"><img src="../assets/img/logo.png" alt="TreeON Office" width="130" height="24"><button type="button" data-admin-logout>로그아웃</button></header>
    <main class="main" id="view"></main>
  </div>
</div>
<nav class="tabbar seven" aria-label="관리자 메뉴">{admin_tabs}</nav>
<dialog class="drawer" id="drawer" aria-labelledby="drawer-title">
  <div class="drawer-head"><b id="drawer-title"></b><button type="button" class="lb-x dark" id="drawer-close" aria-label="닫기">×</button></div>
  <div class="drawer-body stack" id="drawer-body"></div>
</dialog>
{scripts("../", ["config", "data", "auth", "db", "admin"])}</body>
</html>
"""
write("admin/index.html", admin)
