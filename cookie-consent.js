// cookie-consent.js — banner centrato, SVG icons, modale docs responsive, GTM event - VERSIONE MODERNIZZATA
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

    // ======= CSS MODERNIZZATO =======
    var css = ""
      // Backdrop modernizzato con blur maggiore e animazioni
      + "#cc-backdrop{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.4);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:none;opacity:0;transition:all .4s cubic-bezier(.16,1,.3,1)}"
      + "#cc-backdrop.cc-show{opacity:1}"
      
      // Banner modernizzato con glassmorphism
      + "#cc-banner{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(.8);z-index:100001;"
      + "background:rgba(255,255,255,.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);"
      + "border:1px solid rgba(255,255,255,.8);box-shadow:0 20px 60px rgba(0,0,0,.15),0 0 0 1px rgba(255,255,255,.1) inset;"
      + "padding:2rem;border-radius:24px;width:min(720px,92vw);max-height:86vh;overflow:auto;color:#1a1a1a;"
      + "font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;"
      + "display:none;opacity:0;transition:all .5s cubic-bezier(.16,1,.3,1);-webkit-text-size-adjust:100%}"
      + "#cc-banner.cc-show{opacity:1;transform:translate(-50%,-50%) scale(1)}"
      
      // Gradient top border modernizzato
      + "#cc-banner::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;"
      + "background:linear-gradient(90deg,#2e7d32,#4caf50,#66bb6a);border-radius:24px 24px 0 0}"
      
      // Titolo modernizzato
      + "#cc-banner h3{margin:0 0 1.5rem;color:#2e7d32;font-size:1.4rem;font-weight:700;line-height:1.3;padding-right:40px}"
      
      // Paragrafi come feature cards modernizzate
      + "#cc-banner p{margin:1rem 0;font-size:.95rem;line-height:1.5;display:flex;gap:12px;align-items:flex-start;"
      + "padding:12px;border-radius:12px;background:rgba(46,125,50,.04);border:1px solid rgba(46,125,50,.1);"
      + "transition:all .2s ease}"
      + "#cc-banner p:hover{background:rgba(46,125,50,.08);transform:translateX(4px)}"
      + "#cc-banner p svg{color:#2e7d32;flex-shrink:0;margin-top:2px;width:20px;height:20px}"
      + "#cc-banner p span{color:#333}"
      
      // Actions modernizzate
      + "#cc-actions{margin-top:1.5rem;display:flex;flex-wrap:nowrap;gap:12px;align-items:stretch}"
      + "#cc-actions button{flex:1 1 0;min-width:0;white-space:normal;word-break:break-word;line-height:1.2;"
      + "padding:14px 16px;margin:0;border-radius:12px;border:none;font-weight:600;cursor:pointer;"
      + "font-size:.95rem;text-align:center;transition:all .3s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden}"
      
      // Shimmer effect sui bottoni
      + "#cc-actions button::before{content:'';position:absolute;inset:0;"
      + "background:linear-gradient(45deg,transparent,rgba(255,255,255,.1),transparent);"
      + "transform:translateX(-100%);transition:transform .6s}"
      + "#cc-actions button:hover::before{transform:translateX(100%)}"
      
      // Bottone Accept modernizzato
      + "#cc-accept{background:linear-gradient(135deg,#2e7d32,#388e3c);color:#fff;"
      + "box-shadow:0 4px 15px rgba(46,125,50,.3)}"
      + "#cc-accept:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(46,125,50,.4)}"
      
      // Bottone Manage modernizzato
      + "#cc-manage{background:rgba(0,0,0,.04);color:#333;border:1px solid rgba(0,0,0,.1)}"
      + "#cc-manage:hover{background:rgba(0,0,0,.08);transform:translateY(-1px)}"
      
      // Close button modernizzato
      + "#cc-close{position:absolute;top:16px;right:20px;background:rgba(0,0,0,.05);border:none;"
      + "width:36px;height:36px;border-radius:50%;cursor:pointer;display:flex;align-items:center;"
      + "justify-content:center;transition:all .2s ease;color:#666;font-size:16px}"
      + "#cc-close:hover{background:rgba(0,0,0,.1);transform:scale(1.1)}"
      
      // Links modernizzati
      + "#cc-links{font-size:.9rem;margin:1.5rem 0 1rem;display:flex;flex-wrap:wrap;gap:16px}"
      + "#cc-links a{color:#2e7d32;text-decoration:none;padding:4px 8px;border-radius:6px;"
      + "transition:all .2s ease;border:1px solid transparent}"
      + "#cc-links a:hover{background:rgba(46,125,50,.1);border-color:rgba(46,125,50,.2);transform:translateY(-1px)}"
      
      // Modal modernizzato
      + "#cc-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:100002;"
      + "background:rgba(0,0,0,.6);opacity:0;transition:opacity .3s ease}"
      + "#cc-modal.cc-show{opacity:1}"
      + "#cc-card{background:rgba(255,255,255,.95);backdrop-filter:blur(20px);color:#111;max-width:520px;"
      + "width:92%;border-radius:20px;padding:2rem;box-shadow:0 20px 60px rgba(0,0,0,.2);"
      + "border:1px solid rgba(255,255,255,.8);transform:scale(.9);"
      + "transition:transform .3s cubic-bezier(.16,1,.3,1)}"
      + "#cc-modal.cc-show #cc-card{transform:scale(1)}"
      + "#cc-card h3{margin:0 0 1.5rem;color:#2e7d32;font-size:1.3rem;font-weight:700}"
      
      // Preference rows modernizzate
      + ".cc-row{display:flex;align-items:center;gap:12px;margin:12px 0;padding:16px;"
      + "border-radius:12px;background:rgba(0,0,0,.02);border:1px solid rgba(0,0,0,.05);"
      + "transition:all .2s ease}"
      + ".cc-row:hover{background:rgba(0,0,0,.04)}"
      + ".cc-row input{transform:scale(1.3);margin:0;accent-color:#2e7d32;cursor:pointer}"
      + ".cc-row label{flex:1;font-weight:600;color:#333;cursor:pointer}"
      
      // Save/Cancel buttons modernizzati
      + "#cc-save{background:linear-gradient(135deg,#2e7d32,#388e3c);color:#fff;padding:12px 24px;"
      + "border:none;border-radius:12px;font-weight:600;cursor:pointer;margin-right:12px;"
      + "transition:all .3s ease}"
      + "#cc-save:hover{transform:translateY(-1px);box-shadow:0 4px 15px rgba(46,125,50,.3)}"
      + "#cc-cancel{background:rgba(0,0,0,.04);color:#333;padding:12px 24px;"
      + "border:1px solid rgba(0,0,0,.1);border-radius:12px;cursor:pointer;transition:all .2s ease}"
      + "#cc-cancel:hover{background:rgba(0,0,0,.08);transform:translateY(-1px)}"
      
      // Docs modal modernizzato
      + "#cc-docs{position:fixed;inset:0;z-index:100003;background:rgba(0,0,0,.6);display:none;"
      + "align-items:center;justify-content:center;overflow:hidden;opacity:0;transition:opacity .3s ease}"
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
      
      // Floating button modernizzato
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
      
      // Success notification
      + ".cc-success{position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#4caf50,#66bb6a);"
      + "color:white;padding:12px 20px;border-radius:12px;box-shadow:0 8px 25px rgba(76,175,80,.3);"
      + "transform:translateX(400px);transition:all .4s cubic-bezier(.16,1,.3,1);z-index:100010;"
      + "font-weight:600;pointer-events:none}"
      + ".cc-success.cc-show{transform:translateX(0)}"
      
      // Animations
      + "@keyframes cc-bounceIn{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.05)}70%{transform:scale(.9)}100%{transform:scale(1);opacity:1}}"
      
      // Responsive ottimizzato per mobile
      + "@media (max-width:640px){"
      + "#cc-banner{padding:1rem;border-radius:16px;width:90vw;max-height:88vh}"
      + "#cc-banner h3{font-size:1.1rem;margin-bottom:1rem;line-height:1.2;padding-right:35px}"
      + "#cc-banner p{margin:.6rem 0;padding:8px;font-size:.85rem;line-height:1.3}"
      + "#cc-banner p svg{width:16px;height:16px}"
      + "#cc-actions{flex-direction:column;gap:10px;margin-top:1rem}"
      + "#cc-actions button{padding:12px 16px;font-size:.9rem;border-radius:10px;text-align:center;white-space:normal;word-wrap:break-word}"
      + "#cc-links{margin:1rem 0 .8rem;gap:12px;font-size:.9rem;justify-content:center}"
      + "#cc-docs-card{width:100vw;height:100dvh;border-radius:0}"
      + "#cc-float{width:56px;height:56px;padding:4px}#cc-float img{width:44px;height:44px}"
      + "#cc-card{padding:1.2rem;width:88%;margin:0 6%}"
      + ".cc-row{padding:12px;margin:8px 0}"
      + "#cc-close{top:12px;right:15px;width:32px;height:32px;font-size:14px}"
      + "}"
      + "@media (max-width:480px){"
      + "#cc-banner{padding:.9rem;width:92vw;max-height:90vh}"
      + "#cc-banner h3{font-size:1rem;margin-bottom:.8rem;padding-right:30px}"
      + "#cc-banner p{margin:.5rem 0;padding:6px;font-size:.8rem}"
      + "#cc-actions{gap:8px}"
      + "#cc-actions button{font-size:.85rem;padding:11px 14px;min-height:44px}"
      + "#cc-links{flex-wrap:wrap;justify-content:center;gap:8px}"
      + "#cc-links a{font-size:.85rem;padding:6px 10px;min-height:36px;display:inline-block}"
      + "#cc-float{left:calc(8px + env(safe-area-inset-left));bottom:calc(8px + env(safe-area-inset-bottom));"
      + "width:52px;height:52px;padding:4px}#cc-float img{width:40px;height:40px}"
      + "#cc-card{padding:1rem;width:90%;margin:0 5%}"
      + ".cc-row{padding:10px;font-size:.9rem}"
      + ".cc-row input{transform:scale(1.2)}"
      + "#cc-close{top:10px;right:12px;width:30px;height:30px;font-size:13px}"
      + "}"
      + "@media (max-width:360px){"
      + "#cc-banner{padding:.8rem;border-radius:12px;width:94vw}"
      + "#cc-banner h3{font-size:.95rem;margin-bottom:.6rem;padding-right:28px}"
      + "#cc-banner p{margin:.4rem 0;padding:4px;font-size:.75rem}"
      + "#cc-actions button{font-size:.8rem;padding:10px 12px;min-height:42px}"
      + "#cc-links{gap:6px}"
      + "#cc-links a{font-size:.8rem;padding:5px 8px;min-height:34px}"
      + "#cc-float{width:48px;height:48px}#cc-float img{width:36px;height:36px}"
      + "#cc-card{padding:.8rem;width:92%;margin:0 4%}"
      + ".cc-row{padding:8px;font-size:.85rem}"
      + "#cc-close{top:8px;right:10px;width:28px;height:28px;font-size:12px}"
      + "}"
      + "@media (max-height:600px) and (max-width:640px){"
      + "#cc-banner{max-height:92vh;overflow-y:auto}"
      + "#cc-banner h3{font-size:1rem;margin-bottom:.5rem}"
      + "#cc-banner p{margin:.3rem 0;padding:4px;font-size:.75rem;line-height:1.2}"
      + "#cc-links{margin:.5rem 0;gap:4px}"
      + "#cc-actions{gap:6px}"
      + "}";

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

    // Modale documenti (privacy/cookie) - IDENTICA ALL'ORIGINALE
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

    // === Contenuto banner (TUO testo IDENTICO) ===
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

    // Modale preferenze (Necessari locked) - IDENTICA ALL'ORIGINALE
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

    // Bottone flottante per riaprire il BANNER - IDENTICO ALL'ORIGINALE
    var floatBtn = document.createElement("button");
    floatBtn.id = "cc-float";
    floatBtn.type = "button";
    floatBtn.setAttribute("aria-label", "Gestisci preferenze cookie");
    floatBtn.innerHTML = '<img alt="" src="https://global-files-nginx.builderall.com/da739884-a644-464d-b30b-7e2e5b966fbb/2292d049320fa34350258392c76ef64594d6b7d4adb0e27896fb1f9d08b2cdf4.svg">';
    floatBtn.addEventListener("click", function () {
      window.CC_openConsent();
    });

    // ======= VISIBILITY HELPERS MODERNIZZATI =======
    function show(el){ 
      el.style.display = "block"; 
      setTimeout(function() { el.classList.add("cc-show"); }, 10);
    }
    function hide(el){ 
      el.classList.remove("cc-show");
      setTimeout(function() { el.style.display = "none"; }, 300);
    }

    function lockScroll(){ document.documentElement.style.overflow = "hidden"; document.body.style.overflow = "hidden"; }
    function unlockScroll(){ document.documentElement.style.overflow = ""; document.body.style.overflow = ""; }

    function showBanner() { 
      show(backdrop); 
      show(banner); 
      hide(modal); 
      hide(docsOverlay); 
      lockScroll(); 
    }
function hideBanner() {
    hide(backdrop);
    hide(banner);
    unlockScroll();
    showFloat(); // La cosa fondamentale è chiamare showFloat DOPO unlockScroll
}

    // 👉 FIX centratura modali: display:flex CON ANIMAZIONI
    function showModal()  { 
      backdrop.style.display="block"; 
      banner.classList.remove("cc-show");
      docsOverlay.classList.remove("cc-show");
      modal.style.display="flex"; 
      setTimeout(function() { 
        backdrop.classList.add("cc-show");
        modal.classList.add("cc-show"); 
      }, 10);
      lockScroll(); 
    }
function hideModal() {
    hide(modal);
    hide(backdrop);
    unlockScroll();
    showFloat(); // Anche qui, chiamalo solo DOPO aver sbloccato lo scroll
}
    function showDocs()   { 
      backdrop.style.display="block"; 
      banner.classList.remove("cc-show");
      modal.classList.remove("cc-show");
      docsOverlay.style.display="flex"; 
      setTimeout(function() { 
        backdrop.classList.add("cc-show");
        docsOverlay.classList.add("cc-show"); 
      }, 10);
      lockScroll(); 
    }
    function hideDocs()   { 
      hide(docsOverlay); 
      show(banner); 
      show(backdrop); 
      lockScroll(); 
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
  
  // Rimuovi la notifica dopo un certo tempo.
  setTimeout(function() {
    successNotification.classList.remove('cc-show');
  }, 1000); // 1 secondo
}

    // ======= CONSENT STATE (IDENTICO ALL'ORIGINALE) =======
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

    // ======= MOUNT (IDENTICO ALL'ORIGINALE CON SUCCESS MESSAGES) =======
    function wire() {
      // ACCETTA TUTTI -> marketing=true & statistics=true
      document.getElementById("cc-accept").addEventListener("click", function () {
        store(true, true);
        showSuccess("🎉 Tutti i cookie accettati!");
        showFloat();
        hideBanner();
      });
      
      // X -> solo tecnici (LOGICA ORIGINALE)
      document.getElementById("cc-close").addEventListener("click", function () {
        var existing = getCookie(COOKIE_NAME);
        if (!existing) {
          // prima volta → solo tecnici
          store(false, false);
          showSuccess("❌ Solo cookie tecnici attivi");
        } else {
          // X successiva → NON toccare le preferenze
          // (solo chiudi; lasciamo invariato quanto già scelto)
          showSuccess("✅ Preferenze mantenute");
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
        showSuccess(message);
        
        showFloat();
        hideModal();
      });

      // Link privacy/cookie → modale docs (IDENTICO ALL'ORIGINALE)
      document.getElementById("cc-privacy").addEventListener("click", function(e){
        e.preventDefault(); 
        openDocs(PRIVACY_URL, "Informativa sulla privacy");
      });
      document.getElementById("cc-cookie").addEventListener("click", function(e){
        e.preventDefault(); 
        openDocs(COOKIE_URL, "Informativa sui cookie");
      });
      if (DATA_REQUEST_URL) {
        var dataLink = document.getElementById("cc-data");
        if (dataLink) dataLink.addEventListener("click", function(e){
          e.preventDefault(); 
          openDocs(DATA_REQUEST_URL, "Richiesta dei tuoi dati");
        });
      }

      // Docs modal handlers (IDENTICO ALL'ORIGINALE)
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
            "html,body{max-width:100%;overflow-x:auto!important}" +
            "img,video,iframe,table{max-width:100%;height:auto}" +
            ".container,.wrap,.content{max-width:100%!important}";
          d.head && d.head.appendChild(s);
        } catch(e) {/* cross-origin: ignora */}
      };
      showDocs(); // ora è display:flex
    }

    function mount() {
      // inietta CSS + DOM una sola volta (IDENTICO ALL'ORIGINALE)
      document.head.appendChild(style);
      document.body.appendChild(backdrop);
      document.body.appendChild(banner);
      document.body.appendChild(modal);
      document.body.appendChild(docsOverlay);
      document.body.appendChild(floatBtn);

      wire();

      // Se consenso già presente → mostra solo bottone e sincronizza UI (IDENTICO ALL'ORIGINALE)
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

    // API per riaprire il BANNER principale (IDENTICA ALL'ORIGINALE)
    window.CC_openConsent = function () { showBanner(); };

    // Ready (IDENTICO ALL'ORIGINALE)
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      mount();
    }

  } catch (err) {
    console.error("[cookie-consent] fatal error:", err);
  }
})();




