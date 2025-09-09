"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';


export function Logo() {

  return (
    <motion.div
			className="flex items-center justify-center cursor-pointer hover:brightness-110 transition-all duration-300"
    >
			<Link
			aria-label="Home"
			href="/"
			className="text-lg text-white/40 font-ibmPlexMono hover:text-white/70 pr-2 
			transition-colors"
				>
				VTB
			</Link>
    </motion.div>
  );
}
