document.addEventListener('DOMContentLoaded', function() {
    var navigationLinks = document.querySelectorAll('.navigation a');
    var dropdownMenus = document.querySelectorAll('.dropdown-menu');
    var timeoutId;

    function showDropdown(index) {
        // 显示当前主菜单对应的子菜单
        var subMenu = navigationLinks[index].nextElementSibling;
        if (subMenu) {
            subMenu.style.display = 'block';
        }
    }

    function hideDropdown() {
        dropdownMenus.forEach(function(menu) {
            menu.style.display = 'none';
        });
    }

    navigationLinks.forEach(function(link, index) {
        link.addEventListener('mouseover', function() {
            if (window.innerWidth > 768) { // 仅在视口宽度大于768px时显示下拉框
                clearTimeout(timeoutId); // 清除之前的延迟隐藏计时器
                hideDropdown();
                showDropdown(index);
            }
        });

        link.addEventListener('mouseout', function() {
            if (window.innerWidth > 768) { // 仅在视口宽度大于768px时隐藏下拉框
                timeoutId = setTimeout(hideDropdown, 500);
            }
        });
    });

    dropdownMenus.forEach(function(menu) {
        menu.addEventListener('mouseover', function() {
            if (window.innerWidth > 768) { // 仅在视口宽度大于768px时显示下拉框
                menu.style.display = 'block';
            }
        });

        menu.addEventListener('mouseout', function() {
            if (window.innerWidth > 768) { // 仅在视口宽度大于768px时隐藏下拉框
                menu.style.display = 'none';
            }
        });
    });

    // Gitalk 初始化代码
    const gitalk = new Gitalk({
        clientID: '2658e1c2a15202f4ea1a',
        clientSecret: 'efe03ae68db5b4aef7fa72a3aa7bbf249a143383',
        repo: 'zejun-gitalk',
        owner: 'zejuns',
        admin: ['zejuns'],
        id: location.pathname,
        distractionFreeMode: false
    });
    gitalk.render('gitalk-container');
});

(function($) {
    $(window).load(function() {
        $('.loader-xbox').fadeOut();
        $('#preloader').fadeOut('slow');
        $('body').css({'overflow':'visible'});

        // Mobile Navigation
        $('.nav-toggle').on('click', function() {
            $(this).toggleClass('close-nav');
            $('nav[role="navigation"]').toggleClass('open');
            
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

            if (!$('nav[role="navigation"]').hasClass('open')) {
                $('.fullscreen-menu').css('display', 'none');
                $('body').css('overflow', 'auto');
            }
        });
    });
})(jQuery);

$(document).ready(function() {
    $(window).on('scroll', function() {
        var scroll = $(window).scrollTop();

        if (scroll >= 50) {
            $('#header').addClass('fixed');
        } else {
            $('#header').removeClass('fixed');
        }
    });
});