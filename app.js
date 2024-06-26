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

class Dot {
    constructor(x,y, color="blue") {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = 10;

        this.vel = 10;
        this.acc = 3;

        this.dead = false;
        this.angle = Math.random() * 2 * PI; // Initial random direction

    }

    move() {

        if (!this.death()){
            // Randomize direction periodically
            if (Math.random() < 0.1) { // 10% chance to change direction each frame
                this.angle = Math.random() * 2 * PI;
            }

            // Update position based on velocity and direction
            this.x += Math.cos(this.angle) * this.vel;
            this.y += Math.sin(this.angle) * this.vel;

            // Clear canvas and draw dot at new position
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawDot();
            
        }
    }

    drawDot () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    death () {
        
        if (this.x < this.size || this.x > canvas.width - this.size || this.y < this.size || this.y > canvas.height - this.size) {
            return true;
        }
    }
}

var dot1 = new Dot(canvas.width/2,canvas.height/2);


function gameLoop() {
    requestAnimationFrame(gameLoop);

    currentTime = new Date().getTime();
    delta = currentTime - lastTime;

    if (delta > INTERVAL) {
        dot1.move();
    }
}

gameLoop();
