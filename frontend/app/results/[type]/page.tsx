import Link from "next/link";
import { ArrowLeft, History, Ticket, ChevronRight, Hash, Calendar } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

// 1. Define the Interface to fix the 'any' type error
interface LotteryDraw {
  code: string;
  draw_date: string;
  prizes: {
    [prizeName: string]: string[]; // e.g., "1st Prize": ["SK 123456"]
  };
}

async function getTypeHistory(type: string): Promise<LotteryDraw[]> {
  const formattedName = type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/results?name=${encodeURIComponent(formattedName)}`,
      { cache: "no-store" }
    );
    return res.ok ? await res.json() : [];
  } catch (error) {
    console.error("Fetch failed:", error);
    return [];
  }
}

export default async function TypeHistoryPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const resolvedParams = await params;
  const { type } = resolvedParams;

  const history: LotteryDraw[] = await getTypeHistory(type);
  const typeName = type.replace(/-/g, " ").toUpperCase();

  return (
    <main className="min-h-screen p-4 md:p-12 bg-[#0a0a0a] text-foreground">
      <div className="container mx-auto max-w-5xl">
        {/* --- HEADER --- */}
        <header className="mb-12">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.3em] mb-6 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft className="w-4 h-4" /> All Lotteries
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase ">
            {typeName}{" "}
            <span className="text-primary block text-xl md:text-2xl mt-2 ">
              Previous Results
            </span>
          </h1>
        </header>

        {/* --- TABLE --- */}
        <div className="space-y-4">
          <div className="hidden md:flex px-12 py-4 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            <div className="flex-1">Draw Details</div>
            <div className="flex-1 text-center">Winning Ticket</div>
            <div className="w-32 text-right">Action</div>
          </div>

          {history.length > 0 ? (
            history.map((draw) => {
              // 2. Safely extract the 1st prize number
              const prizeValues = Object.values(draw.prizes || {});
              const firstPrizeGroup = prizeValues[0]; // This is the array of numbers for the first prize rank
              const firstPrizeWinner = Array.isArray(firstPrizeGroup) ? firstPrizeGroup[0] : "---";

              return (
                <Link
                  key={draw.code}
                  href={`/results/${type}/${draw.code}`}
                  className="group relative flex flex-col md:flex-row items-center bg-[#161616] border border-primary/10 rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-500
                before:content-[''] before:absolute before:left-[-8px] before:top-1/2 before:-translate-y-1/2 before:w-[16px] before:h-[16px] before:bg-[#0a0a0a] before:rounded-full before:border before:border-primary/10 before:z-10
                after:content-[''] after:absolute after:right-[-8px] after:top-1/2 after:-translate-y-1/2 after:w-[16px] after:h-[16px] after:bg-[#0a0a0a] after:rounded-full after:border after:border-primary/10 after:z-10"
                >
                  <div className="flex-1 p-6 md:p-8 md:px-12 w-full border-b md:border-b-0 md:border-r-2 md:border-dashed md:border-primary/20 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-3 h-3 text-primary" />
                      <span className="text-2xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                        {draw.draw_date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Hash className="w-3 h-3" /> Draw No: {draw.code}
                    </div>
                  </div>

                  <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors w-full">
                    <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.3em] mb-2">
                      1st Prize Number
                    </p>
                    <span className="text-3xl font-mono font-black text-white group-hover:scale-110 transition-transform duration-500">
                      {firstPrizeWinner}
                    </span>
                  </div>

                  <div className="w-full md:w-32 p-6 flex items-center justify-center border-t md:border-t-0 border-primary/10">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/50 group-hover:bg-primary transition-all group-hover:rotate-[-45deg]">
                      <ChevronRight className="w-5 h-5 group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-primary/10 rounded-[3rem]">
              <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground uppercase font-black tracking-[0.3em] text-xs">
                No records found for this series
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}