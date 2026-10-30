import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { usePublications } from "../hooks/useQueries";

type PreprintEntry = {
  title: { en: string; fr: string; es: string };
  authors: string;
  venue: string;
  year: number;
  doi: string | null;
  url: string | null;
  status: { en: string; fr: string; es: string };
};

const PREPRINTS: PreprintEntry[] = [
  {
    title: {
      en: "Prediction of late blight severity in a large panel of potato genotypes using low-altitude aerial images and machine learning methods",
      fr: "Prédiction de la sévérité du mildiou dans un grand panel de génotypes de pomme de terre à l'aide d'images aériennes à basse altitude et de méthodes d'apprentissage automatique",
      es: "Predicción de la severidad del tizón tardío en un gran panel de genotipos de papa utilizando imágenes aéreas de baja altitud y métodos de aprendizaje automático",
    },
    authors:
      "Hildo Loayza, Johan Ninanya, Susan Palacios, Luis Silva, Fernando Pujaico Rivera, Javier Rinza, Manuel Gastelo, Mariela Aponte, Jan F. Kreuze, Hannele Lindqvist-Kreuze, Bettina Heider, Moctar Kante, David A. Ramírez",
    venue: "bioRxiv",
    year: 2026,
    doi: "10.64898/2026.04.06.716456",
    url: "https://doi.org/10.64898/2026.04.06.716456",
    status: {
      en: "Submitted to PLoS ONE",
      fr: "Soumis à PLoS ONE",
      es: "Enviado a PLoS ONE",
    },
  },
  {
    title: {
      en: "Development and Characterization of Microhaplotype Databases for Diverse Crop Species",
      fr: "Développement et caractérisation de bases de données de microhaplotypes pour diverses espèces cultivées",
      es: "Desarrollo y caracterización de bases de datos de microhaplotipos para diversas especies de cultivo",
    },
    authors: "Moctar Kante et al.",
    venue: "Theoretical and Applied Genetics",
    year: 2026,
    doi: null,
    url: null,
    status: {
      en: "Under Review at TAG",
      fr: "En révision à TAG",
      es: "En revisión en TAG",
    },
  },
];

export default function Publications() {
  const { data: publications, isLoading } = usePublications();
  const { lang } = useLanguage();

  const labels = {
    title: { en: "Publications", fr: "Publications", es: "Publicaciones" },
    all: {
      en: "All Publications",
      fr: "Toutes les Publications",
      es: "Todas las Publicaciones",
    },
    preprints: {
      en: "Preprints",
      fr: "Prépublications",
      es: "Preprints",
    },
  };

  if (isLoading) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 py-20 text-center text-muted-foreground"
        data-ocid="publications.loading_state"
      >
        Loading…
      </div>
    );
  }

  const allPubs = publications ?? [];

  return (
    <div
      className="max-w-3xl mx-auto px-4 py-12"
      data-ocid="publications.section"
    >
      <h1 className="font-serif text-3xl font-normal text-foreground mb-10">
        {labels.title[lang]}
      </h1>

      {/* All Publications */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
          {labels.all[lang]}
        </h2>

        {allPubs.length === 0 && (
          <p
            className="text-muted-foreground text-sm"
            data-ocid="publications.empty_state"
          >
            No publications yet.
          </p>
        )}

        <div className="space-y-6">
          {allPubs.map((pub, i) => (
            <article
              key={String(pub.id)}
              className="flex gap-4 items-start"
              data-ocid={`publications.item.${i + 1}`}
            >
              <div className="mt-1.5 flex-shrink-0 w-4 flex justify-center">
                {pub.featured ? (
                  <Star
                    className="h-3.5 w-3.5 text-primary fill-primary"
                    aria-label="Featured"
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full border border-border mt-0.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm leading-snug mb-0.5">
                  {pub.title}
                </p>
                <p className="text-xs text-muted-foreground">{pub.authors}</p>
                <p className="text-xs text-muted-foreground">
                  {pub.venue} · {Number(pub.year)}
                </p>
                {pub.doi && (
                  <a
                    href={`https://doi.org/${pub.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-0.5 inline-block"
                    data-ocid="publications.link"
                  >
                    {pub.doi}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Preprints */}
      <section data-ocid="publications.preprints_section">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
          {labels.preprints[lang]}
        </h2>
        <div className="space-y-6">
          {PREPRINTS.map((preprint, i) => (
            <article
              key={preprint.doi ?? preprint.title.en}
              className="flex gap-4 items-start"
              data-ocid={`publications.preprint.${i + 1}`}
            >
              <div className="mt-1.5 flex-shrink-0 w-4 flex justify-center">
                <div className="w-2 h-2 rounded-full border border-primary/60 mt-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-0.5">
                  {preprint.url ? (
                    <a
                      href={preprint.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground text-sm leading-snug hover:text-primary hover:underline transition-colors"
                      data-ocid="publications.link"
                    >
                      {preprint.title[lang]}
                    </a>
                  ) : (
                    <p className="font-medium text-foreground text-sm leading-snug">
                      {preprint.title[lang]}
                    </p>
                  )}
                  <Badge
                    variant="outline"
                    className="text-[10px] shrink-0 border-blue-500/40 text-blue-600 dark:text-blue-400"
                  >
                    {preprint.status[lang]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {preprint.authors}
                </p>
                <p className="text-xs text-muted-foreground">
                  {preprint.venue} · {preprint.year}
                </p>
                {preprint.doi && (
                  <a
                    href={`https://doi.org/${preprint.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-0.5 inline-block"
                    data-ocid="publications.link"
                  >
                    {preprint.doi}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
