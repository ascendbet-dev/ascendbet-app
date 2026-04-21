export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      
      <div className="w-32 h-[3px] bg-white/10 rounded-full overflow-hidden">
        
        <div className="h-full w-1/2 bg-gradient-to-r from-purple-400 to-purple-600 animate-loading rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
      
      </div>

    </div>
  );
}