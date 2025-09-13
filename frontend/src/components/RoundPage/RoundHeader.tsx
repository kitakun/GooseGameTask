import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type RoundHeaderProps = {
  roundId: string;
};

const RoundHeader = memo(({ roundId }: RoundHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <Link
        to="/rounds"
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Вернуться к раундам</span>
      </Link>

      <div className="text-sm text-gray-500">
        Раунд {roundId.slice(-8)}
      </div>
    </div>
  );
});

RoundHeader.displayName = 'RoundHeader';

export default RoundHeader;
