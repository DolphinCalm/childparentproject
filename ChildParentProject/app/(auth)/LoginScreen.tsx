import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isInfoConfirmed, setIsInfoConfirmed] = useState(false);
  const [showKVKK, setShowKVKK] = useState(false);
  const router = useRouter();

  const formatBirthDate = (text: string) => {
    // Sadece sayıları al
    const numbers = text.replace(/[^\d]/g, '');
    
    // GG/AA/YYYY formatına dönüştür
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.slice(0, 2);
      if (numbers.length > 2) {
        formatted += '/' + numbers.slice(2, 4);
        if (numbers.length > 4) {
          formatted += '/' + numbers.slice(4, 8);
        }
      }
    }
    return formatted;
  };

  const handleBirthDateChange = (text: string) => {
    const formatted = formatBirthDate(text);
    setBirthDate(formatted);
  };

  const handleAuth = async () => {
    setError('');
    setLoading(true);
    if (!email.trim() || !password.trim() || (!isLogin && !birthDate.trim())) {
      setError('Tüm alanları doldurun!');
      setLoading(false);
      return;
    }
    if (!isLogin && !isAgreed) {
      setError('Sözleşmeyi onaylamanız gerekiyor!');
      setLoading(false);
      return;
    }
    if (!isLogin && !isInfoConfirmed) {
      setError('Bilgilerinizin doğruluğunu onaylamanız gerekiyor!');
      setLoading(false);
      return;
    }
    if (!email.includes('@')) {
      setError('Geçerli bir e-posta girin!');
      setLoading(false);
      return;
    }
    if (password.length < 4) {
      setError('Şifre en az 4 karakter olmalı!');
      setLoading(false);
      return;
    }
    if (!isLogin) {
      // Register
      const user = { email, password, birthDate };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setIsLogin(true);
      setError('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      setLoading(false);
      return;
    } else {
      // Login
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        setError('Kayıtlı kullanıcı bulunamadı!');
        setLoading(false);
        return;
      }
      const user = JSON.parse(userStr);
      if (user.email === email && user.password === password) {
        setLoading(false);
        router.replace('/child');
      } else {
        setError('E-posta veya şifre yanlış!');
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/login.jpg')}
        style={styles.loginImage}
        resizeMode="contain"
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
        <TextInput
          style={styles.input}
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {!isLogin && (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color="#9e9e9e" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="GG/AA/YYYY"
                value={birthDate}
                onChangeText={handleBirthDateChange}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>
            <View style={styles.agreementContainer}>
              <TouchableOpacity 
                style={styles.checkbox} 
                onPress={() => setIsAgreed(!isAgreed)}
              >
                {isAgreed && <Ionicons name="checkmark" size={20} color="#4a6fa5" />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsAgreed(!isAgreed)}>
                <Text style={styles.agreementText}>
                  <Text style={styles.agreementLink} onPress={() => setShowKVKK(true)}>Kullanım sözleşmesini</Text> okudum ve onaylıyorum
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.agreementContainer}>
              <TouchableOpacity 
                style={styles.checkbox} 
                onPress={() => setIsInfoConfirmed(!isInfoConfirmed)}
              >
                {isInfoConfirmed && <Ionicons name="checkmark" size={20} color="#4a6fa5" />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsInfoConfirmed(!isInfoConfirmed)}>
                <Text style={styles.agreementText}>
                  Verdiğim bilgilerin doğru olduğunu teyit ederim
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity 
          style={[
            styles.button, 
            !isLogin && (!isAgreed || !isInfoConfirmed) && styles.buttonDisabled
          ]} 
          onPress={handleAuth} 
          disabled={loading || (!isLogin && (!isAgreed || !isInfoConfirmed))}
        >
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(''); }}>
          <Text style={styles.switchText}>
            {isLogin ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showKVKK}
        transparent
        animationType="slide"
        onRequestClose={() => setShowKVKK(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>KVKK Aydınlatma Metni</Text>
              <TouchableOpacity onPress={() => setShowKVKK(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.kvkkText}>
                Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, uygulamamızı kullanırken kişisel verilerinizin işlenmesi hakkında sizi bilgilendirmek isteriz.

                {"\n\n"}1. Veri Sorumlusu{"\n"}
                Uygulamamız, kişisel verilerinizi veri sorumlusu olarak işlemektedir.

                {"\n\n"}2. İşlenen Kişisel Veriler{"\n"}
                • E-posta adresi{"\n"}
                • Doğum tarihi{"\n"}
                • Şifre (şifrelenmiş olarak)

                {"\n\n"}3. Kişisel Verilerin İşlenme Amaçları{"\n"}
                • Hesap oluşturma ve yönetimi{"\n"}
                • Uygulama içi özelliklerin sunulması{"\n"}
                • Güvenlik ve doğrulama işlemleri

                {"\n\n"}4. Kişisel Verilerin Aktarılması{"\n"}
                Kişisel verileriniz, yasal zorunluluklar dışında üçüncü kişilerle paylaşılmamaktadır.

                {"\n\n"}5. Kişisel Veri Sahibinin Hakları{"\n"}
                KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:
                • Kişisel verilerinizin işlenip işlenmediğini öğrenme{"\n"}
                • Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme{"\n"}
                • Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme{"\n"}
                • Kişisel verilerinizin düzeltilmesini veya silinmesini isteme

                {"\n\n"}6. Veri Güvenliği{"\n"}
                Kişisel verilerinizin güvenliği için gerekli teknik ve idari tedbirler alınmaktadır.

                {"\n\n"}7. İletişim{"\n"}
                KVKK kapsamındaki haklarınızı kullanmak için uygulama üzerinden bizimle iletişime geçebilirsiniz.
              </Text>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setShowKVKK(false);
                  setIsAgreed(true);
                }}
              >
                <Text style={styles.modalButtonText}>Kabul Ediyorum</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loginImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  formContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#4a6fa5',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#4a6fa5',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  error: {
    color: '#e57373',
    marginBottom: 8,
    textAlign: 'center',
  },
  switchText: {
    color: '#4a6fa5',
    marginTop: 10,
    fontSize: 15,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#ffffff',
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
    color: '#9e9e9e',
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4a6fa5',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agreementText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  agreementLink: {
    color: '#4a6fa5',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a6fa5',
  },
  modalBody: {
    flex: 1,
  },
  kvkkText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  modalFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    backgroundColor: '#4a6fa5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 