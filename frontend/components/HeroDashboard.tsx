"use client";
import { Sparkles, Trophy, Hash, Calendar } from "lucide-react";

export default function HeroDashboard({ initialData }: { initialData: any[] }) {
  const latest = initialData[0] || {};
  const prev = initialData[1] || {};

  const BounceLoader = () => (
    <div className="bounce-loader mx-auto">
      <span></span><span></span><span></span>
    </div>
  );

  const formatCurrency = (label: string) => {
    if (!label) return "---";
    const match = label.match(/Rs\s?:?([\d,]+)/i);
    if (!match) return "---";
    const num = parseInt(match[1].replace(/,/g, ""));
    if (num >= 10000000) return `₹${num / 10000000} Cr`;
    if (num >= 100000) return `₹${num / 100000} L`;
    return `₹${num.toLocaleString()}`;
  };

  const prizes = latest?.prizes || {};
  const prizeKeys = Object.keys(prizes);

  const firstPrizeLabel = prizeKeys.find(k => k.includes("1st")) || "";
  const secondPrizeLabel = prizeKeys.find(k => k.includes("2nd")) || "";
  const thirdPrizeLabel = prizeKeys.find(k => k.includes("3rd")) || "";

  // Previous result helpers
  const prevPrizes = prev?.prizes || {};
  const prevKeys = Object.keys(prevPrizes);
  const prevFirstLabel = prevKeys.find(k => k.includes("1st")) || "";
  const isUpcoming = latest?.is_upcoming;

  return (
    <div className="relative animate-in zoom-in duration-1000 max-w-xl mx-auto flex flex-col gap-6">

      {/* --- MAIN TICKET (LATEST / LIVE / UPCOMING) --- */}
      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-30" />

        <div className="relative flex flex-col bg-[#1a1a1a] border border-primary/30 rounded-[2rem] overflow-hidden shadow-2xl
          before:content-[''] before:absolute before:left-[-12px] before:top-1/2 before:-translate-y-1/2 before:w-[24px] before:h-[24px] before:bg-background before:rounded-full before:border before:border-primary/30 before:z-20
          after:content-[''] after:absolute after:right-[-12px] after:top-1/2 after:-translate-y-1/2 after:w-[24px] after:h-[24px] after:bg-background after:rounded-full after:border after:border-primary/30 after:z-20">

          {/* Ticket Header */}
          <div className="p-8 md:p-10 border-b-2 border-dashed border-primary/20 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-2 h-2 ${isUpcoming ? 'bg-yellow-500' : 'bg-red-500'} rounded-full animate-ping absolute`} />
                  <div className={`w-2 h-2 ${isUpcoming ? 'bg-yellow-600' : 'bg-red-600'} rounded-full relative`} />
                </div>
                <span className={`font-black text-[10px] uppercase tracking-[0.3em] ${isUpcoming ? 'text-yellow-500' : 'text-primary'}`}>
                  {isUpcoming ? "UPCOMING DRAW" : "LIVE RESULT"}
                </span>
              </div>
              <Sparkles className="w-5 h-5 text-primary opacity-50" />
            </div>

            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2 leading-none">
              {latest?.name || "Syncing Draw..."}
            </h3>

            <div className="flex gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span className="flex items-center gap-1"><Hash className="w-3 h-3 text-primary" /> {latest?.code}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" /> {latest?.draw_date}</span>
            </div>
          </div>

          {/* 1st Prize Section */}
          <div className="p-8 md:p-10 bg-gradient-to-br from-primary/10 to-transparent flex flex-col items-center justify-center text-center relative overflow-hidden">
            <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5 -rotate-12" />

            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4">
              {isUpcoming ? "Estimated Jackpot" : "Winner Ticket Number"}
            </p>

            <div className="bg-background/40 backdrop-blur-md border border-primary/20 py-6 px-10 rounded-2xl mb-4 shadow-inner">
              <div className="text-5xl md:text-6xl font-mono font-black text-primary tracking-tighter">
                {isUpcoming ? "₹1 Cr+" : (prizes[firstPrizeLabel]?.[0] || <BounceLoader />)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8 bg-primary/30" />
              <span className="text-sm font-black text-foreground uppercase tracking-widest">
                Jackpot: {isUpcoming ? "₹ 1 Crore" : formatCurrency(firstPrizeLabel)}
              </span>
              <div className="h-[1px] w-8 bg-primary/30" />
            </div>
          </div>

          {/* Footer Stats Grid (Hidden if upcoming) */}
          {!isUpcoming && (
            <div className="grid grid-cols-2 border-t-2 border-dashed border-primary/20">
              <div className="p-6 border-r-2 border-dashed border-primary/20 text-center group hover:bg-primary/5 transition-colors">
                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">2nd Prize</p>
                <p className="font-black text-primary text-lg leading-none mb-1">{formatCurrency(secondPrizeLabel)}</p>
                <div className="text-[10px] font-mono text-foreground font-bold tracking-tighter">{prizes[secondPrizeLabel]?.[0] || <BounceLoader />}</div>
              </div>
              <div className="p-6 text-center group hover:bg-primary/5 transition-colors">
                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">3rd Prize</p>
                <p className="font-black text-primary text-lg leading-none mb-1">{formatCurrency(thirdPrizeLabel)}</p>
                <div className="text-[10px] font-mono text-foreground font-bold tracking-tighter">{prizes[thirdPrizeLabel]?.[0] || <BounceLoader />}</div>
              </div>
            </div>
          )}

          {/* Barcode-style decorative element */}
          <div className="bg-primary/10 h-6 w-full flex gap-[2px] items-center px-8 opacity-20">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="bg-primary h-full" style={{ width: Math.random() * 4 + 1 + 'px' }} />
            ))}
          </div>
        </div>
      </div>

      {/* --- PREVIOUS RESULT COMPACT CARD --- */}
      {prev?.name && (
        <div className="bg-muted/30 border border-primary/10 rounded-2xl p-4 flex items-center justify-between hover:border-primary/40 transition-colors cursor-default">
          <div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Previous Result ({prev.draw_date})</div>
            <div className="font-black text-lg uppercase">{prev.name} <span className="text-muted-foreground text-sm font-normal">| {prev.code}</span></div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-bold text-primary uppercase tracking-widest mb-1">Winner</div>
            <div className="font-mono font-black text-xl tracking-tight">{prevPrizes[prevFirstLabel]?.[0] || "---"}</div>
          </div>
        </div>
      )}

    </div>
  );
}