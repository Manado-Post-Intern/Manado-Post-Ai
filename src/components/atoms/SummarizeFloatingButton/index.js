import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView, // Import ScrollView
} from 'react-native';
import {
  IcSummarizeSpark,
  IcPopUpExit,
  IcPopUpPlay,
  IcSumStop,
} from '../../../assets';
import axios from 'axios';
import Tts from 'react-native-tts';
import Config from 'react-native-config';

const openAI = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${Config.OPENAI_API}`,
  },
});

const SummarizeFloatingButton = ({title, article}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
    Tts.stop();
    setIsPlaying(false);
  };

  useEffect(() => {
    Tts.addEventListener('tts-start', () => {
      // setIsPlaying(true);
      console.log('tts sedang start');
    });
    Tts.addEventListener('tts-finish', () => {
      setIsPlaying(false);
      console.log('tts telah selesai diputar');
    });
    Tts.addEventListener('tts-cancel', () => {
      setIsPlaying(false);
      console.log('mengcancel tts button');
    });
    return () => {
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-cancel');
    };
  }, [isPlaying]);

  const togglePlayPause = () => {
    Tts.setDefaultLanguage('id-ID');
    if (isPlaying) {
      Tts.stop();
      setIsPlaying(false);
      console.log('tts stop');
    } else {
      if (summary) {
        Tts.stop();
        Tts.speak(summary);
        setIsPlaying(true);
        console.log('tts speak');
      }
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const cleanArticle = article
        .replace(/<\/?[^>]+(>|$)/g, '')
        .toLowerCase()
        .replace(/manadopost\.id/gi, '')
        .replace(/[^a-zA-Z0-9.,!? /\\]/g, '')
        .replace(/(\r\n|\n|\r)/g, '');

      const prompt = `Dari berita ini buatlah menjadi beberapa point-point penting serta ringkaskan dan berikan bullet point pada setiap point berita jangan memakai - pada setiap isi point berita"${cleanArticle}"`;

      const response = await openAI.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{role: 'user', content: prompt}],
        max_tokens: 500,
      });

      const content = response.data.choices[0].message.content;
      const filtering = content.replace(/-/g, '•');
      setSummary(filtering); // Set hasil summary
      console.log(`summary, ${response.data.choices[0].message.content}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = () => {
    fetchSummary();
    toggleModal();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.floatingButton} onPress={handleSummarize}>
        <IcSummarizeSpark name="Spark" />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={toggleModal}>
        <View style={styles.Overlay}>
          <View style={styles.Content}>
            <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
              <IcPopUpExit name="close" />
            </TouchableOpacity>

            <Text style={styles.titleText}>{title}</Text>

            <ScrollView style={styles.Description}>
              {loading ? ( // Show loading indicator if loading is true
                <ActivityIndicator size="large" color="#005AAC" />
              ) : (
                <Text style={styles.bulletPoint}>{summary}</Text> // Show summary once loaded
              )}
            </ScrollView>

            {/* Tombol Play/Pause */}
            <TouchableOpacity
              onPress={togglePlayPause}
              style={styles.playPauseButton}>
              {isPlaying ? <IcSumStop size={24} /> : <IcPopUpPlay size={24} />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 30,
  },
  floatingButton: {
    backgroundColor: '#005AAC',
    borderRadius: 50,
    padding: 15,
    elevation: 10,
    shadowColor: '#0B7DE5',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 3.84,
  },
  Overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  Content: {
    width: '85%',
    height: '90%', // Set height for scrolling
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    alignItems: 'flex-start',
    position: 'relative',
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingTop: 30,
    color: '#000000',
    paddingLeft: 10,
  },
  Description: {
    marginBottom: 20,
    paddingLeft: 20,
  },
  bulletPoint: {
    fontSize: 14,
    marginBottom: 5,
    color: 'black',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  playPauseButton: {
    alignSelf: 'center',
    borderRadius: 50,
  },
});

export default SummarizeFloatingButton;
