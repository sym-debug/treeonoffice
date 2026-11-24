// 데이터 계층 — 문의·체험·리포트·콘텐츠·이용자 데이터
//  - Supabase 미설정: 이 브라우저(localStorage)에 저장 (체험·시연용)
//  - Supabase 설정: supabase/schema.sql 의 테이블에 저장 (실서비스)
// 콘텐츠(요금·주변 시설·공지·연락처·사진 설명·샘플 리포트)는 관리자가 수정하면
// data.js 기본값 위에 덮어써져 공개 페이지와 앱에 바로 반영됩니다.
(function () {
  var T = window.TreeON, D = window.TREEON_DATA, CFG = window.TREEON_CONFIG || {};
  var SB = !!T.useSB;
  var CKEY = "treeon.content.site";

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); });
  }
  function now() { return new Date().toISOString(); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function lk(t) { return "treeon.db." + t; }

  // ---------- 로컬 저장소 ----------
  var Local = {
    list: function (t) { return Promise.resolve(T.read(lk(t), [])); },
    insert: function (t, row) {
      var a = T.read(lk(t), []); var r = Object.assign({ id: uid(), created_at: now() }, row);
      a.unshift(r); T.write(lk(t), a); return Promise.resolve(r);
    },
    update: function (t, id, patch) {
      var a = T.read(lk(t), []), out = null;
      a = a.map(function (x) { if (x.id === id) { out = Object.assign({}, x, patch, { updated_at: now() }); return out; } return x; });
      T.write(lk(t), a); return Promise.resolve(out);
    },
    remove: function (t, id) { T.write(lk(t), T.read(lk(t), []).filter(function (x) { return x.id !== id; })); return Promise.resolve(true); },
    getContent: function () { return Promise.resolve(T.read(CKEY, null)); },
    setContent: function (v) { T.write(CKEY, v); return Promise.resolve(v); },
    allUserData: function () {
      var out = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k.indexOf("treeon.data.") !== 0) continue;
        var rest = k.slice(12), dot = rest.lastIndexOf(".");
        out.push({ email: rest.slice(0, dot), name: rest.slice(dot + 1), value: T.read(k, null) });
      }
      return Promise.resolve(out);
    },
    setUserData: function (email, name, value) { T.write("treeon.data." + email + "." + name, value); return Promise.resolve(true); },
    members: function () {
      var u = T.read("treeon.users", {});
      return Promise.resolve(Object.keys(u).map(function (e) { var x = u[e]; return { email: e, name: x.name, company: x.company, dept: x.dept, phone: x.phone, created_at: x.createdAt, demo: !!x.demo }; }));
    },
    myReport: function (email) {
      var r = T.read(lk("reports"), []).filter(function (x) { return x.published && (x.owner_email || "").toLowerCase() === email.toLowerCase(); });
      return Promise.resolve(r[0] || null);
    }
  };

  // ---------- Supabase ----------
  function sb() { return T.sb(); }
  function chk(r) { if (r.error) throw new Error(r.error.message); return r.data; }
  var Remote = {
    list: function (t) { return sb().then(function (c) { return c.from(t).select("*").order("created_at", { ascending: false }).limit(1000); }).then(chk); },
    insert: function (t, row) {
      var r = Object.assign({ id: uid(), created_at: now() }, row);
      return sb().then(function (c) { return c.from(t).insert(r); }).then(chk).then(function () { return r; });
    },
    update: function (t, id, patch) {
      var p = Object.assign({}, patch, { updated_at: now() });
      return sb().then(function (c) { return c.from(t).update(p).eq("id", id).select().single(); }).then(chk);
    },
    remove: function (t, id) { return sb().then(function (c) { return c.from(t).delete().eq("id", id); }).then(chk).then(function () { return true; }); },
    getContent: function () {
      return sb().then(function (c) { return c.from("content").select("value").eq("key", "site").maybeSingle(); })
        .then(chk).then(function (d) { return d ? d.value : null; });
    },
    setContent: function (v) {
      return sb().then(function (c) { return c.from("content").upsert({ key: "site", value: v, updated_at: now() }); }).then(chk).then(function () { T.write(CKEY, v); return v; });
    },
    allUserData: function () { return sb().then(function (c) { return c.from("user_data").select("*"); }).then(chk); },
    setUserData: function (email, name, value) {
      return sb().then(function (c) { return c.from("user_data").upsert({ email: email, name: name, value: value, updated_at: now() }); }).then(chk);
    },
    members: function () {
      return Remote.list("leads").then(function (rows) {
        return rows.filter(function (r) { return r.kind === "signup"; }).map(function (r) { var d = r.data || {}; return { email: d.email, name: d.name, company: d.company, dept: d.dept, phone: d.phone, created_at: r.created_at }; });
      });
    },
    myReport: function (email) {
      return sb().then(function (c) { return c.from("reports").select("*").eq("owner_email", email).eq("published", true).limit(1); })
        .then(chk).then(function (d) { return d[0] || null; });
    },
    pullUserData: function (email) {
      return sb().then(function (c) { return c.from("user_data").select("name,value").eq("email", email); }).then(chk)
        .then(function (rows) { rows.forEach(function (r) { T.write("treeon.data." + email + "." + r.name, r.value); }); });
    }
  };

  var B = SB ? Remote : Local;

  // 이용자 데이터: 로컬에 즉시 쓰고, Supabase 모드면 서버에도 올림
  if (SB) {
    var origSet = T.Store.set;
    T.Store.set = function (email, name, val) {
      var ok = origSet(email, name, val);
      Remote.setUserData(email, name, val).catch(function (e) { console.warn("동기화 실패", e); });
      return ok;
    };
  }

  // ---------- 콘텐츠 덮어쓰기 ----------
  var DEFAULTS = clone({ packages: D.packages, places: D.places, gallery: D.gallery, report: D.report, contact: CFG.CONTACT_EMAIL });
  function applyContent(c) {
    if (!c) return;
    if (c.packages) c.packages.forEach(function (p) {
      var t = D.packages.filter(function (x) { return x.id === p.id; })[0];
      if (t) { if (p.name) t.name = p.name; if (p.desc) t.desc = p.desc; if (p.price) t.price.A = +p.price; }
    });
    if (Array.isArray(c.places)) D.places = c.places;
    if (c.gallery) D.gallery.forEach(function (g) { var o = c.gallery[g.file]; if (o) { if (o.title) g.title = o.title; if (o.desc) g.desc = o.desc; } });
    if (c.report) D.report = c.report;
    if (c.notice) D.notice = c.notice;
    if (c.contact) CFG.CONTACT_EMAIL = c.contact;
    if (typeof c.demoLogin === "boolean") CFG.SHOW_DEMO_LOGIN = c.demoLogin;
  }
  function fmt(n) { return Number(n).toLocaleString("ko-KR"); }
  function man(n) { return Math.round(n / 10000); }
  function bind() {
    var prices = D.packages.map(function (p) { return p.price.A; });
    document.querySelectorAll("[data-price]").forEach(function (el) {
      var p = D.packages.filter(function (x) { return x.id === el.dataset.price; })[0]; if (p) el.textContent = fmt(p.price.A);
    });
    document.querySelectorAll("[data-pkg-name]").forEach(function (el) { var p = D.packages.filter(function (x) { return x.id === el.dataset.pkgName; })[0]; if (p) el.textContent = p.name; });
    document.querySelectorAll("[data-min-price]").forEach(function (el) { el.textContent = man(Math.min.apply(null, prices)) + "만원~"; });
    document.querySelectorAll("[data-price-range]").forEach(function (el) { el.textContent = "팀 1일 " + man(Math.min.apply(null, prices)) + "만~" + man(Math.max.apply(null, prices)) + "만원"; });
    document.querySelectorAll("[data-contact-mail]").forEach(function (el) { el.href = "mailto:" + CFG.CONTACT_EMAIL; el.textContent = CFG.CONTACT_EMAIL; });
  }
  applyContent(T.read(CKEY, null));
  var ready = (SB ? Remote.getContent().then(function (c) { if (c) { T.write(CKEY, c); applyContent(c); } }).catch(function () {}) : Promise.resolve());
  ready = ready.then(function () {
    if (document.readyState === "loading") return new Promise(function (r) { document.addEventListener("DOMContentLoaded", function () { bind(); r(); }); });
    bind();
  });

  window.TreeON_DB = {
    mode: SB ? "supabase" : "local",
    uid: uid,
    ready: ready,
    list: function (t) { return B.list(t); },
    insert: function (t, row) { return B.insert(t, row); },
    update: function (t, id, p) { return B.update(t, id, p); },
    remove: function (t, id) { return B.remove(t, id); },
    getContent: function () { return B.getContent().then(function (c) { return c || {}; }); },
    setContent: function (v) { return B.setContent(v).then(function (r) { applyContent(v); return r; }); },
    defaults: DEFAULTS,
    allUserData: function () { return B.allUserData(); },
    setUserData: function (e, n, v) { return B.setUserData(e, n, v); },
    members: function () { return B.members(); },
    myReport: function (email) { return B.myReport(email); },
    pullUserData: function (email) { return SB ? Remote.pullUserData(email) : Promise.resolve(); },
    bind: bind
  };
})();
