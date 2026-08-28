(function(){
  "use strict";
  const VERSION = "PMS-V120-FORCE-VISIBLE-LED-TICKER";
  const LED_TEXT = "Parmitalia Distribution SRL";

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }

  function css(){
    if (document.getElementById("pms-v120-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v120-style";
    style.textContent = `
      .pms106-globe-core,.pms106-globe-label,.pms109-world-label,.pms109-led-sign,.pms113-led-sign{display:none!important;font-size:0!important;color:transparent!important;background:transparent!important;border:0!important;box-shadow:none!important}
      .pms120-led-sign{
        display:block!important;
        width:min(238px,calc(100% - 12px))!important;
        margin:12px auto 8px!important;
        padding:7px 10px!important;
        border-radius:7px!important;
        border:1px solid rgba(125,211,252,.58)!important;
        background:linear-gradient(180deg,rgba(2,6,23,.92),rgba(8,25,43,.76))!important;
        color:#e0f2fe!important;
        font-size:12px!important;
        line-height:1.12!important;
        font-weight:950!important;
        letter-spacing:.065em!important;
        text-align:center!important;
        text-transform:uppercase!important;
        text-shadow:0 0 6px rgba(224,242,254,1),0 0 14px rgba(56,189,248,.95),0 0 30px rgba(14,165,233,.78)!important;
        box-shadow:0 0 0 1px rgba(186,230,253,.16),0 0 22px rgba(56,189,248,.42),inset 0 0 20px rgba(14,165,233,.22)!important;
      }
      .pms120-fallback-hub{
        display:grid!important;
        place-items:center!important;
        padding:8px 0 14px!important;
        margin:0 0 6px!important;
        border-bottom:1px solid rgba(125,211,252,.18)!important;
        position:relative!important;
        z-index:4!important;
      }
      .pms120-fallback-globe{
        width:124px!important;
        height:124px!important;
        border-radius:50%!important;
        background:radial-gradient(circle at 30% 24%,#e0f2fe 0,#38bdf8 9%,#0f766e 34%,#0f2f4a 66%,#061627 100%)!important;
        box-shadow:0 0 0 1px rgba(186,230,253,.46),0 0 26px rgba(56,189,248,.30),inset -18px -20px 30px rgba(2,6,23,.42)!important;
        margin:0 auto!important;
      }
      .pms120-market-ticker{display:none!important}
      .pms105-ticker-track{animation-duration:140s!important}
      @media print{.pms120-market-ticker,.pms120-fallback-hub,.pms120-led-sign{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function removeWorld(){
    document.querySelectorAll(".pms106-globe-core,.pms106-globe-label,.pms109-world-label,.pms109-led-sign,.pms113-led-sign").forEach(el => {
      if (/world/i.test(el.textContent || "")) el.textContent = "";
      if (!el.classList.contains("pms106-globe-core") && !el.classList.contains("pms109-world-label")) el.remove();
    });
    document.querySelectorAll(".pms120-market-ticker").forEach(el => el.remove());
  }

  function forceLed(){
    css();
    removeWorld();
    const nav = document.getElementById("nav");
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar || !nav) return;
    const rotatingHost = document.querySelector(".pms109-hub");
    if (rotatingHost) {
      document.querySelectorAll(".pms106-hub,.pms120-fallback-hub").forEach(el => el.remove());
    }
    let host = rotatingHost || document.querySelector(".pms106-hub,.pms120-fallback-hub");
    if (!host) {
      host = document.createElement("div");
      host.className = "pms120-fallback-hub";
      host.innerHTML = '<div class="pms120-fallback-globe"></div>';
      sidebar.insertBefore(host,nav);
    }
    host.querySelectorAll(".pms120-led-sign").forEach((el,i) => { if (i) el.remove(); });
    let led = host.querySelector(".pms120-led-sign");
    if (!led) {
      led = document.createElement("div");
      led.className = "pms120-led-sign";
      host.appendChild(led);
    }
    led.textContent = LED_TEXT;
  }

  function autoSave(){
    try {
      if (typeof window.save === "function") {
        window.save();
        return true;
      }
      if (window.state && window.STORAGE_KEY) {
        localStorage.setItem(window.STORAGE_KEY,JSON.stringify(window.state));
        return true;
      }
    } catch(e) {
      console.warn("Autosave Parmitalia non riuscito",e);
    }
    return false;
  }

  function forceTicker(){
    css();
    document.querySelectorAll(".pms120-market-ticker").forEach(el => el.remove());
  }

  function apply(){
    forceLed();
    forceTicker();
  }

  function wrap(name,delay){
    const fn = window[name];
    if (typeof fn !== "function" || fn.__pms120Wrapped) return;
    window[name] = function(){
      const result = fn.apply(this,arguments);
      setTimeout(apply,delay);
      setTimeout(apply,delay + 120);
      return result;
    };
    window[name].__pms120Wrapped = true;
  }

  css();
  wrap("render",30);
  wrap("renderNav",30);
  wrap("setPage",40);
  window.addEventListener("beforeunload",autoSave);
  window.addEventListener("pagehide",autoSave);
  document.addEventListener("visibilitychange",() => { if (document.visibilityState === "hidden") autoSave(); });
  setInterval(autoSave,30000);
  setTimeout(apply,50);
  setTimeout(apply,300);
  setTimeout(apply,900);
  new MutationObserver(() => setTimeout(apply,20)).observe(document.documentElement,{childList:true,subtree:true});
  window.pmsV120ForceVisibleLedTicker = {version:VERSION,apply};
})();
