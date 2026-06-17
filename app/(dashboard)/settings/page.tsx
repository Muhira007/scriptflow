import { Settings, Bell, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="h-full flex flex-col gap-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and configurations.</p>
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-8 shadow-sm max-w-3xl">
        <div className="space-y-8">
          
          {/* Notifications */}
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="font-medium block">Email Notifications</span>
                  <span className="text-sm text-muted-foreground">Receive updates about your account and credits.</span>
                </div>
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary relative"></div>
              </label>
            </div>
          </div>

          <hr className="border-border" />

          {/* Security */}
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              Security
            </h3>
            <div className="space-y-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors text-sm font-medium">
                <Key className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>

          <hr className="border-border" />

          {/* Danger Zone */}
          <div>
            <h3 className="text-xl font-semibold text-red-500 mb-4">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium">
              Delete Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
