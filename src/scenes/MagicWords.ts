import { Application, Graphics, Text } from 'pixi.js';
import { BaseScene } from './BaseScene';

export class MagicWords extends BaseScene {
    private placeholder: Graphics;
    
    constructor(app: Application) {
        super(app);
        this.placeholder = new Graphics();
    }
    
    public init(): void {
        super.init();
        
        this.placeholder.beginFill(0x33aa33);
        this.placeholder.drawRect(-150, -80, 300, 160);
        this.placeholder.endFill();
        
        const label = new Text('Magic Words', {
            fontSize: 20,
            fill: 0xffffff
        });
        label.anchor.set(0.5);
        
        this.placeholder.addChild(label);
        this.addChild(this.placeholder);
    }
    
    public resize(width: number, height: number): void {
        this.placeholder.x = width / 2;
        this.placeholder.y = height / 2;
    }
    
    protected update(delta: number): void {
        super.update(delta);
    }
}