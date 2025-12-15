import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import PlanView from './components/PlanView';
import ChatCoach from './components/ChatCoach';
import { TrainingPlan, UserProfile, Workout } from './types';
import { generatePlan, adjustPlan } from './services/gemini';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem('runai_plan');
    const savedProfile = localStorage.getItem('runai_profile');
    
    if (savedPlan) setPlan(JSON.parse(savedPlan));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  // Save to local storage whenever plan changes
  useEffect(() => {
    if (plan) localStorage.setItem('runai_plan', JSON.stringify(plan));
    if (profile) localStorage.setItem('runai_profile', JSON.stringify(profile));
  }, [plan, profile]);

  const handleOnboardingComplete = async (userProfile: UserProfile) => {
    setLoading(true);
    setProfile(userProfile);
    try {
      const newPlan = await generatePlan(userProfile);
      setPlan(newPlan);
    } catch (error) {
      console.error("Failed to generate plan", error);
      alert("Hubo un error generando tu plan. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const updateWorkout = (weekIndex: number, workoutId: string, updates: Partial<Workout>) => {
    if (!plan) return;
    
    const newPlan = { ...plan };
    const week = newPlan.weeks[weekIndex];
    const workoutIndex = week.workouts.findIndex(w => w.id === workoutId);
    
    if (workoutIndex >= 0) {
      week.workouts[workoutIndex] = { ...week.workouts[workoutIndex], ...updates };
      setPlan(newPlan);
    }
  };

  const handleRequestAdjustment = async (weekIndex: number, feedback: string) => {
    if (!plan) return;
    
    // Optimistic UI could happen here, but since it's a complex AI op, we'll show a loader
    // Using global loader for simplicity in this demo, ideally scoped to the section
    const originalPlan = plan;
    try {
        const newWeeks = await adjustPlan(plan, feedback, weekIndex);
        
        // Merge new weeks into plan
        const updatedPlan = { ...plan };
        
        // Replace weeks from weekIndex + 1 onwards
        // Note: The AI returns the new structure for remaining weeks.
        // We carefully splice them in.
        let newWeekCounter = 0;
        for(let i = weekIndex + 1; i < updatedPlan.weeks.length; i++) {
            if(newWeeks[newWeekCounter]) {
                // Keep the week number consistent, update content
                updatedPlan.weeks[i] = {
                    ...newWeeks[newWeekCounter],
                    weekNumber: updatedPlan.weeks[i].weekNumber
                };
                newWeekCounter++;
            }
        }
        
        setPlan(updatedPlan);
    } catch (error) {
        console.error("Adjustment failed", error);
        alert("No se pudo ajustar el plan. Intenta nuevamente.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mb-4" />
        <h2 className="text-xl font-semibold">Diseñando tu plan perfecto...</h2>
        <p className="text-zinc-500 mt-2">La IA está analizando tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {!plan ? (
        <Onboarding onComplete={handleOnboardingComplete} isLoading={loading} />
      ) : (
        <>
            <PlanView 
                plan={plan} 
                onUpdateWorkout={updateWorkout}
                onRequestAdjustment={handleRequestAdjustment}
                onOpenChat={() => setIsChatOpen(true)}
            />
            <ChatCoach isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
      )}
    </div>
  );
};

export default App;