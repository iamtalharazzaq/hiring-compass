import { useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group } from "three";

function Orbit({ compact }: { compact: boolean }) {
  const group = useMemo(() => ({ current: null as Group | null }), []);
  useFrame(({ pointer, clock }) => {
    if (group.current) {
      const t = clock.getElapsedTime();
      group.current.rotation.y += (pointer.x * .26 + t * .13 - group.current.rotation.y) * .025;
      group.current.rotation.x += (-pointer.y * .16 + Math.sin(t * .7) * .07 - group.current.rotation.x) * .03;
      group.current.rotation.z = Math.sin(t * .45) * .045;
      group.current.position.y = Math.sin(t * .8) * .09;
    }
  });
  return <group ref={(node) => { group.current = node; }}>
    <Float speed={1.3} rotationIntensity={.35} floatIntensity={.6}>
      <mesh><torusGeometry args={[compact ? 1.25 : 1.75, .18, 24, 100]} /><meshStandardMaterial color="#8c2bc2" emissive="#5f008c" emissiveIntensity={.35} metalness={.7} roughness={.16} /></mesh>
      <mesh rotation={[1.2, .2, .4]}><torusGeometry args={[compact ? .74 : 1.08, .1, 20, 72]} /><meshStandardMaterial color="#e49aff" emissive="#8c2bc2" emissiveIntensity={.5} metalness={.55} roughness={.2} /></mesh>
      <mesh><sphereGeometry args={[compact ? .35 : .5, 32, 32]} /><meshStandardMaterial color="#fff8f1" emissive="#b338e8" emissiveIntensity={.6} roughness={.2} /></mesh>
    </Float>
    {[
      [-2.25, 1.1, -.2, "#fff8f1", 1.05, .66], // resume card
      [2.35, .85, -.1, "#5276ff", 1.05, .66], // job card
      [-1.85, -1.35, .1, "#ff8c82", .42, .42], // candidate node
      [2.1, -1.2, .15, "#d58af5", .58, .58], // approval marker
    ].map(([x, y, z, color, width, height], i) => <Float key={i} speed={1 + i * .18} floatIntensity={.55}><mesh position={[x as number, y as number, z as number]} rotation={[0, 0, i < 2 ? (i ? -.18 : .14) : 0]}><boxGeometry args={[width as number, height as number, .14]} /><meshStandardMaterial color={color as string} metalness={.25} roughness={.28} /></mesh></Float>)}
  </group>;
}

function GlobalOrbit({ compact }: { compact: boolean }) {
  const group = useMemo(() => ({ current: null as Group | null }), []);
  const scale = compact ? .82 : 1;
  useFrame(({ pointer, clock }) => {
    if (group.current) {
      const t = clock.getElapsedTime();
      group.current.rotation.y += (pointer.x * .18 + t * .11 - group.current.rotation.y) * .025;
      group.current.rotation.x += (-pointer.y * .1 + Math.sin(t * .55) * .05 - group.current.rotation.x) * .025;
      group.current.rotation.z = Math.sin(t * .38) * .035;
    }
  });
  return <group ref={(node) => { group.current = node; }} scale={scale}>
    <mesh><sphereGeometry args={[1.35, 48, 48]} /><meshStandardMaterial color="#4f0877" emissive="#1f0235" emissiveIntensity={.6} metalness={.42} roughness={.22} /></mesh>
    <mesh scale={1.025}><sphereGeometry args={[1.35, 48, 48]} /><meshStandardMaterial color="#c642eb" emissive="#a100d4" emissiveIntensity={.22} transparent opacity={.13} roughness={.12} /></mesh>
    <mesh rotation={[.35, .2, .65]}><torusGeometry args={[1.59, .028, 12, 88]} /><meshStandardMaterial color="#f0b4ff" emissive="#ae1bdb" emissiveIntensity={.75} /></mesh>
    <mesh rotation={[-.82, .36, -.3]}><torusGeometry args={[1.5, .02, 12, 88]} /><meshStandardMaterial color="#b93be5" emissive="#7b00b2" emissiveIntensity={.75} /></mesh>
    <mesh rotation={[0, .72, .05]}><torusGeometry args={[1.43, .016, 12, 88]} /><meshStandardMaterial color="#fff8f1" emissive="#d58af5" emissiveIntensity={.35} transparent opacity={.75} /></mesh>
    {[[1.02, .62, .72], [-1.1, .12, .76], [.48, -1.1, .78], [-.36, .94, .82]].map(([x, y, z], i) => <Float key={i} speed={1.15 + i * .18} floatIntensity={.3}><mesh position={[x, y, z]}><sphereGeometry args={[.09, 20, 20]} /><meshStandardMaterial color="#fff8f1" emissive="#d58af5" emissiveIntensity={1} /></mesh></Float>)}
  </group>;
}

export default function MarketingScene({ compact, global = false }: { compact: boolean; global?: boolean }) {
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, compact ? 8 : 7], fov: 43 }} gl={{ antialias: true, alpha: true }}><ambientLight intensity={1.8} /><pointLight position={[4, 4, 5]} intensity={30} color="#d58af5" /><pointLight position={[-4, -2, 2]} intensity={20} color="#5276ff" />{global ? <GlobalOrbit compact={compact} /> : <Orbit compact={compact} />}</Canvas>;
}
