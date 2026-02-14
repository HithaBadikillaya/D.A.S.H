"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import FeatureCards from "../components/FeatureCards";
import Footer from "../components/Footer";

function HeroSection() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse tracking
  const springConfig = { damping: 25, stiffness: 150 };
  const dx = useSpring(mouseX, springConfig);
  const dy = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Dynamic Glow Layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-30"
        style={{
          background: useTransform(
            [dx, dy],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(var(--primary-rgb), 0.15), transparent)`
          ),
        }}
      />

      <div className="relative z-10 text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Interactive SVG Title */}
          <svg className="w-full max-w-4xl px-6 select-none" viewBox="0 0 800 200">
            <defs>
              <mask id="textMask">
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="font-amarna font-bold text-[180px] fill-white">
                  D.A.S.H
                </text>
              </mask>
            </defs>

            {/* Base Text */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="font-amarna font-bold text-[180px] fill-transparent stroke-muted/20 stroke-[1px]">
              D.A.S.H
            </text>

            {/* Gradient Reveal */}
            <motion.rect
              mask="url(#textMask)"
              width="100%"
              height="100%"
              className="fill-primary"
              style={{
                x: useTransform(dx, [0, 2000], [-100, 100]),
              }}
            />
          </svg>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-2xl font-indie text-secondary tracking-widest"
        >
          &gt; Document And Social Hub
        </motion.h3>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]"
      >
        Scroll to initialize
      </motion.div>
    </section>
  );
}

import TemplateUsageGuide from "../components/TemplateUsageGuide";

export default function Home() {
  return (
    <main className="w-full bg-background min-h-screen">
      <HeroSection />
      <FeatureCards />
      <TemplateUsageGuide />
      <Footer />
    </main>
  );
}