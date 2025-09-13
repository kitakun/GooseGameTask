import { memo } from 'react';
import { Trophy } from 'lucide-react';
import { RoundWithStats } from '../../types';

type StatsSectionProps = {
  round: RoundWithStats;
  userRole?: string;
};

const StatsSection = memo(({ round, userRole }: StatsSectionProps) => {
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
            <span className="font-medium">{round.userTaps}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ваши очки:</span>
            <span className="font-medium">{round.userPoints}</span>
          </div>
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
            <span className="font-medium">{round.totalTaps}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Всего очков:</span>
            <span className="font-medium">{round.totalPoints}</span>
          </div>
          {round.winner && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-gray-600 flex items-center">
                <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                Победитель:
              </span>
              <span className="font-medium">
                {round.winner.username} ({round.winner.points}{" "}
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
