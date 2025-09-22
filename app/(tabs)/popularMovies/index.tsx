import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Header from "../../../components/Header";
import { getPopularMovies, searchMovies } from "../../services/api";

// Componente principal da tela
export default function PopularMovies() {
    const { width } = Dimensions.get('window');
    const BASE_WIDTH = 390;
    const scale = width / BASE_WIDTH;
    const scaled = (size: number) => size * scale;

    const [movies, setMovies] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);


    async function loadMovies(selectedPage = 1) {
        if (loading) return;
        setLoading(true);

        try {
            const data = await getPopularMovies(selectedPage);
            setMovies(data.results || []);
            setPage(data.page);
            setTotalPages(data.total_pages);
        } catch (error) {
            console.error("Erro ao carregar filmes:", error);
            Alert.alert("Erro", "Não foi possível carregar a lista de filmes.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMovies(1);
    }, []);

    function renderPagination() {
        const maxPagesToShow = 5;
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <TouchableOpacity
                    key={i}
                    onPress={() =>
                        isSearching ? handleSearch(search, i) : loadMovies(i)
                    }
                    style={{
                        padding: 8,
                        marginHorizontal: 4,
                        backgroundColor: i === page ? '#25e3bc' : '#ccc',
                        borderRadius: 20,
                    }}
                >
                    <Text style={{ color: i === page ? '#171a21' : '#171a21' }}>{i}</Text>
                </TouchableOpacity>
            );
        }

        return (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 15, flexWrap: 'wrap', paddingBottom: scaled(18) }}>
                <TouchableOpacity
                    onPress={() => page > 1 && loadMovies(page - 1)}
                    disabled={page === 1}
                    style={{ marginHorizontal: 6, justifyContent: 'center' }}
                >
                    <Text style={{ color: page === 1 ? '#666' : '#25e3bc' }}>Anterior</Text>
                </TouchableOpacity>
                {pages}
                <TouchableOpacity
                    onPress={() => page < totalPages && loadMovies(page + 1)}
                    disabled={page === totalPages}
                    style={{ marginHorizontal: 6, justifyContent: 'center' }}
                >
                    <Text style={{ color: page === totalPages ? '#666' : '#25e3bc' }}>Próximo</Text>
                </TouchableOpacity>
            </View>
        );
    }
    async function handleSearch(query: string, page = 1) {
        if (!query.trim()) {
            setIsSearching(false);
            loadMovies(1);
            return;
        }

        setLoading(true);
        try {
            const data = await searchMovies(query, page);
            setMovies(data.results || []);
            setPage(data.page);
            setTotalPages(data.total_pages);
            setIsSearching(true);
        } catch (error) {
            console.error("Erro ao buscar filmes:", error);
            Alert.alert("Erro", "Não foi possível buscar filmes.");
        } finally {
            setLoading(false);
        }
    }


    
    function MovieItem({ movie }) {

        const markAsWatched = async () => {
            try {
                const stored = await AsyncStorage.getItem('watchedMovies');
                const watchedMovies = stored ? JSON.parse(stored) : [];
                if (!watchedMovies.find((m) => m.id === movie.id)) {
                    watchedMovies.push(movie);
                    await AsyncStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
                }
                Alert.alert('Sucesso', `${movie.title} marcado como assistido!`);
            } catch (error) {
                console.log(error);
                Alert.alert('Erro', 'Não foi possível marcar o filme como assistido.');
            }
        };

        const markAsWillWatch = async () => {
            try {
                const stored = await AsyncStorage.getItem('willWatchMovies');
                const willWatchMovies = stored ? JSON.parse(stored) : [];
                if (!willWatchMovies.find((m) => m.id === movie.id)) {
                    willWatchMovies.push(movie);
                    await AsyncStorage.setItem('willWatchMovies', JSON.stringify(willWatchMovies));
                }
                
            } catch (error) {
                console.log(error);
                Alert.alert('Erro', 'Não foi possível salvar na sua lista.');
            }
        };

        const addToCalendar = async (date: Date) => {
            try {
                const { status } = await Calendar.requestCalendarPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permissão negada', 'Não foi possível acessar o calendário.');
                    return;
                }

                const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
                const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
                if (!defaultCalendar) {
                    Alert.alert('Erro', 'Nenhum calendário disponível para adicionar eventos.');
                    return;
                }

                // Duração padrão de 2 horas para o filme
                const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);

                await Calendar.createEventAsync(defaultCalendar.id, {
                    title: `Assistir: ${movie.title}`,
                    startDate: date,
                    endDate: endDate,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, 
                });

                // Alerta de sucesso final, após salvar na lista e no calendário
                Alert.alert('Sucesso!', `${movie.title} foi adicionado à sua lista e ao seu calendário.`);

            } catch (error) {
                console.log('Erro ao adicionar ao calendário:', error);
                Alert.alert('Erro', 'Não foi possível adicionar o evento ao calendário.');
            }
        };

     
        const handleConfirmDateAndSave = async (pickedDate: Date) => {
            await markAsWillWatch();
            await addToCalendar(pickedDate);
        };

        const showDateTimePicker = () => {
            const now = new Date();

            // 1️⃣ Abrir picker de DATA
            DateTimePickerAndroid.open({
                value: now,
                mode: 'date',
                minimumDate: new Date(),
                onChange: (event, selectedDate) => {
                    if (event.type === 'dismissed') return; 
                    if (!selectedDate) return;

                    // Data selecionada, agora abrir HORA
                    const pickedDate = new Date(selectedDate);

                    DateTimePickerAndroid.open({
                        value: pickedDate,
                        mode: 'time',
                        is24Hour: true,
                        onChange: async (timeEvent, selectedTime) => {
                            if (timeEvent.type === 'dismissed') return; 
                            if (!selectedTime) return;

                            pickedDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());

                           
                            await handleConfirmDateAndSave(pickedDate);
                        },
                    });
                },
            });
        };



        const StarRating = ({ vote_average }: { vote_average: number }) => {
            const stars = Math.round(vote_average / 2);
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
        };

        return (
            <View style={{ flexDirection: 'row', margin: 10, backgroundColor: '#1c212b', padding: 10, borderRadius: 10 }}>
                <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                    style={{ width: 150, height: 220, borderRadius: 10 }}
                />
                <View style={{ flex: 1, marginLeft: 10, justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ fontFamily: 'Nunito', color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>
                            {movie.title}
                        </Text>
                        <StarRating vote_average={movie.vote_average} />
                    </View>

                    <View>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={showDateTimePicker}
                        >
                            <Text style={styles.buttonText}>Quero assistir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={markAsWatched}
                        >
                            <Text style={styles.buttonText}>Já Assistido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <LinearGradient colors={['#41444dff', '#171a21']} style={{ flex: 1 }}>
            <View style={styles.container}>
                <Header title=' Populares' onSearch={(text) => handleSearch(text)} />
                {loading ? (
                    <ActivityIndicator size="large" color="#25e3bc" style={{ flex: 1, justifyContent: 'center' }} />
                ) : (
                    <FlatList
                        data={movies}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={{ paddingTop: scaled(70), paddingBottom: 20 }}
                        renderItem={({ item }) => <MovieItem movie={item} />}
                        ListFooterComponent={renderPagination}
                    />
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    button: {
        borderColor: '#25e3bc',
        borderWidth: 2,
        paddingVertical: 5,
        width: '80%',
        borderRadius: 20,
        backgroundColor: '#171a21',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        fontFamily: 'Nunito',
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
});