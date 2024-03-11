(function($) {
    $(window).load(function() {
        // makes sure the whole site is loaded
        $('.loader-xbox').fadeOut(); // will first fade out the loading animation
        $('#preloader').delay(150).fadeOut('slow'); // will fade out the white DIV that covers the website
        $('body').delay(150).css({'overflow':'visible'});

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
});

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

    // Fancybox
    $('.work-box').fancybox();

    // Flexslider
    $('.flexslider').flexslider({
        animation: "fade",
        directionNav: false,
    });
}); 
