/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useContext} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
  Modal,
  Text,
} from 'react-native';
import {IcTtsPlay, IcTtsStop} from '../../../assets';
import Tts from 'react-native-tts';
import {useSnackbar} from '../../../context/SnackbarContext';
import NetInfo from '@react-native-community/netinfo';
import {useErrorNotification} from '../../../context/ErrorNotificationContext';
import {useDispatch, useSelector} from 'react-redux';
import {
  setPlaying,
  setLoading,
  resetAllTtsExcept,
} from '../../../redux/ttsSlice';
import {AuthContext} from '../../../context/AuthContext';
import {useNavigation} from '@react-navigation/native';

const TTSButton = ({id, isActive, onPress, content}) => {
  const [isConnected, setIsConnected] = useState(true);
  const dispatch = useDispatch();
  const isPlaying = useSelector(state => state.tts.isPlayingMap[id] || false); // Get playing state for the specific button
  const isLoading = useSelector(state => state.tts.isLoadingMap[id] || false); // Get loading state for the specific button
  const [ttsReady, setTtsReady] = useState(false); // State to check if TTS is initialized
  const {hideSnackbar, setCleanArticle, visible, setId} = useSnackbar(); // Menggunakan fungsi showSnackbar dari context
  const {showError} = useErrorNotification();
  const {mpUser} = useContext(AuthContext);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (visible) {
    } else {
      dispatch(setPlaying({id, value: false}));
    }
  }, [visible]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected && isPlaying) {
        Tts.stop();
        showError('Koneksi internet terputus, fitur TTS dihentikan.');
      }
    });
    return () => unsubscribe();
  }, [isPlaying]);

  useEffect(() => {
    Tts.getInitStatus()
      .then(() => {
        console.log('TTS initialized successfully.');
      })
      .catch(err => {
        console.error('Error initializing TTS:', err.message);
        if (err.code === 'no_engine') {
          console.warn('No TTS engine found. Requesting installation.');
          Tts.requestInstallEngine(); // Meminta pengguna menginstal engine TTS
          showError(
            'Tidak ada engine TTS yang ditemukan. Silakan instal untuk melanjutkan.',
          );
        } else {
          showError('Error inisialisasi TTS. Silakan coba lagi.');
        }
      });

  }, []);

  useEffect(() => {
    Tts.addEventListener('tts-start', () => {
      dispatch(setLoading({id, value: false}));
      dispatch(setPlaying({id, value: true}));
      console.log('tts sedang start');
    });
    Tts.addEventListener('tts-finish', () => {
      dispatch(setPlaying({id, value: false}));
      console.log('tts telah selesai diputar');
    });
    Tts.addEventListener('tts-cancel', () => {
      dispatch(setPlaying({id, value: false}));
      dispatch(setLoading({id, value: false}));
      console.log('mengcancel tts button');
    });
    return () => {
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-cancel');
    };
  }, [isPlaying]);

  const handlePress = async () => {
    if (!isConnected) {
      console.error('No internet connection.');
      showError('Oops! Sepertinya kamu tidak terhubung ke internet.');
      return;
    }

    dispatch(resetAllTtsExcept(id));
    console.log('reset id');

    if (isPlaying) {
      Tts.stop();
      hideSnackbar();
      return;
    }

    if (content) {
      const cleanContent = content
        .replace(/<\/?[^>]+(>|$)/g, '')
        .toLowerCase()
        .replace(/manadopost\.id/gi, '')
        .replace(/[^a-zA-Z0-9.,!? /\\]/g, '')
        .replace(/(\r\n|\n|\r)/g, '');

      setId(id);
      setCleanArticle(cleanContent);
      Tts.setDefaultLanguage('id-ID');

      // Set loading state for the new TTS
      dispatch(setLoading({id, value: true}));
      console.log('set loading true');

      try {
        await Tts.stop();
        Tts.speak(cleanContent);
        dispatch(setPlaying({id, value: true}));
        console.log('try button tts');
      } catch (error) {
        console.error('Error during TTS:', error);
      } finally {
        dispatch(setLoading({id, value: true}));
        console.log('finally button tts');
      }
      dispatch(setPlaying({id, value: !isPlaying}));
    }
    onPress?.();
  };

  const handleTtsButton = () => {
    if (mpUser?.subscription?.isExpired) {
      hideSnackbar();
      Tts.stop();
      setShowSubscriptionModal(true);
    } else {
      handlePress();
    }
  };

  return (
    <View style={styles.container}>

      <Modal
        transparent={true}
        visible={showSubscriptionModal}
        animationType="fade"
        onRequestClose={() => setShowSubscriptionModal(false)}>
        <View style={styles.subscriptionOverlay}>
          <View style={styles.subscriptionContent}>
            <Text style={{color: 'black', textAlign: 'center'}}>
              Anda perlu berlangganan MP Digital Premium untuk menggunakan fitur
              ini
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Subscription')}
              style={styles.subscribeButton}>
              <Text style={{color: 'white'}}>Berlangganan Sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={handleTtsButton}
        style={styles.button}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : isPlaying ? (
          <IcTtsStop width={24} height={24} />
        ) : (
          <IcTtsPlay width={24} height={24} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  subscriptionOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  },
  subscriptionContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  subscribeButton: {
    backgroundColor: '#005AAC',
    padding: 10,
    marginTop: 15,
    borderRadius: 5,
  },
});

export default TTSButton;
