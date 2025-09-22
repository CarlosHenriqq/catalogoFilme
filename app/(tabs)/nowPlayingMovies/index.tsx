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
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Header from "../../../components/Header";
import { getNowPlayingMovies, searchMovies } from "../../services/api";

export default function PlayingMovies() {
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

        const data = await getNowPlayingMovies(selectedPage);
        setMovies(data.results || []);
        setPage(data.page);
        setTotalPages(data.total_pages);

        setLoading(false);
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

    // Componente MovieItem
    function MovieItem({ movie }) {
        const [showPicker, setShowPicker] = useState(false);
        const [selectedDate, setSelectedDate] = useState(new Date());

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
                Alert.alert('Adicionado', `${movie.title} marcado como "Quero assistir"!`);
            } catch (error) {
                console.log(error);
            }
        };


        const addToCalendar = async (date: Date) => {
            try {
                const { status: calendarStatus } = await Calendar.requestCalendarPermissionsAsync();
                let remindersStatus = 'granted';
                if (Platform.OS === 'ios') {
                    const reminders = await Calendar.requestRemindersPermissionsAsync();
                    remindersStatus = reminders.status;
                }

                if (calendarStatus !== 'granted' || remindersStatus !== 'granted') {
                    Alert.alert('Permissão negada', 'Não foi possível acessar o calendário.');
                    return;
                }

                const calendars = await Calendar.getCalendarsAsync();
                const defaultCalendar = calendars.find(cal => cal.allowsModifications);
                if (!defaultCalendar) return Alert.alert('Erro', 'Nenhum calendário disponível.');

                await Calendar.createEventAsync(defaultCalendar.id, {
                    title: `Quero assistir: ${movie.title}`,
                    startDate: date,
                    endDate: new Date(date.getTime() + 60 * 60 * 1000),
                    timeZone: 'GMT',
                });

                Alert.alert('Sucesso', `${movie.title} adicionado ao calendário!`);
            } catch (error) {
                console.log('Erro ao adicionar ao calendário:', error);
                Alert.alert('Erro', 'Não foi possível adicionar ao calendário.');
            }
        };

        const handleAddToCalendar = () => {
            if (Platform.OS === 'android') {
                DateTimePickerAndroid.open({
                    value: new Date(),
                    mode: 'datetime',
                    is24Hour: true,
                    onChange: (event, date) => {
                        if (!date) return;
                        addToCalendar(date);
                    },
                });
            } else {
                setShowPicker(true);
            }
        };

        const onDateChange = (event, date) => {
            if (!date) return;
            setSelectedDate(date);
            addToCalendar(date);
            setShowPicker(false);
        };
        const handlePressWillWatch = () => {
            handleAddToCalendar();
            markAsWillWatch();
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
                            onPress={handlePressWillWatch}
                        >
                            <Text style={styles.buttonText}>Quero assistir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={markAsWatched}
                        >
                            <Text style={styles.buttonText}>Já Assistido</Text>
                        </TouchableOpacity>



                        {showPicker && Platform.OS === 'ios' && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="datetime"
                                display="spinner"
                                onChange={onDateChange}
                                style={{ marginTop: 10 }}
                            />
                        )}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <LinearGradient colors={['#41444dff', '#171a21']} style={{ flex: 1 }}>
            <View style={styles.container}>
                <Header title=' em cartaz' onSearch={(text) => handleSearch(text)} />


                {loading ? (
                    <ActivityIndicator size="large" color="#25e3bc" style={{ paddingTop: '20%' }} />
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
