/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext, useMemo } from 'react';
import { Star, DollarSign, ShoppingBag, Clock, Sun, Package, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AuthContext } from '../../context/auth/AuthContext';
import { AreaChart, XAxis, YAxis, Tooltip, Area, ResponsiveContainer, Dot } from 'recharts';
import '../../assets/scss/users/users.scss';

interface Order {
  id: number;
  user?: { name?: string };
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  created_at: string;
  order_items: { food?: { name?: string }; quantity: number; unit_price: number }[];
}

interface TopFood {
  food_id: number;
  name?: string;
  total_quantity: number;
  total_revenue: number;
  image_url?: string;
}

interface MonthlyEarning {
  month: string;
  total_earnings: number;
  total_orders: number;
}

interface LocalReview {
  id: number;
  user?: { name?: string; avatar_url?: string };
  rating: number;
  comment?: string;
  created_at: string;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  totalTodayRevenue: number;
}

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [localId, setLocalId] = useState<number | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    totalTodayRevenue: 0,
  });
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [topFoods, setTopFoods] = useState<TopFood[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<LocalReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [earningsPage, setEarningsPage] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [topFoodsPage, setTopFoodsPage] = useState(0);
  const [ordersPage, setOrdersPage] = useState(0);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const parseArray = <T,>(raw: any): T[] => {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.data)) return raw.data;
    return [];
  };

  const isToday = (dateString: string): boolean => {
    const today = new Date();
    const orderDate = new Date(dateString);
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  };

  const calculateTodayRevenueFromOrders = (orders: Order[]): number => {
    return orders
      .filter(order =>
        isToday(order.created_at) &&
        (order.status === 'confirmed' || order.status === 'preparing' ||
          order.status === 'ready' || order.status === 'delivered')
      )
      .reduce((sum, order) => sum + (order.total ?? 0), 0);
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
    const fetchDashboardData = async () => {
      if (!localId) return;
      setLoading(true);
      setError(null);

      const currentYear = new Date().getFullYear();
      const fromDate = `${currentYear}-01-01T00:00:00Z`;
      const toDate = `${currentYear}-12-31T23:59:59Z`;

      try {
        const [ordersRes, topFoodsRes, earningsRes, reviewsRes] = await Promise.allSettled([
          fetch(`${API_BASE}/locals/${localId}/orders`),
          fetch(`${API_BASE}/locals/${localId}/statistics/top-foods?from=${fromDate}&to=${toDate}`),
          fetch(`${API_BASE}/locals/${localId}/statistics/monthly-earnings?from=${fromDate}&to=${toDate}`),
          fetch(`${API_BASE}/locals/${localId}/reviews`),
        ]);

        // eslint-disable-next-line prefer-const
        let newStats = { ...stats };
        // let allOrders: Order[] = [];

        if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
          const orders: Order[] = parseArray<Order>(await ordersRes.value.json());
          // allOrders = orders;
          setRecentOrders(orders);
          newStats.totalOrders = orders.length;
          newStats.totalRevenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
          newStats.totalTodayRevenue = calculateTodayRevenueFromOrders(orders);
        }

        if (topFoodsRes.status === 'fulfilled' && topFoodsRes.value.ok) {
          const topFoodsData = await topFoodsRes.value.json();
          const parsedTopFoods: TopFood[] = parseArray(topFoodsData.top_foods);
          setTopFoods(parsedTopFoods);
        }

        if (earningsRes.status === 'fulfilled' && earningsRes.value.ok) {
          const rawEarningsData = await earningsRes.value.json();
          const formattedEarnings = parseArray(rawEarningsData)
            .filter((e: any) => e.ganancia && e.ganancia > 0)
            .map((e: any) => {
              const [year, month] = e.mes.split("-");
              return {
                month: new Date(Number(year), Number(month) - 1).toLocaleDateString("es-AR", {
                  month: "short",
                }),
                total_earnings: e.ganancia ?? 0,
                total_orders: e.pedidos ?? 0,
              };
            });
          setMonthlyEarnings(formattedEarnings.sort((a, b) => new Date(`2000-${a.month}-01`).getTime() - new Date(`2000-${b.month}-01`).getTime()));
        }

        if (reviewsRes.status === 'fulfilled' && reviewsRes.value.ok) {
          const reviewsData: LocalReview[] = parseArray<LocalReview>(await reviewsRes.value.json());
          setReviews(reviewsData);
          if (reviewsData.length > 0) {
            const avgRating = reviewsData.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviewsData.length;
            newStats.averageRating = Math.round(avgRating * 10) / 10;
            newStats.totalReviews = reviewsData.length;
          }
        }

        setStats(newStats);
      } catch (err) {
        setError('Error al cargar los datos del dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [localId, API_BASE]);

  // Lógica de paginación usando useMemo para evitar recálculos
  const EARNINGS_PER_PAGE = 3;
  const REVIEWS_PER_PAGE = 2;
  const TOP_FOODS_PER_PAGE = 3;
  const ORDERS_PER_PAGE = 5;

  const paginationData = useMemo(() => {
    const totalEarningsPages = Math.ceil(monthlyEarnings.length / EARNINGS_PER_PAGE);
    const paginatedEarnings = monthlyEarnings.slice(
      earningsPage * EARNINGS_PER_PAGE,
      (earningsPage + 1) * EARNINGS_PER_PAGE
    );

    const totalReviewsPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
    const paginatedReviews = reviews.slice(
      reviewsPage * REVIEWS_PER_PAGE,
      (reviewsPage + 1) * REVIEWS_PER_PAGE
    );

    const totalTopFoodsPages = Math.ceil(topFoods.length / TOP_FOODS_PER_PAGE);
    const paginatedTopFoods = topFoods.slice(
      topFoodsPage * TOP_FOODS_PER_PAGE,
      (topFoodsPage + 1) * TOP_FOODS_PER_PAGE
    );

    const totalOrdersPages = Math.ceil(recentOrders.length / ORDERS_PER_PAGE);
    const paginatedOrders = recentOrders.slice(
      ordersPage * ORDERS_PER_PAGE,
      (ordersPage + 1) * ORDERS_PER_PAGE
    );

    return {
      earnings: { data: paginatedEarnings, totalPages: totalEarningsPages },
      reviews: { data: paginatedReviews, totalPages: totalReviewsPages },
      topFoods: { data: paginatedTopFoods, totalPages: totalTopFoodsPages },
      orders: { data: paginatedOrders, totalPages: totalOrdersPages }
    };
  }, [monthlyEarnings, reviews, topFoods, recentOrders, earningsPage, reviewsPage, topFoodsPage, ordersPage]);

  const formatCurrency = (amount: number) => `$${(amount ?? 0).toLocaleString('es-AR')}`;
  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-800/30 text-yellow-300',
      confirmed: 'bg-blue-800/30 text-blue-300',
      preparing: 'bg-purple-800/30 text-purple-300',
      ready: 'bg-green-800/30 text-green-300',
      delivered: 'bg-gray-700/30 text-gray-300',
      cancelled: 'bg-red-800/30 text-red-300'
    };
    return colors[status] || colors.pending;
  };
  const getStatusIcon = (status: Order['status']): LucideIcon => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      preparing: Package,
      ready: AlertCircle,
      delivered: CheckCircle,
      cancelled: AlertCircle
    };
    return icons[status] || Clock;
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Componente del gráfico memoizado para evitar re-renders innecesarios
  const EarningsCard = useMemo(() => {
    const totalYearRevenue = monthlyEarnings.reduce((sum, month) => sum + (month.total_earnings ?? 0), 0);

    // Obtener los datos del mes actual y el mes anterior
    const currentMonthData = monthlyEarnings.length > 0 ? monthlyEarnings[monthlyEarnings.length - 1] : null;
    const prevMonthData = monthlyEarnings.length > 1 ? monthlyEarnings[monthlyEarnings.length - 2] : null;

    let growthPercentage = 0;
    if (currentMonthData && prevMonthData && prevMonthData.total_earnings > 0) {
      growthPercentage = ((currentMonthData.total_earnings - prevMonthData.total_earnings) / prevMonthData.total_earnings) * 100;
    }

    const isPositiveGrowth = growthPercentage >= 0;
    const growthText = growthPercentage.toFixed(2);

    const formatCurrencyShort = (amount: number) => {
      if (amount >= 1e6) {
        return `${(amount / 1e6).toFixed(1)} mill.`;
      }
      return amount.toLocaleString('es-AR');
    };

    const chartData = monthlyEarnings.length === 1 
      ? [
          { month: '', total_earnings: 0, isPlaceholder: true },
          { ...monthlyEarnings[0], isPlaceholder: false },
          { month: '', total_earnings: 0, isPlaceholder: true }
        ]
      : monthlyEarnings.map(item => ({ ...item, isPlaceholder: false }));

    return (
      <div className="rounded-2xl p-6 text-white overflow-hidden relative shadow-lg
        bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
        <div className="relative z-10">
          <p className="text-lg text-gray-300 font-semibold mb-2">Promedio de ventas totales</p>
          <div className="flex items-end mb-4">
            <h2 className="text-4xl lg:text-5xl font-bold mr-4">{formatCurrency(totalYearRevenue)}</h2>
            {monthlyEarnings.length > 1 && (
              <div className="flex items-center text-sm">
                <span className={`flex items-center px-2 py-1 rounded-full ${isPositiveGrowth ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  <TrendingUp className={`w-4 h-4 mr-1 ${!isPositiveGrowth && 'rotate-180'}`} />
                  {growthText}%
                </span>
                <p className="ml-2 text-gray-400 text-sm">vs el mes anterior</p>
              </div>
            )}
          </div>
          {monthlyEarnings.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8484E4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8484E4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  stroke="#A0AEC0" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#CBD5E0', fontSize: 12 }}
                  hide={monthlyEarnings.length === 1}
                />
                <YAxis hide={true} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: 'rgba(50, 50, 50, 0.9)',
                    border: '1px solid rgba(80, 80, 80, 0.9)',
                    padding: '8px 12px',
                    color: 'white',
                    fontSize: '12px'
                  }}
                  labelFormatter={(label: string) => label ? `Mes: ${label}` : ''}
                  formatter={(value: number, _name: string, props: any) => {
                    if (props.payload.isPlaceholder) return ['', ''];
                    return [`Ingreso total\n${formatCurrencyShort(value)}`, ''];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total_earnings" 
                  stroke="#8484E4" 
                  strokeWidth={monthlyEarnings.length === 1 ? 0 : 2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  dot={(props: any) => {
                    if (props.payload.isPlaceholder) return <></>;
                    return (
                      <Dot
                        {...props}
                        r={monthlyEarnings.length === 1 ? 8 : 4}
                        fill="#8484E4"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={(props: any) => {
                    if (props.payload.isPlaceholder) return <></>;
                    return (
                      <Dot
                        {...props}
                        r={monthlyEarnings.length === 1 ? 10 : 6}
                        fill="#8484E4"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-400 h-full flex items-center justify-center">
              <p>No hay datos suficientes para mostrar el gráfico.</p>
            </div>
          )}
          {monthlyEarnings.length === 1 && (
            <p className="text-center text-gray-400 text-sm mt-2">
              {monthlyEarnings[0].month} - {monthlyEarnings[0].total_orders} pedidos
            </p>
          )}
        </div>
      </div>
    );
  }, [monthlyEarnings]);

  // Función helper para crear elementos vacíos para mantener altura fija
  const createEmptySlots = (currentItems: number, maxItems: number) => {
    const emptySlots = maxItems - currentItems;
    return Array.from({ length: Math.max(0, emptySlots) }, (_, index) => (
      <div key={`empty-${index}`} style={{ height: '64px' }} className="invisible" />
    ));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Cargando dashboard...</p>
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
    <div className="bgFood2 min-h-screen text-white">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl pt-12 font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400 mb-8">Panel de control del restaurante</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Pedidos" value={stats.totalOrders} icon={ShoppingBag} color="bg-blue-600" subtitle="Total de pedidos" />
            <StatCard title="Ingresos" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="bg-green-600" subtitle="Ingresos totales" />
            <StatCard title="Calificación" value={`${stats.averageRating}/5`} icon={Star} color="bg-yellow-600" subtitle={`${stats.totalReviews} reseñas`} />
            <StatCard title="Ingresos Hoy" value={formatCurrency(stats.totalTodayRevenue)} icon={Sun} color="bg-purple-600" subtitle="Ventas confirmadas del día" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              {monthlyEarnings.length > 0 ? (
                EarningsCard
              ) : (
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 text-center text-gray-500 h-full flex items-center justify-center">
                  <p>No hay datos suficientes para mostrar el gráfico de facturación mensual.</p>
                </div>
              )}
            </div>
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 lg:col-span-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Histórico de ingresos</h3>
                <div className="flex items-center space-x-2">
                  <button
                    type='button'
                    title='Anterior'
                    onClick={() => setEarningsPage(prev => Math.max(0, prev - 1))}
                    disabled={earningsPage === 0}
                    className="p-1 rounded-full bg-gray-700 text-gray-400 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type='button'
                    title='Siguiente'
                    onClick={() => setEarningsPage(prev => Math.min(paginationData.earnings.totalPages - 1, prev + 1))}
                    disabled={earningsPage >= paginationData.earnings.totalPages - 1}
                    className="p-1 rounded-full bg-gray-700 text-gray-400 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-4" style={{ minHeight: `${EARNINGS_PER_PAGE * (48 + 16)}px` }}>
                {paginationData.earnings.data.length > 0 ? (
                  <>
                    {paginationData.earnings.data.map((earning, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg hover:ring-1 hover:ring-gray-600 transition-all">
                        <div>
                          <p className="font-medium text-white">Ingresos {earning.month ?? '---'}</p>
                          <p className="text-sm text-gray-400">{earning.total_orders ?? 0} pedidos</p>
                        </div>
                        <p className="font-semibold text-white">{formatCurrency(earning.total_earnings)}</p>
                      </div>
                    ))}
                    {createEmptySlots(paginationData.earnings.data.length, EARNINGS_PER_PAGE)}
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay datos de ingresos</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Platos más vendidos</h3>
                <div className="flex items-center space-x-2">
                  <button
                    title='Anterior'
                    onClick={() => setTopFoodsPage(prev => Math.max(0, prev - 1))}
                    disabled={topFoodsPage === 0}
                    className="p-1 rounded-full bg-gray-700 text-gray-400 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    title='Siguiente'
                    onClick={() => setTopFoodsPage(prev => Math.min(paginationData.topFoods.totalPages - 1, prev + 1))}
                    disabled={topFoodsPage >= paginationData.topFoods.totalPages - 1}
                    className="p-1 rounded-full bg-gray-700 text-gray-400 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-4" style={{ minHeight: `${TOP_FOODS_PER_PAGE * (48 + 16) + 32}px` }}>
                <div className="grid grid-cols-4 gap-4 text-sm text-gray-400 font-medium pb-2 border-b border-gray-700">
                  <span>Plato</span><span>Precio</span><span>Vendidos</span><span>Estado</span>
                </div>
                {paginationData.topFoods.data.length > 0 ? (
                  <>
                    {paginationData.topFoods.data.map(food => (
                      <div key={food.food_id} className="grid grid-cols-4 gap-4 items-center bg-gray-700 p-3 rounded-lg hover:ring-1 hover:ring-gray-600 transition-all">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-700/20 rounded-lg flex items-center justify-center">
                            <span className="text-orange-300 text-sm font-medium">🍽️</span>
                          </div>
                          <span className="font-medium text-white truncate">{food.name ?? 'Sin nombre'}</span>
                        </div>
                        <span className="text-gray-300">{formatCurrency((food.total_revenue ?? 0) / Math.max(food.total_quantity, 1))}</span>
                        <span className="text-gray-300">{food.total_quantity ?? 0}</span>
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full">Activo</span>
                      </div>
                    ))}
                    {createEmptySlots(paginationData.topFoods.data.length, TOP_FOODS_PER_PAGE)}
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay datos de platos disponibles</p>
                )}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Reseñas recientes</h3>
                <div className="flex items-center space-x-2">
                  <button
                    title='Anterior'
                    onClick={() => setReviewsPage(prev => Math.max(0, prev - 1))}
                    disabled={reviewsPage === 0}
                    className="p-1 rounded-full bg-gray-700 text-gray-400 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
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
                                  <Star key={i} className={`w-4 h-4 ${i < (review.rating ?? 0) ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} />
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
          </div>

          <div className="mt-8 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Pedidos recientes</h3>
              <div className="flex items-center space-x-2">
                <button
                  type='button'
                  title='Anterior'
                  onClick={() => setOrdersPage(prev => Math.max(0, prev - 1))}
                  disabled={ordersPage === 0}
                  className="p-1 rounded-full bg-gray-700 text-gray-400 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type='button'
                  title='Siguiente'
                  onClick={() => setOrdersPage(prev => Math.min(paginationData.orders.totalPages - 1, prev + 1))}
                  disabled={ordersPage >= paginationData.orders.totalPages - 1}
                  className="p-1 rounded-full bg-gray-700 text-gray-400 disabled:opacity-50 hover:bg-gray-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Items</th>
                  </tr>
                </thead>
                <tbody style={{ minHeight: `${ORDERS_PER_PAGE * 56}px` }}>
                  {paginationData.orders.data.length > 0 ? (
                    <>
                      {paginationData.orders.data.map(order => {
                        const StatusIcon = getStatusIcon(order.status);
                        return (
                          <tr key={order.id} className="border-b border-gray-700 last:border-b-0">
                            <td className="py-3 px-4"><span className="font-medium text-white">{order.user?.name ?? 'Usuario desconocido'}</span></td>
                            <td className="py-3 px-4"><span className="font-semibold text-white">{formatCurrency(order.total)}</span></td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <StatusIcon className="w-4 h-4 text-white" />
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4"><span className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString('es-AR')}</span></td>
                            <td className="py-3 px-4"><span className="text-sm text-gray-400">{order.order_items.reduce((sum, i) => sum + (i.quantity ?? 0), 0)} items</span></td>
                          </tr>
                        );
                      })}
                      {Array.from({ length: Math.max(0, ORDERS_PER_PAGE - paginationData.orders.data.length) }, (_, index) => (
                        <tr key={`empty-order-${index}`} style={{ height: '56px' }} className="invisible">
                          <td className="py-3 px-4">&nbsp;</td>
                          <td className="py-3 px-4">&nbsp;</td>
                          <td className="py-3 px-4">&nbsp;</td>
                          <td className="py-3 px-4">&nbsp;</td>
                          <td className="py-3 px-4">&nbsp;</td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">No hay pedidos recientes</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;