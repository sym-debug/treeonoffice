// 공개 페이지(랜딩·회원가입·로그인) 스크립트
(function () {
  var T = window.TreeON, CFG = window.TREEON_CONFIG || {};
  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();

  // 스크롤 시 헤더 경계선
  var hd = document.querySelector(".site-header");
  if (hd) { var onS = function () { hd.classList.toggle("scrolled", window.scrollY > 8); }; onS(); window.addEventListener("scroll", onS, { passive: true }); }

  // 모바일 메뉴
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () { var o = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", o ? "true" : "false"); });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });
  }

  // 로그인 상태면 헤더 버튼을 "내 오피스"로
  if (T && document.querySelector("[data-auth-link]")) {
    T.Auth.current().then(function (u) {
      if (!u) return;
      document.querySelectorAll("[data-auth-link]").forEach(function (a) { a.textContent = "내 오피스"; a.href = "app/index.html"; });
      document.querySelectorAll("[data-hide-authed]").forEach(function (a) { a.hidden = true; });
    }).catch(function () {});
  }

  // 공간 투어: 도면 방 선택 → 사진 뷰어 연동
  var plan = document.querySelector(".plan");
  if (plan) {
    var cap = plan.querySelector(".plan-cap");
    var rooms = plan.querySelectorAll(".room");
    var G = (window.TREEON_DATA && TREEON_DATA.gallery) || [];
    var img = document.getElementById("tour-img"), glass = document.getElementById("glass-seg");
    function showPhoto(g, room) {
      if (!img || !g) return;
      img.src = "assets/img/a/" + g.file + ".webp"; img.alt = g.title;
      document.getElementById("tour-title").textContent = g.title;
      document.getElementById("tour-desc").textContent = g.desc;
      var n = G.filter(function (x) { return x.room === room; }).length;
      var open = document.getElementById("tour-open"), more = document.getElementById("tour-more");
      open.dataset.lightbox = more.dataset.lightbox = g.file;
      open.dataset.room = more.dataset.room = room || "";
      more.textContent = room && n ? room + " 사진 " + n + "장" : "사진 전체 보기";
    }
    function pick(r) {
      rooms.forEach(function (x) { x.classList.toggle("on", x === r); });
      cap.querySelector("b").textContent = r.dataset.name;
      cap.querySelector(".meta").textContent = r.dataset.meta;
      cap.querySelector("p").textContent = r.dataset.desc;
      var g = G.filter(function (x) { return x.room === r.dataset.name; })[0];
      showPhoto(g, r.dataset.name);
      if (glass) {
        glass.hidden = r.dataset.name !== "프로젝트룸";
        glass.querySelectorAll("button").forEach(function (b, i) { b.setAttribute("aria-pressed", i === 0 ? "false" : "false"); });
      }
    }
    rooms.forEach(function (r) {
      r.addEventListener("click", function () { pick(r); });
      r.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(r); } });
    });
    if (glass) glass.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-glass]"); if (!b) return;
      glass.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      showPhoto(G.filter(function (x) { return x.file === b.dataset.glass; })[0], "프로젝트룸");
    });
  }

  function status(el, msg, ok) { el.hidden = false; el.className = "form-status" + (ok ? " ok" : ""); el.textContent = msg; }
  function fieldsOf(form, skip) {
    var fd = new FormData(form), out = {};
    fd.forEach(function (v, k) {
      if (k === "form-name" || k === "bot-field" || (skip && skip.indexOf(k) > -1)) return;
      out[k] = out[k] ? out[k] + ", " + v : v;
    });
    return out;
  }

  // 사전 신청
  var apply = document.getElementById("apply-form");
  if (apply) {
    var st = document.getElementById("apply-status");
    apply.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!apply.reportValidity()) return;
      if (apply.querySelector("[name=bot-field]").value) return;
      var data = fieldsOf(apply);
      var b = apply.querySelector("button[type=submit]"); b.disabled = true; b.textContent = "보내는 중…";
      var DB = window.TreeON_DB;
      var saved = DB ? DB.insert("leads", { kind: "apply", status: "신규", data: data }).then(function () { return "db"; }).catch(function () { return null; }) : Promise.resolve(null);
      var sent = T.send("apply", data).then(function () { return "sent"; }).catch(function () { return null; });
      Promise.all([saved, sent]).then(function (r) { if (!r[0] && !r[1]) throw new Error("fail"); }).then(function () {
        apply.hidden = true;
        var d = document.getElementById("apply-done");
        d.hidden = false;
        d.querySelector("[data-company]").textContent = data.company;
        d.querySelector("[data-email]").textContent = data.email;
        d.scrollIntoView({ behavior: "smooth", block: "center" });
      }).catch(function () {
        status(st, "신청서를 서버로 보내지 못했습니다. 아래 버튼을 누르면 메일 앱에 신청 내용이 채워집니다.", false);
        var m = document.getElementById("apply-mail"); m.hidden = false;
        m.onclick = function () { T.mailto("[TreeON 사전 신청] " + data.company, data); };
      }).finally(function () { b.disabled = false; b.textContent = "사전 신청하기"; });
    });
  }

  // 회원가입
  var su = document.getElementById("signup-form");
  if (su) {
    var sst = document.getElementById("signup-status");
    su.addEventListener("submit", function (e) {
      e.preventDefault();
      var pw = document.getElementById("pw"), pw2 = document.getElementById("pw2");
      pw2.setCustomValidity(pw.value !== pw2.value ? "비밀번호가 서로 다릅니다." : "");
      if (!su.reportValidity()) return;
      var d = fieldsOf(su);
      var b = su.querySelector("button[type=submit]"); b.disabled = true; b.textContent = "가입하는 중…";
      T.Auth.signup({ name: d.name, company: d.company, dept: d.dept, phone: d.phone, email: d.email, password: pw.value })
        .then(function (r) {
          T.send("signup", d).catch(function () {});
          if (window.TreeON_DB) TreeON_DB.insert("leads", { kind: "signup", status: "신규", data: d }).catch(function () {});
          if (r.needsConfirm) {
            su.hidden = true; var c = document.getElementById("signup-confirm"); c.hidden = false;
            c.querySelector("[data-email]").textContent = d.email;
          } else {
            location.href = "app/index.html?welcome=1";
          }
        })
        .catch(function (err) { status(sst, err.message, false); })
        .finally(function () { b.disabled = false; b.textContent = "가입하고 시작하기"; });
    });
    var pw2el = document.getElementById("pw2");
    if (pw2el) pw2el.addEventListener("input", function () { pw2el.setCustomValidity(""); });
  }

  // 로그인
  var li = document.getElementById("login-form");
  if (li) {
    var lst = document.getElementById("login-status");
    var next = new URLSearchParams(location.search).get("next");
    var dest = next && /^app\/[a-z]+\.html$/.test(next) ? next : "app/index.html";
    var resetMode = new URLSearchParams(location.search).get("reset") === "1";
    if (resetMode && T.Auth.mode === "supabase") {
      li.hidden = true; var dv0 = document.getElementById("demo-divider"); if (dv0) dv0.hidden = true;
      var dl0 = document.getElementById("demo-login"); if (dl0) dl0.hidden = true;
      var rf = document.getElementById("reset-form"); rf.hidden = false;
      document.querySelector(".auth-card h1").textContent = "새 비밀번호 설정";
      rf.addEventListener("submit", function (e) {
        e.preventDefault();
        var a = document.getElementById("np"), b2 = document.getElementById("np2"), rs = document.getElementById("reset-status");
        b2.setCustomValidity(a.value !== b2.value ? "비밀번호가 서로 다릅니다." : "");
        if (!rf.reportValidity()) return;
        T.Auth.updatePassword(a.value).then(function () { status(rs, "비밀번호를 바꿨습니다. 잠시 뒤 이동합니다.", true); setTimeout(function () { location.href = "app/index.html"; }, 1200); })
          .catch(function (err) { status(rs, err.message, false); });
      });
      document.getElementById("np2").addEventListener("input", function () { this.setCustomValidity(""); });
    } else {
      T.Auth.current().then(function (u) { if (u) location.replace(dest); }).catch(function () {});
    }
    li.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!li.reportValidity()) return;
      var b = li.querySelector("button[type=submit]"); b.disabled = true; b.textContent = "로그인하는 중…";
      T.Auth.login(li.email.value, li.password.value)
        .then(function () { location.href = dest; })
        .catch(function (err) { status(lst, err.message, false); })
        .finally(function () { b.disabled = false; b.textContent = "로그인"; });
    });
    var demo = document.getElementById("demo-login");
    if (demo) {
      if (!CFG.SHOW_DEMO_LOGIN || T.Auth.mode !== "local") { demo.hidden = true; var dv = document.getElementById("demo-divider"); if (dv) dv.hidden = true; }
      demo.addEventListener("click", function () { T.Auth.demoLogin().then(function () { location.href = "app/index.html?welcome=1"; }); });
    }
    var fp = document.getElementById("forgot");
    if (fp) fp.addEventListener("click", function (e) {
      e.preventDefault();
      if (!li.email.value) { status(lst, "이메일을 입력한 뒤 다시 누르세요.", false); li.email.focus(); return; }
      T.Auth.resetPassword(li.email.value).then(function () { status(lst, "비밀번호 재설정 메일을 보냈습니다. 받은편지함을 확인하세요.", true); })
        .catch(function (err) { status(lst, err.message, false); });
    });
  }
})();
