import { memo } from 'react';
import { Trophy } from 'lucide-react';
import { RoundWithStats, UserTapStats, RoundStats, Winner } from '../../types';

type StatsSectionProps = {
  round: RoundWithStats;
  userRole?: string;
  userStats: UserTapStats;
  roundStats: RoundStats;
  winner: Winner | null;
};

const StatsSection = memo(({ userRole, userStats, roundStats, winner }: StatsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Your Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Ваша статистика
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Ваши клики:</span>
            <span className="font-medium">{userStats.taps}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ваши очки:</span>
            <span className="font-medium">{userStats.points}</span>
          </div>
          {userStats.taps > 0 && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              {userStats.taps >= 11 ? (
                <>
                  Бонусные очки: {Math.floor(userStats.taps / 11)} × 10 = {Math.floor(userStats.taps / 11) * 10} очков
                  <br />
                  Обычные очки: {userStats.taps - Math.floor(userStats.taps / 11)} очков
                </>
              ) : (
                <>Все очки обычные (каждый 11-й тап дает +10 очков)</>
              )}
            </div>
          )}
          {userRole === "NIKITA" && (
            <div className="text-sm text-purple-600 bg-purple-50 p-2 rounded">
              Ваши клики не засчитываются за очки
            </div>
          )}
        </div>
      </div>

      {/* Round Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Статистика раунда
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Всего кликов:</span>
            <span className="font-medium">{roundStats.totalTaps}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Всего очков:</span>
            <span className="font-medium">{roundStats.totalPoints}</span>
          </div>
          {winner && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-gray-600 flex items-center">
                <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                Победитель:
              </span>
              <span className="font-medium">
                {winner.username} ({winner.points}{" "}
                очков)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

StatsSection.displayName = 'StatsSection';

export default StatsSection;
