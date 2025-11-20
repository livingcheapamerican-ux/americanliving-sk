import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  TransformControls, 
  Html, 
  useTexture, 
  Environment, 
  ContactShadows 
} from '@react-three/drei';
import * as THREE from 'three';

// --- 1. DEFINÍCIA MATERIÁLOV (Base44 Design) ---
// Tu si neskôr môžete doplniť cesty k reálnym textúram (.jpg)
const MATERIALS = {
  'omietka_biela': { name: 'Biela Omietka', color: '#ffffff', type: 'color' },
  'antracit': { name: 'Antracit', color: '#2b2b2b', type: 'color' },
  'drevo_svetle': { name: 'Smrek Svetlý', color: '#e3cba3', type: 'color' }, // Placeholder farba namiesto textúry
  'drevo_tmave': { name: 'Dub Tmavý', color: '#5c4033', type: 'color' },
};

// --- 2. KOMPONENT DOMU ---
const HouseModel = ({ dimensions, materialKey, mode, isSelected, onSelect }) => {
  // Načítanie textúr (ak by sme ich mali) - tu je len ukážka logiky
  // const texture = useTexture('/path/to/wood.jpg'); 
  
  const matData = MATERIALS[materialKey];
  const isAligning = mode === 'ALIGN';

  return (
    <mesh 
      onClick={onSelect}
      castShadow 
      receiveShadow
    >
      {/* Geometria podľa zadaných rozmerov */}
      <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
      
      {/* Materiál */}
      <meshStandardMaterial 
        color={matData.color}
        transparent={isAligning}
        opacity={isAligning ? 0.6 : 1.0} // Priesvitný pri zarovnávaní
        roughness={0.8}
        metalness={0.1}
        // map={matData.type === 'texture' ? texture : null} // Tu by sa pripojila textúra
      />
      
      {/* Pomocné hrany (Wireframe) pre lepšie zarovnávanie */}
      {isAligning && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth)]} />
          <lineBasicMaterial color="#00ff00" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );
};

// --- 3. HLAVNÁ APLIKÁCIA ---
export default function Konfigurator3D() {
  // STAVY
  const [bgImage, setBgImage] = useState(null);
  const [mode, setMode] = useState('SETUP'); // SETUP -> ALIGN -> DESIGN
  const [dimensions, setDimensions] = useState({ width: 8.0, height: 3.0, depth: 3.5 });
  const [activeMaterial, setActiveMaterial] = useState('omietka_biela');
  
  // REF pre manipuláciu
  const transformRef = useRef();
  const controlsRef = useRef();

  // Nahranie obrázka
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBgImage(ev.target.result);
        setMode('ALIGN'); // Po nahratí prepneme na zarovnávanie
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* --- A. HORNÝ PANEL (TOOLBAR) --- */}
      <div style={{ 
        height: '60px', background: '#111', color: 'white', display: 'flex', 
        alignItems: 'center', padding: '0 20px', justifyContent: 'space-between', borderBottom: '1px solid #333'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '18px', letterSpacing: '1px' }}>BASE44 <span style={{color:'#00ff9d'}}>STUDIO</span></div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          
          {/* KROK 1: ROZMERY */}
          <div style={{ display: 'flex', gap: '10px', fontSize: '14px', alignItems: 'center', background: '#222', padding: '5px 10px', borderRadius: '4px' }}>
            <span style={{color: '#888'}}>Rozmery (m):</span>
            <input 
              type="number" value={dimensions.width} step="0.5"
              onChange={e => setDimensions({...dimensions, width: parseFloat(e.target.value)})}
              style={inputStyle} placeholder="Šírka" title="Šírka"
            />
            <span>x</span>
            <input 
              type="number" value={dimensions.height} step="0.1"
              onChange={e => setDimensions({...dimensions, height: parseFloat(e.target.value)})}
              style={inputStyle} placeholder="Výška" title="Výška"
            />
            <span>x</span>
            <input 
              type="number" value={dimensions.depth} step="0.5"
              onChange={e => setDimensions({...dimensions, depth: parseFloat(e.target.value)})}
              style={inputStyle} placeholder="Hĺbka" title="Hĺbka"
            />
          </div>

          {/* KROK 2: PREPÍNAČ REŽIMOV */}
          <div style={{ display: 'flex', background: '#333', borderRadius: '5px', padding: '2px' }}>
             <button onClick={() => setMode('ALIGN')} style={mode === 'ALIGN' ? activeBtnStyle : btnStyle}>
               🛠 Zarovnať (Move)
             </button>
             <button onClick={() => setMode('DESIGN')} style={mode === 'DESIGN' ? activeBtnStyle : btnStyle}>
               🎨 Dizajn
             </button>
          </div>
        </div>

        {/* UPLOAD TLAČIDLO */}
        <label style={{ cursor: 'pointer', background: 'white', color: 'black', padding: '8px 15px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px' }}>
          {bgImage ? 'Zmeniť fotku' : 'Nahrať fotku pozemku'}
          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
        </label>
      </div>

      {/* --- B. HLAVNÁ PLOCHA (VIEWPORT) --- */}
      <div style={{ flex: 1, position: 'relative', background: '#e5e5e5' }}>
        
        {/* 1. FOTKA POZADIA */}
        {bgImage ? (
          <img 
            src={bgImage} 
            alt="Background" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 0 }} 
          />
        ) : (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#888', textAlign: 'center' }}>
            <h2>Začnite nahraním fotky</h2>
            <p>Následne vložíme 3D model, ktorý prispôsobíte.</p>
          </div>
        )}

        {/* 2. 3D SCÉNA (CANVAS) */}
        <Canvas shadows camera={{ position: [0, 5, 15], fov: 50 }} style={{ zIndex: 1, position: 'relative' }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
          <Environment preset="city" />

          {/* Hlavný objekt - Dom */}
          {/* Ak sme v móde ALIGN, obalíme dom do TransformControls, ktoré robia tie farebné šípky */}
          {mode === 'ALIGN' ? (
            <TransformControls mode="translate" ref={transformRef}>
               <HouseModel 
                  dimensions={dimensions} 
                  materialKey={activeMaterial} 
                  mode={mode} 
               />
            </TransformControls>
          ) : (
            // V móde DESIGN už ovládacie šípky zmiznú
            <group 
              position={transformRef.current?.worldPosition || [0,0,0]} 
              rotation={transformRef.current?.worldQuaternion || [0,0,0]}
              scale={transformRef.current?.worldScale || [1,1,1]}
            >
               <HouseModel 
                  dimensions={dimensions} 
                  materialKey={activeMaterial} 
                  mode={mode} 
               />
            </group>
          )}
          
          {/* OrbitControls umožňuje hýbať kamerou, keď práve neposúvame dom */}
          <OrbitControls makeDefault ref={controlsRef} enabled={mode === 'ALIGN'} />
          
          {/* Tiene na zemi pre lepší realizmus */}
          <ContactShadows position={[0, -dimensions.height/2, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        </Canvas>

        {/* 3. VÝBER MATERIÁLOV (Zobrazí sa len v móde DESIGN) */}
        {mode === 'DESIGN' && (
          <div style={{
            position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)', padding: '15px 25px', borderRadius: '50px', backdropFilter: 'blur(5px)',
            display: 'flex', gap: '15px', zIndex: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            {Object.keys(MATERIALS).map((key) => (
              <button 
                key={key}
                onClick={() => setActiveMaterial(key)}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%', border: activeMaterial === key ? '3px solid white' : '2px solid transparent',
                  background: MATERIALS[key].color, cursor: 'pointer', transition: 'all 0.2s',
                  position: 'relative'
                }}
                title={MATERIALS[key].name}
              />
            ))}
          </div>
        )}

        {/* NÁPOVEDA */}
        {mode === 'ALIGN' && bgImage && (
          <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '12px' }}>
            💡 Tip: Chyťte šípky a posuňte dom na miesto. Pravým tlačidlom myši otáčate kameru.
          </div>
        )}

      </div>
    </div>
  );
}

// --- ŠTÝLY (CSS-in-JS pre jednoduchosť) ---
const inputStyle = {
  background: 'transparent', border: 'none', borderBottom: '1px solid #555', 
  color: 'white', width: '40px', textAlign: 'center', fontSize: '14px'
};

const btnStyle = {
  background: 'transparent', border: 'none', color: '#aaa', 
  padding: '8px 15px', cursor: 'pointer', fontSize: '13px'
};

const activeBtnStyle = {
  ...btnStyle, background: '#444', color: 'white', fontWeight: 'bold', borderRadius: '4px'
};