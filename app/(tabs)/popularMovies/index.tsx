import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { getPopularMovies } from "../../services/api";

export default function PopularMovies() {

    const [movies, setMovies] = useState([])

    useEffect(() => {
        (async () => {
            const data = await getPopularMovies();
            setMovies(data);
        })();
    }, [])

    return (
        <FlatList
            data={movies}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
                <View style={{ margin: 10 }}>
                    <Text style={{fontFamily:'Nunito'}}>{item.title}</Text>
                    <Image
                        source={{
                            uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                        }}
                        style={{ width: 150, height: 220 }}
                    />
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})