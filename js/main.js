// 初始化导航菜单功能
function initNavigation() {
    var navigationLinks = document.querySelectorAll('.navigation a');
    var dropdownMenus = document.querySelectorAll('.dropdown-menu');
    var timeoutId;

    function handleMouseOverLink(link, dropdownMenus) {
        clearTimeout(timeoutId); // 清除之前的延迟隐藏计时器

        // 隐藏其他子菜单
        dropdownMenus.forEach(function(menu) {
            menu.style.display = 'none';
        });

        // 显示当前主菜单对应的子菜单
        var subMenu = link.nextElementSibling;
        if (subMenu) {
            subMenu.style.display = 'block';
        }
    }

    function handleMouseOutLink() {
        timeoutId = setTimeout(function() {
            dropdownMenus.forEach(function(menu) {
                menu.style.display = 'none';
            });
        }, 500);
    }

    function handleMouseOverMenu(menu) {
        menu.style.display = 'block';
    }

    function handleMouseOutMenu(menu) {
        menu.style.display = 'none';
    }

    navigationLinks.forEach(function(link) {
        if (window.innerWidth > 768) {
            link.addEventListener('mouseover', function() {
                handleMouseOverLink(link, dropdownMenus);
            });

            link.addEventListener('mouseout', handleMouseOutLink);
        }
    });

    dropdownMenus.forEach(function(menu) {
        menu.addEventListener('mouseover', function() {
            handleMouseOverMenu(menu);
        });

        menu.addEventListener('mouseout', function() {
            handleMouseOutMenu(menu);
        });
    });
}

// 初始化移动导航功能
function initMobileNavigation() {
    function toggleNav() {
        $(this).toggleClass('close-nav');
        $('nav[role="navigation"]').toggleClass('open');

        // 切换全屏菜单时直接显示/隐藏菜单，不改变页面滚动
        if ($('nav[role="navigation"]').hasClass('open')) {
            $('.fullscreen-menu').css('display', 'block');
        } else {
            $('.fullscreen-menu').css('display', 'none');
        }
        return false;
    }

    $('.nav-toggle').on('click', toggleNav);

    $('nav[role="navigation"]').find('a').on('click', function() {
        toggleNav.apply($('.nav-toggle'));

        // 关闭全屏菜单时直接隐藏菜单，不改变页面滚动
        if (!$('nav[role="navigation"]').hasClass('open')) {
            $('.fullscreen-menu').css('display', 'none');
        }
    });
}

// 初始化滚动事件监听
function initHeaderScroll() {
    $(window).on('scroll', function() {
        var scroll = $(window).scrollTop();
        if (scroll >= 50) {
            $('#header').addClass('fixed');
        } else {
            $('#header').removeClass('fixed');
        }
    });
}

// Gitalk 初始化功能
function initGitalk() {
    const currentPath = location.pathname;
    const oldPath = currentPath.replace('/project', '/works/project'); // 替换为旧路径
    const gitalk = new Gitalk({
        clientID: '2658e1c2a15202f4ea1a',
        clientSecret: 'efe03ae68db5b4aef7fa72a3aa7bbf249a143383',
        repo: 'zejuns.github.io',
        owner: 'zejuns',
        admin: ['zejuns'],
        id: oldPath, // 动态生成的旧 ID
        distractionFreeMode: false
    });
    gitalk.render('gitalk-container');
}

// 页面加载后初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initMobileNavigation();
    initHeaderScroll();
    initGitalk();
});