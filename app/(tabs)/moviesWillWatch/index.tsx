import Header from '@/components/Header';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function MoviesWillWatch() {
    const { width } = Dimensions.get('window');
    const BASE_WIDTH = 390;
    const scale = width / BASE_WIDTH;
    const scaled = (size: number) => size * scale;

    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [allMovies, setAllMovies] = useState<any[]>([]);

    useEffect(() => {
        loadMovies();
    }, []);

    async function loadMovies() {
        setLoading(true);
        const stored = await AsyncStorage.getItem('willWatchMovies');
        const loadedMovies = stored ? JSON.parse(stored) : [];
        setMovies(loadedMovies);
        setAllMovies(loadedMovies);
        setLoading(false);
    }
    
    async function handleRemoveMovie(movieId) {
        Alert.alert(
            "Remover Filme",
            "Tem certeza que deseja remover este filme da sua lista de 'Quero Assistir'?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Sim",
                    onPress: async () => {
                        const updatedMovies = allMovies.filter(movie => movie.id !== movieId);
                        await AsyncStorage.setItem('willWatchMovies', JSON.stringify(updatedMovies));
                        setMovies(updatedMovies);
                        setAllMovies(updatedMovies);
                    }
                }
            ]
        );
    }

    async function handleSearch(query: string) {
        if (!query.trim()) {
            loadMovies();
            return;
        }

        setLoading(true);
        try {
            const stored = await AsyncStorage.getItem('willWatchMovies');
            const allMoviesData = stored ? JSON.parse(stored) : [];

            const filtered = allMoviesData.filter((m) =>
                m.title.toLowerCase().includes(query.toLowerCase())
            );

            setMovies(filtered);
        } catch (error) {
            console.error("Erro ao buscar filmes:", error);
            Alert.alert("Erro", "Não foi possível buscar filmes salvos.");
        } finally {
            setLoading(false);
        }
    }

    function MovieItem({ movie, onRemove }) {
        return (
            <View style={{ width: '48%', alignItems: 'center' }}>
                <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                    style={{ width: '100%', height: scaled(220), borderRadius: scaled(10) }}
                    resizeMode="cover"
                />
                <Text
                    style={{
                        fontFamily: 'Nunito',
                        color: '#fff',
                        fontSize: scaled(14),
                        fontWeight: 'bold',
                        marginTop: scaled(8),
                        textAlign: 'center'
                    }}
                    numberOfLines={2}
                >
                    {movie.title}
                </Text>
                <TouchableOpacity
                    onPress={() => onRemove(movie.id)}
                    style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        padding: 5,
                        borderRadius: 20
                    }}>
                    <FontAwesome name="trash" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <LinearGradient colors={['#41444dff', '#171a21']} style={{ flex: 1 }}>
            <Header title=' Quero Assistir' onSearch={(text) => handleSearch(text)} />
            <View style={{ flex: 1 }}>
                {loading ? (
                    <ActivityIndicator size="large" color="#25e3bc" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={movies}
                        key={`columns-2`}
                        numColumns={2}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: scaled(10), margin: '3%' }}
                        columnWrapperStyle={{ justifyContent: 'space-between', gap: scaled(10), marginBottom: scaled(20) }}
                        renderItem={({ item }) => <MovieItem movie={item} onRemove={handleRemoveMovie} />}
                        ListEmptyComponent={
                            <Text style={{ color: '#fff', textAlign: 'center', marginTop: 50 }}>
                                Nenhum filme marcado como quero assistir ainda.
                            </Text>
                        }
                        ListHeaderComponent={
                            <View style={{ flexDirection: 'row', paddingTop: scaled(70), justifyContent: 'space-around', marginBottom: scaled(10) }}>
                                <TouchableOpacity onPress={() => router.replace('/(tabs)/moviesAlreadyWatched')}>
                                    <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
                                        Já assistidos
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Text style={{ color: '#25e3bc', fontSize: 16, fontWeight: 'bold', borderBottomWidth: 2, borderColor: '#25e3bc' }}>
                                        Quero assistir
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
                        style={{ flex: 1 }}
                    />
                )}
            </View>
        </LinearGradient>
    );
}