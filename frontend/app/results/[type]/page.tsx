import Link from "next/link";
import { ArrowLeft, Ticket, ChevronRight, Hash, Calendar } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface LotteryDraw {
  code: string;
  draw_date: string;
  prizes: {
    [prizeName: string]: string[];
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

        {/* --- PROFESSIONAL TABLE --- */}
        <div className="w-full overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4">
            <thead className="hidden md:table-header-group">
              <tr className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                <th className="px-12 py-4 text-left font-black">Draw Details</th>
                <th className="py-4 text-center font-black">Winning Ticket</th>
                <th className="px-12 py-4 text-right font-black">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((draw) => {
                  const prizeValues = Object.values(draw.prizes || {});
                  const firstPrizeGroup = prizeValues[0];
                  const firstPrizeWinner = Array.isArray(firstPrizeGroup) ? firstPrizeGroup[0] : "---";

                  return (
                    <tr 
                      key={draw.code}
                      className="group bg-[#161616] border border-primary/10 rounded-2xl transition-all duration-500 hover:border-primary/40 relative"
                    >
                      {/* --- DRAW DETAILS --- */}
                      <td className="p-6 md:p-8 md:px-12 rounded-l-2xl border-y border-l border-primary/10">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-3 h-3 text-primary" />
                          <span className="text-2xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                            {draw.draw_date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <Hash className="w-3 h-3" /> Draw No: {draw.code}
                        </div>
                      </td>

                      {/* --- WINNING NUMBER --- */}
                      <td className="p-6 md:p-8 text-center bg-primary/5 group-hover:bg-primary/10 transition-colors border-y border-primary/10">
                        <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.3em] mb-2">1st Prize</p>
                        <span className="text-3xl font-mono font-black text-white">
                          {firstPrizeWinner}
                        </span>
                      </td>

                      {/* --- ACTION --- */}
                      <td className="p-6 md:px-12 text-right rounded-r-2xl border-y border-r border-primary/10">
                        <Link 
                          href={`/results/${type}/${draw.code}`}
                          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/50 group-hover:bg-primary transition-all group-hover:rotate-[-45deg]"
                        >
                          <ChevronRight className="w-5 h-5 group-hover:text-black transition-colors" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="py-24 text-center border-2 border-dashed border-primary/10 rounded-[3rem]">
                    <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground uppercase font-black tracking-[0.3em] text-xs">No records found for this series</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}