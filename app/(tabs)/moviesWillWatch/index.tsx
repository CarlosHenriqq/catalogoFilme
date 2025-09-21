import Header from '@/components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
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



    useEffect(() => {
        async function loadMovies() {
            setLoading(true);
            const stored = await AsyncStorage.getItem('willWatchMovies');
            const loadedMovies = stored ? JSON.parse(stored) : [];
            setMovies(loadedMovies);
            setLoading(false);
        }
        loadMovies();
    }, []);





    function MovieItem({ movie }) {
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


            </View>
        );
    }

    return (
        <LinearGradient colors={['#41444dff', '#171a21']} style={{ flex: 1 }}>
            <Header title=' Quero Assistir' />
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
                        renderItem={({ item }) => <MovieItem movie={item} />}
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
