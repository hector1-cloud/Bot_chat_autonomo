import React, { useState, useEffect } from 'react';
import { CloudSun, BookOpen, Quote, Sparkles, RefreshCw, Send, Compass, ExternalLink, Globe, Thermometer, Wind, HelpCircle } from 'lucide-react';
import {
  fetchLocalWeather,
  fetchRandomQuote,
  fetchWikipediaSummary,
  fetchTriviaFact,
  WeatherData,
  QuoteData,
  WikiSummaryData,
  TriviaFactData,
} from '../utils/freePublicApis';

interface FreeApisHubProps {
  onInjectIntoChat: (text: string) => void;
}

export const FreeApisHub: React.FC<FreeApisHubProps> = ({ onInjectIntoChat }) => {
  const [activeTab, setActiveTab] = useState<'weather' | 'wikipedia' | 'quotes' | 'trivia'>('weather');

  // Weather state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);

  // Quote state
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loadingQuote, setLoadingQuote] = useState<boolean>(false);

  // Wikipedia state
  const [wikiQuery, setWikiQuery] = useState<string>('Inteligencia Artificial');
  const [wikiResult, setWikiResult] = useState<WikiSummaryData | null>(null);
  const [loadingWiki, setLoadingWiki] = useState<boolean>(false);

  // Trivia state
  const [trivia, setTrivia] = useState<TriviaFactData | null>(null);
  const [loadingTrivia, setLoadingTrivia] = useState<boolean>(false);

  // Load initial weather & quote on mount
  useEffect(() => {
    loadWeather();
    loadQuote();
    loadTrivia();
    handleWikiSearch('Inteligencia Artificial');
  }, []);

  const loadWeather = async () => {
    setLoadingWeather(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const w = await fetchLocalWeather(pos.coords.latitude, pos.coords.longitude);
          setWeather(w);
          setLoadingWeather(false);
        },
        async () => {
          const w = await fetchLocalWeather();
          setWeather(w);
          setLoadingWeather(false);
        }
      );
    } else {
      const w = await fetchLocalWeather();
      setWeather(w);
      setLoadingWeather(false);
    }
  };

  const loadQuote = async () => {
    setLoadingQuote(true);
    const q = await fetchRandomQuote();
    setQuote(q);
    setLoadingQuote(false);
  };

  const loadTrivia = async () => {
    setLoadingTrivia(true);
    const t = await fetchTriviaFact();
    setTrivia(t);
    setLoadingTrivia(false);
  };

  const handleWikiSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setLoadingWiki(true);
    const summary = await fetchWikipediaSummary(queryToSearch);
    setWikiResult(summary);
    setLoadingWiki(false);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
            <Globe className="w-4.5 h-4.5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <span>Hub de APIs Libres & Conocimiento</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                100% GRATIS / SIN KEY
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Conecta clima, enciclopedia Wikipedia, citas inspiradoras y trivias al Bot Inteligente
            </p>
          </div>
        </div>
      </div>

      {/* API Sub-Tabs Selector */}
      <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('weather')}
          className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'weather'
              ? 'bg-indigo-600 text-white font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CloudSun className="w-3.5 h-3.5" />
          <span className="truncate">Clima Open-Meteo</span>
        </button>

        <button
          onClick={() => setActiveTab('wikipedia')}
          className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'wikipedia'
              ? 'bg-indigo-600 text-white font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="truncate">Wikipedia REST</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'quotes'
              ? 'bg-indigo-600 text-white font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Quote className="w-3.5 h-3.5" />
          <span className="truncate">Citas ZenQuotes</span>
        </button>

        <button
          onClick={() => setActiveTab('trivia')}
          className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'trivia'
              ? 'bg-indigo-600 text-white font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="truncate">Curiosidades & Trivia</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 overflow-y-auto">
        {/* 1. Open-Meteo Weather Panel */}
        {activeTab === 'weather' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-amber-400" />
                <span>Datos Meteorológicos en Tiempo Real</span>
              </span>
              <button
                onClick={loadWeather}
                disabled={loadingWeather}
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loadingWeather ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>

            {weather && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-100">{weather.city}</h4>
                    <p className="text-xs text-indigo-400 font-medium">{weather.condition}</p>
                  </div>
                  <div className="text-3xl font-extrabold text-amber-400 font-mono">
                    {weather.temperature}°C
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    <span>Viento: {weather.windspeed} km/h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sensor Térmico Activo</span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onInjectIntoChat(
                      `¿Sabías que actualmente en mi entorno estamos a ${weather.temperature}°C con ${weather.condition}? ¿Cómo afecta este clima a tus actividades?`
                    )
                  }
                  className="w-full mt-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Contexto de Clima al Bot IA</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. Wikipedia REST API Panel */}
        {activeTab === 'wikipedia' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={wikiQuery}
                onChange={(e) => setWikiQuery(e.target.value)}
                placeholder="Busca cualquier concepto en Wikipedia (ej: Relatividad, Neurociencia)..."
                onKeyDown={(e) => e.key === 'Enter' && handleWikiSearch(wikiQuery)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleWikiSearch(wikiQuery)}
                disabled={loadingWiki}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Consultar</span>
              </button>
            </div>

            {loadingWiki && (
              <div className="text-center py-6 text-slate-400 text-xs animate-pulse">
                Consultando Wikipedia REST API en español...
              </div>
            )}

            {!loadingWiki && wikiResult && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{wikiResult.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      {wikiResult.extract}
                    </p>
                  </div>
                  {wikiResult.thumbnailUrl && (
                    <img
                      src={wikiResult.thumbnailUrl}
                      alt={wikiResult.title}
                      className="w-16 h-16 object-cover rounded-lg border border-slate-700 shrink-0"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  {wikiResult.contentUrl && (
                    <a
                      href={wikiResult.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Ver artículo completo en Wikipedia</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <button
                    onClick={() =>
                      onInjectIntoChat(
                        `Estaba investigando en Wikipedia sobre "${wikiResult.title}": ${wikiResult.extract.slice(0, 180)}... ¿Qué opinas de este concepto?`
                      )
                    }
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                  >
                    <Send className="w-3 h-3" />
                    <span>Preguntar al Bot sobre esto</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Quotes API Panel */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Quote className="w-4 h-4 text-purple-400" />
                <span>Generador de Frases Inspiradoras</span>
              </span>
              <button
                onClick={loadQuote}
                disabled={loadingQuote}
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loadingQuote ? 'animate-spin' : ''}`} />
                <span>Otra Frase</span>
              </button>
            </div>

            {quote && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <blockquote className="text-sm italic text-slate-200 border-l-2 border-purple-500 pl-3 leading-relaxed">
                  "{quote.quote}"
                </blockquote>
                <p className="text-xs text-right font-bold text-purple-400">— {quote.author}</p>

                <button
                  onClick={() =>
                    onInjectIntoChat(
                      `Quiero reflexionar sobre esta cita de ${quote.author}: "${quote.quote}". ¿Cómo interpretas este pensamiento desde el análisis emocional y microexpresiones?`
                    )
                  }
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reflexionar esta Cita con el Bot</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. Trivia Panel */}
        {activeTab === 'trivia' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Curiosidades & Hechos Fascinantes</span>
              </span>
              <button
                onClick={loadTrivia}
                disabled={loadingTrivia}
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loadingTrivia ? 'animate-spin' : ''}`} />
                <span>Otro Dato</span>
              </button>
            </div>

            {trivia && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Categoría: {trivia.category}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{trivia.fact}</p>

                <button
                  onClick={() =>
                    onInjectIntoChat(
                      `Sabías este dato curioso sobre ${trivia.category}: "${trivia.fact}"? ¿Qué otras curiosidades similares conoces?`
                    )
                  }
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Debatir este Dato Curioso</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
