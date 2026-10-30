import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import Layout from "./components/Layout";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useActor } from "./hooks/useActor";
import { useDarkMode } from "./hooks/useDarkMode";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Education from "./pages/Education";
import Experience from "./pages/Experience";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Publications from "./pages/Publications";
import RelevantLinks from "./pages/RelevantLinks";

function SeedInitializer() {
  const { actor, isFetching } = useActor();
  const seeded = useRef(false);
  useEffect(() => {
    if (actor && !isFetching && !seeded.current) {
      seeded.current = true;
      actor.seedInitialData().catch(() => {});
    }
  }, [actor, isFetching]);
  return null;
}

function ThemeInitializer() {
  useDarkMode();
  return null;
}

const rootRoute = createRootRoute({
  component: () => (
    <LanguageProvider>
      <ThemeInitializer />
      <SeedInitializer />
      <Outlet />
      <Toaster />
    </LanguageProvider>
  ),
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: Home,
});

const aboutRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/about",
  component: About,
});

const experienceRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/experience",
  component: Experience,
});

const educationRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/education",
  component: Education,
});

const publicationsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/publications",
  component: Publications,
});

const projectsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/projects",
  component: Projects,
});

const relevantLinksRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/relevant-links",
  component: RelevantLinks,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: Admin,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    homeRoute,
    aboutRoute,
    experienceRoute,
    educationRoute,
    publicationsRoute,
    projectsRoute,
    relevantLinksRoute,
  ]),
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
