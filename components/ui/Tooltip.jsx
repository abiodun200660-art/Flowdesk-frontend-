'use client'

import { useState, useRef, useEffect } from "react";

export default function Tooltip({
  children,
  content,
  position = "top",
  delay = 300,
  disabled = false,
  maxWidth = 220,
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef();
  const timerRef = useRef();

  function show() {
    if (disabled || !content) return;
    timerRef.current = setTimeout(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const gap = 8;
      let top, left;
      if (position === "top") {
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
      } else if (position === "bottom") {
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
      } else if (position === "left") {
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
      } else {
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
      }
      setCoords({ top, left });
      setVisible(true);
    }, delay);
  }

  function hide() {
    clearTimeout(timerRef.current);
    setVisible(false);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const transformMap = {
    top:    "translate(-50%, -100%)",
    bottom: "translate(-50%, 0)",
    left:   "translate(-100%, -50%)",
    right:  "translate(0, -50%)",
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        style={{ display: "inline-flex" }}
      >
        {children}
      </span>

      {visible && (
        <div
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            transform: transformMap[position] || transformMap.top,
            background: "#1e1e2e",
            color: "#c9d1d9",
            fontSize: 12,
            fontFamily: "'IBM Plex Sans', sans-serif",
            padding: "5px 10px",
            borderRadius: 7,
            border: "1px solid #2d2d3f",
            boxShadow: "0 6px 20px rgba(0,0,0,0.45)",
            zIndex: 9999,
            maxWidth,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            pointerEvents: "none",
            animation: "tooltipIn 0.15s ease both",
          }}
        >
          {content}
        </div>
      )}
      <style>{@keyframes tooltipIn { from { opacity:0; transform: ${transformMap[position]} scale(0.92); } to { opacity:1; transform: ${transformMap[position]} scale(1); } }}</style>
    </>
  );
}
