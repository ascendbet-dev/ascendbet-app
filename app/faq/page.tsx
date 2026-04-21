import FAQClient from "./FAQClient";

export default function FAQPage() {

  const faqs = [
    {
      category: "Overview",
      items: [
        {
          q: "What is AscendBet?",
          a: "AscendBet is a competitive sports prediction platform where users compete over a 21-day season. You are ranked based on performance, discipline, and consistency.",
        },
        {
          q: "How does the challenge work?",
          a: "Each season lasts 21 days. You start with a virtual balance and make predictions under structured rules. At the end of the season, top performers on the leaderboard receive rewards.",
        },
        {
          q: "Is it free to join?",
          a: "Yes. The current season is completely free to join. Future challenges may include paid access with larger rewards.",
        },
      ],
    },
  
    {
      category: "Ranking System",
      items: [
        {
          q: "How are rankings decided?",
          a: "Rankings are based on a combination of your virtual balance, discipline score, number of settled picks, and active participation days.",
        },
        {
          q: "What is Discipline Score?",
          a: "Discipline Score measures how well you follow platform rules — including pick limits, consistency, and risk management.",
        },
        {
          q: "Can I win without having the highest balance?",
          a: "Yes. Balance is important, but discipline, activity, and consistency also play a major role.",
        },
      ],
    },
  
    {
      category: "Challenge Rules",
      items: [
        {
          q: "How many tickets can I placed per day?",
          a: "You can make a maximum of 3 tickets per day. This rule ensures fairness and promotes disciplined participation.",
        },
        {
          q: "What happens if I exceed the limit?",
          a: "You will not be allowed to place another ticket beyond the daily limit.",
        },
        {
          q: "What types of selections can I make?",
          a: "You can make single or multiple selections depending on available matches.",
        },
      ],
    },
  
    {
      category: "Drawdown & Risk",
      items: [
        {
          q: "What is drawdown?",
          a: "Drawdown is the minimum balance threshold. If your virtual balance drops below it, you can no longer make picks for that season.",
        },
        {
          q: "What happens when I hit drawdown?",
          a: "You will stop participating for the remainder of the season, but your ranking will remain based on your performance.",
        },
        {
          q: "Can I still win after hitting drawdown?",
          a: "Yes. Strong performance before hitting drawdown can still place you among top competitors.",
        },
      ],
    },
  
    {
      category: "Rewards",
      items: [
        {
          q: "How do I win the challenge?",
          a: "At the end of the season, top-ranked users on the leaderboard receive rewards based on their final positions.",
        },
        {
          q: "How are rewards determined?",
          a: "Rewards are fixed and defined before each challenge begins. They are not based on pooled user funds.",
        },
        {
          q: "Will there be bigger rewards in the future?",
          a: "Yes. AscendBet will introduce premium challenges with larger rewards as the platform grows.",
        },
      ],
    },
  
    {
      category: "Strategy & Fair Play",
      items: [
        {
          q: "Is this about luck or skill?",
          a: "AscendBet is designed to reward skill. Discipline, consistency, and smart decision-making matter more than short-term outcomes.",
        },
        {
          q: "What is the best strategy to perform well?",
          a: "Stay consistent, manage risk, follow rules, and focus on quality selections rather than quantity.",
        },
      ],
    },
  
    {
      category: "Referral System",
      items: [
        {
          q: "How does referral work?",
          a: "You can invite others using your referral code. As the platform evolves, referrals may unlock additional benefits.",
        },
        {
          q: "Do referrals affect ranking?",
          a: "No. Rankings are strictly based on performance within the challenge.",
        },
      ],
    },
  
    {
      category: "General",
      items: [
        {
          q: "Can I join multiple seasons?",
          a: "Yes. Each season is a new competition with a fresh start for all users.",
        },
        {
          q: "Can I reset my progress mid-season?",
          a: "No. Once a season begins, your progress is locked until it ends.",
        },
        {
          q: "Can I join in the middle of a season?",
          a: "No. You can only join before a new season begins.",
        },
        {
          q: "Why is there a daily limit?",
          a: "The limit promotes fairness, discipline, and balanced participation across all users.",
        },
      ],
    },
  ];

  return <FAQClient faqs={faqs} />;
}