import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { MOCK_PROJECTS } from '../constants';
import { Project } from '../types';

interface ProjectPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ProjectPicker: React.FC<ProjectPickerProps> = ({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) setSearchTerm(value || '');
  }, [value, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredProjects = MOCK_PROJECTS.filter(p => 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.name.includes(searchTerm)
  );

  const handleSelect = (project: Project) => {
    const displayValue = `${project.code} (${project.name})`;
    setSearchTerm(displayValue);
    onChange(displayValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex items-center gap-2 border-b border-slate-100 py-1 hover:border-blue-300 transition-colors group">
        <Search size={12} className="text-slate-400 group-hover:text-blue-500"/>
        <input 
          className="text-sm font-bold bg-transparent outline-none w-full text-blue-700 placeholder:text-slate-300"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
        />
        {searchTerm && (
          <X 
            size={12} 
            className="text-slate-300 hover:text-slate-500 cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation();
              setSearchTerm('');
              onChange('');
            }}
          />
        )}
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-xl border border-slate-100 z-50 max-h-48 overflow-y-auto">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(p => (
              <div 
                key={p.code} 
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0"
                onClick={() => handleSelect(p)}
              >
                <div className="text-xs font-bold text-blue-700">{p.code}</div>
                <div className="text-[10px] text-slate-500">{p.name}</div>
              </div>
            ))
          ) : (
            <div className="px-3 py-3 text-[10px] text-slate-400 text-center">
              无匹配项目，支持手动输入
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectPicker;