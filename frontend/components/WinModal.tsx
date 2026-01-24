"use client";
import { X, Trophy, Frown, Sparkles } from "lucide-react";

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWinner: boolean;
  prizeLabel?: string;
}

export default function WinModal({ isOpen, onClose, isWinner, prizeLabel }: WinModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-[#161616] border border-primary/30 w-full max-w-md rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute right-6 top-6 p-2 text-muted-foreground hover:text-white">
          <X className="w-6 h-6" />
        </button>

        {isWinner ? (
          <>
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-primary animate-bounce" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">CONGRATULATIONS!</h2>
            <p className="text-primary font-bold uppercase tracking-widest text-sm mb-6">You Won a Prize</p>
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-2 italic text-primary">
              {prizeLabel}
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Frown className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white/90">BETTER LUCK NEXT TIME</h2>
            <p className="text-muted-foreground uppercase tracking-widest text-xs mb-8 italic px-4 leading-relaxed">
              Unfortunatly, this ticket number did not win a prize in this draw.
            </p>
          </>
        )}

        <button 
          onClick={onClose}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest hover:brightness-110 transition-all"
        >
          Close Result
        </button>
      </div>
    </div>
  );
}