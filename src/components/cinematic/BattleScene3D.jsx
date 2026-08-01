import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HERO_ART, HERO_ELITE_ART } from '@/lib/artUrls';

// Cinemática 3D de batalla para la intro, renderizada con three.js.
// Escenas 3D con varios héroes interactuando (pato, transformer, tanque,
// magos, elfos...) al estilo de las batallas del juego pero en 3D: cartas
// de héroe en un campo de batalla con profundidad, luces de corte, brasas,
// movimientos de cámara y embestidas coreografiadas entre bandos.

const ROSTER = [
  { art: HERO_ART[36], name: 'Pacopiton', color: 0xffd24a },      // pato de goma
  { art: HERO_ART[12], name: 'Krunder Mec.', color: 0x88ccff },   // transformer
  { art: HERO_ART[4],  name: 'Torax', color: 0xcc3333 },         // tanque / escudo
  { art: HERO_ART[10], name: 'Buck', color: 0xC9A227 },           // mariscal de acero
  { art: HERO_ART[0],  name: 'Xabierus', color: 0xcc3333 },      // guerrero
  { art: HERO_ART[27], name: 'Retropoeta', color: 0x6644cc },    // mago
  { art: HERO_ART[15], name: 'Patrón', color: 0x33aa66 },        // elfo
  { art: HERO_ART[2],  name: 'Narbon', color: 0xcc3333 },       // guerrero
  { art: HERO_ART[28], name: 'Malachar', color: 0x6644cc },      // archimago
  { art: HERO_ART[6],  name: 'Bramblok', color: 0x33aa44 },      // druida
  { art: HERO_ELITE_ART[12], name: 'Krunder Élite', color: 0xc06bff }, // transformer élite
];

export default function BattleScene3D({ visible = true }) {
  const mountRef = useRef(null);
  const stateRef = useRef({ active: true });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const st = stateRef.current;
    st.active = true;

    let width = mount.clientWidth || window.innerWidth;
    let height = mount.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x050308, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050308, 10, 38);

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 11);
    camera.lookAt(0, 1.4, 0);

    // Luces
    scene.add(new THREE.AmbientLight(0x352a4a, 0.7));
    const rim = new THREE.DirectionalLight(0xffd9a0, 0.9);
    rim.position.set(-6, 7, -4); scene.add(rim);
    const key = new THREE.DirectionalLight(0x9a7bff, 0.6);
    key.position.set(6, 6, 6); scene.add(key);
    const flashLight = new THREE.PointLight(0xffaa44, 0, 18);
    flashLight.position.set(0, 2.2, 0); scene.add(flashLight);

    // Suelo
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x0c0816, roughness: 1, metalness: 0.1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);
    // Rejilla de energía sutil
    const grid = new THREE.GridHelper(60, 30, 0x2a1f4a, 0x1a1233);
    grid.position.y = 0.02;
    grid.material.transparent = true; grid.material.opacity = 0.35;
    scene.add(grid);

    // --- Cartas de héroe (billboards 3D) ---
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const cardGeo = new THREE.PlaneGeometry(1.7, 2.4);

    function makeCard(hero) {
      const group = new THREE.Group();
      // respaldo oscuro
      const back = new THREE.Mesh(cardGeo, new THREE.MeshStandardMaterial({ color: 0x0a0712, roughness: 0.8, side: THREE.DoubleSide }));
      group.add(back);
      // plano con la imagen del héroe
      const mat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide, opacity: 0 });
      const img = new THREE.Mesh(cardGeo, mat);
      group.add(img);
      // marco de color del clan
      const rimMat = new THREE.MeshBasicMaterial({ color: hero.color, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
      const rimGeo = new THREE.PlaneGeometry(1.85, 2.55);
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.z = -0.02;
      group.add(rimMesh);

      if (hero.art) {
        loader.load(
          hero.art,
          (tex) => { mat.map = tex; mat.needsUpdate = true; mat.opacity = 1; },
          undefined,
          () => { mat.color = new THREE.Color(hero.color); mat.opacity = 0.8; }
        );
      } else {
        mat.color = new THREE.Color(hero.color); mat.opacity = 0.8;
      }
      group.userData = { hero, imgMat: mat, rimMat };
      return group;
    }

    // Bando izquierdo / derecho: 3 cartas cada uno, rotando del roster.
    const sides = { L: [], R: [] };
    const POS_L = [-4.2, -3.0, -1.8];
    const POS_R = [1.8, 3.0, 4.2];

    function buildSide(side, indices, zBase) {
      const arr = sides[side];
      // limpia
      arr.forEach((c) => scene.remove(c));
      sides[side] = [];
      indices.forEach((idx, i) => {
        const hero = ROSTER[idx % ROSTER.length];
        const card = makeCard(hero);
        const x = side === 'L' ? POS_L[i] : POS_R[i];
        card.position.set(x, 1.3, zBase);
        card.lookAt(0, 1.3, zBase + (side === 'L' ? 0.4 : -0.4));
        card.rotation.y += side === 'L' ? 0.0 : Math.PI;
        card.userData.baseX = x;
        card.userData.baseZ = zBase;
        card.userData.side = side;
        card.userData.lunge = 0;
        card.userData.recoil = 0;
        scene.add(card);
        sides[side].push(card);
      });
    }

    // Roster inicial
    let leftIdx = [0, 2, 5];
    let rightIdx = [1, 3, 6];
    buildSide('L', leftIdx, 0);
    buildSide('R', rightIdx, 0);

    // --- Brasas (partículas que ascienden) ---
    const EMBERS = 180;
    const emberPos = new Float32Array(EMBERS * 3);
    const emberVel = new Float32Array(EMBERS);
    for (let i = 0; i < EMBERS; i++) {
      emberPos[i * 3] = (Math.random() - 0.5) * 22;
      emberPos[i * 3 + 1] = Math.random() * 8;
      emberPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      emberVel[i] = 0.4 + Math.random() * 0.9;
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    const emberMat = new THREE.PointsMaterial({ color: 0xffaa44, size: 0.09, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // --- Flash de impacto (sprite expansible) ---
    const flashGeo = new THREE.PlaneGeometry(1, 1);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.set(0, 1.6, 0.2);
    flash.visible = false;
    scene.add(flash);
    let flashLife = 0;

    // --- Coreografía de embestidas ---
    let attackTimer = 1.2;
    let swapTimer = 0;
    let camAngle = 0;

    const clock = new THREE.Clock();

    function pickAttacker() {
      const side = Math.random() < 0.5 ? 'L' : 'R';
      const arr = sides[side];
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function triggerAttack() {
      const atk = pickAttacker();
      if (!atk) return;
      atk.userData.lunge = 1; // avanza hacia el centro
      // defensor del bando contrario retrocede un poco
      const other = sides[atk.userData.side === 'L' ? 'R' : 'L'];
      const def = other && other[Math.floor(Math.random() * other.length)];
      if (def) def.userData.recoil = 1;
      // flash en el centro
      flash.visible = true;
      flashLife = 1;
      flashLight.intensity = 6;
    }

    function rotateRoster() {
      // rota los índices para que aparezcan héroes nuevos (varias pantallas)
      leftIdx = leftIdx.map((i) => (i + 3) % ROSTER.length);
      rightIdx = rightIdx.map((i) => (i + 4) % ROSTER.length);
      buildSide('L', leftIdx, 0);
      buildSide('R', rightIdx, 0);
    }

    function animate() {
      if (!st.active) return;
      requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // Cámara: órbita lenta + leve oscilación vertical (dolly cinematográfico)
      camAngle += dt * 0.08;
      camera.position.x = Math.sin(camAngle) * 11;
      camera.position.z = Math.cos(camAngle) * 11;
      camera.position.y = 3.0 + Math.sin(t * 0.3) * 0.5;
      camera.lookAt(0, 1.4, 0);

      // Embestidas programadas
      attackTimer -= dt;
      if (attackTimer <= 0) {
        triggerAttack();
        attackTimer = 1.8 + Math.random() * 1.4;
      }
      // Rotación de roster cada ~10s para mostrar varios héroes
      swapTimer += dt;
      if (swapTimer > 10) { rotateRoster(); swapTimer = 0; }

      // Animar cartas: lunge / recoil + flotación + orientación al centro
      [...sides.L, ...sides.R].forEach((card, idx) => {
        const dir = card.userData.side === 'L' ? 1 : -1;
        // lunge: avanza hacia +x (centro)
        if (card.userData.lunge > 0) {
          card.userData.lunge = Math.max(0, card.userData.lunge - dt * 1.6);
          card.position.x = card.userData.baseX + dir * (1.8 * card.userData.lunge);
          card.position.z = card.userData.baseZ + 1.2 * card.userData.lunge;
        } else {
          card.position.x = card.userData.baseX;
          card.position.z = card.userData.baseZ;
        }
        if (card.userData.recoil > 0) {
          card.userData.recoil = Math.max(0, card.userData.recoil - dt * 1.2);
          card.position.x = card.userData.baseX - dir * (0.8 * card.userData.recoil);
        }
        // flotación suave
        card.position.y = 1.3 + Math.sin(t * 1.2 + idx) * 0.06;
        // las cartas miran al centro (giro constante según bando)
        const targetY = card.userData.side === 'L' ? 0.5 : Math.PI - 0.5;
        card.rotation.y += (targetY - card.rotation.y) * Math.min(1, dt * 3);
      });

      // Flash de impacto: expande y desvanece
      if (flashLife > 0) {
        flashLife = Math.max(0, flashLife - dt * 2.2);
        const s = 1 + (1 - flashLife) * 4;
        flash.scale.set(s, s, 1);
        flash.material.opacity = flashLife * 0.8;
        flashLight.intensity = flashLife * 6;
        if (flashLife <= 0) { flash.visible = false; flashLight.intensity = 0; }
      }

      // Brasas: ascienden y se reinician
      const pos = emberGeo.attributes.position.array;
      for (let i = 0; i < EMBERS; i++) {
        pos[i * 3 + 1] += emberVel[i] * dt;
        pos[i * 3] += Math.sin(t * 0.5 + i) * 0.004;
        if (pos[i * 3 + 1] > 9) {
          pos[i * 3 + 1] = 0;
          pos[i * 3] = (Math.random() - 0.5) * 22;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
        }
      }
      emberGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    // Resize
    function onResize() {
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    return () => {
      st.active = false;
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      cardGeo.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      flashGeo.dispose();
      flashMat.dispose();
      grid.geometry.dispose(); grid.material.dispose();
      ground.geometry.dispose(); ground.material.dispose();
      [...sides.L, ...sides.R].forEach((c) => {
        c.children.forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
      });
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0"
      style={{ display: visible ? 'block' : 'none' }}
      aria-hidden={!visible}
    />
  );
}