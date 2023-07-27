var links = document.querySelectorAll('a[href^="#"]');
links.forEach(function(link) {
  link.addEventListener('click', function(event) {
    event.preventDefault();
    var target = document.querySelector(this.getAttribute('href'));
    var offset = target.offsetTop - 44;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});