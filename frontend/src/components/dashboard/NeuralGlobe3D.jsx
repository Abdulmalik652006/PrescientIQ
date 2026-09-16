import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

const NeuralGlobe3D = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    
    const width = container.clientWidth || 400
    const height = container.clientHeight || 230

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 5.2

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Master Group for 3D rotation
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    // 1. Outer Wireframe Geodesic/Icosahedron Sphere (Emerald Cyan glowing lattice)
    const wireframeGeo = new THREE.IcosahedronGeometry(1.65, 3)
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x00e599,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    })
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat)
    globeGroup.add(wireframeMesh)

    // 2. Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(1.15, 32, 32)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x064e3b,
      transparent: true,
      opacity: 0.75
    })
    const innerMesh = new THREE.Mesh(innerGeo, innerMat)
    globeGroup.add(innerMesh)

    // Additional inner bright pulse layer
    const coreGeo = new THREE.SphereGeometry(0.85, 24, 24)
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00e599,
      transparent: true,
      opacity: 0.25
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    globeGroup.add(coreMesh)

    // 3. Glowing Tensor Vertex Points (Dots on wireframe vertices)
    const pointsGeo = new THREE.IcosahedronGeometry(1.66, 3)
    const pointsMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.045,
      transparent: true,
      opacity: 0.85
    })
    const pointsMesh = new THREE.Points(pointsGeo, pointsMat)
    globeGroup.add(pointsMesh)

    // 4. Orbital Tilted Ring 1 (Cyan Neon Ring)
    const ringRadius = 2.45
    const ringTube = 0.02
    const ringGeo = new THREE.TorusGeometry(ringRadius, ringTube, 16, 100)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = Math.PI / 3.2
    ringMesh.rotation.y = Math.PI / 6
    globeGroup.add(ringMesh)

    // Second faint outer ring
    const ringGeo2 = new THREE.TorusGeometry(2.7, 0.012, 16, 100)
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x00e599,
      transparent: true,
      opacity: 0.35
    })
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2)
    ringMesh2.rotation.x = -Math.PI / 4
    ringMesh2.rotation.y = Math.PI / 4
    globeGroup.add(ringMesh2)

    // 5. Starfield / Particle Nebula Cloud
    const particleCount = 140
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 2.0 + Math.random() * 1.6

      particlePositions[i] = r * Math.sin(phi) * Math.cos(theta)
      particlePositions[i + 1] = r * Math.sin(phi) * Math.sin(theta)
      particlePositions[i + 2] = r * Math.cos(phi)
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: 0.03,
      transparent: true,
      opacity: 0.6
    })
    const particleSystem = new THREE.Points(particleGeo, particleMat)
    scene.add(particleSystem)

    // Mouse Interaction
    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0.2
    let targetRotationY = 0

    const onMouseMove = (event) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1
      targetRotationY = mouseX * 0.6
      targetRotationX = mouseY * 0.4 + 0.2
    }

    container.addEventListener('mousemove', onMouseMove)

    // Animation Loop
    let animationFrameId
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Continuous autonomous rotation
      globeGroup.rotation.y += 0.007
      globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.05
      globeGroup.rotation.z = Math.sin(elapsedTime * 0.5) * 0.05

      // Orbiting particles rotation
      particleSystem.rotation.y -= 0.002
      particleSystem.rotation.x += 0.001

      // Subtle breathing pulse on core
      const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.04
      coreMesh.scale.set(pulse, pulse, pulse)

      renderer.render(scene, camera)
    }

    animate()

    // Handle Resize
    const handleResize = () => {
      if (!container) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animationFrameId)
      
      // Dispose Geometries and Materials
      wireframeGeo.dispose()
      wireframeMat.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      coreGeo.dispose()
      coreMat.dispose()
      pointsGeo.dispose()
      pointsMat.dispose()
      ringGeo.dispose()
      ringMat.dispose()
      ringGeo2.dispose()
      ringMat2.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      renderer.dispose()

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className="relative w-full h-56 bg-[#060a12] rounded-xl border border-[#162035] overflow-hidden flex items-center justify-center select-none">
      {/* Background Cyber Dot Grid */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing relative z-10" />

      {/* Top Left Badge: Three.js Loss */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#0e1626]/90 border border-[#1c2944] text-[10px] font-mono text-slate-300 flex items-center gap-1.5 backdrop-blur-sm z-20 pointer-events-none">
        <span className="text-[#38bdf8]">❖</span> Loss: <span className="text-[#00e599] font-bold font-mono">0.0014</span>
      </div>

      {/* Top Right Badge: Three.js Live Core */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#0e1626]/90 border border-[#1c2944] text-[10px] font-mono text-slate-300 flex items-center gap-1.5 backdrop-blur-sm z-20 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00e599] animate-pulse" />
        <span>Three.js Spatial Core • 60 FPS</span>
      </div>

      {/* Bottom Left Tensor Indicator */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-[#0e1626]/90 border border-[#1c2944] text-[10px] font-mono text-slate-300 flex items-center gap-1.5 backdrop-blur-sm z-20 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
        <span>Tensor Node: 256/256 Online</span>
      </div>

      {/* Bottom Right Interactive Hint */}
      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-[#10192b]/80 border border-[#1f2d48] text-[9px] font-mono text-slate-400 z-20 pointer-events-none">
        Interactive 3D Orbit
      </div>
    </div>
  )
}

export default NeuralGlobe3D
