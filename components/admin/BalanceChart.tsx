"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function BalanceChart({ data }: any) {
  return (
    <div className="bg-[#140a26] rounded-2xl p-4">

      <p className="text-sm text-muted mb-3">
        Balance Distribution
      </p>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="range" stroke="#888" fontSize={10} />
          <Tooltip />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}