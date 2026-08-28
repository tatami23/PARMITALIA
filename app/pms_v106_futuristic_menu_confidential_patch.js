(function(){
  "use strict";
  const VERSION = "PMS-V106-FUTURISTIC-MENU-CONFIDENTIAL";
  const QUICK = ["dashboard","marketTrends","tenders","trattativeInCorso","offers","orders","products","contracts","accountant","settings"];
  const CODE = {
    dashboard:"DB", marketTrends:"MKT", tenders:"TEN", trattativeInCorso:"TRT", offers:"OFF", orders:"ORD",
    products:"PRD", contracts:"CTR", accountant:"ACC", settings:"SET", communications:"TRD", contacts:"ANA",
    documents:"DOC", print:"PRN", billingWorkflow:"FAT", legalClaims:"SIN", officialCommunications:"DOC"
  };

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e){ console.warn(e); return false; } }
  function logo(){ return (state && state.settings && (state.settings.backgroundLogoUrl || state.settings.logoUrl)) || ""; }
  function notice(){ return (state && state.settings && state.settings.confidentialNotice) || "DOCUMENTO RISERVATO - PARMITALIA DISTRIBUTION SRL"; }
  function opacity(){
    const n = Number(state && state.settings && state.settings.backgroundLogoOpacity);
    return Number.isFinite(n) ? Math.max(0.03,Math.min(0.22,n)) : 0.075;
  }
  function cssUrl(src){ return 'url("' + String(src || "").replace(/\\/g,"/").replace(/"/g,"%22") + '")'; }

  function ensure(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    if (!state.settings.confidentialNotice) state.settings.confidentialNotice = "DOCUMENTO RISERVATO - PARMITALIA DISTRIBUTION SRL";
    if (!state.settings.backgroundLogoOpacity) state.settings.backgroundLogoOpacity = "0.075";
  }
  function css(){
    if (document.getElementById("pms-v106-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v106-style";
    s.textContent = `
      body.pms106-ui .sidebar{
        width:304px;
        background:
          radial-gradient(circle at 50% 120px, rgba(34,211,238,.24), transparent 165px),
          linear-gradient(180deg,#061a2d 0%,#0b1220 58%,#08111f 100%)!important;
        border-right:1px solid rgba(125,211,252,.20);
        box-shadow:18px 0 48px rgba(15,23,42,.18);
        overflow:hidden;
      }
      body.pms106-ui .sidebar::before{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        opacity:.28;
        background-image:
          linear-gradient(rgba(125,211,252,.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(125,211,252,.07) 1px, transparent 1px);
        background-size:22px 22px;
        mask-image:linear-gradient(#000,transparent 82%);
      }
      body.pms106-ui .sidebar-brand{position:relative;z-index:2;border-bottom:1px solid rgba(125,211,252,.22)}
      .pms106-brand-logo{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:rgba(255,255,255,.08);border:1px solid rgba(125,211,252,.35)}
      .pms106-brand-logo img{width:100%;height:100%;object-fit:contain;background:#fff}
      .pms106-hub{position:relative;z-index:2;margin:14px 0 16px;padding:12px;border:1px solid rgba(125,211,252,.22);border-radius:8px;background:rgba(8,25,43,.62);box-shadow:inset 0 0 38px rgba(14,165,233,.12)}
      .pms106-globe{position:relative;width:164px;height:164px;margin:0 auto 12px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#e0f2fe 0,#38bdf8 10%,#0f766e 34%,#0f2f4a 65%,#061627 100%);box-shadow:0 0 0 1px rgba(125,211,252,.45),0 0 34px rgba(56,189,248,.28),inset -22px -24px 38px rgba(2,6,23,.42);overflow:hidden}
      .pms106-globe::before{content:"";position:absolute;inset:12px;border-radius:50%;background:repeating-linear-gradient(90deg,transparent 0 17px,rgba(255,255,255,.28) 18px 19px,transparent 20px 34px),repeating-linear-gradient(0deg,transparent 0 22px,rgba(255,255,255,.22) 23px 24px,transparent 25px 45px);mix-blend-mode:screen;opacity:.7}
      .pms106-globe::after{content:"";position:absolute;inset:-22%;border-radius:50%;border:2px solid rgba(186,230,253,.48);transform:rotate(-26deg) scaleX(.46)}
      .pms106-globe-core{display:none!important;content:""!important;color:transparent!important;font-size:0!important}
      .pms106-globe-label{margin:0 auto 10px;width:210px;max-width:100%;padding:6px 9px;border-radius:7px;border:1px solid rgba(125,211,252,.48);background:linear-gradient(180deg,rgba(2,6,23,.86),rgba(8,25,43,.70));color:#e0f2fe;font-size:12px;line-height:1.12;font-weight:900;text-align:center;text-transform:uppercase;letter-spacing:.06em;text-shadow:0 0 6px rgba(224,242,254,.95),0 0 14px rgba(56,189,248,.92),0 0 28px rgba(14,165,233,.72);box-shadow:0 0 0 1px rgba(186,230,253,.12),0 0 18px rgba(56,189,248,.34),inset 0 0 18px rgba(14,165,233,.18)}
      .pms106-orbit{position:absolute;inset:0;animation:pms106-spin 42s linear infinite;pointer-events:none}
      .pms106-orbit i{position:absolute;left:50%;top:50%;width:5px;height:5px;border-radius:50%;background:#bae6fd;box-shadow:0 0 11px #67e8f9}
      .pms106-orbit i:nth-child(1){transform:rotate(18deg) translateX(86px)}
      .pms106-orbit i:nth-child(2){transform:rotate(92deg) translateX(82px)}
      .pms106-orbit i:nth-child(3){transform:rotate(176deg) translateX(88px)}
      .pms106-orbit i:nth-child(4){transform:rotate(264deg) translateX(80px)}
      @keyframes pms106-spin{to{transform:rotate(360deg)}}
      .pms106-wheel{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
      .pms106-wheel button{height:36px;border:1px solid rgba(125,211,252,.28);background:rgba(15,47,74,.62);color:#dbeafe;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:0;cursor:pointer}
      .pms106-wheel button:hover,.pms106-wheel button.active{background:#e0f2fe;color:#082f49;border-color:#bae6fd}
      body.pms106-ui #nav{position:relative;z-index:2;gap:7px;padding-right:0}
      body.pms106-ui .nav-button{border:1px solid rgba(125,211,252,.16);background:rgba(15,23,42,.32);border-radius:8px;padding:10px 11px;color:#cbd5e1;display:flex;align-items:center;gap:9px;min-height:42px}
      body.pms106-ui .nav-button::before{content:attr(data-code);display:inline-grid;place-items:center;min-width:34px;height:24px;border-radius:999px;background:rgba(14,165,233,.14);border:1px solid rgba(125,211,252,.24);color:#bae6fd;font-size:10px;font-weight:900}
      body.pms106-ui .nav-button:hover,body.pms106-ui .nav-button.active{background:linear-gradient(90deg,rgba(14,165,233,.30),rgba(15,23,42,.42));color:#fff;border-color:rgba(186,230,253,.44)}
      body.pms106-ui .main{position:relative;isolation:isolate}
      body.pms106-ui .main::before{content:"";position:fixed;right:6vw;bottom:5vh;width:min(52vw,620px);height:min(52vw,620px);background-image:var(--pms106-bg-logo);background-repeat:no-repeat;background-position:center;background-size:contain;opacity:var(--pms106-bg-opacity);pointer-events:none;z-index:0;filter:saturate(.9)}
      body.pms106-ui .topbar,body.pms106-ui #content{position:relative;z-index:1}
      .pms106-settings-note{grid-column:1/-1;border:1px solid var(--line);border-radius:8px;background:#f8fafc;padding:12px}
      .pms106-settings-note h4{margin:0 0 8px}
      .pms106-bg-preview{height:84px;border:1px dashed #94a3b8;border-radius:8px;display:grid;place-items:center;background:#fff;overflow:hidden}
      .pms106-bg-preview img{max-width:100%;max-height:78px;object-fit:contain;opacity:.55}
      #print-root .print-document{position:relative;overflow:hidden}
      #print-root .pms106-print-secure::before{content:"";position:absolute;inset:18mm 8mm auto auto;width:88mm;height:88mm;background-image:var(--pms106-bg-logo);background-size:contain;background-repeat:no-repeat;background-position:center;opacity:calc(var(--pms106-bg-opacity) + .015);pointer-events:none;z-index:0}
      #print-root .pms106-print-secure > *{position:relative;z-index:1}
      #print-root .pms106-confidential-band{border:1px solid #0f2f4a;background:#eef6ff;color:#0f2f4a;font-size:8.8pt;font-weight:900;text-transform:uppercase;letter-spacing:0;padding:2.2mm 3mm;margin:0 0 4mm;display:flex;justify-content:space-between;gap:5mm}
      #print-root .pms106-confidential-band span:last-child{font-weight:700;color:#475569}
      @media(max-width:780px){body.pms106-ui .sidebar{width:100%}.pms106-hub{margin:10px 0}.pms106-globe{width:132px;height:132px}.pms106-wheel{grid-template-columns:repeat(4,1fr)}}
      @media print{#print-root .pms106-confidential-band{break-inside:avoid}.pms106-hub{display:none!important}}
    `;
    document.head.appendChild(s);
  }
  function applyVars(){
    ensure(); css();
    const src = logo();
    document.body.classList.add("pms106-ui");
    document.documentElement.style.setProperty("--pms106-bg-logo", src ? cssUrl(src) : "none");
    document.documentElement.style.setProperty("--pms106-bg-opacity", String(opacity()));
  }
  function codeFor(m){ return m.code || CODE[m.id] || String(m.label || m.id || "MOD").slice(0,3).toUpperCase(); }
  function decorateBrand(){
    const brand = document.querySelector(".sidebar-brand .brand-mark, .sidebar-brand .pms106-brand-logo");
    if (!brand) return;
    const src = state.settings?.logoUrl || "";
    const wrap = document.createElement("div");
    wrap.className = "pms106-brand-logo";
    wrap.innerHTML = src ? '<img src="' + esc(src) + '" alt="Parmitalia">' : "P";
    brand.replaceWith(wrap);
  }
  function decorateNav(){
    applyVars();
    decorateBrand();
    const allModules = typeof modules !== "undefined" ? modules : [];
    document.querySelectorAll(".nav-button").forEach(btn => {
      const page = btn.dataset.page;
      const m = arr(allModules).find(x => x.id === page);
      btn.dataset.code = m ? codeFor(m) : (CODE[page] || "MOD");
    });
    const nav = document.getElementById("nav");
    if (!nav || document.getElementById("pms106-hub")) return;
    const visible = arr(allModules).filter(m => arr(m.roles).includes(current?.role));
    const quick = QUICK.map(id => visible.find(m => m.id === id)).filter(Boolean).concat(visible.filter(m => !QUICK.includes(m.id))).slice(0,10);
    const hub = document.createElement("div");
    hub.id = "pms106-hub";
    hub.className = "pms106-hub";
    hub.innerHTML = '<div class="pms106-globe"><div class="pms106-orbit"><i></i><i></i><i></i><i></i></div><div class="pms106-globe-core"></div></div><div class="pms106-globe-label">Parmitalia Distribution SRL</div><div class="pms106-wheel">' + quick.map(m => '<button type="button" data-pms106-wheel="' + esc(m.id) + '" title="' + esc(m.label) + '">' + esc(codeFor(m)) + '</button>').join("") + '</div>';
    nav.parentElement.insertBefore(hub,nav);
    hub.querySelectorAll("[data-pms106-wheel]").forEach(btn => {
      btn.onclick = () => typeof setPage === "function" ? setPage(btn.dataset.pms106Wheel) : null;
    });
    syncWheel();
  }
  function syncWheel(){
    document.querySelectorAll("[data-pms106-wheel]").forEach(btn => btn.classList.toggle("active", btn.dataset.pms106Wheel === current?.page));
  }
  function settingsFields(){
    const s = state.settings || {};
    const bg = s.backgroundLogoUrl || "";
    const preview = bg || s.logoUrl || "";
    return '<div class="pms106-settings-note"><h4>Logo di sfondo pagine e stampe</h4><p class="muted-small">Puoi usare un logo diverso come filigrana sulle pagine e sui PDF. Se lasci vuoto, viene usato il logo aziendale.</p></div>' +
      '<div><label>Logo sfondo pagine</label><input name="backgroundLogoUrl" value="' + esc(bg) + '" placeholder="URL immagine oppure lascia vuoto per usare il logo aziendale"><div class="template-actions"><button type="button" class="secondary-button" data-pms106-use-company-logo>Usa logo aziendale</button><button type="button" class="secondary-button" data-pms106-clear-bg>Rimuovi sfondo</button></div></div>' +
      '<div><label>Anteprima sfondo</label><div class="pms106-bg-preview" id="pms106-bg-preview">' + (preview ? '<img src="' + esc(preview) + '" alt="Sfondo">' : "Nessun logo sfondo") + '</div></div>' +
      '<div><label>Opacita sfondo</label><input name="backgroundLogoOpacity" type="number" min="0.03" max="0.22" step="0.005" value="' + esc(s.backgroundLogoOpacity || "0.075") + '"></div>' +
      '<div><label>Dicitura documenti</label><input name="confidentialNotice" value="' + esc(s.confidentialNotice || "DOCUMENTO RISERVATO - PARMITALIA DISTRIBUTION SRL") + '"></div>';
  }
  function bindSettings(){
    const form = document.getElementById("settings-form");
    if (!form || form.dataset.pms106 === "1") return;
    form.dataset.pms106 = "1";
    const bg = form.elements.backgroundLogoUrl;
    const op = form.elements.backgroundLogoOpacity;
    const preview = document.getElementById("pms106-bg-preview");
    function updatePreview(){
      const src = (bg && bg.value.trim()) || form.elements.logoUrl?.value || "";
      if (preview) preview.innerHTML = src ? '<img src="' + esc(src) + '" alt="Sfondo">' : "Nessun logo sfondo";
      if (op) state.settings.backgroundLogoOpacity = op.value || "0.075";
      if (bg) state.settings.backgroundLogoUrl = bg.value || "";
      applyVars();
    }
    document.querySelector("[data-pms106-use-company-logo]")?.addEventListener("click", e => {
      e.preventDefault();
      if (bg) bg.value = form.elements.logoUrl?.value || "";
      updatePreview();
    });
    document.querySelector("[data-pms106-clear-bg]")?.addEventListener("click", e => {
      e.preventDefault();
      if (bg) bg.value = "";
      updatePreview();
    });
    if (bg) bg.oninput = updatePreview;
    if (op) op.oninput = updatePreview;
  }
  function decoratePrintHtml(html){
    ensure();
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    template.content.querySelectorAll(".print-document").forEach(doc => {
      doc.classList.add("pms106-print-secure");
      if (!doc.querySelector(":scope > .pms106-confidential-band")) {
        const band = document.createElement("div");
        band.className = "pms106-confidential-band";
        band.innerHTML = '<strong>' + esc(notice()) + '</strong><span>Uso controllato / archivio Parmitalia</span>';
        doc.insertBefore(band,doc.firstChild);
      }
      if (!doc.querySelector(":scope > .pms106-print-watermark-source")) {
        const src = logo();
        if (src) doc.setAttribute("data-pms106-watermark","1");
      }
    });
    return template.innerHTML;
  }

  const baseRenderNav = typeof renderNav === "function" ? renderNav : null;
  if (baseRenderNav && !window.__pms106NavWrapped) {
    window.__pms106NavWrapped = true;
    renderNav = function(){
      const r = baseRenderNav.apply(this,arguments);
      decorateNav();
      return r;
    };
  }
  const baseSetPage = typeof setPage === "function" ? setPage : null;
  if (baseSetPage && !window.__pms106SetPageWrapped) {
    window.__pms106SetPageWrapped = true;
    setPage = function(){
      const r = baseSetPage.apply(this,arguments);
      setTimeout(() => { applyVars(); syncWheel(); },20);
      return r;
    };
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms106RenderWrapped) {
    window.__pms106RenderWrapped = true;
    render = function(){
      const r = baseRender.apply(this,arguments);
      setTimeout(() => { applyVars(); decorateNav(); bindSettings(); syncWheel(); },30);
      return r;
    };
  }
  const baseRenderSettings = typeof renderSettings === "function" ? renderSettings : null;
  if (baseRenderSettings && !window.__pms106SettingsWrapped) {
    window.__pms106SettingsWrapped = true;
    renderSettings = function(){
      let html = baseRenderSettings.apply(this,arguments);
      if (html.indexOf('name="backgroundLogoUrl"') < 0) html = html.replace("</form>", settingsFields() + "</form>");
      return html;
    };
  }
  const baseSaveSettings = typeof saveSettings === "function" ? saveSettings : null;
  if (baseSaveSettings && !window.__pms106SaveSettingsWrapped) {
    window.__pms106SaveSettingsWrapped = true;
    saveSettings = function(){
      const r = baseSaveSettings.apply(this,arguments);
      ensure();
      saveState();
      applyVars();
      setTimeout(bindSettings,20);
      return r;
    };
  }
  const baseOpenPrint = typeof openPrint === "function" ? openPrint : null;
  if (baseOpenPrint && !window.__pms106PrintWrapped) {
    window.__pms106PrintWrapped = true;
    openPrint = function(innerHtml){
      applyVars();
      return baseOpenPrint.call(this,decoratePrintHtml(innerHtml));
    };
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !window.__pms106BindWrapped) {
    window.__pms106BindWrapped = true;
    bindPageActions = function(){ const r = baseBind.apply(this,arguments); setTimeout(() => { decorateNav(); bindSettings(); applyVars(); },20); return r; };
  }
  ensure(); css(); applyVars(); setTimeout(() => { decorateNav(); bindSettings(); },120);
  window.pmsV106FuturisticMenu = {version:VERSION,decorateNav,decoratePrintHtml};
})();
