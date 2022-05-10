const LIFE_PER_TICK = 1100 / 150;
const MAX_FLAKES = Math.min(10, (screen.width / 1280) * 20);
const flakes = [];
console.log(flakes);

const period = [
    (n) => 5 * Math.sin(n),
    (n) => 5 * Math.cos(n),
    (n) => 5 * (Math.sin(n) * Math.cos(2 * n)),
    (n) => 2 * (Math.sin(0.25 * n) - Math.cos(0.75 * n) + 1),
    (n) => 5 * (Math.sin(0.75 * n) + Math.cos(0.25 * n) - 1)
];

//Emojis to substitute for flowerflakes, just for fun
// const fun = ["🌸︎"];

//The CSS styles for the flowerflakes and container
const cssString = `.flowerfall-container {
    display: block;
    height: 100vh;
    left: 0;
    top: 0;
    position: fixed;
    margin: 0;
    padding: 0;
    width: 100%;
    z-index: 99999;
    -webkit-perspective-origin: top center;
     perspective-origin: top center;
    -webkit-perspective: 150px;
    perspective: 150px;
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d; 
    pointer-events: none;
    }

  .flowerflake {
    pointer-events: none;
    color: #e3b7be;
    opacity: 0.8;
    display: block;
    font-size: 24px;
    left: -12px;
    line-height: 24px;
    position: absolute;
    top: -12px;
    -webkit-transform-origin: center;
     transform-origin: center; 
     }`;

function ready(fn) {
    if (
        document.attachEvent
            ? document.readyState === "complete"
            : document.readyState !== "loading"
    ) {
        fn();
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

function resetFlake(flake) {

    let x = (flake.dataset.origX = Math.random() * 100);
    let y = (flake.dataset.origY = 0);
    let z = (flake.dataset.origZ =
        Math.random() < 0.1 ? Math.ceil(Math.random() * 100) + 25 : 0);

    let life = (flake.dataset.life = Math.ceil(Math.random() * 4000) + 6000); //Milliseconds
    flake.dataset.origLife = life; //Timestamps for flake creation
    flake.style.transform = `translate3d(${x}vw, ${y}vh, ${z}px)`;
    flake.style.opacity = 1.0;
    flake.dataset.periodFunction = Math.floor(Math.random() * period.length);

    if (Math.random() < 0.001) {
        flake.innerText = fun[Math.floor(Math.random() * fun.length)];
    }
}

function updatePositions() {

    flakes.forEach((flake) => {
        let origLife = parseFloat(flake.dataset.origLife);
        let curLife = parseFloat(flake.dataset.life);
        let dt = (origLife - curLife) / origLife;

        if (dt <= 1.0) {
            let p = period[parseInt(flake.dataset.periodFunction)];
            let x = p(dt * 2 * Math.PI) + parseFloat(flake.dataset.origX);
            let y = 100 * dt;
            let z = parseFloat(flake.dataset.origZ);
            flake.style.transform = `translate3d(${x}vw, ${y}vh, ${z}px)`;

            if (dt >= 0.5) {
                flake.style.opacity = 1.0 - (dt - 0.5) * 2;
            }

            curLife -= LIFE_PER_TICK;
            flake.dataset.life = curLife;
        } else {
            resetFlake(flake);
        }
    });

    window.requestAnimationFrame(updatePositions);
}

function appendflower() {

    let styles = document.createElement("style");
    styles.innerText = cssString;
    document.querySelector("head").appendChild(styles);

    let field = document.createElement("div");
    field.classList.add("flowerfall-container");
    field.setAttribute("aria-hidden", "true");
    field.setAttribute("role", "presentation");
    document.body.appendChild(field);

    let i = 0;

    const addFlake = () => {
        let flake = document.createElement("span");
        flake.classList.add("flowerflake");
        flake.setAttribute("aria-hidden", "true");
        flake.setAttribute("role", "presentation");
        flake.innerText = "✿";
        resetFlake(flake);
        flakes.push(flake);
        field.appendChild(flake);
        if (i++ <= MAX_FLAKES) {
            setTimeout(addFlake, Math.ceil(Math.random() * 300) + 100);
        }
    };
    addFlake();

    updatePositions();
}

ready(appendflower);
