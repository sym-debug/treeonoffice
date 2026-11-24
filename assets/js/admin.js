// TreeON Office 관리자 페이지
(function () {
  var T = window.TreeON, DB = window.TreeON_DB, D = window.TREEON_DATA, CFG = window.TREEON_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function dt(iso, time) { if (!iso) return "—"; var d = new Date(iso); if (isNaN(d)) return iso; return d.getFullYear() + "." + pad(d.getMonth() + 1) + "." + pad(d.getDate()) + (time === false ? "" : " " + pad(d.getHours()) + ":" + pad(d.getMinutes())); }
  function dshort(s) { if (!s) return "—"; var p = s.split("-"); return p.length === 3 ? p[1] + "." + p[2] : s; }
  function won(n) { return Math.round(n || 0).toLocaleString("ko-KR") + "원"; }
  function toast(m) { T.toast(m); }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function download(name, text, type) {
    var b = new Blob([text], { type: type || "application/octet-stream" }); var a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function csv(rows, cols) {
    var q = function (v) { v = v == null ? "" : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    return "﻿" + [cols.map(function (c) { return q(c[1]); }).join(",")].concat(rows.map(function (r) { return cols.map(function (c) { return q(typeof c[0] === "function" ? c[0](r) : r[c[0]]); }).join(","); })).join("\n");
  }
  function lines(txt) { return (txt || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean); }
  function parts(l) { return l.split("|").map(function (x) { return x.trim(); }); }
  function nums(txt) { return (txt || "").split(",").map(function (x) { return x.trim(); }).filter(function (x) { return x !== ""; }).map(Number); }
  function strs(txt) { return (txt || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean); }

  var LEAD_KIND = { apply: "사전 신청", signup: "회원가입", contact: "이용자 문의" };
  var LEAD_STATUS = ["신규", "연락 완료", "체험 확정", "보류", "종료"];
  var TRIAL_STATUS = ["요청", "일정 확정", "진행 중", "완료", "유료 전환", "취소"];
  var RES_STATUS = ["확정", "상담 대기", "이용 완료", "취소"];
  var FIELD = { company: "회사명", size: "회사 규모", name: "담당자", role: "부서·직급", dept: "부서·직급", email: "이메일", phone: "연락처", purpose: "이용 목적", team: "예상 인원", when: "희망 시기", package: "관심 패키지", security: "보안 수준", trial: "무료 체험", message: "내용", marketing: "마케팅 수신", privacy: "개인정보 동의", page: "접수 화면" };
  function statusChip(s) {
    var c = { "신규": "warn", "연락 완료": "navy", "체험 확정": "ok", "보류": "", "종료": "", "요청": "warn", "일정 확정": "navy", "진행 중": "teal", "완료": "ok", "유료 전환": "ok", "취소": "danger", "확정": "ok", "상담 대기": "warn", "이용 완료": "navy" }[s] || "";
    return '<span class="chip ' + c + '">' + esc(s) + "</span>";
  }

  // ---------- 드로어 ----------
  var drawer = $("#drawer");
  function openDrawer(title, html, mount) {
    $("#drawer-title").textContent = title;
    $("#drawer-body").innerHTML = html;
    drawer.showModal ? drawer.showModal() : drawer.setAttribute("open", "");
    if (mount) mount($("#drawer-body"));
  }
  function closeDrawer() { drawer.close ? drawer.close() : drawer.removeAttribute("open"); }
  $("#drawer-close").addEventListener("click", closeDrawer);
  drawer.addEventListener("click", function (e) { if (e.target === drawer) closeDrawer(); });

  // ---------- 접속 확인 ----------
  async function gate() {
    $("#mode-label").textContent = DB.mode === "supabase" ? "Supabase 연결" : "체험 모드 · 이 브라우저 데이터";
    if (DB.mode === "local") {
      if (sessionStorage.getItem("treeon.admin") === "ok") return true;
      return showGate(false);
    }
    var u = await T.Auth.current().catch(function () { return null; });
    if (u && await isAdmin(u.email)) return true;
    return showGate(true, u);
  }
  async function isAdmin(email) {
    try { var c = await T.sb(); var r = await c.from("admins").select("email").eq("email", email).maybeSingle(); return !!(r.data); } catch (e) { return false; }
  }
  function showGate(sb, u) {
    return new Promise(function (resolve) {
      var g = $("#gate"); g.hidden = false; $("#shell").hidden = true;
      $("#gate-form").innerHTML = sb
        ? (u ? '<p class="form-status">' + esc(u.email) + " 계정에는 관리자 권한이 없습니다. supabase/schema.sql 의 admins 테이블에 이메일을 등록하세요.</p>" : "") +
          '<div class="field"><label for="g-email">관리자 이메일</label><input id="g-email" type="email" required autocomplete="email"></div><div class="field"><label for="g-pw">비밀번호</label><input id="g-pw" type="password" required autocomplete="current-password"></div>'
        : '<div class="field"><label for="g-pw">관리자 비밀번호</label><input id="g-pw" type="password" required autocomplete="current-password"><span class="hint">assets/js/config.js 의 ADMIN_PASSCODE</span></div>';
      $("#gate-form").insertAdjacentHTML("beforeend", '<p class="form-status" id="g-err" hidden></p><button class="btn block" type="submit">관리자 로그인</button>');
      $("#gate-form").onsubmit = async function (e) {
        e.preventDefault();
        var err = $("#g-err");
        if (!sb) {
          if ($("#g-pw").value === CFG.ADMIN_PASSCODE) { sessionStorage.setItem("treeon.admin", "ok"); g.hidden = true; $("#shell").hidden = false; resolve(true); }
          else { err.hidden = false; err.textContent = "비밀번호가 맞지 않습니다."; }
          return;
        }
        try {
          await T.Auth.login($("#g-email").value, $("#g-pw").value);
          if (await isAdmin($("#g-email").value.trim().toLowerCase())) { g.hidden = true; $("#shell").hidden = false; resolve(true); }
          else { err.hidden = false; err.textContent = "관리자 권한이 없는 계정입니다."; }
        } catch (ex) { err.hidden = false; err.textContent = ex.message; }
      };
    });
  }
  $$("[data-admin-logout]").forEach(function (b) {
    b.addEventListener("click", function () { sessionStorage.removeItem("treeon.admin"); if (DB.mode === "supabase") T.Auth.logout(); location.reload(); });
  });

  // ---------- 라우터 ----------
  var VIEWS = { dash: dash, leads: leads, trials: trials, reservations: reservations, reports: reports, content: content, settings: settings };
  function route() {
    var h = (location.hash || "#dash").slice(1).split("?"), name = VIEWS[h[0]] ? h[0] : "dash";
    var q = new URLSearchParams(h[1] || "");
    $$("[data-nav]").forEach(function (a) { a.setAttribute("aria-current", a.dataset.nav === name ? "page" : "false"); });
    $("#view").innerHTML = '<p class="small">불러오는 중…</p>';
    VIEWS[name](q).catch(function (e) { console.error(e); $("#view").innerHTML = '<div class="panel"><h2>불러오지 못했습니다</h2><p class="small">' + esc(e.message) + "</p></div>"; });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  function head(title, sub, actions) {
    return '<div class="page-head"><div><h1>' + title + "</h1>" + (sub ? "<p>" + sub + "</p>" : "") + '</div><div class="btn-row">' + (actions || "") + "</div></div>";
  }

  // ---------- 대시보드 ----------
  async function dash() {
    var L = await DB.list("leads"), TR = await DB.list("trials"), RP = await DB.list("reports"), UD = await DB.allUserData();
    var res = []; UD.filter(function (x) { return x.name === "reservations"; }).forEach(function (x) { (x.value || []).forEach(function (r) { res.push(r); }); });
    var apply = L.filter(function (l) { return l.kind === "apply"; });
    var k = [
      ["새 문의", L.filter(function (l) { return l.status === "신규"; }).length, "#leads"],
      ["사전 신청", apply.length, "#leads?kind=apply"],
      ["체험 진행", TR.filter(function (t) { return t.status === "일정 확정" || t.status === "진행 중"; }).length, "#trials"],
      ["유료 전환", TR.filter(function (t) { return t.status === "유료 전환"; }).length, "#trials"],
      ["확정 예약", res.filter(function (r) { return r.status === "확정"; }).length, "#reservations"],
      ["공개 리포트", RP.filter(function (r) { return r.published; }).length, "#reports"]
    ];
    var funnel = [
      ["사전 신청", apply.length],
      ["체험 희망", apply.filter(function (l) { return (l.data || {}).trial === "희망"; }).length],
      ["체험 일정", TR.filter(function (t) { return t.status !== "요청" && t.status !== "취소"; }).length],
      ["체험 완료", TR.filter(function (t) { return t.status === "완료" || t.status === "유료 전환"; }).length],
      ["유료 전환", TR.filter(function (t) { return t.status === "유료 전환"; }).length]
    ];
    function bars(arr) {
      var mx = Math.max.apply(null, arr.map(function (x) { return x[1]; }).concat([1]));
      return arr.map(function (x) { return '<div class="bar-row"><span>' + esc(x[0]) + '</span><span class="tr"><i style="width:' + (x[1] / mx * 100) + '%"></i></span><b>' + x[1] + "</b></div>"; }).join("") || '<p class="small">데이터가 없습니다.</p>';
    }
    function tally(key) {
      var m = {}; apply.forEach(function (l) { String((l.data || {})[key] || "").split(", ").filter(Boolean).forEach(function (v) { m[v] = (m[v] || 0) + 1; }); });
      return Object.keys(m).map(function (x) { return [x, m[x]]; }).sort(function (a, b) { return b[1] - a[1]; });
    }
    var upcoming = TR.filter(function (t) { return t.status === "일정 확정" || t.status === "진행 중"; }).sort(function (a, b) { return (a.data.start || "") < (b.data.start || "") ? -1 : 1; }).slice(0, 5);
    $("#view").innerHTML = head("대시보드", "문의부터 체험, 유료 전환까지 한눈에 봅니다.") +
      '<div class="kpis six">' + k.map(function (x) { return '<a class="kpi" href="' + x[2] + '"><span class="l">' + x[0] + '</span><span class="v">' + x[1] + "</span></a>"; }).join("") + "</div>" +
      '<div class="grid-app" style="margin-top:16px">' +
      '<div class="panel c7"><div class="between"><h2>최근 문의</h2><a class="link small" href="#leads">전체 보기</a></div>' + leadTable(L.slice(0, 6), true) + "</div>" +
      '<div class="panel c5"><h2>전환 단계</h2><div class="stack-sm">' + bars(funnel) + '</div><p class="small">사전 신청 → 체험 → 유료 전환 건수</p></div>' +
      '<div class="panel c4"><h2>회사 규모</h2><div class="stack-sm">' + bars(tally("size")) + "</div></div>" +
      '<div class="panel c4"><h2>이용 목적</h2><div class="stack-sm">' + bars(tally("purpose")) + "</div></div>" +
      '<div class="panel c4"><div class="between"><h2>다가오는 체험</h2><a class="link small" href="#trials">일정 보기</a></div>' +
      (upcoming.length ? '<ul class="list">' + upcoming.map(function (t) { return '<li><div class="stack-sm" style="gap:2px"><span class="t">' + esc(t.data.company) + '</span><span class="s">' + dshort(t.data.start) + "–" + dshort(t.data.end) + " · " + esc(t.data.team || "-") + "명</span></div>" + statusChip(t.status) + "</li>"; }).join("") + "</ul>" : '<p class="small">잡힌 체험 일정이 없습니다.</p>') + "</div>" +
      "</div>";
    bindLeadRows(L);
  }

  // ---------- 문의 관리 ----------
  function leadSummary(l) {
    var d = l.data || {};
    if (l.kind === "apply") return [d.team, d.when, d.trial === "희망" ? "체험 희망" : ""].filter(Boolean).join(" · ");
    if (l.kind === "contact") return (d.message || "").slice(0, 40);
    return d.dept || "";
  }
  function leadTable(rows, compact) {
    if (!rows.length) return '<p class="small">문의가 없습니다.</p>';
    return '<div class="table-wrap"><table class="adm-table"><thead><tr><th>접수</th><th>구분</th><th>회사</th><th>담당자</th>' + (compact ? "" : "<th>연락처</th>") + (compact ? "" : "<th>요약</th>") + "<th>상태</th></tr></thead><tbody>" +
      rows.map(function (l) {
        var d = l.data || {};
        return '<tr data-lead="' + l.id + '" tabindex="0"><td class="num">' + dt(l.created_at) + "</td><td>" + (LEAD_KIND[l.kind] || l.kind) + "</td><td><b>" + esc(d.company || "—") + "</b></td><td>" + esc(d.name || "—") + "</td>" + (compact ? "" : '<td class="num">' + esc(d.email || "") + "<br><span class=\"small\">" + esc(d.phone || "") + "</span></td>") + (compact ? "" : '<td class="small">' + esc(leadSummary(l)) + "</td>") + "<td>" + statusChip(l.status) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }
  function bindLeadRows(all, after) {
    $$("[data-lead]").forEach(function (tr) {
      var open = function () { leadDrawer(all.filter(function (x) { return x.id === tr.dataset.lead; })[0], after); };
      tr.addEventListener("click", open);
      tr.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
    });
  }
  function leadDrawer(l, after) {
    var d = l.data || {};
    var fields = Object.keys(d).filter(function (k) { return d[k] !== "" && k !== "privacy"; }).map(function (k) { return "<dt>" + (FIELD[k] || k) + "</dt><dd>" + esc(d[k]).replace(/\n/g, "<br>") + "</dd>"; }).join("");
    openDrawer((d.company || "문의") + " · " + (LEAD_KIND[l.kind] || ""),
      '<p class="small">' + dt(l.created_at) + " 접수</p>" +
      '<dl class="kv left">' + fields + "</dl>" +
      '<div class="field"><label for="l-status">처리 상태</label><select id="l-status">' + LEAD_STATUS.map(function (s) { return "<option" + (s === l.status ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></div>" +
      '<div class="field"><label for="l-memo">메모</label><textarea id="l-memo" placeholder="통화 내용, 다음 연락 일정 등">' + esc(l.memo || "") + "</textarea></div>" +
      '<div class="btn-row"><button class="btn" id="l-save">저장</button>' + (l.kind !== "signup" ? '<button class="btn line" id="l-trial">체험 일정 만들기</button>' : "") +
      (d.email ? '<a class="btn ghost" href="mailto:' + esc(d.email) + '?subject=' + encodeURIComponent("[TreeON Office] 문의 답변드립니다") + '">메일 보내기</a>' : "") + '<button class="btn ghost danger-t" id="l-del">삭제</button></div>',
      function () {
        $("#l-save").onclick = function () { DB.update("leads", l.id, { status: $("#l-status").value, memo: $("#l-memo").value }).then(function () { toast("저장했습니다."); closeDrawer(); route(); }); };
        $("#l-del").onclick = function () { if (confirm("이 문의를 삭제할까요?")) DB.remove("leads", l.id).then(function () { toast("삭제했습니다."); closeDrawer(); route(); }); };
        var tb = $("#l-trial");
        if (tb) tb.onclick = function () {
          var team = parseInt(String(d.team || "").replace(/[^0-9~]/g, "").split("~").pop(), 10) || "";
          DB.insert("trials", { lead_id: l.id, status: "요청", data: { company: d.company, contact: d.name, email: d.email, phone: d.phone, team: team, start: "", end: "", package: d.package || "", security: d.security || "", memo: d.message || "" } })
            .then(function () { return DB.update("leads", l.id, { status: "체험 확정", memo: $("#l-memo").value }); })
            .then(function () { toast("체험 일정에 추가했습니다."); closeDrawer(); location.hash = "#trials"; });
        };
      });
  }
  async function leads(q) {
    var all = await DB.list("leads"), kind = q.get("kind") || "all", st = q.get("status") || "", kw = q.get("q") || "";
    var rows = all.filter(function (l) {
      if (kind !== "all" && l.kind !== kind) return false;
      if (st && l.status !== st) return false;
      if (kw) { var s = JSON.stringify(l.data || {}) + (l.memo || ""); if (s.indexOf(kw) < 0) return false; }
      return true;
    });
    var cnt = function (k) { return all.filter(function (l) { return k === "all" || l.kind === k; }).length; };
    $("#view").innerHTML = head("문의 관리", "사전 신청, 회원가입, 이용자 문의를 한곳에서 처리합니다.", '<button class="btn line sm" id="l-csv">CSV 내려받기</button>') +
      '<div class="tabs">' + [["all", "전체"], ["apply", "사전 신청"], ["signup", "회원가입"], ["contact", "이용자 문의"]].map(function (t) { return '<button type="button" data-k="' + t[0] + '" aria-selected="' + (kind === t[0]) + '">' + t[1] + ' <span class="cnt">' + cnt(t[0]) + "</span></button>"; }).join("") + "</div>" +
      '<div class="filters"><select id="l-st"><option value="">전체 상태</option>' + LEAD_STATUS.map(function (s) { return "<option" + (s === st ? " selected" : "") + ">" + s + "</option>"; }).join("") + '</select><input id="l-q" type="text" placeholder="회사·이름·이메일·내용 검색" value="' + esc(kw) + '"><span class="small">' + rows.length + "건</span></div>" +
      '<div class="panel">' + leadTable(rows) + "</div>";
    function go(p) { var o = { kind: kind, status: st, q: kw }; Object.assign(o, p); var s = new URLSearchParams(); Object.keys(o).forEach(function (k) { if (o[k] && o[k] !== "all") s.set(k, o[k]); }); location.hash = "#leads" + (s.toString() ? "?" + s : ""); }
    $$(".tabs [data-k]").forEach(function (b) { b.onclick = function () { go({ kind: b.dataset.k }); }; });
    $("#l-st").onchange = function () { go({ status: this.value }); };
    $("#l-q").onkeydown = function (e) { if (e.key === "Enter") go({ q: this.value.trim() }); };
    $("#l-csv").onclick = function () {
      download("treeon_문의_" + ymd(new Date()) + ".csv", csv(rows, [["created_at", "접수일시"], [function (r) { return LEAD_KIND[r.kind]; }, "구분"], ["status", "상태"]]
        .concat(Object.keys(FIELD).filter(function (k) { return k !== "dept"; }).map(function (k) { return [function (r) { return (r.data || {})[k] || (k === "role" ? (r.data || {}).dept : ""); }, FIELD[k]]; }))
        .concat([["memo", "메모"]])), "text/csv;charset=utf-8");
    };
    bindLeadRows(all);
  }

  // ---------- 데모·체험 ----------
  function trialForm(t) {
    var d = t.data || {};
    var opt = function (arr, v) { return arr.map(function (s) { return "<option" + (s === v ? " selected" : "") + ">" + esc(s) + "</option>"; }).join(""); };
    return '<form id="t-form" class="form" novalidate>' +
      '<div class="field full"><label>회사명<span class="req">*</span></label><input name="company" required value="' + esc(d.company) + '"></div>' +
      '<div class="field"><label>담당자</label><input name="contact" value="' + esc(d.contact) + '"></div>' +
      '<div class="field"><label>이메일</label><input name="email" type="email" value="' + esc(d.email) + '"><span class="hint">리포트를 볼 이용자 계정 이메일</span></div>' +
      '<div class="field"><label>연락처</label><input name="phone" value="' + esc(d.phone) + '"></div>' +
      '<div class="field"><label>인원</label><input name="team" type="number" min="1" max="10" value="' + esc(d.team) + '"></div>' +
      '<div class="field"><label>시작일</label><input name="start" type="date" value="' + esc(d.start) + '"></div>' +
      '<div class="field"><label>종료일</label><input name="end" type="date" value="' + esc(d.end) + '"></div>' +
      '<div class="field"><label>패키지</label><select name="package"><option value="">미정</option>' + opt(D.packages.map(function (p) { return p.name; }), d.package) + "</select></div>" +
      '<div class="field"><label>보안 수준</label><select name="security"><option value="">미정</option>' + opt(D.security.map(function (s) { return s.name; }), d.security) + "</select></div>" +
      '<div class="field full"><label>진행 상태</label><select name="status">' + opt(TRIAL_STATUS, t.status || "요청") + "</select></div>" +
      '<div class="field full"><label>메모</label><textarea name="memo">' + esc(d.memo) + "</textarea></div></form>";
  }
  function readTrial() {
    var f = $("#t-form"); if (!f.reportValidity()) return null;
    var fd = new FormData(f), d = {}; fd.forEach(function (v, k) { d[k] = v; });
    if (d.start && d.end && d.end < d.start) { toast("종료일이 시작일보다 빠릅니다."); return null; }
    var status = d.status; delete d.status; d.team = d.team ? +d.team : "";
    return { status: status, data: d };
  }
  function trialDrawer(t) {
    var isNew = !t;
    t = t || { status: "요청", data: {} };
    openDrawer(isNew ? "체험 일정 추가" : (t.data.company || "체험") + " 체험",
      trialForm(t) + '<div class="btn-row"><button class="btn" id="t-save">저장</button>' + (isNew ? "" : '<a class="btn line" href="#reports?trial=' + t.id + '" id="t-rep">리포트 작성</a><button class="btn ghost danger-t" id="t-del">삭제</button>') + "</div>",
      function () {
        $("#t-save").onclick = function () {
          var v = readTrial(); if (!v) return;
          (isNew ? DB.insert("trials", v) : DB.update("trials", t.id, v)).then(function () { toast("저장했습니다."); closeDrawer(); route(); });
        };
        if (!isNew) {
          $("#t-del").onclick = function () { if (confirm("이 체험 일정을 삭제할까요?")) DB.remove("trials", t.id).then(function () { closeDrawer(); route(); }); };
          $("#t-rep").onclick = function () { closeDrawer(); };
        }
      });
  }
  async function trials() {
    var all = await DB.list("trials"), showCancel = false;
    var cols = TRIAL_STATUS.filter(function (s) { return s !== "취소"; });
    $("#view").innerHTML = head("데모·체험 관리", "무료 체험 요청부터 일정, 진행, 유료 전환까지 관리합니다.", '<button class="btn sm" id="t-new">체험 일정 추가</button>') +
      '<div class="board">' + cols.map(function (s) {
        var items = all.filter(function (t) { return t.status === s; });
        return '<section class="col"><header><b>' + s + '</b><span class="cnt">' + items.length + "</span></header>" +
          (items.map(function (t) {
            var d = t.data || {}, nx = TRIAL_STATUS[TRIAL_STATUS.indexOf(s) + 1];
            return '<article class="tcard" data-trial="' + t.id + '" tabindex="0"><b>' + esc(d.company || "—") + '</b><span class="small">' + (d.start ? dshort(d.start) + "–" + dshort(d.end) : "일정 미정") + " · " + (d.team ? d.team + "명" : "인원 미정") + "</span>" +
              (d.contact ? '<span class="small">' + esc(d.contact) + "</span>" : "") +
              (nx && nx !== "취소" ? '<button type="button" class="next" data-next="' + t.id + '" data-to="' + nx + '">' + nx + "로 ›</button>" : "") + "</article>";
          }).join("") || '<p class="empty-col">없음</p>') + "</section>";
      }).join("") + "</div>" +
      '<details class="panel" style="margin-top:16px"><summary><b>취소된 체험</b> <span class="small">' + all.filter(function (t) { return t.status === "취소"; }).length + "건</span></summary>" +
      '<ul class="list" style="margin-top:12px">' + all.filter(function (t) { return t.status === "취소"; }).map(function (t) { return '<li data-trial="' + t.id + '"><span class="t">' + esc(t.data.company) + '</span><span class="s">' + dt(t.created_at, false) + "</span></li>"; }).join("") + "</ul></details>";
    $("#t-new").onclick = function () { trialDrawer(null); };
    $$("[data-trial]").forEach(function (c) {
      c.addEventListener("click", function (e) {
        if (e.target.closest("[data-next]")) return;
        trialDrawer(all.filter(function (t) { return t.id === c.dataset.trial; })[0]);
      });
      c.addEventListener("keydown", function (e) { if (e.key === "Enter") c.click(); });
    });
    $$("[data-next]").forEach(function (b) {
      b.onclick = function () { DB.update("trials", b.dataset.next, { status: b.dataset.to }).then(function () { toast(b.dataset.to + "(으)로 옮겼습니다."); route(); }); };
    });
  }

  // ---------- 예약·서류 ----------
  async function reservations() {
    var UD = await DB.allUserData(), members = await DB.members();
    var who = function (e) { var m = members.filter(function (x) { return x.email === e; })[0]; return m ? (m.company || "") + " · " + (m.name || "") : e; };
    var res = [], docs = [];
    UD.forEach(function (x) {
      if (x.name === "reservations") (x.value || []).forEach(function (r) { res.push({ email: x.email, r: r }); });
      if (x.name === "docs") (x.value || []).forEach(function (d) { docs.push({ email: x.email, d: d }); });
    });
    res.sort(function (a, b) { return a.r.start < b.r.start ? 1 : -1; });
    var pk = function (id) { return (D.packages.filter(function (p) { return p.id === id; })[0] || {}).name || id; };
    var dn = function (id) { return (D.docTypes.filter(function (p) { return p.id === id; })[0] || {}).name || id; };
    $("#view").innerHTML = head("예약·서류", "이용자가 앱에서 신청한 예약과 결재 서류를 확인하고 상태를 바꿉니다." + (DB.mode === "local" ? " (체험 모드: 이 브라우저에서 만든 데이터만 보입니다)" : "")) +
      '<div class="panel"><h2>예약 ' + res.length + "건</h2>" + (res.length ? '<div class="table-wrap"><table class="adm-table"><thead><tr><th>예약번호</th><th>이용자</th><th>프로젝트</th><th>기간</th><th>인원</th><th>패키지</th><th>금액(VAT 포함)</th><th>상태</th></tr></thead><tbody>' +
        res.map(function (x, i) { var r = x.r; return '<tr><td class="num">' + esc(r.id) + (r.demo ? ' <span class="chip">체험</span>' : "") + "</td><td>" + esc(who(x.email)) + "<br><span class=\"small\">" + esc(x.email) + "</span></td><td>" + esc(r.project) + '</td><td class="num">' + esc(r.start) + " – " + esc(r.end) + '</td><td class="num">' + r.team + "명</td><td>" + esc(pk(r.pkg)) + '</td><td class="num">' + won((r.amount || 0) * 1.1) + '</td><td><select data-res="' + i + '">' + RES_STATUS.map(function (s) { return "<option" + (s === r.status ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></td></tr>"; }).join("") +
        "</tbody></table></div>" : '<p class="small">예약이 없습니다.</p>') + "</div>" +
      '<div class="panel" style="margin-top:16px"><h2>결재 서류 신청 ' + docs.length + "건</h2>" + (docs.length ? '<div class="table-wrap"><table class="adm-table"><thead><tr><th>신청번호</th><th>이용자</th><th>서류</th><th>필요일</th><th>받을 이메일</th><th>발급</th></tr></thead><tbody>' +
        docs.map(function (x, i) { var d = x.d; return '<tr><td class="num">' + esc(d.id) + "</td><td>" + esc(who(x.email)) + "</td><td>" + esc(d.types.map(dn).join(", ")) + '</td><td class="num">' + esc(d.due) + "</td><td>" + esc(d.email) + '</td><td><label class="check"><input type="checkbox" data-doc="' + i + '"' + (d.issued ? " checked" : "") + "> 발급 완료</label></td></tr>"; }).join("") +
        "</tbody></table></div>" : '<p class="small">서류 신청이 없습니다.</p>') + "</div>";
    $$("[data-res]").forEach(function (s) {
      s.onchange = function () {
        var x = res[+s.dataset.res], row = UD.filter(function (u) { return u.email === x.email && u.name === "reservations"; })[0];
        row.value.forEach(function (r) { if (r.id === x.r.id) r.status = s.value; });
        DB.setUserData(x.email, "reservations", row.value).then(function () { toast("예약 상태를 바꿨습니다."); });
      };
    });
    $$("[data-doc]").forEach(function (c) {
      c.onchange = function () {
        var x = docs[+c.dataset.doc], row = UD.filter(function (u) { return u.email === x.email && u.name === "docs"; })[0];
        row.value.forEach(function (d) { if (d.id === x.d.id) d.issued = c.checked; });
        DB.setUserData(x.email, "docs", row.value).then(function () { toast(c.checked ? "발급 완료로 표시했습니다." : "발급 표시를 해제했습니다."); });
      };
    });
  }

  // ---------- 이용 리포트 ----------
  function reportToForm(R) {
    var P = R.productivity || {}, S = R.satisfaction || {}, E = R.esg || {};
    return {
      company: R.company || "", team: R.team || "", members: R.members || "", space: R.space || "폐교형", period: R.period || "",
      kpis: (P.kpis || []).map(function (k) { return [k.label, k.before, k.after, k.unit, k.better].join(" | "); }).join("\n"),
      dailyLabels: (P.dailyLabels || []).join(", "), daily: (P.daily || []).join(", "), baseline: P.baseline == null ? "" : P.baseline,
      hours: (P.hours || []).join(", "), ib: (P.interruptBefore || []).join(", "), ia: (P.interruptAfter || []).join(", "),
      milestones: (P.milestones || []).map(function (m) { return [m.name, m.plan, m.actual, m.note].join(" | "); }).join("\n"),
      positive: (S.positive || []).map(function (q) { return q.text + " | " + q.who; }).join("\n"),
      negative: (S.negative || []).map(function (q) { return q.text + " | " + q.who; }).join("\n"),
      sat: (S.items || []).map(function (i) { return i.label + " | " + i.score; }).join("\n"),
      esgk: (E.kpis || []).map(function (k) { return k.label + " | " + k.value; }).join("\n"),
      spend: (E.spend || []).map(function (k) { return k.label + " | " + k.value; }).join("\n")
    };
  }
  function formToReport(f) {
    var err = [];
    var kpis = lines(f.kpis).map(function (l) { var p = parts(l); return { label: p[0], before: +p[1], after: +p[2], unit: p[3] || "", better: p[4] === "down" ? "down" : "up" }; });
    kpis.forEach(function (k) { if (isNaN(k.before) || isNaN(k.after)) err.push("생산성 지표 '" + k.label + "'의 숫자를 확인하세요."); });
    var daily = nums(f.daily), dl = strs(f.dailyLabels);
    if (daily.length !== dl.length) err.push("일별 몰입 시간의 날짜 수(" + dl.length + ")와 값 수(" + daily.length + ")가 다릅니다.");
    var hrs = strs(f.hours), ib = nums(f.ib), ia = nums(f.ia);
    if (hrs.length !== ib.length || hrs.length !== ia.length) err.push("시간대별 끊김의 시간대·이용 전·이용 기간 개수를 맞춰 주세요.");
    if (daily.some(isNaN) || ib.some(isNaN) || ia.some(isNaN)) err.push("쉼표로 구분한 숫자만 넣어 주세요.");
    var R = {
      company: f.company, team: f.team, members: +f.members || f.members, space: f.space, period: f.period,
      productivity: {
        kpis: kpis, daily: daily, dailyLabels: dl, baseline: +f.baseline || 0, hours: hrs, interruptBefore: ib, interruptAfter: ia,
        milestones: lines(f.milestones).map(function (l) { var p = parts(l); return { name: p[0], plan: p[1] || "", actual: p[2] || "", note: p[3] || "" }; })
      },
      satisfaction: {
        items: lines(f.sat).map(function (l) { var p = parts(l); return { label: p[0], score: +p[1] || 0 }; }),
        positive: lines(f.positive).map(function (l) { var p = parts(l); return { text: p[0], who: p[1] || "" }; }),
        negative: lines(f.negative).map(function (l) { var p = parts(l); return { text: p[0], who: p[1] || "" }; })
      },
      esg: {
        kpis: lines(f.esgk).map(function (l) { var p = parts(l); return { label: p[0], value: p[1] || "" }; }),
        spend: lines(f.spend).map(function (l) { var p = parts(l); return { label: p[0], value: +p[1] || 0 }; })
      }
    };
    return { R: R, err: err };
  }
  function reportEditor(rec, opts) {
    var F = reportToForm(rec.data || D.report);
    var ta = function (n, label, hint, rows) { return '<div class="field full"><label>' + label + "</label><textarea name=\"" + n + '" rows="' + (rows || 4) + '">' + esc(F[n]) + '</textarea><span class="hint">' + hint + "</span></div>"; };
    var inp = function (n, label, hint, full) { return '<div class="field' + (full ? " full" : "") + '"><label>' + label + '</label><input name="' + n + '" value="' + esc(F[n]) + '">' + (hint ? '<span class="hint">' + hint + "</span>" : "") + "</div>"; };
    return '<form id="r-form" class="stack" novalidate>' +
      (opts.sample ? "" : '<div class="panel"><h2>대상</h2><div class="form">' +
        '<div class="field"><label>이용자 이메일<span class="req">*</span></label><input name="owner_email" type="email" list="r-emails" required value="' + esc(rec.owner_email || "") + '"><span class="hint">이 이메일로 로그인한 이용자의 리포트 화면에 표시됩니다.</span></div>' +
        '<div class="field"><label>공개</label><label class="check" style="margin-top:10px"><input type="checkbox" name="published"' + (rec.published ? " checked" : "") + "> 이용자에게 공개</label></div></div></div>") +
      '<div class="panel"><h2>기본 정보</h2><div class="form">' + inp("company", "회사명") + inp("team", "팀·프로젝트") + inp("members", "인원") + inp("space", "공간") + inp("period", "기간", "예: 2027.04.06 – 04.17 (평일 10일)", true) + "</div></div>" +
      '<div class="panel"><h2>생산성</h2><div class="form">' +
        ta("kpis", "핵심 지표", "한 줄에 하나: 지표 | 이용 전 | 이용 후 | 단위 | up 또는 down(줄어야 좋은 지표)", 4) +
        inp("dailyLabels", "일별 몰입 시간 — 날짜", "쉼표로 구분: 4/6, 4/7, …", true) + inp("daily", "일별 몰입 시간 — 값(시간)", "쉼표로 구분: 5.2, 5.8, …", true) + inp("baseline", "이용 전 평균(시간)") + "<span></span>" +
        inp("hours", "시간대별 끊김 — 시간대", "쉼표로 구분: 9시, 10시, …", true) + inp("ib", "이용 전 2주 평균(회)", "쉼표로 구분", true) + inp("ia", "이용 기간 평균(회)", "쉼표로 구분", true) +
        ta("milestones", "일정 변화", "한 줄에 하나: 마일스톤 | 계획 | 실제 | 변화", 3) + "</div></div>" +
      '<div class="panel"><h2>만족도</h2><div class="form">' + ta("positive", "좋았던 점", "한 줄에 하나: 의견 | 작성자(예: TF 실무자)", 3) + ta("negative", "아쉬웠던 점", "한 줄에 하나: 의견 | 작성자", 3) + ta("sat", "항목별 평가", "한 줄에 하나: 항목 | 점수(5점 만점)", 4) + "</div></div>" +
      '<div class="panel"><h2>ESG·지역 상생</h2><div class="form">' + ta("esgk", "지표", "한 줄에 하나: 항목 | 값(예: 312만원)", 4) + ta("spend", "지역 소비 내역", "한 줄에 하나: 항목 | 금액(만원, 숫자)", 4) + "</div></div>" +
      '<p class="form-status" id="r-err" hidden></p>' +
      '<div class="btn-row sticky-actions"><button class="btn" type="submit">저장</button><a class="btn ghost" href="#reports">목록으로</a>' + (opts.sample ? '<button class="btn ghost" type="button" id="r-reset">기본 샘플로 되돌리기</button>' : "") + "</div></form>";
  }
  async function reports(q) {
    var all = await DB.list("reports");
    var trialId = q.get("trial"), editId = q.get("edit"), sample = q.get("sample");
    if (sample) {
      var c0 = await DB.getContent();
      $("#view").innerHTML = head("샘플 리포트 편집", "리포트가 공개되지 않은 이용자에게 보이는 샘플입니다.") + reportEditor({ data: c0.report || DB.defaults.report }, { sample: true });
      $("#r-reset").onclick = function () { if (!confirm("샘플 리포트를 처음 값으로 되돌릴까요?")) return; DB.getContent().then(function (c) { delete c.report; return DB.setContent(c); }).then(function () { D.report = JSON.parse(JSON.stringify(DB.defaults.report)); toast("되돌렸습니다."); route(); }); };
      $("#r-form").onsubmit = function (e) {
        e.preventDefault(); var f = Object.fromEntries(new FormData(this)); var o = formToReport(f);
        if (o.err.length) { var er = $("#r-err"); er.hidden = false; er.innerHTML = o.err.map(esc).join("<br>"); return; }
        DB.getContent().then(function (c) { c.report = o.R; return DB.setContent(c); }).then(function () { toast("샘플 리포트를 저장했습니다."); location.hash = "#reports"; });
      };
      return;
    }
    if (trialId || editId || q.get("new")) {
      var rec;
      if (editId) rec = all.filter(function (r) { return r.id === editId; })[0];
      if (!rec) {
        rec = { owner_email: "", published: false, data: JSON.parse(JSON.stringify(D.report)) };
        if (trialId) {
          var t = (await DB.list("trials")).filter(function (x) { return x.id === trialId; })[0];
          if (t) {
            var d = t.data || {};
            rec.owner_email = d.email || ""; rec.trial_id = t.id;
            Object.assign(rec.data, { company: d.company || "", members: d.team || rec.data.members, period: d.start ? d.start.replace(/-/g, ".") + " – " + (d.end || "").slice(5).replace("-", ".") : rec.data.period });
          }
        }
      }
      var members = await DB.members();
      $("#view").innerHTML = head(editId ? "리포트 수정" : "새 리포트", "체험·이용이 끝난 팀의 실제 측정값을 넣고 공개하면, 그 팀 이용자의 리포트 화면이 샘플 대신 이 내용으로 바뀝니다.") +
        reportEditor(rec, {}) + '<datalist id="r-emails">' + members.map(function (m) { return '<option value="' + esc(m.email) + '">' + esc((m.company || "") + " " + (m.name || "")) + "</option>"; }).join("") + "</datalist>";
      $("#r-form").onsubmit = function (e) {
        e.preventDefault();
        if (!this.reportValidity()) return;
        var f = Object.fromEntries(new FormData(this)); var o = formToReport(f);
        if (o.err.length) { var er = $("#r-err"); er.hidden = false; er.innerHTML = o.err.map(esc).join("<br>"); er.scrollIntoView({ block: "center" }); return; }
        var row = { owner_email: f.owner_email.trim().toLowerCase(), company: o.R.company, team: o.R.team, published: !!f.published, data: o.R };
        (rec.id ? DB.update("reports", rec.id, row) : DB.insert("reports", row)).then(function () { toast(row.published ? "저장하고 공개했습니다." : "저장했습니다. 공개 전입니다."); location.hash = "#reports"; });
      };
      return;
    }
    $("#view").innerHTML = head("이용 리포트", "팀별 업무 집중도 리포트를 작성하고 이용자에게 공개합니다.", '<a class="btn line sm" href="#reports?sample=1">샘플 리포트 편집</a><a class="btn sm" href="#reports?new=1">새 리포트</a>') +
      '<div class="panel">' + (all.length ? '<div class="table-wrap"><table class="adm-table"><thead><tr><th>회사</th><th>팀</th><th>이용자 이메일</th><th>기간</th><th>공개</th><th>수정</th><th></th></tr></thead><tbody>' +
        all.map(function (r) { var d = r.data || {}; return '<tr><td><b>' + esc(r.company || d.company) + "</b></td><td>" + esc(r.team || d.team) + "</td><td>" + esc(r.owner_email) + '</td><td class="small">' + esc(d.period) + "</td><td>" + (r.published ? '<span class="chip ok">공개</span>' : '<span class="chip">비공개</span>') + '</td><td class="num small">' + dt(r.updated_at || r.created_at) + '</td><td class="row" style="gap:6px;flex-wrap:nowrap"><a class="btn sm line" href="#reports?edit=' + r.id + '">편집</a><button class="btn sm ghost" data-pub="' + r.id + '">' + (r.published ? "비공개" : "공개") + '</button><button class="btn sm ghost danger-t" data-rdel="' + r.id + '">삭제</button></td></tr>'; }).join("") +
        "</tbody></table></div>" : '<div class="empty"><h2>작성한 리포트가 없습니다</h2><p>체험이 끝난 팀을 골라 리포트를 만들어 보세요. 데모·체험 관리의 카드에서 바로 시작할 수도 있습니다.</p><a class="btn" href="#reports?new=1">새 리포트</a></div>') + "</div>";
    $$("[data-pub]").forEach(function (b) { b.onclick = function () { var r = all.filter(function (x) { return x.id === b.dataset.pub; })[0]; DB.update("reports", r.id, { published: !r.published }).then(function () { toast(r.published ? "비공개로 바꿨습니다." : "공개했습니다."); route(); }); }; });
    $$("[data-rdel]").forEach(function (b) { b.onclick = function () { if (confirm("이 리포트를 삭제할까요?")) DB.remove("reports", b.dataset.rdel).then(route); }; });
  }

  // ---------- 정보 수정 ----------
  function resizeImage(file, max) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          var s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = rej; img.src = fr.result;
      };
      fr.onerror = rej; fr.readAsDataURL(file);
    });
  }
  function photoSrc(p) { return /^(data:|https?:)/.test(p || "") ? p : "../assets/img/" + (p || ""); }
  async function content(q) {
    var tab = q.get("tab") || "price", c = await DB.getContent();
    var tabs = [["price", "요금"], ["places", "주변 시설"], ["notice", "홈 공지"], ["gallery", "사진 설명"], ["site", "연락처·로그인"]];
    var body = "";
    if (tab === "price") {
      body = '<div class="panel"><h2>패키지 요금</h2><p class="small">팀 1일 기준, 부가세 별도. 랜딩 요금 카드·비교표·예약 화면·견적서에 함께 반영됩니다.</p><div class="table-wrap"><table><thead><tr><th>구분</th><th>이름</th><th>설명</th><th>팀 1일 요금(원)</th></tr></thead><tbody>' +
        D.packages.map(function (p) { return '<tr><td class="small">' + p.id + '</td><td><input data-pn="' + p.id + '" value="' + esc(p.name) + '"></td><td><input data-pd="' + p.id + '" value="' + esc(p.desc) + '"></td><td><input data-pp="' + p.id + '" type="number" min="0" step="10000" value="' + p.price.A + '"></td></tr>'; }).join("") + "</tbody></table></div></div>";
    } else if (tab === "places") {
      body = '<div class="panel"><div class="between"><h2>주변 식당·카페·편의시설 ' + D.places.length + '곳</h2><button class="btn sm" id="pl-add">장소 추가</button></div><p class="small">이용 안내 화면에 순서대로 표시됩니다. 사진은 파일을 올리거나 이미지 주소를 넣으세요.</p>' +
        '<div class="pl-list">' + D.places.map(function (p, i) {
          return '<div class="pl-row"><span class="pl-ph">' + (p.photo ? '<img src="' + esc(photoSrc(p.photo)) + '" alt="" onerror="this.remove()">' : "") + '</span><div class="stack-sm" style="gap:2px;flex:1;min-width:0"><b>' + esc(p.name) + '</b><span class="small">' + esc(p.type) + " · " + esc(p.near || "") + " · " + esc((p.address || "").replace("경기 가평군 ", "")) + '</span></div><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn sm ghost" data-up="' + i + '" aria-label="위로"' + (i === 0 ? " disabled" : "") + '>↑</button><button class="btn sm ghost" data-down="' + i + '" aria-label="아래로"' + (i === D.places.length - 1 ? " disabled" : "") + '>↓</button><button class="btn sm line" data-pe="' + i + '">편집</button><button class="btn sm ghost danger-t" data-pdl="' + i + '">삭제</button></div></div>';
        }).join("") + "</div></div>";
    } else if (tab === "notice") {
      var N = c.notice || { on: true, title: "1호점 무료 체험을 모집합니다", body: "서울에서 1시간 거리 1호점 실증 기간에 TF팀 2~7일 무료 체험을 운영합니다. 체험이 끝나면 팀 몰입 리포트를 드립니다.", cta: "무료 체험 신청", url: "../index.html#apply" };
      body = '<div class="panel"><h2>앱 홈 공지</h2><p class="small">로그인한 이용자의 홈 화면 아래 배너입니다.</p><div class="form">' +
        '<label class="check full"><input type="checkbox" id="n-on"' + (N.on !== false ? " checked" : "") + "> 공지 표시</label>" +
        '<div class="field full"><label>제목</label><input id="n-title" value="' + esc(N.title) + '"></div><div class="field full"><label>내용</label><textarea id="n-body">' + esc(N.body) + '</textarea></div>' +
        '<div class="field"><label>버튼 문구</label><input id="n-cta" value="' + esc(N.cta) + '"></div><div class="field"><label>버튼 링크</label><input id="n-url" value="' + esc(N.url) + '"></div></div></div>';
    } else if (tab === "gallery") {
      body = '<div class="panel"><h2>공간 사진 설명</h2><p class="small">랜딩 공간 섹션, 사진 크게 보기, 이용 안내에 쓰입니다.</p><div class="gal-edit">' +
        D.gallery.map(function (g) { return '<div class="gal-row"><img src="../assets/img/a/' + g.file + '-t.webp" alt=""><div class="stack-sm" style="flex:1"><input data-gt="' + g.file + '" value="' + esc(g.title) + '"><textarea data-gd="' + g.file + '" rows="2">' + esc(g.desc) + "</textarea></div></div>"; }).join("") + "</div></div>";
    } else {
      body = '<div class="panel"><h2>연락처·로그인</h2><div class="form">' +
        '<div class="field full"><label>문의 이메일</label><input id="s-mail" type="email" value="' + esc(CFG.CONTACT_EMAIL) + '"><span class="hint">사이트 푸터, 이용 안내, 견적서 공급자 연락처에 표시됩니다.</span></div>' +
        '<label class="check full"><input type="checkbox" id="s-demo"' + (CFG.SHOW_DEMO_LOGIN ? " checked" : "") + '> 로그인 화면에 "데모 계정으로 둘러보기" 버튼 표시</label></div></div>';
    }
    $("#view").innerHTML = head("정보 수정", "공개 페이지와 앱에 보이는 정보를 바꿉니다. 저장하면 바로 반영됩니다.") +
      '<div class="tabs">' + tabs.map(function (t) { return '<button type="button" data-ct="' + t[0] + '" aria-selected="' + (tab === t[0]) + '">' + t[1] + "</button>"; }).join("") + "</div>" + body +
      '<div class="btn-row sticky-actions" style="margin-top:16px">' + (tab === "places" ? "" : '<button class="btn" id="c-save">저장</button>') + '<button class="btn ghost" id="c-reset">이 항목 기본값으로</button></div>';
    $$("[data-ct]").forEach(function (b) { b.onclick = function () { location.hash = "#content?tab=" + b.dataset.ct; }; });
    function save(mut, msg) { return DB.getContent().then(function (cc) { mut(cc); return DB.setContent(cc); }).then(function () { toast((msg || "저장했습니다.") + (DB.mode === "local" ? " (체험 모드: 이 브라우저에만 반영 · 설정 > data.js 내보내기로 배포)" : " 공개 페이지에 반영됩니다.")); route(); }); }
    var sv = $("#c-save");
    if (sv) sv.onclick = function () {
      if (tab === "price") save(function (cc) { cc.packages = D.packages.map(function (p) { return { id: p.id, name: $('[data-pn="' + p.id + '"]').value.trim() || p.name, desc: $('[data-pd="' + p.id + '"]').value.trim(), price: Math.max(0, +$('[data-pp="' + p.id + '"]').value || 0) }; }); });
      if (tab === "notice") save(function (cc) { cc.notice = { on: $("#n-on").checked, title: $("#n-title").value.trim(), body: $("#n-body").value.trim(), cta: $("#n-cta").value.trim(), url: $("#n-url").value.trim() }; });
      if (tab === "gallery") save(function (cc) { cc.gallery = {}; D.gallery.forEach(function (g) { cc.gallery[g.file] = { title: $('[data-gt="' + g.file + '"]').value.trim(), desc: $('[data-gd="' + g.file + '"]').value.trim() }; }); });
      if (tab === "site") {
        var m = $("#s-mail"); if (!m.reportValidity()) return;
        save(function (cc) { cc.contact = m.value.trim(); cc.demoLogin = $("#s-demo").checked; });
      }
    };
    $("#c-reset").onclick = function () {
      if (!confirm("이 항목을 처음 값으로 되돌릴까요?")) return;
      var key = { price: "packages", places: "places", notice: "notice", gallery: "gallery", site: "contact" }[tab];
      save(function (cc) {
        delete cc[key]; if (tab === "site") delete cc.demoLogin;
        var Dd = DB.defaults;
        if (tab === "price") Dd.packages.forEach(function (p) { var t = D.packages.filter(function (x) { return x.id === p.id; })[0]; t.name = p.name; t.desc = p.desc; t.price.A = p.price.A; });
        if (tab === "places") D.places = JSON.parse(JSON.stringify(Dd.places));
        if (tab === "gallery") Dd.gallery.forEach(function (g, i) { D.gallery[i].title = g.title; D.gallery[i].desc = g.desc; });
        if (tab === "site") { CFG.CONTACT_EMAIL = Dd.contact; }
        if (tab === "notice") delete D.notice;
      }, "기본값으로 되돌렸습니다.");
    };
    if (tab === "places") {
      var savePlaces = function (msg) { return save(function (cc) { cc.places = D.places; }, msg); };
      $$("[data-up]").forEach(function (b) { b.onclick = function () { var i = +b.dataset.up; var a = D.places; a.splice(i - 1, 0, a.splice(i, 1)[0]); savePlaces("순서를 바꿨습니다."); }; });
      $$("[data-down]").forEach(function (b) { b.onclick = function () { var i = +b.dataset.down; var a = D.places; a.splice(i + 1, 0, a.splice(i, 1)[0]); savePlaces("순서를 바꿨습니다."); }; });
      $$("[data-pdl]").forEach(function (b) { b.onclick = function () { var p = D.places[+b.dataset.pdl]; if (confirm(p.name + "을(를) 삭제할까요?")) { D.places.splice(+b.dataset.pdl, 1); savePlaces("삭제했습니다."); } }; });
      $$("[data-pe]").forEach(function (b) { b.onclick = function () { placeDrawer(+b.dataset.pe, savePlaces); }; });
      $("#pl-add").onclick = function () { placeDrawer(-1, savePlaces); };
    }
  }
  function placeDrawer(i, savePlaces) {
    var p = i >= 0 ? D.places[i] : { name: "", type: "식당", station: false, near: "", address: "경기 가평군 가평읍 ", hours: "", menu: "", phone: "", map: "", photo: "" };
    var v = function (k) { return esc(p[k] || ""); };
    openDrawer(i >= 0 ? p.name + " 편집" : "장소 추가",
      '<form id="p-form" class="form" novalidate>' +
      '<div class="field full"><label>이름<span class="req">*</span></label><input name="name" required value="' + v("name") + '"></div>' +
      '<div class="field"><label>구분</label><select name="type">' + ["식당", "카페", "편의"].map(function (t) { return "<option" + (t === p.type ? " selected" : "") + ">" + t + "</option>"; }).join("") + "</select></div>" +
      '<div class="field"><label>위치 설명</label><input name="near" value="' + v("near") + '" placeholder="예: 가평역 도보 5분"></div>' +
      '<label class="check full"><input type="checkbox" name="station"' + (p.station ? " checked" : "") + '> 가평역에서 걸어갈 수 있음 ("역 도보" 필터)</label>' +
      '<div class="field full"><label>주소<span class="req">*</span></label><input name="address" required value="' + v("address") + '"></div>' +
      '<div class="field"><label>영업시간</label><input name="hours" value="' + v("hours") + '" placeholder="예: 매일 10:00–21:00"></div>' +
      '<div class="field"><label>전화</label><input name="phone" value="' + v("phone") + '"></div>' +
      '<div class="field full"><label>메뉴·특징</label><input name="menu" value="' + v("menu") + '"></div>' +
      '<div class="field full"><label>네이버 지도 링크</label><div class="row" style="flex-wrap:nowrap"><input name="map" value="' + v("map") + '" placeholder="https://naver.me/... 또는 지도 검색 링크"><button type="button" class="btn sm ghost" id="p-auto">자동 생성</button></div><span class="hint">네이버 지도에서 장소 > 공유 > 링크 복사한 주소를 붙여넣는 것이 가장 정확합니다.</span></div>' +
      '<div class="field full"><label>대표 사진</label><div class="pl-photo"><span class="pl-ph lg" id="p-prev">' + (p.photo ? '<img src="' + esc(photoSrc(p.photo)) + '" alt="" onerror="this.remove()">' : "") + '</span><div class="stack-sm" style="flex:1"><input name="photo" value="' + (/^data:/.test(p.photo || "") ? "(올린 사진)" : v("photo")) + '" placeholder="이미지 주소 또는 places/파일명.jpg"><input type="file" id="p-file" accept="image/*"><span class="hint">직접 찍었거나 사용 허락을 받은 사진만 올리세요. 올린 사진은 900px로 줄여 저장합니다.</span></div></div></div>' +
      '</form><div class="btn-row"><button class="btn" id="p-save">저장</button></div>',
      function () {
        var dataUrl = /^data:/.test(p.photo || "") ? p.photo : null;
        $("#p-auto").onclick = function () { var f = $("#p-form"); f.map.value = "https://map.naver.com/p/search/" + encodeURIComponent(f.name.value.trim() + " " + f.address.value.replace("경기 가평군 ", "").trim()); };
        $("#p-file").onchange = function () {
          var file = this.files[0]; if (!file) return;
          resizeImage(file, 900).then(function (u) { dataUrl = u; $("#p-form").photo.value = "(올린 사진)"; $("#p-prev").innerHTML = '<img src="' + u + '" alt="">'; }).catch(function () { toast("사진을 읽지 못했습니다."); });
        };
        $("#p-save").onclick = function () {
          var f = $("#p-form"); if (!f.reportValidity()) return;
          var o = { slug: p.slug || ("place-" + Date.now().toString(36)), name: f.name.value.trim(), type: f.type.value, station: f.station.checked, near: f.near.value.trim(), address: f.address.value.trim(), hours: f.hours.value.trim() || "방문 전 확인", menu: f.menu.value.trim(), phone: f.phone.value.trim(), map: f.map.value.trim(), photo: f.photo.value === "(올린 사진)" ? dataUrl : f.photo.value.trim() };
          if (!o.map) o.map = "https://map.naver.com/p/search/" + encodeURIComponent(o.name + " " + o.address.replace("경기 가평군 ", ""));
          if (i >= 0) D.places[i] = o; else D.places.push(o);
          closeDrawer(); savePlaces("저장했습니다.");
        };
      });
  }

  // ---------- 설정 ----------
  async function settings() {
    $("#view").innerHTML = head("설정", "데이터 백업과 배포용 파일을 관리합니다.") +
      '<div class="grid-app">' +
      '<div class="panel c6"><h2>저장 방식</h2>' + (DB.mode === "supabase"
        ? '<p>Supabase에 연결되어 있습니다. 문의·체험·리포트·정보 수정 내용이 모든 방문자에게 반영됩니다.</p>'
        : '<p><b>체험 모드</b>입니다. 데이터가 이 브라우저에만 저장되어, 다른 사람이 남긴 사전 신청은 여기서 보이지 않습니다(Netlify Forms에는 쌓입니다).</p><p class="small">실제 운영하려면 config.js에 Supabase 정보를 넣고 supabase/schema.sql을 실행하세요. 정보 수정만 쓰려면 아래 "data.js 내보내기"로 파일을 받아 교체해 배포해도 됩니다.</p>') + "</div>" +
      '<div class="panel c6"><h2>배포용 data.js 내보내기</h2><p class="small">지금 저장된 요금·주변 시설·사진 설명·샘플 리포트·공지를 반영한 data.js를 만듭니다. assets/js/data.js와 바꿔 배포하면 Supabase 없이도 모든 방문자에게 보입니다.</p><button class="btn line" id="x-datajs">data.js 내려받기</button></div>' +
      '<div class="panel c6"><h2>백업</h2><p class="small">문의·체험·리포트·정보 수정·이용자 데이터를 JSON 파일 하나로 저장합니다.</p><div class="btn-row"><button class="btn line" id="x-backup">백업 내려받기</button>' + (DB.mode === "local" ? '<label class="btn ghost">백업 불러오기<input type="file" id="x-restore" accept="application/json" hidden></label>' : "") + "</div></div>" +
      (DB.mode === "local" ? '<div class="panel c6"><h2>시연용 데이터</h2><p class="small">관리자 화면을 시연할 수 있도록 가상의 문의·체험·리포트를 넣습니다. 실제 고객 데이터가 아닙니다.</p><div class="btn-row"><button class="btn line" id="x-seed">시연용 데이터 넣기</button><button class="btn ghost danger-t" id="x-clear">관리 데이터 모두 지우기</button></div></div>' : "") +
      "</div>";
    $("#x-datajs").onclick = function () {
      var out = JSON.parse(JSON.stringify(D)); delete out.space; delete out.pkg; delete out.sec; delete out.doc;
      download("data.js", "// TreeON Office 콘텐츠 데이터 — 관리자 페이지에서 내보냄 (" + new Date().toLocaleString("ko-KR") + ")\nwindow.TREEON_DATA = " + JSON.stringify(out, null, 2) + ";\n", "text/javascript;charset=utf-8");
    };
    $("#x-backup").onclick = async function () {
      var b = { exported_at: new Date().toISOString(), mode: DB.mode, leads: await DB.list("leads"), trials: await DB.list("trials"), reports: await DB.list("reports"), content: await DB.getContent(), user_data: await DB.allUserData() };
      download("treeon_backup_" + ymd(new Date()) + ".json", JSON.stringify(b, null, 2), "application/json");
    };
    var rs = $("#x-restore");
    if (rs) rs.onchange = function () {
      var f = this.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function () {
        try {
          var b = JSON.parse(r.result);
          ["leads", "trials", "reports"].forEach(function (t) { if (Array.isArray(b[t])) T.write("treeon.db." + t, b[t]); });
          if (b.content) T.write("treeon.content.site", b.content);
          (b.user_data || []).forEach(function (u) { T.write("treeon.data." + u.email + "." + u.name, u.value); });
          toast("백업을 불러왔습니다."); setTimeout(function () { location.reload(); }, 600);
        } catch (e) { toast("백업 파일을 읽지 못했습니다."); }
      };
      r.readAsText(f);
    };
    var sd = $("#x-seed"); if (sd) sd.onclick = function () { seed().then(function () { toast("시연용 데이터를 넣었습니다."); location.hash = "#dash"; }); };
    var cl = $("#x-clear"); if (cl) cl.onclick = function () {
      if (!confirm("문의·체험·리포트·정보 수정 내용을 이 브라우저에서 모두 지울까요? 되돌릴 수 없습니다.")) return;
      ["leads", "trials", "reports"].forEach(function (t) { localStorage.removeItem("treeon.db." + t); });
      localStorage.removeItem("treeon.content.site"); toast("지웠습니다."); setTimeout(function () { location.reload(); }, 600);
    };
  }
  async function seed() {
    var days = function (n) { var d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };
    var ago = function (h) { return new Date(Date.now() - h * 3600e3).toISOString(); };
    var L = [
      { kind: "apply", status: "신규", created_at: ago(3), data: { company: "가온전자(시연)", size: "1,000인 이상", name: "이수민", role: "AX추진팀 책임", email: "sumin@example.com", phone: "010-1111-2222", purpose: "AX·DX TF, 시크릿 프로젝트", team: "7~10명", when: "2027년 2분기", package: "중기 체류형 (숙박)", security: "고객사 VPN 연동", trial: "희망", message: "6주짜리 TF인데 보안 검토를 어떻게 받는지 궁금합니다." } },
      { kind: "apply", status: "연락 완료", created_at: ago(28), data: { company: "한빛제약(시연)", size: "300~999인", name: "박지훈", role: "전략기획팀 팀장", email: "jh.park@example.com", phone: "010-3333-4444", purpose: "전략·기획 보고", team: "4~6명", when: "2027년 1분기", package: "출퇴근형", security: "트리온 보안 접속", trial: "희망", message: "" } },
      { kind: "apply", status: "체험 확정", created_at: ago(70), data: { company: "누리소프트(시연)", size: "100~299인", name: "최유진", role: "신사업TF 리더", email: "yujin@example.com", phone: "010-5555-6666", purpose: "신사업 TF, 개발 스프린트", team: "4~6명", when: "2027년 1분기", package: "중기 체류형 (숙박)", security: "고객사 VPN 연동", trial: "희망", message: "" } },
      { kind: "apply", status: "보류", created_at: ago(120), data: { company: "대한물류(시연)", size: "1,000인 이상", name: "정하늘", role: "인사팀 매니저", email: "haneul@example.com", phone: "010-7777-8888", purpose: "팀 워크숍", team: "10명 초과 (분할 이용)", when: "아직 미정", package: "아직 모름", security: "사내 확인 필요", trial: "정보만", message: "인원이 많아 분할 이용 가능한지 문의" } },
      { kind: "contact", status: "신규", created_at: ago(5), data: { company: "데모 주식회사", name: "김트리", email: "demo@treeon.kr", message: "다음 주 예약에 모니터 1대 추가가 가능할까요?", page: "이용 안내" } },
      { kind: "signup", status: "신규", created_at: ago(9), data: { company: "누리소프트(시연)", name: "최유진", dept: "신사업TF 리더", email: "yujin@example.com", phone: "010-5555-6666", marketing: "수신 동의" } }
    ];
    for (var i = 0; i < L.length; i++) await DB.insert("leads", L[i]);
    var TR = [
      { status: "요청", data: { company: "가온전자(시연)", contact: "이수민", email: "sumin@example.com", team: 8, start: "", end: "", package: "중기 체류형", memo: "보안 검토 자료 먼저 전달" } },
      { status: "일정 확정", data: { company: "한빛제약(시연)", contact: "박지훈", email: "jh.park@example.com", team: 5, start: days(9), end: days(11), package: "출퇴근형", security: "트리온 보안 접속" } },
      { status: "진행 중", data: { company: "누리소프트(시연)", contact: "최유진", email: "yujin@example.com", team: 6, start: days(-2), end: days(2), package: "중기 체류형", security: "고객사 VPN 연동" } },
      { status: "유료 전환", data: { company: "서진건설(시연)", contact: "윤가람", email: "garam@example.com", team: 6, start: days(-30), end: days(-26), package: "중기 체류형" } }
    ];
    for (var j = 0; j < TR.length; j++) await DB.insert("trials", TR[j]);
    var R = JSON.parse(JSON.stringify(DB.defaults.report)); R.company = "서진건설(시연)"; R.team = "스마트시티 제안 TF";
    await DB.insert("reports", { owner_email: "demo@treeon.kr", company: R.company, team: R.team, published: false, data: R });
  }

  // ---------- 시작 ----------
  gate().then(function (ok) { if (ok) { $("#gate").hidden = true; $("#shell").hidden = false; document.body.classList.remove("auth-pending"); route(); } });
  document.body.classList.remove("auth-pending");
})();
