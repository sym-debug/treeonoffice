// 공간 사진 갤러리 + 라이트박스 (공개 페이지·앱 공용)
// 사용: <button data-lightbox="파일명">  또는 TreeON_Gallery.open("파일명", "방 이름")
(function () {
  var D = window.TREEON_DATA; if (!D || !D.gallery) return;
  var base = document.querySelector('meta[name="img-base"]');
  var B = (base ? base.content : "assets/img/") + "a/";
  var G = D.gallery, list = G, idx = 0, dlg;

  function src(f, thumb) { return B + f + (thumb ? "-t" : "") + ".webp"; }
  function build() {
    dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.setAttribute("aria-label", "공간 사진");
    dlg.innerHTML = '<div class="lb-top"><span class="lb-count num"></span><button type="button" class="lb-x" aria-label="닫기">×</button></div>' +
      '<figure class="lb-fig"><img alt=""><figcaption><b></b><span></span></figcaption></figure>' +
      '<button type="button" class="lb-nav prev" aria-label="이전 사진">‹</button><button type="button" class="lb-nav next" aria-label="다음 사진">›</button>' +
      '<div class="lb-strip"></div><p class="lb-note"></p>';
    document.body.appendChild(dlg);
    dlg.querySelector(".lb-x").onclick = close;
    dlg.querySelector(".prev").onclick = function () { go(-1); };
    dlg.querySelector(".next").onclick = function () { go(1); };
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); var t = e.target.closest("[data-i]"); if (t) { idx = +t.dataset.i; show(); } });
    dlg.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); });
    var sx = null;
    dlg.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener("touchend", function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); sx = null; });
    dlg.querySelector(".lb-note").textContent = D.galleryNote || "";
  }
  function show() {
    var g = list[idx];
    var img = dlg.querySelector(".lb-fig img"); img.src = src(g.file); img.alt = g.title;
    dlg.querySelector("figcaption b").textContent = g.title;
    dlg.querySelector("figcaption span").textContent = g.desc;
    dlg.querySelector(".lb-count").textContent = (idx + 1) + " / " + list.length + (list !== G ? " · " + g.room : "");
    dlg.querySelector(".lb-strip").innerHTML = list.map(function (x, i) {
      return '<button type="button" data-i="' + i + '"' + (i === idx ? ' aria-current="true"' : "") + ' aria-label="' + x.title + '"><img src="' + src(x.file, true) + '" alt="" loading="lazy"></button>';
    }).join("");
    var cur = dlg.querySelector('.lb-strip [aria-current]'); if (cur) cur.scrollIntoView({ block: "nearest", inline: "center" });
  }
  function go(d) { idx = (idx + d + list.length) % list.length; show(); }
  function open(file, room) {
    if (!dlg) build();
    list = room ? G.filter(function (g) { return g.room === room; }) : G;
    if (!list.length) list = G;
    idx = Math.max(0, list.findIndex(function (g) { return g.file === file; }));
    show();
    dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", "");
    document.body.style.overflow = "hidden";
  }
  function close() { dlg.close ? dlg.close() : dlg.removeAttribute("open"); document.body.style.overflow = ""; }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-lightbox]"); if (!t) return;
    e.preventDefault(); open(t.dataset.lightbox, t.dataset.room || "");
  });
  document.addEventListener("close", function (e) { if (e.target === dlg) document.body.style.overflow = ""; }, true);

  // [data-gallery-grid] 에 썸네일 그리드 렌더
  document.querySelectorAll("[data-gallery-grid]").forEach(function (el) {
    var room = el.dataset.galleryGrid;
    var items = room ? G.filter(function (g) { return g.room === room; }) : G;
    el.innerHTML = items.map(function (g) {
      return '<button type="button" class="gthumb" data-lightbox="' + g.file + '" data-room="' + (room || "") + '"><img src="' + src(g.file, true) + '" alt="' + g.title + '" loading="lazy" width="560" height="315"><span>' + g.title + "</span></button>";
    }).join("");
  });

  window.TreeON_Gallery = { open: open, src: src, items: G };
})();
