import { ShieldAlert, Instagram, Facebook, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.043zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

interface SocialLink {
  key: string;
  href: string;
}

interface StoreFooterProps {
  storeName: string;
  STOREFRONT: Record<string, string>;
  onReportClick: () => void;
  socials: SocialLink[];
}

const renderIcon = (key: string, className: string) => {
  switch (key) {
    case "instagram": return <Instagram className={className} strokeWidth={1.5} />;
    case "facebook": return <Facebook className={className} strokeWidth={1.5} />;
    case "telegram": return <MessageCircle className={className} strokeWidth={1.5} />;
    case "tiktok": return <TikTokIcon className={className} />;
    case "whatsapp": return <WhatsAppIcon className={className} />;
    default: return null;
  }
};

const StoreFooter = ({ storeName, STOREFRONT, onReportClick, socials }: StoreFooterProps) => (
  <footer
    style={{ backgroundColor: "hsl(var(--footer-bg))", color: "hsl(var(--footer-fg))" }}
    className="py-10 pb-16"
  >
    <div className="container text-center space-y-4">
      <p className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: "hsl(var(--footer-fg) / 0.6)" }}>
        {storeName} ·{" "}
        <Link to="/" className="hover:border-b hover:border-current transition-all" style={{ color: "hsl(var(--footer-fg) / 0.6)" }}>
          Dokan
        </Link>
      </p>
      {socials.length > 0 && (
        <div className="flex items-center justify-center gap-5 pt-1">
          {socials.map((s) => (
            <a
              key={s.key}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity opacity-70 hover:opacity-100"
              style={{ color: "hsl(var(--footer-fg) / 0.7)" }}
            >
              {renderIcon(s.key, "w-4 h-4")}
            </a>
          ))}
        </div>
      )}
      <p className="font-mono text-xs tracking-wide" style={{ color: "hsl(var(--footer-fg) / 0.4)" }}>Dhaka, Bangladesh</p>
      <p className="font-mono text-xs tracking-[0.15em] uppercase font-bold" style={{ color: "hsl(var(--footer-fg) / 0.5)" }}>
        {STOREFRONT.FOR_LOCAL_ENTREPRENEURS}
      </p>
      <Link
        to="/"
        className="inline-block text-xs font-mono tracking-wide border px-4 py-2 rounded-none transition-colors"
        style={{ color: "hsl(var(--footer-fg) / 0.5)", borderColor: "hsl(var(--footer-fg) / 0.2)" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(var(--footer-fg))"; e.currentTarget.style.borderColor = "hsl(var(--footer-fg) / 0.4)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(var(--footer-fg) / 0.5)"; e.currentTarget.style.borderColor = "hsl(var(--footer-fg) / 0.2)"; }}
      >
        {STOREFRONT.OPEN_YOUR_STORE}
      </Link>
      <div className="pt-2">
        <button
          onClick={onReportClick}
          className="group inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.15em] uppercase transition-all duration-200 px-2 py-1 sm:py-0"
          style={{ color: "hsl(var(--footer-fg) / 0.4)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "hsl(0 60% 50%)"; e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "hsl(var(--footer-fg) / 0.4)"; e.currentTarget.style.opacity = "1"; }}
          onTouchStart={(e) => { e.currentTarget.style.color = "hsl(0 60% 50%)"; e.currentTarget.style.opacity = "1"; }}
          onTouchEnd={(e) => { e.currentTarget.style.color = "hsl(var(--footer-fg) / 0.4)"; e.currentTarget.style.opacity = "1"; }}
        >
          <ShieldAlert size={12} strokeWidth={1.5} className="sm:w-[10px] sm:h-[10px]" />
          {STOREFRONT.REPORT_STORE}
        </button>
      </div>
    </div>
  </footer>
);

export default StoreFooter;
