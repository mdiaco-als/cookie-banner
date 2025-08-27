// cookie-consent.js — banner GDPR compliant, non invasivo, posizionato in alto
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

    // ======= ICONS (SVG inline) =======
    var icoCookie = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10a4 4 0 0 1-4-4a4 4 0 0 1-4-4Z"/><circle cx="8" cy="10" r="1.5" fill="#fff"/><circle cx="14" cy="14" r="1.5" fill="#fff"/><circle cx="10.5" cy="16" r="1" fill="#fff"/></svg>';

    // ======= CSS MODERNIZZATO NON INVASIVO =======
    var css = ""
      // Banner posizionato in alto, NON blocca scroll
      + "#cc-banner{position:fixed;top:0;left:0;right:0;z-index:100001;"
      + "background:rgba(255,255,255,.98);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);"
      + "border-bottom:1px solid rgba(46,125,50,.15);box-shadow:0 4px 20px rgba(0,0,0,.1);"
      + "padding:16px 20px;color:#1a1a1a;"
      + "font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;"
      + "display:none;opacity:0;transform:translateY(-100%);transition:all .4s cubic-bezier(.16,1,.3,1);"
      + "-webkit-text-size-adjust:100%;max-width:100%;box-sizing:border-box;position:relative}"
      + "#cc-banner.cc-show{opacity:1;transform:translateY(0)}"
      
      // Gradient top border
      + "#cc-banner::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;"
      + "background:linear-gradient(90deg,#2e7d32,#4caf50,#66bb6a)}"
      
      // Container principale - layout flexibile
      + "#cc-content{display:flex;align-items:flex-start;gap:16px;max-width:1200px;margin:0 auto}"
      
      // Icona cookie
      + "#cc-icon{flex:0 0 auto;display:flex;align-items:center;color:#2e7d32;margin-top:2px}"
      
      // Testo principale
      + "#cc-text{flex:1 1 auto;min-width:0}"
      + "#cc-title{margin:0 0 6px;color:#2e7d32;font-size:1rem;font-weight:700;line-height:1.3}"
      + "#cc-description{margin:0 0 8px;font-size:.9rem;line-height:1.4;color:#333}"
      + "#cc-instruction{margin:0;font-size:.85rem;line-height:1.3;color:#666}"
      
      // Links footer
      + "#cc-links{margin:6px 0 0;display:flex;flex-wrap:wrap;gap:12px;font-size:.8rem}"
      + "#cc-links a{color:#2e7d32;text-decoration:none;padding:2px 6px;border-radius:4px;"
      + "transition:all .2s ease;border:1px solid transparent}"
      + "#cc-links a:hover{background:rgba(46,125,50,.1);border-color:rgba(46,125,50,.2)}"
      
      // Actions container
      + "#cc-actions{flex:0 0 auto;display:flex;gap:8px;align-items:center}"
      + "#cc-actions button{white-space:nowrap;padding:10px 20px;margin:0;border-radius:8px;"
      + "border:none;font-weight:600;cursor:pointer;font-size:.9rem;text-align:center;"
      + "transition:all .3s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;min-height:40px}"
      
      // Shimmer effect sui bottoni
      + "#cc-actions button::before{content:'';position:absolute;inset:0;"
      + "background:linear-gradient(45deg,transparent,rgba(255,255,255,.2),transparent);"
      + "transform:translateX(-100%);transition:transform .6s}"
      + "#cc-actions button:hover::before{transform:translateX(100%)}"
      
      // Bottone Rifiuta
      + "#cc-reject{background:linear-gradient(135deg,#d32f2f,#e57373);color:#fff;"
      + "box-shadow:0 2px 8px rgba(211,47,47,.3)}"
      + "#cc-reject:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(211,47,47,.4)}"
      
      // Bottone Accept
      + "#cc-accept{background:linear-gradient(135deg,#2e7d32,#388e3c);color:#fff;"
      + "box-shadow:0 2px 8px rgba(46,125,50,.3)}"
      + "#cc-accept:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(46,125,50,.4)}"
      
      // Bottone Manage
      + "#cc-manage{background:rgba(0,0,0,.06);color:#333;border:1px solid rgba(0,0,0,.15);"
      + "font-size:.85rem;padding:8px 16px;margin-top:4px}"
      + "#cc-manage:hover{background:rgba(0,0,0,.1);transform:translateY(-1px)}"
      
      // Backdrop per modali (NON per il banner principale)
      + "#cc-backdrop{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.4);"
      + "backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:none;opacity:0;"
      + "transition:all .4s cubic-bezier(.16,1,.3,1)}"
      + "#cc-backdrop.cc-show{opacity:1}"
      
      // Modal preferenze (mantenuto centrato)
      + "#cc-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;"
      + "z-index:100002;background:rgba(0,0,0,.6);opacity:0;transition:opacity .3s ease}"
      + "#cc-modal.cc-show{opacity:1}"
      + "#cc-card{background:rgba(255,255,255,.95);backdrop-filter:blur(20px);color:#111;max-width:520px;"
      + "width:92%;border-radius:20px;padding:2rem;box-shadow:0 20px 60px rgba(0,0,0,.2);"
      + "border:1px solid rgba(255,255,255,.8);transform:scale(.9);"
      + "transition:transform .3s cubic-bezier(.16,1,.3,1)}"
      + "#cc-modal.cc-show #cc-card{transform:scale(1)}"
      + "#cc-card h3{margin:0 0 1.5rem;color:#2e7d32;font-size:1.3rem;font-weight:700}"
      
      // Preference rows
      + ".cc-row{display:flex;align-items:center;gap:12px;margin:12px 0;padding:16px;"
      + "border-radius:12px;background:rgba(0,0,0,.02);border:1px solid rgba(0,0,0,.05);"
      + "transition:all .2s ease}"
      + ".cc-row:hover{background:rgba(0,0,0,.04)}"
      + ".cc-row input{transform:scale(1.3);margin:0;accent-color:#2e7d32;cursor:pointer}"
      + ".cc-row label{flex:1;font-weight:600;color:#333;cursor:pointer}"
      
      // Save/Cancel buttons
      + "#cc-save{background:linear-gradient(135deg,#2e7d32,#388e3c);color:#fff;padding:12px 24px;"
      + "border:none;border-radius:12px;font-weight:600;cursor:pointer;margin-right:12px;"
      + "transition:all .3s ease}"
      + "#cc-save:hover{transform:translateY(-1px);box-shadow:0 4px 15px rgba(46,125,50,.3)}"
      + "#cc-cancel{background:rgba(0,0,0,.04);color:#333;padding:12px 24px;"
      + "border:1px solid rgba(0,0,0,.1);border-radius:12px;cursor:pointer;transition:all .2s ease}"
      + "#cc-cancel:hover{background:rgba(0,0,0,.08);transform:translateY(-1px)}"
      
      // Docs modal
      + "#cc-docs{position:fixed;inset:0;z-index:100003;background:rgba(0,0,0,.6);display:none;"
      + "align-items:center;justify-content:center;overflow:hidden;opacity:0;transition:opacity .3s ease;"
      + "overscroll-behavior:contain}"
      + "#cc-docs.cc-show{opacity:1}"
      + "#cc-docs-card{background:rgba(255,255,255,.95);backdrop-filter:blur(20px);color:#111;box-sizing:border-box;"
      + "width:min(96vw,1200px);height:min(92vh,1000px);border-radius:16px;"
      + "box-shadow:0 20px 60px rgba(0,0,0,.25);display:flex;flex-direction:column;overflow:hidden;"
      + "transform:scale(.95);transition:transform .3s cubic-bezier(.16,1,.3,1)}"
      + "#cc-docs.cc-show #cc-docs-card{transform:scale(1)}"
      + "#cc-docs-head{display:flex;align-items:center;justify-content:space-between;gap:12px;"
      + "padding:16px 20px;border-bottom:1px solid rgba(0,0,0,.1);font-weight:700;flex:0 0 auto;"
      + "background:rgba(46,125,50,.05)}"
      + "#cc-docs-iframe{display:block;flex:1 1 auto;width:100%;height:100%;border:0}"
      + "#cc-docs-close{background:rgba(0,0,0,.04);border:1px solid rgba(0,0,0,.1);border-radius:8px;"
      + "padding:8px 16px;cursor:pointer;flex:0 0 auto;transition:all .2s ease}"
      + "#cc-docs-close:hover{background:rgba(0,0,0,.08);transform:translateY(-1px)}"
      
      // Floating button
      + "#cc-float{position:fixed;left:calc(14px + env(safe-area-inset-left));"
      + "bottom:calc(14px + env(safe-area-inset-bottom));z-index:100004;width:64px;height:64px;"
      + "border-radius:50%;background:linear-gradient(135deg,#2e7d32,#4caf50);border:none;"
      + "box-shadow:0 8px 25px rgba(46,125,50,.3);cursor:pointer;display:none;align-items:center;"
      + "justify-content:center;padding:6px;transition:all .3s cubic-bezier(.16,1,.3,1)}"
      + "#cc-float.cc-show{display:inline-flex;animation:cc-bounceIn .6s cubic-bezier(.68,-.55,.265,1.55)}"
      + "#cc-float:hover{transform:scale(1.1) translateY(-2px);box-shadow:0 12px 35px rgba(46,125,50,.4)}"
      + "#cc-float img{display:block;width:48px;height:48px;transition:transform .2s ease}"
      + "#cc-float:hover img{transform:scale(1.08)}"
      + "#cc-float:focus-visible{outline:2px solid #8dd;outline-offset:3px}"
      
      // Close button modernizzato
      + "#cc-close{position:absolute;top:12px;right:16px;background:rgba(0,0,0,.05);border:none;"
      + "width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;"
      + "justify-content:center;transition:all .2s ease;color:#666;font-size:14px;z-index:1}"
      + "#cc-close:hover{background:rgba(0,0,0,.1);transform:scale(1.1);color:#333}"
      + "#cc-close:focus-visible{outline:2px solid #2e7d32;outline-offset:2px}"
      + ".cc-success{position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#4caf50,#66bb6a);"
      + "color:white;padding:12px 20px;border-radius:12px;box-shadow:0 8px 25px rgba(76,175,80,.3);"
      + "transform:translateX(400px);transition:all .4s cubic-bezier(.16,1,.3,1);z-index:100010;"
      + "font-weight:600;pointer-events:none;max-width:280px;word-wrap:break-word}"
      + ".cc-success.cc-show{transform:translateX(0)}"
      
      // Animations
      + "@keyframes cc-bounceIn{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.05)}70%{transform:scale(.9)}100%{transform:scale(1);opacity:1}}"
      
      // Responsive - Mobile First
      + "@media (max-width:768px){"
      + "#cc-content{flex-direction:row;align-items:flex-start;gap:12px}"
      + "#cc-icon{align-self:flex-start;margin-top:0}"
      + "#cc-text{flex:1}"
      + "#cc-actions{flex-direction:column;justify-content:center;gap:8px;margin-top:8px;width:100%}"
      + "#cc-actions .cc-primary-actions{display:flex;gap:6px}"
      + "#cc-actions .cc-primary-actions button{flex:1;min-width:0;font-size:.85rem;padding:9px 14px}"
      + "#cc-manage{margin-top:0;align-self:stretch;width:100%}"
      + "#cc-links{justify-content:center;gap:8px;flex-wrap:wrap}"
      + "}"
      + "@media (max-width:640px){"
      + "#cc-banner{padding:12px 16px}"
      + "#cc-content{gap:10px}"
      + "#cc-title{font-size:.9rem}"
      + "#cc-description{font-size:.8rem}"
      + "#cc-instruction{font-size:.75rem}"
      + "#cc-actions button{font-size:.8rem;padding:8px 12px;min-height:36px}"
      + "#cc-links{font-size:.75rem;gap:6px}"
      + "#cc-links a{padding:4px 8px}"
      + "#cc-close{top:8px;right:12px;width:28px;height:28px;font-size:12px}"
      + "}"
      + "@media (max-width:480px){"
      + "#cc-banner{padding:10px 12px}"
      + "#cc-actions{gap:4px}"
      + "#cc-actions button{font-size:.75rem;padding:7px 10px;min-height:34px}"
      + "#cc-manage{font-size:.75rem;padding:6px 12px}"
      + "#cc-close{top:6px;right:10px;width:26px;height:26px;font-size:11px}"
      + "}"
      + "@media (max-width:360px){"
      + "#cc-banner{padding:8px 10px}"
      + "#cc-title{font-size:.85rem}"
      + "#cc-description{font-size:.75rem}"
      + "#cc-instruction{font-size:.7rem}"
      + "#cc-actions button{font-size:.7rem;padding:6px 8px;min-height:32px}"
      + "#cc-links{font-size:.7rem}"
      + "#cc-close{top:4px;right:8px;width:24px;height:24px;font-size:10px}"
      + "}"
      
      // Compensazione per body quando banner è visibile
      + "body.cc-banner-active{padding-top:var(--cc-banner-height,120px);transition:padding-top .4s ease}"
      + "@media (max-width:768px){body.cc-banner-active{padding-top:var(--cc-banner-height,140px)}}"
      + "@media (max-width:640px){body.cc-banner-active{padding-top:var(--cc-banner-height,160px)}}"
      + "@media (max-width:480px){body.cc-banner-active{padding-top:var(--cc-banner-height,180px)}}";

    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    // ======= DOM =======
    var backdrop = document.createElement("div");
    backdrop.id = "cc-backdrop";

    var banner = document.createElement("div");
    banner.id = "cc-banner";

    // Success notification
    var successNotification = document.createElement("div");
    successNotification.className = "cc-success";
    successNotification.textContent = "✅ Preferenze salvate!";

    // Modale documenti (privacy/cookie)
    var docsOverlay = document.createElement("div");
    docsOverlay.id = "cc-docs";
    docsOverlay.innerHTML = (
      '<div id="cc-docs-card" role="dialog" aria-modal="true" aria-labelledby="cc-docs-title">'
      +   '<div id="cc-docs-head">'
      +     '<span id="cc-docs-title">Informativa</span>'
      +     '<button id="cc-docs-close">Chiudi</button>'
      +   '</div>'
      +   '<iframe id="cc-docs-iframe" referrerpolicy="no-referrer"></iframe>'
      + '</div>'
    );

    // === Contenuto banner NUOVO DESIGN ===
    banner.innerHTML = (
      '<button id="cc-close" aria-label="Chiudi banner cookie">✖</button>'
      + '<div id="cc-content">'
      +   '<div id="cc-header">'
      +     '<div id="cc-icon">' + icoCookie + '</div>'
      +     '<h3 id="cc-title">Il sito di ALIMENTIAMO LA SALUTE utilizza COOKIES per migliorare la tua esperienza.</h3>'
      +   '</div>'
      +   '<div id="cc-text">'
      +     '<p id="cc-description">Noi e terze parti selezionate utilizziamo cookie o tecnologie simili per finalità tecniche e, con il tuo consenso, anche per altre finalità come specificato nella <a href="' + COOKIE_URL + '" id="cc-cookie-inline">cookie policy</a>.</p>'
      +     '<p id="cc-instruction">Usa il pulsante "Accetta" per acconsentire. Usa il pulsante "Rifiuta" o chiudi questa informativa per continuare senza accettare.</p>'
      +     '<div id="cc-links">'
      +       '<a id="cc-privacy" href="' + PRIVACY_URL + '">Info privacy</a>'
      +       '<a id="cc-cookie" href="' + COOKIE_URL + '">Info cookie</a>'
      +       (DATA_REQUEST_URL ? '<a id="cc-data" href="' + DATA_REQUEST_URL + '">Richiesta dati</a>' : '')
      +     '</div>'
      +   '</div>'
      +   '<div id="cc-actions">'
      +     '<div class="cc-primary-actions">'
      +       '<button id="cc-reject">Rifiuta</button>'
      +       '<button id="cc-accept">Accetta</button>'
      +     '</div>'
      +     '<button id="cc-manage">Gestisci le impostazioni</button>'
      +   '</div>'
      + '</div>'
    );

    // Modale preferenze (invariata)
    var modal = document.createElement("div");
    modal.id = "cc-modal";
    modal.innerHTML = (
      '<div id="cc-card" role="dialog" aria-modal="true" aria-labelledby="cc-title">'
      +  '<h3 id="cc-title">Preferenze Cookie</h3>'
      +  '<div class="cc-row"><input id="cc-necessary" type="checkbox" checked disabled><label for="cc-necessary">Necessari (sempre attivi)</label></div>'
      +  '<div class="cc-row"><input id="cc-marketing" type="checkbox"><label for="cc-marketing">Marketing</label></div>'
      +  '<div class="cc-row"><input id="cc-statistics" type="checkbox"><label for="cc-statistics">Statistiche</label></div>'
      +  '<div style="margin-top:1.5rem">'
      +    '<button id="cc-save">Salva preferenze</button>'
      +    '<button id="cc-cancel">Annulla</button>'
      +  '</div>'
      + '</div>'
    );

    // Bottone flottante (invariato)
    var floatBtn = document.createElement("button");
    floatBtn.id = "cc-float";
    floatBtn.type = "button";
    floatBtn.setAttribute("aria-label", "Gestisci preferenze cookie");
    floatBtn.innerHTML = '<img alt="" src="https://global-files-nginx.builderall.com/da739884-a644-464d-b30b-7e2e5b966fbb/2292d049320fa34350258392c76ef64594d6b7d4adb0e27896fb1f9d08b2cdf4.svg">';
    floatBtn.addEventListener("click", function () {
      window.CC_openConsent();
    });

    // ======= VISIBILITY HELPERS AGGIORNATI =======
    function show(el){ 
      el.style.display = "block"; 
      setTimeout(function() { el.classList.add("cc-show"); }, 10);
    }
    function hide(el){ 
      el.classList.remove("cc-show");
      setTimeout(function() { el.style.display = "none"; }, 400);
    }

    // NON BLOCCHIAMO PIÙ LO SCROLL per GDPR compliance
    function showBanner() { 
      show(banner);
      hide(modal); 
      hide(docsOverlay);
      
      // Calcola e applica padding-top al body
      setTimeout(function() {
        var bannerHeight = banner.offsetHeight;
        document.documentElement.style.setProperty('--cc-banner-height', bannerHeight + 'px');
        document.body.classList.add('cc-banner-active');
      }, 10);
    }
    
    function hideBanner() { 
      hide(banner);
      document.body.classList.remove('cc-banner-active');
      document.documentElement.style.removeProperty('--cc-banner-height');
    }

    // Modali mantengono il backdrop e lock scroll
    function lockScroll(){ document.documentElement.style.overflow = "hidden"; document.body.style.overflow = "hidden"; }
    function unlockScroll(){ document.documentElement.style.overflow = ""; document.body.style.overflow = ""; }

    function showModal()  { 
      show(backdrop);
      hide(banner); 
      hide(docsOverlay);
      modal.style.display="flex"; 
      setTimeout(function() { 
        backdrop.classList.add("cc-show");
        modal.classList.add("cc-show"); 
      }, 10);
      lockScroll(); 
    }
    function hideModal()  { 
      hide(modal); 
      hide(backdrop); 
      unlockScroll(); 
    }
    function showDocs()   { 
      show(backdrop);
      hide(banner);
      hide(modal);
      docsOverlay.style.display="flex"; 
      setTimeout(function() { 
        backdrop.classList.add("cc-show");
        docsOverlay.classList.add("cc-show"); 
      }, 10);
      lockScroll(); 
    }
    function hideDocs()   { 
      hide(docsOverlay); 
      hide(backdrop);
      unlockScroll();
      // Riapri il banner originale (GDPR compliant)
      setTimeout(function() {
        showBanner();
      }, 100);
    }

    function showFloat(){ 
      if (!document.body.contains(floatBtn)) document.body.appendChild(floatBtn); 
      floatBtn.classList.add("cc-show");
    }
    function hideFloat(){ 
      floatBtn && floatBtn.classList.remove("cc-show"); 
    }

    function showSuccess(message) {
      if (message) successNotification.textContent = message;
      if (!document.body.contains(successNotification)) {
        document.body.appendChild(successNotification);
      }
      successNotification.classList.add('cc-show');
      setTimeout(function() {
        successNotification.classList.remove('cc-show');
      }, 2000);
    }

    // ======= CONSENT STATE (invariato) =======
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

    // ======= EVENT HANDLERS AGGIORNATI =======
    function wire() {
      // ACCETTA TUTTI -> marketing=true & statistics=true
      document.getElementById("cc-accept").addEventListener("click", function () {
        store(true, true);
        showSuccess("🎉 Tutti i cookie accettati!");
        showFloat();
        hideBanner();
      });
      
      // RIFIUTA -> solo tecnici (NUOVO comportamento GDPR compliant)
      document.getElementById("cc-reject").addEventListener("click", function () {
        store(false, false);
        showSuccess("❌ Solo cookie necessari attivi");
        showFloat();
        hideBanner();
      });

      // X -> comportamento identico a RIFIUTA per GDPR compliance
      document.getElementById("cc-close").addEventListener("click", function () {
        store(false, false);
        showSuccess("❌ Solo cookie necessari attivi");
        showFloat();
        hideBanner();
      });

      // GESTISCI (sincronizza prima di aprire)
      document.getElementById("cc-manage").addEventListener("click", function () {
        applyConsentToUI(readConsent());
        showModal();
      });
      
      document.getElementById("cc-cancel").addEventListener("click", function(){ 
        hideModal();
        setTimeout(function() {
          showBanner();
        }, 100);
      });

      // SALVA PREFERENZE
      document.getElementById("cc-save").addEventListener("click", function () {
        var m = document.getElementById("cc-marketing").checked;
        var s = document.getElementById("cc-statistics").checked;
        store(m, s);
        
        // Success message personalizzato
        var message = "💾 Preferenze salvate: ";
        if (m && s) {
          message += "Marketing + Statistiche";
        } else if (m) {
          message += "Solo Marketing";
        } else if (s) {
          message += "Solo Statistiche";
        } else {
          message += "Solo cookie necessari";
        }
        
        showFloat();
        hideModal();
        hideBanner();
        
        // Ritarda la notifica per evitare conflitti con le animazioni
        setTimeout(function() {
          showSuccess(message);
        }, 400);
      });

      // Link privacy/cookie → modale docs
      document.getElementById("cc-privacy").addEventListener("click", function(e){
        e.preventDefault(); 
        openDocs(PRIVACY_URL, "Info privacy");
      });
      document.getElementById("cc-cookie").addEventListener("click", function(e){
        e.preventDefault(); 
        openDocs(COOKIE_URL, "Info cookie");
      });
      // Gestisci anche il link inline nella descrizione
      document.getElementById("cc-cookie-inline").addEventListener("click", function(e){
        e.preventDefault(); 
        openDocs(COOKIE_URL, "Info cookie");
      });
      
      if (DATA_REQUEST_URL) {
        var dataLink = document.getElementById("cc-data");
        if (dataLink) dataLink.addEventListener("click", function(e){
          e.preventDefault(); 
          openDocs(DATA_REQUEST_URL, "Richiesta dati");
        });
      }

      // Docs modal handlers
      document.getElementById("cc-docs-close").addEventListener("click", function(){ hideDocs(); });
      docsOverlay.addEventListener("click", function(e){ if (e.target === docsOverlay) hideDocs(); });
      
      // Gestione tastiera
      document.addEventListener("keydown", function(e){
        if (e.key === "Escape") {
          if (docsOverlay.style.display === "flex") hideDocs();
          else if (modal.style.display === "flex") {
            hideModal();
            setTimeout(function() { showBanner(); }, 100);
          }
          // NON chiudiamo più il banner principale con ESC per GDPR compliance
        }
      });
    }

    function openDocs(url, title){
      if (!OPEN_DOCS_IN_MODAL) { 
        window.open(url, "_blank", "noopener"); 
        return; 
      }
      
      document.getElementById("cc-docs-title").textContent = title || "Informativa";
      var ifr = document.getElementById("cc-docs-iframe");
      ifr.src = url;
      
      ifr.onload = function () {
        try {
          var d = ifr.contentDocument || ifr.contentWindow.document;
          var s = d.createElement("style");
          s.textContent =
            "html,body{max-width:100%;overflow-x:auto!important;scroll-behavior:smooth}" +
            "img,video,iframe,table{max-width:100%;height:auto}" +
            ".container,.wrap,.content{max-width:100%!important}";
          d.head && d.head.appendChild(s);
          
          // Reset scroll position
          d.documentElement.scrollTop = 0;
          d.body.scrollTop = 0;
          
          // Intercetta SOLO i link che NON hanno onclick con navigateToPage
          var links = d.querySelectorAll('a[href]');
          for (var i = 0; i < links.length; i++) {
            var link = links[i];
            var href = link.getAttribute('href');
            var onclick = link.getAttribute('onclick');
            
            // Skip link che già usano navigateToPage
            if (onclick && onclick.indexOf('navigateToPage') > -1) {
              continue;
            }
            
            // Solo link relativi o che contengono privacy/cookie
            if (href && (
              !href.startsWith('http') || // link relativi
              href.indexOf('privacy') > -1 || 
              href.indexOf('cookie') > -1
            )) {
              
              link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                
                var targetHref = this.getAttribute('href');
                
                // Se è un anchor link interno (#sezione)
                if (targetHref.startsWith('#')) {
                  var targetElement = d.querySelector(targetHref);
                  if (targetElement) {
                    targetElement.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                  }
                  return;
                }
                
                // Determina il nuovo titolo
                var newTitle = "Informativa";
                if (targetHref.indexOf('cookie') > -1) {
                  newTitle = "Info cookie";
                } else if (targetHref.indexOf('privacy') > -1) {
                  newTitle = "Info privacy";
                }
                
                // Aggiorna il modal
                document.getElementById("cc-docs-title").textContent = newTitle;
                
                // Carica la nuova pagina con un piccolo delay
                setTimeout(function() {
                  ifr.src = targetHref;
                }, 10);
              });
            }
          }
          
        } catch(e) {
          console.log("[cookie-consent] Cannot modify iframe content:", e);
        }
      };
      
      showDocs();
    }
    
    function mount() {
      // Inietta CSS + DOM una sola volta
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

    // ======= API PUBBLICHE =======
    
    // API per riaprire il BANNER principale (NON le preferenze)
    window.CC_openConsent = function () { 
      // Riapre sempre il banner principale per GDPR compliance
      showBanner(); 
    };
    
    window.CC_navigateModal = function(url, title) {
      var modal = document.getElementById("cc-docs");
      if (modal && modal.style.display === "flex") {
        document.getElementById("cc-docs-title").textContent = title || "Informativa";
        var ifr = document.getElementById("cc-docs-iframe");
        ifr.src = url;
        return true;
      }
      return false;
    };

    // Message listener per navigazione modal
    window.addEventListener('message', function(event) {
      // Verifica l'origine per sicurezza
      if (event.origin !== 'https://www.alimentiamolasalute.org' && 
          event.origin !== 'https://alimentiamolasalute.org') {
        return;
      }
      
      if (event.data.type === 'NAVIGATE_MODAL' && event.data.url && event.data.title) {
        var modal = document.getElementById("cc-docs");
        if (modal && modal.style.display === "flex") {
          document.getElementById("cc-docs-title").textContent = event.data.title;
          var ifr = document.getElementById("cc-docs-iframe");
          ifr.src = event.data.url;
        }
      }
    });

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
