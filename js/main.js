async function loadModule(e) {
  const {
    name: t,
    selector: o,
    flag: n,
    css: a = [],
    js: s = [],
    callback: i,
  } = e;
  if (document.querySelector(o))
    if (this[n]) i && i.call(this);
    else {
      console.log(`${t} elements found, loading resources...`);
      try {
        a.forEach((e) => loadCss(e));
        for (const e of s) await loadScript(e);
        console.log(`${t} resources loaded successfully. Initializing...`),
          (this[n] = !0),
          i && i.call(this);
      } catch (e) {
        console.error(`Failed to load ${t} resources:`, e);
      }
    }
}
const loadCss = (e) => {
    if (document.querySelector(`link[href="${e}"]`)) return;
    const t = document.createElement("link");
    (t.rel = "stylesheet"), (t.href = e), document.head.appendChild(t);
  },
  loadScript = (e) =>
    document.querySelector(`script[src="${e}"]`)
      ? Promise.resolve()
      : new Promise((t, o) => {
          const n = document.createElement("script");
          (n.src = e),
            (n.onload = () => t()),
            (n.onerror = () => o(new Error(`Script load error for ${e}`))),
            document.head.appendChild(n);
        }),
  loadComponent = async (e, t) => {
    try {
      const o = await fetch(t);
      if (!o.ok)
        throw new Error(`Network response was not ok: ${o.statusText}`);
      const n = await o.text(),
        a = document.querySelector(e);
      a && (a.innerHTML = n);
    } catch (e) {
      console.error(`Error loading ${t}:`, e);
    }
  },
  Site = {
    instances: { carousel: null, lazyLoadObserver: null },
    state: {
      markdownLibsLoaded: !1,
      fancyboxLoaded: !1,
      carouselLoaded: !1,
      gitalkLoaded: !1,
    },
    loadModule: loadModule,
    initHeaderComponents: function () {
      console.log(">> Initializing Header Components (One-Time)"),
        document.querySelector(".navigation") && this.initDesktopNavigation(),
        document.querySelector(".nav-toggle") && this.initMobileNavigation(),
        document.getElementById("header") && this.initHeaderScroll(),
        document.getElementById("darkModeToggle") && this.initThemeToggle();
    },
    initDesktopNavigation: function () {
      const e = document.querySelector(".navigation");
      if (!e) return;
      let t;
      e.addEventListener("mouseenter", () => {
        clearTimeout(t);
      }),
        e.addEventListener("mouseleave", () => {
          t = setTimeout(() => {
            document
              .querySelectorAll(".dropdown-menu")
              .forEach((e) => (e.style.display = "none"));
          }, 300);
        }),
        document.querySelectorAll(".navigation a").forEach((e) => {
          const t = e.nextElementSibling;
          t &&
            t.classList.contains("dropdown-menu") &&
            e.addEventListener("mouseenter", function () {
              document.querySelectorAll(".dropdown-menu").forEach((e) => {
                e !== t && (e.style.display = "none");
              }),
                (t.style.display = "block");
            });
        });
    },
    initMobileNavigation: function () {
      const e = document.querySelector(".nav-toggle"),
        t = document.querySelector('nav[role="navigation"]');
      e &&
        t &&
        (t
          .querySelectorAll(".dropdown-menu")
          .forEach((e) => (e.style.display = "none")),
        e.addEventListener("click", function () {
          this.classList.toggle("close-nav"), t.classList.toggle("open");
        }),
        t.querySelectorAll("a").forEach((o) => {
          o.addEventListener("click", () => {
            t.classList.contains("open") && e.click();
          });
        }));
    },
    initHeaderScroll: function () {
      const e = document.getElementById("header");
      if (!e) return;
      const t = 50,
        o = () => {
          e.classList.toggle("fixed", window.scrollY >= t);
        };
      window.addEventListener("scroll", o), o();
    },
    initThemeToggle: function () {
      const toggleButton = document.getElementById("darkModeToggle");
      if (!toggleButton) return;

      const body = document.body;
      const themeKey = "theme";

      const applyTheme = (theme) => {
        body.classList.remove("light-mode", "dark-mode");
        body.classList.add(theme + "-mode");
      };
      let initialTheme = localStorage.getItem(themeKey);

      if (!initialTheme) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        initialTheme = prefersDark ? 'dark' : 'light';
      }

      applyTheme(initialTheme);
      toggleButton.addEventListener("click", () => {
        const newTheme = body.classList.contains("light-mode") ? "dark" : "light";
        applyTheme(newTheme);
        localStorage.setItem(themeKey, newTheme);
      });
    },
    initPageContent: function () {
      console.log(">> Initializing Page Content (After Swup Transition)"),
        this.setActiveNav(),
        this.initFancybox(),
        this.initCarousel(),
        this.initGitalk(),
        this.initLazyLoadAndAnimate(),
        this.initMarkdownRenderer(),
        document.querySelector("model-viewer") &&
          import("https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/+esm")
            .then(() => console.log("model-viewer module loaded"))
            .catch((e) =>
              console.error("Failed to load model-viewer module:", e)
            );
    },
    cleanupPageContent: function () {
      console.log(">> Cleaning Up Page Content (Before Swup Transition)"),
        this.instances.carousel &&
          (this.instances.carousel.destroy(), (this.instances.carousel = null)),
        this.instances.lazyLoadObserver &&
          (this.instances.lazyLoadObserver.disconnect(),
          (this.instances.lazyLoadObserver = null),
          console.log("Lazy Load Observer disconnected.")),
        window.Fancybox && Fancybox.close();
    },
    setActiveNav: function () {
      const e = window.location.pathname;
      if (
        (document.querySelectorAll(".primary-nav .active").forEach((e) => {
          e.classList.remove("active");
        }),
        "/" === e || e.startsWith("/works/"))
      ) {
        const e = document.querySelector('.primary-nav a[href="/"]');
        e && e.classList.add("active");
      }
      const t = document.querySelector(`.primary-nav a[href="${e}"]`);
      t && t.classList.add("active");
    },
    initGitalk: function () {
      this.loadModule.call(this, {
        name: "Gitalk",
        selector: "#gitalk-container",
        flag: "gitalkLoaded",
        css: ["/css/gitalk.css"],
        js: ["/js/gitalk.min.js"],
        callback: () => {
          if ("undefined" == typeof Gitalk)
            return void console.error("Gitalk is not defined.");
          const e = new Gitalk({
            clientID: "2658e1c2a15202f4ea1a",
            clientSecret: "efe03ae68db5b4aef7fa72a3aa7bbf249a143383",
            repo: "zejuh.github.io",
            owner: "zejuh",
            admin: ["zejuh"],
            id: location.pathname,
            distractionFreeMode: !1,
          });
          e.render("gitalk-container");
        },
      });
    },
    initMarkdownRenderer: function () {
      const e = async () => {
        const e = document.getElementById("code-md-output");
        if (e && e.dataset.mdSource)
          try {
            const t = e.dataset.mdSource,
              o = await fetch(t);
            if (!o.ok) throw new Error(`HTTP error! status: ${o.status}`);
            const n = await o.text();
            (e.innerHTML = marked.parse(n)),
              e.querySelectorAll("pre code").forEach((e) => {
                hljs.highlightElement(e);
              }),
              console.log("Markdown rendered and highlighted successfully.");
          } catch (e) {
            console.error("Error fetching or rendering Markdown:", e);
          }
      };
      this.loadModule.call(this, {
        name: "Markdown Renderer",
        selector: "#code-md-output",
        flag: "markdownLibsLoaded",
        js: ["/js/marked.min.js", "/js/highlight.min.js"],
        callback: e,
      });
    },
    initFancybox: function () {
      this.loadModule.call(this, {
        name: "Fancybox",
        selector: "[data-fancybox]",
        flag: "fancyboxLoaded",
        css: ["/css/fancybox.css"],
        js: ["/js/fancybox.umd.js"],
        callback: () => {
          "undefined" != typeof Fancybox &&
            Fancybox.bind("[data-fancybox]", {});
        },
      });
    },
    initCarousel: function () {
      this.loadModule.call(this, {
        name: "Carousel",
        selector: "#myCarousel",
        flag: "carouselLoaded",
        css: ["/css/carousel.css"],
        js: ["/js/carousel.umd.js", "/js/carousel.autoplay.umd.js"],
        callback: function () {
          if ("undefined" == typeof Carousel || "undefined" == typeof Autoplay)
            return void console.error("Carousel or Autoplay is not defined.");
          const e = document.getElementById("myCarousel");
          this.instances.carousel = new Carousel(
            e,
            { transition: "crossfade", Autoplay: { timeout: 3e3 } },
            { Autoplay: Autoplay }
          );
        },
      });
    },
    initLazyLoadAndAnimate: function () {
      const e = document.querySelectorAll(".lazy-load-element");
      if (!e.length) return;
      const t = (e, t) => {
        e.forEach((e) => {
          if (e.isIntersecting) {
            const o = e.target,
              n = o.querySelector("img[data-src]");
            n
              ? ((n.onload = () => {
                  o.classList.add("is-visible");
                }),
                (n.onerror = () => {
                  o.classList.add("is-visible");
                }),
                (n.src = n.dataset.src),
                n.removeAttribute("data-src"))
              : o.classList.add("is-visible"),
              t.unobserve(o);
          }
        });
      };
      (this.instances.lazyLoadObserver = new IntersectionObserver(t, {
        root: null,
        threshold: 0.1,
      })),
        e.forEach((e) => {
          this.instances.lazyLoadObserver.observe(e);
        }),
        console.log(
          `Lazy Load Observer created and watching ${e.length} elements.`
        );
    },
  },
  swup = new Swup(),
  runOneTimeSetup = async () => {
    await loadComponent("#header-placeholder", "/components/header.html"),
      Site.initHeaderComponents(),
      Site.setActiveNav(),
      loadComponent("#footer-placeholder", "/components/footer.html");
  };
runOneTimeSetup(),
  Site.initPageContent(),
  swup.hooks.on("animation:out:end", Site.cleanupPageContent.bind(Site)),
  swup.hooks.on("page:view", () => {
    Site.initPageContent(), Site.setActiveNav();
  });
