var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth-50;
canvas.height = window.innerHeight-50;

var ctx = canvas.getContext('2d');
const PI = 3.14159;
const FPS = 30;
const INTERVAL = FPS/1000; // time in milliseconds

let lastTime = new Date().getTime();
let currentTime = 0;
let delta = 0;

const GOAL_Y = 30;
const GOAL_X = canvas.width/2;
const GOAL_SIZE = 20;

class Dot {
    constructor(x,y, color="black", size=10) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;

        this.vel = 10;
        this.acc = 3;

        this.dead = false;
        this.angle = Math.random() * 2 * PI; // Initial random direction

    }

    move() {
        // checking if dead yet
        this.death();

        if (!this.dead){
            // Randomize direction periodically
            if (Math.random() < 0.1) { // 10% chance to change direction each frame
                this.angle = Math.random() * 2 * PI;
            }

            // Update position based on velocity and direction
            this.x += Math.cos(this.angle) * this.vel;
            this.y += Math.sin(this.angle) * this.vel;
            
        }
        this.drawDot();

    }

    drawDot () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    death () {
        
        // Collision detection with the boundaries
        if (this.x < this.size || this.x > canvas.width - this.size || this.y < this.size || this.y > canvas.height - this.size) {
            // return true;
            this.dead = true;
        }

        // collision detection with goalDot
        var distanceGoal = ((GOAL_X-this.x)**2 + (GOAL_Y-this.y)**2)**0.5;
        if (distanceGoal < GOAL_SIZE/2){
            // return true;
            this.dead = true;
        }
    }

    fitness () {
        // Pythagoras 
        var distanceGoal = ((GOAL_X-this.x)**2 + (GOAL_Y-this.y)**2)**0.5;
        this.fitness = 1/distanceGoal**2;

        
    }
}

class Population {

    constructor(size){
        this.size = size;
        this.dots = [];
        this.initialX = canvas.width/2;
        this.initialY = canvas.height/2-200;

        for(let i=0;i<size;i++) {
            this.dots[i] = new Dot(this.initialX, this.initialY);
        }
    }

    moveDots() {
        for(let i =0; i<this.size;i++) {
            this.dots[i].move();
        }
    }

}

var newPop = new Population(100);

// creating the special dot

var GoalDot = new Dot(canvas.width/2, GOAL_Y, color="red",size=GOAL_SIZE);

function gameLoop() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    GoalDot.drawDot();

    requestAnimationFrame(gameLoop);

    currentTime = new Date().getTime();
    delta = currentTime - lastTime;

    if (delta > INTERVAL) {
        newPop.moveDots();
    }

}

gameLoop();


