import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Cloud, 
  Settings, 
  Database, 
  Globe, 
  HardDrive, 
  ShieldCheck, 
  RefreshCw, 
  Wifi, 
  Lock,
  User,
  Link2,
  Server,
  Plus,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { testWebdavConnection, importLibraryData } from '@/lib/webdav'; // Removed exportLibraryData since we handle it here now
import pkg from '../../package.json';

export function SettingsView() {
  // Koofr State Management
  const [koofrUrl, setKoofrUrl] = useState('https://app.koofr.net/dav/Koofr');
  const [koofrUser, setKoofrUser] = useState('');
  const [koofrPass, setKoofrPass] = useState('');
  const [koofrProxy, setKoofrProxy] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  
  // NEW: State to hold the backup data
  const [backupReady, setBackupReady] = useState<string | null>(null);

  // Load saved credentials when the page opens
  useEffect(() => {
    setKoofrUrl(localStorage.getItem('koofr_url') || 'https://app.koofr.net/dav/Koofr');
    setKoofrUser(localStorage.getItem('koofr_user') || '');
    setKoofrPass(localStorage.getItem('koofr_pass') || '');
    setKoofrProxy(localStorage.getItem('koofr_proxy') || '');
  }, []);

  const handleConnectKoofr = async () => {
    setIsTesting(true);
    
    // Save everything to local storage
    localStorage.setItem('koofr_url', koofrUrl);
    localStorage.setItem('koofr_user', koofrUser);
    localStorage.setItem('koofr_pass', koofrPass);
    localStorage.setItem('koofr_proxy', koofrProxy);
    
    // Test the connection
    const result = await testWebdavConnection(koofrUrl, koofrUser, koofrPass);
    
    setIsTesting(false);
    if (result.success) {
      alert("Success! Connected to Koofr. Proxy settings saved.");
    } else {
      alert("Connection failed. Check your App Password and email.\nError: " + result.message);
    }
  };

  return (
    <div className="p-6 pb-32 max-w-5xl mx-auto w-full flex flex-col gap-10">
      <header className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-neutral-100">Settings</h2>
        <p className="text-neutral-500">Manage your cloud connections and application preferences.</p>
      </header>

      {/* Streaming Proxy Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-neutral-400">
          <Server className="w-5 h-5" />
          <h3 className="text-lg font-bold uppercase tracking-widest text-sm">Streaming Proxy</h3>
        </div>
        <Card className="bg-[#1f1f1f] border-white/5 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-neutral-100">Cloudflare Worker Proxy</CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              Required to bypass CORS restrictions for cloud streaming.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Worker URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <Input 
                  value={koofrProxy}
                  onChange={(e) => setKoofrProxy(e.target.value)}
                  placeholder="https://your-worker.workers.dev" 
                  className="bg-[#2a2a2a] border-none pl-10 focus-visible:ring-1 focus-visible:ring-primary text-white"
                />
              </div>
              <p className="text-[10px] text-neutral-600 italic">
                Enter the full URL of your deployed Cloudflare Worker script.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cloud Connections Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-neutral-400">
          <Cloud className="w-5 h-5" />
          <h3 className="text-lg font-bold uppercase tracking-widest text-sm">Cloud Connections</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Google Drive Status (Informational) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-[#1f1f1f] border-white/5 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-neutral-100">Google Drive</CardTitle>
                    <CardDescription className="text-[10px] text-neutral-500">Connected via Koofr Mount</CardDescription>
                  </div>
                </div>
                <div className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase">Active</div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Koofr Configuration */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-[#1f1f1f] border-white/5 h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-bold text-neutral-100">Koofr Credentials</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <Input 
                      value={koofrUser}
                      onChange={(e) => setKoofrUser(e.target.value)}
                      placeholder="email@example.com" 
                      className="bg-[#2a2a2a] border-none pl-10 focus-visible:ring-1 focus-visible:ring-primary text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">App Token</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <Input 
                      type="password" 
                      value={koofrPass}
                      onChange={(e) => setKoofrPass(e.target.value)}
                      placeholder="••••••••••••" 
                      className="bg-[#2a2a2a] border-none pl-10 focus-visible:ring-1 focus-visible:ring-primary text-white"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleConnectKoofr} 
                  disabled={isTesting}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold mt-2 gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  {isTesting ? 'Testing...' : 'Save & Connect'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* App Preferences Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-neutral-400">
          <Settings className="w-5 h-5" />
          <h3 className="text-lg font-bold uppercase tracking-widest text-sm">App Preferences</h3>
        </div>
        <Card className="bg-[#1f1f1f] border-white/5 divide-y divide-white/5">
          <div className="p-6 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-neutral-100">Auto-Sync Progress</p>
                <p className="text-xs text-neutral-500">Automatically sync your listening position across devices.</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="p-6 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wifi className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-bold text-neutral-100">Download over Wi-Fi only</p>
                <p className="text-xs text-neutral-500">Save mobile data by restricting downloads to Wi-Fi connections.</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </Card>
      </section>
      
      {/* Maintenance & Backup Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-neutral-400">
          <Database className="w-5 h-5" />
          <h3 className="text-lg font-bold uppercase tracking-widest text-sm">Maintenance</h3>
        </div>
        <Card className="bg-[#1f1f1f] border-white/5 overflow-hidden">
          <div className="p-6 flex flex-col gap-6">
            <div className="space-y-1">
              <p className="font-bold text-neutral-100">Backup & Restore</p>
              <p className="text-xs text-neutral-500">
                Save your metadata, cover URLs, and listening streaks to a file.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* THE NEW EXPORT LOGIC */}
              {!backupReady ? (
                <Button 
                  variant="outline" 
                  className="border-white/10 hover:bg-white/5 text-white gap-2 h-12"
                  onClick={() => {
                    // Gather all the data including audiobook progress
                    const data = {
                      meta: localStorage.getItem('custom_meta'),
                      covers: localStorage.getItem('custom_covers'),
                      stats: localStorage.getItem('koofr_listening_stats'),
                      proxy: localStorage.getItem('koofr_proxy'),
                      progress: localStorage.getItem('book_progress'),
                      creds: {
                        user: localStorage.getItem('koofr_user'),
                        pass: localStorage.getItem('koofr_pass'),
                        url: localStorage.getItem('koofr_url')
                      }
                    };
                    // Set it to state to reveal the download links
                    setBackupReady(JSON.stringify(data, null, 2));
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate Backup
                </Button>
              ) : (
                <div className="flex flex-col gap-2 relative z-10">
                  {/* Physical Download Link */}
                  <a 
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(backupReady)}`}
                    download={`sirin-backup-${new Date().toISOString().split('T')[0]}.json`}
                    className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-white font-bold h-10 rounded-md gap-2 text-sm"
                    onClick={() => setTimeout(() => setBackupReady(null), 2000)}
                  >
                    <HardDrive className="w-4 h-4" />
                    Save File
                  </a>
                  
                  {/* Clipboard Fallback */}
                  <Button 
                    variant="outline" 
                    className="w-full text-neutral-300 border-white/10 h-10 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(backupReady);
                      alert("Backup copied to clipboard! Paste it securely in a Notes app.");
                      setBackupReady(null);
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Text
                  </Button>
                </div>
              )}

              {/* IMPORT BUTTON LOGIC */}
              <div className="relative h-12">
                <Button className="w-full h-full bg-neutral-800 hover:bg-neutral-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Import Data
                </Button>
                <input 
                  type="file" 
                  accept=".json" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (res) => {
                        importLibraryData(res.target?.result as string);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-black/20 p-4 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">App Version</span>
            <span className="text-[10px] font-mono text-primary font-bold">v{pkg.version}</span>
          </div>
        </Card>
      </section>

      {/* Security Info Footer */}
      <div className="flex items-center justify-center gap-2 text-neutral-600 py-4">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-xs font-medium">Your credentials are stored locally on this device.</span>
      </div>
    </div>
  );
}