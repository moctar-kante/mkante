import { ExternalLink } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useRelevantLinks } from "../hooks/useQueries";

export default function RelevantLinks() {
  const { t } = useLanguage();
  const { data: links, isLoading } = useRelevantLinks();

  const headings = {
    en: "Relevant Links",
    fr: "Liens pertinents",
    es: "Enlaces relevantes",
  };
  const subtitles = {
    en: "A curated list of resources and organizations related to my work.",
    fr: "Une sélection de ressources et d'organisations liées à mes travaux.",
    es: "Una selección de recursos y organizaciones relacionados con mi trabajo.",
  };
  const emptyMsg = {
    en: "No links available yet.",
    fr: "Aucun lien disponible pour l'instant.",
    es: "No hay enlaces disponibles todavía.",
  };

  return (
    <section
      className="max-w-3xl mx-auto px-4 py-12"
      data-ocid="relevant-links.section"
    >
      <h1 className="font-serif text-2xl font-normal mb-2 text-foreground">
        {t(headings)}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">{t(subtitles)}</p>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded border border-border bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && (!links || links.length === 0) && (
        <p
          className="text-sm text-muted-foreground"
          data-ocid="relevant-links.empty_state"
        >
          {t(emptyMsg)}
        </p>
      )}

      {!isLoading && links && links.length > 0 && (
        <ul className="space-y-3" data-ocid="relevant-links.list">
          {links.map((link) => (
            <li
              key={String(link.id)}
              className="border border-border rounded-sm p-4 hover:border-primary/40 transition-colors duration-150"
              data-ocid="relevant-links.item"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-4"
                data-ocid="relevant-links.link"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-150">
                    {t(link.title)}
                  </p>
                  {link.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {t(link.description)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-1 truncate">
                    {link.url}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5 transition-colors duration-150" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
