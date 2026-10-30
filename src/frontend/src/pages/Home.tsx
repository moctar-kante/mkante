import { Linkedin, Mail, MapPin } from "lucide-react";
import { SiOrcid, SiResearchgate } from "react-icons/si";
import { useLanguage } from "../contexts/LanguageContext";
import { useProfile, usePublications } from "../hooks/useQueries";

const PLACEHOLDER_AVATAR =
  "https://ui-avatars.com/api/?name=Moctar+Kante&size=200&background=2d6a4f&color=ffffff&bold=true";

const ICON_CLS =
  "h-[18px] w-[18px] text-muted-foreground hover:text-primary transition-colors duration-150 flex-shrink-0";

export default function Home() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: publications } = usePublications();
  const { t, lang } = useLanguage();

  const featured = publications?.filter((p) => p.featured).slice(0, 3) ?? [];

  const featuredLabel = {
    en: "Featured Publications",
    fr: "Publications Sélectionnées",
    es: "Publicaciones Destacadas",
  };

  if (profileLoading) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 py-20 text-center text-muted-foreground"
        data-ocid="home.loading_state"
      >
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Hero */}
      <section
        className="py-16 md:py-24 flex flex-col md:flex-row items-start gap-10 md:gap-16"
        data-ocid="home.section"
      >
        <div className="flex-shrink-0">
          <img
            src={
              profile?.avatarUrl && profile.avatarUrl !== ""
                ? profile.avatarUrl
                : PLACEHOLDER_AVATAR
            }
            alt={profile?.fullName ?? "Profile photo"}
            className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border border-border"
          />
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-1">
            {profile?.fullName ?? "Moctar Kante"}
          </h1>
          <p className="text-sm text-muted-foreground mb-2">{profile?.title}</p>
          <p className="text-base text-foreground font-medium mb-4">
            {profile ? t(profile.headline) : ""}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xl">
            {profile ? t(profile.bioShort) : ""}
          </p>

          {/* Contact / social row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {/* Location — plain text, not a link */}
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
              data-ocid="home.link"
            >
              <Mail className={ICON_CLS} />
            </a>

            {/* ORCID */}
            <a
              href="https://orcid.org/0000-0003-4669-3132"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-150"
              aria-label="ORCID profile"
              data-ocid="home.link"
            >
              <SiOrcid size={18} />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/moctarkante"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-150"
              aria-label="LinkedIn profile"
              data-ocid="home.link"
            >
              <Linkedin className={ICON_CLS} />
            </a>

            {/* ResearchGate */}
            <a
              href="https://www.researchgate.net/profile/Moctar_Kante"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-150"
              aria-label="ResearchGate profile"
              data-ocid="home.link"
            >
              <SiResearchgate size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Featured Publications */}
      {featured.length > 0 && (
        <section className="pb-16" data-ocid="home.section">
          <h2 className="font-serif text-xl font-normal text-foreground mb-6 pb-3 border-b border-border">
            {featuredLabel[lang]}
          </h2>
          <div className="space-y-5">
            {featured.map((pub, i) => (
              <article
                key={String(pub.id)}
                className="group"
                data-ocid={`home.item.${i + 1}`}
              >
                <p className="font-medium text-foreground text-sm leading-snug mb-0.5">
                  {pub.title}
                </p>
                <p className="text-xs text-muted-foreground">{pub.authors}</p>
                <p className="text-xs text-muted-foreground">
                  {pub.venue} · {Number(pub.year)}{" "}
                  {pub.doi && (
                    <a
                      href={`https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                      data-ocid="home.link"
                    >
                      DOI
                    </a>
                  )}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
