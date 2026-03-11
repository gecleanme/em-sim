export function useTransparency() {
  const saved = new Map()

  function makeTransparent(model, names, opacity = 0.15) {
    model.traverse((c) => {
      if (!c.isMesh || !names.some((n) => c.name.includes(n))) return
      if (!saved.has(c.uuid))
        saved.set(c.uuid, {
          transparent: c.material.transparent,
          opacity: c.material.opacity,
          depthWrite: c.material.depthWrite,
        })
      c.material = c.material.clone()
      c.material.transparent = true
      c.material.opacity = opacity
      c.material.depthWrite = false
      c.material.needsUpdate = true
    })
  }

  function restoreOpacity(model) {
    model.traverse((c) => {
      if (!c.isMesh || !saved.has(c.uuid)) return
      const s = saved.get(c.uuid)
      Object.assign(c.material, { transparent: s.transparent, opacity: s.opacity, depthWrite: s.depthWrite })
      c.material.needsUpdate = true
      saved.delete(c.uuid)
    })
  }

  function ghostMode(model, on = true) {
    const parts = ['Housing', 'Enclosure', 'Radome', 'Shell', 'Cover']
    on ? makeTransparent(model, parts, 0.12) : restoreOpacity(model)
  }

  return { ghostMode }
}
