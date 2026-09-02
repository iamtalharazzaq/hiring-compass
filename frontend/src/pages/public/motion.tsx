import React, { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeUp({ children, delay = 0, className = "" }: FadeUpProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? undefined : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  margin?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  className = "",
  margin = "-20px",
}: ScrollRevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? undefined : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: margin as any }}
      transition={{ duration: 0.75, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerGroup({
  children,
  className = "",
  staggerDelay = 0.08,
}: StaggerGroupProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? undefined : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduced ? {} : { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: "easeOut" },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function FloatIdle({
  children,
  className = "",
  amplitude = 6,
  duration = 4,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
