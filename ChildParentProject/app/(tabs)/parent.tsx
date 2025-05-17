import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Goal, Task, useTasks } from '../context/TaskContext';

type Difficulty = 'easy' | 'medium' | 'hard';

const MOTIVATION_MESSAGES = [
  'Çocuğunuzun küçük başarılarını kutlamayı unutmayın! 🎉',
  'Birlikte hedefler koymak motivasyonu artırır.',
  'Olumlu geri bildirim, özgüveni güçlendirir.',
  'Her gün küçük bir adım, büyük değişimlere yol açar.',
  'Çocuğunuzun gelişimini birlikte izleyin!'
];

const TASK_PACKAGES = {
  morning: [
    { title: 'Yatağını topla', description: 'Yatağını düzgünce topla ve yastığını düzelt', difficulty: 'easy' as Difficulty, points: 100 },
    { title: 'Dişlerini fırçala', description: 'Dişlerini 2 dakika fırçala ve ağzını çalkala', difficulty: 'medium' as Difficulty, points: 200 },
    { title: 'Okul çantanı hazırla', description: 'Tüm ders kitaplarını ve ödevlerini kontrol et', difficulty: 'hard' as Difficulty, points: 300 }
  ],
  noon: [
    { title: 'Masanı topla', description: 'Yemek sonrası masanı topla ve peçeteleri at', difficulty: 'easy' as Difficulty, points: 100 },
    { title: 'Bulaşıkları yerleştir', description: 'Bulaşıkları makineye düzgünce yerleştir', difficulty: 'medium' as Difficulty, points: 200 },
    { title: 'Ekran süresi kuralına uy!', description: 'Ekran süresi kuralına uy ve 1 saat boyunca aktivite yap', difficulty: 'hard' as Difficulty, points: 300 }
  ],
  evening: [
    { title: 'Pijamalarını giy', description: 'Pijamalarını giy ve hazırlan', difficulty: 'easy' as Difficulty, points: 100 },
    { title: 'Oyuncağını topla', description: 'Oyuncağını düzgünce yerleştir ve odanı düzenle', difficulty: 'medium' as Difficulty, points: 200 },
    { title: 'Günlük rutinleri tamamla', description: 'Diş fırçalama, kitap okuma ve uyku hazırlığı', difficulty: 'hard' as Difficulty, points: 300 }
  ]
};

export default function ParentScreen() {
  const [task, setTask] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const { tasks, addTask, approveTask, rejectTask, childStats, rewards, addReward, deleteTask, deleteAllCompletedTasks, updateChildStats, goals, approveGoal, rejectGoal } = useTasks();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const approvalAnim = useRef(new Animated.Value(0)).current;
  const [error, setError] = useState('');
  const [rewardName, setRewardName] = useState('');
  const [rewardCost, setRewardCost] = useState('');
  const [rewardType, setRewardType] = useState<'gold' | 'xp'>('gold');
  const [rewardError, setRewardError] = useState('');
  const [passwordModalVisible, setPasswordModalVisible] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSetPassword, setIsSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerificationValid, setIsVerificationValid] = useState(false);
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => t.pendingApproval).length;
  const [motivation, setMotivation] = useState('');
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('parentPassword').then(pw => {
      if (pw) {
        setIsSetPassword(false);
      } else {
        setIsSetPassword(true);
      }
      setPasswordModalVisible(true);
    });
  }, []);

  useEffect(() => {
    setMotivation(MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)]);
  }, []);

  const handlePasswordSubmit = async () => {
    const saved = await AsyncStorage.getItem('parentPassword');
    if (passwordInput === saved) {
      setPasswordModalVisible(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('Şifre yanlış!');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      setPasswordError('Şifre en az 4 karakter olmalı!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor!');
      return;
    }
    await AsyncStorage.setItem('parentPassword', newPassword);
    setPasswordModalVisible(false);
    setPasswordError('');
    setNewPassword('');
    setConfirmPassword('');
    setIsResetPassword(false);
  };

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      setPasswordError('Şifre en az 4 karakter olmalı!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor!');
      return;
    }
    await AsyncStorage.setItem('parentPassword', newPassword);
    setPasswordModalVisible(false);
    setPasswordError('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSendVerification = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setPasswordError('Geçerli bir telefon numarası girin!');
      return;
    }
    const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
    await AsyncStorage.setItem('verificationCode', demoCode);
    setIsVerificationSent(true);
    setPasswordError('');
    alert(`Demo amaçlı doğrulama kodu: ${demoCode}`);
  };

  const handleVerifyCode = async () => {
    const savedCode = await AsyncStorage.getItem('verificationCode');
    if (verificationCode === savedCode) {
      setIsVerificationValid(true);
      setPasswordError('');
    } else {
      setPasswordError('Doğrulama kodu yanlış!');
    }
  };

  const handleAddTask = () => {
    if (!task.trim()) {
      setError('Görev boş olamaz!');
      return;
    }
    addTask({
      title: task,
      description: '',
      difficulty: selectedDifficulty,
      points: selectedDifficulty === 'easy' ? 100 : selectedDifficulty === 'medium' ? 200 : 300
    });
    setTask('');
    setError('');
    setShowCheckmark(true);
    setTimeout(() => setShowCheckmark(false), 1200);
  };

  const handleAddReward = () => {
    if (!rewardName.trim() || !rewardCost.trim() || isNaN(Number(rewardCost))) {
      setRewardError('Tüm alanları doldurun ve geçerli bir sayı girin!');
      return;
    }
    addReward(rewardName, Number(rewardCost), rewardType);
    setRewardName('');
    setRewardCost('');
    setRewardType('gold');
    setRewardError('');
  };

  const animateButton = () => {
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

  const calculateXPPercentage = (currentXP: number, level: number) => {
    const xpForCurrentLevel = level * 1000;
    const xpForNextLevel = (level + 1) * 1000;
    const currentLevelXP = currentXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    return Math.min((currentLevelXP / xpNeeded) * 100, 100);
  };

  const getNextLevelXP = (currentLevel: number) => {
    return (currentLevel + 1) * 1000;
  };

  const renderTaskItem = ({ item }: { item: Task | Goal }) => {
    if ('title' in item) {
      // Task rendering
      return (
        <View style={styles.taskItem}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDescription}>{item.description}</Text>
            <View style={styles.taskMeta}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                <Ionicons name={getDifficultyIcon(item.difficulty)} size={16} color="#fff" style={{marginRight: 4}} />
                <Text style={styles.difficultyBadgeText}>{getDifficultyText(item.difficulty)}</Text>
              </View>
            </View>
          </View>
          {item.pendingApproval && (
            <View style={styles.approvalButtons}>
              <TouchableOpacity
                style={[styles.approvalButton, styles.approveButton]}
                onPress={() => {
                  approveTask(item.id);
                  animateApproval();
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 2000);
                }}
              >
                <Ionicons name="checkmark" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.approvalButton, styles.rejectButton]}
                onPress={() => rejectTask(item.id)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    } else {
     
      return (
        <View style={styles.taskItem}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{item.text}</Text>
            <View style={styles.taskMeta}>
              <Text style={styles.pointsText}>İlerleme: {item.progress}/{item.target}</Text>
            </View>
          </View>
          {item.pendingApproval && (
            <View style={styles.approvalButtons}>
              <TouchableOpacity
                style={[styles.approvalButton, styles.approveButton]}
                onPress={() => {
                  approveGoal('daily', item.id);
                  animateApproval();
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 2000);
                }}
              >
                <Ionicons name="checkmark" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.approvalButton, styles.rejectButton]}
                onPress={() => rejectGoal('daily', item.id)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }
  };

  const handleCloseModal = () => {
    setPasswordModalVisible(false);
    router.replace('/child');
    setPasswordInput('');
    setPasswordError('');
    setIsResetPassword(false);
    setPhoneNumber('');
    setVerificationCode('');
    setIsVerificationSent(false);
    setIsVerificationValid(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleVerificationSubmit = async () => {
    try {
      const storedCode = await AsyncStorage.getItem('verificationCode');
      if (verificationCode === storedCode) {
        setShowVerificationModal(false);
        setVerificationCode('');
        // Şifre değiştirme işlemi başarılı
        Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.');
      } else {
        Alert.alert('Hata', 'Yanlış doğrulama kodu!');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      Alert.alert('Hata', 'Doğrulama kodu kontrol edilirken bir hata oluştu.');
    }
  };

  const handleAddTaskPackage = (packageType: 'morning' | 'noon' | 'evening') => {
    const tasks = TASK_PACKAGES[packageType];
    
  
    tasks.forEach(task => {
      addTask(task);
    });

    
    Alert.alert(
      'Görev Paketi Eklendi',
      `${packageType === 'morning' ? 'Sabah' : packageType === 'noon' ? 'Öğle' : 'Akşam'} paketi başarıyla eklendi!\n\nToplam 3 görev eklendi:\n- 1 kolay görev (100 XP)\n- 1 orta görev (200 XP)\n- 1 zor görev (300 XP)\n\nToplam 600 XP kazanılabilir!`,
      [{ text: 'Tamam' }]
    );
  };

  if (passwordModalVisible) {
    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            {isSetPassword ? (
              <>
                <Text style={styles.modalTitle}>Ebeveyn Şifresi Belirle</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Yeni şifre"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Şifreyi tekrar gir"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                {passwordError ? <Text style={styles.modalError}>{passwordError}</Text> : null}
                <TouchableOpacity style={styles.modalButton} onPress={handleSetPassword}>
                  <Text style={styles.modalButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </>
            ) : isResetPassword ? (
              <>
                <Text style={styles.modalTitle}>Şifre Sıfırlama</Text>
                {!isVerificationSent ? (
                  <>
                    <Text style={styles.modalSubtitle}>Telefon numaranızı girin</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Telefon numarası (5XX...)"
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                    />
                    {passwordError ? <Text style={styles.modalError}>{passwordError}</Text> : null}
                    <TouchableOpacity 
                      style={styles.modalButton} 
                      onPress={handleSendVerification}
                    >
                      <Text style={styles.modalButtonText}>Doğrulama Kodu Gönder</Text>
                    </TouchableOpacity>
                  </>
                ) : !isVerificationValid ? (
                  <>
                    <Text style={styles.modalSubtitle}>Doğrulama kodunu girin</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="6 haneli kod"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                    />
                    {passwordError ? <Text style={styles.modalError}>{passwordError}</Text> : null}
                    <View style={styles.modalButtonRow}>
                      <TouchableOpacity 
                        style={styles.modalButtonSecondary}
                        onPress={() => {
                          setIsVerificationSent(false);
                          setVerificationCode('');
                          setPasswordError('');
                        }}
                      >
                        <Text style={styles.modalButtonText}>Geri</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.modalButtonPrimary}
                        onPress={handleVerifyCode}
                      >
                        <Text style={styles.modalButtonText}>Doğrula</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.modalSubtitle}>Yeni şifrenizi belirleyin</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Yeni şifre"
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Şifreyi tekrar gir"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    {passwordError ? <Text style={styles.modalError}>{passwordError}</Text> : null}
                    <TouchableOpacity 
                      style={styles.modalButton}
                      onPress={handleResetPassword}
                    >
                      <Text style={styles.modalButtonText}>Şifreyi Sıfırla</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Ebeveyn Şifresi</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Şifre"
                  secureTextEntry
                  value={passwordInput}
                  onChangeText={setPasswordInput}
                  onSubmitEditing={handlePasswordSubmit}
                  returnKeyType="done"
                />
                {passwordError ? <Text style={styles.modalError}>{passwordError}</Text> : null}
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity style={[styles.modalButton, { flex: 1, marginRight: 8 }]} onPress={handlePasswordSubmit}>
                    <Text style={styles.modalButtonText}>Giriş Yap</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, { flex: 1, backgroundColor: '#666' }]} 
                    onPress={() => {
                      setIsResetPassword(true);
                      setPasswordError('');
                      setPasswordInput('');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Şifremi Unuttum</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <LinearGradient colors={["#f4f6fa", "#e9f0fb"]} style={{flex:1}}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.childStatsCard}>
          <View style={styles.childStatsRow}>
            <Ionicons name="happy" size={28} color="#007AFF" style={{marginRight: 8}} />
            <Text style={styles.childStatsTitle}>Çocuk İstatistikleri</Text>
          </View>
          <View style={styles.childStatsInfoRow}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.childStatsValue}>Seviye: {childStats.level}</Text>
            <Ionicons name="logo-bitcoin" size={18} color="#F7B731" style={{marginLeft: 12}} />
            <Text style={styles.childStatsValue}>{childStats.gold} Altın</Text>
          </View>
          <View style={styles.childStatsInfoRow}>
            <Ionicons name="checkmark-done" size={18} color="#4CAF50" />
            <Text style={styles.childStatsValue}>Tamamlanan: {completedCount}</Text>
            <Ionicons name="timer" size={18} color="#e67e22" style={{marginLeft: 12}} />
            <Text style={styles.childStatsValue}>Onay Bekleyen: {pendingCount}</Text>
          </View>
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBarLabels}>
              <Text style={styles.xpBarLevelText}>Lvl {childStats.level} ({childStats.level * 1000} XP)</Text>
              <Text style={styles.xpBarLevelText}>Lvl {childStats.level + 1} ({getNextLevelXP(childStats.level)} XP)</Text>
            </View>
            <View style={styles.xpBarBackground}>
              <View 
                style={[
                  styles.xpBarFill, 
                  { width: `${calculateXPPercentage(childStats.xp, childStats.level)}%` }
                ]} 
              />
            </View>
            <Text style={styles.xpBarValue}>
              {childStats.xp} / {getNextLevelXP(childStats.level)} XP
            </Text>
          </View>
        </View>
        <View style={styles.motivationBox}>
          <Ionicons name="bulb" size={20} color="#FFD700" style={{marginRight: 6}} />
          <Text style={styles.motivationText}>{motivation}</Text>
        </View>
        {showConfetti && (
          <ConfettiCannon
            count={80}
            origin={{ x: 200, y: 0 }}
            fadeOut
            explosionSpeed={350}
          />
        )}
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name="account-tie" size={32} color="#2C3E50" style={{marginRight: 8}} />
          <Text style={styles.title}>Görev Ekle</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={task}
            onChangeText={text => {
              setTask(text);
              if (error) setError('');
            }}
            placeholder="Yeni görev ekle..."
            placeholderTextColor="#b0b0b0"
          />
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => {
              handleAddTask();
              animateButton();
            }}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.addButtonText}>Ekle</Text>
            </Animated.View>
          </TouchableOpacity>
          {showCheckmark && (
            <Animated.View style={styles.checkmarkBox}>
              <Ionicons name="checkmark-circle" size={32} color="#27ae60" />
            </Animated.View>
          )}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.difficultyContainer}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => (
            <TouchableOpacity
              key={difficulty}
              style={[
                styles.difficultyButton,
                selectedDifficulty === difficulty && { backgroundColor: getDifficultyColor(difficulty), borderColor: getDifficultyColor(difficulty) }
              ]}
              onPress={() => setSelectedDifficulty(difficulty)}
            >
              <Text style={[
                styles.difficultyText,
                selectedDifficulty === difficulty && { color: 'white' }
              ]}>
                {getDifficultyText(difficulty)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tasksContainer}>
          {[
            ...tasks.filter(task => task.pendingApproval),
            ...goals.daily.filter(goal => goal.pendingApproval),
            ...goals.weekly.filter(goal => goal.pendingApproval)
          ].map((item) => renderTaskItem({ item }))}
        </View>

        {/* Ödül Ekleme Bölümü */}
        <View style={styles.rewardSection}>
          <View style={styles.rewardTitleRow}>
            <Ionicons name="gift" size={22} color="#007AFF" style={{marginRight: 6}} />
            <Text style={styles.rewardTitle}>Ödül Ekle</Text>
          </View>
          <View style={styles.rewardInputRow}>
            <TextInput
              style={styles.rewardInput}
              value={rewardName}
              onChangeText={setRewardName}
              placeholder="Ödül adı"
            />
            <TextInput
              style={styles.rewardInput}
              value={rewardCost}
              onChangeText={setRewardCost}
              placeholder="B$ Maliyet"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.rewardAddBtn} onPress={handleAddReward}>
              <Text style={styles.rewardAddBtnText}>Ekle</Text>
            </TouchableOpacity>
          </View>
          {rewardError ? <Text style={styles.rewardError}>{rewardError}</Text> : null}
        </View>

        {/* Görev Paketleri */}
        <View style={styles.taskPackagesContainer}>
          <Text style={styles.taskPackagesTitle}>Görev Paketleri</Text>
          <View style={styles.taskPackagesRow}>
            <TouchableOpacity 
              style={styles.taskPackageButton}
              onPress={() => handleAddTaskPackage('morning')}
            >
              <Ionicons name="sunny" size={24} color="#FFD700" />
              <Text style={styles.taskPackageText}>Sabah</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.taskPackageButton}
              onPress={() => handleAddTaskPackage('noon')}
            >
              <Ionicons name="restaurant" size={24} color="#FF6B6B" />
              <Text style={styles.taskPackageText}>Öğle</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.taskPackageButton}
              onPress={() => handleAddTaskPackage('evening')}
            >
              <Ionicons name="moon" size={24} color="#4a6fa5" />
              <Text style={styles.taskPackageText}>Akşam</Text>
            </TouchableOpacity>
          </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4a6fa5',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    marginRight: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  addButton: {
    backgroundColor: '#4a6fa5',
    padding: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  checkmarkBox: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  difficultyText: {
    fontSize: 15,
    color: '#4a6fa5',
    fontWeight: 'bold',
  },
  tasksContainer: {
    marginTop: 20,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a6fa5',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#9e9e9e',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pointsText: {
    fontSize: 14,
    color: '#9e9e9e',
    fontWeight: '500',
  },
  approvalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approvalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  approveButton: {
    backgroundColor: '#81c784',
  },
  rejectButton: {
    backgroundColor: '#e57373',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  childStatsCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'flex-start',
  },
  childStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  childStatsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a6fa5',
  },
  childStatsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  childStatsValue: {
    fontSize: 15,
    color: '#4a6fa5',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  xpBarContainer: {
    width: '100%',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  xpBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  xpBarLevelText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  xpBarBackground: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#4a6fa5',
    borderRadius: 6,
  },
  xpBarValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 320,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButtonSecondary: {
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  modalError: {
    color: '#F44336',
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorText: {
    color: '#F44336',
    marginBottom: 10,
    marginLeft: 5,
  },
  rewardSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  rewardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rewardInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rewardInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  rewardAddBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  rewardAddBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  rewardError: {
    color: '#F44336',
    marginBottom: 8,
    marginLeft: 5,
  },
  taskPackagesContainer: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  taskPackagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a6fa5',
    marginBottom: 12,
  },
  taskPackagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskPackageButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  taskPackageText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4a6fa5',
    fontWeight: '500',
  },
}); 