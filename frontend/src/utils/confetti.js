import confetti from 'canvas-confetti';

export const fireStreakConfetti = () => {
  const colors = ['#818cf8', '#c084fc', '#f472b6', '#34d399', '#fbbf24'];
  
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    disableForReducedMotion: true
  });

  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      disableForReducedMotion: true
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      disableForReducedMotion: true
    });
  }, 200);
};

export const fireCompletionGlow = () => {
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.7 },
    colors: ['#818cf8', '#c084fc'],
    gravity: 2,
    scalar: 0.6,
    disableForReducedMotion: true
  });
};
