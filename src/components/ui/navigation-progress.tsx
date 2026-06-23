"use client";

import { useEffect } from "react";
import nprogress from "nprogress";
import "nprogress/nprogress.css";

// Configure nprogress
nprogress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
  easing: "ease",
  speed: 500,
});

export function NavigationProgress() {
  useEffect(() => {
    // Add custom styles for nprogress
    const style = document.createElement("style");
    style.textContent = `
      #nprogress {
        pointer-events: none;
      }
      #nprogress .bar {
        background: #D4AF37;
        height: 2px;
        position: fixed;
        z-index: 9999;
        top: 0;
        left: 0;
        width: 100%;
      }
      #nprogress .peg {
        display: none;
      }
      @media (prefers-reduced-motion: reduce) {
        #nprogress .bar {
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}
