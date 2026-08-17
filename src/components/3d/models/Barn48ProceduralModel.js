import * as THREE from 'three';

/**
 * Plne fotorealistický architektonický 3D Model pre Barn House 48 (PH-008)
 * Presne namodelovaný podľa architektonického výkresu a reálnych fotografií:
 * - Rozmery: Šírka 4.6 m, Celková dĺžka 8.0 m (obytná časť 6.7 m + krytá terasa 1.3 m)
 * - PREDLŽOVANIE DOMU:
 *    • Kúpeľňa, spálňa a mezonet majú PEVNÚ dĺžku 2.8 m a NEPREDLŽUJÚ SA
 *    • Predlžuje sa výlučne obývačková časť (z 3.9 m až na 7.8 m pri +3.9 m)
 *    • Kuchynská linka zostáva fixne ukotvená na svojom pôvodnom mieste pri priečke
 *    • Pri predĺžení o +3.9 m je možnosť pridať 2. SPÁLŇU so spoločnou stenou s pôvodnou spálňou
 * - Zadná stena: Celodrevený smrekový obklad s 3 priechodnými oknami (mezonet, kúpeľňa, spálňa)
 * - Spálňa 1: Manželská posteľ prisunutá pod zadné okno, perina, vankúše, Roldor skriňa
 * - Kúpeľňa: Walk-in sprcha s čírym sklom, drevená skrinka s umývadlom a zrkadlom, závesné WC, bojler
 * - Klieštiny: Priečne drevené trámy v krove v rovnakej výške (2.85 m)
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

  // PEVNÁ ZADNÁ ZÓNA (Spálňa + Kúpeľňa + Mezonet majú vždy fixne 2.8 m)
  const rearZoneLen = 2.8;
  const partitionZ = -halfL + rearZoneLen;
  const rearZoneCenterZ = -halfL + rearZoneLen / 2;

  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';

  // ── 1. PROCEDURÁLNE TEXTÚRY A PBR MATERIÁLY ────────────────────────────────────

  // Textúra Tatranského profilu (Škandinávsky smrek)
  const createPineTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#deb887';
    ctx.fillRect(0, 0, 1024, 1024);

    const boardW = 48;
    for (let x = 0; x < 1024; x += boardW) {
      const tint = (Math.random() - 0.5) * 18;
      ctx.fillStyle = `rgb(${222 + tint}, ${184 + tint * 0.8}, ${135 + tint * 0.6})`;
      ctx.fillRect(x, 0, boardW, 1024);

      // Zvislá škára
      ctx.fillStyle = 'rgba(70, 45, 20, 0.4)';
      ctx.fillRect(x, 0, 2, 1024);
      ctx.fillStyle = 'rgba(255, 240, 210, 0.25)';
      ctx.fillRect(x + 2, 0, 1, 1024);

      // Vlákna
      for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = 'rgba(100, 60, 25, 0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const sx = x + Math.random() * boardW;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + (Math.random() - 0.5) * 6, 1024);
        ctx.stroke();
      }

      // Hrkčky
      if (Math.random() > 0.65) {
        ctx.fillStyle = 'rgba(90, 50, 20, 0.35)';
        ctx.beginPath();
        ctx.ellipse(x + boardW / 2, Math.random() * 900 + 50, 5, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  };

  // Textúra Bieleho sadrokartónu
  const createDrywallTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const alpha = Math.random() * 0.03;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(0, 0, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha * 2})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  };

  // Textúra tmavej dlažby
  const createTileTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#15171a';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 256, 256);
    ctx.strokeRect(256, 0, 256, 256);
    ctx.strokeRect(0, 256, 256, 256);
    ctx.strokeRect(256, 256, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 8);
    return tex;
  };

  const pineTexture = createPineTexture();
  const drywallTexture = createDrywallTexture();
  const tileTexture = createTileTexture();

  // PBR Materiály
  const woodMat = new THREE.MeshStandardMaterial({
    map: pineTexture,
    color: 0xdeb887,
    roughness: 0.6,
    metalness: 0.02,
    name: 'PinePanels'
  });

  const whiteDrywallMat = new THREE.MeshStandardMaterial({
    map: drywallTexture,
    color: 0xf6f7f9,
    roughness: 0.9,
    metalness: 0.01,
    name: 'WhiteDrywall'
  });

  const isDrywall = interiorType === 'drywall';
  const interiorWallMat = isDrywall ? whiteDrywallMat : woodMat;

  const darkTileMat = new THREE.MeshStandardMaterial({
    map: tileTexture,
    color: 0x24272c,
    roughness: 0.45,
    metalness: 0.1,
    name: 'FloorTiles'
  });

  const lightGreyMetalMat = new THREE.MeshStandardMaterial({
    color: 0x828b96,
    roughness: 0.4,
    metalness: 0.55,
    name: 'LightGreyMetal'
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1e2227,
    roughness: 0.35,
    metalness: 0.8,
    name: 'AnthraciteAluFrame'
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: isNight ? 0xffeaaf : 0xa6d1f0,
    transmission: 0.9,
    opacity: 0.35,
    transparent: true,
    roughness: 0.03,
    metalness: 0.1,
    ior: 1.52,
    reflectivity: 0.85
  });

  const sofaFabricMat = new THREE.MeshStandardMaterial({
    color: 0x939ba6,
    roughness: 0.85,
    metalness: 0.02
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

  const kitchenCabinetMat = new THREE.MeshStandardMaterial({
    color: 0x607d79,
    roughness: 0.45,
    metalness: 0.05
  });

  const kitchenTopMat = new THREE.MeshStandardMaterial({
    map: pineTexture,
    color: 0xd49b5c,
    roughness: 0.4
  });

  const kitchenBlackMat = new THREE.MeshStandardMaterial({
    color: 0x181a1d,
    roughness: 0.25,
    metalness: 0.85
  });

  const bathroomTileMat = new THREE.MeshStandardMaterial({
    color: 0x8c929a,
    roughness: 0.4
  });

  const ceramicWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.05
  });

  const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0xe0e8f0,
    roughness: 0.02,
    metalness: 0.95
  });

  const duvetMat = new THREE.MeshStandardMaterial({
    color: 0xf0f3f6,
    roughness: 0.92
  });

  const duvetBlueMat = new THREE.MeshStandardMaterial({
    color: 0x9fb5c8,
    roughness: 0.9
  });

  const headboardMat = new THREE.MeshStandardMaterial({
    color: 0xd3c5b4,
    roughness: 0.85
  });

  const plantMat = new THREE.MeshStandardMaterial({
    color: 0x3d6e4a,
    roughness: 0.6
  });

  const sideWallExteriorMat = facade === 'wood' ? woodMat : (facade === 'stucco' ? whiteDrywallMat : lightGreyMetalMat);
  const roofExteriorMat = lightGreyMetalMat;
  const rearWallExteriorMat = woodMat;

  // ── 2. ZÁKLADY & TERASA ────────────────────────────────────────────────────────

  const siteGroup = new THREE.Group();
  siteGroup.name = 'Foundation_Site';

  const groundGeo = new THREE.CylinderGeometry(15, 15, 0.3, 32);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x544e44, roughness: 0.95 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.set(0, -0.95, 0);
  ground.receiveShadow = true;
  siteGroup.add(ground);

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

  // Predná terasa
  const extTerraceLen = 2.2;
  const fullTerraceLen = porchDepth + extTerraceLen;
  const deckGeo = new THREE.BoxGeometry(width, 0.06, fullTerraceLen);
  const deckMat = new THREE.MeshStandardMaterial({ map: pineTexture, color: 0xc4874a, roughness: 0.65 });
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.set(0, 0.03, glassZ + fullTerraceLen / 2);
  deck.receiveShadow = true;
  deck.castShadow = true;
  siteGroup.add(deck);

  rootGroup.add(siteGroup);

  // ── 3. HLAVNÝ KORPUS (VONKAJŠIE AJ VNÚTORNÉ STENY, PODLAHA, ZADNÝ ŠTÍT S OTVORMI) ──

  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'HouseBody';

  const interiorCenterZ = (glassZ + (-halfL)) / 2;

  // Spodná dlažba v interiéri
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

  // Otvor pre horné okno mezonetu
  const loftHole = new THREE.Path();
  loftHole.moveTo(-0.275, wallHeight + 0.95 - 0.375);
  loftHole.lineTo(0.275, wallHeight + 0.95 - 0.375);
  loftHole.lineTo(0.275, wallHeight + 0.95 + 0.375);
  loftHole.lineTo(-0.275, wallHeight + 0.95 + 0.375);
  loftHole.closePath();
  backShape.holes.push(loftHole);

  // Otvor pre okno kúpeľne (vpravo od stredu zozadu)
  const bathHole = new THREE.Path();
  bathHole.moveTo(0.95 - 0.325, 1.25 - 0.475);
  bathHole.lineTo(0.95 + 0.325, 1.25 - 0.475);
  bathHole.lineTo(0.95 + 0.325, 1.25 + 0.475);
  bathHole.lineTo(0.95 - 0.325, 1.25 + 0.475);
  bathHole.closePath();
  backShape.holes.push(bathHole);

  // Otvor pre okno spálne (vľavo od stredu zozadu)
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

  // Interiérová zadná stena (reaguje na výber interiéru!)
  const backIntGeo = new THREE.ExtrudeGeometry(backShape, { depth: 0.03, bevelEnabled: false });
  const backWallInt = new THREE.Mesh(backIntGeo, interiorWallMat);
  backWallInt.position.set(0, 0, -halfL);
  bodyGroup.add(backWallInt);

  // 3 KOMPLETNÉ OKNÁ NA ZADNEJ STENE
  // 1. Okno mezonetu
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

  // 2. Okno kúpeľne
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

  // 3. Okno spálne (veľké dvojkrídlové)
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

  // Vnútorný obklad bočných stien
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

  // Ak je zapnutá 2. spálňa pri +3.9m, pridáme bočné okno aj pre 2. spálňu
  if (extension >= 3.9 && extraBedroom) {
    const sideWin2Group = new THREE.Group();
    sideWin2Group.position.set(-halfW - 0.01, wallHeight / 2, partitionZ + 1.25);
    const sCasing2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.85, 0.75), woodMat);
    sideWin2Group.add(sCasing2);
    const sFrame2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.7, 0.55), frameMat);
    sideWin2Group.add(sFrame2);
    const sGlass2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.6, 0.45), glassMat);
    sideWin2Group.add(sGlass2);
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

  // ── 4. KOMPLETNÝ INTERIÉR (SPÁLŇA 1, KÚPEĽŇA, KUCHYŇA, OBÝVAČKA, VOLITEĽNÁ SPÁLŇA 2) ──

  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'Detailed_Interior';

  // 1. FIXNÁ SPÁLŇA 1 NA PRÍZEMÍ (2.8m dlhá, nepredlžuje sa)
  const bedRoomGroup = new THREE.Group();

  // Manželská posteľ pod zadným oknom
  const bedGroup = new THREE.Group();
  bedGroup.position.set(-1.05, 0.08, -halfL + 1.08);

  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 2.05), woodMat);
  bedFrame.position.set(0, 0.18, 0);
  bedFrame.castShadow = true;
  bedGroup.add(bedFrame);

  const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.72, 0.08), headboardMat);
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

  // Vstavaná skriňa Roldor pri spoločnej priečke
  const roldorGroup = new THREE.Group();
  roldorGroup.position.set(-halfW / 2 + 0.1, 0.08, partitionZ - 0.3);

  const roldorBody = new THREE.Mesh(new THREE.BoxGeometry(halfW - 0.4, wallHeight - 0.15, 0.55), woodMat);
  roldorBody.position.set(0, wallHeight / 2 - 0.075, 0);
  roldorBody.castShadow = true;
  roldorGroup.add(roldorBody);

  const roldorDoor1 = new THREE.Mesh(new THREE.BoxGeometry((halfW - 0.4) / 2 - 0.02, wallHeight - 0.2, 0.03), mirrorMat);
  roldorDoor1.position.set(-((halfW - 0.4) / 4), wallHeight / 2 - 0.075, 0.28);
  roldorGroup.add(roldorDoor1);

  const roldorDoor2 = new THREE.Mesh(new THREE.BoxGeometry((halfW - 0.4) / 2 - 0.02, wallHeight - 0.2, 0.03), woodMat);
  roldorDoor2.position.set(((halfW - 0.4) / 4), wallHeight / 2 - 0.075, 0.26);
  roldorGroup.add(roldorDoor2);

  const roldorRail = new THREE.Mesh(new THREE.BoxGeometry(halfW - 0.38, 0.04, 0.06), frameMat);
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

  // 3. FIXNÁ KÚPEĽŇA (2.8m dlhá, nepredlžuje sa)
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

  // 4. HLAVNÁ PRIEČKA MEDZI SPÁLŇOU/KÚPEĽŇOU A OBÝVAČKOU
  const partLeft = new THREE.Mesh(new THREE.BoxGeometry(halfW - 0.2, wallHeight, 0.1), interiorWallMat);
  partLeft.position.set(-halfW / 2 + 0.1, wallHeight / 2, partitionZ);
  partLeft.castShadow = true;
  interiorGroup.add(partLeft);

  const partRight = new THREE.Mesh(new THREE.BoxGeometry(1.2, wallHeight, 0.1), interiorWallMat);
  partRight.position.set(halfW - 0.7, wallHeight / 2, partitionZ);
  partRight.castShadow = true;
  interiorGroup.add(partRight);

  // Rebrík opretý o hranu mezonetu
  const ladderGroup = new THREE.Group();
  ladderGroup.position.set(0.45, 0, partitionZ + 0.25);
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

  // 5. KUCHYNSKÁ LINKA (Fixne ukotvená pri priečke na pravej strane - NEPOSÚVA SA A NEPREDLŽUJE!)
  const kitchenGroup = new THREE.Group();
  // Kuchynská linka začína priamo pred kúpeľňovou priečkou (partitionZ + 1.35m)
  kitchenGroup.position.set(halfW - 0.45, 0.08, partitionZ + 1.35);

  const kCabinets = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 2.5), kitchenCabinetMat);
  kCabinets.position.set(0, 0.425, 0);
  kCabinets.castShadow = true;
  kitchenGroup.add(kCabinets);

  const kTop = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.05, 2.52), kitchenTopMat);
  kTop.position.set(0, 0.875, 0);
  kTop.castShadow = true;
  kitchenGroup.add(kTop);

  const hob = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.02, 0.55), kitchenBlackMat);
  hob.position.set(0, 0.905, 0.3);
  kitchenGroup.add(hob);

  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 0.55), kitchenBlackMat);
  hood.position.set(-0.1, 1.65, 0.3);
  hood.rotation.z = -0.3;
  kitchenGroup.add(hood);

  const sink = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.5), kitchenBlackMat);
  sink.position.set(0, 0.905, -0.4);
  kitchenGroup.add(sink);

  const faucet = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 12, 24, Math.PI), kitchenBlackMat);
  faucet.position.set(0.18, 1.02, -0.4);
  faucet.rotation.y = Math.PI / 2;
  kitchenGroup.add(faucet);

  const tallUnit = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.9, 0.65), kitchenCabinetMat);
  tallUnit.position.set(0, 0.95, -0.925);
  tallUnit.castShadow = true;
  kitchenGroup.add(tallUnit);

  const oven = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.55, 0.58), kitchenBlackMat);
  oven.position.set(-0.02, 1.15, -0.925);
  kitchenGroup.add(oven);

  const ovenHandle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.45), ceramicWhiteMat);
  ovenHandle.position.set(-0.33, 1.35, -0.925);
  kitchenGroup.add(ovenHandle);

  const upperCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.9), kitchenCabinetMat);
  upperCabinet.position.set(-0.12, 1.75, -0.4);
  kitchenGroup.add(upperCabinet);

  const tv = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.75, 1.25), kitchenBlackMat);
  tv.position.set(-0.25, 1.4, 1.4);
  kitchenGroup.add(tv);

  interiorGroup.add(kitchenGroup);

  // 6. MOŽNOSŤ 2. SPÁLNE (PRI PREDĹŽENÍ O +3.9 m, ZDIEĽA SPOLOČNÚ STENU SO SPÁLŇOU 1)
  const is2ndBedroomActive = extension >= 3.9 && extraBedroom;
  const extraBedRoomLen = 2.4;
  const extraBedRoomEnd = partitionZ + extraBedRoomLen;

  if (is2ndBedroomActive) {
    const bed2Group = new THREE.Group();
    bed2Group.name = 'Extra_Bedroom_2';

    // Predná priečka 2. spálne oddeľujúca ju od zvyšku obývačky
    const bed2FrontWall = new THREE.Mesh(new THREE.BoxGeometry(halfW - 0.2, wallHeight, 0.1), interiorWallMat);
    bed2FrontWall.position.set(-halfW / 2 + 0.1, wallHeight / 2, extraBedRoomEnd);
    bed2FrontWall.castShadow = true;
    bed2Group.add(bed2FrontWall);

    // Pozdĺžna chodbičková stena oddeľujúca 2. spálňu od kuchyne/chodby
    const bed2SideWall = new THREE.Mesh(new THREE.BoxGeometry(0.1, wallHeight, extraBedRoomLen), interiorWallMat);
    bed2SideWall.position.set(0, wallHeight / 2, partitionZ + extraBedRoomLen / 2);
    bed2SideWall.castShadow = true;
    bed2Group.add(bed2SideWall);

    // Posteľ v 2. spálni (Samostatné lôžko / Twin bed)
    const bed2CenterZ = partitionZ + 1.2;
    const singleBed = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.35, 2.0), woodMat);
    singleBed.position.set(-halfW + 0.65, 0.26, bed2CenterZ);
    singleBed.castShadow = true;
    bed2Group.add(singleBed);

    const singleMattress = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.2, 1.92), duvetBlueMat);
    singleMattress.position.set(-halfW + 0.65, 0.44, bed2CenterZ);
    bed2Group.add(singleMattress);

    const singlePillow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.35), duvetMat);
    singlePillow.position.set(-halfW + 0.65, 0.56, bed2CenterZ - 0.65);
    bed2Group.add(singlePillow);

    // Písací stolík so stoličkou v 2. spálni
    const desk = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.75, 0.5), woodMat);
    desk.position.set(-0.6, 0.45, partitionZ + 0.4);
    bed2Group.add(desk);

    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), kitchenBlackMat);
    chair.position.set(-0.6, 0.3, partitionZ + 0.85);
    bed2Group.add(chair);

    interiorGroup.add(bed2Group);
  }

  // 7. OBÝVACIA ČASŤ (PREDLŽUJE SA S DOMOM)
  const livingStart = is2ndBedroomActive ? extraBedRoomEnd : partitionZ;
  const livingEnd = glassZ - 0.3;
  const livingCenterZ = (livingStart + livingEnd) / 2;

  // Stropné klieštiny v obývačke
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

  // Moderný kruhový LED závesný luster v obývačke
  const chandelier = new THREE.Group();
  chandelier.position.set(0, 2.7, livingCenterZ);
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.015, 16, 32), new THREE.MeshBasicMaterial({ color: 0xfff0d0 }));
  ring1.rotation.x = Math.PI / 2;
  chandelier.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.012, 16, 32), new THREE.MeshBasicMaterial({ color: 0xfff0d0 }));
  ring2.rotation.x = Math.PI / 2;
  ring2.position.set(0, -0.15, 0);
  chandelier.add(ring2);
  interiorGroup.add(chandelier);

  // Rohová sedačka v obývačke
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

  const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.35, 0.12), pillowMustardMat);
  pillow1.position.set(0.4, 0.52, -0.22);
  pillow1.rotation.set(-0.15, 0.1, 0.1);
  sofaGroup.add(pillow1);

  const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.12), pillowCharcoalMat);
  pillow2.position.set(-0.68, 0.52, 0.8);
  pillow2.rotation.set(0.1, 0.25, -0.15);
  sofaGroup.add(pillow2);

  interiorGroup.add(sofaGroup);

  // Konferenčný stolík
  const tableGroup = new THREE.Group();
  tableGroup.position.set(-halfW + 1.25, 0.08, livingCenterZ + 0.55);

  const tTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.55), woodMat);
  tTop.position.set(0, 0.38, 0);
  tTop.castShadow = true;
  tableGroup.add(tTop);

  const tLegPositions = [[-0.4, 0.19, -0.22], [0.4, 0.19, -0.22], [-0.4, 0.19, 0.22], [0.4, 0.19, 0.22]];
  tLegPositions.forEach(p => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.38, 12), kitchenBlackMat);
    leg.position.set(p[0], p[1], p[2]);
    tableGroup.add(leg);
  });

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.07, 16), ceramicWhiteMat);
  pot.position.set(-0.2, 0.44, 0);
  tableGroup.add(pot);

  const plant = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), plantMat);
  plant.position.set(-0.2, 0.49, 0);
  tableGroup.add(plant);

  const book = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.015, 0.24), frameMat);
  book.position.set(0.18, 0.41, 0.05);
  book.rotation.y = 0.3;
  tableGroup.add(book);

  interiorGroup.add(tableGroup);

  // Nástenná klimatizácia
  const acUnit = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.75), kitchenBlackMat);
  acUnit.position.set(-halfW + 0.28, wallHeight - 0.3, livingCenterZ);
  interiorGroup.add(acUnit);

  rootGroup.add(interiorGroup);

  // ── 5. FIXNÝ HORNÝ MEZONET (2.8 m DĹŽKA, NEPREDLŽUJE SA, NADVIHUJE SA PRI ODKRYTÍ) ──

  const loftGroup = new THREE.Group();
  loftGroup.name = 'Loft_Mezzanine';

  // Podlaha mezonetu (vždy presne nad zadnou zónou 2.8 m)
  const loftFloor = new THREE.Mesh(new THREE.BoxGeometry(width - 0.36, 0.12, rearZoneLen), woodMat);
  loftFloor.position.set(0, wallHeight + 0.06, rearZoneCenterZ);
  loftFloor.castShadow = true;
  loftFloor.receiveShadow = true;
  loftGroup.add(loftFloor);

  // 2 Postele v mezonete
  const loftBedGeo = new THREE.BoxGeometry(1.0, 0.35, 1.9);
  const loftMattressGeo = new THREE.BoxGeometry(0.92, 0.18, 1.82);

  const bed1Frame = new THREE.Mesh(loftBedGeo, woodMat);
  bed1Frame.position.set(-1.25, wallHeight + 0.28, rearZoneCenterZ);
  bed1Frame.castShadow = true;
  loftGroup.add(bed1Frame);

  const bed1Mat = new THREE.Mesh(loftMattressGeo, duvetMat);
  bed1Mat.position.set(-1.25, wallHeight + 0.45, rearZoneCenterZ);
  loftGroup.add(bed1Mat);

  const bed2Frame = new THREE.Mesh(loftBedGeo, woodMat);
  bed2Frame.position.set(1.25, wallHeight + 0.28, rearZoneCenterZ);
  bed2Frame.castShadow = true;
  loftGroup.add(bed2Frame);

  const bed2Mat = new THREE.Mesh(loftMattressGeo, duvetMat);
  bed2Mat.position.set(1.25, wallHeight + 0.45, rearZoneCenterZ);
  loftGroup.add(bed2Mat);

  // Pri odklopení strechy sa mezonet tiež nadvihne
  if (roofCutaway > 0) {
    loftGroup.position.y += roofCutaway * 2.8;
    loftGroup.position.z -= roofCutaway * 1.2;
  }

  rootGroup.add(loftGroup);

  // ── 6. ZAPUSTENÝ DREVENÝ PORTÁL (KRYTÁ TERASA 1.3M) ───────────────────────────

  const porchGroup = new THREE.Group();
  porchGroup.name = 'Recessed_Porch_1.3m';

  const porchCenterZ = glassZ + porchDepth / 2;
  const slopeAngle = Math.atan2(gableHeight, halfW);
  const rafterLen = Math.sqrt(halfW * halfW + gableHeight * gableHeight);

  // Obklad portálu
  const pWallGeo = new THREE.BoxGeometry(0.04, wallHeight, porchDepth);
  const pWallL = new THREE.Mesh(pWallGeo, woodMat);
  pWallL.position.set(-halfW + 0.22, wallHeight / 2, porchCenterZ);
  porchGroup.add(pWallL);

  const pWallR = new THREE.Mesh(pWallGeo, woodMat);
  pWallR.position.set(halfW - 0.22, wallHeight / 2, porchCenterZ);
  porchGroup.add(pWallR);

  // Drevený podhľad portálu
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

  // ── 7. PREDNÁ SKLENENÁ STENA S DREVENÝM PREKLADOM A 2 ZVISLÝMI ŠTÍTOVÝMI RÁMAMI ─

  const glassFacadeGroup = new THREE.Group();
  glassFacadeGroup.name = 'Glass_Facade';
  glassFacadeGroup.position.set(0, 0, glassZ);

  const glassW = width - 0.44;
  const glassHalf = glassW / 2;
  const doorH = 2.05;

  // Spodné 4 sklenené polia s dverami
  const bayW = glassW / 4;
  for (let i = 0; i < 4; i++) {
    const bx = -glassHalf + bayW * i + bayW / 2;

    const pane = new THREE.Mesh(new THREE.BoxGeometry(bayW - 0.08, doorH - 0.1, 0.02), glassMat);
    pane.position.set(bx, doorH / 2, 0);
    pane.castShadow = true;
    glassFacadeGroup.add(pane);

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

  // Masívny drevený horizontálny preklad
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

  // Horné štítové presklenie s 2 zvislými rámami (3 polia)
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

  // Vnútorný podhľad strechy (Tatranský profil / Sadrokartón)
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

  // ── 9. SVETLÁ A AMBIENT ────────────────────────────────────────────────────────

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
