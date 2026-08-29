(function(){
  "use strict";

  const VERSION = "pms_v194_parmitalia_faded_logo_background";
  const LOGO_PATH = "assets/parmitalia_logo_background.jpeg";

  function cssUrl(value){
    return 'url("' + String(value || "").replace(/\\/g, "/").replace(/"/g, "%22") + '")';
  }

  function injectCss(){
    let style = document.getElementById("pms-v194-parmitalia-background-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v194-parmitalia-background-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      :root{--pms194-logo-bg:${cssUrl(LOGO_PATH)}}
      body.pms194-parmitalia-logo-bg{
        background:linear-gradient(120deg,rgba(245,250,247,.96),rgba(248,250,252,.98) 46%,rgba(252,247,247,.96))!important;
      }
      body.pms194-parmitalia-logo-bg .main{
        position:relative!important;
        isolation:isolate!important;
        background:
          radial-gradient(circle at 18% 8%,rgba(0,146,70,.075),transparent 30%),
          radial-gradient(circle at 88% 20%,rgba(206,43,55,.055),transparent 28%),
          linear-gradient(180deg,rgba(255,255,255,.58),rgba(246,249,247,.88))!important;
        overflow:hidden!important;
      }
      body.pms194-parmitalia-logo-bg .main::before{
        content:""!important;
        position:fixed!important;
        inset:0!important;
        z-index:0!important;
        pointer-events:none!important;
        background-image:var(--pms194-logo-bg)!important;
        background-repeat:no-repeat!important;
        background-position:center 54%!important;
        background-size:min(58vw,760px) auto!important;
        opacity:.105!important;
        filter:blur(1.15px) saturate(.82) contrast(.96)!important;
        transform:scale(1.015)!important;
      }
      body.pms194-parmitalia-logo-bg .main::after{
        content:""!important;
        position:fixed!important;
        inset:0!important;
        z-index:1!important;
        pointer-events:none!important;
        background:
          linear-gradient(90deg,rgba(0,146,70,.045),rgba(255,255,255,.52) 36%,rgba(255,255,255,.48) 64%,rgba(206,43,55,.04)),
          radial-gradient(circle at center,rgba(255,255,255,.12),rgba(255,255,255,.72) 68%,rgba(255,255,255,.88))!important;
      }
      body.pms194-parmitalia-logo-bg .topbar,
      body.pms194-parmitalia-logo-bg #content,
      body.pms194-parmitalia-logo-bg .modal,
      body.pms194-parmitalia-logo-bg #print-root{
        position:relative!important;
        z-index:3!important;
      }
      body.pms194-parmitalia-logo-bg .topbar{
        background:rgba(244,247,251,.88)!important;
        backdrop-filter:blur(8px)!important;
      }
      body.pms194-parmitalia-logo-bg .card,
      body.pms194-parmitalia-logo-bg .table-wrap,
      body.pms194-parmitalia-logo-bg .modal-card,
      body.pms194-parmitalia-logo-bg .preview-box,
      body.pms194-parmitalia-logo-bg .database-note{
        background:rgba(255,255,255,.93)!important;
      }
      body.pms194-parmitalia-logo-bg .sidebar{
        background:
          linear-gradient(180deg,rgba(15,35,56,.98),rgba(12,30,47,.99)),
          linear-gradient(90deg,rgba(0,146,70,.12),transparent 52%,rgba(206,43,55,.09))!important;
      }
      @media(max-width:900px){
        body.pms194-parmitalia-logo-bg .main::before{
          background-size:min(86vw,520px) auto!important;
          background-position:center 58%!important;
          opacity:.09!important;
        }
      }
      @media print{
        body.pms194-parmitalia-logo-bg .main::before,
        body.pms194-parmitalia-logo-bg .main::after{display:none!important}
      }
    `;
  }

  function apply(){
    injectCss();
    document.body.classList.add("pms194-parmitalia-logo-bg");
    document.documentElement.style.setProperty("--pms194-logo-bg", cssUrl(LOGO_PATH));
    document.documentElement.style.setProperty("--pms113-centered-logo", cssUrl(LOGO_PATH));
  }

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms194RenderWrapped) {
    window.__pms194RenderWrapped = true;
    render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(apply, 20);
      return result;
    };
  }

  const baseRenderNav = typeof renderNav === "function" ? renderNav : null;
  if (baseRenderNav && !window.__pms194RenderNavWrapped) {
    window.__pms194RenderNavWrapped = true;
    renderNav = function(){
      const result = baseRenderNav.apply(this, arguments);
      setTimeout(apply, 20);
      return result;
    };
  }

  apply();
  setTimeout(apply, 120);
  window.PMS_V194_PARMITALIA_FADED_LOGO_BACKGROUND = { version: VERSION, apply: apply, logoPath: LOGO_PATH };
})();
