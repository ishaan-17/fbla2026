// @ts-nocheck

// Oscillator for smooth wave-based movement
function Oscillator(e) {
  this.init(e || {});
}
Oscillator.prototype = {
  init: function (e) {
    this.phase = e.phase || 0;
    this.offset = e.offset || 0;
    this.frequency = e.frequency || 0.001;
    this.amplitude = e.amplitude || 1;
  },
  update: function () {
    this.phase += this.frequency;
    return this.offset + Math.sin(this.phase) * this.amplitude;
  },
  value: function () {
    return this.offset + Math.sin(this.phase) * this.amplitude;
  }
};

function Line(e) {
  this.init(e || {});
}

Line.prototype = {
  init: function (e) {
    this.spring = e.spring + 0.1 * Math.random() - 0.05;
    this.friction = E.friction + 0.01 * Math.random() - 0.005;
    this.nodes = [];
    
    // Dynamic offset oscillators - each line breathes independently
    this.index = e.index || 0;
    this.offsetOscX = new Oscillator({
      phase: Math.random() * Math.PI * 2,
      offset: 0,
      amplitude: 30 + Math.random() * 40, // varying max spread
      frequency: 0.008 + Math.random() * 0.015, // different breathing speeds
    });
    this.offsetOscY = new Oscillator({
      phase: Math.random() * Math.PI * 2,
      offset: 0,
      amplitude: 30 + Math.random() * 40,
      frequency: 0.008 + Math.random() * 0.015,
    });
    // Spread factor oscillator - controls overall thickness
    this.spreadPhase = Math.random() * Math.PI * 2;
    this.spreadFreq = 0.003 + Math.random() * 0.004;
    
    for (var t, n = 0; n < E.size; n++) {
      t = new Node();
      t.x = pos.x;
      t.y = pos.y;
      this.nodes.push(t);
    }
  },
  update: function () {
    let e = this.spring,
      t = this.nodes[0];
    
    // Dynamic breathing offsets
    this.spreadPhase += this.spreadFreq;
    let spreadMultiplier = 0.3 + Math.abs(Math.sin(this.spreadPhase)) * 0.7;
    let dynamicOffsetX = this.offsetOscX.update() * spreadMultiplier;
    let dynamicOffsetY = this.offsetOscY.update() * spreadMultiplier;
    
    let targetX = pos.x + dynamicOffsetX;
    let targetY = pos.y + dynamicOffsetY;
    
    t.vx += (targetX - t.x) * e;
    t.vy += (targetY - t.y) * e;
    for (var n, i = 0, a = this.nodes.length; i < a; i++)
      (t = this.nodes[i]),
        0 < i &&
          ((n = this.nodes[i - 1]),
          (t.vx += (n.x - t.x) * e),
          (t.vy += (n.y - t.y) * e),
          (t.vx += n.vx * E.dampening),
          (t.vy += n.vy * E.dampening)),
        (t.vx *= this.friction),
        (t.vy *= this.friction),
        (t.x += t.vx),
        (t.y += t.vy),
        (e *= E.tension);
  },
  draw: function () {
    let e,
      t,
      n = this.nodes[0].x,
      i = this.nodes[0].y;
    ctx.beginPath();
    ctx.moveTo(n, i);
    for (var a = 1, o = this.nodes.length - 2; a < o; a++) {
      e = this.nodes[a];
      t = this.nodes[a + 1];
      n = 0.5 * (e.x + t.x);
      i = 0.5 * (e.y + t.y);
      ctx.quadraticCurveTo(e.x, e.y, n, i);
    }
    e = this.nodes[a];
    t = this.nodes[a + 1];
    ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
    ctx.stroke();
    ctx.closePath();
  },
};

function Node() {
  this.x = 0;
  this.y = 0;
  this.vy = 0;
  this.vx = 0;
}

// Autonomous movement oscillators
var xOsc1: any, xOsc2: any, xOsc3: any, yOsc1: any, yOsc2: any, yOsc3: any;

function initAutonomousMovement() {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  
  xOsc1 = new Oscillator({
    phase: Math.random() * Math.PI * 2,
    offset: w * 0.5,
    amplitude: w * 0.3,
    frequency: 0.012,
  });
  xOsc2 = new Oscillator({
    phase: Math.random() * Math.PI * 2,
    offset: 0,
    amplitude: w * 0.15,
    frequency: 0.031,
  });
  xOsc3 = new Oscillator({
    phase: Math.random() * Math.PI * 2,
    offset: 0,
    amplitude: w * 0.07,
    frequency: 0.053,
  });
  yOsc1 = new Oscillator({
    phase: Math.random() * Math.PI * 2,
    offset: h * 0.5,
    amplitude: h * 0.28,
    frequency: 0.014,
  });
  yOsc2 = new Oscillator({
    phase: Math.random() * Math.PI * 2,
    offset: 0,
    amplitude: h * 0.12,
    frequency: 0.029,
  });
  yOsc3 = new Oscillator({
    phase: Math.random() * Math.PI * 2,
    offset: 0,
    amplitude: h * 0.05,
    frequency: 0.048,
  });
  
  pos.x = xOsc1.update() + xOsc2.update() + xOsc3.update();
  pos.y = yOsc1.update() + yOsc2.update() + yOsc3.update();
}

function updateAutonomousPosition() {
  pos.x = xOsc1.update() + xOsc2.update() + xOsc3.update();
  pos.y = yOsc1.update() + yOsc2.update() + yOsc3.update();
}

function initLines() {
  lines = [];
  for (let i = 0; i < E.trails; i++) {
    lines.push(new Line({ 
      spring: 0.4 + (i / E.trails) * 0.035,
      index: i 
    }));
  }
}

function warmUp() {
  for (let i = 0; i < 250; i++) {
    updateAutonomousPosition();
    for (let t = 0; t < E.trails; t++) {
      lines[t].update();
    }
  }
}

function render() {
  if (ctx.running) {
    updateAutonomousPosition();
    
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "hsla(" + Math.round(colorOsc.update()) + ",100%,50%,0.025)";
    ctx.lineWidth = 10;
    
    for (var e, t = 0; t < E.trails; t++) {
      (e = lines[t]).update();
      e.draw();
    }
    ctx.frame++;
    window.requestAnimationFrame(render);
  }
}

function resizeCanvas() {
  ctx.canvas.width = window.innerWidth - 20;
  ctx.canvas.height = window.innerHeight;
}

var ctx: any,
  colorOsc: any,
  pos: any = { x: 0, y: 0 },
  lines: any[] = [],
  E = {
    debug: true,
    friction: 0.45,
    trails: 90,
    size: 55,
    dampening: 0.025,
    tension: 0.988,
  };

export const renderCanvas = function () {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) return;
  
  ctx = canvas.getContext("2d");
  ctx.running = true;
  ctx.frame = 1;
  
  colorOsc = new Oscillator({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 85,
    frequency: 0.002,
    offset: 285,
  });
  
  resizeCanvas();
  initAutonomousMovement();
  initLines();
  warmUp();
  
  window.addEventListener("resize", () => {
    resizeCanvas();
    initAutonomousMovement();
    initLines();
    warmUp();
  });
  window.addEventListener("focus", () => {
    if (!ctx.running) {
      ctx.running = true;
      render();
    }
  });
  window.addEventListener("blur", () => {
    ctx.running = true;
  });
  
  render();
};

export const stopCanvas = function () {
  if (ctx) {
    ctx.running = false;
  }
};
