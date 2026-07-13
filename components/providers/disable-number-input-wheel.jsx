"use client";

import { useEffect } from "react";

export function DisableNumberInputWheel() {
  useEffect(() => {
    const onWheel = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement &&
        target.type === "number" &&
        document.activeElement === target
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener("wheel", onWheel, { passive: false });
    return () => document.removeEventListener("wheel", onWheel);
  }, []);

  return null;
}
