function updateAssetPaths() {
  console.log(">> Smart updating asset paths...");
  const ASSET_BASE_URL = 'https://www.zejuns.com';

  // 1. 定義要檢查的元素和屬性
  // 我們要找圖片、影片、音訊、連結等元素的資源路徑
  const elements = document.querySelectorAll('img, source, video, a, link');
  const attributesToCheck = ['src', 'href', 'poster', 'data-src', 'data-poster'];

  // 2. 遍歷所有找到的元素
  elements.forEach(el => {
    // 3. 遍歷每個元素需要檢查的屬性
    attributesToCheck.forEach(attr => {
      // 檢查元素是否有這個屬性 (e.g., <video> 有 poster 但 <img> 沒有)
      if (el.hasAttribute(attr)) {
        const originalPath = el.getAttribute(attr);

        // 4. 只修改以 /assets/ 開頭的相對路徑
        if (originalPath && originalPath.startsWith('/assets/')) {
          const newPath = ASSET_BASE_URL + originalPath;
          el.setAttribute(attr, newPath);
          // console.log(`Rewrote ${attr} for ${el.tagName}: ${originalPath} -> ${newPath}`);
        }
      }
    });
  });
}

/**
 * 動態加載一個 CSS 文件
 * @param {string} url - CSS 文件的 URL
 */
const loadCss = (url) => {
  if (document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
};

/**
 * 動態加載一個 JS 文件，並返回一個 Promise
 * @param {string} url - JS 文件的 URL
 * @returns {Promise<void>}
 */
const loadScript = (url) => {
  if (document.querySelector(`script[src="${url}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${url}`));
    document.head.appendChild(script);
  });
};

/**
 * 通用模塊加載器
 * @param {object} config - 配置對象
 * @param {string} config.name - 模塊名稱 (用於日誌)
 * @param {string} config.selector - 觸發加載的元素選擇器
 * @param {string} config.flag - Site 對象中用於標記加載狀態的屬性名
 * @param {string[]} [config.css=[]] - 需要加載的 CSS URL 數組
 * @param {string[]} [config.js=[]] - 需要加載的 JS URL 數組 (會按順序加載)
 * @param {function} config.callback - 資源加載完成後執行的回調函數
 */
async function loadModule(config) {
  // 設置默認值
  const { name, selector, flag, css = [], js = [], callback } = config;

  if (!document.querySelector(selector)) return;

  // `this` 應指向 Site 對象
  if (this[flag]) {
    if (callback) callback.call(this); // 使用 .call 確保上下文
    return;
  }

  console.log(`${name} elements found, loading resources...`);

  try {
    css.forEach(url => loadCss(url));
    for (const url of js) {
      await loadScript(url);
    }

    console.log(`${name} resources loaded successfully. Initializing...`);
    this[flag] = true;
    if (callback) callback.call(this);

  } catch (error) {
    console.error(`Failed to load ${name} resources:`, error);
  }
}

/**
 * =============================================
 * 網站主要功能模塊
 * =============================================
 */

/**
 * 加載 HTML 組件
 * @param {string} selector
 * @param {string} url
 * @returns {Promise<void>}
 */
const loadComponent = async (selector, url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
    const html = await response.text();
    const element = document.querySelector(selector);
    if (element) {
      element.innerHTML = html;
    }
  } catch (error) {
    console.error(`Error loading ${url}:`, error);
  }
};

/**
 * 網站主要功能模塊
 */
const Site = {
  instances: {
    carousel: null,
    lazyLoadObserver: null,
  },
  state: {
    markdownLibsLoaded: false,
    fancyboxLoaded: false,
    carouselLoaded: false,
    gitalkLoaded: false,
  },
  loadModule, // 將通用加載器綁定到 Site 對象

  // =============================================
  // 一次性初始化 (僅在首次加載時運行)
  // =============================================
  initHeaderComponents: function () {
    console.log(">> Initializing Header Components (One-Time)");
    if (document.querySelector(".navigation")) this.initDesktopNavigation();
    if (document.querySelector(".nav-toggle")) this.initMobileNavigation();
    if (document.getElementById("header")) this.initHeaderScroll();
    if (document.getElementById("darkModeToggle")) this.initThemeToggle();
  },

  initDesktopNavigation: function () {
    const nav = document.querySelector('.navigation');
    if (!nav) return;
    let hoverTimeout;

    // 當鼠標進入導航區時，清除隱藏菜單的計時器
    nav.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
    });

    // 當鼠標離開整個導航區時，設置計時器以隱藏所有菜單
    nav.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none');
      }, 300);
    });

    // 為每個帶有下拉菜單的鏈接添加事件
    document.querySelectorAll('.navigation a').forEach(link => {
      const nextMenu = link.nextElementSibling;
      if (nextMenu && nextMenu.classList.contains('dropdown-menu')) {
        link.addEventListener('mouseenter', function() {
          // 隱藏所有其他菜單
          document.querySelectorAll('.dropdown-menu').forEach(menu => {
            if (menu !== nextMenu) {
              menu.style.display = 'none';
            }
          });
          // 顯示當前菜單
          nextMenu.style.display = 'block';
        });
      }
    });
  },

  initMobileNavigation: function () {
    const navToggle = document.querySelector(".nav-toggle");
    const navigation = document.querySelector('nav[role="navigation"]');
    if (!navToggle || !navigation) return;

    // 初始隱藏所有下拉菜單
    navigation.querySelectorAll(".dropdown-menu").forEach(menu => menu.style.display = "none");

    navToggle.addEventListener("click", function () {
      this.classList.toggle("close-nav");
      navigation.classList.toggle("open");
    });

    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        // 如果菜單是打開的，模擬點擊來關閉它
        if (navigation.classList.contains("open")) {
          navToggle.click();
        }
      });
    });
  },

  initHeaderScroll: function () {
    const header = document.getElementById("header");
    if (!header) return;
    const scrollThreshold = 50;

    const handleScroll = () => {
      header.classList.toggle("fixed", window.scrollY >= scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 初始加載時檢查一次
  },

  initThemeToggle: function () {
    const themeToggle = document.getElementById("darkModeToggle");
    if (!themeToggle) return;

    const body = document.body;
    const themeKey = "theme";

    const applyTheme = (themeName) => {
      body.classList.remove("light-mode", "dark-mode");
      body.classList.add(themeName + "-mode");
    };

    const savedTheme = localStorage.getItem(themeKey) || "light";
    applyTheme(savedTheme);

    themeToggle.addEventListener("click", () => {
      const newTheme = body.classList.contains("light-mode") ? "dark" : "light";
      applyTheme(newTheme);
      localStorage.setItem(themeKey, newTheme);
    });
  },

  // =============================================
  // Swup 生命周期鉤子函數
  // =============================================

  initPageContent: function () {
    console.log(">> Initializing Page Content (After Swup Transition)");
    updateAssetPaths();
    this.setActiveNav();
    this.initFancybox();
    this.initCarousel();
    this.initGitalk();
    this.initLazyLoadAndAnimate();
    this.initMarkdownRenderer();

    // 加載 model-viewer
    if (document.querySelector("model-viewer")) {
        import("https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/+esm")
          .then(() => console.log("model-viewer module loaded"))
          .catch((err) => console.error("Failed to load model-viewer module:", err));
    }
  },

  cleanupPageContent: function () {
    console.log(">> Cleaning Up Page Content (Before Swup Transition)");
    if (this.instances.carousel) {
      this.instances.carousel.destroy();
      this.instances.carousel = null;
    }
    if (this.instances.lazyLoadObserver) {
      this.instances.lazyLoadObserver.disconnect();
      this.instances.lazyLoadObserver = null;
      console.log("Lazy Load Observer disconnected.");
    }
    if (window.Fancybox) {
      Fancybox.close();
    }
  },

  // =============================================
  // 各個組件的初始化方法
  // =============================================
  setActiveNav: function () {
    const currentPath = window.location.pathname;
    document.querySelectorAll(".primary-nav a, .dropdown-menu a").forEach(link => {
      link.classList.remove("active");
      const dropdownParent = link.closest(".dropdown");
      if (dropdownParent) {
          const toggle = dropdownParent.querySelector('.dropdown-toggle');
          if(toggle) toggle.classList.remove("active");
      }

      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
        if (dropdownParent) {
          const toggle = dropdownParent.querySelector('.dropdown-toggle');
          if(toggle) toggle.classList.add("active");
        }
      }
    });
  },

  initGitalk: function() {
    this.loadModule.call(this, {
      name: 'Gitalk',
      selector: '#gitalk-container',
      flag: 'gitalkLoaded',
      css: ['/css/gitalk.css'],
      js: ['https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js'],
      callback: () => {
        if (typeof Gitalk === 'undefined') {
          console.error('Gitalk is not defined.');
          return;
        }
        const gitalk = new Gitalk({
          clientID: "2658e1c2a15202f4ea1a",
          clientSecret: "efe03ae68db5b4aef7fa72a3aa7bbf249a143383",
          repo: "zejuns.github.io",
          owner: "zejuns",
          admin: ["zejuns"],
          id: location.pathname,
          distractionFreeMode: false,
        });
        gitalk.render("gitalk-container");
      }
    });
  },
  
  initMarkdownRenderer: function() {
    const render = async () => {
      const container = document.getElementById('code-md-output');
      if (!container || !container.dataset.mdSource) return;
      try {
        const mdUrl = container.dataset.mdSource;
        const res = await fetch(mdUrl);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const md = await res.text();
        container.innerHTML = marked.parse(md);
        container.querySelectorAll('pre code').forEach((el) => {
          hljs.highlightElement(el);
        });
        console.log("Markdown rendered and highlighted successfully.");
      } catch (error) {
        console.error(`Error fetching or rendering Markdown:`, error);
      }
    };

    this.loadModule.call(this, {
      name: 'Markdown Renderer',
      selector: '#code-md-output',
      flag: 'markdownLibsLoaded',
      js: [
        "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js",
      ],
      callback: render
    });
  },

  initFancybox: function () {
    this.loadModule.call(this, {
      name: 'Fancybox',
      selector: '[data-fancybox]',
      flag: 'fancyboxLoaded',
      css: ['https://cdn.jsdelivr.net/npm/@fancyapps/ui@6.0/dist/fancybox/fancybox.css'],
      js: ['https://cdn.jsdelivr.net/npm/@fancyapps/ui@6.0/dist/fancybox/fancybox.umd.js'],
      callback: () => {
        if (typeof Fancybox !== 'undefined') {
          Fancybox.bind("[data-fancybox]", {});
        }
      }
    });
  },

  initCarousel: function () {
    this.loadModule.call(this, {
      name: 'Carousel',
      selector: '#myCarousel',
      flag: 'carouselLoaded',
      css: ['https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/carousel/carousel.css'],
      js: [
        'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/carousel/carousel.umd.js',
        'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/carousel/carousel.autoplay.umd.js'
      ],
      callback: function() { // 使用 function() 確保 this 指向 Site
        if (typeof Carousel === 'undefined' || typeof Autoplay === 'undefined') {
          console.error('Carousel or Autoplay is not defined.');
          return;
        }
        const container = document.getElementById("myCarousel");
        this.instances.carousel = new Carousel(container, 
          { transition: "crossfade", Autoplay: { timeout: 3000 } }, 
          { Autoplay: Autoplay }
        );
      }
    });
  },

  initLazyLoadAndAnimate: function () {
      const animatedElements = document.querySelectorAll(".lazy-load-element");
      if (!animatedElements.length) return;

      const observerCallback = (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const img = element.querySelector("img[data-src]");

            if (img) {
              img.onload = () => { element.classList.add("is-visible"); };
              img.onerror = () => { element.classList.add("is-visible"); };
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            } else {
              element.classList.add("is-visible");
            }
            observer.unobserve(element);
          }
        });
      };

      this.instances.lazyLoadObserver = new IntersectionObserver(
        observerCallback,
        { root: null, threshold: 0.1, }
      );

      animatedElements.forEach((element) => {
        this.instances.lazyLoadObserver.observe(element);
      });
      console.log(`Lazy Load Observer created and watching ${animatedElements.length} elements.`);
  },
};


/**
 * =============================================
 * 主執行邏輯
 * =============================================
 */

const swup = new Swup();

// 一次性初始化 (加載頁頭頁腳等)
const runOneTimeSetup = async () => {
  await loadComponent("#header-placeholder", "/components/header.html");
  // header 加載完成後，初始化其中的組件
  Site.initHeaderComponents();
  Site.setActiveNav();

  // 異步加載頁腳
  loadComponent("#footer-placeholder", "/components/footer.html");
};

runOneTimeSetup();

// 首次加載時，初始化頁面內容
Site.initPageContent();

// 將方法綁定到 Swup 的生命周期鉤子
swup.hooks.on('animation:out:end', Site.cleanupPageContent.bind(Site)); 
swup.hooks.on('page:view', () => {
  Site.initPageContent();
  // Swup 加載新頁面後，header 依然存在，需要重新設置 active 狀態
  Site.setActiveNav();
});