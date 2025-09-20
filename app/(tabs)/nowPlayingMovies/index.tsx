import { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getMoviePoster } from "../../services/api";
import Header from "../../../components/Header";
import { FontAwesome } from '@expo/vector-icons';

export default function PlayingMovies() {
    const { width } = Dimensions.get('window');
    const BASE_WIDTH = 390;
    const scale = width / BASE_WIDTH;
    const scaled = (size: number) => size * scale;

    const [movies, setMovies] = useState([])

    useEffect(() => {
        (async () => {
            const data = await getMoviePoster();
            setMovies(data);
        })();
    }, [])

    function StarRating({ vote_average }: { vote_average: number }) {
        const stars = Math.round(vote_average / 2); // 0-5 estrelas
        return (
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                {[...Array(5)].map((_, i) => (
                    <FontAwesome
                        key={i}
                        name={i < stars ? 'star' : 'star-o'}
                        size={16}
                        color="#FFD700"
                        style={{ marginRight: 2 }}
                    />
                ))}
            </View>
        );
    }

    return (

        <View style={styles.container}>
            <Header />
            <View style={{ marginTop: scaled(190), alignItems: 'center' }}>
                <TextInput
                    placeholder="Buscar Filmes"
                    placeholderTextColor={'#ffffff'}

                    style={{
                        borderColor: '#25e3bc',
                        borderWidth: 2,
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 20,
                        backgroundColor: '#25e3bc',
                        alignItems: 'center',
                        width: '90%',
                        fontWeight: 'bold'
                    }} />
            </View>
            <FlatList
                data={movies}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ paddingTop: 20 }}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', margin: 10 }}>
                        {/* Imagem */}
                        <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                            style={{ width: 150, height: 220, borderRadius: 10 }}
                        />

                        {/* Informações e botões */}
                        <View style={{ flex: 1, marginLeft: 10, justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ fontFamily: 'Nunito', color: '#ffffff', fontSize: 16, marginBottom: 5 }}>
                                    {item.title}
                                </Text>
                                <StarRating vote_average={item.vote_average} />
                            </View>

                            <View>
                                <TouchableOpacity
                                    style={{
                                        borderColor: '#25e3bc',
                                        borderWidth: 2,
                                        paddingVertical: 10,
                                        borderRadius: 20,
                                        backgroundColor: '#25e3bc',
                                        alignItems: 'center',
                                        marginBottom: 10,
                                    }}
                                >
                                    <Text style={{ fontFamily: 'Nunito', color: '#ffffff' }}>Já Assistido</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        borderColor: '#25e3bc',
                                        borderWidth: 2,
                                        paddingVertical: 10,
                                        borderRadius: 20,
                                        backgroundColor: '#25e3bc',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ fontFamily: 'Nunito', color: '#ffffff' }}>Quero assistir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#171a21',
        flex: 1,
    }
})