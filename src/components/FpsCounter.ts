import { Container, Text, TextStyle } from 'pixi.js';

export class FpsCounter extends Container {
    private fpsText: Text;
    private frames = 0;
    private elapsed = 0;
    
    constructor() {
        super();
        
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xffffff,
        });
        
        this.fpsText = new Text('FPS: 0', style);
        this.fpsText.x = 10;
        this.fpsText.y = 60;
        this.addChild(this.fpsText);
    }
    
    public update(delta: number): void {
        this.frames++;
        this.elapsed += delta;
        
        if (this.elapsed >= 30) {
            const fps = Math.round((this.frames * 60) / this.elapsed);
            this.fpsText.text = `FPS: ${fps}`;
            this.frames = 0;
            this.elapsed = 0;
        }
    }
}