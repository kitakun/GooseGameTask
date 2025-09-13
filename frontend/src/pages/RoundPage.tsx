import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useRoundsStore } from "../store/roundsStore";
import { useAuthStore } from "../store/authStore";
import { tapApi } from "../api";
import { getRoundStatus } from "../utils/roundUtils";
import { useDelayedLoader } from "../hooks/useDelayedLoader";
import {
  RoundLoadingState,
  RoundErrorState,
  RoundNotFoundState,
  RoundHeader,
  RoundStatusCard,
  GameArea,
  StatsSection,
  TapResult,
} from "../components/RoundPage";

const RoundPage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentRound, isLoading, error, fetchRound } = useRoundsStore();
  const { user } = useAuthStore();
  const showLoader = useDelayedLoader(isLoading, 250);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTapping, setIsTapping] = useState(false);
  const [tapResult, setTapResult] = useState<{
    points: number;
    totalPoints: number;
    taps: number;
  } | null>(null);
  const [showTapAnimation, setShowTapAnimation] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRound(id);
    }
  }, [id, fetchRound]);

  useEffect(() => {
    if (!currentRound) return;

    const interval = setInterval(() => {
      const status = getRoundStatus(currentRound);
      if (status.timeLeft !== undefined) {
        setTimeLeft(status.timeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRound]);

  const handleTap = useCallback(async () => {
    if (!currentRound || !user || isTapping) return;

    const status = getRoundStatus(currentRound);
    if (status.status !== "active") return;

    setIsTapping(true);
    setShowTapAnimation(true);

    try {
      const result = await tapApi.tap(currentRound.id);
      setTapResult({
        points: result.points,
        totalPoints: result.totalPoints,
        taps: result.taps,
      });

      if (id) {
        fetchRound(id);
      }
    } catch (error: any) {
      console.error("Tap failed:", error);
    } finally {
      setIsTapping(false);
      setTimeout(() => setShowTapAnimation(false), 200);
    }
  }, [currentRound, user, isTapping, id, fetchRound]);

  if (showLoader) {
    return <RoundLoadingState />;
  }

  if (error) {
    return <RoundErrorState error={error} />;
  }

  if (!currentRound) {
    return <RoundNotFoundState />;
  }

  const status = getRoundStatus(currentRound);
  const canTap = status.status === "active" && user?.role !== "ADMIN";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <RoundHeader roundId={currentRound.id} />
      
      <RoundStatusCard 
        round={currentRound} 
        status={status} 
        timeLeft={timeLeft} 
      />
      
      <GameArea
        status={status}
        canTap={canTap}
        isTapping={isTapping}
        showTapAnimation={showTapAnimation}
        userRole={user?.role}
        onTap={handleTap}
      />
      
      <StatsSection 
        round={currentRound} 
        userRole={user?.role} 
      />
      
      {tapResult && (
        <TapResult 
          points={tapResult.points} 
          totalPoints={tapResult.totalPoints} 
        />
      )}
    </div>
  );
};

export default RoundPage;
