import { Badge } from "@/components/ui/badge";
import { Linkedin, Mail, MapPin } from "lucide-react";
import { SiOrcid, SiResearchgate } from "react-icons/si";
import MarkdownText from "../components/MarkdownText";
import { useLanguage } from "../contexts/LanguageContext";
import { useLanguages, useProfile } from "../hooks/useQueries";

const INTERESTS = [
  "Humanism",
  "Sustainable development",
  "History",
  "Philosophy",
  "Astronomy",
  "Taekwondo",
  "Swimming",
  "Cycling",
  "Hiking",
];

const INTERESTS_FR = [
  "Humanisme",
  "Développement durable",
  "Histoire",
  "Philosophie",
  "Astronomie",
  "Taekwondo",
  "Natation",
  "Cyclisme",
  "Randonnée",
];

const INTERESTS_ES = [
  "Humanismo",
  "Desarrollo sostenible",
  "Historia",
  "Filosofía",
  "Astronomía",
  "Taekwondo",
  "Natación",
  "Ciclismo",
  "Senderismo",
];

const ICON_CLS =
  "h-[18px] w-[18px] text-muted-foreground hover:text-primary transition-colors duration-150 flex-shrink-0";

export default function About() {
  const { data: profile, isLoading } = useProfile();
  const { data: languages } = useLanguages();
  const { lang, t } = useLanguage();

  const labels = {
    about: { en: "About", fr: "À propos", es: "Sobre mí" },
    contact: {
      en: "Contact & Profiles",
      fr: "Contact et Profils",
      es: "Contacto y Perfiles",
    },
    languages: { en: "Languages", fr: "Langues", es: "Idiomas" },
    interests: { en: "Interests", fr: "Centres d'intérêt", es: "Intereses" },
    name: { en: "Language", fr: "Langue", es: "Idioma" },
    level: { en: "Level", fr: "Niveau", es: "Nivel" },
  };

  const interests =
    lang === "fr" ? INTERESTS_FR : lang === "es" ? INTERESTS_ES : INTERESTS;

  if (isLoading) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 py-20 text-center text-muted-foreground"
        data-ocid="about.loading_state"
      >
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12" data-ocid="about.section">
      <h1 className="font-serif text-3xl font-normal text-foreground mb-8">
        {labels.about[lang]}
      </h1>

      {profile?.bio && (
        <section className="mb-12">
          <MarkdownText content={t(profile.bio)} className="text-sm" />
        </section>
      )}

      {/* Contact & social row */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-normal text-foreground mb-4 pb-2 border-b border-border">
          {labels.contact[lang]}
        </h2>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {/* Location — plain text */}
          {profile?.location && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-[18px] w-[18px] flex-shrink-0" />
              {profile.location}
            </span>
          )}

          {/* Email */}
          <a
            href={`mailto:${profile?.email ?? "m.kante@cgiar.org"}`}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-150"
            aria-label="Email"
            data-ocid="about.link"
          >
            <Mail className={ICON_CLS} />
            <span className="text-xs">
              {profile?.email ?? "m.kante@cgiar.org"}
            </span>
          </a>

          {/* ORCID */}
          <a
            href="https://orcid.org/0000-0003-4669-3132"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-150"
            aria-label="ORCID profile"
            data-ocid="about.link"
          >
            <SiOrcid size={18} />
            <span className="text-xs">ORCID</span>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/moctarkante"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-150"
            aria-label="LinkedIn profile"
            data-ocid="about.link"
          >
            <Linkedin className={ICON_CLS} />
            <span className="text-xs">LinkedIn</span>
          </a>

          {/* ResearchGate */}
          <a
            href="https://www.researchgate.net/profile/Moctar_Kante"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-150"
            aria-label="ResearchGate profile"
            data-ocid="about.link"
          >
            <SiResearchgate size={18} />
            <span className="text-xs">ResearchGate</span>
          </a>
        </div>
      </section>

      {/* Languages */}
      {languages && languages.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-xl font-normal text-foreground mb-4 pb-2 border-b border-border">
            {labels.languages[lang]}
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-2 font-medium">{labels.name[lang]}</th>
                <th className="pb-2 font-medium">{labels.level[lang]}</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((langItem, i) => (
                <tr
                  key={String(langItem.id)}
                  className="border-t border-border"
                  data-ocid={`about.item.${i + 1}`}
                >
                  <td className="py-2 text-foreground">{t(langItem.name)}</td>
                  <td className="py-2 text-muted-foreground">
                    {t(langItem.level)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Interests */}
      <section>
        <h2 className="font-serif text-xl font-normal text-foreground mb-4 pb-2 border-b border-border">
          {labels.interests[lang]}
        </h2>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <Badge
              key={interest}
              variant="outline"
              className="text-xs text-muted-foreground border-border font-normal"
            >
              {interest}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
