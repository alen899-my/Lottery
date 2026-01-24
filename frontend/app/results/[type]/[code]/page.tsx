"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Search, Trophy, ArrowLeft, Zap, Hash, Calendar, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import WinModal from "@/components/WinModal"; 
import { API_BASE_URL } from "@/lib/config";

// 1. Define the Interface to fix the 'unknown' and 'any' errors
interface LotteryData {
  name: string;
  code: string;
  draw_date: string;
  prizes: {
    [key: string]: string[];
  };
}

export default function DetailResultPage() {
  const params = useParams();
  // Set the correct type for state
  const [data, setData] = useState<LotteryData | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isChecked, setIsChecked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [wonPrize, setWonPrize] = useState("");

  const formatReadablePrize = (label: string) => {
    const match = label.match(/Rs\s?:?([\d,]+)/i);
    if (!match) return label.toUpperCase();
    const num = parseInt(match[1].replace(/,/g, ""));
    let readable = num >= 10000000 ? `${num / 10000000} Cr` : num >= 100000 ? `${num / 100000} Lakhs` : num >= 1000 ? `${num / 1000}K` : `${num}`;
    return `${label.split('Rs')[0].trim()} - ₹${readable}`;
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/results/${params.code}`).then(res => res.json()).then(json => {
      setData(json);
      setLoading(false);
    });
  }, [params.code]);

  const handleCheck = () => {
    const input = search.trim().toUpperCase();
    if (!input || input.length < 4) return;

    const inputNumbersOnly = input.replace(/[^0-9]/g, "");
    
    let found = false;
    let rank = "";

    // Safely iterate through prizes
    Object.entries(data?.prizes || {}).forEach(([label, numbers]) => {
      const isHighPrize = label.toLowerCase().includes("1st") || 
                          label.toLowerCase().includes("2nd") || 
                          label.toLowerCase().includes("3rd") || 
                          label.toLowerCase().includes("consolation");

      const hasMatch = (numbers as string[]).some((n: string) => {
        const winNum = n.trim().toUpperCase();
        const winNumbersOnly = winNum.replace(/[^0-9]/g, "");
        
        if (isHighPrize) {
          return winNum === input;
        } 
        
        if (winNumbersOnly.length === 4) {
          return inputNumbersOnly.endsWith(winNumbersOnly);
        }
        
        if (winNumbersOnly.length === 6) {
          return inputNumbersOnly === winNumbersOnly;
        }

        return false;
      });

      if (hasMatch && !found) {
        found = true;
        rank = formatReadablePrize(label);
      }
    });

    setIsWinner(found);
    setWonPrize(rank);
    setIsChecked(true); 
    setModalOpen(true); 
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Zap className="animate-bounce text-primary w-12 h-12" /></div>;

  const prizeEntries = Object.entries(data?.prizes || {});
  const firstPrize = prizeEntries.find(([k]) => k.toLowerCase().includes("1st"));
  const consolationPrize = prizeEntries.find(([k]) => k.toLowerCase().includes("consolation"));
  const remainingPrizes = prizeEntries.filter(([k]) => !k.toLowerCase().includes("1st") && !k.toLowerCase().includes("consolation"));

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-foreground pb-20 overflow-x-hidden">
      <WinModal isOpen={modalOpen} onClose={() => setModalOpen(false)} isWinner={isWinner} prizeLabel={wonPrize} />
      
      <header className="bg-secondary/20 border-b border-white/5 pt-10 pb-10 relative">
        <div className="container mx-auto px-4">
          <Link href={`/results/${params.type}`} className="text-primary font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-2 mb-6 hover:translate-x-[-4px] transition-transform">
            <ArrowLeft className="w-4 h-4" /> BACK
          </Link>
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">{data?.name}</h1>
            
            <div className="flex flex-wrap gap-4 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                <Hash className="w-3 h-3 text-primary"/> {data?.code}
              </span>
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                <Calendar className="w-3 h-3 text-primary"/> {data?.draw_date}
              </span>
            </div>

            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Enter full ticket number..." 
                  className="w-full bg-[#161616] border border-primary/20 rounded-xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-primary/50 text-md font-mono"
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (e.target.value === "") setIsChecked(false); 
                  }} 
                />
              </div>
              <button 
                onClick={handleCheck}
                className="px-8 bg-primary text-black font-black uppercase text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all"
              >
                Check
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 mt-8">
        
        {/* --- 1ST PRIZE CARD --- */}
        {firstPrize && (!isChecked || (firstPrize[1] as string[]).includes(search.toUpperCase())) && (
          <div className="mb-8 relative bg-gradient-to-br from-primary/20 to-transparent border border-primary/40 p-6 md:p-10 rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(200,160,50,0.1)] before:content-[''] before:absolute before:left-[-12px] before:top-1/2 before:-translate-y-1/2 before:w-[24px] before:h-[24px] before:bg-[#0a0a0a] before:rounded-full before:border before:border-primary/40 after:content-[''] after:absolute after:right-[-12px] after:top-1/2 after:-translate-y-1/2 after:w-[24px] after:h-[24px] after:bg-[#0a0a0a] after:rounded-full after:border after:border-primary/40">
            <div className="flex items-center gap-2 mb-2"><Trophy className="text-primary w-5 h-5" /><p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{formatReadablePrize(firstPrize[0])}</p></div>
            <div className="text-5xl md:text-8xl font-mono font-black tracking-tighter text-white truncate">
                {isChecked ? search.toUpperCase() : firstPrize[1][0]}
            </div>
          </div>
        )}

        {/* --- CONSOLIDATION PRIZES --- */}
        {consolationPrize && (!isChecked || (consolationPrize[1] as string[]).includes(search.toUpperCase())) && (
          <div className="mb-12 relative bg-[#161616] border border-primary/20 rounded-[2rem] overflow-hidden shadow-xl">
            <div className="p-6 border-b-2 border-dashed border-primary/20 bg-primary/5 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2"><Zap className="w-3 h-3" /> {formatReadablePrize(consolationPrize[0])}</h3>
              <span className="text-[9px] font-black bg-primary text-black px-2 py-1 rounded flex items-center gap-1"><Users className="w-3 h-3" /> {consolationPrize[1].length} WINNERS</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
                {isChecked 
                  ? <div className="py-2 px-4 rounded-lg text-center font-mono font-bold text-xl bg-primary text-black">{search.toUpperCase()}</div>
                  : (consolationPrize[1] as string[]).map(n => <div key={n} className="py-2 px-1 rounded-lg text-center font-mono font-bold text-xs bg-primary/5 text-white border border-primary/10">{n}</div>)
                }
              </div>
            </div>
          </div>
        )}

        {/* --- OTHER RANKS --- */}
        <div className="space-y-6">
          {remainingPrizes.map(([label, nums]) => {
            const isMatchInRank = (nums as string[]).includes(search.toUpperCase());
            if (isChecked && !isMatchInRank) return null;

            return (
              <div key={label} className="relative bg-[#111] border border-primary/20 rounded-2xl overflow-hidden before:content-[''] before:absolute before:left-[-8px] before:top-1/2 before:-translate-y-1/2 before:w-[16px] before:h-[16px] before:bg-[#0a0a0a] before:rounded-full before:border before:border-primary/20 after:content-[''] after:absolute after:right-[-8px] after:top-1/2 after:-translate-y-1/2 after:w-[16px] after:h-[16px] after:bg-[#0a0a0a] after:rounded-full after:border after:border-primary/20">
                <div className="p-4 px-6 border-b border-primary/20 bg-primary/5 flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary leading-none">{formatReadablePrize(label)}</h4>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    {isChecked 
                      ? <div className="py-2 px-4 rounded-md text-center font-mono text-xl font-bold bg-primary text-black">{search.toUpperCase()}</div>
                      : (nums as string[]).map(n => <div key={n} className="py-1.5 rounded-md text-center font-mono text-[14px] font-bold bg-primary/5 text-white border border-primary/10">{n}</div>)
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}