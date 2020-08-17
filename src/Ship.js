import { Sprite, Container, Text, TextStyle, spine, BaseTexture } from 'pixi.js';
import 'pixi-spine';

import * as shipBorder from './assets/light.png';

import 'pixi-tween';


export default class Ship {
  constructor(shipJson, shipAtlas, shipPng, containerX, containerY, username, allocation, mobile, defaultPosition) {
    this.containerX = containerX;
    this.containerY = containerY;
    this.username = username;
    this.allocation = allocation;
    this.mobile = mobile;
    this.fontSize = mobile ? 25 : 10;
    // this.isSelect = isSelect;

    // this.container.y = 100;
    // this.x = containerX;
    // this.y = 100;
    this.buildShip(shipJson, shipAtlas, shipPng);
    this.initPosition(defaultPosition?.x || 0, defaultPosition?.y || 0);
    this.portfolio = new PIXI.Container();
    this.initPortfolio();
    this.initProfit();
    // this.setBorder();
    this.initContainer();
  }

  buildShip(json, atlas, shipPng) {
    const rawSkeletonData = json.default;

    const spineAtlas = new spine.core.TextureAtlas(atlas, (line, callback) => {
      callback(BaseTexture.fromImage(shipPng));
    });

    const spineAtlasLoader = new spine.core.AtlasAttachmentLoader(spineAtlas);
    const spineJsonParser = new spine.core.SkeletonJson(spineAtlasLoader);

    const spineData = spineJsonParser.readSkeletonData(rawSkeletonData);

    this.ship = new spine.Spine(spineData);

    this.ship.skeleton.setSkinByName('default');
    this.ship.skeleton.setSlotsToSetupPose();

    this.ship.state.setAnimation(0, 'idle', true);

    this.ship.stateData.setMix('idle', 'hyper_start');
    this.ship.stateData.setMix('hyper_start', 'hyper');
    this.ship.stateData.setMix('hyper', 'hyper_stop');
    this.ship.stateData.setMix('hyper_stop', 'idle');

    this.ship.rotation = 3.14159;
    this.ship.interactive = true;
  }

  initPosition(x, y) {
    this.ship.x = x;
    this.ship.y = y;

    // this.profitText.y = y;
    // this.usernameText.y = y;
    // this.bordery.y = y;

    if (this.mobile) {
      this.ship.scale.x = 1;
      this.ship.scale.y = 1;
    } else {
      this.ship.scale.x = 0.7;
      this.ship.scale.y = 0.7;
    }
  }

  rotate(rotation) {
    this.ship.rotation = rotation;
  }

  tweenMoveY = null;

  moveTo(to, key) {
    this.ship[key] += to;
    this.profitText[key] += to;
    this.usernameText[key] += to;
    this.border[key] += to;
    // const duration = 2000;
    // console.log(this.tweenMoveY)
    // if (this.tweenMoveY) this.tweenMoveY.stop();

    // this.tweenMoveY = PIXI.tweenManager.createTween(this.container);

    // this.tweenMoveY.to({ [key]: to });
    // this.tweenMoveY.time = duration;

    // this.setPortfolio(to);
    // this.tweenMoveY.start();
  }

  moveToYWithAnimation = y => {
    return new Promise(resolve => {
      const duration = 1500;
      if (this.tweenMoveY) this.tweenMoveY.stop();

      this.tweenMoveY = PIXI.tweenManager.createTween(this.container);

      // this.ship.state.setAnimation(0, 'hyper_start', false);

      this.tweenMoveY.to({ y });
      this.tweenMoveY.time = duration;

      this.tweenMoveY.on('end', () => {
        // this.container.destroy();
        // this.ship.state.setAnimation(0, 'hyper_stop', false);
        // this.ship.state.setAnimation(0, 'idle', true, 30);
        resolve();
      });

      // this.tweenMoveY.on('stop', () => {
      //   this.ship.state.setAnimation(0, 'hyper_stop', false);
      //   this.ship.state.setAnimation(0, 'idle', true, 30);
      // });

      this.tweenMoveY.start();
    });
  };

  initProfit() {
    this.info = new PIXI.Container();
    // profit and username
    const style = new TextStyle({
      fontSize: this.fontSize,
      fill: 'white',
    });

    this.profitText = new Text(`0.000000%`, style);
    this.usernameText = new Text(this.username.length - 12 > 1 ? `${this.username.substr(0, 12)}...` : this.username, {
      fontSize: this.fontSize,
      fill: 'white',
    });
    if (this.mobile) {
      this.usernameText.x = 0 - this.usernameText.width / 2;
      this.usernameText.y = 215 + this.fontSize;
      this.profitText.x = 0 - this.profitText.width / 2;
      this.profitText.y = 200;
    } else {
      this.usernameText.x = 0 - this.usernameText.width / 2;
      this.usernameText.y = 110 + this.fontSize;
      this.profitText.x = 0 - this.profitText.width / 2;
      this.profitText.y = 105;
    }
    // border

    this.border = new PIXI.Graphics();
    // this.portfolioBorder.lineStyle(1, 0x8cd4f8, 1);
    this.border.beginFill(0x10a643, 0.8);
    this.border.drawRect(7.5, 0, 120, 40);
    this.border.lineStyle(0, 0x10a643, 0.8);
    this.border.moveTo(76, 0);
    this.border.lineTo(65, -8);
    this.border.lineTo(57, 0);
    this.border.lineTo(65, 0);
    this.border.endFill();
    // this.border = Sprite.from(profitBorder);
    this.border.scale.x = this.fontSize / 20;
    this.border.scale.y = this.fontSize / 20;
    this.border.x = this.profitText.x - this.fontSize / 1.3;
    this.border.y = this.profitText.y - this.fontSize / 2;

    this.info.addChild(this.border);
    this.info.addChild(this.profitText);
    this.info.addChild(this.usernameText);
    // mobile
    if (this.mobile) {
      this.info.visible = false;
      this.switcher = new PIXI.Graphics();
      this.switcher.beginFill(0x54ff9f); // Red
      this.switcher.drawCircle(0, -30, 5);
      this.switcher.endFill();
      this.switcher.lineStyle(2, 0x54ff9f); // (thickness, color)
      this.switcher.drawCircle(0, -30, 15);
      this.switcher.interactive = true;
      this.switcher.hitArea = this.switcher.getBounds();
      this.switcher.touchstart = () => {
        if (!this.info.visible) {
          this.info.visible = true;
          // this.portfolio.visible = true;
          this.switcher.visible = false;
        }
      };
      this.info.interactive = true;
      this.info.touchstart = () => {
        if (this.info.visible) {
          this.info.visible = false;
          // this.portfolio.visible = false;
          this.switcher.visible = true;
        }
      };
    }
  }

  setProfit(value) {
    const points = Math.round(value * 1000000) / 1000000;
    const textColor = 'white'; // points < 0 ? 0x191919 : 0x272527;
    const bgColor = points < 0 ? 0xdb2f18 : 0x10a643;
    this.profitText.text = `${points}%`;

    const style = new TextStyle({
      fontSize: this.fontSize,
      fill: textColor,
    });
    this.profitText.style = style;

    this.border.clear();
    this.border.beginFill(bgColor, 0.8);
    this.border.drawRect(7.5, 0, 125, 40);
    this.border.lineStyle(0, bgColor, 0.8);
    this.border.moveTo(76, 0);
    this.border.lineTo(65, -8);
    this.border.lineTo(57, 0);
    this.border.lineTo(65, 0);
    this.border.endFill();
  }

  setAnimation(type) {
    if (type === 'move') {
      // this.ship.state.setAnimation(0, 'hyper_start', true);
      // this.ship.state.setAnimation(1, 'idle', true);
    }
  }

  setSelection() {
    this.selection = Sprite.from(shipBorder);
    this.selection.x = -70;
    this.selection.y = -22;
    this.selection.scale.x = 0.5;
    this.selection.scale.y = 0.5;
    this.container.addChildAt(this.selection, 0);
  }

  initPortfolio(upsideDown, visible) {
    // init icons and texts
    this.currencies = this.allocation
      .map((currency, i) =>
        currency
          ? {
              amount: new Text(`${currency}%`, {
                fontSize: 10,
                fill: 'white',
              }),
            }
          : null,
      )
      .filter(currency => currency);

    this.portfolioBorder = new PIXI.Graphics();
    this.portfolioBorder.lineStyle(1, 0x092d33, 0.6);
    this.portfolioBorder.beginFill(0x092d33, 0.6);
    const width = Math.min(this.currencies.length * 50, 210);
    const height = Math.ceil(this.currencies.length / 4) * 33;
    this.portfolioBorder.drawRect(0, 0, width, height);
    this.portfolioBorder.lineStyle(0, 0x092d33, 0.6);
    if (upsideDown) {
      this.portfolioBorder.moveTo(width / 2 + 8, height);
      this.portfolioBorder.lineTo(width / 2, height + 8);
      this.portfolioBorder.lineTo(width / 2 - 8, height);
      this.portfolioBorder.lineTo(width / 2, height);
    } else {
      this.portfolioBorder.moveTo(width / 2 + 8, 0);
      this.portfolioBorder.lineTo(width / 2, -8);
      this.portfolioBorder.lineTo(width / 2 - 8, 0);
      this.portfolioBorder.lineTo(width / 2, 0);
    }

    this.portfolio.x = -(this.portfolioBorder.width / 2);
    if (this.containerX + this.portfolio.x < 0) {
      this.portfolio.x += 0 - (this.containerX + this.portfolio.x);
    }
    this.portfolio.y = upsideDown ? -225 : 100;
    this.portfolio.addChild(this.portfolioBorder);
    this.currencies.forEach((currency, i) => {
      currency.icon.scale.x = 0.5;
      currency.icon.scale.y = 0.5;
      currency.icon.x = (i % 4) * 49 + this.portfolioBorder.x + 5;
      currency.icon.y = Math.floor(i / 4) * 30 + 10;
      currency.name.x = currency.icon.x + 20;
      currency.name.y = currency.icon.y - 2;
      currency.amount.x = currency.name.x;
      currency.amount.y = currency.name.y + 10;
      this.portfolio.addChild(currency.icon);
      this.portfolio.addChild(currency.name);
      this.portfolio.addChild(currency.amount);
    });
    // this.portfolio.scale = 2;
    this.portfolio.upsideDown = upsideDown;
    this.portfolio.visible = visible || false;
  }

  setPortfolio(y) {
    if (y + this.portfolio.height >= 450 && !this.portfolio.upsideDown) {
      this.portfolio.removeChild(this.portfolioBorder);
      this.initPortfolio(true, this.portfolio.visible);
      // this.portfolio.y = -222;
    } else if (y + this.portfolio.height < 450 && this.portfolio.upsideDown) {
      this.portfolio.removeChild(this.portfolioBorder);
      this.initPortfolio(false, this.portfolio.visible);
      // this.portfolio.y = 100;
    }
  }

  initContainer() {
    this.container = new Container();

    this.container.x = this.containerX;
    this.container.y = this.containerY;
    this.container.interactive = true;
    this.container.addChild(
      // this.border,
      this.ship,
      // this.profitText,
      this.info,
      this.portfolio,
    );
    const rect = this.container.getBounds();
    this.contBorder = new PIXI.Graphics();
    this.contBorder.lineStyle(1, 0x092d33, 0);
    this.contBorder.beginFill(0x092d33, 0);
    this.contBorder.drawRect(-rect.width / 2, 0, rect.width, rect.height + 10);
    this.container.addChild(this.contBorder);

    if (this.switcher) {
      this.container.addChild(this.switcher);
    }
    //
  }
}
