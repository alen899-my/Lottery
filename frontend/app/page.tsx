import Link from "next/link";
import { ArrowRight, ShieldCheck, Trophy, Clock, TrendingUp, Star, ChevronRight, Zap, Calendar } from "lucide-react";
import HeroDashboard from "@/components/HeroDashboard";
import { API_BASE_URL } from "@/lib/config";

async function getLatestDraw() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/results`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return Array.isArray(json) ? json.slice(0, 5) : [json];
  } catch (err) {
    console.error("Server fetch failed:", err);
    return null;
  }
}

async function getLotteryTypes() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/lottery-types`, {
      next: { revalidate: 3600 },
    });
    return await res.json();
  } catch {
    return [];
  }
}

// Helper to convert backend Object into frontend Array safely
function formatPrizes(prizesObj: any) {
  if (!prizesObj) return [];
  if (Array.isArray(prizesObj)) return prizesObj;
  return Object.entries(prizesObj).map(([key, numbers]) => {
    let rank = "Other";
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("1st") || lowerKey.includes("first")) rank = "1st";
    else if (lowerKey.includes("2nd") || lowerKey.includes("second")) rank = "2nd";
    else if (lowerKey.includes("3rd") || lowerKey.includes("third")) rank = "3rd";
    else if (lowerKey.includes("consolation")) rank = "Consolation";

    const amtMatch = key.match(/rs\s*([\d,]+)/i);
    // Be careful to drop any '1st' or '2nd' numbers if extracting amount falls back
    let amount = amtMatch ? amtMatch[1] : key.replace(/[^0-9]/g, "");
    if (!amtMatch && (lowerKey.includes("1st") || lowerKey.includes("2nd") || lowerKey.includes("3rd"))) {
      amount = amount.substring(1); // naive strip of the ranking number
    }

    return { rank, amount, numbers };
  });
}

// Stats card component
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="relative group flex flex-col gap-2 p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_20px_var(--color-primary)/10]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-black text-foreground leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// Prize highlight badge
function PrizeBadge({ prize, label }: { prize: string; label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/20 border border-accent/30">
      <Trophy className="w-4 h-4 text-accent-foreground flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-black text-foreground truncate">{prize}</p>
      </div>
    </div>
  );
}

// Recent result row
function ResultRow({ result, index }: { result: any; index: number }) {
  const prizesArr = formatPrizes(result?.prizes);
  const prize1 = prizesArr.find((p: any) => p.rank === "1st");
  return (
    <Link
      href={`/results/${result.code}`}
      className="group flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl hover:bg-secondary/50 transition-all duration-200 border border-transparent hover:border-border"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-6 h-6 flex-shrink-0 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="font-bold text-sm text-foreground truncate">{result.name}</p>
          <p className="text-xs text-muted-foreground">{result.draw_date}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {prize1 && (
          <span className="text-xs font-black text-primary hidden sm:block">
            ₹{prize1.amount?.replace(/[^0-9,]/g, "") || "—"}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [latestData, lotteryTypes] = await Promise.all([getLatestDraw(), getLotteryTypes()]);
  const recentResults = latestData || [];
  const latestResult = recentResults[0];

  const formattedPrizes = formatPrizes(latestResult?.prizes);
  const firstPrize = formattedPrizes.find((p: any) => p.rank === "1st");
  const secondPrize = formattedPrizes.find((p: any) => p.rank === "2nd");
  const thirdPrize = formattedPrizes.find((p: any) => p.rank === "3rd");

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* ── Ambient background blobs ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-15%] w-[55%] h-[55%] bg-primary/8 blur-[130px] rounded-full" />
        <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] bg-secondary/15 blur-[120px] rounded-full" />
        <div className="absolute top-[45%] left-[30%] w-[30%] h-[30%] bg-accent/8 blur-[100px] rounded-full" />
      </div>

      {/* ═══════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════ */}
      <section className="relative z-10 pt-10 pb-16 md:pt-28 md:pb-32 container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

          {/* Left — Branding */}
          <div className="flex-1 text-center lg:text-left w-full max-w-2xl mx-auto lg:mx-0">

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-primary/30 text-[10px] md:text-xs font-bold tracking-widest uppercase text-primary mb-6 md:mb-8">
              <ShieldCheck className="w-4 h-4" />
              Official Kerala State Results · Gorky Bhavan
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] mb-5 md:mb-7 uppercase">
              Kerala{" "}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                Lottery
              </span>
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-muted-foreground/70">
                Results Hub
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium max-w-lg mb-8 md:mb-10 leading-relaxed mx-auto lg:mx-0">
              Fastest verified results from Kerala State Lotteries Directorate. Live draws, prize
              breakdowns, and historical data — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-10 md:mb-14">
              <Link
                href="/results"
                className="group w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg md:text-xl hover:scale-[1.03] hover:shadow-[0_0_35px_color-mix(in_oklch,var(--color-primary)_40%,transparent)] transition-all flex items-center justify-center gap-3"
              >
                VIEW ALL RESULTS
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/results"
                className="group w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-card border border-border text-foreground rounded-2xl font-bold text-lg md:text-xl hover:border-primary/50 hover:bg-secondary/30 transition-all flex items-center justify-center gap-3"
              >
                <Zap className="w-5 h-5 text-primary" />
                Today's Draw
              </Link>
            </div>

            {/* ── Prize highlights from latest result ── */}
            {latestResult && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0">
                {firstPrize && (
                  <PrizeBadge label="1st Prize" prize={`₹${firstPrize.amount?.replace(/[^0-9,]/g, "") || "—"}`} />
                )}
                {secondPrize && (
                  <PrizeBadge label="2nd Prize" prize={`₹${secondPrize.amount?.replace(/[^0-9,]/g, "") || "—"}`} />
                )}
                {thirdPrize && (
                  <PrizeBadge label="3rd Prize" prize={`₹${thirdPrize.amount?.replace(/[^0-9,]/g, "") || "—"}`} />
                )}
              </div>
            )}
          </div>

          {/* Right — Live Dashboard */}
          <div className="flex-1 w-full max-w-lg lg:max-w-xl relative mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-primary/15 blur-3xl rounded-full lg:hidden" />
            <HeroDashboard initialData={recentResults} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 — STATS BAR
      ═══════════════════════════════════════ */}
      <section className="relative z-10 py-6 border-y border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Trophy} label="Daily Lotteries" value="8+" sub="Draws every day" />
            <StatCard icon={Clock} label="Result Time" value="~3 PM" sub="IST, after official draw" />
            <StatCard icon={TrendingUp} label="Prize Pool" value="₹Cr+" sub="Cumulative daily prizes" />
            <StatCard
              icon={Calendar}
              label="Types Available"
              value={lotteryTypes?.length ? `${lotteryTypes.length}` : "50+"}
              sub="Unique lottery schemes"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 — RECENT RESULTS
      ═══════════════════════════════════════ */}
      {recentResults.length > 0 && (
        <section className="relative z-10 py-16 md:py-24 container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Latest Draws</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Recent Results</h2>
            </div>
            <Link
              href="/results"
              className="group inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline underline-offset-4"
            >
              View all results <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Result list */}
            <div className="bg-card border border-border rounded-2xl p-4 divide-y divide-border/50">
              {recentResults.slice(0, 5).map((r: any, i: number) => (
                <ResultRow key={r.code || i} result={r} index={i} />
              ))}
            </div>

            {/* Right: Latest result highlight card */}
            {latestResult && (
              <div className="bg-card border border-primary/20 rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                      <Zap className="w-3 h-3" /> Latest Draw
                    </span>
                    <h3 className="text-xl font-black leading-tight">{latestResult.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {latestResult.draw_date} · Draw #{latestResult.code}
                    </p>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                </div>

                {/* Prize breakdown */}
                {latestResult.prizes && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Prizes</p>
                    {formattedPrizes.filter((p: any) => p.rank !== "Other" && p.rank !== "Consolation").slice(0, 4).map((prize: any, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-primary/40"}`} />
                          <span className="text-sm font-semibold text-foreground">{prize.rank} Prize</span>
                        </div>
                        <span className="text-sm font-black text-primary">₹{prize.amount?.replace(/[^0-9,]/g, "")}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href={`/results/${latestResult.code}`}
                  className="group mt-auto w-full py-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary font-bold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  Full Result Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          SECTION 4 — LOTTERY TYPES
      ═══════════════════════════════════════ */}
      {lotteryTypes && lotteryTypes.length > 0 && (
        <section className="relative z-10 py-16 md:py-24 bg-card/30 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Explore</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Lottery Schemes</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">
                All active Kerala State Lottery schemes with daily and weekly draws.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
              {lotteryTypes.slice(0, 24).map((type: string, i: number) => (
                <Link
                  key={i}
                  href={`/results?name=${encodeURIComponent(type)}`}
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-primary/50 hover:bg-secondary/40 transition-all text-sm font-semibold text-foreground hover:text-primary"
                >
                  <Star className="w-3 h-3 text-accent-foreground group-hover:scale-110 transition-transform" />
                  {type}
                </Link>
              ))}
              {lotteryTypes.length > 24 && (
                <Link
                  href="/results"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  +{lotteryTypes.length - 24} More <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          SECTION 5 — TRUST / HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="relative z-10 py-16 md:py-24 container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Transparency</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">How We Work</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: Clock,
              step: "01",
              title: "Real-Time Monitoring",
              desc: "Our system continuously monitors the official Kerala lottery website and the IndiaLotteryAPI for draw results from ~3 PM IST.",
            },
            {
              icon: ShieldCheck,
              step: "02",
              title: "Verified & Cross-Checked",
              desc: "Results are validated against the official Gorky Bhavan PDF publications before being published to ensure 100% accuracy.",
            },
            {
              icon: Zap,
              step: "03",
              title: "Instant Updates",
              desc: "Our database updates within minutes of official publication. You get the freshest results with detailed prize breakdowns.",
            },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div
              key={step}
              className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group"
            >
              <span className="text-[80px] font-black text-border/60 leading-none absolute top-4 right-5 select-none pointer-events-none group-hover:text-primary/10 transition-colors">
                {step}
              </span>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-black mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 6 — FOOTER CTA
      ═══════════════════════════════════════ */}
      <section className="relative z-10 py-16 md:py-24 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Never Miss a Draw</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">
              Check Your Numbers <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                Right Now
              </span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              All Kerala lottery results, all in one place. Free, fast, and always verified.
            </p>
            <Link
              href="/results"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl hover:scale-[1.03] hover:shadow-[0_0_40px_color-mix(in_oklch,var(--color-primary)_40%,transparent)] transition-all"
            >
              EXPLORE ALL RESULTS
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-xs text-muted-foreground mt-6">
              Data sourced from Kerala State Lotteries Directorate · Results published after official draw
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}