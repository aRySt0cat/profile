"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { Group, Material, Mesh, WebGLRenderer } from "three";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function PaperSculpture({
  time,
  still,
  surface,
  count,
}: {
  time: RefObject<number>;
  still: boolean;
  surface: RefObject<HTMLDivElement | null>;
  count: number;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    const paperSurface = surface.current;
    if (!element || !paperSurface || still) return;
    let disposed = false;
    let frame = 0;
    let renderer: WebGLRenderer | undefined;
    let model: Group | undefined;
    let observer: ResizeObserver | undefined;
    let contextLost = false;
    let schedule = () => {};
    const cleanups: (() => void)[] = [];
    element.dataset.ready = "false";
    const disposeModel = (group: Group) => {
      const materials = new Set<Material>();
      group.traverse((child) => {
        const mesh = child as Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        (Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]
        ).forEach((material) => materials.add(material));
      });
      materials.forEach((material) => material.dispose());
    };
    const unavailable = () => {
      if (disposed) return;
      element.dataset.ready = "false";
      window.dispatchEvent(new Event("profile-book-unavailable"));
    };

    async function initialize() {
      const [THREE, { GLTFLoader }] = await Promise.all([
        import("three"),
        import("three/addons/loaders/GLTFLoader.js"),
      ]);
      if (disposed) return;
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-5, 5, 3.5, -3.5, 0.1, 100);
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setClearColor(0xf8f9f7, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.04;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.className = "sculpture-canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      element!.appendChild(renderer.domElement);
      scene.add(new THREE.HemisphereLight(0xffffff, 0xc2c7bc, 2));
      const key = new THREE.DirectionalLight(0xffffff, 2.8);
      key.position.set(-3, 9, 2);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      Object.assign(key.shadow.camera, {
        left: -6,
        right: 6,
        top: 5,
        bottom: -5,
        near: 0.5,
        far: 25,
      });
      key.shadow.bias = -0.0001;
      key.shadow.normalBias = 0.008;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.6);
      fill.position.set(4, 4, -4);
      scene.add(fill);
      const gltf = await new GLTFLoader().loadAsync(
        `${basePath}/assets/sculpture/open-book.glb`,
      );
      if (disposed) {
        disposeModel(gltf.scene);
        return;
      }
      model = gltf.scene;
      scene.add(model);
      model.traverse((child) => {
        const mesh = child as Mesh;
        if (mesh.isMesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
      const turning = model.getObjectByName("TurningLeaf");
      if (turning) turning.visible = false;
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.ShadowMaterial({ opacity: 0.12 }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.55;
      floor.receiveShadow = true;
      scene.add(floor);
      cleanups.push(() => {
        floor.geometry.dispose();
        floor.material.dispose();
      });
      let width = 0;
      let height = 0;
      let leafWidth = 1;
      let leafHeight = 1;
      let compact = false;
      const pivot = new THREE.Vector3(0, 0.231, 0);
      const zAxis = new THREE.Vector3(0, 0, 1);
      const project = (x: number, z: number, angle = 0) => {
        const point = new THREE.Vector3(x, 0.239, z);
        if (angle) point.sub(pivot).applyAxisAngle(zAxis, angle).add(pivot);
        point.applyMatrix4(model!.matrixWorld).project(camera);
        return {
          x: ((point.x + 1) * width) / 2,
          y: ((1 - point.y) * height) / 2,
        };
      };
      const projection = (left: number, right: number, angle = 0) => {
        const a = project(left, -2.36, angle);
        const b = project(right, -2.36, angle);
        const c = project(left, 2.36, angle);
        return `matrix(${(b.x - a.x) / leafWidth},${(b.y - a.y) / leafWidth},${(c.x - a.x) / leafHeight},${(c.y - a.y) / leafHeight},${a.x},${a.y})`;
      };
      const draw = () => {
        frame = 0;
        if (
          disposed ||
          contextLost ||
          document.hidden ||
          !renderer ||
          !model ||
          !width ||
          !height
        )
          return;
        const t = Math.max(0, Math.min(count - 1, time.current));
        const integer = Math.floor(t);
        const fraction = t - integer;
        const phase = THREE.MathUtils.smoothstep(fraction, 0.22, 0.78);
        const angle = phase * Math.PI;
        model.rotation.y = Math.sin(t * 0.6) * 0.016;
        model.rotation.z = Math.sin(t * Math.PI * 2) * 0.012;
        model.updateMatrixWorld(true);
        if (turning) {
          turning.visible = phase > 0.002 && phase < 0.998;
          turning.rotation.z = angle;
        }
        paperSurface!.style.setProperty(
          "--left-projection",
          projection(-3.35, -0.4),
        );
        paperSurface!.style.setProperty(
          "--right-projection",
          projection(0.4, 3.35),
        );
        paperSurface!
          .querySelectorAll<HTMLElement>(".book-spread")
          .forEach((spread) => {
            const index = Number(spread.dataset.spread);
            if (Math.abs(t - index) > 0.65) return;
            if (compact) return;
            const left = spread.querySelector<HTMLElement>(".page-left");
            const right = spread.querySelector<HTMLElement>(".page-right");
            // The outgoing right-hand text and incoming left-hand text share the
            // turning leaf's projection. DOM text remains selectable and readable.
            const leftAngle =
              index === integer + 1 ? Math.min(0, angle - Math.PI) : 0;
            const rightAngle =
              index === integer ? Math.min(Math.PI / 2, angle) : 0;
            if (left)
              left.style.transform = projection(
                -3.35,
                -0.4,
                Math.max(-Math.PI / 2, leftAngle),
              );
            if (right)
              right.style.transform = projection(0.4, 3.35, rightAngle);
          });
        renderer.render(scene, camera);
        element!.dataset.ready = "true";
      };
      schedule = () => {
        if (!frame && !document.hidden)
          frame = window.requestAnimationFrame(draw);
      };
      const resize = () => {
        const rect = element!.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        if (!width || !height || !renderer || !model) return;
        compact = width <= 850;
        const aspect = width / height;
        model.scale.x = compact ? 1 : 1.18;
        const viewHeight = compact
          ? Math.max(5.5, 3.95 / aspect)
          : Math.max(5.95, 10.15 / aspect);
        camera.left = (-viewHeight * aspect) / 2;
        camera.right = (viewHeight * aspect) / 2;
        camera.top = viewHeight / 2;
        camera.bottom = -viewHeight / 2;
        const center = compact ? 1.86 : 0;
        camera.position.set(center, 14, compact ? 0.6 : 1.4);
        camera.lookAt(center, 0, 0);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        model.updateMatrixWorld(true);
        renderer.setSize(width, height);
        const a = project(0.4, -2.36);
        const b = project(3.35, -2.36);
        const c = project(0.4, 2.36);
        // Size the HTML surface in projected pixels so 18px type stays 18px;
        // resizing the book never silently scales its typography down.
        leafWidth = Math.hypot(b.x - a.x, b.y - a.y);
        leafHeight = Math.hypot(c.x - a.x, c.y - a.y);
        paperSurface!.style.setProperty("--leaf-width", `${leafWidth}px`);
        paperSurface!.style.setProperty("--leaf-height", `${leafHeight}px`);
        schedule();
      };
      observer = new ResizeObserver(resize);
      observer.observe(element!);
      const lost = (event: Event) => {
        event.preventDefault();
        contextLost = true;
        window.cancelAnimationFrame(frame);
        frame = 0;
        unavailable();
      };
      renderer.domElement.addEventListener("webglcontextlost", lost);
      cleanups.push(() =>
        renderer?.domElement.removeEventListener("webglcontextlost", lost),
      );
      window.addEventListener("profile-time-update", schedule);
      document.addEventListener("visibilitychange", schedule);
      resize();
    }
    initialize().catch(unavailable);
    return () => {
      disposed = true;
      element.dataset.ready = "false";
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("profile-time-update", schedule);
      document.removeEventListener("visibilitychange", schedule);
      cleanups.forEach((cleanup) => cleanup());
      if (model) disposeModel(model);
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [time, still, surface, count]);

  return (
    <div className="sculpture" ref={host} aria-hidden="true">
      <img
        className="sculpture-fallback"
        src={`${basePath}/assets/sculpture/open-book-preview.png`}
        alt=""
        width="1400"
        height="1000"
        fetchPriority="high"
      />
    </div>
  );
}
