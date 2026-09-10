import { useState } from "react";
import type { StoreRow } from "@/types/store";

interface StoreHeroProps {
  store: Pick<StoreRow, "show_banner" | "hero_image_url" | "hero_title" | "hero_subtitle" | "logo_url">;
}

const StoreHero = ({ store }: StoreHeroProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (store.show_banner === false) return null;

  const logoAlt = store.hero_title || "Store logo";

  const logoMark = store.logo_url ? (
    <button
      type="button"
      onClick={() => setLightboxOpen(true)}
      aria-label="Open logo"
      className="mt-4 inline-block rounded-sm border border-border/20 bg-background overflow-hidden transition-opacity hover:opacity-80"
    >
      <img
        src={store.logo_url}
        alt={logoAlt}
        className="w-16 h-16 md:w-20 md:h-20 object-contain"
        loading="lazy"
      />
    </button>
  ) : null;

  const lightbox = lightboxOpen && store.logo_url ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 cursor-zoom-out"
      onClick={() => setLightboxOpen(false)}
    >
      <img
        src={store.logo_url}
        alt={logoAlt}
        className="max-w-full max-h-full object-contain bg-white rounded-sm"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  ) : null;

  if (store.hero_image_url) {
    return (
      <>
        <section className="relative overflow-hidden border-b border-border/5">
          <div className="grid md:grid-cols-2">
            <div className="w-full">
              <img
                src={`${store.hero_image_url}?width=1200&quality=85&format=webp`}
                srcSet={`
                  ${store.hero_image_url}?width=600&quality=80&format=webp 600w,
                  ${store.hero_image_url}?width=900&quality=85&format=webp 900w,
                  ${store.hero_image_url}?width=1200&quality=85&format=webp 1200w
                `}
                sizes="(max-width: 768px) 100vw, 50vw"
                alt={store.hero_title || "Store banner"}
                className="w-full h-auto"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <div
              className="flex flex-col justify-start py-6 px-4 md:py-10 md:px-12"
              style={{ backgroundColor: "hsl(var(--surface-warm))" }}
            >
              <div className="w-full">
                {store.hero_title && (
                  <h2 className="font-mono text-2xl md:text-4xl font-bold uppercase leading-tight" style={{ color: "hsl(var(--foreground))" }}>
                    {store.hero_title}
                  </h2>
                )}
                {logoMark}
                {store.hero_subtitle && (
                  <p className="font-mono text-[11px] md:text-xs uppercase tracking-[0.15em] mt-2 max-w-[320px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {store.hero_subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
        {lightbox}
      </>
    );
  }

  return (
    <>
      <section className="container py-6 md:py-10 border-b border-border/5">
        {store.hero_title && (
          <h2 className="font-mono text-2xl md:text-4xl font-bold uppercase leading-tight" style={{ color: "hsl(var(--foreground))" }}>
            {store.hero_title}
          </h2>
        )}
        {logoMark}
        {store.hero_subtitle && (
          <p className="font-mono text-[11px] md:text-xs uppercase mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
            {store.hero_subtitle}
          </p>
        )}
      </section>
      {lightbox}
    </>
  );
};

export default StoreHero;
