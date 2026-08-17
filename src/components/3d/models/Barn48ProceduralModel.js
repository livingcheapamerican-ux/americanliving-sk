import * as THREE from 'three';

/**
 * Fotorealistický 3D Model pre Barn House 48 (PH-008)
 * Presne namodelovaný podľa reálnych výrobných fotografií:
 * - Zapustený predný portál (krytá terasa s hĺbkou 1.2 m s celodreveným škandinávskym obkladom)
 * - 4-dielna spodná sklenená stena s otváracími terasovými dverami a kovaním
 * - Trojdielne štítové presklenie kopírujúce 45° sedlovú strechu
 * - Vyvýšené stĺpové základy (drevené pätky + oceľové zemné skrutky a zavetrovanie)
 * - Pozdĺžne drážkovaná terasa zo severskej borovice
 * - Čierny nerezový komín na pravej strane strechy
 * - PBR materiály s vysokým detailom (antracitový falcovaný plech, škandinávsky smrek, prémiové sklo)
 */

export function createBarn48Model({
  facade = 'standard', // 'standard' (antracit+drevo), 'wood' (celodrevo), 'stucco' (biela omietka)
  extension = 0,       // 0, 1.2, 2.4, 3.6, 4.8 m
  roofCutaway = 0,     // 0.0 až 1.0 (odklopenie strechy pre zobrazenie interiéru)
  timeOfDay = 'day',   // 'day', 'sunset', 'night'
  interiorType = 'wood' // 'wood', 'drywall'
}) {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'Barn48_Photorealistic_House';

  const width = 4.8;
  const wallHeight = 2.8;
  const ridgeHeight = 4.65;
  const gableHeight = ridgeHeight - wallHeight; // 1.85m
  const porchDepth = 1.25; // Hĺbka zapusteného predného portálu
  const length = 9.6 + extension;
  const halfW = width / 2;
  const halfL = length / 2;
  const glassZ = halfL - porchDepth; // Pozícia sklenenej steny

  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';

  // ── 1. PROCEDURÁLNE PBR TEXTÚRY A MATERIÁLY ────────────────────────────────────

  // Vytvorenie procedurálnej textúry dreva (plank normal/bump efekt)
  const createWoodTexture = (baseHex, isDark = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Základná farba dreva
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 512);

    // Zvislé lamely a letokruhy dreva
    const plankWidth = 32;
    for (let x = 0; x < 512; x += plankWidth) {
      ctx.strokeStyle = isDark ? 'rgba(40,25,15,0.4)' : 'rgba(120,80,40,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();

      // Jemná štruktúra vlákien
      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = 'rgba(0,0,0,0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + i * 5 + Math.random() * 2, 0);
        ctx.lineTo(x + i * 5 + Math.random() * 2, 512);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  // Textúra terasových dosiek s drážkami
  const createDeckTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#b87c44';
    ctx.fillRect(0, 0, 256, 512);

    // Pozdĺžne ryhy terasy
    for (let x = 0; x < 256; x += 16) {
      ctx.fillStyle = '#8f5828';
      ctx.fillRect(x, 0, 3, 512);
      ctx.fillStyle = '#d49b5c';
      ctx.fillRect(x + 3, 0, 1, 512);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8);
    return texture;
  };

  const woodTexture = createWoodTexture('#cf9556');
  const deckTexture = createDeckTexture();

  // PBR Materiály
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTexture,
    color: 0xdca468,
    roughness: 0.65,
    metalness: 0.05,
    name: 'NordicSpruce'
  });

  const porchWoodMat = new THREE.MeshStandardMaterial({
    map: woodTexture,
    color: 0xe0a66a,
    roughness: 0.6,
    metalness: 0.02,
    name: 'PorchSpruce'
  });

  const anthraciteMat = new THREE.MeshStandardMaterial({
    color: 0x1f2328,
    roughness: 0.38,
    metalness: 0.65,
    name: 'AnthraciteSeam'
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1b1d21,
    roughness: 0.28,
    metalness: 0.85,
    name: 'AluFrame'
  });

  const stuccoMat = new THREE.MeshStandardMaterial({
    color: 0xf6f5f0,
    roughness: 0.94,
    metalness: 0.01,
    name: 'WhiteStucco'
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: isNight ? 0xfff0cc : 0x90c4e8,
    transmission: 0.92,
    opacity: 0.35,
    transparent: true,
    roughness: 0.04,
    metalness: 0.1,
    ior: 1.52,
    reflectivity: 0.8,
    name: 'Glass'
  });

  const deckMat = new THREE.MeshStandardMaterial({
    map: deckTexture,
    color: 0xb57b42,
    roughness: 0.72,
    metalness: 0.05,
    name: 'TerraceDecking'
  });

  const foundationWoodMat = new THREE.MeshStandardMaterial({
    map: woodTexture,
    color: 0x966030,
    roughness: 0.85,
    name: 'FoundationPosts'
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x4a4f55,
    roughness: 0.45,
    metalness: 0.85,
    name: 'GalvanizedSteel'
  });

  const interiorWallMat = new THREE.MeshStandardMaterial({
    color: interiorType === 'wood' ? 0xdfba8c : 0xf4f1eb,
    roughness: 0.85,
    name: 'InteriorWall'
  });

  const interiorFloorMat = new THREE.MeshStandardMaterial({
    color: 0xc8985c,
    roughness: 0.6,
    name: 'OSB_Floor'
  });

  // Výber fasády
  const outerWallMat = facade === 'wood' ? woodMat : (facade === 'stucco' ? stuccoMat : anthraciteMat);
  const roofMat = anthraciteMat;

  // ── 2. ZÁKLADY, VYVÝŠENÉ STĹPIKY A TERASA ─────────────────────────────────────

  const foundationGroup = new THREE.Group();
  foundationGroup.name = 'Foundation_And_Terrace';

  const groundClearance = 0.85; // Svetlá výška nad terénom
  const totalDeckLength = 4.2; // Predĺženie terasy pred dom

  // Masívne drevené stĺpy základov (viditeľné na fotke 1)
  const postWidth = 0.32;
  const postHeight = groundClearance;
  const postGeo = new THREE.BoxGeometry(postWidth, postHeight, postWidth);

  const postPositionsX = [-halfW + 0.3, -halfW / 3, halfW / 3, halfW - 0.3];
  const postPositionsZ = [halfL + totalDeckLength - 0.3, halfL + 0.4, 0, -halfL + 0.4];

  postPositionsZ.forEach(pz => {
    postPositionsX.forEach(px => {
      // Drevený hranol
      const post = new THREE.Mesh(postGeo, foundationWoodMat);
      post.position.set(px, -postHeight / 2, pz);
      post.castShadow = true;
      post.receiveShadow = true;
      foundationGroup.add(post);

      // Oceľová zemná skrutka / pätka pod stĺpom
      const screwGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 12);
      const screw = new THREE.Mesh(screwGeo, steelMat);
      screw.position.set(px, -postHeight - 0.15, pz);
      foundationGroup.add(screw);
    });
  });

  // Oceľové zavetrovanie (diagonálne tiahla pod terasou)
  const braceMat = steelMat;
  for (let i = 0; i < postPositionsX.length - 1; i++) {
    const p1 = new THREE.Vector3(postPositionsX[i], -0.1, halfL + totalDeckLength - 0.3);
    const p2 = new THREE.Vector3(postPositionsX[i + 1], -groundClearance + 0.1, halfL + 0.4);
    const braceGeo = new THREE.CylinderGeometry(0.015, 0.015, p1.distanceTo(p2), 8);
    const brace = new THREE.Mesh(braceGeo, braceMat);
    brace.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
    brace.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
    foundationGroup.add(brace);
  }

  // Drevená pochôdzna terasa (začína od skla glassZ a siaha dopredu)
  const deckLength = (halfL + totalDeckLength) - glassZ;
  const deckCenterZ = glassZ + deckLength / 2;
  const deckWidth = width + 0.2;

  const deckBoardGeo = new THREE.BoxGeometry(deckWidth, 0.06, deckLength);
  const deckMesh = new THREE.Mesh(deckBoardGeo, deckMat);
  deckMesh.position.set(0, 0.03, deckCenterZ);
  deckMesh.receiveShadow = true;
  deckMesh.castShadow = true;
  foundationGroup.add(deckMesh);

  // Čelná obvodová zvislá lišta terasy (Fascia apron - viditeľná na fotke 1)
  const terraceApronGeo = new THREE.BoxGeometry(deckWidth + 0.04, 0.45, 0.05);
  const terraceApron = new THREE.Mesh(terraceApronGeo, foundationWoodMat);
  terraceApron.position.set(0, -0.2, halfL + totalDeckLength);
  terraceApron.castShadow = true;
  foundationGroup.add(terraceApron);

  rootGroup.add(foundationGroup);

  // ── 3. HLAVNÝ KORPUS DOMU & INTERIÉR ──────────────────────────────────────────

  const houseGroup = new THREE.Group();
  houseGroup.name = 'HouseBody';

  const interiorLength = glassZ - (-halfL);
  const interiorCenterZ = (glassZ + (-halfL)) / 2;

  // Vnútorná podlaha (OSB / Drevo)
  const floorGeo = new THREE.BoxGeometry(width - 0.4, 0.08, interiorLength - 0.2);
  const floor = new THREE.Mesh(floorGeo, interiorFloorMat);
  floor.position.set(0, 0.04, interiorCenterZ);
  floor.receiveShadow = true;
  houseGroup.add(floor);

  // Zadná stena
  const backWallShape = new THREE.Shape();
  backWallShape.moveTo(-halfW, 0);
  backWallShape.lineTo(halfW, 0);
  backWallShape.lineTo(halfW, wallHeight);
  backWallShape.lineTo(0, ridgeHeight);
  backWallShape.lineTo(-halfW, wallHeight);
  backWallShape.closePath();

  const backWallGeo = new THREE.ExtrudeGeometry(backWallShape, { depth: 0.2, bevelEnabled: false });
  const backWall = new THREE.Mesh(backWallGeo, outerWallMat);
  backWall.position.set(0, 0, -halfL);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  houseGroup.add(backWall);

  // Bočné steny (plné po dĺžke domu)
  const sideWallGeo = new THREE.BoxGeometry(0.25, wallHeight, length);
  
  const leftWall = new THREE.Mesh(sideWallGeo, outerWallMat);
  leftWall.position.set(-halfW + 0.125, wallHeight / 2, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  houseGroup.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeo, outerWallMat);
  rightWall.position.set(halfW - 0.125, wallHeight / 2, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  houseGroup.add(rightWall);

  // Falce na antracitových stenách
  if (facade === 'standard') {
    const seamCount = Math.floor(length / 0.5);
    for (let i = 0; i <= seamCount; i++) {
      const z = -halfL + (i * length) / seamCount;
      const seamGeo = new THREE.BoxGeometry(0.03, wallHeight, 0.02);
      const seamL = new THREE.Mesh(seamGeo, frameMat);
      seamL.position.set(-halfW - 0.01, wallHeight / 2, z);
      houseGroup.add(seamL);

      const seamR = new THREE.Mesh(seamGeo, frameMat);
      seamR.position.set(halfW + 0.01, wallHeight / 2, z);
      houseGroup.add(seamR);
    }
  }

  // Interiérové priečky a loft (mezanín)
  const loftLength = 3.2;
  const loftGeo = new THREE.BoxGeometry(width - 0.5, 0.12, loftLength);
  const loft = new THREE.Mesh(loftGeo, woodMat);
  loft.position.set(0, 2.3, -halfL + loftLength / 2 + 0.2);
  loft.castShadow = true;
  loft.receiveShadow = true;
  houseGroup.add(loft);

  // Kúpeľňová priečka pod loftom
  const bathWallGeo = new THREE.BoxGeometry(1.6, 2.3, 0.1);
  const bathWall = new THREE.Mesh(bathWallGeo, interiorWallMat);
  bathWall.position.set(halfW - 1.0, 1.15, -halfL + 2.4);
  houseGroup.add(bathWall);

  rootGroup.add(houseGroup);

  // ── 4. ZAPUSTENÝ DREVENÝ PREDNÝ PORTÁL (PO PODĽA FOTIEK 1 & 2) ───────────────────

  const porchGroup = new THREE.Group();
  porchGroup.name = 'Recessed_Porch';

  const porchCenterZ = glassZ + porchDepth / 2;

  // Vnútorný drevený obklad ľavej steny portálu
  const porchWallGeo = new THREE.BoxGeometry(0.04, wallHeight, porchDepth);
  const porchWallL = new THREE.Mesh(porchWallGeo, porchWoodMat);
  porchWallL.position.set(-halfW + 0.25, wallHeight / 2, porchCenterZ);
  porchWallL.receiveShadow = true;
  porchGroup.add(porchWallL);

  // Vnútorný drevený obklad pravej steny portálu
  const porchWallR = new THREE.Mesh(porchWallGeo, porchWoodMat);
  porchWallR.position.set(halfW - 0.25, wallHeight / 2, porchCenterZ);
  porchWallR.receiveShadow = true;
  porchGroup.add(porchWallR);

  // Šikmý drevený podhľad portálu (ľavá a pravá strana sedlovej strechy)
  const slopeAngle = Math.atan2(gableHeight, halfW);
  const rafterLen = Math.sqrt(halfW * halfW + gableHeight * gableHeight);

  const ceilingGeo = new THREE.BoxGeometry(rafterLen - 0.1, 0.04, porchDepth);
  
  const ceilingL = new THREE.Mesh(ceilingGeo, porchWoodMat);
  ceilingL.position.set(-halfW / 2 + 0.1, wallHeight + gableHeight / 2 - 0.05, porchCenterZ);
  ceilingL.rotation.z = slopeAngle;
  ceilingL.receiveShadow = true;
  porchGroup.add(ceilingL);

  const ceilingR = new THREE.Mesh(ceilingGeo, porchWoodMat);
  ceilingR.position.set(halfW / 2 - 0.1, wallHeight + gableHeight / 2 - 0.05, porchCenterZ);
  ceilingR.rotation.z = -slopeAngle;
  ceilingR.receiveShadow = true;
  porchGroup.add(ceilingR);

  // Čelné skosené štítové lemovanie portálu (hrúbka rámu 0.35m z Photo 1)
  const portalFasciaGeo = new THREE.BoxGeometry(rafterLen + 0.1, 0.32, 0.06);
  
  const fasciaL = new THREE.Mesh(portalFasciaGeo, porchWoodMat);
  fasciaL.position.set(-halfW / 2, wallHeight + gableHeight / 2, halfL + 0.02);
  fasciaL.rotation.z = slopeAngle;
  fasciaL.castShadow = true;
  porchGroup.add(fasciaL);

  const fasciaR = new THREE.Mesh(portalFasciaGeo, porchWoodMat);
  fasciaR.position.set(halfW / 2, wallHeight + gableHeight / 2, halfL + 0.02);
  fasciaR.rotation.z = -slopeAngle;
  fasciaR.castShadow = true;
  porchGroup.add(fasciaR);

  // Vertikálne stĺpové obloženie čela
  const verticalFrontGeo = new THREE.BoxGeometry(0.35, wallHeight, 0.06);
  const vertL = new THREE.Mesh(verticalFrontGeo, porchWoodMat);
  vertL.position.set(-halfW + 0.175, wallHeight / 2, halfL + 0.02);
  vertL.castShadow = true;
  porchGroup.add(vertL);

  const vertR = new THREE.Mesh(verticalFrontGeo, porchWoodMat);
  vertR.position.set(halfW - 0.175, wallHeight / 2, halfL + 0.02);
  vertR.castShadow = true;
  porchGroup.add(vertR);

  rootGroup.add(porchGroup);

  // ── 5. ZAPUSTENÁ PREDNÁ SKLENENÁ STENA (4-DIELNA + ŠTÍT Z PHOTO 2) ───────────────

  const glassFacadeGroup = new THREE.Group();
  glassFacadeGroup.name = 'Recessed_Glass_Facade';
  glassFacadeGroup.position.set(0, 0, glassZ);

  const glassWidth = width - 0.5; // Svetlá šírka medzi stenami = 4.3m
  const glassHalfW = glassWidth / 2;
  const doorHeight = 2.15; // Výška spodných dverí

  // Spodný nosný prah a obvodové rámy
  const subFrameGeo = new THREE.BoxGeometry(glassWidth + 0.04, 0.08, 0.12);
  const bottomThreshold = new THREE.Mesh(subFrameGeo, frameMat);
  bottomThreshold.position.set(0, 0.04, 0);
  glassFacadeGroup.add(bottomThreshold);

  // Masívny horizontálny priečnik (Transom beam vo výške 2.15m)
  const transomGeo = new THREE.BoxGeometry(glassWidth + 0.04, 0.1, 0.14);
  const transom = new THREE.Mesh(transomGeo, frameMat);
  transom.position.set(0, doorHeight, 0);
  transom.castShadow = true;
  glassFacadeGroup.add(transom);

  // 4 Spodné sklenené polia (2 pevné okná + 2 dverné krídla)
  const bayWidth = glassWidth / 4; // ~1.075m
  for (let i = 0; i < 4; i++) {
    const bayX = -glassHalfW + bayWidth * i + bayWidth / 2;
    
    // Rám okolo každého poľa
    const bayFrameGeo = new THREE.BoxGeometry(bayWidth - 0.04, doorHeight - 0.1, 0.08);
    // Sklenená výplň
    const paneGeo = new THREE.BoxGeometry(bayWidth - 0.1, doorHeight - 0.16, 0.02);
    const glassPane = new THREE.Mesh(paneGeo, glassMat);
    glassPane.position.set(bayX, doorHeight / 2, 0);
    glassPane.castShadow = true;
    glassFacadeGroup.add(glassPane);

    // Rámy dverí
    const frameBorder = new THREE.Mesh(bayFrameGeo, frameMat);
    frameBorder.position.set(bayX, doorHeight / 2, 0);
    // Vytvorenie dutého rámu cez tenké profily
    const vertMullionGeo = new THREE.BoxGeometry(0.06, doorHeight, 0.1);
    const vertMullion = new THREE.Mesh(vertMullionGeo, frameMat);
    vertMullion.position.set(-glassHalfW + bayWidth * i, doorHeight / 2, 0);
    vertMullion.castShadow = true;
    glassFacadeGroup.add(vertMullion);

    // Kľučka na dverách (3. pole zľava ako na fotke 2)
    if (i === 2) {
      const handleGeo = new THREE.BoxGeometry(0.03, 0.18, 0.08);
      const handle = new THREE.Mesh(handleGeo, frameMat);
      handle.position.set(bayX + bayWidth / 2 - 0.08, 1.05, 0.05);
      glassFacadeGroup.add(handle);
    }
  }
  // Pravý krajný profil
  const endMullionGeo = new THREE.BoxGeometry(0.06, doorHeight, 0.1);
  const endMullion = new THREE.Mesh(endMullionGeo, frameMat);
  endMullion.position.set(glassHalfW, doorHeight / 2, 0);
  glassFacadeGroup.add(endMullion);

  // Vrchné trojuholníkové štítové presklenie (Centrálny trojuholník + 2 bočné lichobežníky)
  const upperGableH = ridgeHeight - doorHeight - 0.05;
  const gableCenterShape = new THREE.Shape();
  gableCenterShape.moveTo(-glassHalfW * 0.45, 0);
  gableCenterShape.lineTo(glassHalfW * 0.45, 0);
  gableCenterShape.lineTo(0, upperGableH);
  gableCenterShape.closePath();

  const gableCenterGeo = new THREE.ShapeGeometry(gableCenterShape);
  const gableCenterGlass = new THREE.Mesh(gableCenterGeo, glassMat);
  gableCenterGlass.position.set(0, doorHeight + 0.05, 0);
  glassFacadeGroup.add(gableCenterGlass);

  // Bočné lichobežníkové sklá
  const leftTrapezoidShape = new THREE.Shape();
  leftTrapezoidShape.moveTo(-glassHalfW + 0.05, 0);
  leftTrapezoidShape.lineTo(-glassHalfW * 0.48, 0);
  leftTrapezoidShape.lineTo(-glassHalfW * 0.48, upperGableH * 0.52);
  leftTrapezoidShape.lineTo(-glassHalfW + 0.05, (wallHeight - doorHeight));
  leftTrapezoidShape.closePath();

  const leftGableGeo = new THREE.ShapeGeometry(leftTrapezoidShape);
  const leftGableGlass = new THREE.Mesh(leftGableGeo, glassMat);
  leftGableGlass.position.set(0, doorHeight + 0.05, 0);
  glassFacadeGroup.add(leftGableGlass);

  const rightTrapezoidShape = new THREE.Shape();
  rightTrapezoidShape.moveTo(glassHalfW * 0.48, 0);
  rightTrapezoidShape.lineTo(glassHalfW - 0.05, 0);
  rightTrapezoidShape.lineTo(glassHalfW - 0.05, (wallHeight - doorHeight));
  rightTrapezoidShape.lineTo(glassHalfW * 0.48, upperGableH * 0.52);
  rightTrapezoidShape.closePath();

  const rightGableGeo = new THREE.ShapeGeometry(rightTrapezoidShape);
  const rightGableGlass = new THREE.Mesh(rightGableGeo, glassMat);
  rightGableGlass.position.set(0, doorHeight + 0.05, 0);
  glassFacadeGroup.add(rightGableGlass);

  // Zvislé deliace stĺpiky v štíte
  const gableMullionGeo = new THREE.BoxGeometry(0.06, upperGableH * 0.6, 0.1);
  const gMullionL = new THREE.Mesh(gableMullionGeo, frameMat);
  gMullionL.position.set(-glassHalfW * 0.46, doorHeight + upperGableH * 0.3, 0);
  glassFacadeGroup.add(gMullionL);

  const gMullionR = new THREE.Mesh(gableMullionGeo, frameMat);
  gMullionR.position.set(glassHalfW * 0.46, doorHeight + upperGableH * 0.3, 0);
  glassFacadeGroup.add(gMullionR);

  rootGroup.add(glassFacadeGroup);

  // ── 6. SEDLOVÁ STRECHA S FALCAMI A KOMÍNOM ────────────────────────────────────

  const roofGroup = new THREE.Group();
  roofGroup.name = 'RoofStructure';

  const roofLength = length + 0.08;
  const roofSlopeWidth = rafterLen + 0.12;

  // Ľavé strešné krídlo
  const roofLeftGeo = new THREE.BoxGeometry(roofSlopeWidth, 0.15, roofLength);
  const roofLeft = new THREE.Mesh(roofLeftGeo, roofMat);
  roofLeft.position.set(-halfW / 2, wallHeight + gableHeight / 2 + 0.05, 0);
  roofLeft.rotation.z = slopeAngle;
  roofLeft.castShadow = true;
  roofLeft.receiveShadow = true;
  roofGroup.add(roofLeft);

  // Pravé strešné krídlo
  const roofRightGeo = new THREE.BoxGeometry(roofSlopeWidth, 0.15, roofLength);
  const roofRight = new THREE.Mesh(roofRightGeo, roofMat);
  roofRight.position.set(halfW / 2, wallHeight + gableHeight / 2 + 0.05, 0);
  roofRight.rotation.z = -slopeAngle;
  roofRight.castShadow = true;
  roofRight.receiveShadow = true;
  roofGroup.add(roofRight);

  // Hrebenáč (Ridge cap)
  const ridgeCapGeo = new THREE.BoxGeometry(0.24, 0.08, roofLength);
  const ridgeCap = new THREE.Mesh(ridgeCapGeo, frameMat);
  ridgeCap.position.set(0, ridgeHeight + 0.08, 0);
  ridgeCap.castShadow = true;
  roofGroup.add(ridgeCap);

  // Falce na streche
  const roofSeamCount = Math.floor(roofLength / 0.5);
  for (let i = 0; i <= roofSeamCount; i++) {
    const z = -halfL + (i * roofLength) / roofSeamCount;
    
    const seamL = new THREE.Mesh(new THREE.BoxGeometry(roofSlopeWidth, 0.03, 0.02), frameMat);
    seamL.position.set(-halfW / 2, wallHeight + gableHeight / 2 + 0.13, z);
    seamL.rotation.z = slopeAngle;
    roofGroup.add(seamL);

    const seamR = new THREE.Mesh(new THREE.BoxGeometry(roofSlopeWidth, 0.03, 0.02), frameMat);
    seamR.position.set(halfW / 2, wallHeight + gableHeight / 2 + 0.13, z);
    seamR.rotation.z = -slopeAngle;
    roofGroup.add(seamR);
  }

  // Čierny nerezový komín (viditeľný na fotke 1 na pravej strane strechy)
  const chimneyGroup = new THREE.Group();
  chimneyGroup.name = 'Chimney';
  chimneyGroup.position.set(1.5, 3.8, halfL - 2.8);

  const flueGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 16);
  const flue = new THREE.Mesh(flueGeo, frameMat);
  flue.castShadow = true;
  chimneyGroup.add(flue);

  // Strieška komína (Cap)
  const capGeo = new THREE.ConeGeometry(0.22, 0.12, 16);
  const cap = new THREE.Mesh(capGeo, frameMat);
  cap.position.set(0, 0.75, 0);
  chimneyGroup.add(cap);

  roofGroup.add(chimneyGroup);

  // Exploded View / Odklopenie strechy
  if (roofCutaway > 0) {
    roofGroup.position.y += roofCutaway * 3.5;
    roofGroup.position.z -= roofCutaway * 1.5;
  }

  rootGroup.add(roofGroup);

  // ── 7. OSVETLENIE A AMBIENT (Nočný a západový režim) ──────────────────────────

  if (isNight || isSunset) {
    // Teplé svetlo z vnútra portálu osvetľujúce terasu
    const porchLight = new THREE.PointLight(0xffaa44, isNight ? 2.5 : 1.2, 8, 1.5);
    porchLight.position.set(0, 2.5, glassZ + 0.6);
    rootGroup.add(porchLight);

    // Teplé interiérové svetlo
    const interiorLight = new THREE.PointLight(0xffd588, isNight ? 3.0 : 1.5, 12, 1.8);
    interiorLight.position.set(0, 2.2, 0);
    rootGroup.add(interiorLight);
  }

  return rootGroup;
}
