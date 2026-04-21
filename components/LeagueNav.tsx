import Link from "next/link";
import Image from "next/image";

const leagues = [
  { name: "EPL", image: "/leagues/epl.png", link: "/place-bet?league=premier_league" },
  { name: "La Liga", image: "/leagues/laliga.png", link: "/place-bet?league=la_liga" },
  { name: "Bundesliga", image: "/leagues/bundesliga.png", link: "/place-bet?league=bundesliga" },
  { name: "Serie A", image: "/leagues/seriea.png", link: "/place-bet?league=serie_a" },
  { name: "Ligue 1", image: "/leagues/ligue1.png", link: "/place-bet?league=ligue1" },
];

export function LeagueNav() {
  return (
    <div className="bg-bg-primary">

      <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-2 scrollbar-hide">

        {leagues.map((league) => (

          <Link
            key={league.name}
            href={league.link}
            className="flex min-w-[65px] flex-col items-center gap-1 rounded-xl bg-surface px-2 py-2 hover:bg-accent/10 transition"
          >

            <Image
              src={league.image}
              alt={league.name}
              width={48}
              height={48}
              className="object-contain"
            />

            <span className="text-[11px] text-muted text-center leading-none">
              {league.name}
            </span>

          </Link>

        ))}

      </div>

    </div>
  );
}