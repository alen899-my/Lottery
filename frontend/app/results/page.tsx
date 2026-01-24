import Link from "next/link";
import { Zap, LayoutGrid, ArrowLeft, Trophy, Calendar, Hash, Sparkles } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
async function getHubData() {
  try {
    const [resAll, resTypes] = await Promise.all([
      // Use the dynamic API_BASE_URL instead of the hardcoded IP
      fetch(`${API_BASE_URL}/api/results`, { 
        next: { revalidate: 60 } 
      }),
      fetch(`${API_BASE_URL}/api/lottery-types`, { 
        next: { revalidate: 3600 } 
      })
    ]);
    const latest = await resAll.json();
    const categories = await resTypes.json();
    return { latest: latest[0], categories };
  } catch (err) {
    return { latest: null, categories: [] };
  }
}

export default async function ResultsHub() {
  const { latest, categories } = await getHubData();

  const firstPrizeKey = latest?.prizes ? Object.keys(latest.prizes).find(k => k.includes("1st")) : null;
  const firstPrizeTicket = firstPrizeKey ? latest.prizes[firstPrizeKey][0] : "---";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-foreground p-4 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -z-10" />

      <div className="container mx-auto max-w-6xl">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold hover:translate-x-[-4px] transition-transform group">
            <ArrowLeft className="w-5 h-5 group-hover:animate-pulse" /> 
            <span className="tracking-widest uppercase text-xs">Back to Home</span>
          </Link>
          <div className="text-right">
            <h1 className="text-4xl font-black tracking-tighter uppercase">Ticket <span className="text-primary">Center</span></h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-[0.3em] uppercase italic">Official Kerala Tickets</p>
          </div>
        </header>

        {/* --- MAIN FEATURED TICKET --- */}
        <section className="mb-20">
          <div className="relative w-full bg-[#1a1a1a] border border-primary/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row
            before:content-[''] before:absolute before:left-[-15px] before:top-1/2 before:-translate-y-1/2 before:w-[30px] before:h-[30px] before:bg-[#0a0a0a] before:rounded-full before:border before:border-primary/20 before:z-10
            after:content-[''] after:absolute after:right-[-15px] after:top-1/2 after:-translate-y-1/2 after:w-[30px] after:h-[30px] after:bg-[#0a0a0a] after:rounded-full after:border after:border-primary/20 after:z-10">
            
            {/* Ticket Content Section */}
            <div className="flex-[1.5] p-8 md:p-12 border-b lg:border-b-0 lg:border-r-2 lg:border-dashed lg:border-primary/30 relative">
              <div className="flex items-center gap-3 mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Latest Draw</span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">{latest?.name || "Syncing..."}</h2>
              
              <div className="flex flex-wrap gap-6 mb-10 opacity-70">
                <div className="flex items-center gap-2 text-sm font-bold"><Hash className="w-4 h-4 text-primary" /> {latest?.code}</div>
                <div className="flex items-center gap-2 text-sm font-bold"><Calendar className="w-4 h-4 text-primary" /> {latest?.draw_date}</div>
              </div>

              <Link href={`/results/${latest?.name?.toLowerCase().replace(/ /g, "-")}/${latest?.code}`} 
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-black text-sm hover:brightness-110 transition-all uppercase tracking-widest shadow-lg shadow-primary/20">
                Check Full Result <Sparkles className="w-4 h-4" />
              </Link>
            </div>

            {/* Ticket Stub Section */}
            <div className="flex-1 bg-primary/5 p-8 md:p-12 flex flex-col justify-center items-center text-center relative">
               <Trophy className="w-12 h-12 text-primary mb-4 opacity-40" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">1st Prize Winner</p>
               <div className="text-5xl font-mono font-black text-primary tracking-tighter mb-6">{firstPrizeTicket}</div>
               
               <div className="w-full border-t border-primary/20 pt-4 opacity-40">
                  <p className="text-[9px] font-bold text-center uppercase tracking-widest leading-relaxed font-mono">
                    * * * WINNER * * * <br/> VERIFIED RESULT
                  </p>
               </div>
            </div>
          </div>
        </section>

        {/* --- CATEGORY TICKETS --- */}
        <section>
          <div className="flex items-center gap-3 mb-10 px-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-black uppercase tracking-tight">Browse Lotteries</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((name: string) => (
              <Link key={name} href={`/results/${name.toLowerCase().replace(/ /g, "-")}`}
                className="group relative flex items-center bg-[#1a1a1a] border border-primary/10 h-28 rounded-xl overflow-hidden hover:border-primary/50 transition-all
                before:content-[''] before:absolute before:left-[-10px] before:top-1/2 before:-translate-y-1/2 before:w-[20px] before:h-[20px] before:bg-[#0a0a0a] before:rounded-full before:border before:border-primary/10
                after:content-[''] after:absolute after:right-[-10px] after:top-1/2 after:-translate-y-1/2 after:w-[20px] after:h-[20px] after:bg-[#0a0a0a] after:rounded-full after:border after:border-primary/10">
                
                {/* Small Left Stub */}
                <div className="h-full w-14 bg-primary/5 flex items-center justify-center border-r border-dashed border-primary/20 group-hover:bg-primary transition-colors">
                  <Trophy className="w-5 h-5 text-primary group-hover:text-black transition-colors" />
                </div>
                
                {/* Ticket Body */}
                <div className="flex-1 px-8">
                  <span className="text-sm font-black uppercase tracking-wider block group-hover:text-primary transition-colors">
                    {name}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Previous Results</span>
                </div>
                
                {/* Perforation detail */}
                <div className="pr-6 opacity-20">
                  <div className="w-1 h-8 border-r border-dashed border-primary" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}