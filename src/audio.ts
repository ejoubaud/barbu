const notifSound = Audio && new Audio("/sound.mp3")

export const play = () => {
  if (notifSound) notifSound.play()
}
