import * as THREE from 'three';

/**
 * Fotorealistický 3D Model pre Barn House 48 (PH-008)
 * Presné rozmery a špecifikácia:
 * - Šírka domu: 4.5 m
 * - Základná dĺžka obytného modulu: 6.5 m (predĺženia o +1.3 m: 7.8m, 9.1m, 10.4m)
 * - Hĺbka zapusteného portálu / krytej terasy: 1.3 m
 * - Celková dĺžka strechy a korpusu: 7.8 m (6.5m obytná časť + 1.3m terasa)
 * - Výška po odkvap: 2.8 m, Výška po hrebeň: 4.4 m
 * - Architektonický sivý falcovaný plech (RAL 7016 / RAL 7024) s jemnou zrnitou štruktúrou
 * - Realistické drevené lamely zo škandinávskeho smreku s textúrou vlákien
 * - 3D interaktívne kóty a rozmerové štítky
 */

export function createBarn48Model({
  facade = 'standard', // 'standard' (sivý plech+drevo), 'wood' (celodrevo), 'stucco' (biela omietka)
  extension = 0,       // 0, 1.3, 2.6, 3.9 m
  roofCutaway = 0,     // 0.0 až 1.0 (odklopenie strechy pre zobrazenie interiéru)
  timeOfDay = 'day',   // 'day', 'sunset', 'night'
  interiorType = 'wood' // 'wood', 'drywall'
}) {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'Barn48_Photorealistic_House';

  const width = 4.5;
  const wallHeight = 2.75;
  const ridgeHeight = 4.4;
  const gableHeight = ridgeHeight - wallHeight; // 1.65m
  const porchDepth = 1.3; // Zapustená krytá terasa presne 1.3m
  const houseBodyLength = 6.5 + extension; // Obytná časť: 6.5m základ + predĺženia
  const totalLength = houseBodyLength + porchDepth; // 7.8m základ celkom
  
  const halfW = width / 2; // 2.25m
  const halfL = totalLength / 2; // 3.9m
  const glassZ = halfL - porchDepth; // Z-súradnica sklenenej steny

  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';

  // ── 1. PROCEDURÁLNE PBR TEXTÚRY S VYSOKÝM DETAILOM ─────────────────────────────

  // Generátor fotorealistickej textúry dreva s lamelami a letokruhmi
  const createWoodTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Podkladová farba dreva
    ctx.fillStyle = '#d1985a';
    ctx.fillRect(0, 0, 1024, 1024);

    // Jednotlivé zvislé dosky (šírka dosky ~ 64px)
    const boardW = 64;
    for (let x = 0; x < 1024; x += boardW) {
      // Jemná zmena odtieňa každej dosky pre prirodzenosť
      const shadeJitter = (Math.random() - 0.5) * 25;
      const r = Math.min(255, Math.max(0, 215 + shadeJitter));
      const g = Math.min(255, Math.max(0, 155 + shadeJitter * 0.8));
      const b = Math.min(255, Math.max(0, 92 + shadeJitter * 0.6));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, 0, boardW, 1024);

      // Tmavá drážka medzi doskami
      ctx.fillStyle = 'rgba(60, 35, 15, 0.45)';
      ctx.fillRect(x, 0, 3, 1024);
      ctx.fillStyle = 'rgba(255, 230, 190, 0.2)';
      ctx.fillRect(x + 3, 0, 1, 1024);

      // Vlákna dreva (Wood grain)
      for (let i = 0; i < 12; i++) {
        ctx.strokeStyle = 'rgba(90, 50, 20, 0.05)';
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath();
        const startX = x + Math.random() * boardW;
        ctx.moveTo(startX, 0);
        ctx.bezierCurveTo(
          startX + (Math.random() - 0.5) * 10, 340,
          startX + (Math.random() - 0.5) * 10, 680,
          startX + (Math.random() - 0.5) * 6, 1024
        );
        ctx.stroke();
      }

      // Hrkčky v dreve (Knots)
      if (Math.random() > 0.6) {
        const knotY = Math.random() * 900 + 50;
        const knotX = x + boardW / 2 + (Math.random() - 0.5) * 20;
        ctx.fillStyle = 'rgba(75, 40, 15, 0.35)';
        ctx.beginPath();
        ctx.ellipse(knotX, knotY, 6, 14, (Math.random() - 0.5) * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  // Textúra terasových ryhovaných dosiek
  const createDeckTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#b7793d';
    ctx.fillRect(0, 0, 512, 1024);

    const plankWidth = 32;
    for (let x = 0; x < 512; x += plankWidth) {
      const tint = (Math.random() - 0.5) * 18;
      ctx.fillStyle = `rgb(${185 + tint}, ${122 + tint * 0.8}, ${62 + tint * 0.5})`;
      ctx.fillRect(x, 0, plankWidth, 1024);

      // Mikro-drážky (ryhovanie terasy)
      for (let g = 4; g < plankWidth - 4; g += 6) {
        ctx.fillStyle = 'rgba(70, 35, 10, 0.3)';
        ctx.fillRect(x + g, 0, 2, 1024);
        ctx.fillStyle = 'rgba(255, 220, 170, 0.15)';
        ctx.fillRect(x + g + 2, 0, 1, 1024);
      }

      // Hlboká medzera medzi doskami
      ctx.fillStyle = 'rgba(40, 20, 5, 0.6)';
      ctx.fillRect(x, 0, 3, 1024);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 6);
    return texture;
  };

  // Textúra práškového sivého plechu (RAL 7016)
  const createMetalNormalTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(128, 128, 255)'; // Neutrálna modrá normal mapa
    ctx.fillRect(0, 0, 256, 256);

    // Mikro šum pre matný lakovaný povrch
    const imgData = ctx.getImageData(0, 0, 256, 256);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12;
      imgData.data[i] = Math.min(255, Math.max(0, 128 + noise));
      imgData.data[i + 1] = Math.min(255, Math.max(0, 128 + noise));
      imgData.data[i + 2] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  const woodTexture = createWoodTexture();
  const deckTexture = createDeckTexture();
  const metalNormal = createMetalNormalTexture();

  // PBR MATERIÁLY
  
  // Svetlejší sivý architektonický plech (RAL 7037 / RAL 7031 Sivá bridlica / Zinok)
  const greyMetalMat = new THREE.MeshStandardMaterial({
    color: 0x586069, // Svetlejšia moderná architektonická sivá
    roughness: 0.42,
    metalness: 0.58,
    normalMap: metalNormal,
    normalScale: new THREE.Vector2(0.15, 0.15),
    name: 'ArchitecturalLightGreyMetal'
  });

  // Škandinávsky smrek
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTexture,
    color: 0xe6b074,
    roughness: 0.55,
    metalness: 0.02,
    name: 'NordicSpruce'
  });

  // Terasové dosky
  const deckMat = new THREE.MeshStandardMaterial({
    map: deckTexture,
    color: 0xc68a4c,
    roughness: 0.65,
    metalness: 0.02,
    name: 'TerraceDecking'
  });

  // Biela omietka
  const stuccoMat = new THREE.MeshStandardMaterial({
    color: 0xf5f3ee,
    roughness: 0.95,
    metalness: 0.02,
    name: 'WhiteStucco'
  });

  // Hliníkové rámy okien a dverí (Sivá)
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x3d434a,
    roughness: 0.35,
    metalness: 0.75,
    name: 'AluFrame'
  });

  // Prémiové reflexné sklo s prirodzeným odrazom
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: isNight ? 0xffeaaf : 0xaad4f5,
    transmission: 0.88,
    opacity: 0.38,
    transparent: true,
    roughness: 0.03,
    metalness: 0.15,
    ior: 1.52,
    reflectivity: 0.85,
    name: 'ArchitecturalGlass'
  });

  // Interiérové materiály
  const interiorWallMat = new THREE.MeshStandardMaterial({
    color: interiorType === 'wood' ? 0xe2be92 : 0xf6f3eb,
    roughness: 0.85
  });

  const interiorFloorMat = new THREE.MeshStandardMaterial({
    color: 0xd4a366,
    roughness: 0.55
  });

  // Priradenie fasády
  const outerWallMat = facade === 'wood' ? woodMat : (facade === 'stucco' ? stuccoMat : greyMetalMat);
  const roofMat = greyMetalMat;

  // ── 2. ZEMNÝ PODKLAD & VYVÝŠENÉ ZÁKLADY (PODĽA FOTKY 1) ────────────────────────

  const siteGroup = new THREE.Group();
  siteGroup.name = 'Site_And_Foundation';

  // Prírodný terén / Štrkové lôžko
  const groundGeo = new THREE.CylinderGeometry(14, 14, 0.3, 32);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x5a5448, // Štrkovo-piesčitá zemina
    roughness: 0.98,
    metalness: 0.0
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.set(0, -1.0, 0);
  ground.receiveShadow = true;
  siteGroup.add(ground);

  // Masívne drevené základové stĺpy (usadenie na zemných skrutkách)
  const postHeight = 0.85;
  const postWidth = 0.32;
  const postGeo = new THREE.BoxGeometry(postWidth, postHeight, postWidth);
  const postMat = new THREE.MeshStandardMaterial({ map: woodTexture, color: 0xa87038, roughness: 0.8 });

  const postPositionsX = [-halfW + 0.25, -halfW / 3, halfW / 3, halfW - 0.25];
  const postPositionsZ = [halfL + 2.4, halfL, 0, -halfL + 0.4];

  postPositionsZ.forEach(pz => {
    postPositionsX.forEach(px => {
      // Drevený stĺp
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(px, -postHeight / 2, pz);
      post.castShadow = true;
      post.receiveShadow = true;
      siteGroup.add(post);

      // Pozinkovaná zemná pätka
      const screwGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
      const screwMat = new THREE.MeshStandardMaterial({ color: 0x7c858e, metalness: 0.9, roughness: 0.3 });
      const screw = new THREE.Mesh(screwGeo, screwMat);
      screw.position.set(px, -postHeight - 0.12, pz);
      siteGroup.add(screw);
    });
  });

  rootGroup.add(siteGroup);

  // ── 3. TERASA S POZDĹŽNYMI DOSKAMI (ŠÍRKA 4.5M, DĹŽKA 1.3M KRYTÁ + 2.5M VONKAJŠIA) ─

  const terraceGroup = new THREE.Group();
  terraceGroup.name = 'Terrace';

  const outdoorDeckLength = 2.6; // Vonkajšia terasa pred portálom
  const totalDeckLength = porchDepth + outdoorDeckLength; // 1.3m + 2.6m = 3.9m
  const deckCenterZ = glassZ + totalDeckLength / 2;

  const deckGeo = new THREE.BoxGeometry(width, 0.06, totalDeckLength);
  const deckMesh = new THREE.Mesh(deckGeo, deckMat);
  deckMesh.position.set(0, 0.03, deckCenterZ);
  deckMesh.receiveShadow = true;
  deckMesh.castShadow = true;
  terraceGroup.add(deckMesh);

  // Čelná doska terasy (Apron)
  const apronGeo = new THREE.BoxGeometry(width + 0.02, 0.42, 0.05);
  const apron = new THREE.Mesh(apronGeo, postMat);
  apron.position.set(0, -0.18, halfL + outdoorDeckLength);
  apron.castShadow = true;
  terraceGroup.add(apron);

  rootGroup.add(terraceGroup);

  // ── 4. KORPUS DOMU & INTERIÉR (OBYTNÁ ČASŤ 6.5M + PREDĹŽENIA) ─────────────────

  const houseBody = new THREE.Group();
  houseBody.name = 'HouseBody';

  const interiorCenterZ = (glassZ + (-halfL)) / 2;

  // Interiérová podlaha
  const floorGeo = new THREE.BoxGeometry(width - 0.36, 0.08, houseBodyLength - 0.1);
  const floor = new THREE.Mesh(floorGeo, interiorFloorMat);
  floor.position.set(0, 0.04, interiorCenterZ);
  floor.receiveShadow = true;
  houseBody.add(floor);

  // Zadná plná stena so sedlovým štítom
  const backWallShape = new THREE.Shape();
  backWallShape.moveTo(-halfW, 0);
  backWallShape.lineTo(halfW, 0);
  backWallShape.lineTo(halfW, wallHeight);
  backWallShape.lineTo(0, ridgeHeight);
  backWallShape.lineTo(-halfW, wallHeight);
  backWallShape.closePath();

  const backWallGeo = new THREE.ExtrudeGeometry(backWallShape, { depth: 0.22, bevelEnabled: false });
  const backWall = new THREE.Mesh(backWallGeo, outerWallMat);
  backWall.position.set(0, 0, -halfL);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  houseBody.add(backWall);

  // Bočné steny (plná dĺžka vrátane portálu 7.8m + extension)
  const sideWallGeo = new THREE.BoxGeometry(0.22, wallHeight, totalLength);
  
  const leftWall = new THREE.Mesh(sideWallGeo, outerWallMat);
  leftWall.position.set(-halfW + 0.11, wallHeight / 2, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  houseBody.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeo, outerWallMat);
  rightWall.position.set(halfW - 0.11, wallHeight / 2, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  houseBody.add(rightWall);

  // Zvislé falce na sivom plechu
  if (facade === 'standard') {
    const seamCount = Math.floor(totalLength / 0.48);
    for (let i = 0; i <= seamCount; i++) {
      const z = -halfL + (i * totalLength) / seamCount;
      const seamGeo = new THREE.BoxGeometry(0.025, wallHeight, 0.025);
      const seamL = new THREE.Mesh(seamGeo, frameMat);
      seamL.position.set(-halfW - 0.01, wallHeight / 2, z);
      houseBody.add(seamL);

      const seamR = new THREE.Mesh(seamGeo, frameMat);
      seamR.position.set(halfW + 0.01, wallHeight / 2, z);
      houseBody.add(seamR);
    }
  }

  // Interiérový loft / mezanín
  const loftLength = 2.8;
  const loftGeo = new THREE.BoxGeometry(width - 0.44, 0.12, loftLength);
  const loft = new THREE.Mesh(loftGeo, woodMat);
  loft.position.set(0, 2.2, -halfL + loftLength / 2 + 0.2);
  loft.castShadow = true;
  loft.receiveShadow = true;
  houseBody.add(loft);

  rootGroup.add(houseBody);

  // ── 5. ZAPUSTENÝ DREVENÝ PORTÁL (KRYTÁ TERASA 1.3M Z FOTIEK) ───────────────────

  const porchGroup = new THREE.Group();
  porchGroup.name = 'Recessed_1.3m_Porch';

  const porchCenterZ = glassZ + porchDepth / 2;
  const slopeAngle = Math.atan2(gableHeight, halfW);
  const rafterLen = Math.sqrt(halfW * halfW + gableHeight * gableHeight);

  // Ľavý vnútorný drevený obklad portálu
  const pWallGeo = new THREE.BoxGeometry(0.04, wallHeight, porchDepth);
  const pWallL = new THREE.Mesh(pWallGeo, woodMat);
  pWallL.position.set(-halfW + 0.22, wallHeight / 2, porchCenterZ);
  pWallL.receiveShadow = true;
  porchGroup.add(pWallL);

  // Pravý vnútorný drevený obklad portálu
  const pWallR = new THREE.Mesh(pWallGeo, woodMat);
  pWallR.position.set(halfW - 0.22, wallHeight / 2, porchCenterZ);
  pWallR.receiveShadow = true;
  porchGroup.add(pWallR);

  // Drevený podhľad portálu (ľavá a pravá šikmina strechy)
  const ceilingGeo = new THREE.BoxGeometry(rafterLen - 0.12, 0.04, porchDepth);
  
  const ceilL = new THREE.Mesh(ceilingGeo, woodMat);
  ceilL.position.set(-halfW / 2 + 0.08, wallHeight + gableHeight / 2 - 0.04, porchCenterZ);
  ceilL.rotation.z = slopeAngle;
  ceilL.receiveShadow = true;
  porchGroup.add(ceilL);

  const ceilR = new THREE.Mesh(ceilingGeo, woodMat);
  ceilR.position.set(halfW / 2 - 0.08, wallHeight + gableHeight / 2 - 0.04, porchCenterZ);
  ceilR.rotation.z = -slopeAngle;
  ceilR.receiveShadow = true;
  porchGroup.add(ceilR);

  // Čelné drevené lemovanie štítu (Fascia miter z Photo 1)
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

  // Čelné zvislé stĺpiky
  const frontPostGeo = new THREE.BoxGeometry(0.32, wallHeight, 0.05);
  const frontPostL = new THREE.Mesh(frontPostGeo, woodMat);
  frontPostL.position.set(-halfW + 0.16, wallHeight / 2, halfL + 0.02);
  frontPostL.castShadow = true;
  porchGroup.add(frontPostL);

  const frontPostR = new THREE.Mesh(frontPostGeo, woodMat);
  frontPostR.position.set(halfW - 0.16, wallHeight / 2, halfL + 0.02);
  frontPostR.castShadow = true;
  porchGroup.add(frontPostR);

  rootGroup.add(porchGroup);

  // ── 6. PREDNÁ SKLENENÁ STENA V ZAPUSTENÍ (PHOTO 2) ─────────────────────────────

  const glassFacadeGroup = new THREE.Group();
  glassFacadeGroup.name = 'Glass_Facade';
  glassFacadeGroup.position.set(0, 0, glassZ);

  const glassW = width - 0.44; // 4.06m
  const glassHalf = glassW / 2;
  const doorH = 2.15;

  // Masívny priečnik nad dverami (Transom beam)
  const transomGeo = new THREE.BoxGeometry(glassW + 0.04, 0.1, 0.12);
  const transom = new THREE.Mesh(transomGeo, frameMat);
  transom.position.set(0, doorH, 0);
  transom.castShadow = true;
  glassFacadeGroup.add(transom);

  // 4 Spodné sklenené panely (2 fixné + 2 dverné krídla)
  const bayW = glassW / 4;
  for (let i = 0; i < 4; i++) {
    const bx = -glassHalf + bayW * i + bayW / 2;

    const paneGeo = new THREE.BoxGeometry(bayW - 0.08, doorH - 0.14, 0.02);
    const pane = new THREE.Mesh(paneGeo, glassMat);
    pane.position.set(bx, doorH / 2, 0);
    pane.castShadow = true;
    glassFacadeGroup.add(pane);

    const mGeo = new THREE.BoxGeometry(0.06, doorH, 0.08);
    const mMesh = new THREE.Mesh(mGeo, frameMat);
    mMesh.position.set(-glassHalf + bayW * i, doorH / 2, 0);
    glassFacadeGroup.add(mMesh);

    // Kľučka na dverách
    if (i === 2) {
      const handleGeo = new THREE.BoxGeometry(0.03, 0.18, 0.07);
      const handle = new THREE.Mesh(handleGeo, frameMat);
      handle.position.set(bx + bayW / 2 - 0.08, 1.05, 0.04);
      glassFacadeGroup.add(handle);
    }
  }
  // Pravý krajný profil
  const lastMullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, doorH, 0.08), frameMat);
  lastMullion.position.set(glassHalf, doorH / 2, 0);
  glassFacadeGroup.add(lastMullion);

  // Vrchné trojuholníkové presklenie (Centrálny trojuholník + bočné lichobežníky)
  const topGableH = ridgeHeight - doorH - 0.05;
  const centerTriShape = new THREE.Shape();
  centerTriShape.moveTo(-glassHalf * 0.44, 0);
  centerTriShape.lineTo(glassHalf * 0.44, 0);
  centerTriShape.lineTo(0, topGableH);
  centerTriShape.closePath();

  const centerTriGeo = new THREE.ShapeGeometry(centerTriShape);
  const centerTri = new THREE.Mesh(centerTriGeo, glassMat);
  centerTri.position.set(0, doorH + 0.05, 0);
  glassFacadeGroup.add(centerTri);

  // Bočné lichobežníky
  const leftTrapShape = new THREE.Shape();
  leftTrapShape.moveTo(-glassHalf + 0.04, 0);
  leftTrapShape.lineTo(-glassHalf * 0.48, 0);
  leftTrapShape.lineTo(-glassHalf * 0.48, topGableH * 0.5);
  leftTrapShape.lineTo(-glassHalf + 0.04, wallHeight - doorH);
  leftTrapShape.closePath();

  const leftTrap = new THREE.Mesh(new THREE.ShapeGeometry(leftTrapShape), glassMat);
  leftTrap.position.set(0, doorH + 0.05, 0);
  glassFacadeGroup.add(leftTrap);

  const rightTrapShape = new THREE.Shape();
  rightTrapShape.moveTo(glassHalf * 0.48, 0);
  rightTrapShape.lineTo(glassHalf - 0.04, 0);
  rightTrapShape.lineTo(glassHalf - 0.04, wallHeight - doorH);
  rightTrapShape.lineTo(glassHalf * 0.48, topGableH * 0.5);
  rightTrapShape.closePath();

  const rightTrap = new THREE.Mesh(new THREE.ShapeGeometry(rightTrapShape), glassMat);
  rightTrap.position.set(0, doorH + 0.05, 0);
  glassFacadeGroup.add(rightTrap);

  rootGroup.add(glassFacadeGroup);

  // ── 7. SEDLOVÁ STRECHA (SIVÝ FALCOVANÝ PLECH RAL 7016 + KOMÍN) ─────────────────

  const roofGroup = new THREE.Group();
  roofGroup.name = 'Roof_Structure';

  const roofLen = totalLength + 0.06;
  const slopeW = rafterLen + 0.12;

  // Ľavé krídlo strechy
  const roofLGeo = new THREE.BoxGeometry(slopeW, 0.14, roofLen);
  const roofL = new THREE.Mesh(roofLGeo, roofMat);
  roofL.position.set(-halfW / 2, wallHeight + gableHeight / 2 + 0.05, 0);
  roofL.rotation.z = slopeAngle;
  roofL.castShadow = true;
  roofL.receiveShadow = true;
  roofGroup.add(roofL);

  // Pravé krídlo strechy
  const roofRGeo = new THREE.BoxGeometry(slopeW, 0.14, roofLen);
  const roofR = new THREE.Mesh(roofRGeo, roofMat);
  roofR.position.set(halfW / 2, wallHeight + gableHeight / 2 + 0.05, 0);
  roofR.rotation.z = -slopeAngle;
  roofR.castShadow = true;
  roofR.receiveShadow = true;
  roofGroup.add(roofR);

  // Hrebenáč
  const ridgeCapGeo = new THREE.BoxGeometry(0.22, 0.06, roofLen);
  const ridgeCap = new THREE.Mesh(ridgeCapGeo, frameMat);
  ridgeCap.position.set(0, ridgeHeight + 0.06, 0);
  ridgeCap.castShadow = true;
  roofGroup.add(ridgeCap);

  // Strešné falce
  const roofSeams = Math.floor(roofLen / 0.48);
  for (let i = 0; i <= roofSeams; i++) {
    const z = -halfL + (i * roofLen) / roofSeams;
    const seamL = new THREE.Mesh(new THREE.BoxGeometry(slopeW, 0.025, 0.02), frameMat);
    seamL.position.set(-halfW / 2, wallHeight + gableHeight / 2 + 0.12, z);
    seamL.rotation.z = slopeAngle;
    roofGroup.add(seamL);

    const seamR = new THREE.Mesh(new THREE.BoxGeometry(slopeW, 0.025, 0.02), frameMat);
    seamR.position.set(halfW / 2, wallHeight + gableHeight / 2 + 0.12, z);
    seamR.rotation.z = -slopeAngle;
    roofGroup.add(seamR);
  }

  // Nerezový čierny komín na pravej strane strechy (z fotky 1)
  const chimney = new THREE.Group();
  chimney.position.set(1.4, 3.7, halfL - 2.5);

  const flue = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.4, 16), frameMat);
  flue.castShadow = true;
  chimney.add(flue);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.1, 16), frameMat);
  cap.position.set(0, 0.75, 0);
  chimney.add(cap);

  roofGroup.add(chimney);

  if (roofCutaway > 0) {
    roofGroup.position.y += roofCutaway * 3.5;
    roofGroup.position.z -= roofCutaway * 1.5;
  }

  rootGroup.add(roofGroup);

  // ── 8. SVETLÁ A AMBIENT ────────────────────────────────────────────────────────

  if (isNight || isSunset) {
    const pLight = new THREE.PointLight(0xffaa44, isNight ? 2.5 : 1.2, 8, 1.5);
    pLight.position.set(0, 2.4, glassZ + 0.65);
    rootGroup.add(pLight);

    const intLight = new THREE.PointLight(0xffd588, isNight ? 3.0 : 1.5, 12, 1.8);
    intLight.position.set(0, 2.2, 0);
    rootGroup.add(intLight);
  }

  return rootGroup;
}
