import { Dimensions, Text, View } from "react-native";

const { width } = Dimensions.get('window');
const BASE_WIDTH = 390;
const scale = width / BASE_WIDTH;
const scaled = (size: number) => size * scale;

export default function Header() {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex:10,
        backgroundColor: '#25e3bc',
        borderBottomRightRadius: scaled(30),
        borderBottomLeftRadius: scaled(30),
        height: scaled(160),
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: scaled(2) },
        shadowOpacity: 0.4,
        shadowRadius: scaled(2),
        elevation: 3,
      }}
       
    >
      <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign:'center', position:'absolute', top:'50%', left:'30%' }}>
    Filmes em Cartaz
  </Text>
  </View>
  );
}
