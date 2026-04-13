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
  Moon,
  ExternalLink,
  Lock,
  User,
  Link2,
  Server
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { testWebdavConnection } from '@/lib/webdav';

export function SettingsView() {
  // Koofr State Management
  const [koofrUrl, setKoofrUrl] = useState('https://app.koofr.net/dav/Koofr');
  const [koofrUser, setKoofrUser] = useState('');
  const [koofrPass, setKoofrPass] = useState('');
  const [koofrProxy, setKoofrProxy] = useState(''); // NEW: Proxy State
  const [isTesting, setIsTesting] = useState(false);

  // Load saved credentials when the page opens
  useEffect(() => {
    setKoofrUrl(localStorage.getItem('koofr_url') || 'https://app.koofr.net/dav/Koofr');
    setKoofrUser(localStorage.getItem('koofr_user') || '');
    setKoofrPass(localStorage.getItem('koofr_pass') || '');
    setKoofrProxy(localStorage.getItem('koofr_proxy') || ''); // Load proxy
  }, []);

  const handleConnectKoofr = async () => {
    setIsTesting(true);
    
    // Save everything to local storage
    localStorage.setItem('koofr_url', koofrUrl);
    localStorage.setItem('koofr_user', koofrUser);
    localStorage.setItem('koofr_pass', koofrPass);
    localStorage.setItem('koofr_proxy', koofrProxy); // Save proxy
    
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

      {/* --- NEW SECTION: STREAMING PROXY --- */}
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

        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Koofr */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-[#1f1f1f] border-white/5 h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Database className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-bold text-neutral-100">Koofr</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Server URL</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                      <Input 
                        value={koofrUrl}
                        onChange={(e) => setKoofrUrl(e.target.value)}
                        placeholder="https://app.koofr.net/dav/Koofr" 
                        className="bg-[#2a2a2a] border-none pl-10 focus-visible:ring-1 focus-visible:ring-primary text-white"
                      />
                    </div>
                  </div>
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
                    <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Password / App Token</Label>
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

            {/* WebDAV (Coming Soon / Optional) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-[#1f1f1f] border-white/5 h-full opacity-50 grayscale pointer-events-none">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-orange-500" />
                    </div>
                    <CardTitle className="text-lg font-bold text-neutral-100">Generic WebDAV</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-center py-10">
                   <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Available in Next Update</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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

      {/* Security Info */}
      <div className="flex items-center justify-center gap-2 text-neutral-600 py-4">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-xs font-medium">Your credentials are stored locally on this device.</span>
      </div>
    </div>
  );
}