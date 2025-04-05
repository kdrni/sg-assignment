import { Application, Container } from 'pixi.js';

export abstract class BaseScene extends Container {
    protected app: Application;
    protected deltaTime: number = 0;
    private ticker: any;
    
    constructor(app: Application) {
        super();
        this.app = app;
        this.ticker = this.update.bind(this);
    }
    
    // Initialize the scene when it becomes active
    public init(): void {
        this.app.ticker.add(this.ticker);
        this.resize(this.app.screen.width, this.app.screen.height);
    }
    
    // Handle resize events
    public resize(_w: number, _h: number): void {}
    
    // Clean up resources when scene is deactivated
    public cleanUp(): void {
        this.app.ticker.remove(this.ticker);
    }
    
    // Full destruction - only call when shutting down entirely
    public destroy(): void {
        this.cleanUp();
        super.destroy({ children: true });
    }
    
    // Update method called each frame
    protected update(delta: number): void {
        this.deltaTime = delta;
    }
}