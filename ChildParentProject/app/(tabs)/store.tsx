import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTasks } from '../context/TaskContext';

interface Reward {
  id: string;
  name: string;
  cost: number;
  type: 'gold' | 'xp';
}

interface ChildStats {
  gold: number;
  xp: number;
}

export default function StoreScreen() {
  const { rewards, childStats, buyReward, addReward } = useTasks();
  const [message, setMessage] = useState('');
  // Reward add state
  const [rewardName, setRewardName] = useState('');
  const [rewardCost, setRewardCost] = useState('');
  const [rewardType, setRewardType] = useState<'gold' | 'xp'>('gold');
  const [rewardError, setRewardError] = useState('');

  const handleBuy = (id: string, cost: number, type: 'gold' | 'xp') => {
    const success = buyReward(id);
    if (success) {
      setMessage('Ödül başarıyla alındı!');
      setTimeout(() => setMessage(''), 2000);
    } else {
      setMessage(type === 'gold' ? 'Yeterli altın yok!' : 'Yeterli XP yok!');
      setTimeout(() => setMessage(''), 2000);
    }
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

  return (
    <LinearGradient 
      colors={["#e9f0fb", "#f4f6fa"]} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={styles.container}>
        {/* Kullanıcı Bilgisi */}
        <View style={styles.userInfoBox}>
          <Ionicons name="logo-bitcoin" size={22} color="#FFD700" style={{marginRight: 4}} />
          <Text style={styles.userInfoText}>{childStats.gold} Altın</Text>
          <Ionicons name="star" size={22} color="#007AFF" style={{marginLeft: 12, marginRight: 4}} />
          <Text style={styles.userInfoText}>{childStats.xp} XP</Text>
        </View>
        <View style={styles.titleRow}>
          <Ionicons name="gift" size={26} color="#F7B731" style={{marginRight: 8}} />
          <Text style={styles.title}>Mağaza</Text>
        </View>
        {message ? (
          <View style={styles.buyMessageBox}>
            <Ionicons name="checkmark-circle" size={22} color="#4CAF50" style={{marginRight: 6}} />
            <Text style={styles.message}>{message}</Text>
          </View>
        ) : null}
        {rewards.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="pricetag" size={48} color="#b0c4de" style={{marginBottom: 8}} />
            <Text style={styles.emptyText}>Henüz ödül eklenmedi.</Text>
          </View>
        ) : (
          <FlatList
            data={rewards}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const enough = item.type === 'gold' ? childStats.gold >= item.cost : childStats.xp >= item.cost;
              return (
                <View style={styles.rewardItem}>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardName}>{item.name}</Text>
                    <View style={styles.rewardCostBox}>
                      <Ionicons name={item.type === 'gold' ? 'logo-bitcoin' : 'star'} size={18} color={item.type === 'gold' ? '#FFD700' : '#007AFF'} />
                      <Text style={styles.rewardCost}>{item.cost} {item.type === 'gold' ? 'Altın' : 'XP'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.buyButton, !enough && styles.buyButtonDisabled]}
                    onPress={() => handleBuy(item.id, item.cost, item.type)}
                    disabled={!enough}
                  >
                    <Text style={styles.buyButtonText}>{enough ? 'Satın Al' : 'Yetersiz'}</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
  },
  userInfoBox: {
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
  userInfoText: {
    fontSize: 15,
    color: '#b08d00',
    fontWeight: 'bold',
    marginRight: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buyMessageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6ffe6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#4CAF50',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  message: {
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
    padding: 24,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    shadowColor: '#b0c4de',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#b0c4de',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rewardCostBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardCost: {
    fontSize: 15,
    marginLeft: 6,
    color: '#888',
  },
  buyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  buyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 