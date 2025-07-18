/**
 * @file Main script for website interactions.
 * @description This script handles navigation (desktop & mobile), header effects, dark mode, and comment section initialization.
 * @version 2.2 (Updated with light mode as default)
 */

// 使用一个对象来组织所有功能，避免污染全局命名空间
const Site = {
    // 统领所有初始化函数
    init: function() {
        // 使用 .length 判断元素是否存在，避免在元素不存在的页面报错
        if ($('.navigation').length) {
            this.initDesktopNavigation();
        }
        if ($('.nav-toggle').length) {
            this.initMobileNavigation();
        }
        if ($('#header').length) {
            this.initHeaderScroll();
        }
        if ($('#gitalk-container').length) {
            this.initGitalk();
        }
        if ($('#darkModeToggle').length) {
            this.initThemeToggle();
        }
    },

    // 1. 初始化桌面版导航菜单
    initDesktopNavigation: function() {
        const $navLinks = $('.navigation a');
        const $dropdownMenus = $('.dropdown-menu');
        let timeoutId;

        function showMenu() {
            clearTimeout(timeoutId);
            const $subMenu = $(this).next('.dropdown-menu');
            // 隐藏同级的其他菜单，显示当前对应的菜单
            $subMenu.show().siblings('.dropdown-menu').hide();
        }

        function hideMenus() {
            timeoutId = setTimeout(function() {
                $dropdownMenus.hide();
            }, 300); // 稍微缩短延迟，300ms 体感更好
        }

        // 鼠标移入子菜单时，保持显示
        $dropdownMenus.on('mouseenter', function() {
            clearTimeout(timeoutId);
        }).on('mouseleave', function() {
            // 鼠标移出子菜单，立即隐藏
            $(this).hide();
        });

        // 绑定事件到主链接
        $navLinks.on('mouseenter', showMenu);
        $navLinks.on('mouseleave', hideMenus);
    },

    // 2. 初始化移动版导航功能
    initMobileNavigation: function() {
        const $navToggle = $('.nav-toggle');
        const $navMenu = $('nav[role="navigation"]');

        // 切换导航菜单的显示/隐藏
        $navToggle.on('click', function() {
            // 使用 CSS class 控制状态，将样式与逻辑分离
            $(this).toggleClass('close-nav');
            $navMenu.toggleClass('open');
        });

        // 点击菜单链接后自动关闭菜单
        $navMenu.find('a').on('click', function() {
            // 触发按钮的点击事件，复用切换逻辑
            $navToggle.trigger('click');
        });
    },

    // 3. 初始化页面滚动时的 Header 样式
    initHeaderScroll: function() {
        const $window = $(window);
        const $header = $('#header');
        const scrollThreshold = 50; // 将 "魔法数字" 定义为常量

        $window.on('scroll', function() {
            // 使用 .toggleClass() 的第二个参数简化逻辑
            $header.toggleClass('fixed', $window.scrollTop() >= scrollThreshold);
        });
    },

    // 4. 初始化 Gitalk 评论系统
    initGitalk: function() {
        // 路径转换逻辑保持不变
        const currentPath = location.pathname;
        const oldPath = currentPath.replace('/project', '/works/project');

        const gitalk = new Gitalk({
            clientID: '2658e1c2a15202f4ea1a', // 注意：将 Client ID 和 Secret 放在前端可能存在安全风险
            clientSecret: 'efe03ae68db5b4aef7fa72a3aa7bbf249a143383',
            repo: 'zejuns.github.io',
            owner: 'zejuns',
            admin: ['zejuns'],
            id: oldPath,
            distractionFreeMode: false
        });
        gitalk.render('gitalk-container');
    },

    // 5. 初始化暗黑/明亮模式切换功能 (适配新的 CSS 动画按钮)
    initThemeToggle: function() {
        const $themeToggle = $('#darkModeToggle');
        const $body = $('body');
        const storageKey = 'theme'; // 定义一个用于 localStorage 的键名，方便管理

        /**
         * 功能：仅根据主题名称，在 body 上应用或移除 'light-mode' class
         * @param {string} theme - 要应用的主题 ('light' 或 'dark')
         */
        function applyTheme(theme) {
            // 使用 toggleClass 的第二个参数，代码更简洁
            $body.toggleClass('light-mode', theme === 'light');
        }

        // --- 页面加载时执行 ---
        // 1. 从 localStorage 读取已保存的主题偏好
        const savedTheme = localStorage.getItem(storageKey);
        
        // 2. 如果有保存的偏好，则应用它；否则，默认应用白色模式
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            // 默认设置为白色模式
            applyTheme('light');
        }

        // --- 监听按钮点击事件 ---
        $themeToggle.on('click', function() {
            // 判断当前是否是白色模式，以确定切换后的新主题
            const isLight = $body.hasClass('light-mode');
            const newTheme = isLight ? 'dark' : 'light';

            // 应用新主题
            applyTheme(newTheme);

            // 将新的主题偏好保存到 localStorage
            localStorage.setItem(storageKey, newTheme);
        });
    }
};

// 当 DOM 加载完成后，执行所有初始化
$(document).ready(function() {
    Site.init();
});