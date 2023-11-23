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
let canvas = document.createElement("canvas") 
canvas.width = window.innerWidth 
canvas.height = window.innerHeight 
document.body.appendChild(canvas) 
canvas.style.position = "fixed" 
canvas.style.bottom = "0" 
canvas.style.left = "0" 
canvas.style.zIndex = "-1"


let count = 0
let ctx = canvas.getContext("2d")
let ripples = []
let mouse = {
    x: 0,
    y: 0
}
class ripple {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.size = 0
        this.p = Math.random() * 3
        this.s = Math.random() * 0.5 + 0.5
    }
    update() {
        this.p -= 0.005
        this.size += this.s
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, 0)
        ctx.strokeStyle = "rgba(30, 144, 255," + this.p + ")"
        ctx.stroke()
    }
}
document.body.addEventListener("click", function(evt) {
    ripples.push(new ripple(evt.x, evt.y))
})
document.body.addEventListener("mousemove", function(evt) {
    mouse.x = evt.x
    mouse.y = evt.y

})

function draw() {
    ctx.fillStyle = "rgba(0,0,0,0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    for (var i = 0; i < ripples.length; i++) {
        var p = ripples[i]
        p.update()
        p.draw()
        if (p.p < 0) {
            ripples.splice(i, 1)
        }
    }
    if (count % 300 == 0) {
        ripples.push(new ripple(Math.random() * canvas.width, Math.random() * canvas.height))
    }
    if (count % 30 == 0) {
        ripples.push(new ripple(mouse.x, mouse.y))
    }
    count++
}
setInterval(draw, 10)

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

