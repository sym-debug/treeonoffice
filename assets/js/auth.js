// 인증 + 저장소 공용 모듈
// - Supabase 설정이 없으면 "체험 모드": 회원 정보와 세션을 이 브라우저의 localStorage 에 저장합니다.
// - config.js 에 SUPABASE_URL / SUPABASE_ANON_KEY 를 넣으면 Supabase Auth 로 실제 회원가입·로그인합니다.
// - 예약·근태·서류 신청 데이터는 두 모드 모두 이용자별로 localStorage 에 저장합니다(시장검증용 MVP).
(function () {
  var CFG = window.TREEON_CONFIG || {};
  var USE_SB = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
  var K_USERS = "treeon.users", K_SESSION = "treeon.session";
  var sbClient = null, sbLoading = null;

  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }

  async function hash(text) {
    try {
      if (window.crypto && crypto.subtle) {
        var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      }
    } catch (e) {}
    var h = 0; for (var i = 0; i < text.length; i++) { h = (h * 31 + text.charCodeAt(i)) | 0; } return "h" + h;
  }

  function loadSupabase() {
    if (sbClient) return Promise.resolve(sbClient);
    if (sbLoading) return sbLoading;
    sbLoading = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload = function () { sbClient = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY); resolve(sbClient); };
      s.onerror = function () { reject(new Error("로그인 서버에 연결하지 못했습니다. 잠시 뒤 다시 시도하세요.")); };
      document.head.appendChild(s);
    });
    return sbLoading;
  }

  function fromSbUser(u) {
    if (!u) return null;
    var m = u.user_metadata || {};
    return { email: u.email, name: m.name || u.email.split("@")[0], company: m.company || "", dept: m.dept || "", phone: m.phone || "", createdAt: u.created_at };
  }

  var Auth = {
    mode: USE_SB ? "supabase" : "local",

    current: async function () {
      if (USE_SB) {
        var sb = await loadSupabase();
        var r = await sb.auth.getSession();
        return fromSbUser(r.data.session && r.data.session.user);
      }
      var s = read(K_SESSION, null);
      if (!s) return null;
      var users = read(K_USERS, {});
      var u = users[s.email];
      if (!u) return null;
      return { email: s.email, name: u.name, company: u.company, dept: u.dept, phone: u.phone, createdAt: u.createdAt, demo: !!u.demo };
    },

    signup: async function (p) {
      var email = p.email.trim().toLowerCase();
      if (USE_SB) {
        var sb = await loadSupabase();
        var r = await sb.auth.signUp({ email: email, password: p.password,
          options: { data: { name: p.name, company: p.company, dept: p.dept, phone: p.phone },
                     emailRedirectTo: location.origin + location.pathname.replace(/[^/]*$/, "") + "login.html" } });
        if (r.error) throw new Error(r.error.message.indexOf("registered") > -1 ? "이미 가입된 이메일입니다. 로그인하세요." : r.error.message);
        return { needsConfirm: !r.data.session };
      }
      var users = read(K_USERS, {});
      if (users[email] && !users[email].demo) throw new Error("이미 가입된 이메일입니다. 로그인하세요.");
      users[email] = { name: p.name, company: p.company, dept: p.dept, phone: p.phone, hash: await hash(email + ":" + p.password), createdAt: new Date().toISOString() };
      if (!write(K_USERS, users)) throw new Error("이 브라우저에서는 저장할 수 없습니다. 시크릿 모드를 끄고 다시 시도하세요.");
      write(K_SESSION, { email: email });
      return { needsConfirm: false };
    },

    login: async function (email, password) {
      email = email.trim().toLowerCase();
      if (USE_SB) {
        var sb = await loadSupabase();
        var r = await sb.auth.signInWithPassword({ email: email, password: password });
        if (r.error) throw new Error(r.error.message.indexOf("confirm") > -1 ? "이메일 인증을 먼저 완료하세요. 받은편지함을 확인하세요." : "이메일 또는 비밀번호가 맞지 않습니다.");
        return true;
      }
      var users = read(K_USERS, {});
      var u = users[email];
      if (!u || u.hash !== await hash(email + ":" + password)) throw new Error("이메일 또는 비밀번호가 맞지 않습니다.");
      write(K_SESSION, { email: email });
      return true;
    },

    demoLogin: async function () {
      var email = "demo@treeon.kr";
      var users = read(K_USERS, {});
      users[email] = { name: "김트리", company: "데모 주식회사", dept: "신사업전략팀 · 팀장", phone: "010-0000-0000", hash: "demo", demo: true, createdAt: new Date().toISOString() };
      write(K_USERS, users);
      write(K_SESSION, { email: email });
      return true;
    },

    resetPassword: async function (email) {
      if (!USE_SB) throw new Error("체험 모드에서는 비밀번호 찾기를 쓸 수 없습니다. 새로 가입하거나 데모 계정으로 둘러보세요.");
      var sb = await loadSupabase();
      var r = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: location.origin + location.pathname + "?reset=1" });
      if (r.error) throw new Error(r.error.message);
      return true;
    },

    // 비밀번호 재설정 메일의 링크로 돌아온 뒤 새 비밀번호 저장
    updatePassword: async function (pw) {
      if (!USE_SB) throw new Error("체험 모드에서는 쓸 수 없습니다.");
      var sb = await loadSupabase();
      var s = await sb.auth.getSession();
      if (!s.data.session) throw new Error("재설정 링크가 만료되었습니다. 비밀번호 찾기를 다시 눌러 새 메일을 받으세요.");
      var r = await sb.auth.updateUser({ password: pw });
      if (r.error) throw new Error(r.error.message);
      return true;
    },

    logout: async function () {
      if (USE_SB) { var sb = await loadSupabase(); await sb.auth.signOut(); }
      localStorage.removeItem(K_SESSION);
    },

    // 로그인 필요한 페이지: 비로그인 시 login.html 로 보냄
    guard: async function (loginPath) {
      var u = null;
      try { u = await Auth.current(); } catch (e) {}
      if (!u) {
        location.replace(loginPath + "?next=" + encodeURIComponent(location.pathname.split("/").slice(-2).join("/")));
        return null;
      }
      return u;
    }
  };

  // 이용자별 데이터 저장소
  var Store = {
    _key: function (email, name) { return "treeon.data." + email + "." + name; },
    get: function (email, name, fallback) { return read(Store._key(email, name), fallback); },
    set: function (email, name, val) { return write(Store._key(email, name), val); }
  };

  // 리드 전송 (사전 신청, 회원가입) — config.js FORM_MODE 따름
  function send(formName, fields) {
    var mode = CFG.FORM_MODE || "netlify";
    var log = read("treeon.leads", []); log.push({ form: formName, at: new Date().toISOString(), fields: fields }); write("treeon.leads", log.slice(-50));
    if (mode === "formspree" && CFG.FORMSPREE_ENDPOINT) {
      var fd = new FormData(); fd.append("_form", formName); Object.keys(fields).forEach(function (k) { fd.append(k, fields[k]); });
      return fetch(CFG.FORMSPREE_ENDPOINT, { method: "POST", body: fd, headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error("send"); return "sent"; });
    }
    if (mode === "none") return Promise.reject(new Error("none"));
    if (mode === "netlify") {
      var body = new URLSearchParams(); body.append("form-name", formName);
      Object.keys(fields).forEach(function (k) { body.append(k, fields[k]); });
      if (location.protocol === "file:") return Promise.reject(new Error("local"));
      return fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
        .then(function (r) { if (!r.ok) throw new Error("send"); return "sent"; });
    }
    return Promise.reject(new Error("email"));
  }
  function mailto(subject, fields) {
    var lines = Object.keys(fields).map(function (k) { return k + ": " + fields[k]; }).join("\n");
    location.href = "mailto:" + (CFG.CONTACT_EMAIL || "") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines);
  }

  function toast(msg) {
    var t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("on"); }, 2600);
  }

  window.TreeON = { Auth: Auth, Store: Store, send: send, mailto: mailto, toast: toast, read: read, write: write, sb: loadSupabase, useSB: USE_SB };
})();
