import { useEffect, useState } from 'react';
import * as THREE from 'three';
import DkaLogo from 'ui/assets/dka_logo.png';

const NOTIFICATION_WIDTH = 360;
const NOTIFICATION_HEIGHT = 600;

function Mascot() {
  const [boxSize] = useState(200); // 전체 박스 크기
  const [cubeSize] = useState(1); // 큐브 크기
  const [sensitive] = useState(0.1); // 큐브 돌아가는 감도

  function init() {
    const canvas = document.querySelector('#mascot');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      NOTIFICATION_WIDTH / NOTIFICATION_HEIGHT,
      0.1,
      2000,
    );
    // 카메라 시점 - 얼마나 멀리서 보나
    camera.position.z = 2 / (NOTIFICATION_WIDTH / NOTIFICATION_HEIGHT);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas ?? undefined,
      antialias: true,
      alpha: true, // 배경 투명하게
    });

    // 1.이거 전체화면
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // 2.사이즈에 맞게
    renderer.setSize(
      boxSize * 0.8,
      (boxSize / (NOTIFICATION_WIDTH / NOTIFICATION_HEIGHT)) * 0.8,
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));

    // 정육면체
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    // 여기서 그림 불러옴
    const texture1 = new THREE.TextureLoader().load(DkaLogo);
    const texture2 = new THREE.TextureLoader().load(DkaLogo);
    const texture3 = new THREE.TextureLoader().load(DkaLogo);
    const texture4 = new THREE.TextureLoader().load(DkaLogo);
    const texture5 = new THREE.TextureLoader().load(DkaLogo);
    const texture6 = new THREE.TextureLoader().load(DkaLogo);
    // 재질
    const materials = [
      new THREE.MeshBasicMaterial({ map: texture1 }),
      new THREE.MeshBasicMaterial({ map: texture2 }),
      new THREE.MeshBasicMaterial({ map: texture3 }),
      new THREE.MeshBasicMaterial({ map: texture4 }),
      new THREE.MeshBasicMaterial({ map: texture5 }),
      new THREE.MeshBasicMaterial({ map: texture6 }),
    ];

    const mesh = new THREE.Mesh(geometry, materials);
    scene.add(mesh);

    const mouse = new THREE.Vector2();
    const target = new THREE.Vector2();

    if (!canvas) {
      throw new Error('Canvas not drawing');
    }
    const centerPoint = new THREE.Vector2(
      (canvas.getClientRects()[0].x + canvas.getClientRects()[0].width) / 2,
      canvas.getClientRects()[0].y + canvas.getClientRects()[0].height / 2,
    );
    document.addEventListener('mousemove', (event) => {
      mouse.x = event.clientX - centerPoint.x;
      mouse.y = event.clientY - centerPoint.y;
    });

    const animate = () => {
      target.x = (1 - mouse.x) * 0.0022 * -1;
      target.y = (1 - mouse.y) * 0.0022 * -1;

      // 1.메타마스크 처럼
      mesh.rotation.x += sensitive * (target.y - mesh.rotation.x);
      mesh.rotation.y += sensitive * (target.x - mesh.rotation.y);

      // 2.계속 돌기
      // mesh.rotation.x -= 0.03 * target.y;
      // mesh.rotation.y -= 0.03 * target.x;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  }

  useEffect(init, []);

  return <canvas id="mascot" />;
}

export default Mascot;
