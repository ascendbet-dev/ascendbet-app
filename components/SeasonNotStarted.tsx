import { Countdown } from "@/components/Countdown";

export function SeasonNotStarted({ target }: { target: string }) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-sm rounded-2xl p-6
          bg-gradient-to-b from-[#1a0f2e] to-[#0d061a]
          border border-purple-500/20 text-center">
  
          <h2 className="text-white font-semibold mb-2">
            Season Not Started 🚀
          </h2>
  
          <p className="text-xs text-muted mb-4">
             opens in
          </p>
  
          <Countdown target={target} />
  
        </div>
      </div>
    );
  }