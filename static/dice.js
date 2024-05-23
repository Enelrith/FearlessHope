"use strict";
/****************** CHARACTER ATTRIBUTES ******************/
class Stats {
    constructor(strength = 0, intelligence = 0, constitution = 0, health = 0, maxHealth = health, type = "default") {
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
class OgreStats extends Stats {
    constructor() {
        super(3, 0, 1, 20, 20, "ogre");
    }
}
class QuasitStats extends Stats {
    constructor() {
        super(2, 0, 0, 15, 15, "quasit");
    }
}
class NecromancerStats extends Stats {
    constructor() {
        super(2, 3, 1, 20, 20, "necromancer");
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
let infoContent = document.getElementById("infocontent");
function createGrid() {
    const gridContainer = document.getElementById("gridcontainer") || new HTMLElement();
    gridContainer.classList.remove("hide");
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
    player_Token.tokenPosition(13, 19);
    game.currentEnemy.enemyPosition(7, 13);
}
class playerTokens {
    constructor() {
        this.strength = 0;
        this.intelligence = 0;
        this.constitution = 0;
        this.health = 20;
        this.maxHealth = 20;
        this.isTurn = true;
        this.old_x = 0;
        this.old_y = 0;
    }
    setPlayerStats() { }
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
    playerAttack(type) {
        let attackRoll = 0;
        let inRange = false;
        let inRangeValues = [
            { x: this.old_x - 1, y: this.old_y },
            { x: this.old_x + 1, y: this.old_y },
            { x: this.old_x, y: this.old_y - 1 },
            { x: this.old_x, y: this.old_y + 1 },
            { x: this.old_x - 1, y: this.old_y - 1 },
            { x: this.old_x + 1, y: this.old_y - 1 },
            { x: this.old_x - 1, y: this.old_y + 1 },
            { x: this.old_x + 1, y: this.old_y + 1 },
        ];
        let attackType = ["sword", "fireball"];
        for (let i = 0; i < inRangeValues.length; i++) {
            const cell = document.querySelector(`[data-x="${inRangeValues[i].x}"][data-y="${inRangeValues[i].y}"]`);
            if (cell && cell.firstChild) {
                inRange = true;
                break;
            }
        }
        if (type == attackType[0]) {
            attackRoll = Math.floor(Math.random() * 20 + 1) + this.strength;
        }
        else if (type == attackType[1]) {
            attackRoll = Math.floor(Math.random() * 20 + 1) + this.intelligence;
        }
        if (type == attackType[0] && !inRange) {
            if (infoContent instanceof HTMLElement) {
                infoContent.innerHTML += "No target in range!<br>";
            }
        }
        else if ((attackRoll <= 10 && type == attackType[0] && inRange) ||
            (attackRoll <= 10 && type == attackType[1])) {
            if (infoContent instanceof HTMLElement) {
                infoContent.innerHTML += "You miss!<br>";
            }
        }
        else if ((attackRoll > 10 && type == attackType[0] && inRange) ||
            (attackRoll > 10 && type == attackType[1])) {
            let damageRoll;
            damageRoll = Math.floor(Math.random() * 10 + 1);
            if (type == attackType[0])
                damageRoll += this.strength;
            if (type == attackType[1])
                damageRoll += this.intelligence;
            else if (type == attackType[1] && inRange)
                damageRoll += this.intelligence - 5;
            if (infoContent instanceof HTMLElement) {
                infoContent.innerHTML += "You deal " + damageRoll + " damage!<br>";
            }
            let enemyHealth = (game.currentEnemy.stats.health -= damageRoll);
            if (enemyHealth <= 0) {
                game.currentEnemy.isDead = true;
                if (infoContent instanceof HTMLElement) {
                    infoContent.innerHTML +=
                        "You killed the " + game.currentEnemy.enemy_Type + "!<br>";
                    game.currentEnemy.removeEnemyToken();
                }
                console.log(game.currentEnemy.stats.type);
                switch (game.currentEnemy.stats.type) {
                    case "dretch":
                        game.createFight(2);
                        break;
                    case "ogre":
                        game.createFight(3);
                        break;
                    case "quasit":
                        game.createFight(4);
                        break;
                    case "necromancer":
                        game.gameEpilogue();
                        break;
                }
            }
            return damageRoll;
        }
        return 0;
    }
    playerActions() {
        const slashBtn = document.createElement("button");
        slashBtn.innerHTML = "Slash";
        slashBtn.setAttribute("id", "slashBtn");
        document.body.appendChild(slashBtn);
        const fireballBtn = document.createElement("button");
        fireballBtn.innerHTML = "Fireball";
        fireballBtn.setAttribute("id", "fireballBtn");
        document.body.appendChild(fireballBtn);
        fireballBtn === null || fireballBtn === void 0 ? void 0 : fireballBtn.addEventListener("click", () => {
            this.playerAttack("fireball");
            if (!game.currentEnemy.isDead) {
                game.currentEnemy.enemyBehavior();
            }
        });
        const endTurnBtn = document.createElement("button");
        endTurnBtn.innerHTML = "End Turn";
        endTurnBtn.setAttribute("id", "endTurnBtn");
        document.body.appendChild(endTurnBtn);
        slashBtn === null || slashBtn === void 0 ? void 0 : slashBtn.addEventListener("click", () => {
            this.playerAttack("sword");
            if (!game.currentEnemy.isDead) {
                game.currentEnemy.enemyBehavior();
            }
        });
        endTurnBtn === null || endTurnBtn === void 0 ? void 0 : endTurnBtn.addEventListener("click", () => {
            manageTurn();
            if (!this.isTurn && !game.currentEnemy.isDead) {
                game.currentEnemy.enemyBehavior();
            }
        });
        const healthBar = document.getElementById("healthBar");
        healthBar === null || healthBar === void 0 ? void 0 : healthBar.appendChild(slashBtn);
        healthBar === null || healthBar === void 0 ? void 0 : healthBar.appendChild(fireballBtn);
        healthBar === null || healthBar === void 0 ? void 0 : healthBar.appendChild(endTurnBtn);
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
                this.enemy_Type = "dretch";
                break;
            case "ogre":
                this.stats = new OgreStats();
                this.enemy_Type = "ogre";
                break;
            case "quasit":
                this.stats = new QuasitStats();
                this.enemy_Type = "quasit";
                break;
            case "necromancer":
                this.stats = new NecromancerStats();
                this.enemy_Type = "necromancer";
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
                if (infoContent instanceof HTMLElement) {
                    infoContent.innerHTML +=
                        this.enemy_Type + " deals " + damageRoll + " damage!<br>";
                }
                player_Token.health -= damageRoll;
                let player_healthBar = document.getElementById("healthBar");
                let player_healthText = document.getElementById("healthText");
                if (player_healthBar instanceof HTMLElement &&
                    player_healthText instanceof HTMLElement) {
                    let healthPercentage = (player_Token.health / player_Token.maxHealth) * 100;
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
            }
            else {
                if (infoContent instanceof HTMLElement) {
                    infoContent.innerHTML += this.enemy_Type + " misses!<br>";
                }
            }
            return 0;
        }
        return 0;
    }
    enemyBehavior() {
        if (!game.currentEnemy.isDead) {
            this.enemyMove();
            this.enemyAttack();
            manageTurn();
        }
    }
}
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
let restarted = false;
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
function handleStoryText(scene) {
    switch (scene) {
        case 1:
            let storyText = document.getElementById("infocontent") || new HTMLElement();
            storyText.innerHTML +=
                "Suddenly a lesser demon starts attacking you out of nowhere!<br> What is it doing here? Demon aren't native to this realm..<br>";
            break;
        case 2:
            let storyText2 = document.getElementById("infocontent") || new HTMLElement();
            storyText2.innerHTML +=
                "You stumble across an abandoned cabin that is being guarded by an ogre<br> What could it be hiding?<br> You get a really bad feeling about that cabin..<br>";
            break;
        case 3:
            let storyText3 = document.getElementById("infocontent") || new HTMLElement();
            storyText3.innerHTML +=
                "You enter the abandoned cabin...<br> As you enter you feel a putrid smell coming from the basement...<br> Seemingly out of nowhere a demon lunges at you!<br>";
        case 4:
            let storyText4 = document.getElementById("infocontent") || new HTMLElement();
            storyText4.innerHTML +=
                "After defeating the demon you go down the basement.. <br> You encounter a necromancer that is summoning demons...<br> You must stop him!<br>";
        case 5:
            let storyText5 = document.getElementById("infocontent") || new HTMLElement();
            storyText5.innerHTML +=
                "You defeated the necromancer and the demons!<br> The forest is safe!<br> For now...<br>";
    }
}
let player_Token;
player_Token = new playerTokens();
let dretch_Token;
dretch_Token = new enemyTokens("dretch");
let ogre_Token;
ogre_Token = new enemyTokens("ogre");
let quasit_Token;
quasit_Token = new enemyTokens("quasit");
let necromancer_Token;
necromancer_Token = new enemyTokens("necromancer");
class Game {
    constructor() {
        this.currentEnemy = dretch_Token;
        this.currentScene = document.getElementById("gridcontainer") || new HTMLElement();
    }
    gameTutorial() {
        let tutorialContainer = document.createElement("div");
        tutorialContainer.setAttribute("id", "tutorialContainer");
        document.body.appendChild(tutorialContainer);
        let tutorialHeader = document.createElement("h1");
        tutorialHeader.innerHTML = "Fearless Hope Tutorial";
        let tutorialWrapper = document.createElement("div");
        tutorialWrapper.setAttribute("id", "tutorialWrapper");
        tutorialContainer.appendChild(tutorialWrapper);
        tutorialHeader.setAttribute("id", "tutorialHeader");
        tutorialWrapper.appendChild(tutorialHeader);
        let tutorialText = document.createElement("p");
        tutorialText.setAttribute("id", "tutorialText");
        tutorialText.innerHTML =
            "Welcome to Fearless Hope! This is a turn-based game where you will face different enemies.";
        tutorialHeader.appendChild(tutorialText);
        let gridContainer = document.getElementById("gridcontainer");
        gridContainer === null || gridContainer === void 0 ? void 0 : gridContainer.appendChild(tutorialContainer);
        let tutorialBtn = document.createElement("button");
        tutorialBtn.innerHTML = "Next";
        tutorialBtn.setAttribute("id", "tutorialBtn");
        let counter = 0;
        tutorialBtn.addEventListener("click", () => {
            switch (counter) {
                case 0:
                    tutorialText.innerHTML =
                        "You can move your character by clicking on the cells.";
                    counter++;
                    break;
                case 1:
                    tutorialText.innerHTML =
                        "You can attack by using the Slash and Fireball buttons. Fireball deals less damage if used in melee so it is better used as an opening attack. Attacking ends your turn. Using slash while not in melee range will result in a miss.";
                    counter++;
                    break;
                case 2:
                    tutorialText.innerHTML =
                        "You can end your turn without attacking by clicking the End Turn button. The enemy will then take its turn.";
                    counter++;
                    break;
                case 3:
                    tutorialText.innerHTML =
                        "Your health is displayed below the attack and end turn buttons. If it reaches 0, you lose. You can restart the game by clicking the Restart button. Restarting will place you back at the start of the fight you lost.";
                    tutorialBtn.innerHTML = "Start Game";
                    tutorialBtn.style.left = "18em";
                    counter++;
                    break;
                case 4:
                    tutorialContainer.remove();
                    player_Token.playerActions();
                    break;
            }
        });
        tutorialWrapper.appendChild(tutorialBtn);
    }
    gameIntro() {
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
    setStats() {
        let statpoints = 5;
        let statsContainer = document.createElement("div");
        statsContainer.setAttribute("id", "statsContainer");
        let statsHeader = document.createElement("h1");
        statsHeader.innerHTML = "What type of adventurer are you?";
        statsHeader.setAttribute("id", "statsHeader");
        let skillPoints = document.createElement("p");
        skillPoints.setAttribute("id", "skillPoints");
        skillPoints.innerHTML = "Skill Points: " + statpoints;
        statsHeader.appendChild(skillPoints);
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
        intelligenceInput.onkeydown = function (e) {
            return false;
        };
        intelligenceInput.min = "0";
        let constitutionInput = document.createElement("input");
        constitutionInput.type = "number";
        constitutionInput.value = player_Token.constitution.toString();
        constitutionInput.onkeydown = function (e) {
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
        let skillPointsDisplay = document.getElementById("skillPoints");
        strengthInput.addEventListener("change", () => {
            let previousStrValue = player_Token.strength;
            player_Token.strength = parseInt(strengthInput.value);
            if (player_Token.strength > previousStrValue) {
                if (statpoints > 0) {
                    statpoints--;
                    strengthInput.value = player_Token.strength.toString();
                }
                else {
                    player_Token.strength = previousStrValue;
                    strengthInput.value = previousStrValue.toString();
                }
            }
            else {
                statpoints++;
                strengthInput.value = player_Token.strength.toString();
            }
            console.log(statpoints);
            if (skillPointsDisplay)
                skillPointsDisplay.innerHTML = "Skill Points: " + statpoints;
        });
        intelligenceInput.addEventListener("change", () => {
            let previousIntValue = player_Token.intelligence;
            player_Token.intelligence = parseInt(intelligenceInput.value);
            if (player_Token.intelligence > previousIntValue) {
                if (statpoints > 0) {
                    statpoints--;
                    intelligenceInput.value = player_Token.intelligence.toString();
                }
                else {
                    player_Token.intelligence = previousIntValue;
                    intelligenceInput.value = previousIntValue.toString();
                }
            }
            else {
                statpoints++;
                intelligenceInput.value = player_Token.intelligence.toString();
            }
            console.log(statpoints);
            if (skillPointsDisplay)
                skillPointsDisplay.innerHTML = "Skill Points: " + statpoints;
        });
        constitutionInput.addEventListener("change", () => {
            let previousConValue = player_Token.constitution;
            player_Token.constitution = parseInt(constitutionInput.value);
            if (player_Token.constitution > previousConValue) {
                if (statpoints > 0) {
                    statpoints--;
                    constitutionInput.value = player_Token.constitution.toString();
                }
                else {
                    player_Token.constitution = previousConValue;
                    constitutionInput.value = previousConValue.toString();
                }
            }
            else {
                statpoints++;
                constitutionInput.value = player_Token.constitution.toString();
            }
            console.log(statpoints);
            if (skillPointsDisplay)
                skillPointsDisplay.innerHTML = "Skill Points: " + statpoints;
        });
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
    createFight(counter) {
        player_Token.health = player_Token.maxHealth;
        let player_healthBar = document.getElementById("healthBar");
        let player_healthText = document.getElementById("healthText");
        if (player_healthBar instanceof HTMLElement &&
            player_healthText instanceof HTMLElement) {
            let healthPercentage = (player_Token.health / player_Token.maxHealth) * 100;
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
                this.thirdFight();
                break;
            case 4:
                this.fourthFight();
                break;
            case 5:
                this.gameEpilogue();
                break;
        }
    }
    firstFight() {
        if (!restarted) {
            createGrid();
            game.gameTutorial();
            let showInfo = document.getElementById("infoWrapper");
            showInfo === null || showInfo === void 0 ? void 0 : showInfo.classList.remove("hide");
            this.currentEnemy = dretch_Token;
            this.currentScene.classList.add("scene1");
            let scene = 1;
            handleStoryText(scene);
        }
        if (restarted) {
            this.currentEnemy.removeEnemyToken();
            this.currentEnemy.enemyPosition(7, 13);
            player_Token.tokenMove(13, 19);
            restarted = false;
        }
    }
    secondFight() {
        if (!restarted) {
            this.currentScene.classList.remove("scene1");
            this.currentScene.classList.add("scene2");
            player_Token.health = player_Token.maxHealth;
            this.currentEnemy.removeEnemyToken();
            handleStoryText(2);
            this.currentEnemy = ogre_Token;
            this.currentEnemy.enemyPosition(17, 10);
            player_Token.tokenMove(10, 7);
        }
        if (restarted) {
            this.currentEnemy.removeEnemyToken();
            this.currentEnemy.enemyPosition(17, 10);
            player_Token.tokenMove(10, 7);
            restarted = false;
        }
    }
    thirdFight() {
        if (!restarted) {
            this.currentScene.classList.remove("scene2");
            this.currentScene.classList.add("scene3");
            player_Token.health = player_Token.maxHealth;
            this.currentEnemy.removeEnemyToken();
            handleStoryText(3);
            this.currentEnemy = quasit_Token;
            this.currentEnemy.enemyPosition(10, 4);
            player_Token.tokenMove(2, 5);
        }
        if (restarted) {
            this.currentEnemy.removeEnemyToken();
            this.currentEnemy.enemyPosition(10, 4);
            player_Token.tokenMove(2, 5);
            restarted = false;
        }
    }
    fourthFight() {
        if (!restarted) {
            this.currentScene.classList.remove("scene3");
            this.currentScene.classList.add("scene4");
            player_Token.health = player_Token.maxHealth;
            this.currentEnemy.removeEnemyToken();
            handleStoryText(4);
            this.currentEnemy = necromancer_Token;
            this.currentEnemy.enemyPosition(14, 13);
            player_Token.tokenMove(4, 18);
        }
        if (restarted) {
            this.currentEnemy.removeEnemyToken();
            this.currentEnemy.enemyPosition(14, 13);
            player_Token.tokenMove(4, 18);
            restarted = false;
        }
    }
    gameEpilogue() {
        player_Token.removePlayerToken();
        this.currentScene.classList.remove("scene4");
        this.currentScene.classList.add("scene5");
        handleStoryText(5);
    }
}
/****************** GAME START ******************/
let game;
game = new Game();
game.gameIntro();
