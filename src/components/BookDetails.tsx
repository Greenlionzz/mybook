import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, List, Bookmark, Share2, Download, MoreHorizontal, User, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface BookDetailsProps {
  book: {
    id: string;
    title: string;
    author: string;
    cover: string;
    description: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookDetails({ book, isOpen, onClose }: BookDetailsProps) {
  if (!book) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] bg-[#1a1a1a] border-white/10 text-white p-0 overflow-hidden h-[90vh] md:h-auto md:max-h-[85vh]">
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Left: Cover & Quick Actions */}
          <div className="w-full md:w-80 bg-[#1f1f1f] p-6 md:p-8 flex flex-col items-center gap-6 border-b md:border-b-0 md:border-r border-white/5 shrink-0 overflow-y-auto md:overflow-visible custom-scrollbar">
            <div className="w-40 md:w-full aspect-square relative shadow-2xl rounded-md overflow-hidden shrink-0">
              <img 
                src={book.cover} 
                alt={book.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex flex-col w-full gap-3">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 gap-2">
                <Play className="w-5 h-5 fill-current" />
                PLAY
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" className="bg-[#2a2a2a] hover:bg-[#333] border-none text-xs h-10 gap-2">
                  <Bookmark className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="secondary" className="bg-[#2a2a2a] hover:bg-[#333] border-none text-xs h-10 gap-2">
                  <Download className="w-4 h-4" />
                  Offline
                </Button>
              </div>
            </div>
            
            <div className="w-full flex justify-between items-center px-2">
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                <List className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Right: Info & Description */}
          <div className="flex-1 min-w-0 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] uppercase tracking-wider font-bold">Audiobook</Badge>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-none text-[10px] uppercase tracking-wider font-bold">Classic</Badge>
              </div>
              <DialogTitle className="text-3xl font-bold leading-tight text-neutral-100 break-words">
                {book.title}
              </DialogTitle>
              <div className="flex items-center gap-4 mt-2 text-neutral-400">
                <div className="flex items-center gap-1.5 text-sm">
                  <User className="w-4 h-4" />
                  <span className="hover:text-primary cursor-pointer transition-colors">{book.author}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>12h 45m</span>
                </div>
              </div>
            </DialogHeader>

            <Separator className="bg-white/5" />

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-widest">Description</h4>
              <DialogDescription className="text-neutral-400 leading-relaxed text-base break-words whitespace-normal">
                {book.description}
              </DialogDescription>
            </div>

            <div className="mt-auto pt-6 flex flex-col gap-4">
              <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-widest">Details</h4>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-500 text-xs uppercase font-bold">Narrator</span>
                  <span className="text-neutral-300">Full Cast</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-500 text-xs uppercase font-bold">Publisher</span>
                  <span className="text-neutral-300">Public Domain</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-500 text-xs uppercase font-bold">Released</span>
                  <span className="text-neutral-300">Jan 1, 1900</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-500 text-xs uppercase font-bold">Language</span>
                  <span className="text-neutral-300">English</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
