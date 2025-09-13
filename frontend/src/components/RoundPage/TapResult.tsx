import { memo } from 'react';

type TapResultProps = {
  points: number;
  totalPoints: number;
};

const TapResult = memo(({ points, totalPoints }: TapResultProps) => {
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-center">
      <p className="font-medium">
        +{points} очков! (Всего: {totalPoints})
      </p>
    </div>
  );
});

TapResult.displayName = 'TapResult';

export default TapResult;
