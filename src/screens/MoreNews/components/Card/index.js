import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {IMGDummyNews, theme} from '../../../../assets';
import {
  Actions,
  CategoryHorizontal,
  Gap,
  TextInter,
  TimeStamp,
} from '../../../../components';
import {useNavigation} from '@react-navigation/native';
import TTSButton from '../../../../components/atoms/TtsButton';

const Card = ({item, isActive, onPress}) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.container}
      onPress={() => navigation.push('Article', {articleId: item?.id})}>
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{uri: item?.photo_url}} />
      </View>
      <Gap width={14} />
      <View style={styles.informationContainer}>
        <TextInter style={styles.title} numberOfLines={2}>
          {item?.title}
        </TextInter>
        <TextInter style={styles.description} numberOfLines={3}>
          {item?.description}
        </TextInter>
        <Gap height={8} />
        <View style={styles.wrapperButton}>
          <TimeStamp data={item?.published_date} />
          <View style={styles.TtsButton}>
            <TTSButton isActive={isActive} onPress={onPress} />
          </View>
        </View>
        <Gap height={4} />
        <CategoryHorizontal />
        <Gap height={4} />
        <Actions />
      </View>
    </TouchableOpacity>
  );
};

export default Card;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 21,
    backgroundColor: theme.colors.white,
    marginVertical: 8,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  image: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
    flex: 1,
    borderRadius: 10,
  },
  informationContainer: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontFamily: theme.fonts.inter.semiBold,
    fontSize: 14,
    color: theme.colors.dark1,
  },
  description: {
    fontFamily: theme.fonts.inter.regular,
    fontSize: 12,
    color: theme.colors.grey1,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categories: {
    marginHorizontal: 8,
    marginVertical: 5,
    fontFamily: theme.fonts.inter.semiBold,
    fontSize: 10,
    color: theme.colors.grey1,
  },
  TtsButton: {
    right: '50%',
  },
  wrapperButton: {
    flexDirection: 'row',
  },
});
