import { Application, Container, Texture, Graphics } from 'pixi.js';
import { Emitter } from '@pixi/particle-emitter';
import { BaseScene } from './BaseScene';

export class PhoenixFlame extends BaseScene {
    private particleContainer: Container;
    private emitter: Emitter | null = null;
    private flameTexture: Texture | null = null;
    
    constructor(app: Application) {
        super(app);
        this.particleContainer = new Container();
        this.addChild(this.particleContainer);
    }
    
    public init(): void {
        super.init();
        
        if (!this.flameTexture) {
            // try load or fallback
            Texture.fromURL('/fire.png')
                .then(texture => {
                    this.flameTexture = texture;
                    this.setupEmitter();
                })
                .catch(() => {
                    this.createFallbackTexture();
                });
        } else {
            this.setupEmitter();
        }
    }
    
    private createFallbackTexture(): void {
        const graphics = new Graphics();
        graphics.beginFill(0xffaa00, 0.3);
        graphics.drawCircle(0, 0, 30);
        graphics.endFill();

        graphics.beginFill(0xff7700, 0.5);
        graphics.drawCircle(0, 0, 20);
        graphics.endFill();
        
        graphics.beginFill(0xffee00, 0.7);
        graphics.drawCircle(0, 0, 10);
        graphics.endFill();
        
        this.flameTexture = this.app.renderer.generateTexture(graphics);
        this.setupEmitter();
    }
    
    private setupEmitter(): void {
        if (!this.flameTexture) return;
        
        const emitterConfig = {
            lifetime: {
                min: 0.5,
                max: 0.5
            },
            frequency: 0.05, 
            emitterLifetime: -1,
            maxParticles: 10,
            addAtBack: false,
            pos: {
                x: 0,
                y: 0
            },
            behaviors: [
                {
                    type: 'alpha',
                    config: {
                        alpha: {
                            list: [
                                {
                                    time: 0,
                                    value: 0
                                },
                                {
                                    time: 0.5,
                                    value: 0.4
                                },
                                {
                                    time: 1,
                                    value: 0
                                }
                            ]
                        }
                    }
                },
                {
                    type: 'scale',
                    config: {
                        scale: {
                            list: [
                                {
                                    time: 0,
                                    value: 0.22
                                },
                                {
                                    time: 0.3,
                                    value: 0.24
                                },
                                {
                                    time: 1,
                                    value: 0.14
                                }
                            ]
                        }
                    }
                },
                {
                    type: 'color',
                    config: {
                        color: {
                            list: [
                                {
                                    time: 0,
                                    value: "ffd580" 
                                },
                                {
                                    time: 1,
                                    value: "ff6666" 
                                }
                            ]
                        }
                    }
                },
                {
                    type: 'moveSpeed',
                    config: {
                        speed: {
                            list: [
                                {
                                    time: 0,
                                    value: 50
                                },
                                {
                                    time: 1,
                                    value: 100
                                }
                            ],
                            isStepped: false
                        }
                    }
                },
                {
                    type: 'rotation',
                    config: {
                        accel: 0,
                        minSpeed: -2,
                        maxSpeed: 2,
                        minStart: 0,
                        maxStart: 360
                    }
                },
                {
                    type: 'spawnShape',
                    config: {
                        type: 'rect',
                        data: {
                            x: -10,
                            y: -5,
                            w: 20,
                            h: 10
                        }
                    }
                },
                {
                    type: 'textureSingle',
                    config: {
                        texture: this.flameTexture
                    }
                }
            ]
        };
        
        this.emitter = new Emitter(this.particleContainer, emitterConfig);
        
        this.emitter.emit = true;
        
        this.resize(this.app.screen.width, this.app.screen.height);
    }
    
    public resize(width: number, height: number): void {
        this.particleContainer.position.set(width / 2, height / 2);
    }
    
    protected update(delta: number): void {
        super.update(delta);
        
        if (!this.emitter) return;

        const deltaSeconds = delta / 60;
        
        this.emitter.update(deltaSeconds);
    }
    
    public cleanUp(): void {
        super.cleanUp();
        
        if (this.emitter) {
            this.emitter.emit = false;
            
            this.particleContainer.removeChildren();
        }
    }
    
    public destroy(): void {
        this.cleanUp();
        
        if (this.flameTexture) {
            this.flameTexture.destroy(true);
            this.flameTexture = null;
        }
        
        this.particleContainer.destroy({ children: true });
        
        if (this.emitter) {
            this.emitter.destroy();
            this.emitter = null;
        }
        
        super.destroy();
    }
}