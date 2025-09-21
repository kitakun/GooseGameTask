import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useRoundsStore } from "../store/roundsStore";
import { useAuthStore } from "../store/authStore";
import { tapApi } from "../api";
import { UserTapStats, RoundStats, Winner } from "../types";
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
} from "../components/RoundPage";

const RoundPage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentRound, isLoading, error, fetchRound } = useRoundsStore();
  const { user } = useAuthStore();
  const showLoader = useDelayedLoader(isLoading, 250);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTapping, setIsTapping] = useState(false);
  const [tapSuccess, setTapSuccess] = useState<boolean>(false);
  const [showTapAnimation, setShowTapAnimation] = useState(false);
  const [userStats, setUserStats] = useState<UserTapStats>({ taps: 0, points: 0 });
  const [roundStats, setRoundStats] = useState<RoundStats>({ totalTaps: 0, totalPoints: 0 });
  const [winner, setWinner] = useState<Winner | null>(null);

  // Fetch user and round statistics
  const fetchStats = useCallback(async () => {
    if (!currentRound || !user) return;
    
    try {
      const response = await tapApi.getStats(currentRound.id);
      setUserStats(response.userStats);
      setRoundStats(response.roundStats);
      setWinner(response.winner);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, [currentRound, user]);

  useEffect(() => {
    if (id) {
      fetchRound(id);
    }
  }, [id, fetchRound]);

  // Auto-refresh round data and user stats every 2 seconds ONLY when round is active
  useEffect(() => {
    if (!currentRound || !user) return;

    const interval = setInterval(() => {
      // Always check current round status before fetching
      const status = getRoundStatus(currentRound);
      if (status.status === 'active') {
        fetchRound(currentRound.id);
        fetchStats();
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [currentRound, user, fetchRound, fetchStats]);

  // Initial fetch of stats
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
      // Atomic operation - just send roundId, no response data
      await tapApi.tap(currentRound.id);
      setTapSuccess(true);

      // Refresh round data and stats immediately
      fetchRound(currentRound.id);
      fetchStats();
    } catch (error: any) {
      console.error("Tap failed:", error);
    } finally {
      setIsTapping(false);
      setTimeout(() => {
        setShowTapAnimation(false);
        setTapSuccess(false);
      }, 200);
    }
  }, [currentRound, user, isTapping, fetchRound, fetchStats]);

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
      
      {/* Rules Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">
          Правила раунда:
        </h3>
        <div className="space-y-2 text-blue-800">
          <div className="flex items-start">
            <span className="font-medium mr-2">•</span>
            <span>1 тап = 1 очко, каждый одиннадцатый тап дает 10 очков</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2">•</span>
            <span>Тапать можно только в рамках активного раунда</span>
          </div>
          <div className="flex items-start">
            <span className="font-medium mr-2">•</span>
            <span>Активный раунд тот, который уже начался, но еще не закончился</span>
          </div>
        </div>
      </div>
      
      <StatsSection 
        round={currentRound} 
        userRole={user?.role}
        userStats={userStats}
        roundStats={roundStats}
        winner={winner}
      />
      
      {tapSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Tap recorded successfully!
        </div>
      )}
    </div>
  );
};

export default RoundPage;
