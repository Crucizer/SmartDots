var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth-50;
canvas.height = window.innerHeight-50;

var ctx = canvas.getContext('2d');
const PI = 3.14159;
const FPS = 30;
const INTERVAL = 1000/FPS; // time in milliseconds

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

        this.vel = 50;
        this.acc = 3;

        this.dead = false;
        this.angle = Math.random() * 2 * PI; // Initial random direction

        this.brain = new Brain(400);
        this.step = 0;

        this.reachedGoal = false;

    }

    move() {
        // checking if dead yet
        this.death();

        if (!this.dead){
            // Randomize direction periodically
            if (Math.random() < 0.1) { // 10% chance to change direction each frame
            this.angle = this.brain.directions[this.step];this.step++;
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
            this.reachedGoal = true;
        }
    }

    calculateFitness () {
        // Pythagoras 
        var distanceGoal = ((GOAL_X-this.x)**2 + (GOAL_Y-this.y)**2)**0.5;
        this.fitness = 1/distanceGoal**2;

        
    }

    gimmeBaby () {
        let baby = new Dot(canvas.width/2, canvas.height/2);
        baby.brain = this.brain;

        return baby;
    }
}

class Brain {

    constructor(size) {
        this.size = size;
        this.directions = [];
        for (let i=0;i<size;i++) {
            this.directions.push(Math.random() * 2 * PI);
        }
    }

    cloneMe () {
        let clone = this.directions;
        return clone;
    }

    mutate() {
        var mutationRate = 0.01;
        for (let i =0; i<this.size; i++) {
            if (Math.random() < mutationRate) {
                // set this direction as totally random
                this.directions[i] = Math.random()*2*PI;
            }
        }
    }
}

class Population {

    constructor(size){
        this.size = size;
        this.dots = [];
        this.initialX = canvas.width/2;
        this.initialY = canvas.height/2+200;

        this.gen = 0;

        for(let i=0;i<size;i++) {
            this.dots[i] = new Dot(this.initialX, this.initialY);
        }
    }

    moveDots() {
        for(let i =0; i<this.size;i++) {
            this.dots[i].move();
        }
    }

    calculateFitness() {
        for(let i=0;i<this.size;i++) {
            this.dots[i].calculateFitness();
        }
    }

    allDotsDead () {
        for(let i=0;i<this.size;i++) {
            if( this.dots[i].dead == false) {
                return false;
            }
        }
        return true;
    }

    calculateFitnessSum () {
        // only call this once all dots are dead

        this.fitnessSum = 0;
        for(let i=0;i<this.size;i++) {
            this.fitnessSum += this.dots[i].fitness;
        }

        return this.fitnessSum;
    }

    selectParent() {
        // if a dot has 2x fitness, then it should be twice as likely to get selected as the one with x fitness
        this.calculateFitnessSum();
        let rand = Math.random()*this.fitnessSum;
        let runningSum = 0;

        for (let i=0;i<this.size;i++) {
            if(runningSum > rand) {
                return this.dots[i];
            }
            else {
                runningSum += this.dots[i].fitness;
            }
        }

        // THE CODE SHOULD NOT REACH HERE, CHECK WHY IS THAT HAPPENING
        // In case the loop completes without returning, fall back to a default dot
        return this.dots[this.size - 1];
        
    }

    naturalSelection () {

        let newDots = [];
        for (let i=0;i<this.size;i++) {
            newDots.push(new Dot(canvas.width/2, canvas.height/2)) // next generation
        }
        this.calculateFitnessSum(); 

        for (let i=0;i<this.size;i++){
            // select Parent
            let parent = this.selectParent();

            // clone them babies
            newDots[i] = parent.gimmeBaby();
    }
        this.dots = newDots;
        this.gen++;

    }

    mutateDemBabies() {
        for (let i=0;i<this.size;i++){
            this.dots[i].brain.mutate();
        }
     }

}


var test = new Population(500);

// creating the special dot
var GoalDot = new Dot(canvas.width/2, GOAL_Y, color="red",size=GOAL_SIZE);

function gameLoop() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    GoalDot.drawDot();

    requestAnimationFrame(gameLoop);

    currentTime = new Date().getTime();
    delta = currentTime - lastTime;
    lastTime = currentTime - lastTime;

    if (delta > INTERVAL) {
        test.moveDots();
        delta = 0;
    }

    if (test.allDotsDead()) {
        
        // start genetic algorithm
        test.calculateFitness();
        test.naturalSelection();
        test.mutateDemBabies();
    }

}

gameLoop();


