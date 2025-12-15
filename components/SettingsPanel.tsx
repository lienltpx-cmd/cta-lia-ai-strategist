import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Settings, Profile, BrandSettings } from '../types';
import ColorPicker from './ColorPicker';
import { TrashIcon, CheckIcon, ClipboardIcon } from './icons';

interface SettingsPanelProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [isSuccessfullySaved, setIsSuccessfullySaved] = useState(false);
  const saveInputRef = useRef<HTMLInputElement>(null);

  // State for tracking preview copy feedback
  const [isPreviewCopied, setIsPreviewCopied] = useState(false);

  useEffect(() => {
    if (isSavingProfile) {
      saveInputRef.current?.focus();
    }
  }, [isSavingProfile]);

  useEffect(() => {
    try {
      const savedProfiles = window.localStorage.getItem('cta-profiles');
      if (savedProfiles) {
        setProfiles(JSON.parse(savedProfiles));
      }
      const savedColorHistory = window.localStorage.getItem('cta-color-history');
      if (savedColorHistory) {
        setColorHistory(JSON.parse(savedColorHistory));
      } else {
        setColorHistory(['#cb3816', '#4f46e5', '#7c3aed', '#10b981', '#f59e0b', '#ef4444']);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
        const [section, field] = name.split('.');
        if (section === 'ctaLinks' || section === 'tracking') {
            setSettings(prev => ({
                ...prev,
                [section]: {
                    ...prev[section as 'ctaLinks' | 'tracking'],
                    [field]: value
                }
            }));
        }
    } else {
        setSettings(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const updateColorHistory = (color: string) => {
    const newHistory = [color, ...colorHistory.filter(c => c !== color)].slice(0, 12);
    setColorHistory(newHistory);
    try {
      window.localStorage.setItem('cta-color-history', JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save color history", error);
    }
  };

  const handleColorChange = (color: string) => {
    setSettings(prev => ({ ...prev, primaryColor: color }));
  };
  
  const handleColorOk = (color: string) => {
    handleColorChange(color);
    updateColorHistory(color);
    setPickerOpen(false);
  };

  const handleSaveProfile = () => {
    const profileName = newProfileName.trim();
    if (profileName === '') {
        alert("Tên profile không được để trống.");
        return;
    }
    
    const existingProfile = profiles.find(p => p.name.toLowerCase() === profileName.toLowerCase());
    if (existingProfile) {
      if (!confirm(`Profile "${existingProfile.name}" đã tồn tại. Bạn có muốn ghi đè lên nó không?`)) {
        return;
      }
    }
    
    const brandSettings: BrandSettings = {
      primaryColor: settings.primaryColor,
      tone: settings.tone,
    };

    const newProfile: Profile = { name: profileName, settings: brandSettings };
    const otherProfiles = profiles.filter(p => p.name.toLowerCase() !== profileName.toLowerCase());
    const newProfilesList = [...otherProfiles, newProfile].sort((a, b) => a.name.localeCompare(b.name));

    try {
      window.localStorage.setItem('cta-profiles', JSON.stringify(newProfilesList));
      setProfiles(newProfilesList);
      setSelectedProfile(profileName);
      
      setIsSuccessfullySaved(true);
      setTimeout(() => {
        setIsSavingProfile(false);
        setNewProfileName('');
        setIsSuccessfullySaved(false);
      }, 1500);

    } catch (error) {
       console.error("Failed to save profiles to localStorage", error);
       alert("Lỗi: Không thể lưu profile.");
    }
  };
  
  const handleCancelSave = () => {
      setIsSavingProfile(false);
      setNewProfileName('');
      setIsSuccessfullySaved(false);
  }

  const handleProfileSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profileName = e.target.value;
    setSelectedProfile(profileName);
    if (profileName) {
      const profileToLoad = profiles.find(p => p.name === profileName);
      if (profileToLoad) {
        setSettings(prev => ({ ...prev, ...profileToLoad.settings }));
      }
    }
  };
  
  const handleDeleteProfile = () => {
    if (!selectedProfile) return;
    if (confirm(`Bạn có chắc chắn muốn xóa profile "${selectedProfile}" không?`)) {
      const newProfilesList = profiles.filter(p => p.name !== selectedProfile);
      try {
        window.localStorage.setItem('cta-profiles', JSON.stringify(newProfilesList));
        setProfiles(newProfilesList);
        setSelectedProfile('');
        alert(`Đã xóa profile "${selectedProfile}".`);
      } catch (error) {
        console.error("Failed to delete profile from localStorage", error);
        alert("Lỗi: Không thể xóa profile.");
      }
    }
  };

  // Calculate UTM Preview
  const trackingPreview = useMemo(() => {
    const { page_slug, utm_source, utm_medium, utm_campaign } = settings.tracking;
    const baseUrl = settings.ctaLinks.product_page || "https://domain.com/san-pham";
    
    const parts = [];
    if (utm_source) parts.push(`utm_source=${utm_source}`);
    if (utm_medium) parts.push(`utm_medium=${utm_medium}`);
    if (utm_campaign) parts.push(`utm_campaign=${utm_campaign}`);
    if (page_slug) parts.push(`utm_content=${page_slug}_[intent]`);
    
    const queryString = parts.join('&');
    
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [settings.tracking, settings.ctaLinks.product_page]);

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(trackingPreview);
    setIsPreviewCopied(true);
    setTimeout(() => setIsPreviewCopied(false), 2000);
  };

  return (
    <div className="bg-base-200 p-4 rounded-lg border border-base-300 space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m8-8h2M4 12H2m15.364 6.364l1.414 1.414M4.222 4.222l1.414 1.414m12.728 0l-1.414 1.414M5.636 18.364l-1.414 1.414" /></svg>
        1. Cài đặt Đầu vào
      </h2>
      
      <div className="space-y-6">
        <div className="p-4 bg-base-300/30 rounded-lg border border-base-300/50 space-y-4">
           <h3 className="text-lg font-semibold text-white mb-2">Profile Thương hiệu</h3>
           <Section title="Brand Profile & Quản lý">
            <InputGroup label="Màu thương hiệu">
              <div className="relative" ref={pickerRef}>
                <div className="relative">
                   <input
                      type="text"
                      name="primaryColor"
                      value={settings.primaryColor}
                      onChange={(e) => handleColorChange(e.target.value.toLowerCase())}
                      className="w-full bg-base-300 border border-base-300 rounded-md p-2 pl-10 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                    />
                    <div
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border-2 border-base-100 cursor-pointer"
                      style={{ backgroundColor: settings.primaryColor }}
                      onClick={() => setPickerOpen(prev => !prev)}
                    />
                </div>
                {isPickerOpen && (
                   <ColorPicker
                      initialColor={settings.primaryColor}
                      onOk={handleColorOk}
                      onCancel={() => setPickerOpen(false)}
                      colorHistory={colorHistory}
                      onHistoryClick={(color) => { handleColorChange(color); }}
                   />
                )}
              </div>
            </InputGroup>
            <InputGroup label="Tông giọng (Tone)">
              <select name="tone" value={settings.tone} onChange={handleInputChange} className="w-full bg-base-300 border border-base-300 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200">
                <option>Thân thiện</option>
                <option>Chuyên nghiệp</option>
                <option>Thuyết phục</option>
                <option>Vui vẻ</option>
              </select>
            </InputGroup>
             <div className="sm:col-span-2">
                 <InputGroup label="Quản lý Profile">
                   <div className="flex items-center gap-2">
                    <select
                      value={selectedProfile}
                      onChange={handleProfileSelectionChange}
                      className="w-full bg-base-300 border border-base-300 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                      aria-label="Chọn một profile"
                    >
                      <option value="">
                        {profiles.length > 0 ? '— Chọn một profile —' : 'Chưa có profile nào'}
                      </option>
                      {profiles.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                    <button
                      onClick={handleDeleteProfile}
                      disabled={!selectedProfile}
                      className="p-2 bg-red-800/50 hover:bg-red-800/80 text-white rounded-md transition duration-200 disabled:bg-base-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                      aria-label="Xóa profile đã chọn"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                 </InputGroup>
             </div>
              {isSavingProfile ? (
                 <div className="sm:col-span-2 space-y-2">
                    <input
                        ref={saveInputRef}
                        type="text"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder="Nhập tên thương hiệu..."
                        className="w-full bg-base-300 border border-base-300 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                    />
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={handleSaveProfile}
                            disabled={isSuccessfullySaved}
                            className={`flex-1 flex justify-center items-center gap-2 text-white font-semibold py-2 px-3 rounded-md transition-all duration-300 text-sm ${
                                isSuccessfullySaved 
                                    ? 'bg-green-600 cursor-default' 
                                    : 'bg-brand-primary hover:bg-brand-secondary'
                            }`}
                        >
                            {isSuccessfullySaved ? (
                                <>
                                    <CheckIcon className="w-5 h-5" />
                                    <span>Đã lưu!</span>
                                </>
                            ) : (
                                'Lưu'
                            )}
                        </button>
                         <button 
                            onClick={handleCancelSave} 
                            disabled={isSuccessfullySaved}
                            className="flex-1 bg-base-300/50 hover:bg-base-300/80 text-white font-semibold py-2 px-3 rounded-md transition duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
              ) : (
                <div className="sm:col-span-2">
                    <button
                      onClick={() => setIsSavingProfile(true)}
                      className="w-full flex justify-center items-center gap-2 bg-brand-secondary/50 hover:bg-brand-secondary/80 text-white font-semibold py-2 px-3 rounded-md transition duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>
                      Lưu Profile Thương hiệu
                    </button>
                </div>
              )}
          </Section>
        </div>
        
        <div className="p-4 bg-base-300/30 rounded-lg border border-base-300/50 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-2">CTA Link Mapping</h3>
          <Section title="">
            <InputGroup label="Product Page Link">
              <input type="text" name="ctaLinks.product_page" value={settings.ctaLinks.product_page} onChange={handleInputChange} />
            </InputGroup>
             <InputGroup label="Category Page Link">
              <input type="text" name="ctaLinks.category_page" value={settings.ctaLinks.category_page} onChange={handleInputChange} />
            </InputGroup>
             <InputGroup label="Blog Link">
              <input type="text" name="ctaLinks.blog" value={settings.ctaLinks.blog} onChange={handleInputChange} />
            </InputGroup>
            <InputGroup label="Hotline">
              <input type="tel" name="ctaLinks.hotline" value={settings.ctaLinks.hotline} onChange={handleInputChange} />
            </InputGroup>
            <InputGroup label="Zalo Link">
              <input type="text" name="ctaLinks.zalo" value={settings.ctaLinks.zalo} onChange={handleInputChange} />
            </InputGroup>
            <InputGroup label="Messenger Link">
              <input type="text" name="ctaLinks.messenger" value={settings.ctaLinks.messenger} onChange={handleInputChange} />
            </InputGroup>
             <InputGroup label="Booking Link">
              <input type="text" name="ctaLinks.booking" value={settings.ctaLinks.booking} onChange={handleInputChange} />
            </InputGroup>
            <InputGroup label="Voucher Link">
              <input type="text" name="ctaLinks.voucher" value={settings.ctaLinks.voucher} onChange={handleInputChange} />
            </InputGroup>
            <InputGroup label="PDF Link">
              <input type="text" name="ctaLinks.pdf" value={settings.ctaLinks.pdf} onChange={handleInputChange} />
            </InputGroup>
          </Section>
        </div>

        <div className="p-4 bg-base-300/30 rounded-lg border border-base-300/50 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">Tracking Parameters</h3>
            <Section title="">
              <InputGroup label="Page Slug">
                <input type="text" name="tracking.page_slug" value={settings.tracking.page_slug} onChange={handleInputChange} />
              </InputGroup>
              <InputGroup label="UTM Source">
                <input type="text" name="tracking.utm_source" value={settings.tracking.utm_source} onChange={handleInputChange} />
              </InputGroup>
              <InputGroup label="UTM Medium">
                <input type="text" name="tracking.utm_medium" value={settings.tracking.utm_medium} onChange={handleInputChange} />
              </InputGroup>
              <InputGroup label="UTM Campaign">
                <input type="text" name="tracking.utm_campaign" value={settings.tracking.utm_campaign} onChange={handleInputChange} />
              </InputGroup>
            </Section>
            
             {/* Tracking Preview Section */}
            <div className="mt-4 pt-2 border-t border-base-300/30">
                 <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-medium text-gray-400">
                        Link Preview (Full UTM Path Example)
                    </label>
                    <button 
                      onClick={handleCopyPreview}
                      className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                    >
                      {isPreviewCopied ? <CheckIcon className="w-3 h-3 text-green-400" /> : <ClipboardIcon className="w-3 h-3" />}
                      {isPreviewCopied ? "Copied" : "Copy"}
                    </button>
                 </div>
                 <div className="bg-base-300/50 p-3 rounded border border-base-300/50 relative group">
                    <code className="text-xs text-brand-light break-all font-mono block leading-relaxed">
                        {trackingPreview}
                    </code>
                 </div>
                 <p className="text-[10px] text-gray-500 mt-1 italic">
                    * [intent] sẽ được AI tự động thay thế bằng vị trí CTA cụ thể (ví dụ: ZoneA, ZoneB, ZoneC).
                 </p>
            </div>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    {title && <h4 className="text-md font-semibold text-brand-light mb-3">{title}</h4>}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
    const styledChildren = React.Children.map(children, child => {
        if (React.isValidElement(child) && (child.type === 'input' || child.type === 'select') && !child.props.className) {
            return React.cloneElement(child as React.ReactElement<any>, {
                className: "w-full bg-base-300 border border-base-300 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
            });
        }
        return child;
    });

    return (
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-300">
          {label}
        </label>
        {styledChildren}
      </div>
    );
};


export default SettingsPanel;