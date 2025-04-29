export function Porch({ position }: { position: [number, number, number] }) {
    return (
      <group position={position}>
        {/* Ступени */}
        <mesh position={[0, 0.25, 0.5]}>
          <boxGeometry args={[3, 0.2, 2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.1, 1]}>
          <boxGeometry args={[2.5, 0.1, 1.5]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
        
        {/* Колонны */}
        <mesh position={[-1.2, 0.7, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.4, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[1.2, 0.7, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.4, 16]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Крыша крыльца */}
        <mesh position={[0, 1.4, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[2.5, 0.1, 1.5]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
      </group>
    );
  }