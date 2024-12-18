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

// 初始化页面加载功能
function initPageLoad() {
    $('#preloader').fadeOut(0);
    $('body').css({'overflow':'visible'});
}

// 初始化移动导航功能
function initMobileNavigation() {
    function toggleNav() {
        $(this).toggleClass('close-nav');
        $('nav[role="navigation"]').toggleClass('open');

        // 切换全屏菜单时禁止或恢复页面滚动
        if ($('nav[role="navigation"]').hasClass('open')) {
            $('.fullscreen-menu').css('display', 'block');
            $('body').css('overflow', 'hidden');
        } else {
            $('.fullscreen-menu').css('display', 'none');
            $('body').css('overflow', 'auto');
        }
        return false;
    }

    $('.nav-toggle').on('click', toggleNav);

    $('nav[role="navigation"]').find('a').on('click', function() {
        toggleNav.apply($('.nav-toggle'));

        // 关闭全屏菜单时恢复页面滚动
        if (!$('nav[role="navigation"]').hasClass('open')) {
            $('.fullscreen-menu').css('display', 'none');
            $('body').css('overflow', 'auto');
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

// 页面加载后初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initMobileNavigation();
    initHeaderScroll();
});

$(window).on('load', function() {
    initPageLoad();
});