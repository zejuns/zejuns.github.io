const Site = {
  init: function () {
    $(".navigation").length && this.initDesktopNavigation(),
      $(".nav-toggle").length && this.initMobileNavigation(),
      $("#header").length && this.initHeaderScroll(),
      $("#gitalk-container").length && this.initGitalk(),
      $("#darkModeToggle").length && this.initThemeToggle();
  },
  initDesktopNavigation: function () {
    function e() {
      clearTimeout(o);
      const e = $(this).next(".dropdown-menu");
      e.show().siblings(".dropdown-menu").hide();
    }
    function n() {
      o = setTimeout(function () {
        t.hide();
      }, 300);
    }
    const i = $(".navigation a"),
      t = $(".dropdown-menu");
    let o;
    t
      .on("mouseenter", function () {
        clearTimeout(o);
      })
      .on("mouseleave", function () {
        $(this).hide();
      }),
      i.on("mouseenter", e),
      i.on("mouseleave", n);
  },
  initMobileNavigation: function () {
    const e = $(".nav-toggle"),
      n = $('nav[role="navigation"]');
    n.find(".dropdown-menu").hide(),
      e.on("click", function () {
        $(this).toggleClass("close-nav"), n.toggleClass("open");
      }),
      n.find("a").on("click", function () {
        e.trigger("click");
      });
  },
  initHeaderScroll: function () {
    const e = $(window),
      n = $("#header"),
      i = 50;
    e.on("scroll", function () {
      n.toggleClass("fixed", e.scrollTop() >= i);
    });
  },
  initGitalk: function () {
    const e = location.pathname,
      n = e.replace("/project", "/works/project"),
      i = new Gitalk({
        clientID: "2658e1c2a15202f4ea1a",
        clientSecret: "efe03ae68db5b4aef7fa72a3aa7bbf249a143383",
        repo: "zejuns.github.io",
        owner: "zejuns",
        admin: ["zejuns"],
        id: n,
        distractionFreeMode: !1,
      });
    i.render("gitalk-container");
  },
  initThemeToggle: function () {
    function e(e) {
      "light" === e
        ? i.removeClass("dark-mode").addClass("light-mode")
        : i.removeClass("light-mode").addClass("dark-mode");
    }
    const n = $("#darkModeToggle"),
      i = $("body"),
      t = "theme",
      o = localStorage.getItem(t) || "light";
    e(o),
      n.on("click", function () {
        const n = i.hasClass("light-mode"),
          o = n ? "dark" : "light";
        e(o), localStorage.setItem(t, o);
      });
  },
};
$(document).ready(function () {
  Site.init();
});
