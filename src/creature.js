'use strict';

// A single finite animation, then a quiet interval. No frame loop or polling.
const creature = document.getElementById('creature');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let timer;
let movement;

function schedule(delay) {
  if (document.hidden || reducedMotion.matches) return;
  timer = window.setTimeout(() => {
    movement = creature.animate([
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-9px) rotate(-5deg)', offset: 0.35 },
      { transform: 'translateY(-3px) rotate(4deg)', offset: 0.7 },
      { transform: 'translateY(0) rotate(0deg)' },
    ], { duration: 1200, easing: 'ease-in-out', iterations: 1 });
    movement.finished.then(() => {
      movement = undefined;
      schedule(12000);
    }).catch(() => {}); // Cancellation on hide/reduced motion is intentional.
  }, delay);
}

function restart() {
  window.clearTimeout(timer);
  movement?.cancel();
  movement = undefined;
  schedule(1000);
}

document.addEventListener('visibilitychange', restart);
reducedMotion.addEventListener('change', restart);
restart();
