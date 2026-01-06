import React from 'react';
import { Filter } from 'lucide-react';

interface FilterableHeaderProps {
  title: string;
  options: string[];
  currentFilter: string;
  onFilterChange: (value: string) => void;
}

const FilterableHeader: React.FC<FilterableHeaderProps> = ({ title, options, currentFilter, onFilterChange }) => {
  return (
    <th className="p-3 w-20 relative group">
      <div className="flex items-center gap-1 cursor-pointer">
        <span>{title}</span>
        <Filter size={10} className={`transition-colors ${currentFilter !== 'all' ? 'text-blue-600 fill-current' : 'text-slate-300 group-hover:text-slate-500'}`} />
      </div>
      <select 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        value={currentFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        title="点击筛选费用类别"
      >
        <option value="all">全部类别</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </th>
  );
};

export default FilterableHeader;