// cookie-consent.js — versione semplificata e funzionante (con fix scroll modale privacy)
(function () {
  "use strict";
  try {
    console.log("[cookie-consent] init");

    // ======= CONFIG =======
    var cfg = (window.CC_CONFIG || {});
    var PRIVACY_URL = cfg.privacy || "#";
    var COOKIE_URL  = cfg.cookie  || "#";
    var DATA_REQUEST_URL = cfg.dataRequest || null;
    var COOKIE_NAME = cfg.name || "illow-consent-d65e161a-df13-4344-bde3-d7e22f62d93c";
    var COOKIE_DAYS = (typeof cfg.days === "number") ? cfg.days : 180;
    var OPEN_DOCS_IN_MODAL = (typeof cfg.openDocsInModal === "boolean") ? cfg.openDocsInModal : true;

    // Skip iframe or policy pages
    var SKIP_IFRAME = true;
    var SKIP_PATHS = (Array.isArray(cfg.skipPaths) && cfg.skipPaths.length)
      ? cfg.skipPaths.map(function (p) { return new RegExp(p, "i"); })
      : [/privacy/i, /cookie/i, /cookie-policy/i];

    if (SKIP_IFRAME && window.top !== window.self) {
      console.log("[cookie-consent] in iframe -> skip");
      return;
    }
    for (var i = 0; i < SKIP_PATHS.length; i++) {
      if (SKIP_PATHS[i].test(location.pathname)) {
        console.log("[cookie-consent] policy page -> skip");
        return;
      }
    }

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
      for (var i2 = 0; i2 < arr.length; i2++) {
        var c = arr[i2].trim();
        if (c.indexOf(k) === 0) return decodeURIComponent(c.substring(k.length));
      }
      return null;
    }

    // GTM EVENTS
    function pushConsentEvent(eventName, consent) {
      window.dataLayer = window.dataLayer || [];
      var payload = { event: eventName };
      if (consent && typeof consent === "object") {
        payload.consent = {
          marketing: !!consent.marketing,
          statistics: !!consent.statistics
        };
      }
      window.dataLayer.push(payload);
      console.log("[cookie-consent] pushed:", payload);
    }

    // ======= CSS =======
    var css = `
      /* Banner principale - SEMPLICE */
      #cc-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100001;
        background: rgba(255,255,255,0.98);
        border-bottom: 2px solid #4caf50;
        padding: 12px 16px;
        color: #333;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        display: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      #cc-banner.cc-show { display: block; }
      
      /* Layout container */
      #cc-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 16px;
        position: relative;
      }
      
      /* Icona cookie */
      #cc-icon {
        flex: 0 0 auto;
        font-size: 24px;
        color: #4caf50;
      }
      
      /* Testo */
      #cc-text {
        flex: 1;
        min-width: 0;
      }
      #cc-title {
        margin: 0 0 4px 0;
        font-weight: 700;
        font-size: 15px;
        color: #2e7d32;
      }
      #cc-desc {
        margin: 0 0 4px 0;
        font-size: 14px;
        color: #555;
      }
      #cc-instr {
        margin: 0 0 6px 0;
        font-size: 13px;
        color: #666;
      }
      #cc-links {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      #cc-links a {
        color: #4caf50;
        text-decoration: none;
        font-size: 13px;
        padding: 2px 4px;
        border-radius: 3px;
      }
      #cc-links a:hover {
        background: rgba(76,175,80,0.1);
      }
      
      /* Bottoni */
      #cc-buttons {
        flex: 0 0 auto;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      #cc-buttons button {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      #cc-reject { background: #f44336; color: white; }
      #cc-reject:hover { background: #d32f2f; }
      #cc-accept { background: #4caf50; color: white; }
      #cc-accept:hover { background: #388e3c; }
      #cc-manage {
        background: #f5f5f5; color: #333; border: 1px solid #ddd;
        font-size: 13px; padding: 6px 12px;
      }
      #cc-manage:hover { background: #eee; }
      
      /* Close button */
      #cc-close {
        position: absolute; top: -6px; right: -6px;
        width: 24px; height: 24px; border: none; border-radius: 50%;
        background: rgba(0,0,0,0.1); color: #666; font-size: 12px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      }
      #cc-close:hover { background: rgba(0,0,0,0.2); color: #333; }
      
      /* MOBILE - layout verticale con bottoni 50% */
      @media (max-width: 768px) {
        #cc-container { flex-direction: column; align-items: stretch; gap: 12px; }
        #cc-header { display: flex; align-items: flex-start; gap: 10px; }
        #cc-icon { margin-top: 2px; }
        #cc-buttons { flex-direction: column; gap: 8px; width: 100%; }
        #cc-primary { display: flex; gap: 8px; width: 100%; }
        #cc-primary button {
          flex: 1 1 50%; min-width: 0; width: 100%;
          padding: 12px 8px; font-size: 14px; box-sizing: border-box;
        }
        #cc-manage { width: 100%; padding: 10px 16px; font-size: 14px; }
      }
      
      /* MOBILE piccolo */
      @media (max-width: 480px) {
        #cc-banner { padding: 10px 12px; }
        #cc-title { font-size: 14px; }
        #cc-desc { font-size: 13px; }
        #cc-instr, #cc-links a { font-size: 12px; }
        #cc-primary button { font-size: 13px; padding: 11px 8px; }
        #cc-manage { font-size: 13px; padding: 9px 14px; }
      }
      
      /* Backdrop per modali */
      #cc-backdrop {
        position: fixed; inset: 0; z-index: 100000;
        background: rgba(0,0,0,0.6); display: none; opacity: 0;
        transition: opacity 0.3s ease;
      }
      #cc-backdrop.cc-show { opacity: 1; }
      
      /* Modal preferenze */
      #cc-modal {
        position: fixed; inset: 0; z-index: 100002;
        display: none; align-items: center; justify-content: center;
      }
      #cc-card {
        background: white; border-radius: 12px; padding: 24px;
        max-width: 400px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      }
      #cc-card h3 { margin: 0 0 16px 0; color: #2e7d32; font-size: 18px; }
      .cc-row {
        display: flex; align-items: center; gap: 12px; margin: 12px 0;
        padding: 12px; background: #f9f9f9; border-radius: 8px;
      }
      .cc-row input { transform: scale(1.2); }
      .cc-row label { flex: 1; font-weight: 600; cursor: pointer; }
      #cc-modal-buttons { margin-top: 20px; display: flex; gap: 12px; }
      #cc-save {
        background: #4caf50; color: white; border: none;
        padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer;
      }
      #cc-cancel {
        background: #f5f5f5; color: #333; border: 1px solid #ddd;
        padding: 10px 20px; border-radius: 6px; cursor: pointer;
      }
      
      /* Modal docs */
      #cc-docs {
        position: fixed; inset: 0; z-index: 100003;
        background: rgba(0,0,0,0.6); display: none;
        align-items: center; justify-content: center;
      }
      #cc-docs-card {
        background: white;
        width: min(95vw, 1000px);
        height: min(90vh, 800px);
        border-radius: 8px;
        display: flex; flex-direction: column;
        overflow: hidden;
      }
      /* WRAPPER SCORRIBILE (fix mobile privacy) */
      #cc-docs-body {
        flex: 1;
        overflow: auto;
      }
      #cc-docs-head {
        padding: 16px 20px; background: #f5f5f5; border-bottom: 1px solid #ddd;
        display: flex; justify-content: space-between; align-items: center; font-weight: 700;
      }
      #cc-docs-iframe {
  border: 0;
  width: 100%;
  height: auto;          /* lasciamo gestire allo script */
  overflow: hidden;      /* niente scrollbar interne */
  display: block;
}
      #cc-docs-close {
        background: #f44336; color: white; border: none;
        padding: 6px 12px; border-radius: 4px; cursor: pointer;
      }
      
      /* Floating button */
      #cc-float {
        position: fixed; left: 20px; bottom: 20px; z-index: 100004;
        width: 56px; height: 56px; border-radius: 50%;
        background: #4caf50; border: none;
        box-shadow: 0 4px 12px rgba(76,175,80,0.4);
        cursor: pointer; display: none; align-items: center; justify-content: center;
      }
      #cc-float.cc-show { display: flex; }
      #cc-float img { width: 40px; height: 40px; }
      
      /* Success notification */
      .cc-success {
        position: fixed; top: 20px; right: 20px;
        background: #4caf50; color: white; padding: 12px 20px; border-radius: 6px;
        font-weight: 600; z-index: 100010; transform: translateX(300px);
        transition: transform 0.3s ease;
      }
      .cc-success.cc-show { transform: translateX(0); }
    `;

    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    // ======= DOM ELEMENTS =======
    var backdrop = document.createElement("div");
    backdrop.id = "cc-backdrop";

    var banner = document.createElement("div");
    banner.id = "cc-banner";
    banner.innerHTML = `
      <div id="cc-container">
        <button id="cc-close">✖</button>
        
        <div id="cc-header">
          <div id="cc-icon">🍪</div>
          <div id="cc-text">
            <div id="cc-title">Il sito di ALIMENTIAMO LA SALUTE utilizza COOKIES per migliorare la tua esperienza.</div>
            <div id="cc-desc">Noi e terze parti selezionate utilizziamo cookie o tecnologie simili per finalità tecniche e, con il tuo consenso, anche per altre finalità come specificato nella <a href="${COOKIE_URL}" id="cc-cookie-inline">cookie policy</a>.</div>
            <div id="cc-instr">Usa il pulsante "Accetta" per acconsentire. Usa il pulsante "Rifiuta" o chiudi questa informativa per continuare senza accettare.</div>
            <div id="cc-links">
              <a id="cc-privacy" href="${PRIVACY_URL}">Info privacy</a>
              <a id="cc-cookie" href="${COOKIE_URL}">Info cookie</a>
              ${DATA_REQUEST_URL ? `<a id="cc-data" href="${DATA_REQUEST_URL}">Richiesta dati</a>` : ''}
            </div>
          </div>
        </div>
        
        <div id="cc-buttons">
          <div id="cc-primary">
            <button id="cc-reject">Rifiuta</button>
            <button id="cc-accept">Accetta</button>
          </div>
          <button id="cc-manage">Gestisci le impostazioni</button>
        </div>
      </div>
    `;

    var modal = document.createElement("div");
    modal.id = "cc-modal";
    modal.innerHTML = `
      <div id="cc-card">
        <h3>Preferenze Cookie</h3>
        <div class="cc-row">
          <input id="cc-necessary" type="checkbox" checked disabled>
          <label for="cc-necessary">Necessari (sempre attivi)</label>
        </div>
        <div class="cc-row">
          <input id="cc-marketing" type="checkbox">
          <label for="cc-marketing">Marketing</label>
        </div>
        <div class="cc-row">
          <input id="cc-statistics" type="checkbox">
          <label for="cc-statistics">Statistiche</label>
        </div>
        <div id="cc-modal-buttons">
          <button id="cc-save">Salva preferenze</button>
          <button id="cc-cancel">Annulla</button>
        </div>
      </div>
    `;

    var docsModal = document.createElement("div");
    docsModal.id = "cc-docs";
    docsModal.innerHTML = `
      <div id="cc-docs-card">
        <div id="cc-docs-head">
          <span id="cc-docs-title">Informativa</span>
          <button id="cc-docs-close">Chiudi</button>
        </div>
        <!-- WRAPPER SCORRIBILE -->
        <div id="cc-docs-body">
          <iframe id="cc-docs-iframe"></iframe>
        </div>
      </div>
    `;

    var floatBtn = document.createElement("button");
    floatBtn.id = "cc-float";
    floatBtn.innerHTML = '<img src="https://global-files-nginx.builderall.com/da739884-a644-464d-b30b-7e2e5b966fbb/2292d049320fa34350258392c76ef64594d6b7d4adb0e27896fb1f9d08b2cdf4.svg" alt="">';

    var successNotification = document.createElement("div");
    successNotification.className = "cc-success";

    // ======= HELPER FUNCTIONS =======
    function show(el) {
      el.style.display = el.id === "cc-modal" || el.id === "cc-docs" ? "flex" : "block";
      setTimeout(() => el.classList.add("cc-show"), 10);
    }
    function hide(el) {
      el.classList.remove("cc-show");
      setTimeout(() => el.style.display = "none", 300);
    }

    function showBanner() { show(banner); }
    function hideBanner() { hide(banner); }
    
    function showModal() {
      show(backdrop);
      show(modal);
      hideBanner();
    }
    function hideModal() {
      hide(modal);
      hide(backdrop);
    }
    
    function showDocs(url, title) {
      document.getElementById("cc-docs-title").textContent = title || "Informativa";
      // reset src per migliorare compatibilità iOS prima di riassegnare
      var iframe = document.getElementById("cc-docs-iframe");
      iframe.removeAttribute("src");
      setTimeout(function(){ iframe.src = url; }, 0);
      show(docsModal);
      hideBanner();
    }
    function hideDocs() {
      hide(docsModal);
      showBanner();
    }
    
    function showFloat() { floatBtn.classList.add("cc-show"); }
    function showSuccess(msg) {
      successNotification.textContent = msg;
      successNotification.classList.add("cc-show");
      setTimeout(() => successNotification.classList.remove("cc-show"), 2000);
    }

    // ======= CONSENT MANAGEMENT =======
    function readConsent() {
      var v = getCookie(COOKIE_NAME);
      var res = { marketing: false, statistics: false };
      if (v && v.includes("&")) {
        v.split("&").forEach(function (pair) {
          var kv = pair.split("=");
          if (kv.length === 2) {
            var key = kv[0].trim();
            var val = kv[1].trim() === "true";
            if (key === "marketing") res.marketing = val;
            if (key === "statistics") res.statistics = val;
          }
        });
      }
      return res;
    }

    function store(marketing, statistics) {
      var consent = { marketing: !!marketing, statistics: !!statistics };
      setCookie(COOKIE_NAME, `marketing=${consent.marketing}&statistics=${consent.statistics}`, COOKIE_DAYS);
      pushConsentEvent("illow_consenso_aggiornato", consent);
      var m = document.getElementById("cc-marketing");
      var s = document.getElementById("cc-statistics");
      if (m) m.checked = consent.marketing;
      if (s) s.checked = consent.statistics;
    }

    // ======= EVENT HANDLERS =======
    function setupEvents() {
      // Main buttons
      document.getElementById("cc-accept").addEventListener("click", function () {
        store(true, true);
        showSuccess("Tutti i cookie accettati!");
        showFloat();
        hideBanner();
      });
      document.getElementById("cc-reject").addEventListener("click", function () {
        store(false, false);
        showSuccess("Solo cookie necessari attivi");
        showFloat();
        hideBanner();
      });
      document.getElementById("cc-close").addEventListener("click", function () {
        store(false, false);
        showSuccess("Solo cookie necessari attivi");
        showFloat();
        hideBanner();
      });
      document.getElementById("cc-manage").addEventListener("click", function () {
        var consent = readConsent();
        document.getElementById("cc-marketing").checked = consent.marketing;
        document.getElementById("cc-statistics").checked = consent.statistics;
        showModal();
      });
      // Listener per link interni alla Privacy che chiedono switch
window.addEventListener('message', function (e) {
  var data = e && e.data;
  if (!data || data.type !== 'NAVIGATE_MODAL') return;

  try {
    // sicurezza: accetta solo il tuo dominio
    var u = new URL(data.url, location.href);
    if (!/alimentiamolasalute\.org$/i.test(u.hostname.replace(/^www\./,''))) return;

    // aggiorna titolo e iframe
    var tEl = document.getElementById('cc-docs-title');
    var ifr = document.getElementById('cc-docs-iframe');
    if (tEl) tEl.textContent = data.title || 'Informativa';
    if (ifr) {
      ifr.removeAttribute('src');       // reset per iOS
      setTimeout(() => ifr.src = u.href, 0);
    }

    // assicura che il modale resti visibile
    if (docsModal && docsModal.style.display !== 'flex') {
      show(docsModal);
      hideBanner();
    }
  } catch (err) {
    console.warn('[cookie-consent] message handler error:', err);
  }
});
// Ridimensiona automaticamente l'iframe dei docs
function autoResizeIframe(iframe) {
  if (!iframe) return;
  try {
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    if (doc && doc.body) {
      var newHeight = doc.body.scrollHeight;
      iframe.style.height = newHeight + "px";
    }
  } catch (e) {
    console.warn("[cookie-consent] autoResizeIframe error:", e);
  }
}

// Attiva il resize quando l'iframe carica
var docsIframe = document.getElementById("cc-docs-iframe");
if (docsIframe) {
  docsIframe.addEventListener("load", function () {
    autoResizeIframe(docsIframe);
  });
}

      // Modal events
      document.getElementById("cc-save").addEventListener("click", function () {
        var m = document.getElementById("cc-marketing").checked;
        var s = document.getElementById("cc-statistics").checked;
        store(m, s);
        showSuccess("Preferenze salvate!");
        showFloat();
        hideModal();
        hideBanner();
      });
      document.getElementById("cc-cancel").addEventListener("click", function () {
        hideModal();
        showBanner();
      });
      
      // Links (aprono il modale documenti)
      document.getElementById("cc-privacy").addEventListener("click", function (e) {
        e.preventDefault();
        showDocs(PRIVACY_URL, "Info privacy");
      });
      document.getElementById("cc-cookie").addEventListener("click", function (e) {
        e.preventDefault();
        showDocs(COOKIE_URL, "Info cookie");
      });
      document.getElementById("cc-cookie-inline").addEventListener("click", function (e) {
        e.preventDefault();
        showDocs(COOKIE_URL, "Info cookie");
      });
      if (DATA_REQUEST_URL) {
        var dataLink = document.getElementById("cc-data");
        if (dataLink) {
          dataLink.addEventListener("click", function (e) {
            e.preventDefault();
            showDocs(DATA_REQUEST_URL, "Richiesta dati");
          });
        }
      }
      
      // Docs modal
      document.getElementById("cc-docs-close").addEventListener("click", hideDocs);
      
      // Float button
      floatBtn.addEventListener("click", showBanner);
      
      // Escape key
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          if (docsModal.style.display === "flex") {
            hideDocs();
          } else if (modal.style.display === "flex") {
            hideModal();
            showBanner();
          }
        }
      });
    }

    // ======= INITIALIZATION =======
    function init() {
      document.body.appendChild(backdrop);
      document.body.appendChild(banner);
      document.body.appendChild(modal);
      document.body.appendChild(docsModal);
      document.body.appendChild(floatBtn);
      document.body.appendChild(successNotification);
      
      setupEvents();
      
      var existing = getCookie(COOKIE_NAME);
      if (existing) {
        var consent = readConsent();
        pushConsentEvent("illow_consent_ready", consent);
        showFloat();
        console.log("[cookie-consent] existing consent found");
      } else {
        showBanner();
      }
    }

    // Public API
    window.CC_openConsent = showBanner;

    // Start
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
      init();
    }

  } catch (err) {
    console.error("[cookie-consent] fatal error:", err);
  }
})();


