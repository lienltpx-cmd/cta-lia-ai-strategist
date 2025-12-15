
import React from 'react';
import { AbTestPair } from '../shared/types';
import CtaCard from './CtaCard';

interface AbTestCardProps {
  pair: AbTestPair;
  sharedCss: string;
}

const AbTestCard: React.FC<AbTestCardProps> = ({ pair, sharedCss }) => {
  return (
    <div className="bg-base-300/50 p-4 rounded-lg border border-base-300">
      <div>
        <h3 className="font-semibold">Position: <span className="font-normal text-brand-light">{pair.position}</span></h3>
        <p className="text-sm text-gray-400 mt-1">{pair.reasoning}</p>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <CtaCard variant={pair.variants[0]} sharedCss={sharedCss} />
        <CtaCard variant={pair.variants[1]} sharedCss={sharedCss} />
      </div>
    </div>
  );
};

export default AbTestCard;
