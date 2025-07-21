/**
 * =============================================
 * 资源动态加载工具
 * =============================================
 */

/**
 * 动态加载一个 CSS 文件
 * @param {string} url - CSS 文件的 URL
 */
const loadCss = (url) => {
  // 防止重复加载同一个 CSS
  if (document.querySelector(`link[href="${url}"]`)) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
};

/**
 * 动态加载一个 JS 文件，并返回一个 Promise
 * @param {string} url - JS 文件的 URL
 * @returns {Promise<void>}
 */
const loadScript = (url) => {
  // 防止重复加载同一个 JS
  if (document.querySelector(`script[src="${url}"]`)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${url}`));
    document.head.appendChild(script);
  });
};


/**
 * =============================================
 * 原有网站功能模块
 * =============================================
 */

/**
 * 加载 HTML 组件到指定的选择器中
 * @param {string} selector - 目标容器的 CSS 选择器 (e.g., "#header-placeholder")
 * @param {string} url - 要加载的 HTML 文件的路径 (e.g., "/components/header.html")
 * @returns {Promise} - 在组件加载完成后解析的 Promise
 */
const loadComponent = (selector, url) =>
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.text();
    })
    .then((html) => {
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = html;
      }
    })
    .catch((error) => console.error(`Error loading ${url}:`, error));

/**
 * 网站主要功能模块
 */
const Site = {
  // 用于存放需要手动管理状态的组件实例
  instances: {
    carousel: null,
    lazyLoadObserver: null,
  },
  // 用于跟踪 Markdown 库是否已加载
  markdownLibsLoaded: false,

  // =============================================
  // 一次性初始化 (仅在首次加载时运行)
  // =============================================
  initHeaderComponents: function () {
    console.log(">> Initializing Header Components (One-Time)");
    if ($(".navigation").length) this.initDesktopNavigation();
    if ($(".nav-toggle").length) this.initMobileNavigation();
    if ($("#header").length) this.initHeaderScroll();
    if ($("#darkModeToggle").length) this.initThemeToggle();
  },

  initDesktopNavigation: function () {
    let hoverTimeout;
    const dropdownMenus = $(".dropdown-menu");

    dropdownMenus
      .on("mouseenter", () => clearTimeout(hoverTimeout))
      .on("mouseleave", () => dropdownMenus.hide());

    $(".navigation a")
      .on("mouseenter", function () {
        clearTimeout(hoverTimeout);
        $(this).next(".dropdown-menu").show().siblings(".dropdown-menu").hide();
      })
      .on("mouseleave", () => {
        hoverTimeout = setTimeout(() => dropdownMenus.hide(), 300);
      });
  },

  initMobileNavigation: function () {
    const navToggle = $(".nav-toggle");
    const navigation = $('nav[role="navigation"]');
    navigation.find(".dropdown-menu").hide(); // 初始隐藏

    navToggle.on("click", function () {
      $(this).toggleClass("close-nav");
      navigation.toggleClass("open");
    });

    navigation.find("a").on("click", function () {
      navToggle.trigger("click"); // 点击链接后关闭菜单
    });
  },

  initHeaderScroll: function () {
    const $window = $(window);
    const $header = $("#header");
    const scrollThreshold = 50;

    $window.on("scroll", function () {
      $header.toggleClass("fixed", $window.scrollTop() >= scrollThreshold);
    });

    $window.trigger("scroll");
  },

  initThemeToggle: function () {
    const themeToggle = $("#darkModeToggle");
    const body = $("body");
    const themeKey = "theme";

    function applyTheme(themeName) {
      body.removeClass("light-mode dark-mode").addClass(themeName + "-mode");
    }

    const savedTheme = localStorage.getItem(themeKey) || "light";
    applyTheme(savedTheme);

    themeToggle.on("click", function () {
      const newTheme = body.hasClass("light-mode") ? "dark" : "light";
      applyTheme(newTheme);
      localStorage.setItem(themeKey, newTheme);
    });
  },

  // =============================================
  // Swup 生命周期钩子函数
  // =============================================

  initPageContent: function () {
    console.log(">> Initializing Page Content (After Swup Transition)");
    this.setActiveNav();
    this.initFancybox();
    this.initCarousel();
    this.initGitalk();
    this.initLazyLoadAndAnimate();
    this.initMarkdownRenderer(); // 调用 Markdown 渲染器

    if (document.querySelector("model-viewer")) {
      import("https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/+esm")
        .then(() => {
          console.log("model-viewer module loaded");
        })
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
    Fancybox.close();
  },
  // =============================================
  // 各个组件的初始化方法
  // =============================================
  setActiveNav: function () {
    const currentPath = window.location.pathname;
    $(".primary-nav a, .dropdown-menu a").each(function () {
      const $link = $(this);
      const linkPath = $link.attr("href");

      $link.removeClass("active");
      $link.closest(".dropdown").find(".dropdown-toggle").removeClass("active");

      if (linkPath === currentPath) {
        $link.addClass("active");
        if ($link.closest(".dropdown").length) {
          $link
            .closest(".dropdown")
            .find(".dropdown-toggle")
            .first()
            .addClass("active");
        }
      }
    });
  },

initGitalk: function () {
    // 检查页面是否存在 Gitalk 容器
    if (document.getElementById("gitalk-container")) {
      console.log("Gitalk container found, loading resources...");

      // 定义资源 URL
      const gitalkCssUrl = "/css/gitalk.css";
      const gitalkJsUrl = "https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js";

      // 并行加载 CSS 和 JS 文件
      Promise.all([
        loadCss(gitalkCssUrl),
        loadScript(gitalkJsUrl)
      ])
      .then(() => {
        // 当两个文件都加载成功后，再执行初始化
        console.log("Gitalk resources loaded successfully. Initializing...");
        
        // 确保 Gitalk 构造函数已在全局可用
        if (typeof Gitalk === 'undefined') {
            console.error('Gitalk is not defined after loading the script.');
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
      })
      .catch(error => {
        // 如果加载失败，打印错误
        console.error("Failed to load Gitalk resources:", error);
      });
    }
  },
  
  /**
   * 真正执行 Markdown 渲染的函数
   */
  renderMarkdown: function() {
    const container = document.getElementById('code-md-output');
    if (!container || !container.dataset.mdSource) {
      return;
    }
    
    const mdUrl = container.dataset.mdSource;
    console.log(`Rendering Markdown from: ${mdUrl}`);

    fetch(mdUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
      })
      .then(md => {
        container.innerHTML = marked.parse(md);
        container.querySelectorAll('pre code').forEach((el) => {
          hljs.highlightElement(el);
        });
        console.log("Markdown rendered and highlighted successfully.");
      })
      .catch(error => console.error(`Error fetching or rendering Markdown:`, error));
  },
  
  /**
   * 初始化 Markdown 渲染器，会先检查并加载所需库
   */
  initMarkdownRenderer: function() {
    // 只有当页面上存在 markdown 容器时才继续
    if (!document.getElementById('code-md-output')) {
      return;
    }
    
    // 如果库已经加载，直接渲染
    if (this.markdownLibsLoaded) {
      this.renderMarkdown();
      return;
    }
    
    // 如果库未加载，则先加载它们
    console.log("Markdown libraries not found, loading them now...");
    
    const markedUrl = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
    const hljsUrl = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/x86asm.min.js";
    // const hljsCssUrl = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/default.min.css";
    
    // // 加载 CSS
    // loadCss(hljsCssUrl);
    
    // 并行加载 JS 库
    Promise.all([
      loadScript(markedUrl),
      loadScript(hljsUrl)
    ])
    .then(() => {
      console.log("Markdown libraries loaded successfully.");
      this.markdownLibsLoaded = true; // 标记为已加载
      this.renderMarkdown(); // 加载完成后立即渲染
    })
    .catch(error => {
      console.error("Failed to load one or more Markdown libraries:", error);
    });
  },

  initFancybox: function () {
    Fancybox.bind("[data-fancybox]", {});
  },

  initCarousel: function () {
    const carouselContainer = document.getElementById("myCarousel");
    if (carouselContainer) {
      console.log("Carousel container found, initializing...");
      this.instances.carousel = new Carousel(
        carouselContainer,
        {
          transition: "crossfade",
          Autoplay: {
            timeout: 3000,
          },
        },
        {
          Autoplay: Autoplay,
        }
      );
    }
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
      console.log(
        `Lazy Load Observer created and watching ${animatedElements.length} elements.`
      );
  },
};


// =============================================
//  主执行逻辑
// =============================================

const swup = new Swup();

function runOneTimeSetup() {
  const headerPromise = loadComponent("#header-placeholder", "/components/header.html");
  const footerPromise = loadComponent("#footer-placeholder", "/components/footer.html");

  headerPromise.then(() => {
    Site.initHeaderComponents();
    Site.setActiveNav();
  });
}
runOneTimeSetup();

// 首次加载时，初始化页面内容
Site.initPageContent();

// 将方法绑定到 Swup 的生命周期钩子
swup.hooks.on('animation:out:end', Site.cleanupPageContent.bind(Site)); 
swup.hooks.on('page:view', Site.initPageContent.bind(Site));