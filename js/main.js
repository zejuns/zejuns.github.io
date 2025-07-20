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

    $window.trigger("scroll"); // 页面加载时立即执行一次，确保初始状态正确
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

  /**
   * 初始化页面内容 (在每个新页面载入后运行)
   */
  initPageContent: function () {
    console.log(">> Initializing Page Content (After Swup Transition)");
    this.setActiveNav();
    this.initFancybox();
    this.initCarousel();
    this.initGitalk();
    this.initLazyLoadAndAnimate();
  },

  /**
   * 清理页面内容 (在离开当前页面前运行)
   */
  cleanupPageContent: function () {
    console.log(">> Cleaning Up Page Content (Before Swup Transition)");
    // 销毁旧页面的 Carousel 实例，防止内存泄漏和冲突
    if (this.instances.carousel) {
      this.instances.carousel.destroy();
      this.instances.carousel = null;
    }
    if (this.instances.lazyLoadObserver) {
      this.instances.lazyLoadObserver.disconnect();
      this.instances.lazyLoadObserver = null;
      console.log("Lazy Load Observer disconnected.");
    }
    // 关闭可能打开的 Fancybox 弹窗
    Fancybox.close();
  },
  // =============================================
  // 各个组件的初始化方法
  // =============================================

  /**
   * 根据当前 URL 高亮导航链接
   */
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

  /**
   * 初始化 Gitalk 评论系统
   */
  initGitalk: function () {
    if ($("#gitalk-container").length) {
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
  },

  /**
   * 初始化 Fancybox
   */
  initFancybox: function () {
    Fancybox.bind("[data-fancybox]", {
      // 在这里可以添加 Fancybox 的全局配置
    });
  },

  /**
   * 初始化 Carousel
   */
  initCarousel: function () {
    const carouselContainer = document.getElementById("myCarousel");
    // 只有当页面上存在 #myCarousel 元素时才初始化
    if (carouselContainer) {
      console.log("Carousel container found, initializing...");
      // 创建新的实例并保存
      this.instances.carousel = new Carousel(
        carouselContainer,
        {
          transition: "crossfade",
          Autoplay: {
            timeout: 3000,
          },
        },
        {
          // 注册 Autoplay 插件
          Autoplay: Autoplay,
        }
      );
    }
  },

  /**
   * 初始化懒加载和入场动画 (最终版 - 容器动画)
   */
  initLazyLoadAndAnimate: function () {
      const animatedElements = document.querySelectorAll(".lazy-load-element");
      if (!animatedElements.length) return;

      // 修改这里的回调逻辑
      const observerCallback = (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const img = element.querySelector("img[data-src]");

            if (img) {
              // 监听图片加载完成事件
              img.onload = () => {
                // 图片加载完成后，再触发动画
                element.classList.add("is-visible");
              };
              // 如果图片加载失败，也显示容器，避免布局错乱
              img.onerror = () => {
                element.classList.add("is-visible");
              };
              
              // 开始加载图片
              img.src = img.dataset.src;
              img.removeAttribute("data-src");

            } else {
              // 如果容器内没有图片，直接播放动画
              element.classList.add("is-visible");
            }
            
            // 停止观察该容器
            observer.unobserve(element);
          }
        });
      };

      this.instances.lazyLoadObserver = new IntersectionObserver(
        observerCallback,
        {
          root: null,
          threshold: 0.15, // 保持你原来的设置
        }
      );

      animatedElements.forEach((element) => {
        this.instances.lazyLoadObserver.observe(element);
      });
      console.log(
        `Lazy Load Observer created and watching ${animatedElements.length} elements.`
      );
  },
};
