import { Camera, Sparkles } from 'lucide-react';
import logoImage from '../assets/logo_momentia.png';

interface MomentiaLogoProps {
  variant?: 'full' | 'icon' | 'compact' | 'image';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
  showText?: boolean;
  userType?: 'customer' | 'photographer' | 'admin';
}

export function MomentiaLogo({ 
  variant = 'full', 
  size = 'md', 
  className = "",
  animated = false,
  showText = true,
  userType = 'customer'
}: MomentiaLogoProps) {
  
  const sizeClasses = {
    sm: { container: 'h-8', icon: 'w-8 h-8', text: 'text-lg', subtext: 'text-xs' },
    md: { container: 'h-10', icon: 'w-10 h-10', text: 'text-xl', subtext: 'text-sm' },
    lg: { container: 'h-12', icon: 'w-12 h-12', text: 'text-2xl', subtext: 'text-base' },
    xl: { container: 'h-16', icon: 'w-16 h-16', text: 'text-3xl', subtext: 'text-lg' }
  };

  const userTypeLabels = {
    customer: 'Khách hàng',
    photographer: 'Nhiếp ảnh gia', 
    admin: 'Quản trị viên'
  };

  const currentSize = sizeClasses[size];

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <div className={`relative ${className} ${animated ? 'group' : ''}`}>
        <div className={`relative ${currentSize.icon} rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-lg flex items-center justify-center ${animated ? 'transition-all duration-300 group-hover:shadow-xl group-hover:scale-105' : ''}`}>
          <Camera className={`w-1/2 h-1/2 text-white ${animated ? 'group-hover:rotate-6 transition-transform duration-300' : ''}`} />
          {animated && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Image variant using imported logo
  if (variant === 'image') {
    return (
      <div className={`flex items-center gap-3 ${className} ${animated ? 'group' : ''}`}>
        <img 
          src={logoImage} 
          alt="Momentia Logo" 
          className={`${currentSize.icon} object-contain ${animated ? 'transition-transform duration-300 group-hover:scale-105' : ''}`}
        />
        {showText && (
          <div className="flex flex-col">
            <span className={`font-bold text-primary ${currentSize.text} ${animated ? 'group-hover:text-primary/80 transition-colors duration-300' : ''}`}>
              Momentia
            </span>
            <span className={`text-muted-foreground ${currentSize.subtext} -mt-1`}>
              {userTypeLabels[userType]}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className} ${animated ? 'group' : ''}`}>
        <div className={`relative ${currentSize.icon} rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-md flex items-center justify-center ${animated ? 'transition-all duration-300 group-hover:shadow-lg group-hover:scale-105' : ''}`}>
          <Camera className={`w-1/2 h-1/2 text-white ${animated ? 'group-hover:rotate-3 transition-transform duration-300' : ''}`} />
        </div>
        {showText && (
          <span className={`font-bold text-primary ${currentSize.text} ${animated ? 'group-hover:text-primary/80 transition-colors duration-300' : ''}`}>
            Momentia
          </span>
        )}
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={`flex items-center gap-4 ${className} ${animated ? 'group' : ''}`}>
      {/* Logo Icon */}
      <div className="relative">
        <div className={`relative ${currentSize.icon} rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-lg flex items-center justify-center ${animated ? 'transition-all duration-500 group-hover:shadow-xl group-hover:scale-110' : ''}`}>
          <Camera className={`w-1/2 h-1/2 text-white ${animated ? 'group-hover:rotate-6 transition-transform duration-500' : ''}`} />
          
          {/* Decorative elements */}
          {animated && (
            <>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                <Sparkles className="w-2.5 h-2.5 text-white animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200"></div>
            </>
          )}
        </div>
        
        {/* Glow effect */}
        {animated && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg -z-10"></div>
        )}
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent ${currentSize.text} ${animated ? 'group-hover:scale-105 transition-transform duration-300' : ''}`}>
            Momentia
          </div>
          <div className={`text-muted-foreground ${currentSize.subtext} -mt-1 ${animated ? 'group-hover:text-foreground/70 transition-colors duration-300' : ''}`}>
            {userTypeLabels[userType]}
          </div>
        </div>
      )}
    </div>
  );
}