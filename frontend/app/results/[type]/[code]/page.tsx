import { Search, Trophy, ArrowLeft, Zap, Hash, Calendar, Users, Ticket } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
import WinModalWrapper from "@/components/WinModalWrapper";

interface LotteryData {
  name: string;
  code: string;
  draw_date: string;
  prizes: { [key: string]: string[] };
}

async function getTicketData(code: string): Promise<LotteryData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/results/${code}`, { 
        cache: "no-store",
        headers: { 'Accept': 'application/json' }
    });
    return res.ok ? await res.json() : null;
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
}

export default async function DetailResultPage({ params }: { params: Promise<{ type: string; code: string }> }) {
  const resolvedParams = await params;
  const { code, type } = resolvedParams;
  const data = await getTicketData(code);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
        <Ticket className="w-16 h-16 text-primary mb-4 opacity-20" />
        <h1 className="text-2xl font-black uppercase tracking-widest">Result Not Found</h1>
        <Link href="/results" className="mt-6 text-primary hover:underline font-bold uppercase text-xs tracking-widest">Return to Results</Link>
      </div>
    );
  }

  const prizeEntries = Object.entries(data.prizes || {});
  const firstPrize = prizeEntries.find(([k]) => k.toLowerCase().includes("1st"));
  const remainingPrizes = prizeEntries.filter(([k]) => !k.toLowerCase().includes("1st"));

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-foreground pb-20 overflow-x-hidden">
      <header className="bg-secondary/20 border-b border-white/5 pt-10 pb-10 relative">
        <div className="container mx-auto px-4">
          <Link href={`/results/${type}`} className="text-primary font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-2 mb-6 hover:translate-x-[-4px] transition-transform">
            <ArrowLeft className="w-4 h-4" /> BACK
          </Link>
          
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">{data.name}</h1>
            
            <div className="flex flex-wrap gap-4 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                <Hash className="w-3 h-3 text-primary"/> {data.code}
              </span>
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                <Calendar className="w-3 h-3 text-primary"/> {data.draw_date}
              </span>
            </div>

            {/* INTEGRATED SEARCH BAR - Fixed bug where it was on top */}
            <WinModalWrapper data={data} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 mt-12">
        {/* --- 1ST PRIZE CARD --- */}
        {firstPrize && (
          <div className="mb-12 relative bg-gradient-to-br from-primary/20 to-transparent border border-primary/40 p-8 md:p-12 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(200,160,50,0.1)] before:content-[''] before:absolute before:left-[-12px] before:top-1/2 before:-translate-y-1/2 before:w-[24px] before:h-[24px] before:bg-[#0a0a0a] before:rounded-full before:border before:border-primary/40 after:content-[''] after:absolute after:right-[-12px] after:top-1/2 after:-translate-y-1/2 after:w-[24px] after:h-[24px] after:bg-[#0a0a0a] after:rounded-full after:border after:border-primary/40">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-primary w-6 h-6" />
                <p className="text-[12px] font-black uppercase tracking-[0.3em] text-primary">1ST PRIZE WINNER</p>
            </div>
            <div className="text-6xl md:text-9xl font-mono font-black tracking-tighter text-white truncate">
                {firstPrize[1][0]}
            </div>
          </div>
        )}

        {/* --- REMAINING RANKS --- */}
        <div className="space-y-8">
          {remainingPrizes.map(([label, nums]) => (
            <div key={label} className="relative bg-[#111] border border-primary/10 rounded-3xl overflow-hidden before:content-[''] before:absolute before:left-[-8px] before:top-1/2 before:-translate-y-1/2 before:w-[16px] before:h-[16px] before:bg-[#0a0a0a] before:rounded-full before:border before:border-primary/10 after:content-[''] after:absolute after:right-[-8px] after:top-1/2 after:-translate-y-1/2 after:w-[16px] after:h-[16px] after:bg-[#0a0a0a] after:rounded-full after:border after:border-primary/10">
              <div className="p-5 px-8 border-b border-primary/10 bg-primary/5 flex justify-between items-center">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary/80">{label}</h4>
                <span className="text-[9px] font-bold text-muted-foreground uppercase">{nums.length} Tickets</span>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                  {nums.map(n => (
                    <div key={n} className="py-2.5 rounded-xl text-center font-mono text-[15px] font-bold bg-white/5 text-white/90 border border-white/5 hover:border-primary/30 transition-colors">
                        {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}