import { memo } from 'react';
import LoadingSpinner from '../LoadingSpinner';

const RoundLoadingState = memo(() => {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner />
    </div>
  );
});

RoundLoadingState.displayName = 'RoundLoadingState';

export default RoundLoadingState;
