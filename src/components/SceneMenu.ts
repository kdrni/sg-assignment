import { Container, Graphics, Text, TextStyle } from 'pixi.js';

export type MenuOption = {
    text: string;
    callback: () => void;
};

export class SceneMenu extends Container {
    private buttons: Container[] = [];
    
    constructor(options: MenuOption[]) {
        super();
        
        const buttonStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xffffff,
        });
        
        const buttonWidth = 150;
        const buttonHeight = 40;
        const padding = 10;
        
        options.forEach((option, index) => {
            const button = new Container();
            
            const bg = new Graphics();
            bg.beginFill(0x333333);
            bg.drawRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
            bg.endFill();
            
            const label = new Text(option.text, buttonStyle);
            label.anchor.set(0.5);
            label.x = buttonWidth / 2;
            label.y = buttonHeight / 2;
            
            button.addChild(bg);
            button.addChild(label);
            button.x = (buttonWidth + padding) * index;
            button.y = 10;
            
            button.eventMode = 'static';
            button.cursor = 'pointer';
            
            button.on('pointerover', () => {
                bg.tint = 0x666666;
            });
            
            button.on('pointerout', () => {
                bg.tint = 0xffffff;
            });
            
            button.on('pointerdown', () => {
                option.callback();
            });
            
            this.addChild(button);
            this.buttons.push(button);
        });
    }
}