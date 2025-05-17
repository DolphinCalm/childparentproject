import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  points: number;
  completed: boolean;
  completedDate?: string;
  approved: boolean;
  pendingApproval: boolean;
}

export interface ChildStats {
  level: number;
  xp: number;
  gold: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  type: 'gold' | 'xp';
}

export interface Goal {
  id: number;
  text: string;
  progress: number;
  target: number;
  completed: boolean;
  pendingApproval: boolean;
  approved: boolean;
}

const SAMPLE_GOALS = {
  daily: [
    { id: 1, text: 'Kitap okuma (30 dakika)', progress: 0, target: 1, completed: false, pendingApproval: false, approved: false },
    { id: 2, text: 'Ev ödevlerini tamamlama', progress: 0, target: 1, completed: false, pendingApproval: false, approved: false },
    { id: 3, text: 'Odanı toplama', progress: 0, target: 1, completed: false, pendingApproval: false, approved: false },
  ],
  weekly: [
    { id: 1, text: '5 gün spor yapma', progress: 0, target: 5, completed: false, pendingApproval: false, approved: false },
    { id: 2, text: '3 yeni kelime öğrenme', progress: 0, target: 3, completed: false, pendingApproval: false, approved: false },
    { id: 3, text: 'Aileye yardım etme', progress: 0, target: 3, completed: false, pendingApproval: false, approved: false },
  ],
};

export interface TaskContextType {
  tasks: Task[];
  rewards: Reward[];
  childStats: ChildStats;
  goals: { daily: Goal[], weekly: Goal[] };
  addTask: (task: Omit<Task, 'id' | 'completed' | 'approved' | 'pendingApproval'>) => void;
  toggleTask: (id: string) => void;
  approveTask: (id: string) => void;
  rejectTask: (id: string) => void;
  addReward: (name: string, cost: number, type: 'gold' | 'xp') => void;
  buyReward: (id: string) => boolean;
  deleteTask: (id: string) => void;
  deleteAllCompletedTasks: () => void;
  updateChildStats: (stats: ChildStats) => void;
  setGoals: (goals: { daily: Goal[], weekly: Goal[] }) => void;
  approveGoal: (type: 'daily' | 'weekly', goalId: number) => void;
  rejectGoal: (type: 'daily' | 'weekly', goalId: number) => void;
  clearRewards: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const calculateLevel = (xp: number) => {
  return Math.floor(xp / 1000);
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [childStats, setChildStats] = useState<ChildStats>({
    xp: 0,
    level: 0,
    gold: 0,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
  });
  const [goals, setGoals] = useState<{ daily: Goal[], weekly: Goal[] }>({
    daily: [],
    weekly: []
  });

  useEffect(() => {
    loadTasks();
    loadRewards();
    loadChildStats();
    loadGoals();
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadRewards = async () => {
    try {
      // Mevcut ödülleri temizle
      setRewards([]);
      await AsyncStorage.setItem('rewards', JSON.stringify([]));
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const loadChildStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('childStats');
      if (savedStats) {
        // Reset stats to initial values
        const resetStats: ChildStats = {
          xp: 0,
          level: 0,
          gold: 0,
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
        };
        setChildStats(resetStats);
        await AsyncStorage.setItem('childStats', JSON.stringify(resetStats));
      }
    } catch (error) {
      console.error('Error loading child stats:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('goals');
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        console.log('Goals loaded:', parsedGoals); // Debug için log ekleyelim
        setGoals(parsedGoals);
      } else {
        // İlk kez çalıştırıldığında örnek hedefleri yükle
        setGoals(SAMPLE_GOALS);
        await AsyncStorage.setItem('goals', JSON.stringify(SAMPLE_GOALS));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const saveRewards = async (newRewards: Reward[]) => {
    try {
      await AsyncStorage.setItem('rewards', JSON.stringify(newRewards));
    } catch (error) {
      console.error('Error saving rewards:', error);
    }
  };

  const saveChildStats = async (newStats: ChildStats) => {
    try {
      await AsyncStorage.setItem('childStats', JSON.stringify(newStats));
    } catch (error) {
      console.error('Error saving child stats:', error);
    }
  };

  const saveGoals = async (newGoals: { daily: Goal[], weekly: Goal[] }) => {
    try {
      await AsyncStorage.setItem('goals', JSON.stringify(newGoals));
      console.log('Goals saved:', newGoals); // Debug için log ekleyelim
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const addTask = (task: Omit<Task, 'id' | 'completed' | 'approved' | 'pendingApproval'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completed: false,
      approved: false,
      pendingApproval: false,
    };
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const toggleTask = (id: string) => {
    const newTasks = tasks.map(task => {
      if (task.id === id) {
        const completed = !task.completed;
        return {
          ...task,
          completed,
          completedDate: completed ? new Date().toDateString() : undefined,
          pendingApproval: completed,
          approved: false
        };
      }
      return task;
    });
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const approveTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newTasks = tasks.map(t => {
      if (t.id === id) {
        return { ...t, approved: true, pendingApproval: false };
      }
      return t;
    });

    const points = task.points;
    const newXP = childStats.xp + points;
    const newStats = {
      ...childStats,
      xp: newXP,
      gold: childStats.gold + Math.floor(points / 2),
      level: calculateLevel(newXP)
    };

    setTasks(newTasks);
    setChildStats(newStats);
    saveTasks(newTasks);
    saveChildStats(newStats);
  };

  const rejectTask = (id: string) => {
    const newTasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: false, pendingApproval: false, completedDate: undefined };
      }
      return task;
    });
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const addReward = (name: string, cost: number, type: 'gold' | 'xp') => {
    const newReward: Reward = {
      id: Date.now().toString(),
      name,
      cost,
      type,
    };
    const newRewards = [...rewards, newReward];
    setRewards(newRewards);
    saveRewards(newRewards);
  };

  const buyReward = (id: string): boolean => {
    const reward = rewards.find(r => r.id === id);
    if (!reward) return false;

    if (reward.type === 'gold' && childStats.gold >= reward.cost) {
      const newStats = {
        ...childStats,
        gold: childStats.gold - reward.cost,
      };
      // Ödülü satın alındıktan sonra mağazadan kaldır
      const newRewards = rewards.filter(r => r.id !== id);
      setRewards(newRewards);
      saveRewards(newRewards);
      setChildStats(newStats);
      saveChildStats(newStats);
      return true;
    } else if (reward.type === 'xp' && childStats.xp >= reward.cost) {
      const newStats = {
        ...childStats,
        xp: childStats.xp - reward.cost,
      };
      // Ödülü satın alındıktan sonra mağazadan kaldır
      const newRewards = rewards.filter(r => r.id !== id);
      setRewards(newRewards);
      saveRewards(newRewards);
      setChildStats(newStats);
      saveChildStats(newStats);
      return true;
    }
    return false;
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const deleteAllCompletedTasks = () => {
    setTasks(prevTasks => prevTasks.filter(task => !task.completed));
  };

  const updateChildStats = async (newStats: ChildStats) => {
    const updatedStats = {
      ...newStats,
      level: calculateLevel(newStats.xp)
    };
    setChildStats(updatedStats);
    await AsyncStorage.setItem('childStats', JSON.stringify(updatedStats));
  };

  const addXP = (amount: number) => {
    setChildStats(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      const updatedStats = {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
      AsyncStorage.setItem('childStats', JSON.stringify(updatedStats));
      return updatedStats;
    });
  };

  const approveGoal = (type: 'daily' | 'weekly', goalId: number) => {
    setGoals(prev => {
      const newGoals = { ...prev };
      // Hedefi bul ve XP ödülünü ver
      const goal = prev[type].find(g => g.id === goalId);
      if (goal) {
        addXP(goal.target * 10); // 10 XP per target point
        // Hedefi listeden kaldır
        newGoals[type] = newGoals[type].filter(g => g.id !== goalId);
      }
      saveGoals(newGoals);
      return newGoals;
    });
  };

  const rejectGoal = (type: 'daily' | 'weekly', goalId: number) => {
    setGoals(prev => {
      const newGoals = { ...prev };
      const goal = newGoals[type].find(g => g.id === goalId);
      if (goal) {
        goal.completed = false;
        goal.pendingApproval = false;
        goal.approved = false;
        goal.progress = 0;
      }
      saveGoals(newGoals);
      return newGoals;
    });
  };

  const clearRewards = () => {
    setRewards([]);
    saveRewards([]);
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      rewards, 
      childStats, 
      goals, 
      addTask, 
      toggleTask, 
      approveTask, 
      rejectTask,
      addReward,
      buyReward,
      deleteTask,
      deleteAllCompletedTasks,
      updateChildStats,
      setGoals,
      approveGoal,
      rejectGoal,
      clearRewards,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}