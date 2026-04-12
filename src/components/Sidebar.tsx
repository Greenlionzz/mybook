import { Home, Library, Layers, LayoutGrid, Users, Music2, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: Home, label: 'Home', id: 'home' },
  { icon: Library, label: 'Library', id: 'library' },
  { icon: Layers, label: 'Series', id: 'series' },
  { icon: LayoutGrid, label: 'Collections', id: 'collections' },
  { icon: Users, label: 'Authors', id: 'authors' },
  { icon: Music2, label: 'Playlists', id: 'playlists' },
  { icon: BarChart3, label: 'Stats', id: 'stats' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ currentView, onViewChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside className={cn(
      "bg-[#1f1f1f] flex flex-col h-full border-r border-white/5 transition-all duration-300 relative",
      isCollapsed ? "w-16" : "w-16 md:w-64"
    )}>
      {/* Collapse Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#2a2a2a] border border-white/10 text-neutral-400 hover:text-white z-50 hidden md:flex"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </Button>

      <div className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-4 md:px-6 py-3 transition-colors relative group",
              currentView === item.id 
                ? "text-white bg-white/5" 
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            )}
          >
            {currentView === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            )}
            <item.icon className="w-6 h-6 shrink-0" />
            <span className={cn(
              "text-sm font-medium hidden transition-opacity duration-300",
              !isCollapsed && "md:block"
            )}>{item.label}</span>
            
            {/* Tooltip for collapsed state */}
            <div className={cn(
              "absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap",
              !isCollapsed && "md:hidden"
            )}>
              {item.label}
            </div>
          </button>
        ))}
      </div>
      
      <div className={cn(
        "p-4 text-center transition-opacity duration-300",
        isCollapsed ? "opacity-0" : "md:text-left"
      )}>
        <div className="text-[10px] text-neutral-500 font-mono">
          <p className="hover:underline cursor-pointer">v2.2.16</p>
          <p className="italic">local</p>
        </div>
      </div>
    </aside>
  );
}
