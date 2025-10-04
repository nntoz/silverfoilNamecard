"use client";

import { useEffect, useRef } from "react";
import { MVGL } from "../functions/mvgl/mvgl";

export default function MV() {
  const glRef = useRef(null);

  useEffect(() => {
    if (!glRef.current) return;

    const mvgl = new MVGL(glRef.current);

    return () => {
      mvgl.destroy();
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <canvas
        ref={glRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
