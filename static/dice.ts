/****************** CHARACTER ATTRIBUTES ******************/

class Stats {
  strength: number;
  dexterity: number;
  intelligence: number;
  health: number;
  type: string;
  constructor(
    strength: number = 0,
    dexterity: number = 0,
    intelligence: number = 0,
    health: number = 0,
    type: string = "default"
  ) {
    this.strength = strength;
    this.dexterity = dexterity;
    this.intelligence = intelligence;
    this.health = health;
    this.type = type;
  }
}

class DretchStats extends Stats {
  constructor() {
    super(1, 0, 0, 10, "dretch");
  }
}

class TigerStats extends Stats {
  constructor() {
    super(3, 0, 0, 20, "tiger");
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
      attackRoll = Math.floor(Math.random() * 20 + 1) + this.strength;
      if (attackRoll > 10) {
        let damageRoll: number;
        damageRoll = Math.floor(Math.random() * 10 + 1);
        damageRoll += this.strength;
        console.log("You deal " + damageRoll + " damage!");
        let enemyHealth = (game.currentEnemy.stats.health -= damageRoll);
        if (enemyHealth <= 0) {
          console.log("You killed the " + game.currentEnemy.stats.type);
          game.currentEnemy.removeEnemyToken();
          game.currentEnemy.isDead = true;
          alert("You beat the enemy!");
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
        console.log("You miss!");
      }
      return 0;
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
        alert("It's not your turn!");
      }
      if (!this.isTurn && !game.currentEnemy.isDead) {
        dretch_Token.enemyBehavior();
      }
    });
  }
}

class enemyTokens {
  stats: Stats;
  constructor(enemyType: string) {
    switch (enemyType) {
      case "dretch":
        this.stats = new DretchStats();
        break;
      case "tiger":
        this.stats = new TigerStats();
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
        console.log(this.enemy_Type + " deals " + damageRoll + " damage!");
        return damageRoll;
      } else {
        console.log(this.enemy_Type + " misses!");
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

class Game {
  constructor() {}
  public currentEnemy: enemyTokens = dretch_Token;
  public createFight(counter: number) {
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
    this.currentEnemy = dretch_Token;
    alert("You come across a demon!");
    createGrid();
    player_Token.playerActions();
  }
  public secondFight() {
    this.currentEnemy = tiger_Token;
    this.currentEnemy.enemyPosition(10, 4);
    alert("You come across a tiger!");
  }
  public thirdFight() {}
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
