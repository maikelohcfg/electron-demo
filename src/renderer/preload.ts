import { ipcRenderer } from 'electron'

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('trace-run')
  button.onclick = () => {
    ipcRenderer.send('trace-run')
  }
})