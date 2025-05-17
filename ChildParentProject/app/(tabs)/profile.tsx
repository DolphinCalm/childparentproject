import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChildStats, useTasks } from '../context/TaskContext';

const AVATARS = [
  {
    img: 'https://pics.craiyon.com/2023-12-01/XMFbmh7UQaiinvJWWLWyTA.webp',
    name: 'Spider-Man',
    hp: 100,
    damage: 10,
    unlockLevel: 1,
  },
  {
    img: 'https://th.bing.com/th/id/OIP.Bxu8_12XBXl_fEGWyyet2wHaHa?rs=1&pid=ImgDetMain',
    name: 'İron-Man',
    hp: 110,
    damage: 15,
    unlockLevel: 2,
  },
  {
    img: 'https://i.pinimg.com/originals/ba/69/35/ba6935bff1beb601c7f8e7fcb5745137.png',
    name: 'Kaptan Amerika',
    hp: 115,
    damage: 20,
    unlockLevel: 3,
  },
  {
    img: 'https://i.pinimg.com/originals/09/e6/35/09e6352a10d6300a41a85a83e2aadc3b.png',
    name: 'Thor',
    hp: 120,
    damage: 25,
    unlockLevel: 4,
  },
  {
    img: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/844c036c-553f-451d-9846-6743f2130541/ddzrzj1-463ef394-2d1a-45d3-a89f-669f80c95e27.jpg/v1/fill/w_1280,h_1280,q_75,strp/venom_pixel_art_by_megomagdy15_ddzrzj1-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiJcL2ZcLzg0NGMwMzZjLTU1M2YtNDUxZC05ODQ2LTY3NDNmMjEzMDU0MVwvZGR6cnpqMS00NjNlZjM5NC0yZDFhLTQ1ZDMtYTg5Zi02NjlmODBjOTVlMjcuanBnIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.7mVkzEtcMgIy8zgACW2T249-ZlB4Uq7eNSQaUQK7qTs',
    name: 'Venom',
    hp: 125,
    damage: 30,
    unlockLevel: 5,
  },
  {
    img: 'https://i.pinimg.com/originals/9b/dc/cf/9bdccf96831ca3631c61965b9e9d0661.png',
    name: 'Batman',
    hp: 130,
    damage: 35,
    unlockLevel: 6,
  },
  {
    img: 'https://th.bing.com/th/id/R.d46b1e42fd1d6dd6187de5c7c1daedde?rik=nzvntoEsdnpsfA&riu=http%3a%2f%2fpixelartmaker.com%2fart%2fde17950892c0026.png&ehk=j2G8du1eAur5%2f3VZdk44dK10wGEce0OkbFXce5FYEq4%3d&risl=&pid=ImgRaw&r=0',
    name: 'Deadpool',
    hp: 135,
    damage: 40,
    unlockLevel: 7,
  },
  {
    img: 'https://th.bing.com/th/id/R.1c9054fb80f4085a4cbfd105b5fdb9b0?rik=xzLi89OSWoWpGQ&riu=http%3a%2f%2fpixelartmaker-data-78746291193.nyc3.digitaloceanspaces.com%2fimage%2f412ff72a73cce56.png&ehk=6mQrNBl%2f91En8LdctgFBs59qqxsVJ%2fv%2f2qJQFl8SBBM%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1',
    name: 'Superman',
    hp: 140,  
    damage: 45,
    unlockLevel: 8,
  },
  {
    img: 'https://i.pinimg.com/originals/f6/6e/97/f66e97e68a5eb3d07969c04b46ac5ccb.jpg',
    name: 'Hulk',
    hp: 145,
    damage: 50,
    unlockLevel: 9,
  },
  {
    img: 'https://th.bing.com/th/id/R.46ce695c8172d3874bec4af77ac0dcf3?rik=jnd%2bc7l1MiEL3A&riu=http%3a%2f%2fpixelartmaker.com%2fart%2f2c0b95da82997ab.png&ehk=3vBZQn%2bBpXycD0IfWugTGnKSyqNNzGds0fxVOP7d3TQ%3d&risl=&pid=ImgRaw&r=0',
    name: 'Flash',
    hp: 150,
    damage: 55,
    unlockLevel: 10,
  },
  {
    img: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/4e7d01ce-8c31-45b6-904d-364d6b2602df/ddgjsed-ea846e4b-397f-4ec4-9778-f2875913cb8e.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzRlN2QwMWNlLThjMzEtNDViNi05MDRkLTM2NGQ2YjI2MDJkZlwvZGRnanNlZC1lYTg0NmU0Yi0zOTdmLTRlYzQtOTc3OC1mMjg3NTkxM2NiOGUucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.gw7oN87dJZzMBi50j0vjKWl_Oc93-_VyBhIIHbpcjKY',
    name: 'Thanos',
    hp: 155,
    damage: 60,
    unlockLevel: 11,
  },
  {
    img: 'https://th.bing.com/th/id/OIP.XcZTJLDSl-Xs6LmTq9Dm7QHaF3?rs=1&pid=ImgDetMain',
    name: 'Doktor Strange',
    hp: 160,
    damage: 65,
    unlockLevel: 12,
  },
];

const ACHIEVEMENTS: { icon: 'star' | 'trophy' | 'medal' | 'checkmark-done', label: string, check: (stats: ChildStats) => boolean }[] = [
  { icon: 'star', label: '5. Seviye', check: (stats: ChildStats) => stats.level >= 5 },
  { icon: 'trophy', label: '10. Seviye', check: (stats: ChildStats) => stats.level >= 10 },
  { icon: 'medal', label: '100 Altın', check: (stats: ChildStats) => stats.gold >= 100 },
  { icon: 'checkmark-done', label: '50 XP', check: (stats: ChildStats) => stats.xp >= 50 },
];

const BADGES = [
  { icon: 'hand-left', label: 'Yardımsever', color: '#4CAF50' },
  { icon: 'shield-checkmark', label: 'Sorumluluk', color: '#007AFF' },
  { icon: 'calendar', label: 'Düzenlilik', color: '#F7B731' },
];

export default function ProfileScreen() {
  const { childStats } = useTasks();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem('selectedAvatar').then(uri => {
      const idx = AVATARS.findIndex(a => a.img === uri);
      if (idx !== -1) setSelectedIndex(idx);
    });
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const handleSelectAvatar = async (idx: number, unlocked: boolean) => {
    if (!unlocked) return;
    setSelectedIndex(idx);
    await AsyncStorage.setItem('selectedAvatar', AVATARS[idx].img);
  };

  const selectedAvatar = AVATARS[selectedIndex];
  const unlockedIndices = AVATARS.map((a, i) => a.unlockLevel <= childStats.level ? i : -1).filter(i => i !== -1);

  return (
    <LinearGradient colors={["#f4f6fa", "#e9f0fb"]} style={{flex:1}}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.statsRowCard}>
            <Ionicons name="person-circle" size={32} color="#007AFF" style={{marginRight: 8}} />
            <Text style={styles.statsName}>Seviye {childStats.level}</Text>
          </View>
          <View style={styles.progressRow}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, {width: `${(childStats.xp/ (100 + (childStats.level-1)*10))*100}%`}]} />
            </View>
            <Text style={styles.statsValue}>{childStats.xp} XP</Text>
          </View>
          <View style={styles.progressRow}>
            <Ionicons name="logo-bitcoin" size={20} color="#F7B731" />
            <Text style={styles.statsValue}>{childStats.gold} Altın</Text>
          </View>
          <View style={styles.progressRow}>
            <Ionicons name="heart" size={20} color="#F44336" />
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFillRed, {width: `${(childStats.hp/childStats.maxHp)*100}%`}]} />
            </View>
            <Text style={styles.statsValue}>{childStats.hp}/{childStats.maxHp} HP</Text>
          </View>
        </View>
        <Text style={styles.title}>Profilini Özelleştir</Text>
        <View style={styles.selectedAvatarBox}>
          <Animated.Image
            source={{ uri: selectedAvatar.img }}
            style={[styles.selectedAvatarLarge, {
              shadowColor: '#FFD700',
              shadowRadius: Animated.add(32, Animated.multiply(16, glowAnim)),
              shadowOpacity: 0.95,
              shadowOffset: { width: 0, height: 0 },
              borderColor: '#FFD700',
              borderWidth: Animated.add(6, Animated.multiply(3, glowAnim)),
            }]}
          />
          <Text style={styles.selectedName}>{selectedAvatar.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="heart" size={22} color="#F44336" />
              <Text style={styles.statText}>{selectedAvatar.hp} HP</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="sword" size={22} color="#007AFF" />
              <Text style={styles.statText}>{selectedAvatar.damage} Hasar</Text>
            </View>
          </View>
        </View>
        <Text style={styles.subtitle}>Avatarını Seç (Seviye: {childStats.level})</Text>
        <View style={styles.avatarGrid}>
          {AVATARS.map((avatar, idx) => {
            const unlocked = childStats.level >= avatar.unlockLevel;
            const isSelected = selectedIndex === idx && unlocked;
            const shadowRadius = Animated.add(16, Animated.multiply(8, glowAnim));
            const borderWidth = Animated.add(3, Animated.multiply(2, glowAnim));
            const glow = isSelected
              ? {
                  shadowColor: '#FFD700',
                  shadowRadius,
                  shadowOpacity: 0.8,
                  shadowOffset: { width: 0, height: 0 },
                  borderColor: '#FFD700',
                  borderWidth,
                }
              : {};
            return (
              <TouchableOpacity key={avatar.img} onPress={() => handleSelectAvatar(idx, unlocked)} disabled={!unlocked}>
                <View style={styles.avatarBox}>
                  <Animated.Image
                    source={{ uri: avatar.img }}
                    style={[
                      styles.avatar,
                      isSelected && glow,
                      !unlocked && styles.lockedAvatar
                    ]}
                  />
                  {!unlocked && (
                    <View style={styles.lockOverlay}>
                      <Ionicons name="lock-closed" size={22} color="#888" />
                      <Text style={styles.lockText}>{avatar.unlockLevel}. Seviye</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.subtitle}>Başarılar</Text>
        <View style={styles.achievementsRow}>
          {ACHIEVEMENTS.map(a => (
            <View key={a.label} style={[styles.achievementBox, a.check(childStats) ? styles.achievementActive : styles.achievementInactive]}>
              <Ionicons name={a.icon} size={22} color={a.check(childStats) ? '#FFD700' : '#bbb'} />
              <Text style={styles.achievementLabel}>{a.label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.subtitle}>Kişisel Gelişim Rozetleri</Text>
        <View style={styles.badgesRow}>
          {BADGES.map(badge => (
            <View key={badge.label} style={styles.badgeBox}>
              <Ionicons name={badge.icon as any} size={28} color={badge.color} />
              <Text style={styles.badgeLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 20,
    paddingBottom: 40,
  },
  statsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'flex-start',
  },
  statsRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#e9e9e9',
    borderRadius: 6,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  progressBarFillRed: {
    height: 10,
    backgroundColor: '#F44336',
    borderRadius: 6,
  },
  statsValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'right',
  },
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  achievementBox: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 8,
    borderRadius: 10,
    minWidth: 70,
    backgroundColor: '#f8f8f8',
  },
  achievementActive: {
    borderColor: '#FFD700',
    borderWidth: 2,
    backgroundColor: '#fffbe6',
  },
  achievementInactive: {
    borderColor: '#eee',
    borderWidth: 1,
    backgroundColor: '#f8f8f8',
  },
  achievementLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectedAvatarBox: {
    alignItems: 'center',
    marginBottom: 18,
  },
  selectedAvatarLarge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFD700',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  selectedName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  statText: {
    fontSize: 16,
    marginLeft: 4,
    color: '#555',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 12,
    marginTop: 10,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatarBox: {
    position: 'relative',
    margin: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#fff',
  },
  lockedAvatar: {
    opacity: 0.3,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontWeight: 'bold',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  badgeBox: {
    alignItems: 'center',
    marginHorizontal: 14,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  badgeLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 