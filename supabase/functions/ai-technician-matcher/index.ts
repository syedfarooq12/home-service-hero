import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchRequest {
  serviceCategory: string;
  customerLatitude?: number;
  customerLongitude?: number;
  scheduledDate?: string;
  scheduledTime?: string;
  serviceDescription?: string;
}

interface TechnicianScore {
  technician: any;
  score: number;
  matchReasons: string[];
  estimatedDistance?: number;
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      serviceCategory, 
      customerLatitude, 
      customerLongitude, 
      scheduledDate,
      scheduledTime,
      serviceDescription 
    } = await req.json() as MatchRequest;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch available technicians with approved KYC
    const { data: technicians, error: techError } = await supabase
      .from('technician_profiles')
      .select('*')
      .eq('kyc_status', 'approved')
      .eq('is_available', true);

    if (techError) {
      console.error('Error fetching technicians:', techError);
      throw new Error('Failed to fetch technicians');
    }

    if (!technicians || technicians.length === 0) {
      return new Response(JSON.stringify({ 
        matches: [],
        message: 'No available technicians found'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get technician booking history for rating calculation
    const { data: bookings } = await supabase
      .from('bookings')
      .select('technician_id, status')
      .in('technician_id', technicians.map(t => t.id))
      .eq('status', 'completed');

    // Calculate completion rates
    const completionRates: Record<string, number> = {};
    if (bookings) {
      const techBookings: Record<string, number> = {};
      bookings.forEach(b => {
        if (b.technician_id) {
          techBookings[b.technician_id] = (techBookings[b.technician_id] || 0) + 1;
        }
      });
      Object.entries(techBookings).forEach(([id, count]) => {
        completionRates[id] = Math.min(count / 10, 1); // Normalize to 0-1
      });
    }

    // Pre-calculate scores using traditional algorithm
    const scoredTechnicians: TechnicianScore[] = technicians.map(tech => {
      let score = 0;
      const matchReasons: string[] = [];
      let estimatedDistance: number | undefined;

      // Skill matching (0-40 points)
      const skills = tech.skills || [];
      const categoryLower = serviceCategory.toLowerCase();
      const hasMatchingSkill = skills.some((skill: string) => 
        skill.toLowerCase().includes(categoryLower) || 
        categoryLower.includes(skill.toLowerCase())
      );
      if (hasMatchingSkill) {
        score += 40;
        matchReasons.push('Specialized in this service');
      } else if (skills.length > 0) {
        score += 10;
        matchReasons.push('Multi-skilled technician');
      }

      // Experience (0-20 points)
      const experience = tech.years_of_experience || 0;
      const experienceScore = Math.min(experience * 2, 20);
      score += experienceScore;
      if (experience >= 5) {
        matchReasons.push(`${experience}+ years experience`);
      }

      // Location proximity (0-25 points)
      if (customerLatitude && customerLongitude && tech.latitude && tech.longitude) {
        estimatedDistance = calculateDistance(
          customerLatitude, customerLongitude,
          Number(tech.latitude), Number(tech.longitude)
        );
        const serviceRadius = tech.service_radius_km || 10;
        if (estimatedDistance <= serviceRadius) {
          const proximityScore = Math.max(0, 25 - (estimatedDistance * 2.5));
          score += proximityScore;
          matchReasons.push(`${estimatedDistance.toFixed(1)}km away`);
        }
      } else {
        score += 10; // Default if no location data
      }

      // Completion rate bonus (0-15 points)
      const completionRate = completionRates[tech.id] || 0;
      score += completionRate * 15;
      if (completionRate > 0.5) {
        matchReasons.push('High completion rate');
      }

      // Certifications bonus (0-10 points)
      const certifications = tech.certifications || [];
      if (certifications.length > 0) {
        score += Math.min(certifications.length * 2, 10);
        matchReasons.push('Certified professional');
      }

      return { technician: tech, score, matchReasons, estimatedDistance };
    });

    // Sort by score
    scoredTechnicians.sort((a, b) => b.score - a.score);

    // Take top 5 for AI analysis
    const topCandidates = scoredTechnicians.slice(0, 5);

    // Use AI to provide intelligent ranking and insights
    const aiPrompt = `You are an intelligent technician matching system. Analyze these candidates for a ${serviceCategory} service job${serviceDescription ? `: "${serviceDescription}"` : ''}.

Candidates (pre-scored):
${topCandidates.map((t, i) => `
${i + 1}. ${t.technician.full_name}
   - Score: ${t.score.toFixed(0)}/100
   - Skills: ${(t.technician.skills || []).join(', ') || 'Not specified'}
   - Experience: ${t.technician.years_of_experience || 0} years
   - Distance: ${t.estimatedDistance ? t.estimatedDistance.toFixed(1) + 'km' : 'Unknown'}
   - Certifications: ${(t.technician.certifications || []).join(', ') || 'None'}
   - Match reasons: ${t.matchReasons.join(', ')}
`).join('\n')}

Respond with a JSON object containing:
{
  "rankedIds": ["id1", "id2", ...], // Technician IDs in recommended order
  "insights": {
    "technicianId": "personalized reason why this technician is good for this job"
  },
  "overallRecommendation": "Brief explanation of the best match"
}

Consider: skill match quality, experience level, proximity, and certifications.`;

    console.log('Calling AI for intelligent matching...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a precise technician matching algorithm. Always respond with valid JSON only.' },
          { role: 'user', content: aiPrompt }
        ],
        max_tokens: 1000,
      }),
    });

    let finalMatches = topCandidates;
    let aiInsights: Record<string, string> = {};
    let recommendation = '';

    if (aiResponse.ok) {
      try {
        const aiData = await aiResponse.json();
        const aiContent = aiData.choices[0].message.content;
        
        // Extract JSON from response
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Reorder based on AI ranking
          if (parsed.rankedIds && Array.isArray(parsed.rankedIds)) {
            const reordered: TechnicianScore[] = [];
            parsed.rankedIds.forEach((id: string) => {
              const found = topCandidates.find(t => t.technician.id === id);
              if (found) reordered.push(found);
            });
            // Add any not included by AI
            topCandidates.forEach(t => {
              if (!reordered.find(r => r.technician.id === t.technician.id)) {
                reordered.push(t);
              }
            });
            finalMatches = reordered;
          }
          
          aiInsights = parsed.insights || {};
          recommendation = parsed.overallRecommendation || '';
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }
    } else {
      console.error('AI API error:', aiResponse.status);
      if (aiResponse.status === 429) {
        console.log('Rate limited, using algorithmic matching only');
      }
    }

    // Format response
    const matches = finalMatches.map((match, index) => ({
      rank: index + 1,
      technician: {
        id: match.technician.id,
        name: match.technician.full_name,
        phone: match.technician.phone,
        skills: match.technician.skills || [],
        experience: match.technician.years_of_experience || 0,
        certifications: match.technician.certifications || [],
        city: match.technician.city,
        isAvailable: match.technician.is_available,
      },
      matchScore: Math.round(match.score),
      matchReasons: match.matchReasons,
      aiInsight: aiInsights[match.technician.id] || null,
      estimatedDistance: match.estimatedDistance ? `${match.estimatedDistance.toFixed(1)} km` : null,
    }));

    console.log(`Matched ${matches.length} technicians for ${serviceCategory}`);

    return new Response(JSON.stringify({
      matches,
      recommendation,
      matchedAt: new Date().toISOString(),
      algorithm: 'hybrid-ai-v1'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-technician-matcher:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
