/* eslint-disable prettier/prettier */
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {theme} from '../../assets';
import {AiChatButton, Banner1, Gap} from '../../components';
import {TrendingSection} from './components';
import {screenHeightPercentage} from '../../utils';
import {loadSession, popular} from '../../api';
import axios from 'axios';

const Trending = ({navigation}) => {
  const [token, setToken] = useState(null);
  const [trending, setTrending] = useState(null);

  const getTrending = async () => {
    try {
      const response = await axios.get(popular, {
        headers: {
          Accept: 'application/vnd.promedia+json; version=1.0',
          Authorization: `Bearer ${token}`,
        },
      });
      setTrending(response.data.data.list);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTrending();
  }, [token]);

  useEffect(() => {
    loadSession()
      .then(session => {
        if (session) {
          setToken(session.access_token);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }, []);
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView style={styles.container}>
        <Gap height={40} />

        <Banner1 />

        <Gap height={18} />

        <TrendingSection item={trending} />

        <Gap height={screenHeightPercentage('11%')} />
      </ScrollView>
      <View style={styles.wrapAiChatBtn}>
        <AiChatButton navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default Trending;

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    zIndex: 0,
    flex: 1,
    backgroundColor: theme.colors.white2,
    top: -20,
  },
  wrapAiChatBtn: {
    position: 'absolute', // Mengatur tombol di posisi tetap
    bottom: 55, // Jarak dari bawah layar
    right: 2, // Jarak dari kanan layar
    alignItems: 'center', // Pusatkan horizontal di dalam View
    justifyContent: 'center', // Pusatkan vertikal di dalam View
    width: 60, // Lebar tombol yang diinginkan
    height: 60, // Tinggi tombol yang diinginkan
  },
});
