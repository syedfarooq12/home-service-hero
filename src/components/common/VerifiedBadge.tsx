import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShieldCheck, BadgeCheck, FileCheck, UserCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  kycStatus?: 'pending' | 'approved' | 'rejected';
  backgroundChecked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VerifiedBadge = ({ 
  kycStatus = 'approved', 
  backgroundChecked = true, 
  size = 'md',
  showLabel = true 
}: VerifiedBadgeProps) => {
  const isVerified = kycStatus === 'approved';
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const badgeSizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1',
  };

  if (!isVerified) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`${badgeSizes[size]} bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 cursor-help gap-1`}
          >
            <ShieldCheck className={sizeClasses[size]} />
            {showLabel && 'Verified'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">Verified Professional</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-500" />
                <span>Identity Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-500" />
                <span>Documents Verified</span>
              </div>
              {backgroundChecked && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                  <span>Background Checked</span>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const VerificationBadges = ({ 
  kycStatus = 'approved', 
  backgroundChecked = true 
}: VerifiedBadgeProps) => {
  const isVerified = kycStatus === 'approved';

  return (
    <div className="flex flex-wrap gap-2">
      {isVerified && (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
          <BadgeCheck className="h-3 w-3" />
          ID Verified
        </Badge>
      )}
      {backgroundChecked && (
        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
          <ShieldCheck className="h-3 w-3" />
          Background Checked
        </Badge>
      )}
    </div>
  );
};

export const TrustBanner = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Verified & Background-Checked Professionals</h4>
          <p className="text-sm text-muted-foreground">
            Every helper is ID verified, skill-tested, and background-checked for your safety
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BadgeCheck className="h-4 w-4 text-emerald-500" />
          <span>Government ID Verified</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileCheck className="h-4 w-4 text-emerald-500" />
          <span>Skill Certification</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <UserCheck className="h-4 w-4 text-emerald-500" />
          <span>Criminal Background Check</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Address Verification</span>
        </div>
      </div>
    </div>
  );
};
