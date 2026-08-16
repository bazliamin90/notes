(function () {
  "use strict";

  // ---- Registry of all pages in the navigation menu, grouped into sections ----
  // To add a new page: add one entry to the right group (or a new group), and
  // nothing else needs to change in the other HTML files. The new HTML file
  // itself still needs the burger button + empty #navMenu container markup,
  // and a <script src="nav.js"></script> tag before </body>.
  var HOME = { href: "index.html", page: "home", title: "Home" };

  var GROUPS = [
    {
      section: "012. Yūsuf",
      items: [
        { href: "yusuf-musa-parallels.html", page: "yusufmusa",       color: "var(--c-5)", title: "Yūsuf &amp; Mūsā — Parallels", sub: "Nouman Ali Khan" },
        { href: "yusuf-77.html",             page: "painlikenoother", color: "var(--c-6)", title: "A Pain Like No Other",         sub: "Sūrah Yūsuf, Āyah 77 · Nouman Ali Khan" },
        { href: "surah-yusuf-78-79.html",    page: "yusuf7879",       color: "var(--c-2)", title: "Please Show Mercy",            sub: "Sūrah Yūsuf, Āyāt 78–79 · Nouman Ali Khan" },
        { href: "surah-yusuf-80-82.html",    page: "yusuf8082",       color: "var(--c-1)", title: "A Flicker of Light",           sub: "Sūrah Yūsuf, Āyāt 80–82 · Nouman Ali Khan" },
        { href: "part-83.html",              page: "yusuf83",         color: "var(--c-4)", title: "Beautiful Patience Again?",    sub: "Sūrah Yūsuf, Āyah 83 · Nouman Ali Khan" }
      ]
    },
    {
      section: "079. An-Nāzi'āt",
      items: [
        { href: "noumanalikhan.html", page: "noumanalikhan", color: "var(--c-1)", title: "Tafsir An-Nāzi'āt : 1–18", sub: "Nouman Ali Khan" },
        { href: "timhumble.html",     page: "timhumble",     color: "var(--c-4)", title: "Tafsir An-Nāzi'āt : 1–14", sub: "Muhammad Tim Humble" }
      ]
    },
    {
      section: "Stories",
      items: [
        { href: "abu-mihjan-story.html", page: "abumihjan", color: "var(--c-3)", title: "The Story of Abū Miḥjan", sub: "Reference page" }
      ]
    }
  ];

  document.addEventListener("DOMContentLoaded", function () {
    var burger = document.getElementById("navBurger");
    var menu = document.getElementById("navMenu");
    if (!burger || !menu) return;

    var current = document.body.getAttribute("data-page");

    // Strip diacritics/accents so searches like "yusuf" match "Yūsuf",
    // "naziat" matches "Nāzi'āt", etc. Also strips the ʿ/ʾ/' style marks.
    function normalize(str) {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")   // combining accents (ū -> u, ā -> a, etc.)
        .replace(/[ʿʾ'’]/g, "")            // ayn/hamza glyphs and apostrophes
        .toLowerCase();
    }

    // ---- Build static shell: pinned Home + search box + scrollable group list ----
    var isHome = current === HOME.page;
    menu.innerHTML =
      '<a class="burger-menu-home' + (isHome ? ' is-current' : '') + '" href="' + HOME.href + '" data-page="' + HOME.page + '"' + (isHome ? ' aria-current="page"' : '') + '>' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9.5a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>' +
        '<span class="bm-title">' + HOME.title + '</span>' +
      '</a>' +
      '<div class="burger-menu-search">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
        '<input id="navSearchInput" type="text" placeholder="Search pages…" autocomplete="off">' +
      '</div>' +
      '<div class="burger-menu-list" id="navMenuList"></div>' +
      '<div class="burger-menu-empty" id="navMenuEmpty">No pages match your search.</div>';

    var homeLink = menu.querySelector(".burger-menu-home");
    if (homeLink) {
      if (isHome) {
        homeLink.addEventListener("click", function (e) { e.preventDefault(); });
      } else {
        homeLink.addEventListener("click", function () { closeMenu(); });
      }
    }

    var listEl = menu.querySelector("#navMenuList");
    var emptyEl = menu.querySelector("#navMenuEmpty");
    var searchInput = menu.querySelector("#navSearchInput");

    function itemHTML(p) {
      var isCurrent = p.page === current;
      return (
        '<a class="burger-menu-item' + (isCurrent ? ' is-current' : '') + '"' +
        ' href="' + p.href + '" data-page="' + p.page + '"' +
        ' data-search="' + normalize(p.title + " " + p.sub) + '"' +
        (isCurrent ? ' aria-current="page"' : '') + '>' +
          '<span class="burger-menu-dot" style="background:' + p.color + '"></span>' +
          '<span>' +
            '<span class="bm-title">' + p.title + '</span>' +
            '<span class="bm-sub">' + p.sub + '</span>' +
          '</span>' +
        '</a>'
      );
    }

    // Render all groups
    var groupsHTML = "";
    GROUPS.forEach(function (g, gi) {
      groupsHTML +=
        '<div class="burger-menu-group" data-group="' + gi + '">' +
          '<div class="burger-menu-label">' + g.section + '</div>' +
          g.items.map(itemHTML).join("") +
        '</div>';
    });
    listEl.innerHTML = groupsHTML;

    // Wire up link clicks (current page link is inert)
    function wireLinks() {
      listEl.querySelectorAll("a").forEach(function (a) {
        if (a.classList.contains("is-current")) {
          a.addEventListener("click", function (e) { e.preventDefault(); });
        } else {
          a.addEventListener("click", function () { closeMenu(); });
        }
      });
    }
    wireLinks();

    // ---- Search filtering ----
    function applyFilter() {
      var q = normalize(searchInput.value.trim());
      var anyVisible = false;

      listEl.querySelectorAll(".burger-menu-group").forEach(function (groupEl) {
        var groupHasMatch = false;
        groupEl.querySelectorAll("a.burger-menu-item").forEach(function (a) {
          var match = q === "" || a.getAttribute("data-search").indexOf(q) !== -1;
          a.style.display = match ? "" : "none";
          if (match) groupHasMatch = true;
        });
        groupEl.style.display = groupHasMatch ? "" : "none";
        if (groupHasMatch) anyVisible = true;
      });

      emptyEl.style.display = anyVisible ? "none" : "block";
    }
    searchInput.addEventListener("input", applyFilter);
    searchInput.addEventListener("click", function (e) { e.stopPropagation(); });

    // ---- Open / close ----
    function openMenu() {
      menu.classList.add("open");
      burger.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
      searchInput.value = "";
      applyFilter();
      setTimeout(function () { searchInput.focus(); }, 50);
    }
    function closeMenu() {
      menu.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
    function toggleMenu() {
      menu.classList.contains("open") ? closeMenu() : openMenu();
    }

    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    document.addEventListener("click", function (e) {
      if (menu.classList.contains("open") && !menu.contains(e.target) && !burger.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  });
})();
