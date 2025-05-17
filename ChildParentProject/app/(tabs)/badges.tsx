import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

const BADGES = [
  {
    id: 1,
    name: 'Yardımsever',
    description: 'Aile bireylerine ve arkadaşlarına yardım etme',
    icon: 'heart' as IconName,
    color: '#FF5252',
    gradient: ['#FF5252', '#FF1744'] as const,
    requirements: [
      '5 gün boyunca aileye yardım et',
      '3 arkadaşına yardım et',
      '1 hafta boyunca her gün iyilik yap',
    ],
  },
  {
    id: 2,
    name: 'Sorumluluk',
    description: 'Görevlerini zamanında yapması',
    icon: 'checkmark-circle' as IconName,
    color: '#4CAF50',
    gradient: ['#4CAF50', '#2E7D32'] as const,
    requirements: [
      '1 hafta boyunca tüm görevleri zamanında tamamla',
      '3 gün üst üste odanı düzenli tut',
      '5 gün üst üste ödevlerini zamanında bitir',
    ],
  },
  {
    id: 3,
    name: 'Düzenlilik',
    description: 'Kişisel alanını düzenli tutma',
    icon: 'grid' as IconName,
    color: '#2196F3',
    gradient: ['#2196F3', '#1976D2'] as const,
    requirements: [
      '1 hafta boyunca odanı düzenli tut',
      '3 gün üst üste çalışma masanı topla',
      '5 gün üst üste eşyalarını yerine koy',
    ],
  },
  {
    id: 4,
    name: 'Öğrenme İsteği',
    description: 'Yeni şeyler öğrenmeye istekli olma',
    icon: 'book' as IconName,
    color: '#FF9800',
    gradient: ['#FF9800', '#F57C00'] as const,
    requirements: [
      'Her gün 30 dakika kitap oku',
      '3 yeni kelime öğren',
      '1 konu hakkında araştırma yap',
    ],
  },
  {
    id: 5,
    name: 'Sporcu',
    description: 'Düzenli spor yapma',
    icon: 'fitness' as IconName,
    color: '#9C27B0',
    gradient: ['#9C27B0', '#7B1FA2'] as const,
    requirements: [
      'Haftada 3 gün spor yap',
      '1 ay boyunca düzenli egzersiz yap',
      'Yeni bir spor aktivitesi dene',
    ],
  },
];

export default function BadgesScreen() {
  const [selectedBadge, setSelectedBadge] = useState<number | null>(null);
  const [animValue] = useState(new Animated.Value(0));

  const handleBadgePress = (id: number) => {
    setSelectedBadge(id);
    Animated.spring(animValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseDetails = () => {
    Animated.spring(animValue, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      setSelectedBadge(null);
    });
  };

  return (
    <LinearGradient colors={["#f4f6fa", "#e9f0fb"]} style={{flex:1}}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Kişisel Gelişim Rozetleri</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map(badge => (
            <TouchableOpacity
              key={badge.id}
              style={styles.badgeCard}
              onPress={() => handleBadgePress(badge.id)}
            >
              <LinearGradient
                colors={badge.gradient}
                style={styles.badgeIconContainer}
              >
                <Ionicons name={badge.icon} size={32} color="#fff" />
              </LinearGradient>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeDescription}>{badge.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedBadge !== null && (
          <Animated.View
            style={[
              styles.detailsModal,
              {
                transform: [{ scale: animValue }],
                opacity: animValue,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseDetails}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            <LinearGradient
              colors={BADGES[selectedBadge - 1].gradient}
              style={styles.detailsIconContainer}
            >
              <Ionicons
                name={BADGES[selectedBadge - 1].icon}
                size={48}
                color="#fff"
              />
            </LinearGradient>

            <Text style={styles.detailsTitle}>
              {BADGES[selectedBadge - 1].name}
            </Text>
            <Text style={styles.detailsDescription}>
              {BADGES[selectedBadge - 1].description}
            </Text>

            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Gereksinimler:</Text>
              {BADGES[selectedBadge - 1].requirements.map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.requirementText}>{req}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 24,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  detailsModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  detailsIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  detailsDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  requirementsContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
}); 