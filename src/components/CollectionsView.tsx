import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderHeart, Plus, MoreVertical, Book, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLLECTIONS = [
  { id: 'c1', name: 'Favorites', count: 12, color: 'bg-red-500/20 text-red-500' },
  { id: 'c2', name: 'To Listen', count: 45, color: 'bg-blue-500/20 text-blue-400' },
  { id: 'c3', name: 'Philosophy', count: 8, color: 'bg-purple-500/20 text-purple-400' },
  { id: 'c4', name: 'Summer Reads', count: 15, color: 'bg-orange-500/20 text-orange-400' },
  { id: 'c5', name: 'Finished 2023', count: 32, color: 'bg-green-500/20 text-green-400' },
];

export function CollectionsView() {
  const [sortBy, setSortBy] = useState('name');

  const sortedCollections = useMemo(() => {
    const result = [...COLLECTIONS];
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'count') {
      result.sort((a, b) => b.count - a.count);
    }
    return result;
  }, [sortBy]);

  return (
    <div className="p-6 pb-32 max-w-5xl mx-auto w-full flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-neutral-100">Collections</h2>
          <p className="text-neutral-500">Organize your library into custom folders.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 shrink-0">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-10 bg-[#1f1f1f] border-white/5 text-sm focus:ring-0">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f1f] border-white/10 text-white">
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="count">Book Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" />
            New Collection
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {sortedCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
            <Card className="bg-[#1f1f1f] border-white/5 hover:bg-[#252525] transition-colors cursor-pointer group p-5">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl ${collection.color} flex items-center justify-center`}>
                  <FolderHeart className="w-6 h-6" />
                </div>
                <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-neutral-100 group-hover:text-primary transition-colors">
                  {collection.name}
                </h3>
                <div className="flex items-center gap-2 text-neutral-500">
                  <Book className="w-3 h-3" />
                  <span className="text-xs font-bold uppercase tracking-widest">{collection.count} Books</span>
                </div>
              </div>

              <div className="mt-6 flex -space-x-3">
                {[...Array(Math.min(collection.count, 4))].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-lg border-2 border-[#1f1f1f] bg-neutral-800 overflow-hidden shadow-xl"
                  >
                    <img src={`https://picsum.photos/seed/${collection.id}-${i}/100/100`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {collection.count > 4 && (
                  <div className="w-10 h-10 rounded-lg border-2 border-[#1f1f1f] bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400 shadow-xl">
                    +{collection.count - 4}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </div>
  );
}
