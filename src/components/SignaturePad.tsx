"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// ===========================================================================
// SignaturePad — draw signature with finger, stylus, or mouse
// Works on phone, laptop, iPad. Returns base64 PNG via onChange.
// ===========================================================================

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
  label?: string;
}

export function SignaturePad({ onChange, label = "Sign here" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const hasInk = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Set up canvas for high-DPI screens
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#1f2937"; // desert-night
    ctxRef.current = ctx;
  }, []);

  const getPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const start = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    drawing.current = true;
    lastPoint.current = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
  }, [getPoint]);

  const move = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const point = getPoint(e);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
    if (!hasInk.current) {
      hasInk.current = true;
      setIsEmpty(false);
    }
  }, [getPoint]);

  const end = useCallback(() => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPoint.current = null;
    // Emit the current canvas as PNG
    const canvas = canvasRef.current;
    if (canvas && hasInk.current) {
      onChange(canvas.toDataURL("image/png"));
    }
  }, [onChange]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk.current = false;
    setIsEmpty(true);
    onChange(null);
  }, [onChange]);

  return (
    <div className="space-y-1.5">
      {label && <p className="label">{label}</p>}
      <div className="relative bg-white rounded-xl border-2 border-copper-clay/30 overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          className="block w-full h-32 touch-none cursor-crosshair"
          style={{ touchAction: "none" }}
        />
        {isEmpty && (
          <p className="absolute inset-0 flex items-center justify-center text-smoked-charcoal/30 text-sm pointer-events-none select-none">
            ✍️ Sign with finger, stylus, or mouse
          </p>
        )}
        <button
          type="button"
          onClick={clear}
          className="absolute top-1.5 right-1.5 text-[10px] text-smoked-charcoal/50 hover:text-copper-deep bg-white/80 rounded px-2 py-0.5"
        >
          Clear
        </button>
      </div>
      <p className="text-[10px] text-smoked-charcoal/40">
        Works on phone, laptop, or iPad. Your signature is saved as an image with this agreement.
      </p>
    </div>
  );
}
