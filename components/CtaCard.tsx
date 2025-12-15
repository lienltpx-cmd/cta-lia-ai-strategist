
import React, { useState } from 'react';
import { CtaVariant } from '../shared/types';
import {
  CodeIcon,
  EyeIcon,
  ClipboardIcon,
  CheckIcon,
  SunIcon,
  MoonIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon
} from './icons';

interface CtaCardProps {
  variant: CtaVariant;
  sharedCss: string;
}

type ViewportSize = '100%' | '768px' | '375px';

const CtaCard: React.FC<CtaCardProps> = ({ variant, sharedCss }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [viewportSize, setViewportSize] = useState<ViewportSize>('100%');

  const iframeContent = `
    <html>
      <head>
        ${sharedCss}
        <style>
          body { 
            margin: 0; 
            padding: 1rem;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            background-color: ${previewTheme === 'dark' ? '#1f2937' : '#ffffff'}; 
            color: ${previewTheme === 'dark' ? '#d1d5db' : '#111827'};
            transition: background-color 0.2s, color 0.2s;
            overflow-x: hidden;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          }
          .content-wrapper {
            width: 100%;
            max-width: 100%;
          }
          /* Scrollbar styling */
          ::-webkit-scrollbar { width: 5px; height: 5px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #555; border-radius: 5px; }
          ::-webkit-scrollbar-thumb:hover { background: #777; }
        </style>
      </head>
      <body>
        <div class="content-wrapper">
          ${variant.htmlBlock}
        </div>
      </body>
    </html>
  `;

  const fullCodeForDisplay = `<!-- ====== SHARED CSS ====== -->
<!-- Place this once on your page -->
${sharedCss}

<!-- ====== HTML BLOCK ====== -->
<!-- Place this where you want the CTA to appear -->
${variant.htmlBlock}`;

  const fullCodeForClipboard = `${sharedCss}\n\n${variant.htmlBlock}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCodeForClipboard);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getViewportLabel = (size: ViewportSize) => {
    if (size === '375px') return 'Mobile (375px)';
    if (size === '768px') return 'Tablet (768px)';
    return 'Desktop (100%)';
  };

  return (
    <div className="bg-base-200 rounded-lg border border-base-300 overflow-hidden flex flex-col h-full">
      <div className="p-3 bg-base-300 flex justify-between items-center flex-wrap gap-2">
        <div className="flex-1 min-w-[150px]">
          <h4 className="font-bold text-lg text-white flex items-center gap-2">
            Variant {variant.variantName}
            {variant.variantName === 'A' ? <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full border border-blue-700">Control</span> : <span className="text-xs bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full border border-purple-700">Challenger</span>}
          </h4>
          <p className="text-xs text-gray-400 mt-1 line-clamp-1" title={variant.previewExplanation}>{variant.previewExplanation}</p>
        </div>

        <div className="flex items-center gap-1 bg-base-100/50 p-1 rounded-lg border border-base-300/30">
          <button onClick={() => setViewMode('preview')} title="Chế độ Xem trước" className={`p-1.5 rounded-md transition-colors ${viewMode === 'preview' ? 'bg-brand-primary text-white shadow-sm' : 'hover:bg-base-300 text-gray-400'}`}>
            <EyeIcon className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('code')} title="Chế độ Code" className={`p-1.5 rounded-md transition-colors ${viewMode === 'code' ? 'bg-brand-primary text-white shadow-sm' : 'hover:bg-base-300 text-gray-400'}`}>
            <CodeIcon className="w-4 h-4" />
          </button>

          {viewMode === 'preview' && (
            <>
              <div className="w-px h-4 bg-base-300 mx-1"></div>

              <button
                title="Mobile View"
                onClick={() => setViewportSize('375px')}
                className={`p-1.5 rounded-md transition-colors ${viewportSize === '375px' ? 'bg-brand-secondary text-white shadow-sm' : 'hover:bg-base-300 text-gray-400'}`}
              >
                <DevicePhoneMobileIcon className="w-4 h-4" />
              </button>
              <button
                title="Tablet View"
                onClick={() => setViewportSize('768px')}
                className={`p-1.5 rounded-md transition-colors ${viewportSize === '768px' ? 'bg-brand-secondary text-white shadow-sm' : 'hover:bg-base-300 text-gray-400'}`}
              >
                <DeviceTabletIcon className="w-4 h-4" />
              </button>
              <button
                title="Desktop View"
                onClick={() => setViewportSize('100%')}
                className={`p-1.5 rounded-md transition-colors ${viewportSize === '100%' ? 'bg-brand-secondary text-white shadow-sm' : 'hover:bg-base-300 text-gray-400'}`}
              >
                <ComputerDesktopIcon className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-base-300 mx-1"></div>

              <button title="Light Mode" onClick={() => setPreviewTheme('light')} className={`p-1.5 rounded-md transition-colors ${previewTheme === 'light' ? 'bg-yellow-600 text-white shadow-sm' : 'hover:bg-base-300 text-gray-400'}`}>
                <SunIcon className="w-4 h-4" />
              </button>
              <button title="Dark Mode" onClick={() => setPreviewTheme('dark')} className={`p-1.5 rounded-md transition-colors ${previewTheme === 'dark' ? 'bg-gray-600 text-white shadow-sm' : 'hover:bg-base-300 text-gray-400'}`}>
                <MoonIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-4 flex-grow min-h-[350px] bg-base-100 relative overflow-hidden flex justify-center items-start">
        {viewMode === 'preview' ? (
          <div
            className="transition-all duration-300 ease-in-out border-x border-base-300 shadow-2xl bg-base-300/10"
            style={{
              width: viewportSize,
              height: '100%',
              maxWidth: '100%'
            }}
          >
            <div className="bg-base-300 text-[10px] text-gray-500 text-center py-1 border-b border-base-300 uppercase tracking-wider font-semibold">
              {getViewportLabel(viewportSize)}
            </div>
            <iframe
              srcDoc={iframeContent}
              title={`Preview for Variant ${variant.variantName}`}
              className="w-full h-[calc(100%-24px)] border-0 bg-transparent"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <pre className="text-xs text-gray-300 bg-base-100 p-4 overflow-auto h-full w-full font-mono custom-scrollbar">
              <code>{fullCodeForDisplay}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 flex items-center gap-2 bg-base-300 hover:bg-base-200 text-white font-semibold py-1.5 px-3 rounded-md transition duration-200 text-xs border border-base-300 shadow-lg"
            >
              {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CtaCard;
