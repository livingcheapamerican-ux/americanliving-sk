import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function House3DPreview({ config }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const houseGroupRef = useRef(null);

  // Farby a materiály na základe konfigurácie
  const materials = useMemo(() => {
    // Fasáda
    let fasadaColor = 0x8B7355; // drevo hnedá
    if (config.vonkajsiaFasada === "suchana") {
      fasadaColor = 0xE8E0D5; // biela omietka
    }

    // Okná
    let oknaColor = 0xFFFFFF; // biele
    if (config.povrchokaOkien) {
      oknaColor = 0x3D3D3D; // antracit
    }

    // Sklo
    let skloColor = 0x87CEEB;
    let skloOpacity = 0.4;
    if (config.tonovaneSkla) {
      skloColor = 0x2F4F4F;
      skloOpacity = 0.6;
    }

    // Strecha
    const strechaColor = 0x2C2C2C; // antracit plech

    return {
      fasada: new THREE.MeshStandardMaterial({ color: fasadaColor, roughness: 0.8 }),
      strecha: new THREE.MeshStandardMaterial({ color: strechaColor, metalness: 0.3, roughness: 0.4 }),
      oknaRam: new THREE.MeshStandardMaterial({ color: oknaColor, roughness: 0.3 }),
      sklo: new THREE.MeshStandardMaterial({ 
        color: skloColor, 
        transparent: true, 
        opacity: skloOpacity,
        roughness: 0.1,
        metalness: 0.1
      }),
      podlaha: new THREE.MeshStandardMaterial({ color: 0x4A4A4A, roughness: 0.9 }),
      terasa: new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.7 }),
      pergola: new THREE.MeshStandardMaterial({ color: 0x5D4E37, roughness: 0.6 }),
      zaklady: new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9 }),
    };
  }, [config.vonkajsiaFasada, config.povrchokaOkien, config.tonovaneSkla]);

  // Inicializácia scény
  useEffect(() => {
    if (!containerRef.current) return;

    // Scéna
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);
    sceneRef.current = scene;

    // Kamera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(20, 12, 20);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ovládanie
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2.1;
    controlsRef.current = controls;

    // Svetlá
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Podlaha/zem
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x7CBA5C, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Skupina pre dom
    const houseGroup = new THREE.Group();
    scene.add(houseGroup);
    houseGroupRef.current = houseGroup;

    // Animačná slučka
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Aktualizácia domu pri zmene konfigurácie
  useEffect(() => {
    if (!houseGroupRef.current) return;

    // Vyčistiť existujúci dom
    while (houseGroupRef.current.children.length > 0) {
      const child = houseGroupRef.current.children[0];
      houseGroupRef.current.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    const group = houseGroupRef.current;

    // Rozmery Flat Double (142m² zastavaná, tvar L)
    const mainWidth = 12;  // šírka hlavnej časti
    const mainDepth = 8;   // hĺbka hlavnej časti
    const mainHeight = 3.2;
    
    const wingWidth = 6;   // šírka krídla
    const wingDepth = 6;   // hĺbka krídla
    
    // Výška základov
    let zakladyHeight = 0;
    if (config.zaklady === "skrutky") zakladyHeight = 0.6;
    else if (config.zaklady === "doska") zakladyHeight = 0.3;
    else if (config.zaklady === "pasove") zakladyHeight = 0.8;

    // Základy
    if (zakladyHeight > 0) {
      // Hlavná časť základy
      const zakladyMainGeo = new THREE.BoxGeometry(mainWidth, zakladyHeight, mainDepth);
      const zakladyMain = new THREE.Mesh(zakladyMainGeo, materials.zaklady);
      zakladyMain.position.set(0, zakladyHeight / 2, 0);
      zakladyMain.castShadow = true;
      zakladyMain.receiveShadow = true;
      group.add(zakladyMain);

      // Krídlo základy
      const zakladyWingGeo = new THREE.BoxGeometry(wingWidth, zakladyHeight, wingDepth);
      const zakladyWing = new THREE.Mesh(zakladyWingGeo, materials.zaklady);
      zakladyWing.position.set(mainWidth / 2 + wingWidth / 2, zakladyHeight / 2, -mainDepth / 2 + wingDepth / 2);
      zakladyWing.castShadow = true;
      group.add(zakladyWing);
    }

    const baseY = zakladyHeight;

    // Hlavná časť domu
    const mainGeo = new THREE.BoxGeometry(mainWidth, mainHeight, mainDepth);
    const mainHouse = new THREE.Mesh(mainGeo, materials.fasada);
    mainHouse.position.set(0, baseY + mainHeight / 2, 0);
    mainHouse.castShadow = true;
    mainHouse.receiveShadow = true;
    group.add(mainHouse);

    // Krídlo domu
    const wingGeo = new THREE.BoxGeometry(wingWidth, mainHeight, wingDepth);
    const wingHouse = new THREE.Mesh(wingGeo, materials.fasada);
    wingHouse.position.set(mainWidth / 2 + wingWidth / 2, baseY + mainHeight / 2, -mainDepth / 2 + wingDepth / 2);
    wingHouse.castShadow = true;
    wingHouse.receiveShadow = true;
    group.add(wingHouse);

    // Strecha - plochá s miernym sklonom
    const roofMainGeo = new THREE.BoxGeometry(mainWidth + 0.4, 0.3, mainDepth + 0.4);
    const roofMain = new THREE.Mesh(roofMainGeo, materials.strecha);
    roofMain.position.set(0, baseY + mainHeight + 0.15, 0);
    roofMain.castShadow = true;
    group.add(roofMain);

    const roofWingGeo = new THREE.BoxGeometry(wingWidth + 0.4, 0.3, wingDepth + 0.4);
    const roofWing = new THREE.Mesh(roofWingGeo, materials.strecha);
    roofWing.position.set(mainWidth / 2 + wingWidth / 2, baseY + mainHeight + 0.15, -mainDepth / 2 + wingDepth / 2);
    roofWing.castShadow = true;
    group.add(roofWing);

    // Okná - hlavná fasáda (predná)
    const createWindow = (x, y, z, width, height, rotationY = 0) => {
      const windowGroup = new THREE.Group();
      
      // Rám
      const frameGeo = new THREE.BoxGeometry(width, height, 0.1);
      const frame = new THREE.Mesh(frameGeo, materials.oknaRam);
      windowGroup.add(frame);

      // Sklo
      const glassGeo = new THREE.BoxGeometry(width - 0.1, height - 0.1, 0.05);
      const glass = new THREE.Mesh(glassGeo, materials.sklo);
      glass.position.z = 0.03;
      windowGroup.add(glass);

      windowGroup.position.set(x, y, z);
      windowGroup.rotation.y = rotationY;
      return windowGroup;
    };

    // Predná strana - veľké okná
    group.add(createWindow(-3, baseY + mainHeight / 2, mainDepth / 2 + 0.05, 2, 2.2));
    group.add(createWindow(0, baseY + mainHeight / 2, mainDepth / 2 + 0.05, 2, 2.2));
    group.add(createWindow(3, baseY + mainHeight / 2, mainDepth / 2 + 0.05, 2, 2.2));

    // Bočné okná - pravá strana
    group.add(createWindow(mainWidth / 2 + 0.05, baseY + mainHeight / 2, 0, 1.5, 1.8, Math.PI / 2));

    // Okná na krídle
    group.add(createWindow(mainWidth / 2 + wingWidth + 0.05, baseY + mainHeight / 2, -mainDepth / 2 + wingDepth / 2, 1.5, 1.8, Math.PI / 2));

    // Strešné okná ak sú vybrané
    if (config.stresneOkno > 0) {
      for (let i = 0; i < Math.min(config.stresneOkno, 3); i++) {
        const skylightGeo = new THREE.BoxGeometry(1, 0.1, 1.2);
        const skylight = new THREE.Mesh(skylightGeo, materials.sklo);
        skylight.position.set(-2 + i * 2, baseY + mainHeight + 0.35, 0);
        group.add(skylight);
      }
    }

    // Terasa
    const terasaGeo = new THREE.BoxGeometry(8, 0.2, 5);
    const terasa = new THREE.Mesh(terasaGeo, materials.terasa);
    terasa.position.set(0, baseY + 0.1, mainDepth / 2 + 2.5);
    terasa.castShadow = true;
    terasa.receiveShadow = true;
    group.add(terasa);

    // Pergola ak je vybraná
    if (config.pergola) {
      const pillarGeo = new THREE.BoxGeometry(0.15, 2.5, 0.15);
      const positions = [
        [-3.5, baseY + 1.25, mainDepth / 2 + 4.5],
        [3.5, baseY + 1.25, mainDepth / 2 + 4.5],
        [-3.5, baseY + 1.25, mainDepth / 2 + 0.5],
        [3.5, baseY + 1.25, mainDepth / 2 + 0.5],
      ];
      positions.forEach(pos => {
        const pillar = new THREE.Mesh(pillarGeo, materials.pergola);
        pillar.position.set(...pos);
        pillar.castShadow = true;
        group.add(pillar);
      });

      // Priečne trámy
      for (let i = 0; i < 5; i++) {
        const beamGeo = new THREE.BoxGeometry(7.2, 0.1, 0.15);
        const beam = new THREE.Mesh(beamGeo, materials.pergola);
        beam.position.set(0, baseY + 2.5, mainDepth / 2 + 0.5 + i);
        beam.castShadow = true;
        group.add(beam);
      }
    }

    // Vstupné dvere
    if (config.vstupneDvere !== "ziadne") {
      const doorColor = config.vstupneDvere === "kovove" ? 0x2C2C2C : 0xFFFFFF;
      const doorMat = new THREE.MeshStandardMaterial({ color: doorColor, roughness: 0.4 });
      const doorGeo = new THREE.BoxGeometry(1, 2.2, 0.1);
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(-5, baseY + 1.1, mainDepth / 2 + 0.05);
      group.add(door);
    }

    // Centrovanie modelu
    group.position.set(-3, 0, -2);

  }, [config, materials]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-80 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100"
      style={{ touchAction: "none" }}
    />
  );
}