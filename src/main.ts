import { Application, Graphics } from 'pixi.js';

const app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x000000,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  resizeTo: window
});

document.getElementById('app')?.appendChild(app.view as HTMLCanvasElement);

const circle = new Graphics();
circle.beginFill(0xff0000);
circle.drawCircle(0, 0, 50);
circle.endFill();

app.stage.addChild(circle);

function centerCircle() {
  circle.x = app.screen.width / 2;
  circle.y = app.screen.height / 2;
}

centerCircle();

window.addEventListener('resize', () => {
  centerCircle();
});