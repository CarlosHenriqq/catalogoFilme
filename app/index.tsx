import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';


export default function First() {
  const router = useRouter();

 useEffect(() => {
    StatusBar.setBarStyle('dark-content');

    setTimeout(()=>{
        router.replace('/(tabs)')
    },3000)
  }, []);

  return (
    <View style={styles.container}>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0E8F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});