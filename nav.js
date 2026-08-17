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
        { href: "part-83.html",              page: "yusuf83",         color: "var(--c-4)", title: "Beautiful Patience Again?",    sub: "Sūrah Yūsuf, Āyah 83 · Nouman Ali Khan" },
        { href: "part-84.html",              page: "yusuf84",         color: "var(--c-6)", title: "Is His Heart Hopeful or Devastated?", sub: "Sūrah Yūsuf, Āyah 84 · Nouman Ali Khan" },
        { href: "surah-yusuf-85.html",        page: "yusuf85",         color: "var(--c-5)", title: "\"You Will Not Stop Mentioning Yusuf\"", sub: "Sūrah Yūsuf, Āyah 85 · Nouman Ali Khan" }
      ]
    },
    {
      section: "079. An-Nāzi'āt",
      items: [
        { href: "noumanalikhan.html",   page: "noumanalikhan", color: "var(--c-1)", title: "Tafsir An-Nāzi'āt : 1–18",           sub: "Nouman Ali Khan" },
        { href: "an-naziat-15-46.html", page: "naziat1546",    color: "var(--c-2)", title: "Mūsā, Firʿawn &amp; the Two Abodes", sub: "Sūrah An-Nāzi'āt, Āyāt 15–46 · Nouman Ali Khan" },
        { href: "timhumble.html",       page: "timhumble",     color: "var(--c-4)", title: "Tafsir An-Nāzi'āt : 1–14",           sub: "Muhammad Tim Humble" }
      ]
    },
    {
      section: "114. An-Nās",
      items: [
        { href: "surah-an-naas.html", page: "annaas", color: "var(--c-5)", title: "Say, I Seek Refuge", sub: "Sūrah An-Nās · Nouman Ali Khan" }
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

    // =========================================================================
    // ---- Highlighter tool: button next to the burger, color picker, ----
    // ---- localStorage-backed persistence, and highlight deletion.      ----
    // =========================================================================
    (function initHighlighter() {
      var HL_COLORS = [
        { name: "Yellow", value: "rgba(255, 224, 102, 0.55)" },
        { name: "Green",  value: "rgba(140, 233, 154, 0.55)" },
        { name: "Blue",   value: "rgba(116, 192, 252, 0.55)" },
        { name: "Pink",   value: "rgba(250, 162, 193, 0.55)" },
        { name: "Orange", value: "rgba(255, 192, 120, 0.55)" },
        { name: "Purple", value: "rgba(208, 152, 255, 0.55)" }
      ];
      var STORAGE_PREFIX = "navHighlights:";
      var EXCLUDE_IDS = ["navMenu", "navBurger", "navHighlightBtn", "navHighlightPopover"];

      // ---- Inject styles once ----
      if (!document.getElementById("navHighlightStyle")) {
        var style = document.createElement("style");
        style.id = "navHighlightStyle";
        style.textContent =
          "#navHighlightBtn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;margin-left:6px;border:none;background:transparent;color:inherit;border-radius:8px;cursor:pointer;transition:background .15s ease;}" +
          "#navHighlightBtn:hover{background:rgba(128,128,128,.15);}" +
          "#navHighlightBtn.active{background:rgba(128,128,128,.28);}" +
          "#navHighlightBtn svg{display:block;}" +
          "#navHighlightPopover{position:fixed;z-index:10000;display:none;flex-direction:column;gap:8px;padding:10px;min-width:210px;background:var(--bm-bg,#fff);color:var(--bm-fg,#1a1a1a);border:1px solid rgba(128,128,128,.25);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);}" +
          "#navHighlightPopover.open{display:flex;}" +
          ".nav-hl-label{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;opacity:.6;margin:2px 0 0;}" +
          ".nav-hl-swatches{display:flex;gap:6px;flex-wrap:wrap;}" +
          ".nav-hl-swatch{width:26px;height:26px;border-radius:50%;border:2px solid rgba(0,0,0,.08);cursor:pointer;padding:0;}" +
          ".nav-hl-swatch.selected{border-color:currentColor;}" +
          ".nav-hl-swatch:hover{transform:scale(1.1);}" +
          ".nav-hl-row{display:flex;gap:6px;}" +
          ".nav-hl-eraser,.nav-hl-clear{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12.5px;padding:6px 8px;border-radius:6px;border:1px solid rgba(128,128,128,.25);background:transparent;color:inherit;cursor:pointer;}" +
          ".nav-hl-eraser.active{background:rgba(224,49,49,.15);border-color:rgba(224,49,49,.4);}" +
          ".nav-hl-eraser:hover,.nav-hl-clear:hover{background:rgba(128,128,128,.1);}" +
          "mark.nav-highlight{color:inherit;border-radius:2px;padding:0 1px;}" +
          "body.nav-highlighting-armed{cursor:text;}" +
          "body.nav-erasing-armed mark.nav-highlight{cursor:pointer;}" +
          "body.nav-erasing-armed mark.nav-highlight:hover{outline:2px dashed #e03131;outline-offset:1px;}";
        document.head.appendChild(style);
      }

      // ---- Build button (placed right next to the burger) ----
      var hlBtn = document.createElement("button");
      hlBtn.id = "navHighlightBtn";
      hlBtn.type = "button";
      hlBtn.setAttribute("aria-label", "Highlight text");
      hlBtn.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="m9 11-6 6v3h3l6-6"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-4.2-4.2a2 2 0 0 1 0-2.8L15 5"/>' +
        '</svg>';
      burger.insertAdjacentElement("afterend", hlBtn);

      // ---- Build popover ----
      var popover = document.createElement("div");
      popover.id = "navHighlightPopover";
      var swatchesHTML = HL_COLORS.map(function (c) {
        return '<button type="button" class="nav-hl-swatch" data-color="' + c.value + '" style="background:' + c.value + '" title="' + c.name + '" aria-label="Highlight in ' + c.name + '"></button>';
      }).join("");
      popover.innerHTML =
        '<div class="nav-hl-label">Highlight color</div>' +
        '<div class="nav-hl-swatches">' + swatchesHTML + '</div>' +
        '<div class="nav-hl-row">' +
          '<button type="button" class="nav-hl-eraser">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>' +
            'Erase' +
          '</button>' +
          '<button type="button" class="nav-hl-clear">Clear all</button>' +
        '</div>';
      document.body.appendChild(popover);

      var mode = null; // null | "highlight" | "erase"
      var activeColor = HL_COLORS[0].value;

      function isExcluded(node) {
        var el = node.nodeType === 3 ? node.parentElement : node;
        while (el) {
          if (el.id && EXCLUDE_IDS.indexOf(el.id) !== -1) return true;
          if (el.tagName === "SCRIPT" || el.tagName === "STYLE") return true;
          el = el.parentElement;
        }
        return false;
      }

      function createFilteredWalker() {
        return document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
          acceptNode: function (n) { return isExcluded(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
        });
      }

      function firstTextNode(n) {
        if (n.nodeType === 3) return n.nodeValue.length ? n : null;
        if (n.nodeType === 1) {
          for (var i = 0; i < n.childNodes.length; i++) {
            var f = firstTextNode(n.childNodes[i]);
            if (f) return f;
          }
        }
        return null;
      }
      function lastTextNode(n) {
        if (n.nodeType === 3) return n.nodeValue.length ? n : null;
        if (n.nodeType === 1) {
          for (var i = n.childNodes.length - 1; i >= 0; i--) {
            var f = lastTextNode(n.childNodes[i]);
            if (f) return f;
          }
        }
        return null;
      }
      function normalizeBoundary(container, offset, isStart) {
        if (container.nodeType === 3) return { node: container, offset: offset };
        var children = container.childNodes;
        if (isStart) {
          for (var i = offset; i < children.length; i++) {
            var f = firstTextNode(children[i]);
            if (f) return { node: f, offset: 0 };
          }
        } else {
          for (var j = offset - 1; j >= 0; j--) {
            var g = lastTextNode(children[j]);
            if (g) return { node: g, offset: g.nodeValue.length };
          }
        }
        return null;
      }
      function offsetOfTextNode(targetNode, localOffset) {
        var walker = createFilteredWalker();
        var pos = 0, node;
        while ((node = walker.nextNode())) {
          if (node === targetNode) return pos + localOffset;
          pos += node.nodeValue.length;
        }
        return null;
      }
      function getSelectionOffsets(range) {
        var startB = normalizeBoundary(range.startContainer, range.startOffset, true);
        var endB = normalizeBoundary(range.endContainer, range.endOffset, false);
        if (!startB || !endB) return null;
        var start = offsetOfTextNode(startB.node, startB.offset);
        var end = offsetOfTextNode(endB.node, endB.offset);
        if (start === null || end === null || end <= start) return null;
        return { start: start, end: end };
      }

      // Wraps the global text-offset range [start, end) in a <mark>, splitting text nodes as needed.
      function wrapRange(start, end, color, id) {
        var walker = createFilteredWalker();
        var node, pos = 0;
        var toProcess = [];
        while ((node = walker.nextNode())) {
          var len = node.nodeValue.length;
          var nodeStart = pos, nodeEnd = pos + len;
          if (nodeEnd > start && nodeStart < end) toProcess.push({ node: node, nodeStart: nodeStart });
          pos += len;
          if (pos >= end) break;
        }
        toProcess.forEach(function (item) {
          var node = item.node;
          var localStart = Math.max(0, start - item.nodeStart);
          var localEnd = Math.min(node.nodeValue.length, end - item.nodeStart);
          var target = node;
          if (localEnd < target.nodeValue.length) target.splitText(localEnd);
          if (localStart > 0) target = target.splitText(localStart);
          var mark = document.createElement("mark");
          mark.className = "nav-highlight";
          mark.style.backgroundColor = color;
          mark.setAttribute("data-hid", id);
          target.parentNode.insertBefore(mark, target);
          mark.appendChild(target);
        });
      }

      function unwrapMark(mark) {
        var parent = mark.parentNode;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
        parent.normalize();
      }

      // ---- Persistence (per page, via data-page) ----
      function storageKey() { return STORAGE_PREFIX + (current || location.pathname); }
      function loadHighlights() {
        try {
          var raw = localStorage.getItem(storageKey());
          return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
      }
      function saveHighlightsList(list) {
        try { localStorage.setItem(storageKey(), JSON.stringify(list)); } catch (e) {}
      }
      function addHighlightRecord(rec) {
        var list = loadHighlights();
        list.push(rec);
        saveHighlightsList(list);
      }
      function removeHighlightRecord(id) {
        saveHighlightsList(loadHighlights().filter(function (h) { return h.id !== id; }));
      }

      function restoreHighlights() {
        var list = loadHighlights();
        list.sort(function (a, b) { return a.start - b.start; });
        list.forEach(function (h) {
          try { wrapRange(h.start, h.end, h.color, h.id); } catch (e) {}
        });
      }
      restoreHighlights();

      // ---- Arm / disarm modes ----
      function arm() {
        hlBtn.classList.add("active");
        document.body.classList.toggle("nav-highlighting-armed", mode === "highlight");
        document.body.classList.toggle("nav-erasing-armed", mode === "erase");
        popover.querySelectorAll(".nav-hl-swatch").forEach(function (s) {
          s.classList.toggle("selected", mode === "highlight" && s.getAttribute("data-color") === activeColor);
        });
        popover.querySelector(".nav-hl-eraser").classList.toggle("active", mode === "erase");
      }
      function disarm() {
        mode = null;
        hlBtn.classList.remove("active");
        document.body.classList.remove("nav-highlighting-armed", "nav-erasing-armed");
        popover.querySelectorAll(".nav-hl-swatch").forEach(function (s) { s.classList.remove("selected"); });
        var eraserBtn = popover.querySelector(".nav-hl-eraser");
        if (eraserBtn) eraserBtn.classList.remove("active");
      }

      function positionPopover() {
        var r = hlBtn.getBoundingClientRect();
        popover.style.top = Math.round(r.bottom + 8) + "px";
        var left = r.right - popover.offsetWidth;
        popover.style.left = Math.max(8, Math.round(left)) + "px";
      }
      function openPopover() {
        popover.classList.add("open");
        positionPopover();
      }
      function closePopover() {
        popover.classList.remove("open");
      }

      hlBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (mode) { disarm(); return; }
        popover.classList.contains("open") ? closePopover() : openPopover();
      });

      popover.addEventListener("click", function (e) {
        e.stopPropagation();
        var swatch = e.target.closest(".nav-hl-swatch");
        if (swatch) {
          mode = "highlight";
          activeColor = swatch.getAttribute("data-color");
          arm();
          closePopover();
          return;
        }
        if (e.target.closest(".nav-hl-eraser")) {
          mode = "erase";
          arm();
          closePopover();
          return;
        }
        if (e.target.closest(".nav-hl-clear")) {
          if (window.confirm("Remove all highlights on this page?")) {
            document.querySelectorAll("mark.nav-highlight").forEach(unwrapMark);
            saveHighlightsList([]);
          }
          closePopover();
        }
      });

      document.addEventListener("click", function (e) {
        if (popover.classList.contains("open") && !popover.contains(e.target) && !hlBtn.contains(e.target)) {
          closePopover();
        }
        if (mode === "erase") {
          var mark = e.target.closest("mark.nav-highlight");
          if (mark) {
            var id = mark.getAttribute("data-hid");
            unwrapMark(mark);
            removeHighlightRecord(id);
          }
        }
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { closePopover(); disarm(); }
      });

      function onSelectionEnd() {
        if (mode !== "highlight") return;
        var sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
        var range = sel.getRangeAt(0);
        if (range.collapsed) return;
        var offsets = getSelectionOffsets(range);
        sel.removeAllRanges();
        if (!offsets) return;
        var id = "h" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        wrapRange(offsets.start, offsets.end, activeColor, id);
        addHighlightRecord({ id: id, start: offsets.start, end: offsets.end, color: activeColor });
      }
      document.addEventListener("mouseup", onSelectionEnd);
      document.addEventListener("touchend", function () { setTimeout(onSelectionEnd, 30); });

      window.addEventListener("resize", function () {
        if (popover.classList.contains("open")) positionPopover();
      });
    })();
  });
})();
