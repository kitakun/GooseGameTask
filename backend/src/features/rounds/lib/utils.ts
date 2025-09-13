import { RoundStatus } from "@/domain/round/model";

export const getRoundDuration = (): number => {
  return parseInt(process.env["ROUND_DURATION"] || "60") * 60 * 1000;
};

export const getCooldownDuration = (): number => {
  return parseInt(process.env["COOLDOWN_DURATION"] || "30") * 60 * 1000;
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

export const getRoundStatus = (round: {
  startDate: Date;
  endDate: Date;
}): RoundStatus => {
  const now = new Date();

  if (now < round.startDate) {
    return {
      status: "not_started",
      timeLeft: round.startDate.getTime() - now.getTime(),
      startTime: round.startDate,
      endTime: round.endDate,
    };
  }

  if (now > round.endDate) {
    return {
      status: "finished",
      endTime: round.endDate,
    };
  }

  return {
    status: "active",
    timeLeft: round.endDate.getTime() - now.getTime(),
    startTime: round.startDate,
    endTime: round.endDate,
  };
};

export const calculatePoints = (tapCount: number): number => {
  // every 11th tap gives 10 points, others give 1 point
  const bonusTaps = Math.floor(tapCount / 11);
  const regularTaps = tapCount % 11;

  return bonusTaps * 10 + regularTaps;
};
