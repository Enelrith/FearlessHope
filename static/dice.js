"use strict";
/****************** CHARACTER ATTRIBUTES ******************/
class Stats {
    constructor(strength = 0, dexterity = 0, intelligence = 0, health = 0, type = "default") {
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
    }
    else {
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
        const y_coords = 21 - i;
        for (let j = 1; j < 21; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            const x_coords = j;
            cell.setAttribute("data-y", y_coords.toString());
            cell.setAttribute("data-x", x_coords.toString());
            if (grid)
                grid.appendChild(cell);
            cell.addEventListener("click", function () {
                player_Token.tokenMove(y_coords, x_coords);
            });
        }
    }
    player_Token.tokenPosition(10, 17);
    dretch_Token.enemyPosition(10, 4);
}
class playerTokens {
    constructor() {
        this.strength = 3;
        this.dexterity = 1;
        this.initelligence = 1;
        this.health = 50;
        this.isTurn = true;
        this.old_x = 0;
        this.old_y = 0;
    }
    tokenPosition(y_coords, x_coords) {
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
    tokenMove(y_coords, x_coords) {
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
    removePlayerToken() {
        const playerToken = document.getElementById("player_Token");
        if (playerToken) {
            playerToken.remove();
        }
    }
    playerAttack() {
        let attackRoll;
        let inRange = false;
        let inRangeValues = [
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
            const cell = document.querySelector(`[data-x="${inRangeValues[i].x}"][data-y="${inRangeValues[i].y}"]`);
            if (cell && cell.firstChild) {
                inRange = true;
                break;
            }
        }
        if (inRange) {
            attackRoll = Math.floor(Math.random() * 20 + 1) + this.strength;
            if (attackRoll > 10) {
                let damageRoll;
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
            }
            else {
                console.log("You miss!");
            }
            return 0;
        }
        return 0;
    }
    playerActions() {
        const attackBtn = document.createElement("button");
        attackBtn.innerHTML = "Attack";
        attackBtn.setAttribute("id", "attackBtn");
        document.body.appendChild(attackBtn);
        const endTurnBtn = document.createElement("button");
        endTurnBtn.innerHTML = "End Turn";
        endTurnBtn.setAttribute("id", "endTurnBtn");
        document.body.appendChild(endTurnBtn);
        attackBtn === null || attackBtn === void 0 ? void 0 : attackBtn.addEventListener("click", () => {
            this.playerAttack();
        });
        endTurnBtn === null || endTurnBtn === void 0 ? void 0 : endTurnBtn.addEventListener("click", () => {
            if (this.isTurn) {
                manageTurn();
            }
            else {
                alert("It's not your turn!");
            }
            if (!this.isTurn && !game.currentEnemy.isDead) {
                dretch_Token.enemyBehavior();
            }
        });
    }
}
class enemyTokens {
    constructor(enemyType) {
        this.enemy_Type = "default";
        this.isTurn = false;
        this.isDead = false;
        this.old_x = 0;
        this.old_y = 0;
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
    enemyPosition(y_coords, x_coords) {
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
    enemyMove() {
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
    removeEnemyToken() {
        const enemyToken = document.getElementById("enemy");
        if (enemyToken) {
            enemyToken.remove();
        }
    }
    enemyAttack() {
        let attackRoll;
        let inRange = false;
        let inRangeValues = [
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
            const cell = document.querySelector(`[data-x="${inRangeValues[i].x}"][data-y="${inRangeValues[i].y}"]`);
            if (cell && cell.firstChild) {
                inRange = true;
                break;
            }
        }
        if (inRange) {
            attackRoll = Math.floor(Math.random() * 20 + 1) + this.stats.strength;
            if (attackRoll > 10) {
                let damageRoll;
                damageRoll = Math.floor(Math.random() * 10 + 1);
                damageRoll += this.stats.strength;
                console.log(this.enemy_Type + " deals " + damageRoll + " damage!");
                return damageRoll;
            }
            else {
                console.log(this.enemy_Type + " misses!");
            }
            return 0;
        }
        return 0;
    }
    enemyBehavior() {
        this.enemyMove();
        this.enemyAttack();
        manageTurn();
    }
}
let player_Token;
player_Token = new playerTokens();
let dretch_Token;
dretch_Token = new enemyTokens("dretch");
let tiger_Token;
tiger_Token = new enemyTokens("tiger");
/****************** SCENES ******************/
function setScene(scene_Selection) {
    const scenes = document.getElementsByClassName("background-image");
    Array.from(scenes).forEach((scene) => {
        scene.setAttribute("style", "display:none");
    });
    const chosen_Scene = document.getElementById(scene_Selection);
    if (chosen_Scene)
        chosen_Scene.setAttribute("style", "display:block");
}
setScene("scene1");
/****************** GAME STATE ******************/
class Game {
    constructor() {
        this.currentEnemy = dretch_Token;
    }
    createFight(counter) {
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
    firstFight() {
        this.currentEnemy = dretch_Token;
        alert("You come across a demon!");
        createGrid();
        player_Token.playerActions();
    }
    secondFight() {
        this.currentEnemy = tiger_Token;
        this.currentEnemy.enemyPosition(10, 4);
        alert("You come across a tiger!");
    }
    thirdFight() { }
}
/****************** GAME START ******************/
let game;
game = new Game();
game.createFight(1);
/****************** EVENT LISTENERS ******************/
const gridBtn = document.getElementById("gridBtn");
gridBtn === null || gridBtn === void 0 ? void 0 : gridBtn.addEventListener("click", createGrid);
const sceneBtn1 = document.getElementById("setScene1");
sceneBtn1 === null || sceneBtn1 === void 0 ? void 0 : sceneBtn1.addEventListener("click", () => setScene("scene1"));
const sceneBtn2 = document.getElementById("setScene2");
sceneBtn2 === null || sceneBtn2 === void 0 ? void 0 : sceneBtn2.addEventListener("click", () => setScene("scene2"));
