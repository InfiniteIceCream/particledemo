let dotProduct = function (a, b) {
  return a.dot(b);
};

let forceMultiplier = 1;
let nextMass;
let nextChargeDensity;
let particles = [];
const pi = Math.PI;

class Particle {
  constructor(x, y, mass, chargeDensity) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = mass;
    this.momentum = createVector(0, 0);
    this.diameter = sqrt(mass) * 10;
    this.chargeDensity = chargeDensity;
    this.charge = this.chargeDensity * this.mass;
    this.collisions = 0;
  }

  update() {
    // find net force from other particles
    let netForce = createVector(0, 0);
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      let sideA = p.position.x - this.position.x;
      let sideB = p.position.y - this.position.y;
      let hypotenuse = createVector(sideA, sideB);
      let dist = hypotenuse.mag();

      if (dist !== 0) {
        // only find force from particles in a different position
        let angle = hypotenuse.heading();
        let force = (-(this.charge * p.charge) / dist / 1000) * forceMultiplier; // positive force = pull, negative force = push
        let forceVector = createVector(force * cos(angle), force * sin(angle));

        // check for collision
        if (dist < (this.diameter + p.diameter) / 2) {
          let relativeVelocity = this.velocity.sub(p.velocity);
          this.velocity.add(p.velocity); // undo "this.velocity.sub(p.velocity)"
          let collisionSpeed = dotProduct(relativeVelocity, hypotenuse);

          if (collisionSpeed > 0) {
            // finalVelB  =  initVelA * massA / massB
            let collisionVelocity = p5.Vector.fromAngle(
              angle,
              collisionSpeed / 5,
            );
            let collisionVelocityB = collisionVelocity.copy();
            let colVelA = collisionVelocityB.div(this.mass * 2);
            let colVelB = collisionVelocity.div(p.mass * 2);
            this.velocity.sub(colVelA);
            p.velocity.add(colVelB);
          }
          this.collisions += 1;
          p.collisions += 1;
        } else {
          netForce.add(forceVector);
        }
      }
    }

    // bounce off of walls
    if (
      (this.position.x < 0 + this.diameter / 2 + 5 && this.velocity.x < 0) ||
      (this.position.x > width - this.diameter / 2 - 5 && this.velocity.x > 0)
    ) {
      this.velocity.x *= -1;
    }

    if (
      (this.position.y < 0 + this.diameter / 2 + 5 && this.velocity.y < 0) ||
      (this.position.y > height - 150 - this.diameter / 2 - 5 &&
        this.velocity.y > 0)
    ) {
      this.velocity.y *= -1;
    }

    this.acceleration = createVector(
      netForce.x / this.mass,
      netForce.y / this.mass,
    );
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.position.x = constrain(
      this.position.x,
      this.diameter / 2 + 4,
      width - this.diameter / 2 - 4,
    );
    this.position.y = constrain(
      this.position.y,
      this.diameter / 2 + 4,
      height - this.diameter / 2 - 150,
    );

    this.momentum = this.velocity.mult(this.mass);
    this.velocity.div(this.mass);
  }

  // display the particles
  display() {
    noStroke();
    fill(
      128 + this.chargeDensity,
      128 - this.chargeDensity,
      128 - this.chargeDensity,
    );
    ellipse(this.position.x, this.position.y, this.diameter, this.diameter);
    fill(0);
  }
}

function setup() {
  let myCanvas = createCanvas(1000, 600);

  // tests
  /*
let particleA = new Particle(200, 300, 10, 0)
particleA.velocity.x = 5
let particleB = new Particle(800, 300, 1, 0)
particleB.velocity.x = -5

particles.push(particleA)
particles.push(particleB)
*/
}

let massSliderX = 25;
let chargeSliderX = 25;
let draggingMassSlider = false;
let draggingChargeSlider = false;

let buttonPressed = false;

let showVelocity;
let showAcceleration = false;
let showForces;

let drawArrow = function (x, y, angle, length, endLength) {
  let v1 = p5.Vector.fromAngle(angle, length);
  let v2 = p5.Vector.fromAngle(angle - (pi * 3) / 4, endLength);
  let v3 = p5.Vector.fromAngle(angle + (pi * 3) / 4, endLength);
  let endpoint = createVector(x + v1.x, y + v1.y);
  line(x, y, endpoint.x, endpoint.y);
  line(endpoint.x, endpoint.y, endpoint.x + v2.x, endpoint.y + v2.y);
  line(endpoint.x, endpoint.y, endpoint.x + v3.x, endpoint.y + v3.y);
};

function draw() {
  background(240, 240, 240, 128);
  for (i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].display();
  }

  //  settings bar
  fill(192);
  stroke(0);
  strokeWeight(1);
  rect(-10, height - 150, width + 20, 160);

  // sliders
  stroke(0);
  fill(128);
  rect(20, 500, 150, 10, 10);
  rect(20, 550, 150, 10, 10);

  if (sqrt((mouseX - massSliderX) ** 2 + (mouseY - 505) ** 2) < 7.5) {
    fill(64);
    if (mouseIsPressed) {
      draggingMassSlider = true;
    }
  } else {
    fill(96);
  }
  ellipse(massSliderX, 505, 15, 15);

  if (draggingMassSlider) {
    massSliderX = constrain(mouseX, 25, 165);
    if (mouseIsPressed === false) {
      draggingMassSlider = false;
    }
  }

  if (sqrt((mouseX - chargeSliderX) ** 2 + (mouseY - 555) ** 2) < 7.5) {
    fill(64);
    if (mouseIsPressed) {
      draggingChargeSlider = true;
    }
  } else {
    fill(96);
  }
  ellipse(chargeSliderX, 555, 15, 15);

  if (draggingChargeSlider) {
    chargeSliderX = constrain(mouseX, 25, 165);
    if (mouseIsPressed === false) {
      draggingChargeSlider = false;
    }
  }

  ellipse(chargeSliderX, 555, 15, 15);

  nextMass = round(map(massSliderX, 25, 165, 1, 10));
  massSliderX = map(nextMass, 1, 10, 25, 165);
  nextChargeDensity = round(map(chargeSliderX, 25, 165, -128, 128));
  chargeSliderX = map(nextChargeDensity, -128, 128, 25, 165);

  noStroke();
  fill(0);
  text("Next mass: " + nextMass, 20, 490);
  text("Next charge: " + nextChargeDensity, 20, 540);

  // next particle display
  stroke(0);
  fill(255);
  rect(200, 500, 50, 50, 10);

  noStroke();
  fill(
    128 + nextChargeDensity,
    128 - nextChargeDensity,
    128 - nextChargeDensity,
  );
  ellipse(225, 525, sqrt(nextMass) * 10, sqrt(nextMass) * 10);

  stroke(128);
  strokeWeight(10);
  line(290, 470, 290, 580);

  // attraction/repulsion
  fill(160);
  strokeWeight(1);
  rect(330, 480, 140, 40, 20);
  rect(330, 530, 140, 40, 20);

  noStroke();
  fill(255, 0, 0);
  ellipse(350, 500, 20, 20);
  ellipse(450, 500, 20, 20);
  ellipse(350, 550, 20, 20);
  fill(0, 255, 255);
  ellipse(450, 550, 20, 20);

  let arrowDir = pi * (0.5 - 0.5 * forceMultiplier);
  stroke(0);
  strokeWeight(2);
  drawArrow(350, 500, arrowDir + pi, 40, 10);
  drawArrow(450, 500, arrowDir, 40, 10);
  drawArrow(350, 550, arrowDir, 40, 10);
  drawArrow(450, 550, arrowDir + pi, 40, 10);

  // FLIP button
  strokeWeight(4);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(15);
  if (sqrt((mouseX - 540) ** 2 + (mouseY - 525) ** 2) < 25) {
    if (mouseIsPressed) {
      buttonPressed = true;
      textSize(12);
      stroke(0, 48, 96);
      fill(0, 96, 192);
      ellipse(540, 525, 40, 40);
      fill(0, 48, 96);
    } else {
      if (buttonPressed) {
        forceMultiplier *= -1;
        buttonPressed = false;
      }
      stroke(0, 48, 96);
      fill(0, 96, 192);
      ellipse(540, 525, 50, 50);
      fill(0, 48, 96);
    }
  } else {
    stroke(0, 64, 128);
    fill(0, 128, 255);
    ellipse(540, 525, 50, 50);
    fill(0, 64, 128);
  }
  noStroke();
  text("FLIP", 540, 525);
  textAlign(LEFT, CENTER);
  textStyle(NORMAL);
  textSize(15);

  stroke(128);
  strokeWeight(10);
  line(600, 470, 600, 580);

  // information
  strokeWeight(1);
  stroke(128);
  fill(160);
  rect(650, 475, 300, 100, 20);

  noStroke();
  fill(0);
  text("Click to spawn particles", 670, 510);
  text("Press R to clear all particles", 670, 540);

  stroke(64);
  fill(0, 0, 0, 0);
  strokeWeight(8);
  rect(0, 0, width, height);

  // clear particles
  if (keyIsDown(82)) {
    particles = [];
  }
}

// create new particle on click
function mousePressed() {
  if (mouseY < 450) {
    particles.push(new Particle(mouseX, mouseY, nextMass, nextChargeDensity));
  }
}
