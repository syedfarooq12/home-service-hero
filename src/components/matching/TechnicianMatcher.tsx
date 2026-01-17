import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  MapPin, 
  Star, 
  Award, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  User,
  Phone
} from 'lucide-react';
import { useTechnicianMatcher, MatchedTechnician } from '@/hooks/useTechnicianMatcher';

interface TechnicianMatcherProps {
  serviceCategory: string;
  serviceDescription?: string;
  customerLatitude?: number;
  customerLongitude?: number;
  onSelectTechnician?: (technician: MatchedTechnician) => void;
}

export function TechnicianMatcher({
  serviceCategory,
  serviceDescription,
  customerLatitude,
  customerLongitude,
  onSelectTechnician,
}: TechnicianMatcherProps) {
  const { findMatches, isMatching, matchResult, clearMatches } = useTechnicianMatcher();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleFindMatches = async () => {
    await findMatches({
      serviceCategory,
      serviceDescription,
      customerLatitude,
      customerLongitude,
    });
  };

  const handleSelectTechnician = (match: MatchedTechnician) => {
    setSelectedId(match.technician.id);
    onSelectTechnician?.(match);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          AI Technician Matching
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!matchResult ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Intelligent Matching
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our AI analyzes skills, experience, location, and availability to find the perfect technician for your {serviceCategory} service.
            </p>
            <Button 
              onClick={handleFindMatches} 
              disabled={isMatching}
              className="gap-2"
            >
              {isMatching ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Find Best Match
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* AI Recommendation */}
            {matchResult.recommendation && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary">AI Recommendation</p>
                    <p className="text-sm text-muted-foreground">{matchResult.recommendation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Matched Technicians */}
            <div className="space-y-3">
              {matchResult.matches.map((match) => (
                <div
                  key={match.technician.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedId === match.technician.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectTechnician(match)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">
                            {match.technician.name}
                          </h4>
                          {match.rank === 1 && (
                            <Badge variant="default" className="text-xs">
                              Best Match
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          {match.estimatedDistance && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {match.estimatedDistance}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {match.technician.experience}+ yrs
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.technician.city}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{match.matchScore}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Match Score</p>
                    </div>
                  </div>

                  {/* Match Progress */}
                  <div className="mt-3">
                    <Progress value={match.matchScore} className="h-1.5" />
                  </div>

                  {/* Skills */}
                  {match.technician.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {match.technician.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {match.technician.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{match.technician.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Match Reasons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {match.matchReasons.map((reason, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        {reason}
                      </span>
                    ))}
                  </div>

                  {/* AI Insight */}
                  {match.aiInsight && (
                    <div className="mt-3 p-2 rounded bg-secondary/50">
                      <p className="text-xs text-muted-foreground flex items-start gap-1">
                        <Sparkles className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        {match.aiInsight}
                      </p>
                    </div>
                  )}

                  {/* Certifications */}
                  {match.technician.certifications.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Award className="h-3 w-3 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {match.technician.certifications.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Select Button */}
                  {selectedId === match.technician.id && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-primary font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Selected
                      </span>
                      <a 
                        href={`tel:${match.technician.phone}`}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-3 w-3" />
                        Contact
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {matchResult.matches.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p>No available technicians found for this service.</p>
                <p className="text-sm">Try a different service category or time.</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" size="sm" onClick={clearMatches}>
                Search Again
              </Button>
              <p className="text-xs text-muted-foreground">
                Matched using {matchResult.algorithm}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
