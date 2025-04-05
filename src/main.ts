import { Application } from 'pixi.js';
import { BaseScene } from './scenes/BaseScene';
import { AceOfShadows } from './scenes/AceOfShadows';
import { MagicWords } from './scenes/MagicWords';
import { PhoenixFlame } from './scenes/PhoenixFlame';
import { FpsCounter } from './components/FpsCounter';
import { SceneMenu, MenuOption } from './components/SceneMenu';

// setup
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

// fullscreen functionality
function enterFullscreen() {
    const docEl = document.documentElement;
    
    try {
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen();
        } else if ((docEl as any).webkitRequestFullscreen) { // Safari
            (docEl as any).webkitRequestFullscreen();
        } else if ((docEl as any).msRequestFullscreen) { // IE11
            (docEl as any).msRequestFullscreen();
        }
    } catch (error) {
        console.log('Fullscreen request failed:', error);
        showFullscreenButton();
    }
}

function showFullscreenButton() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.style.display = 'block';
    }
}

// try fullscreen automatically on load
window.addEventListener('load', () => {
    enterFullscreen();
    
    // this likely fails due to browser security policies,
    // so show the button after a short delay
    setTimeout(showFullscreenButton, 300);
});

// add click event to canvas to try fullscreen on first click
const appElement = document.getElementById('app');
if (appElement) {
    appElement.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            enterFullscreen();
        }
    }, { once: true }); 
}

// fc btn
const fullscreenBtn = document.getElementById('fullscreen-btn');
if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
        enterFullscreen();
        fullscreenBtn.style.display = 'none';
    });
    
    // show button if user exits fullscreen
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            fullscreenBtn.style.display = 'block';
        } else {
            fullscreenBtn.style.display = 'none';
        }
    });
}

// click handler to document to try entering fullscreen on first user interaction
document.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        enterFullscreen();
    }
}, { once: true });

// precreate scenes
const scenes = {
    aceOfShadows: new AceOfShadows(app),
    magicWords: new MagicWords(app),
    phoenixFlame: new PhoenixFlame(app)
};

let currentScene: BaseScene | null = null;
const fpsCounter = new FpsCounter();

function switchScene(sceneName: keyof typeof scenes): void {
    const newScene = scenes[sceneName];
    
    if (currentScene === newScene) return;
    
    // cleanup current
    if (currentScene) {
        app.stage.removeChild(currentScene);
        currentScene.cleanUp();
    }
    
    currentScene = newScene;
    currentScene.init();
    app.stage.addChild(currentScene);
}

// handle resizing
window.addEventListener('resize', () => {
    if (currentScene) currentScene.resize(app.screen.width, app.screen.height);
});

// menu setup
const menuOptions: MenuOption[] = [
    { text: 'Ace of Shadows', callback: () => switchScene('aceOfShadows') },
    { text: 'Magic Words', callback: () => switchScene('magicWords') },
    { text: 'Phoenix Flame', callback: () => switchScene('phoenixFlame') }
];

const menu = new SceneMenu(menuOptions);
app.stage.addChild(menu);
app.stage.addChild(fpsCounter);

app.ticker.add((delta) => {
    fpsCounter.update(delta);
});

// start with first scene
switchScene('aceOfShadows');