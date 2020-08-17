import "core-js/stable";
import "regenerator-runtime/runtime";
import * as PIXI from 'pixi.js';
import Ship from './Ship';
// import leftBg from './assets/bg/left_min.png';
// import rightBg from './assets/bg/right_min.png';

document.body.style.cssText = `
  margin: 0;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

let ships = [];
let shipsMap = {};
let app;
let mobile = false;
let chosenPlayers = null;
let myShip = null;

let height = 0;
let width = 0;
let mainOffsetX = 0;
let mainOffsetY = 0;
let back = null;
// let front = null;
let left = null;
let right = null;
let idx = 0;

const SPEED = 10;

const KEYS = {
  left: 37,
  right: 39
}

const defaultEnemy = {
  username: 'eee',
  allocation: [],
  portfolioId: 9,
  y: -100,
  profit: 'e'
}

const players = [
  { ...defaultEnemy },
  { ...defaultEnemy },
  { ...defaultEnemy },
  {
    username: 'dsd',
    allocation: [],
    portfolioId: 9,
    profit: 'e',
    user: 'me'
  }
]

function moveBgSpace() {
  left.tilePosition.y += 0.75;
  right.tilePosition.y += 0.5;
  back.tilePosition.y += 0.25;
}

function createEnemy() {
  idx++;

  if (idx % 80) {
    players.push(defaultEnemy);
  }
}

const chooseNewPlayers = players => {
  const userIndex = players.findIndex(player => player.user === 'me');
  let newPlayers;
  if (userIndex > -1) {
    if (userIndex <= 2) {
      newPlayers = players.slice(0, 5);
      const element = newPlayers[userIndex];
      newPlayers.splice(userIndex, 1);
      newPlayers.splice(2, 0, element);
    } else if (userIndex >= players.length - 2) {
      newPlayers = players.slice(-5);
      const element = players[userIndex];
      newPlayers.splice(newPlayers.indexOf(element), 1);
      newPlayers.splice(2, 0, element);
    } else {
      newPlayers = players.slice(userIndex - 2, userIndex + 3);
    }
  } else {
    newPlayers = players.slice(0, 5);
  }
  return newPlayers;
};

function renderBg() {
  const backTexture = PIXI.Texture.fromImage('./assets/bg/back_layer.jpg');
  back = new PIXI.extras.TilingSprite(backTexture, 1209, 1160);
  back.position.x = 0;
  back.position.y = 0;

  const leftTexture = PIXI.Texture.fromImage('./assets/bg/left_min.png');
  left = new PIXI.extras.TilingSprite(leftTexture, 350, 1160);
  left.position.x = 0;
  left.position.y = 0;

  const rightTexture = PIXI.Texture.fromImage('./assets/bg/right_min.png');
  right = new PIXI.extras.TilingSprite(rightTexture, 600, 1160);
  right.position.x = app.view.width / 2 - 300;
  right.position.y = 0;
  app.stage.addChild(back, left, right);

  app.stage.addChild(back, left, right);
}


const initShips = async (up = true) => {
  height = app.view.height / 2;
  width = app.view.width / 2;

  mainOffsetX = width / (chosenPlayers.length + 1);
  mainOffsetY = height / 3;

  const promises = chosenPlayers.map(async player => {
    const { username, allocation, portfolioId, profit, y } = player;
    return {
      png: await import(`./assets/ship/skeleton.png`),
      atlas: await import(`./assets/ship/skeleton.js`),
      json: await import(`./assets/ship/skeleton.json`),
      username,
      allocation,
      portfolioId,
      profit,
      y,
    };
  });

  ships = (await Promise.all(promises)).map((data, index) => {
    const i = index + 1;
    const x = mobile ? -40 + mainOffsetX * i + 10 * i : -10 + mainOffsetX * i;
    let ship;
    if (chosenPlayers[index].user === 'me' && myShip) {
      ship = myShip;
    } else {
      ship = new Ship(
        data.json,
        data.atlas.default,
        data.png.default,
        x,
        up ? height : -200,
        data.username,
        data.allocation,
        mobile,
        { y: data.y }
      );
      app.stage.addChild(ship.container);
      if (chosenPlayers[index].user === 'me') {
        myShip = ship;
        ship.setSelection();
      } else {
        window.ship = ship
        ship.rotate(50.28)
      }
    }
    if (data.profit) {
      ship.setProfit(data.profit);
    }
    ship.container.mouseover = () => {
      ship.portfolio.visible = true;
      ship.profitText.visible = false;
      ship.border.visible = false;
      ship.usernameText.visible = false;
    };
    ship.container.mouseout = () => {
      ship.portfolio.visible = false;
      ship.profitText.visible = true;
      ship.border.visible = true;
      ship.usernameText.visible = true;
    };
    shipsMap[data.portfolioId] = ship;
    return ship;
  });
  await Promise.all(ships.map(ship => ship.moveToYWithAnimation(mainOffsetY)));
};

function movePlayer(ship) {
  document.addEventListener('keydown', (e) => {
    if (!myShip) return;
    if (e.keyCode === KEYS.left) {
      myShip.moveTo(-SPEED, 'x')
    }
    if (e.keyCode === KEYS.right) {
      myShip.moveTo(SPEED, 'x')
    }
  })
}

export default function init(players, config, isMobile) {
  shipsMap = {};
  ships = [];
  mobile = isMobile;

  const options = {
    transparent: true,
    clearBeforeRender: true,
    width: document.body.clientWidth,
    height: document.body.clientHeight,
  };
  if (mobile) {
    options.width = 800;
    options.height = 1200;
  }
  app = new PIXI.Application(options);
  document.body.appendChild(app.view);

  app.loader.load(onLoaded);

  app.stage.interactive = true;
  window.app = app
  
  function animate() {
    window.requestAnimationFrame(animate);
    PIXI.tweenManager.update();

  }
  animate();
  movePlayer();

  function onLoaded() {
    renderBg();
    app.ticker.add(moveBgSpace);

    chosenPlayers = chooseNewPlayers(players);
    initShips(config);
    // initShips(players, config);
  }

  // return destroy;
}

// window.addEventListener('resize', () => {
//   app.view.style.width = document.body.clientWidth;
//   app.view.style.height = document.body.clientHeight;
// })

init(players)
