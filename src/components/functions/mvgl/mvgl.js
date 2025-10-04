import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export class MVGL {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = new THREE.Vector2(0, 0);
    this.targetRotation = new THREE.Vector2(0, 0);
    this.currentRotation = new THREE.Vector2(0, 0);
    this.init();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  init() {
    const baseDistance = 3;
    const isMobile = window.innerWidth < 768;
    const cameraDistance = isMobile ? 6 : baseDistance;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, cameraDistance);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const environment = new RoomEnvironment();
    const envMap = pmremGenerator.fromScene(environment).texture;
    this.scene.environment = envMap;

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.25);
    dirLight.position.set(1.5, 1.5, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 10;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    const loader = new GLTFLoader();
    loader.load(
      "/model/silverfoil.glb",
      (gltf) => {
        this.model = gltf.scene;
        const box = new THREE.Box3().setFromObject(this.model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        this.model.position.sub(center);
        this.model.position.z = 0.5;

        this.model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.envMap = envMap;
            child.material.envMapIntensity = 0.6;
            child.material.roughness = Math.max(child.material.roughness ?? 0.2, 0.4);//白飛び対策　消すな
            child.material.metalness = Math.min(child.material.metalness ?? 1.0, 0.8);
            child.material.needsUpdate = true;
            child.castShadow = true;
          }
        });

        this.scene.add(this.model);
      },
      undefined,
      (error) => {
        console.error("モデル読み込みに失敗:", error);
      }
    );

    const updateTiltFromPosition = (x, y) => {
      const rect = this.canvas.getBoundingClientRect();
      const nx = (x - rect.left) / rect.width;
      const ny = (y - rect.top) / rect.height;
      this.mouse.x = (nx - 0.5) * 2;
      this.mouse.y = (ny - 0.5) * 2;
      const tiltStrength = 0.4;
      this.targetRotation.x = this.mouse.y * tiltStrength;
      this.targetRotation.y = this.mouse.x * tiltStrength;
    };

    window.addEventListener("mousemove", (event) => {
      updateTiltFromPosition(event.clientX, event.clientY);
    });

    this.canvas.addEventListener("touchmove", (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        updateTiltFromPosition(touch.clientX, touch.clientY);//ドラッグ対応無理そうなのでとりあえずタッチで代用
      }
    });

    window.addEventListener("resize", () => this.onWindowResize());
  }

  onWindowResize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const isMobile = window.innerWidth < 768;
    this.camera.position.z = isMobile ? 6 : 3;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate);
    if (this.model) {
      this.currentRotation.x +=
        (this.targetRotation.x - this.currentRotation.x) * 0.1;
      this.currentRotation.y +=
        (this.targetRotation.y - this.currentRotation.y) * 0.1;
      this.model.rotation.x = this.currentRotation.x;
      this.model.rotation.y = this.currentRotation.y;
    }
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
    this.renderer.dispose();
  }
}
