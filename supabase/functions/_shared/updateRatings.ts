export function updateRatings(
    homeRating: number,
    awayRating: number,
    homeGoals: number,
    awayGoals: number
  ) {
    const K = 20;
  
    // Expected probability
    const expectedHome =
      1 / (1 + Math.pow(10, (awayRating - homeRating) / 400));
  
    const expectedAway = 1 - expectedHome;
  
    // Actual result
    let actualHome = 0.5;
    let actualAway = 0.5;
  
    if (homeGoals > awayGoals) {
      actualHome = 1;
      actualAway = 0;
    } else if (awayGoals > homeGoals) {
      actualHome = 0;
      actualAway = 1;
    }
  
    // Rating update
    const newHome =
      homeRating + K * (actualHome - expectedHome);
  
    const newAway =
      awayRating + K * (actualAway - expectedAway);
  
    return {
      home: Math.round(newHome),
      away: Math.round(newAway),
    };
  }