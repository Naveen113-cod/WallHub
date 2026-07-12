import { useEffect, useRef } from 'react'

const COLORS = ['#6c63ff','#a855f7','#f0c040','#ff6b9d','#00d4ff','#ff8c42']

export default function CursorSpark() {
  const canvasRef = useRef(null)
  const particles  = useRef([])
  const lastPos    = useRef({ x: -999, y: -999 })
  const rafRef     = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e) => {
      const x = e.clientX ?? e.touches?.[0]?.clientX
      const y = e.clientY ?? e.touches?.[0]?.clientY
      if (x === undefined) return
      const dx = x - lastPos.current.x
      const dy = y - lastPos.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 8) {
        const count = Math.min(3, Math.floor(dist / 10) + 1)
        for (let i = 0; i < count; i++) {
          particles.current.push({
            x, y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3 - 1,
            life: 1,
            decay: 0.025 + Math.random() * 0.03,
            size: 2 + Math.random() * 4,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          })
        }
        lastPos.current = { x, y }
        if (particles.current.length > 120) particles.current = particles.current.slice(-120)
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchmove', onMove,  { passive: true })

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current = particles.current.filter(p => p.life > 0)
      for (const p of particles.current) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.vx *= 0.97; p.life -= p.decay
        const alpha = Math.max(0, p.life)
        const size  = p.size * alpha
        ctx.save()
        ctx.globalAlpha = alpha * 0.6
        ctx.shadowBlur = 10; ctx.shadowColor = p.color; ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = alpha; ctx.shadowBlur = 4; ctx.fillStyle = '#ffffff'
        ctx.beginPath(); ctx.arc(p.x, p.y, size * 0.4, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position:'fixed', top:0, left:0, width:'100%', height:'100%',
      pointerEvents:'none', zIndex:9998,
    }}/>
  )
}
