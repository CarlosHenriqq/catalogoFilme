import { API_KEY } from "@env";
import axios from "axios";


const BASE_URL = "https://api.themoviedb.org/3";

export const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: "pt-BR",
  },
});

export async function getPopularMovies(page = 1) {
  try {
    const response = await api.get("/movie/popular", { params: { page } });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar filmes:", error);
    return { page: 1, results: [], total_pages: 1, total_results: 0 };
  }
}

export async function getNowPlayingMovies(page = 1) {
  try {
    const response = await api.get("/movie/now_playing", { params: { page } });
    return response.data ?? { page: 1, results: [], total_pages: 1, total_results: 0 };
  } catch (error) {
    console.error("Erro ao buscar filmes em cartaz:", error);
    return { page: 1, results: [], total_pages: 1, total_results: 0 };
  }
}
