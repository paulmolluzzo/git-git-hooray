'use strict';

const isPullRequest = () => /^\/[^/]+\/[^/]+/.test(location.pathname) && /^\/pull\/\d+/.test(location.pathname.replace(/^\/[^/]+\/[^/]+/, ''));
const numberOfSprinkles = 100;
const emojis = ['😊', '🎉', '🎈', '❤', '😍'];
const sprinkles = [];
const range = (a, b) => Math.round(((b - a) * Math.random() + a) * 100) / 100; // eslint-disable-line no-mixed-operators
const randomEmoji = () => emojis[Math.floor(range(0, emojis.length))];

let canvas;
let context;
let drawing = false;

// Draws sprinkles in the canvas
const drawSprinkle = (posX, posY, text, fontSize) => {
  context.font = `${fontSize}px Georgia`;
  context.fillText(text, posX, posY);
};

// Redraws sprinles in a RAF
const redraw = () => {
  if (sprinkles.length === 0) {
    canvas.className = '';
    drawing = false;
    return;
  }
  canvas.className = 'show';
  window.requestAnimationFrame(redraw);
  context.clearRect(0, 0, canvas.width, canvas.height);
  sprinkles.forEach((sprinkle, index) => {
    if (sprinkle.isOffScreen()) {
      sprinkles.splice(index, 1);
      return;
    }
    sprinkle.draw();
  });
};

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

// Sprinkle class
function Sprinkle() {
  this.selectedEmoji = randomEmoji(), // eslint-disable-line no-unused-expressions, no-sequences
  this.fontSize = range(15, 45),
  this.posX = range(0, canvas.width),
  this.posY = range(-10, 10),
  this.deltaX = range(-3, 3),
  this.deltaY = range(2, 10),

  this.draw = function () {
    this.posX += this.deltaX;
    this.posY += this.deltaY;
    drawSprinkle(this.posX, this.posY, this.selectedEmoji, this.fontSize);
  },

  this.isOffScreen = function () {
    return this.posX > canvas.width || this.posY > canvas.height || this.posX < 0 || this.posY < 0;
  };
}

function dashSprinkles() {
  for (let i = 0; i < numberOfSprinkles; i++) {
    sprinkles.push(new Sprinkle());
  }

  if (drawing === false) {
    drawing = true;
    redraw();
  }
}

function init() {
  if (!isPullRequest()) {
    window.removeEventListener('resize', resizeCanvas, false);
    return;
  }

  // Find span with "First Time Contributor"
  const tagSpans = Array.prototype.slice.call(document.querySelectorAll('.timeline-comment .timeline-comment-header span.timeline-comment-label'));
  const firstTimeSpans = tagSpans.filter(span => /First/.test(span.innerText));

  // If there are no first time contributors we're done
  if (firstTimeSpans.length === 0) {
    return;
  }

  // Create canvas for emoji sprinkles
  if (!document.querySelector('#git-git-hooray')) {
    const createdCanvas = document.createElement('canvas');
    createdCanvas.setAttribute('id', 'git-git-hooray');
    document.getElementsByTagName('body')[0].appendChild(createdCanvas);
    canvas = document.querySelector('#git-git-hooray');
    context = canvas.getContext('2d');

    // Fit canvas to window
    resizeCanvas();
  }

  firstTimeSpans.forEach(span => {
    span.addEventListener('click', dashSprinkles, false);
  });

  window.addEventListener('resize', resizeCanvas, false);
}

document.addEventListener('DOMContentLoaded', init);
document.addEventListener('pjax:success', init);
