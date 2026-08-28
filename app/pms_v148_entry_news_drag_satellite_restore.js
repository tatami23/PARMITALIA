(function(){
  "use strict";

  const VERSION = "PMS-V148-ENTRY-NEWS-DRAG-SATELLITE-RESTORE";
  let newsShown = false;

  function arr(value){ return Array.isArray(value) ? value : []; }
  function esc(value){ return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function appVisible(){
    const app = document.getElementById("app");
    const login = document.getElementById("login-screen");
    return !!(app && !app.classList.contains("hidden") && (!login || login.classList.contains("hidden")));
  }
  function stateRef(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.marketTrends = arr(state.marketTrends);
    state.marketPreview52 = arr(state.marketPreview52);
    state.orders = arr(state.orders);
    state.intermediations = arr(state.intermediations);
    return state;
  }
  function isReallyClosed(item){
    const status = String(item && item.status || "").toLowerCase();
    return !!(item && (
      item.operationalClosed === true ||
      item.operationalClosed === "true" ||
      item.operationalClosedAt ||
      status === "chiuso - in fatturazione"
    ));
  }
  function findCardItem(type, id){
    const list = type === "order" ? stateRef().orders : stateRef().intermediations;
    return list.find(item => [item.id, item.code, item.orderCode, item.dealCode].map(v => String(v || "")).includes(String(id || "")));
  }
  function restoreDragging(){
    const root = document.querySelector(".pms136-page");
    if (!root) return;
    root.querySelectorAll(".pms136-card").forEach(card => {
      const item = findCardItem(card.dataset.pms136Type, card.dataset.pms136Id);
      const closed = isReallyClosed(item);
      if (!closed) {
        card.classList.remove("pms147-card-closed");
        card.setAttribute("draggable", "true");
        card.querySelectorAll(".pms147-closed-row").forEach(node => node.remove());
        const clear = card.querySelector(".pms136-clear");
        if (clear) clear.style.display = "";
      }
    });
  }
  function topMarketRows(){
    const st = stateRef();
    const rows = st.marketTrends.length ? st.marketTrends : st.marketPreview52;
    return rows.slice(0, 5).map(item => ({
      title: item.product || item.name || item.group || "Mercato",
      market: item.market || item.group || item.source || "Aggiornamento mercato",
      value: item.price ? String(item.price) + " " + (item.unit || "") : (item.y2026 ? String(item.y2026) + " " + (item.unit || "") : "Da verificare"),
      source: item.source || item.note || "Parmitalia"
    }));
  }
  function defaultRows(){
    return [
      {title:"Andamenti mercato", market:"CLAL / dairy / trasporti", value:"Aggiornamenti disponibili", source:"Apri il modulo mercato per controllo"},
      {title:"Ordini e intermediazioni", market:"Gestione operativa", value:"Calendario settimanale", source:"Trascina le pratiche nei giorni di carico"},
      {title:"Fatturazione", market:"Workflow", value:"Bozze da verificare", source:"Le pratiche chiuse passano a fatturazione"}
    ];
  }
  function newsHtml(){
    const rows = topMarketRows();
    const list = (rows.length ? rows : defaultRows()).map(row => (
      '<div class="pms148-news-row">' +
        '<strong>' + esc(row.title) + '</strong>' +
        '<span>' + esc(row.market) + '</span>' +
        '<b>' + esc(row.value) + '</b>' +
        '<small>' + esc(row.source) + '</small>' +
      '</div>'
    )).join("");
    return '<div id="pms148-entry-news" class="pms148-entry-news" role="dialog" aria-modal="true" aria-label="Notizie ingresso">' +
      '<div class="pms148-news-card">' +
        '<div class="pms148-news-head"><div><span>Notizie ingresso</span><h3>Mercato e agenda operativa</h3></div><button type="button" class="pms148-news-x" data-pms148-close-news>Chiudi</button></div>' +
        '<div class="pms148-news-body">' + list + '</div>' +
        '<div class="pms148-news-actions"><button type="button" class="secondary-button" data-pms148-close-news>Continua</button><button type="button" class="primary-button" data-pms148-open-market>Apri andamenti mercato</button></div>' +
      '</div>' +
    '</div>';
  }
  function closeNews(){
    const popup = document.getElementById("pms148-entry-news");
    if (popup) popup.remove();
  }
  function openMarket(){
    closeNews();
    window.current = window.current || {};
    current.page = "marketTrends";
    if (typeof render === "function") render();
  }
  function showEntryNews(){
    if (newsShown || !appVisible()) return;
    newsShown = true;
    injectCss();
    closeNews();
    document.body.insertAdjacentHTML("beforeend", newsHtml());
    document.querySelectorAll("[data-pms148-close-news]").forEach(button => button.onclick = closeNews);
    document.querySelector("[data-pms148-open-market]")?.addEventListener("click", openMarket);
  }
  function ensureSatelliteMotion(){
    injectCss();
    const banner = document.getElementById("pms144-world-banner");
    if (!banner) return;
    const wrap = banner.querySelector(".pms144-globe-wrap");
    if (wrap && !wrap.querySelector(".pms144-orbit")) {
      wrap.insertAdjacentHTML("beforeend", '<div class="pms144-orbit"><span class="pms144-satellite" data-pms144-satellite-logo>P</span></div>');
    }
    const target = banner.querySelector("[data-pms144-satellite-logo]");
    const logo = stateRef().settings.logoUrl || "";
    if (target && logo && target.dataset.src !== logo) {
      target.dataset.src = logo;
      target.innerHTML = '<img src="' + esc(logo) + '" alt="Parmitalia">';
    }
  }
  function injectCss(){
    let style = document.getElementById("pms-v148-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v148-style";
      document.head.appendChild(style);
    }
    if (style.dataset.pms148Ready === "1") return;
    style.dataset.pms148Ready = "1";
    style.textContent = `
      .pms148-entry-news{position:fixed;inset:0;z-index:40000;display:grid;place-items:center;padding:18px;background:rgba(23,36,43,.34);backdrop-filter:blur(4px)}
      .pms148-news-card{width:min(720px,96vw);max-height:88vh;overflow:auto;background:#fff;border:1px solid #dfe9e4;border-radius:10px;box-shadow:0 22px 70px rgba(23,36,43,.24)}
      .pms148-news-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid #dfe9e4;background:linear-gradient(90deg,rgba(95,143,109,.13),#fff,rgba(189,122,120,.10))}
      .pms148-news-head span{display:block;color:#5f8f6d;font-size:11px;font-weight:900;text-transform:uppercase}
      .pms148-news-head h3{margin:3px 0 0;color:#17242b;font-size:18px;letter-spacing:0;text-transform:uppercase}
      .pms148-news-x{width:auto!important;margin:0!important;padding:7px 10px!important;border:1px solid #dfe9e4!important;background:#fff!important;color:#17242b!important;border-radius:7px!important;font-weight:900!important}
      .pms148-news-body{display:grid;gap:8px;padding:14px 18px}
      .pms148-news-row{display:grid;grid-template-columns:1.3fr 1fr .8fr;gap:8px;align-items:center;border:1px solid #e3ece7;border-radius:8px;padding:9px 10px;background:#fbfdfb}
      .pms148-news-row strong{color:#17242b;font-size:12px}
      .pms148-news-row span,.pms148-news-row small{color:#63736b;font-size:11px}
      .pms148-news-row b{color:#3f6b50;font-size:12px;text-align:right}
      .pms148-news-row small{grid-column:1/-1}
      .pms148-news-actions{display:flex;justify-content:flex-end;gap:8px;padding:13px 18px;border-top:1px solid #dfe9e4;background:#f7faf8}
      .pms148-news-actions button{width:auto!important;margin:0!important}
      #pms144-world-banner .pms144-globe{animation:pms144-globe-turn 16s linear infinite!important}
      #pms144-world-banner .pms144-orbit{position:absolute!important;inset:1px!important;border-radius:999px!important;pointer-events:none!important;animation:pms144-satellite-orbit 5.6s linear infinite!important;z-index:3!important}
      #pms144-world-banner .pms144-orbit:before{content:""!important;position:absolute!important;inset:4px!important;border:1px solid rgba(38,118,165,.16)!important;border-radius:999px!important}
      #pms144-world-banner .pms144-satellite{position:absolute!important;left:50%!important;top:-1px!important;width:24px!important;height:24px!important;margin-left:-12px!important;display:grid!important;place-items:center!important;border-radius:999px!important;overflow:hidden!important;background:linear-gradient(135deg,rgba(95,143,109,.95),#fff 52%,rgba(189,122,120,.95))!important;border:1px solid rgba(255,255,255,.88)!important;color:#173b2a!important;font-size:11px!important;font-weight:950!important;box-shadow:0 2px 8px rgba(23,59,92,.25),0 0 10px rgba(255,255,255,.72)!important}
      #pms144-world-banner .pms144-satellite img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}
      @keyframes pms144-globe-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes pms144-satellite-orbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @media(max-width:720px){.pms148-news-row{grid-template-columns:1fr}.pms148-news-row b{text-align:left}.pms148-news-actions{display:grid}}
      @media print{.pms148-entry-news{display:none!important}}
    `;
  }
  function afterRender(){
    restoreDragging();
    ensureSatelliteMotion();
    if (window.current && current.page === "dashboard") setTimeout(showEntryNews, 180);
  }
  function init(){
    injectCss();
    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !window.__pms148RenderWrapped) {
      window.__pms148RenderWrapped = true;
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(afterRender, 40);
        return result;
      };
    }
    [120, 500, 1200, 2500].forEach(ms => setTimeout(afterRender, ms));
    setInterval(() => { restoreDragging(); ensureSatelliteMotion(); }, 2500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
  window.PMS_V148_ENTRY_NEWS_DRAG_SATELLITE_RESTORE = {version: VERSION, showEntryNews, restoreDragging};
})();
