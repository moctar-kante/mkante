import { Badge } from "@/components/ui/badge";
import MarkdownText from "../components/MarkdownText";
import { useLanguage } from "../contexts/LanguageContext";
import { useExperiences } from "../hooks/useQueries";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    // Handle both "YYYY-MM" and legacy "YYYY-MM-DD" formats
    const parts = dateStr.split("-");
    const year = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10) - 1; // 0-indexed
    if (Number.isNaN(year) || Number.isNaN(month)) return dateStr;
    const d = new Date(year, month, 1);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function Experience() {
  const { data: experiences, isLoading } = useExperiences();
  const { lang, t } = useLanguage();

  const labels = {
    title: { en: "Experience", fr: "Expérience", es: "Experiencia" },
    present: { en: "Present", fr: "Présent", es: "Presente" },
  };

  if (isLoading) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 py-20 text-center text-muted-foreground"
        data-ocid="experience.loading_state"
      >
        Loading…
      </div>
    );
  }

  return (
    <div
      className="max-w-3xl mx-auto px-4 py-12"
      data-ocid="experience.section"
    >
      <h1 className="font-serif text-3xl font-normal text-foreground mb-10">
        {labels.title[lang]}
      </h1>

      {(!experiences || experiences.length === 0) && (
        <p
          className="text-muted-foreground text-sm"
          data-ocid="experience.empty_state"
        >
          No experience entries yet.
        </p>
      )}

      <div className="space-y-10">
        {experiences?.map((exp, i) => (
          <article
            key={String(exp.id)}
            className="flex gap-6"
            data-ocid={`experience.item.${i + 1}`}
          >
            {/* Timeline line */}
            <div className="flex flex-col items-center pt-1">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              {i < experiences.length - 1 && (
                <div className="w-px flex-1 bg-border mt-2" />
              )}
            </div>

            <div className="flex-1 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                <h2 className="font-serif text-lg font-normal text-foreground">
                  {t(exp.title)}
                </h2>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDate(exp.startDate)} —{" "}
                  {exp.endDate ? formatDate(exp.endDate) : labels.present[lang]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {exp.organization}
                {exp.location ? ` · ${exp.location}` : ""}
              </p>
              {t(exp.description) && (
                <MarkdownText
                  content={t(exp.description)}
                  className="text-sm mb-3"
                />
              )}
              {exp.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {exp.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
