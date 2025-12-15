import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- COLOR CONVERSION UTILITIES ---
const hexToRgb = (hex: string) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase();
};

const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  let d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToRgb = (h: number, s: number, v: number) => {
  s /= 100; v /= 100;
  let i = Math.floor((h / 360) * 6);
  let f = (h / 360) * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

// --- COMPONENT PROPS ---
interface ColorPickerProps {
  initialColor: string;
  onOk: (color: string) => void;
  onCancel: () => void;
  colorHistory: string[];
  onHistoryClick: (color: string) => void;
}

// --- DRAGGABLE HOOK ---
const useDraggable = (onDrag: (pos: { x: number, y: number }) => void) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
            onDrag({ x, y });
        }
    }, [onDrag]);

    const handleMouseUp = useCallback(() => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        handleMouseMove(e.nativeEvent as MouseEvent); // Handle first click
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove, handleMouseUp]);

    return { ref, onMouseDown: handleMouseDown };
};

// --- MAIN COMPONENT ---
const ColorPicker: React.FC<ColorPickerProps> = ({ initialColor, onOk, onCancel, colorHistory, onHistoryClick }) => {
  const [hsv, setHsv] = useState(rgbToHsv(hexToRgb(initialColor).r, hexToRgb(initialColor).g, hexToRgb(initialColor).b));
  
  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hueRgb = hsvToRgb(hsv.h, 100, 100);

  const handleSaturationValueChange = useCallback(({ x, y }: { x: number, y: number }) => {
      setHsv(prev => ({ ...prev, s: x * 100, v: (1 - y) * 100 }));
  }, []);

  const handleHueChange = useCallback(({ y }: { x: number, y: number }) => {
      setHsv(prev => ({ ...prev, h: y * 360 }));
  }, []);

  const saturationDraggable = useDraggable(handleSaturationValueChange);
  const hueDraggable = useDraggable(handleHueChange);

  const handleInputChange = (field: 'r' | 'g' | 'b' | 'h' | 's' | 'v', value: string) => {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue)) return;

      if (['r', 'g', 'b'].includes(field)) {
          const newRgb = { ...rgb, [field]: Math.max(0, Math.min(255, numValue)) };
          setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
      } else {
          const max = field === 'h' ? 360 : 100;
          const newHsv = { ...hsv, [field]: Math.max(0, Math.min(max, numValue)) };
          setHsv(newHsv);
      }
  };
   const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newHex = e.target.value;
    if (newHex.startsWith('#')) newHex = newHex.substring(1);
    if (/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(newHex)) {
      const fullHex = newHex.length === 3 ? `#${newHex[0]}${newHex[0]}${newHex[1]}${newHex[1]}${newHex[2]}${newHex[2]}` : `#${newHex}`;
      const { r, g, b } = hexToRgb(fullHex);
      setHsv(rgbToHsv(r, g, b));
    }
  };


  return (
    <div className="absolute top-full left-0 mt-2 w-64 bg-base-200 rounded-md shadow-lg p-3 z-20 border border-base-300 text-xs font-mono">
      {/* Saturation/Value Panel */}
      <div
        {...saturationDraggable}
        className="h-40 w-full relative cursor-pointer rounded-sm overflow-hidden"
        style={{ backgroundColor: `rgb(${hueRgb.r}, ${hueRgb.g}, ${hueRgb.b})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div
          className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
        />
      </div>

      <div className="flex gap-2 mt-3">
        {/* Hue Slider & Swatches */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
           <div className="w-8 h-8 rounded-sm border border-base-300" style={{ backgroundColor: hex }} />
           <div className="w-8 h-8 rounded-sm border border-base-300" style={{ backgroundColor: initialColor }} />
        </div>
        
        <div
            {...hueDraggable}
            className="w-4 h-40 relative cursor-pointer rounded-sm"
            style={{ background: 'linear-gradient(to bottom, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'}}
        >
            <div
              className="absolute w-full h-1 bg-white/50 rounded-full border border-black/20 left-0 transform -translate-y-1/2"
              style={{ top: `${(hsv.h / 360) * 100}%` }}
            />
        </div>
        
        {/* Inputs */}
        <div className="flex-grow grid grid-cols-3 gap-1 text-center">
            {['h', 's', 'v'].map(k => (
                <div key={k}>
                    <input type="text" value={Math.round(hsv[k as keyof typeof hsv])} onChange={e => handleInputChange(k as 'h'|'s'|'v', e.target.value)} className="w-full bg-base-300 p-1 rounded text-center border border-base-300" />
                    <label className="text-gray-400">{k.toUpperCase()}</label>
                </div>
            ))}
            {['r', 'g', 'b'].map(k => (
                <div key={k}>
                    <input type="text" value={rgb[k as keyof typeof rgb]}  onChange={e => handleInputChange(k as 'r'|'g'|'b', e.target.value)} className="w-full bg-base-300 p-1 rounded text-center border border-base-300" />
                    <label className="text-gray-400">{k.toUpperCase()}</label>
                </div>
            ))}
             <div className="col-span-3">
                <input type="text" value={hex} onChange={handleHexChange} className="w-full bg-base-300 p-1 rounded text-center border border-base-300"/>
                <label className="text-gray-400">HEX</label>
            </div>
        </div>
      </div>
      
       {/* History */}
      <div className="mt-3 pt-2 border-t border-base-300">
          <p className="text-gray-400 mb-1">Color history:</p>
          <div className="grid grid-cols-6 gap-1">
              {colorHistory.map((color, i) => (
                  <div key={i} className="w-full h-6 rounded-sm cursor-pointer border border-base-300" style={{backgroundColor: color}} onClick={() => onHistoryClick(color)} />
              ))}
          </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onCancel} className="px-3 py-1 bg-base-300 rounded hover:bg-base-100 text-sm">Cancel</button>
        <button onClick={() => onOk(hex)} className="px-3 py-1 bg-brand-primary text-white rounded hover:bg-brand-secondary text-sm">OK</button>
      </div>
    </div>
  );
};

export default ColorPicker;