(function () {
  "use strict";
  try {
    console.log("[cookie-consent] init");

    var COOKIE_NAME = "cc_cookie";
    var COOKIE_DAYS = 180;

    // ======= CSS =======
    var css =
      "" +
      "#cc-backdrop{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:100001;display:none}" +
      "#cc-banner{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);max-width:640px;width:90%;background:#fff;border-radius:12px;padding:20px;z-index:100002;box-shadow:0 6px 18px rgba(0,0,0,.2);font-family:sans-serif;line-height:1.4}" +
      "#cc-banner h3{margin-top:0;font-size:18px}" +
      "#cc-banner p{margin:8px 0}" +
      "#cc-banner .cc-actions{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap}" +
      "#cc-banner button{padding:10px 16px;border-radius:6px;border:none;cursor:pointer;font-size:14px}" +
      "#cc-accept{background:#0a7d0a;color:#fff}" +
      "#cc-reject{background:#ccc}" +
      "#cc-settings{background:#eee}" +
      "#cc-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:12px;max-width:600px;width:90%;z-index:100002;padding:20px;display:none;box-shadow:0 8px 24px rgba(0,0,0,.25)}" +
      "#cc-modal h3{margin-top:0}" +
      "#cc-modal .cc-options{margin:12px 0}" +
      "#cc-modal label{display:flex;align-items:center;margin-bottom:8px;cursor:pointer}" +
      "#cc-modal input{margin-right:8px}" +
      "#cc-modal .cc-actions{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap}" +
      "#cc-modal button{padding:10px 16px;border-radius:6px;border:none;cursor:pointer;font-size:14px}" +
      "#cc-save{background:#0a7d0a;color:#fff}" +
      "#cc-close{background:#ccc}" +
      "#cc-float{position:fixed;left:14px;bottom:14px;z-index:100003;width:56px;height:56px;border-radius:50%;background:#fff;border:1px solid rgba(0,0,0,.08);box-shadow:0 6px 18px rgba(0,0,0,.18);display:none;align-items:center;justify-content:center;cursor:pointer;padding:0}" +
      "#cc-float img{display:block;width:28px;height:28px}" +
      "#cc-float:focus-visible{outline:2px solid #8dd;outline-offset:3px}" +
      "@media(max-width:480px){#cc-float{left:12px;bottom:12px;width:52px;height:52px}#cc-float img{width:26px;height:26px}}";

    // ======= Utility =======
    function setCookie(name, value, days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 86400000);
      document.cookie =
        name + "=" + value + ";expires=" + d.toUTCString() + ";path=/;SameSite=Lax";
    }
    function getCookie(name) {
      var m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return m ? m[2] : null;
    }

    // ======= Create DOM =======
    var backdrop = document.createElement("div");
    backdrop.id = "cc-backdrop";

    var banner = document.createElement("div");
    banner.id = "cc-banner";
    banner.innerHTML =
      '<h3>Gestione Cookie</h3><p>Utilizziamo cookie per ottimizzare la navigazione e analizzare il traffico. Può accettare o modificare le preferenze.</p>' +
      '<div class="cc-actions">' +
      '<button id="cc-accept">Accetta</button>' +
      '<button id="cc-settings">Preferenze</button>' +
      "</div>";

    var modal = document.createElement("div");
    modal.id = "cc-modal";
    modal.innerHTML =
      '<h3>Preferenze Cookie</h3>' +
      '<div class="cc-options">' +
      '<label><input type="checkbox" id="cc-mandatory" checked disabled> Necessari (sempre attivi)</label>' +
      '<label><input type="checkbox" id="cc-stats"> Statistiche</label>' +
      "</div>" +
      '<div class="cc-actions">' +
      '<button id="cc-save">Salva</button>' +
      '<button id="cc-close">Chiudi</button>' +
      "</div>";

    var floatBtn = document.createElement("button");
    floatBtn.id = "cc-float";
    floatBtn.type = "button";
    floatBtn.setAttribute("aria-label", "Gestisci preferenze cookie");
    floatBtn.innerHTML =
      '<img alt="" src="https://global-files-nginx.builderall.com/da739884-a644-464d-b30b-7e2e5b966fbb/a60de57d4e84cb87174fb85c09720464b33a89b0d87e5298e03206d1eee707bc.svg">';
    floatBtn.addEventListener("click", function () {
      window.CC_openConsent();
    });

    // ======= Funzioni Modal =======
    function showBanner() {
      backdrop.style.display = "block";
      banner.style.display = "block";
    }
    function hideBanner() {
      backdrop.style.display = "none";
      banner.style.display = "none";
    }
    function showModal() {
      backdrop.style.display = "block";
      modal.style.display = "block";
    }
    function hideModal() {
      backdrop.style.display = "none";
      modal.style.display = "none";
    }
    function showFloat() {
      floatBtn && (floatBtn.style.display = "inline-flex");
    }
    function hideFloat() {
      floatBtn && (floatBtn.style.display = "none");
    }

    function store(all, stats) {
      setCookie(COOKIE_NAME, JSON.stringify({ all: all, stats: stats }), COOKIE_DAYS);
    }

    // ======= Mount =======
    function mount() {
      var style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      document.body.appendChild(backdrop);
      document.body.appendChild(banner);
      document.body.appendChild(modal);
      document.body.appendChild(floatBtn);

      // Se già presente consenso → mostra solo bottone
      if (getCookie(COOKIE_NAME)) {
        showFloat();
        console.log("[cookie-consent] cookie found, skipping banner");
        return;
      }

      showBanner();

      // Eventi
      document.getElementById("cc-accept").addEventListener("click", function () {
        store(true, true);
        showFloat();
        hideBanner();
        hideModal();
      });
      document.getElementById("cc-settings").addEventListener("click", function () {
        hideBanner();
        showModal();
      });
      document.getElementById("cc-save").addEventListener("click", function () {
        var s = document.getElementById("cc-stats").checked;
        store(true, s);
        showFloat();
        hideModal();
      });
      document.getElementById("cc-close").addEventListener("click", function () {
        store(false, false);
        showFloat();
        hideModal();
      });
    }

    // API pubblica per riaprire preferenze
    window.CC_openConsent = function () {
      showModal();
    };

    // Ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount);
    } else {
      mount();
    }
  } catch (e) {
    console.error("[cookie-consent] error", e);
  }
})();
