var links = document.querySelectorAll('a[href^="#"]');
links.forEach(function(link) {
  link.addEventListener('click', function(event) {
    event.preventDefault();
    var target = document.querySelector(this.getAttribute('href'));
    var offset = target.offsetTop - 44;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});
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

