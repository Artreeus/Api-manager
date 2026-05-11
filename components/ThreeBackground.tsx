'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  variant?: 'particles' | 'waves' | 'geometric' | 'neural' | 'solar-system';
  intensity?: number;
}

export function ThreeBackground({ variant = 'solar-system', intensity = 1 }: ThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create different backgrounds based on variant
    let animationFunction: () => void;

    switch (variant) {
      case 'solar-system':
        animationFunction = createSolarSystem(scene, camera, intensity);
        break;
      case 'particles':
        animationFunction = createParticleSystem(scene, camera, intensity);
        break;
      case 'waves':
        animationFunction = createWaveSystem(scene, camera, intensity);
        break;
      case 'geometric':
        animationFunction = createGeometricSystem(scene, camera, intensity);
        break;
      case 'neural':
        animationFunction = createNeuralNetwork(scene, camera, intensity);
        break;
      default:
        animationFunction = createSolarSystem(scene, camera, intensity);
    }

    // Animation loop
    const animate = () => {
      animationFunction();
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [variant, intensity]);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
}

function createSolarSystem(scene: THREE.Scene, camera: THREE.Camera, intensity: number) {
  const planets: THREE.Mesh[] = [];
  const asteroids: THREE.Mesh[] = [];
  const stars: THREE.Points[] = [];
  
  // Create enhanced starfield background
  const starCount = Math.floor(5000 * intensity);
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    
    // Distribute stars in a large sphere
    const radius = 300 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[i3 + 2] = radius * Math.cos(phi);

    // Create different star types with realistic colors
    const starType = Math.random();
    if (starType < 0.1) {
      // Blue giants - very bright
      starColors[i3] = 0.7 + Math.random() * 0.3;
      starColors[i3 + 1] = 0.8 + Math.random() * 0.2;
      starColors[i3 + 2] = 1;
      starSizes[i] = 3 + Math.random() * 2;
    } else if (starType < 0.3) {
      // White dwarfs - medium bright
      starColors[i3] = 0.9 + Math.random() * 0.1;
      starColors[i3 + 1] = 0.9 + Math.random() * 0.1;
      starColors[i3 + 2] = 0.9 + Math.random() * 0.1;
      starSizes[i] = 2 + Math.random() * 1;
    } else if (starType < 0.7) {
      // Yellow stars (like our sun)
      starColors[i3] = 1;
      starColors[i3 + 1] = 0.9 + Math.random() * 0.1;
      starColors[i3 + 2] = 0.6 + Math.random() * 0.3;
      starSizes[i] = 1.5 + Math.random() * 1;
    } else {
      // Red giants - dimmer
      starColors[i3] = 1;
      starColors[i3 + 1] = 0.3 + Math.random() * 0.3;
      starColors[i3 + 2] = 0.1 + Math.random() * 0.2;
      starSizes[i] = 1 + Math.random() * 0.5;
    }
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

  const starMaterial = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);
  stars.push(starField);

  // Create the Sun with enhanced effects
  const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdd44,
    transparent: true,
    opacity: 1,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  // Add multiple corona layers for realistic sun effect
  const coronaLayers = [
    { radius: 6.5, color: 0xffaa00, opacity: 0.4 },
    { radius: 8, color: 0xff6600, opacity: 0.2 },
    { radius: 10, color: 0xff3300, opacity: 0.1 }
  ];

  coronaLayers.forEach((layer, index) => {
    const coronaGeometry = new THREE.SphereGeometry(layer.radius, 32, 32);
    const coronaMaterial = new THREE.MeshBasicMaterial({
      color: layer.color,
      transparent: true,
      opacity: layer.opacity,
      blending: THREE.AdditiveBlending,
    });
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    corona.userData = { rotationSpeed: 0.001 * (index + 1) };
    sun.add(corona);
  });

  // Enhanced planet data with more realistic properties
  const planetData = [
    [0.4, 12, 0x8c7853, 0.024, 0.02, 'Mercury'],   
    [0.7, 16, 0xffc649, 0.018, 0.015, 'Venus'],    
    [0.8, 20, 0x6b93d6, 0.012, 0.01, 'Earth'],     
    [0.6, 25, 0xcd5c5c, 0.009, 0.008, 'Mars'],     
    [2.8, 38, 0xd8ca9d, 0.006, 0.005, 'Jupiter'],  
    [2.3, 50, 0xfad5a5, 0.004, 0.003, 'Saturn'],   
    [1.5, 65, 0x4fd0e7, 0.003, 0.002, 'Uranus'],   
    [1.4, 80, 0x4b70dd, 0.002, 0.001, 'Neptune'],  
  ];

  planetData.forEach(([radius, orbitRadius, color, orbitSpeed, rotationSpeed, name], index) => {
    // Create subtle orbit rings with glow
    const orbitGeometry = new THREE.RingGeometry(orbitRadius - 0.2, orbitRadius + 0.2, 128);
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbitRing.rotation.x = -Math.PI / 2;
    scene.add(orbitRing);

    // Create planet with enhanced materials
    const planetGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const planetMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    
    // Add planet glow
    const glowGeometry = new THREE.SphereGeometry(radius * 1.1, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    planet.add(glow);
    
    // Set initial position
    const initialAngle = Math.random() * Math.PI * 2;
    planet.position.x = Math.cos(initialAngle) * orbitRadius;
    planet.position.z = Math.sin(initialAngle) * orbitRadius;
    
    planet.userData = { 
      orbitRadius, 
      orbitSpeed, 
      rotationSpeed, 
      angle: initialAngle,
      name
    };
    
    scene.add(planet);
    planets.push(planet);

    // Add Saturn's rings with multiple bands
    if (index === 5) {
      const ringBands = [
        { inner: radius * 1.3, outer: radius * 1.8, opacity: 0.8 },
        { inner: radius * 1.9, outer: radius * 2.3, opacity: 0.6 },
        { inner: radius * 2.4, outer: radius * 2.6, opacity: 0.4 }
      ];

      ringBands.forEach((band, bandIndex) => {
        const ringGeometry = new THREE.RingGeometry(band.inner, band.outer, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xc9b037,
          transparent: true,
          opacity: band.opacity,
          side: THREE.DoubleSide,
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = -Math.PI / 2 + 0.2;
        rings.userData = { rotationSpeed: 0.001 * (bandIndex + 1) };
        planet.add(rings);
      });
    }

    // Add Earth's moon and atmosphere
    if (index === 2) {
      // Moon
      const moonGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const moonMaterial = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.8,
      });
      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.position.x = 2.5;
      moon.userData = { orbitRadius: 2.5, orbitSpeed: 0.05, angle: 0 };
      planet.add(moon);

      // Earth's atmosphere
      const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.05, 32, 32);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      });
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      planet.add(atmosphere);
    }

    // Add Jupiter's moons
    if (index === 4) {
      const moonData = [
        { size: 0.15, distance: 3.5, speed: 0.08, color: 0xffeeaa },
        { size: 0.12, distance: 4.2, speed: 0.06, color: 0xddccaa },
        { size: 0.18, distance: 5.1, speed: 0.04, color: 0xccbbaa },
        { size: 0.14, distance: 6.0, speed: 0.03, color: 0xbbaaaa }
      ];

      moonData.forEach((moonInfo, moonIndex) => {
        const moonGeometry = new THREE.SphereGeometry(moonInfo.size, 12, 12);
        const moonMaterial = new THREE.MeshBasicMaterial({
          color: moonInfo.color,
          transparent: true,
          opacity: 0.7,
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.x = moonInfo.distance;
        moon.userData = { 
          orbitRadius: moonInfo.distance, 
          orbitSpeed: moonInfo.speed, 
          angle: moonIndex * Math.PI / 2 
        };
        planet.add(moon);
      });
    }
  });

  // Enhanced asteroid belt
  const asteroidCount = Math.floor(500 * intensity);
  for (let i = 0; i < asteroidCount; i++) {
    const asteroidSize = 0.02 + Math.random() * 0.06;
    const asteroidGeometry = new THREE.SphereGeometry(asteroidSize, 8, 6);
    const asteroidMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.1, 0.3, 0.3 + Math.random() * 0.3),
      transparent: true,
      opacity: 0.7,
    });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    
    // Position in asteroid belt with some vertical spread
    const beltRadius = 28 + Math.random() * 8;
    const angle = Math.random() * Math.PI * 2;
    asteroid.position.x = Math.cos(angle) * beltRadius;
    asteroid.position.z = Math.sin(angle) * beltRadius;
    asteroid.position.y = (Math.random() - 0.5) * 4;
    
    asteroid.userData = { 
      orbitRadius: beltRadius,
      orbitSpeed: 0.005 + Math.random() * 0.005, 
      angle,
      rotationSpeedX: (Math.random() - 0.5) * 0.02,
      rotationSpeedY: (Math.random() - 0.5) * 0.02,
      rotationSpeedZ: (Math.random() - 0.5) * 0.02
    };
    
    scene.add(asteroid);
    asteroids.push(asteroid);
  }

  // Position camera for cinematic view
  camera.position.set(0, 50, 100);
  camera.lookAt(0, 0, 0);

  let time = 0;

  return () => {
    time += 0.008;

    // Animate the Sun with pulsing effect
    sun.rotation.y += 0.003;
    const sunScale = 1 + Math.sin(time * 3) * 0.03;
    sun.scale.setScalar(sunScale);
    
    // Animate corona layers
    sun.children.forEach((corona, index) => {
      if (corona.userData.rotationSpeed) {
        corona.rotation.y += corona.userData.rotationSpeed;
        corona.rotation.z += corona.userData.rotationSpeed * 0.5;
      }
    });

    // Animate planets with realistic motion
    planets.forEach((planet, index) => {
      const userData = planet.userData;
      
      // Update orbit position
      userData.angle += userData.orbitSpeed;
      planet.position.x = Math.cos(userData.angle) * userData.orbitRadius;
      planet.position.z = Math.sin(userData.angle) * userData.orbitRadius;
      
      // Rotate planet on its axis
      planet.rotation.y += userData.rotationSpeed;
      
      // Animate planet's children (moons, rings, atmosphere)
      planet.children.forEach((child) => {
        if (child.userData && child.userData.orbitRadius) {
          // Moon orbiting
          child.userData.angle += child.userData.orbitSpeed;
          child.position.x = Math.cos(child.userData.angle) * child.userData.orbitRadius;
          child.position.z = Math.sin(child.userData.angle) * child.userData.orbitRadius;
          child.rotation.y += 0.01;
        } else if (child.userData && child.userData.rotationSpeed) {
          // Ring rotation
          child.rotation.z += child.userData.rotationSpeed;
        }
      });
    });

    // Animate asteroids with tumbling motion
    asteroids.forEach((asteroid) => {
      const userData = asteroid.userData;
      
      // Orbit movement
      userData.angle += userData.orbitSpeed;
      asteroid.position.x = Math.cos(userData.angle) * userData.orbitRadius;
      asteroid.position.z = Math.sin(userData.angle) * userData.orbitRadius;
      
      // Tumbling rotation
      asteroid.rotation.x += userData.rotationSpeedX;
      asteroid.rotation.y += userData.rotationSpeedY;
      asteroid.rotation.z += userData.rotationSpeedZ;
    });

    // Dynamic camera movement for cinematic effect
    const cameraDistance = 120;
    const cameraHeight = 60;
    camera.position.x = Math.cos(time * 0.02) * cameraDistance;
    camera.position.z = Math.sin(time * 0.02) * cameraDistance;
    camera.position.y = cameraHeight + Math.sin(time * 0.015) * 20;
    camera.lookAt(0, 0, 0);

    // Animate starfield twinkling
    stars.forEach((starField) => {
      const colors = starField.geometry.attributes.color.array as Float32Array;
      const sizes = starField.geometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < colors.length; i += 3) {
        const twinkle = 0.6 + Math.sin(time * 2 + i * 0.01) * 0.4;
        colors[i] *= twinkle;
        colors[i + 1] *= twinkle;
        colors[i + 2] *= twinkle;
        
        // Size variation for twinkling effect
        if (sizes[i / 3]) {
          sizes[i / 3] *= (0.8 + Math.sin(time * 3 + i * 0.02) * 0.2);
        }
      }
      starField.geometry.attributes.color.needsUpdate = true;
      starField.geometry.attributes.size.needsUpdate = true;
    });
  };
}

function createParticleSystem(scene: THREE.Scene, camera: THREE.Camera, intensity: number) {
  const particleCount = Math.floor(2000 * intensity);
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200;
    positions[i + 1] = (Math.random() - 0.5) * 200;
    positions[i + 2] = (Math.random() - 0.5) * 200;

    colors[i] = 0.3 + Math.random() * 0.7;
    colors[i + 1] = 0.5 + Math.random() * 0.5;
    colors[i + 2] = 0.8 + Math.random() * 0.2;

    velocities[i] = (Math.random() - 0.5) * 0.02;
    velocities[i + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i + 2] = (Math.random() - 0.5) * 0.02;
  }

  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 3,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  const particleSystem = new THREE.Points(particles, material);
  scene.add(particleSystem);

  camera.position.z = 100;

  return () => {
    const positions = particleSystem.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];

      if (positions[i] > 100) positions[i] = -100;
      if (positions[i] < -100) positions[i] = 100;
      if (positions[i + 1] > 100) positions[i + 1] = -100;
      if (positions[i + 1] < -100) positions[i + 1] = 100;
      if (positions[i + 2] > 100) positions[i + 2] = -100;
      if (positions[i + 2] < -100) positions[i + 2] = 100;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.rotation.y += 0.002;
  };
}

function createWaveSystem(scene: THREE.Scene, camera: THREE.Camera, intensity: number) {
  const geometry = new THREE.PlaneGeometry(200, 200, 100, 100);
  const material = new THREE.MeshBasicMaterial({
    color: 0x4f46e5,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  camera.position.set(0, 50, 50);
  camera.lookAt(0, 0, 0);

  let time = 0;

  return () => {
    time += 0.02 * intensity;
    const positions = plane.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      positions[i + 1] = Math.sin(x * 0.1 + time) * Math.cos(z * 0.1 + time) * 8;
    }

    plane.geometry.attributes.position.needsUpdate = true;
  };
}

function createGeometricSystem(scene: THREE.Scene, camera: THREE.Camera, intensity: number) {
  const geometries = [
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.SphereGeometry(1, 16, 12),
    new THREE.ConeGeometry(1, 2, 12),
    new THREE.OctahedronGeometry(1),
  ];

  const materials = [
    new THREE.MeshBasicMaterial({ color: 0x4f46e5, wireframe: true, transparent: true, opacity: 0.7 }),
    new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.7 }),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.7 }),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true, transparent: true, opacity: 0.7 }),
  ];

  const meshes: THREE.Mesh[] = [];
  const count = Math.floor(30 * intensity);

  for (let i = 0; i < count; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100
    );

    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    scene.add(mesh);
    meshes.push(mesh);
  }

  camera.position.z = 50;

  return () => {
    meshes.forEach((mesh, index) => {
      mesh.rotation.x += 0.01 * (index % 2 === 0 ? 1 : -1);
      mesh.rotation.y += 0.01 * (index % 3 === 0 ? 1 : -1);
      mesh.rotation.z += 0.005 * (index % 4 === 0 ? 1 : -1);
    });
  };
}

function createNeuralNetwork(scene: THREE.Scene, camera: THREE.Camera, intensity: number) {
  const nodeCount = Math.floor(80 * intensity);
  const nodes: THREE.Mesh[] = [];
  const connections: THREE.Line[] = [];

  const nodeGeometry = new THREE.SphereGeometry(0.3, 12, 8);
  const nodeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x4f46e5, 
    transparent: true, 
    opacity: 0.8 
  });

  for (let i = 0; i < nodeCount; i++) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 80
    );
    scene.add(node);
    nodes.push(node);
  }

  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x06b6d4, 
    transparent: true, 
    opacity: 0.4 
  });

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() < 0.08) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          nodes[i].position,
          nodes[j].position
        ]);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
        connections.push(line);
      }
    }
  }

  camera.position.z = 50;

  let time = 0;

  return () => {
    time += 0.01;
    
    nodes.forEach((node, index) => {
      node.position.y += Math.sin(time + index * 0.1) * 0.03;
      node.material.opacity = 0.5 + Math.sin(time + index * 0.2) * 0.3;
    });

    connections.forEach((connection, index) => {
      connection.material.opacity = 0.2 + Math.sin(time + index * 0.05) * 0.2;
    });
  };
}