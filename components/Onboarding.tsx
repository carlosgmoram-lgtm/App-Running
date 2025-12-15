import React, { useState } from 'react';
import { UserLevel, GoalType, UserProfile } from '../types';
import { Activity, Calendar, Trophy, User, ChevronRight, Loader2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  isLoading: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isLoading }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    level: UserLevel.BEGINNER,
    goal: GoalType.FIVE_K,
    daysPerWeek: 3,
    currentWeeklyDistance: 0,
    notes: '',
  });

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleSubmit = () => {
    if (formData.name && formData.age) {
      onComplete(formData as UserProfile);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-2xl font-bold text-white mb-2">¡Empecemos!</h2>
            <p className="text-zinc-400 mb-6">Cuéntanos un poco sobre ti.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                  <input
                    type="text"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                    placeholder="Tu nombre"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Edad</label>
                <input
                  type="number"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.age || ''}
                  onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                />
              </div>
            </div>
             <button
              onClick={handleNext}
              disabled={!formData.name || !formData.age}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
             <h2 className="text-2xl font-bold text-white mb-2">Tu Experiencia</h2>
             <p className="text-zinc-400 mb-6">¿Cuál es tu nivel actual?</p>
            
            <div className="space-y-3">
              {Object.values(UserLevel).map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, level })}
                  className={`w-full p-4 rounded-xl border text-left transition ${
                    formData.level === level
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="font-semibold">{level}</div>
                </button>
              ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2 mt-4">Distancia semanal actual (km)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  value={formData.currentWeeklyDistance || 0}
                  onChange={e => setFormData({ ...formData, currentWeeklyDistance: parseInt(e.target.value) })}
                />
                <div className="text-right text-emerald-400 font-mono mt-1">{formData.currentWeeklyDistance} km</div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 py-3 text-zinc-400 hover:text-white transition">Atrás</button>
              <button onClick={handleNext} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition">Siguiente</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-2xl font-bold text-white mb-2">Tu Objetivo</h2>
            <p className="text-zinc-400 mb-6">¿Qué quieres lograr?</p>

            <div className="grid grid-cols-2 gap-3">
              {Object.values(GoalType).map((goal) => (
                <button
                  key={goal}
                  onClick={() => setFormData({ ...formData, goal })}
                  className={`p-3 rounded-xl border text-center text-sm transition ${
                    formData.goal === goal
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Días disponibles por semana</label>
              <div className="flex justify-between bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <button
                    key={num}
                    onClick={() => setFormData({ ...formData, daysPerWeek: num })}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                      formData.daysPerWeek === num
                        ? 'bg-emerald-600 text-white'
                        : 'text-zinc-500 hover:bg-zinc-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
               <label className="block text-sm font-medium text-zinc-300 mb-1">Notas adicionales (lesiones, preferencias...)</label>
               <textarea 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 px-4 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-20 resize-none"
                  placeholder="Ej: Prefiero correr por las mañanas, tengo molestias en la rodilla..."
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
               />
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(2)} className="flex-1 py-3 text-zinc-400 hover:text-white transition">Atrás</button>
              <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Generar Plan'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        
        <div className="mb-8 flex justify-center">
            <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                <Activity className="h-6 w-6" />
            </div>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding;