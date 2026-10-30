import { Link } from "@tanstack/react-router";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="bg-muted border-t border-border py-8">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4">
        {/* OpenChat — logo links to oc.app/home, @jaqen is plain text */}
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <a
            href="https://oc.app/home"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 hover:opacity-80 transition-opacity duration-150"
          >
            <span className="sr-only">OpenChat</span>
            {/* Simple OpenChat circular gradient ring */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="oc-ring-grad"
                  x1="0"
                  y1="0"
                  x2="32"
                  y2="32"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#F6823C" />
                  <stop offset="100%" stopColor="#E0308E" />
                </linearGradient>
              </defs>
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="url(#oc-ring-grad)"
                strokeWidth="5"
                fill="none"
              />
            </svg>
          </a>
          <span className="font-medium">@jaqen</span>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          © {year}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors duration-150"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
        <Link
          to="/admin"
          className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-150"
          data-ocid="footer.admin_link"
        >
          Admin
        </Link>
      </div>
    </footer>
  );
}
