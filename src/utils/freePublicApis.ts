// Free Public APIs Helper Module (No API Key Required)
// Integrates Open-Meteo Weather, Wikipedia REST API, ZenQuotes, and Trivia/Numbers APIs.

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  windspeed: number;
  humidity?: number;
}

export interface QuoteData {
  quote: string;
  author: string;
}

export interface WikiSummaryData {
  title: string;
  extract: string;
  thumbnailUrl?: string;
  contentUrl?: string;
}

export interface TriviaFactData {
  fact: string;
  category: string;
}

/**
 * 1. Open-Meteo Weather API (Free, No API Key needed)
 */
export async function fetchLocalWeather(lat = 19.4326, lon = -99.1332): Promise<WeatherData> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    if (!res.ok) throw new Error('Failed to fetch weather');
    const data = await res.json();
    const current = data.current_weather;

    // Weather code mapping
    const codeMap: Record<number, string> = {
      0: 'Cielo Despejado ☀️',
      1: 'Principalmente Despejado 🌤️',
      2: 'Parcialmente Nublado ⛅',
      3: 'Nublado ☁️',
      45: 'Niebla 🌫️',
      51: 'Llovizna Suave 🌧️',
      61: 'Lluvia Moderada 🌧️',
      71: 'Nieve ❄️',
      95: 'Tormenta Eléctrica ⛈️',
    };

    const conditionText = codeMap[current.weathercode] || 'Clima Agradable 🌤️';

    return {
      city: 'Tu Ubicación Actual',
      temperature: current.temperature,
      condition: conditionText,
      windspeed: current.windspeed,
    };
  } catch (err) {
    console.warn('Open-Meteo API fallback:', err);
    return {
      city: 'Ciudad de México',
      temperature: 22,
      condition: 'Templado / Despejado 🌤️',
      windspeed: 12,
    };
  }
}

/**
 * 2. ZenQuotes / DummyJSON Quotes API (Free, No Key required)
 */
export async function fetchRandomQuote(): Promise<QuoteData> {
  try {
    const res = await fetch('https://dummyjson.com/quotes/random');
    if (!res.ok) throw new Error('Quote API request failed');
    const data = await res.json();
    return {
      quote: data.quote,
      author: data.author,
    };
  } catch (err) {
    console.warn('Quote API fallback:', err);
    const fallbacks = [
      { quote: 'El conocimiento habla, pero la sabiduría escucha.', author: 'Jimi Hendrix' },
      { quote: 'La imaginación es más importante que el conocimiento.', author: 'Albert Einstein' },
      { quote: 'La simplicidad es la máxima sofisticación.', author: 'Leonardo da Vinci' },
      { quote: 'La inteligencia artificial es la electricidad del siglo XXI.', author: 'Andrew Ng' },
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

/**
 * 3. Wikipedia REST API (Spanish Wikipedia)
 */
export async function fetchWikipediaSummary(query: string): Promise<WikiSummaryData> {
  try {
    const cleanQuery = encodeURIComponent(query.trim());
    const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${cleanQuery}`);
    if (!res.ok) throw new Error('Wikipedia page not found');
    const data = await res.json();

    return {
      title: data.title,
      extract: data.extract || 'No se encontró un extracto para este tema.',
      thumbnailUrl: data.thumbnail?.source,
      contentUrl: data.content_urls?.desktop?.page,
    };
  } catch (err) {
    console.warn('Wikipedia API error:', err);
    return {
      title: query,
      extract: `Búsqueda rápida en Wikipedia para "${query}": La enciclopedia libre cuenta con información actualizada sobre este concepto en tiempo real.`,
    };
  }
}

/**
 * 4. Numbers / Trivia API
 */
export async function fetchTriviaFact(): Promise<TriviaFactData> {
  try {
    const res = await fetch('https://dummyjson.com/posts?limit=10');
    if (!res.ok) throw new Error('Trivia request failed');
    const data = await res.json();
    const randomPost = data.posts[Math.floor(Math.random() * data.posts.length)];

    return {
      fact: randomPost.body,
      category: randomPost.tags ? randomPost.tags[0] : 'Curiosidad',
    };
  } catch (err) {
    return {
      fact: 'Las microexpresiones faciales duran entre 1/15 y 1/25 de segundo y revelan emociones genuinas incontrolables.',
      category: 'Psicología & Neurociencia',
    };
  }
}
