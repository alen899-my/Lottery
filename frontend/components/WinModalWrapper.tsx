"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import WinModal from "@/components/WinModal";

interface Props {
  data: {
    prizes: { [key: string]: string[] };
  };
}

export default function WinModalWrapper({ data }: Props) {
  const [search, setSearch] = useState("");
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

 const handleCheck = () => {
  // 1. Clean the input: Remove extra spaces and make Uppercase
  const input = search.trim().toUpperCase().replace(/\s+/g, " "); 
  if (!input || input.length < 4) return;

  // 2. Extract only numbers for digit-based matching (e.g., "XA 123456" -> "123456")
  const inputNumbersOnly = input.replace(/[^0-9]/g, "");
  
  let found = false;
  let rank = "";

  Object.entries(data.prizes || {}).forEach(([label, numbers]) => {
    const labelLower = label.toLowerCase();
    const isHighPrize = labelLower.includes("1st") || 
                        labelLower.includes("2nd") || 
                        labelLower.includes("3rd") || 
                        labelLower.includes("consolation");

    const hasMatch = numbers.some((n: string) => {
      // Clean the winning number from DB
      const winNum = n.trim().toUpperCase().replace(/\s+/g, " ");
      const winNumbersOnly = winNum.replace(/[^0-9]/g, "");
      
      // CASE 1: High Prizes (1st, 2nd, 3rd, Consolation)
      // These MUST match the full string exactly (e.g., "XA 138455")
      if (isHighPrize) {
        return winNum === input;
      } 
      
      // CASE 2: Digit Prizes (4th Rank to 8th Rank)
      // If the winning number in DB is 4 digits (e.g., "0298")
      if (winNumbersOnly.length === 4) {
        // Match if the user's input ends with these 4 digits
        return inputNumbersOnly.endsWith(winNumbersOnly);
      }
      
      // If the winning number in DB is 6 digits (the number part only)
      if (winNumbersOnly.length === 6) {
        return inputNumbersOnly === winNumbersOnly;
      }

      // Default: Strict match for anything else
      return winNum === input;
    });

    if (hasMatch && !found) {
      found = true;
      rank = formatReadablePrize(label);
    }
  });

  setIsWinner(found);
  setWonPrize(rank);
  setModalOpen(true);
};
  return (
    <>
      <WinModal isOpen={modalOpen} onClose={() => setModalOpen(false)} isWinner={isWinner} prizeLabel={wonPrize} />
      
      <div className="flex gap-2 mt-6 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
          <input 
            type="text" 
            placeholder="Enter full ticket number..." 
            className="w-full bg-[#161616] border border-primary/20 rounded-xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-primary/50 text-md font-mono text-white placeholder:text-muted-foreground/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          />
        </div>
        <button 
          onClick={handleCheck}
          className="px-8 bg-primary text-black font-black uppercase text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(200,160,50,0.2)]"
        >
          Check
        </button>
      </div>
    </>
  );
}