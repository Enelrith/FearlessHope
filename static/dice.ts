/****************** CHARACTER ATTRIBUTES ******************/

class Stats {
  strength: number;
  dexterity: number;
  intelligence: number;
  health: number;
  maxHealth: number;
  type: string;
  constructor(
    strength: number = 0,
    dexterity: number = 0,
    intelligence: number = 0,
    health: number = 0,
    maxHealth: number = health,
    type: string = "default"
  ) {
    this.strength = strength;
    this.dexterity = dexterity;
    this.intelligence = intelligence;
    this.health = health;
    this.maxHealth = health;
    this.type = type;
  }
}

class DretchStats extends Stats {
  constructor() {
    super(1, 0, 0, 10, 10, "dretch");
  }
}

class TigerStats extends Stats {
  constructor() {
    super(3, 0, 0, 20, 20, "tiger");
  }
}

/****************** TURNS ******************/

function manageTurn() {
  if (player_Token.isTurn == true) {
    player_Token.isTurn = false;
    game.currentEnemy.isTurn = true;
  } else {
    player_Token.isTurn = true;
    game.currentEnemy.isTurn = false;
  }
  console.log(player_Token.isTurn);
  console.log(game.currentEnemy.isTurn);
}

/****************** GRID & TOKENS ******************/
let infoContent = document.getElementById("infocontent");

function createGrid() {
  const grid = document.querySelector(".grid");
  for (let i = 1; i < 21; i++) {
    const y_coords: number = 21 - i;
    for (let j = 1; j < 21; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      const x_coords: number = j;
      cell.setAttribute("data-y", y_coords.toString());
      cell.setAttribute("data-x", x_coords.toString());
      if (grid) grid.appendChild(cell);
      cell.addEventListener("click", function () {
        player_Token.tokenMove(y_coords, x_coords);
      });
    }
  }
  player_Token.tokenPosition(10, 17);
  dretch_Token.enemyPosition(10, 4);
}

class playerTokens {
  constructor() {}
  strength: number = 3;
  dexterity: number = 1;
  initelligence: number = 1;
  health: number = 50;
  maxHealth: number = 50;
  isTurn: boolean = true;

  public old_x: number = 0;
  public old_y: number = 0;

  public tokenPosition(y_coords: number, x_coords: number) {
    const token_Image = document.createElement("img");
    token_Image.setAttribute("id", "player_Token");
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      if (cell instanceof HTMLElement) {
        const cell_x = parseInt(cell.dataset.x || "0");
        const cell_y = parseInt(cell.dataset.y || "0");
        if (cell_x === x_coords && cell_y === y_coords) {
          cell.appendChild(token_Image);
        }
      }
    });
    this.old_x = x_coords;
    this.old_y = y_coords;
  }

  public tokenMove(y_coords: number, x_coords: number) {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      if (cell instanceof HTMLElement) {
        const cell_x = parseInt(cell.dataset.x || "0");
        const cell_y = parseInt(cell.dataset.y || "0");
        if (cell_x === this.old_x && cell_y === this.old_y) {
          this.removePlayerToken();
        }
      }
    });

    this.tokenPosition(y_coords, x_coords);
  }

  public removePlayerToken() {
    const playerToken = document.getElementById("player_Token");
    if (playerToken) {
      playerToken.remove();
    }
  }

  public playerAttack(): number {
    let attackRoll: number;
    let inRange: boolean = false;
    let inRangeValues: { x: number; y: number }[] = [
      { x: this.old_x - 1, y: this.old_y },
      { x: this.old_x + 1, y: this.old_y },
      { x: this.old_x, y: this.old_y - 1 },
      { x: this.old_x, y: this.old_y + 1 },
      { x: this.old_x - 1, y: this.old_y - 1 },
      { x: this.old_x + 1, y: this.old_y - 1 },
      { x: this.old_x - 1, y: this.old_y + 1 },
      { x: this.old_x + 1, y: this.old_y + 1 },
    ];
    for (let i = 0; i < inRangeValues.length; i++) {
      const cell = document.querySelector(
        `[data-x="${inRangeValues[i].x}"][data-y="${inRangeValues[i].y}"]`
      );
      if (cell && cell.firstChild) {
        inRange = true;
        break;
      }
    }
    if (inRange) {
      attackRoll = Math.floor(Math.random() * 20 + 1) + this.strength;
      if (attackRoll > 10) {
        let damageRoll: number;
        damageRoll = Math.floor(Math.random() * 10 + 1);
        damageRoll += this.strength;
        if (infoContent instanceof HTMLElement) {
          infoContent.innerHTML += "You deal " + damageRoll + " damage!<br>";
        }
        let enemyHealth = (game.currentEnemy.stats.health -= damageRoll);
        if (enemyHealth <= 0) {
          if (infoContent instanceof HTMLElement) {
            infoContent.innerHTML +=
              "You killed the " + game.currentEnemy.enemy_Type + "!<br>";
          }
          game.currentEnemy.removeEnemyToken();
          game.currentEnemy.isDead = true;
          switch (game.currentEnemy.stats.type) {
            case "dretch":
              game.createFight(2);
              break;
            case "tiger":
              game.createFight(3);
              break;
          }
        }
        return damageRoll;
      } else {
        if (infoContent instanceof HTMLElement) {
          infoContent.innerHTML += "You miss!<br>";
        }
      }
      return 0;
    } else {
      if (infoContent instanceof HTMLElement) {
        infoContent.innerHTML += "No target in range!<br>";
      }
    }
    return 0;
  }

  public playerActions() {
    const attackBtn = document.createElement("button");
    attackBtn.innerHTML = "Attack";
    attackBtn.setAttribute("id", "attackBtn");
    document.body.appendChild(attackBtn);

    const endTurnBtn = document.createElement("button");
    endTurnBtn.innerHTML = "End Turn";
    endTurnBtn.setAttribute("id", "endTurnBtn");
    document.body.appendChild(endTurnBtn);

    attackBtn?.addEventListener("click", () => {
      this.playerAttack();
    });
    endTurnBtn?.addEventListener("click", () => {
      if (this.isTurn) {
        manageTurn();
      } else {
        if (infoContent instanceof HTMLElement) {
          infoContent.innerHTML += "It's not your turn!<br>";
        }
      }
      if (!this.isTurn && !game.currentEnemy.isDead) {
        dretch_Token.enemyBehavior();
      }
    });
    const healthBar = document.getElementById("healthBar");
    healthBar?.appendChild(attackBtn);
    healthBar?.appendChild(endTurnBtn);
  }
}

class enemyTokens {
  stats: Stats;
  constructor(enemyType: string) {
    switch (enemyType) {
      case "dretch":
        this.stats = new DretchStats();
        this.enemy_Type = "dretch";
        break;
      case "tiger":
        this.stats = new TigerStats();
        this.enemy_Type = "tiger";
        break;
      default:
        throw new Error("Unknown enemy type: " + enemyType);
    }
  }
  enemy_Type: string = "default";
  isTurn: boolean = false;
  isDead: boolean = false;
  old_x: number = 0;
  old_y: number = 0;
  public enemyPosition(y_coords: number, x_coords: number) {
    const token_Image = document.createElement("img");
    token_Image.setAttribute("id", "enemy");
    token_Image.setAttribute("type", this.stats.type);
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      if (cell instanceof HTMLElement) {
        const cell_x = parseInt(cell.dataset.x || "0");
        const cell_y = parseInt(cell.dataset.y || "0");
        if (cell_x === x_coords && cell_y === y_coords) {
          cell.appendChild(token_Image);
        }
      }
    });

    this.old_x = x_coords;
    this.old_y = y_coords;
  }

  public enemyMove() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      if (cell.firstChild && cell instanceof HTMLElement) {
        const child = cell.firstChild;
        if (child instanceof HTMLElement) {
          const child_Id = child.getAttribute("id");
          if (child_Id === "player_Token") {
            const child_cell_x = parseInt(cell.dataset.x || "0");
            const child_cell_y = parseInt(cell.dataset.y || "0");
            this.removeEnemyToken();
            this.enemyPosition(child_cell_y, child_cell_x - 1);
          }
        }
      }
    });
  }

  public removeEnemyToken() {
    const enemyToken = document.getElementById("enemy");
    if (enemyToken) {
      enemyToken.remove();
    }
  }

  public enemyAttack(): number {
    let attackRoll: number;
    let inRange: boolean = false;
    let inRangeValues: { x: number; y: number }[] = [
      { x: this.old_x - 1, y: this.old_y },
      { x: this.old_x + 1, y: this.old_y },
      { x: this.old_x + 1, y: this.old_y + 1 },
      { x: this.old_x, y: this.old_y - 1 },
      { x: this.old_x, y: this.old_y + 1 },
      { x: this.old_x - 1, y: this.old_y + 1 },
      { x: this.old_x + 1, y: this.old_y + 1 },
      { x: this.old_x - 1, y: this.old_y - 1 },
      { x: this.old_x + 1, y: this.old_y - 1 },
    ];
    for (let i = 0; i < inRangeValues.length; i++) {
      const cell = document.querySelector(
        `[data-x="${inRangeValues[i].x}"][data-y="${inRangeValues[i].y}"]`
      );
      if (cell && cell.firstChild) {
        inRange = true;
        break;
      }
    }
    if (inRange) {
      attackRoll = Math.floor(Math.random() * 20 + 1) + this.stats.strength;
      if (attackRoll > 10) {
        let damageRoll: number;
        damageRoll = Math.floor(Math.random() * 10 + 1);
        damageRoll += this.stats.strength;
        if (infoContent instanceof HTMLElement) {
          infoContent.innerHTML +=
            this.enemy_Type + " deals " + damageRoll + " damage!<br>";
        }
        player_Token.health -= damageRoll;
        let player_healthBar = document.getElementById("healthBar");
        let player_healthText = document.getElementById("healthText");
        if (
          player_healthBar instanceof HTMLElement &&
          player_healthText instanceof HTMLElement
        ) {
          let healthPercentage =
            (player_Token.health / player_Token.maxHealth) * 100;
          player_healthBar.style.width = healthPercentage + "%";
          player_healthText.innerHTML =
            player_Token.health +
            " / 50 (" +
            healthPercentage.toFixed(0) +
            "%)";
          if (player_Token.health <= 0) {
            if (infoContent instanceof HTMLElement) {
              infoContent.innerHTML += "You died!<br>";
              gameOver();
            }
          }
        }
        return damageRoll;
      } else {
        if (infoContent instanceof HTMLElement) {
          infoContent.innerHTML += this.enemy_Type + " misses!<br>";
        }
      }
      return 0;
    }

    return 0;
  }

  public enemyBehavior() {
    this.enemyMove();
    this.enemyAttack();
    manageTurn();
  }
}

let player_Token: playerTokens;
player_Token = new playerTokens();

let dretch_Token: enemyTokens;
dretch_Token = new enemyTokens("dretch");

let tiger_Token: enemyTokens;
tiger_Token = new enemyTokens("tiger");

/****************** SCENES ******************/

function setScene(scene_Selection: string): any {
  const scenes = document.getElementsByClassName("background-image");
  Array.from(scenes).forEach((scene) => {
    scene.setAttribute("style", "display:none");
  });
  const chosen_Scene = document.getElementById(scene_Selection);
  if (chosen_Scene) chosen_Scene.setAttribute("style", "display:block");
}
setScene("scene1");

/****************** GAME STATE ******************/
let restarted: boolean = false;
function gameOver() {
  let gameOverContainer = document.createElement("div");
  gameOverContainer.setAttribute("id", "gameOverContainer");
  let gameOverText = document.createElement("h1");
  gameOverText.innerHTML = "Game Over";
  gameOverContainer.appendChild(gameOverText);
  let gameOverBtn = document.createElement("button");
  gameOverBtn.innerHTML = "Restart";
  gameOverBtn.setAttribute("id", "gameOverBtn");
  gameOverBtn.addEventListener("click", () => restartBtn()); // Add the event listener here
  restarted = true;
  gameOverText.appendChild(gameOverBtn);
  document.body.appendChild(gameOverContainer);
}

function restartBtn() {
  let gameOverContainer = document.getElementById("gameOverContainer");
  if (gameOverContainer) {
    gameOverContainer.remove();
  }
  game.createFight(1);
}

class Game {
  constructor() {}
  public currentEnemy: enemyTokens = dretch_Token;
  public createFight(counter: number) {
    player_Token.health = player_Token.maxHealth;
    let player_healthBar = document.getElementById("healthBar");
    let player_healthText = document.getElementById("healthText");
    if (
      player_healthBar instanceof HTMLElement &&
      player_healthText instanceof HTMLElement
    ) {
      let healthPercentage =
        (player_Token.health / player_Token.maxHealth) * 100;
      player_healthBar.style.width = healthPercentage + "%";
      player_healthText.innerHTML =
        player_Token.health + " / 50 (" + healthPercentage.toFixed(0) + "%)";
    }
    switch (counter) {
      case 1:
        this.firstFight();
        break;
      case 2:
        this.secondFight();
        break;
      case 3:
        this.thirdFight;
        break;
    }
  }
  public firstFight() {
    alert("You come across a demon!");
    if (!restarted) {
      createGrid();
      player_Token.playerActions();
    }
    if (restarted) {
      this.currentEnemy.removeEnemyToken();
      this.currentEnemy.enemyPosition(10, 4);
      player_Token.tokenMove(10, 17);
      restarted = false;
    }
  }
  public secondFight() {
    this.currentEnemy = tiger_Token;
    alert("You come across a tiger!");
    this.currentEnemy.removeEnemyToken();
    this.currentEnemy.enemyPosition(10, 4);
    player_Token.tokenMove(10, 17);
  }
  public thirdFight() {
    player_Token.health = player_Token.maxHealth;
  }
}

/****************** GAME START ******************/
let game: Game;
game = new Game();
game.createFight(1);

/****************** EVENT LISTENERS ******************/
const gridBtn = document.getElementById("gridBtn");
gridBtn?.addEventListener("click", createGrid);
const sceneBtn1 = document.getElementById("setScene1");
sceneBtn1?.addEventListener("click", () => setScene("scene1"));
const sceneBtn2 = document.getElementById("setScene2");
sceneBtn2?.addEventListener("click", () => setScene("scene2"));
