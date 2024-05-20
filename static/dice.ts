/****************** CHARACTER ATTRIBUTES ******************/

class Stats {
  strength: number;
  intelligence: number;
  constitution: number;
  health: number;
  maxHealth: number;
  type: string;
  constructor(
    strength: number = 0,
    intelligence: number = 0,
    constitution: number = 0,
    health: number = 0,
    maxHealth: number = health,
    type: string = "default"
  ) {
    this.strength = strength;
    this.intelligence = intelligence;
    this.constitution = constitution;
    this.health = health + 5 * constitution;
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
    super(3, 0, 1, 20, 20, "tiger");
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
  const gridContainer =
    document.getElementById("gridcontainer") || new HTMLElement();
  gridContainer.classList.remove("hide");
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
  game.currentEnemy.enemyPosition(10, 4);
}

class playerTokens {
  constructor() {}
  strength: number = 0;
  intelligence: number = 0;
  constitution: number = 0;
  health: number = 20;
  maxHealth: number = 20;
  isTurn: boolean = true;

  public old_x: number = 0;
  public old_y: number = 0;
  public setPlayerStats() {}
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

  public playerAttack(type: string): number {
    let attackRoll: number = 0;
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
    let attackType: string[] = ["sword", "fireball"];
    for (let i = 0; i < inRangeValues.length; i++) {
      const cell = document.querySelector(
        `[data-x="${inRangeValues[i].x}"][data-y="${inRangeValues[i].y}"]`
      );
      if (cell && cell.firstChild) {
        inRange = true;
        break;
      }
    }
    if (type == attackType[0]) {
      attackRoll = Math.floor(Math.random() * 20 + 1) + this.strength;
    } else if (type == attackType[1]) {
      attackRoll = Math.floor(Math.random() * 20 + 1) + this.intelligence;
    }

    if (type == attackType[0] && !inRange) {
      if (infoContent instanceof HTMLElement) {
        infoContent.innerHTML += "No target in range!<br>";
      }
    } else if (
      (attackRoll <= 10 && type == attackType[0] && inRange) ||
      (attackRoll <= 10 && type == attackType[1])
    ) {
      if (infoContent instanceof HTMLElement) {
        infoContent.innerHTML += "You miss!<br>";
      }
    } else if (
      (attackRoll > 10 && type == attackType[0] && inRange) ||
      (attackRoll > 10 && type == attackType[1])
    ) {
      let damageRoll: number;
      damageRoll = Math.floor(Math.random() * 10 + 1);
      if (type == attackType[0]) damageRoll += this.strength;
      if (type == attackType[1]) damageRoll += this.intelligence;
      else if (type == attackType[1] && inRange)
        damageRoll += this.intelligence - 5;
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
    }
    return 0;
  }

  public playerActions() {
    const slashBtn = document.createElement("button");
    slashBtn.innerHTML = "Slash";
    slashBtn.setAttribute("id", "slashBtn");
    document.body.appendChild(slashBtn);
    const fireballBtn = document.createElement("button");
    fireballBtn.innerHTML = "Fireball";
    fireballBtn.setAttribute("id", "fireballBtn");
    document.body.appendChild(fireballBtn);
    fireballBtn?.addEventListener("click", () => {
      this.playerAttack("fireball");
      game.currentEnemy.enemyBehavior();
    });
    const endTurnBtn = document.createElement("button");
    endTurnBtn.innerHTML = "End Turn";
    endTurnBtn.setAttribute("id", "endTurnBtn");
    document.body.appendChild(endTurnBtn);

    slashBtn?.addEventListener("click", () => {
      this.playerAttack("sword");
      game.currentEnemy.enemyBehavior();
    });
    endTurnBtn?.addEventListener("click", () => {
      manageTurn();
      if (!this.isTurn && !game.currentEnemy.isDead) {
        game.currentEnemy.enemyBehavior();
      }
    });
    const healthBar = document.getElementById("healthBar");
    healthBar?.appendChild(slashBtn);
    healthBar?.appendChild(fireballBtn);
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
            " / " +
            player_Token.maxHealth +
            "(" +
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

function handleStoryText(scene: number) {
  switch (scene) {
    case 1:
      let storyText =
        document.getElementById("infocontent") || new HTMLElement();
      storyText.innerHTML += "You arrive in a forest...<br>";
      break;
    case 2:
      let storyText2 =
        document.getElementById("infocontent") || new HTMLElement();
      storyText2.innerHTML += "You encounter a tiger...<br>";
      break;
  }
}
let player_Token: playerTokens;
player_Token = new playerTokens();

let dretch_Token: enemyTokens;
dretch_Token = new enemyTokens("dretch");

class Game {
  constructor() {}

  public gameIntro() {
    let introContainer = document.createElement("div");
    introContainer.setAttribute("id", "introContainer");
    let introHeader = document.createElement("h1");
    introHeader.innerHTML = "Welcome to the Fearless Hope!";
    introHeader.setAttribute("id", "introHeader");
    let introText = document.createElement("p");
    introText.setAttribute("id", "introText");
    introText.innerHTML =
      "You are a wanderer that has stumbled in a forest. As you were walking you suddenly heard a screech that sent shivers down your spine. You look around and see a Dretch, a small demon, charging at you. You must defend yourself!<br> But before you can do that let's take a look at the type of adventurer you are...<br>";
    introContainer.appendChild(introHeader);
    introContainer.appendChild(introText);
    let introBtn = document.createElement("button");
    introBtn.setAttribute("id", "introBtn");
    introBtn.innerHTML = "Let's Go!";
    introBtn.addEventListener("click", () => {
      introContainer.remove();
      this.setStats();
    });
    introContainer.appendChild(introBtn);
    document.body.appendChild(introContainer);
  }

  public setStats() {
    let statsContainer = document.createElement("div");
    statsContainer.setAttribute("id", "statsContainer");
    let statsHeader = document.createElement("h1");
    statsHeader.innerHTML = "What type of adventurer are you?";
    statsHeader.setAttribute("id", "statsHeader");
    let statsText = document.createElement("div");
    let strengthInput = document.createElement("input");
    strengthInput.type = "number";
    strengthInput.value = player_Token.strength.toString();
    strengthInput.onkeydown = function (e) {
      return false;
    };
    strengthInput.min = "0";
    let intelligenceInput = document.createElement("input");
    intelligenceInput.type = "number";
    intelligenceInput.value = player_Token.intelligence.toString();
    strengthInput.onkeydown = function (e) {
      return false;
    };
    intelligenceInput.min = "0";

    let constitutionInput = document.createElement("input");
    constitutionInput.type = "number";
    constitutionInput.value = player_Token.constitution.toString();
    strengthInput.onkeydown = function (e) {
      return false;
    };
    constitutionInput.min = "0";

    let strWrapper = document.createElement("div");
    strWrapper.classList.add("statWrapper");
    strWrapper.appendChild(document.createTextNode("Strength: "));
    strWrapper.style.color = "black";
    strWrapper.appendChild(strengthInput);
    let strDesc = document.createElement("p");
    strDesc.innerHTML = "Increases sword damage";
    strDesc.style.color = "black";
    strWrapper.appendChild(strDesc);
    statsText.appendChild(strWrapper);

    let intWrapper = document.createElement("div");
    intWrapper.classList.add("statWrapper");
    intWrapper.appendChild(document.createTextNode("Intelligence: "));
    intWrapper.style.color = "black";
    intWrapper.appendChild(intelligenceInput);
    let intDesc = document.createElement("p");
    intDesc.innerHTML += "Increases fireball damage";
    intDesc.style.color = "black";
    intWrapper.appendChild(intDesc);
    statsText.appendChild(intWrapper);

    let conWrapper = document.createElement("div");
    conWrapper.classList.add("statWrapper");
    conWrapper.appendChild(document.createTextNode("Constitution: "));
    conWrapper.style.color = "black";
    conWrapper.appendChild(constitutionInput);
    let conDesc = document.createElement("p");
    conDesc.innerHTML += "Increases health";
    conDesc.style.color = "black";
    conWrapper.appendChild(conDesc);
    statsText.appendChild(conWrapper);

    statsContainer.appendChild(statsHeader);
    statsContainer.appendChild(statsText);
    document.body.appendChild(statsContainer);

    let statsBtn = document.createElement("button");
    statsBtn.innerHTML = "Start Game";
    statsBtn.setAttribute("id", "statsBtn");
    statsBtn.addEventListener("click", () => {
      player_Token.strength = parseInt(strengthInput.value);
      player_Token.intelligence = parseInt(intelligenceInput.value);
      player_Token.constitution = parseInt(constitutionInput.value);
      player_Token.health = 20 + 5 * player_Token.constitution;
      player_Token.maxHealth = player_Token.health;
      statsContainer.remove();
      console.log(player_Token.health);
      game.createFight(1);
    });
    statsContainer.appendChild(statsBtn);
  }

  public currentEnemy: enemyTokens = dretch_Token;
  public currentScene: HTMLElement =
    document.getElementById("gridcontainer") || new HTMLElement();
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
        player_Token.health +
        " / " +
        player_Token.maxHealth +
        "( " +
        healthPercentage.toFixed(0) +
        "%)";
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
    if (!restarted) {
      createGrid();
      let showInfo = document.getElementById("infoWrapper");
      showInfo?.classList.remove("hide");
      this.currentEnemy = dretch_Token;
      this.currentScene.classList.add("scene1");
      player_Token.playerActions();
      let scene: number = 1;
      handleStoryText(scene);
    }
    if (restarted) {
      this.currentEnemy.removeEnemyToken();
      this.currentEnemy.enemyPosition(10, 4);
      player_Token.tokenMove(10, 17);
      restarted = false;
    }
  }
  public secondFight() {
    player_Token.health = player_Token.maxHealth;
    let tiger_Token: enemyTokens;
    tiger_Token = new enemyTokens("tiger");
    this.currentEnemy = tiger_Token;
    this.currentScene.classList.remove("scene1");
    this.currentScene.classList.add("scene2");
    handleStoryText(2);
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
game.gameIntro();
