import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ToastViewport } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DestinationsPage } from "@/pages/DestinationsPage";
import { DestinationDetailPage } from "@/pages/DestinationDetailPage";
import { RecommendationsPage } from "@/pages/RecommendationsPage";
import { ItinerariesPage } from "@/pages/ItinerariesPage";
import { ItineraryDetailPage } from "@/pages/ItineraryDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Leaflet + react-leaflet are the single heaviest dependency in the bundle — load the map
// route on demand instead of paying for it on every page.
const MapPage = lazy(() => import("@/pages/MapPage").then((m) => ({ default: m.MapPage })));

function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ToastViewport />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <LandingPage />
                </PageTransition>
              }
            />
            <Route
              path="/login"
              element={
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              }
            />
            <Route
              path="/register"
              element={
                <PageTransition>
                  <RegisterPage />
                </PageTransition>
              }
            />

            <Route element={<ProtectedRoute />}>
              <Route
                path="/destinations"
                element={
                  <PageTransition>
                    <DestinationsPage />
                  </PageTransition>
                }
              />
              <Route
                path="/destinations/:id"
                element={
                  <PageTransition>
                    <DestinationDetailPage />
                  </PageTransition>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <PageTransition>
                    <RecommendationsPage />
                  </PageTransition>
                }
              />
              <Route
                path="/itineraries"
                element={
                  <PageTransition>
                    <ItinerariesPage />
                  </PageTransition>
                }
              />
              <Route
                path="/itineraries/:id"
                element={
                  <PageTransition>
                    <ItineraryDetailPage />
                  </PageTransition>
                }
              />
              <Route
                path="/map"
                element={
                  <PageTransition>
                    <Suspense fallback={<Skeleton className="mx-auto my-10 h-[520px] max-w-6xl" />}>
                      <MapPage />
                    </Suspense>
                  </PageTransition>
                }
              />
            </Route>

            <Route
              path="*"
              element={
                <PageTransition>
                  <NotFoundPage />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
