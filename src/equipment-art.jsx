import React, { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, MoveHorizontal } from "lucide-react";
import "./equipment-art.css";

const homeRadius = () => matchMedia("(max-width: 760px)").matches ? "100%" : "86%";
const SWEEP_START_DEG = -38;
const SWEEP_END_DEG = 52;
const SWEEP_LEG_DURATION_MS = 6000;
const CAMERA_POLAR_DEG = 80;
const homeOrbit = () => `${SWEEP_START_DEG}deg ${CAMERA_POLAR_DEG}deg ${homeRadius()}`;
let viewerReady;
function loadViewer() {
  if (customElements.get("model-viewer")) return Promise.resolve();
  if (!viewerReady) viewerReady = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "/model-viewer-4.3.1.min.js";
    script.onload = () => customElements.whenDefined("model-viewer").then(resolve);
    script.onerror = reject;
    document.head.append(script);
  });
  return viewerReady;
}

export function EquipmentArtwork() {
  const viewer = useRef(null);
  const [status, setStatus] = useState("loading");
  const [moving, setMoving] = useState(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);
  const movingRef = useRef(moving);
  const userCamera = useRef(false);
  const sweepElapsed = useRef(0);
  const previousFrame = useRef(null);
  const resetCamera = () => {
    userCamera.current = false;
    sweepElapsed.current = 0;
    previousFrame.current = null;
    if (viewer.current) viewer.current.cameraOrbit = homeOrbit();
  };

  useEffect(() => {
    movingRef.current = moving;
    previousFrame.current = null;
    if (!viewer.current?.loaded) return;
    moving ? viewer.current.play() : viewer.current.pause();
  }, [moving]);

  useEffect(() => {
    const model = viewer.current;
    let disposed = false;
    let frame;
    const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
    const preferenceChanged = e => setMoving(!e.matches);
    motionPreference.addEventListener("change", preferenceChanged);
    const onLoad = () => {
      if (disposed) return;
      model.cameraOrbit = homeOrbit();
      model.animationName = "All Animations";
      model.currentTime = 18;
      model.timeScale = 1;
      model.dataset.motion = "operating";
      setStatus("ready");
      movingRef.current ? model.play() : model.pause();
      sweepElapsed.current = 0;
      previousFrame.current = null;
      let sampleTime = 0;
      const animate = now => {
        if (disposed) return;
        // Count only active, visible time; manual interaction stops the sweep until reset.
        if (movingRef.current && !userCamera.current && model.modelIsVisible && !document.hidden) {
          if (previousFrame.current !== null) {
            sweepElapsed.current = (sweepElapsed.current + now - previousFrame.current) % (2 * SWEEP_LEG_DURATION_MS);
          }
          previousFrame.current = now;
          const progress = (1 - Math.cos(Math.PI * sweepElapsed.current / SWEEP_LEG_DURATION_MS)) / 2;
          const angle = SWEEP_START_DEG + (SWEEP_END_DEG - SWEEP_START_DEG) * progress;
          model.cameraOrbit = `${angle.toFixed(3)}deg ${CAMERA_POLAR_DEG}deg ${homeRadius()}`;
        } else {
          previousFrame.current = null;
        }
        if (now - sampleTime > 500) {
          model.dataset.animationSeconds = model.currentTime.toFixed(2);
          model.dataset.playing = String(!model.paused);
          model.dataset.camera = model.getCameraOrbit().theta.toFixed(3);
          sampleTime = now;
        }
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    };
    const resetFrameClock = () => { previousFrame.current = null; };
    const onInteraction = () => {
      userCamera.current = true;
      resetFrameClock();
    };
    const onCameraChange = e => {
      if (e.detail?.source === "user-interaction") onInteraction();
    };
    const onError = () => !disposed && setStatus("error");
    model.addEventListener("load", onLoad);
    model.addEventListener("error", onError);
    model.addEventListener("camera-change", onCameraChange);
    model.addEventListener("pointerdown", onInteraction);
    model.addEventListener("wheel", onInteraction, { passive: true });
    model.addEventListener("keydown", onInteraction);
    model.addEventListener("model-visibility", resetFrameClock);
    document.addEventListener("visibilitychange", resetFrameClock);
    loadViewer().catch(onError);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      model.removeEventListener("load", onLoad);
      model.removeEventListener("error", onError);
      model.removeEventListener("camera-change", onCameraChange);
      model.removeEventListener("pointerdown", onInteraction);
      model.removeEventListener("wheel", onInteraction);
      model.removeEventListener("keydown", onInteraction);
      model.removeEventListener("model-visibility", resetFrameClock);
      document.removeEventListener("visibilitychange", resetFrameClock);
      motionPreference.removeEventListener("change", preferenceChanged);
    };
  }, []);

  return (
    <div className={`equipment-visual equipment-${status}`}>
      <model-viewer ref={viewer}
        src="/hemedis-c24-18.glb"
        alt="HEMEDIS MIBMIX C24, მოძრავი ინტერაქტიული 3D ქომფაუნდერი. გადაატრიალეთ მაუსით ან ისრის ღილაკებით."
        camera-controls="" disable-pan="" touch-action="pan-y"
        camera-orbit={homeOrbit()} field-of-view="30deg"
        min-camera-orbit="auto 48deg 58%" max-camera-orbit="auto 100deg 130%"
        min-field-of-view="22deg" max-field-of-view="38deg"
        shadow-intensity="0.8" shadow-softness="1" exposure="1.15"
        environment-image="/hemedis-lighting.hdr" interaction-prompt="none"
        loading="eager" reveal="auto" animation-name="All Animations">
        <div slot="progress-bar" />
      </model-viewer>
      {status === "loading" && <div className="equipment-loading" role="status"><span />3D მოდელი იტვირთება</div>}
      {status === "error" && <div className="equipment-loading" role="alert">3D მოდელის ჩატვირთვა ვერ მოხერხდა.<a href="https://www.hemedis.de/mibmix-c24-18-channel-interaction/" target="_blank" rel="noreferrer">გახსენით HEMEDIS-ის მოდელი</a></div>}
      {status === "ready" && <div className="equipment-controls">
        <span className="equipment-hint"><MoveHorizontal size={17} aria-hidden="true" />გადაატრიალეთ მაუსით</span>
        <div>
          <button type="button" onClick={() => setMoving(v => !v)} aria-label={moving ? "მოძრაობის შეჩერება" : "მოძრაობის ჩართვა"} title={moving ? "მოძრაობის შეჩერება" : "მოძრაობის ჩართვა"}>{moving ? <Pause size={16} /> : <Play size={16} />}</button>
          <button type="button" onClick={resetCamera} aria-label="საწყისი ხედი" title="საწყისი ხედი"><RotateCcw size={16} /></button>
        </div>
      </div>}
    </div>
  );
}
