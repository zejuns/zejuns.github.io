const loadComponent = (n, e) =>
    fetch(e)
      .then((n) => {
        if (!n.ok)
          throw new Error("Network response was not ok " + n.statusText);
        return n.text();
      })
      .then((e) => {
        const o = document.querySelector(n);
        o && (o.innerHTML = e);
      })
      .catch((n) => console.error(`Error loading ${e}:`, n)),
  Site = {
    instances: { carousel: null },
    initHeaderComponents: function () {
      console.log(">> Initializing Header Components (One-Time)"),
        $(".navigation").length && this.initDesktopNavigation(),
        $(".nav-toggle").length && this.initMobileNavigation(),
        $("#header").length && this.initHeaderScroll(),
        $("#darkModeToggle").length && this.initThemeToggle();
    },
    initDesktopNavigation: function () {
      let n;
      const e = $(".dropdown-menu");
      e
        .on("mouseenter", () => clearTimeout(n))
        .on("mouseleave", () => e.hide()),
        $(".navigation a")
          .on("mouseenter", function () {
            clearTimeout(n),
              $(this)
                .next(".dropdown-menu")
                .show()
                .siblings(".dropdown-menu")
                .hide();
          })
          .on("mouseleave", () => {
            n = setTimeout(() => e.hide(), 300);
          });
    },
    initMobileNavigation: function () {
      const n = $(".nav-toggle"),
        e = $('nav[role="navigation"]');
      e.find(".dropdown-menu").hide(),
        n.on("click", function () {
          $(this).toggleClass("close-nav"), e.toggleClass("open");
        }),
        e.find("a").on("click", function () {
          n.trigger("click");
        });
    },
    initHeaderScroll: function () {
    const n = $(window),
        e = $("#header"),
        o = 50;
    n.on("scroll", function () {
        e.toggleClass("fixed", n.scrollTop() >= o);
    });

    n.trigger("scroll"); // 新增这行：在页面加载时手动触发一次滚动事件
    },
    initThemeToggle: function () {
      function n(n) {
        o.removeClass("light-mode dark-mode").addClass(n + "-mode");
      }
      const e = $("#darkModeToggle"),
        o = $("body"),
        t = "theme",
        i = localStorage.getItem(t) || "light";
      n(i),
        e.on("click", function () {
          const e = o.hasClass("light-mode") ? "dark" : "light";
          n(e), localStorage.setItem(t, e);
        });
    },
    initPageContent: function () {
      console.log(">> Initializing Page Content (After Swup Transition)"),
        this.setActiveNav(),
        this.initGitalk(),
        this.initFancybox(),
        this.initCarousel();
        this.initLazyLoadAndAnimate();
    },
    cleanupPageContent: function () {
      console.log(">> Cleaning Up Page Content (Before Swup Transition)"),
        this.instances.carousel &&
          (this.instances.carousel.destroy(), (this.instances.carousel = null)),
        Fancybox.close();
    },
    setActiveNav: function () {
      const n = window.location.pathname;
      $(".primary-nav a, .dropdown-menu a").each(function () {
        const e = $(this),
          o = e.attr("href");
        e.removeClass("active"),
          e.closest(".dropdown").find(".dropdown-toggle").removeClass("active"),
          o === n &&
            (e.addClass("active"),
            e.closest(".dropdown").length &&
              e
                .closest(".dropdown")
                .find(".dropdown-toggle")
                .first()
                .addClass("active"));
      });
    },
    initGitalk: function () {
      if ($("#gitalk-container").length) {
        const n = new Gitalk({
          clientID: "2658e1c2a15202f4ea1a",
          clientSecret: "efe03ae68db5b4aef7fa72a3aa7bbf249a143383",
          repo: "zejuns.github.io",
          owner: "zejuns",
          admin: ["zejuns"],
          id: location.pathname,
          distractionFreeMode: !1,
        });
        n.render("gitalk-container");
      }
    },
    initFancybox: function () {
      Fancybox.bind("[data-fancybox]", {});
    },
    initCarousel: function () {
      const n = document.getElementById("myCarousel");
      n &&
        (this.instances.carousel = new Carousel(
          n,
          { transition: "crossfade", Autoplay: { timeout: 3e3 } },
          { Autoplay: Autoplay }
        ));
    },
  initLazyLoadAndAnimate: function() {
    const targets = document.querySelectorAll('.work');
    if (!targets.length) return;

    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        // 當元素進入可視區域
        if (entry.isIntersecting) {
          // 1. 觸發動畫
          entry.target.classList.add('is-visible');

          // 2. 懶加載圖片
          const img = entry.target.querySelector('img[data-src]');
          if (img) {
            img.src = img.dataset.src; // 將 data-src 的內容賦值給 src
            img.removeAttribute('data-src'); // 載入後移除 data-src
          }
          
          // 3. 停止觀察此元素，動畫只觸發一次
          observer.unobserve(entry.target);
        }
      });
    };

    const observerOptions = {
      root: null, // 相對於瀏覽器視窗
      threshold: 0.1 // 當元素 10% 可見時觸發
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    targets.forEach(target => {
      observer.observe(target);
    });
  }
};
