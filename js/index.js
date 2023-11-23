const menu = document.querySelector('.menu');
const label = menu.querySelector('label');
const menuItems = menu.querySelectorAll('.hide-on-main');

label.addEventListener('click', () => {
  menu.classList.toggle('active');
  menuItems.forEach(item => {
    item.classList.toggle('hide-on-main');
  });
});

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menu.classList.remove('active');
    menuItems.forEach(item => {
      item.classList.add('hide-on-main');
    });
  });
});

var xhr = new XMLHttpRequest();
xhr.open('GET', '../loading.html', true);
xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            // 加载成功，隐藏“加载中”页面
            document.getElementById('loading').style.display = 'none';
        } else {
            // 加载失败，显示“加载中”页面
            document.getElementById('loading').style.display = 'block';
        }
    }
};
xhr.send();


