import React from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Flame, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Award,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const data = [
  { day: 'Mon', minutes: 45 },
  { day: 'Tue', minutes: 120 },
  { day: 'Wed', minutes: 90 },
  { day: 'Thu', minutes: 60 },
  { day: 'Fri', minutes: 180 },
  { day: 'Sat', minutes: 210 },
  { day: 'Sun', minutes: 150 },
];

const genreData = [
  { name: 'Classic', value: 40, color: '#22c55e' },
  { name: 'Sci-Fi', value: 25, color: '#3b82f6' },
  { name: 'Mystery', value: 20, color: '#eab308' },
  { name: 'Biography', value: 15, color: '#a855f7' },
];

export function StatsView() {
  return (
    <div className="p-6 pb-32 max-w-7xl mx-auto w-full flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-neutral-100">Listening Stats</h2>
        <p className="text-neutral-500">Your progress and habits over the last week.</p>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[#1f1f1f] border-white/5 overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Total Listening Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-neutral-100">142</span>
                <span className="text-neutral-500 font-medium">hours</span>
                <span className="text-4xl font-bold text-neutral-100 ml-2">32</span>
                <span className="text-neutral-500 font-medium">mins</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-primary font-bold">
                <TrendingUp className="w-3 h-3" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[#1f1f1f] border-white/5 overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Current Daily Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-neutral-100 tracking-tighter italic">12</span>
                <span className="text-neutral-500 font-bold uppercase text-sm">Days</span>
              </div>
              <div className="mt-4 flex items-center gap-1">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 flex-1 rounded-full ${i < 5 ? 'bg-orange-500' : 'bg-neutral-800'}`} 
                  />
                ))}
              </div>
              <p className="mt-2 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Keep it up! 2 days to next milestone.</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500/20 group-hover:bg-orange-500 transition-colors" />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-[#1f1f1f] border-white/5 overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Books Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-neutral-100">48</span>
                <span className="text-neutral-500 font-medium">titles</span>
              </div>
              <div className="mt-4 flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-6 h-6 rounded-full border-2 border-[#1f1f1f] bg-neutral-800 overflow-hidden"
                  >
                    <img src={`https://picsum.photos/seed/${i+20}/50/50`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-[#1f1f1f] bg-neutral-800 flex items-center justify-center text-[8px] font-bold">
                  +44
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />
          </Card>
        </motion.div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-[#1f1f1f] border-white/5 p-6 h-full">
            <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg font-bold text-neutral-100">Weekly Activity</CardTitle>
                <p className="text-xs text-neutral-500">Listening time in minutes per day.</p>
              </div>
            </CardHeader>
            <CardContent className="px-0 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#666', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#666', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ 
                      backgroundColor: '#2a2a2a', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#22c55e' }}
                  />
                  <Bar 
                    dataKey="minutes" 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.minutes > 150 ? '#22c55e' : '#444'} 
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-[#1f1f1f] border-white/5 p-6 h-full">
            <CardHeader className="px-0 pt-0 pb-6">
              <CardTitle className="text-lg font-bold text-neutral-100">Genre Distribution</CardTitle>
              <p className="text-xs text-neutral-500">Your library breakdown by category.</p>
            </CardHeader>
            <CardContent className="px-0 h-[300px] flex items-center">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#2a2a2a', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3 pr-4">
                {genreData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-200">{item.name}</span>
                      <span className="text-[10px] text-neutral-500 font-bold">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1f1f1f] border-white/5 p-6 flex items-center gap-6 group cursor-pointer hover:bg-[#252525] transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Award className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <h4 className="font-bold text-neutral-100">Marathon Listener</h4>
            <p className="text-xs text-neutral-500">Listen for more than 5 hours in a single day.</p>
            <div className="mt-2 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 w-[80%]" />
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-600" />
        </Card>

        <Card className="bg-[#1f1f1f] border-white/5 p-6 flex items-center gap-6 group cursor-pointer hover:bg-[#252525] transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <h4 className="font-bold text-neutral-100">Early Bird</h4>
            <p className="text-xs text-neutral-500">Listen for 30 minutes before 8 AM for 5 days.</p>
            <div className="mt-2 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[40%]" />
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-600" />
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: string }) {
  return (
    <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${className}`}>
      {children}
    </div>
  );
}
