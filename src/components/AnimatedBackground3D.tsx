import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingShapeProps {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
  shape?: 'sphere' | 'torus' | 'octahedron' | 'icosahedron';
}

const FloatingShape = ({ position, color, scale = 1, speed = 1, shape = 'sphere' }: FloatingShapeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 * speed;
    }
  });

  const geometry = useMemo(() => {
    switch (shape) {
      case 'torus':
        return <torusGeometry args={[1, 0.4, 16, 32]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[1]} />;
      default:
        return <sphereGeometry args={[1, 32, 32]} />;
    }
  }, [shape]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry}
        <MeshDistortMaterial
          color={color}
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
};

const WobblyRing = ({ position, color }: { position: [number, number, number]; color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[2, 0.1, 16, 100]} />
        <MeshWobbleMaterial
          color={color}
          factor={0.3}
          speed={2}
          transparent
          opacity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
};

const ParticleField = () => {
  const points = useRef<THREE.Points>(null);
  const particleCount = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#60a5fa"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

interface AnimatedBackground3DProps {
  variant?: 'auth' | 'dashboard' | 'vibrant';
}

export const AnimatedBackground3D = ({ variant = 'auth' }: AnimatedBackground3DProps) => {
  const colors = useMemo(() => {
    if (variant === 'vibrant') {
      return {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        accent: '#ffe66d',
        purple: '#a855f7',
        pink: '#ec4899',
      };
    }
    return {
      primary: '#3b82f6',
      secondary: '#06b6d4',
      accent: '#8b5cf6',
      purple: '#a855f7',
      pink: '#ec4899',
    };
  }, [variant]);

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color={colors.accent} />
        <pointLight position={[10, -10, 5]} intensity={0.3} color={colors.pink} />

        {/* Stars for depth */}
        <Stars radius={50} depth={50} count={1000} factor={2} saturation={0} fade speed={1} />

        {/* Main floating shapes */}
        <FloatingShape position={[-4, 2, -2]} color={colors.primary} scale={0.8} speed={0.5} shape="sphere" />
        <FloatingShape position={[4, -1, -3]} color={colors.secondary} scale={1.2} speed={0.7} shape="icosahedron" />
        <FloatingShape position={[-2, -2, -1]} color={colors.accent} scale={0.6} speed={0.8} shape="octahedron" />
        <FloatingShape position={[3, 3, -4]} color={colors.purple} scale={0.9} speed={0.4} shape="torus" />
        <FloatingShape position={[-3, 0, -5]} color={colors.pink} scale={0.7} speed={0.6} shape="sphere" />

        {/* Wobbly rings */}
        <WobblyRing position={[0, 0, -6]} color={colors.primary} />
        <WobblyRing position={[5, 2, -8]} color={colors.secondary} />

        {/* Particle field */}
        <ParticleField />
      </Canvas>
    </div>
  );
};
