/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext, useMemo } from 'react';
import { Star, ChevronLeft, ChevronRight, AlertCircle, TrendingUp, TrendingDown, CameraOff, BarChart2 } from 'lucide-react';
import { AuthContext } from '../../context/auth/AuthContext';
import '../../assets/scss/users/users.scss';

// Definición de las interfaces del dashboard
interface LocalReview {
  id: number;
  user?: { name?: string; avatar_url?: string };
  rating: number;
  comment?: string;
  created_at: string;
}

// Interfaz de plato actualizada con likes y dislikes
interface Food {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  votes_up: number;
  votes_down: number;
}

// NUEVO: Componente para mostrar la distribución de calificaciones con estrellas y barras de progreso
interface StarRatingDistributionProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  totalReviews: number;
}

const StarRatingDistribution = ({ data, totalReviews }: StarRatingDistributionProps) => {
  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
      <h4 className="text-lg font-semibold text-white mb-4">Distribución de Calificaciones</h4>
      <div className="space-y-3">
        {data.length > 0 ? (
          data.map((item, index) => {
            const percentage = totalReviews > 0 ? (item.value / totalReviews) * 100 : 0;
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex items-center w-24 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-300">{item.label.split(' ')[0]}</span>
                  <Star className="w-4 h-4 text-amber-300 fill-current ml-1" />
                </div>
                <div className="flex-1">
                  <div className="h-2.5 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-white w-10 text-right">{item.value}</span>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm">No hay datos para mostrar.</p>
        )}
      </div>
    </div>
  );
};

// Componente para mostrar el ratio de votos con una barra de progreso
interface VoteRatioBarProps {
  votesUp: number;
  votesDown: number;
}

const VoteRatioBar = ({ votesUp, votesDown }: VoteRatioBarProps) => {
  const totalVotes = votesUp + votesDown;
  const likesPercentage = totalVotes > 0 ? (votesUp / totalVotes) * 100 : 0;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center text-green-400 text-sm font-semibold space-x-1">
          <TrendingUp className="w-4 h-4" />
          <span>{votesUp} Me gusta</span>
        </div>
        <div className="flex items-center text-red-400 text-sm font-semibold space-x-1">
          <TrendingDown className="w-4 h-4" />
          <span>{votesDown} No me gusta</span>
        </div>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-600 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500 ease-out"
          style={{ width: `${likesPercentage.toFixed(0)}%` }}
        ></div>
      </div>
      <p className="mt-2 text-md font-bold text-white">{likesPercentage.toFixed(0)}% de aprobación</p>
    </div>
  );
};

const LocalReviews = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [localId, setLocalId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<LocalReview[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [reviewsPage, setReviewsPage] = useState(0);
  const [foodsPage, setFoodsPage] = useState(0);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const parseArray = <T,>(raw: any): T[] => {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.data)) return raw.data;
    return [];
  };

  useEffect(() => {
    const fetchUserLocal = async () => {
      if (!user) {
        setLoading(false);
        setError('Usuario no autenticado');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/users/${user.id}/local`);
        if (!res.ok) {
          throw new Error('No se pudo obtener el local para este usuario.');
        }
        const data = await res.json();
        if (data?.id) {
          setLocalId(data.id);
        } else {
          setError('No se encontró un local asociado a este usuario.');
        }
      } catch (err) {
        console.error(err);
        setError('Error al obtener el local del usuario.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserLocal();
  }, [user, API_BASE]);

  useEffect(() => {
    const fetchReviewsAndFoods = async () => {
      if (!localId) return;
      setLoading(true);
      setError(null);

      try {
        const [reviewsRes, foodsRes] = await Promise.allSettled([
          fetch(`${API_BASE}/locals/${localId}/reviews`),
          fetch(`${API_BASE}/food/local/${localId}/foods`),
        ]);

        if (reviewsRes.status === 'fulfilled' && reviewsRes.value.ok) {
          const reviewsData: LocalReview[] = parseArray<LocalReview>(await reviewsRes.value.json());
          setReviews(reviewsData);
        } else {
          console.error('Error fetching reviews:', reviewsRes);
        }

        if (foodsRes.status === 'fulfilled' && foodsRes.value.ok) {
          const foodsData: Food[] = parseArray<Food>(await foodsRes.value.json());
          // Ordenar los platos por la diferencia entre votes_up y votes_down
          const sortedFoods = foodsData.sort((a, b) => (b.votes_up - b.votes_down) - (a.votes_up - a.votes_down));
          setFoods(sortedFoods);
        } else {
          console.error('Error fetching foods:', foodsRes);
        }

      } catch (err) {
        setError('Error al cargar los datos. Intente de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewsAndFoods();
  }, [localId, API_BASE]);

  const formatCurrency = (amount: number) => `$${(amount ?? 0).toLocaleString('es-AR')}`;

  const REVIEWS_PER_PAGE = 3;
  const FOODS_PER_PAGE = 4;

  const paginationData = useMemo(() => {
    const totalReviewsPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
    const paginatedReviews = reviews.slice(
      reviewsPage * REVIEWS_PER_PAGE,
      (reviewsPage + 1) * REVIEWS_PER_PAGE
    );

    const totalFoodsPages = Math.ceil(foods.length / FOODS_PER_PAGE);
    const paginatedFoods = foods.slice(
      foodsPage * FOODS_PER_PAGE,
      (foodsPage + 1) * FOODS_PER_PAGE
    );

    return {
      reviews: { data: paginatedReviews, totalPages: totalReviewsPages },
      foods: { data: paginatedFoods, totalPages: totalFoodsPages }
    };
  }, [reviews, foods, reviewsPage, foodsPage]);

  // useMemo para calcular las estadísticas de reseñas
  const reviewStats = useMemo(() => {
    const totalReviews = reviews.length;
    const totalRatingSum = reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0);
    const averageRating = totalReviews > 0 ? totalRatingSum / totalReviews : 0;
    
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
      const count = reviews.filter(review => review.rating === star).length;
      return {
        label: `${star} estrellas`,
        value: count,
        color: 'bg-amber-300' // Amarillo más suave
      };
    });

    return {
      totalReviews,
      averageRating: averageRating.toFixed(1),
      ratingDistribution
    };
  }, [reviews]);

  // Nuevo useMemo para calcular las estadísticas de votos de comida
  const foodStats = useMemo(() => {
    const totalVotesUp = foods.reduce((sum, food) => sum + (food.votes_up ?? 0), 0);
    const totalVotesDown = foods.reduce((sum, food) => sum + (food.votes_down ?? 0), 0);
    return {
      totalVotesUp,
      totalVotesDown
    };
  }, [foods]);

  // Función helper para crear elementos vacíos para mantener altura fija
  const createEmptySlots = (currentItems: number, maxItems: number) => {
    const emptySlots = maxItems - currentItems;
    return Array.from({ length: Math.max(0, emptySlots) }, (_, index) => (
      <div key={`empty-${index}`} className="invisible" />
    ));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Cargando datos...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6 bg-gray-800 rounded-xl shadow-lg border border-red-700 text-red-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="font-semibold text-lg mb-2">Error al cargar el panel de control</p>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="bgFood2 min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold pt-12 text-white mb-2">Reseñas y Ranking de Platos</h1>
        <p className="text-gray-400 mb-8">Información detallada sobre la opinión de tus clientes y los platos más populares.</p>

        {/* Sección de Estadísticas de Reseñas */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Estadísticas de Reseñas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-700 rounded-lg py-3 px-4 flex items-center space-x-4">
              <div className="bg-blue-500/20 p-3 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Puntuación Promedio</p>
                <p className="text-2xl font-bold text-white flex items-end space-x-1">{reviewStats.averageRating} <span className="text-lg text-gray-400">/ 5</span></p>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg py-3 px-4 flex items-center space-x-4">
              <div className="bg-green-500/20 p-3 rounded-full flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total de Reseñas</p>
                <p className="text-2xl font-bold text-white">{reviewStats.totalReviews}</p>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg py-3 px-4 flex items-center space-x-4">
              <div className="bg-purple-500/20 p-3 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">Ratio de Votos de Platos</p>
                <VoteRatioBar votesUp={foodStats.totalVotesUp} votesDown={foodStats.totalVotesDown} />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <StarRatingDistribution data={reviewStats.ratingDistribution} totalReviews={reviewStats.totalReviews} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna de Reseñas Recientes */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Reseñas recientes</h3>
              <div className="flex items-center space-x-2">
                <button
                  type='button'
                  title='Anterior'
                  onClick={() => setReviewsPage(prev => Math.max(0, prev - 1))}
                  disabled={reviewsPage === 0}
                  className="p-1 rounded-full bg-gray-700 text-gray-400 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type='button'
                  title='Siguiente'
                  onClick={() => setReviewsPage(prev => Math.min(paginationData.reviews.totalPages - 1, prev + 1))}
                  disabled={reviewsPage >= paginationData.reviews.totalPages - 1}
                  className="p-1 rounded-full bg-gray-700 text-gray-400 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4" style={{ minHeight: `${REVIEWS_PER_PAGE * 120}px` }}>
              {paginationData.reviews.data.length > 0 ? (
                <>
                  {paginationData.reviews.data.map(review => (
                    <div key={review.id} className="border-b border-gray-700 last:border-b-0 pb-4 last:pb-0 bg-gray-700 p-3 rounded-lg hover:ring-1 hover:ring-gray-600 transition-all">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          {review.user?.avatar_url ? (
                            <img src={review.user.avatar_url} alt={review.user?.name ?? 'Usuario'} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-gray-400 text-sm font-medium">{(review.user?.name?.charAt(0) ?? '?').toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-white">{review.user?.name ?? 'Anónimo'}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < (review.rating ?? 0) ? 'text-amber-300 fill-current' : 'text-gray-500'}`} />
                              ))}
                            </div>
                            <span className="text-sm text-gray-400">{new Date(review.created_at).toLocaleDateString('es-AR')}</span>
                          </div>
                          {review.comment && <p className="text-sm text-gray-300">{review.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {createEmptySlots(paginationData.reviews.data.length, REVIEWS_PER_PAGE)}
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay reseñas disponibles</p>
              )}
            </div>
          </div>

          {/* Columna de Platos más votados */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Platos más votados</h3>
              <div className="flex items-center space-x-2">
                <button
                  type='button'
                  title='Anterior'
                  onClick={() => setFoodsPage(prev => Math.max(0, prev - 1))}
                  disabled={foodsPage === 0}
                  className="p-1 rounded-full bg-gray-700 text-gray-400 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type='button'
                  title='Siguiente'
                  onClick={() => setFoodsPage(prev => Math.min(paginationData.foods.totalPages - 1, prev + 1))}
                  disabled={foodsPage >= paginationData.foods.totalPages - 1}
                  className="p-1 rounded-full bg-gray-700 text-gray-400 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {paginationData.foods.data.length > 0 ? (
                <>
                  {paginationData.foods.data.map(food => (
                    <div key={food.id} className="flex items-center bg-gray-700 p-4 rounded-lg shadow-md hover:ring-1 hover:ring-gray-600 transition-all">
                      <div className="w-16 h-16 rounded-xl overflow-hidden mr-4 flex-shrink-0">
                        {food.image_url ? (
                          <img src={food.image_url} alt={food.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-600 flex items-center justify-center text-gray-400">
                            <CameraOff className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-white truncate">{food.name}</p>
                        <p className="text-sm text-gray-400 truncate">{formatCurrency(food.price)}</p>
                      </div>
                      <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                        <div className="flex items-center text-green-400">
                          <TrendingUp className="w-5 h-5 mr-1" />
                          <span className="font-semibold">{food.votes_up ?? 0}</span>
                        </div>
                        <div className="flex items-center text-red-400">
                          <TrendingDown className="w-5 h-5 mr-1" />
                          <span className="font-semibold">{food.votes_down ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {createEmptySlots(paginationData.foods.data.length, FOODS_PER_PAGE)}
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay datos de platos disponibles</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalReviews;