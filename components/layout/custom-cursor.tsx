"use client";

import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";

type CursorMode = "default" | "interactive" | "scroll";

export function CustomCursor() {
  const reducedMotion = usePrefersReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const pointerRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");

  useEffect(() => {
    if (reducedMotion) {
      setEnabled(false);
      return;
    }

    const isDesktopPointer = window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 1024;
    setEnabled(isDesktopPointer);
  }, [reducedMotion]);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove("custom-cursor-enabled");
      return;
    }

    document.body.classList.add("custom-cursor-enabled");

    const isInteractive = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest(
          "a,button,[role='button'],input,textarea,select,label,summary,[data-cursor='interactive']"
        )
      );
    };

    const resolveMode = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof Element)) return "default";
      const match = target.closest("[data-cursor='scroll']");
      if (match) return "scroll";
      if (isInteractive(target)) return "interactive";
      return "default";
    };

    const onMove = (event: MouseEvent) => {
      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;
      setVisible(true);
      setMode(resolveMode(event.target));
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onOver = (event: MouseEvent) => setMode(resolveMode(event.target));
    const onLeave = () => setVisible(false);

    const animate = () => {
      const lag = 0.14;
      ringPosRef.current.x += (pointerRef.current.x - ringPosRef.current.x) * lag;
      ringPosRef.current.y += (pointerRef.current.y - ringPosRef.current.y) * lag;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pointerRef.current.x}px, ${pointerRef.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      document.body.classList.remove("custom-cursor-enabled");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="custom-cursor-dot"
        data-visible={visible}
      />
      <div
        ref={ringRef}
        aria-hidden
        className="custom-cursor-ring"
        data-visible={visible}
        data-mode={mode}
        data-pressed={pressed}
      />
    </>
  );
}
