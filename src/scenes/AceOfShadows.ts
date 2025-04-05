import { Application, Container, Graphics, Sprite, Text, Point, Texture } from 'pixi.js';
import { BaseScene } from './BaseScene';

export class AceOfShadows extends BaseScene {
    private leftStackContainer: Container;
    private rightStackContainer: Container;
    private animatingContainer: Container;
    private cards: {
        sprite: Sprite;
        initialPosition: Point;
        targetPosition: Point;
        elapsed: number;
        isAnimating: boolean;
    }[] = [];
    
    // both in ms
    private cardMoveInterval = 1000; 
    private cardMoveDuration = 2000; 
    private lastMoveTime = 0;
    private elapsedTime = 0;
    
    private leftCountText: Text;
    private rightCountText: Text;
    
    private totalCards = 144;
    private nextIndex = 0;
    private activeFrom = -1;
    
    private leftCount = 0;
    private rightCount = 0;
    
    private cardTextures: Texture[] = [];
    
    constructor(app: Application) {
        super(app);
        
        // containers
        this.leftStackContainer = new Container();
        this.rightStackContainer = new Container();
        this.animatingContainer = new Container();
        this.animatingContainer.sortableChildren = true;
        
        this.addChild(this.leftStackContainer);
        this.addChild(this.rightStackContainer);
        this.addChild(this.animatingContainer);
        
        // UI
        const textStyle = {
            fontSize: 16,
            fill: 0xffffff,
            fontFamily: 'Arial'
        };
        
        this.leftCountText = new Text('Left Stack: 0', textStyle);
        this.rightCountText = new Text('Right Stack: 0', textStyle);
        
        this.addChild(this.leftCountText);
        this.addChild(this.rightCountText);
        
        this.createCardTextures();
    }
    
    private createCardTextures(): void {
        // create if not existing
        if (this.cardTextures.length > 0) return;
        
        for (let i = 1; i <= this.totalCards; i++) {
            const cardGraphics = new Graphics();
            cardGraphics.lineStyle(1, 0xffffff);
            cardGraphics.beginFill(0x2233aa);
            cardGraphics.drawRoundedRect(0, 0, 100, 150, 8);
            cardGraphics.endFill();
            
            const textColor = i % 2 === 0 ? 0xff0000 : 0x000000; // red/black
            const numberText = new Text(i.toString(), {
                fontSize: 24,
                fill: textColor,
                fontWeight: 'bold',
                fontFamily: 'Arial',
            });
            numberText.anchor.set(0.5);
            numberText.position.set(50, 75); // card center
            
            const container = new Container();
            container.addChild(cardGraphics);
            container.addChild(numberText);
            
            const texture = this.app.renderer.generateTexture(container);
            this.cardTextures.push(texture);
            
            container.destroy({ children: true });
        }
    }
    
    public init(): void {
        this.resetState();
        this.createCards();
        super.init();
    }
    
    private resetState(): void {
        this.leftStackContainer.removeChildren();
        this.rightStackContainer.removeChildren();
        this.animatingContainer.removeChildren();
        
        // reset  variables
        this.cards = [];
        this.lastMoveTime = 0;
        this.elapsedTime = 0;
        this.nextIndex = this.totalCards - 1;
        this.activeFrom = this.totalCards - 1;
        this.leftCount = this.totalCards;
        this.rightCount = 0;
        
        this.leftCountText.text = `Left Stack: ${this.leftCount}`;
        this.rightCountText.text = `Right Stack: ${this.rightCount}`;
    }
    
    private createCards(): void {
        for (let i = 0; i < this.totalCards; i++) {
            const cardNumber = i + 1;
            const cardSprite = new Sprite(this.cardTextures[cardNumber - 1]);
            cardSprite.anchor.set(0.5);
            cardSprite.alpha = 0.5;
            cardSprite.zIndex = i;
            
            // add offset
            cardSprite.y = -i * 1;
            
            this.leftStackContainer.addChild(cardSprite);
            
            this.cards.push({
                sprite: cardSprite,
                initialPosition: new Point(0, cardSprite.y),
                targetPosition: new Point(0, -i * 1),
                elapsed: 0,
                isAnimating: false
            });
        }
    }
    
    public resize(width: number, height: number): void {
        // old positions for delta change
        const oldRightStackX = this.rightStackContainer.x;
        const oldRightStackY = this.rightStackContainer.y;
        
        this.leftCountText.x = 10;
        this.leftCountText.y = height * 0.3;
        this.rightCountText.x = width - 125;
        this.rightCountText.y = height * 0.3;
        
        this.leftStackContainer.x = width * 0.25;
        this.leftStackContainer.y = height * 0.5;
        this.rightStackContainer.x = width * 0.75;
        this.rightStackContainer.y = height * 0.5;
        
        const deltaRightX = this.rightStackContainer.x - oldRightStackX;
        const deltaRightY = this.rightStackContainer.y - oldRightStackY;
        
        // update only animating cards
        for (let i = this.activeFrom; i > this.nextIndex; i--) {
            if (i < 0 || i >= this.cards.length) continue;
            
            const card = this.cards[i];
            if (card.isAnimating) {
                card.targetPosition.x += deltaRightX;
                card.targetPosition.y += deltaRightY;
            }
        }
    }
    
    protected update(delta: number): void {
        super.update(delta);
        
        if (this.cards.length === 0) return;
        
        const deltaMS = delta * (1000 / 60);
        this.elapsedTime += deltaMS;
        
        // move card every second
        if (this.elapsedTime - this.lastMoveTime >= this.cardMoveInterval && this.leftCount > 0) {
            this.lastMoveTime = this.elapsedTime;
            
            if (this.nextIndex >= 0 && this.nextIndex < this.cards.length) {
                const card = this.cards[this.nextIndex];
                const cardSprite = card.sprite;
                
                this.leftStackContainer.removeChild(cardSprite);
                this.animatingContainer.addChild(cardSprite);
                
                // initial
                const leftGlobalPos = new Point();
                this.leftStackContainer.toGlobal(new Point(0, cardSprite.y), leftGlobalPos);
                cardSprite.position.copyFrom(leftGlobalPos);
                card.initialPosition = new Point(cardSprite.x, cardSprite.y);
                
                // target
                const rightGlobalPos = new Point();
                const targetLocalY = -this.rightCount * 1;
                this.rightStackContainer.toGlobal(new Point(0, targetLocalY), rightGlobalPos);
                card.targetPosition = new Point(rightGlobalPos.x, rightGlobalPos.y);
                
                // reset
                card.elapsed = 0;
                card.isAnimating = true;
                cardSprite.zIndex = this.totalCards * 2;
                
                this.nextIndex--;
                this.leftCount--;
                this.leftCountText.text = `Left Stack: ${this.leftCount}`;
            }
        }
        
        // update anim
        for (let i = this.activeFrom; i > this.nextIndex; i--) {
            if (i < 0 || i >= this.cards.length) continue;
            
            const card = this.cards[i];
            if (!card.isAnimating) continue;
            
            card.elapsed += deltaMS;
            
            const t = Math.min(card.elapsed / this.cardMoveDuration, 1);
            const easedT = this.easeInOutQuad(t);
            
            card.sprite.x = card.initialPosition.x + easedT * (card.targetPosition.x - card.initialPosition.x);
            card.sprite.y = card.initialPosition.y + easedT * (card.targetPosition.y - card.initialPosition.y);
            
            // anim finished
            if (t >= 1) {
                this.animatingContainer.removeChild(card.sprite);
                this.rightStackContainer.addChild(card.sprite);
                
                card.sprite.position.set(0, -this.rightCount * 1);
                card.isAnimating = false;
                
                this.activeFrom--;
                this.rightCount++;
                this.rightCountText.text = `Right Stack: ${this.rightCount}`;
            }
        }
    }
    
    public cleanUp(): void {
        super.cleanUp();
        
        // clear containers but keep them
        this.leftStackContainer.removeChildren();
        this.rightStackContainer.removeChildren();
        this.animatingContainer.removeChildren();
    }
    
    public destroy(): void {
        super.cleanUp(); 
        
        // textures
        for (const texture of this.cardTextures) 
            texture.destroy(true);
        this.cardTextures = [];
        
        super.destroy();
    }
    
    private easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
}