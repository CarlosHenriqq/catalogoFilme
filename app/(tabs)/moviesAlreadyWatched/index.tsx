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

export default function WatchedMovies() {
    const { width } = Dimensions.get('window');
    const BASE_WIDTH = 390;
    const scale = width / BASE_WIDTH;
    const scaled = (size: number) => size * scale;

    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [allMovies, setAllMovies] = useState<any[]>([]);

    useEffect(() => {
        loadWatchedMovies();
    }, []);

    async function loadWatchedMovies() {
        setLoading(true);
        const stored = await AsyncStorage.getItem('watchedMovies');
        const watchedMovies = stored ? JSON.parse(stored) : [];
        setMovies(watchedMovies);
        setAllMovies(watchedMovies); 
        setLoading(false);
    }

    async function handleRemoveMovie(movieId) {
        Alert.alert(
            "Remover Filme",
            "Tem certeza que deseja remover este filme da sua lista?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Sim",
                    onPress: async () => {
                        const updatedMovies = allMovies.filter(movie => movie.id !== movieId);
                        await AsyncStorage.setItem('watchedMovies', JSON.stringify(updatedMovies));
                        setMovies(updatedMovies); 
                        setAllMovies(updatedMovies); 
                    }
                }
            ]
        );
    }

    function handleSearch(query: string) {
        if (!query.trim()) {
            setMovies(allMovies);
            return;
        }

        const filtered = allMovies.filter((m) =>
            m.title.toLowerCase().includes(query.toLowerCase())
        );
        setMovies(filtered);
    }

    function MovieItem({ movie, onRemove }) {
        const [userRating, setUserRating] = useState(0);

        useEffect(() => {
            async function loadUserRating() {
                const storedRating = await AsyncStorage.getItem(`userRating_${movie.id}`);
                if (storedRating) {
                    setUserRating(parseInt(storedRating));
                }
            }
            loadUserRating();
        }, []);

        async function handleRating(star: number) {
            setUserRating(star);
            await AsyncStorage.setItem(`userRating_${movie.id}`, String(star));
        }

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
                <Text style={{ color: '#ccc', fontSize: 12, marginTop: 4 }}>
                    Sua nota:
                </Text>
                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    {[...Array(5)].map((_, i) => (
                        <TouchableOpacity key={i} onPress={() => handleRating(i + 1)}>
                            <FontAwesome
                                name={i < userRating ? 'star' : 'star-o'}
                                size={16}
                                color="#25e3bc"
                                style={{ marginRight: 2 }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
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
            <Header title=' já assistidos' onSearch={(text) => handleSearch(text)} />
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
                                Nenhum filme assistido ainda.
                            </Text>
                        }
                        ListHeaderComponent={
                            <View style={{ flexDirection: 'row', paddingTop: scaled(70), justifyContent: 'space-around', marginBottom: scaled(10) }}>
                                <TouchableOpacity >
                                    <Text style={{ color: '#25e3bc', fontSize: 16, fontWeight: 'bold', borderBottomWidth: 2, borderColor: '#25e3bc' }}>
                                        Já assistidos
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => router.replace('/(tabs)/moviesWillWatch')}>
                                    <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
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