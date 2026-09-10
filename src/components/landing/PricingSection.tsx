import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLabels } from "@/hooks/useLabels";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const PricingSection = () => {
  const { LANDING } = useLabels();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  const proFeatures = (LANDING.PRO_FEATURES as string[] | undefined) || ["Unlimited products", "Telegram notifications", "QR payment verification"];
  const basicFeatures = (LANDING.BASIC_FEATURES as string[] | undefined) || ["Up to 5 products", "1 image per product", "2 categories max"];

  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12 md:mb-16">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 block">{LANDING.PRICING}</span>
          <h2 className="font-heading text-3xl md:text-4xl tracking-tight text-foreground mb-8">{LANDING.SIMPLE_PRICING}</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free — 3-day trial */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="border border-border bg-background p-8 md:p-12 flex flex-col relative">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">{LANDING.FREE}</span>
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-accent border border-accent/40 px-2 py-0.5">{LANDING.FREE_TRIAL}</span>
            </div>
            <div className="mb-6">
              <span className="font-heading text-4xl md:text-5xl text-foreground">0 ৳</span>
            </div>
            <p className="font-body text-muted-foreground text-sm mb-6">{LANDING.FREE_TRIAL_DESC}</p>
            <ul className="space-y-4 mb-10 flex-1">
              {basicFeatures.map((f) => (<li key={f} className="flex items-start gap-3 text-sm font-body text-muted-foreground"><Check className="w-4 h-4 mt-0.5 text-sage shrink-0" />{f}</li>))}
            </ul>
            <Button asChild className="w-full rounded-none h-12 font-mono text-xs tracking-wider border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background">
              <a href="/auth?tab=billing" className="flex items-center justify-center gap-2">{LANDING.GET_STARTED}</a>
            </Button>
          </motion.div>

          {/* Pro */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-foreground text-background p-8 md:p-12 flex flex-col relative">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-background/60 mb-6">{LANDING.STANDARD}</span>
            <div className="mb-8">
              <span className="font-heading text-4xl md:text-5xl text-background">2,000 ৳</span>
              <span className="font-body text-background/50 text-sm ml-2">/ {LANDING.PER_MONTH}</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {proFeatures.map((f) => (<li key={f} className="flex items-start gap-3 text-sm font-body text-background/70"><Check className="w-4 h-4 mt-0.5 text-sage shrink-0" />{f}</li>))}
            </ul>
            <Button asChild className="w-full rounded-none h-12 font-mono text-xs tracking-wider bg-background text-foreground hover:bg-background/90">
              <a href={user ? "/dashboard?tab=billing" : "/auth?tab=billing"} className="flex items-center justify-center gap-2">{LANDING.GET_STARTED}</a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
