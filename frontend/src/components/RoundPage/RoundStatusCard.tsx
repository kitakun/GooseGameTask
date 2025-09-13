import { memo } from 'react';
import { Clock, Play, CheckCircle } from 'lucide-react';
import { Round } from '../../types';
import { RoundStatus, formatTimeLeft, formatDate } from '../../utils/roundUtils';

type RoundStatusCardProps = {
  round: Round;
  status: RoundStatus;
  timeLeft: number;
};

const RoundStatusCard = memo(({ round, status, timeLeft }: RoundStatusCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Статус раунда</h1>
        <div className="flex items-center space-x-2">
          {status.status === "not_started" && (
            <Clock className="w-6 h-6 text-yellow-500" />
          )}
          {status.status === "active" && (
            <Play className="w-6 h-6 text-green-500" />
          )}
          {status.status === "finished" && (
            <CheckCircle className="w-6 h-6 text-gray-500" />
          )}
          <span className="font-medium capitalize">
            {status.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Время начала</div>
          <div className="font-medium">
            {formatDate(round.startDate)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Время окончания</div>
          <div className="font-medium">
            {formatDate(round.endDate)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Осталось времени</div>
          <div className="font-medium">
            {status.status === "finished"
              ? "Завершен"
              : formatTimeLeft(timeLeft)}
          </div>
        </div>
      </div>
    </div>
  );
});

RoundStatusCard.displayName = 'RoundStatusCard';

export default RoundStatusCard;
