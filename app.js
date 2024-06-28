var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth-50;
canvas.height = window.innerHeight-100;

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

const initialY = canvas.height/2+200;
const initialX = canvas.width/2;

gen = 0;
cur_gen = document.querySelector(".gen");

class Dot {
    constructor(x,y, color="black", size=10) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;

        this.vel = 25;
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
            this.angle = this.brain.directions[this.step]; this.step++;
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
            this.dead = true;
        }
        // collision detection with goalDot
        var distanceGoal = ((GOAL_X-this.x)**2 + (GOAL_Y-this.y)**2)**0.5;

        if (distanceGoal < GOAL_SIZE/2){
            this.dead = true;
            this.reachedGoal = true;
        }

        if (this.step == 400) {
            this.dead = true;
        }
    }

    calculateFitness () {
        // Pythagoras 
        var distanceGoal = ((GOAL_X-this.x)**2 + (GOAL_Y-this.y)**2)**0.5;

        if (this.reachedGoal == true) {
            this.fitness = 1;
        }
        else{
        this.fitness = 1/distanceGoal**2;
    }

        // var distanceGoal = ((GOAL_X - this.x) ** 2 + (GOAL_Y - this.y) ** 2) ** 0.5;
        // this.fitness = distanceGoal === 0 ? 1 : 1 / distanceGoal;

        
    }

    gimmeBaby () {
        let baby = new Dot(canvas.width/2, canvas.height/2);
        baby.brain.directions = this.brain.cloneMe();

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
        // I was doing this earlier, which is wrong as this returns a deep copy, I need a shallow copy though
        // let clone = this.directions;
        return this.directions.slice(); // returns a shallow copy
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
        this.isBest = false;
        this.minStep = this.size;

        for(let i=0;i<size;i++) {
            this.dots[i] = new Dot(initialX, initialY);
            }
        }   

    moveDots() {
        for(let i =0; i<this.size;i++) {
            if (this.dots[i].brain.step > this.minStep) {
                this.dots[i].dead = true;
            }
            else{
            this.dots[i].move();
            }
        }
    }

    calculateFitness() {
        for(let i=0;i<this.size;i++) {
            this.dots[i].calculateFitness();
        }
    }

    allDotsDead() {
        let i =0;
        for (i = 0; i < this.size; i++) {
            if (!this.dots[i].dead) {
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

    }

    selectParent() {
        this.calculateFitnessSum();
        let rand = Math.random() * this.fitnessSum;
        let runningSum = 0;

        for (let i = 0; i < this.size; i++) {
            runningSum += this.dots[i].fitness;
            if (runningSum > rand) {
                return this.dots[i];
            }
        }

        // Code should never reach this point
        return null;
    }

    naturalSelection() {
        let newDots = [];

        // Putting the best dot directly into the next generation
        this.setBestDot();
        newDots[0] = this.dots[this.bestDot].gimmeBaby();
        Object.assign(newDots[0], {
            isBest: true,
            size: 30,
            color: "green",
        })
        for (let i = 1; i < this.size; i++) {
            // select parent
            let parent = this.selectParent();
            // clone them baby
            newDots.push(parent.gimmeBaby());
        }
        this.dots = newDots;
        cur_gen.innerText = `Generation: ${gen}`;
        gen++;
    }

    mutateDemBabies() {
        // need not to mutate the best dot
        for (let i=1;i<this.size;i++){
            this.dots[i].brain.mutate();
        }
    }

    setBestDot() {
        this.max = 0;
        let maxIndex = 0;

        for(let i=0;i<this.size;i++) {
            if(this.dots[i].fitness > this.max){
                this.max = this.dots[i].fitness;
                maxIndex = i;
            }
        }

        this.bestDot = maxIndex;

        if(this.dots[this.bestDot].reachedGoal) {
            this.minStep = this.dots[this.bestDot].brain.step;
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
    lastTime = currentTime- lastTime;

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


