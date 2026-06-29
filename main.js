import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- 1. SETUP THREE.JS ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Luci (importanti per vedere i materiali della cassetta)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// --- 2. CARICAMENTO MODELLO .GLB ---
const loader = new GLTFLoader();

// Metti il tuo file .glb nella cartella 'public' o 'assets'
loader.load('/assets/cassetta.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    
    // Scala o posiziona il modello se è troppo grande/piccolo
    model.scale.set(1, 1, 1); 
    model.rotation.x = 0.5; // Leggera inclinazione iniziale

    // 💡 IMPORTANTE: Ispeziona i nomi dei pezzi. 
    // Apri la console del browser (F12) per vedere come si chiamano i componenti interni.
    model.traverse((child) => {
        if (child.isMesh) {
            console.log("Nome pezzo trovato:", child.name);
        }
    });

    // Recupera le mesh specifiche tramite il loro nome (sostituisci con i tuoi nomi reali)
    const coverTop = model.getObjectByName('Cover_Top'); 
    const coverBottom = model.getObjectByName('Cover_Bottom');
    const tapeSpool = model.getObjectByName('Tape_Spool');

    // --- 3. ANIMAZIONE PARALLASSE CON GSAP ---
    // Creiamo una timeline agganciata allo scroll dell'intera pagina (body)
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1, // Valore numerico per rendere il movimento "morbido" (smoothing)
        }
    });

    // Man mano che si scrolla, separiamo i pezzi lungo gli assi
    if (coverTop) tl.to(coverTop.position, { y: 2, duration: 1 }, 0);
    if (coverBottom) tl.to(coverBottom.position, { y: -2, duration: 1 }, 0);
    if (tapeSpool) tl.to(tapeSpool.position, { z: 1.5, rotationY: 360, duration: 1 }, 0);

    // Facciamo anche ruotare l'intero blocco per un effetto 3D cinematico
    tl.to(model.rotation, { y: Math.PI * 2, duration: 1 }, 0);

}, undefined, (error) => {
    console.error("Errore caricamento modello:", error);
});

// --- 4. ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Gestione ridimensionamento finestra
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
