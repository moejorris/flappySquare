//PATCH NOTES: 
// Added flappy bird sprite that animates (wings flap)
// Added flappy bird pipe graphics
// Added flappy bird scrolling background, but parrallaxed it for more depth. Resource heavy, but I wanted to see how far I could push the game. I wouldn't advise using my method because it is messy.
// removed (most) shadows
// added different coins. they are chosen using a random number generator. purple grant 50 points, orange grant 25 points, and regular coins grant 10 points. The higher points the lower chance to spawn.
// the more points the coin will grant, the closer the gap between the pipes will be to make it harder to score higher.
// added lives
// added invulnerability after taking a hit, the player can not lose a life for approx. 2 seconds after losing a life. The player flickers to indicate invulnerability.
// going out of bounds on the top of the screen results in losing a life.
// if player goes out of bounds on the top or bottom, they will be repositioned to the starting position.
//rewrote instructions and title

//TO DO (non-requirements that I would like to add if I continue to work on this game):
// figure out player rotation
// add ghost trail to player
// refine pipe gaps and pipe generation
// add high score saving




//GLOBAL VARIABLES
var score = 0;
var lives = 3;
var gameSpeed = 1; //the rate at which gravity is applied and the obstacles/coins move towards the player
var jump = false;
var gameOver = false;

//OBJECTS
var player = null;
var playerTrail = []; //FINISH IMPLEMENTATION
var backgObject = [];
var midgObject = [];
var foregObject = [];
var obstacles = [];
var coins = [];

//COIN PROPERTIES
var coinColors = ["yellow", "orange", "purple"];
var coinSize = [25, 15, 8];

//PLAYER VARIABLES
var invulnerability = 120; //number of frames invulnerability will last
var hitTimer = 0; //the current position of the invulnerability timer
var playerFrame = 0;


//IMAGES
var playerSprite = [new Image(), new Image(), new Image(), new Image()];
playerSprite[0].src = "player0.png"; //not sure why, but must be done in order for the player to appear on the preview screen

var background = [new Image(), new Image(), new Image(), new Image()];
background[0].src = "backg.png";
background[1].src = "midg.png";
background[2].src = "foreg.png";
background[3].src = "fullbg.png";

var shaftImg = new Image();
shaftImg.src = "pipe.png";
var pipeTop = new Image();
pipeTop.src = "pipeTop.png";
var pipeBot = new Image();
pipeBot.src = "pipeBot.png";

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
);

window.addEventListener("touchstart", function()
{
    if(player.speedY == 0)
    {
        game.startUpdate();
    }
    jump = true;
}
);

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
        this.ctx.shadowBlur = 0;
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
function component(width, height, color, x, y, useGravity, type, imageSrc, shadowBlur)
{
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.gravityAccel = 0.1;
    this.usesGravity = useGravity;
    this.imageSrc = imageSrc;
    this.shadowBlur = shadowBlur;

    game.ctx.shadowBlur = shadowBlur;
    if(type == "image")
    {
        if(imageSrc == "player")
        {
            
            game.ctx.drawImage(playerSprite[0], this.x, this.y);
            
        }
        else
        {
            game.ctx.drawImage(imageSrc, this.x, this.y);
        }
    }
    else
    {
        game.ctx.fillStyle = color;
        game.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.update = function()
    {
        game.ctx.shadowBlur = shadowBlur;
        if(type == "image")
        {
            if(imageSrc == "player")
            {
                game.ctx.drawImage(playerSprite[playerFrame], this.x, this.y);
            }
            else
            {
                game.ctx.drawImage(imageSrc, this.x, this.y, width, height);
            }
        }
        else
        {
            game.ctx.fillStyle = color;
            game.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    this.move = function()
    {
        if(this.usesGravity)
        {
            this.speedY += this.gravityAccel * gameSpeed;
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
    assignPlayerSprites();
    
    game.start(); //initalizes canvas but doesn't call before player clicks to start

    player = new component(34, 24, "white", 200, 200, true, "image", "player", 0);
    
}

function updateGame()
{
    if(gameOver == true) return;
    //clear the canvas;
    //game.clear();
    drawBGlayers();

    game.frameNo += 1;
    
    if(game.frameNo % (180/gameSpeed) == 0)
    {
        drawObstacleAndCoin();
    }


    updateObstacles();
    updateCoins();
    playerAnim();
    updateHitTimer();
    updatePlayer();
    updateHUD();

    if(gameOver) //if this method is still running after the interval is cleared, redraw the scene without the score and then draw the game over panel after so game objects are not drawn over the panel.
    {
        drawBGlayers();
        updateObstacles();
        updateCoins();
        updatePlayer();
        drawGameOver();
    }
}

/////////////////////////////////////
//CUSTOM FUNCTIONS
/////////////////////////////////////

function drawBGlayers() //draws the background (clouds), midground (buildings), and foreground (grass) in order to create a parallax effect. RESOURCE HEAVY, WOULD NOT RECOMMEND FOR AN ACTUAL RELEASE
{ //all the elements move at different speeds to give the illusion of parrallax, so they all must be handled separately.
    drawBG();
    drawMG();
    drawFG();
}

function drawBG()
{
    if(backgObject[0] == null)
    {
        backgObject.push(new component(1164, 540, "white", 0, 0, false, "image", background[0], 0));
        
        //console.log("drew first bg");
    }

    for(var i = 0; i < backgObject.length; i++)
    {
        backgObject[i].speedX = -gameSpeed / 5;
        backgObject[i].move();
        backgObject[i].update();
    }

    if(backgObject[0].x <= game.canvas.width - backgObject[0].width && backgObject.length == 1) //checks if new bg needs to be spawned
    {
        backgObject.push(new component(1164, 540, "white", game.canvas.width, 0, false, "image", background[0], 0));
        //console.log("new bg element spawned")
    }

    if(backgObject.length > 1 && backgObject[0].x <= -(backgObject[0].width))
    {
        backgObject.splice(0, 1);
        //console.log("deleted 1 excess background");
    }
}

function drawMG()
{
    if(midgObject[0] == null)
    {
        midgObject.push(new component(1164, 540, "white", 0, 0, false, "image", background[1], 0));
        
        //console.log("drew first mg");
    }

    for(var i = 0; i < midgObject.length; i++)
    {
        midgObject[i].speedX = -gameSpeed / 3;
        midgObject[i].move();
        midgObject[i].update();
    }

    if(midgObject[0].x <= game.canvas.width - midgObject[0].width && midgObject.length == 1) //checks if new bg needs to be spawned
    {
        midgObject.push(new component(1164, 540, "white", game.canvas.width, 0, false, "image", background[1], 0));
        //console.log("new mg element spawned")
    }

    if(midgObject.length > 1 && midgObject[0].x <= -(midgObject[0].width))
    {
        midgObject.splice(0, 1);
        //console.log("deleted 1 excess midground");
    }
}

function drawFG()
{
    if(foregObject[0] == null)
    {
        foregObject.push(new component(1164, 540, "white", 0, 0, false, "image", background[2], 0));
        
        console.log("drew first fg");
    }

    for(var i = 0; i < foregObject.length; i++)
    {
        foregObject[i].speedX = -gameSpeed / 2;
        foregObject[i].move();
        foregObject[i].update();
    }

    if(foregObject[0].x <= game.canvas.width - foregObject[0].width && foregObject.length == 1) //checks if new bg needs to be spawned
    {
        foregObject.push(new component(1164, 540, "white", game.canvas.width, 0, false, "image", background[2], 0));
        console.log("new fg element spawned")
    }

    if(foregObject.length > 1 && foregObject[0].x <= -(foregObject[0].width))
    {
        foregObject.splice(0, 1);
        //console.log("deleted 1 excess foreground");
    }
}

function respawnPlayer()
{
    player.y = 200;
    player.speedY = 0;
}

function takeDamage(outOfBounds) //decides if game over or player should lose a life
{
    if(hitTimer) //if player is already invincible, decide if they need to be repositioned and then ignore the rest
    {
        if(outOfBounds) respawnPlayer();
        return;
    }

    if(outOfBounds) //play correct sound based on damage taken
    {
        fallSound.play();
    }
    else
    {
        deathSound.play();
    }

    if(lives > 1) //decide if player should lose a life or receive a game over
    {
        if(outOfBounds) respawnPlayer();
        hitTimer = invulnerability;
        lives--;
    }
    else
    {
        console.log(lives);
        game.stop();
    }
}

function updateHitTimer()
{
    var godMode = false; //for testing purposes. makes player invincible when set to true
    if(hitTimer > 0) hitTimer--;
    if(godMode && hitTimer == 0) hitTimer = invulnerability;
}

function assignPlayerSprites()
{
    for(var i = 0; i < playerSprite.length; i++)
    {
        playerSprite[i].src = "player" + i + ".png";
    }
}

function playerAnim()
{
    if(game.frameNo % 10 == 0)
    {
        playerFrame++;
        playerFrame = playerFrame >= playerSprite.length ? 0 : playerFrame;
    }
}

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

    var coinColorIndex = 0
    var randomNum = Math.floor(Math.random()*100); //decides which color coin to spawn corresponding to array coinColors. Also decides how much closer to make the gap between the pipes.
    if(randomNum > 65) 
    {
        coinColorIndex = 1;

        if(randomNum > 90)
        {
            coinColorIndex = 2;
        }
    }
    else
    {
        coinColorIndex = 0;
    }
    
    coinColorIndex++; //adds one so values are 1, 2 and 3 to multiply by 5, rather than 0, 1, and 2. However, if 1 is chosen aka a regular coin is spawned, the gap will not be affected.
    var gapAffector = coinColorIndex > 1 ? (5 * coinColorIndex) : 0;
    coinColorIndex--; //subtracts one to stay true to coinColors possible index values.
        
    if(gapTop < safeSpace) //Mathf.clamp isn't a thing here like it is in unity, so I manually clamp the values.
    {
        gapTop = safeSpace;
    }
    else if (gapBottom > game.canvas.height - safeSpace)
    {
        gapBottom = game.canvas.height - safeSpace;
    }

    //draws the top and bottom pipes, their headers, and the coin in between them.
    obstacles.push(new component(48, gapTop - 62.5 + gapAffector, "green", game.canvas.width, 0, false, "image", shaftImg)); //draws top pipe
    obstacles.push(new component(48, gapBottom, "green", game.canvas.width, gapTop + 62.5 - gapAffector, false, "image", shaftImg)); //draws bottom pipe

    obstacles.push(new component(52, 24, "green", game.canvas.width - 2, gapTop - 62.5 - 24 + gapAffector, false, "image", pipeTop));//draws top pipe header
    obstacles.push(new component(52, 24, "green", game.canvas.width - 2, gapTop + 62.5 - 24 - gapAffector, false, "image", pipeBot));//draws bottom pipe header


    console.log(randomNum);


    coins.push(new component(coinSize[coinColorIndex], coinSize[coinColorIndex], coinColors[coinColorIndex], game.canvas.width + 24 - (coinSize[coinColorIndex]/2), gapTop - (coinSize[coinColorIndex]/2) - 12)); //draws coin
}

function updateObstacles()
{
    for(var i = 0; i < obstacles.length; i++) //update obstacles and check for obstacle collision
    {
        obstacles[i].speedX = -gameSpeed;
        obstacles[i].move();


        if(obstacles[i].x < 0 - obstacles[i].width) //check if obstacle is off screen
        {
            obstacles.splice(i, 1);
            i--; //must be done otherwise the next object in the array's update is skipped for a frame.
            continue; //skips the rest to avoid null references
        }
        
        if(player.collidesWith(obstacles[i])) //plays sound effect and stops the game on collision with player
        {
            takeDamage(false);
        }
        if(player.y < 0 - player.height*2) // && (player.x < obstacles[i].x + 30 && player.x > obstacles[i].x - 30)) //if player goes above screen, resposition the player and lose a life.
        {
            console.log("player hit pipe above screen");
            takeDamage(true);
        }
        

        obstacles[i].update();


    }
}

function updateCoins()
{
    for(var i = 0; i < coins.length; i++) //update coins and check for collision with player
    {
        coins[i].speedX = -gameSpeed;
        coins[i].move();
        game.ctx.shadowColor = coins[i].color;
        game.ctx.shadowBlur = 25;
        coins[i].update();
        coins[i].update(); //drawn twice so glow (coins color shadow) is doubled. Probably a better way to do this, but it's how I did it for my poster/scene assignment.
        game.ctx.shadowBlur = 75;
        game.ctx.shadowColor = "black";
        if(player.collidesWith(coins[i])) //if player collects coin, add to score, play sound effect, and delete coin
        {
            scoreSound.play();

            if(coins[i].color == coinColors[2]) //decide how many points to give based on color of coin
            {
                score += 50;
            }
            else if(coins[i].color == coinColors[1])
            {
                score += 25;
            }
            else
            {
                score += 10;
            }

            coins.splice(i, 1);
            i--; //must be done otherwise the next object in the array is skipped for one frame.
            
        }
    }
}

function updatePlayer()
{
    //check if player falls out of bounds
    if(player.y >= game.canvas.height) 
    {
        takeDamage(true);
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
    if(hitTimer == 0 || hitTimer % 2 == 0) //during invulnerability player is only drawn every other frame
    {
        player.update();
    }
}

function drawText(string, fontSize, font, color, stroke, strokeColor, x, y, shadowBlur)
{
    game.ctx.textAlign = "left";
    game.ctx.font = fontSize +"px " + font;
    game.ctx.fillStyle = color;
    game.ctx.strokeStyle = strokeColor;
    game.ctx.shadowColor = "black";
    game.ctx.shadowBlur = shadowBlur;

    game.ctx.fillText(string, x, y);

    if(stroke == true)
    {
        game.ctx.strokeText(string, x, y);
    }
}

function updateHUD()
{
    drawText("Score: " + score, 36, "Verdana", "white", true, "black", 10, 36, 0);
    drawText("Lives: " + lives, 36, "Verdana", "white", true, "black", 10, 72, 0);
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
    game.ctx.drawImage(background[3], 0, 0);
    var textSize = 72;
    var textX = game.canvas.width/2;
    var textY = game.canvas.height/2;
    var textFont = "Verdana";
    game.ctx.textAlign = "center";
    game.ctx.font = textSize + "px " + textFont;
    game.ctx.fillStyle = "white";
    game.ctx.fillText("Click to start playing!", textX, textY + textSize, game.canvas.width);
    game.ctx.strokeText("Click to start playing!", textX, textY + textSize, game.canvas.width);
    console.log(playerSprite[0].src);

}