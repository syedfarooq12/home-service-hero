import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MatchedTechnician {
  rank: number;
  technician: {
    id: string;
    name: string;
    phone: string;
    skills: string[];
    experience: number;
    certifications: string[];
    city: string;
    isAvailable: boolean;
  };
  matchScore: number;
  matchReasons: string[];
  aiInsight: string | null;
  estimatedDistance: string | null;
}

export interface MatchResult {
  matches: MatchedTechnician[];
  recommendation: string;
  matchedAt: string;
  algorithm: string;
}

export function useTechnicianMatcher() {
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const findMatches = async (params: {
    serviceCategory: string;
    customerLatitude?: number;
    customerLongitude?: number;
    scheduledDate?: string;
    scheduledTime?: string;
    serviceDescription?: string;
  }) => {
    setIsMatching(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-technician-matcher', {
        body: params,
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setMatchResult(data);
      
      if (data.matches.length > 0) {
        toast.success(`Found ${data.matches.length} matching technicians`);
      } else {
        toast.info('No available technicians found for this service');
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find matches';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsMatching(false);
    }
  };

  const clearMatches = () => {
    setMatchResult(null);
    setError(null);
  };

  return {
    findMatches,
    clearMatches,
    isMatching,
    matchResult,
    error,
  };
}
