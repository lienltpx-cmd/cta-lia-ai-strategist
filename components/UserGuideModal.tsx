
import React from 'react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-base-200 w-full max-w-2xl rounded-lg border border-base-300 shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Close guide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">Chào mừng đến với AI CTA Strategist!</h2>
        
        <div className="space-y-4">
            <GuideStep
                step="1"
                title="Cài đặt Đầu vào"
                description="Thiết lập Brand Profile, CTA Link Mapping, và các tham số Tracking. Mẹo: Nếu bạn để trống một link trong phần 'CTA Link Mapping', AI sẽ không tạo ra loại CTA tương ứng đó."
            />
             <GuideStep
                step="2"
                title="Cung cấp Nội dung"
                description="Dán toàn bộ nội dung bài viết blog vào ô duy nhất. AI sẽ tự động phân tích sản phẩm, mục tiêu bài viết và bối cảnh từ nội dung bạn cung cấp."
            />
             <GuideStep
                step="3"
                title="Tạo Chiến lược"
                description="Nhấn nút 'Tạo chiến lược CTA' (hoặc dùng phím tắt ⌘ + Enter) để AI bắt đầu phân tích và đưa ra đề xuất."
            />
             <GuideStep
                step="4"
                title="Xem & Sử dụng Kết quả"
                description="Khám phá chiến lược tổng thể, phân tích 5C, và các cặp A/B test. Chuyển đổi giữa chế độ Xem trước (Preview) và Mã (Code) để lấy CSS & HTML."
            />
        </div>
        
        <div className="mt-8 flex justify-center">
            <button 
                onClick={onClose}
                className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded-lg transition duration-300"
            >
                Bắt đầu ngay!
            </button>
        </div>
      </div>
    </div>
  );
};

interface GuideStepProps {
    step: string;
    title: string;
    description: string;
}

const GuideStep: React.FC<GuideStepProps> = ({ step, title, description }) => (
    <div className="flex items-start gap-4 p-4 bg-base-300/50 rounded-lg">
        <div className="flex-shrink-0 w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center font-bold text-white">
            {step}
        </div>
        <div>
            <h3 className="font-semibold text-lg text-white">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
    </div>
);


export default UserGuideModal;