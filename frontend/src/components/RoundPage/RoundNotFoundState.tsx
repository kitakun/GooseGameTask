import { memo } from 'react';
import { Link } from 'react-router-dom';

const RoundNotFoundState = memo(() => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">Раунд не найден</p>
      <Link
        to="/rounds"
        className="mt-4 inline-block text-blue-600 hover:text-blue-800"
      >
        Назад к раундам
      </Link>
    </div>
  );
});

RoundNotFoundState.displayName = 'RoundNotFoundState';

export default RoundNotFoundState;
