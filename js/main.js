document.addEventListener('DOMContentLoaded', function() {
    var navigationLinks = document.querySelectorAll('.navigation a');
    var dropdownMenus = document.querySelectorAll('.dropdown-menu');
    var timeoutId;

    navigationLinks.forEach(function(link, index) {
        link.addEventListener('mouseover', function() {
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
        });

        link.addEventListener('mouseout', function() {
            timeoutId = setTimeout(function() {
                dropdownMenus.forEach(function(menu) {
                    menu.style.display = 'none';
                });
            }, 500);
        });
    });

    dropdownMenus.forEach(function(menu) {
        menu.addEventListener('mouseover', function() {
            menu.style.display = 'block';
        });

        menu.addEventListener('mouseout', function() {
            menu.style.display = 'none';
        });
    });

    const gitalk = new Gitalk({
        clientID: '2658e1c2a15202f4ea1a',
        clientSecret: 'efe03ae68db5b4aef7fa72a3aa7bbf249a143383',
        repo: 'zejuns.github.io',      // The repository of store comments,
        owner: 'zejuns',
        admin: ['zejuns'],
        id: location.pathname,      // Ensure uniqueness and length less than 50
        distractionFreeMode: false  // Facebook-like distraction free mode
    });
    gitalk.render('gitalk-container')
});

(function($) {
    $(window).load(function() {
        // makes sure the whole site is loaded
        $('.loader-xbox').fadeOut(); // will first fade out the loading animation
        $('#preloader').fadeOut('slow'); // will fade out the white DIV that covers the website
        $('body').css({'overflow':'visible'});

        // Mobile Navigation
        $('.nav-toggle').on('click', function() {
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
        });

        $('nav[role="navigation"]').find('a').on('click', function() {
            $('.nav-toggle').toggleClass('close-nav');
            $('nav[role="navigation"]').toggleClass('open');

            // 关闭全屏菜单时恢复页面滚动
            if (!$('nav[role="navigation"]').hasClass('open')) {
                $('.fullscreen-menu').css('display', 'none');
                $('body').css('overflow', 'auto');
            }
        });
    });
})(jQuery);

$(document).ready(function() {
    // Header Scroll
    $(window).on('scroll', function() {
        var scroll = $(window).scrollTop();

        if (scroll >= 50) {
            $('#header').addClass('fixed');
        } else {
            $('#header').removeClass('fixed');
        }
    });
});