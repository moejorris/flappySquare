//GLOBAL VARIABLES
var score = 0;
var player = null;
var gameSpeed = -1;
var obstacles = [];
var coins = [];
var jump = false;
var gameOver = false;

//SOUNDS
var jumpSound = new Audio("sfx_wing.wav");
var scoreSound = new Audio("sfx_point.wav");
var deathSound = new Audio("sfx_hit.wav");
var fallSound = new Audio("sfx_die.wav");

//INPUT DETECTION
window.addEventListener("mousedown", function() //listens for mouseclick. sets bool to true which is immediately set to false when velocity is added to player. Prevents holding click to continuously float up.
{
    if(player.speedY == 0)
    {
        game.startUpdate();
    }
    jump = true;
}
)

/////////////////////////////////////
//OBJECTS
/////////////////////////////////////

var game = {
    canvas: document.createElement("canvas"),
    bgColor: "DodgerBlue",
    start: function()
    {
        this.frameNo = 0;
        this.canvas.width = 960;
        this.canvas.height = 540;
        this.targetFPS = 60;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.shadowColor = "black";
        this.ctx.shadowBlur = 75;
        document.body.append(this.canvas);
        drawPreview();
    },

    startUpdate: function()
    {
        this.interval = setInterval(updateGame, 1000/this.targetFPS); //1000 divided by target FPS (ie 60) grants the ms between frames.
        drawObstacleAndCoin();
    },

    stop: function()
    {
        clearInterval(this.interval);
        gameOver = true;
        console.log("STOP!");
    },

    clear: function()
    {
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

//constructor function for game objects/actors
function component(width, height, color, x, y, useGravity)
{
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.gravityAccel = 0.1;
    this.usesGravity = useGravity;

    game.ctx.fillStyle = color;
    game.ctx.fillRect(this.x, this.y, this.width, this.height);

    this.update = function()
    {
        game.ctx.fillStyle = color;
        game.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    this.move = function()
    {
        if(this.usesGravity)
        {
            this.speedY += this.gravityAccel;
        }
        this.x += this.speedX;
        this.y += this.speedY;
    }

    this.collidesWith = function(otherObj)
    {
        //declare this sides
        var myLeft = this.x;
        var myRight = this.x + this.width;
        var myTop = this.y;
        var myBottom = this.y + this.height;
        
        //declare other sides
        var otherLeft = otherObj.x;
        var otherRight = otherObj.x + otherObj.width;
        var otherTop = otherObj.y;
        var otherBottom = otherObj.y + otherObj.height;

        //determine if colliding
        if((myRight < otherLeft) || (myLeft > otherRight) || (myBottom < otherTop) || (myTop > otherBottom))
        {
            return false;
        }
        return true;
    }
}

/////////////////////////////////////
//EVENT FUNCTIONS
/////////////////////////////////////

function startGame()
{
    console.log("page loaded");
    
    game.start(); //initalizes canvas but doesn't call before player clicks to start

    player = new component(30, 30, "red", 200, 200, true);    
}

function updateGame()
{
    if(gameOver == true) return;
    //clear the canvas;
    game.clear();

    game.frameNo += 1;
    
    if(game.frameNo % 180 == 0)
    {
        drawObstacleAndCoin();
    }

    updateObstacles();
    updateCoins();
    updatePlayer();
    updateScore();

    if(gameOver) //if this method is still running after the interval is cleared, redraw the scene without the score and then draw the game over panel after so game objects are not drawn over the panel.
    {
        game.clear();
        updateObstacles();
        updateCoins();
        updatePlayer();
        drawGameOver();
    }
}

/////////////////////////////////////
//CUSTOM FUNCTIONS
/////////////////////////////////////

function playJumpSound() //not my own idea to solving this problem, and I'm sure it's not great performance-wise because it reloads the sound everytime, but I did this so the jump sound can play over itself.
{ 
  var sfx = new Audio(src = "sfx_wing.wav");
  sfx.play();
}

function drawObstacleAndCoin()
{
    var safeSpace = 150; //safe space is the min and max (height - safe space) that the pipes can be. Without this pipes go off screen occasionally
    var gapTop = Math.floor(Math.random() * (game.canvas.height - safeSpace));
    var gapBottom = game.canvas.height - gapTop; //reverses the y value to tell ctx where to start drawing bottom pipe on the y axis
        
        
    if(gapTop < safeSpace) //Mathf.clamp isn't a thing here like it is in unity, so I manually clamp the values.
    {
        gapTop = safeSpace;
    }
    else if (gapBottom > game.canvas.height - safeSpace)
    {
        gapBottom = game.canvas.height - safeSpace;
    }

    //draws the top and bottom pipes and the coin in between them.
    obstacles.push(new component(25, gapTop - 75, "green", game.canvas.width, 0)); //draws top pipe
    obstacles.push(new component(25, gapBottom, "green", game.canvas.width, gapTop + 75)); //draws bottom pipe
    coins.push(new component(25, 25, "yellow", game.canvas.width, gapTop - 12.5)); //draws coin
}

function updateObstacles()
{
    for(var i = 0; i < obstacles.length; i++) //update obstacles and check for obstacle collision
    {
        obstacles[i].speedX = gameSpeed;
        obstacles[i].move();
        obstacles[i].update();
        if(player.collidesWith(obstacles[i])) //plays sound effect and stops the game on collision with player
        {
            deathSound.play();
            game.stop();
        }
        if(player.y < 0 - player.height && (player.x < obstacles[i].x + 30 && player.x > obstacles[i].x - 30)) //if player goes above screen, he can still game over (even if he isn't technically colliding with pipes) by checking x position
        {
            console.log("player hit pipe above screen");
            deathSound.play();
            game.stop();
        }
        if(obstacles[i].x < 0)
        {
            obstacles.splice(i, 1);
            
        }
    }
}

function updateCoins()
{
    for(var i = 0; i < coins.length; i++) //update coins and check for collision with player
    {
        coins[i].speedX = gameSpeed;
        coins[i].move();
        game.ctx.shadowColor = "yellow";
        game.ctx.shadowBlur = 25;
        coins[i].update();
        coins[i].update(); //drawn twice so glow (yellow shadow) is doubled. Probably a better way to do this, but it's how I did it for my poster/scene assignment.
        game.ctx.shadowBlur = 75;
        game.ctx.shadowColor = "black";
        if(player.collidesWith(coins[i])) //if player collects coin, add to score, play sound effect, and delete coin
        {
            scoreSound.play();
            coins.splice(i, 1);
            score += 1;
        }
    }
}

function updatePlayer()
{
    //check if player falls out of bounds
    if(player.y >= game.canvas.height) 
    {
        fallSound.play();
        game.stop();
    }

    //check if jump was pressed
    if(jump)
    {
        //play jump sound, add y velocity, and set jump input to false
        playJumpSound();
        player.speedY = -3;
        jump = false;
    }

    //make changes;
    player.move();

    //redraw/update components;
    player.update();
}

function updateScore()
{
    //draws the score text in the top left, and it's stroke
    var textX = 10;
    var textY = 36;
    var textSize = "36";
    var textFont = "Verdana";
    game.ctx.textAlign = "left";
    
    game.ctx.font = textSize + "px " + textFont;
    game.ctx.fillStyle = "white";
    game.ctx.fillText("Score: " + score, textX, textY);
    game.ctx.strokeStyle = "black";
    game.ctx.strokeText("Score: " + score, textX, textY);
    
}

function drawGameOver()
{
    //draws the game over panel, it's stroke, and the text on top
    var panelW = 700;
    var panelH = 300;
    var panelX = (game.canvas.width / 2) - (panelW / 2);
    var panelY = (game.canvas.height / 2) - (panelH / 2);
    var textSize = 72;
    var textX = panelX + (panelW / 2);
    var textFont = "Verdana";
    game.ctx.textAlign = "center";
    game.ctx.font = textSize + "px " + textFont;

    game.ctx.shadowBlur = 50;
    game.ctx.fillStyle = "black";
    game.ctx.fillRect(panelX, panelY, panelW, panelH);
    game.ctx.strokeStyle = "white";
    game.ctx.strokeRect(panelX, panelY, panelW, panelH);

    game.ctx.fillStyle = "white";
    game.ctx.fillText("GAME OVER!", textX, panelY + textSize, panelW);
    game.ctx.fillText("Score: " + score, textX, panelY + (textSize * 2) + 25, panelW);

    game.ctx.font = "32px " + textFont;
    
    game.ctx.fillText("Refresh the page to play again!", textX, panelY + (textSize * 3) + 25, panelW);
}

function drawPreview()
{
    game.clear();
    var textSize = 72;
    var textX = game.canvas.width/2;
    var textY = game.canvas.height/2;
    var textFont = "Verdana";
    game.ctx.textAlign = "center";
    game.ctx.font = textSize + "px " + textFont;
    game.ctx.fillStyle = "white";
    game.ctx.fillText("Click to start playing!", textX, textY + textSize, game.canvas.width);
    game.ctx.strokeText("Click to start playing!", textX, textY + textSize, game.canvas.width);

}