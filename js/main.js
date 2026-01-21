const loadCss = (href) => {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    Object.assign(link, { rel: "stylesheet", href });
    document.head.appendChild(link);
  }
};

const loadScript = (src) => 
  document.querySelector(`script[src="${src}"]`) 
    ? Promise.resolve() 
    : new Promise((resolve, reject) => {
        const script = document.createElement("script");
        Object.assign(script, { src, onload: resolve, onerror: () => reject(new Error(`Load error: ${src}`)) });
        document.head.appendChild(script);
      });

const loadComponent = async (selector, url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const el = document.querySelector(selector);
    if (el) el.innerHTML = await res.text();
  } catch (e) {
    console.error(`Load component error ${url}:`, e);
  }
};

async function loadModule({ selector, flag, css = [], js = [], callback }) {
  if (!document.querySelector(selector)) return;
  
  if (this[flag]) {
    callback?.call(this);
  } else {
    try {
      css.forEach(loadCss);
      await Promise.all(js.map(loadScript));
      this[flag] = true;
      callback?.call(this);
    } catch (e) {
      console.error(`Module load error:`, e);
    }
  }
}

const Site = {
  instances: { carousel: null, lazyLoadObserver: null },
  state: {
    markdownLibsLoaded: false,
    fancyboxLoaded: false,
    carouselLoaded: false,
    gitalkLoaded: false,
    roughNotationLoaded: false,
  },
  loadModule,

  initHeaderComponents() {
    if (document.querySelector(".navigation")) this.initDesktopNavigation();
    if (document.querySelector(".nav-toggle")) this.initMobileNavigation();
    if (document.getElementById("header")) this.initHeaderScroll();
    if (document.getElementById("darkModeToggle")) this.initThemeToggle();
  },

  initDesktopNavigation() {
    const nav = document.querySelector(".navigation");
    let timer;
    nav.addEventListener("mouseenter", () => clearTimeout(timer));
    nav.addEventListener("mouseleave", () => {
      timer = setTimeout(() => {
        document.querySelectorAll(".dropdown-menu").forEach(el => el.style.display = "none");
      }, 300);
    });
    nav.querySelectorAll("a").forEach(link => {
      const menu = link.nextElementSibling;
      if (menu?.classList.contains("dropdown-menu")) {
        link.addEventListener("mouseenter", () => {
          document.querySelectorAll(".dropdown-menu").forEach(el => el !== menu && (el.style.display = "none"));
          menu.style.display = "block";
        });
      }
    });
  },

  initMobileNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector('nav[role="navigation"]');
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      toggle.classList.toggle("close-nav");
      nav.classList.toggle("open");
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        if (nav.classList.contains("open")) toggle.click();
      });
    });
  },

  initHeaderScroll() {
    const header = document.getElementById("header");
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle("fixed", window.scrollY >= 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
  },

  initThemeToggle() {
    const btn = document.getElementById("darkModeToggle");
    const body = document.body;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (mode) => {
      body.classList.remove("light-mode", "dark-mode");
      body.classList.add(`${mode}-mode`);
    };
    
    apply(mq.matches ? "dark" : "light");
    mq.addEventListener("change", e => apply(e.matches ? "dark" : "light"));
    
    if (btn) {
      btn.onclick = () => apply(body.classList.contains("light-mode") ? "dark" : "light");
    }
  },

  initVideoAutoplay() {
    document.querySelectorAll('video[autoplay]').forEach(video => {
      video.muted = true;
      video.play().catch(() => {});
    });
  },

  initPageContent() {
    this.setActiveNav();
    this.initFancybox();
    this.initCarousel();
    this.initGitalk();
    this.initLazyLoadAndAnimate();
    this.initMarkdownRenderer();
    this.initVideoAutoplay();
    this.initRoughNotation();
    
    if (document.querySelector("model-viewer")) {
      import("https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/+esm").catch(console.error);
    }
  },

  cleanupPageContent() {
    this.instances.carousel?.destroy();
    this.instances.carousel = null;
    this.instances.lazyLoadObserver?.disconnect();
    this.instances.lazyLoadObserver = null;
    window.Fancybox?.close();
  },

  setActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll(".primary-nav .active").forEach(el => el.classList.remove("active"));
    
    const targetLink = path === "/" || path.startsWith("/works/") 
      ? document.querySelector('.primary-nav a[href="/"]') 
      : document.querySelector(`.primary-nav a[href="${path}"]`);
      
    targetLink?.classList.add("active");
  },

  initRoughNotation() {
    const styleMap = {
      'rn-underline': { type: 'underline', color: '#FFD54F', strokeWidth: 2, multiline: true },
      'rn-box':       { type: 'box', color: '#64B5F6', strokeWidth: 2, multiline: true },
      'rn-highlight': { type: 'highlight', color: '#FFD54F', multiline: true, multiline: true },
      'rn-circle':    { type: 'circle', color: '#81C784', strokeWidth: 2, multiline: true },
      'rn-bracket':   { type: 'bracket', color: '#BA68C8', brackets: ['left', 'right'], strokeWidth: 2 },
      'rn-strike':    { type: 'strike-through', color: '#EF5350', strokeWidth: 1, multiline: true },
      'rn-crossed':   { type: 'crossed-off', color: '#EF5350', strokeWidth: 1, multiline: true }
    };

    const selectorStr = Object.keys(styleMap).map(c => `.${c}`).join(', ');

    if (!document.querySelector(selectorStr)) return;

    this.loadModule({
      selector: "body",
      flag: "roughNotationLoaded",
      js: ["https://unpkg.com/rough-notation/lib/rough-notation.iife.js"],
      callback: () => {
        if (typeof RoughNotation === "undefined") return;
        
        const { annotate, annotationGroup } = RoughNotation;
        const annotations = [];
        const elements = document.querySelectorAll(selectorStr);

        elements.forEach(el => {
          const className = Object.keys(styleMap).find(cls => el.classList.contains(cls));
          const config = styleMap[className];

          if (config) {
            annotations.push(annotate(el, {
              type: config.type,
              color: config.color,
              animationDuration: 1000,
              strokeWidth: config.strokeWidth || 1,
              multiline: config.multiline || false,
              brackets: config.brackets,
              iterations: 3 
            }));
          }
        });
        const ag = annotationGroup(annotations);
        setTimeout(() => {ag.show();}, 1000); 
      }
    });
  },

  initGitalk() {
    this.loadModule({
      selector: "#gitalk-container",
      flag: "gitalkLoaded",
      css: ["/css/gitalk.css"],
      js: ["/js/gitalk.min.js"],
      callback: () => {
        if (typeof Gitalk === "undefined") return;
        new Gitalk({
          clientID: "2658e1c2a15202f4ea1a",
          clientSecret: "efe03ae68db5b4aef7fa72a3aa7bbf249a143383",
          repo: "zejuh.github.io",
          owner: "zejuh",
          admin: ["zejuh"],
          id: location.pathname,
          distractionFreeMode: false,
        }).render("gitalk-container");
      },
    });
  },

  initMarkdownRenderer() {
    const output = document.getElementById("code-md-output");
    if (!output?.dataset.mdSource) return;

    this.loadModule({
      selector: "#code-md-output",
      flag: "markdownLibsLoaded",
      js: ["/js/marked.min.js", "/js/highlight.min.js"],
      callback: async () => {
        try {
          const res = await fetch(output.dataset.mdSource);
          if (!res.ok) return;
          output.innerHTML = marked.parse(await res.text());
          output.querySelectorAll("pre code").forEach(hljs.highlightElement);
        } catch (e) {
          console.error("Markdown render error:", e);
        }
      },
    });
  },

  initFancybox() {
    this.loadModule({
      selector: "[data-fancybox]",
      flag: "fancyboxLoaded",
      css: ["/css/fancybox.css"],
      js: ["/js/fancybox.umd.js"],
      callback: () => window.Fancybox?.bind("[data-fancybox]", {}),
    });
  },

  initCarousel() {
    this.loadModule({
      selector: "#myCarousel",
      flag: "carouselLoaded",
      css: ["/css/carousel.css"],
      js: ["/js/carousel.umd.js", "/js/carousel.autoplay.umd.js"],
      callback: () => {
        if (typeof Carousel === "undefined") return;
        const el = document.getElementById("myCarousel");
        this.instances.carousel = new Carousel(el, 
          { transition: "crossfade", Autoplay: { timeout: 3000 } }, 
          { Autoplay }
        );
      },
    });
  },

  initLazyLoadAndAnimate() {
    const els = document.querySelectorAll(".lazy-load-element");
    if (!els.length) return;

    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    els.forEach(el => obs.observe(el));
    this.instances.lazyLoadObserver = obs;
  },
};

const swup = new Swup();
const runOneTimeSetup = async () => {
  await Promise.all([
    loadComponent("#header-placeholder", "/components/header.html"),
    loadComponent("#footer-placeholder", "/components/footer.html")
  ]);
  Site.initHeaderComponents();
  Site.setActiveNav();
};

runOneTimeSetup();
Site.initPageContent();

swup.hooks.on("animation:out:end", () => Site.cleanupPageContent());
swup.hooks.on("page:view", () => {
  Site.initPageContent();
  Site.setActiveNav();
});