import { useMemo } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";

interface ParticleSpec {
  id: number;
  left: number;
  top: number;
  size: number;
  depth: number;
  duration: number;
  delay: number;
  colorClass: string;
}

const COLOR_CLASSES = ["bg-primary/40", "bg-secondary/40", "bg-tertiary/40", "bg-accent/40"];

function makeParticles(count: number): ParticleSpec[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 3 + Math.random() * 7,
    depth: 0.15 + Math.random() * 0.6,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 6,
    colorClass: COLOR_CLASSES[id % COLOR_CLASSES.length],
  }));
}

interface ParticleFieldProps {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  count?: number;
}

/** A field of small particles that idly drift (CSS keyframes) and gently parallax toward/away
 * from the cursor (Framer springs on the same mouse position the caller already tracks). Purely
 * decorative — aria-hidden, and both motions are neutralized under prefers-reduced-motion. */
export function ParticleField({ mouseX, mouseY, count = 26 }: ParticleFieldProps) {
  const particles = useMemo(() => makeParticles(count), [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((spec) => (
        <Particle key={spec.id} spec={spec} mouseX={mouseX} mouseY={mouseY} />
      ))}
    </div>
  );
}

function Particle({
  spec,
  mouseX,
  mouseY,
}: {
  spec: ParticleSpec;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const springX = useSpring(mouseX, { stiffness: 35, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 35, damping: 18 });
  const x = useTransform(springX, (v) => (prefersReducedMotion ? 0 : v * spec.depth * 0.2));
  const y = useTransform(springY, (v) => (prefersReducedMotion ? 0 : v * spec.depth * 0.2));

  return (
    <motion.span
      className={`animate-float-particle absolute rounded-full ${spec.colorClass}`}
      style={{
        left: `${spec.left}%`,
        top: `${spec.top}%`,
        width: spec.size,
        height: spec.size,
        x,
        y,
        animationDuration: `${spec.duration}s`,
        animationDelay: `${spec.delay}s`,
      }}
    />
  );
}
