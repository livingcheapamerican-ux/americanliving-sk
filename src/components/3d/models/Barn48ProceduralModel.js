import * as THREE from 'three';

/**
 * Plne fotorealistický architektonický 3D Model pre Barn House 48 (PH-008)
 * Textúry a farby zosnímané 1:1 z reálnych fotografií realizácie:
 * - FOTKA 1 & 2: Medovo-zlatá drážkovaná terasa, otvorené krídlo terasových dverí, teplý smrekový obklad štítu
 * - FOTKA 3: Mezonet s čiernou stropnou koľajničkou (5 bodových svetiel) v hrebeni a štítovým oknom
 * - FOTKA 4: Antracitová kamenná dlažba, šalviovo-zelená kuchyňa s dubovou doskou, moderné vlnovkové LED svietidlo,
 *            svetlosivá prešívaná modulárna sedačka, nástenná čierna klimatizácia, TV, 4 klieštiny v krove
 * - FOTKA 5: Dve samostatné postele v mezonete s dubovým korpusom a bridlicovo-modrým čalúneným čelom
 * - PREDLŽOVANIE DOMU:
 *    • Kúpeľňa, spálňa a mezonet majú pevnú dĺžku 2.8 m (nepredlžujú sa)
 *    • Kuchyňa zostáva fixne na svojom mieste pri priečke
 *    • Predlžuje sa výlučne obývačka
 *    • Pri predĺžení o +3.9 m je možnosť aktivovať 2. spálňu
 */

export function createBarn48Model({
  facade = 'standard',    // 'standard' (svetlosivý plech+drevo), 'wood' (celodrevo), 'stucco' (biela omietka)
  extension = 0,          // 0, 1.3, 2.6, 3.9 m
  roofCutaway = 0,        // 0.0 (zatvorená) až 1.0 (odklopená strecha a mezonet)
  timeOfDay = 'day',      // 'day', 'sunset', 'night'
  interiorType = 'wood',  // 'wood' (Tatranský profil), 'drywall' (Biely sadrokartón)
  extraBedroom = false    // pri extension === 3.9m umožní pridať 2. spálňu v obývačkovej časti
}) {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'Barn48_Full_Architectural_Model';

  // Rozmery podľa pôdorysu
  const width = 4.6;
  const wallHeight = 2.1;
  const ridgeHeight = 4.0;
  const gableHeight = ridgeHeight - wallHeight; // 1.9 m
  const porchDepth = 1.3;
  const totalLength = 8.0 + extension;
  const houseBodyLength = totalLength - porchDepth; // 6.7 m základ

  const halfW = width / 2; // 2.3 m
  const halfL = totalLength / 2;
  const glassZ = halfL - porchDepth; // Pozícia prednej sklenenej steny

  // Pevná zadná zóna (Spálňa + Kúpeľňa + Mezonet = predĺžená o 0.8m na 3.6m pre pohodlný vstup a dvere)
  const rearZoneLen = 3.6;
  const partitionZ = -halfL + rearZoneLen;
  const rearZoneCenterZ = -halfL + rearZoneLen / 2;

  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';

  // ── 1. PROCEDURÁLNE PBR TEXTÚRY ZOSNÍMANÉ Z REÁLNYCH FOTOGRAFIÍ ────────────────

  // 1. Textúra Tatranského profilu (zlatistý severský smrek z fotiek 1, 3, 4, 5)
  const createPineTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Teplý medovo-zlatý základ
    ctx.fillStyle = '#dfaf74';
    ctx.fillRect(0, 0, 1024, 1024);

    const boardW = 42; // Šírka laty tatranského profilu
    for (let x = 0; x < 1024; x += boardW) {
      const tint = (Math.random() - 0.5) * 16;
      ctx.fillStyle = `rgb(${223 + tint}, ${175 + tint * 0.8}, ${116 + tint * 0.6})`;
      ctx.fillRect(x, 0, boardW, 1024);

      // V-drážka (škára)
      ctx.fillStyle = 'rgba(75, 45, 18, 0.45)';
      ctx.fillRect(x, 0, 2, 1024);
      ctx.fillStyle = 'rgba(255, 245, 220, 0.3)';
      ctx.fillRect(x + 2, 0, 1.5, 1024);

      // Jemné letorasty a drevené vlákna
      for (let i = 0; i < 9; i++) {
        ctx.strokeStyle = 'rgba(120, 75, 30, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const sx = x + Math.random() * boardW;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + (Math.random() - 0.5) * 8, 1024);
        ctx.stroke();
      }

      // Prirodzené hrčky dreva (z fotky 3 a 4)
      if (Math.random() > 0.55) {
        const knotY = Math.random() * 900 + 50;
        ctx.fillStyle = 'rgba(95, 50, 18, 0.42)';
        ctx.beginPath();
        ctx.ellipse(x + boardW / 2, knotY, 4.5, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Svetlý halo krúžok okolo hrčky
        ctx.strokeStyle = 'rgba(245, 215, 165, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  };

  // 2. Textúra drážkovanej terasovej dosky (z fotiek 1 & 2)
  const createDeckTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#c58442';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankW = 64;
    for (let x = 0; x < 1024; x += plankW) {
      const tint = (Math.random() - 0.5) * 14;
      ctx.fillStyle = `rgb(${197 + tint}, ${132 + tint * 0.7}, ${66 + tint * 0.5})`;
      ctx.fillRect(x, 0, plankW, 1024);

      // Pozdĺžne protišmykové drážky (viditeľné na fotke 2)
      for (let g = 4; g < plankW - 2; g += 6) {
        ctx.fillStyle = 'rgba(70, 40, 15, 0.35)';
        ctx.fillRect(x + g, 0, 1.5, 1024);
        ctx.fillStyle = 'rgba(255, 235, 190, 0.2)';
        ctx.fillRect(x + g + 1.5, 0, 1, 1024);
      }

      // Škáry medzi doskami
      ctx.fillStyle = 'rgba(50, 25, 10, 0.6)';
      ctx.fillRect(x, 0, 3, 1024);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 4);
    return tex;
  };

  // 3. Textúra veľkoformátovej antracitovej dlažby (z fotky 4)
  const createTileTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1c1f24';
    ctx.fillRect(0, 0, 1024, 1024);

    // Jemná kamenná štruktúra bridlice
    for (let i = 0; i < 30000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const alpha = Math.random() * 0.04;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(0, 0, 0, ${alpha * 2})` : `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Veľkoformátový raster 60x120 cm
    ctx.strokeStyle = '#121417';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 512, 1024);
    ctx.strokeRect(512, 0, 512, 1024);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 6);
    return tex;
  };

  // 4. Textúra bieleho sadrokartónu
  const createDrywallTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f6f7f9';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const alpha = Math.random() * 0.025;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(0, 0, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha * 2})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  };

  const pineTexture = createPineTexture();
  const deckTexture = createDeckTexture();
  const tileTexture = createTileTexture();
  const drywallTexture = createDrywallTexture();

  // PBR MATERIÁLY
  const woodMat = new THREE.MeshStandardMaterial({
    map: pineTexture,
    color: 0xe6b97b,
    roughness: 0.55,
    metalness: 0.02,
    name: 'RealSprucePanels'
  });

  const whiteDrywallMat = new THREE.MeshStandardMaterial({
    map: drywallTexture,
    color: 0xf5f6f8,
    roughness: 0.9,
    metalness: 0.01,
    name: 'WhiteDrywall'
  });

  const isDrywall = interiorType === 'drywall';
  const interiorWallMat = isDrywall ? whiteDrywallMat : woodMat;

  // Tmavá antracitová kamenná dlažba (z fotky 4)
  const darkTileMat = new THREE.MeshStandardMaterial({
    map: tileTexture,
    color: 0x22262c,
    roughness: 0.38,
    metalness: 0.08,
    name: 'RealSlateTiles'
  });

  // Terasové drevo (z fotiek 1 & 2)
  const deckMat = new THREE.MeshStandardMaterial({
    map: deckTexture,
    color: 0xc98744,
    roughness: 0.6,
    metalness: 0.02,
    name: 'DeckingThermodrevo'
  });

  // Šalviovo-zelená kuchyňa (presný odtieň z fotky 4: #6f8c88)
  const kitchenSageMat = new THREE.MeshStandardMaterial({
    color: 0x6f8c88,
    roughness: 0.38,
    metalness: 0.06,
    name: 'SageGreenKitchen'
  });

  // Prírodná dubová doska kuchyne (z fotky 4)
  const oakTopMat = new THREE.MeshStandardMaterial({
    map: pineTexture,
    color: 0xcf9559,
    roughness: 0.42,
    metalness: 0.03
  });

  // Svetlosivá prešívaná látka sedačky (z fotky 4)
  const sofaFabricMat = new THREE.MeshStandardMaterial({
    color: 0xb5b7bc,
    roughness: 0.88,
    metalness: 0.01,
    name: 'LightGreyVelvetSofa'
  });

  // Bridlicovo-modré čalúnenie čela postelí (presne z fotky 5: #586b7a)
  const headboardSlateBlueMat = new THREE.MeshStandardMaterial({
    color: 0x586b7a,
    roughness: 0.85,
    metalness: 0.02,
    name: 'SlateBlueHeadboard'
  });

  const pillowMustardMat = new THREE.MeshStandardMaterial({
    color: 0xd49b38,
    roughness: 0.75,
    metalness: 0.05
  });

  const pillowCharcoalMat = new THREE.MeshStandardMaterial({
    color: 0x2b3038,
    roughness: 0.8,
    metalness: 0.05
  });

  // Svetlosivý falcovaný plech (RAL 7035 / RAL 7038)
  const lightGreyMetalMat = new THREE.MeshStandardMaterial({
    color: 0x868f9a,
    roughness: 0.42,
    metalness: 0.52,
    name: 'LightGreyMetal'
  });

  // Čierne matné hliníkové rámy a spotrebiče
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1d2024,
    roughness: 0.35,
    metalness: 0.8,
    name: 'AnthraciteAluFrame'
  });

  const kitchenBlackMat = new THREE.MeshStandardMaterial({
    color: 0x16181b,
    roughness: 0.25,
    metalness: 0.85
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: isNight ? 0xffeaaf : 0xa6d1f0,
    transmission: 0.92,
    opacity: 0.3,
    transparent: true,
    roughness: 0.02,
    metalness: 0.1,
    ior: 1.52,
    reflectivity: 0.9
  });

  const bathroomTileMat = new THREE.MeshStandardMaterial({
    color: 0x8c929a,
    roughness: 0.4
  });

  const ceramicWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.12,
    metalness: 0.05
  });

  const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0xe0e8f0,
    roughness: 0.02,
    metalness: 0.95
  });

  const duvetMat = new THREE.MeshStandardMaterial({
    color: 0xf2f5f8,
    roughness: 0.92
  });

  const duvetBlueMat = new THREE.MeshStandardMaterial({
    color: 0x9eb4c7,
    roughness: 0.9
  });

  const plantMat = new THREE.MeshStandardMaterial({
    color: 0x3d6e4a,
    roughness: 0.6
  });

  const sideWallExteriorMat = facade === 'wood' ? woodMat : (facade === 'stucco' ? whiteDrywallMat : lightGreyMetalMat);
  const roofExteriorMat = lightGreyMetalMat;
  const rearWallExteriorMat = woodMat;

  // ── 2. ZÁKLADY & TERASA (Z FOTIEK 1 & 2) ───────────────────────────────────────

  const siteGroup = new THREE.Group();
  siteGroup.name = 'Foundation_Site';

  // Terén
  const groundGeo = new THREE.CylinderGeometry(15, 15, 0.3, 32);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x544e44, roughness: 0.95 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.set(0, -0.95, 0);
  ground.receiveShadow = true;
  siteGroup.add(ground);

  // Základové stĺpy
  const postGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
  const postMat = new THREE.MeshStandardMaterial({ map: pineTexture, color: 0x9a6534, roughness: 0.8 });

  const pxPositions = [-halfW + 0.25, -halfW / 3, halfW / 3, halfW - 0.25];
  const pzPositions = [halfL + 2.0, halfL, 0, -halfL + 0.3];

  pzPositions.forEach(pz => {
    pxPositions.forEach(px => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(px, -0.4, pz);
      post.castShadow = true;
      post.receiveShadow = true;
      siteGroup.add(post);
    });
  });

  // Predná drážkovaná terasa (z fotiek 1 & 2)
  const extTerraceLen = 2.2;
  const fullTerraceLen = porchDepth + extTerraceLen;
  const deckGeo = new THREE.BoxGeometry(width, 0.06, fullTerraceLen);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.set(0, 0.03, glassZ + fullTerraceLen / 2);
  deck.receiveShadow = true;
  deck.castShadow = true;
  siteGroup.add(deck);

  rootGroup.add(siteGroup);

  // ── 3. HLAVNÝ KORPUS (STENY, DLAŽBA, ZADNÝ ŠTÍT S OTVORMI) ────────────────────

  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'HouseBody';

  const interiorCenterZ = (glassZ + (-halfL)) / 2;

  // Tmavá dlažba v interiéri (z fotky 4)
  const floorGeo = new THREE.BoxGeometry(width - 0.4, 0.08, houseBodyLength - 0.1);
  const floor = new THREE.Mesh(floorGeo, darkTileMat);
  floor.position.set(0, 0.04, interiorCenterZ);
  floor.receiveShadow = true;
  bodyGroup.add(floor);

  // 1. ZADNÁ STENA S VÝREZMI PRE OKNÁ
  const backShape = new THREE.Shape();
  backShape.moveTo(-halfW, 0);
  backShape.lineTo(halfW, 0);
  backShape.lineTo(halfW, wallHeight);
  backShape.lineTo(0, ridgeHeight);
  backShape.lineTo(-halfW, wallHeight);
  backShape.closePath();

  // Otvory pre 3 okná
  const loftHole = new THREE.Path();
  loftHole.moveTo(-0.275, wallHeight + 0.95 - 0.375);
  loftHole.lineTo(0.275, wallHeight + 0.95 - 0.375);
  loftHole.lineTo(0.275, wallHeight + 0.95 + 0.375);
  loftHole.lineTo(-0.275, wallHeight + 0.95 + 0.375);
  loftHole.closePath();
  backShape.holes.push(loftHole);

  const bathHole = new THREE.Path();
  bathHole.moveTo(0.95 - 0.325, 1.25 - 0.475);
  bathHole.lineTo(0.95 + 0.325, 1.25 - 0.475);
  bathHole.lineTo(0.95 + 0.325, 1.25 + 0.475);
  bathHole.lineTo(0.95 - 0.325, 1.25 + 0.475);
  bathHole.closePath();
  backShape.holes.push(bathHole);

  const bedHole = new THREE.Path();
  bedHole.moveTo(-1.05 - 0.675, 1.25 - 0.475);
  bedHole.lineTo(-1.05 + 0.675, 1.25 - 0.475);
  bedHole.lineTo(-1.05 + 0.675, 1.25 + 0.475);
  bedHole.lineTo(-1.05 - 0.675, 1.25 + 0.475);
  bedHole.closePath();
  backShape.holes.push(bedHole);

  // Exteriérová zadná stena (smrek)
  const backExtGeo = new THREE.ExtrudeGeometry(backShape, { depth: 0.08, bevelEnabled: false });
  const backWallExt = new THREE.Mesh(backExtGeo, rearWallExteriorMat);
  backWallExt.position.set(0, 0, -halfL - 0.08);
  backWallExt.castShadow = true;
  backWallExt.receiveShadow = true;
  bodyGroup.add(backWallExt);

  // Interiérová zadná stena (Tatranský profil / Sadrokartón)
  const backIntGeo = new THREE.ExtrudeGeometry(backShape, { depth: 0.03, bevelEnabled: false });
  const backWallInt = new THREE.Mesh(backIntGeo, interiorWallMat);
  backWallInt.position.set(0, 0, -halfL);
  bodyGroup.add(backWallInt);

  // 3 Okná na zadnej stene
  const backLoftWinGroup = new THREE.Group();
  backLoftWinGroup.position.set(0, wallHeight + 0.95, -halfL - 0.04);
  const bLoftPane = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.04), glassMat);
  backLoftWinGroup.add(bLoftPane);
  const bLoftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.16), frameMat);
  backLoftWinGroup.add(bLoftFrame);
  const bLoftSill = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 0.2), frameMat);
  bLoftSill.position.set(0, -0.44, -0.04);
  backLoftWinGroup.add(bLoftSill);
  bodyGroup.add(backLoftWinGroup);

  const backBathWinGroup = new THREE.Group();
  backBathWinGroup.position.set(0.95, 1.25, -halfL - 0.04);
  const bBathPane = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.95, 0.04), glassMat);
  backBathWinGroup.add(bBathPane);
  const bBathFrame = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.05, 0.16), frameMat);
  backBathWinGroup.add(bBathFrame);
  const bBathSill = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.04, 0.2), frameMat);
  bBathSill.position.set(0, -0.54, -0.04);
  backBathWinGroup.add(bBathSill);
  bodyGroup.add(backBathWinGroup);

  const backBedWinGroup = new THREE.Group();
  backBedWinGroup.position.set(-1.05, 1.25, -halfL - 0.04);
  const bBedPane = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.95, 0.04), glassMat);
  backBedWinGroup.add(bBedPane);
  const bBedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.05, 0.16), frameMat);
  backBedWinGroup.add(bBedFrame);
  const bBedMullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.95, 0.18), frameMat);
  backBedWinGroup.add(bBedMullion);
  const bBedSill = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.04, 0.2), frameMat);
  bBedSill.position.set(0, -0.54, -0.04);
  backBedWinGroup.add(bBedSill);
  bodyGroup.add(backBedWinGroup);

  // Bočné steny (Exteriér + Interiér)
  const sideExtGeo = new THREE.BoxGeometry(0.1, wallHeight, totalLength);
  const leftWallExt = new THREE.Mesh(sideExtGeo, sideWallExteriorMat);
  leftWallExt.position.set(-halfW + 0.05, wallHeight / 2, 0);
  leftWallExt.castShadow = true;
  bodyGroup.add(leftWallExt);

  const rightWallExt = new THREE.Mesh(sideExtGeo, sideWallExteriorMat);
  rightWallExt.position.set(halfW - 0.05, wallHeight / 2, 0);
  rightWallExt.castShadow = true;
  bodyGroup.add(rightWallExt);

  // Vnútorný obklad bočných stien (Tatranský profil / Sadrokartón)
  const sideIntGeo = new THREE.BoxGeometry(0.04, wallHeight - 0.02, houseBodyLength);
  const leftWallInt = new THREE.Mesh(sideIntGeo, interiorWallMat);
  leftWallInt.position.set(-halfW + 0.12, wallHeight / 2, interiorCenterZ);
  bodyGroup.add(leftWallInt);

  const rightWallInt = new THREE.Mesh(sideIntGeo, interiorWallMat);
  rightWallInt.position.set(halfW - 0.12, wallHeight / 2, interiorCenterZ);
  bodyGroup.add(rightWallInt);

  // Bočné okno v spálni 1
  const sideWinGroup = new THREE.Group();
  sideWinGroup.position.set(-halfW - 0.01, wallHeight / 2, -halfL + 1.8);
  const sCasing = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.85, 0.75), woodMat);
  sideWinGroup.add(sCasing);
  const sFrame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.7, 0.55), frameMat);
  sideWinGroup.add(sFrame);
  const sGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.6, 0.45), glassMat);
  sideWinGroup.add(sGlass);
  bodyGroup.add(sideWinGroup);

  // Bočné klasické obdĺžnikové okno pre 2. spálňu pri +3.9m
  if (extension >= 3.9 && extraBedroom) {
    const sideWin2Group = new THREE.Group();
    sideWin2Group.position.set(-halfW - 0.01, 1.25, partitionZ + 1.2);

    const sCasing2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.05, 1.35), woodMat);
    sideWin2Group.add(sCasing2);

    const sFrame2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 1.25), frameMat);
    sideWin2Group.add(sFrame2);

    const sGlass2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.85, 1.15), glassMat);
    sideWin2Group.add(sGlass2);

    // Stredový zvislý stĺpik rámu
    const sMullion2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.85, 0.05), frameMat);
    sideWin2Group.add(sMullion2);

    // Parapet
    const sSill2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 1.35), frameMat);
    sSill2.position.set(0, -0.48, 0);
    sideWin2Group.add(sSill2);

    bodyGroup.add(sideWin2Group);
  }

  // Zvislé falce na bočných plechových stenách
  if (facade === 'standard') {
    const seamCount = Math.floor(totalLength / 0.45);
    for (let i = 0; i <= seamCount; i++) {
      const z = -halfL + (i * totalLength) / seamCount;
      const sGeo = new THREE.BoxGeometry(0.035, wallHeight, 0.025);
      
      const sL = new THREE.Mesh(sGeo, frameMat);
      sL.position.set(-halfW - 0.015, wallHeight / 2, z);
      sL.castShadow = true;
      bodyGroup.add(sL);

      const sR = new THREE.Mesh(sGeo, frameMat);
      sR.position.set(halfW + 0.015, wallHeight / 2, z);
      sR.castShadow = true;
      bodyGroup.add(sR);
    }
  }

  rootGroup.add(bodyGroup);

  // ── 4. DETAILNÝ INTERIÉR Z FOTIEK 3, 4, 5 (SPÁLŇA, KÚPEĽŇA, KUCHYŇA, OBÝVAČKA) ─

  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'Detailed_Interior';

  // 1. FIXNÁ SPÁLŇA 1 (2.8m, nepredlžuje sa)
  const bedRoomGroup = new THREE.Group();

  // Manželská posteľ prisunutá priamo pod zadné okno
  const bedGroup = new THREE.Group();
  bedGroup.position.set(-1.05, 0.08, -halfL + 1.08);

  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 2.05), woodMat);
  bedFrame.position.set(0, 0.18, 0);
  bedFrame.castShadow = true;
  bedGroup.add(bedFrame);

  const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.72, 0.08), headboardSlateBlueMat);
  headboard.position.set(0, 0.52, -0.98);
  headboard.castShadow = true;
  bedGroup.add(headboard);

  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 1.95), duvetMat);
  mattress.position.set(0, 0.38, 0);
  bedGroup.add(mattress);

  const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.1, 1.3), duvetMat);
  duvet.position.set(0, 0.48, 0.28);
  bedGroup.add(duvet);

  const pillowBed1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.35), duvetMat);
  pillowBed1.position.set(-0.38, 0.52, -0.65);
  pillowBed1.rotation.x = -0.15;
  bedGroup.add(pillowBed1);

  const pillowBed2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.35), duvetMat);
  pillowBed2.position.set(0.38, 0.52, -0.65);
  pillowBed2.rotation.x = -0.15;
  bedGroup.add(pillowBed2);

  const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), woodMat);
  nightstand.position.set(-0.95, 0.22, -0.7);
  nightstand.castShadow = true;
  bedGroup.add(nightstand);

  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.03, 16), kitchenBlackMat);
  lampBase.position.set(-0.95, 0.46, -0.7);
  bedGroup.add(lampBase);

  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.14, 16), ceramicWhiteMat);
  lampShade.position.set(-0.95, 0.58, -0.7);
  bedGroup.add(lampShade);

  bedRoomGroup.add(bedGroup);

  // Vstavaná skriňa Roldor v spálni 1 (kompaktná na vonkajšej stene, aby zostal voľný priestor pre dvere)
  const roldorGroup = new THREE.Group();
  roldorGroup.position.set(-halfW + 0.65, 0.08, partitionZ - 0.3);

  const roldorBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, wallHeight - 0.15, 0.55), woodMat);
  roldorBody.position.set(0, wallHeight / 2 - 0.075, 0);
  roldorBody.castShadow = true;
  roldorGroup.add(roldorBody);

  const roldorDoor1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, wallHeight - 0.2, 0.03), mirrorMat);
  roldorDoor1.position.set(-0.28, wallHeight / 2 - 0.075, 0.28);
  roldorGroup.add(roldorDoor1);

  const roldorDoor2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, wallHeight - 0.2, 0.03), woodMat);
  roldorDoor2.position.set(0.28, wallHeight / 2 - 0.075, 0.26);
  roldorGroup.add(roldorDoor2);

  const roldorRail = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.04, 0.06), frameMat);
  roldorRail.position.set(0, wallHeight - 0.14, 0.27);
  roldorGroup.add(roldorRail);

  bedRoomGroup.add(roldorGroup);
  interiorGroup.add(bedRoomGroup);

  // 2. DELIACA PRIEČKA MEDZI SPÁLŇOU A KÚPEĽŇOU
  const centerPartitionGroup = new THREE.Group();
  centerPartitionGroup.position.set(0, wallHeight / 2, rearZoneCenterZ);

  const pBedSide = new THREE.Mesh(new THREE.BoxGeometry(0.05, wallHeight, rearZoneLen), interiorWallMat);
  pBedSide.position.set(-0.025, 0, 0);
  centerPartitionGroup.add(pBedSide);

  const pBathSide = new THREE.Mesh(new THREE.BoxGeometry(0.03, wallHeight, rearZoneLen), bathroomTileMat);
  pBathSide.position.set(0.025, 0, 0);
  centerPartitionGroup.add(pBathSide);

  interiorGroup.add(centerPartitionGroup);

  // 3. FIXNÁ KÚPEĽŇA (Fixná dĺžka, nepredlžuje sa)
  const bathGroup = new THREE.Group();
  bathGroup.position.set(1.15, 0.08, rearZoneCenterZ);

  // Walk-in sprchový kút
  const showerGroup = new THREE.Group();
  showerGroup.position.set(0, 0, -rearZoneLen / 2 + 0.6);

  const showerTray = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.04, 0.95), darkTileMat);
  showerTray.position.set(-0.55, 0.02, 0);
  showerGroup.add(showerTray);

  const showerGlass = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.95, 0.95), glassMat);
  showerGlass.position.set(-0.08, 0.98, 0);
  showerGroup.add(showerGlass);

  const showerProfile = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.95, 0.04), kitchenBlackMat);
  showerProfile.position.set(-0.08, 0.98, -0.46);
  showerGroup.add(showerProfile);

  const showerBar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.03), kitchenBlackMat);
  showerBar.position.set(-0.55, 1.95, 0);
  showerGroup.add(showerBar);

  const showerCol = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.3, 0.04), kitchenBlackMat);
  showerCol.position.set(-0.85, 1.2, 0);
  showerGroup.add(showerCol);

  const showerHead = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), kitchenBlackMat);
  showerHead.position.set(-0.7, 1.85, 0);
  showerGroup.add(showerHead);

  bathGroup.add(showerGroup);

  // Umývadlová zostava
  const vanityGroup = new THREE.Group();
  vanityGroup.position.set(0.65, 0, 0.45);

  const vanity = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.75), woodMat);
  vanity.position.set(0, 0.52, 0);
  vanity.castShadow = true;
  vanityGroup.add(vanity);

  const basin = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.65), ceramicWhiteMat);
  basin.position.set(0, 0.85, 0);
  basin.castShadow = true;
  vanityGroup.add(basin);

  const basinTap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.04), kitchenBlackMat);
  basinTap.position.set(0.18, 0.98, 0);
  vanityGroup.add(basinTap);

  const basinSpout = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), kitchenBlackMat);
  basinSpout.position.set(0.12, 1.08, 0);
  vanityGroup.add(basinSpout);

  const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.8, 0.65), mirrorMat);
  mirror.position.set(0.45, 1.45, 0);
  vanityGroup.add(mirror);

  const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.84, 0.69), kitchenBlackMat);
  mirrorFrame.position.set(0.46, 1.45, 0);
  vanityGroup.add(mirrorFrame);

  bathGroup.add(vanityGroup);

  // Závesné WC & Bojler
  const wcGroup = new THREE.Group();
  wcGroup.position.set(0.65, 0, -0.65);

  const geberitBox = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 0.6), bathroomTileMat);
  geberitBox.position.set(0.35, 0.55, 0);
  wcGroup.add(geberitBox);

  const flushPlate = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.22), frameMat);
  flushPlate.position.set(0.22, 0.95, 0);
  wcGroup.add(flushPlate);

  const toilet = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.5), ceramicWhiteMat);
  toilet.position.set(0.05, 0.38, 0);
  toilet.castShadow = true;
  wcGroup.add(toilet);

  const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.75, 24), ceramicWhiteMat);
  boiler.position.set(0.35, 1.6, 0);
  boiler.castShadow = true;
  wcGroup.add(boiler);

  bathGroup.add(wcGroup);
  interiorGroup.add(bathGroup);

  // Zistenie stavu 2. spálne pre umiestnenie rebríka a dispozície
  const is2ndBedroomActive = extension >= 3.9 && extraBedroom;
  const extraBedRoomLen = 2.4;
  const extraBedRoomEnd = partitionZ + extraBedRoomLen;

  // 4. HLAVNÁ PRIEČKA MEDZI SPÁLŇOU 1/KÚPEĽŇOU A OBÝVAČKOU SO VSTUPNÝMI DVERAMI DO SPÁLNE 1
  // Stena za Roldorom
  const partLeftOuter = new THREE.Mesh(new THREE.BoxGeometry(1.35, wallHeight, 0.1), interiorWallMat);
  partLeftOuter.position.set(-halfW + 0.675, wallHeight / 2, partitionZ);
  partLeftOuter.castShadow = true;
  interiorGroup.add(partLeftOuter);

  // Preklad nad dverami do spálne 1
  const b1DoorW = 0.85;
  const b1DoorH = 2.0;
  const b1DoorCenter = -halfW + 1.35 + b1DoorW / 2; // ~ -0.525
  const b1LintelH = wallHeight - b1DoorH;
  const b1Lintel = new THREE.Mesh(new THREE.BoxGeometry(b1DoorW, b1LintelH, 0.1), interiorWallMat);
  b1Lintel.position.set(b1DoorCenter, b1DoorH + b1LintelH / 2, partitionZ);
  interiorGroup.add(b1Lintel);

  // Úzky stĺpik priečky medzi dverami spálne 1 a deliacou stenou kúpeľne
  const b1PostW = Math.max(0.05, -b1DoorCenter - b1DoorW / 2);
  if (b1PostW > 0.02) {
    const b1Post = new THREE.Mesh(new THREE.BoxGeometry(b1PostW, wallHeight, 0.1), interiorWallMat);
    b1Post.position.set(-b1PostW / 2, wallHeight / 2, partitionZ);
    interiorGroup.add(b1Post);
  }

  // Vstupné dvere do Spálne 1
  const b1DoorGroup = new THREE.Group();
  b1DoorGroup.position.set(b1DoorCenter, 0, partitionZ);

  const b1FrameL = new THREE.Mesh(new THREE.BoxGeometry(0.05, b1DoorH, 0.12), frameMat);
  b1FrameL.position.set(-b1DoorW / 2 + 0.025, b1DoorH / 2, 0);
  b1DoorGroup.add(b1FrameL);

  const b1FrameR = new THREE.Mesh(new THREE.BoxGeometry(0.05, b1DoorH, 0.12), frameMat);
  b1FrameR.position.set(b1DoorW / 2 - 0.025, b1DoorH / 2, 0);
  b1DoorGroup.add(b1FrameR);

  const b1FrameTop = new THREE.Mesh(new THREE.BoxGeometry(b1DoorW, 0.05, 0.12), frameMat);
  b1FrameTop.position.set(0, b1DoorH - 0.025, 0);
  b1DoorGroup.add(b1FrameTop);

  const b1DoorLeaf = new THREE.Mesh(new THREE.BoxGeometry(b1DoorW - 0.08, b1DoorH - 0.06, 0.04), woodMat);
  b1DoorLeaf.position.set(0, b1DoorH / 2, -0.15);
  b1DoorLeaf.rotation.y = 0.3; // Pootvorené do spálne
  b1DoorLeaf.castShadow = true;
  b1DoorGroup.add(b1DoorLeaf);

  const b1DoorHandle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.12), kitchenBlackMat);
  b1DoorHandle.position.set(b1DoorW / 2 - 0.18, 1.0, -0.15);
  b1DoorGroup.add(b1DoorHandle);

  interiorGroup.add(b1DoorGroup);

  // Pravá strana priečky (kúpeľňa)
  const partRight = new THREE.Mesh(new THREE.BoxGeometry(1.2, wallHeight, 0.1), interiorWallMat);
  partRight.position.set(halfW - 0.7, wallHeight / 2, partitionZ);
  partRight.castShadow = true;
  interiorGroup.add(partRight);

  // Rebrík z prírodného dreva (z fotky 4)
  // V prípade pridania 2. spálne sa presunie medzi novú spálňu a gauč
  const ladderGroup = new THREE.Group();
  if (is2ndBedroomActive) {
    ladderGroup.position.set(-0.45, 0, extraBedRoomEnd + 0.25);
  } else {
    ladderGroup.position.set(0.45, 0, partitionZ + 0.25);
  }
  ladderGroup.rotation.x = 0.22;

  const stringerGeo = new THREE.BoxGeometry(0.05, 2.35, 0.08);
  const strL = new THREE.Mesh(stringerGeo, woodMat);
  strL.position.set(-0.22, 1.1, 0);
  ladderGroup.add(strL);

  const strR = new THREE.Mesh(stringerGeo, woodMat);
  strR.position.set(0.22, 1.1, 0);
  ladderGroup.add(strR);

  for (let r = 0; r < 7; r++) {
    const rung = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.06), woodMat);
    rung.position.set(0, 0.28 + r * 0.28, 0);
    ladderGroup.add(rung);
  }
  interiorGroup.add(ladderGroup);

  // 5. ŠALVIOVO-ZELENÁ KUCHYŇA (Presne podľa fotky 4)
  const kitchenGroup = new THREE.Group();
  kitchenGroup.position.set(halfW - 0.45, 0.08, partitionZ + 1.35);

  // Spodné šalviové skrinky s jemnými škárami
  const kCabinets = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 2.5), kitchenSageMat);
  kCabinets.position.set(0, 0.425, 0);
  kCabinets.castShadow = true;
  kitchenGroup.add(kCabinets);

  // Prírodná dubová pracovná doska (z fotky 4)
  const kTop = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.05, 2.52), oakTopMat);
  kTop.position.set(0, 0.875, 0);
  kTop.castShadow = true;
  kitchenGroup.add(kTop);

  // Indukčná varná doska
  const hob = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.02, 0.55), kitchenBlackMat);
  hob.position.set(0, 0.905, 0.3);
  kitchenGroup.add(hob);

  // Šikmý čierny sklenený digestor (z fotky 4)
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 0.55), kitchenBlackMat);
  hood.position.set(-0.1, 1.65, 0.3);
  hood.rotation.z = -0.3;
  kitchenGroup.add(hood);

  // Čierny kompozitný drez s oblúkovou batériou (z fotky 4)
  const sink = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.5), kitchenBlackMat);
  sink.position.set(0, 0.905, -0.4);
  kitchenGroup.add(sink);

  const faucet = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 12, 24, Math.PI), kitchenBlackMat);
  faucet.position.set(0.18, 1.02, -0.4);
  faucet.rotation.y = Math.PI / 2;
  kitchenGroup.add(faucet);

  // Vysoká skriňa s rúrou a mikrovlnkou (z fotky 4)
  const tallUnit = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.9, 0.65), kitchenSageMat);
  tallUnit.position.set(0, 0.95, -0.925);
  tallUnit.castShadow = true;
  kitchenGroup.add(tallUnit);

  const oven = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.55, 0.58), kitchenBlackMat);
  oven.position.set(-0.02, 1.15, -0.925);
  kitchenGroup.add(oven);

  const ovenHandle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.45), ceramicWhiteMat);
  ovenHandle.position.set(-0.33, 1.35, -0.925);
  kitchenGroup.add(ovenHandle);

  // Horná šalviová skrinka
  const upperCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.9), kitchenSageMat);
  upperCabinet.position.set(-0.12, 1.75, -0.4);
  kitchenGroup.add(upperCabinet);

  // Nástenná TV na drevenej stene (z fotky 4)
  const tv = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.75, 1.25), kitchenBlackMat);
  tv.position.set(-0.25, 1.4, 1.4);
  kitchenGroup.add(tv);

  interiorGroup.add(kitchenGroup);

  // 6. MOŽNOSŤ 2. SPÁLNE (PRI PREDĹŽENÍ O +3.9 m)
  if (is2ndBedroomActive) {
    const bed2Group = new THREE.Group();
    bed2Group.name = 'Extra_Bedroom_2';

    // Predná deliaca stena 2. spálne smerom do obývačky
    const bed2FrontWall = new THREE.Mesh(new THREE.BoxGeometry(halfW - 0.2, wallHeight, 0.1), interiorWallMat);
    bed2FrontWall.position.set(-halfW / 2 + 0.1, wallHeight / 2, extraBedRoomEnd);
    bed2FrontWall.castShadow = true;
    bed2Group.add(bed2FrontWall);

    // Bočná stena 2. spálne smerom do chodby / ku kuchynskej linke s dverným otvorom
    const wallPart1Len = 1.35;
    const doorW = 0.85;
    const doorH = 2.0;
    const wallPart2Len = extraBedRoomLen - wallPart1Len - doorW; // ~0.2 m

    // Plná stena pred dverami
    const bed2SideWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, wallHeight, wallPart1Len), interiorWallMat);
    bed2SideWall1.position.set(0, wallHeight / 2, partitionZ + wallPart1Len / 2);
    bed2SideWall1.castShadow = true;
    bed2Group.add(bed2SideWall1);

    // Preklad nad dverami
    const lintelH = wallHeight - doorH;
    const bed2Lintel = new THREE.Mesh(new THREE.BoxGeometry(0.1, lintelH, doorW), interiorWallMat);
    bed2Lintel.position.set(0, doorH + lintelH / 2, partitionZ + wallPart1Len + doorW / 2);
    bed2Group.add(bed2Lintel);

    // Úzky stĺpik za dverami pri rohu
    if (wallPart2Len > 0.05) {
      const bed2SideWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, wallHeight, wallPart2Len), interiorWallMat);
      bed2SideWall2.position.set(0, wallHeight / 2, extraBedRoomEnd - wallPart2Len / 2);
      bed2SideWall2.castShadow = true;
      bed2Group.add(bed2SideWall2);
    }

    // Zárubňa a vstupné dvere do 2. spálne zo strany kuchyne/chodby
    const doorCenterZ = partitionZ + wallPart1Len + doorW / 2;
    const doorFrameGroup = new THREE.Group();
    doorFrameGroup.position.set(0, 0, doorCenterZ);

    const dFrameL = new THREE.Mesh(new THREE.BoxGeometry(0.12, doorH, 0.05), frameMat);
    dFrameL.position.set(0, doorH / 2, -doorW / 2 + 0.025);
    doorFrameGroup.add(dFrameL);

    const dFrameR = new THREE.Mesh(new THREE.BoxGeometry(0.12, doorH, 0.05), frameMat);
    dFrameR.position.set(0, doorH / 2, doorW / 2 - 0.025);
    doorFrameGroup.add(dFrameR);

    const dFrameTop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, doorW), frameMat);
    dFrameTop.position.set(0, doorH - 0.025, 0);
    doorFrameGroup.add(dFrameTop);

    // Krídlo dverí (jemne pootvorené do spálne)
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.04, doorH - 0.06, doorW - 0.08), woodMat);
    doorLeaf.position.set(-0.15, doorH / 2, 0);
    doorLeaf.rotation.y = 0.35; // Pootvorené dvere
    doorLeaf.castShadow = true;
    doorFrameGroup.add(doorLeaf);

    // Kľučka dverí
    const doorHandle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.14), kitchenBlackMat);
    doorHandle.position.set(-0.15, 1.0, -0.28);
    doorFrameGroup.add(doorHandle);

    bed2Group.add(doorFrameGroup);

    // Vybavenie 2. spálne: posteľ, nočný stolík, písací stôl a stolička
    const bed2CenterZ = partitionZ + 1.2;
    const singleBed = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.35, 2.0), woodMat);
    singleBed.position.set(-halfW + 0.65, 0.26, bed2CenterZ);
    singleBed.castShadow = true;
    bed2Group.add(singleBed);

    const singleHead = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 0.08), headboardSlateBlueMat);
    singleHead.position.set(-halfW + 0.65, 0.46, partitionZ + 0.24);
    singleHead.castShadow = true;
    bed2Group.add(singleHead);

    const singleMattress = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.2, 1.92), duvetBlueMat);
    singleMattress.position.set(-halfW + 0.65, 0.44, bed2CenterZ);
    bed2Group.add(singleMattress);

    const singlePillow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.35), duvetMat);
    singlePillow.position.set(-halfW + 0.65, 0.56, partitionZ + 0.4);
    bed2Group.add(singlePillow);

    const desk = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.5), woodMat);
    desk.position.set(-0.55, 0.45, partitionZ + 0.45);
    bed2Group.add(desk);

    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), kitchenBlackMat);
    chair.position.set(-0.55, 0.3, partitionZ + 0.85);
    bed2Group.add(chair);

    interiorGroup.add(bed2Group);
  }

  // 7. OBÝVACIA ČASŤ (Z FOTKY 4)
  const livingStart = is2ndBedroomActive ? extraBedRoomEnd : partitionZ;
  const livingEnd = glassZ - 0.3;
  const livingCenterZ = (livingStart + livingEnd) / 2;

  // Stropné klieštiny v krove (presne 4 kusy z fotky 4)
  const beamY = 2.85;
  const beamWidth = 2.60;
  const beamGeo = new THREE.BoxGeometry(beamWidth, 0.12, 0.12);

  const livingSpan = livingEnd - livingStart;
  const beamCount = Math.max(4, Math.floor(livingSpan / 0.85));
  for (let i = 0; i < beamCount; i++) {
    const bz = livingStart + 0.4 + (i * (livingSpan - 0.8)) / (beamCount - 1);
    const beam = new THREE.Mesh(beamGeo, woodMat);
    beam.position.set(0, beamY, bz);
    beam.castShadow = true;
    interiorGroup.add(beam);
  }

  // DIZAJNOVÉ VLNOVKOVÉ LED SVIETIDLO (Z fotky 4)
  const chandelier = new THREE.Group();
  chandelier.position.set(0, 2.7, livingCenterZ);

  // Vlnovková štíhla lišta
  const waveCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.6, 0, -0.15),
    new THREE.Vector3(-0.2, 0.05, 0.1),
    new THREE.Vector3(0.2, -0.05, -0.1),
    new THREE.Vector3(0.6, 0, 0.15)
  ]);
  const waveGeo = new THREE.TubeGeometry(waveCurve, 32, 0.012, 8, false);
  const waveMesh = new THREE.Mesh(waveGeo, kitchenBlackMat);
  chandelier.add(waveMesh);

  // Svietiaci LED pásik na spodku
  const ledGeo = new THREE.TubeGeometry(waveCurve, 32, 0.008, 8, false);
  const ledMesh = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0xfff2d6 }));
  ledMesh.position.y = -0.01;
  chandelier.add(ledMesh);

  interiorGroup.add(chandelier);

  // SVETLOSIVÁ PREŠÍVANÁ L-SEDAČKA (Z fotky 4)
  const sofaGroup = new THREE.Group();
  sofaGroup.position.set(-halfW + 1.15, 0.08, livingCenterZ + 0.2);

  const sLegGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.12, 12);
  const legPositions = [
    [-0.8, 0.06, -0.4], [0.8, 0.06, -0.4],
    [-0.8, 0.06, 1.4], [-0.1, 0.06, 1.4],
    [0.8, 0.06, 0.4]
  ];
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(sLegGeo, kitchenBlackMat);
    leg.position.set(pos[0], pos[1], pos[2]);
    sofaGroup.add(leg);
  });

  const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.15, 0.95), sofaFabricMat);
  sofaBase.position.set(0, 0.2, 0);
  sofaBase.castShadow = true;
  sofaGroup.add(sofaBase);

  const sofaChaiseBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 1.1), sofaFabricMat);
  sofaChaiseBase.position.set(-0.475, 0.2, 0.95);
  sofaChaiseBase.castShadow = true;
  sofaGroup.add(sofaChaiseBase);

  // Prešívané sedáky (tufted blocks z fotky 4)
  const seat1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.85), sofaFabricMat);
  seat1.position.set(0.45, 0.34, 0);
  seat1.castShadow = true;
  sofaGroup.add(seat1);

  const seatChaise = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.18, 1.75), sofaFabricMat);
  seatChaise.position.set(-0.475, 0.34, 0.45);
  seatChaise.castShadow = true;
  sofaGroup.add(seatChaise);

  const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.48, 0.22), sofaFabricMat);
  sofaBack.position.set(0, 0.52, -0.38);
  sofaBack.castShadow = true;
  sofaGroup.add(sofaBack);

  const sofaSideBack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.42, 1.9), sofaFabricMat);
  sofaSideBack.position.set(-0.85, 0.48, 0.45);
  sofaSideBack.castShadow = true;
  sofaGroup.add(sofaSideBack);

  // Vankúšiky
  const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.35, 0.12), pillowMustardMat);
  pillow1.position.set(0.4, 0.52, -0.22);
  pillow1.rotation.set(-0.15, 0.1, 0.1);
  sofaGroup.add(pillow1);

  const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.12), pillowCharcoalMat);
  pillow2.position.set(-0.68, 0.52, 0.8);
  pillow2.rotation.set(0.1, 0.25, -0.15);
  sofaGroup.add(pillow2);

  interiorGroup.add(sofaGroup);

  // DREVENÝ KONFERENČNÝ STOLÍK (Z fotky 4)
  const tableGroup = new THREE.Group();
  tableGroup.position.set(-halfW + 1.25, 0.08, livingCenterZ + 0.55);

  const tTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.55), woodMat);
  tTop.position.set(0, 0.38, 0);
  tTop.castShadow = true;
  tableGroup.add(tTop);

  // Drevené doskové nohy (z fotky 4)
  const tLegL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.45), woodMat);
  tLegL.position.set(-0.38, 0.18, 0);
  tableGroup.add(tLegL);

  const tLegR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.45), woodMat);
  tLegR.position.set(0.38, 0.18, 0);
  tableGroup.add(tLegR);

  interiorGroup.add(tableGroup);

  // NÁSTENNÁ ČIERNA KLIMATIZÁCIA (Z fotky 4 na ľavej stene)
  const acUnit = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.75), kitchenBlackMat);
  acUnit.position.set(-halfW + 0.22, wallHeight - 0.3, livingCenterZ - 0.2);
  interiorGroup.add(acUnit);

  rootGroup.add(interiorGroup);

  // ── 5. HORNÝ MEZONET (Z FOTIEK 3 & 5 - KOĽAJNIČKA SO SVETLAMI + 2 POSTELE) ──────

  const loftGroup = new THREE.Group();
  loftGroup.name = 'Loft_Mezzanine';

  // Podlaha mezonetu (Drevené palubovky z fotky 3 & 5)
  const loftFloor = new THREE.Mesh(new THREE.BoxGeometry(width - 0.36, 0.12, rearZoneLen), woodMat);
  loftFloor.position.set(0, wallHeight + 0.06, rearZoneCenterZ);
  loftFloor.castShadow = true;
  loftFloor.receiveShadow = true;
  loftGroup.add(loftFloor);

  // Čierne zábradlie / kovanie na hrane mezonetu (z fotky 3)
  const loftRail = new THREE.Mesh(new THREE.BoxGeometry(width - 0.4, 0.05, 0.03), frameMat);
  loftRail.position.set(0, wallHeight + 0.15, partitionZ);
  loftGroup.add(loftRail);

  // ČIERNA STROPNÁ KOĽAJNIČKA V HREBENI SO SPOTLIGHTMI (Z fotky 3)
  const trackBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, rearZoneLen - 0.3), kitchenBlackMat);
  trackBar.position.set(0, ridgeHeight - 0.05, rearZoneCenterZ);
  loftGroup.add(trackBar);

  for (let s = 0; s < 5; s++) {
    const spotZ = -halfL + 0.4 + s * 0.5;
    const spotMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 12), kitchenBlackMat);
    spotMesh.position.set(0, ridgeHeight - 0.1, spotZ);
    spotMesh.rotation.x = (s % 2 === 0 ? 0.3 : -0.3);
    loftGroup.add(spotMesh);
  }

  // 2 POSTELE V MEZONETE (Z fotky 5: Dubový korpus + bridlicovo-modré čalúnené čelo)
  const loftBedFrameGeo = new THREE.BoxGeometry(1.0, 0.35, 1.95);
  const loftHeadboardGeo = new THREE.BoxGeometry(1.0, 0.35, 0.08);
  const loftMattressGeo = new THREE.BoxGeometry(0.92, 0.2, 1.85);

  // Ľavá posteľ
  const bed1Frame = new THREE.Mesh(loftBedFrameGeo, woodMat);
  bed1Frame.position.set(-1.25, wallHeight + 0.28, rearZoneCenterZ);
  bed1Frame.castShadow = true;
  loftGroup.add(bed1Frame);

  const bed1Head = new THREE.Mesh(loftHeadboardGeo, headboardSlateBlueMat);
  bed1Head.position.set(-1.25, wallHeight + 0.45, -halfL + 0.15);
  bed1Head.castShadow = true;
  loftGroup.add(bed1Head);

  const bed1Mat = new THREE.Mesh(loftMattressGeo, duvetMat);
  bed1Mat.position.set(-1.25, wallHeight + 0.45, rearZoneCenterZ);
  loftGroup.add(bed1Mat);

  // Pravá posteľ
  const bed2Frame = new THREE.Mesh(loftBedFrameGeo, woodMat);
  bed2Frame.position.set(1.25, wallHeight + 0.28, rearZoneCenterZ);
  bed2Frame.castShadow = true;
  loftGroup.add(bed2Frame);

  const bed2Head = new THREE.Mesh(loftHeadboardGeo, headboardSlateBlueMat);
  bed2Head.position.set(1.25, wallHeight + 0.45, -halfL + 0.15);
  bed2Head.castShadow = true;
  loftGroup.add(bed2Head);

  const bed2Mat = new THREE.Mesh(loftMattressGeo, duvetMat);
  bed2Mat.position.set(1.25, wallHeight + 0.45, rearZoneCenterZ);
  loftGroup.add(bed2Mat);

  // Pri odklopení strechy sa mezonet tiež nadvihne
  if (roofCutaway > 0) {
    loftGroup.position.y += roofCutaway * 2.8;
    loftGroup.position.z -= roofCutaway * 1.2;
  }

  rootGroup.add(loftGroup);

  // ── 6. ZAPUSTENÝ DREVENÝ PORTÁL (Z FOTKY 1) ───────────────────────────────────

  const porchGroup = new THREE.Group();
  porchGroup.name = 'Recessed_Porch_1.3m';

  const porchCenterZ = glassZ + porchDepth / 2;
  const slopeAngle = Math.atan2(gableHeight, halfW);
  const rafterLen = Math.sqrt(halfW * halfW + gableHeight * gableHeight);

  // Obklad portálu (teplý smrek z fotky 1)
  const pWallGeo = new THREE.BoxGeometry(0.04, wallHeight, porchDepth);
  const pWallL = new THREE.Mesh(pWallGeo, woodMat);
  pWallL.position.set(-halfW + 0.22, wallHeight / 2, porchCenterZ);
  porchGroup.add(pWallL);

  const pWallR = new THREE.Mesh(pWallGeo, woodMat);
  pWallR.position.set(halfW - 0.22, wallHeight / 2, porchCenterZ);
  porchGroup.add(pWallR);

  // Drevený podhľad portálu (z fotky 1)
  const ceilGeo = new THREE.BoxGeometry(rafterLen - 0.12, 0.04, porchDepth);
  const ceilL = new THREE.Mesh(ceilGeo, woodMat);
  ceilL.position.set(-halfW / 2 + 0.08, wallHeight + gableHeight / 2 - 0.04, porchCenterZ);
  ceilL.rotation.z = slopeAngle;
  porchGroup.add(ceilL);

  const ceilR = new THREE.Mesh(ceilGeo, woodMat);
  ceilR.position.set(halfW / 2 - 0.08, wallHeight + gableHeight / 2 - 0.04, porchCenterZ);
  ceilR.rotation.z = -slopeAngle;
  porchGroup.add(ceilR);

  // Čelné lemovanie štítu
  const fasciaGeo = new THREE.BoxGeometry(rafterLen + 0.08, 0.32, 0.05);
  const fasciaL = new THREE.Mesh(fasciaGeo, woodMat);
  fasciaL.position.set(-halfW / 2, wallHeight + gableHeight / 2, halfL + 0.02);
  fasciaL.rotation.z = slopeAngle;
  fasciaL.castShadow = true;
  porchGroup.add(fasciaL);

  const fasciaR = new THREE.Mesh(fasciaGeo, woodMat);
  fasciaR.position.set(halfW / 2, wallHeight + gableHeight / 2, halfL + 0.02);
  fasciaR.rotation.z = -slopeAngle;
  fasciaR.castShadow = true;
  porchGroup.add(fasciaR);

  // Čelné stĺpy
  const frontPostGeo = new THREE.BoxGeometry(0.32, wallHeight, 0.05);
  const frontPostL = new THREE.Mesh(frontPostGeo, woodMat);
  frontPostL.position.set(-halfW + 0.16, wallHeight / 2, halfL + 0.02);
  porchGroup.add(frontPostL);

  const frontPostR = new THREE.Mesh(frontPostGeo, woodMat);
  frontPostR.position.set(halfW - 0.16, wallHeight / 2, halfL + 0.02);
  porchGroup.add(frontPostR);

  rootGroup.add(porchGroup);

  // ── 7. PREDNÉ PRESKLENIE S OTVORENÝM KRÍDLOM DVERÍ (Z FOTKY 1) ─────────────────

  const glassFacadeGroup = new THREE.Group();
  glassFacadeGroup.name = 'Glass_Facade';
  glassFacadeGroup.position.set(0, 0, glassZ);

  const glassW = width - 0.44;
  const glassHalf = glassW / 2;
  const doorH = 2.05;

  // Spodné 4 sklenené polia s dverami (z fotky 1)
  const bayW = glassW / 4;
  for (let i = 0; i < 4; i++) {
    const bx = -glassHalf + bayW * i + bayW / 2;

    // Pole 3: Otvorené dverné krídlo smerom na terasu (ako na fotke 1!)
    if (i === 2) {
      // Priechodný otvor v ráme
      const openDoorGroup = new THREE.Group();
      openDoorGroup.position.set(-glassHalf + bayW * 2 + bayW, 0, 0); // Pánt na pravej strane poľa 3

      // Otvorené krídlo vytočené o 65 stupňov smerom von
      openDoorGroup.rotation.y = -1.15;

      const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(bayW - 0.06, doorH - 0.08, 0.06), frameMat);
      doorLeaf.position.set(-(bayW - 0.06) / 2, doorH / 2, 0);
      doorLeaf.castShadow = true;
      openDoorGroup.add(doorLeaf);

      const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(bayW - 0.18, doorH - 0.22, 0.02), glassMat);
      doorGlass.position.set(-(bayW - 0.06) / 2, doorH / 2, 0);
      openDoorGroup.add(doorGlass);

      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.07), frameMat);
      handle.position.set(-(bayW - 0.12), 1.0, 0.04);
      openDoorGroup.add(handle);

      glassFacadeGroup.add(openDoorGroup);
    } else {
      const pane = new THREE.Mesh(new THREE.BoxGeometry(bayW - 0.08, doorH - 0.1, 0.02), glassMat);
      pane.position.set(bx, doorH / 2, 0);
      pane.castShadow = true;
      glassFacadeGroup.add(pane);
    }

    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, doorH, 0.08), frameMat);
    mullion.position.set(-glassHalf + bayW * i, doorH / 2, 0);
    glassFacadeGroup.add(mullion);

    if (i === 1) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.07), frameMat);
      handle.position.set(bx + bayW / 2 - 0.04, 1.0, 0.04);
      glassFacadeGroup.add(handle);
    }
  }
  const lastMullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, doorH, 0.08), frameMat);
  lastMullion.position.set(glassHalf, doorH / 2, 0);
  glassFacadeGroup.add(lastMullion);

  // Masívny drevený horizontálny preklad (z fotky 1)
  const transomH = 0.32;
  const transomBeam = new THREE.Mesh(new THREE.BoxGeometry(glassW + 0.1, transomH, 0.14), woodMat);
  transomBeam.position.set(0, doorH + transomH / 2, 0);
  transomBeam.castShadow = true;
  glassFacadeGroup.add(transomBeam);

  const tBorderBot = new THREE.Mesh(new THREE.BoxGeometry(glassW + 0.12, 0.03, 0.15), frameMat);
  tBorderBot.position.set(0, doorH, 0);
  glassFacadeGroup.add(tBorderBot);

  const tBorderTop = new THREE.Mesh(new THREE.BoxGeometry(glassW + 0.12, 0.03, 0.15), frameMat);
  tBorderTop.position.set(0, doorH + transomH, 0);
  glassFacadeGroup.add(tBorderTop);

  // Horné štítové presklenie s 2 zvislými rámami (z fotky 1)
  const topGableBaseY = doorH + transomH;
  const topGableH = ridgeHeight - topGableBaseY - 0.08;

  const xm = glassHalf * 0.38;
  const hm = topGableH * (1 - xm / glassHalf);

  const leftMullion = new THREE.Mesh(new THREE.BoxGeometry(0.07, hm, 0.08), frameMat);
  leftMullion.position.set(-xm, topGableBaseY + hm / 2, 0);
  glassFacadeGroup.add(leftMullion);

  const rightMullion = new THREE.Mesh(new THREE.BoxGeometry(0.07, hm, 0.08), frameMat);
  rightMullion.position.set(xm, topGableBaseY + hm / 2, 0);
  glassFacadeGroup.add(rightMullion);

  // Stredová tabuľa skla
  const centerShape = new THREE.Shape();
  centerShape.moveTo(-xm + 0.035, 0);
  centerShape.lineTo(xm - 0.035, 0);
  centerShape.lineTo(xm - 0.035, hm - 0.02);
  centerShape.lineTo(0, topGableH);
  centerShape.lineTo(-xm + 0.035, hm - 0.02);
  centerShape.closePath();

  const centerGlass = new THREE.Mesh(new THREE.ShapeGeometry(centerShape), glassMat);
  centerGlass.position.set(0, topGableBaseY, 0);
  glassFacadeGroup.add(centerGlass);

  // Ľavá tabuľa skla
  const leftGableShape = new THREE.Shape();
  leftGableShape.moveTo(-glassHalf + 0.08, 0);
  leftGableShape.lineTo(-xm - 0.035, 0);
  leftGableShape.lineTo(-xm - 0.035, hm - 0.02);
  leftGableShape.lineTo(-glassHalf + 0.08, 0.04);
  leftGableShape.closePath();

  const leftGableGlass = new THREE.Mesh(new THREE.ShapeGeometry(leftGableShape), glassMat);
  leftGableGlass.position.set(0, topGableBaseY, 0);
  glassFacadeGroup.add(leftGableGlass);

  // Pravá tabuľa skla
  const rightGableShape = new THREE.Shape();
  rightGableShape.moveTo(xm + 0.035, 0);
  rightGableShape.lineTo(glassHalf - 0.08, 0);
  rightGableShape.lineTo(glassHalf - 0.08, 0.04);
  rightGableShape.lineTo(xm + 0.035, hm - 0.02);
  rightGableShape.closePath();

  const rightGableGlass = new THREE.Mesh(new THREE.ShapeGeometry(rightGableShape), glassMat);
  rightGableGlass.position.set(0, topGableBaseY, 0);
  glassFacadeGroup.add(rightGableGlass);

  // Šikmé rámy
  const topRafterLen = Math.sqrt(glassHalf * glassHalf + topGableH * topGableH);
  const topRafterGeo = new THREE.BoxGeometry(topRafterLen, 0.06, 0.08);

  const topRafterL = new THREE.Mesh(topRafterGeo, frameMat);
  topRafterL.position.set(-glassHalf / 2, topGableBaseY + topGableH / 2, 0);
  topRafterL.rotation.z = Math.atan2(topGableH, glassHalf);
  glassFacadeGroup.add(topRafterL);

  const topRafterR = new THREE.Mesh(topRafterGeo, frameMat);
  topRafterR.position.set(glassHalf / 2, topGableBaseY + topGableH / 2, 0);
  topRafterR.rotation.z = -Math.atan2(topGableH, glassHalf);
  glassFacadeGroup.add(topRafterR);

  rootGroup.add(glassFacadeGroup);

  // ── 8. SEDLOVÁ STRECHA S VNÚTORNÝM PODHĽADOM ──────────────────────────────────

  const roofGroup = new THREE.Group();
  roofGroup.name = 'Roof_Structure';

  const roofLen = totalLength + 0.06;
  const slopeW = rafterLen + 0.12;

  // Exteriérová strecha
  const roofExtL = new THREE.Mesh(new THREE.BoxGeometry(slopeW, 0.12, roofLen), roofExteriorMat);
  roofExtL.position.set(-halfW / 2, wallHeight + gableHeight / 2 + 0.06, 0);
  roofExtL.rotation.z = slopeAngle;
  roofExtL.castShadow = true;
  roofExtL.receiveShadow = true;
  roofGroup.add(roofExtL);

  const roofExtR = new THREE.Mesh(new THREE.BoxGeometry(slopeW, 0.12, roofLen), roofExteriorMat);
  roofExtR.position.set(halfW / 2, wallHeight + gableHeight / 2 + 0.06, 0);
  roofExtR.rotation.z = -slopeAngle;
  roofExtR.castShadow = true;
  roofExtR.receiveShadow = true;
  roofGroup.add(roofExtR);

  // Vnútorný podhľad strechy (Tatranský profil / Sadrokartón z fotky 3 & 4)
  const roofIntGeo = new THREE.BoxGeometry(rafterLen - 0.05, 0.02, houseBodyLength);
  const roofIntL = new THREE.Mesh(roofIntGeo, interiorWallMat);
  roofIntL.position.set(-halfW / 2 + 0.04, wallHeight + gableHeight / 2 - 0.02, interiorCenterZ);
  roofIntL.rotation.z = slopeAngle;
  roofGroup.add(roofIntL);

  const roofIntR = new THREE.Mesh(roofIntGeo, interiorWallMat);
  roofIntR.position.set(halfW / 2 - 0.04, wallHeight + gableHeight / 2 - 0.02, interiorCenterZ);
  roofIntR.rotation.z = -slopeAngle;
  roofGroup.add(roofIntR);

  // Hrebenáč
  const ridgeCap = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, roofLen), frameMat);
  ridgeCap.position.set(0, ridgeHeight + 0.08, 0);
  ridgeCap.castShadow = true;
  roofGroup.add(ridgeCap);

  // Stojaté falce na streche
  const roofSeamCount = Math.floor(roofLen / 0.45);
  const seamRafterLen = slopeW + 0.04;
  const seamHeight = 0.045;
  const seamThickness = 0.035;

  const normOffsetX = Math.sin(slopeAngle) * 0.08;
  const normOffsetY = Math.cos(slopeAngle) * 0.08;

  for (let i = 0; i <= roofSeamCount; i++) {
    const z = -halfL + (i * roofLen) / roofSeamCount;

    const seamL = new THREE.Mesh(new THREE.BoxGeometry(seamRafterLen, seamHeight, seamThickness), frameMat);
    seamL.position.set(-halfW / 2 - normOffsetX, wallHeight + gableHeight / 2 + 0.06 + normOffsetY, z);
    seamL.rotation.z = slopeAngle;
    seamL.castShadow = true;
    roofGroup.add(seamL);

    const seamR = new THREE.Mesh(new THREE.BoxGeometry(seamRafterLen, seamHeight, seamThickness), frameMat);
    seamR.position.set(halfW / 2 + normOffsetX, wallHeight + gableHeight / 2 + 0.06 + normOffsetY, z);
    seamR.rotation.z = -slopeAngle;
    seamR.castShadow = true;
    roofGroup.add(seamR);
  }

  // Komín
  const chimney = new THREE.Group();
  chimney.position.set(1.4, 3.4, halfL - 2.5);

  const flue = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.4, 16), frameMat);
  flue.castShadow = true;
  chimney.add(flue);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.1, 16), frameMat);
  cap.position.set(0, 0.75, 0);
  chimney.add(cap);

  roofGroup.add(chimney);

  if (roofCutaway > 0) {
    roofGroup.position.y += roofCutaway * 3.8;
    roofGroup.position.z -= roofCutaway * 1.6;
  }

  rootGroup.add(roofGroup);

  // ── 9. SVETLÁ A AMBIENT (TEPLÉ DENNÉ SLNKO PODĽA FOTIEK) ───────────────────────

  if (isNight || isSunset) {
    const pLight = new THREE.PointLight(0xffaa44, isNight ? 2.5 : 1.2, 8, 1.5);
    pLight.position.set(0, 2.1, glassZ + 0.65);
    rootGroup.add(pLight);

    const intLight = new THREE.PointLight(0xffd588, isNight ? 3.0 : 1.5, 12, 1.8);
    intLight.position.set(0, 2.0, 0);
    rootGroup.add(intLight);
  }

  return rootGroup;
}
