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
    
    public init(): void {
        this.app.ticker.add(this.ticker);
        this.resize(this.app.screen.width, this.app.screen.height);
    }
    
    public resize(_w: number, _h: number): void {}
    
    public destroy(): void {
        this.app.ticker.remove(this.ticker);
        super.destroy({ children: true });
    }
    
    protected update(delta: number): void {
        this.deltaTime = delta;
    }
}