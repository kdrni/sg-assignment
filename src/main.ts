import { Application } from 'pixi.js';
import { BaseScene } from './scenes/BaseScene';
import { AceOfShadows } from './scenes/AceOfShadows';
import { MagicWords } from './scenes/MagicWords';
import { PhoenixFlame } from './scenes/PhoenixFlame';
import { FpsCounter } from './components/FpsCounter';
import { SceneMenu, MenuOption } from './components/SceneMenu';

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

let currentScene: BaseScene | null = null;
const fpsCounter = new FpsCounter();

function switchScene(scene: BaseScene): void {
    if (currentScene) {
        app.stage.removeChild(currentScene);
        currentScene.destroy();
    }
    
    currentScene = scene;
    currentScene.init();
    app.stage.addChild(currentScene);
    
    app.stage.removeChild(fpsCounter);
    app.stage.addChild(fpsCounter);
}

window.addEventListener('resize', () => {
    if (currentScene) {
        currentScene.resize(app.screen.width, app.screen.height);
    }
});

const menuOptions: MenuOption[] = [
    {
        text: 'Ace of Shadows',
        callback: () => switchScene(new AceOfShadows(app))
    },
    {
        text: 'Magic Words',
        callback: () => switchScene(new MagicWords(app))
    },
    {
        text: 'Phoenix Flame',
        callback: () => switchScene(new PhoenixFlame(app))
    }
];

const menu = new SceneMenu(menuOptions);
app.stage.addChild(menu);
app.stage.addChild(fpsCounter);

app.ticker.add((delta) => {
    fpsCounter.update(delta);
});

switchScene(new AceOfShadows(app));