import React, { useState } from 'react';
import { AiFullStrategyResponse } from '../types';
import AbTestCard from './AbTestCard';
import { ClipboardIcon, CheckIcon } from './icons';

interface ResultsDisplayProps {
  response: AiFullStrategyResponse;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ response }) => {
  const [copiedCss, setCopiedCss] = useState(false);

  const handleCopyCss = () => {
    const cssToCopy = response.sharedCss.replace(/<\/?style>/g, '').trim();
    navigator.clipboard.writeText(cssToCopy);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  return (
    <div className="space-y-8 mt-8">
      <section className="bg-base-200 p-6 rounded-lg border border-base-300">
        <h2 className="text-2xl font-bold mb-4 text-white">Chiến lược tổng thể</h2>
        <p className="text-gray-300 whitespace-pre-wrap">{response.overallStrategy}</p>
      </section>

      <section className="bg-base-200 p-6 rounded-lg border border-base-300">
        <h2 className="text-2xl font-bold mb-4 text-white">Phân tích chi tiết (5C)</h2>
        <div className="space-y-2">
          {response.analysis.map((item, index) => (
            <details key={index} className="bg-base-300/50 p-3 rounded-lg group" open={index < 2}>
              <summary className="font-semibold cursor-pointer text-brand-light group-open:text-white transition-colors">{item.title}</summary>
              <p className="text-gray-400 mt-2 whitespace-pre-wrap">{item.content}</p>
            </details>
          ))}
        </div>
      </section>
      
      <section className="bg-base-200 p-6 rounded-lg border border-base-300">
        <h2 className="text-2xl font-bold mb-4 text-white">Rủi ro & Đề xuất</h2>
        <p className="text-gray-300 whitespace-pre-wrap">{response.risksAndRecommendations}</p>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white">Cặp A/B Test & Vị trí đặt</h2>
            <div className="relative">
              <button
                onClick={handleCopyCss}
                className="flex items-center gap-2 bg-base-300 hover:bg-base-300/80 text-white font-semibold py-2 px-4 rounded-md transition duration-200 text-sm"
              >
                {copiedCss ? <CheckIcon className="w-4 h-4 text-green-400"/> : <ClipboardIcon className="w-4 h-4" />}
                {copiedCss ? 'Copied CSS!' : 'Copy Shared CSS'}
              </button>
            </div>
        </div>
        <div className="space-y-6">
          {response.abTestPairs.map((pair, index) => (
            <AbTestCard key={index} pair={pair} sharedCss={response.sharedCss} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResultsDisplay;
