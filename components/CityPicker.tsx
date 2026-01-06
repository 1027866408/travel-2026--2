import React, { useState, useRef, useEffect } from 'react';
import { Gem } from 'lucide-react';
import { CITIES, HOT_CITIES } from '../constants';
import { City } from '../types';

interface CityPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoHardshipCallback?: (isHardship: boolean) => void;
}

const CityPicker: React.FC<CityPickerProps> = ({ value, onChange, placeholder, autoHardshipCallback }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (value) setInputValue(value);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, value]);

  const filteredCities = CITIES.filter(c => 
    c.name.includes(inputValue) || c.pinyin.includes(inputValue.toLowerCase())
  );

  const handleSelect = (city: City) => {
    setInputValue(city.name);
    onChange(city.name);
    if (autoHardshipCallback) {
      autoHardshipCallback(city.hardship);
    }
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className="relative w-24" ref={wrapperRef}>
      <div className="relative">
        <input 
          type="text"
          className="w-full bg-transparent border-b border-slate-300 pb-1 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 placeholder:text-slate-300 transition-colors"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-3 overflow-hidden">
          <div className="max-h-48 overflow-y-auto scrollbar-thin">
            {inputValue === '' && (
              <div className="mb-3">
                <p className="text-[10px] font-bold text-slate-400 mb-2">热门城市</p>
                <div className="grid grid-cols-4 gap-2">
                  {HOT_CITIES.map(name => {
                    const city = CITIES.find(c => c.name === name);
                    if (!city) return null;
                    return (
                      <button 
                        key={name}
                        onClick={() => handleSelect(city)}
                        className="text-[10px] bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 py-1 rounded border border-slate-100 transition-colors"
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-[10px] font-bold text-slate-400 mb-2">
                {inputValue ? '匹配结果' : '所有城市'}
            </p>
            
            {filteredCities.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {filteredCities.map(city => (
                  <button 
                    key={city.name}
                    onClick={() => handleSelect(city)}
                    className="text-left text-[11px] font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    {city.name}
                    {city.hardship && <Gem size={8} className="text-amber-500"/>}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-300 text-center py-2">无匹配城市</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CityPicker;