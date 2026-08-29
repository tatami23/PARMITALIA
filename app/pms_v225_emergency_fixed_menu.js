(function () {
  "use strict";

  if (window.PMS_V225_EMERGENCY_FIXED_MENU) return;

  var VERSION = "pms_v225_emergency_fixed_menu";
  var MENU_ID = "pms225-emergency-menu";
  var STYLE_ID = "pms-v225-emergency-fixed-menu-style";
  var nativeSetTimeout = window.setTimeout.bind(window);

  var ITEMS = [
    ["assistant", "BO", "Backoffice"],
    ["operativo", "OP", "Gestione operativa"],
    ["orders", "ORD", "Ordini"],
    ["offers", "OFF", "Offerte"],
    ["contacts", "ANA", "Anagrafiche"],
    ["products", "PRD", "Prodotti"],
    ["documents", "DOC", "Documenti"],
    ["print", "PRN", "Stampe"],
    ["communications", "CRM", "CRM"],
    ["intermediations", "INT", "Intermediazioni"],
    ["trattativeInCorso", "TRT", "Trattative"],
    ["supplierPriceConfirmations", "LST", "Listini fornitori"],
    ["transportPrices", "TRP", "Trasporti"],
    ["companyFleet", "FLT", "Flotta"],
    ["accountant", "ACC", "Commercialista"],
    ["payments", "PAY", "Pagamenti"],
    ["agents", "AG", "Agenti"],
    ["humanResources", "HR", "Dipendenti"],
    ["foreignEmployees", "EST", "Estero"],
    ["contracts", "CTR", "Contratti"],
    ["settings", "SET", "Impostazioni"],
    ["admin", "ADM", "Admin"]
  ];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function currentPage() {
    try {
      if (typeof current !== "undefined" && current && current.page) return current.page;
    } catch (error) {}
    return "";
  }

  function injectStyle() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      "body.pms225-menu-live{overflow-x:hidden!important}",
      "body.pms225-menu-live #app.app:not(.hidden){display:block!important;visibility:visible!important;opacity:1!important;min-height:100vh!important}",
      "body.pms225-menu-live .sidebar{display:none!important;visibility:hidden!important;pointer-events:none!important;width:0!important;min-width:0!important;max-width:0!important;height:0!important;overflow:hidden!important}",
      "body.pms225-menu-live .main{display:block!important;width:auto!important;min-width:0!important;margin-left:306px!important}",
      "body.pms225-menu-live .topbar{left:306px!important;width:calc(100% - 306px)!important}",
      "body.pms225-menu-live .mobile-menu-toggle{display:none!important;pointer-events:none!important}",
      "#" + MENU_ID + "{position:fixed!important;left:0!important;top:0!important;bottom:0!important;z-index:2147483647!important;display:flex!important;visibility:visible!important;opacity:1!important;flex-direction:column!important;width:306px!important;height:100vh!important;padding:12px!important;background:#102f2e!important;color:#fff!important;box-shadow:10px 0 28px rgba(15,23,42,.24)!important;pointer-events:auto!important;overflow:hidden!important;font-family:Inter,Segoe UI,Arial,sans-serif!important}",
      "#" + MENU_ID + " .pms225-brand{display:grid!important;grid-template-columns:42px minmax(0,1fr)!important;align-items:center!important;gap:10px!important;min-height:54px!important;padding:0 0 10px!important;border-bottom:1px solid rgba(255,255,255,.18)!important}",
      "#" + MENU_ID + " .pms225-mark{display:grid!important;place-items:center!important;width:42px!important;height:42px!important;border-radius:10px!important;background:#fff!important;color:#116149!important;font-weight:950!important;font-size:20px!important}",
      "#" + MENU_ID + " .pms225-brand strong{display:block!important;color:#fff!important;font-size:16px!important;line-height:1.05!important}",
      "#" + MENU_ID + " .pms225-brand span{display:block!important;color:rgba(255,255,255,.72)!important;font-size:12px!important;line-height:1.15!important;margin-top:2px!important}",
      "#" + MENU_ID + " .pms225-list{display:flex!important;flex:1 1 auto!important;min-height:0!important;flex-direction:column!important;gap:6px!important;overflow-y:auto!important;overflow-x:hidden!important;padding:10px 2px 8px!important}",
      "#" + MENU_ID + " button{display:grid!important;grid-template-columns:40px minmax(0,1fr)!important;align-items:center!important;gap:9px!important;width:100%!important;min-height:40px!important;margin:0!important;padding:7px 9px!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:8px!important;background:rgba(255,255,255,.08)!important;color:#fff!important;text-align:left!important;cursor:pointer!important;pointer-events:auto!important;font:inherit!important;white-space:normal!important}",
      "#" + MENU_ID + " button:hover,#" + MENU_ID + " button.active{background:#fff!important;color:#103a34!important;border-color:#fff!important}",
      "#" + MENU_ID + " .pms225-code{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:36px!important;height:23px!important;border-radius:6px!important;background:#fff!important;color:#116149!important;font-size:9px!important;font-weight:950!important;line-height:1!important}",
      "#" + MENU_ID + " button:hover .pms225-code,#" + MENU_ID + " button.active .pms225-code{background:#116149!important;color:#fff!important}",
      "#" + MENU_ID + " .pms225-label{display:block!important;min-width:0!important;white-space:normal!important;overflow-wrap:anywhere!important;font-size:12.5px!important;font-weight:850!important;line-height:1.15!important;letter-spacing:0!important}",
      "#" + MENU_ID + " .pms225-foot{flex:0 0 auto!important;border-top:1px solid rgba(255,255,255,.18)!important;padding-top:8px!important;color:rgba(255,255,255,.7)!important;font-size:11px!important;line-height:1.25!important}",
      "@media(max-width:780px){body.pms225-menu-live .main{margin-left:0!important;padding-top:58vh!important}body.pms225-menu-live .topbar{left:0!important;width:100%!important}#" + MENU_ID + "{right:0!important;width:100%!important;height:58vh!important;bottom:auto!important}}",
      "@media print{#" + MENU_ID + "{display:none!important}body.pms225-menu-live .main{margin-left:0!important}}"
    ].join("\n");
    document.body.classList.add("pms225-menu-live");
  }

  function openPage(page) {
    try { document.body.classList.remove("menu-open"); } catch (error) {}
    try {
      if (typeof setPage === "function") {
        setPage(page);
      } else {
        if (typeof current !== "undefined" && current) current.page = page;
        if (typeof render === "function") render();
      }
    } catch (error) {
      try {
        if (typeof current !== "undefined" && current) current.page = page;
        if (typeof render === "function") render();
      } catch (inner) {}
    }
    nativeSetTimeout(draw, 40);
    nativeSetTimeout(draw, 250);
  }

  function draw() {
    injectStyle();
    var menu = document.getElementById(MENU_ID);
    if (!menu) {
      menu = document.createElement("aside");
      menu.id = MENU_ID;
      menu.setAttribute("aria-label", "Menu Parmitalia ripristinato");
      document.body.appendChild(menu);
    }
    var page = currentPage();
    var buttons = ITEMS.map(function (item) {
      var active = item[0] === page ? " active" : "";
      return '<button type="button" class="pms225-item' + active + '" data-pms225-page="' + esc(item[0]) + '" title="' + esc(item[2]) + '">' +
        '<span class="pms225-code">' + esc(item[1]) + '</span>' +
        '<span class="pms225-label">' + esc(item[2]) + '</span>' +
        '</button>';
    }).join("");
    var html = '<div class="pms225-brand"><div class="pms225-mark">P</div><div><strong>Parmitalia</strong><span>Gestionale</span></div></div>' +
      '<div class="pms225-list">' + buttons + '</div>' +
      '<div class="pms225-foot">Menu ripristinato stabile · demo</div>';
    if (menu.dataset.pms225Html !== html) {
      menu.innerHTML = html;
      menu.dataset.pms225Html = html;
    }
    menu.style.setProperty("display", "flex", "important");
    menu.style.setProperty("pointer-events", "auto", "important");
    menu.style.setProperty("z-index", "2147483647", "important");
  }

  function bind() {
    if (document.__pms225Bound) return;
    document.__pms225Bound = true;
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest && event.target.closest("#" + MENU_ID + " [data-pms225-page]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      openPage(button.getAttribute("data-pms225-page"));
    }, true);
  }

  function wrap(name) {
    var fn = window[name];
    if (typeof fn !== "function" || fn.__pms225Wrapped) return;
    var wrapped = function () {
      var result = fn.apply(this, arguments);
      nativeSetTimeout(draw, 40);
      nativeSetTimeout(draw, 250);
      return result;
    };
    wrapped.__pms225Wrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (error) {}
  }

  function install() {
    bind();
    wrap("render");
    wrap("setPage");
    wrap("login");
    draw();
    [50, 150, 400, 900, 1800, 3000].forEach(function (ms) { nativeSetTimeout(draw, ms); });
    var runs = 0;
    var guard = window.setInterval(function () {
      runs += 1;
      draw();
      if (runs > 240) window.clearInterval(guard);
    }, 500);
    console.info(VERSION + " loaded");
  }

  window.PMS_V225_EMERGENCY_FIXED_MENU = { version: VERSION, refresh: draw, openPage: openPage };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
