import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { createBarn48Model } from './models/Barn48ProceduralModel';
import { 
  Rotate3d, 
  Sun, 
  Moon, 
  Sunset, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Camera, 
  Eye, 
  Sparkles, 
  Ruler, 
  Info,
  ChevronRight,
  Check,
  RefreshCw,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function House3DViewer({
  modelUrl = null,            // URL na nahraný fotorealistický .glb súbor
  initialFacade = 'standard', // 'standard', 'wood', 'stucco'
  initialExtension = 0,       // 0, 1.2, 2.4, 3.6, 4.8
  initialInterior = 'wood',   // 'wood', 'drywall'
  height = '580px',
  showControls = true,
  onConfigChange = null,
  className = ''
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Three.js objekty
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const houseGroupRef = useRef(null);
  const lightsGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Stavy konfigurátora 3D modelu
  const [facade, setFacade] = useState(initialFacade);
  const [extension, setExtension] = useState(initialExtension);
  const [interior, setInterior] = useState(initialInterior);
  const [extraBedroom, setExtraBedroom] = useState(false);
  const [roofCutaway, setRoofCutaway] = useState(0); // 0 = zatvorená, 1 = odklopená
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'day', 'sunset', 'night'
  const [showDimensions, setShowDimensions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCameraView, setActiveCameraView] = useState('perspective');
  const [isRotatingAuto, setIsRotatingAuto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileActiveTab, setMobileActiveTab] = useState(null); // 'facade' | 'interior' | 'length' | null
  const [showMobileViews, setShowMobileViews] = useState(false);

  // Synchronizácia z propsov
  useEffect(() => {
    if (initialFacade) setFacade(initialFacade);
  }, [initialFacade]);

  useEffect(() => {
    if (initialExtension !== undefined) setExtension(initialExtension);
  }, [initialExtension]);

  // Notifikácia rodičovského komponentu o zmene
  const notifyChange = useCallback((newFacade, newExt, newInt, newExtraBed) => {
    if (onConfigChange) {
      onConfigChange({
        facade: newFacade ?? facade,
        extension: newExt ?? extension,
        interior: newInt ?? interior,
        extraBedroom: newExtraBed ?? extraBedroom,
        totalLength: 8.0 + (newExt ?? extension),
        estimatedArea: Math.round(4.6 * (8.0 + (newExt ?? extension)))
      });
    }
  }, [facade, extension, interior, extraBedroom, onConfigChange]);

  // ── 1. INICIALIZÁCIA SCÉNY THREE.JS ──────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Scéna
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Kamera
    const width = container.clientWidth || 800;
    const heightPx = container.clientHeight || 550;
    const camera = new THREE.PerspectiveCamera(42, width / heightPx, 0.1, 1000);
    camera.position.set(13, 7, 16);
    camera.lookAt(0, 1.8, 0);
    cameraRef.current = camera;

    // WebGL Renderer s ACES Filmic ToneMapping a Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.03; // Zabráni prechodu pod zem
    controls.minDistance = 5;
    controls.maxDistance = 40;
    controls.target.set(0, 1.6, 0);
    controlsRef.current = controls;

    // Svetelná skupina
    const lightsGroup = new THREE.Group();
    lightsGroup.name = 'LightingRig';
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    // Podkladová doska / Shadow Catcher
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.25;
    ground.receiveShadow = true;
    scene.add(ground);

    // Jemná architektonická podlahová mriežka
    const grid = new THREE.GridHelper(30, 30, 0x94a3b8, 0xe2e8f0);
    grid.position.y = -0.24;
    grid.material.opacity = 0.45;
    grid.material.transparent = true;
    scene.add(grid);

    // Skupina pre dom
    const houseGroup = new THREE.Group();
    houseGroup.name = 'HouseContainer';
    scene.add(houseGroup);
    houseGroupRef.current = houseGroup;

    // Animačná slučka (Render Loop)
    let isRunning = true;
    const animate = () => {
      if (!isRunning) return;
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.autoRotate = isRotatingAuto;
        controlsRef.current.autoRotateSpeed = 1.8;
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();
    setIsLoading(false);

    // Resize listener
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // ── 2. AKTUALIZÁCIA OSVETLENIA & PROSTREDIA PODĽA ČASU DŇA ────────────────────

  useEffect(() => {
    const scene = sceneRef.current;
    const lights = lightsGroupRef.current;
    if (!scene || !lights) return;

    // Vyčistenie starých svetiel
    while (lights.children.length > 0) {
      lights.remove(lights.children[0]);
    }

    if (timeOfDay === 'day') {
      scene.background = new THREE.Color(0xf1f5f9);

      const hemi = new THREE.HemisphereLight(0xffffff, 0xdfe6ee, 0.75);
      lights.add(hemi);

      const sun = new THREE.DirectionalLight(0xffffff, 1.25);
      sun.position.set(15, 22, 12);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 2048;
      sun.shadow.mapSize.height = 2048;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 60;
      sun.shadow.camera.left = -15;
      sun.shadow.camera.right = 15;
      sun.shadow.camera.top = 15;
      sun.shadow.camera.bottom = -15;
      sun.shadow.bias = -0.0003;
      lights.add(sun);

      const fill = new THREE.DirectionalLight(0xb0c4de, 0.4);
      fill.position.set(-15, 10, -10);
      lights.add(fill);

    } else if (timeOfDay === 'sunset') {
      scene.background = new THREE.Color(0x1a162b);

      const hemi = new THREE.HemisphereLight(0xff9955, 0x332244, 0.65);
      lights.add(hemi);

      const sun = new THREE.DirectionalLight(0xff7733, 1.6);
      sun.position.set(18, 9, 14);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 2048;
      sun.shadow.mapSize.height = 2048;
      sun.shadow.bias = -0.0003;
      lights.add(sun);

      const fill = new THREE.DirectionalLight(0x7755aa, 0.4);
      fill.position.set(-15, 8, -12);
      lights.add(fill);

    } else {
      // Noc
      scene.background = new THREE.Color(0x0a0c14);

      const hemi = new THREE.HemisphereLight(0x334466, 0x111625, 0.35);
      lights.add(hemi);

      const moon = new THREE.DirectionalLight(0x6688cc, 0.45);
      moon.position.set(12, 18, 10);
      moon.castShadow = true;
      moon.shadow.mapSize.width = 1024;
      moon.shadow.mapSize.height = 1024;
      lights.add(moon);
    }
  }, [timeOfDay]);

  // ── 3. PRESTAVBA 3D MODELU DOMU PRI ZMENE KONFIGURÁCIE ────────────────────────

  useEffect(() => {
    const houseContainer = houseGroupRef.current;
    if (!houseContainer) return;

    // Odstránenie predchádzajúceho modelu
    while (houseContainer.children.length > 0) {
      const obj = houseContainer.children[0];
      houseContainer.remove(obj);
    }

    if (modelUrl) {
      // Načítanie fotorealistického .glb súboru
      setIsLoading(true);
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          houseContainer.add(model);
          setIsLoading(false);
        },
        undefined,
        (err) => {
          console.error('Chyba načítania .glb:', err);
          // Fallback na procedurálny model
          const barnModel = createBarn48Model({
            facade,
            extension,
            roofCutaway,
            timeOfDay,
            interiorType: interior,
            extraBedroom
          });
          houseContainer.add(barnModel);
          setIsLoading(false);
        }
      );
    } else {
      // Vygenerovanie nového modelu Barn 48 s aktuálnymi parametrami
      const barnModel = createBarn48Model({
        facade,
        extension,
        roofCutaway,
        timeOfDay,
        interiorType: interior,
        extraBedroom
      });
      houseContainer.add(barnModel);
    }

    // Pridanie 3D kót / Rozmerových vodiacich čiar a textových štítkov
    if (showDimensions) {
      const dimGroup = new THREE.Group();
      dimGroup.name = 'Dimensions3D';

      const houseW = 4.6;
      const porchD = 1.3;
      const bodyL = 6.7 + extension;
      const totalLen = 8.0 + extension;
      const ridgeH = 4.0;

      // Pomocná funkcia pre 3D textový odznak (Sprite)
      const createTextBadge = (text, bgColor = '#1e293b', textColor = '#ffffff') => {
        const canvas = document.createElement('canvas');
        canvas.width = 380;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');

        // Zaoblený obdĺžnik (Pill badge)
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(10, 10, 360, 80, 24);
        ctx.fill();

        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.stroke();

        // Text
        ctx.fillStyle = textColor;
        ctx.font = 'bold 36px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 190, 50);

        const tex = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(2.4, 0.65, 1.0);
        return sprite;
      };

      // 1. Kóta ŠÍRKY (Predné čelo: 4.6 m)
      const wLineMat = new THREE.LineBasicMaterial({ color: 0x2563eb, linewidth: 3 });
      const wPoints = [
        new THREE.Vector3(-houseW / 2, 0.15, totalLen / 2 + 0.8),
        new THREE.Vector3(houseW / 2, 0.15, totalLen / 2 + 0.8)
      ];
      const wLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wPoints), wLineMat);
      dimGroup.add(wLine);

      const wBadge = createTextBadge('↔ Šírka: 4,6 m', '#2563eb');
      wBadge.position.set(0, 0.6, totalLen / 2 + 0.8);
      dimGroup.add(wBadge);

      // 2. Kóta OBYTNEJ ČASTI (Bočná strana: 6.7 m + extension)
      const lenLineMat = new THREE.LineBasicMaterial({ color: 0xdc2626, linewidth: 3 });
      const lenPoints = [
        new THREE.Vector3(-houseW / 2 - 0.7, 0.15, -totalLen / 2),
        new THREE.Vector3(-houseW / 2 - 0.7, 0.15, totalLen / 2 - porchD)
      ];
      const lenLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(lenPoints), lenLineMat);
      dimGroup.add(lenLine);

      const lenBadge = createTextBadge(`⤢ Obytná časť: ${bodyL.toFixed(1)} m`, '#dc2626');
      lenBadge.position.set(-houseW / 2 - 0.8, 0.6, (-totalLen / 2 + totalLen / 2 - porchD) / 2);
      dimGroup.add(lenBadge);

      // 3. Kóta KRYTEJ TERASY (Bočná strana: 1.3 m)
      const porchLineMat = new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 3 });
      const porchPoints = [
        new THREE.Vector3(-houseW / 2 - 0.7, 0.15, totalLen / 2 - porchD),
        new THREE.Vector3(-houseW / 2 - 0.7, 0.15, totalLen / 2)
      ];
      const porchLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(porchPoints), porchLineMat);
      dimGroup.add(porchLine);

      const porchBadge = createTextBadge('⤢ Terasa: 1,3 m', '#d97706');
      porchBadge.position.set(-houseW / 2 - 0.8, 0.6, totalLen / 2 - porchD / 2);
      dimGroup.add(porchBadge);

      // 4. Kóta VÝŠKY HREBEŇA (4.0 m)
      const hLineMat = new THREE.LineBasicMaterial({ color: 0x059669, linewidth: 3 });
      const hPoints = [
        new THREE.Vector3(houseW / 2 + 0.6, 0, totalLen / 2 + 0.1),
        new THREE.Vector3(houseW / 2 + 0.6, ridgeH, totalLen / 2 + 0.1)
      ];
      const hLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(hPoints), hLineMat);
      dimGroup.add(hLine);

      const hBadge = createTextBadge(`↕ Výška: ${ridgeH.toFixed(1)} m`, '#059669');
      hBadge.position.set(houseW / 2 + 1.2, ridgeH / 2, totalLen / 2 + 0.1);
      dimGroup.add(hBadge);

      houseContainer.add(dimGroup);
    }
  }, [facade, extension, roofCutaway, timeOfDay, interior, showDimensions, extraBedroom]);

  // ── 4. KAMEROVÉ PREDNASTAVENIA ────────────────────────────────────────────────

  const setCameraView = (view) => {
    setActiveCameraView(view);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    controls.target.set(0, 1.4, 0);

    const totalLen = 8.0 + extension;

    switch (view) {
      case 'front':
        camera.position.set(0, 2.0, totalLen / 2 + 7.5);
        break;
      case 'side':
        camera.position.set(-13, 2.6, 0);
        break;
      case 'top':
        camera.position.set(0, 18, 0.1);
        break;
      case 'interior':
        // Kamera vo vnútri obývačky s výhľadom na kuchyňu a mezonet
        controls.target.set(0, 1.6, -1.8);
        camera.position.set(0, 1.5, 2.2);
        break;
      case 'perspective':
      default:
        camera.position.set(12, 6.5, 14);
        break;
    }
    controls.update();
  };

  // ── 5. EXPORT VIZUALIZÁCIE (SCREENSHOT) ────────────────────────────────────────

  const takeScreenshot = () => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    try {
      const dataUrl = renderer.domElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Barn48_3D_Konfiguracia_${facade}_${8.0 + extension}m.png`;
      link.href = dataUrl;
      link.click();
      toast.success('3D vizualizácia bola úspešne stiahnutá!');
    } catch (e) {
      toast.error('Nepodarilo sa vytvoriť screenshot.');
    }
  };

  // Prepočet celkovej plochy a rozmerov
  const currentLength = (8.0 + extension).toFixed(1);
  const currentArea = Math.round(4.6 * (8.0 + extension));

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-slate-950 select-none h-[520px] md:h-[650px] ${className}`}
      style={isFullscreen ? { height: '100vh' } : {}}
    >
      {/* 3D WebGL Plátno */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md text-white z-50">
          <RefreshCw className="w-8 h-8 animate-spin text-red-500 mb-3" />
          <p className="font-bold text-sm tracking-wide">Načítavam 3D model Barn 48...</p>
        </div>
      )}

      {/* HORNÝ HUD PANEL (Názov, Plocha, Režim Dňa & Tlačidlá) */}
      <div className="absolute top-3 md:top-4 left-3 md:left-4 right-3 md:right-4 flex items-center justify-between pointer-events-none z-20">
        
        {/* Info Box o dome (Desktop & Mobile) */}
        <div className="flex items-center gap-2 md:gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-2.5 md:px-4 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-lg pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="font-black text-slate-900 dark:text-white text-xs md:text-sm">Barn 48</span>
              <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[9px] md:text-[10px] py-0 px-1.5 md:px-2 font-black">
                3D LIVE
              </Badge>
            </div>
            <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              4.8m × {currentLength}m • <strong>~{currentArea} m²</strong>
            </p>
          </div>
        </div>

        {/* Mobilný výber pohľadu (Iba mobil) */}
        <div className="relative flex md:hidden pointer-events-auto ml-1">
          <button
            onClick={() => setShowMobileViews(!showMobileViews)}
            className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-2.5 py-2 rounded-xl border border-slate-200/60 dark:border-white/10 shadow-lg text-xs font-bold text-slate-800 dark:text-white"
          >
            <Eye className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[11px] font-bold">
              {activeCameraView === 'perspective' && '3D Orbit'}
              {activeCameraView === 'front' && 'Štít'}
              {activeCameraView === 'side' && 'Bok'}
              {activeCameraView === 'top' && 'Pôdorys'}
              {activeCameraView === 'interior' && 'Interiér'}
            </span>
            <span className="text-[9px] text-slate-400">▾</span>
          </button>

          {showMobileViews && (
            <div className="absolute top-full left-0 mt-1.5 flex flex-col gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-2xl z-30 min-w-[130px]">
              <button
                onClick={() => { setCameraView('perspective'); setShowMobileViews(false); }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left ${activeCameraView === 'perspective' ? 'bg-red-500 text-white' : 'text-slate-700 dark:text-slate-300'}`}
              >
                3D Orbit
              </button>
              <button
                onClick={() => { setCameraView('front'); setShowMobileViews(false); }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left ${activeCameraView === 'front' ? 'bg-red-500 text-white' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Štít / Terasa
              </button>
              <button
                onClick={() => { setCameraView('side'); setShowMobileViews(false); }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left ${activeCameraView === 'side' ? 'bg-red-500 text-white' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Bočná stena
              </button>
              <button
                onClick={() => { setCameraView('top'); setShowMobileViews(false); }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left ${activeCameraView === 'top' ? 'bg-red-500 text-white' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Pôdorys zhora
              </button>
              <button
                onClick={() => {
                  setRoofCutaway(roofCutaway > 0 ? 0 : 1);
                  setCameraView('interior');
                  setShowMobileViews(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left flex items-center gap-1 ${activeCameraView === 'interior' ? 'bg-amber-500 text-white' : 'text-amber-600 dark:text-amber-400'}`}
              >
                🛋️ Interiér
              </button>
            </div>
          )}
        </div>

        {/* Rýchle ovládanie (Deň/Noc, Auto-rotácia, Screenshot, Fullscreen) */}
        <div className="flex items-center gap-1 md:gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-lg pointer-events-auto">
          
          {/* Čas dňa */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 md:p-1 rounded-lg md:rounded-xl gap-0.5 md:gap-1">
            <button
              onClick={() => setTimeOfDay('day')}
              className={`p-1 md:p-1.5 rounded-md md:rounded-lg transition-all ${timeOfDay === 'day' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Denné svetlo"
            >
              <Sun className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => setTimeOfDay('sunset')}
              className={`p-1 md:p-1.5 rounded-md md:rounded-lg transition-all ${timeOfDay === 'sunset' ? 'bg-white dark:bg-slate-700 text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Západ slnka (Golden Hour)"
            >
              <Sunset className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => setTimeOfDay('night')}
              className={`p-1 md:p-1.5 rounded-md md:rounded-lg transition-all ${timeOfDay === 'night' ? 'bg-white dark:bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Nočný režim s osvetlením"
            >
              <Moon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>

          <div className="hidden md:block w-[1px] h-6 bg-slate-200 dark:bg-white/10" />

          {/* Auto-rotácia */}
          <button
            onClick={() => setIsRotatingAuto(!isRotatingAuto)}
            className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${isRotatingAuto ? 'bg-red-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="Automatické otáčanie"
          >
            <Rotate3d className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isRotatingAuto ? 'animate-spin' : ''}`} />
          </button>

          {/* Kóty (Desktop) */}
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`hidden md:block p-2 rounded-xl transition-all ${showDimensions ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="Zobraziť 3D rozmery"
          >
            <Ruler className="w-4 h-4" />
          </button>

          {/* Screenshot (Desktop) */}
          <button
            onClick={takeScreenshot}
            className="hidden md:block p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Stiahnuť 3D obrázok"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 md:p-2 rounded-lg md:rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title={isFullscreen ? 'Zmenšiť' : 'Celá obrazovka'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Maximize2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          </button>
        </div>
      </div>

      {/* ĽAVÝ PANEL: KAMEROVÉ UHOLOVÉ PREDVOĽBY (DESKTOP) */}
      <div className="hidden md:flex absolute left-4 top-24 flex-col gap-1.5 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-lg pointer-events-auto z-20">
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 py-0.5 text-center">Pohľad</span>
        <button
          onClick={() => setCameraView('perspective')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left ${activeCameraView === 'perspective' ? 'bg-red-500 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          3D Orbit
        </button>
        <button
          onClick={() => setCameraView('front')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left ${activeCameraView === 'front' ? 'bg-red-500 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Štít / Terasa
        </button>
        <button
          onClick={() => setCameraView('side')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left ${activeCameraView === 'side' ? 'bg-red-500 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Bočná stena
        </button>
        <button
          onClick={() => setCameraView('top')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left ${activeCameraView === 'top' ? 'bg-red-500 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Pôdorys zhora
        </button>
        <button
          onClick={() => {
            setRoofCutaway(roofCutaway > 0 ? 0 : 1);
            setCameraView('interior');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-1.5 ${activeCameraView === 'interior' ? 'bg-amber-500 text-white shadow-md' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'}`}
        >
          <span>🛋️ Interiér</span>
        </button>
      </div>

      {/* ── DOLNÝ KONFIGURAČNÝ PANEL (DESKTOP) ── */}
      {showControls && (
        <div className="hidden md:flex absolute bottom-4 left-4 right-4 items-center justify-between gap-3 pointer-events-none z-20">
          
          {/* Výber materiálu fasády */}
          <div className="flex flex-wrap items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-2 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-xl pointer-events-auto">
            <span className="text-xs font-black text-slate-800 dark:text-white px-2">Fasáda:</span>
            
            <button
              onClick={() => {
                setFacade('standard');
                notifyChange('standard', extension, interior);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                facade === 'standard'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-[#828b96] border border-amber-500" />
              Svetlosivý plech + Drevo
            </button>

            <button
              onClick={() => {
                setFacade('wood');
                notifyChange('wood', extension, interior);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                facade === 'wood'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-[#d8a164]" />
              Smrekové drevo
            </button>

            <button
              onClick={() => {
                setFacade('stucco');
                notifyChange('stucco', extension, interior);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                facade === 'stucco'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-[#f5f3ee] border border-slate-400" />
              Biela omietka
            </button>
          </div>

          {/* Výber materiálu stien interiéru */}
          <div className="flex flex-wrap items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-2 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-xl pointer-events-auto">
            <span className="text-xs font-black text-slate-800 dark:text-white px-2">Interiér:</span>
            
            <button
              onClick={() => {
                setInterior('wood');
                notifyChange(facade, extension, 'wood');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                interior !== 'drywall'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-[#deb887] border border-amber-600" />
              Tatranský profil
            </button>

            <button
              onClick={() => {
                setInterior('drywall');
                notifyChange(facade, extension, 'drywall');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                interior === 'drywall'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-[#f8f9fa] border border-slate-400" />
              Biely sadrokartón
            </button>
          </div>

          {/* Predĺženie domu & Exploded View */}
          <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-2 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-xl pointer-events-auto">
            
            <span className="text-xs font-black text-slate-800 dark:text-white px-2">Dĺžka:</span>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              {[
                { val: 0, label: 'Základ (6.5m+1.3m)' },
                { val: 1.3, label: '+1.3m' },
                { val: 2.6, label: '+2.6m' },
                { val: 3.9, label: '+3.9m' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => {
                    setExtension(opt.val);
                    const nextExtra = opt.val >= 3.9 ? extraBedroom : false;
                    if (opt.val < 3.9) setExtraBedroom(false);
                    notifyChange(facade, opt.val, interior, nextExtra);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    extension === opt.val
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10 mx-1" />

            {/* Cutaway / Odklopenie strechy */}
            <button
              onClick={() => setRoofCutaway(roofCutaway === 0 ? 1 : 0)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                roofCutaway > 0
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300'
              }`}
              title="Zdvihnúť strechu a prezrieť si vnútornú dispozíciu a mezanín"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{roofCutaway > 0 ? 'Zatvoriť strechu' : 'Dispozícia (3D)'}</span>
            </button>
          </div>

          {/* Možnosť pridania 2. Spálne pri +3.9 m */}
          {extension >= 3.9 && (
            <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-2 rounded-2xl border border-red-500/40 shadow-xl pointer-events-auto">
              <span className="text-xs font-black text-slate-800 dark:text-white px-1">Dispozícia pri +3.9m:</span>
              <button
                onClick={() => {
                  const nextVal = !extraBedroom;
                  setExtraBedroom(nextVal);
                  notifyChange(facade, extension, interior, nextVal);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  extraBedroom
                    ? 'bg-red-500 text-white border-red-600 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300'
                }`}
                title="Pridať 2. spálňu so spoločnou stenou k pôvodnej spálni"
              >
                <span>{extraBedroom ? '🛏️ +1 Spálňa navyše (Aktívna)' : '🛋️ Veľká obývačka'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── ELEGANTNÝ KOMPAKTNÝ DOCK (IBA MOBIL) ── */}
      {showControls && (
        <div className="flex md:hidden absolute bottom-3 left-3 right-3 flex-col gap-2 pointer-events-none z-20">
          
          {/* Sub-panel pre zvolenú kategóriu */}
          <AnimatePresence>
            {mobileActiveTab === 'facade' && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className="flex items-center justify-between gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl pointer-events-auto"
              >
                <button
                  onClick={() => { setFacade('standard'); notifyChange('standard', extension, interior); }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all border ${
                    facade === 'standard' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#828b96]" />
                  <span>Plech+Drevo</span>
                </button>
                <button
                  onClick={() => { setFacade('wood'); notifyChange('wood', extension, interior); }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all border ${
                    facade === 'wood' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#d8a164]" />
                  <span>Drevo</span>
                </button>
                <button
                  onClick={() => { setFacade('stucco'); notifyChange('stucco', extension, interior); }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all border ${
                    facade === 'stucco' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f5f3ee] border border-slate-300" />
                  <span>Omietka</span>
                </button>
              </motion.div>
            )}

            {mobileActiveTab === 'interior' && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className="flex items-center justify-between gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl pointer-events-auto"
              >
                <button
                  onClick={() => { setInterior('wood'); notifyChange(facade, extension, 'wood'); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border ${
                    interior !== 'drywall' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#deb887]" />
                  <span>Tatranský profil</span>
                </button>
                <button
                  onClick={() => { setInterior('drywall'); notifyChange(facade, extension, 'drywall'); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border ${
                    interior === 'drywall' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f8f9fa] border border-slate-300" />
                  <span>Sadrokartón</span>
                </button>
              </motion.div>
            )}

            {mobileActiveTab === 'length' && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className="flex flex-col gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl pointer-events-auto"
              >
                <div className="flex items-center justify-between gap-1">
                  {[
                    { val: 0, label: 'Základ' },
                    { val: 1.3, label: '+1.3m' },
                    { val: 2.6, label: '+2.6m' },
                    { val: 3.9, label: '+3.9m' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => {
                        setExtension(opt.val);
                        const nextExtra = opt.val >= 3.9 ? extraBedroom : false;
                        if (opt.val < 3.9) setExtraBedroom(false);
                        notifyChange(facade, opt.val, interior, nextExtra);
                      }}
                      className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        extension === opt.val
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {extension >= 3.9 && (
                  <button
                    onClick={() => {
                      const nextVal = !extraBedroom;
                      setExtraBedroom(nextVal);
                      notifyChange(facade, extension, interior, nextVal);
                    }}
                    className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border flex items-center justify-center gap-1.5 ${
                      extraBedroom
                        ? 'bg-red-500 text-white border-red-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <span>{extraBedroom ? '🛏️ +1 Spálňa navyše (Aktívna)' : '🛋️ Veľká obývačka (Kliknite pre +1 Spálňu)'}</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hlavný mobilný dok s kategóriami */}
          <div className="flex items-center justify-between gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl pointer-events-auto">
            <button
              onClick={() => setMobileActiveTab(mobileActiveTab === 'facade' ? null : 'facade')}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-black transition-all ${
                mobileActiveTab === 'facade' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>🎨 Fasáda</span>
            </button>

            <button
              onClick={() => setMobileActiveTab(mobileActiveTab === 'interior' ? null : 'interior')}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-black transition-all ${
                mobileActiveTab === 'interior' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>🪵 Interiér</span>
            </button>

            <button
              onClick={() => setMobileActiveTab(mobileActiveTab === 'length' ? null : 'length')}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-black transition-all ${
                mobileActiveTab === 'length' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>📏 {extension > 0 ? `+${extension}m` : 'Dĺžka'}</span>
            </button>

            <button
              onClick={() => {
                const nextVal = roofCutaway > 0 ? 0 : 1;
                setRoofCutaway(nextVal);
                if (nextVal > 0) setCameraView('interior');
              }}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-black transition-all ${
                roofCutaway > 0 ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{roofCutaway > 0 ? 'Zatvoriť' : '3D'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mini Návod / Tip v pravom dolnom rohu (Iba Desktop) */}
      <div className="hidden md:block absolute bottom-20 right-4 pointer-events-none z-10 opacity-70 hover:opacity-100 transition-opacity">
        <div className="bg-black/50 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-2">
          <span>🖱️ Ťahaním otáčate • Kolieskom približujete</span>
        </div>
      </div>
    </div>
  );
}
