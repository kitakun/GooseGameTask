import { memo } from 'react';
import { Link } from 'react-router-dom';

type RoundErrorStateProps = {
  error: string;
};

const RoundErrorState = memo(({ error }: RoundErrorStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md max-w-md mx-auto">
        {error}
      </div>
      <Link
        to="/rounds"
        className="mt-4 inline-block text-blue-600 hover:text-blue-800"
      >
        Назад к раундам
      </Link>
    </div>
  );
});

RoundErrorState.displayName = 'RoundErrorState';

export default RoundErrorState;
