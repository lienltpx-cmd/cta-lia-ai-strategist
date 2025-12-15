
import React, { useState, useCallback, useEffect, useRef } from 'react';
import SettingsPanel from './components/SettingsPanel';
import ResultsDisplay from './components/ResultsDisplay';
import UserGuideModal from './components/UserGuideModal';
import { generateStrategy } from './services/geminiService';
import { Settings, AiFullStrategyResponse } from './types';
import { useSessionStorage } from './hooks/useSessionStorage';
import { QuestionMarkCircleIcon, UploadIcon, DocumentTextIcon, CheckIcon } from './components/icons';
// @ts-ignore
import mammoth from 'mammoth';

const initialSettings: Settings = {
  primaryColor: '#cb3816',
  tone: 'Thân thiện',
  ctaLinks: {
    product_page: "https://domain.com/may-dam-coc-220v",
    category_page: "https://domain.com/dam-coc",
    pdf: "https://domain.com/bao-gia-dam-coc.pdf",
    hotline: "0899555355",
    zalo: "https://zalo.me/0899555355",
    messenger: "https://m.me/yourpage",
    booking: "",
    voucher: "",
    blog: ""
  },
  tracking: {
    page_slug: 'sample-page',
    utm_source: 'seo-lia',
    utm_medium: 'cta-lia',
    utm_campaign: 'general-campaign',
  }
};


function App() {
  const [settings, setSettings] = useSessionStorage<Settings>('cta-settings', initialSettings);
  const [blogContent, setBlogContent] = useSessionStorage<string>('cta-blogContent', '');

  const [aiResponse, setAiResponse] = useState<AiFullStrategyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automatically open the guide for first-time visitors
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedCtaStrategist');
    if (!hasVisited) {
      setIsGuideOpen(true);
      sessionStorage.setItem('hasVisitedCtaStrategist', 'true');
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAiResponse(null);
    try {
      if (!blogContent.trim()) {
        throw new Error("Nội dung bài viết blog không được để trống.");
      }
      const strategyResponse = await generateStrategy(settings, blogContent);
      setAiResponse(strategyResponse);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [settings, blogContent]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        if (!isLoading) {
          event.preventDefault();
          handleGenerate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, handleGenerate]);

  // --- File Upload Logic ---
  const processFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    try {
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setBlogContent(result.value);
      } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        setBlogContent(text);
      } else {
        setError("Định dạng file không hỗ trợ. Vui lòng tải lên file .docx, .md hoặc .txt");
        setFileName(null);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể đọc file. Vui lòng thử lại.");
      setFileName(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input value to allow selecting the same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBlogContent(e.target.value);
    // If user manually types, clear the filename to indicate manual edit mode
    if (fileName) setFileName(null);
  };

  return (
    <div className="min-h-screen bg-base-100 text-gray-100 font-sans">
      <header className="bg-base-200/50 backdrop-blur-sm p-4 border-b border-base-300 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">LIA - AI CTA STRATEGIST</h1>
           <button 
            onClick={() => setIsGuideOpen(true)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Open user guide"
           >
              <QuestionMarkCircleIcon className="w-7 h-7" />
           </button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <SettingsPanel settings={settings} setSettings={setSettings} />
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  2. Cung cấp Nội dung Blog
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
                {/* Column 1: Direct Paste */}
                <div className="flex flex-col h-full bg-base-200 rounded-lg border border-base-300 overflow-hidden">
                    <div className="p-3 bg-base-300/50 border-b border-base-300 flex justify-between items-center">
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                             <DocumentTextIcon className="w-4 h-4 text-brand-light" />
                            Nhập trực tiếp
                        </span>
                        <span className="text-xs text-gray-500">{blogContent.length.toLocaleString()} ký tự</span>
                    </div>
                    <textarea
                        id="blogContent"
                        value={blogContent}
                        onChange={handleTextChange}
                        placeholder="Dán nội dung bài viết của bạn vào đây..."
                        className="flex-1 w-full bg-base-200 p-3 resize-none focus:outline-none focus:bg-base-300/20 transition-colors text-sm leading-relaxed custom-scrollbar"
                    />
                </div>

                {/* Column 2: Upload File */}
                <div 
                    onClick={triggerFileUpload}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center h-full rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer relative overflow-hidden group
                        ${isDragging 
                            ? 'border-brand-primary bg-brand-primary/10' 
                            : 'border-base-300 bg-base-200/50 hover:border-brand-light/50 hover:bg-base-200'
                        }
                    `}
                >
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".docx,.txt,.md"
                        onChange={handleFileChange}
                    />
                    
                    <div className="z-10 flex flex-col items-center text-center p-6 space-y-3">
                         <div className={`p-4 rounded-full transition-transform duration-300 ${isDragging ? 'scale-110 bg-brand-primary/20' : 'bg-base-300 group-hover:scale-110'}`}>
                            {fileName ? (
                                <CheckIcon className="w-8 h-8 text-green-400" />
                            ) : (
                                <UploadIcon className="w-8 h-8 text-brand-light" />
                            )}
                         </div>
                         
                         {fileName ? (
                            <div className="space-y-1">
                                <p className="text-green-400 font-semibold">Đã tải lên thành công!</p>
                                <p className="text-sm text-gray-300 font-medium break-all px-2">{fileName}</p>
                                <p className="text-xs text-gray-500 mt-2">Click để thay đổi file khác</p>
                            </div>
                         ) : (
                            <div className="space-y-1">
                                <p className="text-white font-medium">Click hoặc Kéo thả file vào đây</p>
                                <p className="text-xs text-gray-400">Hỗ trợ: Word (.docx), Markdown (.md), Text (.txt)</p>
                            </div>
                         )}
                    </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center pt-2">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-3 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed text-lg shadow-lg shadow-brand-primary/20"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang phân tích...
                  </>
                ) : "🚀 Tạo chiến lược CTA"}
              </button>
              <p className="text-xs text-gray-500 mt-3">hoặc nhấn <kbd className="px-2 py-1 text-xs font-semibold text-gray-300 bg-base-300 border border-base-300/50 rounded-md shadow-sm">⌘</kbd> + <kbd className="px-2 py-1 text-xs font-semibold text-gray-300 bg-base-300 border border-base-300/50 rounded-md shadow-sm">Enter</kbd></p>
            </div>
          </div>

          <div className="bg-base-200/50 p-4 rounded-lg border border-base-300 min-h-[500px]">
             <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
               3. Kết quả & Chiến lược từ AI
            </h2>
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="animate-spin h-10 w-10 text-brand-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg font-semibold">AI đang phân tích chiến lược...</p>
                <p className="text-gray-400">Quá trình này có thể mất vài giây.</p>
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-900/20 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Đã xảy ra lỗi</h3>
                <p className="text-sm">{error}</p>
                <p className="text-xs text-gray-500 mt-4">Vui lòng kiểm tra lại thông tin đầu vào hoặc thử lại. Nếu lỗi vẫn tiếp diễn, có thể API đang gặp sự cố.</p>
              </div>
            )}
            {!isLoading && !aiResponse && !error && (
               <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <p className="text-lg">Kết quả phân tích sẽ xuất hiện ở đây.</p>
                <p className="text-sm">Hãy điền thông tin và nhấn "Tạo chiến lược CTA" để bắt đầu.</p>
              </div>
            )}
            {aiResponse && <ResultsDisplay response={aiResponse} />}
          </div>

        </div>
      </main>
      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}

export default App;