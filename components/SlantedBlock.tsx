export function SlantedBlock({
  children,
  className = "",
  variant = "row",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "header" | "row";
}) {

  const styles = {
    // 🔥 Header = more visible + separated
    header:
      "bg-gradient-to-r from-purple-500/40 to-purple-800/40 border-purple-400/40 text-purple-200 backdrop-blur",

    // ✅ Row = EXACTLY your current look (unchanged)
    row:
      "bg-gradient-to-r from-[#1a0f2e] to-[#140a26] border-purple-500/10 text-white",
  };

  return (
    <div
      className={`px-3 py-2 text-xs font-semibold capitalize text-center border transition-all duration-200 ${styles[variant]} ${className}`}
      style={{
        clipPath: "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)",
      }}
    >
      {children}
    </div>
  );
}