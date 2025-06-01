"use client";
import React, { useEffect, useRef, useState } from "react";

// 型定義 (必要に応じて拡張)
interface Company {
  name: string;
  description: string;
  link: string;
  lat: number;
  lon: number;
  color: number;
  // three.jsのオブジェクトやスクリーン座標を保持するため、any型を一時的に使用
  markerObject?: any;
  screenPosition?: { x: number; y: number; isVisible: boolean };
}

export default function MapGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null); // カードのref
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [cardPosition, setCardPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    let renderer: THREE.WebGLRenderer,
      scene: THREE.Scene,
      camera: THREE.PerspectiveCamera,
      controls: any,
      globe: THREE.Mesh;
    let raycaster: THREE.Raycaster, mouse: THREE.Vector2;
    const markers: THREE.Mesh[] = [];
    let companiesData: Company[] = []; // 元のcompaniesの型をCompany[]に
    let animationFrameId: number;

    const initThree = async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls.js"
        );

        scene = new THREE.Scene();
        let width = 800,
          height = 600;
        if (containerRef.current) {
          width = containerRef.current.clientWidth;
          height = containerRef.current.clientHeight;
        } else {
          width = window.innerWidth;
          height = window.innerHeight;
        }

        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 2.5;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true で背景透過
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        if (containerRef.current) {
          containerRef.current.innerHTML = ""; // 既存のcanvasをクリア
          containerRef.current.appendChild(renderer.domElement);
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);

        const globeRadius = 1;
        const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
        const textureLoader = new THREE.TextureLoader();
        const mapTextureUrl =
          "https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/planets/earth_atmos_2048.jpg";

        // テクスチャの読み込みをPromiseでラップ
        const texture = await new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(mapTextureUrl, resolve, undefined, reject);
        }).catch((err) => {
          console.error("テクスチャ読み込み失敗:", err);
          // フォールバックとして色のみのマテリアルを使うための準備
          return null;
        });

        let globeMaterial;
        if (texture) {
          texture.colorSpace = THREE.SRGBColorSpace;
          globeMaterial = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 10,
            specular: 0x111111,
          });
        } else {
          // テクスチャ読み込み失敗時のフォールバックマテリアル
          globeMaterial = new THREE.MeshPhongMaterial({
            color: 0x4682b4, // SteelBlue
            shininess: 10,
          });
        }
        globe = new THREE.Mesh(globeGeometry, globeMaterial);
        scene.add(globe);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 1.2;
        controls.maxDistance = 8;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;

        companiesData = [
          {
            name: "TSMC",
            lat: 24.0,
            lon: 120.0,
            color: 0x8b5cf6,
            description:
              "台湾積体電路製造（TSMC）は、世界最大の半導体ファウンドリです。",
            link: "https://investor.tsmc.com/english/quarterly-results",
          },
          {
            name: "UMC",
            lat: 24.99,
            lon: 120.99,
            color: 0x10b981,
            description:
              "聯華電子（UMC）は、台湾を拠点とする大手半導体ファウンドリです。",
            link: "https://www.umc.com/en/IR/financial_reports.asp",
          },
          {
            name: "Samsung Electronics",
            lat: 37.0,
            lon: 126.8,
            color: 0x3b82f6,
            description:
              "サムスン電子は、メモリ半導体やシステムLSIなどを手がける韓国の総合電機メーカーです。",
            link: "https://www.samsung.com/global/ir/financial-information/earnings-release/",
          },
          {
            name: "GlobalFoundries",
            lat: 42.99,
            lon: -73.78,
            color: 0xef4444,
            description:
              "GFとしても知られるGlobalFoundriesは、米国を拠点とする大手半導体ファウンドリです。",
            link: "https://investors.gf.com/financials/quarterly-results",
          },
          {
            name: "SK hynix",
            lat: 37.5,
            lon: 127.9,
            color: 0xf97316,
            description:
              "SKハイニックスは、韓国を拠点とする大手メモリ半導体メーカーです。",
            link: "https://www.skhynix.com/eng/ir/financialInfo/earningsRelease.jsp",
          },
          {
            name: "Micron Technology",
            lat: 43.61,
            lon: -116.2,
            color: 0xa855f7,
            description:
              "マイクロン・テクノロジーは、米国を拠点とする大手メモリおよびストレージソリューションメーカーです。",
            link: "https://investors.micron.com/financials/quarterly-results",
          },
        ];

        const markerGeometry = new THREE.SphereGeometry(0.01, 16, 16);
        const latLonToVector3 = (lat: number, lon: number, radius: number) => {
          const phi = (90 - lat) * (Math.PI / 180);
          const theta = (lon + 180) * (Math.PI / 180);
          const x = -(radius * Math.sin(phi) * Math.cos(theta));
          const z = radius * Math.sin(phi) * Math.sin(theta);
          const y = radius * Math.cos(phi);
          return new THREE.Vector3(x, y, z);
        };

        markers.length = 0; // マーカー配列をクリア
        companiesData.forEach((company) => {
          const markerMaterial = new THREE.MeshBasicMaterial({
            color: company.color,
          });
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          marker.position.copy(
            latLonToVector3(company.lat, company.lon, globeRadius + 0.005)
          );
          marker.userData = company; // companyオブジェクト全体をuserDataに格納
          globe.add(marker);
          markers.push(marker);
        });

        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        const onClick = (event: MouseEvent) => {
          if (!renderer || !camera || !containerRef.current) return;
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(markers);

          if (intersects.length > 0) {
            const clickedMarker = intersects[0].object as THREE.Mesh;
            const companyData = clickedMarker.userData as Company;
            setSelectedCompany(companyData);
            controls.autoRotate = false; // マーカー選択時は自動回転を停止

            // スクリーン座標の計算
            const worldPos = new THREE.Vector3();
            clickedMarker.getWorldPosition(worldPos);
            const screenPos = worldPos.clone().project(camera);

            const screenX = (screenPos.x * 0.5 + 0.5) * rect.width + rect.left;
            const screenY = (-screenPos.y * 0.5 + 0.5) * rect.height + rect.top;

            // カードの位置を計算 (マーカーの右下に表示、画面端を考慮)
            let cardTop = screenY + 20; // マーカーの下20px
            let cardLeft = screenX + 20; // マーカーの右20px

            if (cardRef.current) {
              const cardWidth = cardRef.current.offsetWidth;
              const cardHeight = cardRef.current.offsetHeight;
              const margin = 16; // 画面端からのマージン

              // 右端チェック
              if (cardLeft + cardWidth + margin > window.innerWidth) {
                cardLeft = screenX - cardWidth - 20; // マーカーの左に表示
              }
              // 左端チェック (マーカーの左に表示した場合)
              if (cardLeft < margin) {
                cardLeft = margin;
              }
              // 下端チェック
              if (cardTop + cardHeight + margin > window.innerHeight) {
                cardTop = screenY - cardHeight - 20; // マーカーの上に表示
              }
              // 上端チェック (マーカーの上に表示した場合)
              if (cardTop < margin) {
                cardTop = margin;
              }
            }
            setCardPosition({ top: cardTop, left: cardLeft });
          } else {
            // 地球のどこか（マーカー以外）をクリックした場合
            // setSelectedCompany(null); // 選択を解除する場合
            // setCardPosition(null);
            // controls.autoRotate = true; // 自動回転を再開
          }
        };
        renderer.domElement.addEventListener("click", onClick);

        const handleResize = () => {
          if (!containerRef.current || !renderer || !camera) return;
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();
        setLoading(false);

        // クリーンアップ関数
        return () => {
          cancelAnimationFrame(animationFrameId);
          renderer.domElement.removeEventListener("click", onClick);
          window.removeEventListener("resize", handleResize);
          controls.dispose();
          // scene内のオブジェクトを解放
          markers.forEach((marker) => {
            if (marker.geometry) marker.geometry.dispose();
            if (marker.material) (marker.material as THREE.Material).dispose(); // 配列の場合はそれぞれdispose
          });
          if (globe.geometry) globe.geometry.dispose();
          if (globe.material) (globe.material as THREE.Material).dispose();
          if (texture) texture.dispose();

          renderer.dispose();
          if (
            containerRef.current &&
            renderer.domElement.parentNode === containerRef.current
          ) {
            containerRef.current.removeChild(renderer.domElement);
          }
          scene.clear(); // シーンの子オブジェクトを全て削除
        };
      } catch (e: any) {
        console.error("Three.js初期化エラー:", e);
        setError(`地球の描画に失敗しました: ${e.message || e}`);
        setLoading(false);
        return () => {}; // エラー時もクリーンアップ関数を返す
      }
    };

    let cleanupThreeJs: (() => void) | undefined;
    initThree().then((cleanup) => {
      cleanupThreeJs = cleanup;
    });

    return () => {
      if (cleanupThreeJs) {
        cleanupThreeJs();
      }
    };
  }, []); // 空の依存配列でマウント時に一度だけ実行

  const handleCloseCard = () => {
    setSelectedCompany(null);
    setCardPosition(null);
    // OrbitControlsのautoRotateを再開する必要がある場合、
    // controlsインスタンスにアクセスする方法を検討する必要がある
    // (例: useEffectの外に保持するか、stateで管理する)
    // 現状では、initThree内のcontrolsに直接アクセスできないため、
    // ここでのautoRotate再開は実装していません。
  };

  return (
    <div className="relative w-full h-[80vh] min-h-[400px] bg-gray-900 flex items-center justify-center">
      <div
        ref={containerRef}
        className="w-full h-full relative"
        style={{
          minHeight: 400,
          cursor: loading ? "wait" : selectedCompany ? "default" : "grab",
        }}
      />
      {loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xl bg-black/70 px-6 py-4 rounded-lg z-[100]">
          地球を準備中...
        </div>
      )}
      {error && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 text-xl bg-black/70 px-6 py-4 rounded-lg z-[100]">
          {error}
        </div>
      )}
      {selectedCompany && cardPosition && (
        <div
          ref={cardRef}
          className="absolute bg-gray-800/90 backdrop-blur-sm text-white p-5 rounded-xl shadow-2xl max-w-sm z-[50] transition-all duration-300 ease-out"
          style={{
            top: `${cardPosition.top}px`,
            left: `${cardPosition.left}px`,
            transform: "translate(-0%, -0%)", // 必要に応じて調整
            // アニメーション用のスタイル（例）
            // opacity: cardPosition ? 1 : 0,
            // transform: cardPosition ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <button
            className="absolute top-2 right-3 text-gray-400 hover:text-white text-3xl font-light"
            onClick={handleCloseCard}
            aria-label="閉じる"
          >
            &times;
          </button>
          <h2 className="text-xl font-semibold mb-2 text-sky-400">
            {selectedCompany.name}
          </h2>
          <p className="mb-4 text-sm text-gray-300">
            {selectedCompany.description}
          </p>
          <a
            href={selectedCompany.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 text-sm"
          >
            決算資料ページへ
          </a>
        </div>
      )}
    </div>
  );
}
