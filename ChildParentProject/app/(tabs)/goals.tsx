import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Goal, useTasks } from '../context/TaskContext';

const GOAL_TYPES = {
  daily: {
    title: 'Günlük Hedefler',
    icon: 'sunny',
    color: '#FFA500',
    gradient: ['#fff5e6', '#fff'],
  },
  weekly: {
    title: 'Haftalık Hedefler',
    icon: 'calendar',
    color: '#4CAF50',
    gradient: ['#e6ffe6', '#fff'],
  },
};

export default function GoalsScreen() {
  const [selectedType, setSelectedType] = useState<'daily' | 'weekly'>('daily');
  const { goals, setGoals } = useTasks();
  const [showCongrats, setShowCongrats] = useState(false);
  const [completedGoal, setCompletedGoal] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [animValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (showCongrats) {
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowCongrats(false);
        setCompletedGoal(null);
      });
    }
  }, [showCongrats]);

  const handleProgress = (type: 'daily' | 'weekly', goalId: number, value: number) => {
    const newGoals = { ...goals };
    const goal = newGoals[type].find((g: Goal) => g.id === goalId);
    if (goal) {
      goal.progress = value;
      
      
      if (value >= goal.target && !goal.completed && !goal.pendingApproval) {
        goal.completed = true;
        goal.pendingApproval = true;
        goal.approved = false;
        
       
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        
        
        Alert.alert(
          'Tebrikler! 🎉',
          'Hedefini tamamladın! Ebeveyn onayı bekleniyor.',
          [{ text: 'Tamam' }]
        );

      
        setCompletedGoal(goal.text);
        setShowCongrats(true);
      }
    }
    setGoals(newGoals);
  };

  const getProgressColor = (progress: number, target: number, pendingApproval: boolean) => {
    if (pendingApproval) return '#FFC107';
    const ratio = progress / target;
    if (ratio >= 1) return '#4CAF50';
    if (ratio >= 0.5) return '#FFA500';
    return '#FF5252';
  };

  const handleAddGoal = () => {
    if (!newGoalText.trim() || !newGoalTarget.trim() || isNaN(Number(newGoalTarget))) return;
    const newGoals = { ...goals };
    const nextId = (newGoals[selectedType].length > 0 ? Math.max(...newGoals[selectedType].map((g: Goal) => g.id)) + 1 : 1);
    const newGoal = { 
      id: nextId, 
      text: newGoalText.trim(), 
      progress: 0, 
      target: Number(newGoalTarget),
      completed: false,
      pendingApproval: false,
      approved: false
    };
    newGoals[selectedType] = [...newGoals[selectedType], newGoal];
    setGoals(newGoals);
    setNewGoalText('');
    setNewGoalTarget('');
  };

  return (
    <LinearGradient colors={["#e9f0fb", "#f4f6fa"] as [string, string]} style={{flex:1}}>
      <ScrollView style={styles.container}>
        {showCongrats && completedGoal && (
          <Animated.View 
            style={[
              styles.congratsBox,
              {
                opacity: animValue,
                transform: [{ scale: animValue }],
              },
            ]}
          >
            <Ionicons name="hourglass" size={28} color="#FFC107" style={{marginRight: 8}} />
            <Text style={styles.congratsText}>
              "{completedGoal}" hedefi tamamlandı! Ebeveyn onayı bekleniyor... ⏳
            </Text>
          </Animated.View>
        )}
        
        <View style={styles.tabBar}>
          {Object.entries(GOAL_TYPES).map(([type, { title, icon, color }]) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.tab,
                selectedType === type && { backgroundColor: color },
              ]}
              onPress={() => setSelectedType(type as 'daily' | 'weekly')}
            >
              <Ionicons name={icon as any} size={20} color={selectedType === type ? '#fff' : color} />
              <Text style={[styles.tabText, selectedType === type && styles.selectedTabText]}>
                {title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.addGoalBox}>
          <TextInput
            style={styles.input}
            placeholder={selectedType === 'daily' ? 'Yeni günlük hedef...' : 'Yeni haftalık hedef...'}
            value={newGoalText}
            onChangeText={setNewGoalText}
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Hedef sayısı (örn: 1, 3, 5)"
            value={newGoalTarget}
            onChangeText={setNewGoalTarget}
            keyboardType="numeric"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Ekle</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={[...GOAL_TYPES[selectedType].gradient] as [string, string]}
          style={styles.goalsContainer}
        >
          {goals[selectedType].map(goal => (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalText}>{goal.text}</Text>
                <Text style={styles.progressText}>
                  {goal.progress}/{goal.target}
                </Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${(goal.progress / goal.target) * 100}%`,
                      backgroundColor: getProgressColor(goal.progress, goal.target, goal.pendingApproval),
                    },
                  ]}
                />
              </View>

              {goal.pendingApproval && (
                <View style={styles.pendingApprovalBox}>
                  <Ionicons name="hourglass" size={20} color="#FFC107" style={{marginRight: 8}} />
                  <Text style={styles.pendingApprovalText}>Ebeveyn onayı bekleniyor...</Text>
                </View>
              )}

              {!goal.completed && !goal.pendingApproval && (
                <TouchableOpacity
                  style={styles.progressButton}
                  onPress={() => handleProgress(selectedType, goal.id, goal.progress + 1)}
                >
                  <Ionicons name="add-circle" size={24} color="#4CAF50" />
                  <Text style={styles.progressButtonText}>İlerleme Ekle</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </LinearGradient>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  selectedTabText: {
    color: '#fff',
  },
  goalsContainer: {
    padding: 16,
    borderRadius: 16,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6ffe6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  progressButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  congratsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 3,
    shadowColor: '#FFD700',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  congratsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b08d00',
    flex: 1,
  },
  addGoalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 4,
  },
  pendingApprovalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  pendingApprovalText: {
    color: '#b08d00',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 