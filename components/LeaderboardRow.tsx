import { SlantedBlock } from "@/components/SlantedBlock";

interface LeaderboardRowProps {
  rank: number;
  username: string;
  currentBalance: number;
  disciplineScore: number;
  isDisqualified: boolean;
  className?: string;
}

function formatBalance(n: number) {
  return `₦${n.toLocaleString()}`;
}

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function LeaderboardRow({
  rank,
  username,
  currentBalance,
  disciplineScore,
  isDisqualified,
  className = "",
}: LeaderboardRowProps) {

  // ✅ Badge logic
  let badge = "Contender";
  let badgeColor = "text-white";

  if (isDisqualified) {
    badge = "Eliminated";
    badgeColor = "text-red-400";
  } else if (currentBalance >= 120000) {
    badge = "Pro 👑";
    badgeColor = "text-yellow-400";
  }

  // ✅ Balance color
  let balanceColor = "text-white";
  if (currentBalance >= 120000) balanceColor = "text-green-400";
  else if (currentBalance <= 88000) balanceColor = "text-red-400";

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
    >

      {/* POS */}
      <SlantedBlock className="w-[40px] text-center">
        {rank}
      </SlantedBlock>

      {/* USER */}
      <SlantedBlock className="flex-1 text-center">
        {formatName(username)}
      </SlantedBlock>

      {/* BALANCE */}
      <SlantedBlock className={`w-[90px] text-center ${balanceColor}`}>
        {formatBalance(currentBalance)}
      </SlantedBlock>

      {/* SCORE */}
      <SlantedBlock className="w-[60px] text-center">
        {disciplineScore}
      </SlantedBlock>

      {/* BADGE */}
      <SlantedBlock className={`w-[90px] text-center normal-case ${badgeColor}`}>
        {badge}
      </SlantedBlock>

    </div>
  );
}