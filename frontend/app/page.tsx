import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import HeroDashboard from "@/components/HeroDashboard";
import { API_BASE_URL } from "@/lib/config";
async function getLatestDraw() {
  try {
   const res = await fetch(`${API_BASE_URL}/api/results`, { 
      next: { revalidate: 60 } // Maintains your 1-minute cache refresh
    });
    const json = await res.json();
    return Array.isArray(json) ? json[0] : json;
  } catch (err) {
    console.error("Server fetch failed:", err);
    return null;
  }
}

export default async function HomePage() {
  const latestData = await getLatestDraw();

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* --- MONEY-THEMED BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-10%] w-[60%] md:w-[40%] h-[40%] bg-primary/10 blur-[80px] md:blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[60%] md:w-[40%] h-[40%] bg-secondary/20 blur-[80px] md:blur-[120px] rounded-full" />
      </div>
      
      {/* Container: Responsive Padding & Vertical Alignment */}
      <section className="relative z-10 pt-12 pb-16 md:pt-32 md:pb-40 container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          
          {/* Left Side: Branding (Scalable Typography) */}
          <div className="flex-1 text-center lg:text-left w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-primary/30 text-[10px] md:text-xs font-bold tracking-widest uppercase text-primary mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <ShieldCheck className="w-4 h-4" /> Verified Kerala State Results
            </div>
            
            {/* Dynamic Font Sizes: text-5xl (mobile) -> text-8xl (desktop) */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] md:leading-[0.9] mb-6 md:mb-8 uppercase">
              Kerala <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient">Win</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium max-w-xl mb-8 md:mb-12 leading-relaxed mx-auto lg:mx-0 px-2 sm:px-0">
              The gold standard for Kerala lottery enthusiasts. Get the fastest updates 
              directly from Gorky Bhavan with our automated tracking system.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 md:gap-6 px-4 sm:px-0">
              <Link 
                href="/results" 
                className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg md:text-xl hover:scale-105 hover:shadow-[0_0_30px_rgba(200,160,50,0.5)] transition-all flex items-center justify-center gap-3 group"
              >
                CHECK RESULTS <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Side: Dashboard (Responsive Sizing) */}
          <div className="flex-1 w-full max-w-lg lg:max-w-xl relative mt-8 lg:mt-0">
             {/* Glow effect behind the dashboard on mobile */}
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full lg:hidden" />
            <HeroDashboard initialData={latestData} />
          </div>
        </div>
      </section>
    </main>
  );
}