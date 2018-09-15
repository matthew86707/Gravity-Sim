var cv = document.getElementById('canvas');
var ctx = cv.getContext('2d');
var cvWidth = cv.width;
var cvHeight = cv.height;

$('#canvas').attr("width",$(window).width());
$('#canvas').attr("height",$(window).height());

var zoom = 3.0;
var connected = false;

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

var windowWidth = $(window).width();
var windowHeight = $(window).height();

window.addEventListener("resize", function() {
  windowWidth = $(window).width();
  windowHeight = $(window).height();
  $('#canvas').attr("width",$(window).width());
  $('#canvas').attr("height",$(window).height());
  console.log("Resize");
});
var myX = 0.0;
var myY = 0.0;
var myMass = 100.0;
var myColor = '#FFFFFF';
//TODO : Check to make sure ID is avalible...maybe a server provided REST endpoint of already taken IDs?
var myId = Math.random() + 1;

// Simple scene description : an array of colored rects
var particles = new Array();

// open connection
if(location.hostname == 'localhost'){
  var connection = new WebSocket('ws://localhost:1337');
}else{
  var connection = new WebSocket('ws://192.168.7.133:1337');

}

connection.onopen = function () {
  console.log("Connected!");
  var packet = {type : "first", playerId : myId};
  connection.send(JSON.stringify(packet));
  connected = true;
};

connection.onmessage = function (message) {
  var obj = JSON.parse(message.data);
  obj.forEach(function(o) {
    if(o.playerId == myId){
      myX = o.position.x;
      myY = o.position.y;
      myMass = o.mass;
      myColor = o.color;
    }
  });
  particles = obj;
};


var cursorX;
var cursorY;
document.onmousemove = function(e){
    cursorX = e.pageX;
    cursorY = e.pageY;
}

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
  }
}

setInterval(updateNetwork, 50);

function updateNetwork(){
  if(connected){
    var direction = new Vector((windowWidth / 2.0) - cursorX, (windowHeight / 2.0) - cursorY);
    direction.normalize();
    var packet = {type : "normal", playerId : myId, x : direction.x, y : direction.y};
    connection.send(JSON.stringify(packet));
  }
}

// animation : always running loop.

function animate() {
  zoom = Math.sqrt(myMass) / 3;
  //zoom = 20.0;
  //zoom += 0.009;
  // call again next time we can draw
  requestAnimationFrame(animate);
  // clear canvas
  ctx.clearRect(0, 0, 1920, 1080);
  // draw everything

  ctx.strokeStyle = '#d3d3d3';
  ctx.lineWidth = 2;
  for(var x = 0; x < windowWidth * zoom; x += 150){
    ctx.beginPath();
    ctx.moveTo((x - myX % 150) / zoom,0);
    ctx.lineTo((x - myX % 150) / zoom,windowHeight);
    ctx.stroke();
  }

  for(var y = 0; y < windowHeight * zoom; y += 150){
    ctx.beginPath();
    ctx.moveTo(0,(y - myY % 150) / zoom);
    ctx.lineTo(windowWidth, (y - myY % 150) / zoom);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc((windowWidth / 2.0), (windowHeight / 2.0), myMass / zoom, 0, 2 * Math.PI, false);
  ctx.fillStyle = myColor;
  ctx.fill();
  // ctx.lineWidth = 5;
  // ctx.strokeStyle = '#003300';
  // ctx.stroke();

  //ctx.drawImage(rocket, dx, dy, dWidth, dHeight);

  particles.forEach(function(o) {
    if(!(o.playerId == myId)){
    // o.simulate(particles);
    ctx.beginPath();
    //console.log(myY);
    ctx.arc((o.position.x / zoom) - (myX / zoom) + (windowWidth /  2.0), (o.position.y / zoom) - (myY / zoom) + (windowHeight /  2.0), o.mass / zoom, 0, 2 * Math.PI, false);
    ctx.fillStyle = o.color;
    ctx.fill();
  }
    //if(o.isDead){
      //ctx.fillStyle = 'rgba(225,225,225,0.5)';
      //ctx.fillRect(0,0,windowWidth,windowHeight);
    //}
  });

}

animate();

window.addEventListener('scroll', function(e) {
  window.onscroll = function(e) {
    zoom++;
}
});
