(function () {
  "use strict";

  if (window.PMS_V228_LOGIN_UNLOCK_DEMO) return;

  var VERSION = "pms_v228_login_unlock_demo";

  function unlock() {
    var button = document.getElementById("login-button");
    if (!button) return;
    button.disabled = false;
    button.textContent = "Accedi";
    button.style.pointerEvents = "auto";
    button.onclick = function (event) {
      if (event) event.preventDefault();
      try {
        if (typeof login === "function") login();
      } catch (error) {
        console.warn(VERSION + " login click failed", error);
      }
    };
  }

  function install() {
    unlock();
    [100, 300, 700, 1500, 3000].forEach(function (ms) { setTimeout(unlock, ms); });
    console.info(VERSION + " loaded");
  }

  window.PMS_V228_LOGIN_UNLOCK_DEMO = { version: VERSION, unlock: unlock };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
