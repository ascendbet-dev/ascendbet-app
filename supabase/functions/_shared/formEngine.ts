// formEngine.ts

export async function getTeamMatches(supabase: any, team: string) {

  console.log(`📥 Fetching matches for: ${team}`);

  const { data, error } = await supabase
    .from("team_match_history")
    .select("*")
    .or(`home_team.eq.${team},away_team.eq.${team}`)
    .order("match_date", { ascending: false })
    .limit(5);

  if (error) {
    console.log("❌ DB ERROR (matches):", error.message);
    return [];
  }

  console.log(`📊 ${team} matches found:`, data?.length);

  if (!data || data.length === 0) {
    console.log(`⚠️ No matches for ${team}`);
    return [];
  }

  console.log("🧪 SAMPLE MATCH:", data[0]);

  return data;
}


/* ---------------- FORM CALCULATION ---------------- */

export function calculateForm(matches: any[], team: string) {

  console.log(`⚙️ Calculating form for: ${team}`);

  if (!matches.length) {
    return {
      points: 0,
      avgGoalsFor: 0,
      avgGoalsAgainst: 0,
      winStreak: 0
    };
  }

  let points = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let winStreak = 0;

  for (const m of matches) {

    const isHome = m.home_team === team;

    const gf = isHome ? m.home_goals : m.away_goals;
    const ga = isHome ? m.away_goals : m.home_goals;

    console.log(`🧾 ${team} match → ${m.home_team} ${m.home_goals} - ${m.away_goals} ${m.away_team}`);

    goalsFor += gf;
    goalsAgainst += ga;

    if (gf > ga) {
      points += 3;
      winStreak++;
    } else if (gf === ga) {
      points += 1;
      winStreak = 0;
    } else {
      winStreak = 0;
    }
  }

  const avgGoalsFor = goalsFor / matches.length;
  const avgGoalsAgainst = goalsAgainst / matches.length;

  const result = {
    points,                // max 15
    avgGoalsFor,
    avgGoalsAgainst,
    winStreak
  };

  console.log(`📈 FORM RESULT (${team}):`, result);

  return result;
}