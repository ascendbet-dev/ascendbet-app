export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
      
      {/* 🔥 BRAND */}
      <h1 className="text-white text-2xl font-semibold tracking-wide animate-fade">
        Ascend<span className="text-purple-400">Bet</span>
      </h1>

      {/* ⚡ LOADER BAR */}
      <div className="w-32 h-[3px] bg-white/10 rounded-full overflow-hidden">
        
        <div className="h-full w-1/2 bg-gradient-to-r from-purple-400 to-purple-600 animate-loading rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
      
      </div>

    </div>
  );
}