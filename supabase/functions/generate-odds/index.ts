async function fetchFixtures(){

  const today = new Date()
  const future = new Date()

  future.setDate(today.getDate()+14)

  const from = today.toISOString().split("T")[0]
  const to = future.toISOString().split("T")[0]

  const res = await fetch(
    `https://api.football-data.org/v4/matches?dateFrom=${from}&dateTo=${to}`,
    {
      headers:{
        "X-Auth-Token": API_KEY!
      }
    }
  )

  const data = await res.json()

  if(!data.matches) return []

  const now = new Date()

  const filtered = data.matches.filter((m:any)=>{

    if(!m.competition?.code) return false

    if(!COMPETITIONS.includes(m.competition.code)) return false

    if(!m.homeTeam?.name || !m.awayTeam?.name) return false

    /* ensure match is in the future */

    if(new Date(m.utcDate) <= now) return false

    return true

  })

  return filtered.slice(0,200)

}