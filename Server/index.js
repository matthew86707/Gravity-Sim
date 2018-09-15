var WebSocketServer = require('websocket').server;
var http = require('http');

var express = require('express');
var app = express();

app.use(express.static('public'));

app.listen(80);

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

class Particle {
  constructor(position, velocity, mass, playerId) {
    this.position = position;
    this.velocity = velocity;
    this.mass = mass;
    this.playerId = playerId;
    this.impulse = new Vector(0, 0);
    this.isDead = false;
    var colorChoice = Math.random();
    var numColors = 4;
    this.color = "#0ffff";
    if(colorChoice < 1 / 4.0){
      //Turqoise < lol, spelling
      this.color = '#40e0d0';
    }else if(colorChoice < 2  / 4.0){
      //Hot pink
      this.color = 	'#FF6EB4';
    }else if (colorChoice < 3  / 4.0) {
      //Green
      this.color = '#32CD32';
    }else if (colorChoice < 1) {
      //orange
      this.color = '#ffff00';
    }
    if(playerId > 1){
      this.color = '#ff0000';
    }
  }
  simulate (particles){
    this.velocity.translate(this.impulse.x, this.impulse.y);
    this.impulse.x = 0;
    this.impulse.y = 0;
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
      radius /= 50000;
      var mag = o.mass * that.mass / Math.pow(Math.sin(radius), 2);
      mag /= that.mass;
      mag *= 0.0000001;
      that.velocity.translate(direction.x * mag, direction.y * mag);
    }
    });
  }
  split(otherGuy){
    var that = this;
  //  if(otherGuy.playerId > 1 && that.playerId < 1){
      if(otherGuy.mass > this.mass){
        this.isDead = true;
        otherGuy.mass += this.mass;
      }else{
        otherGuy.isDead = true;
        this.mass += otherGuy.mass;
      }
  //  }
  }
}


var players = new Array();

for(var i = 0; i < 400; i++){
  players.push(new Particle(new Vector((Math.random() - 0.5) * 30000, (Math.random() - 0.5) * 30000), new Vector(0, 0), 25, Math.random()));
}
setInterval(simulate, 20);

function simulate(){
  //console.log("Simulating");
  players.forEach(function(o) {
    o.simulate(players);
  });
  players.forEach(function(o) {
    if(o.isDead){
      //if(o.playerId > 1){
      //  o.isDead = false;
    //  }else{
      var index = players.indexOf(o);
      players.splice(index, 1);
    }
  });
}


var server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});
server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function(message) {
    var obj = JSON.parse(message.utf8Data);
    if(obj.type == "first"){
      players.push(new Particle(new Vector(0, 0), new Vector(0, 0), 50.0, obj.playerId));
    }else{
      players.forEach(function(o) {
        if(o.playerId == obj.playerId){
          o.impulse.x = obj.x / 5;
          o.impulse.y = obj.y / 5;
          //return;
        }
      });
    }
    connection.send(JSON.stringify(players));
    //console.log(message);
  });

  connection.on('close', function(connection) {
    // close user connection
  });
});
