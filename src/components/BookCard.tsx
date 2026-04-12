import { motion } from 'motion/react';

interface BookCardProps {
  key?: string;
  id: string;
  title: string;
  author: string;
  cover: string;
  onClick?: () => void;
}

export function BookCard({ title, author, cover, onClick }: BookCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="flex flex-col gap-2.5 group cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square relative overflow-hidden rounded-sm shadow-xl bg-[#2a2a2a]">
        <img 
          src={cover} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[13px] font-bold text-neutral-200 line-clamp-2 leading-tight group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-[11px] text-neutral-500 truncate font-medium">
          {author}
        </p>
      </div>
    </motion.div>
  );
}
