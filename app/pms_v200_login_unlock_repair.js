(function () {
  "use strict";

  function unlockLogin() {
    var button = document.getElementById("login-button");
    if (!button) return false;
    button.disabled = false;
    if (/caricamento/i.test(button.textContent || "")) button.textContent = "Entra";
    button.removeAttribute("aria-disabled");
    return true;
  }

  function install() {
    unlockLogin();
    var attempts = 0;
    var timer = setInterval(function () {
      attempts += 1;
      if (unlockLogin() || attempts > 40) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
