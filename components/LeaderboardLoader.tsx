export default function LeaderboardLoader() {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        
        {/* HEADER */}
        <div className="h-6 w-40 bg-white/10 rounded" />
  
        {/* TOP 3 (BIG CARDS) */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-white/10 rounded-xl"
            />
          ))}
        </div>
  
        {/* LIST ITEMS */}
        <div className="space-y-3">
          {[1,2,3,4,5,6].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/10 rounded" />
                <div className="h-3 w-24 bg-white/10 rounded" />
              </div>
  
              {/* RIGHT */}
              <div className="h-3 w-12 bg-white/10 rounded" />
            </div>
          ))}
        </div>
  
      </div>
    );
  }