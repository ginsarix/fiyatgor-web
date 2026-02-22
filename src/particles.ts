interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
}

export function initParticles() {
  const canvas = document.getElementById("particles") as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;

  let width = 0;
  let height = 0;
  let particles: Particle[] = [];
  const COUNT = 55;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function spawn(): Particle {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.25 + 0.1,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, spawn);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.fill();
    }
  }

  function update() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      // Wrap around edges
      if (p.x < -p.r) p.x = width + p.r;
      else if (p.x > width + p.r) p.x = -p.r;
      if (p.y < -p.r) p.y = height + p.r;
      else if (p.y > height + p.r) p.y = -p.r;
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => {
    resize();
  });

  init();
  loop();
}
