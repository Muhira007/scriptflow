import { User, Mail, Camera } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="h-full flex flex-col gap-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-muted-foreground">Update your personal information and profile picture.</p>
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-8 shadow-sm max-w-3xl">
        <form className="space-y-8">
          
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center overflow-hidden">
                <User className="w-10 h-10 text-primary" />
              </div>
              <button 
                type="button" 
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-medium text-lg">Profile Picture</h3>
              <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="name"
                  type="text"
                  defaultValue="Creator"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Email (Disabled/Read-only usually for basic profile edit) */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  defaultValue="creator@example.com"
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none cursor-not-allowed opacity-70"
                />
              </div>
              <p className="text-xs text-muted-foreground">Contact support to change your email.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button type="button" className="px-6 py-2 border border-border rounded-xl hover:bg-muted font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
