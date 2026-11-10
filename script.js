
"use strict";

/* ====================================
   WEBVERSE OS - APPLICATION SYSTEM
==================================== */

const bootScreen = document.getElementById("bootScreen");
const desktop = document.getElementById("desktop");
const enterBtn = document.getElementById("enterBtn");

const appWindow = document.getElementById("appWindow");
const windowContent = document.getElementById("windowContent");
const windowTitle = document.getElementById("windowTitle");
const windowIcon = document.getElementById("windowIcon");
const closeWindowBtn = document.getElementById("closeWindow");

const languageBtn = document.getElementById("languageBtn");
const themeBtn = document.getElementById("themeBtn");
const systemClock = document.getElementById("systemClock");

let currentLanguage = "ar";
let currentApp = null;
let lastAppButton = null;
let appSession = 0;

const appDetails = {
  about: {
    template: "aboutTemplate",
    ar: "تعرف علي",
    en: "About Me",
    icon: "✦"
  },
  web: {
    template: "webTemplate",
    ar: "عالم الويب",
    en: "The Web",
    icon: "◎"
  },
  html: {
    template: "htmlTemplate",
    ar: "مختبر HTML",
    en: "HTML Lab",
    icon: "</>"
  },
  css: {
    template: "cssTemplate",
    ar: "استوديو CSS",
    en: "CSS Studio",
    icon: "{ }"
  },
  javascript: {
    template: "javascriptTemplate",
    ar: "مختبر JavaScript",
    en: "JavaScript Lab",
    icon: "JS"
  },
  backend: {
    template: "backendTemplate",
    ar: "الواجهة الأمامية والخلفية",
    en: "Frontend & Backend",
    icon: "⌘"
  },
  ai: {
    template: "aiTemplate",
    ar: "استخدام الذكاء الاصطناعي",
    en: "AI Credits",
    icon: "✳"
  }
};

/* ====================================
   HELPERS
==================================== */

function translate(ar, en) {
  return currentLanguage === "ar" ? ar : en;
}

function applyTranslations(container = document) {
  container.querySelectorAll("[data-ar][data-en]")
    .forEach(element => {
      element.textContent = element.dataset[currentLanguage];
    });
}

function setStatus(element, ar, en) {
  if (!element) return;

  element.dataset.ar = ar;
  element.dataset.en = en;
  element.textContent = translate(ar, en);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sessionIsActive(name, session) {
  return (
    currentApp === name &&
    appSession === session &&
    !appWindow.classList.contains("hidden")
  );
}

/* ====================================
   WELCOME SCREEN
==================================== */

enterBtn.addEventListener("click", () => {
  bootScreen.classList.add("hidden");
  desktop.classList.remove("hidden");
  enterBtn.blur();
});

/* ====================================
   LANGUAGE SWITCH
==================================== */

languageBtn.addEventListener("click", () => {
  currentLanguage = currentLanguage === "ar" ? "en" : "ar";

  document.documentElement.lang = currentLanguage;
  document.documentElement.dir =
    currentLanguage === "ar" ? "rtl" : "ltr";

  languageBtn.textContent =
    currentLanguage === "ar" ? "EN" : "AR";

  applyTranslations(document);

  if (currentApp) {
    windowTitle.textContent =
      appDetails[currentApp][currentLanguage];
  }

  const jsText = document.getElementById("jsDemoText");

  if (jsText && jsText.dataset.changed === "true") {
    jsText.textContent = translate(
      "نجحت التجربة!",
      "YOU DID IT!"
    );
  }
});

/* ====================================
   THEME SWITCH
==================================== */

function applyTheme(theme) {
  document.body.dataset.theme = theme;

  themeBtn.textContent = theme === "dark" ? "☀" : "☾";

  themeBtn.setAttribute(
    "aria-label",
    theme === "dark"
      ? "Switch to light mode"
      : "Switch to dark mode"
  );
}

themeBtn.addEventListener("click", () => {
  const nextTheme =
    document.body.dataset.theme === "dark"
      ? "light"
      : "dark";

  applyTheme(nextTheme);

  try {
    localStorage.setItem("webverse-theme", nextTheme);
  } catch (error) {
    // Storage is optional.
  }
});

try {
  const savedTheme = localStorage.getItem("webverse-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
  } else {
    applyTheme("dark");
  }
} catch (error) {
  applyTheme("dark");
}

/* ====================================
   CLOCK
==================================== */

function updateClock() {
  const now = new Date();

  systemClock.textContent = now.toLocaleTimeString(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

updateClock();
setInterval(updateClock, 30000);

/* ====================================
   APPLICATION WINDOWS
==================================== */

function openApp(appName, trigger = null) {
  const app = appDetails[appName];

  if (!app) return;

  const template = document.getElementById(app.template);

  if (!template) return;

  appSession++;
  currentApp = appName;
  lastAppButton = trigger;

  windowContent.replaceChildren(
    template.content.cloneNode(true)
  );

  windowTitle.textContent = app[currentLanguage];
  windowIcon.textContent = app.icon;

  appWindow.classList.remove("hidden");

  applyTranslations(windowContent);

  windowContent.scrollTop = 0;

  document.querySelectorAll("[data-app]").forEach(button => {
    button.classList.toggle(
      "app-active",
      button.dataset.app === appName
    );
  });

  initializeApp(appName, appSession);

  closeWindowBtn.focus();
}

function closeApp() {
  if (appWindow.classList.contains("hidden")) return;

  appSession++;
  currentApp = null;

  appWindow.classList.add("hidden");
  windowContent.replaceChildren();

  document.querySelectorAll("[data-app]").forEach(button => {
    button.classList.remove("app-active");
  });

  if (lastAppButton) {
    lastAppButton.focus();
  }
}

document.querySelectorAll("[data-app]").forEach(button => {
  button.addEventListener("click", () => {
    openApp(button.dataset.app, button);
  });
});

closeWindowBtn.addEventListener("click", closeApp);

document.addEventListener("keydown", event => {
  if (appWindow.classList.contains("hidden")) return;

  if (event.key === "Escape") {
    closeApp();
    return;
  }

  // Keep keyboard focus inside the open dialog.
  if (event.key === "Tab") {
    const focusable = [
      ...appWindow.querySelectorAll(
        "button:not(:disabled), textarea, input, a[href]"
      )
    ].filter(element => element.getClientRects().length > 0);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  }
});

function initializeApp(appName, session) {
  switch (appName) {
    case "web":
      initializeWebApp(session);
      break;

    case "html":
      initializeHtmlApp();
      break;

    case "css":
      initializeCssApp();
      break;

    case "javascript":
      initializeJavaScriptApp();
      break;

    case "backend":
      initializeBackendApp(session);
      break;
  }
}

/* ====================================
   WEB REQUEST SIMULATOR
==================================== */

function initializeWebApp(session) {
  const button = document.getElementById("simulateRequest");
  const status = document.getElementById("networkStatus");

  const nodes = [
    document.getElementById("networkUser"),
    document.getElementById("networkBrowser"),
    document.getElementById("networkServer")
  ];

  const lines = [
    ...windowContent.querySelectorAll(".network-line")
  ];

  let running = false;

  button.addEventListener("click", async () => {
    if (running) return;

    running = true;
    button.disabled = true;

    nodes.forEach(node => node.classList.remove("active"));
    lines.forEach(line => line.classList.remove("active"));

    nodes[0].classList.add("active");

    setStatus(
      status,
      "المستخدم يطلب فتح الموقع...",
      "The user opens a website..."
    );

    await delay(700);

    if (!sessionIsActive("web", session)) return;

    lines[0].classList.add("active");
    nodes[1].classList.add("active");

    setStatus(
      status,
      "المتصفح يرسل طلب HTTP إلى الخادم...",
      "The browser sends an HTTP request..."
    );

    await delay(900);

    if (!sessionIsActive("web", session)) return;

    lines[1].classList.add("active");
    nodes[2].classList.add("active");

    setStatus(
      status,
      "الخادم يعالج الطلب ويجهز الاستجابة...",
      "The server processes the request..."
    );

    await delay(950);

    if (!sessionIsActive("web", session)) return;

    setStatus(
      status,
      "الخادم يعيد الاستجابة والمتصفح يعرض الصفحة بنجاح!",
      "The server responds and the browser displays the page!"
    );

    lines.forEach(line => line.classList.remove("active"));

    button.disabled = false;
    running = false;
  });
}

/* ====================================
   HTML LAB
==================================== */

function initializeHtmlApp() {
  const codeInput = document.getElementById("htmlCode");
  const preview = document.getElementById("htmlPreview");
  const runButton = document.getElementById("runHtml");

  function renderHtml() {
    const htmlCode = codeInput.value;

    // The preview iframe is sandboxed without script permissions.
    preview.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport"
                content="width=device-width, initial-scale=1.0">
          <style>
            body {
              padding: 20px;
              font-family: Arial, sans-serif;
              color: #222;
            }

            button {
              padding: 10px 18px;
              border: 0;
              border-radius: 8px;
              background: #7656d8;
              color: white;
            }
          </style>
        </head>
        <body>
          ${htmlCode}
        </body>
      </html>
    `;
  }

  runButton.addEventListener("click", renderHtml);

  codeInput.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) &&
        event.key === "Enter") {
      event.preventDefault();
      renderHtml();
    }
  });

  renderHtml();
}

/* ====================================
   CSS STUDIO - BEFORE & AFTER
==================================== */

function initializeCssApp() {
  const backgroundInput =
    document.getElementById("backgroundColor");

  const textInput =
    document.getElementById("textColor");

  const radiusInput =
    document.getElementById("borderRadius");

  const demoCard =
    document.getElementById("cssDemoCard");

  const generatedCode =
    document.getElementById("cssGeneratedCode");

  function updateCss() {
    const background = backgroundInput.value;
    const color = textInput.value;
    const radius = radiusInput.value;

    demoCard.style.backgroundColor = background;
    demoCard.style.color = color;
    demoCard.style.borderRadius = `${radius}px`;

    generatedCode.textContent =
`/* Your generated CSS */

.card {
  background-color: ${background};
  color: ${color};
  border-radius: ${radius}px;
}`;
  }

  backgroundInput.addEventListener("input", updateCss);
  textInput.addEventListener("input", updateCss);
  radiusInput.addEventListener("input", updateCss);

  updateCss();
}

/* ====================================
   JAVASCRIPT LAB
==================================== */

function initializeJavaScriptApp() {
  const button = document.getElementById("jsActionBtn");
  const demoBox = document.getElementById("jsInteractiveBox");
  const demoText = document.getElementById("jsDemoText");

  button.addEventListener("click", () => {
    demoBox.classList.toggle("changed");

    const changed = demoBox.classList.contains("changed");

    demoText.dataset.changed = String(changed);

    demoText.textContent = changed
      ? translate("نجحت التجربة!", "YOU DID IT!")
      : "HELLO JAVASCRIPT";
  });
}

/* ====================================
   FRONTEND / BACKEND SIMULATION
==================================== */

function initializeBackendApp(session) {
  const buyButton = document.getElementById("buyProduct");
  const orderLog = document.getElementById("orderLog");

  let cartCount = 0;
  let processing = false;

  buyButton.addEventListener("click", async () => {
    if (processing) return;

    processing = true;
    buyButton.disabled = true;

    const nextCount = cartCount + 1;
    const orderId = `WV-${String(nextCount).padStart(3, "0")}`;

    orderLog.textContent =
      `> POST /api/cart\n` +
      `> Request ID: ${orderId}\n` +
      `> Processing request...`;

    await delay(850);

    if (!sessionIsActive("backend", session)) return;

    cartCount = nextCount;

    orderLog.textContent =
      `> POST /api/cart\n` +
      `> Request ID: ${orderId}\n` +
      `> Product: WEBVERSE KEYBOARD\n` +
      `> Unit price: $49.00\n` +
      `> Cart items: ${cartCount}\n` +
      `> Cart total: $${(cartCount * 49).toFixed(2)}\n` +
      `> Simulated response: 200 OK`;

    setStatus(
      buyButton,
      "تمت الإضافة ✓",
      "Added to Cart ✓"
    );

    await delay(1100);

    if (!sessionIsActive("backend", session)) return;

    setStatus(
      buyButton,
      "أضف للسلة",
      "Add to Cart"
    );

    buyButton.disabled = false;
    processing = false;
  });
}

/* ====================================
   STARTUP
==================================== */

applyTranslations(document);
