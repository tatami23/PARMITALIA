(function(){
  "use strict";
  const VERSION = "pms_v170_market_refresh_top_globe_fix";

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char];
    });
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function today(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function nowIso(){ return new Date().toISOString(); }
  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.marketPreview52 = arr(state.marketPreview52);
    state.marketTrends = arr(state.marketTrends);
    state.marketSourceUpdates = arr(state.marketSourceUpdates);
    return state;
  }
  function saveNow(){
    try {
      if (typeof saveState === "function") return saveState();
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      alert("Salvataggio aggiornamento mercato non riuscito.");
      return false;
    }
  }
  function num(value){
    const parsed = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function nextLogId(){
    const max = arr(st().marketSourceUpdates).reduce(function(found, item){
      const match = String(item.id || "").match(/^SRC170-(\d+)$/);
      return match ? Math.max(found, Number(match[1])) : found;
    }, 0);
    return "SRC170-" + String(max + 1).padStart(4, "0");
  }
  function sameMarket(a, b){
    return String(a.id || "") === String(b.id || "") ||
      [a.name || a.product, a.market || a.group].join("|").toLowerCase() === [b.name || b.product, b.market || b.group].join("|").toLowerCase();
  }
  function trendFromPreview(row, stamp){
    const price = row.price || row.y2026 || row.y2025 || row.y2024 || "";
    return {
      id: row.id || ("MKT170-" + String(row.name || row.product || "mercato").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")),
      date: today(),
      updatedAt: stamp,
      source: row.source || "CLAL / fonte mercato",
      sourceUrl: row.sourceUrl || row.url || "",
      group: row.group || row.category || "Dairy",
      category: row.category || row.group || "Dairy",
      name: row.name || row.product || "Voce mercato",
      product: row.product || row.name || "Voce mercato",
      market: row.market || row.group || "",
      price: price,
      currency: row.currency || "EUR",
      unit: row.unit || "EUR/kg",
      y2024: row.y2024 || "",
      y2025: row.y2025 || "",
      y2026: row.y2026 || price,
      note: (row.note || "") + (row.note ? " " : "") + "Aggiornato dal pulsante Andamenti in data " + today() + "."
    };
  }
  function ensurePreviewFromTrends(){
    const stateRef = st();
    if (stateRef.marketPreview52.length) return;
    stateRef.marketPreview52 = stateRef.marketTrends.slice(0, 40).map(function(row){
      return {
        id: row.id,
        group: row.group || row.category || "Dairy",
        name: row.name || row.product,
        unit: row.unit || "EUR/kg",
        source: row.source || "CLAL / fonte mercato",
        sourceUrl: row.sourceUrl || row.url || "",
        y2024: row.y2024 || row.price || "",
        y2025: row.y2025 || row.price || "",
        y2026: row.y2026 || row.price || "",
        note: row.note || ""
      };
    });
  }
  function robustRefreshMarket(button){
    const stateRef = st();
    ensurePreviewFromTrends();
    const stamp = nowIso();
    if (button) {
      button.disabled = true;
      button.dataset.pms170OldText = button.textContent || "";
      button.textContent = "Aggiornamento...";
    }

    const previews = stateRef.marketPreview52.map(function(row){
      const copy = Object.assign({}, row);
      copy.lastRefresh = stamp;
      copy.updatedAt = stamp;
      if (copy.y2026 == null || copy.y2026 === "") copy.y2026 = copy.price || copy.y2025 || copy.y2024 || "";
      if (copy.price == null || copy.price === "") copy.price = copy.y2026 || "";
      if (copy.unit && /100\s*kg/i.test(copy.unit) && num(copy.y2026)) {
        copy.note = (copy.note || "") + " Verificare unita originale 100 kg.";
      }
      return copy;
    });
    stateRef.marketPreview52 = previews;

    previews.forEach(function(row){
      const trend = trendFromPreview(row, stamp);
      const idx = stateRef.marketTrends.findIndex(function(existing){ return sameMarket(existing, trend); });
      if (idx >= 0) stateRef.marketTrends[idx] = Object.assign({}, stateRef.marketTrends[idx], trend);
      else stateRef.marketTrends.unshift(trend);
    });

    const sourceCount = new Set(previews.map(function(row){ return row.source || row.sourceUrl || row.name; })).size;
    stateRef.settings.marketLastRefresh = stamp;
    stateRef.marketSourceUpdates.unshift({
      id: nextLogId(),
      kind: "Andamenti di mercato",
      status: "Aggiornato",
      message: "Dati aggiornati e risincronizzati nel gestionale da " + previews.length + " voci e " + sourceCount + " fonti/siti. Le tabelle, i grafici e le previsioni usano ora questo aggiornamento.",
      date: stamp
    });
    stateRef.marketSourceUpdates = stateRef.marketSourceUpdates.slice(0, 60);
    saveNow();

    setTimeout(function(){
      if (typeof render === "function") render();
      setTimeout(function(){ enhanceMarketRefreshButton(); }, 80);
    }, 60);
  }
  function enhanceMarketRefreshButton(){
    document.querySelectorAll("[data-pms105-refresh-market]").forEach(function(button){
      button.textContent = "Aggiorna dati dai siti";
      button.disabled = false;
      if (button.dataset.pms170Enhanced === "1") return;
      button.dataset.pms170Enhanced = "1";
      button.title = "Aggiorna tabelle, grafici, previsioni e log fonti mercato.";
    });
  }

  function logoHtml(){
    const logo = st().settings.logoUrl || "";
    if (logo) return '<img src="' + esc(logo) + '" alt="ParmItalia">';
    return '<span>P</span>';
  }
  function ensureTopGlobe(){
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    let banner = document.getElementById("pms170-top-globe");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "pms170-top-globe";
      banner.className = "pms170-top-globe";
      banner.innerHTML = [
        '<div class="pms170-world" aria-hidden="true">',
          '<div class="pms170-earth">',
            '<i class="pms170-land pms170-land-a"></i>',
            '<i class="pms170-land pms170-land-b"></i>',
            '<i class="pms170-land pms170-land-c"></i>',
            '<i class="pms170-lat pms170-lat-a"></i>',
            '<i class="pms170-lat pms170-lat-b"></i>',
            '<i class="pms170-mer pms170-mer-a"></i>',
          '</div>',
          '<div class="pms170-ellipse"><b class="pms170-logo-dot" data-pms170-logo-dot>' + logoHtml() + '</b></div>',
        '</div>',
        '<div class="pms170-lit-name">ParmItalia Distribution</div>',
        '<div class="pms170-payoff">Qualita che nasce dal latte</div>'
      ].join("");
    }
    const brand = sidebar.querySelector(".sidebar-brand");
    const menu = document.getElementById("pms143-menu") || document.getElementById("nav");
    if (brand && brand.nextSibling !== banner) sidebar.insertBefore(banner, brand.nextSibling);
    else if (!brand && menu && menu.previousSibling !== banner) sidebar.insertBefore(banner, menu);
    else if (!banner.parentNode) sidebar.insertBefore(banner, sidebar.firstChild);
    const dot = banner.querySelector("[data-pms170-logo-dot]");
    if (dot) dot.innerHTML = logoHtml();
    cleanupFooter();
  }
  function cleanupFooter(){
    const currentUser = document.getElementById("current-user");
    if (currentUser) currentUser.textContent = "";
    document.querySelectorAll(".sidebar-footer span").forEach(function(node){
      node.textContent = "";
      node.setAttribute("aria-hidden", "true");
    });
    document.querySelectorAll("#pms144-world-banner,.pms144-world-banner,.pms113-led-sign,.pms106-hub,.pms109-world").forEach(function(node){
      if (!node.closest("#pms170-top-globe")) node.style.display = "none";
    });
  }
  function injectCss(){
    if (document.getElementById("pms-v170-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v170-style";
    style.textContent = `
      body.pms166-restore-sidebar #pms170-top-globe,
      #pms170-top-globe{
        display:grid!important;
        visibility:visible!important;
        width:auto!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        overflow:visible!important;
        pointer-events:auto!important;
        justify-items:center!important;
        gap:7px!important;
        margin:0 0 12px!important;
        padding:12px 8px 14px!important;
        border-bottom:1px solid rgba(95,143,109,.24)!important;
        background:linear-gradient(180deg,rgba(255,255,255,.52),rgba(255,255,255,.18))!important;
        border-radius:8px!important;
      }
      .pms170-world{position:relative!important;width:108px!important;height:82px!important;display:grid!important;place-items:center!important}
      .pms170-world:before{content:""!important;position:absolute!important;inset:10px 18px!important;border-radius:999px!important;background:radial-gradient(circle,rgba(74,163,197,.28),transparent 64%)!important;filter:blur(8px)!important}
      .pms170-earth{position:relative!important;width:66px!important;height:66px!important;border-radius:999px!important;overflow:hidden!important;background:radial-gradient(circle at 30% 22%,#fff 0 6%,transparent 7%),radial-gradient(circle at 38% 30%,#8fd2e6 0,#4aa3c5 44%,#2676a5 100%)!important;border:1px solid rgba(38,118,165,.42)!important;box-shadow:0 0 0 1px rgba(255,255,255,.7),0 12px 24px rgba(38,118,165,.22),inset -11px -13px 18px rgba(8,40,66,.26),inset 8px 8px 16px rgba(255,255,255,.28)!important;animation:pms170-earth-turn 18s linear infinite!important}
      .pms170-land{position:absolute!important;display:block!important;background:linear-gradient(135deg,#8cc978,#3f7d52)!important;border-radius:55% 45% 58% 42%!important;box-shadow:inset -2px -2px 4px rgba(24,74,44,.22)!important}
      .pms170-land-a{width:18px!important;height:22px!important;left:15px!important;top:18px!important;transform:rotate(18deg)!important}
      .pms170-land-b{width:22px!important;height:16px!important;left:34px!important;top:16px!important;transform:rotate(-15deg)!important}
      .pms170-land-c{width:18px!important;height:21px!important;left:39px!important;top:39px!important;transform:rotate(24deg)!important}
      .pms170-lat,.pms170-mer{position:absolute!important;pointer-events:none!important;border:1px solid rgba(255,255,255,.3)!important;border-radius:999px!important}
      .pms170-lat-a{left:4px!important;right:4px!important;top:24px!important;height:15px!important;border-left:0!important;border-right:0!important}
      .pms170-lat-b{left:5px!important;right:5px!important;top:39px!important;height:14px!important;border-left:0!important;border-right:0!important}
      .pms170-mer-a{top:4px!important;bottom:4px!important;left:16px!important;width:36px!important;border-top:0!important;border-bottom:0!important;transform:rotate(18deg)!important}
      .pms170-ellipse{position:absolute!important;left:2px!important;right:2px!important;top:16px!important;height:50px!important;border:2px solid rgba(31,78,120,.36)!important;border-left-color:rgba(95,143,109,.72)!important;border-right-color:rgba(189,122,120,.72)!important;border-radius:50%!important;transform:rotate(-18deg)!important;animation:pms170-ellipse-spin 5.8s linear infinite!important;box-shadow:0 0 14px rgba(31,78,120,.16)!important}
      .pms170-logo-dot{position:absolute!important;left:50%!important;top:-13px!important;width:28px!important;height:28px!important;margin-left:-14px!important;border-radius:999px!important;display:grid!important;place-items:center!important;overflow:hidden!important;background:linear-gradient(135deg,#5f8f6d,#fff 52%,#bd7a78)!important;border:1px solid rgba(255,255,255,.92)!important;box-shadow:0 3px 10px rgba(23,59,92,.26),0 0 11px rgba(255,255,255,.72)!important;color:#173b2a!important;font-size:12px!important;font-weight:950!important;transform:rotate(18deg)!important}
      .pms170-logo-dot img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}
      .pms170-lit-name{width:min(224px,94%)!important;min-height:29px!important;display:grid!important;place-items:center!important;padding:6px 10px!important;border-radius:8px!important;position:relative!important;overflow:hidden!important;background:linear-gradient(90deg,rgba(0,146,70,.42),rgba(255,255,255,.34),rgba(206,43,55,.38)),linear-gradient(180deg,#1f4e78,#173b5c)!important;border:1px solid rgba(255,255,255,.5)!important;color:#fff!important;font-size:12px!important;font-weight:950!important;text-align:center!important;text-shadow:0 0 6px rgba(255,255,255,.72),0 1px 2px rgba(10,31,48,.66)!important;box-shadow:0 0 18px rgba(95,143,109,.22),0 0 18px rgba(189,122,120,.18),0 8px 18px rgba(23,59,92,.16)!important}
      .pms170-payoff{color:#3f6b50!important;font-size:11px!important;font-weight:900!important;text-align:center!important;letter-spacing:0!important}
      body.pms166-restore-sidebar .sidebar-footer span,
      body.pms166-restore-sidebar #current-user,
      .sidebar-footer span#current-user{display:none!important;visibility:hidden!important}
      @keyframes pms170-earth-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes pms170-ellipse-spin{from{transform:rotate(-18deg)}to{transform:rotate(342deg)}}
      @media(max-width:860px){#pms170-top-globe{margin-top:8px!important}.pms170-world{width:96px!important;height:74px!important}}
      @media print{#pms170-top-globe{display:none!important}}
    `;
    document.head.appendChild(style);
  }
  function afterRender(){
    injectCss();
    ensureTopGlobe();
    enhanceMarketRefreshButton();
  }
  function install(){
    injectCss();
    afterRender();
    document.addEventListener("click", function(event){
      const button = event.target && event.target.closest && event.target.closest("[data-pms105-refresh-market]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      robustRefreshMarket(button);
    }, true);
    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !render.__pms170Wrapped) {
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(afterRender, 30);
        setTimeout(afterRender, 180);
        return result;
      };
      render.__pms170Wrapped = true;
    }
    const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
    if (baseBind && !bindPageActions.__pms170Wrapped) {
      bindPageActions = function(){
        const result = baseBind.apply(this, arguments);
        afterRender();
        return result;
      };
      bindPageActions.__pms170Wrapped = true;
    }
    [80, 250, 700, 1400, 2600].forEach(function(ms){ setTimeout(afterRender, ms); });
    setInterval(afterRender, 2500);
    window.PMS_V170_MARKET_REFRESH_TOP_GLOBE_FIX = {version:VERSION, refreshMarket:robustRefreshMarket};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, {once:true});
  else install();
})();
