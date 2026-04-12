import { Search, Cast, BarChart2, Upload, Settings, User, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TopNav({ searchQuery, onSearchChange }: TopNavProps) {
  return (
    <header className="h-16 bg-[#1f1f1f] border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-9 h-9 bg-[#d97706] rounded-full flex items-center justify-center shadow-lg group-hover:bg-[#b45309] transition-colors">
             <Headphones className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden md:block text-neutral-100">audiobookshelf</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="bg-[#2a2a2a] hover:bg-[#333] border-none text-xs h-9 px-3 font-medium">
            <div className="w-4 h-4 rounded-full bg-neutral-500 mr-2 border border-white/10" />
            Demo
            <ChevronDown className="ml-2 w-4 h-4 opacity-50" />
          </Button>
          
          <div className="relative w-64 lg:w-[400px] hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input 
              placeholder="Search books, authors, series..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-[#2a2a2a] border-none pl-10 h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary/50 placeholder:text-neutral-600"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/5 w-10 h-10">
            <Cast className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/5 w-10 h-10">
            <BarChart2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/5 w-10 h-10">
            <Upload className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hover:bg-white/5 w-10 h-10">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        <div className="h-6 w-[1px] bg-white/10 mx-2 hidden md:block" />

        <Button variant="secondary" size="sm" className="bg-[#2a2a2a] hover:bg-[#333] border-none text-xs h-9 px-3 gap-2 font-medium">
          <span className="text-neutral-300">root</span>
          <div className="w-5 h-5 rounded-full bg-neutral-600 flex items-center justify-center">
            <User className="w-3 h-3 text-neutral-300" />
          </div>
        </Button>
      </div>
    </header>
  );
}

import { Headphones } from 'lucide-react';
