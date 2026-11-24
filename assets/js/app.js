// 로그인 후 앱 — body[data-page] 에 따라 화면을 그립니다.
(function () {
  var T = window.TreeON, D = window.TREEON_DATA, CFG = window.TREEON_CONFIG || {};
  var U = null; // 현재 사용자
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------- 공통 유틸 ----------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function won(n) { return Math.round(n).toLocaleString("ko-KR") + "원"; }
  var DOW = ["일", "월", "화", "수", "목", "금", "토"];
  function pad(n) { return String(n).padStart(2, "0"); }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fdate(s, withDow) { var d = parse(s); return d.getFullYear() + "." + pad(d.getMonth() + 1) + "." + pad(d.getDate()) + (withDow === false ? "" : " (" + DOW[d.getDay()] + ")"); }
  function hm(d) { return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function weekdays(a, b) { var n = 0, d = parse(a), e = parse(b); while (d <= e) { if (d.getDay() % 6) n++; d.setDate(d.getDate() + 1); } return n; }
  function today() { return ymd(new Date()); }
  function seed(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
  function space(id) { return D.space(id); }
  D.space = function (id) { return D.spaces.filter(function (s) { return s.id === id; })[0]; };
  D.pkg = function (id) { return D.packages.filter(function (s) { return s.id === id; })[0]; };
  D.sec = function (id) { return D.security.filter(function (s) { return s.id === +id; })[0]; };
  D.doc = function (id) { return D.docTypes.filter(function (s) { return s.id === id; })[0]; };

  function get(name, fb) { return T.Store.get(U.email, name, fb); }
  function set(name, v) { return T.Store.set(U.email, name, v); }
  function reservations() { return get("reservations", []).filter(function (r) { return r.status !== "취소"; }); }
  function allReservations() { return get("reservations", []); }
  function statusChip(s) {
    var cls = { "확정": "ok", "상담 대기": "warn", "이용 완료": "navy", "취소": "danger" }[s] || "";
    return '<span class="chip ' + cls + '">' + esc(s) + "</span>";
  }
  function refreshStatus(r) {
    if (r.status === "확정" && r.end < today()) r.status = "이용 완료";
    return r;
  }
  function resLabel(r) { return (r.project || "프로젝트") + " · " + D.space(r.space).name + " · " + fdate(r.start, false) + "–" + fdate(r.end, false).slice(5); }
  function makeId() { var d = new Date(); return "P-" + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + "-" + Math.floor(100 + Math.random() * 900); }
  function activeRes() {
    var t = today();
    return reservations().map(refreshStatus).filter(function (r) { return r.status === "확정" && r.start <= t && r.end >= t; })[0] || null;
  }
  function nextRes() {
    var t = today();
    return reservations().map(refreshStatus).filter(function (r) { return (r.status === "확정" || r.status === "상담 대기") && r.end >= t; })
      .sort(function (a, b) { return a.start < b.start ? -1 : 1; })[0] || null;
  }
  function addReservation(r) { var all = allReservations(); all.push(r); set("reservations", all); }
  function demoReservationToday() {
    var t = new Date(), end = new Date(); var add = 0;
    while (add < 2) { end.setDate(end.getDate() + 1); if (end.getDay() % 6) add++; }
    var r = { id: makeId(), space: "A", pkg: "mid", start: ymd(t), end: ymd(end), days: weekdays(ymd(t), ymd(end)) || 1, team: 6,
      project: "AX 신사업 TF", security: 1, note: "체험용 예약", status: "확정", demo: true, createdAt: new Date().toISOString() };
    r.amount = D.pkg(r.pkg).price[r.space] * r.days;
    addReservation(r); return r;
  }

  // ---------- 셸 ----------
  async function boot() {
    U = await T.Auth.guard("../login.html");
    if (!U) return;
    $$("[data-me-name]").forEach(function (e) { e.textContent = U.name; });
    $$("[data-me-company]").forEach(function (e) { e.textContent = [U.company, U.dept].filter(Boolean).join(" · "); });
    $$("[data-logout]").forEach(function (b) { b.addEventListener("click", function () { T.Auth.logout().then(function () { location.href = "../index.html"; }); }); });
    var DB = window.TreeON_DB;
    if (DB) {
      var tmo = new Promise(function (r) { setTimeout(r, 2500); });
      await Promise.race([Promise.all([DB.ready, DB.pullUserData(U.email)]).catch(function () {}), tmo]);
      $$("[data-contact-mail]").forEach(function (a) { a.textContent = CFG.CONTACT_EMAIL; a.href = "mailto:" + CFG.CONTACT_EMAIL; });
    }
    document.body.classList.remove("auth-pending");
    var page = document.body.dataset.page;
    try { ({ home: home, reserve: reserve, office: office, report: report, approval: approval, guide: guide })[page](); }
    catch (e) { console.error(e); }
  }

  // ---------- 홈 ----------
  function home() {
    var q = new URLSearchParams(location.search);
    if (q.get("welcome")) { $("#welcome").hidden = false; }
    var box = $("#next-res");
    var r = nextRes();
    if (!r) {
      box.innerHTML = '<div class="empty"><h2>아직 예약이 없습니다</h2><p>공간과 날짜를 고르면 팀 1일 기준 금액이 바로 계산됩니다. 결제는 이용이 끝난 뒤 법인으로 한 번에 정산합니다.</p><div class="btn-row"><a class="btn" href="reserve.html">오피스 예약하기</a><a class="btn line" href="../index.html#apply">무료 체험 신청</a></div></div>';
    } else {
      var sp = D.space(r.space), active = r.start <= today() && r.status === "확정";
      box.innerHTML =
        '<div class="between"><h2>' + (active ? "오늘 이용 중인 예약" : "다가오는 예약") + "</h2>" + statusChip(r.status) + "</div>" +
        '<div class="g2" style="align-items:start;gap:20px"><img src="../assets/img/' + sp.img + '" alt="' + esc(sp.name) + ' 외관" style="border-radius:10px;aspect-ratio:16/9;object-fit:cover;width:100%">' +
        '<dl class="kv"><dt>프로젝트</dt><dd>' + esc(r.project) + "</dd><dt>공간</dt><dd>" + esc(sp.name) + " · " + sp.area + "</dd><dt>기간</dt><dd>" + fdate(r.start) + " – " + fdate(r.end) + "</dd><dt>인원</dt><dd>" + r.team + "명</dd><dt>예약번호</dt><dd>" + r.id + "</dd></dl></div>" +
        '<div class="btn-row">' + (active ? '<a class="btn teal" href="office.html">입실·출근 태그</a>' : '<a class="btn" href="office.html">이용 화면 보기</a>') +
        '<a class="btn line" href="approval.html?quote=' + r.id + '">견적서 보기</a></div>';
    }
    // 관리자 공지
    var N = D.notice;
    if (N) {
      if (N.on === false) { $("#notice").hidden = true; }
      else {
        if (N.title) $("#notice-title").textContent = N.title;
        if (N.body) $("#notice-body").textContent = N.body;
        if (N.cta) $("#notice-cta").textContent = N.cta;
        if (N.url) $("#notice-cta").href = N.url;
      }
    }
    // 시작 체크리스트
    var agreed = !!get("agreed", null), hasRes = allReservations().length > 0, hasDoc = get("docs", []).length > 0, seenReport = !!get("seenReport", null);
    var items = [
      [agreed, "보안 수칙 동의", "office.html"],
      [hasRes, "첫 예약 신청", "reserve.html"],
      [hasDoc, "결재 서류 신청", "approval.html"],
      [seenReport, "집중도 리포트 샘플 보기", "report.html"]
    ];
    $("#todo").innerHTML = items.map(function (i) {
      return '<li class="' + (i[0] ? "done-i" : "") + '"><span class="ck" aria-hidden="true"></span><span class="tx">' + i[1] + "</span>" + (i[0] ? '<span class="sr">완료</span>' : '<a class="link small" href="' + i[2] + '">하기</a>') + "</li>";
    }).join("");
    var done = items.filter(function (i) { return i[0]; }).length;
    $("#todo-count").textContent = done + " / " + items.length;
  }

  // ---------- 예약 ----------
  function reserve() {
    var st = { space: "A", pkg: "commute", start: null, end: null, team: 6, security: 1 };
    var now = new Date(); var view = new Date(now.getFullYear(), now.getMonth(), 1);
    var pre = new URLSearchParams(location.search).get("space"); if (pre && D.space(pre)) st.space = pre;

    $("#space-pick").innerHTML = D.spaces.map(function (s) {
      return '<label><input type="radio" name="space" value="' + s.id + '"' + (s.id === st.space ? " checked" : "") + '><span class="img"><img src="../assets/img/' + s.img + '" alt=""><span class="stack-sm" style="gap:2px"><b>' + s.name + " · " + s.area + "</b><span>최대 " + s.capacity + "인 · " + s.rooms.join(", ") + "</span></span></span></label>";
    }).join("");
    function pkgHtml() {
      return D.packages.map(function (p) {
        return '<label><input type="radio" name="pkg" value="' + p.id + '"' + (p.id === st.pkg ? " checked" : "") + '><b>' + p.name + "</b><span>" + p.desc + '</span><span class="p">팀 1일 ' + won(p.price[st.space]) + "</span></label>";
      }).join("");
    }
    $("#pkg-pick").innerHTML = pkgHtml();
    $("#sec-pick").innerHTML = D.security.map(function (s) {
      return '<label><input type="radio" name="security" value="' + s.id + '"' + (s.id === st.security ? " checked" : "") + "><b>" + s.id + ". " + s.name + "</b><span>" + s.desc + '</span><span class="p">' + s.extra + "</span></label>";
    }).join("");

    $("#reserve-form").addEventListener("change", function (e) {
      var n = e.target.name;
      if (n === "space") { st.space = e.target.value; var cap = D.space(st.space).capacity; if (st.team > cap) st.team = cap; $("#pkg-pick").innerHTML = pkgHtml(); }
      if (n === "pkg") st.pkg = e.target.value;
      if (n === "security") st.security = +e.target.value;
      sum();
    });
    $("#team-minus").addEventListener("click", function () { st.team = Math.max(1, st.team - 1); sum(); });
    $("#team-plus").addEventListener("click", function () { var cap = D.space(st.space).capacity; if (st.team >= cap) { T.toast(D.space(st.space).name + "은 최대 " + cap + "인입니다."); return; } st.team++; sum(); });
    $("#project").addEventListener("input", sum);

    function cal() {
      var y = view.getFullYear(), m = view.getMonth();
      $("#cal-title").textContent = y + "년 " + (m + 1) + "월";
      var first = new Date(y, m, 1).getDay(), last = new Date(y, m + 1, 0).getDate(), t = today();
      var h = DOW.map(function (d) { return '<span class="dow">' + d + "</span>"; }).join("");
      for (var i = 0; i < first; i++) h += "<span></span>";
      for (var d = 1; d <= last; d++) {
        var ds = y + "-" + pad(m + 1) + "-" + pad(d), dw = new Date(y, m, d).getDay();
        var cls = [];
        if (dw % 6 === 0) cls.push("wk");
        if (ds === t) cls.push("today");
        if (st.start && ds === st.start) cls.push("s");
        if (st.end && ds === st.end) cls.push("e");
        if (st.start && st.end && ds > st.start && ds < st.end) cls.push("in");
        var dis = ds < t || dw % 6 === 0;
        h += '<button type="button" data-d="' + ds + '" class="' + cls.join(" ") + '"' + (dis ? " disabled" : "") + ' aria-label="' + fdate(ds) + (dw % 6 === 0 ? " 주말 휴무" : "") + '">' + d + "</button>";
      }
      $("#cal-grid").innerHTML = h;
      $("#cal-prev").disabled = (y === now.getFullYear() && m === now.getMonth());
    }
    $("#cal-grid").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-d]"); if (!b) return;
      var d = b.dataset.d;
      if (!st.start || st.end || d < st.start) { st.start = d; st.end = null; }
      else { if (weekdays(st.start, d) > 30) { T.toast("한 번에 평일 30일까지 예약할 수 있습니다."); return; } st.end = d; }
      cal(); sum();
    });
    $("#cal-prev").addEventListener("click", function () { view.setMonth(view.getMonth() - 1); cal(); });
    $("#cal-next").addEventListener("click", function () { view.setMonth(view.getMonth() + 1); cal(); });

    function sum() {
      var sp = D.space(st.space), pk = D.pkg(st.pkg), sc = D.sec(st.security);
      var end = st.end || st.start, days = st.start ? weekdays(st.start, end) : 0;
      $("#team-out").textContent = st.team + "명";
      $("#team-hint").textContent = sp.name + " 최대 " + sp.capacity + "인";
      var unit = pk.price[st.space], sub = unit * days, vat = sub * 0.1;
      var hint = "";
      if (days && pk.id === "mid" && days < 3) hint = "중기 체류형은 보통 2박 3일 이상으로 예약합니다.";
      if (days && pk.id === "long" && days < 5) hint = "장기 체류형은 1주(평일 5일) 이상부터 적용됩니다.";
      $("#date-hint").textContent = st.start ? (fdate(st.start) + (st.end ? " – " + fdate(st.end) : " 하루") + " · 평일 " + days + "일" + (hint ? " · " + hint : "")) : "시작일과 종료일을 차례로 누르세요. 주말은 쉽니다.";
      $("#sum").innerHTML =
        '<dl class="kv"><dt>공간</dt><dd>' + sp.name + "</dd><dt>패키지</dt><dd>" + pk.name + "</dd><dt>기간</dt><dd>" + (days ? "평일 " + days + "일" : "—") + "</dd><dt>인원</dt><dd>" + st.team + "명</dd><dt>보안</dt><dd>" + sc.name + "</dd>" +
        "<dt>단가</dt><dd>" + won(unit) + " × " + (days || 0) + "일</dd><dt>부가세</dt><dd>" + won(vat) + "</dd></dl>" +
        '<div class="total"><span>합계</span><b class="num">' + won(sub + vat) + "</b></div>";
      var btn = $("#reserve-btn");
      btn.textContent = st.security === 3 ? "고보안 상담 요청하기" : "예약 신청하기";
      btn.disabled = !days;
    }
    $("#reserve-form").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!st.start) { T.toast("날짜를 먼저 고르세요."); return; }
      var end = st.end || st.start, days = weekdays(st.start, end), pk = D.pkg(st.pkg);
      var r = { id: makeId(), space: st.space, pkg: st.pkg, start: st.start, end: end, days: days, team: st.team, project: $("#project").value.trim() || "TF 프로젝트",
        security: st.security, note: $("#note").value.trim(), status: st.security === 3 ? "상담 대기" : "확정", amount: pk.price[st.space] * days, createdAt: new Date().toISOString() };
      addReservation(r);
      T.toast(r.status === "확정" ? "예약을 신청했습니다. 예약번호 " + r.id : "고보안 상담을 요청했습니다. 담당자가 연락드립니다.");
      st.start = st.end = null; $("#project").value = ""; $("#note").value = ""; cal(); sum(); list();
      $("#my-res").scrollIntoView({ behavior: "smooth" });
    });

    function list() {
      var all = allReservations().map(refreshStatus).sort(function (a, b) { return a.start < b.start ? 1 : -1; });
      set("reservations", all);
      var el = $("#res-list");
      if (!all.length) { el.innerHTML = '<p class="small">예약 내역이 없습니다. 위에서 공간과 날짜를 고르세요.</p>'; return; }
      el.innerHTML = '<ul class="list">' + all.map(function (r) {
        var sp = D.space(r.space), pk = D.pkg(r.pkg);
        return '<li><div class="stack-sm" style="gap:2px"><span class="row" style="gap:8px"><span class="t">' + esc(r.project) + "</span>" + statusChip(r.status) + (r.demo ? '<span class="chip">체험</span>' : "") + '</span><span class="s">' + r.id + " · " + sp.name + " · " + pk.name + " · " + fdate(r.start) + " – " + fdate(r.end) + " · " + r.team + "명 · " + won(r.amount * 1.1) + "</span></div>" +
          '<div class="btn-row">' + (r.status !== "취소" ? '<a class="btn sm line" href="approval.html?quote=' + r.id + '">견적서</a>' : "") +
          ((r.status === "확정" || r.status === "상담 대기") && r.start > today() ? '<button class="btn sm line" data-cancel="' + r.id + '">취소</button>' : "") + "</div></li>";
      }).join("") + "</ul>";
    }
    $("#res-list").addEventListener("click", function (e) {
      var b = e.target.closest("[data-cancel]"); if (!b) return;
      if (!confirm("이 예약을 취소할까요?")) return;
      var all = allReservations(); all.forEach(function (r) { if (r.id === b.dataset.cancel) r.status = "취소"; }); set("reservations", all);
      T.toast("예약을 취소했습니다."); list();
    });
    cal(); sum(); list();
  }

  // ---------- 오피스 이용 ----------
  function office() {
    var root = $("#office");
    var r = activeRes();
    if (!r) {
      var n = nextRes();
      root.innerHTML = '<div class="panel c12"><div class="empty"><h2>' + (n ? "오늘은 이용일이 아닙니다" : "이용 중인 예약이 없습니다") + "</h2>" +
        "<p>" + (n ? "다음 예약은 " + fdate(n.start) + "에 시작합니다. 이용일 아침에 이 화면에서 모바일 키와 출근 태그를 씁니다." : "예약한 날에는 이 화면에서 모바일 키, 출퇴근 태그, 회의 공간 예약을 씁니다.") + "</p>" +
        '<div class="btn-row"><button class="btn teal" id="try-today">오늘 이용하는 것으로 체험하기</button><a class="btn line" href="reserve.html">예약하기</a></div><p class="small">체험용 예약(폐교형 · 6인 · 오늘부터 평일 3일)이 만들어지고, 예약 내역에서 확인할 수 있습니다.</p></div></div>';
      $("#try-today").addEventListener("click", function () { demoReservationToday(); office(); });
      return;
    }
    var sp = D.space(r.space), sc = D.sec(r.security), t = today();
    var att = get("attendance", {}); att[r.id] = att[r.id] || {}; var day = att[r.id][t] || {};
    var agreed = get("agreed", null);

    root.innerHTML =
      '<div class="panel navy c5 key"><div class="between"><h2>모바일 키</h2><span class="chip teal">' + sp.name + " 출입</span></div>" +
      '<p class="small">출입문 안면인식기가 안 될 때 아래 일회용 비밀번호를 누르세요. 1분마다 바뀝니다.</p>' +
      '<div class="otp" id="otp" aria-live="polite">------</div><div class="timer"><i id="otp-bar" style="width:100%"></i></div>' +
      '<dl class="kv"><dt>예약</dt><dd>' + esc(r.project) + "</dd><dt>기간</dt><dd>" + fdate(r.start, false) + " – " + fdate(r.end, false) + "</dd><dt>입실 가능</dt><dd>08:00 – 22:00</dd></dl></div>" +
      '<div class="panel c7" id="tag-panel"></div>' +
      '<div class="panel c12"><div class="between"><h2>오늘 우리 팀</h2><span class="small" id="team-count"></span></div><div class="team" id="team"></div></div>' +
      '<div class="panel c6"><div class="between"><h2>회의 공간 예약</h2><div class="seg" id="room-seg"><button type="button" aria-pressed="true" data-room="project">' + (r.space === "A" ? "프로젝트룸" : "회의 테이블") + '</button><button type="button" aria-pressed="false" data-room="call">' + (r.space === "A" ? "통화실" : "휴식공간") + "</button></div></div>" +
      '<p class="small" id="slot-note"></p>' + (r.space === "A" ? '<button type="button" class="room-photo" id="room-photo" data-lightbox="02-project" data-room="프로젝트룸"><img src="../assets/img/a/02-project-t.webp" alt="프로젝트룸"></button>' : "") + '<div class="slots" id="slots"></div></div>' +
      '<div class="panel c6"><h2>이번 예약 근무 기록</h2><div id="att-log"></div><p class="small">출퇴근 태그는 본사 인사시스템으로 자동 전송됩니다. 근태 확인서는 결재 서류에서 신청하세요.</p></div>';

    // OTP
    function otp() {
      var slot = Math.floor(Date.now() / 60000), rnd = seed(U.email + r.id + slot);
      $("#otp").textContent = String(Math.floor(rnd() * 1e6)).padStart(6, "0");
      $("#otp-bar").style.width = (100 - (Date.now() % 60000) / 600) + "%";
    }
    otp(); clearInterval(office._otp); office._otp = setInterval(otp, 1000);

    // 출퇴근 태그
    function tagPanel() {
      var p = $("#tag-panel");
      if (!agreed) {
        p.innerHTML = '<h2>처음 입실 전, 보안 수칙에 동의하세요</h2><p class="small">동의해야 출근 태그를 쓸 수 있습니다. 한 번만 하면 됩니다.</p><ol style="margin:0;padding-left:20px;color:var(--sub);display:flex;flex-direction:column;gap:6px;font-size:.93rem">' +
          D.rules.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ol><label class="check"><input type="checkbox" id="agree-ck"> 위 보안 수칙을 읽었고 지키겠습니다.</label><button class="btn" id="agree-btn" disabled>동의하고 계속하기</button>';
        $("#agree-ck").addEventListener("change", function () { $("#agree-btn").disabled = !this.checked; });
        $("#agree-btn").addEventListener("click", function () { agreed = { at: new Date().toISOString() }; set("agreed", agreed); T.toast("보안 수칙에 동의했습니다."); tagPanel(); });
        return;
      }
      var secLine = '<div class="status-line' + (day.in && !day.out ? " on" : "") + '"><i></i>' + (r.security === 1 ? "고객사 VPN " : "트리온 보안 접속 ") + (day.in && !day.out ? "연결됨" : "연결 전") + "</div>";
      if (!day.in) {
        p.innerHTML = '<div class="between"><h2>출근 태그</h2><span class="chip">출근 전</span></div><p class="small">태그하면 출근 시각이 본사 인사시스템으로 전송되고, ' + esc(sc.name) + " 연결이 열립니다.</p>" +
          '<button class="btn teal tagbtn" id="tag-in">출근 태그</button>' + secLine;
        $("#tag-in").addEventListener("click", function () { day = { in: new Date().toISOString() }; save(); T.toast("출근 태그 완료 · " + hm(new Date()) + " 인사시스템 전송"); tagPanel(); team(); log(); });
      } else if (!day.out) {
        var since = new Date(day.in), mins = Math.max(0, Math.round((Date.now() - since) / 60000));
        p.innerHTML = '<div class="between"><h2>근무 중</h2><span class="chip ok">' + hm(since) + " 출근</span></div>" +
          '<dl class="kv"><dt>근무 시간</dt><dd>' + Math.floor(mins / 60) + "시간 " + (mins % 60) + "분</dd><dt>인사시스템 전송</dt><dd>" + hm(since) + " 완료</dd><dt>좌석</dt><dd>" + (r.space === "A" ? "집중업무실 " : "업무석 ") + (1 + Math.floor(seed(U.email)() * D.space(r.space).capacity)) + "번</dd></dl>" + secLine +
          '<div id="out-check" hidden class="stack-sm"><h3>퇴실 전 확인</h3>' +
          ["책상 위 서류를 치웠습니다 (클린 데스크)", "공용 모니터·전자칠판의 자료를 지웠습니다", "공용 PC·회의 장비에서 로그아웃했습니다", "개인 물품을 모두 챙겼습니다"].map(function (x, i) { return '<label class="check"><input type="checkbox" class="oc" id="oc' + i + '"> ' + x + "</label>"; }).join("") +
          '<button class="btn" id="tag-out-confirm" disabled>퇴근 태그 완료</button></div><button class="btn line tagbtn" id="tag-out">퇴근 태그</button>';
        $("#tag-out").addEventListener("click", function () { $("#out-check").hidden = false; this.hidden = true; $("#oc0").focus(); });
        $$(".oc").forEach(function (c) { c.addEventListener("change", function () { $("#tag-out-confirm").disabled = $$(".oc").some(function (x) { return !x.checked; }); }); });
        $("#tag-out-confirm").addEventListener("click", function () { day.out = new Date().toISOString(); day.clean = true; save(); T.toast("퇴근 태그 완료 · 공용 기기 초기화를 예약했습니다."); tagPanel(); team(); log(); });
      } else {
        var a = new Date(day.in), b = new Date(day.out), m2 = Math.round((b - a) / 60000);
        p.innerHTML = '<div class="between"><h2>오늘 근무를 마쳤습니다</h2><span class="chip navy">퇴근</span></div><dl class="kv"><dt>출근</dt><dd>' + hm(a) + "</dd><dt>퇴근</dt><dd>" + hm(b) + "</dd><dt>근무 시간</dt><dd>" + Math.floor(m2 / 60) + "시간 " + (m2 % 60) + "분</dd><dt>퇴실 점검</dt><dd>완료 · 공용 기기 초기화</dd></dl>" +
          '<div class="btn-row"><a class="btn line" href="report.html">집중도 리포트 샘플 보기</a><button class="btn line" id="tag-reset">다시 체험하기</button></div>';
        $("#tag-reset").addEventListener("click", function () { day = {}; save(); tagPanel(); team(); log(); });
      }
    }
    function save() { att[r.id][t] = day; set("attendance", att); }

    // 팀 현황 (팀원은 체험용 가상 데이터)
    function team() {
      var names = ["강", "박", "이", "최", "정", "한", "윤", "조", "임"], rnd = seed(r.id + t), nowM = new Date().getHours() * 60 + new Date().getMinutes();
      var html = '<div class="mem me ' + (day.in && !day.out ? "in" : "") + '"><span class="av">' + esc(U.name.slice(0, 1)) + "</span><b>" + esc(U.name) + " (나)</b><small>" + (day.in ? (day.out ? "퇴근 " + hm(new Date(day.out)) : hm(new Date(day.in))) : "출근 전") + "</small></div>";
      var inCount = day.in && !day.out ? 1 : 0;
      for (var i = 1; i < r.team; i++) {
        var arrive = 8 * 60 + 45 + Math.floor(rnd() * 40), isIn = nowM >= arrive && nowM < 18 * 60 + 30;
        if (isIn) inCount++;
        html += '<div class="mem ' + (isIn ? "in" : "") + '"><span class="av">' + names[i % names.length] + "</span><b>" + names[i % names.length] + "○○</b><small>" + (isIn ? pad(Math.floor(arrive / 60)) + ":" + pad(arrive % 60) : (nowM >= 18 * 60 + 30 ? "퇴근" : "출근 전")) + "</small></div>";
      }
      $("#team").innerHTML = html;
      $("#team-count").textContent = "근무 중 " + inCount + " / " + r.team + "명";
    }

    // 회의 공간
    var roomKey = "project";
    var slotDay = t, late = new Date().getHours() >= 18;
    if (late) { var nd = new Date(); do { nd.setDate(nd.getDate() + 1); } while (!(nd.getDay() % 6)); slotDay = ymd(nd); }
    function slots() {
      var rooms = get("rooms", {}); var mine = ((rooms[slotDay] || {})[roomKey]) || [];
      var rnd = seed(r.id + slotDay + roomKey), h = late ? 0 : new Date().getHours(), out = "";
      for (var s = 9; s < 18; s++) {
        if (s === 12) continue;
        var taken = rnd() < 0.25 && mine.indexOf(s) < 0, past = s < h, me = mine.indexOf(s) > -1;
        out += '<button type="button" data-s="' + s + '" class="' + (me ? "mine" : "") + '"' + ((taken || past) && !me ? " disabled" : "") + ' aria-pressed="' + me + '">' + pad(s) + ":00</button>";
      }
      $("#slots").innerHTML = out;
    }
    $("#slots").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-s]"); if (!b) return;
      var rooms = get("rooms", {}); rooms[slotDay] = rooms[slotDay] || {}; var mine = rooms[slotDay][roomKey] = rooms[slotDay][roomKey] || [];
      var s = +b.dataset.s, i = mine.indexOf(s);
      var when = late ? fdate(slotDay) + " " : "";
      if (i > -1) { mine.splice(i, 1); T.toast(when + pad(s) + ":00 예약을 취소했습니다."); } else { mine.push(s); T.toast(when + pad(s) + ":00 – " + pad(s + 1) + ":00 예약했습니다."); }
      set("rooms", rooms); slots();
    });
    $("#room-seg").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-room]"); if (!b) return;
      roomKey = b.dataset.room; $$("#room-seg button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); slots();
      var rp = $("#room-photo"); if (rp) { var f = roomKey === "project" ? "02-project" : "11-call", nm = roomKey === "project" ? "프로젝트룸" : "통화실"; rp.dataset.lightbox = f; rp.dataset.room = nm; rp.querySelector("img").src = "../assets/img/a/" + f + "-t.webp"; rp.querySelector("img").alt = nm; }
    });

    function log() {
      var days = [], d = parse(r.start), e = parse(r.end);
      while (d <= e) { if (d.getDay() % 6) days.push(ymd(d)); d.setDate(d.getDate() + 1); }
      $("#att-log").innerHTML = '<div class="table-wrap"><table><thead><tr><th>날짜</th><th>출근</th><th>퇴근</th><th>상태</th></tr></thead><tbody>' + days.map(function (x) {
        var a = (att[r.id] || {})[x] || {};
        var stt = a.out ? '<span class="chip navy">완료</span>' : a.in ? '<span class="chip ok">근무 중</span>' : x > t ? '<span class="chip">예정</span>' : x < t ? '<span class="chip warn">기록 없음</span>' : '<span class="chip">출근 전</span>';
        return "<tr><td>" + fdate(x) + '</td><td class="num">' + (a.in ? hm(new Date(a.in)) : "—") + '</td><td class="num">' + (a.out ? hm(new Date(a.out)) : "—") + "</td><td>" + stt + "</td></tr>";
      }).join("") + "</tbody></table></div>";
    }
    $("#slot-note").textContent = (late ? "오늘 이용 시간이 끝나 " + fdate(slotDay) + " 시간표를 보여 줍니다. " : "오늘 시간표입니다. ") + "1시간 단위로 잡고, 다시 누르면 취소됩니다.";
    tagPanel(); team(); slots(); log();
    clearInterval(office._tick); office._tick = setInterval(function () { if (day.in && !day.out) tagPanel(); }, 60000);
  }

  // ---------- 리포트 ----------
  var C_AFTER = "#134a92", C_BEFORE = "#9db0c8";
  function barPath(x, y, w, h, rr) { rr = Math.min(rr, h, w / 2); if (h <= 0) return ""; return "M" + x + "," + (y + h) + "V" + (y + rr) + "Q" + x + "," + y + " " + (x + rr) + "," + y + "H" + (x + w - rr) + "Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + rr) + "V" + (y + h) + "Z"; }
  function chartTip(wrap, svgW) {
    var tip = document.createElement("div"); tip.className = "tip"; wrap.appendChild(tip);
    return function (x, y, html) {
      if (html == null) { tip.classList.remove("on"); return; }
      var k = wrap.clientWidth / svgW; tip.innerHTML = html; tip.style.left = (x * k) + "px"; tip.style.top = (y * k) + "px"; tip.classList.add("on");
    };
  }
  function dailyChart(el, P) {
    var W = 640, H = 250, L = 34, R = 12, TP = 18, B = 30, max = 8, n = P.daily.length;
    var iw = W - L - R, ih = H - TP - B, band = iw / n, bw = band * 0.56;
    var y = function (v) { return TP + ih - (v / max) * ih; };
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="이용 기간 평일 10일의 팀 평균 하루 몰입 시간. 모든 날이 이용 전 평균 4시간보다 높고, 마지막 날 6.6시간입니다."><g class="grid">';
    for (var g = 0; g <= max; g += 2) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(g) + '" y2="' + y(g) + '"/>';
    s += '</g><g class="axis">';
    for (g = 0; g <= max; g += 2) s += '<text x="' + (L - 8) + '" y="' + (y(g) + 4) + '" text-anchor="end">' + g + "</text>";
    P.dailyLabels.forEach(function (lb, i) { s += '<text x="' + (L + band * i + band / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + lb + "</text>"; });
    s += "</g>";
    P.daily.forEach(function (v, i) { var x = L + band * i + (band - bw) / 2; s += '<path d="' + barPath(x, y(v), bw, y(0) - y(v), 4) + '" fill="' + C_AFTER + '"/>'; });
    s += '<line class="ref" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(P.baseline) + '" y2="' + y(P.baseline) + '"/>';
    s += '<text class="reft" x="' + (L + 6) + '" y="' + (y(P.baseline) + 15) + '" text-anchor="start">이용 전 평균 ' + P.baseline.toFixed(1) + "시간</text>";
    var li = n - 1, lx = L + band * li + band / 2; s += '<text class="lab" x="' + lx + '" y="' + (y(P.daily[li]) - 7) + '" text-anchor="middle">' + P.daily[li] + "</text>";
    P.daily.forEach(function (v, i) { s += '<rect class="hit" data-i="' + i + '" x="' + (L + band * i) + '" y="' + TP + '" width="' + band + '" height="' + ih + '"/>'; });
    s += "</svg>";
    el.innerHTML = s;
    var tip = chartTip(el, W);
    el.querySelectorAll(".hit").forEach(function (h) {
      h.addEventListener("mouseenter", function () { var i = +h.dataset.i; tip(L + band * i + band / 2, y(P.daily[i]) - 4, "<b>" + P.dailyLabels[i] + "</b> 팀 평균 " + P.daily[i] + "시간 몰입"); });
      h.addEventListener("mouseleave", function () { tip(null); });
    });
  }
  function groupedChart(el, P) {
    var W = 420, H = 260, L = 30, R = 6, TP = 14, B = 26, max = 2, n = P.hours.length;
    var iw = W - L - R, ih = H - TP - B, band = iw / n, bw = band * 0.32, gap = 2;
    var y = function (v) { return TP + ih - (v / max) * ih; };
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="시간대별 팀 평균 끊김 횟수. 모든 시간대에서 이용 기간이 이용 전보다 적습니다."><g class="grid">';
    for (var g = 0; g <= max; g += 0.5) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(g) + '" y2="' + y(g) + '"/>';
    s += '</g><g class="axis">';
    for (g = 0; g <= max; g += 0.5) s += '<text x="' + (L - 8) + '" y="' + (y(g) + 4) + '" text-anchor="end">' + g + "</text>";
    P.hours.forEach(function (lb, i) { s += '<text x="' + (L + band * i + band / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + lb + "</text>"; });
    s += "</g>";
    P.hours.forEach(function (lb, i) {
      var cx = L + band * i + band / 2, a = P.interruptBefore[i], b = P.interruptAfter[i];
      s += '<path d="' + barPath(cx - bw - gap / 2, y(a), bw, y(0) - y(a), 4) + '" fill="' + C_BEFORE + '"/>';
      s += '<path d="' + barPath(cx + gap / 2, y(b), bw, y(0) - y(b), 4) + '" fill="' + C_AFTER + '"/>';
      s += '<rect class="hit" data-i="' + i + '" x="' + (L + band * i) + '" y="' + TP + '" width="' + band + '" height="' + ih + '"/>';
    });
    s += "</svg>";
    el.innerHTML = s;
    var tip = chartTip(el, W);
    el.querySelectorAll(".hit").forEach(function (h) {
      h.addEventListener("mouseenter", function () { var i = +h.dataset.i; tip(L + band * i + band / 2, y(P.interruptBefore[i]) - 4, "<b>" + P.hours[i] + "</b> 이용 전 " + P.interruptBefore[i] + "회 · 이용 기간 " + P.interruptAfter[i] + "회"); });
      h.addEventListener("mouseleave", function () { tip(null); });
    });
  }
  function report() {
    set("seenReport", { at: new Date().toISOString() });
    var DB = window.TreeON_DB;
    (DB ? DB.myReport(U.email).catch(function () { return null; }) : Promise.resolve(null)).then(function (mine) {
      if (mine && mine.data && mine.data.productivity) {
        renderReport(mine.data, true);
      } else renderReport(D.report, false);
    });
  }
  function renderReport(R, own) {
    var P = R.productivity;
    if (own) {
      $("#rep-note").textContent = "우리 팀 이용 데이터로 만든 리포트입니다.";
      $$(".rep-flag").forEach(function (e) { e.textContent = "우리 팀 리포트"; e.classList.add("own"); });
    }
    $("#rep-meta").textContent = R.company + " · " + R.team + " · " + R.members + "명 · " + R.space + " · " + R.period;
    $("#kpis").innerHTML = P.kpis.map(function (k) {
      var diff = k.after - k.before, pct = Math.round(Math.abs(diff) / k.before * 100);
      var txt = k.better === "up" ? (k.after / k.before).toFixed(1) + "배" : pct + "% 감소";
      return '<div class="kpi"><span class="l">' + k.label + '</span><span class="v">' + k.after + "<small>" + k.unit + '</small></span><span class="from">이용 전 ' + k.before + k.unit + '</span><span class="d">' + txt + "</span></div>";
    }).join("");
    dailyChart($("#chart-daily"), P);
    groupedChart($("#chart-int"), P);
    $("#int-table").innerHTML = "<thead><tr><th>시간대</th>" + P.hours.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody><tr><th>이용 전</th>" + P.interruptBefore.map(function (v) { return '<td class="num">' + v + "</td>"; }).join("") + "</tr><tr><th>이용 기간</th>" + P.interruptAfter.map(function (v) { return '<td class="num">' + v + "</td>"; }).join("") + "</tr></tbody>";
    $("#milestones").innerHTML = "<thead><tr><th>마일스톤</th><th>계획</th><th>실제</th><th>변화</th></tr></thead><tbody>" + P.milestones.map(function (m) { return "<tr><td>" + m.name + '</td><td class="num">' + m.plan + '</td><td class="num">' + m.actual + '</td><td><span class="chip ok">' + m.note + "</span></td></tr>"; }).join("") + "</tbody>";
    var S = R.satisfaction;
    $("#pos").innerHTML = S.positive.map(function (q) { return '<p class="quote">“' + esc(q.text) + "”<b>" + q.who + "</b></p>"; }).join("");
    $("#neg").innerHTML = S.negative.map(function (q) { return '<p class="quote neg">“' + esc(q.text) + "”<b>" + q.who + "</b></p>"; }).join("");
    $("#sat").innerHTML = S.items.map(function (i) { return '<div class="bar-row"><span>' + i.label + '</span><span class="tr"><i style="width:' + (i.score / 5 * 100) + '%"></i></span><b>' + i.score.toFixed(1) + "</b></div>"; }).join("");
    var E = R.esg;
    $("#esg-kpis").innerHTML = E.kpis.map(function (k) { return '<div class="kpi"><span class="l">' + k.label + '</span><span class="v">' + k.value + "</span></div>"; }).join("");
    var mx = Math.max.apply(null, E.spend.map(function (s) { return s.value; }));
    $("#spend").innerHTML = E.spend.map(function (s) { return '<div class="bar-row"><span>' + s.label + '</span><span class="tr"><i style="width:' + (s.value / mx * 100) + '%"></i></span><b>' + s.value + "만</b></div>"; }).join("");

    $$(".tabs button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".tabs button").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
        $$("[data-tabpanel]").forEach(function (p) { p.hidden = p.dataset.tabpanel !== b.dataset.tab; });
      });
    });
    $("#print-report").addEventListener("click", function () { $$("[data-tabpanel]").forEach(function (p) { p.hidden = false; }); window.print(); setTimeout(function () { var cur = $(".tabs [aria-selected=true]").dataset.tab; $$("[data-tabpanel]").forEach(function (p) { p.hidden = p.dataset.tabpanel !== cur; }); }, 300); });
    $("#copy-report").addEventListener("click", function () {
      var txt = R.team + " 몰입 리포트(샘플)\n" + P.kpis.map(function (k) { return "- " + k.label + ": " + k.before + " → " + k.after + k.unit; }).join("\n");
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { T.toast("요약을 복사했습니다. 메신저나 메일에 붙여넣으세요."); }).catch(function () { T.toast("복사하지 못했습니다. 화면을 PDF로 저장해 공유하세요."); });
    });
  }

  // ---------- 결재 서류 ----------
  function docFlow(d) {
    if (d.issued) return 2;
    var age = (Date.now() - new Date(d.createdAt)) / 1000;
    var instant = d.types.every(function (t) { return D.doc(t).instant; });
    var stage = instant ? 2 : age > 90 ? 2 : age > 25 ? 1 : 0;
    return stage;
  }
  function approval() {
    var res = reservations().map(refreshStatus);
    var sel = $("#doc-res");
    sel.innerHTML = '<option value="">예약 없이 사전 견적 (공간·기간 미정)</option>' + res.map(function (r) { return '<option value="' + r.id + '">' + r.id + " · " + esc(resLabel(r)) + "</option>"; }).join("");
    var up = res.filter(function (r) { return r.end >= today(); }).sort(function (a, b) { return a.start < b.start ? -1 : 1; })[0] || res[0];
    if (up) sel.value = up.id;
    $("#doc-types").innerHTML = D.docTypes.map(function (d, i) { return '<label><input type="checkbox" name="types" value="' + d.id + '"' + (i < 2 ? " checked" : "") + "><span><b>" + d.name + (d.instant ? ' <span class="chip teal">바로 발급</span>' : "") + "</b><span>" + d.desc + "</span></span></label>"; }).join("");
    var f = $("#doc-form");
    f.company.value = U.company || ""; f.email.value = U.email || "";
    var need = new Date(); need.setDate(need.getDate() + 3); f.due.value = ymd(need); f.due.min = today();
    f.bizno.addEventListener("input", function () { var v = f.bizno.value.replace(/\D/g, "").slice(0, 10); f.bizno.value = v.length > 5 ? v.slice(0, 3) + "-" + v.slice(3, 5) + "-" + v.slice(5) : v.length > 3 ? v.slice(0, 3) + "-" + v.slice(3) : v; });

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var types = $$("input[name=types]:checked").map(function (x) { return x.value; });
      if (!types.length) { T.toast("필요한 서류를 하나 이상 고르세요."); return; }
      if (!f.reportValidity()) return;
      var docs = get("docs", []);
      var d = { id: "D-" + Date.now().toString().slice(-6), res: sel.value, types: types, company: f.company.value, bizno: f.bizno.value, email: f.email.value, due: f.due.value, memo: f.memo.value, createdAt: new Date().toISOString() };
      docs.unshift(d); set("docs", docs);
      T.toast("서류 신청을 접수했습니다. " + d.id);
      f.memo.value = ""; list();
      $("#doc-list").scrollIntoView({ behavior: "smooth" });
    });

    function list() {
      var docs = get("docs", []);
      var el = $("#doc-list");
      if (!docs.length) { el.innerHTML = '<p class="small">신청한 서류가 없습니다. 위에서 서류를 고르고 신청하세요.</p>'; return; }
      el.innerHTML = '<ul class="list">' + docs.map(function (d) {
        var st = docFlow(d), r = allReservations().filter(function (x) { return x.id === d.res; })[0];
        var names = d.types.map(function (t) { return D.doc(t).name; }).join(", ");
        var btns = d.types.filter(function (t) { return ["quote", "proposal", "usage", "attendance"].indexOf(t) > -1 && (D.doc(t).instant || st === 2); })
          .map(function (t) { return '<button class="btn sm line" data-view="' + t + '" data-doc="' + d.id + '">' + D.doc(t).name.replace(" 초안", "") + " 보기</button>"; }).join("");
        return '<li><div class="stack-sm" style="gap:4px"><span class="t">' + esc(names) + '</span><span class="s">' + d.id + " · " + (r ? esc(resLabel(r)) : "사전 견적") + " · 필요일 " + fdate(d.due) + " · 수신 " + esc(d.email) + "</span>" +
          '<div class="flow">' + ["접수", "검토", "발급 완료"].map(function (x, i) { return '<span class="' + (i <= st ? "on" : "") + '"><i></i>' + x + "</span>"; }).join("") + "</div></div>" +
          '<div class="btn-row">' + btns + (st === 2 && d.types.some(function (t) { return ["security", "invoice", "statement"].indexOf(t) > -1; }) ? '<span class="small">나머지 서류는 ' + esc(d.email) + "로 보냈습니다</span>" : "") + "</div></li>";
      }).join("") + "</ul>";
    }
    $("#doc-list").addEventListener("click", function (e) {
      var b = e.target.closest("[data-view]"); if (!b) return;
      var d = get("docs", []).filter(function (x) { return x.id === b.dataset.doc; })[0];
      var r = allReservations().filter(function (x) { return x.id === d.res; })[0];
      openDoc(b.dataset.view, r, d);
    });
    list();
    clearInterval(approval._t); approval._t = setInterval(list, 15000);

    var q = new URLSearchParams(location.search).get("quote");
    if (q) { var r = allReservations().filter(function (x) { return x.id === q; })[0]; if (r) { sel.value = r.id; openDoc("quote", r, null); } }
  }

  function openDoc(type, r, d) {
    var dlg = $("#doc-modal");
    var company = (d && d.company) || U.company || "고객사", bizno = (d && d.bizno) || "", issued = fdate(today(), false);
    var sp = r ? D.space(r.space) : null, pk = r ? D.pkg(r.pkg) : null, sc = r ? D.sec(r.security) : null;
    var supplier = '<table><tbody><tr><th>공급자</th><td>TreeON Office (트리온)</td></tr><tr><th>대표</th><td>손형주</td></tr><tr><th>연락처</th><td>' + esc(CFG.CONTACT_EMAIL || "") + "</td></tr></tbody></table>";
    var client = '<table><tbody><tr><th>수신</th><td>' + esc(company) + " 귀중</td></tr><tr><th>사업자번호</th><td>" + (esc(bizno) || "—") + "</td></tr><tr><th>발행일</th><td>" + issued + "</td></tr></tbody></table>";
    var html = "", title = D.doc(type).name;
    if (type === "quote") {
      var rows, sub;
      if (r) {
        var unit = pk.price[r.space]; sub = unit * r.days;
        rows = "<tr><td>" + sp.name + " " + pk.name + " (팀 " + r.team + "명)</td><td>" + fdate(r.start, false) + " – " + fdate(r.end, false) + '</td><td class="num">' + r.days + '일</td><td class="num">' + won(unit) + '</td><td class="num">' + won(sub) + "</td></tr>" +
          "<tr><td>보안: " + sc.name + "</td><td>이용 기간</td><td>—</td><td>" + sc.extra + '</td><td class="num">0원</td></tr>' +
          "<tr><td>근태 연동·법인 일괄 정산·몰입 리포트</td><td>이용 기간</td><td>—</td><td>패키지 포함</td><td class=\"num\">0원</td></tr>";
      } else {
        sub = D.packages[0].price.A * 5;
        rows = "<tr><td>폐교형 출퇴근형 (예시, 10인 이하)</td><td>평일 5일 기준</td><td class=\"num\">5일</td><td class=\"num\">" + won(D.packages[0].price.A) + '</td><td class="num">' + won(sub) + "</td></tr>";
      }
      html = "<h2>견 적 서</h2><div class=\"meta\">" + client + supplier + '</div><table><thead><tr><th>항목</th><th>기간</th><th>수량</th><th>단가</th><th>금액</th></tr></thead><tbody>' + rows + "</tbody></table>" +
        '<p class="sum">공급가액 ' + won(sub) + " + 부가세 " + won(sub * 0.1) + " = 합계 " + won(sub * 1.1) + "</p>" +
        '<p class="foot">· 결제: 이용 종료 뒤 세금계산서 일괄 발행, 발행일로부터 15일 이내 입금<br>· 유효기간: 발행일로부터 30일 · 숙박 포함 패키지는 지역 제휴 숙소 기준<br>· 시장검증용 체험 버전에서 만든 견적서로, 실제 거래에는 쓸 수 없습니다.</p>';
    } else if (type === "proposal") {
      var period = r ? fdate(r.start) + " – " + fdate(r.end) + " (평일 " + r.days + "일)" : "미정";
      var amount = r ? won(pk.price[r.space] * r.days * 1.1) + " (부가세 포함)" : "견적서 참조";
      html = "<h2>품 의 서</h2>" +
        '<div class="sign"><div><b>담당</b><span></span></div><div><b>팀장</b><span></span></div><div><b>본부장</b><span></span></div><div><b>대표</b><span></span></div></div><br>' +
        "<table><tbody><tr><th style=\"width:140px\">제목</th><td>" + esc(r ? r.project : "TF") + " 외부 집중근무 거점 이용 품의</td></tr>" +
        "<tr><th>기안</th><td>" + esc(company) + " " + esc(U.dept || "") + " " + esc(U.name) + " · " + issued + "</td></tr>" +
        "<tr><th>목적</th><td>마감이 정해진 " + esc(r ? r.project : "TF") + "의 몰입 업무 시간을 확보하고, 잦은 호출·회의로 생기는 일정 지연을 줄이기 위함</td></tr>" +
        "<tr><th>장소</th><td>TreeON Office " + (sp ? sp.name + " (" + sp.area + ", 팀 단독 사용)" : "") + " · " + (sp ? sp.site : "서울 1시간 내 거점") + "</td></tr>" +
        "<tr><th>기간·인원</th><td>" + period + (r ? " · " + r.team + "명" : "") + "</td></tr>" +
        "<tr><th>보안</th><td>" + (sc ? sc.name + " — " + sc.desc : "고객사 보안 수준에 맞춰 선택") + " · 예약자 전용 모바일 키, 퇴실 후 공용 기기 초기화, 출입 동선 CCTV</td></tr>" +
        "<tr><th>근태</th><td>출퇴근 태그가 본사 인사시스템으로 자동 전송되며, 종료 뒤 근태 확인서를 받음</td></tr>" +
        "<tr><th>비용</th><td>" + amount + " · 이용 종료 뒤 법인 일괄 세금계산서</td></tr>" +
        "<tr><th>기대 효과</th><td>하루 몰입 시간 확대, 프로젝트 리드타임 단축. 이용 전후 몰입 시간·일정 변화를 리포트로 받아 효과를 확인함</td></tr>" +
        "<tr><th>첨부</th><td>견적서 1부, 보안 수칙 1부</td></tr></tbody></table>" +
        '<p class="foot">위와 같이 외부 집중근무 거점 이용을 품의하오니 재가 바랍니다.<br>· 시장검증용 체험 버전에서 만든 초안입니다. 회사 양식에 옮겨 쓰세요.</p>';
    } else if (type === "usage" || type === "attendance") {
      var att = get("attendance", {})[r ? r.id : ""] || {};
      var days = []; if (r) { var x = parse(r.start), e = parse(r.end); while (x <= e) { if (x.getDay() % 6) days.push(ymd(x)); x.setDate(x.getDate() + 1); } }
      var body = days.map(function (dd) { var a = att[dd] || {}; return "<tr><td>" + fdate(dd) + "</td><td>" + esc(U.name) + '</td><td class="num">' + (a.in ? hm(new Date(a.in)) : "—") + '</td><td class="num">' + (a.out ? hm(new Date(a.out)) : "—") + "</td></tr>"; }).join("");
      html = "<h2>" + (type === "usage" ? "이 용 확 인 서" : "근 태 확 인 서") + '</h2><div class="meta">' + client + supplier + "</div>" +
        "<table><tbody><tr><th style=\"width:140px\">프로젝트</th><td>" + esc(r ? r.project : "—") + "</td></tr><tr><th>공간</th><td>" + (sp ? sp.name + " · " + sp.area : "—") + "</td></tr><tr><th>기간</th><td>" + (r ? fdate(r.start) + " – " + fdate(r.end) : "—") + "</td></tr><tr><th>인원</th><td>" + (r ? r.team + "명" : "—") + "</td></tr></tbody></table><br>" +
        (type === "attendance" ? "<table><thead><tr><th>날짜</th><th>이름</th><th>출근</th><th>퇴근</th></tr></thead><tbody>" + (body || '<tr><td colspan="4">기록 없음</td></tr>') + "</tbody></table>" : "") +
        '<p class="foot">위 내용과 같이 이용하였음을 확인합니다. · ' + issued + " · TreeON Office<br>· 시장검증용 체험 버전에서 만든 문서입니다.</p>";
    }
    $("#doc-title").textContent = title + " 미리보기";
    $("#doc-body").innerHTML = html;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  // 문서 모달 버튼
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-doc-close]")) { var d = $("#doc-modal"); d.close ? d.close() : d.removeAttribute("open"); }
    if (e.target.closest("[data-doc-print]")) { document.body.classList.add("printing-doc"); window.print(); setTimeout(function () { document.body.classList.remove("printing-doc"); }, 400); }
  });

  // ---------- 이용 안내 ----------
  function guide() {
    var cur = "A";
    var zones = {
      A: [["집중업무실", "칸막이 책상 10석, 창가 수납장. 대화는 프로젝트룸에서 합니다."], ["프로젝트룸", "12인 테이블, 빔프로젝터·스크린, 스마트글라스 창"], ["통화실", "1인 통화·화상회의 좌석. 1시간 단위 예약"], ["회복라운지", "소파·원형 테이블·안마의자·탕비시설"], ["로비", "중앙 복도와 원목 휴게 벤치·화분"], ["입구·신발장", "안면인식기로 입실. 실내화로 갈아 신습니다"], ["화장실", "남·여 분리"]]
    };
    var view = "aerial";
    function firstOf(room) { return (D.gallery.filter(function (g) { return g.room === room; })[0] || {}).file; }
    function renderSpace() {
      var sp = D.space(cur), isA = cur === "A";
      var pic = isA && view === "aerial"
        ? '<button type="button" class="room-photo" data-lightbox="01-aerial" aria-label="조감도 크게 보기"><img src="../assets/img/a/01-aerial.webp" alt="폐교형 전체 공간 조감도" style="aspect-ratio:16/9"></button>'
        : '<img src="../assets/img/' + sp.plan + '" alt="' + sp.name + ' 평면도 설계 초안" loading="lazy">';
      $("#plan-img").innerHTML = pic;
      $("#plan-title").innerHTML = esc(sp.name + " · " + sp.area + " · 최대 " + sp.capacity + "인") +
        (isA ? ' <span class="seg" id="view-seg" style="margin-left:8px;vertical-align:middle"><button type="button" data-v="aerial" aria-pressed="' + (view === "aerial") + '">조감도</button><button type="button" data-v="plan" aria-pressed="' + (view === "plan") + '">평면도</button></span>' : "");
      $("#zones").innerHTML = zones[cur].map(function (z) {
        var f = isA && firstOf(z[0]);
        return f ? '<div><button type="button" class="zone-btn" data-lightbox="' + f + '" data-room="' + z[0] + '"><img src="../assets/img/a/' + f + '-t.webp" alt="" loading="lazy"><span><b>' + z[0] + "</b><span>" + z[1] + "</span></span></button></div>"
                 : "<div><b>" + z[0] + "</b><span>" + z[1] + "</span></div>";
      }).join("");
      $("#zones").classList.toggle("with-photo", isA);
      $("#gallery-mini").hidden = !isA;
    }
    $("#plan-title").addEventListener("click", function (e) { var b = e.target.closest("button[data-v]"); if (!b) return; view = b.dataset.v; renderSpace(); });
    $("#gallery-mini").innerHTML = '<h3>폐교형 사진 ' + D.gallery.length + '장</h3><div class="gmini">' + D.gallery.map(function (g) {
      return '<button type="button" class="gthumb sm" data-lightbox="' + g.file + '"><img src="../assets/img/a/' + g.file + '-t.webp" alt="' + esc(g.title) + '" loading="lazy"><span></span></button>';
    }).join("") + '</div><p class="small">' + esc(D.galleryNote) + "</p>";
    renderSpace();
    $("#equip").innerHTML = D.equipment.map(function (x) { return '<span class="chip">' + x + "</span>"; }).join("");
    $("#rules").innerHTML = D.rules.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    $("#places-note").textContent = D.placesNotice;
    var filter = "전체";
    function placeIcon(t) {
      return { "식당": '<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M16 3c-1.7 1-3 3-3 6v4h3v8"/>', "카페": '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>', "편의": '<path d="M4 8h16l-1.5 12h-13zM8 8V6a4 4 0 0 1 8 0v2"/>' }[t] || "";
    }
    function places() {
      var list = D.places.filter(function (p) { return filter === "전체" || (filter === "역 도보" ? p.station : p.type === filter); });
      $("#places").innerHTML = list.map(function (p) {
        return '<article class="place">' +
          '<a class="place-ph" href="' + esc(p.map) + '" target="_blank" rel="noopener" aria-label="' + esc(p.name) + ' 네이버 지도">' +
            '<img src="' + esc(/^(data:|https?:)/.test(p.photo || "") ? p.photo : "../assets/img/" + (p.photo || "none")) + '" alt="' + esc(p.name) + ' 대표 사진" loading="lazy" onerror="this.remove()">' +
            '<span class="ph-fallback" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + placeIcon(p.type) + '</svg><b>' + esc(p.name) + '</b></span>' +
          '</a>' +
          '<div class="top"><div class="stack-sm" style="gap:4px"><h3>' + esc(p.name) + '</h3><div class="chips"><span class="chip">' + p.type + "</span>" + (p.station ? '<span class="chip teal">역 도보</span>' : "") + '</div></div><span class="dist">' + esc(p.near) + "</span></div>" +
          "<p>" + esc(p.menu) + '</p><dl class="kv"><dt>주소</dt><dd>' + esc(p.address.replace("경기 가평군 ", "")) + "</dd><dt>영업</dt><dd>" + esc(p.hours) + "</dd>" + (p.phone ? '<dt>전화</dt><dd><a class="link" href="tel:' + esc(p.phone) + '">' + esc(p.phone) + "</a></dd>" : "") + "</dl>" +
          '<a class="btn sm line" href="' + esc(p.map) + '" target="_blank" rel="noopener">네이버 지도에서 보기</a></article>';
      }).join("") || '<p class="small">조건에 맞는 곳이 없습니다.</p>';
    }
    $("#place-filter").addEventListener("click", function (e) { var b = e.target.closest("button[data-f]"); if (!b) return; filter = b.dataset.f; $$("#place-filter button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); places(); });
    places();
    var cf = $("#contact-form");
    if (cf) cf.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $("#c-msg").value.trim();
      if (!msg) { $("#c-msg").focus(); T.toast("문의 내용을 적어 주세요."); return; }
      var data = { name: U.name, company: U.company, email: U.email, phone: U.phone || "", message: msg, page: "이용 안내" };
      var DB = window.TreeON_DB;
      (DB ? DB.insert("leads", { kind: "contact", status: "신규", data: data }) : Promise.reject()).then(function () {
        $("#c-msg").value = ""; T.toast("문의를 보냈습니다. 가입한 이메일로 답변드립니다.");
      }).catch(function () { T.mailto("[TreeON 이용 문의] " + (U.company || U.name), data); });
    });
  }

  boot();
})();
