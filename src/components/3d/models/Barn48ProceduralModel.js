import * as THREE from 'three';

/**
 * Procedurálny 3D Model pre Barn House 48 (PH-008)
 * Precízne geometrické proporcie škandinávskeho Barnhouse štýlu:
 * - Základná šírka: 4.8 m
 * - Výška po odkvap: 2.8 m, Výška po hrebeň: 4.6 m
 * - Základná dĺžka: 9.6 m (s dynamickým predĺžením +1.2m až +4.8m)
 * - Sedlová strecha bez presahov s falcovaným plechom a integrovanými oknami
 * - Celopresklený predný štít s posuvnými dverami na drevenú terasu
 * - Prémiové PBR materiály pre fasádu (Antracit + Drevo / Celodrevo / Biela omietka)
 */

export function createBarn48Model({
  facade = 'standard', // 'standard' (antracit+drevo), 'wood' (celodrevo), 'stucco' (biela omietka)
  extension = 0,       // 0, 1.2, 2.4, 3.6, 4.8 metrov
  roofCutaway = 0,     // 0.0 (zavretá) až 1.0 (úplne odklopená strecha - exploded view)
  timeOfDay = 'day',   // 'day', 'sunset', 'night'
  interiorType = 'wood' // 'wood', 'drywall'
}) {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'Barn48_House';

  const width = 4.8;
  const wallHeight = 2.8;
  const ridgeHeight = 4.6;
  const length = 9.6 + extension;
  const gableHeight = ridgeHeight - wallHeight; // 1.8m
  const halfW = width / 2;
  const halfL = length / 2;

  // ── PBR MATERIÁLY ─────────────────────────────────────────────────────────────
  
  // 1. Antracitový falcovaný plech
  const anthraciteMat = new THREE.MeshStandardMaterial({
    color: 0x22252a,
    roughness: 0.42,
    metalness: 0.45,
    name: 'AnthraciteSeam'
  });

  // 2. Svetlý škandinávsky smrek (Drevo)
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0xd8a164,
    roughness: 0.68,
    metalness: 0.05,
    name: 'NordicWood'
  });

  // 3. Tmavý dub / akcenty
  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x664428,
    roughness: 0.72,
    metalness: 0.02,
    name: 'DarkWood'
  });

  // 4. Biela šúchaná omietka
  const stuccoMat = new THREE.MeshStandardMaterial({
    color: 0xf5f3ee,
    roughness: 0.92,
    metalness: 0.02,
    name: 'WhiteStucco'
  });

  // 5. Prémiové sklo
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: timeOfDay === 'night' ? 0xffeeaa : 0x88bbdd,
    transmission: 0.88,
    opacity: 0.4,
    transparent: true,
    roughness: 0.08,
    metalness: 0.15,
    ior: 1.52,
    name: 'ArchitecturalGlass'
  });

  // 6. Hliníkové antracitové rámy okien
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x181a1d,
    roughness: 0.35,
    metalness: 0.8,
    name: 'AluFrame'
  });

  // 7. Terasové dosky
  const terraceMat = new THREE.MeshStandardMaterial({
    color: 0x9b6b3e,
    roughness: 0.75,
    metalness: 0.05,
    name: 'TerraceWood'
  });

  // 8. Interiérové steny
  const interiorWallMat = new THREE.MeshStandardMaterial({
    color: interiorType === 'wood' ? 0xdec196 : 0xf2ede4,
    roughness: 0.85,
    metalness: 0.02
  });

  // 9. Interiérová podlaha
  const interiorFloorMat = new THREE.MeshStandardMaterial({
    color: 0xb58451,
    roughness: 0.6,
    metalness: 0.05
  });

  // 10. Nočné svietidlá (Emissive)
  const isNight = timeOfDay === 'night';
  const lightEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: isNight ? 0xffbb55 : 0x222222,
    emissiveIntensity: isNight ? 1.8 : 0.1,
    roughness: 0.2
  });

  // Priradenie primárneho materiálu fasády
  let sideWallMat = anthraciteMat;
  let gableWallMat = woodMat;
  let roofMat = anthraciteMat;

  if (facade === 'wood') {
    sideWallMat = woodMat;
    gableWallMat = woodMat;
    roofMat = anthraciteMat;
  } else if (facade === 'stucco') {
    sideWallMat = stuccoMat;
    gableWallMat = stuccoMat;
    roofMat = anthraciteMat;
  }

  // ── 1. ZÁKLADOVÝ SOKEL A TERASA ───────────────────────────────────────────────
  
  const plinthGroup = new THREE.Group();
  plinthGroup.name = 'PlinthAndTerrace';

  // Betónový základ pod domom
  const plinthGeo = new THREE.BoxGeometry(width + 0.1, 0.25, length + 0.1);
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x33373d, roughness: 0.9 });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.set(0, -0.125, 0);
  plinth.receiveShadow = true;
  plinthGroup.add(plinth);

  // Predná drevená terasa
  const terraceDepth = 3.2;
  const terraceWidth = width + 1.2;
  const terraceGeo = new THREE.BoxGeometry(terraceWidth, 0.2, terraceDepth);
  const terrace = new THREE.Mesh(terraceGeo, terraceMat);
  terrace.position.set(0, -0.1, halfL + terraceDepth / 2);
  terrace.receiveShadow = true;
  terrace.castShadow = true;
  plinthGroup.add(terrace);

  // Lamely na terase pre fotorealizmus
  const numDeckBoards = Math.floor(terraceDepth / 0.15);
  for (let i = 0; i < numDeckBoards; i++) {
    const grooveGeo = new THREE.BoxGeometry(terraceWidth - 0.05, 0.01, 0.008);
    const grooveMat = new THREE.MeshBasicMaterial({ color: 0x5a3e22 });
    const groove = new THREE.Mesh(grooveGeo, grooveMat);
    groove.position.set(0, 0.005, halfL + 0.1 + i * 0.15);
    plinthGroup.add(groove);
  }

  // Zapustené LED svetlá na terase
  for (const xOff of [-halfW + 0.4, 0, halfW - 0.4]) {
    const ledGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16);
    const led = new THREE.Mesh(ledGeo, lightEmissiveMat);
    led.position.set(xOff, 0.01, halfL + terraceDepth - 0.3);
    plinthGroup.add(led);

    if (isNight) {
      const spot = new THREE.PointLight(0xffaa44, 1.2, 3.5);
      spot.position.set(xOff, 0.2, halfL + terraceDepth - 0.3);
      plinthGroup.add(spot);
    }
  }

  rootGroup.add(plinthGroup);

  // ── 2. HLAVNÝ KORPUS DOMU (STENY & INTERIÉR) ──────────────────────────────────
  
  const houseBody = new THREE.Group();
  houseBody.name = 'HouseBody';

  // Vnútorná podlaha
  const floorGeo = new THREE.BoxGeometry(width - 0.3, 0.08, length - 0.3);
  const floor = new THREE.Mesh(floorGeo, interiorFloorMat);
  floor.position.set(0, 0.04, 0);
  floor.receiveShadow = true;
  houseBody.add(floor);

  // Bočná stena 1 (Ľavá)
  const sideWallGeo = new THREE.BoxGeometry(0.18, wallHeight, length);
  const leftWall = new THREE.Mesh(sideWallGeo, sideWallMat);
  leftWall.position.set(-halfW + 0.09, wallHeight / 2, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  houseBody.add(leftWall);

  // Bočná stena 2 (Pravá)
  const rightWall = new THREE.Mesh(sideWallGeo, sideWallMat);
  rightWall.position.set(halfW - 0.09, wallHeight / 2, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  houseBody.add(rightWall);

  // Zvislé falce na bočných stenách (ak je antracit)
  if (facade === 'standard') {
    const ribStep = 0.5;
    const ribCount = Math.floor(length / ribStep);
    for (let i = 0; i <= ribCount; i++) {
      const zPos = -halfL + (i * length) / ribCount;
      // Ľavá strana
      const ribGeo = new THREE.BoxGeometry(0.04, wallHeight, 0.02);
      const ribL = new THREE.Mesh(ribGeo, frameMat);
      ribL.position.set(-halfW - 0.01, wallHeight / 2, zPos);
      ribL.castShadow = true;
      houseBody.add(ribL);
      // Pravá strana
      const ribR = new THREE.Mesh(ribGeo, frameMat);
      ribR.position.set(halfW + 0.01, wallHeight / 2, zPos);
      ribR.castShadow = true;
      houseBody.add(ribR);
    }
  }

  // Zadná stena (plná s oknom a vstupnými dverami)
  const backWallShape = new THREE.Shape();
  backWallShape.moveTo(-halfW, 0);
  backWallShape.lineTo(halfW, 0);
  backWallShape.lineTo(halfW, wallHeight);
  backWallShape.lineTo(0, ridgeHeight);
  backWallShape.lineTo(-halfW, wallHeight);
  backWallShape.closePath();

  const extrudeSettings = { depth: 0.18, bevelEnabled: false };
  const backWallGeo = new THREE.ExtrudeGeometry(backWallShape, extrudeSettings);
  const backWall = new THREE.Mesh(backWallGeo, gableWallMat);
  backWall.position.set(0, 0, -halfL);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  houseBody.add(backWall);

  // Vstupné dvere na zadnej strane
  const doorW = 1.0;
  const doorH = 2.15;
  const backDoorGeo = new THREE.BoxGeometry(doorW, doorH, 0.06);
  const backDoor = new THREE.Mesh(backDoorGeo, frameMat);
  backDoor.position.set(0.5, doorH / 2 + 0.05, -halfL - 0.03);
  backDoor.castShadow = true;
  houseBody.add(backDoor);

  // Kľučka na dverách
  const handleGeo = new THREE.BoxGeometry(0.12, 0.03, 0.06);
  const handle = new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.2 }));
  handle.position.set(0.15, 1.05, -halfL - 0.07);
  houseBody.add(handle);

  // ── 3. PREDNÉ PANORAMATICKÉ PRESKLENIE (GABLE GLASS) ──────────────────────────

  const frontFacadeGroup = new THREE.Group();
  frontFacadeGroup.name = 'FrontGableGlazing';

  // Obvodový rám štítu
  const frameThickness = 0.12;

  // Sklo v tvare štítu (Gable Glass)
  const frontGlassShape = new THREE.Shape();
  frontGlassShape.moveTo(-halfW + frameThickness, frameThickness);
  frontGlassShape.lineTo(halfW - frameThickness, frameThickness);
  frontGlassShape.lineTo(halfW - frameThickness, wallHeight - 0.05);
  frontGlassShape.lineTo(0, ridgeHeight - frameThickness);
  frontGlassShape.lineTo(-halfW + frameThickness, wallHeight - 0.05);
  frontGlassShape.closePath();

  const frontGlassGeo = new THREE.ShapeGeometry(frontGlassShape);
  const frontGlass = new THREE.Mesh(frontGlassGeo, glassMat);
  frontGlass.position.set(0, 0, halfL - 0.05);
  frontFacadeGroup.add(frontGlass);

  // Rámové stĺpiky a deliace priečky (Mullions)
  // Stredový zvislý profil
  const centerMullionGeo = new THREE.BoxGeometry(0.1, ridgeHeight - 0.2, 0.15);
  const centerMullion = new THREE.Mesh(centerMullionGeo, frameMat);
  centerMullion.position.set(0, ridgeHeight / 2, halfL);
  centerMullion.castShadow = true;
  frontFacadeGroup.add(centerMullion);

  // Horizontálny profil vo výške dverí (2.1m)
  const transomGeo = new THREE.BoxGeometry(width - 0.2, 0.08, 0.12);
  const transom = new THREE.Mesh(transomGeo, frameMat);
  transom.position.set(0, 2.1, halfL);
  transom.castShadow = true;
  frontFacadeGroup.add(transom);

  // Bočné vertikálne rámy posuvných dverí
  for (const x of [-halfW / 2, halfW / 2]) {
    const subMullionGeo = new THREE.BoxGeometry(0.06, 2.1, 0.1);
    const subMullion = new THREE.Mesh(subMullionGeo, frameMat);
    subMullion.position.set(x, 1.05, halfL);
    subMullion.castShadow = true;
    frontFacadeGroup.add(subMullion);
  }

  // Drevené štítové lemovanie (Fascia)
  const fasciaAngle = Math.atan2(gableHeight, halfW);
  const fasciaLen = Math.sqrt(halfW * halfW + gableHeight * gableHeight) + 0.1;
  
  const fasciaBoardGeo = new THREE.BoxGeometry(fasciaLen, 0.12, 0.12);
  
  // Ľavé rameno štítu
  const fasciaLeft = new THREE.Mesh(fasciaBoardGeo, gableWallMat);
  fasciaLeft.position.set(-halfW / 2, wallHeight + gableHeight / 2, halfL + 0.04);
  fasciaLeft.rotation.z = fasciaAngle;
  fasciaLeft.castShadow = true;
  frontFacadeGroup.add(fasciaLeft);

  // Pravé rameno štítu
  const fasciaRight = new THREE.Mesh(fasciaBoardGeo, gableWallMat);
  fasciaRight.position.set(halfW / 2, wallHeight + gableHeight / 2, halfL + 0.04);
  fasciaRight.rotation.z = -fasciaAngle;
  fasciaRight.castShadow = true;
  frontFacadeGroup.add(fasciaRight);

  houseBody.add(frontFacadeGroup);

  // ── 4. INTERIÉR (Priečky, Mezanín & Nábytok) ──────────────────────────────────

  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'Interior';

  // Spálňová / kúpeľňová priečka v zadnej časti
  const partitionGeo = new THREE.BoxGeometry(width - 0.35, wallHeight - 0.1, 0.12);
  const partition = new THREE.Mesh(partitionGeo, interiorWallMat);
  partition.position.set(0, wallHeight / 2, -halfL + 3.0);
  partition.castShadow = true;
  partition.receiveShadow = true;
  interiorGroup.add(partition);

  // Vnútorné dvere v priečke
  const intDoorGeo = new THREE.BoxGeometry(0.85, 2.05, 0.04);
  const intDoor = new THREE.Mesh(intDoorGeo, darkWoodMat);
  intDoor.position.set(-1.0, 1.025, -halfL + 3.0);
  interiorGroup.add(intDoor);

  // Mezanín / Loftové poschodie na spanie
  const mezzanineDepth = 3.2;
  const mezzanineGeo = new THREE.BoxGeometry(width - 0.35, 0.14, mezzanineDepth);
  const mezzanine = new THREE.Mesh(mezzanineGeo, woodMat);
  mezzanine.position.set(0, wallHeight - 0.2, -halfL + mezzanineDepth / 2 + 0.2);
  mezzanine.castShadow = true;
  mezzanine.receiveShadow = true;
  interiorGroup.add(mezzanine);

  // Zábradlie mezanínu
  const railingGeo = new THREE.BoxGeometry(width - 0.35, 0.8, 0.04);
  const railing = new THREE.Mesh(railingGeo, frameMat);
  railing.position.set(0, wallHeight + 0.3, -halfL + mezzanineDepth + 0.2);
  interiorGroup.add(railing);

  // Teplé vnútorné osvetlenie
  const warmLight1 = new THREE.PointLight(0xffc277, isNight ? 2.5 : 0.8, 12);
  warmLight1.position.set(0, wallHeight + 0.4, 0);
  interiorGroup.add(warmLight1);

  const warmLight2 = new THREE.PointLight(0xffa855, isNight ? 1.8 : 0.5, 8);
  warmLight2.position.set(0, 1.6, halfL - 2.0);
  interiorGroup.add(warmLight2);

  houseBody.add(interiorGroup);
  rootGroup.add(houseBody);

  // ── 5. SEDLOVÁ STRECHA (S MOŽNOSŤOU ROOF CUTAWAY) ─────────────────────────────

  const roofGroup = new THREE.Group();
  roofGroup.name = 'RoofStructure';

  // Rozmery strešného panelu
  const roofSlopeLength = Math.sqrt(halfW * halfW + gableHeight * gableHeight) + 0.15;
  const roofSlopeAngle = Math.atan2(gableHeight, halfW);

  // Ľavá strana strechy
  const leftRoofGeo = new THREE.BoxGeometry(roofSlopeLength, 0.16, length + 0.1);
  const leftRoof = new THREE.Mesh(leftRoofGeo, roofMat);
  leftRoof.position.set(-halfW / 2, wallHeight + gableHeight / 2, 0);
  leftRoof.rotation.z = roofSlopeAngle;
  leftRoof.castShadow = true;
  leftRoof.receiveShadow = true;
  roofGroup.add(leftRoof);

  // Pravá strana strechy
  const rightRoofGeo = new THREE.BoxGeometry(roofSlopeLength, 0.16, length + 0.1);
  const rightRoof = new THREE.Mesh(rightRoofGeo, roofMat);
  rightRoof.position.set(halfW / 2, wallHeight + gableHeight / 2, 0);
  rightRoof.rotation.z = -roofSlopeAngle;
  rightRoof.castShadow = true;
  rightRoof.receiveShadow = true;
  roofGroup.add(rightRoof);

  // Hrebeňový plech (Ridge cap)
  const ridgeCapGeo = new THREE.BoxGeometry(0.35, 0.08, length + 0.12);
  const ridgeCap = new THREE.Mesh(ridgeCapGeo, frameMat);
  ridgeCap.position.set(0, ridgeHeight + 0.06, 0);
  ridgeCap.castShadow = true;
  roofGroup.add(ridgeCap);

  // Strešné falce (Standing seams na streche každých 0.6 m)
  const roofSeamStep = 0.6;
  const roofSeamCount = Math.floor(length / roofSeamStep);
  for (let i = 0; i <= roofSeamCount; i++) {
    const zPos = -halfL + (i * length) / roofSeamCount;
    // Ľavý falc
    const seamGeo = new THREE.BoxGeometry(roofSlopeLength, 0.03, 0.02);
    const seamL = new THREE.Mesh(seamGeo, frameMat);
    seamL.position.set(-halfW / 2, wallHeight + gableHeight / 2 + 0.09, zPos);
    seamL.rotation.z = roofSlopeAngle;
    roofGroup.add(seamL);

    // Pravý falc
    const seamR = new THREE.Mesh(seamGeo, frameMat);
    seamR.position.set(halfW / 2, wallHeight + gableHeight / 2 + 0.09, zPos);
    seamR.rotation.z = -roofSlopeAngle;
    roofGroup.add(seamR);
  }

  // Strešné okno (Skylight) na pravej strane strechy
  const skylightW = 0.9;
  const skylightH = 1.2;
  const skylightFrameGeo = new THREE.BoxGeometry(skylightH, 0.08, skylightW);
  const skylightFrame = new THREE.Mesh(skylightFrameGeo, frameMat);
  skylightFrame.position.set(halfW / 2, wallHeight + gableHeight / 2 + 0.1, 0.5);
  skylightFrame.rotation.z = -roofSlopeAngle;
  roofGroup.add(skylightFrame);

  const skylightGlassGeo = new THREE.BoxGeometry(skylightH - 0.15, 0.02, skylightW - 0.15);
  const skylightGlass = new THREE.Mesh(skylightGlassGeo, glassMat);
  skylightGlass.position.set(halfW / 2, wallHeight + gableHeight / 2 + 0.12, 0.5);
  skylightGlass.rotation.z = -roofSlopeAngle;
  roofGroup.add(skylightGlass);

  // Aplikácia Exploded View / Cutaway (Zdvihnutie strechy)
  if (roofCutaway > 0) {
    roofGroup.position.y = roofCutaway * 3.5;
  }

  rootGroup.add(roofGroup);

  return rootGroup;
}
