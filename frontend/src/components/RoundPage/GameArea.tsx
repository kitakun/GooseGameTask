import { memo } from 'react';
import { RoundStatus } from '../../utils/roundUtils';

type GameAreaProps = {
  status: RoundStatus;
  canTap: boolean;
  isTapping: boolean;
  showTapAnimation: boolean;
  userRole?: string;
  onTap: () => void;
};

const GameArea = memo(({ 
  status, 
  canTap, 
  isTapping, 
  showTapAnimation, 
  userRole, 
  onTap 
}: GameAreaProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Жмите на гуся!</h2>

      <div className="relative">
        <button
          onClick={onTap}
          disabled={!canTap || isTapping}
          className={`
            goose-animation text-8xl transition-all duration-200
            ${
              canTap
                ? "hover:scale-105 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }
            ${showTapAnimation ? "goose-bounce" : ""}
            ${status.status === "active" ? "pulse-animation" : ""}
          `}
        >
          🦆
        </button>

        {!canTap && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-600">
                {status.status === "not_started"
                  ? "Раунд еще не начался"
                  : status.status === "finished"
                  ? "Раунд завершен"
                  : userRole === "ADMIN"
                  ? "Админы не могут кликать"
                  : "Нельзя кликать"}
              </p>
            </div>
          </div>
        )}
      </div>

      {canTap && (
        <p className="mt-4 text-gray-600">
          {userRole === "NIKITA"
            ? "Ваши клики не засчитываются, но вы все равно можете кликиать!"
            : "Кликайте по гусю, чтобы заработать очки!"}
        </p>
      )}
    </div>
  );
});

GameArea.displayName = 'GameArea';

export default GameArea;
