import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';


export default function First() {
  const router = useRouter();

 useEffect(() => {
    StatusBar.setBarStyle('dark-content');

    setTimeout(()=>{
        router.replace('/(tabs)/nowPlayingMovies')
    },3000)
  }, []);

  return (
    <View style={styles.container}>
     <Image
            source={require('../assets/icon.png')}
           style={{width:300, height:300}}
          />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171a21',
    justifyContent: 'center',
    alignItems: 'center',
  },
});