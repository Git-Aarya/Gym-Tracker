import React, { useState, useEffect, useCallback, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app'; // This is temporarily disabled. See note below.
import { ArrowLeft, Plus, Check, Dumbbell, Trash2, Save, Clock, Flame, History, LayoutTemplate, X, Timer, Pencil, BarChart2, Target, TrendingUp, ChevronLeft, ChevronRight, Settings, Download, Upload } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

// --- Tone.js for sound ---
const playSound = () => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) { console.error("Could not play sound:", e); }
};

// --- Constants ---
const MUSCLE_GROUPS = ['Cardio', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs', 'Other'];
const PIE_CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f97316', '#f59e0b', '#ef4444', '#6b7280', '#9ca3af'];
const KG_TO_LBS = 2.20462;

// --- Helper Components ---
const StatCard = ({ icon, value, label, onClick }) => (
    <div className={`bg-gray-800 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-md ${onClick ? 'cursor-pointer hover:bg-gray-700' : ''}`} onClick={onClick}>
        {icon}
        <span className="text-xl font-bold mt-2">{value}</span>
        <span className="text-xs text-gray-400">{label}</span>
    </div>
);

const Modal = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            {children}
        </div>
    </div>
);

const RestTimerPopup = ({ timerData, onDismiss }) => {
    const { duration, exerciseName, key, active } = timerData;
    const [remaining, setRemaining] = useState(duration);

    useEffect(() => {
        if (!active) return;
        setRemaining(duration);
        const intervalId = setInterval(() => setRemaining(prev => (prev <= 1 ? 0 : prev - 1)), 1000);
        return () => clearInterval(intervalId);
    }, [key, duration, active]);

    useEffect(() => {
        if (remaining === 0 && active) {
            playSound();
            onDismiss();
        }
    }, [remaining, active, onDismiss]);

    const progress = ((duration - remaining) / duration) * 100;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4"><div className="bg-blue-600 text-white rounded-xl shadow-2xl p-4 w-full max-w-xl mx-auto"><div className="flex justify-between items-center"><div><p className="text-sm font-bold">Rest Timer</p><p className="text-xs opacity-80">Next: {exerciseName}</p></div><div className="text-2xl font-mono font-bold">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</div><button onClick={onDismiss} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-1 px-3 rounded-md text-sm">Skip</button></div><div className="w-full bg-blue-500 rounded-full h-1.5 mt-3"><div className="bg-white h-1.5 rounded-full" style={{ width: `${progress}%` }}></div></div></div></div>
    );
};

// --- Local Storage Hooks ---
const useStickyState = (defaultValue, key) => {
    const [value, setValue] = useState(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null
                ? JSON.parse(stickyValue)
                : defaultValue;
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }, [key, value]);

    return [value, setValue];
};


// --- Main App Component ---
export default function App() {
    const [screen, setScreen] = useState('home');
    const [workout, setWorkout] = useState(null);
    const [workoutName, setWorkoutName] = useState("New Workout");
    const [startTime, setStartTime] = useState(null);
    const [templateBuilderData, setTemplateBuilderData] = useState(null);
    const [restTimer, setRestTimer] = useState({ active: false, key: null, duration: 0, exerciseName: '' });
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [newExerciseName, setNewExerciseName] = useState("");
    const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState('Other');
    const [newTemplateName, setNewTemplateName] = useState("");
    const [newWeight, setNewWeight] = useState("");
    const [editingWeight, setEditingWeight] = useState(null);
    const [selectedExerciseStats, setSelectedExerciseStats] = useState(null);
    const [expandedHistory, setExpandedHistory] = useState({});
    const importFileRef = useRef(null);

    // --- State managed by local storage ---
    const [settings, setSettings] = useStickyState({
        unitSystem: 'metric', // 'metric' or 'imperial'
        defaultRestTime: 120,
        soundEffects: true,
    }, 'gym-tracker-settings');
    const [pastWorkouts, setPastWorkouts] = useStickyState([], 'gym-tracker-workouts');
    const [templates, setTemplates] = useStickyState([], 'gym-tracker-templates');
    const [exercisePRs, setExercisePRs] = useStickyState({}, 'gym-tracker-prs');
    const [bodyStats, setBodyStats] = useStickyState([], 'gym-tracker-bodystats');

    
    // --- Back Button Handling for Android ---
    // NOTE: This feature is temporarily disabled.
    // To re-enable it, you must first install the necessary package by running this command in your terminal:
    // npm install @capacitor/app
    // After that, you can uncomment this entire block and the import statement at the top of the file.
    useEffect(() => {
        const CapacitorApp = window.Capacitor?.Plugins?.App;
        if (CapacitorApp) {
            const listener = CapacitorApp.addListener('backButton', (e) => {
                if (selectedExerciseStats) {
                    setSelectedExerciseStats(null);
                } else if (screen === 'templateBuilder') {
                    setScreen('templates');
                } else if (screen !== 'home') {
                    setScreen('home');
                } else {
                    CapacitorApp.exitApp();
                }
            });

            return () => {
                listener.remove();
            };
        }
    }, [screen, selectedExerciseStats]);
    


    const handleDismissTimer = useCallback(() => {
        setRestTimer(prev => ({ ...prev, active: false }));
    }, []);

    // --- Unit Conversion Helpers ---
    const displayWeight = (kg) => {
        if (settings.unitSystem === 'imperial') {
            return parseFloat((kg * KG_TO_LBS).toFixed(1));
        }
        return parseFloat(kg.toFixed(1));
    };
    
    const storeWeight = (weight) => {
        if (settings.unitSystem === 'imperial') {
            return weight / KG_TO_LBS;
        }
        return weight;
    };


    // --- Workout Actions ---
    const startNewWorkout = (template = null) => {
        let initialExercises = [];
        if (template) {
            setWorkoutName(template.name);
            initialExercises = JSON.parse(JSON.stringify(template.exercises)).map(ex => ({ ...ex, sets: ex.sets.map(set => ({ ...set, weight: displayWeight(set.weight || 0), completed: false })) }));
        } else {
            setWorkoutName(`Workout - ${new Date().toLocaleDateString()}`);
        }
        setWorkout(initialExercises);
        setStartTime(new Date());
        setScreen('workout');
    };

    const addSet = (exIndex) => {
        const newWorkout = [...workout];
        const lastSet = newWorkout[exIndex].sets.at(-1) || { reps: 0, weight: 0 };
        newWorkout[exIndex].sets.push({ ...lastSet, completed: false });
        setWorkout(newWorkout);
    };

    const handleWorkoutSetChange = (exIndex, setIndex, field, value) => {
        const newWorkout = [...workout];
        if (field === 'weight') {
             newWorkout[exIndex].sets[setIndex][field] = value;
        } else {
            const parsedVal = parseInt(value, 10);
            newWorkout[exIndex].sets[setIndex][field] = isNaN(parsedVal) ? '' : parsedVal;
        }
        setWorkout(newWorkout);
    };

    const handleWorkoutSetBlur = (exIndex, setIndex, field, value) => {
        const newWorkout = [...workout];
        let parsedVal = parseFloat(value) || 0;
        if (field === 'weight' && parsedVal > (settings.unitSystem === 'imperial' ? 660 : 300)) {
            parsedVal = settings.unitSystem === 'imperial' ? 660 : 300;
        }
        newWorkout[exIndex].sets[setIndex][field] = parsedVal;
        setWorkout(newWorkout);
    };

    const handleWorkoutRestTimeChange = (exIndex, value) => {
        const newWorkout = [...workout];
        newWorkout[exIndex].restTime = value; // Keep as a string to allow empty input
        setWorkout(newWorkout);
    };

    const toggleSetComplete = (exIndex, setIndex) => {
        const newWorkout = [...workout];
        const isNowCompleted = !newWorkout[exIndex].sets[setIndex].completed;
        newWorkout[exIndex].sets[setIndex].completed = isNowCompleted;
        setWorkout(newWorkout);
        if (isNowCompleted && newWorkout[exIndex].muscleGroup !== 'Cardio') {
            const exercise = newWorkout[exIndex];
            const restDuration = parseInt(exercise.restTime, 10);
            const duration = (isNaN(restDuration) || restDuration === 0) ? settings.defaultRestTime : restDuration;
            setRestTimer({ active: true, key: Date.now(), duration: duration, exerciseName: exercise.name });
            if (settings.soundEffects) playSound();
        }
    };

    const handleAddExerciseToWorkout = (e) => {
        e.preventDefault();
        if (newExerciseName.trim()) {
            const newExercise = { 
                name: newExerciseName.trim(), 
                restTime: settings.defaultRestTime, 
                muscleGroup: newExerciseMuscleGroup 
            };
            if (newExerciseMuscleGroup === 'Cardio') {
                newExercise.sets = [{ time: 10, completed: false }];
            } else {
                newExercise.sets = [{ reps: 8, weight: 10, completed: false }]; // Stored as kg
            }
            setWorkout([...workout, newExercise]);
            setNewExerciseName("");
            setNewExerciseMuscleGroup("Other");
            setModalState({ type: null });
        }
    };

    const deleteExerciseFromWorkout = (exIndex) => setWorkout(workout.filter((_, i) => i !== exIndex));

    const finishWorkout = () => {
        if (!workout) {
            return;
        }
        const completedExercises = workout.map(ex => ({
            ...ex,
            sets: ex.sets.filter(s => s.completed)
        })).filter(ex => ex.sets.length > 0);

        if (completedExercises.length === 0) {
            setScreen('home');
            setWorkout(null);
            setRestTimer({ active: false });
            return;
        }

        const workoutData = {
            id: Date.now(),
            name: workoutName,
            startTime: startTime,
            endTime: new Date(),
            exercises: completedExercises.map(ex => {
                const storedSets = ex.sets.map(s => {
                    if (ex.muscleGroup !== 'Cardio') {
                        return { ...s, weight: storeWeight(s.weight) }
                    }
                    return s;
                })
                return { ...ex, sets: storedSets };
            })
        };

        const newPastWorkouts = [workoutData, ...pastWorkouts];
        setPastWorkouts(newPastWorkouts);

        const newPRs = { ...exercisePRs };
        for (const exercise of workoutData.exercises) {
            if (exercise.muscleGroup === 'Cardio') continue;

            const maxWeight = Math.max(...exercise.sets.map(s => s.weight));
            const totalVolume = exercise.sets.reduce((acc, set) => acc + (set.reps * set.weight), 0);

            const existingPR = newPRs[exercise.name] || { maxWeight: 0, maxVolume: 0 };

            newPRs[exercise.name] = {
                maxWeight: Math.max(maxWeight, existingPR.maxWeight),
                maxVolume: Math.max(totalVolume, existingPR.maxVolume),
                lastUpdated: new Date()
            };
        }
        setExercisePRs(newPRs);

        setScreen('home');
        setWorkout(null);
        setRestTimer({ active: false });
    };

    // --- Template Actions ---
    const handleSaveAsTemplate = (e) => {
        e.preventDefault();
        if (!newTemplateName.trim() || !workout || workout.length === 0) return;
        const templateExercises = workout.map(ex => ({ 
            name: ex.name, 
            restTime: ex.restTime, 
            muscleGroup: ex.muscleGroup || 'Other', 
            sets: ex.muscleGroup === 'Cardio' 
                ? ex.sets.map(({ time }) => ({ time }))
                : ex.sets.map(({ reps, weight }) => ({ reps, weight: storeWeight(weight) }))
        }));
        const templateData = { id: Date.now(), name: newTemplateName.trim(), exercises: templateExercises, createdAt: new Date() };
        setTemplates([templateData, ...templates]);
        setNewTemplateName("");
        setModalState({ type: null });
    };

    const deleteTemplate = (templateId) => {
        setTemplates(templates.filter(t => t.id !== templateId));
    };

    const handleEditTemplate = (template) => {
        const templateForEditing = JSON.parse(JSON.stringify(template));
        setTemplateBuilderData(templateForEditing);
        setScreen('templateBuilder');
    };

    // --- Template Builder Actions ---
    const handleCreateNewTemplate = () => {
        setTemplateBuilderData({ name: 'New Template', exercises: [] });
        setScreen('templateBuilder');
    };

    const addExerciseToTemplateBuilder = (e) => {
        e.preventDefault();
        if (newExerciseName.trim() && templateBuilderData) {
            const newEx = { name: newExerciseName.trim(), sets: [{ reps: 8, weight: 10 }], restTime: settings.defaultRestTime, muscleGroup: newExerciseMuscleGroup };
            if (newExerciseMuscleGroup === 'Cardio') {
                newEx.sets = [{ time: 10 }];
            }
            setTemplateBuilderData(d => ({ ...d, exercises: [...d.exercises, newEx] }));
            setNewExerciseName("");
            setNewExerciseMuscleGroup("Other");
            setModalState({ type: null });
        }
    };

    const updateTemplateBuilderField = (exIndex, field, value) => {
        const newExercises = [...templateBuilderData.exercises];
        const exercise = newExercises[exIndex];
        if (field === 'muscleGroup') {
            exercise[field] = value;
            if (value === 'Cardio') {
                exercise.sets = [{ time: 10 }];
            } else if (!exercise.sets[0] || typeof exercise.sets[0].reps === 'undefined') {
                exercise.sets = [{ reps: 8, weight: 10 }];
            }
        } else if (field === 'restTime') {
            exercise[field] = value;
        } else {
           exercise[field] = value;
        }
        setTemplateBuilderData(d => ({...d, exercises: newExercises}));
    };

    const removeExerciseFromTemplateBuilder = (exIndex) => setTemplateBuilderData(d => ({ ...d, exercises: d.exercises.filter((_, i) => i !== exIndex) }));
    const handleTemplateBuilderSetChange = (exIndex, setIndex, field, value) => {
        const newExercises = [...templateBuilderData.exercises];
        newExercises[exIndex].sets[setIndex][field] = value;
        setTemplateBuilderData(d => ({ ...d, exercises: newExercises }));
    };
    
    const handleTemplateBuilderSetBlur = (exIndex, setIndex, field, value) => {
        const newExercises = [...templateBuilderData.exercises];
        let parsedValue = parseFloat(value) || 0;
        if (field === 'weight') {
            const maxWeight = settings.unitSystem === 'imperial' ? 660 : 300;
            if (parsedValue > maxWeight) {
                parsedValue = maxWeight;
            }
        }
        newExercises[exIndex].sets[setIndex][field] = parsedValue;
        setTemplateBuilderData(d => ({ ...d, exercises: newExercises }));
    };

    const addSetToTemplateBuilder = (exIndex) => {
        const newExercises = [...templateBuilderData.exercises];
        const lastSet = newExercises[exIndex].sets.at(-1) || { reps: 8, weight: 10 };
        newExercises[exIndex].sets.push({ ...lastSet });
        setTemplateBuilderData(d => ({...d, exercises: newExercises}));
    };
    const removeSetFromTemplateBuilder = (exIndex, setIndex) => {
        const newExercises = [...templateBuilderData.exercises];
        newExercises[exIndex].sets = newExercises[exIndex].sets.filter((_, i) => i !== setIndex);
        setTemplateBuilderData(d => ({...d, exercises: newExercises}));
    };

    const saveTemplateFromBuilder = () => {
        if (!templateBuilderData || !templateBuilderData.name.trim()) return;
        const { id, ...data } = templateBuilderData;
        const templateToSave = {
            ...data,
            exercises: data.exercises.map(ex => ({
                ...ex,
                sets: ex.sets.map(set => ({
                    ...set,
                    weight: ex.muscleGroup === 'Cardio' ? undefined : storeWeight(parseFloat(set.weight) || 0)
                }))
            }))
        };
        if (id) {
            setTemplates(templates.map(t => t.id === id ? templateToSave : t));
        } else {
            setTemplates([{...templateToSave, id: Date.now(), createdAt: new Date()}, ...templates]);
        }
        setTemplateBuilderData(null);
        setScreen('templates');
    };
    
    // --- Body Stat Actions ---
    const handleLogWeight = (e) => {
        e.preventDefault();
        const weightValue = parseFloat(newWeight);
        if (isNaN(weightValue) || weightValue <= 0) return;
        const weightData = { id: Date.now(), weight: storeWeight(weightValue), date: new Date().toISOString() };
        setBodyStats([...bodyStats, weightData].sort((a,b) => new Date(a.date) - new Date(b.date)));
        setNewWeight("");
        setModalState({ type: null });
    };

    const handleUpdateWeight = (e) => {
        e.preventDefault();
        const weightValue = parseFloat(editingWeight.weight);
        if(isNaN(weightValue) || weightValue <= 0) return;

        const updatedStats = bodyStats.map(stat => 
            stat.id === editingWeight.id ? { ...stat, weight: storeWeight(weightValue) } : stat
        );
        setBodyStats(updatedStats);
        setEditingWeight(null);
        setModalState({ type: null });
    };
    
    const handleDeleteWeight = (id) => {
        if (window.confirm("Are you sure you want to delete this weight entry?")) {
            setBodyStats(bodyStats.filter(stat => stat.id !== id));
        }
    };
    
    // --- Data Management ---
    const handleExportData = () => {
        const allData = {
            settings,
            pastWorkouts,
            templates,
            exercisePRs,
            bodyStats,
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(allData, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `gym-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };
    
    const handleImportData = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.settings && data.pastWorkouts && data.templates && data.exercisePRs && data.bodyStats) {
                    if (window.confirm("Are you sure you want to import this data? This will overwrite all current data.")) {
                        setSettings(data.settings);
                        setPastWorkouts(data.pastWorkouts);
                        setTemplates(data.templates);
                        setExercisePRs(data.exercisePRs);
                        setBodyStats(data.bodyStats);
                        alert("Data imported successfully!");
                    }
                } else {
                    alert("Invalid backup file.");
                }
            } catch (error) {
                alert("Could not parse the backup file. It may be corrupted.");
            }
        };
        reader.readAsText(file);
    };

    // --- Analytics ---
    const getMuscleGroupData = () => {
        const muscleData = MUSCLE_GROUPS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {});
        pastWorkouts.forEach(w => {
            w.exercises.forEach(ex => {
                if (ex.muscleGroup && muscleData.hasOwnProperty(ex.muscleGroup)) {
                    const completedSetsCount = ex.sets.filter(s => s.completed).length;
                    muscleData[ex.muscleGroup] += completedSetsCount;
                }
            });
        });
        return Object.entries(muscleData).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);
    };

    const getExerciseStatData = (exerciseName) => {
        const history = pastWorkouts
            .map(w => ({ date: new Date(w.startTime), exercise: w.exercises.find(ex => ex.name === exerciseName) }))
            .filter(w => w.exercise)
            .map(w => {
                const completedSets = w.exercise.sets.filter(s => s.completed);
                if (completedSets.length === 0) return null;
                const maxWeight = Math.max(...completedSets.map(s => s.weight));
                const volume = completedSets.reduce((acc, s) => acc + (s.reps * s.weight), 0);
                return { date: w.date, maxWeight, volume };
            })
            .filter(Boolean)
            .sort((a, b) => a.date - b.date);

        return history.map(h => ({ date: h.date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}), 'Max Weight': displayWeight(h.maxWeight), 'Volume': displayWeight(h.volume) }));
    };
    
    const getWeightStatData = () => {
        return bodyStats.map(stat => ({
            date: new Date(stat.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}),
            'Weight': displayWeight(stat.weight)
        }));
    };
    
    // --- Calendar Component ---
    const WorkoutCalendar = ({ workoutDates }) => {
        const today = new Date();
        const [date, setDate] = useState(today);

        const changeMonth = (amount) => {
            const newDate = new Date(date.getFullYear(), date.getMonth() + amount, 1);
            setDate(newDate);
        };

        const month = date.getMonth();
        const year = date.getFullYear();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`}></div>);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            const isToday = today.toDateString() === dayDate.toDateString();
            const hasWorkout = workoutDates.includes(dayDate.toISOString().split('T')[0]);

            days.push(
                <div key={i} className="relative flex items-center justify-center h-10">
                    <span className={`${isToday ? 'font-bold text-blue-400' : ''}`}>{i}</span>
                    {hasWorkout && <div className="absolute w-6 h-6 bg-blue-500/30 rounded-full -z-10"></div>}
                </div>
            );
        }

        return (
            <div className="bg-gray-800 p-4 rounded-xl">
                 <div className="flex justify-between items-center mb-3">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeft size={20}/></button>
                    <h2 className="text-lg font-bold text-white text-center">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRight size={20}/></button>
                 </div>
                 <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => <div key={`${d}-${index}`}>{d}</div>)}
                </div>
                 <div className="grid grid-cols-7 text-center text-sm">{days}</div>
            </div>
        )
    };

    // --- Render Logic ---
    const renderScreen = () => {
        if (selectedExerciseStats) return renderExerciseStatsScreen();
        switch (screen) {
            case 'workout': return renderWorkoutScreen();
            case 'history': return renderHistoryScreen();
            case 'templates': return renderTemplatesScreen();
            case 'templateBuilder': return renderTemplateBuilderScreen();
            case 'progress': return renderProgressScreen();
            case 'settings': return renderSettingsScreen();
            default: return renderHomeScreen();
        }
    };

    const renderHomeScreen = () => (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold text-white">Dashboard</h1><button onClick={() => setScreen('settings')} className="p-2 rounded-full hover:bg-gray-700"><Settings size={24}/></button></div>
            {workout !== null && (
                <div className="mb-8">
                    <button onClick={() => setScreen('workout')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center text-lg shadow-lg animate-pulse">
                        <Dumbbell className="mr-2" /> Return to Active Workout
                    </button>
                </div>
            )}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <StatCard icon={<Flame className="w-8 h-8 text-red-500"/>} value={pastWorkouts.length} label="Workouts Done"/>
                <StatCard icon={<LayoutTemplate className="w-8 h-8 text-purple-500"/>} value={templates.length} label="Templates"/>
            </div>
            <div className="space-y-4">
                 {workout === null && <button onClick={() => setModalState({ type: 'startWorkoutOptions' })} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center text-lg"><Plus className="mr-2" /> Start New Workout</button>}
                 <button onClick={() => setScreen('templates')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center text-lg"><LayoutTemplate className="mr-2" /> Templates</button>
                 <button onClick={() => setScreen('progress')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center text-lg"><BarChart2 className="mr-2" /> Progress</button>
                 <button onClick={() => setScreen('history')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center text-lg"><History className="mr-2" /> History</button>
            </div>
        </div>
    );
    
    const renderWorkoutScreen = () => {
        if (!workout) return null;
        const totalVolume = workout.reduce((t, ex) => t + (ex.muscleGroup === 'Cardio' ? 0 : ex.sets.reduce((st, s) => st + (s.completed ? s.reps * storeWeight(s.weight) : 0), 0)), 0);
        return (
            <div className="h-screen flex flex-col">
                <div className="bg-gray-800 p-4 flex justify-between items-center sticky top-0 z-10 shadow-lg">
                    <button onClick={() => setScreen('home')} className="p-2 rounded-full hover:bg-gray-700"><ArrowLeft size={24}/></button>
                    <input type="text" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} className="bg-transparent text-white text-lg font-bold text-center focus:outline-none w-full mx-2"/>
                    <button onClick={() => setModalState({ type: 'saveAsTemplate' })} className="p-2 rounded-full hover:bg-gray-700 mr-2" title="Save as Template"><LayoutTemplate size={20}/></button>
                    <button onClick={finishWorkout} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition">Finish</button>
                </div>
                <div className="p-4 overflow-y-auto flex-grow">
                    <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                        <div><p className="text-gray-400 text-sm">Duration</p><p className="text-white text-lg font-bold"><WorkoutTimer startTime={startTime}/></p></div>
                        <div><p className="text-gray-400 text-sm">Volume</p><p className="text-white text-lg font-bold">{displayWeight(totalVolume)} {settings.unitSystem === 'metric' ? 'kg' : 'lbs'}</p></div>
                    </div>
                    {workout.length === 0 && (<div className="text-center py-16"><Dumbbell className="mx-auto text-gray-600 mb-4" size={48}/><h3 className="text-xl text-white font-semibold">Empty Workout</h3><p className="text-gray-400 mt-2">Add your first exercise.</p></div>)}
                    <div className="space-y-4">{workout.map((ex, exIndex) => (<div key={ex.id || exIndex} className="bg-gray-800 rounded-xl p-4"><div className="flex justify-between items-center mb-3"><h3 className="text-white font-bold text-xl">{ex.name}</h3><div className="flex items-center gap-2">{ex.muscleGroup !== 'Cardio' && <><Timer size={16} className="text-gray-400" /><input type="number" value={ex.restTime} onChange={(e) => handleWorkoutRestTimeChange(exIndex, e.target.value)} onBlur={(e) => !e.target.value && handleWorkoutRestTimeChange(exIndex, settings.defaultRestTime)} className="w-16 bg-gray-700 text-white text-center rounded-md p-1" /><span className="text-xs text-gray-400">s</span></>}<button onClick={() => deleteExerciseFromWorkout(exIndex)} className="text-gray-500 hover:text-red-500 transition"><Trash2 size={18}/></button></div></div>{ex.muscleGroup === 'Cardio' ? <div className="grid grid-cols-12 gap-2 items-center rounded-lg p-1"><div className="col-span-2 text-center text-white font-bold">TIME</div><div className="col-span-8"><input type="number" value={ex.sets[0].time} onChange={(e) => handleWorkoutSetChange(exIndex, 0, 'time', e.target.value)} className="w-full bg-gray-700 text-white text-center rounded-md p-2" placeholder="Minutes"/></div><div className="col-span-2 flex justify-center"><button onClick={() => toggleSetComplete(exIndex, 0)} className={`w-8 h-8 rounded-full flex items-center justify-center transition ${ex.sets[0].completed ? 'bg-green-500' : 'border-2 border-gray-500'}`}>{ex.sets[0].completed && <Check size={18} className="text-white"/>}</button></div></div> : <><div className="grid grid-cols-12 gap-2 text-center text-xs text-gray-400 mb-2 px-2"><div className="col-span-2">SET</div><div className="col-span-4">REPS</div><div className="col-span-4">WEIGHT ({settings.unitSystem === 'metric' ? 'KG' : 'LBS'})</div><div className="col-span-2"></div></div><div className="space-y-2">{ex.sets.map((set, setIndex) => (<div key={setIndex} className={`grid grid-cols-12 gap-2 items-center rounded-lg p-1 ${set.completed ? 'bg-green-900/50' : ''}`}><div className="col-span-2 text-center text-white font-bold">{setIndex + 1}</div><div className="col-span-4"><input type="number" value={set.reps} onChange={(e) => handleWorkoutSetChange(exIndex, setIndex, 'reps', e.target.value)} onBlur={(e) => handleWorkoutSetBlur(exIndex, setIndex, 'reps', e.target.value)} className="w-full bg-gray-700 text-white text-center rounded-md p-2"/></div><div className="col-span-4"><input type="number" value={displayWeight(set.weight)} onChange={(e) => handleWorkoutSetChange(exIndex, setIndex, 'weight', e.target.value)} onBlur={(e) => handleWorkoutSetBlur(exIndex, setIndex, 'weight', e.target.value)} className="w-full bg-gray-700 text-white text-center rounded-md p-2"/></div><div className="col-span-2 flex justify-center"><button onClick={() => toggleSetComplete(exIndex, setIndex)} className={`w-8 h-8 rounded-full flex items-center justify-center transition ${set.completed ? 'bg-green-500' : 'border-2 border-gray-500'}`}>{set.completed && <Check size={18} className="text-white"/>}</button></div></div>))}</div><button onClick={() => addSet(exIndex)} className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg text-sm">Add Set</button></>}</div>))}</div>
                </div>
                <div className="p-4 bg-gray-900 border-t border-gray-700">
                    <button onClick={() => setModalState({ type: 'addExercise' })} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center text-lg shadow-lg">
                        <Plus className="mr-2" /> Add Exercise
                    </button>
                </div>
            </div>
        );
    };

    const renderTemplatesScreen = () => (
        <div><div className="bg-gray-800 p-4 flex justify-between items-center sticky top-0 z-10 shadow-lg"><button onClick={() => setScreen('home')} className="p-2 rounded-full hover:bg-gray-700"><ArrowLeft size={24}/></button><h1 className="text-xl font-bold text-white text-center flex-grow">Workout Templates</h1><div className="w-10"></div></div><div className="p-4 pb-24">{templates.length === 0 ? (<div className="text-center py-16"><LayoutTemplate className="mx-auto text-gray-600 mb-4" size={48}/><h3 className="text-xl text-white font-semibold">No Templates Yet</h3><p className="text-gray-400 mt-2">Create a template to reuse it later.</p></div>) : (<div className="space-y-4">{templates.map(t => (<div key={t.id} className="bg-gray-800 rounded-xl p-4"><div className="flex justify-between items-start"><div><p className="font-bold text-white text-lg">{t.name}</p></div><div className="flex items-center gap-2"><button onClick={() => handleEditTemplate(t)} className="p-2 text-gray-400 hover:text-white" title="Edit Template"><Pencil size={18}/></button><button onClick={() => deleteTemplate(t.id)} className="p-2 text-gray-400 hover:text-red-500" title="Delete Template"><Trash2 size={18}/></button><button onClick={() => startNewWorkout(t)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition">Start</button></div></div></div>))}</div>)}</div><div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent"><button onClick={handleCreateNewTemplate} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center text-lg"><Plus className="mr-2" /> Create New Template</button></div></div>
    );
    
    const renderTemplateBuilderScreen = () => {
        if (!templateBuilderData) return null;
        return (
            <div><div className="bg-gray-800 p-4 flex justify-between items-center sticky top-0 z-10 shadow-lg"><button onClick={() => setScreen('templates')} className="p-2 rounded-full hover:bg-gray-700"><ArrowLeft size={24}/></button><input type="text" value={templateBuilderData.name} onChange={(e) => setTemplateBuilderData(d=>({...d, name:e.target.value}))} className="bg-transparent text-white text-lg font-bold text-center focus:outline-none w-full mx-2"/><button onClick={saveTemplateFromBuilder} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition">Save</button></div><div className="p-4 pb-32">{templateBuilderData.length === 0 && (<div className="text-center py-16"><LayoutTemplate className="mx-auto text-gray-600 mb-4" size={48}/><h3 className="text-xl text-white font-semibold">Empty Template</h3><p className="text-gray-400 mt-2">Add an exercise.</p></div>)}<div className="space-y-4">{templateBuilderData.exercises.map((ex, exIndex) => (<div key={ex.id || exIndex} className="bg-gray-800 rounded-xl p-4"><div className="flex justify-between items-center mb-3"><h3 className="text-white font-bold text-xl">{ex.name}</h3><button onClick={() => removeExerciseFromTemplateBuilder(exIndex)} className="text-gray-500 hover:text-red-500"><Trash2 size={18}/></button></div><div className="grid grid-cols-2 gap-4 mb-4"><div className="flex items-center gap-2"><Timer size={16} className="text-gray-400" /><input type="number" value={ex.restTime} onChange={(e) => updateTemplateBuilderField(exIndex, 'restTime', e.target.value)} onBlur={(e) => !e.target.value && updateTemplateBuilderField(exIndex, 'restTime', settings.defaultRestTime)} className="w-full bg-gray-700 text-white text-center rounded-md p-1" /><span className="text-xs text-gray-400">s</span></div><div className="flex items-center gap-2"><Target size={16} className="text-gray-400" /><select value={ex.muscleGroup} onChange={(e) => updateTemplateBuilderField(exIndex, 'muscleGroup', e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-1"><option disabled>Muscle</option>{MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}</select></div></div>{ex.muscleGroup === 'Cardio' ? <div className="grid grid-cols-12 gap-2 items-center"><div className="col-span-2 text-center text-white font-bold">TIME</div><div className="col-span-10"><input type="number" value={ex.sets[0].time} onChange={(e) => handleTemplateBuilderSetChange(exIndex, 0, 'time', e.target.value)} onBlur={(e) => handleTemplateBuilderSetBlur(exIndex, 0, 'time', e.target.value)} className="w-full bg-gray-700 text-white text-center rounded-md p-2" placeholder="Minutes"/></div></div> : <><div className="grid grid-cols-12 gap-2 text-center text-xs text-gray-400 mb-2 px-2"><div className="col-span-2">SET</div><div className="col-span-4">REPS</div><div className="col-span-4">WEIGHT ({settings.unitSystem === 'metric' ? 'KG' : 'LBS'})</div><div className="col-span-2"></div></div><div className="space-y-2">{ex.sets.map((set, setIndex) => (<div key={setIndex} className="grid grid-cols-12 gap-2 items-center"><div className="col-span-2 text-center text-white font-bold">{setIndex + 1}</div><div className="col-span-4"><input type="number" value={set.reps} onChange={(e) => handleTemplateBuilderSetChange(exIndex, setIndex, 'reps', e.target.value)} onBlur={(e) => handleTemplateBuilderSetBlur(exIndex, setIndex, 'reps', e.target.value)} className="w-full bg-gray-700 text-white text-center rounded-md p-2"/></div><div className="col-span-4"><input type="number" value={displayWeight(set.weight)} onChange={(e) => handleTemplateBuilderSetChange(exIndex, setIndex, 'weight', e.target.value)} onBlur={(e) => handleTemplateBuilderSetBlur(exIndex, setIndex, 'weight', e.target.value)} className="w-full bg-gray-700 text-white text-center rounded-md p-2"/></div><div className="col-span-2 flex justify-center"><button onClick={() => removeSetFromTemplateBuilder(exIndex, setIndex)} className="text-gray-500 hover:text-red-500 p-1"><X size={16}/></button></div></div>))}</div><button onClick={() => addSetToTemplateBuilder(exIndex)} className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg text-sm">Add Set</button></>}</div>))}</div></div><div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent"><button onClick={() => setModalState({ type: 'addExerciseToTemplate' })} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center text-lg"><Plus className="mr-2" /> Add Exercise</button></div></div>
        );
    };

    const renderHistoryScreen = () => (
         <div><div className="bg-gray-800 p-4 flex justify-between items-center sticky top-0 z-10 shadow-lg"><button onClick={() => setScreen('home')} className="p-2 rounded-full hover:bg-gray-700"><ArrowLeft size={24}/></button><h1 className="text-xl font-bold text-white text-center flex-grow">Workout History</h1><div className="w-10"></div></div><div className="p-4">{pastWorkouts.length === 0 ? (<div className="text-center py-16"><History className="mx-auto text-gray-600 mb-4" size={48}/><h3 className="text-xl text-white font-semibold">No History Found</h3><p className="text-gray-400 mt-2">Complete a workout to see it here.</p></div>) : (<div className="space-y-4">{pastWorkouts.map(w => { const date = new Date(w.startTime); const duration = (new Date(w.endTime).getTime() - date.getTime()) / 60000; const totalSets = w.exercises.reduce((acc, ex) => acc + ex.sets.length, 0); const volume = w.exercises.reduce((a, ex) => a + (ex.muscleGroup === 'Cardio' ? 0 : ex.sets.reduce((sA, s) => sA + s.reps * s.weight, 0)), 0); return (<div key={w.id} className="bg-gray-800 rounded-xl p-4"><div className="flex justify-between items-start mb-2"><h2 className="font-bold text-white text-lg">{w.name}</h2><button onClick={() => setExpandedHistory(prev => ({...prev, [w.id]: !prev[w.id]}))} className="p-1 text-gray-400 hover:text-white"><ChevronRight className={`transition-transform ${expandedHistory[w.id] ? 'rotate-90' : ''}`}/></button></div><div className="flex flex-wrap text-sm text-gray-400 gap-x-4 gap-y-1"><div className="flex items-center"><History size={14} className="mr-1.5"/>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div><div className="flex items-center"><Clock size={14} className="mr-1.5"/>{duration.toFixed(0)} min</div><div className="flex items-center"><Dumbbell size={14} className="mr-1.5"/>{totalSets} sets</div><div className="flex items-center"><Flame size={14} className="mr-1.5"/>Volume: {displayWeight(volume)} {settings.unitSystem === 'metric' ? 'kg' : 'lbs'}</div></div>{expandedHistory[w.id] && (<div className="mt-4 border-t border-gray-700 pt-3 space-y-2">{w.exercises.map((ex, exIndex) => (<div key={exIndex}><p className="font-semibold text-white">{ex.name}</p><div className="text-xs text-gray-400 pl-2">{ex.sets.map((s, sIndex) => (<div key={sIndex}>{ex.muscleGroup === 'Cardio' ? `${s.time} minutes` : `${s.reps} reps @ ${displayWeight(s.weight)} ${settings.unitSystem === 'metric' ? 'kg' : 'lbs'}`}</div>))}</div></div>))}</div>)}</div>); })}</div>)}</div></div>
    );
    
    const renderProgressScreen = () => {
        const muscleData = getMuscleGroupData();
        const weightData = getWeightStatData();
        const allExercises = [...new Set(pastWorkouts.flatMap(w => w.exercises.map(e => e.name)))];
        const workoutDates = pastWorkouts.map(w => new Date(w.startTime).toISOString().split('T')[0]);

        return (
            <div>
                 <div className="bg-gray-800 p-4 flex justify-between items-center sticky top-0 z-10 shadow-lg">
                    <button onClick={() => setScreen('home')} className="p-2 rounded-full hover:bg-gray-700"><ArrowLeft size={24}/></button>
                    <h1 className="text-xl font-bold text-white text-center flex-grow">Progress & Analytics</h1>
                    <div className="w-10"></div>
                </div>

                <div className="p-4 space-y-8">
                    <WorkoutCalendar workoutDates={workoutDates}/>

                     {/* Body Weight Tracker */}
                     <div className="bg-gray-800 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-lg font-bold text-white flex items-center"><TrendingUp size={20} className="mr-2"/>Body Weight ({settings.unitSystem === 'metric' ? 'kg' : 'lbs'})</h2>
                             <div className="flex items-center gap-2">
                                <button onClick={() => setModalState({type: 'editWeightList'})} className="bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-sm hover:bg-gray-500 transition">Edit</button>
                                <button onClick={() => setModalState({type: 'logWeight'})} className="bg-blue-600 text-white font-semibold py-1 px-3 rounded-md text-sm hover:bg-blue-700 transition">Log Weight</button>
                             </div>
                        </div>
                        {weightData.length > 1 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={weightData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12}/>
                                    <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']}/>
                                    <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}}/>
                                    <Line type="monotone" dataKey="Weight" stroke="#8b5cf6" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}}/>
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-center py-8">Log your weight more than once to see a progress chart.</p>
                        )}
                    </div>
                    
                    {/* Muscle Group Distribution */}
                    {muscleData.length > 0 ? (
                        <div className="bg-gray-800 p-4 rounded-xl">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center"><Target size={20} className="mr-2"/>Muscle Group Focus (by Sets)</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={muscleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {muscleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="bg-gray-800 p-4 rounded-xl">
                             <h2 className="text-lg font-bold text-white mb-4 flex items-center"><Target size={20} className="mr-2"/>Muscle Group Focus</h2>
                             <p className="text-gray-400 text-center">Complete some workouts to see your muscle focus!</p>
                        </div>
                    )}
                    
                    {/* Exercise Stats List */}
                    <div className="bg-gray-800 p-4 rounded-xl">
                         <h2 className="text-lg font-bold text-white mb-3 flex items-center"><BarChart2 size={20} className="mr-2"/>Exercise Stats</h2>
                         <div className="space-y-2">
                             {allExercises.filter(exName => !templates.find(t => t.exercises.find(e => e.name === exName && e.muscleGroup === 'Cardio'))).map(exName => (
                                 <button key={exName} onClick={() => setSelectedExerciseStats(exName)} className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition flex justify-between items-center">
                                     <span>{exName}</span>
                                     <ChevronRight size={20} className="text-gray-400"/>
                                 </button>
                             ))}
                         </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderExerciseStatsScreen = () => {
        const statData = getExerciseStatData(selectedExerciseStats);
        const pr = exercisePRs[selectedExerciseStats];

        return (
             <div>
                 <div className="bg-gray-800 p-4 flex justify-between items-center sticky top-0 z-10 shadow-lg">
                    <button onClick={() => setSelectedExerciseStats(null)} className="p-2 rounded-full hover:bg-gray-700"><ArrowLeft size={24}/></button>
                    <h1 className="text-xl font-bold text-white text-center flex-grow">{selectedExerciseStats}</h1>
                    <div className="w-10"></div>
                </div>
                <div className="p-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard icon={<Dumbbell className="w-8 h-8 text-green-500"/>} value={`${displayWeight(pr?.maxWeight || 0)} ${settings.unitSystem === 'metric' ? 'kg' : 'lbs'}`} label="Max Weight PR"/>
                        <StatCard icon={<Flame className="w-8 h-8 text-orange-500"/>} value={`${displayWeight(pr?.maxVolume || 0)} ${settings.unitSystem === 'metric' ? 'kg' : 'lbs'}`} label="Max Volume PR"/>
                    </div>

                    {statData.length > 1 ? (
                        <>
                            <div className="bg-gray-800 p-4 rounded-xl">
                                <h3 className="text-md font-bold text-white mb-4">Max Weight Over Time ({settings.unitSystem === 'metric' ? 'kg' : 'lbs'})</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={statData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12}/>
                                        <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']}/>
                                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}}/>
                                        <Line type="monotone" dataKey="Max Weight" stroke="#10b981" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}}/>
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-xl">
                                <h3 className="text-md font-bold text-white mb-4">Volume Over Time ({settings.unitSystem === 'metric' ? 'kg' : 'lbs'})</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                     <LineChart data={statData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12}/>
                                        <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 20', 'dataMax + 20']}/>
                                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}}/>
                                        <Line type="monotone" dataKey="Volume" stroke="#f97316" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}}/>
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    ) : (
                         <p className="text-gray-400 text-center py-8">Complete this exercise in more than one workout to see a progress chart.</p>
                    )}
                </div>
            </div>
        );
    };
    
    const renderSettingsScreen = () => {
        return (
            <div>
                 <div className="bg-gray-800 p-4 flex justify-between items-center sticky top-0 z-10 shadow-lg">
                    <button onClick={() => setScreen('home')} className="p-2 rounded-full hover:bg-gray-700"><ArrowLeft size={24}/></button>
                    <h1 className="text-xl font-bold text-white text-center flex-grow">Settings</h1>
                    <div className="w-10"></div>
                </div>
                <div className="p-4 space-y-6">
                    <div className="bg-gray-800 p-4 rounded-xl space-y-4">
                         <h2 className="text-lg font-bold text-white">Preferences</h2>
                        <div className="flex justify-between items-center">
                            <label className="text-gray-300">Unit System</label>
                            <div className="flex items-center bg-gray-700 rounded-full p-1">
                                <button onClick={() => setSettings({...settings, unitSystem: 'metric'})} className={`px-4 py-1 rounded-full text-sm font-semibold ${settings.unitSystem === 'metric' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Metric (kg)</button>
                                <button onClick={() => setSettings({...settings, unitSystem: 'imperial'})} className={`px-4 py-1 rounded-full text-sm font-semibold ${settings.unitSystem === 'imperial' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Imperial (lbs)</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="defaultRestTime" className="text-gray-300">Default Rest Time</label>
                            <div className="flex items-center gap-2">
                                <input id="defaultRestTime" type="number" value={settings.defaultRestTime} onChange={(e) => setSettings({...settings, defaultRestTime: parseInt(e.target.value) || 0})} className="w-20 bg-gray-700 text-white text-center rounded-md p-1"/>
                                <span className="text-xs text-gray-400">seconds</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <label className="text-gray-300">Sound Effects</label>
                             <button onClick={() => setSettings({...settings, soundEffects: !settings.soundEffects})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.soundEffects ? 'bg-blue-600' : 'bg-gray-600'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.soundEffects ? 'translate-x-6' : 'translate-x-1'}`}/>
                             </button>
                        </div>
                    </div>
                     <div className="bg-gray-800 p-4 rounded-xl space-y-4">
                         <h2 className="text-lg font-bold text-white">Data Management</h2>
                         <button onClick={handleExportData} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center text-lg"><Download className="mr-2" size={20}/> Export Data</button>
                         <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={handleImportData} />
                         <button onClick={() => importFileRef.current.click()} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center text-lg"><Upload className="mr-2" size={20}/> Import Data</button>
                    </div>
                </div>
            </div>
        );
    };

    const WorkoutTimer = ({ startTime }) => {
        const [elapsed, setElapsed] = useState(0);
        useEffect(() => {
            if (!startTime) return;
            const timer = setInterval(() => setElapsed(Math.floor((new Date() - startTime) / 1000)), 1000);
            return () => clearInterval(timer);
        }, [startTime]);
        const format = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
        return <>{format(elapsed)}</>;
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <div className="max-w-xl mx-auto bg-gray-900 shadow-lg h-full">
                {renderScreen()}
                {restTimer.active && <RestTimerPopup timerData={restTimer} onDismiss={handleDismissTimer} />}
                {modalState.type === 'startWorkoutOptions' && (
                    <Modal onClose={() => setModalState({ type: null })} title="Start Workout">
                        <div className="space-y-4">
                            <button onClick={() => { startNewWorkout(); setModalState({type: null}); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Start Blank Workout</button>
                            <button onClick={() => { setScreen('templates'); setModalState({type: null}); }} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-lg">Choose From Template</button>
                        </div>
                    </Modal>
                )}
                {modalState.type === 'addExerciseToWorkout' && (
                    <Modal onClose={() => setModalState({ type: null })} title="Add Exercise">
                        <form onSubmit={handleAddExerciseToWorkout} className="space-y-4">
                            <input type="text" value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)} placeholder="e.g., Bench Press" className="w-full bg-gray-700 text-white p-3 rounded-lg" autoFocus/>
                            <select value={newExerciseMuscleGroup} onChange={(e) => setNewExerciseMuscleGroup(e.target.value)} className="w-full bg-gray-700 text-white p-3 rounded-lg">
                                {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Add</button>
                        </form>
                    </Modal>
                )}
                {modalState.type === 'addExerciseToTemplate' && (
                    <Modal onClose={() => setModalState({ type: null })} title="Add Exercise to Template"><form onSubmit={addExerciseToTemplateBuilder}><input type="text" value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)} placeholder="e.g., Squats" className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4" autoFocus/><button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Add</button></form></Modal>
                )}
                {modalState.type === 'saveAsTemplate' && (
                     <Modal onClose={() => setModalState({ type: null })} title="Save Workout as Template"><form onSubmit={handleSaveAsTemplate}><input type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="e.g., Push Day" className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4" autoFocus/><button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Save Template</button></form></Modal>
                )}
                 {modalState.type === 'logWeight' && (
                     <Modal onClose={() => setModalState({ type: null })} title="Log Body Weight">
                         <form onSubmit={handleLogWeight} className="space-y-4">
                            <input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder={`Enter your weight in ${settings.unitSystem === 'metric' ? 'kg' : 'lbs'}`} className="w-full bg-gray-700 text-white p-3 rounded-lg" autoFocus/>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Log Weight</button>
                         </form>
                    </Modal>
                )}
                {modalState.type === 'editWeightList' && (
                    <Modal onClose={() => setModalState({ type: null })} title="Edit Weight Entries">
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {bodyStats.slice().reverse().map(stat => (
                                <div key={stat.id} className="flex justify-between items-center bg-gray-700 p-2 rounded-lg">
                                    <button onClick={() => { setEditingWeight({ ...stat, weight: displayWeight(stat.weight) }); setModalState({type: 'editSingleWeight'}) }} className="text-left flex-grow">
                                        <span>{displayWeight(stat.weight)} {settings.unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
                                        <span className="text-xs text-gray-400 ml-2">{new Date(stat.date).toLocaleDateString()}</span>
                                    </button>
                                    <button onClick={() => handleDeleteWeight(stat.id)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={18}/></button>
                                </div>
                            ))}
                        </div>
                    </Modal>
                )}
                {modalState.type === 'editSingleWeight' && editingWeight && (
                     <Modal onClose={() => { setEditingWeight(null); setModalState({ type: 'editWeightList' }) }} title="Edit Weight">
                         <form onSubmit={handleUpdateWeight} className="space-y-4">
                            <input type="number" step="0.1" value={editingWeight.weight} onChange={(e) => setEditingWeight({...editingWeight, weight: e.target.value})} placeholder={`Enter your weight in ${settings.unitSystem === 'metric' ? 'kg' : 'lbs'}`} className="w-full bg-gray-700 text-white p-3 rounded-lg" autoFocus/>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Save Changes</button>
                         </form>
                    </Modal>
                )}
            </div>
        </div>
    );
}
