var cv = document.getElementById('canvas');
var ctx = cv.getContext('2d');
var cvWidth = cv.width;
var cvHeight = cv.height;

$('#canvas').attr("width",$(window).width());
$('#canvas').attr("height",$(window).height());

var zoom = 1.0;

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  length(){
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  normalize(){
    this.x = this.x / this.length();
    this.y = this.y / this.length();
  }
  translate(dx, dy){
    this.x += dx;
    this.y += dy;
  }
}

// Simple scene description : an array of colored rects
var particles = new Array();


class Particle {
  constructor(position, velocity, mass) {
    this.position = position;
    this.velocity = velocity;
    this.mass = mass;
  }
  simulate (particles){
    this.position.translate(this.velocity.x, this.velocity.y);
    var that = this;
    particles.forEach(function(o) {
      if(o != that){
      var direction = new Vector(-that.position.x + o.position.x, -that.position.y + o.position.y);
      var radius = direction.length();
      if(radius < o.mass + that.mass){
        that.split(o);
      }
      direction.normalize();
      var mag = o.mass * that.mass / Math.pow(radius, 2);
      mag /= that.mass;
      that.velocity.translate(direction.x * mag, direction.y * mag);
    }
    });
  }
  split(otherGuy){
    var otherGuyIndex = particles.indexOf(otherGuy);
    particles.splice(otherGuyIndex, 1);
    this.mass += otherGuy.mass;
    //var index = particles.indexOf(this);
    //particles.splice(index, 1);
    //particles.push(new Particle(new Vector(this.position.x, this.position.y), new Vector(0, 0), this.mass < 5 ? 5 : this.mass + otherGuy.mass)) ;
    //particles.push(new Particle(new Vector(this.position.x + 100, this.position.y + 100), new Vector(0, 0), this.mass + 10));
  }
}

// animation : always running loop.

function animate() {
  // call again next time we can draw
  requestAnimationFrame(animate);
  // clear canvas
  //ctx.clearRect(0, 0, 1920, 1080);
  // draw everything
  particles.forEach(function(o) {
    o.simulate(particles);
    ctx.beginPath();
    ctx.arc(o.position.x / zoom, o.position.y / zoom, o.mass / zoom, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
  });
  //
  ctx.fillStyle = '#000';
}

animate();


// click handler to add random rects
window.addEventListener('click', function(e) {
  addRandRect(e.pageX, e.pageY);
});


window.addEventListener('scroll', function(e) {
  window.onscroll = function(e) {
    zoom++;
}
});

function addRandRect(x, y) {
  //particles.push(new Particle(new Vector(x, y), new Vector(1, 2), 50));
  for(var i = 0; i < 20; i++){
    particles.push(new Particle(new Vector(1920 / 4 + Math.random() * (1920 / 2), 1080 / 4 + Math.random() * (1080 / 2)), new Vector(0, 0), 1));
  }
}
