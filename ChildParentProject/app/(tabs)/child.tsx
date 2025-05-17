import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useTasks } from '../context/TaskContext';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Task {
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

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const MOTIVATION_MESSAGES = [
  'Her görev seni daha güçlü yapar! 💪',
  'Başarı, küçük adımlarla başlar.',
  'Bugün bir görevi tamamla, kahraman ol!',
  'Denemekten asla vazgeçme!',
  'Her gün yeni bir macera!'
];

const DAILY_GOAL = 3;
const WEEKLY_GOAL = 10;

const QUIZ_QUESTIONS = [
  {
    question: "Sence hak ne demek?",
    options: [
      "A) Çocukların güvenliği ve sahip olması gereken şeyler için koruyucu kurallardır",
      "B) Sadece büyüklerin kurallarıdır",
      "C) İstediğimiz her şeyi yapabilmektir"
    ],
    correctAnswer: 0,
    explanation: "Hak, insanların kendilerini koruyan ve kendilerine hak verilen şeylerdir. Her çocuğun güvenli bir yaşam sürme, eğitim alma ve oyun oynama hakkı vardır."
  },
  {
    question: "Doğru ve yanlış arasında karar verirken neye dikkat etmeliyiz?",
    options: [
      "A) Hayvanlara zarar vermeden ve onlara iyi davranarak yaptığımız şeylere",
      "B) Sadece bize faydası olan şeylere",
      "C) Kimin güçlü olduğuna"
    ],
    correctAnswer: 0,
    explanation: "Doğru ve yanlış arasında karar verirken, başkalarına zarar vermemeye ve her canlıya saygılı davranmaya dikkat etmeliyiz."
  },
  {
    question: "Tüm çocukların yaşamak ve büyümek için nelere ihtiyacı vardır?",
    options: [
      "A) Yemek, su ve sevgi ve dinlenmek",
      "B) Yalnız kalmak ve oyun oynamamak",
      "C) Sadece çalışmak"
    ],
    correctAnswer: 0,
    explanation: "Tüm çocukların sağlıklı büyümesi için yemek, su, sevgi ve dinlenmeye ihtiyacı vardır. Bu temel ihtiyaçlar her çocuğun hakkıdır."
  },
  {
    question: "Sence neden her çocuğun okula gitme hakkı vardır?",
    options: [
      "A) Yeni şeyler öğrenmek ve hayallerimizi gerçekleştirmek için",
      "B) Sadece öğretmenleri mutlu etmek için",
      "C) Okula gitmek zorunlu olduğu için"
    ],
    correctAnswer: 0,
    explanation: "Her çocuğun okula gitme hakkı vardır çünkü eğitim, yeni şeyler öğrenmek ve gelecekteki hayallerimizi gerçekleştirmek için çok önemlidir."
  },
  {
    question: "Üzüldüğünde veya mutlu olduğunda bunu nasıl anlatırsın?",
    options: [
      "A) Duygularımı aileme veya arkadaşlarıma anlatırım",
      "B) Hiçbir şey söylemem ve saklarım",
      "C) Öfkelenip her şeyi kırarım"
    ],
    correctAnswer: 0,
    explanation: "Duygularımızı ailemiz ve arkadaşlarımızla paylaşmak, bize yardımcı olmalarını sağlar ve kendimizi daha iyi hissetmemize yardımcı olur."
  },
  {
    question: "Oyun oynamak ve eğlenmek çocuklar için neden önemlidir?",
    options: [
      "A) Dinlenmek ve arkadaşlarla vakit geçirmek için bu biz çocukların sahip olduğu önemli bir haktır",
      "B) Hiçbir işe yaramaz",
      "C) Sadece büyükler istediği için oyun oynarız"
    ],
    correctAnswer: 0,
    explanation: "Oyun oynamak ve eğlenmek, çocukların gelişimi için çok önemlidir. Arkadaşlarla vakit geçirmek ve dinlenmek her çocuğun hakkıdır."
  },
  {
    question: "Bir arkadaşın diğer bir çocuğa 'Sen bizimle oynayamazsın çünkü farklı görünüyorsun!' dese, bu doğru bir davranış mı?",
    options: [
      "A) Hayır, herkesin oyun oynama ve birlikte olma hakkı vardır",
      "B) Evet, kuralları biz koyarız",
      "C) Karar vermek bana bağlı değil"
    ],
    correctAnswer: 0,
    explanation: "Her çocuğun oyun oynama ve arkadaş edinme hakkı vardır. Kimsenin dış görünüşü veya farklılıkları nedeniyle dışlanmaması gerekir."
  }
];

const POSITIVE_MESSAGES = [
  'Aferin! 🎉',
  'Harika iş çıkardın!',
  'Süpersin, devam et!',
  'Başarıya bir adım daha!',
  'Seninle gurur duyuyorum!',
  'Mükemmel!'
];

export default function ChildScreen() {
  const { tasks, toggleTask, childStats, deleteTask, deleteAllCompletedTasks, updateChildStats } = useTasks();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'completed'>('pending');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const approvalAnim = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRewardAnim, setShowRewardAnim] = useState(false);
  const rewardAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const [motivation, setMotivation] = useState('');
  const [completedToday, setCompletedToday] = useState(0);
  const [goalAchieved, setGoalAchieved] = useState(false);
  const [completedThisWeek, setCompletedThisWeek] = useState(0);
  const [weeklyGoalAchieved, setWeeklyGoalAchieved] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const quizAnim = useRef(new Animated.Value(0)).current;
  const [positiveMsg, setPositiveMsg] = useState<string|null>(null);
  const positiveAnim = useRef(new Animated.Value(0)).current;
  const [feedbackMessage, setFeedbackMessage] = useState('');


  useEffect(() => {
    const loadAvatar = async () => {
      const uri = await AsyncStorage.getItem('selectedAvatar');
      if (uri) setAvatar(uri);
    };
    
    loadAvatar();
  }, []);


  useEffect(() => {
    const checkAvatar = async () => {
      const uri = await AsyncStorage.getItem('selectedAvatar');
      if (uri) setAvatar(uri);
    };

    const interval = setInterval(checkAvatar, 1000); 

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setMotivation(MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)]);
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    const completed = tasks.filter((t: Task) => t.completed && t.completedDate === today).length;
    setCompletedToday(completed);
    setGoalAchieved(completed >= DAILY_GOAL);
  }, [tasks]);

  useEffect(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0,0,0,0);
    const completed = tasks.filter((t: Task) => {
      if (!t.completedDate) return false;
      const d = new Date(t.completedDate);
      d.setHours(0,0,0,0);
      return d >= monday && d <= now;
    }).length;
    setCompletedThisWeek(completed);
    setWeeklyGoalAchieved(completed >= WEEKLY_GOAL);
  }, [tasks]);

  useEffect(() => {
    const approvedTask = tasks.find((task: Task) => task.approved && !task.pendingApproval);
    if (approvedTask) {
      animateApproval();
      animatePoints();
      setShowConfetti(true);
      setShowRewardAnim(true);
      showPositiveMessage();
      Animated.timing(rewardAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start(() => {
        setShowRewardAnim(false);
        rewardAnim.setValue(0);
      });
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [tasks]);

  const animateCheckbox = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateApproval = () => {
    Animated.sequence([
      Animated.timing(approvalAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(approvalAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatePoints = () => {
    Animated.sequence([
      Animated.timing(pointsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(pointsAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showPositiveMessage = () => {
    const msg = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
    setPositiveMsg(msg);
    positiveAnim.setValue(0);
    Animated.timing(positiveAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(positiveAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setPositiveMsg(null));
      }, 1200);
    });
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FFC107';
      case 'hard': return '#F44336';
    }
  };

  const getDifficultyText = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
    }
  };

  const getDifficultyIcon = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'leaf';
      case 'medium': return 'barbell';
      case 'hard': return 'thunderstorm';
    }
  };

  const filteredTasks = tasks.filter((task: Task) => 
    selectedTab === 'pending' ? !task.completed && !task.pendingApproval : task.completed && task.approved && !task.pendingApproval
  );

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    if (index === QUIZ_QUESTIONS[currentQuestion].correctAnswer) {
      const newXP = childStats.xp + 150;
      const newLevel = Math.floor(newXP / 1000) + 1;
      
      updateChildStats({
        ...childStats,
        xp: newXP,
        level: newLevel
      });
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      setFeedbackMessage('Doğru cevap! +150 XP kazandın! 🎉');
      setScore(prev => prev + 1);
    } else {
      setFeedbackMessage('Yanlış cevap, tekrar dene!');
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setShowQuiz(false);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setScore(0);
    }
  };

  useEffect(() => {
    if (showQuiz) {
      Animated.spring(quizAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      quizAnim.setValue(0);
    }
  }, [showQuiz]);

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleDeleteAllCompleted = () => {
    const completedApprovedTasks = tasks.filter(task => task.completed && task.approved);
    completedApprovedTasks.forEach(task => deleteTask(task.id));
  };

  return (
    <LinearGradient
      colors={["#e9f0fb", "#f4f6fa"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          {/* Motivasyon mesajı */}
          <View style={styles.motivationBox}>
            <Ionicons name="bulb" size={20} color="#FFD700" style={{marginRight: 6}} />
            <Text style={styles.motivationText}>{motivation}</Text>
          </View>
          {/* Confetti animation */}
          {showConfetti && (
            <ConfettiCannon
              count={60}
              origin={{ x: 200, y: 0 }}
              fadeOut
              explosionSpeed={350}
            />
          )}
          {/* XP/Gold reward animation */}
          {showRewardAnim && (
            <Animated.View style={[styles.rewardAnimBox, {
              opacity: rewardAnim,
              transform: [{ translateY: rewardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -80] }) }]
            }]}
            >
              <View style={styles.rewardAnimRow}>
                <Ionicons name="star" size={28} color="#FFD700" style={{ marginRight: 8 }} />
                <Text style={styles.rewardAnimText}>XP & Altın Kazandın!</Text>
                <Ionicons name="logo-bitcoin" size={28} color="#FFD700" style={{ marginLeft: 8 }} />
              </View>
            </Animated.View>
          )}
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarGlowBox}>
              <Animated.View style={[styles.avatarGlow, { opacity: 0.7, shadowColor: '#FFD700', shadowRadius: 16, shadowOpacity: 0.8 }]} />
              <Image
                source={{ uri: avatar }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.xpContainer}>
                <Text style={styles.xpLabel}>XP</Text>
                <Text style={styles.xpValue}>{childStats.xp}</Text>
              </View>
              <View style={styles.goldContainer}>
                <Text style={styles.goldLabel}>Altın</Text>
                <Text style={styles.goldValue}>{childStats.gold}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
              <Ionicons name="settings" size={28} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'pending' && styles.selectedTab]}
              onPress={() => setSelectedTab('pending')}
            >
              <Text style={[styles.tabText, selectedTab === 'pending' && styles.selectedTabText]}>
                Bekleyen Görevler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'completed' && styles.selectedTab]}
              onPress={() => setSelectedTab('completed')}
            >
              <Text style={[styles.tabText, selectedTab === 'completed' && styles.selectedTabText]}>
                Tamamlanan Görevler
              </Text>
            </TouchableOpacity>
          </View>

          {/* Günlük hedef kutusu */}
          <View style={[styles.goalBox, goalAchieved && styles.goalBoxAchieved]}>
            <View style={styles.goalIconBox}>
              <Ionicons name={goalAchieved ? 'trophy' : 'flag'} size={28} color={goalAchieved ? '#4CAF50' : '#007AFF'} />
            </View>
            <View style={styles.goalContent}>
              <Text style={styles.goalText}>Günlük Hedef: {DAILY_GOAL} görev tamamla</Text>
              <Text style={styles.goalProgress}>{completedToday} / {DAILY_GOAL} tamamlandı</Text>
              {goalAchieved && <Text style={styles.goalCongrats}>Tebrikler, günlük hedefini tamamladın! 🎉</Text>}
            </View>
          </View>

          {/* Haftalık hedef kutusu */}
          <View style={[styles.goalBox, weeklyGoalAchieved && styles.goalBoxAchieved, {marginBottom: 8}]}> 
            <View style={styles.goalIconBox}>
              <Ionicons name={weeklyGoalAchieved ? 'medal' : 'calendar'} size={28} color={weeklyGoalAchieved ? '#F7B731' : '#007AFF'} />
            </View>
            <View style={styles.goalContent}>
              <Text style={styles.goalText}>Haftalık Hedef: {WEEKLY_GOAL} görev tamamla</Text>
              <View style={styles.weeklyProgressBarBg}>
                <View style={[styles.weeklyProgressBarFill, {width: `${Math.min(100, (completedThisWeek/WEEKLY_GOAL)*100)}%`}]} />
              </View>
              <Text style={styles.goalProgress}>{completedThisWeek} / {WEEKLY_GOAL} tamamlandı</Text>
              {weeklyGoalAchieved && <Text style={styles.goalCongrats}>Harika! Haftalık hedefini başardın! 🏆</Text>}
            </View>
          </View>

          {/* Görevler */}
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="rocket" size={48} color="#b0c4de" style={{marginBottom: 8}} />
              <Text style={styles.emptyText}>Burada henüz görev yok!
Yeni görevler için ebeveyninden isteyebilirsin.</Text>
            </View>
          ) : (
            <>
              {selectedTab === 'completed' && filteredTasks.some(task => task.completed && task.approved) && (
                <TouchableOpacity 
                  style={styles.deleteAllButton}
                  onPress={handleDeleteAllCompleted}
                >
                  <Ionicons name="trash" size={20} color="#fff" style={{marginRight: 6}} />
                  <Text style={styles.deleteAllButtonText}>Tümünü Sil</Text>
                </TouchableOpacity>
              )}
              <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.taskItem}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => {
                        toggleTask(item.id);
                        animateCheckbox();
                      }}
                    >
                      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <Ionicons
                          name={item.completed ? 'checkbox' : 'square-outline'}
                          size={24}
                          color={item.completed ? '#4CAF50' : '#888'}
                        />
                      </Animated.View>
                    </TouchableOpacity>
                    <View style={styles.taskInfo}>
                      <Text style={item.completed ? styles.completedTaskText : styles.taskText}>
                        {item.title}
                      </Text>
                      <Text style={styles.taskDescription}>{item.description}</Text>
                      <View style={styles.taskDetails}>
                        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                          <Ionicons name={getDifficultyIcon(item.difficulty)} size={16} color="#fff" style={{marginRight: 4}} />
                          <Text style={styles.difficultyBadgeText}>{getDifficultyText(item.difficulty)}</Text>
                        </View>
                        {item.completed && (
                          <View style={styles.successBadge}>
                            <Ionicons name="ribbon" size={16} color="#FFD700" style={{marginRight: 2}} />
                            <Text style={styles.successText}>Başarı!</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {selectedTab === 'completed' && item.completed && item.approved && !item.pendingApproval && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTask(item.id)}
                      >
                        <Ionicons name="trash" size={20} color="#FF5252" />
                      </TouchableOpacity>
                    )}
                    {item.pendingApproval && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>Onay Bekliyor</Text>
                      </View>
                    )}
                    {item.approved && (
                      <Animated.View 
                        style={[
                          styles.approvalBadge,
                          { opacity: approvalAnim }
                        ]}
                      >
                        <Text style={styles.approvalText}>Onaylandı!</Text>
                      </Animated.View>
                    )}
                  </View>
                )}
              />
            </>
          )}

          <TouchableOpacity
            style={styles.quizButton}
            onPress={() => setShowQuiz(true)}
          >
            <Ionicons name="school" size={24} color="#fff" />
            <Text style={styles.quizButtonText}>Eğitici Quiz</Text>
          </TouchableOpacity>

          <Modal
            visible={showQuiz}
            transparent
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <Animated.View
                style={[
                  styles.quizModal,
                  {
                    transform: [{ scale: quizAnim }],
                    opacity: quizAnim,
                  },
                ]}
              >
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowQuiz(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.quizTitle}>Eğitici Quiz</Text>
                <Text style={styles.questionText}>
                  {QUIZ_QUESTIONS[currentQuestion].question}
                </Text>
                
                <View style={styles.optionsContainer}>
                  {QUIZ_QUESTIONS[currentQuestion].options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        selectedAnswer !== null && {
                          backgroundColor:
                            index === QUIZ_QUESTIONS[currentQuestion].correctAnswer
                              ? '#4CAF50'
                              : index === selectedAnswer
                              ? '#FF5252'
                              : '#f0f0f0',
                        },
                      ]}
                      onPress={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedAnswer !== null && { color: '#fff' },
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {showExplanation && (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationText}>
                      {QUIZ_QUESTIONS[currentQuestion].explanation}
                    </Text>
                  </View>
                )}

                <View style={styles.quizFooter}>
                  <Text style={styles.scoreText}>
                    Skor: {score}/{currentQuestion + 1}
                  </Text>
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNextQuestion}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentQuestion < QUIZ_QUESTIONS.length - 1
                        ? 'Sonraki Soru'
                        : 'Bitir'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Modal>

          {positiveMsg && (
            <Animated.View style={[styles.positiveMsgBox, { opacity: positiveAnim, transform: [{ scale: positiveAnim }] }] }>
              <Ionicons name="happy" size={28} color="#4CAF50" style={{marginRight: 8}} />
              <Text style={styles.positiveMsgText}>{positiveMsg}</Text>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  motivationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 18,
    shadowColor: '#FFD700',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  motivationText: {
    fontSize: 14,
    color: '#b08d00',
    fontWeight: 'bold',
    flex: 1,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  emptyText: {
    fontSize: 16,
    color: '#9e9e9e',
    textAlign: 'center',
    marginTop: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'center',
  },
  avatarGlowBox: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4a6fa5',
    opacity: 0.3,
    zIndex: 0,
    shadowColor: '#4a6fa5',
    shadowRadius: 16,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#4a6fa5',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  xpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpLabel: {
    fontSize: 16,
    color: '#9e9e9e',
  },
  xpValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a6fa5',
  },
  goldContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldLabel: {
    fontSize: 16,
    color: '#9e9e9e',
  },
  goldValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#b08d00',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 5,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedTab: {
    backgroundColor: '#4a6fa5',
  },
  tabText: {
    fontSize: 16,
    color: '#9e9e9e',
  },
  selectedTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  checkbox: {
    marginRight: 10,
  },
  taskInfo: {
    flex: 1,
  },
  taskDetails: {
    flexDirection: 'row',
    marginTop: 5,
  },
  taskText: {
    fontSize: 16,
  },
  completedTaskText: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#888',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
  },
  difficultyBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
  },
  pendingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  approvalBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
  },
  approvalText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileBtn: {
    marginLeft: 16,
    padding: 8,
  },
  rewardAnimBox: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  rewardAnimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowRadius: 8,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
  },
  rewardAnimText: {
    fontSize: 18,
    color: '#bfa100',
    fontWeight: 'bold',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  successText: {
    color: '#b08d00',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 2,
  },
  goalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  goalBoxAchieved: {
    backgroundColor: '#e6ffe6',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  goalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  goalContent: {
    flex: 1,
  },
  goalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  goalProgress: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  goalCongrats: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 6,
  },
  weeklyProgressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9e9e9',
    borderRadius: 4,
    marginVertical: 8,
    overflow: 'hidden',
  },
  weeklyProgressBarFill: {
    height: 8,
    backgroundColor: '#F7B731',
    borderRadius: 4,
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  quizButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 320,
    alignItems: 'center',
    elevation: 5,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#2C3E50',
    textAlign: 'center',
  },
  questionText: {
    fontSize: 16,
    marginBottom: 18,
    color: '#333',
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 18,
  },
  optionButton: {
    width: '100%',
    backgroundColor: '#f4f6fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9e9e9',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  explanationBox: {
    marginTop: 18,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  explanationText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  quizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  positiveMsgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#e6ffe6',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 14,
    marginTop: 4,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  positiveMsgText: {
    fontSize: 18,
    color: '#388e3c',
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5252',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'flex-end',
  },
  deleteAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
}); 