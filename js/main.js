/**
 * =============================================
 * 資源動態加載工具
 * =============================================
 */

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
  // 動態滑塊相關方法 (新增)
  // =============================================
  /**
   * 更新導航滑塊的位置和尺寸
   * @param {HTMLElement} targetElement -目標連結元素 (<a>)
   */
  updateIndicator: function (targetElement) {
    const nav = document.querySelector('.primary-nav');
    if (!nav || !targetElement) {
      // 如果目標不存在，隱藏滑塊
      nav.style.setProperty('--indicator-width', '0px');
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    // 計算目標相對於 nav 容器的偏移量
    const left = targetRect.left - navRect.left;
    const top = targetRect.top - navRect.top;

    nav.style.setProperty('--indicator-left', `${left}px`);
    nav.style.setProperty('--indicator-top', `${top}px`);
    nav.style.setProperty('--indicator-width', `${targetRect.width}px`);
    nav.style.setProperty('--indicator-height', `${targetRect.height}px`);
  },

  // =============================================
  // 一次性初始化 (僅在首次加載時運行)
  // =============================================
  initHeaderComponents: function () {
    console.log(">> Initializing Header Components (One-Time)");
    if (document.querySelector(".navigation")) this.initDesktopNavigation(); // 已修改
    // if (document.querySelector(".nav-toggle")) this.initMobileNavigation(); // 已停用
    if (document.getElementById("header")) this.initHeaderScroll();
    if (document.getElementById("darkModeToggle")) this.initThemeToggle();
  },

  // initDesktopNavigation 已更新，增加了滑鼠懸停動畫
  initDesktopNavigation: function () {
    const nav = document.querySelector('.primary-nav');
    if (!nav) return;
    
    const links = nav.querySelectorAll('a');
    let hoverTimeout;

    links.forEach(link => {
      // 滑鼠移入時，將滑塊移動到當前連結
      link.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        this.updateIndicator(link);
      });
    });

    // 當滑鼠離開整個導航區塊時，將滑塊移回 active 的連結
    nav.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        const activeLink = nav.querySelector('a.active');
        this.updateIndicator(activeLink);
      }, 50); // 短延遲以獲得更好體驗
    });

    // 處理下拉菜單的舊邏輯
    const dropdownToggles = nav.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        const menu = toggle.nextElementSibling;
        if (menu && menu.classList.contains('dropdown-menu')) {
            // 為了讓滑塊和下拉菜單共存，我們把事件綁定到父元素 li
            const parentLi = toggle.closest('li');
            parentLi.addEventListener('mouseenter', () => {
                menu.style.display = 'block';
            });
            parentLi.addEventListener('mouseleave', () => {
                menu.style.display = 'none';
            });
        }
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
    handleScroll();
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
    this.setActiveNav();
    this.initFancybox();
    this.initCarousel();
    this.initGitalk();
    this.initLazyLoadAndAnimate();
    this.initMarkdownRenderer();
    if (document.querySelector("model-viewer")) {
        import("https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/+esm")
          .then(() => console.log("model-viewer module loaded"))
          .catch((err) => console.error("Failed to load model-viewer module:", err));
    }
  },

  cleanupPageContent: function () {
    console.log(">> Cleaning Up Page Content (Before Swup Transition)");
    if (this.instances.carousel) {
      this.instances.carousel.destroy(); this.instances.carousel = null;
    }
    if (this.instances.lazyLoadObserver) {
      this.instances.lazyLoadObserver.disconnect(); this.instances.lazyLoadObserver = null;
      console.log("Lazy Load Observer disconnected.");
    }
    if (window.Fancybox) {
      Fancybox.close();
    }
  },

  // =============================================
  // 各個組件的初始化方法
  // =============================================
  // setActiveNav 已更新，增加了調用 updateIndicator
  setActiveNav: function () {
    const currentPath = window.location.pathname;
    const nav = document.querySelector(".primary-nav");
    if (!nav) return;

    nav.querySelectorAll(".active").forEach(activeEl => {
      activeEl.classList.remove("active");
    });

    let activeLink = null;
    if (currentPath === '/' || currentPath.startsWith('/works/')) {
      activeLink = nav.querySelector('a[href="/"]');
    } else {
      activeLink = nav.querySelector(`a[href="${currentPath}"]`);
    }
    
    if (activeLink) {
      activeLink.classList.add("active");
    }

    // 在頁面加載或切換後，延遲一小段時間再更新滑塊位置，確保渲染完成
    setTimeout(() => {
      this.updateIndicator(activeLink || nav.querySelector('a.active'));
    }, 100);
  },

  initGitalk: function() {
    this.loadModule.call(this, {
      name: 'Gitalk',
      selector: '#gitalk-container',
      flag: 'gitalkLoaded',
      css: ['/css/gitalk.css'],
      js: ['/js/gitalk.min.js'],
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
        "/js/marked.min.js",
        "/js/highlight.min.js",
      ],
      callback: render
    });
  },

  initFancybox: function () {
    this.loadModule.call(this, {
      name: 'Fancybox',
      selector: '[data-fancybox]',
      flag: 'fancyboxLoaded',
      css: ['/css/fancybox.css'],
      js: ['/js/fancybox.umd.js'],
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
      css: ['/css/carousel.css'],
      js: [
        '/js/carousel.umd.js',
        '/js/carousel.autoplay.umd.js'
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