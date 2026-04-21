import { banners } from "./banners"

export function getActiveBanner({
  user,
  isNewUser,
  matchdayLive,
  registrationEnd
}: {
  user: any
  isNewUser: boolean
  matchdayLive: boolean
  registrationEnd: Date
}) {

  const now = new Date()
  const timeLeft = registrationEnd.getTime() - now.getTime()

  const hoursLeft = timeLeft / (1000 * 60 * 60)

  /* MATCHDAY PRIORITY */
  if (matchdayLive) {
    return banners.find(b => b.type === "matchday")
  }

  /* REGISTRATION URGENCY */

  if (hoursLeft <= 1) {
    return {
      ...banners.find(b => b.type === "registration"),
      title: "FINAL CALL TO JOIN",
      subtitle: "Registration closes in less than 1 hour"
    }
  }

  if (hoursLeft <= 24) {
    return {
      ...banners.find(b => b.type === "registration"),
      title: "REGISTRATION CLOSING SOON",
      subtitle: "Less than 24 hours remaining"
    }
  }

  /* NEW USER HELP */

  if (isNewUser) {
    return banners.find(b => b.type === "how_it_works")
  }

  /* DEFAULT */

  return banners.find(b => b.type === "leaderboard")
}