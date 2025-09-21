
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarLabelStyle: {
                    fontSize: width * 0.025, // equivalente a ~10px em 400px de largura
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    paddingBottom: 4,
                },
                tabBarActiveTintColor: '#25e3bc',
                tabBarInactiveTintColor: '#ffffff',
                tabBarStyle: {
                    width: '100%',
                    backgroundColor: '#41444dff',
                    height: width < 400 ? 60 : 65, // ligeiro ajuste para telas menores
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 5 },
                    shadowRadius: 10,
                    elevation: 3,
                },
            }}
        >


            <Tabs.Screen
                name="popularMovies/index"
                options={{
                    title: 'Populares',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="movie-open-star-outline" size={20} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="nowPlayingMovies/index"
                options={{
                    title: 'Em cartaz',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="ticket" size={20} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="moviesAlreadyWatched/index"
                options={{
                    title: 'Meus filmes',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="movie-open-check-outline" size={20} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="moviesWillWatch/index" 
                options={{ href: null }}
            />



        </Tabs>
    );
}