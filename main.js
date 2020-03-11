const people = [];
const houseOffset = 20;
let timeTillContagious = 500;
let transmissibility = 0.01;
let infectionRadius = 10;
let mortalityRate = 0.1;
let timeTillSymptoms = 1000;
let diseaseCourse = 2400;
let pop;
let dead;
let mort;
let mortLabel;
let transm;
let transmLabel;
let totalDuration;
let dLabel;
let timeContag;
let cLabel;
let timeSymp;
let sLabel;
let skull;
let infectedPeople = 0;
let peopleDead = 0;
let infectionStarted = false;

function preload() {
    skull = loadImage("skull.png");
}

function setup() {
    pop = document.getElementById("pop");
    dead = document.getElementById("dead");
    mort = document.getElementById("mortality");
    mortLabel = document.getElementById("mortLabel");
    transm = document.getElementById("transmissibility");
    transmLabel = document.getElementById("tLabel");
    totalDuration = document.getElementById("totalDuration");
    dLabel = document.getElementById("dLabel");
    timeContag = document.getElementById("timeContag");
    cLabel = document.getElementById("cLabel");
    timeSymp = document.getElementById("timeSymp");
    sLabel = document.getElementById("sLabel");
    createCanvas(600, 600);
    for (let i = 0; i < 25; i++) {
        let childAmt = round(random(1, 2));
        for (let j = 0; j < 4; j++) {
            if (j < childAmt) {
                people.push({
                    x: 60 * Math.floor(i / 5) + houseOffset,
                    y: 60 * (i % 5) + houseOffset,
                    household: { x: 60 * Math.floor(i / 5) + houseOffset, y: 60 * (i % 5) + houseOffset },
                    dest: { x: 225, y: 450 },
                    speed: random(0.5, 2),
                    child: true,
                    age: random(6, 18),
                    infected: false,
                    symptomatic: false,
                    infectedCount: 0,
                })
            } else {
                people.push({
                    x: 60 * Math.floor(i / 5) + houseOffset,
                    y: 60 * (i % 5) + houseOffset,
                    household: { x: 60 * Math.floor(i / 5) + houseOffset, y: 60 * (i % 5) + houseOffset },
                    dest: { x: 525, y: round(random(1, 4)) * 140 - 70 },
                    speed: random(0.5, 2),
                    child: false,
                    age: random(22, 80),
                    infected: false,
                    symptomatic: false,
                    infectedCount: 0
                })
            }
        }
    }
}
let step = 0;
let stage = 0;
const lengths = [1000, 400, 1000]
const skulls = [];
const logScale = num => {
    const minp = 0;
    const maxp = 100;
    const minv = Math.log(0.01);
    const maxv = Math.log(100);
    const scale = (maxv - minv) / (maxp - minp);
    return Math.exp(minv + scale * (num - minp))
}
let history = [];
let count = 0;
let genCount = 0;

function draw() {
    pop.innerHTML = `Population: ${people.length}`;
    dead.innerHTML = `Dead: ${skulls.length}`;
    mortLabel.innerHTML = mort.value + "%";
    mortalityRate = Number(mort.value) / 100;
    const multiplier = logScale(transm.value);
    transmLabel.innerHTML = multiplier.toFixed(2);
    transmissibility = 0.01 * multiplier;
    infectionRadius = Math.max(Math.min(10 * multiplier, 50), 10);
    dLabel.innerHTML = totalDuration.value + " hours";
    cLabel.innerHTML = timeContag.value + " hours";
    sLabel.innerHTML = timeSymp.value + " hours";
    timeTillSymptoms = timeSymp.value * 100;
    timeTillContagious = timeContag.value * 100;
    diseaseCourse = totalDuration.value * 100;
    background(0);
    fill(0);
    stroke(255);
    rect(25, 400, 400, 100);
    for (let i = 0; i < 5; i++) {
        rect(525 - 30, i * 140 - 70 - 30, 60, 60)
    }
    for (let i = 0; i < 25; i++) {
        rect(60 * Math.floor(i / 5) + houseOffset - 15, 60 * (i % 5) + houseOffset - 15, 30, 30);
    }
    skulls.forEach(({ x, y }) => {
        image(skull, x, y);
    })
    people.forEach((person, i) => {
        if (person.infected) {
            if (person.symptomatic) {
                fill(255, 0, 0);
            } else {
                fill(255, 125, 125)
            }
            person.infectedCount++;
            people.forEach(person2 => {
                if (dist(person.x, person.y, person2.x, person2.y) < infectionRadius) {
                    if (random(1) <= transmissibility && person.infectedCount > timeTillContagious && !person2.immune && !person2.infected) {
                        person2.infected = true;
                        infectedPeople++;
                    }
                }
            })
            if (person.infectedCount > timeTillSymptoms && step % 100 === 0) {
                person.symptomatic = true;
                person.tempTarget = {
                    x: person.household.x + random(-15, 15),
                    y: person.household.y + random(-15, 15)
                };
            }
            if (person.infectedCount > diseaseCourse) {
                if (random(1) < mortalityRate) {
                    people.splice(i, 1);
                    skulls.push({
                        x: person.x,
                        y: person.y
                    })
                    peopleDead += 1;
                    return;
                } else {
                    person.infected = false;
                    person.symptomatic = false;
                    person.immune = true;
                }
            }
        } else if (person.immune) {
            fill(0, 255, 0);
        } else {
            fill(255);
        }
        ellipse(person.x, person.y, 10, 10);
        if (step % 100 === 0 && stage === 0 && !person.symptomatic) {
            person.tempTarget = {
                x: person.dest.x + ((person.child) ? random(-200, 200) : random(-30, 30)),
                y: person.dest.y + ((person.child) ? random(-50, 50) : random(-30, 30))
            }
        }
        if (step % 100 === 0 && stage === 1 && !person.symptomatic) {
            person.tempTarget = {
                x: person.x + random(-100, 100),
                y: person.y + random(-100, 100)
            }
        }
        if (step % 100 === 0 && stage === 2) {
            if (step <= 500) {
                person.tempTarget = {
                    x: person.household.x + random(-15, 15),
                    y: person.household.y + random(-15, 15)
                }
            }
        }
        if (step === lengths[stage]) {
            stage++;
            step = 0;
        }
        if (stage === 3) {
            stage = 0;
        }
        const { tempTarget: dest } = person;
        const xDist = dest.x - person.x;
        const yDist = dest.y - person.y;
        let direction;
        if (xDist > 0 && yDist > 0) {
            direction = degrees(atan(yDist / xDist));
        } else if (xDist > 0 && yDist < 0) {
            direction = 360 + degrees(atan(yDist / xDist));
        } else {
            direction = 180 + degrees(atan(yDist / xDist));
        }
        if (Math.hypot(xDist, yDist) > 1) {
            person.x += person.speed * cos(radians(direction));
            person.y += person.speed * sin(radians(direction));
        }
    });
    if (step % 100 === 0 && infectionStarted && people.some(person => person.infected)) {
        history.push([count, infectedPeople, peopleDead, people.filter(person => person.infected).length])
        count++;
    }
    step++;
    genCount++;
}

function freezeInputs() {
    mort.setAttribute("disabled", true);
    transm.setAttribute("disabled", true);
    totalDuration.setAttribute("disabled", true);
    timeContag.setAttribute("disabled", true);
    timeSymp.setAttribute("disabled", true);
}

function mousePressed() {
    people.forEach(person => {
        if (dist(person.x, person.y, mouseX, mouseY) <= 5) {
            person.infected = true;
            freezeInputs();
            infectionStarted = true;
            infectedPeople++;
        }
    })
}
window.onload = () => {
    const ctx = document.getElementById("epidemic").getContext('2d');
    setInterval(() => {
        if (people.some(person => person.infected)) {
            new Chart(ctx, {
                "type": "line",
                "data": { "labels": history.map(x => x[0]), "datasets": [{ "label": "Total Cases", "data": history.map(x => x[1]), "fill": false, "borderColor": "rgb(75, 192, 192)", "lineTension": 0.1 }, { "label": "People Dead", "data": history.map(x => x[2]), "fill": false, "borderColor": "rgb(125, 0, 0)", "lineTension": 0.1 }, { "label": "People Infected", "data": history.map(x => x[3]), "fill": false, "borderColor": "rgb(255,0, 0)", "lineTension": 0.1 }] },
                "options": {
                    events: [],
                    animation: false
                }
            });
        }
    }, 1666);
    const instruct = document.getElementById("instruct")
    document.getElementById("instructions").onclick = () => {
        if (instruct.hasAttribute("hidden")) {
            instruct.removeAttribute("hidden")
        } else {
            instruct.setAttribute("hidden", "true")
        }
    }
}