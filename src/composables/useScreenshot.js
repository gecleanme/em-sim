export function useScreenshot(renderer) {
  function download(filename = 'simulation-capture.png') {
    const link = document.createElement('a')
    link.href = renderer.value.domElement.toDataURL('image/png')
    link.download = filename
    link.click()
  }

  return { download }
}
