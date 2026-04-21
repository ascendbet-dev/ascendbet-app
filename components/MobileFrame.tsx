export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-bg-primary flex justify-center">

      {/* 🔥 APP FRAME */}
      <div
        data-app-frame
        className="relative w-full max-w-[420px] min-h-dvh bg-bg-primary"
      >
        {children}
      </div>

    </div>
  );
}

export function FrameOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center pointer-events-none">
      
      {/* 🔥 MUST BE RELATIVE */}
      <div className="relative w-full max-w-[420px] pointer-events-auto">
        {children}
      </div>

    </div>
  );
}