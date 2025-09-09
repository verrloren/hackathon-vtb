"use client";

import { motion } from "framer-motion";

export function AuthSphere() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8, delay: 0, ease: "easeIn" }}
      className="h-full w-full absolute top-0 left-0 z-0 overflow-hidden"
    >
      <div
        className="noise w-full xl:w-[100vh] aspect-square z-10 absolute 
				top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
				radial-ellipse  overflow-hidden"
      ></div>
      <div
        className="noise w-[30vw] xl:w-[20vw] aspect-square z-10 absolute 
				top-1/4 left-[10%] md:left-[20%] xl:left-1/4 transform -translate-x-1/2 -translate-y-1/2
				radial-ellipse  overflow-hidden"
      ></div>
    </motion.div>
  );
}
