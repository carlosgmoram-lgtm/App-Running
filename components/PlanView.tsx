import React, { useState } from 'react';
import { TrainingPlan, WeekPlan, Workout, WorkoutType } from '../types';
import { Calendar, CheckCircle2, Circle, Clock, MapPin, TrendingUp, AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PlanViewProps {
  plan: TrainingPlan;
  onUpdateWorkout: (weekIndex: number, workoutId: string, updates: Partial<Workout>) => void;
  onRequestAdjustment: (weekIndex: number, feedback: string) => Promise<void>;
  onOpenChat: () => void;
}

const PlanView: React.FC<PlanViewProps> = ({ plan, onUpdateWorkout, onRequestAdjustment, onOpenChat }) => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustmentFeedback, setAdjustmentFeedback] = useState("");

  const currentWeek = plan.weeks[selectedWeek];

  const getWorkoutColor = (type: WorkoutType) => {
    switch (type) {
      case WorkoutType.REST: return 'bg-zinc-800 border-zinc-700 text-zinc-400';
      case WorkoutType.EASY_RUN: return 'bg-emerald-900/20 border-emerald-800 text-emerald-400';
      case WorkoutType.TEMPO: return 'bg-amber-900/20 border-amber-800 text-amber-400';
      case WorkoutType.INTERVALS: return 'bg-rose-900/20 border-rose-800 text-rose-400';
      case WorkoutType.LONG_RUN: return 'bg-blue-900/20 border-blue-800 text-blue-400';
      case WorkoutType.STRENGTH: return 'bg-purple-900/20 border-purple-800 text-purple-400';
      default: return 'bg-zinc-800 border-zinc-700 text-zinc-300';
    }
  };

  const handleToggleComplete = (e: React.MouseEvent, workout: Workout) => {
    e.stopPropagation();
    onUpdateWorkout(selectedWeek, workout.id, { completed: !workout.completed });
  };

  const handleAdjustmentSubmit = async () => {
    if (!adjustmentFeedback.trim()) return;
    setIsAdjusting(true);
    await onRequestAdjustment(selectedWeek, adjustmentFeedback);
    setIsAdjusting(false);
    setAdjustmentFeedback("");
    // Close modal or show success toast
  };

  // Chart Data Preparation
  const chartData = plan.weeks.map(w => ({
    name: `Sem ${w.weekNumber}`,
    distance: w.totalDistance,
    active: w.weekNumber === currentWeek.weekNumber
  }));

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* Header */}
      <header className="mb-8 flex justify-between items-start">
        <div>
            <h1 className="text-2xl font-bold text-white mb-1">Plan de {plan.goal}</h1>
            <p className="text-zinc-400 text-sm">Semana {currentWeek.weekNumber} - {currentWeek.focus}</p>
        </div>
        <button 
            onClick={onOpenChat}
            className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-full transition shadow-lg"
        >
            <MessageCircle className="h-6 w-6" />
        </button>
      </header>

      {/* Week Navigation */}
      <div className="flex overflow-x-auto gap-3 pb-4 mb-6 scrollbar-hide">
        {plan.weeks.map((week, idx) => (
          <button
            key={week.weekNumber}
            onClick={() => setSelectedWeek(idx)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
              selectedWeek === idx
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600'
            }`}
          >
            Semana {week.weekNumber}
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Workouts List */}
        <div className="md:col-span-2 space-y-3">
          {currentWeek.workouts.map((workout) => (
            <div
              key={workout.id}
              onClick={() => setSelectedWorkout(workout)}
              className={`relative p-4 rounded-xl border transition cursor-pointer hover:translate-x-1 ${getWorkoutColor(workout.type)} ${
                workout.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-75">{workout.dayName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-black/20">{workout.type}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{workout.distanceKm > 0 ? `${workout.distanceKm} km` : workout.durationMinutes + ' min'}</h3>
                  <p className="text-sm opacity-80 line-clamp-1">{workout.description}</p>
                </div>
                
                <button
                  onClick={(e) => handleToggleComplete(e, workout)}
                  className={`ml-3 p-1 rounded-full transition ${
                    workout.completed ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {workout.completed ? <CheckCircle2 className="h-8 w-8" /> : <Circle className="h-8 w-8" />}
                </button>
              </div>
            </div>
          ))}
          
          {/* Adjustment Section */}
          <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-zinc-300 font-medium flex items-center gap-2 mb-3">
                <RefreshCw className="h-4 w-4" />
                Ajustar Plan
            </h4>
            <textarea
                value={adjustmentFeedback}
                onChange={(e) => setAdjustmentFeedback(e.target.value)}
                placeholder="¿Esta semana fue muy difícil? ¿Te perdiste un entreno? Cuéntale a la IA para reestructurar el futuro..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none resize-none mb-3"
                rows={3}
            />
            <button
                onClick={handleAdjustmentSubmit}
                disabled={isAdjusting || !adjustmentFeedback}
                className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
                {isAdjusting ? 'Calculando...' : 'Reajustar Semanas Restantes'}
            </button>
          </div>
        </div>

        {/* Right Col: Stats & Detail */}
        <div className="space-y-6">
            {/* Weekly Volume Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h4 className="text-xs font-medium text-zinc-500 uppercase mb-4">Progreso de Volumen</h4>
                <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" tick={{fontSize: 10, fill: '#71717a'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#18181b', border: 'none', borderRadius: '8px'}}
                                itemStyle={{color: '#fff'}}
                                cursor={{fill: 'transparent'}}
                            />
                            <Bar dataKey="distance" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.active ? '#10b981' : '#3f3f46'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Selected Workout Detail View (Desktop Sticky / Mobile Modal placeholder) */}
            {selectedWorkout && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white">{selectedWorkout.dayName}</h3>
                        <span className={`text-xs px-2 py-1 rounded border ${getWorkoutColor(selectedWorkout.type)} bg-opacity-10`}>
                            {selectedWorkout.type}
                        </span>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 bg-zinc-950 p-3 rounded-lg">
                                <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1"><MapPin className="h-3 w-3"/> Distancia</div>
                                <div className="text-lg font-mono text-white">{selectedWorkout.distanceKm} km</div>
                            </div>
                            <div className="flex-1 bg-zinc-950 p-3 rounded-lg">
                                <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1"><Clock className="h-3 w-3"/> Tiempo</div>
                                <div className="text-lg font-mono text-white">{selectedWorkout.durationMinutes} min</div>
                            </div>
                        </div>

                        {selectedWorkout.paceTarget && (
                             <div className="bg-zinc-950 p-3 rounded-lg">
                                <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3"/> Ritmo Objetivo</div>
                                <div className="text-emerald-400 font-mono">{selectedWorkout.paceTarget}</div>
                            </div>
                        )}

                        <div className="bg-zinc-950 p-3 rounded-lg">
                             <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> Detalles</div>
                             <p className="text-sm text-zinc-300 leading-relaxed">{selectedWorkout.description}</p>
                        </div>

                        <button
                            onClick={() => {
                                onUpdateWorkout(selectedWeek, selectedWorkout.id, { completed: !selectedWorkout.completed });
                                setSelectedWorkout(null);
                            }}
                            className={`w-full py-3 rounded-lg font-medium transition ${
                                selectedWorkout.completed 
                                ? 'bg-zinc-800 text-zinc-400' 
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                        >
                            {selectedWorkout.completed ? 'Marcar como Pendiente' : 'Marcar Completado'}
                        </button>
                     </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PlanView;