var mic, fft;

var rStart = 1; 
var rEnd = 300;
var bStart = rEnd;
var bEnd = 2000;
var gStart = bEnd;
var gEnd = 20000;

var visibleMeters = 150;
var soundMPS = 343;
var numLights = 40;

var lightColors = [];

function setup() {
   createCanvas(800,500);
   noFill();

   mic = new p5.AudioIn();
   mic.start();
   fft = new p5.FFT();
   fft.setInput(mic);
   
   var soundSecondsBetweenLights = (visibleMeters/numLights)/soundMPS;
   
   //For simplicity update the animation every time sound would reach a new light
   console.log("Setting FPS to: " + Math.floor(1.0/soundSecondsBetweenLights) + " and simulating light that takes " + visibleMeters/soundMPS + " seconds to cover " + visibleMeters + " meters.")
   frameRate(1.0/soundSecondsBetweenLights); 
   for(var i = 0; i < numLights; i++){
     lightColors.push(color(0, 0, 0))
   }
}

function drawGradientCircle(x, y, radius, c) {
  noStroke();
  for (var r = radius; r > 0; r --) {
    fill(lerpColor(c, color(0,0,0), (r/radius)));
    ellipse(x, y, r, r);
  }
}


function drawBar(x, y, width, height, c) {
  var darkenedC = lerpColor(color(0, 0, 0), c, width/200)
  noStroke();
  for (var w = width; w > 0; w-=20) {
    fill(lerpColor(darkenedC, color(0,0,0), (w/width)));
    rect(x - w/2, y, w, height);
  }
}

function drawLightStrip(colors) {
  var n = colors.length
  
  for(var i = 0; i < n; i++) {
    var distance = 5 + (i/n)*visibleMeters;
    var observerHeight = 5.0;
    var observationAngle = Math.atan(distance / observerHeight);
    var dy = Math.tan(Math.PI/2 - observationAngle)
    drawBar(window.width * 0.5, window.height * (2.5 * dy), 2000 * dy, 100 * dy, colors[i]);
  }
}

function drawDebugFreq(spectrum, re, ge, be) {
  var rStartX = rStart/20000 * window.width;
  var rEndX = rEnd/20000 * window.width;
  
  var gStartX = gStart/20000 * window.width;
  var gEndX = gEnd/20000 * window.width;
  
  var bStartX = bStart/20000 * window.width;
  var bEndX = bEnd/20000 * window.width;
  
  fill(255,0,0,100)
  rect(rStartX, window.height - re, rEndX-rStartX, window.height)
  fill(0,255,0,100)
  rect(gStartX, window.height - ge, gEndX-gStartX, window.height)
  fill(0,0,255,100)
  rect(bStartX, window.height - be, bEndX-bStartX, window.height)
  
  noFill();
  stroke(color(100))
  beginShape();
  for (i = 0; i<spectrum.length; i++) {
    vertex(i, map(spectrum[i], 0, 255, height, 0) );
  }
  endShape();
}

function drawDebugColors(spectrum, re, ge, be) {
  fill(color(255, 0, 0));
  ellipse(100, 100, re/2);
  
  fill(color(0, 0, 255));
  ellipse(200, 100, be/2);
  
  fill(color(0, 255, 0));
  ellipse(300, 100, ge/2);
}

function draw() {
   
  var spectrum = fft.analyze();
  
  var re = fft.getEnergy(rStart, rEnd);
  var ge = fft.getEnergy(gStart, gEnd);
  var be = fft.getEnergy(bStart, bEnd);
  
  background(0)

  //Propagate soundwave
  lightColors.unshift(color(re*2, ge*2, be*2))
  while(lightColors.length > numLights) lightColors.pop()
  
  drawLightStrip(lightColors)
  drawDebugFreq(spectrum, re, ge, be);
  //drawDebugColors(spectrum, re, ge, be);
}