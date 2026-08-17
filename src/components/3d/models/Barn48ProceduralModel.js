import * as THREE from 'three';

/**
 * Plne fotorealistický 3D Model pre Barn House 48 (PH-008)
 * Presne namodelovaný podľa architektonického výkresu a reálnych fotografií:
 * - Rozmery: Šírka 4.6 m, Celková dĺžka 8.0 m (obytná časť 6.7 m + krytá terasa 1.3 m)
 * - Výšky: Výška po odkvap 2.1 m, Výška po hrebeň 4.0 m (štít 1.9 m)
 * - Farba plechu: Svetlosivá architektonická bridlica / zinok (výrazne zosvetlená)
 * - Strecha: Výrazné stojaté falce (drážky) bežiace po celej streche aj stenách
 * - Klieštiny: 4 drevené väzníky v obývačke s presným výpočtom šírky (nevytrčajú zo strechy!)
 * - Spálňa a Kúpeľňa: Presne podľa reálnych fotografií interiéru
 */

export function createBarn48Model({
  facade = 'standard', // 'standard' (svetlosivý plech+drevo), 'wood' (celodrevo), 'stucco' (biela omietka)
  extension = 0,       // 0, 1.3, 2.6, 3.9 m
  roofCutaway = 0,     // 0.0 (zatvorená) až 1.0 (odklopená strecha)
  timeOfDay = 'day',   // 'day', 'sunset', 'night'
  interiorType = 'wood' // 'wood', 'drywall'
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
  const halfL = totalLength / 2; // 4.0 m
  const glassZ = halfL - porchDepth; // 2.7 m (Pozícia prednej sklenenej steny)

  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';

  // ── 1. PROCEDURÁLNE TEXTÚRY A PBR MATERIÁLY ────────────────────────────────────

  // Textúra škandinávskeho dreveného obkladu
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

      // Hrkčky (Knots)
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
  const tileTexture = createTileTexture();

  // PBR Materiály
  const woodMat = new THREE.MeshStandardMaterial({
    map: pineTexture,
    color: 0xdeb887,
    roughness: 0.6,
    metalness: 0.02,
    name: 'PinePanels'
  });

  const darkTileMat = new THREE.MeshStandardMaterial({
    map: tileTexture,
    color: 0x24272c,
    roughness: 0.45,
    metalness: 0.1,
    name: 'FloorTiles'
  });

  // Výrazne svetlejší sivý plech (RAL 7035 / RAL 7038 Svetlá platina / Zinok)
  const lightGreyMetalMat = new THREE.MeshStandardMaterial({
    color: 0x828b96, // Jasná, moderná svetlosivá architektonická farba
    roughness: 0.4,
    metalness: 0.55,
    name: 'LightGreyMetal'
  });

  // Kontrastné profily a rámy (Tmavosivá)
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x3d434a,
    roughness: 0.35,
    metalness: 0.75,
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
    color: 0x9aa2ac, // Sivá látková rohová sedačka
    roughness: 0.9,
    metalness: 0.02
  });

  const kitchenCabinetMat = new THREE.MeshStandardMaterial({
    color: 0x607d79, // Šalviovo-zelená / Sivá moderná kuchyňa z fotky
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

  const whiteDrywallMat = new THREE.MeshStandardMaterial({
    color: 0xf5f3ee,
    roughness: 0.92
  });

  const bathroomTileMat = new THREE.MeshStandardMaterial({
    color: 0x8c929a, // Veľkoformátový sivý obklad z fotky kúpeľne
    roughness: 0.4
  });

  const bedFabricMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95
  });

  const headboardMat = new THREE.MeshStandardMaterial({
    color: 0xd3c5b4, // Béžové čalúnené čelo postele z fotky spálne
    roughness: 0.85
  });

  const outerWallMat = facade === 'wood' ? woodMat : (facade === 'stucco' ? whiteDrywallMat : lightGreyMetalMat);
  const roofMat = lightGreyMetalMat;

  // ── 2. ZÁKLADY & TERASA ────────────────────────────────────────────────────────

  const siteGroup = new THREE.Group();
  siteGroup.name = 'Foundation_Site';

  // Štrkový terén
  const groundGeo = new THREE.CylinderGeometry(15, 15, 0.3, 32);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x544e44, roughness: 0.95 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.set(0, -0.95, 0);
  ground.receiveShadow = true;
  siteGroup.add(ground);

  // Základové drevené stĺpiky
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

  // Predná terasa (krytá 1.3 m + vonkajšia 2.0 m)
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

  // ── 3. HLAVNÝ KORPUS (STENY A PODLAHA) ──────────────────────────────────────────

  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'HouseBody';

  const interiorCenterZ = (glassZ + (-halfL)) / 2;

  // Spodná dlažba v obývačke a kuchyni
  const floorGeo = new THREE.BoxGeometry(width - 0.4, 0.08, houseBodyLength - 0.1);
  const floor = new THREE.Mesh(floorGeo, darkTileMat);
  floor.position.set(0, 0.04, interiorCenterZ);
  floor.receiveShadow = true;
  bodyGroup.add(floor);

  // Zadná stena
  const backShape = new THREE.Shape();
  backShape.moveTo(-halfW, 0);
  backShape.lineTo(halfW, 0);
  backShape.lineTo(halfW, wallHeight);
  backShape.lineTo(0, ridgeHeight);
  backShape.lineTo(-halfW, wallHeight);
  backShape.closePath();

  const backGeo = new THREE.ExtrudeGeometry(backShape, { depth: 0.2, bevelEnabled: false });
  const backWall = new THREE.Mesh(backGeo, outerWallMat);
  backWall.position.set(0, 0, -halfL);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  bodyGroup.add(backWall);

  // Bočné steny
  const sideGeo = new THREE.BoxGeometry(0.2, wallHeight, totalLength);
  const leftWall = new THREE.Mesh(sideGeo, outerWallMat);
  leftWall.position.set(-halfW + 0.1, wallHeight / 2, 0);
  leftWall.castShadow = true;
  bodyGroup.add(leftWall);

  const rightWall = new THREE.Mesh(sideGeo, outerWallMat);
  rightWall.position.set(halfW - 0.1, wallHeight / 2, 0);
  rightWall.castShadow = true;
  bodyGroup.add(rightWall);

  // Zvislé falce na bočných stenách (stojaté drážky)
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

  // ── 4. KOMPLETNÝ DETAILNÝ INTERIÉR (OBÝVAČKA, KUCHYŇA, SPÁLŇA, KÚPEĽŇA, LOFT) ──

  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'Detailed_Interior';

  // 1. PRIZNANÉ STROPNÉ KLIEŠTINY / VÄZNÍKY V OBÝVAČKE (Presne podľa fotiek 2 a 3)
  // Klieštiny sú situované v prednej časti domu (obývačka) smerom k preskleniu a ich dĺžka je presne vypočítaná,
  // aby 100% lícovali s vnútorným sklonom strechy a NIKDY nevytrčali von!
  const beamSpecs = [
    { z: 0.3, y: 2.65 },
    { z: 1.0, y: 2.80 },
    { z: 1.7, y: 2.95 },
    { z: 2.3, y: 3.10 }
  ];

  beamSpecs.forEach(spec => {
    // Vnútorná šírka strechy v danej výške:
    const safeRoofWidth = 2 * (ridgeHeight - spec.y) * (halfW / gableHeight) - 0.28;
    if (safeRoofWidth > 0.4) {
      const beamGeo = new THREE.BoxGeometry(safeRoofWidth, 0.12, 0.12);
      const beam = new THREE.Mesh(beamGeo, woodMat);
      beam.position.set(0, spec.y, spec.z);
      beam.castShadow = true;
      interiorGroup.add(beam);
    }
  });

  // 2. ROHOVÁ SEDAČKA V OBÝVAČKE (L-Sofa na pravej / ľavej strane podľa reálnej dispozície)
  const sofaGroup = new THREE.Group();
  sofaGroup.position.set(-halfW + 1.1, 0.08, 0.8);

  const sofaMain = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.42, 0.9), sofaFabricMat);
  sofaMain.position.set(0, 0.21, 0);
  sofaMain.castShadow = true;
  sofaGroup.add(sofaMain);

  const sofaChaise = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 1.2), sofaFabricMat);
  sofaChaise.position.set(-0.45, 0.21, 0.95);
  sofaChaise.castShadow = true;
  sofaGroup.add(sofaChaise);

  const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.2), sofaFabricMat);
  sofaBack.position.set(0, 0.55, -0.35);
  sofaBack.castShadow = true;
  sofaGroup.add(sofaBack);

  interiorGroup.add(sofaGroup);

  // Konferenčný stolík pred sedačkou (z fotiek)
  const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.38, 0.55), woodMat);
  coffeeTable.position.set(-halfW + 1.25, 0.25, 1.2);
  coffeeTable.castShadow = true;
  interiorGroup.add(coffeeTable);

  // Nástenná klimatizácia na bočnej stene (Čierna - viď fotka 2 & 3)
  const acUnit = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.75), kitchenBlackMat);
  acUnit.position.set(-halfW + 0.28, wallHeight - 0.3, 1.4);
  interiorGroup.add(acUnit);

  // 3. KUCHYNSKÁ LINKA (Pravá strana - šalviovo-zelená s drevenou doskou a spotrebičmi)
  const kitchenGroup = new THREE.Group();
  kitchenGroup.position.set(halfW - 0.45, 0.08, 0.6);

  // Spodné skrinky
  const kCabinets = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 2.6), kitchenCabinetMat);
  kCabinets.position.set(0, 0.425, 0);
  kCabinets.castShadow = true;
  kitchenGroup.add(kCabinets);

  // Drevená pracovná doska
  const kTop = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.05, 2.62), kitchenTopMat);
  kTop.position.set(0, 0.875, 0);
  kTop.castShadow = true;
  kitchenGroup.add(kTop);

  // Čierna indukčná varná doska
  const hob = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.02, 0.55), kitchenBlackMat);
  hob.position.set(0, 0.905, -0.3);
  kitchenGroup.add(hob);

  // Čierny šikmý digestor nad varnou doskou (z fotiek 2 a 3)
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 0.55), kitchenBlackMat);
  hood.position.set(-0.1, 1.65, -0.3);
  hood.rotation.z = -0.3;
  kitchenGroup.add(hood);

  // Čierny drez s batériou
  const sink = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.5), kitchenBlackMat);
  sink.position.set(0, 0.905, 0.4);
  kitchenGroup.add(sink);

  // Vysoká skriňa s rúrou a mikrovlnkou
  const tallUnit = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.9, 0.65), kitchenCabinetMat);
  tallUnit.position.set(0, 0.95, 1.4);
  tallUnit.castShadow = true;
  kitchenGroup.add(tallUnit);

  const oven = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.55, 0.58), kitchenBlackMat);
  oven.position.set(-0.02, 1.15, 1.4);
  kitchenGroup.add(oven);

  // Horná skrinka
  const upperCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.9), kitchenCabinetMat);
  upperCabinet.position.set(-0.12, 1.75, 0.45);
  kitchenGroup.add(upperCabinet);

  // Nástenná TV
  const tv = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 1.25), kitchenBlackMat);
  tv.position.set(-0.25, 1.4, -0.7);
  kitchenGroup.add(tv);

  interiorGroup.add(kitchenGroup);

  // 4. PRIEČKA A DREVENÝ REBRÍK DO MEZONETU (Z fotiek 2 & 3)
  const partitionZ = -1.2;

  const partLeft = new THREE.Mesh(new THREE.BoxGeometry(halfW - 0.2, wallHeight, 0.1), woodMat);
  partLeft.position.set(-halfW / 2 + 0.1, wallHeight / 2, partitionZ);
  partLeft.castShadow = true;
  interiorGroup.add(partLeft);

  const partRight = new THREE.Mesh(new THREE.BoxGeometry(1.2, wallHeight, 0.1), woodMat);
  partRight.position.set(halfW - 0.7, wallHeight / 2, partitionZ);
  partRight.castShadow = true;
  interiorGroup.add(partRight);

  // Drevený rebrík na mezonet
  const ladderGroup = new THREE.Group();
  ladderGroup.position.set(0.1, 0, partitionZ + 0.5);
  ladderGroup.rotation.x = 0.18;

  const stringerGeo = new THREE.BoxGeometry(0.05, 2.4, 0.08);
  const strL = new THREE.Mesh(stringerGeo, woodMat);
  strL.position.set(-0.22, 1.1, 0);
  ladderGroup.add(strL);

  const strR = new THREE.Mesh(stringerGeo, woodMat);
  strR.position.set(0.22, 1.1, 0);
  ladderGroup.add(strR);

  for (let r = 0; r < 7; r++) {
    const rung = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.06), woodMat);
    rung.position.set(0, 0.3 + r * 0.28, 0);
    ladderGroup.add(rung);
  }
  interiorGroup.add(ladderGroup);

  // 5. HORNÝ MEZONET NA SPANIE (LOFT MEZZANINE S 2 POSTEĽAMI - Z FOTKY 2)
  const loftGroup = new THREE.Group();
  const loftLength = 3.2;
  const loftZ = -halfL + loftLength / 2;

  const loftFloor = new THREE.Mesh(new THREE.BoxGeometry(width - 0.4, 0.1, loftLength), woodMat);
  loftFloor.position.set(0, wallHeight, loftZ);
  loftFloor.castShadow = true;
  loftFloor.receiveShadow = true;
  loftGroup.add(loftFloor);

  const loftBedGeo = new THREE.BoxGeometry(1.0, 0.35, 1.9);
  const loftMattressGeo = new THREE.BoxGeometry(0.92, 0.18, 1.82);

  // Ľavá posteľ v mezonete
  const bed1Frame = new THREE.Mesh(loftBedGeo, woodMat);
  bed1Frame.position.set(-1.25, wallHeight + 0.22, loftZ - 0.3);
  bed1Frame.castShadow = true;
  loftGroup.add(bed1Frame);

  const bed1Mat = new THREE.Mesh(loftMattressGeo, bedFabricMat);
  bed1Mat.position.set(-1.25, wallHeight + 0.35, loftZ - 0.3);
  loftGroup.add(bed1Mat);

  // Pravá posteľ v mezonete
  const bed2Frame = new THREE.Mesh(loftBedGeo, woodMat);
  bed2Frame.position.set(1.25, wallHeight + 0.22, loftZ - 0.3);
  bed2Frame.castShadow = true;
  loftGroup.add(bed2Frame);

  const bed2Mat = new THREE.Mesh(loftMattressGeo, bedFabricMat);
  bed2Mat.position.set(1.25, wallHeight + 0.35, loftZ - 0.3);
  loftGroup.add(bed2Mat);

  // Malé zadné vetracie okno v mezonete
  const loftWin = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.58, 0.05), glassMat);
  loftWin.position.set(0, wallHeight + 0.9, -halfL + 0.08);
  loftGroup.add(loftWin);

  const loftWinFrame = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.66, 0.04), frameMat);
  loftWinFrame.position.set(0, wallHeight + 0.9, -halfL + 0.07);
  loftGroup.add(loftWinFrame);

  interiorGroup.add(loftGroup);

  // 6. SPÁLŇA NA PRÍZEMÍ (Z FOTKY 4)
  const bedRoomGroup = new THREE.Group();
  bedRoomGroup.position.set(-1.15, 0.08, -halfL + 1.4);

  // Manželská posteľ s béžovým čalúneným čelom (fotka 4)
  const dBedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 2.0), woodMat);
  dBedFrame.position.set(0, 0.18, 0);
  dBedFrame.castShadow = true;
  bedRoomGroup.add(dBedFrame);

  const dBedHeadboard = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.75, 0.08), headboardMat);
  dBedHeadboard.position.set(0, 0.55, -0.96);
  dBedHeadboard.castShadow = true;
  bedRoomGroup.add(dBedHeadboard);

  const dBedMat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 1.9), bedFabricMat);
  dBedMat.position.set(0, 0.35, 0);
  bedRoomGroup.add(dBedMat);

  // Nočný stolík (z fotky 4)
  const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), woodMat);
  nightstand.position.set(-0.95, 0.22, -0.65);
  nightstand.castShadow = true;
  bedRoomGroup.add(nightstand);

  // Čierne bodové nástenné svetlá nad posteľou (fotka 4)
  const sconce1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.08), kitchenBlackMat);
  sconce1.position.set(-0.4, 1.1, -0.95);
  bedRoomGroup.add(sconce1);

  const sconce2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.08), kitchenBlackMat);
  sconce2.position.set(0.4, 1.1, -0.95);
  bedRoomGroup.add(sconce2);

  // Veľké okno na pravej stene spálne (fotka 4)
  const bedroomWin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.95, 1.3), glassMat);
  bedroomWin.position.set(-halfW + 1.15 + 0.1, 1.2, 0.1);
  bedRoomGroup.add(bedroomWin);

  const bedroomWinFrame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.05, 1.4), frameMat);
  bedroomWinFrame.position.set(-halfW + 1.15 + 0.08, 1.2, 0.1);
  bedRoomGroup.add(bedroomWinFrame);

  interiorGroup.add(bedRoomGroup);

  // 7. KÚPEĽŇA S WC A SPRCHOVÝM KÚTOM (Z FOTKY 5)
  const bathGroup = new THREE.Group();
  bathGroup.position.set(1.15, 0.08, -halfL + 1.4);

  // Deliaca stena s veľkoformátovým sivým obkladom
  const bathWall = new THREE.Mesh(new THREE.BoxGeometry(0.1, wallHeight, 2.6), bathroomTileMat);
  bathWall.position.set(-1.1, wallHeight / 2, 0);
  bathGroup.add(bathWall);

  // Walk-in sprchovací kút (číra sklenená zástena)
  const showerGlass = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.9, 0.95), glassMat);
  showerGlass.position.set(-0.1, 0.95, -0.6);
  bathGroup.add(showerGlass);

  // Čierna sprchová batéria a hlavica
  const showerCol = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.4, 0.05), kitchenBlackMat);
  showerCol.position.set(0.2, 1.2, -1.15);
  bathGroup.add(showerCol);

  // Závesné WC s Geberit tlačidlom
  const toilet = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.55), whiteDrywallMat);
  toilet.position.set(0.6, 0.25, -0.7);
  toilet.castShadow = true;
  bathGroup.add(toilet);

  // Bojler (vertikálny biely zásobník teplej vody nad WC z fotky 5)
  const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.75, 24), whiteDrywallMat);
  boiler.position.set(0.6, 1.55, -0.7);
  boiler.castShadow = true;
  bathGroup.add(boiler);

  // Umývadlová skrinka so zrkadlom (z fotky 5)
  const vanity = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.45), woodMat);
  vanity.position.set(0.6, 0.4, 0.6);
  vanity.castShadow = true;
  bathGroup.add(vanity);

  const basin = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.42), whiteDrywallMat);
  basin.position.set(0.6, 0.8, 0.6);
  bathGroup.add(basin);

  // Kúpeľňové okno
  const bathWin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.04), glassMat);
  bathWin.position.set(0.6, 1.3, -1.35);
  bathGroup.add(bathWin);

  interiorGroup.add(bathGroup);

  rootGroup.add(interiorGroup);

  // ── 5. ZAPUSTENÝ DREVENÝ PORTÁL (KRYTÁ TERASA 1.3M) ───────────────────────────

  const porchGroup = new THREE.Group();
  porchGroup.name = 'Recessed_Porch_1.3m';

  const porchCenterZ = glassZ + porchDepth / 2;
  const slopeAngle = Math.atan2(gableHeight, halfW);
  const rafterLen = Math.sqrt(halfW * halfW + gableHeight * gableHeight);

  // Ľavý a pravý obklad portálu
  const pWallGeo = new THREE.BoxGeometry(0.04, wallHeight, porchDepth);
  const pWallL = new THREE.Mesh(pWallGeo, woodMat);
  pWallL.position.set(-halfW + 0.22, wallHeight / 2, porchCenterZ);
  porchGroup.add(pWallL);

  const pWallR = new THREE.Mesh(pWallGeo, woodMat);
  pWallR.position.set(halfW - 0.22, wallHeight / 2, porchCenterZ);
  porchGroup.add(pWallR);

  // Drevený podhľad
  const ceilGeo = new THREE.BoxGeometry(rafterLen - 0.12, 0.04, porchDepth);
  const ceilL = new THREE.Mesh(ceilGeo, woodMat);
  ceilL.position.set(-halfW / 2 + 0.08, wallHeight + gableHeight / 2 - 0.04, porchCenterZ);
  ceilL.rotation.z = slopeAngle;
  porchGroup.add(ceilL);

  const ceilR = new THREE.Mesh(ceilGeo, woodMat);
  ceilR.position.set(halfW / 2 - 0.08, wallHeight + gableHeight / 2 - 0.04, porchCenterZ);
  ceilR.rotation.z = -slopeAngle;
  porchGroup.add(ceilR);

  // Čelné skosené lemovanie štítu
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

  // Čelné zvislé stĺpy
  const frontPostGeo = new THREE.BoxGeometry(0.32, wallHeight, 0.05);
  const frontPostL = new THREE.Mesh(frontPostGeo, woodMat);
  frontPostL.position.set(-halfW + 0.16, wallHeight / 2, halfL + 0.02);
  porchGroup.add(frontPostL);

  const frontPostR = new THREE.Mesh(frontPostGeo, woodMat);
  frontPostR.position.set(halfW - 0.16, wallHeight / 2, halfL + 0.02);
  porchGroup.add(frontPostR);

  rootGroup.add(porchGroup);

  // ── 6. PREDNÁ SKLENENÁ STENA (4 POLIA + TROJUHOLNÍK) ──────────────────────────

  const glassFacadeGroup = new THREE.Group();
  glassFacadeGroup.name = 'Glass_Facade';
  glassFacadeGroup.position.set(0, 0, glassZ);

  const glassW = width - 0.44;
  const glassHalf = glassW / 2;
  const doorH = wallHeight - 0.05; // 2.05 m

  // Masívny priečnik nad dverami
  const transom = new THREE.Mesh(new THREE.BoxGeometry(glassW + 0.04, 0.09, 0.12), frameMat);
  transom.position.set(0, doorH, 0);
  transom.castShadow = true;
  glassFacadeGroup.add(transom);

  // 4 Spodné sklenené polia s dverami
  const bayW = glassW / 4;
  for (let i = 0; i < 4; i++) {
    const bx = -glassHalf + bayW * i + bayW / 2;

    const pane = new THREE.Mesh(new THREE.BoxGeometry(bayW - 0.08, doorH - 0.12, 0.02), glassMat);
    pane.position.set(bx, doorH / 2, 0);
    pane.castShadow = true;
    glassFacadeGroup.add(pane);

    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, doorH, 0.08), frameMat);
    mullion.position.set(-glassHalf + bayW * i, doorH / 2, 0);
    glassFacadeGroup.add(mullion);

    // Kľučka na dverách
    if (i === 2) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.07), frameMat);
      handle.position.set(bx + bayW / 2 - 0.08, 1.0, 0.04);
      glassFacadeGroup.add(handle);
    }
  }
  const lastMullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, doorH, 0.08), frameMat);
  lastMullion.position.set(glassHalf, doorH / 2, 0);
  glassFacadeGroup.add(lastMullion);

  // Vrchné štítové presklenie
  const topGableH = ridgeHeight - doorH - 0.05;
  const centerTriShape = new THREE.Shape();
  centerTriShape.moveTo(-glassHalf * 0.44, 0);
  centerTriShape.lineTo(glassHalf * 0.44, 0);
  centerTriShape.lineTo(0, topGableH);
  centerTriShape.closePath();

  const centerTri = new THREE.Mesh(new THREE.ShapeGeometry(centerTriShape), glassMat);
  centerTri.position.set(0, doorH + 0.05, 0);
  glassFacadeGroup.add(centerTri);

  // Bočné lichobežníky
  const leftTrapShape = new THREE.Shape();
  leftTrapShape.moveTo(-glassHalf + 0.04, 0);
  leftTrapShape.lineTo(-glassHalf * 0.48, 0);
  leftTrapShape.lineTo(-glassHalf * 0.48, topGableH * 0.5);
  leftTrapShape.lineTo(-glassHalf + 0.04, 0.05);
  leftTrapShape.closePath();

  const leftTrap = new THREE.Mesh(new THREE.ShapeGeometry(leftTrapShape), glassMat);
  leftTrap.position.set(0, doorH + 0.05, 0);
  glassFacadeGroup.add(leftTrap);

  const rightTrapShape = new THREE.Shape();
  rightTrapShape.moveTo(glassHalf * 0.48, 0);
  rightTrapShape.lineTo(glassHalf - 0.04, 0);
  rightTrapShape.lineTo(glassHalf - 0.04, 0.05);
  rightTrapShape.lineTo(glassHalf * 0.48, topGableH * 0.5);
  rightTrapShape.closePath();

  const rightTrap = new THREE.Mesh(new THREE.ShapeGeometry(rightTrapShape), glassMat);
  rightTrap.position.set(0, doorH + 0.05, 0);
  glassFacadeGroup.add(rightTrap);

  rootGroup.add(glassFacadeGroup);

  // ── 7. SEDLOVÁ STRECHA S VÝRAZNÝMI STOJATÝMI FALCAMI (PÁSY NA PLECHU) ─────────

  const roofGroup = new THREE.Group();
  roofGroup.name = 'Roof_Structure';

  const roofLen = totalLength + 0.06;
  const slopeW = rafterLen + 0.12;

  // Ľavá a pravá rovina strechy
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(slopeW, 0.14, roofLen), roofMat);
  roofL.position.set(-halfW / 2, wallHeight + gableHeight / 2 + 0.05, 0);
  roofL.rotation.z = slopeAngle;
  roofL.castShadow = true;
  roofL.receiveShadow = true;
  roofGroup.add(roofL);

  const roofR = new THREE.Mesh(new THREE.BoxGeometry(slopeW, 0.14, roofLen), roofMat);
  roofR.position.set(halfW / 2, wallHeight + gableHeight / 2 + 0.05, 0);
  roofR.rotation.z = -slopeAngle;
  roofR.castShadow = true;
  roofR.receiveShadow = true;
  roofGroup.add(roofR);

  // Hrebenáč (Ridge cap)
  const ridgeCap = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, roofLen), frameMat);
  ridgeCap.position.set(0, ridgeHeight + 0.08, 0);
  ridgeCap.castShadow = true;
  roofGroup.add(ridgeCap);

  // VÝRAZNÉ STOJANÉ FALCE NA STRECHE (Bežia v rovnakom rastri 0.45m ako na stenách)
  const roofSeamCount = Math.floor(roofLen / 0.45);
  const seamRafterLen = slopeW + 0.04;
  const seamHeight = 0.045; // 4.5 cm vystúpenie drážky
  const seamThickness = 0.035; // 3.5 cm hrúbka stojatého falcu

  // Normálový vektor na sklon strechy pre presný výsun nad plech
  const normOffsetX = Math.sin(slopeAngle) * 0.08;
  const normOffsetY = Math.cos(slopeAngle) * 0.08;

  for (let i = 0; i <= roofSeamCount; i++) {
    const z = -halfL + (i * roofLen) / roofSeamCount;

    // Ľavý strešný falc
    const seamL = new THREE.Mesh(new THREE.BoxGeometry(seamRafterLen, seamHeight, seamThickness), frameMat);
    seamL.position.set(-halfW / 2 - normOffsetX, wallHeight + gableHeight / 2 + 0.05 + normOffsetY, z);
    seamL.rotation.z = slopeAngle;
    seamL.castShadow = true;
    roofGroup.add(seamL);

    // Pravý strešný falc
    const seamR = new THREE.Mesh(new THREE.BoxGeometry(seamRafterLen, seamHeight, seamThickness), frameMat);
    seamR.position.set(halfW / 2 + normOffsetX, wallHeight + gableHeight / 2 + 0.05 + normOffsetY, z);
    seamR.rotation.z = -slopeAngle;
    seamR.castShadow = true;
    roofGroup.add(seamR);
  }

  // Komín na pravej strane (z fotky 1)
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

  // ── 8. SVETLÁ A AMBIENT ────────────────────────────────────────────────────────

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
