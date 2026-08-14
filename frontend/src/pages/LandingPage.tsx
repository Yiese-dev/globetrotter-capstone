import { Link } from "react-router-dom";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { MouseEvent } from "react";
import { ArrowRight, Compass, ListChecks, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ParticleField } from "@/components/ui/ParticleField";
import { resolveAssetUrl } from "@/services/api/resolveAssetUrl";

const features = [
  {
    icon: Compass,
    title: "Discover destinations",
    description: "Browse real places to visit, complete with photos, categories, and details.",
  },
  {
    icon: Sparkles,
    title: "Get personalized picks",
    description: "Recommendations scored against your own travel preferences — no guesswork.",
  },
  {
    icon: ListChecks,
    title: "Plan your itinerary",
    description: "Build multi-stop trips and keep every plan organized in one place.",
  },
  {
    icon: MapPin,
    title: "Navigate with confidence",
    description: "See your route on an interactive map with turn-by-turn directions.",
  },
];

function FloatingShapes({
  mouseX,
  mouseY,
}: {
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const shapeX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const shapeY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const shape2X = useTransform(shapeX, (v) => (prefersReducedMotion ? 0 : v * -0.6));
  const shape2Y = useTransform(shapeY, (v) => (prefersReducedMotion ? 0 : v * -0.6));

  return (
    <>
      <motion.div
        style={{ x: prefersReducedMotion ? 0 : shapeX, y: prefersReducedMotion ? 0 : shapeY }}
        className="pointer-events-none absolute -left-10 top-16 h-40 w-40 rounded-full bg-secondary/20 blur-2xl"
      />
      <motion.div
        style={{ x: shape2X, y: shape2Y }}
        className="pointer-events-none absolute right-0 top-1/3 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
      />
      <motion.div
        style={{ x: shapeX, y: shape2Y }}
        className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-accent/20 blur-2xl"
      />
    </>
  );
}

export function LandingPage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - bounds.left - bounds.width / 2);
    mouseY.set(event.clientY - bounds.top - bounds.height / 2);
  }

  return (
    <div>
      <section
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-surface to-tertiary/10"
      >
        <FloatingShapes mouseX={mouseX} mouseY={mouseY} />
        <ParticleField mouseX={mouseX} mouseY={mouseY} />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles size={14} /> Your journey, personalized
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
              Plan trips that feel like <span className="text-primary">yours</span>.
            </h1>
            <p className="mt-4 max-w-md text-base text-muted">
              PenielGo helps you discover real destinations, get recommendations tailored to your
              taste, and turn them into itineraries you can actually follow — with a live map to
              guide the way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg">
                  Start exploring <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="ghost">
                  I have an account
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <img
                src={resolveAssetUrl("/static/destinations/basilica.png")}
                alt="Basilique Marie-Reine-des-Apôtres"
                className="h-48 w-full rounded-2xl object-cover shadow-lg"
              />
              <img
                src={resolveAssetUrl("/static/destinations/hotel_mont_febe.jpg")}
                alt="Hôtel Mont Fébé"
                className="mt-8 h-48 w-full rounded-2xl object-cover shadow-lg"
              />
              <img
                src={resolveAssetUrl("/static/destinations/mont_zokye.jpg")}
                alt="Mont Zokye"
                className="h-40 w-full rounded-2xl object-cover shadow-lg"
              />
              <img
                src={resolveAssetUrl("/static/destinations/the_fifty_five.png")}
                alt="The Fifty-Five"
                className="mt-4 h-40 w-full rounded-2xl object-cover shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <motion.div key={title} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="h-full p-6">
                <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Icon size={22} />
                </div>
                <h3 className="mb-1 font-display text-base font-semibold text-ink">{title}</h3>
                <p className="text-sm text-muted">{description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
