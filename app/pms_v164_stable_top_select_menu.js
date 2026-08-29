(function(){
  "use strict";

  const VERSION = "pms_v164_stable_top_select_menu";
  const HIDDEN_PAGES = new Set(["cryptoMonitor", "admin", "approvals"]);
  const FALLBACK_ITEMS = [
    ["dashboard", "Dashboard"],
    ["marketTrends", "Andamenti di mercato"],
    ["operativo", "Gestione operativa"],
    ["assistant", "Backoffice / Segretariato"],
    ["communications", "Comunicazioni / CRM"],
    ["officialCommunications", "Comunicazioni ufficiali"],
    ["trattativeInCorso", "Trattative in corso"],
    ["intermediations", "Intermediazioni"],
    ["offers", "Offerte commerciali"],
    ["orders", "Ordini"],
    ["products", "Prodotti e articoli"],
    ["productForms", "Moduli"],
    ["supplierPriceConfirmations", "Listini e conferme fornitori"],
    ["tenders", "Gare e richieste"],
    ["commercialBrokerage", "Brokeraggio commerciale"],
    ["contacts", "Anagrafiche clienti e fornitori"],
    ["print", "Centro stampe"],
    ["supplierGeoGroupage", "Geo fornitore"],
    ["transportPrices", "Trasporti"],
    ["packing", "Packing list"],
    ["documents", "Archivio documenti"],
    ["accountant", "Commercialista"],
    ["billingWorkflow", "Fatturazione attiva e passiva"],
    ["banks", "Banche"],
    ["payments", "Pagamenti e garanzie"],
    ["agents", "Agenti e provvigioni"],
    ["driverRecruiting", "Recruiting autisti"],
    ["humanResources", "Dipendenti azienda"],
    ["foreignEmployees", "Dipendenti estero"],
    ["legalClaims", "Sinistri e pratiche legali"],
    ["legalProtocols", "Protocolli legali"],
    ["contracts", "Contratti"],
    ["contractTemplates", "Modelli contrattuali"],
    ["customerInternalExtraction", "Estrazione clienti interni"],
    ["desktopCloudApp", "App Desktop Windows / macOS"],
    ["desktopRoadmap", "Piano applicazione desktop"],
    ["settings", "Impostazioni"]
  ];

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char];
    });
  }
  function cur(){
    window.current = window.current || { user:"Carlo", role:"admin", page:"dashboard", filters:{} };
    return window.current;
  }
  function labelFor(id){
    const fromModules = Array.isArray(window.modules) && window.modules.find(function(mod){ return mod && mod.id === id; });
    if (fromModules && fromModules.label) return fromModules.label;
    const fallback = FALLBACK_ITEMS.find(function(item){ return item[0] === id; });
    return fallback ? fallback[1] : id;
  }
  function menuItems(){
    const seen = new Set();
    const items = [];
    FALLBACK_ITEMS.forEach(function(item){
      if (!HIDDEN_PAGES.has(item[0]) && !seen.has(item[0])) {
        seen.add(item[0]);
        items.push([item[0], labelFor(item[0])]);
      }
    });
    if (Array.isArray(window.modules)) {
      window.modules.forEach(function(mod){
        if (!mod || !mod.id || HIDDEN_PAGES.has(mod.id) || seen.has(mod.id)) return;
        seen.add(mod.id);
        items.push([mod.id, mod.label || mod.subtitle || mod.id]);
      });
    }
    return items;
  }

  function injectCss(){
    let style = document.getElementById("pms-v164-stable-top-select-menu-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v164-stable-top-select-menu-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      body.pms164-top-select-menu .app{display:block!important;min-height:100vh!important;width:100%!important}
      body.pms164-top-select-menu .sidebar{
        position:sticky!important;
        top:0!important;
        z-index:5000!important;
        width:100%!important;
        height:auto!important;
        min-height:64px!important;
        display:flex!important;
        flex-direction:row!important;
        align-items:center!important;
        gap:12px!important;
        padding:10px 16px!important;
        overflow:visible!important;
        background:linear-gradient(90deg,rgba(95,143,109,.22),rgba(255,255,255,.96) 48%,rgba(189,122,120,.18)),#f7faf8!important;
        color:#17242b!important;
        border:0!important;
        border-bottom:1px solid #dfe9e4!important;
        box-shadow:0 8px 22px rgba(30,45,60,.08)!important;
      }
      body.pms164-top-select-menu .sidebar *{color:#17242b!important;text-shadow:none!important;letter-spacing:0!important}
      body.pms164-top-select-menu .sidebar-brand{
        flex:0 0 auto!important;
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
      }
      body.pms164-top-select-menu .sidebar-brand strong{font-size:16px!important;line-height:1.05!important;white-space:nowrap!important}
      body.pms164-top-select-menu .sidebar-brand span{font-size:11px!important;color:#52606d!important;white-space:nowrap!important}
      body.pms164-top-select-menu .brand-mark{width:38px!important;height:38px!important;min-width:38px!important}
      body.pms164-top-select-menu #pms163-menu-toggle,
      body.pms164-top-select-menu #pms143-menu,
      body.pms164-top-select-menu #nav,
      body.pms164-top-select-menu #pms144-world-banner,
      body.pms164-top-select-menu .pms144-world-banner,
      body.pms164-top-select-menu .pms144-sign,
      body.pms164-top-select-menu .pms113-led-sign{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        min-height:0!important;
        max-height:0!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
        pointer-events:none!important;
      }
      #pms164-menu-wrap{
        flex:1 1 430px!important;
        min-width:240px!important;
        max-width:620px!important;
        display:flex!important;
        align-items:center!important;
        gap:9px!important;
      }
      #pms164-menu-wrap label{
        font-size:11px!important;
        font-weight:950!important;
        text-transform:uppercase!important;
        color:#3f6b50!important;
        white-space:nowrap!important;
      }
      #pms164-page-select{
        width:100%!important;
        min-width:0!important;
        height:42px!important;
        appearance:auto!important;
        border-radius:8px!important;
        border:1px solid rgba(95,143,109,.36)!important;
        background:#fff!important;
        color:#17242b!important;
        padding:0 12px!important;
        font-size:14px!important;
        font-weight:900!important;
        box-shadow:0 4px 12px rgba(30,45,60,.07)!important;
        cursor:pointer!important;
      }
      body.pms164-top-select-menu .sidebar-footer{
        margin:0 0 0 auto!important;
        padding:0!important;
        border:0!important;
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
      }
      body.pms164-top-select-menu .sidebar-footer span,
      body.pms164-top-select-menu #current-user{display:none!important}
      body.pms164-top-select-menu #logout-button{
        width:auto!important;
        min-width:78px!important;
        margin:0!important;
        padding:9px 14px!important;
        border-radius:8px!important;
        background:#fff!important;
        border:1px solid #dfe9e4!important;
        color:#17242b!important;
        font-weight:950!important;
        box-shadow:0 3px 10px rgba(30,45,60,.08)!important;
      }
      body.pms164-top-select-menu .main{width:100%!important;max-width:none!important;min-width:0!important}
      body.pms164-top-select-menu .topbar{top:64px!important;z-index:1200!important}
      @media(max-width:820px){
        body.pms164-top-select-menu .sidebar{display:grid!important;grid-template-columns:1fr auto!important;gap:9px!important;padding:9px 10px!important}
        body.pms164-top-select-menu .sidebar-brand span{display:none!important}
        #pms164-menu-wrap{grid-column:1/-1!important;max-width:none!important;width:100%!important}
        body.pms164-top-select-menu .sidebar-footer{grid-column:2!important;grid-row:1!important}
        body.pms164-top-select-menu .topbar{top:112px!important}
      }
    `;
  }

  function ensureMenu(){
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return null;
    let wrap = document.getElementById("pms164-menu-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "pms164-menu-wrap";
      wrap.innerHTML = '<label for="pms164-page-select">Menu</label><select id="pms164-page-select" aria-label="Menu principale"></select>';
      const brand = sidebar.querySelector(".sidebar-brand");
      if (brand && brand.nextSibling) sidebar.insertBefore(wrap, brand.nextSibling);
      else sidebar.insertBefore(wrap, sidebar.firstChild);
    }
    return wrap.querySelector("#pms164-page-select");
  }

  function fillMenu(){
    const select = ensureMenu();
    if (!select) return;
    const currentPage = cur().page || "dashboard";
    const html = menuItems().map(function(item){
      return '<option value="' + esc(item[0]) + '">' + esc(item[1]) + '</option>';
    }).join("");
    if (select.dataset.pms164Html !== html) {
      select.innerHTML = html;
      select.dataset.pms164Html = html;
    }
    if (Array.from(select.options).some(function(option){ return option.value === currentPage; })) {
      select.value = currentPage;
    }
    if (select.dataset.pms164Bound !== "1") {
      select.dataset.pms164Bound = "1";
      select.addEventListener("change", function(){
        openPage(select.value);
      });
    }
  }

  function setHeader(id){
    const title = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    const label = labelFor(id);
    if (title) title.textContent = label;
    if (subtitle) subtitle.textContent = label;
  }

  function openPage(id){
    if (!id) return;
    cur().page = id;
    document.body.classList.remove("pms163-menu-open");
    setHeader(id);
    try {
      if (typeof window.render === "function") window.render();
      else if (typeof render === "function") render();
    } catch(error) {
      console.warn(VERSION + " render failed", error);
    }
    setTimeout(refresh, 0);
    setTimeout(refresh, 120);
  }

  function cleanOldText(){
    document.querySelectorAll(".pms144-sign").forEach(function(node){ node.remove(); });
    const user = document.getElementById("current-user");
    if (user) user.textContent = "";
    document.querySelectorAll(".sidebar-footer span").forEach(function(node){ node.textContent = ""; });
  }

  function refresh(){
    document.body.classList.remove("pms164-top-select-menu");
    const wrap = document.getElementById("pms164-menu-wrap");
    if (wrap) {
      wrap.style.setProperty("display", "none", "important");
      wrap.style.setProperty("visibility", "hidden", "important");
      wrap.style.setProperty("height", "0", "important");
      wrap.style.setProperty("min-height", "0", "important");
      wrap.style.setProperty("max-height", "0", "important");
      wrap.style.setProperty("margin", "0", "important");
      wrap.style.setProperty("padding", "0", "important");
      wrap.style.setProperty("overflow", "hidden", "important");
    }
    cleanOldText();
  }

  function wrapRender(){
    if (typeof render === "function" && !render.pms164Wrapped) {
      const baseRender = render;
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(refresh, 0);
        setTimeout(refresh, 120);
        return result;
      };
      render.pms164Wrapped = true;
      window.render = render;
    }
    if (typeof renderNav === "function" && !renderNav.pms164Wrapped) {
      const baseRenderNav = renderNav;
      renderNav = function(){
        const result = baseRenderNav.apply(this, arguments);
        setTimeout(refresh, 0);
        setTimeout(refresh, 120);
        return result;
      };
      renderNav.pms164Wrapped = true;
      window.renderNav = renderNav;
    }
  }

  function install(){
    wrapRender();
    refresh();
    [50, 150, 350, 700, 1300].forEach(function(ms){ setTimeout(refresh, ms); });
    window.PMS_V164_STABLE_TOP_SELECT_MENU = { version: VERSION, openPage: openPage };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
