/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { motion } from "framer-motion";
import React from "react";

export function ClientLoader() {
  const containerStyle = {
    ["--size" as any]: "64px",
    ["--dot-size" as any]: "6px",
    ["--dot-count" as any]: 6,
    ["--color" as any]: "#fff",
    ["--speed" as any]: "1s",
    ["--spread" as any]: "60deg",
  } as React.CSSProperties;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div style={containerStyle} className="dots">
        <div style={{ ["--i" as any]: 0 } as React.CSSProperties} className="dot" />
        <div style={{ ["--i" as any]: 1 } as React.CSSProperties} className="dot" />
        <div style={{ ["--i" as any]: 2 } as React.CSSProperties} className="dot" />
        <div style={{ ["--i" as any]: 3 } as React.CSSProperties} className="dot" />
        <div style={{ ["--i" as any]: 4 } as React.CSSProperties} className="dot" />
        <div style={{ ["--i" as any]: 5 } as React.CSSProperties} className="dot" />
      </div>
    </motion.div>
  );
}
