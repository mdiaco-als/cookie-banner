// cookie-consent.js — SVG icons, modal docs, blur, GTM event, no emoji
(function () {
  "use strict";
  try {
    console.log("[cookie-consent] init");

    // ======= CONFIG (overridable via window.CC_CONFIG) =======
    var cfg = (window.CC_CONFIG || {});
    var PRIVACY_URL = cfg.privacy || "#";
    var COOKIE_URL  = cfg.cookie  || "#";
    var COOKIE_NAME = cfg.name || "illow-consent-d65e161a-df13-4344-bde3-d7e22f62d93c";
    var COOKIE_DAYS = (typeof cfg.days === "number") ? cfg.days : 180;
    var OPEN_DOCS_IN_MODAL = (typeof cfg.openDocsInModal === "boolean") ? cfg.openDocsInModal : true;

    // ======= UTILS =======
    function setCookie(n, v, days) {
      var e = "";
      if (days) {
        var d = new Date();
        d.setTime(d.getTime() + (days * 864e5));
        e = "; expires=" + d.toUTCString();
      }
      document.cookie = n + "=" + encodeURIComponent(v) + e + "; path=/; SameSite=Lax";
    }
    function getCookie(n) {
      var k = n + "=", arr = document.cookie.split(";");
      for (var i = 0; i < arr.length; i++) {
        var c = arr[i].trim();
        if (c.indexOf(k) === 0) return decodeURIComponent(c.substring(k.length));
      }
      return null;
    }
    function pushConsentEvent() {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "illow_consent" });
      console.log("[cookie-consent] pushed: illow_consent");
    }

    // Se già presente consenso, non mostrare nulla
    if (getCookie(COOKIE_NAME)) {
      console.log("[cookie-consent] cookie found, skipping banner");
      return;
    }

    // ======= ICONS (SVG inline) =======
    var icoCookie = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10a4 4 0 0 1-4-4a4 4 0 0 1-4-4Z"/><circle cx="8" cy="10" r="1.5" fill="#fff"/><circle cx="14" cy="14" r="1.5" fill="#fff"/><circle cx="10.5" cy="16" r="1" fill="#fff"/></svg>';
    var icoWrench = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22 7.46a5 5 0 0 1-6.53 6.53l-7.2 7.2a2 2 0 0 1-2.83 0l-1.63-1.63a2 2 0 0 1 0-2.83l7.2-7.2A5 5 0 0 1 22 7.46Z"/></svg>';
    var icoPage   = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path fill="currentColor" d="M14 2v6h6"/></svg>';
    var icoCross  = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path stroke="currentColor" stroke-width="2" fill="none" d="M6 6l12 12M18 6L6 18"/></svg>';

    // ======= CSS =======
    var css = ""
      + "#cc-backdrop{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.25);"
      + "backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}"
      + "#cc-banner{position:fixed;left:0;right:0;bottom:0;z-index:100001;background:#fff;color:#111;"
      + "border-top:4px solid #2e7d32;box-shadow:0 -2px 8px rgba(0,0,0,.2);padding:16px;"
      + "font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif}"
      + "#cc-banner h3{margin:0 0 8px;color:#2e7d32;font-size:18px}"
      + "#cc-banner p{margin:6px 0;font-size:14px;line-height:1.45;display:flex;gap:6px;align-items:flex-start}"
      + "#cc-actions{margin-top:8px}"
      + "#cc-actions button{padding:8px 12px;margin:4px;border-radius:8px;border:0;font-weight:700;cursor:pointer}"
      + "#cc-accept{background:#2e7d32;color:#fff}"
      + "#cc-manage{background:#e0e0e0}"
      + "#cc-close{position:absolute;top:6px;right:10px;background:transparent;border:0;font-size:18px;cursor:pointer}"
      + "#cc-links{font-size:12px;margin-top:6px}"
      + "#cc-links a{color:#2e7d32;text-decoration:underline;margin-right:8px}"
      + "#cc-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:100002;background:rgba(0,0,0,.6)}"
      + "#cc-card{background:#fff;color:#111;max-width:520px;width:92%;border-radius:10px;padding:16px}"
      + "#cc-card h3{margin:0 0 8px}"
      + ".cc-row{display:flex;align-items:center;gap:8px;margin:8px 0}"
      + ".cc-row input{transform:scale(1.2)}"
      + "#cc-save{background:#2e7d32;color:#fff;padding:8px 12px;border:0;border-radius:8px;font-weight:700;cursor:pointer;margin-right:8px}"
      + "#cc-cancel{background:#e0e0e0;padding:8px 12px;border:0;border-radius:8px;cursor:pointer}"
      + "#cc-docs{position:fixed;inset:0;z-index:100003;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center}"
      + "#cc-docs-card{background:#fff;color:#111;max-width:900px;width:96%;height:80vh;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden}"
      + "#cc-docs-head{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #eee;font-weight:700}"
      + "#cc-docs-iframe{flex:1;width:100%;border:0}"
      + "#cc-docs-close{background:#e0e0e0;border:0;border-radius:8px;padding:6px 10px;cursor:pointer}";

    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    // ======= DOM =======
    var backdrop = document.createElement("div");
    backdrop.id = "cc-backdrop";

    var banner = document.createElement("div");
    banner.id = "cc-banner";

    // Modale documenti (privacy/cookie)
    var docsOverlay = document.createElement("div");
    docsOverlay.id = "cc-docs";
    docsOverlay.innerHTML = (
      '<div id="cc-docs-card" role="dialog" aria-modal="true" aria-labelledby="cc-docs-title">'
      +   '<div id="cc-docs-head">'
      +     '<span id="cc-docs-title">Informativa</span>'
      +     '<button id="cc-docs-close">Chiudi</button>'
      +   '</div>'
      +   '<iframe id="cc-docs-iframe" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" referrerpolicy="no-referrer"></iframe>'
      + '</div>'
    );

    banner.innerHTML = (
      '<button id="cc-close" aria-label="Chiudi">✖</button>'
      + '<h3>Questo sito utilizza cookies per migliorare l\'esperienza.</h3>'
      + '<p>' + icoCookie + '<span>Usiamo cookies per analisi del traffico, annunci e funzioni social.</span></p>'
      + '<p>' + icoWrench + '<span>Per funzioni complete, è possibile consentire tutti i cookies in conformità alla policy.</span></p>'
      + '<p>' + icoPage   + '<span>Preferenze modificabili in qualsiasi momento.</span></p>'
      + '<p>' + icoCross  + '<span>Chiusura con la X lascia attivi solo quelli tecnici.</span></p>'
      + '<div id="cc-actions">'
      +   '<button id="cc-manage">Gestisci le impostazioni</button>'
      +   '<button id="cc-accept">Accetta tutti</button>'
      + '</div>'
      + '<div id="cc-links">'
      +   '<a id="cc-privacy" href="' + PRIVACY_URL + '">Informativa sulla privacy</a>'
      +   '<a id="cc-cookie"  href="' + COOKIE_URL  + '">Informativa sui cookie</a>'
      + '</div>'
    );

    var modal = document.createElement("div");
    modal.id = "cc-modal";
    modal.innerHTML = (
      '<div id="cc-card" role="dialog" aria-modal="true" aria-labelledby="cc-title">'
      +  '<h3 id="cc-title">Preferenze Cookie</h3>'
      +  '<div class="cc-row"><input id="cc-marketing" type="checkbox"><label for="cc-marketing">Marketing</label></div>'
      +  '<div class="cc-row"><input id="cc-statistics" type="checkbox"><label for="cc-statistics">Statistiche</label></div>'
      +  '<div style="margin-top:8px">'
      +    '<button id="cc-save">Salva preferenze</button>'
      +    '<button id="cc-cancel">Annulla</button>'
      +  '</div>'
      + '</div>'
    );

    // Inserimento nel body quando pronto
    function mount() {
      if (document.body) {
        document.body.appendChild(backdrop);
        document.body.appendChild(banner);
        document.body.appendChild(modal);
        document.body.appendChild(docsOverlay);
        wire();
      } else {
        document.addEventListener("DOMContentLoaded", mount, { once: true });
      }
    }

    // ======= LOGICA =======
    function store(mark, stat) {
      setCookie(COOKIE_NAME, "marketing=" + mark + "&statistics=" + stat, COOKIE_DAYS);
      pushConsentEvent();
    }
    function closeAll() {
      try { banner.remove(); }   catch(e){ if (banner.parentNode)   banner.parentNode.removeChild(banner); }
      try { backdrop.remove(); } catch(e){ if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); }
      try { modal.remove(); }    catch(e){ if (modal.parentNode)    modal.parentNode.removeChild(modal); }
      try { docsOverlay.remove(); } catch(e){ if (docsOverlay.parentNode) docsOverlay.parentNode.removeChild(docsOverlay); }
      console.log("[cookie-consent] UI removed");
    }
    function showModal() { modal.style.display = "flex"; }
    function hideModal() { modal.style.display = "none"; }

    function openDocs(url, title){
      if (!OPEN_DOCS_IN_MODAL) { window.open(url, "_blank", "noopener"); return; }
      document.getElementById("cc-docs-title").textContent = title || "Informativa";
      document.getElementById("cc-docs-iframe").src = url;
      banner.style.display = "none";
      docsOverlay.style.display = "flex";
      backdrop.style.display = "block";
    }
    function closeDocs(){
      var ifr = document.getElementById("cc-docs-iframe");
      if (ifr) ifr.removeAttribute("src");
      docsOverlay.style.display = "none";
      banner.style.display = "block";
      backdrop.style.display = "block";
    }

    function wire() {
      document.getElementById("cc-accept").addEventListener("click", function () {
        store(true, true);
        hideModal();
        closeAll();
      });
      document.getElementById("cc-close").addEventListener("click", function () {
        store(false, false);
        closeAll();
      });
      document.getElementById("cc-manage").addEventListener("click", showModal);
      document.getElementById("cc-cancel").addEventListener("click", hideModal);
      document.getElementById("cc-save").addEventListener("click", function () {
        var m = document.getElementById("cc-marketing").checked;
        var s = document.getElementById("cc-statistics").checked;
        store(m, s);
        hideModal();
        closeAll();
      });

      // Link privacy/cookie → modale
      document.getElementById("cc-privacy").addEventListener("click", function(e){
        e.preventDefault(); openDocs(PRIVACY_URL, "Informativa sulla privacy");
      });
      document.getElementById("cc-cookie").addEventListener("click", function(e){
        e.preventDefault(); openDocs(COOKIE_URL, "Informativa sui cookie");
      });
      // Chiudi modale documenti
      document.getElementById("cc-docs-close").addEventListener("click", closeDocs);

      console.log("[cookie-consent] UI mounted");
    }

    mount();

    // API per riaprire preferenze dal footer
    window.CC_openConsent = function () {
      if (!document.body.contains(modal)) document.body.appendChild(modal);
      showModal();
    };
  } catch (err) {
    console.error("[cookie-consent] fatal error:", err);
  }
})();
