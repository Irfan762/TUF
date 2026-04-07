import confetti from 'canvas-confetti'

export function fireConfetti() {
  const colors = ['#1976d2', '#42a5f5', '#ffffff', '#bbdefb']

  confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors })
  confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors })
}
