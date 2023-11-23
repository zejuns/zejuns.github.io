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

// function([string1, string2],target id,[color1,color2])    
consoleText(['[ Hello ]'], 'text',['#3a70bb']);

function consoleText(words, id, colors) {
  if (colors === undefined) colors = ['#fff'];
  var visible = true;
  var con = document.getElementById('console');
  var letterCount = 1;
  var x = 1;
  var waiting = false;
  var target = document.getElementById(id)
  target.setAttribute('style', 'color:' + colors[0])
  window.setInterval(function() {

    if (letterCount === 0 && waiting === false) {
      waiting = true;
      target.innerHTML = words[0].substring(0, letterCount)
      window.setTimeout(function() {
        var usedColor = colors.shift();
        colors.push(usedColor);
        var usedWord = words.shift();
        words.push(usedWord);
        x = 1;
        target.setAttribute('style', 'color:' + colors[0])
        letterCount += x;
        waiting = false;
      }, 2000)
    } else if (letterCount === words[0].length + 1 && waiting === false) {
      waiting = true;
      window.setTimeout(function() {
        x = -1;
        letterCount += x;
        waiting = false;
      }, 5000)
    } else if (waiting === false) {
      target.innerHTML = words[0].substring(0, letterCount)
      letterCount += x;
    }
  }, 150)
  window.setInterval(function() {
    if (visible === true) {
      con.className = 'console-underscore hidden'
      visible = false;

    } else {
      con.className = 'console-underscore'

      visible = true;
    }
  }, 400)
}