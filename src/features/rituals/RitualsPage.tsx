import React, { useState, useEffect, useRef } from 'react';
import { apiRepository } from '../../core/api';
import type { Ritual, Product } from '../../core/api/IRepository';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import { Sparkles, Play, Pause, Heart, ShoppingBag, Wind, ChevronRight, RotateCcw, Volume2, ArrowLeft } from 'lucide-react';

interface RitualsPageProps {
  onAddToCart: (product: Product) => void;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  onAddMultipleToCart: (products: Product[]) => void;
  triggerToast: (msg: string) => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    value: string; // matches a specific ritual ID preference
  }[];
}

export const RitualsPage: React.FC<RitualsPageProps> = ({
  onAddToCart,
  favorites,
  onToggleFavorite,
  onAddMultipleToCart,
  triggerToast,
}) => {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Flow State: 'intro' | 'quiz' | 'recommendation'
  const [flowState, setFlowState] = useState<'intro' | 'quiz' | 'recommendation'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  
  // Quiz Result
  const [recommendedRitual, setRecommendedRitual] = useState<Ritual | null>(null);
  const [kitProducts, setKitProducts] = useState<Product[]>([]);

  // Meditation Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [meditationTime, setMeditationTime] = useState<number>(0);
  const [breathPhase, setBreathPhase] = useState<'Inhalá' | 'Retené' | 'Exhalá'>('Inhalá');
  const [breathCountdown, setBreathCountdown] = useState<number>(4);
  const timerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const quizContainerRef = useRef<HTMLDivElement>(null);

  // Quiz Questions definition (minimalist, 3 deeply introspective questions)
  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "¿Qué experimenta tu ser en este momento del día?",
      options: [
        { text: "Agobio mental, pensamientos acelerados y sobrecarga digital.", value: "ritual-calma" },
        { text: "Tensión corporal profunda y cansancio físico acumulado.", value: "ritual-desconexion" },
        { text: "Falta de claridad, vacío creativo o dispersión emocional.", value: "ritual-florecimiento" }
      ]
    },
    {
      id: 2,
      question: "¿Qué energía anhelás invitar a tus espacios sagrados?",
      options: [
        { text: "Quietud, serenidad absoluta y un descanso verdaderamente reparador.", value: "ritual-calma" },
        { text: "Desintoxicación mental profunda y retorno al momento presente.", value: "ritual-desconexion" },
        { text: "Purificación energética, misticismo e intenciones creativas.", value: "ritual-florecimiento" }
      ]
    },
    {
      id: 3,
      question: "¿Qué aroma resuena con la necesidad de tu alma hoy?",
      options: [
        { text: "Lavanda silvestre y maderas sagradas como el sándalo.", value: "ritual-calma" },
        { text: "Eucalipto medicinal fresco, menta y rocíos cítricos.", value: "ritual-desconexion" },
        { text: "Copal blanco ancestral purificante y pétalos de rosas secas.", value: "ritual-florecimiento" }
      ]
    }
  ];

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ritualsData, productsData] = await Promise.all([
          apiRepository.getRituals(),
          apiRepository.getProducts()
        ]);
        setRituals(ritualsData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching rituals data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Breathing & Timer effect when meditation player is active
  useEffect(() => {
    if (isPlaying) {
      // Audio play simulation
      if (!audioRef.current && recommendedRitual?.audioUrl) {
        audioRef.current = new Audio(recommendedRitual.audioUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
      }
      audioRef.current?.play().catch(() => {
        console.log("Audio playback user permission needed");
      });

      timerRef.current = setInterval(() => {
        // Increment timer
        setMeditationTime((prev) => prev + 1);

        // Breath control logic (Inhala 4s -> Retén 4s -> Exhala 4s)
        setBreathCountdown((prevCount) => {
          if (prevCount <= 1) {
            setBreathPhase((prevPhase) => {
              if (prevPhase === 'Inhalá') return 'Retené';
              if (prevPhase === 'Retené') return 'Exhalá';
              return 'Inhalá';
            });
            return 4;
          }
          return prevCount - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      audioRef.current?.pause();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, recommendedRitual]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Answer Quiz options
  const handleAnswer = (value: string) => {
    const nextAnswers = [...quizAnswers, value];
    setQuizAnswers(nextAnswers);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeout(() => {
        quizContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      // Resolve recommendation algorithm (majority vote, fallback to first answer)
      const counts: Record<string, number> = {};
      let maxCount = 0;
      let winningRitualId = nextAnswers[0];

      nextAnswers.forEach((ans) => {
        counts[ans] = (counts[ans] || 0) + 1;
        if (counts[ans] > maxCount) {
          maxCount = counts[ans];
          winningRitualId = ans;
        }
      });

      // Matching por keyword del valor de respuesta (ej: "ritual-calma" → "calma")
      // Los IDs en Supabase son UUIDs, matcheamos por título
      const keyword = winningRitualId.split('-').pop()?.toLowerCase() ?? '';
      const keywordMap: Record<string, string> = {
        calma: 'calma',
        desconexion: 'desconex',
        florecimiento: 'florecimiento',
      };
      const searchTerm = keywordMap[keyword] ?? keyword;
      const selected = rituals.find(r => r.title.toLowerCase().includes(searchTerm)) ?? rituals[0];
      setRecommendedRitual(selected);

      // Randomizar: mezcla el pool y toma máximo 3 productos al azar
      if (selected) {
        const pool = products.filter((p) => selected.productIds.includes(p.id));
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        setKitProducts(shuffled.slice(0, 3));
      }

      setFlowState('recommendation');
      triggerToast('Alquimia interior resuelta. Tu ritual ideal está listo.');
    }
  };

  // Helper for format time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Add the entire kit to cart
  const handleAddKitToCart = () => {
    if (kitProducts.length === 0) return;
    
    // Add all to cart
    onAddMultipleToCart(kitProducts);
    triggerToast(`¡Kit "${recommendedRitual?.title}" completo agregado al carrito!`);
  };

  const handleResetQuiz = () => {
    setIsPlaying(false);
    setMeditationTime(0);
    setBreathPhase('Inhalá');
    setBreathCountdown(4);
    setCurrentQuestionIndex(0);
    setQuizAnswers([]);
    setRecommendedRitual(null);
    setKitProducts([]);
    setFlowState('intro');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <Typography variant="body" color="muted">Armonizando espacios para meditación...</Typography>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      
      {/* 1. INTRO FLOW */}
      {flowState === 'intro' && (
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
          <Typography variant="caption" color="gold" weight="semibold">
            Templo de Intenciones
          </Typography>
          <Typography variant="h1" style={{ margin: '12px 0 24px', textTransform: 'uppercase' }}>
            Rituales & Meditaciones
          </Typography>
          <div style={{
            width: '50px',
            height: '1px',
            backgroundColor: 'var(--color-dorado-mate)',
            margin: '0 auto 30px'
          }} />
          
          <Typography variant="body" color="dark" style={{ fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '32px' }}>
            Cada día trae su propio viento. Diseñamos un buscador de paz interior: un Quiz Sensorial Botánico que descifra el estado de tu sistema nervioso y te prescribe un ritual de calma guiado con sus elementos aromaterapéuticos asociados.
          </Typography>

          <Card isGlass style={{ padding: '40px', marginBottom: '32px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>
            <Typography variant="h3" color="gold" style={{ marginBottom: '12px' }}>
              ¿Listo para volver a tu centro?
            </Typography>
            <Typography variant="body-sm" color="muted" style={{ marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>
              Te tomará menos de un minuto responder. Buscá una postura erguida y sentí los puntos de apoyo de tu cuerpo antes de iniciar.
            </Typography>
            <Button variant="primary" size="lg" onClick={() => setFlowState('quiz')}>
              Comenzar Diagnóstico
            </Button>
          </Card>
        </div>
      )}

      {/* 2. QUIZ FLOW */}
      {flowState === 'quiz' && (
        <div ref={quizContainerRef} className="quiz-mobile-fullscreen" style={{ maxWidth: '650px', margin: '0 auto', padding: '40px 20px' }}>
          
          {/* Indicador de Progreso */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <Typography variant="caption" color="gold">
              Pregunta {currentQuestionIndex + 1} de {quizQuestions.length}
            </Typography>
            <div style={{
              display: 'flex',
              gap: '6px'
            }}>
              {quizQuestions.map((q, idx) => (
                <div 
                   key={q.id}
                  style={{
                    width: '30px',
                    height: '3px',
                    borderRadius: '2px',
                    backgroundColor: idx <= currentQuestionIndex ? 'var(--color-dorado-mate)' : 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Tarjeta de Pregunta */}
          <Card 
            className="quiz-glass-card" 
            style={{ 
              padding: '40px 32px', 
              border: '1px solid rgba(79, 94, 76, 0.25)',
              backgroundColor: 'rgba(245, 239, 228, 0.85)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              boxShadow: '0 20px 50px rgba(79, 94, 76, 0.12)'
            }}
          >
            <Typography 
              variant="h2" 
              style={{ 
                fontSize: '1.6rem', 
                textAlign: 'center', 
                marginBottom: '32px',
                lineHeight: '1.4',
                color: 'var(--color-text-dark)'
              }}
            >
              {quizQuestions[currentQuestionIndex].question}
            </Typography>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {quizQuestions[currentQuestionIndex].options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleAnswer(opt.value)}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(79, 94, 76, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.55)',
                    color: 'var(--color-text-dark)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.95rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-oliva-salvia)';
                    e.currentTarget.style.backgroundColor = 'rgba(79, 94, 76, 0.08)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(79, 94, 76, 0.2)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.55)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <span>{opt.text}</span>
                  <ChevronRight size={16} color="var(--color-dorado-mate)" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 3. RECOMMENDATION FLOW */}
      {flowState === 'recommendation' && recommendedRitual && (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
          
          {/* Back button */}
          <button
            onClick={handleResetQuiz}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-dorado-mate)',
              fontSize: '0.8rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              marginBottom: '30px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Volver a diagnosticar</span>
          </button>

          {/* Grid Principal: Ritual + Meditation Player */}
          <div className="grid-responsive-ritual" style={{ alignItems: 'start' }}>
            
            {/* Detalles del Ritual */}
            <div>
              <Typography variant="caption" color="gold" weight="semibold">
                Alquimia Recomendada
              </Typography>
              <Typography variant="h1" style={{ fontSize: '2.2rem', margin: '10px 0 16px' }}>
                {recommendedRitual.title}
              </Typography>
              <Typography variant="body" color="dark" style={{ fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '32px' }}>
                {recommendedRitual.description}
              </Typography>

              {/* Pasos Guiados */}
              <div style={{ marginBottom: '40px' }}>
                <Typography variant="h3" color="gold" style={{ marginBottom: '20px', fontSize: '1.3rem' }}>
                  Pasos de la Práctica Consciente
                </Typography>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {recommendedRitual.steps.map((step, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        padding: '20px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.04)'
                      }}
                    >
                      <div style={{
                        flexShrink: 0,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(197, 168, 128, 0.15)',
                        border: '1px solid var(--color-dorado-mate)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-dorado-mate)',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}>
                        {idx + 1}
                      </div>
                      <Typography variant="body-sm" color="dark" style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
                        {step}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Meditación Interactiva y Reproductor Premium */}
            <div style={{ position: 'sticky', top: '20px' }}>
              <Card 
                className="glass-panel"
                style={{
                  padding: '32px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(35, 31, 28, 0.9)',
                  border: '1px solid rgba(197, 168, 128, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Typography variant="caption" color="gold">
                  Guía Sensorial Auditiva
                </Typography>
                <Typography variant="h3" color="light" style={{ marginTop: '8px', fontSize: '1.3rem' }}>
                  Respiración Circular Guiada
                </Typography>
                
                {/* Visualizador de Respiración Circular */}
                <div style={{ position: 'relative', width: '220px', height: '220px', margin: '30px 0' }}>
                  {/* Círculo de respiración interactivo que cambia de tamaño según la fase si está tocando */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) scale(${
                        !isPlaying ? 1.0 : breathPhase === 'Inhalá' ? 1.45 : breathPhase === 'Retené' ? 1.45 : 0.85
                      })`,
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${
                        !isPlaying 
                          ? 'var(--color-arena-tostada)' 
                          : breathPhase === 'Inhalá' 
                          ? 'var(--color-dorado-mate)' 
                          : breathPhase === 'Retené'
                          ? 'var(--color-oliva-salvia)' 
                          : 'var(--color-bosque-suave)'
                      } 0%, var(--color-tierra-profunda) 100%)`,
                      boxShadow: !isPlaying 
                        ? '0 0 20px rgba(0,0,0,0.3)' 
                        : breathPhase === 'Inhalá'
                        ? '0 0 50px rgba(197, 168, 128, 0.5)'
                        : breathPhase === 'Retené'
                        ? '0 0 50px rgba(110, 126, 107, 0.5)'
                        : '0 0 25px rgba(71, 85, 66, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-crema-calido)',
                      transition: 'transform 4s ease-in-out, background 1s ease, box-shadow 1s ease',
                      zIndex: 2
                    }}
                  >
                    <Typography variant="caption" style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                      {!isPlaying ? 'Listo' : breathPhase}
                    </Typography>
                    <Typography 
                      variant="h2" 
                      style={{ 
                        fontSize: '1.5rem', 
                        fontFamily: 'var(--font-serif)', 
                        margin: '2px 0' 
                      }}
                    >
                      {!isPlaying ? 'PAUSA' : breathCountdown}
                    </Typography>
                  </div>

                  {/* Aro indicador circular sutil */}
                  <svg 
                    style={{
                      transform: 'rotate(-90deg)',
                      width: '220px',
                      height: '220px',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  >
                    <circle
                      cx="110"
                      cy="110"
                      r="95"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="2"
                      fill="transparent"
                    />
                    <circle
                      cx="110"
                      cy="110"
                      r="95"
                      stroke="var(--color-dorado-mate)"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 95}
                      // Progress percentage represents seconds within the ritual mock length (e.g. 5 minutes total)
                      strokeDashoffset={
                        2 * Math.PI * 95 * (1 - Math.min(meditationTime / (recommendedRitual.durationMinutes * 60), 1))
                      }
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                </div>

                {/* Controles de Reproducción Premium */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                  <button
                    onClick={() => {
                      setMeditationTime(0);
                      setBreathCountdown(4);
                      setBreathPhase('Inhalá');
                      triggerToast('Meditación reiniciada.');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-crema-calido)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    <RotateCcw size={18} />
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                      triggerToast(isPlaying ? 'Audio en pausa. Respirá a tu propio ritmo.' : 'Respiración iniciada. Conectá con el sonido.');
                    }}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-dorado-mate)',
                      border: 'none',
                      color: 'var(--color-tierra-profunda)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: '0 8px 24px rgba(197, 168, 128, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.08)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(197, 168, 128, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(197, 168, 128, 0.3)';
                    }}
                  >
                    {isPlaying ? <Pause size={24} fill="var(--color-tierra-profunda)" /> : <Play size={24} fill="var(--color-tierra-profunda)" style={{ marginLeft: '4px' }} />}
                  </button>

                  <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                    <Volume2 size={16} />
                  </div>
                </div>

                {/* Tiempos de progreso */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  <span>{formatTime(meditationTime)}</span>
                  <span>Duración sugerida: {recommendedRitual.durationMinutes} min</span>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  width: '100%',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                  marginTop: '10px'
                }}>
                  {isPlaying ? (
                    <span>Sincronizá: <strong>Inhalá</strong> al expandir (Dorado), <strong>Retené</strong> en Oliva, <strong>Exhalá</strong> al contraer (Bosque).</span>
                  ) : (
                    <span>Presioná Play para sumergirte en la meditación y activar la guía visual de respiración.</span>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* 4. SECCIÓN KIT DE PRODUCTOS ASOCIADOS */}
          {kitProducts.length > 0 && (
            <div style={{ marginTop: '80px', borderTop: '1px solid rgba(197, 168, 128, 0.15)', paddingTop: '40px' }}>
              <div className="flex-responsive" style={{ gap: '20px', marginBottom: '32px' }}>
                <div>
                  <Typography variant="caption" color="gold" weight="semibold">
                    Herramientas de Intención
                  </Typography>
                  <Typography variant="h2" style={{ fontSize: '1.8rem', marginTop: '6px' }}>
                    El Kit del Ritual Completo
                  </Typography>
                  <Typography variant="body-sm" color="muted" style={{ marginTop: '4px' }}>
                    Los elementos físicos para anclar esta meditación botánica en tu plano sensorial cotidiano.
                  </Typography>
                </div>

                <Button
                  variant="primary"
                  onClick={handleAddKitToCart}
                  style={{
                    padding: '16px 28px',
                    borderRadius: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px rgba(110, 126, 107, 0.3)'
                  }}
                >
                  <ShoppingBag size={18} />
                  <span>Adquirir Kit Completo — ${kitProducts.reduce((acc, curr) => acc + (curr.promoPrice ?? curr.price), 0).toLocaleString('es-AR')}</span>
                </Button>
              </div>

              {/* Grilla del Kit */}
              <div className="grid-3">
                {kitProducts.map((prod) => {
                  const isFav = favorites.includes(prod.id);
                  return (
                    <Card key={prod.id} style={{ display: 'flex', flexDirection: 'column', padding: '16px', justifyContent: 'space-between', minHeight: '280px' }}>
                      <div>
                        <div style={{ height: '120px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                          <img src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <Typography variant="caption" color="gold" style={{ fontSize: '0.65rem' }}>{prod.category}</Typography>
                        <Typography variant="body" weight="medium" style={{ fontSize: '0.95rem', margin: '4px 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                          {prod.name}
                        </Typography>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                        <Typography variant="body" color="gold" weight="semibold">${prod.price.toLocaleString('es-AR')}</Typography>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => onToggleFavorite(prod.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px'
                            }}
                          >
                            <Heart size={15} color={isFav ? 'var(--color-terracota-suave)' : 'var(--color-crema-calido)'} fill={isFav ? 'var(--color-terracota-suave)' : 'none'} />
                          </button>
                          <Button size="sm" onClick={() => onAddToCart(prod)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.65rem' }}>
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Media Queries locales para layouts responsivos */}
      <style>{`
        @media (min-width: 992px) {
          div[style*="gridTemplateColumns: 1fr"] {
            grid-template-columns: 1.2fr 1fr !important;
          }
        }
        @media (min-width: 768px) {
          div[style*="flexDirection: column"] {
            flex-direction: row !important;
          }
        }
        @media (max-width: 767px) {
          .quiz-mobile-fullscreen {
            padding: 0 !important; margin: 0 auto !important; width: 100% !important; max-width: 100% !important;
          }
          .quiz-glass-card {
            border-radius: 16px !important; padding: 24px 16px !important; min-height: auto !important;
          }
          .quiz-glass-card button {
            padding: 14px 16px !important;
            font-size: 0.85rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RitualsPage;
