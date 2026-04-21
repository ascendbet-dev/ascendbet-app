export default function DashboardLoader() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">

      <div className="flex items-center gap-2">

        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-purple-400/80 animate-pulseDot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}

      </div>

    </div>
  );
}