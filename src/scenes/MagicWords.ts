import { Application, Container, Graphics, Sprite, Text } from 'pixi.js';
import { BaseScene } from './BaseScene';

interface DialogueLine { name: string; text: string; }
interface Emoji { name: string; url: string; }
interface Avatar { name: string; url: string; position: 'left' | 'right'; }
interface MagicWordsData { dialogue: DialogueLine[]; emojies: Emoji[]; avatars: Avatar[]; }

interface ColorSprite extends Sprite {
    customColor?: number;
}

export class MagicWords extends BaseScene {
    private container = new Container();
    private dialogueContainer = new Container();
    private bubbleWidth = 450;
    private minBubbleWidth = 220;
    private maxBubbleWidth = 700;
    private messageSpacing = 15;
    private loadedAvatars = new Map<string, ColorSprite>();
    private loadedEmojis = new Map<string, Sprite>();
    private data: MagicWordsData | null = null;
    private isInitialized = false;
    private lastScreenWidth = 0;
    private widthChangeThreshold = 50; // only recalc on significant change

    constructor(app: Application) {
        super(app);
    }
    
    public init(): void {
        super.init();
        this.addChild(this.container);
        this.container.addChild(this.dialogueContainer);
        this.fetchAndRender();
    }
    
    private async fetchAndRender(): Promise<void> {
        try {
            const response = await fetch('https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords');
            this.data = await response.json();
            
            // init bubbleWidth on current screen size
            this.bubbleWidth = Math.max(
                this.minBubbleWidth,
                Math.min(this.maxBubbleWidth, Math.floor(this.app.screen.width * 0.2))
            );
            this.lastScreenWidth = this.app.screen.width;
            
            await this.createAssets();
            this.createDialogue();
            this.isInitialized = true;
            this.resize(this.app.screen.width, this.app.screen.height);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    private async createAssets(): Promise<void> {
        if (!this.data) return;
        
        // random colors for users
        const userColors = new Map<string, number>();
        const colorPalette = [0x3b82f6, 0x9333ea, 0xef4444, 0x10b981, 0xf97316, 0x8b5cf6, 0x14b8a6];
        let colorIndex = 0;
        
        // Assign colors to users
        this.data.avatars.forEach(avatar => {
            if (!userColors.has(avatar.name)) {
                userColors.set(avatar.name, colorPalette[colorIndex % colorPalette.length]);
                colorIndex++;
            }
        });
        
        // try load avatar images first fall back to gen'd ones
        for (const avatar of this.data.avatars) {
            try {
                const cleanUrl = this.cleanupUrl(avatar.url);
                const sprite = await this.loadImage(cleanUrl, 
                    () => this.createAvatarFallback(avatar.name, userColors.get(avatar.name) || 0x3b82f6));
                this.loadedAvatars.set(avatar.name, sprite);
            } catch (error) {
                this.loadedAvatars.set(avatar.name, 
                    this.createAvatarFallback(avatar.name, userColors.get(avatar.name) || 0x3b82f6));
            }
        }
        
        // try load emoji images first fall back to gen'd ones
        for (const emoji of this.data.emojies) {
            try {
                const cleanUrl = this.cleanupUrl(emoji.url);
                const sprite = await this.loadImage(cleanUrl, 
                    () => this.createEmojiFallback(emoji.name));
                this.loadedEmojis.set(emoji.name, sprite);
            } catch (error) {
                this.loadedEmojis.set(emoji.name, this.createEmojiFallback(emoji.name));
            }
        }
    }
    
    private cleanupUrl(url: string): string {
        // remove port :81 from URLs
        return url.replace(/:81/, '');
    }
    
    private async loadImage(url: string, fallbackFn: () => Sprite): Promise<Sprite> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }
                
                ctx.drawImage(img, 0, 0);
                
                const base64 = canvas.toDataURL('image/png');
                const texture = Sprite.from(base64);
                resolve(texture);
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            // in case image takes too long
            setTimeout(() => {
                if (!img.complete) {
                    img.src = '';
                    fallbackFn();
                    reject(new Error('Image load timeout'));
                }
            }, 5000);
            
            img.src = url;
        });
    }
    
    // colored circle fallback
    private createAvatarFallback(name: string, color: number): ColorSprite {
        const graphics = new Graphics();
        graphics.beginFill(color);
        graphics.drawCircle(25, 25, 25);
        graphics.endFill();
        
        const text = new Text(name.charAt(0).toUpperCase(), {
            fontSize: 24,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        text.anchor.set(0.5);
        text.position.set(25, 25);
        graphics.addChild(text);
        
        const texture = this.app.renderer.generateTexture(graphics);
        const sprite = new Sprite(texture) as ColorSprite;
        sprite.width = 40;
        sprite.height = 40;
        sprite.customColor = color;
        return sprite;
    }
    
    private createEmojiFallback(name: string): Sprite {
        const graphics = new Graphics();
        let color = 0xffcc00;
        
        if (name === 'sad') color = 0x6699cc;
        else if (name === 'intrigued') color = 0x66cc99;
        else if (name === 'neutral') color = 0xcccccc;
        else if (name === 'satisfied') color = 0xff9966;
        else if (name === 'laughing') color = 0xffcc00;
        
        graphics.beginFill(color);
        graphics.drawCircle(12, 12, 12);
        graphics.endFill();
        
        const initial = name.charAt(0).toUpperCase();
        const text = new Text(initial, {
            fontSize: 12,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        text.anchor.set(0.5);
        text.position.set(12, 12);
        graphics.addChild(text);
        
        const texture = this.app.renderer.generateTexture(graphics);
        const sprite = new Sprite(texture);
        sprite.width = 20;
        sprite.height = 20;
        return sprite;
    }
    
    private createDialogue(): void {
        if (!this.data) return;
        
        // Clear existing dialogue
        this.dialogueContainer.removeChildren();
        
        // Create messages with current bubble width
        let yOffset = 0;
        this.data.dialogue.forEach(line => {
            const msgContainer = this.createMessageBubble(line);
            msgContainer.y = yOffset;
            this.dialogueContainer.addChild(msgContainer);
            yOffset += msgContainer.height + this.messageSpacing;
        });
        
        // Update the layout based on current screen size
        this.resize(this.app.screen.width, this.app.screen.height);
    }
    
    private createMessageBubble(line: DialogueLine): Container {
        const container = new Container();
        const isLeft = this.isLeft(line.name);
        
        // Get user color for this character
        let bubbleColor = 0x3b82f6;
        const avatar = this.loadedAvatars.get(line.name);
        if (avatar && avatar.customColor) {
            bubbleColor = avatar.customColor;
        }
        
        const bubble = new Graphics();
        bubble.beginFill(bubbleColor, 0.8);
        container.addChild(bubble);
        
        const textContainer = new Container();
        textContainer.position.set(10, 8);
        container.addChild(textContainer);
        
        const nameText = new Text(line.name, {
            fontSize: 14,
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        textContainer.addChild(nameText);
        
        const messageText = this.createTextWithEmojis(line.text);
        messageText.position.set(0, nameText.height + 5);
        textContainer.addChild(messageText);
        
        const avatarSprite = this.loadedAvatars.get(line.name);
        if (avatarSprite) {
            const avatar = new Sprite(avatarSprite.texture);
            avatar.width = 36;
            avatar.height = 36;
            if (isLeft) {
                avatar.position.set(-46, 5);
            } else {
                avatar.position.set(this.bubbleWidth + 10, 5);
            }
            container.addChild(avatar);
        }
        
        const bubbleHeight = Math.max(50, textContainer.height + 16);
        bubble.drawRoundedRect(0, 0, this.bubbleWidth, bubbleHeight, 15);
        bubble.endFill();
        
        return container;
    }
    
    private createTextWithEmojis(text: string): Container {
        const container = new Container();
        // padding into account
        const maxWidth = this.bubbleWidth - 20;
        const lineHeight = 20;
        
        let currentLine = new Container();
        let lineWidth = 0;
        let lineY = 0;
        container.addChild(currentLine);
        
        const parts = text.split(/(\{[^}]+\})/);
        parts.forEach(part => {
            if (part.startsWith('{') && part.endsWith('}')) {
                const emojiName = part.substring(1, part.length - 1);
                const emojiSprite = this.loadedEmojis.get(emojiName);
                
                if (emojiSprite) {
                    if (lineWidth + 20 > maxWidth) {
                        lineY += lineHeight;
                        currentLine = new Container();
                        currentLine.y = lineY;
                        container.addChild(currentLine);
                        lineWidth = 0;
                    }
                    
                    const emoji = new Sprite(emojiSprite.texture);
                    emoji.width = 18;
                    emoji.height = 18;
                    emoji.x = lineWidth;
                    currentLine.addChild(emoji);
                    lineWidth += 22;
                }
            } else if (part.trim() !== '') {
                const words = part.split(' ');
                words.forEach((word, i) => {
                    const text = new Text((i > 0 ? ' ' : '') + word, {
                        fontSize: 16,
                        fill: 0xffffff
                    });
                    
                    if (lineWidth + text.width > maxWidth && lineWidth > 0) {
                        lineY += lineHeight;
                        currentLine = new Container();
                        currentLine.y = lineY;
                        container.addChild(currentLine);
                        lineWidth = 0;
                        if (i > 0) {
                            text.text = word;
                            text.updateText(true);
                        }
                    }
                    
                    text.x = lineWidth;
                    currentLine.addChild(text);
                    lineWidth += text.width;
                });
            }
        });
        
        return container;
    }
    
    private isLeft(name: string): boolean {
        const avatar = this.data?.avatars.find(a => a.name === name);
        return avatar?.position === 'left' || false;
    }
    
    public resize(width: number, height: number): void {
        if (!this.isInitialized) return;

        // calc dynamic bubble width based on screen size (20%)
        const newBubbleWidth = Math.max(
            this.minBubbleWidth,
            Math.min(this.maxBubbleWidth, Math.floor(width * 0.3))
        );

        // significant width change check
        const widthChanged = Math.abs(this.bubbleWidth - newBubbleWidth) > 20 || 
                           Math.abs(this.lastScreenWidth - width) > this.widthChangeThreshold;
        
        if (widthChanged) {
            this.bubbleWidth = newBubbleWidth;
            this.lastScreenWidth = width;
            
            // recreate dialogue (new spacing)
            this.createDialogue();
        }
        
        // center chat
        this.container.x = width / 2;
        this.container.y = 50; // tm
        
        // left/right alignment
        this.dialogueContainer.children.forEach((child, i) => {
            const name = this.data?.dialogue[i]?.name || '';
            child.x = this.isLeft(name) ? -this.bubbleWidth - 50 : 50;
        });
        
        // fit to screen
        const lastMessage = this.dialogueContainer.children[this.dialogueContainer.children.length - 1];
        if (lastMessage) {
            const totalHeight = lastMessage.y + lastMessage.getBounds().height + 40; // padding
            const availableHeight = height - 40;
            
            // scale down if content is taller space
            if (totalHeight > availableHeight) {
                const scale = Math.max(0.6, availableHeight / totalHeight); // no scale below 60%
                this.dialogueContainer.scale.set(scale);
            } else {
                this.dialogueContainer.scale.set(1);
            }
        }
    }
    
    public cleanUp(): void {
        super.cleanUp();
        this.dialogueContainer.removeChildren();
    }
    
    public destroy(): void {
        this.cleanUp();
        super.destroy();
    }
}