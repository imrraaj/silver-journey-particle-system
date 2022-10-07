const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

class Particle {
  constructor(effect, x, y, color) {
    this.originX = Math.floor(x);
    this.originY = Math.floor(y);
    this.color = color;
    this.effect = effect;
    this.x = Math.random() * this.effect.width;
    this.y = Math.random() * this.effect.height;
    this.size = this.effect.gap;
    this.velocityX = 0;
    this.velocityY = 0;
    this.ease = 0.1;

    this.dx = 0;
    this.dy = 0;
    this.distance = 0;
    this.force = 0;
    this.angle = 0;
    this.friction = 0.95;
  }
  draw(context) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.size, this.size);
  }
  update() {
    this.dx = this.effect.mouse.x - this.x;
    this.dy = this.effect.mouse.y - this.y;
    this.distance = this.dx * this.dx + this.dy * this.dy; // have not taken sqrt for performance
    this.force = this.effect.mouse.radius / this.distance;

    if (this.distance < this.effect.mouse.radius) {
      this.angle = Math.atan2(this.dy, this.dx);
      this.velocityX += this.force * Math.cos(this.angle);
      this.velocityY += this.force * Math.sin(this.angle);
    }

    this.x +=
      (this.velocityX *= this.friction) + (this.originX - this.x) * this.ease;
    this.y +=
      (this.velocityY *= this.friction) + (this.originY - this.y) * this.ease;
  }
  warp() {
    this.x = Math.random() * this.effect.width;
    this.y = Math.random() * this.effect.height;
    this.ease = 0.07;
  }
}

class Effect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.particleArray = [];
    this.image = document.getElementById("image");
    this.centerX = this.width * 0.5;
    this.centerY = this.height * 0.5;
    this.x = this.centerX - 0.5 * this.image.width;
    this.y = this.centerY - 0.5 * this.image.height;
    this.gap = 5;

    this.mouse = {
      radius: 3000,
      x: undefined,
      y: undefined,
    };

    window.addEventListener("mousemove", (event) => {
      this.mouse.x = event.x;
      this.mouse.y = event.y;
    });
  }
  init(context) {
    context.drawImage(this.image, this.x, this.y);
    const pixels = context.getImageData(0, 0, this.width, this.height).data;

    for (let y = 0; y < this.height; y += this.gap) {
      for (let x = 0; x < this.width; x += this.gap) {
        const i = (y * this.width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        const color = `rgb(${r},${g},${b})`;
        if (a > 0) {
          this.particleArray.push(new Particle(this, x, y, color));
        }
      }
    }
  }
  draw(context) {
    this.particleArray.forEach((particle) => particle.draw(context));
  }
  update() {
    this.particleArray.forEach((particle) => particle.update());
  }
  warp() {
    this.particleArray.forEach((particle) => particle.warp());
  }
}

const effect = new Effect(canvas.width, canvas.height);
effect.init(ctx);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.draw(ctx);
  effect.update();
  requestAnimationFrame(animate);
}
animate();

const btn = document.getElementById("warp");
btn.addEventListener("click", () => {
  effect.warp();
});
