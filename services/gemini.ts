import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, TrainingPlan, WeekPlan, Workout, WorkoutType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

// Schema Definitions for Structured Output
const workoutSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    dayName: { type: Type.STRING, description: "Day of the week (Lunes, Martes...)" },
    type: { type: Type.STRING, description: "Type of workout from enum: Descanso, Rodaje Suave, Tempo, Intervalos, Tirada Larga, Recuperación, Fuerza" },
    distanceKm: { type: Type.NUMBER, description: "Target distance in KM. 0 if Rest or Strength." },
    durationMinutes: { type: Type.NUMBER, description: "Estimated duration in minutes." },
    description: { type: Type.STRING, description: "Detailed description of the workout structure." },
    paceTarget: { type: Type.STRING, description: "Target pace range (e.g., 5:00-5:15 min/km) or 'N/A'." },
  },
  required: ["dayName", "type", "distanceKm", "durationMinutes", "description"],
};

const weekSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    weekNumber: { type: Type.INTEGER },
    focus: { type: Type.STRING, description: "Main focus of this week (e.g., Volumen, Velocidad)" },
    workouts: {
      type: Type.ARRAY,
      items: workoutSchema,
    },
  },
  required: ["weekNumber", "focus", "workouts"],
};

const planSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    weeks: {
      type: Type.ARRAY,
      items: weekSchema,
    },
    goalSummary: { type: Type.STRING },
  },
  required: ["weeks", "goalSummary"],
};

export const generatePlan = async (profile: UserProfile): Promise<TrainingPlan> => {
  const prompt = `
    Act as an expert running coach. Create a 4-week training plan for a runner with the following profile:
    Name: ${profile.name}
    Level: ${profile.level}
    Goal: ${profile.goal}
    Days available per week: ${profile.daysPerWeek}
    Current weekly distance: ${profile.currentWeeklyDistance}km
    Notes: ${profile.notes}

    The plan should be progressive.
    Output strictly in Spanish.
    Ensure 'type' matches exactly one of: Descanso, Rodaje Suave, Tempo, Intervalos, Tirada Larga, Recuperación, Fuerza.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planSchema,
        systemInstruction: "You are a world-class running coach creating JSON training plans.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    
    // Transform to our internal type structure adding IDs
    const weeks: WeekPlan[] = data.weeks.map((week: any) => ({
      ...week,
      totalDistance: week.workouts.reduce((acc: number, w: any) => acc + (w.distanceKm || 0), 0),
      workouts: week.workouts.map((w: any) => ({
        ...w,
        id: Math.random().toString(36).substr(2, 9),
        completed: false,
      }))
    }));

    return {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      goal: data.goalSummary || profile.goal,
      weeks
    };

  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const adjustPlan = async (currentPlan: TrainingPlan, feedback: string, weekIndex: number): Promise<WeekPlan[]> => {
  const prompt = `
    The user is following a running plan. They have provided feedback and need adjustments for the REMAINING weeks starting from Week ${weekIndex + 1}.
    
    Current Goal: ${currentPlan.goal}
    User Feedback: "${feedback}"
    
    Please regenerate the plan structure for the remaining weeks based on this feedback. 
    If they are injured or tired, reduce volume/intensity. If it's too easy, increase slightly.
    Keep the structure valid JSON.
  `;

  try {
     const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                weeks: { type: Type.ARRAY, items: weekSchema }
            }
        },
        systemInstruction: "You are an expert running coach adjusting an existing plan based on feedback.",
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    const data = JSON.parse(text);

     const newWeeks: WeekPlan[] = data.weeks.map((week: any) => ({
      ...week,
      totalDistance: week.workouts.reduce((acc: number, w: any) => acc + (w.distanceKm || 0), 0),
      workouts: week.workouts.map((w: any) => ({
        ...w,
        id: Math.random().toString(36).substr(2, 9),
        completed: false,
      }))
    }));

    return newWeeks;

  } catch (error) {
    console.error("Error adjusting plan:", error);
    throw error;
  }
};

export const chatWithCoach = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
    const chat = ai.chats.create({
        model: modelName,
        history: history,
        config: {
            systemInstruction: "You are a helpful, motivating, and brief running coach. Answer questions about running form, nutrition, injury prevention, and strategy. Keep answers under 100 words unless asked for detail."
        }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Lo siento, no pude procesar eso.";
}
