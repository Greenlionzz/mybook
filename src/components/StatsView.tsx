import React, { useEffect, useState } from 'react';
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

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#a855f7', '#ec4899', '#f97316'];

export function StatsView() {
  const [stats, setStats] = useState({ hours: 0, mins: 0, streak: 0 });
  const [libraryInfo, setLibraryInfo] = useState({ count: 0, covers: [] as string[] });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    const updateStats = () => {
      // 1. Load Audio Stats
      const audioStats = JSON.parse(localStorage.getItem('koofr_listening_stats') || 'null');
      const today = new Date().toLocaleDateString('en-CA');

      let secondsToday = 0;
      let currentStreak = 0;
      let totalSeconds = 0;

      if (audioStats) {
        currentStreak = audioStats.streak || 0;
        if (audioStats.date === today) {
          secondsToday = audioStats.secondsListened || 0;
        }
        totalSeconds = (audioStats.totalSecondsListened || 0);
        // Fallback if total isn't tracking yet
        if (totalSeconds < secondsToday) totalSeconds = secondsToday; 
      }

      const hours = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      setStats({ hours, mins, streak: currentStreak });

      // 2. Build Weekly Chart Data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const newWeeklyData = [];
      const history = audioStats?.history || {};

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        const dateStr = d.toLocaleDateString('en-CA');

        if (i === 0) {
           // Today is live!
           newWeeklyData.push({ day: dayName, minutes: Math.round(secondsToday / 60) });
        } else {
           // Past days pulled from history
           const pastMins = history[dateStr] ? Math.round(history[dateStr] / 60) : 0;
           newWeeklyData.push({ day: dayName, minutes: pastMins });
        }
      }
      setWeeklyData(newWeeklyData);
    };

    // 3. Load Library Stats (Only needs to run once on mount)
    const cached = localStorage.getItem('koofr_library_cache');
    const books = cached ? JSON.parse(cached) : [];

    setLibraryInfo({
      count: books.length,
      covers: books.map((b: any) => b.cover).slice(0, 4)
    });

    // Generate Pie Chart based on Authors instead of hardcoded Genre
    const authorCounts = books.reduce((acc: any, book: any) => {
      const key = book.author || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const sortedAuthors = Object.keys(authorCounts)
      .map(name => ({ name, value: authorCounts[name] }))
      .sort((a, b) => b.value - a.value);

    // Take top 4 authors, group the rest into "Other"
    const top = sortedAuthors.slice(0, 4);
    const rest = sortedAuthors.slice(4).reduce((sum, item) => sum + item.value, 0);
    if (rest > 0) top.push({ name: 'Other', value: rest });

    const finalPieData = top.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length]
    }));

    setPieData(finalPieData.length > 0 ? finalPieData : [{ name: 'Empty Library', value: 1, color: '#444' }]);

    // Initialize and set interval for live ticking
    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 pb-32 max-w-7xl mx-auto w-full flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-neutral-100">Listening Stats</h2>
        <p className="text-neutral-500">Your progress and habits over the last week.</p>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-[#1f1f1f] border-white/5 overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Total Listening Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-neutral-100">{stats.hours}</span>
                <span className="text-neutral-500 font-medium">hours</span>
                <span className="text-4xl font-bold text-neutral-100 ml-2">{stats.mins}</span>
                <span className="text-neutral-500 font-medium">mins</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-primary font-bold">
                <TrendingUp className="w-3 h-3" />
                <span>Active listener!</span>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-[#1f1f1f] border-white/5 overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Current Daily Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-neutral-100 tracking-tighter italic">{stats.streak}</span>
                <span className="text-neutral-500 font-bold uppercase text-sm">Days</span>
              </div>
              <div className="mt-4 flex items-center gap-1">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 flex-1 rounded-full ${i < Math.min(stats.streak, 7) ? 'bg-orange-500' : 'bg-neutral-800'}`} 
                  />
                ))}
              </div>
              <p className="mt-2 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                {stats.streak > 0 ? "Keep it up!" : "Start listening to build a streak!"}
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500/20 group-hover:bg-orange-500 transition-colors" />
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-[#1f1f1f] border-white/5 overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Books in Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-neutral-100">{libraryInfo.count}</span>
                <span className="text-neutral-500 font-medium">titles</span>
              </div>
              <div className="mt-4 flex -space-x-2">
                {libraryInfo.covers.map((cover, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-[#1f1f1f] bg-neutral-800 overflow-hidden shrink-0">
                    <img src={cover} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
                {libraryInfo.count > 4 && (
                  <div className="w-6 h-6 rounded-full border-2 border-[#1f1f1f] bg-neutral-800 flex items-center justify-center text-[8px] font-bold z-10 shrink-0">
                    +{libraryInfo.count - 4}
                  </div>
                )}
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />
          </Card>
        </motion.div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card className="bg-[#1f1f1f] border-white/5 p-6 h-full">
            <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg font-bold text-neutral-100">Weekly Activity</CardTitle>
                <p className="text-xs text-neutral-500">Listening time in minutes per day.</p>
              </div>
            </CardHeader>
            <CardContent className="px-0 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                    itemStyle={{ color: '#22c55e' }}
                  />
                  <Bar dataKey="minutes" radius={[4, 4, 0, 0]} barSize={40}>
                    {weeklyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.minutes > 30 ? '#22c55e' : '#444'} className="transition-all duration-300 hover:opacity-80" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <Card className="bg-[#1f1f1f] border-white/5 p-6 h-full">
            <CardHeader className="px-0 pt-0 pb-6">
              <CardTitle className="text-lg font-bold text-neutral-100">Author Distribution</CardTitle>
              <p className="text-xs text-neutral-500">Your library breakdown by author.</p>
            </CardHeader>
            <CardContent className="px-0 h-[300px] flex items-center">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3 pr-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-neutral-200 truncate w-24">{item.name}</span>
                      <span className="text-[10px] text-neutral-500 font-bold">{Math.round((item.value / libraryInfo.count) * 100)}%</span>
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
              <div className="h-full bg-yellow-500" style={{ width: `${Math.min(((weeklyData[6]?.minutes || 0) / 300) * 100, 100)}%` }} />
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-600" />
        </Card>

        <Card className="bg-[#1f1f1f] border-white/5 p-6 flex items-center gap-6 group cursor-pointer hover:bg-[#252525] transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <h4 className="font-bold text-neutral-100">Consistent Habit</h4>
            <p className="text-xs text-neutral-500">Maintain a 7-day listening streak.</p>
            <div className="mt-2 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(Math.min(stats.streak, 7) / 7) * 100}%` }} />
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-600" />
        </Card>
      </div>
    </div>
  );
}
