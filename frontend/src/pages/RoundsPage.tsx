import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRoundsStore } from "../store/roundsStore";
import { useAuthStore } from "../store/authStore";
import { Round } from "../types";
import {
  getRoundStatus,
  formatTimeLeft,
  formatDate,
} from "../utils/roundUtils";
import LoadingSpinner from "../components/LoadingSpinner";
import { Plus, Clock, Play, CheckCircle } from "lucide-react";

const getStatusIcon = (round: Round) => {
  const status = getRoundStatus(round);
  switch (status.status) {
    case "not_started":
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case "active":
      return <Play className="w-5 h-5 text-green-500" />;
    case "finished":
      return <CheckCircle className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusText = (round: Round, timeLeft: { [key: string]: number }) => {
  const status = getRoundStatus(round);
  switch (status.status) {
    case "not_started":
      return `Начинается через ${formatTimeLeft(timeLeft[round.id] || 0)}`;
    case "active":
      return `Заканчивается через ${formatTimeLeft(timeLeft[round.id] || 0)}`;
    case "finished":
      return "Завершен";
  }
};

const getStatusColor = (round: Round) => {
  const status = getRoundStatus(round);
  switch (status.status) {
    case "not_started":
      return "bg-yellow-50 border-yellow-200";
    case "active":
      return "bg-green-50 border-green-200";
    case "finished":
      return "bg-gray-50 border-gray-200";
  }
};

const RoundsPage = () => {
  const { rounds, isLoading, error, fetchRounds, createRound } =
    useRoundsStore();
  const { user } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: Record<string, number> = {};
      rounds.forEach((round) => {
        const status = getRoundStatus(round);
        if (status.timeLeft !== undefined) {
          newTimeLeft[round.id] = status.timeLeft;
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [rounds]);

  const handleCreateRound = async () => {
    try {
      const newRound = await createRound();
      window.location.href = `/rounds/${newRound.id}`;
    } catch (error) {
      // ignore
    }
  };

  if (isLoading && rounds.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Раунды</h1>
        {user?.role === "ADMIN" && (
          <button
            onClick={handleCreateRound}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            <span>Создать раунд</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {rounds.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Нет доступных раундов</p>
          {user?.role === "ADMIN" && (
            <p className="text-gray-400 text-sm mt-2">
              Создайте свой первый раунд для начала
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rounds.map((round) => (
            <Link
              key={round.id}
              to={`/rounds/${round.id}`}
              className={`block p-6 rounded-lg border-2 transition-all hover:shadow-md ${getStatusColor(
                round
              )}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(round)}
                  <span className="font-medium text-gray-900">
                    Раунд {round.id.slice(-8)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <div>Начало: {formatDate(round.startDate)}</div>
                  <div>Конец: {formatDate(round.endDate)}</div>
                </div>

                <div className="text-sm font-medium">
                  {getStatusText(round, timeLeft)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoundsPage;
