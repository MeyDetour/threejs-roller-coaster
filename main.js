import * as THREE from 'three'
import {EffectComposer, OrbitControls, RenderPass, UnrealBloomPass} from 'three/addons'
import spline from "./spline";

let container = document.querySelector('.container3d');
let w = container.offsetWidth;
let h = container.offsetHeight;

const camera = new THREE.PerspectiveCamera(100, w / h, 0.1, 20)
const scene = new THREE.Scene({});
scene.fog = new THREE.FogExp2(0x000000, 0.3);
const renderer = new THREE.WebGLRenderer({antialias: true,alpha: true});
const loader = new THREE.TextureLoader()
renderer.setSize(w, h)
camera.position.z = 5
container.appendChild(renderer.domElement)
//
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0.002;
bloomPass.strength = 3.5;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);


const controls = new OrbitControls(camera, renderer.domElement)


const points = spline.getPoints(100)
const geometry = new THREE.BufferGeometry().setFromPoints(points)
const material = new THREE.LineBasicMaterial({color:0xffffff})
const line = new THREE.Line(geometry, material)
// scene.add(line)



const tubeGeometry = new THREE.TubeGeometry(spline,222,0.65,16,true)


const edges = new THREE.EdgesGeometry(tubeGeometry,0.2)
const lineMaterial = new THREE.LineBasicMaterial({color:0xffffff})
const tubesLines = new THREE.LineSegments(edges,lineMaterial)
scene.add(tubesLines)

const hemisLight = new THREE.HemisphereLight(0xffffff,0x00000,)
scene.add(hemisLight)

const size = 0.075
let boxGeo = new THREE.BoxGeometry(size, size,size)
for(let i=0; i<50;i++ ){
    const boxMat = new THREE.MeshBasicMaterial({color:0xff55ff,wireframe:true})
    const boxMesh = new THREE.Mesh(boxGeo, boxMat)
    const p = (i / 50 + Math.random() * 0.1) % 1;
    const pos = tubeGeometry.parameters.path.getPointAt(p);

    pos.x += Math.random() - 0.4;
    pos.z += Math.random() - 0.4;
    boxMesh.position.copy(pos);

    const rote = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    boxMesh.rotation.set(rote.x, rote.y, rote.z);

    const edges = new THREE.EdgesGeometry(boxGeo, 0.2);
    const color = new THREE.Color().setHSL(0.7 - p, 1, 0.5);
    const lineMat = new THREE.LineBasicMaterial({ color });
    const boxLines = new THREE.LineSegments(edges, lineMat);
    boxLines.position.copy(pos);
    boxLines.rotation.set(rote.x, rote.y, rote.z);
    scene.add(boxMesh);
    scene.add(boxLines);
}



function updateCamera(t){
    const time = t *0.1
    const looptime = 10*1000
    const p  = (time % looptime) / looptime
    const pos = tubeGeometry.parameters.path.getPointAt(p)
    const lookAt = tubeGeometry.parameters.path.getPointAt((p + 0.03) % 1);
    camera.position.copy(pos)
    camera.lookAt(lookAt)
}

function animate(t=0) {
    requestAnimationFrame(animate)
    updateCamera(t)
    composer.render(scene, camera)
    controls.update()
}

animate()

function handleWindowResize() {
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

window.addEventListener('resize', handleWindowResize, false);
