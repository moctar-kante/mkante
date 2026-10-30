import { useLanguage } from "../contexts/LanguageContext";
import { useEducation } from "../hooks/useQueries";

export default function Education() {
  const { data: education, isLoading } = useEducation();
  const { lang, t } = useLanguage();

  const labels = {
    title: { en: "Education", fr: "Formation", es: "Formación" },
    thesis: { en: "Hosted at", fr: "Hébergé à", es: "Alojado en" },
  };

  if (isLoading) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 py-20 text-center text-muted-foreground"
        data-ocid="education.loading_state"
      >
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12" data-ocid="education.section">
      <h1 className="font-serif text-3xl font-normal text-foreground mb-10">
        {labels.title[lang]}
      </h1>

      {(!education || education.length === 0) && (
        <p
          className="text-muted-foreground text-sm"
          data-ocid="education.empty_state"
        >
          No education entries yet.
        </p>
      )}

      <div className="space-y-8">
        {education?.map((edu, i) => (
          <article
            key={String(edu.id)}
            className="border-l-2 border-primary pl-5"
            data-ocid={`education.item.${i + 1}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
              <h2 className="font-serif text-lg font-normal text-foreground">
                {t(edu.degree)}
              </h2>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {Number(edu.startYear)}–{Number(edu.endYear)}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground mb-0.5">
              {edu.institution}
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              {t(edu.field)}
              {edu.location ? ` · ${edu.location}` : ""}
            </p>
            {edu.thesisHost && (
              <p className="text-xs text-muted-foreground">
                {labels.thesis[lang]}: {edu.thesisHost}
              </p>
            )}
            {t(edu.notes) && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {t(edu.notes)}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
