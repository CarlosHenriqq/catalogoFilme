import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Text, TextInput, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');
const BASE_WIDTH = 390;
const scale = width / BASE_WIDTH;
const scaled = (size: number) => size * scale;

interface HeaderProfileProps {
  title: string;
  onSearch?: (text: string) => void;
}

export default function Header({ title, onSearch }: HeaderProfileProps) {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (searchVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchVisible]);

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: '#171a21',

        height: scaled(70),
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: scaled(2) },
        shadowOpacity: 0.4,
        shadowRadius: scaled(2),
        elevation: 3,
        justifyContent: 'space-between',
        flexDirection: "row",
        alignItems: 'center',
        paddingHorizontal: scaled(10)
      }}
    >
      <Image
        source={require('../assets/icon.png')}
        style={{ width: 50, height: 50, borderRadius: scaled(10), marginTop: '5%' }}
      />

      {searchVisible ? (
        <>
          <TextInput
            ref={inputRef}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              if (onSearch) onSearch(text);
            }}
            placeholder="Pesquisar..."
            placeholderTextColor="#999"
            style={{
              height: scaled(30),
              backgroundColor: '#2a2d36',
              borderRadius: scaled(10),
              paddingHorizontal: scaled(10),
              marginRight: '3%',
              paddingVertical: 0,
              textAlignVertical: 'center',
              color: '#fff',
              marginTop: '5%',
              width: '80%',
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setSearchVisible(false);
              setSearchText('');
              if (onSearch) onSearch('')
            }}
            style={{
              position: 'absolute',
              right: scaled(25),
              top: scaled(35),
              justifyContent: 'center',
              alignItems: 'center',
              height: scaled(20),
              width: scaled(20),
            }}
          >
            <MaterialCommunityIcons name="close" color={'#25e3bc'} size={20} />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={{ position: 'absolute', left: '18%', top: '50%', color: '#ffffff', fontWeight: 'bold' }}>Filmes{title}</Text>

          <TouchableOpacity onPress={() => setSearchVisible(true)} style={{ marginTop: '5%', marginRight: '3%' }}>
            <MaterialCommunityIcons name="magnify" color={'#25e3bc'} size={20} />
          </TouchableOpacity>
        </>
      )}


    </View>
  );
}
