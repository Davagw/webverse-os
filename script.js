
"use strict";

/* =========================================
   WEBVERSE 3.0
   INTERACTIVE APPLICATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================
     HELPERS
  ======================================= */

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) =>
    Array.from(document.querySelectorAll(selector));

  const storage = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    }
  };

  let language =
    storage.get("webverse-language", "ar") === "en"
      ? "en"
      : "ar";

  let theme =
    storage.get("webverse-theme", "dark") === "light"
      ? "light"
      : "dark";

  const translate = (ar, en) =>
    language === "ar" ? ar : en;

  function notify(ar, en) {
    const container = $("#toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = translate(ar, en);

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3200);
  }

  /* =======================================
     APPLICATION INTRO
  ======================================= */

  const introScreen = $("#introScreen");
  const app = $("#app");

  function launchApp() {
    introScreen?.classList.add("hidden");
    app?.classList.remove("hidden");

    storage.set("webverse-launched", "true");

    navigateTo("dashboard");
  }

  $("#launchBtn")?.addEventListener(
    "click",
    launchApp
  );

  /* =======================================
     PAGE NAVIGATION
  ======================================= */

  const pages = {
    dashboard: {
      ar: "لوحة التحكم",
      en: "DASHBOARD",
      icon: "◈"
    },
    playground: {
      ar: "مختبر الأكواد",
      en: "CODE PLAYGROUND",
      icon: "</>"
    },
    network: {
      ar: "محاكاة الشبكة",
      en: "NETWORK SIMULATOR",
      icon: "◎"
    },
    commerce: {
      ar: "المتجر التفاعلي",
      en: "COMMERCE LAB",
      icon: "▣"
    },
    learn: {
      ar: "اكتشف الويب",
      en: "WEB EXPLORER",
      icon: "✧"
    },
    about: {
      ar: "تعرف علي",
      en: "ABOUT ME",
      icon: "✦"
    },
    ai: {
      ar: "استخدام الذكاء الاصطناعي",
      en: "AI CREDITS",
      icon: "✳"
    }
  };

  let currentPage = "dashboard";

  function navigateTo(pageName) {
    if (!pages[pageName]) return;

    currentPage = pageName;

    $$(".page").forEach((page) => {
      page.classList.toggle(
        "active",
        page.dataset.pageSection === pageName
      );
    });

    $$(".nav-item").forEach((item) => {
      const active = item.dataset.page === pageName;

      item.classList.toggle("active", active);

      if (active) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    const pageLabel = $("#currentPageName");

    if (pageLabel) {
      pageLabel.textContent = pages[pageName].en;
    }

    document.title =
      `${pages[pageName].en} | WEBVERSE 3.0`;

    closeSidebar();
    closeSearch();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    if (pageName === "playground") {
      runCode(false);
    }

    if (pageName === "commerce") {
      renderCart();
    }
  }

  $$("[data-page], [data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateTo(
        button.dataset.page || button.dataset.go
      );
    });
  });

  /* =======================================
     MOBILE SIDEBAR
  ======================================= */

  const sidebar = $("#sidebar");
  const sidebarOverlay = $("#sidebarOverlay");

  function openSidebar() {
    sidebar?.classList.add("open");
    sidebarOverlay?.classList.remove("hidden");
  }

  function closeSidebar() {
    sidebar?.classList.remove("open");
    sidebarOverlay?.classList.add("hidden");
  }

  $("#menuBtn")?.addEventListener(
    "click",
    openSidebar
  );

  sidebarOverlay?.addEventListener(
    "click",
    closeSidebar
  );

  /* =======================================
     LANGUAGE SYSTEM
  ======================================= */

  function applyLanguage() {
    document.documentElement.lang = language;

    document.documentElement.dir =
      language === "ar" ? "rtl" : "ltr";

    $$("[data-ar][data-en]").forEach((element) => {
      element.textContent =
        element.dataset[language];
    });

    const languageBtn = $("#languageBtn");

    if (languageBtn) {
      languageBtn.textContent =
        language === "ar" ? "EN" : "AR";
    }

    const searchInput = $("#searchInput");

    if (searchInput) {
      searchInput.placeholder = translate(
        "ابحث داخل WEBVERSE...",
        "Search WEBVERSE..."
      );
    }

    const currentPageLabel = $("#currentPageName");

    if (currentPageLabel) {
      currentPageLabel.textContent =
        pages[currentPage].en;
    }

    const cartCount = $("#cartCount");

    if (cartCount) {
      updateCartCount();
    }

    renderCart();

    if (
      $("#searchOverlay") &&
      !$("#searchOverlay").classList.contains("hidden")
    ) {
      renderSearchResults();
    }
  }

  $("#languageBtn")?.addEventListener("click", () => {
    language = language === "ar" ? "en" : "ar";

    storage.set("webverse-language", language);

    applyLanguage();

    notify(
      "تم تغيير اللغة إلى العربية",
      "Language changed to English"
    );
  });

  /* =======================================
     THEME SYSTEM
  ======================================= */

  function applyTheme() {
    document.body.dataset.theme = theme;

    const themeBtn = $("#themeBtn");

    if (themeBtn) {
      themeBtn.textContent =
        theme === "dark" ? "☀" : "☾";
    }

    const themeMeta =
      document.querySelector('meta[name="theme-color"]');

    if (themeMeta) {
      themeMeta.content =
        theme === "dark" ? "#080b18" : "#f0f1fb";
    }
  }

  $("#themeBtn")?.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";

    storage.set("webverse-theme", theme);

    applyTheme();

    notify(
      "تم تغيير مظهر الموقع",
      "Website theme updated"
    );
  });

  /* =======================================
     COMMAND PALETTE / SEARCH
  ======================================= */

  const searchOverlay = $("#searchOverlay");
  const searchInput = $("#searchInput");
  const searchResults = $("#searchResults");

  let selectedSearchIndex = 0;
  let filteredPages = [];

  function openSearch() {
    if (app?.classList.contains("hidden")) return;

    searchOverlay?.classList.remove("hidden");

    selectedSearchIndex = 0;

    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }

    renderSearchResults();
  }

  function closeSearch() {
    searchOverlay?.classList.add("hidden");
  }

  function renderSearchResults() {
    if (!searchResults) return;

    const query =
      (searchInput?.value || "")
        .trim()
        .toLowerCase();

    filteredPages = Object.entries(pages)
      .filter(([key, page]) => {
        return (
          key.includes(query) ||
          page.ar.toLowerCase().includes(query) ||
          page.en.toLowerCase().includes(query)
        );
      });

    selectedSearchIndex = Math.min(
      selectedSearchIndex,
      Math.max(0, filteredPages.length - 1)
    );

    searchResults.replaceChildren();

    if (filteredPages.length === 0) {
      const empty = document.createElement("p");

      empty.style.padding = "20px";
      empty.style.color = "var(--muted)";
      empty.textContent = translate(
        "ما فيه نتائج مطابقة",
        "No matching results"
      );

      searchResults.appendChild(empty);
      return;
    }

    filteredPages.forEach(([key, page], index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "search-result";

      if (index === selectedSearchIndex) {
        button.classList.add("selected");
      }

      const icon = document.createElement("span");
      icon.className = "search-result-icon";
      icon.textContent = page.icon;

      const title = document.createElement("strong");
      title.textContent =
        language === "ar" ? page.ar : page.en;

      button.append(icon, title);

      button.addEventListener("click", () => {
        navigateTo(key);
      });

      searchResults.appendChild(button);
    });
  }

  function moveSearchSelection(direction) {
    if (!filteredPages.length) return;

    selectedSearchIndex =
      (
        selectedSearchIndex +
        direction +
        filteredPages.length
      ) % filteredPages.length;

    renderSearchResults();

    searchResults
      ?.querySelector(".selected")
      ?.scrollIntoView({
        block: "nearest"
      });
  }

  $("#searchBtn")?.addEventListener(
    "click",
    openSearch
  );

  $("#closeSearch")?.addEventListener(
    "click",
    closeSearch
  );

  searchInput?.addEventListener("input", () => {
    selectedSearchIndex = 0;
    renderSearchResults();
  });

  searchOverlay?.addEventListener("click", (event) => {
    if (event.target === searchOverlay) {
      closeSearch();
    }
  });

  document.addEventListener("keydown", (event) => {
    const searchIsOpen =
      !searchOverlay?.classList.contains("hidden");

    if (
      (event.metaKey || event.ctrlKey) &&
      event.key.toLowerCase() === "k"
    ) {
      event.preventDefault();

      if (searchIsOpen) {
        closeSearch();
      } else {
        openSearch();
      }

      return;
    }

    if (event.key === "Escape") {
      closeSearch();
      closeSidebar();
      return;
    }

    if (!searchIsOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveSearchSelection(1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSearchSelection(-1);
    }

    if (
      event.key === "Enter" &&
      filteredPages.length
    ) {
      event.preventDefault();

      navigateTo(
        filteredPages[selectedSearchIndex][0]
      );
    }
  });

  /* =======================================
     CODE PLAYGROUND
  ======================================= */

  const editorElements = {
    html: $("#htmlEditor"),
    css: $("#cssEditor"),
    js: $("#jsEditor")
  };

  const editorFilenames = {
    html: "index.html",
    css: "style.css",
    js: "script.js"
  };

  const defaultCode = {};

  Object.entries(editorElements).forEach(
    ([type, editor]) => {
      defaultCode[type] = editor?.value || "";
    }
  );

  let activeEditor = "html";
  let previewTimer = null;

  function getCode(type) {
    return editorElements[type]?.value || "";
  }

  function selectEditor(type) {
    if (!editorElements[type]) return;

    activeEditor = type;

    Object.entries(editorElements).forEach(
      ([key, editor]) => {
        editor?.classList.toggle(
          "hidden",
          key !== type
        );
      }
    );

    $$(".editor-tab").forEach((tab) => {
      const active = tab.dataset.editor === type;

      tab.classList.toggle("active", active);

      tab.setAttribute(
        "aria-selected",
        String(active)
      );
    });

    const filename = $("#activeFilename");

    if (filename) {
      filename.textContent = editorFilenames[type];
    }
  }

  $$(".editor-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      selectEditor(tab.dataset.editor);
    });
  });

  function buildPreviewDocument() {
    const html = getCode("html");
    const css = getCode("css");
    const js = getCode("js");

    /*
      Build a standalone preview document.

      The iframe uses sandbox="allow-scripts"
      without allow-same-origin, isolating
      preview JavaScript from the main site.
    */

    const safeCSS = css.replace(
      /<\/style/gi,
      "<\\/style"
    );

    const safeJS = js.replace(
      /<\/script/gi,
      "<\\/script"
    );

    const injectedHead = `
      <meta charset="UTF-8">
      <meta name="viewport"
            content="width=device-width, initial-scale=1">
      <style>${safeCSS}</style>
    `;

    const injectedScript =
      `<script>${safeJS}<\/script>`;

    /*
      Support both HTML fragments and complete
      HTML documents entered by the visitor.
    */

    if (/<html[\s>]/i.test(html)) {
      let documentHTML = html;

      if (/<\/head\s*>/i.test(documentHTML)) {
        documentHTML = documentHTML.replace(
          /<\/head\s*>/i,
          `${injectedHead}</head>`
        );
      } else {
        documentHTML = documentHTML.replace(
          /<html([^>]*)>/i,
          `<html$1><head>${injectedHead}</head>`
        );
      }

      if (/<\/body\s*>/i.test(documentHTML)) {
        documentHTML = documentHTML.replace(
          /<\/body\s*>/i,
          `${injectedScript}</body>`
        );
      } else {
        documentHTML += injectedScript;
      }

      return documentHTML;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
${injectedHead}
</head>
<body>
${html}
${injectedScript}
</body>
</html>`;
  }

  function runCode(showNotification = true) {
    const frame = $("#previewFrame");
    const status = $("#previewStatus");

    if (!frame) return;

    if (status) {
      status.textContent = "● RUNNING";
    }

    frame.srcdoc = buildPreviewDocument();

    if (status) {
      status.textContent = "● LIVE";
    }

    if (showNotification) {
      notify(
        "تم تشغيل الكود وتحديث المعاينة",
        "Code executed and preview updated"
      );
    }
  }

  function schedulePreview() {
    clearTimeout(previewTimer);

    previewTimer = setTimeout(() => {
      if (currentPage === "playground") {
        runCode(false);
      }
    }, 650);
  }

  Object.values(editorElements).forEach((editor) => {
    editor?.addEventListener("input", schedulePreview);

    editor?.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;

      event.preventDefault();

      const start = editor.selectionStart;
      const end = editor.selectionEnd;

      editor.setRangeText(
        "  ",
        start,
        end,
        "end"
      );

      schedulePreview();
    });
  });

  $("#runCode")?.addEventListener("click", () => {
    clearTimeout(previewTimer);
    runCode();
  });

  function saveCode() {
    const project = {
      html: getCode("html"),
      css: getCode("css"),
      js: getCode("js")
    };

    const saved = storage.set(
      "webverse-project",
      JSON.stringify(project)
    );

    if (saved) {
      notify(
        "تم حفظ مشروعك داخل المتصفح",
        "Project saved in your browser"
      );
    } else {
      notify(
        "تعذر حفظ المشروع في هذا المتصفح",
        "Unable to save the project"
      );
    }
  }

  $("#saveCode")?.addEventListener(
    "click",
    saveCode
  );

  function restoreSavedCode() {
    const saved = storage.get("webverse-project");

    if (!saved) return;

    try {
      const project = JSON.parse(saved);

      ["html", "css", "js"].forEach((type) => {
        if (
          typeof project[type] === "string" &&
          editorElements[type]
        ) {
          editorElements[type].value =
            project[type];
        }
      });
    } catch {
      // Ignore invalid saved data.
    }
  }

  $("#resetCode")?.addEventListener("click", () => {
    const confirmed = window.confirm(
      translate(
        "هل تبغى ترجع الأكواد الافتراضية؟",
        "Reset all code to the defaults?"
      )
    );

    if (!confirmed) return;

    Object.entries(editorElements).forEach(
      ([type, editor]) => {
        if (editor) {
          editor.value = defaultCode[type];
        }
      }
    );

    storage.set(
      "webverse-project",
      JSON.stringify(defaultCode)
    );

    selectEditor("html");
    runCode(false);

    notify(
      "تمت إعادة الأكواد الافتراضية",
      "Default code restored"
    );
  });

  /* =======================================
     DOWNLOAD CODE PROJECT
  ======================================= */

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob(
      [content],
      { type: mimeType }
    );

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  $("#downloadCode")?.addEventListener("click", () => {
    /*
      Download a standalone HTML file
      containing the user's HTML, CSS,
      and JavaScript.
    */

    downloadFile(
      "webverse-project.html",
      buildPreviewDocument(),
      "text/html;charset=utf-8"
    );

    notify(
      "تم تجهيز ملف مشروعك للتنزيل",
      "Your project file is ready"
    );
  });

  /* =======================================
     NETWORK SIMULATOR
  ======================================= */

  const networkNodes = [
    $("#userNode"),
    $("#browserNode"),
    $("#serverNode")
  ];

  const networkConnections =
    $$(".network-connection");

  let networkRunning = false;

  const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  function clearNetworkAnimation() {
    networkNodes.forEach((node) => {
      node?.classList.remove("active");
    });

    networkConnections.forEach((line) => {
      line.classList.remove("active");
    });
  }

  function setNetworkStatus(ar, en) {
    const element = $("#networkStatus");

    if (element) {
      element.textContent = translate(ar, en);
    }
  }

  function simulateResponse(statusCode, method) {
    const responses = {
      "200": {
        status: "OK",
        body: method === "POST"
          ? {
              success: true,
              message: "Resource created",
              id: 101
            }
          : {
              success: true,
              message: "Welcome to WEBVERSE API",
              version: "3.0"
            }
      },

      "404": {
        status: "Not Found",
        body: {
          success: false,
          error: "Resource not found"
        }
      },

      "500": {
        status: "Internal Server Error",
        body: {
          success: false,
          error: "Simulated server failure"
        }
      }
    };

    return responses[statusCode];
  }

  async function sendNetworkRequest() {
    if (networkRunning) return;

    networkRunning = true;

    const button = $("#sendRequest");

    if (button) {
      button.disabled = true;
    }

    clearNetworkAnimation();

    const method = $("#requestType")?.value || "GET";
    const statusCode = $("#responseType")?.value || "200";

    const endpoint =
      method === "POST"
        ? "/api/projects"
        : "/api/webverse";

    const request = {
      method,
      url: endpoint,
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (method === "POST") {
      request.body = {
        name: "WEBVERSE Demo"
      };
    }

    const requestLog = $("#requestLog");
    const responseLog = $("#responseLog");

    if (requestLog) {
      requestLog.textContent =
        JSON.stringify(request, null, 2);
    }

    if (responseLog) {
      responseLog.textContent =
        "Processing simulated request...";
    }

    const startTime = performance.now();

    try {
      setNetworkStatus(
        "المستخدم بدأ الطلب",
        "User initiated the request"
      );

      networkNodes[0]?.classList.add("active");
      await sleep(550);

      networkNodes[0]?.classList.remove("active");
      networkConnections[0]?.classList.add("active");

      setNetworkStatus(
        "المتصفح يرسل طلب HTTP",
        "Browser is sending an HTTP request"
      );

      await sleep(700);

      networkConnections[0]?.classList.remove("active");
      networkNodes[1]?.classList.add("active");

      await sleep(500);

      networkNodes[1]?.classList.remove("active");
      networkConnections[1]?.classList.add("active");

      setNetworkStatus(
        "الطلب في طريقه إلى الخادم",
        "Request is traveling to the server"
      );

      await sleep(700);

      networkConnections[1]?.classList.remove("active");
      networkNodes[2]?.classList.add("active");

      setNetworkStatus(
        "الخادم يعالج الطلب",
        "Server is processing the request"
      );

      await sleep(700);

      const result =
        simulateResponse(statusCode, method);

      const duration =
        Math.round(performance.now() - startTime);

      const response = {
        status: Number(statusCode),
        statusText: result.status,
        simulatedDuration: `${duration}ms`,
        body: result.body
      };

      if (responseLog) {
        responseLog.textContent =
          JSON.stringify(response, null, 2);
      }

      networkNodes[2]?.classList.remove("active");

      setNetworkStatus(
        "الخادم يرجع الاستجابة للمتصفح",
        "Server is returning the response"
      );

      networkConnections[1]?.classList.add("active");
      await sleep(500);
      networkConnections[1]?.classList.remove("active");

      networkNodes[1]?.classList.add("active");
      await sleep(400);
      networkNodes[1]?.classList.remove("active");

      networkConnections[0]?.classList.add("active");
      await sleep(500);
      networkConnections[0]?.classList.remove("active");

      networkNodes[0]?.classList.add("active");

      setNetworkStatus(
        `اكتملت المحاكاة — HTTP ${statusCode}`,
        `Simulation completed — HTTP ${statusCode}`
      );

      notify(
        `اكتملت محاكاة الطلب: ${statusCode}`,
        `Request simulation completed: ${statusCode}`
      );
    } finally {
      networkRunning = false;

      if (button) {
        button.disabled = false;
      }

      await sleep(400);
      clearNetworkAnimation();
    }
  }

  $("#sendRequest")?.addEventListener(
    "click",
    sendNetworkRequest
  );

  /* =======================================
     COMMERCE LAB
  ======================================= */

  const products = {
    keyboard: {
      name: "Neon Keyboard",
      price: 49
    },

    mouse: {
      name: "Orbit Mouse",
      price: 29
    },

    headset: {
      name: "Nova Headset",
      price: 79
    }
  };

  let cart = {};

  function restoreCart() {
    const saved = storage.get("webverse-cart");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        return;
      }

      Object.keys(products).forEach((id) => {
        const quantity = parsed[id];

        if (
          Number.isSafeInteger(quantity) &&
          quantity > 0 &&
          quantity <= 99
        ) {
          cart[id] = quantity;
        }
      });
    } catch {
      cart = {};
    }
  }

  function saveCart() {
    storage.set(
      "webverse-cart",
      JSON.stringify(cart)
    );
  }

  function getCartCount() {
    return Object.values(cart).reduce(
      (total, quantity) => total + quantity,
      0
    );
  }

  function getCartTotal() {
    return Object.entries(cart).reduce(
      (total, [id, quantity]) => {
        return total + products[id].price * quantity;
      },
      0
    );
  }

  function updateCartCount() {
    const element = $("#cartCount");

    if (!element) return;

    const count = getCartCount();

    element.textContent =
      `${count} ${count === 1 ? "ITEM" : "ITEMS"}`;
  }

  function addCommerceLog(message) {
    const log = $("#commerceLog");

    if (!log) return;

    const timestamp =
      new Date().toLocaleTimeString("en-GB");

    log.textContent +=
      `\n[${timestamp}] ${message}`;

    const lines = log.textContent.split("\n");

    if (lines.length > 18) {
      log.textContent =
        lines.slice(-18).join("\n");
    }

    log.scrollTop = log.scrollHeight;
  }

  function renderCart() {
    const container = $("#cartItems");
    const totalElement = $("#cartTotal");

    if (!container) return;

    container.replaceChildren();

    const entries = Object.entries(cart);

    if (!entries.length) {
      const empty = document.createElement("p");

      empty.textContent = translate(
        "السلة فارغة، أضف منتجًا للبدء",
        "Your cart is empty. Add a product to begin."
      );

      container.appendChild(empty);
    }

    entries.forEach(([id, quantity]) => {
      const product = products[id];

      if (!product) return;

      const item = document.createElement("div");
      item.className = "cart-item";

      const info = document.createElement("div");

      const name = document.createElement("strong");
      name.textContent = product.name;

      const details = document.createElement("small");
      details.textContent =
        `${quantity} × $${product.price}`;

      info.append(name, details);

      const removeButton =
        document.createElement("button");

      removeButton.type = "button";
      removeButton.textContent = "×";
      removeButton.setAttribute(
        "aria-label",
        `Remove ${product.name}`
      );

      removeButton.addEventListener("click", () => {
        removeFromCart(id);
      });

      item.append(info, removeButton);
      container.appendChild(item);
    });

    if (totalElement) {
      totalElement.textContent =
        `$${getCartTotal().toFixed(2)}`;
    }

    updateCartCount();
  }

  function addToCart(id) {
    if (!products[id]) return;

    const current = cart[id] || 0;

    if (current >= 99) {
      notify(
        "وصلت للحد الأعلى لهذا المنتج",
        "Maximum quantity reached"
      );
      return;
    }

    cart[id] = current + 1;

    saveCart();
    renderCart();

    addCommerceLog(
      `POST /api/cart → 200 OK | Added ${products[id].name}`
    );

    notify(
      "تمت إضافة المنتج للسلة",
      "Product added to cart"
    );
  }

  function removeFromCart(id) {
    if (!cart[id]) return;

    const productName = products[id].name;

    if (cart[id] > 1) {
      cart[id] -= 1;
    } else {
      delete cart[id];
    }

    saveCart();
    renderCart();

    addCommerceLog(
      `DELETE /api/cart/${id} → 200 OK | Updated ${productName}`
    );
  }

  $$("[data-product]").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.product);
    });
  });

  $("#clearCartBtn")?.addEventListener("click", () => {
    cart = {};

    saveCart();
    renderCart();

    addCommerceLog(
      "DELETE /api/cart → 200 OK | Cart cleared"
    );

    notify(
      "تم تفريغ السلة",
      "Shopping cart cleared"
    );
  });

  let checkoutRunning = false;

  $("#checkoutBtn")?.addEventListener(
    "click",
    async () => {
      if (checkoutRunning) return;

      if (getCartCount() === 0) {
        notify(
          "أضيفي منتجًا للسلة أولًا",
          "Add a product to the cart first"
        );
        return;
      }

      checkoutRunning = true;

      const button = $("#checkoutBtn");

      if (button) {
        button.disabled = true;
      }

      const order = {
        orderId: `WV-${Date.now()}`,
        items: Object.entries(cart).map(
          ([id, quantity]) => ({
            product: products[id].name,
            quantity,
            unitPrice: products[id].price
          })
        ),
        total: getCartTotal()
      };

      addCommerceLog(
        "POST /api/checkout → Processing simulated order..."
      );

      await sleep(950);

      addCommerceLog(
        `200 OK | Order ${order.orderId} | Total $${order.total.toFixed(2)}`
      );

      addCommerceLog(
        "Simulated checkout completed. No payment processed."
      );

      cart = {};

      saveCart();
      renderCart();

      notify(
        "اكتمل الطلب التجريبي بنجاح، بدون دفع حقيقي",
        "Demo order completed. No real payment was made."
      );

      checkoutRunning = false;

      if (button) {
        button.disabled = false;
      }
    }
  );

  /* =======================================
     INITIALIZE APPLICATION
  ======================================= */

  restoreSavedCode();
  restoreCart();

  applyTheme();
  applyLanguage();

  selectEditor("html");
  renderCart();
  runCode(false);

  /*
    The intro is shown on each new page load
    to preserve the WEBVERSE launch experience.
  */

  navigateTo("dashboard");

  console.info(
    "%c WEBVERSE 3.0 ",
    "background:#7852df;color:white;padding:8px 15px;font-weight:bold;"
  );

  console.info(
    "WEBVERSE initialized successfully."
  );

});
