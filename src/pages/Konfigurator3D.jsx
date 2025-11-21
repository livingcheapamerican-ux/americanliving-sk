import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Upload, Home, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

const MATERIALS = {
  'omietka_biela': { name: 'Biela Omietka', color: 0xffffff },
  'antracit': { name: 'Antracit', color: 0x2b2b2b },
  'drevo_svetle': { name: 'Smrek Svetlý', color: 0xe3cba3 },
  'drevo_tmave': { name: 'Dub Tmavý', color: 0x5c4033 },
};

const ROOF_TYPES = {
  'flat': 'Rovná strecha',
  'gable': 'Sedlová strecha',
  'hip': 'Valbová strecha'
};

export default function Konfigurator3D() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const houseGroupRef = useRef(null);
  const animationIdRef = useRef(null);

  const [bgImage, setBgImage] = useState(null);
  const [mode, setMode] = useState('SETUP');
  const [dimensions, setDimensions] = useState({ width: 8.0, height: 3.0, depth: 6.0 });
  const [activeMaterial, setActiveMaterial] = useState('omietka_biela');
  const [roofType, setRoofType] = useState('gable');
  const [windows, setWindows] = useState([]);
  const [doors, setDoors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Inicializácia Three.js scény
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe5e5e5);
    sceneRef.current = scene;

    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 8, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvas, 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -dimensions.height / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const houseGroup = new THREE.Group();
    houseGroupRef.current = houseGroup;
    scene.add(houseGroup);

    const animate = () => {
      if (!renderer || !scene || !camera) return;
      animationIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !camera || !renderer) return;
      const width = canvas.clientWidth || 800;
      const height = canvas.clientHeight || 600;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }
      if (scene) {
        scene.clear();
      }
    };
  }, []);

  // Aktualizácia domu pri zmene parametrov
  useEffect(() => {
    const houseGroup = houseGroupRef.current;
    if (!houseGroup || !sceneRef.current) return;

    while (houseGroupRef.current.children.length > 0) {
      houseGroupRef.current.remove(houseGroupRef.current.children[0]);
    }

    const material = new THREE.MeshStandardMaterial({
      color: MATERIALS[activeMaterial].color,
      roughness: 0.8,
      metalness: 0.1
    });

    // Hlavná stena
    const wallGeometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
    const wallMesh = new THREE.Mesh(wallGeometry, material);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    houseGroupRef.current.add(wallMesh);

    // Strecha
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });
    let roofMesh;

    if (roofType === 'flat') {
      const roofGeometry = new THREE.BoxGeometry(dimensions.width + 0.5, 0.3, dimensions.depth + 0.5);
      roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
      roofMesh.position.y = dimensions.height / 2 + 0.15;
    } else if (roofType === 'gable') {
      const roofGeometry = new THREE.ConeGeometry(dimensions.width * 0.7, 2, 4);
      roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
      roofMesh.rotation.y = Math.PI / 4;
      roofMesh.position.y = dimensions.height / 2 + 1;
    } else if (roofType === 'hip') {
      const roofGeometry = new THREE.ConeGeometry(dimensions.width * 0.6, 1.8, 4);
      roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
      roofMesh.rotation.y = Math.PI / 4;
      roofMesh.position.y = dimensions.height / 2 + 0.9;
    }

    if (roofMesh) {
      roofMesh.castShadow = true;
      houseGroupRef.current.add(roofMesh);
    }

    // Okná
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x87ceeb, 
      metalness: 0.8, 
      roughness: 0.2,
      transparent: true,
      opacity: 0.6
    });

    windows.forEach(win => {
      const windowGeometry = new THREE.BoxGeometry(win.width, win.height, 0.1);
      const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
      windowMesh.position.set(win.x, win.y, dimensions.depth / 2 + 0.05);
      houseGroupRef.current.add(windowMesh);
    });

    // Dvere
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    doors.forEach(door => {
      const doorGeometry = new THREE.BoxGeometry(door.width, door.height, 0.1);
      const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
      doorMesh.position.set(door.x, door.y, dimensions.depth / 2 + 0.05);
      houseGroupRef.current.add(doorMesh);
    });

  }, [dimensions, activeMaterial, roofType, windows, doors]);

  // Ovládanie kamery myšou
  const handleMouseDown = (e) => {
    if (mode !== 'ALIGN') return;
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !cameraRef.current) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    if (e.buttons === 1) {
      const angle = deltaX * 0.01;
      const radius = Math.sqrt(cameraRef.current.position.x ** 2 + cameraRef.current.position.z ** 2);
      const currentAngle = Math.atan2(cameraRef.current.position.z, cameraRef.current.position.x);
      const newAngle = currentAngle + angle;
      
      cameraRef.current.position.x = radius * Math.cos(newAngle);
      cameraRef.current.position.z = radius * Math.sin(newAngle);
      cameraRef.current.lookAt(0, 0, 0);
    }

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBgImage(ev.target.result);
        setMode('ALIGN');
      };
      reader.readAsDataURL(file);
    }
  };

  const addWindow = () => {
    setWindows([...windows, { 
      x: 0, 
      y: 0, 
      width: 1.2, 
      height: 1.5 
    }]);
    toast.success('Okno pridané');
  };

  const addDoor = () => {
    setDoors([...doors, { 
      x: -2, 
      y: -dimensions.height / 2 + 1, 
      width: 1.0, 
      height: 2.0 
    }]);
    toast.success('Dvere pridané');
  };

  const saveConfiguration = () => {
    const config = {
      dimensions,
      activeMaterial,
      roofType,
      windows,
      doors,
      bgImage,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('house_3d_config', JSON.stringify(config));
    toast.success('Konfigurácia uložená');
  };

  const loadConfiguration = () => {
    const saved = localStorage.getItem('house_3d_config');
    if (saved) {
      const config = JSON.parse(saved);
      setDimensions(config.dimensions);
      setActiveMaterial(config.activeMaterial);
      setRoofType(config.roofType);
      setWindows(config.windows || []);
      setDoors(config.doors || []);
      if (config.bgImage) setBgImage(config.bgImage);
      toast.success('Konfigurácia načítaná');
    } else {
      toast.error('Žiadna uložená konfigurácia');
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      {/* Horný panel */}
      <div className="h-16 bg-gray-900 text-white flex items-center justify-between px-6 shadow-lg">
        <div className="flex items-center gap-3">
          <Home className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">3D Konfigurátor Domu</h1>
        </div>

        <div className="flex gap-3">
          <Button onClick={saveConfiguration} variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
            <Save className="w-4 h-4 mr-2" />
            Uložiť
          </Button>
          <Button onClick={loadConfiguration} variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
            <Upload className="w-4 h-4 mr-2" />
            Načítať
          </Button>
          <label className="cursor-pointer">
            <Button variant="default" className="bg-primary hover:bg-primary/90">
              <Maximize2 className="w-4 h-4 mr-2" />
              {bgImage ? 'Zmeniť pozadie' : 'Nahrať pozadie'}
            </Button>
            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Bočný panel */}
        <div className="w-80 bg-white shadow-lg overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Režim */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Režim</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setMode('ALIGN')} 
                  variant={mode === 'ALIGN' ? 'default' : 'outline'}
                  className="flex-1"
                  size="sm"
                >
                  Zarovnať
                </Button>
                <Button 
                  onClick={() => setMode('DESIGN')} 
                  variant={mode === 'DESIGN' ? 'default' : 'outline'}
                  className="flex-1"
                  size="sm"
                >
                  Dizajn
                </Button>
              </div>
            </Card>

            {/* Rozmery */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Rozmery (m)</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-600">Šírka</label>
                  <input 
                    type="number" 
                    value={dimensions.width} 
                    step="0.5"
                    onChange={e => setDimensions({...dimensions, width: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Výška</label>
                  <input 
                    type="number" 
                    value={dimensions.height} 
                    step="0.1"
                    onChange={e => setDimensions({...dimensions, height: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Hĺbka</label>
                  <input 
                    type="number" 
                    value={dimensions.depth} 
                    step="0.5"
                    onChange={e => setDimensions({...dimensions, depth: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
            </Card>

            {/* Typ strechy */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Typ strechy</h3>
              <Select value={roofType} onValueChange={setRoofType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROOF_TYPES).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Materiál */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Materiál fasády</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(MATERIALS).map(([key, mat]) => (
                  <button
                    key={key}
                    onClick={() => setActiveMaterial(key)}
                    className={`p-3 rounded border-2 transition-all ${
                      activeMaterial === key ? 'border-primary' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: `#${mat.color.toString(16).padStart(6, '0')}` }}
                    title={mat.name}
                  >
                    <span className="text-xs font-medium" style={{ 
                      color: mat.color > 0x888888 ? '#000' : '#fff',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      {mat.name}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Okná a dvere */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Prvky</h3>
              <div className="space-y-2">
                <Button onClick={addWindow} variant="outline" className="w-full">
                  + Pridať okno ({windows.length})
                </Button>
                <Button onClick={addDoor} variant="outline" className="w-full">
                  + Pridať dvere ({doors.length})
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          {bgImage && (
            <img 
              src={bgImage} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          
          {mode === 'ALIGN' && bgImage && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              💡 Ťahajte myšou pre rotáciu kamery
            </div>
          )}
        </div>
      </div>
    </div>
  );
}