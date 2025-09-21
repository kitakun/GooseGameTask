export const getRoundDuration = (): number => {
  return parseInt(process.env["ROUND_DURATION"] || "60") * 60 * 1000;
};

export const getCooldownDuration = (): number => {
  return parseFloat(process.env["COOLDOWN_DURATION"] || "30") * 60 * 1000;
};

export const calculateRoundDates = (): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const cooldownDuration = getCooldownDuration();
  const roundDuration = getRoundDuration();

  const startDate = new Date(now.getTime() + cooldownDuration);
  const endDate = new Date(startDate.getTime() + roundDuration);

  return { startDate, endDate };
};

export const isRoundActive = (round: {
  startDate: Date;
  endDate: Date;
}): boolean => {
  const now = new Date();
  return now >= round.startDate && now <= round.endDate;
};

export const calculatePoints = (tapCount: number): number => {
  let totalPoints = 0;

  for (let i = 1; i <= tapCount; i++) {
    if (i % 11 === 0) {
      totalPoints += 10;
    } else {
      totalPoints += 1;
    }
  }

  return totalPoints;
};
