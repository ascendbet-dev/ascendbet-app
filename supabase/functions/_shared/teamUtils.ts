export const TEAM_ALIASES: Record<string,string> = {
  "arsenalfc": "arsenal",
  "arsenal": "arsenal",

  "liverpoolfc": "liverpool",
  "liverpool": "liverpool",

  "manchestercity": "mancity",
  "mancity": "mancity",

  "chelsea": "chelsea",

  "psg": "psg",
  "parissg": "psg",

  "realbetisbalompie": "realbetis",
  "atleticodemadrid": "atleticomadrid",
  "realmadridcf": "realmadrid",
  "fcbarcelona": "barcelona",

  "roma": "roma"
}

export function simplify(name:string){
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/fc|cf|afc|sc|ac|as|tsg/gi,"")
    .replace(/[^a-z0-9]/g,"")
}

export function getCanonicalTeam(name:string){

  const cleaned = simplify(name)

  if(TEAM_ALIASES[cleaned]){
    return TEAM_ALIASES[cleaned]
  }

  return cleaned
}