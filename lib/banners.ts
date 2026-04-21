import { createClient } from "@/lib/supabase/server";

/* 🔹 TYPES */
export type BannerType =
  | "leaderboard"
  | "faq"
  | "how_it_works"
  | "matchday"
  | "registration";

export type Banner = {
  id: string;
  type: BannerType;
  image: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
  expires_at?: string;
};

/* 🔹 STATIC FALLBACK */
export const staticBanners: Banner[] = [
  {
    id: "leaderboard",
    type: "leaderboard",
    image: "/banners/leaderboard-v1.png",
    title: "Climb the Leaderboard",
    subtitle: "Every correct pick moves you closer to the top 50",
    buttonText: "See Rankings",
    link: "/leaderboard",
  },
  {
    id: "registration",
    type: "registration",
    image: "/banners/registration-clean-v1.png",
    title: "Register for Next Season",
    subtitle: "Get ready to start climbing the leaderboard",
    buttonText: "Reserve Entry",
    link: "/signup",
    expires_at: "2026-04-01T00:00:00Z"
  },
  {
    id: "how_it_works",
    type: "how_it_works",
    image: "/banners/how-it-works-v1.png",
    title: "New to AscendBet?",
    subtitle: "Learn how the challenge works.",
    buttonText: "How It Works",
    link: "/how-it-works",
  },
  {
    id: "matchday",
    type: "matchday",
    image: "/banners/matchday.png",
    title: "Matchday is Live ⚽",
    subtitle: "Make your picks for tonight's big games",
    buttonText: "Make Picks",
    link: "/place-bet",
  },
  {
    id: "faq",
    type: "faq",
    image: "/banners/faq-v1.png",
    title: "Not Getting AscendWhat?",
    subtitle: "Learn how AscendBet works.",
    buttonText: "Visit FAQ",
    link: "/faq",
  },
  
];

/* 🔥 FETCH FUNCTION */
export async function getBanners(): Promise<Banner[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("active", true);

  /* ✅ IF NO DB BANNERS → USE STATIC */
  const dbBanners =
  data?.map((b: any) => ({
    id: b.id,
    type: b.type,
    image: b.image,
    title: b.title,
    subtitle: b.subtitle,
    buttonText: b.button_text || null,
    link: b.link,
    expires_at: b.expires_at,
  })) || [];

/* ❌ Remove static if same type exists */
const filteredStatic = staticBanners.filter(
  (s) => !dbBanners.some((d) => d.type === s.type)
);

return [...dbBanners, ...filteredStatic];

}