"use client";

import { useEffect, useRef } from "react";

export default function ThreeJsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Three.js dynamically to respect r128 cdnjs requirement
    const scriptId = 'three-js-r128';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      document.body.appendChild(script);
    }

    let animationFrameId: number;
    let scene: any, camera: any, renderer: any;
    let icosahedron: any, octahedron: any, coreSphere: any;
    let torus1: any, torus2: any, particles: any;
    let mouseX = 0;
    let mouseY = 0;

    const initThreeJs = () => {
      if (!(window as any).THREE || !canvasRef.current) return;
      
      const THREE = (window as any).THREE;
      
      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x06061a, 30, 80);
      
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 25;
      
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // 1. Icosaèdre wireframe
      const geoIco = new THREE.IcosahedronGeometry(7, 1);
      const matIco = new THREE.LineBasicMaterial({ 
        color: 0xd4a843, 
        transparent: true, 
        opacity: 0.07,
        blending: THREE.AdditiveBlending 
      });
      icosahedron = new THREE.LineSegments(new THREE.WireframeGeometry(geoIco), matIco);
      scene.add(icosahedron);

      // 2. Octaèdre wireframe
      const geoOct = new THREE.OctahedronGeometry(3.5, 0);
      const matOct = new THREE.LineBasicMaterial({ 
        color: 0xf0c870, 
        transparent: true, 
        opacity: 0.13,
        blending: THREE.AdditiveBlending 
      });
      octahedron = new THREE.LineSegments(new THREE.WireframeGeometry(geoOct), matOct);
      scene.add(octahedron);

      // 3. Sphère centrale pulsante
      const geoSphere = new THREE.SphereGeometry(1.2, 32, 32);
      const matSphere = new THREE.MeshBasicMaterial({
        color: 0xf5d080,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending
      });
      coreSphere = new THREE.Mesh(geoSphere, matSphere);
      scene.add(coreSphere);

      // 4. 2 anneaux (Torus)
      const geoTorus1 = new THREE.TorusGeometry(10, 0.05, 16, 100);
      const matTorus1 = new THREE.MeshBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
      torus1 = new THREE.Mesh(geoTorus1, matTorus1);
      scene.add(torus1);

      const geoTorus2 = new THREE.TorusGeometry(14, 0.03, 16, 100);
      const matTorus2 = new THREE.MeshBasicMaterial({ color: 0xf0c870, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending });
      torus2 = new THREE.Mesh(geoTorus2, matTorus2);
      torus2.rotation.x = Math.PI / 2;
      scene.add(torus2);

      // 5. 12 rayons lumineux
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending });
      const lineGeometry = new THREE.BufferGeometry();
      const points = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 20;
        const y = Math.sin(angle) * 20;
        const z = (Math.random() - 0.5) * 10;
        points.push(0, 0, 0);
        points.push(x, y, z);
      }
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);

      // 6. 600 particules dorées
      const particlesGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(600 * 3);
      for(let i=0; i<600*3; i++) {
        posArray[i] = (Math.random() - 0.5) * 60;
      }
      particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particlesMat = new THREE.PointsMaterial({
        size: 0.12,
        color: 0xd4a843,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      particles = new THREE.Points(particlesGeo, particlesMat);
      scene.add(particles);

      // Events
      window.addEventListener('resize', onWindowResize);
      document.addEventListener('mousemove', onDocumentMouseMove);
      window.addEventListener('scroll', onScroll);

      animate();
    };

    if ((window as any).THREE) {
      initThreeJs();
    } else {
      script.addEventListener('load', initThreeJs);
    }

    const onWindowResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.005;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.005;
    };

    const onScroll = () => {
      if (scene) {
        scene.position.y = -window.scrollY * 0.012;
      }
    };

    const animate = () => {
      if (!scene || !camera || !renderer) return;
      animationFrameId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      icosahedron.rotation.x += 0.001;
      icosahedron.rotation.y += 0.002;

      octahedron.rotation.x -= 0.002;
      octahedron.rotation.y -= 0.001;

      // Breathing effect
      const scale = 1 + Math.sin(time * 0.8) * 0.1;
      coreSphere.scale.set(scale, scale, scale);
      (coreSphere.material as any).opacity = 0.14 + Math.sin(time * 0.8) * 0.03;

      torus1.rotation.x += 0.001;
      torus1.rotation.y += 0.0005;
      torus2.rotation.x -= 0.0005;
      torus2.rotation.y += 0.001;

      particles.rotation.y += 0.0005;

      // Parallax
      camera.position.x += (mouseX - camera.position.x) * 0.04;
      camera.position.y += (-mouseY - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      window.removeEventListener('scroll', onScroll);
      if (renderer) renderer.dispose();
      script.removeEventListener('load', initThreeJs);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      id="bg-canvas" 
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, background: '#06061a' }}
    />
  );
}
