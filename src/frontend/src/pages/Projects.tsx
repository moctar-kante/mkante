import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useOngoingProjects } from "../hooks/useQueries";
import { ObjectiveStatus } from "../types";
import type { OngoingProject } from "../types";

const statusConfig: Record<
  ObjectiveStatus,
  { label: Record<"en" | "fr" | "es", string>; className: string }
> = {
  [ObjectiveStatus.NotStarted]: {
    label: { en: "Not Started", fr: "Non démarré", es: "No iniciado" },
    className: "border-border text-muted-foreground",
  },
  [ObjectiveStatus.InProgress]: {
    label: { en: "In Progress", fr: "En cours", es: "En progreso" },
    className: "border-amber-400 text-amber-600 dark:text-amber-400",
  },
  [ObjectiveStatus.Completed]: {
    label: { en: "Completed", fr: "Terminé", es: "Completado" },
    className: "border-primary text-primary",
  },
};

function StatusBadge({
  status,
  lang,
}: {
  status: ObjectiveStatus;
  lang: "en" | "fr" | "es";
}) {
  const cfg = statusConfig[status];
  return (
    <Badge variant="outline" className={`text-[10px] ${cfg.className}`}>
      {cfg.label[lang]}
    </Badge>
  );
}

function ProjectDetailModal({
  project,
  open,
  onClose,
}: {
  project: OngoingProject;
  open: boolean;
  onClose: () => void;
}) {
  const { lang, t } = useLanguage();
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const sectionLabels = {
    funding: {
      en: "Funding Source",
      fr: "Source de financement",
      es: "Fuente de financiamiento",
    },
    objectives: { en: "Objectives", fr: "Objectifs", es: "Objetivos" },
    workplan: { en: "Workplan", fr: "Plan de travail", es: "Plan de trabajo" },
    status: {
      en: "Objective Status",
      fr: "Statut des objectifs",
      es: "Estado de objetivos",
    },
    gallery: { en: "Gallery", fr: "Galerie", es: "Galería" },
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-normal">
              {t(project.title)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Funding Source */}
            {t(project.fundingSource) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  {sectionLabels.funding[lang]}
                </p>
                <p className="text-sm text-foreground">
                  {t(project.fundingSource)}
                </p>
              </div>
            )}

            {/* Objectives */}
            {t(project.objectives) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  {sectionLabels.objectives[lang]}
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {t(project.objectives)}
                </p>
              </div>
            )}

            {/* Workplan */}
            {t(project.workplan) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  {sectionLabels.workplan[lang]}
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {t(project.workplan)}
                </p>
              </div>
            )}

            {/* Objective Statuses */}
            {project.objectiveStatuses.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  {sectionLabels.status[lang]}
                </p>
                <div className="space-y-2">
                  {project.objectiveStatuses.map((os, i) => (
                    <div
                      key={os.objective}
                      className="flex items-start gap-3"
                      data-ocid={`projects.status.${i + 1}`}
                    >
                      <StatusBadge status={os.status} lang={lang} />
                      <span className="text-sm text-foreground leading-snug">
                        {os.objective}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {project.gallery.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  {sectionLabels.gallery[lang]}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {project.gallery.map((url, i) => (
                    <button
                      type="button"
                      key={url}
                      onClick={() => setLightboxImg(url)}
                      className="aspect-square overflow-hidden rounded border border-border hover:opacity-80 transition-opacity"
                      data-ocid={`projects.gallery.${i + 1}`}
                    >
                      <img
                        src={url}
                        alt={`${t(project.title)} — view ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxImg && (
        <Dialog open={!!lightboxImg} onOpenChange={() => setLightboxImg(null)}>
          <DialogContent className="max-w-3xl p-2">
            <img
              src={lightboxImg}
              alt="Enlarged view of selected project media"
              className="w-full h-auto rounded"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default function Projects() {
  const { data: projects, isLoading } = useOngoingProjects();
  const { lang, t } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<OngoingProject | null>(
    null,
  );

  const labels = {
    title: {
      en: "Ongoing Projects",
      fr: "Projets en Cours",
      es: "Proyectos en Curso",
    },
    funding: {
      en: "Funding",
      fr: "Financement",
      es: "Financiamiento",
    },
    viewDetails: {
      en: "View Details",
      fr: "Voir les détails",
      es: "Ver detalles",
    },
    empty: {
      en: "No ongoing projects at the moment.",
      fr: "Aucun projet en cours pour l'instant.",
      es: "No hay proyectos en curso por el momento.",
    },
  };

  if (isLoading) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 py-20 text-center text-muted-foreground"
        data-ocid="projects.loading_state"
      >
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12" data-ocid="projects.section">
      <h1 className="font-serif text-3xl font-normal text-foreground mb-10">
        {labels.title[lang]}
      </h1>

      {(!projects || projects.length === 0) && (
        <p
          className="text-muted-foreground text-sm"
          data-ocid="projects.empty_state"
        >
          {labels.empty[lang]}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects?.map((project, i) => {
          const statusCounts = {
            NotStarted: project.objectiveStatuses.filter(
              (s) => s.status === ObjectiveStatus.NotStarted,
            ).length,
            InProgress: project.objectiveStatuses.filter(
              (s) => s.status === ObjectiveStatus.InProgress,
            ).length,
            Completed: project.objectiveStatuses.filter(
              (s) => s.status === ObjectiveStatus.Completed,
            ).length,
          };

          return (
            <button
              type="button"
              key={String(project.id)}
              className="border border-border rounded p-5 hover:border-primary/40 transition-colors duration-150 text-left w-full"
              onClick={() => setSelectedProject(project)}
              aria-label={`View details for ${t(project.title)}`}
              data-ocid={`projects.card.${i + 1}`}
            >
              <h2 className="font-serif text-lg font-normal text-foreground mb-1 leading-snug">
                {t(project.title)}
              </h2>

              {t(project.fundingSource) && (
                <p className="text-xs text-muted-foreground mb-3">
                  <span className="font-medium">{labels.funding[lang]}:</span>{" "}
                  {t(project.fundingSource)}
                </p>
              )}

              {t(project.objectives) && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                  {t(project.objectives)}
                </p>
              )}

              {project.objectiveStatuses.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {statusCounts.Completed > 0 && (
                    <StatusBadge
                      status={ObjectiveStatus.Completed}
                      lang={lang}
                    />
                  )}
                  {statusCounts.InProgress > 0 && (
                    <StatusBadge
                      status={ObjectiveStatus.InProgress}
                      lang={lang}
                    />
                  )}
                  {statusCounts.NotStarted > 0 && (
                    <StatusBadge
                      status={ObjectiveStatus.NotStarted}
                      lang={lang}
                    />
                  )}
                  <span className="text-xs text-muted-foreground self-center">
                    ({project.objectiveStatuses.length}{" "}
                    {lang === "fr"
                      ? "objectifs"
                      : lang === "es"
                        ? "objetivos"
                        : "objectives"}
                    )
                  </span>
                </div>
              )}

              <p className="text-xs text-primary hover:underline">
                {labels.viewDetails[lang]} →
              </p>
            </button>
          );
        })}
      </div>

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
