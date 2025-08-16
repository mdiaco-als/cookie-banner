// cookie-consent.js — banner centrato, SVG icons, modale docs responsive, GTM event
(function () {
  "use strict";
  try {
    console.log("[cookie-consent] init");

    // ======= CONFIG (overridable via window.CC_CONFIG) =======
    var cfg = (window.CC_CONFIG || {});
    var PRIVACY_URL = cfg.privacy || "#";
    var COOKIE_URL  = cfg.cookie  || "#";
    var DATA_REQUEST_URL = cfg.dataRequest || null; // terzo link opzionale
    var COOKIE_NAME = cfg.name || "illow-consent-d65e161a-df13-4344-bde3-d7e22f62d93c";
    var COOKIE_DAYS = (typeof cfg.days === "number") ? cfg.days : 180;
    var OPEN_DOCS_IN_MODAL = (typeof cfg.openDocsInModal === "boolean") ? cfg.openDocsInModal : true;

    // --- SKIP: inside iframe or on policy pages ---
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
// ---- GTM EVENTS (payload) ----
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



    // ======= ICONS (SVG inline, niente emoji) =======
    var icoCookie = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10a4 4 0 0 1-4-4a4 4 0 0 1-4-4Z"/><circle cx="8" cy="10" r="1.5" fill="#fff"/><circle cx="14" cy="14" r="1.5" fill="#fff"/><circle cx="10.5" cy="16" r="1" fill="#fff"/></svg>';
    var icoWrench = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22 7.46a5 5 0 0 1-6.53 6.53l-7.2 7.2a2 2 0 0 1-2.83 0l-1.63-1.63a2 2 0 0 1 0-2.83l7.2-7.2A5 5 0 0 1 22 7.46Z"/></svg>';
    var icoPage   = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path fill="currentColor" d="M14 2v6h6"/></svg>';
    var icoCross  = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path stroke="currentColor" stroke-width="2" fill="none" d="M6 6l12 12M18 6L6 18"/></svg>';

    // ======= CSS =======
    var css = ""
      + "#cc-backdrop{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.25);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:none}"
      // Banner come card centrata
      + "#cc-banner{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:100001;"
      + "background:#fff;color:#111;border-top:4px solid #2e7d32;box-shadow:0 10px 30px rgba(0,0,0,.25);"
      + "padding:16px;border-radius:16px;width:min(720px,92vw);max-height:86vh;overflow:auto;"
      + "font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;display:none}"
      + "#cc-banner h3{margin:0 0 8px;color:#2e7d32;font-size:18px}"
      + "#cc-banner p{margin:6px 0;font-size:14px;line-height:1.45;display:flex;gap:6px;align-items:flex-start}"
      + "#cc-actions{margin-top:8px;display:flex;flex-wrap:wrap}"
      + "#cc-actions button{padding:8px 12px;margin:4px;border-radius:8px;border:0;font-weight:700;cursor:pointer}"
      + "#cc-accept{background:#2e7d32;color:#fff}"
      + "#cc-manage{background:#e0e0e0}"
      + "#cc-close{position:absolute;top:6px;right:10px;background:transparent;border:0;font-size:18px;cursor:pointer}"
      + "#cc-links{font-size:12px;margin-top:6px}"
      + "#cc-links a{color:#2e7d32;text-decoration:underline;margin-right:12px}"
      // Modale preferenze
      + "#cc-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:100002;background:rgba(0,0,0,.6)}"
      + "#cc-card{background:#fff;color:#111;max-width:520px;width:92%;border-radius:10px;padding:16px}"
      + "#cc-card h3{margin:0 0 8px}"
      + ".cc-row{display:flex;align-items:center;gap:8px;margin:8px 0}"
      + ".cc-row input{transform:scale(1.2)}"
      + "#cc-save{background:#2e7d32;color:#fff;padding:8px 12px;border:0;border-radius:8px;font-weight:700;cursor:pointer;margin-right:8px}"
      + "#cc-cancel{background:#e0e0e0;padding:8px 12px;border:0;border-radius:8px;cursor:pointer}"
      // Modale documenti responsive
      + "#cc-docs{position:fixed;inset:0;z-index:100003;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;overflow:hidden}"
      + "#cc-docs-card{background:#fff;color:#111;box-sizing:border-box;width:min(96vw,1200px);height:min(92vh,1000px);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden}"
      + "#cc-docs-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;border-bottom:1px solid #eee;font-weight:700;flex:0 0 44px}"
      + "#cc-docs-iframe{display:block;flex:1 1 auto;width:100%;height:100%;border:0}"
      + "#cc-docs-close{background:#e0e0e0;border:0;border-radius:8px;padding:6px 10px;cursor:pointer;flex:0 0 auto}"
      + "@media (max-width:640px){#cc-docs-card{width:100vw;height:100dvh;border-radius:0}}"
      // ===== Floating re-open button (logo) =====
     + "#cc-float{position:fixed;left:calc(14px + env(safe-area-inset-left));bottom:calc(14px + env(safe-area-inset-bottom));z-index:100004;width:64px;height:64px;border-radius:50%;background:#ffffff;border:1px solid rgba(0,0,0,.08);box-shadow:0 6px 18px rgba(0,0,0,.18);display:none;align-items:center;justify-content:center;cursor:pointer;padding:6px}"
     + "#cc-float img{display:block;width:48px;height:48px}"
     + "#cc-float:hover img{transform:scale(1.08);transition:transform .18s ease}"
     + "#cc-float:focus-visible{outline:2px solid #8dd;outline-offset:3px}"
     + "@media (max-width:768px){#cc-float{width:60px;height:60px;padding:6px}#cc-float img{width:44px;height:44px}}"
     + "@media (max-width:480px){#cc-float{left:calc(12px + env(safe-area-inset-left));bottom:calc(12px + env(safe-area-inset-bottom));width:56px;height:56px;padding:6px}#cc-float img{width:40px;height:40px}}";



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

    // === Contenuto banner (TUO testo) ===
    banner.innerHTML = (
      '<button id="cc-close" aria-label="Chiudi">✖</button>'
      + '<h3>Il sito di ALIMENTIAMO LA SALUTE utilizza COOKIES per migliorare la tua esperienza.</h3>'
      + '<p>' + icoCookie + '<span>Utilizziamo i cookies per analizzare il traffico, mostrarti annunci personalizzati su siti di terze parti e fornirti funzionalità relative ai social media.</span></p>'
      + '<p>' + icoWrench + '<span>Per fruire senza limiti delle funzionalità offerte da ALIMENTIAMO LA SALUTE, ti invitiamo a consentire tutti i cookies in CONFORMITÀ con la nostra POLICY per i COOKIES.</span></p>'
      + '<p>' + icoPage   + '<span>Puoi modificare le tue preferenze in qualsiasi momento accedendo alle impostazioni sui cookies.</span></p>'
      + '<p>' + icoPage   + '<span>Per maggiori dettagli, leggi la nostra Cookie Policy e la nostra Privacy Policy.</span></p>'
      + '<p>' + icoCross  + '<span>Chiudendo questo banner con la X, verranno mantenuti solo i cookie tecnici necessari per il funzionamento del sito.</span></p>'
      + '<div id="cc-links">'
      +   '<a id="cc-privacy" href="' + PRIVACY_URL + '">Informativa sulla privacy</a>'
      +   '<a id="cc-cookie"  href="' + COOKIE_URL  + '">Informativa sui cookie</a>'
      +   (DATA_REQUEST_URL ? '<a id="cc-data" href="' + DATA_REQUEST_URL + '">Richiesta dei tuoi dati</a>' : '')
      + '</div>'
      + '<div id="cc-actions">'
      +   '<button id="cc-manage">Gestisci le impostazioni</button>'
      +   '<button id="cc-accept">Accetta tutti</button>'
      + '</div>'
    );

    // Modale preferenze (Necessari locked)
    var modal = document.createElement("div");
    modal.id = "cc-modal";
    modal.innerHTML = (
      '<div id="cc-card" role="dialog" aria-modal="true" aria-labelledby="cc-title">'
      +  '<h3 id="cc-title">Preferenze Cookie</h3>'
      +  '<div class="cc-row"><input id="cc-necessary" type="checkbox" checked disabled><label for="cc-necessary">Necessari (sempre attivi)</label></div>'
      +  '<div class="cc-row"><input id="cc-marketing" type="checkbox"><label for="cc-marketing">Marketing</label></div>'
      +  '<div class="cc-row"><input id="cc-statistics" type="checkbox"><label for="cc-statistics">Statistiche</label></div>'
      +  '<div style="margin-top:8px">'
      +    '<button id="cc-save">Salva preferenze</button>'
      +    '<button id="cc-cancel">Annulla</button>'
      +  '</div>'
      + '</div>'
    );

    // Bottone flottante per riaprire il BANNER
    var floatBtn = document.createElement("button");
    floatBtn.id = "cc-float";
    floatBtn.type = "button";
    floatBtn.setAttribute("aria-label", "Gestisci preferenze cookie");
    floatBtn.innerHTML = '<img alt="" src="https://global-files-nginx.builderall.com/da739884-a644-464d-b30b-7e2e5b966fbb/2292d049320fa34350258392c76ef64594d6b7d4adb0e27896fb1f9d08b2cdf4.svg">';
    floatBtn.addEventListener("click", function () {
      window.CC_openConsent();
    });

    // ======= VISIBILITY HELPERS (niente rimozione dal DOM) =======
    function show(el){ el.style.display = "block"; }
    function hide(el){ el.style.display = "none"; }

    function lockScroll(){ document.documentElement.style.overflow = "hidden"; document.body.style.overflow = "hidden"; }
    function unlockScroll(){ document.documentElement.style.overflow = ""; document.body.style.overflow = ""; }

    function showBanner() { show(backdrop); show(banner); hide(modal); hide(docsOverlay); lockScroll(); }
    function hideBanner() { hide(backdrop); hide(banner); unlockScroll(); }

    // 👉 FIX centratura modali: display:flex
    function showModal()  { backdrop.style.display="block"; banner.style.display="none"; docsOverlay.style.display="none"; modal.style.display="flex"; lockScroll(); }
    function hideModal()  { hide(modal); hide(backdrop); unlockScroll(); }
    function showDocs()   { backdrop.style.display="block"; banner.style.display="none"; modal.style.display="none"; docsOverlay.style.display="flex"; lockScroll(); }
    function hideDocs()   { hide(docsOverlay); show(banner); show(backdrop); lockScroll(); }

    function showFloat(){ if (!document.body.contains(floatBtn)) document.body.appendChild(floatBtn); floatBtn.style.display = "inline-flex"; }
    function hideFloat(){ floatBtn && (floatBtn.style.display = "none"); }

    // ======= CONSENT STATE =======
    function readConsent() {
  var v = getCookie(COOKIE_NAME);
  var res = { marketing: false, statistics: false };

  if (v) {
    try {
      // JSON legacy
      if (v[0] === "{") {
        var o = JSON.parse(v);
        res.marketing  = !!(o.all || o.marketing);
        res.statistics = !!(o.all || o.stats || o.statistics);
        // mirror su localStorage
        try { localStorage.setItem(COOKIE_NAME, JSON.stringify(res)); } catch(_) {}
        return res;
      }
    } catch(e){}

    // querystring "marketing=true&statistics=true"
    v.split("&").forEach(function (pair) {
      var kv = pair.split("=");
      if (kv.length === 2) {
        var key = kv[0].trim().toLowerCase();
        var val = kv[1].trim().toLowerCase();
        if (key === "marketing")  res.marketing  = (val === "true" || val === "1");
        if (key === "statistics") res.statistics = (val === "true" || val === "1");
      }
    });
    try { localStorage.setItem(COOKIE_NAME, JSON.stringify(res)); } catch(_) {}
    return res;
  }

  // se non c'è cookie, prova localStorage e ricrea il cookie
  try {
    var ls = localStorage.getItem(COOKIE_NAME);
    if (ls) {
      var parsed = JSON.parse(ls);
      var m = !!parsed.marketing, s = !!parsed.statistics;
      setCookie(COOKIE_NAME, "marketing=" + m + "&statistics=" + s, COOKIE_DAYS);
      return { marketing: m, statistics: s };
    }
  } catch(_){}

  return res; // default false/false
}


    function applyConsentToUI(consent) {
      var m = document.getElementById("cc-marketing");
      var s = document.getElementById("cc-statistics");
      if (m) m.checked = !!consent.marketing;
      if (s) s.checked = !!consent.statistics;
      var nec = document.getElementById("cc-necessary");
      if (nec) { nec.checked = true; nec.disabled = true; }
    }

    function store(mark, stat) {
  var consent = { marketing: !!mark, statistics: !!stat };
  setCookie(COOKIE_NAME, "marketing=" + consent.marketing + "&statistics=" + consent.statistics, COOKIE_DAYS);
  try { localStorage.setItem(COOKIE_NAME, JSON.stringify(consent)); } catch(_) {}
  pushConsentEvent("illow_consenso_aggiornato", consent); // GTM con payload
  applyConsentToUI(consent); // sincronizza subito la UI
}


    // ======= MOUNT =======
    function wire() {
      // ACCETTA TUTTI -> marketing=true & statistics=true
      document.getElementById("cc-accept").addEventListener("click", function () {
        store(true, true);
        showFloat();
        hideBanner();
      });
      // X -> solo tecnici
      document.getElementById("cc-close").addEventListener("click", function () {
  var existing = getCookie(COOKIE_NAME);
  if (!existing) {
    // prima volta → solo tecnici
    store(false, false);
  } else {
    // X successiva → NON toccare le preferenze
    // (solo chiudi; lasciamo invariato quanto già scelto)
  }
  showFloat();
  hideBanner();
});

      // GESTISCI (sincronizza prima di aprire)
      document.getElementById("cc-manage").addEventListener("click", function () {
        applyConsentToUI(readConsent());
        showModal();
      });
      document.getElementById("cc-cancel").addEventListener("click", function(){ hideModal(); });

      // SALVA PREFERENZE
      document.getElementById("cc-save").addEventListener("click", function () {
        var m = document.getElementById("cc-marketing").checked;
        var s = document.getElementById("cc-statistics").checked;
        store(m, s);
        showFloat();
        hideModal();
      });

      // Link privacy/cookie → modale docs
      document.getElementById("cc-privacy").addEventListener("click", function(e){
        e.preventDefault(); openDocs(PRIVACY_URL, "Informativa sulla privacy");
      });
      document.getElementById("cc-cookie").addEventListener("click", function(e){
        e.preventDefault(); openDocs(COOKIE_URL, "Informativa sui cookie");
      });
      if (DATA_REQUEST_URL) {
        var dataLink = document.getElementById("cc-data");
        if (dataLink) dataLink.addEventListener("click", function(e){
          e.preventDefault(); openDocs(DATA_REQUEST_URL, "Richiesta dei tuoi dati");
        });
      }

      // Docs modal handlers
      document.getElementById("cc-docs-close").addEventListener("click", function(){ hideDocs(); });
      docsOverlay.addEventListener("click", function(e){ if (e.target === docsOverlay) hideDocs(); });
      document.addEventListener("keydown", function(e){
        if (e.key === "Escape") {
          if (docsOverlay.style.display === "flex") hideDocs();
          else if (modal.style.display === "flex") hideModal();
          else if (banner.style.display === "block") hideBanner();
        }
      });
    }

    function openDocs(url, title){
      if (!OPEN_DOCS_IN_MODAL) { window.open(url, "_blank", "noopener"); return; }
      document.getElementById("cc-docs-title").textContent = title || "Informativa";
      var ifr = document.getElementById("cc-docs-iframe");
      ifr.src = url;
      ifr.onload = function () {
        try {
          var d = ifr.contentDocument || ifr.contentWindow.document;
          var s = d.createElement("style");
          s.textContent =
            "html,body{max-width:100%;overflow-x:auto!important}" +
            "img,video,iframe,table{max-width:100%;height:auto}" +
            ".container,.wrap,.content{max-width:100%!important}";
          d.head && d.head.appendChild(s);
        } catch(e) {/* cross-origin: ignora */}
      };
      showDocs(); // ora è display:flex
    }

    function mount() {
      // inietta CSS + DOM una sola volta
      document.head.appendChild(style);
      document.body.appendChild(backdrop);
      document.body.appendChild(banner);
      document.body.appendChild(modal);
      document.body.appendChild(docsOverlay);
      document.body.appendChild(floatBtn);

      wire();

      // Se consenso già presente → mostra solo bottone e sincronizza UI
      var existing = getCookie(COOKIE_NAME);
if (existing) {
  var c = readConsent();
  applyConsentToUI(c);
  showFloat();
  pushConsentEvent("illow_consent_ready", c); // GTM all'avvio
  console.log("[cookie-consent] cookie found, skipping banner");
  return;
}
      // Altrimenti mostra banner
      showBanner();
    }

    // API per riaprire il BANNER principale
    window.CC_openConsent = function () { showBanner(); };

    // Ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      mount();
    }

  } catch (err) {
    console.error("[cookie-consent] fatal error:", err);
  }
})();





