import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Friend {
  name: string;
  avatar: string;
  level: number;
  date: string;
}

interface FriendRequest {
  id: string;
  name: string;
  avatar: string;
  level: number;
  date: string;
}

interface WorldRanking {
  id: string;
  name: string;
  avatar: string;
  level: number;
  gold: number;
  xp: number;
  rank: number;
}

const AVATAR_LIST = [
  'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
  'https://cdn-icons-png.flaticon.com/512/921/921087.png',
  'https://cdn-icons-png.flaticon.com/512/236/236831.png',
  'https://cdn-icons-png.flaticon.com/512/1998/1998610.png',
  'https://cdn-icons-png.flaticon.com/512/2922/2922510.png',
  'https://cdn-icons-png.flaticon.com/512/616/616408.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140051.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140037.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140061.png',
];

const RANDOM_NAMES = [
  'Gülşah',
  'Atakan',
  'Ahmet',
  'Ayşe',
  'Mehmet',
  'Zeynep',
  'Ali',
  'Fatma',
  'Mustafa',
  'Elif',
  'Can',
  'Deniz',
  'Burak',
  'Ceren',
  'Emre',
  'Gizem',
  'Hakan',
  'İrem',
  'Kaan',
  'Leyla',
  'Murat',
  'Naz'
];

function getRandomAvatar() {
  return AVATAR_LIST[Math.floor(Math.random() * AVATAR_LIST.length)];
}

function getRandomLevel() {
  return Math.floor(Math.random() * 20) + 1;
}

function getRandomGold() {
  return Math.floor(Math.random() * 1000) + 100;
}

function getRandomXP() {
  const level = getRandomLevel();
  
  return level * 1000;
}

const FRIEND_BADGES = [
  { icon: 'star', label: '10+ Seviye', color: '#FFD700', check: (f: Friend) => f.level >= 10 },
];

const CONGRATS_MESSAGES = [
  'Tebrikler, harika gidiyorsun! 🎉',
  'Birlikte başarmak çok güzel!',
  'Seninle gurur duyuyorum!',
  'Takım çalışması süper!',
  'Dostluk kazanır!'
];

export default function FriendsScreen() {
  const [username, setUsername] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState<'friends' | 'requests' | 'ranking'>('friends');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [worldRanking, setWorldRanking] = useState<WorldRanking[]>([]);
  const [showFriendCongrats, setShowFriendCongrats] = useState(false);
  const [friendAnimIdx, setFriendAnimIdx] = useState<number|null>(null);
  const [congratsModalIdx, setCongratsModalIdx] = useState<number|null>(null);
  const [selectedCongrats, setSelectedCongrats] = useState<string|null>(null);
  const [sentCongrats, setSentCongrats] = useState<{[key:string]:string}>({});
  const [congratsAnimIdx, setCongratsAnimIdx] = useState<number|null>(null);

  useEffect(() => {
    const requests: FriendRequest[] = Array.from({ length: 3 }, (_, i) => ({
      id: `req_${i}`,
      name: RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)],
      avatar: getRandomAvatar(),
      level: getRandomLevel(),
      date: new Date().toLocaleDateString()
    }));
    setFriendRequests(requests);

    const rankings: WorldRanking[] = [
      {
        id: 'rank_1',
        name: 'Gülşah',
        avatar: getRandomAvatar(),
        level: 20,
        gold: 1000,
        xp: 20000,
        rank: 1
      },
      {
        id: 'rank_2',
        name: 'Atakan',
        avatar: getRandomAvatar(),
        level: 19,
        gold: 950,
        xp: 19000,
        rank: 2
      },
      ...Array.from({ length: 8 }, (_, i) => {
        const level = getRandomLevel();
        return {
          id: `rank_${i + 3}`,
          name: RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)],
          avatar: getRandomAvatar(),
          level: level,
          gold: getRandomGold(),
          xp: level * 1000,
          rank: i + 3
        };
      })
    ];
    setWorldRanking(rankings);
  }, []);

  const handleAddFriend = () => {
    if (!username.trim()) {
      setError('Kullanıcı adı boş olamaz!');
      return;
    }
    if (friends.some(f => f.name === username.trim())) {
      setError('Bu kullanıcı zaten eklendi!');
      return;
    }
    setFriends([
      ...friends,
      {
        name: username.trim(),
        avatar: getRandomAvatar(),
        level: getRandomLevel(),
        date: new Date().toLocaleDateString(),
      },
    ]);
    setUsername('');
    setError('');
    setShowFriendCongrats(true);
    setTimeout(() => setShowFriendCongrats(false), 1200);
  };

  const handleAcceptRequest = (request: FriendRequest) => {
    setFriends([
      ...friends,
      {
        name: request.name,
        avatar: request.avatar,
        level: request.level,
        date: new Date().toLocaleDateString(),
      },
    ]);
    setFriendRequests(friendRequests.filter(r => r.id !== request.id));
    setShowFriendCongrats(true);
    setTimeout(() => setShowFriendCongrats(false), 1200);
  };

  const handleRejectRequest = (requestId: string) => {
    setFriendRequests(friendRequests.filter(r => r.id !== requestId));
  };

  const handleSendCongrats = (idx: number, friendName: string) => {
    if (selectedCongrats) {
      setSentCongrats(prev => ({ ...prev, [friendName]: selectedCongrats }));
      setCongratsModalIdx(null);
      setCongratsAnimIdx(idx);
      setTimeout(() => {
        setSentCongrats(prev => ({ ...prev, [friendName]: '' }));
        setCongratsAnimIdx(null);
      }, 1800);
      setSelectedCongrats(null);
    }
  };

  const handleDeleteFriend = (friendName: string) => {
    setFriends(friends.filter(f => f.name !== friendName));
  };

  return (
    <LinearGradient
      colors={["#e9f0fb", "#f4f6fa"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ScrollView>
        {showFriendCongrats && (
          <View style={styles.friendCongratsBox}>
            <Ionicons name="happy" size={28} color="#4CAF50" style={{marginRight: 8}} />
            <Text style={styles.friendCongratsText}>Arkadaş eklendi! 🎉</Text>
          </View>
        )}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'friends' && styles.selectedTab]}
            onPress={() => setSelectedTab('friends')}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={selectedTab === 'friends' ? '#fff' : '#888'} 
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, selectedTab === 'friends' && styles.selectedTabText]}>Arkadaşlar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'requests' && styles.selectedTab]}
            onPress={() => setSelectedTab('requests')}
          >
            <Ionicons 
              name="person-add" 
              size={20} 
              color={selectedTab === 'requests' ? '#fff' : '#888'} 
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, selectedTab === 'requests' && styles.selectedTabText]}>İstekler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'ranking' && styles.selectedTab]}
            onPress={() => setSelectedTab('ranking')}
          >
            <Ionicons 
              name="globe" 
              size={20} 
              color={selectedTab === 'ranking' ? '#fff' : '#888'} 
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, selectedTab === 'ranking' && styles.selectedTabText]}>Sıralama</Text>
          </TouchableOpacity>
        </View>
        
        {selectedTab === 'friends' && (
          <View>
            <Text style={styles.title}>Arkadaşlar</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Kullanıcı adı ekle"
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddFriend}>
                <Ionicons name="person-add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.friendsGrid}>
              {friends.length === 0 && <Text style={styles.emptyText}>Henüz arkadaş eklenmedi.</Text>}
              {friends.map((friend, idx) => (
                <Animated.View
                  key={friend.name}
                  style={[styles.friendCard, friendAnimIdx === idx && { transform: [{ scale: 1.08 }] }]}
                  onTouchStart={() => setFriendAnimIdx(idx)}
                  onTouchEnd={() => setFriendAnimIdx(null)}
                >
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteFriend(friend.name)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                  <View style={styles.friendAvatarBox}>
                    <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                    {FRIEND_BADGES.map(badge => badge.check(friend) && (
                      <View key={badge.label} style={styles.friendBadge}>
                        <Ionicons name={badge.icon as any} size={16} color={badge.color} />
                      </View>
                    ))}
                  </View>
                  <Text style={styles.friendCardName}>{friend.name}</Text>
                  <View style={styles.friendLevelRow}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.friendLevelText}>Seviye {friend.level}</Text>
                  </View>
                  <Text style={styles.friendDate}>Eklendi: {friend.date}</Text>
                  <TouchableOpacity style={styles.friendBtn} disabled>
                    <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
                    <Text style={styles.friendBtnText}>Mesaj</Text>
                  </TouchableOpacity>
                  <Pressable style={styles.friendCongratsBtn} onPress={() => setCongratsModalIdx(idx)}>
                    <Ionicons name="gift" size={18} color="#fff" style={{marginRight: 4}} />
                    <Text style={styles.friendCongratsBtnText}>Tebrik Gönder</Text>
                  </Pressable>
                  {sentCongrats[friend.name] && (
                    <Animated.View style={[styles.friendCongratsMsgBox, congratsAnimIdx === idx && { opacity: 1, transform: [{ scale: 1.08 }] }] }>
                      <Ionicons name="happy" size={18} color="#4CAF50" style={{marginRight: 4}} />
                      <Text style={styles.friendCongratsMsgText}>{sentCongrats[friend.name]}</Text>
                    </Animated.View>
                  )}
                </Animated.View>
              ))}
            </View>
          </View>
        )}
        {selectedTab === 'requests' && (
          <View>
            <Text style={styles.title}>Arkadaş İstekleri</Text>
            <View style={styles.friendsGrid}>
              {friendRequests.length === 0 && <Text style={styles.emptyText}>Bekleyen arkadaş isteği yok.</Text>}
              {friendRequests.map((request) => (
                <View key={request.id} style={styles.friendCard}>
                  <View style={styles.friendAvatarBox}>
                    <Image source={{ uri: request.avatar }} style={styles.friendAvatar} />
                  </View>
                  <Text style={styles.friendCardName}>{request.name}</Text>
                  <View style={styles.friendLevelRow}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.friendLevelText}>Seviye {request.level}</Text>
                  </View>
                  <Text style={styles.friendDate}>İstek: {request.date}</Text>
                  <View style={styles.requestButtons}>
                    <TouchableOpacity 
                      style={[styles.requestBtn, styles.acceptBtn]} 
                      onPress={() => handleAcceptRequest(request)}
                    >
                      <Ionicons name="checkmark" size={18} color="#fff" />
                      <Text style={styles.requestBtnText}>Kabul Et</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.requestBtn, styles.rejectBtn]} 
                      onPress={() => handleRejectRequest(request.id)}
                    >
                      <Ionicons name="close" size={18} color="#fff" />
                      <Text style={styles.requestBtnText}>Reddet</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        {selectedTab === 'ranking' && (
          <View>
            <Text style={styles.title}>Dünya Sıralaması</Text>
            <View style={styles.rankingList}>
              {worldRanking.map((player) => (
                <View key={player.id} style={styles.rankingCard}>
                  <View style={styles.rankingHeader}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankNumber}>#{player.rank}</Text>
                    </View>
                    <Image source={{ uri: player.avatar }} style={styles.rankingAvatar} />
                    <Text style={styles.rankingName}>{player.name}</Text>
                  </View>
                  <View style={styles.rankingStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.statText}>Seviye {player.level}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="logo-bitcoin" size={16} color="#F7B731" />
                      <Text style={styles.statText}>{player.gold} Altın</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="trophy" size={16} color="#007AFF" />
                      <Text style={styles.statText}>{player.xp} XP</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {congratsModalIdx !== null && (
          <Modal visible transparent animationType="fade">
            <View style={styles.congratsModalOverlay}>
              <View style={styles.congratsModalBox}>
                <Text style={styles.congratsModalTitle}>Tebrik Mesajı Seç</Text>
                {CONGRATS_MESSAGES.map(msg => (
                  <Pressable
                    key={msg}
                    style={[styles.congratsOption, selectedCongrats === msg && styles.congratsOptionSelected]}
                    onPress={() => setSelectedCongrats(msg)}
                  >
                    <Text style={styles.congratsOptionText}>{msg}</Text>
                  </Pressable>
                ))}
                <Pressable
                  style={[styles.congratsSendBtn, !selectedCongrats && { opacity: 0.5 }]}
                  onPress={() => congratsModalIdx !== null && selectedCongrats && handleSendCongrats(congratsModalIdx, friends[congratsModalIdx].name)}
                  disabled={!selectedCongrats}
                >
                  <Text style={styles.congratsSendBtnText}>Gönder</Text>
                </Pressable>
                <Pressable style={styles.congratsCloseBtn} onPress={() => setCongratsModalIdx(null)}>
                  <Text style={styles.congratsCloseBtnText}>Kapat</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const CARD_WIDTH = (Dimensions.get('window').width - 60) / 2.2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'column',
  },
  selectedTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  selectedTabText: {
    color: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  addBtn: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#F44336',
    marginBottom: 8,
    marginLeft: 5,
  },
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 24,
  },
  friendCard: {
    width: CARD_WIDTH,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 14,
    margin: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  friendAvatarBox: {
    position: 'relative',
    marginBottom: 8,
  },
  friendAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  friendBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  friendCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  friendLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  friendLevelText: {
    fontSize: 13,
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  friendDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  friendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  friendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 5,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
  },
  friendCongratsBox: {
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
  friendCongratsText: {
    fontSize: 16,
    color: '#388e3c',
    fontWeight: 'bold',
  },
  friendCongratsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 6,
    marginTop: 2,
    alignSelf: 'center',
  },
  friendCongratsBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  friendCongratsMsgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#e6ffe6',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 6,
    marginTop: 2,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  friendCongratsMsgText: {
    fontSize: 13,
    color: '#388e3c',
    fontWeight: 'bold',
  },
  congratsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratsModalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 320,
    alignItems: 'center',
    elevation: 5,
  },
  congratsModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#2C3E50',
    textAlign: 'center',
  },
  congratsOption: {
    width: '100%',
    backgroundColor: '#f4f6fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9e9e9',
  },
  congratsOptionSelected: {
    backgroundColor: '#e6ffe6',
    borderColor: '#4CAF50',
  },
  congratsOptionText: {
    fontSize: 15,
    color: '#333',
  },
  congratsSendBtn: {
    marginTop: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  congratsSendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  congratsCloseBtn: {
    marginTop: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  congratsCloseBtnText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  requestButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  acceptBtn: {
    backgroundColor: '#4CAF50',
  },
  rejectBtn: {
    backgroundColor: '#F44336',
  },
  requestBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },
  rankingList: {
    padding: 8,
  },
  rankingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  rankNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rankingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  rankingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  rankingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  tabIcon: {
    marginBottom: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 4,
  },
}); 