import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Download, Globe, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Lang, useLanguage } from "../contexts/LanguageContext";
import { useDarkMode } from "../hooks/useDarkMode";
import { useProfile } from "../hooks/useQueries";

const navLinks = [
  { path: "/", labelEn: "Home", labelFr: "Accueil", labelEs: "Inicio" },
  {
    path: "/about",
    labelEn: "About",
    labelFr: "À propos",
    labelEs: "Sobre mí",
  },
  {
    path: "/experience",
    labelEn: "Experience",
    labelFr: "Expérience",
    labelEs: "Experiencia",
  },
  {
    path: "/education",
    labelEn: "Education",
    labelFr: "Formation",
    labelEs: "Formación",
  },
  {
    path: "/publications",
    labelEn: "Publications",
    labelFr: "Publications",
    labelEs: "Publicaciones",
  },
  {
    path: "/projects",
    labelEn: "Projects",
    labelFr: "Projets",
    labelEs: "Proyectos",
  },
  {
    path: "/relevant-links",
    labelEn: "Relevant Links",
    labelFr: "Liens pertinents",
    labelEs: "Enlaces relevantes",
  },
];

const langOptions: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

function LangDropdown({ onSelect }: { onSelect?: () => void }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function select(code: Lang) {
    setLang(code);
    setOpen(false);
    onSelect?.();
  }

  const current = langOptions.find((o) => o.code === lang);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 rounded-sm"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
        data-ocid="nav.toggle"
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-medium uppercase">{current?.code}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Language options"
          className="absolute right-0 top-full mt-1 z-50 min-w-[130px] rounded-sm border border-border bg-background shadow-md py-1"
        >
          {langOptions.map((opt) => (
            <button
              key={opt.code}
              type="button"
              role="menuitemradio"
              aria-checked={lang === opt.code}
              onClick={() => select(opt.code)}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-150 flex items-center justify-between ${
                lang === opt.code
                  ? "text-primary font-medium bg-muted"
                  : "text-foreground hover:bg-muted"
              }`}
              data-ocid="nav.toggle"
            >
              <span>{opt.label}</span>
              {lang === opt.code && (
                <span className="text-xs text-primary font-semibold uppercase">
                  {opt.code}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { lang } = useLanguage();
  const { data: profile } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { isDark, toggle } = useDarkMode();

  function getLabel(link: (typeof navLinks)[0]) {
    if (lang === "fr") return link.labelFr;
    if (lang === "es") return link.labelEs;
    return link.labelEn;
  }

  function isActive(path: string) {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo / name */}
        <Link
          to="/"
          className="font-serif text-foreground text-base font-normal tracking-tight hover:text-primary transition-colors duration-150"
          data-ocid="nav.link"
        >
          {profile?.fullName ?? "Moctar Kante"}
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1.5 text-sm transition-colors duration-150 rounded-sm ${
                isActive(link.path)
                  ? "text-primary border-b-2 border-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="nav.link"
            >
              {getLabel(link)}
            </Link>
          ))}

          {/* Language dropdown */}
          <div className="ml-2">
            <LangDropdown />
          </div>

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggle}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-150 rounded-sm"
            aria-label="Toggle dark mode"
            data-ocid="nav.toggle"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {profile?.cvDownloadUrl && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="ml-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-150"
            >
              <a
                href={profile.cvDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="nav.primary_button"
              >
                <Download className="h-3 w-3 mr-1.5" />
                CV
              </a>
            </Button>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors duration-150"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          data-ocid="nav.toggle"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          <nav className="flex flex-col gap-1 mt-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 text-sm rounded-sm transition-colors duration-150 ${
                  isActive(link.path)
                    ? "text-primary font-medium bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                data-ocid="nav.link"
              >
                {getLabel(link)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 mt-4">
            {/* Language dropdown (mobile) */}
            <LangDropdown onSelect={() => setMobileOpen(false)} />

            {/* Dark mode toggle (mobile) */}
            <button
              type="button"
              onClick={toggle}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-150 rounded-sm"
              aria-label="Toggle dark mode"
              data-ocid="nav.toggle"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {profile?.cvDownloadUrl && (
              <a
                href={profile.cvDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
                data-ocid="nav.primary_button"
              >
                <Download className="h-3 w-3" /> CV
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
