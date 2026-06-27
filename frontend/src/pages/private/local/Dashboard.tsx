/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Star, DollarSign, ShoppingBag, Clock, Sun, Package, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, TrendingUp, HelpCircle, X, Lock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AuthContext } from '@/context/auth/AuthContext';
import { useSocket } from '@context/other/SocketContext';
import { AreaChart, XAxis, YAxis, Tooltip, Area, ResponsiveContainer, Dot } from 'recharts';
import { useNavigate } from 'react-router-dom';
import '@assets/scss/private/users/users.scss';
import React from 'react';

// ----------------------------------------------------------------------
// Interfaces de Datos
// ----------------------------------------------------------------------
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

// Interfaz para las dimensiones del elemento enfocado
interface Bounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Interfaz para los pasos del tour
interface TourStep {
  id: number;
  title: string;
  text: string;
  selector: string;
  placement: 'right' | 'left' | 'top' | 'bottom'; // Posicionamiento relativo al elemento
}


// ----------------------------------------------------------------------
// Definición del Tour Manual
// ----------------------------------------------------------------------
const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: "Bienvenido al Panel",
    text: "Este tutorial le guiará por las secciones más importantes de su panel de control. Haga clic en Siguiente para comenzar.",
    selector: "#help-button",
    placement: "left",
  },
  {
    id: 2,
    title: "Estadísticas Clave (KPIs)",
    text: "Métricas esenciales de un vistazo: Total de pedidos, Ingresos, Calificación promedio y las ventas del día.",
    selector: "#stats-container",
    placement: "bottom",
  },
  {
    id: 3,
    title: "Gráfico de Ventas Mensuales",
    text: "Análisis visual de sus ingresos a lo largo del año y comparación de crecimiento mensual.",
    selector: "[data-tour-id='earnings-chart']",
    placement: "right",
  },
  {
    id: 4,
    title: "Platos Más Vendidos",
    text: "Identifique rápidamente qué elementos del menú están generando la mayor demanda.",
    selector: "[data-tour-id='top-foods-card']",
    placement: "right",
  },
  {
    id: 5,
    title: "Reseñas y Feedback",
    text: "Manténgase al tanto de la satisfacción del cliente y consulte el comentario y la calificación otorgada.",
    selector: "[data-tour-id='recent-reviews-card']",
    placement: "left",
  },
  {
    id: 6,
    title: "Pedidos Recientes",
    text: "La tabla le permite ver el detalle y el estado de los últimos pedidos realizados por sus clientes.",
    selector: "[data-tour-id='recent-orders-card']",
    placement: "top",
  },
];

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

const calculateTodayRevenueFromOrders = (orders: any[]): number => {
  return orders
    .filter(order => {
      if (!isToday(order.created_at)) return false;
      const s = order.status?.toUpperCase();
      return s === 'PAID' || s === 'COMPLETED' || s === 'READY';
    })
    .reduce((sum, order) => sum + (Number(order.total) || 0), 0);
};

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const { socket } = useSocket();
  const [localId, setLocalId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    totalTodayRevenue: 0,
  });

  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const navigate = useNavigate();

  // ----------------------------------------------------------------------
  // Estados del Tour Manual
  // ----------------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState(0);
  const isTourOpen = currentStep > 0;

  // Función para iniciar/cerrar el tour
  const startTour = () => setCurrentStep(1);
  const closeTour = () => setCurrentStep(0);
  const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, TOUR_STEPS.length));
  const goToPrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const activeStep = TOUR_STEPS.find(step => step.id === currentStep);

  // ----------------------------------------------------------------------

  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [topFoods, setTopFoods] = useState<TopFood[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<LocalReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [earningsPage, setEarningsPage] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [topFoodsPage, setTopFoodsPage] = useState(0);
  const [ordersPage, setOrdersPage] = useState(0);

  const [earningsRange, setEarningsRange] = useState<'week' | 'month' | '6months' | 'year'>('week');
  const [previousPeriodEarnings, setPreviousPeriodEarnings] = useState<number>(0);
  const [earningsLoading, setEarningsLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';



  // ----------------------------------------------------------------------
  // Efectos de Autenticación y Carga de Datos
  // ----------------------------------------------------------------------
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

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!localId) return;
    if (!silent) setLoading(true);
    setError(null);

    const currentYear = new Date().getFullYear();
    const fromDate = `${currentYear}-01-01T00:00:00Z`;
    const toDate = `${currentYear}-12-31T23:59:59Z`;

    try {
      const [ordersRes, topFoodsRes, reviewsRes, subscriptionRes] = await Promise.allSettled([
        fetch(`${API_BASE}/order/locals/${localId}/orders`),

        fetch(`${API_BASE}/local/statistics/${localId}/top-foods?from=${fromDate}&to=${toDate}`),

        fetch(`${API_BASE}/review/local/${localId}`),

        fetch(`${API_BASE}/subscription/local/${localId}`),
      ]);

      let newStats = {
        totalOrders: 0,
        totalRevenue: 0,
        averageRating: 0,
        totalReviews: 0,
        totalTodayRevenue: 0,
      };

      if (subscriptionRes.status === 'fulfilled') {
        if (subscriptionRes.value.ok) {
          const subData = await subscriptionRes.value.json();
          setHasActiveSubscription(subData?.status === 'active');
        } else {
          setHasActiveSubscription(false);
        }
      }
      setSubscriptionChecked(true);

      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        const orders: Order[] = parseArray<Order>(await ordersRes.value.json());
        setRecentOrders(orders);
        newStats.totalOrders = orders.length;
        newStats.totalRevenue = orders
          .filter(o => {
            const s = o.status?.toUpperCase();
            return s === 'PAID' || s === 'COMPLETED';
          })
          .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        newStats.totalTodayRevenue = calculateTodayRevenueFromOrders(orders);
      }

      if (topFoodsRes.status === 'fulfilled' && topFoodsRes.value.ok) {
        const topFoodsData = await topFoodsRes.value.json();
        const parsedTopFoods: TopFood[] = parseArray(topFoodsData.top_foods);
        setTopFoods(parsedTopFoods);
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
    } finally {
      setLoading(false);
    }
  }, [localId, API_BASE]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchEarnings = useCallback(async (silent = false) => {
    if (!localId) return;
    if (!silent) setEarningsLoading(true);

    try {
      const today = new Date();
      let fromDate = new Date();
      let prevFromDate = new Date();
      let prevToDate = new Date();
      let groupBy = 'month';

      switch (earningsRange) {
        case 'week':
          fromDate.setDate(today.getDate() - 7);
          prevToDate = new Date(fromDate);
          prevFromDate.setDate(today.getDate() - 14);
          groupBy = 'day';
          break;
        case 'month':
          fromDate.setMonth(today.getMonth() - 1);
          prevToDate = new Date(fromDate);
          prevFromDate.setMonth(today.getMonth() - 2);
          groupBy = 'day';
          break;
        case '6months':
          fromDate.setMonth(today.getMonth() - 6);
          prevToDate = new Date(fromDate);
          prevFromDate.setMonth(today.getMonth() - 12);
          groupBy = 'month';
          break;
        case 'year':
        default:
          fromDate.setFullYear(today.getFullYear() - 1);
          prevToDate = new Date(fromDate);
          prevFromDate.setFullYear(today.getFullYear() - 2);
          groupBy = 'month';
          break;
      }

      const fromStr = fromDate.toISOString();
      const toStr = today.toISOString();

      // 1. Fetch current period
      const res = await fetch(`${API_BASE}/local/statistics/${localId}/monthly-earnings?from=${fromStr}&to=${toStr}&groupBy=${groupBy}`);
      // 2. Fetch previous period
      const prevRes = await fetch(`${API_BASE}/local/statistics/${localId}/monthly-earnings?from=${prevFromDate.toISOString()}&to=${prevToDate.toISOString()}&groupBy=${groupBy}`);

      if (prevRes.ok) {
        const prevRawData = await prevRes.json();
        const prevParsedData = parseArray(prevRawData);
        const prevTotal = prevParsedData.reduce((sum: number, e: any) => sum + (Number(e.ganancia) || 0), 0);
        setPreviousPeriodEarnings(prevTotal);
      } else {
        setPreviousPeriodEarnings(0);
      }
      if (res.ok) {
        const rawData = await res.json();
        const parsedData = parseArray(rawData).filter((e: any) => e.ganancia && e.ganancia > 0);

        const formatted = parsedData.map((e: any) => {
          let label = e.period;
          if (groupBy === 'day') {
            const [y, m, d] = e.period.split("-");
            label = new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("es-AR", { day: 'numeric', month: 'short' });
          } else if (groupBy === 'month') {
            const [y, m] = e.period.split("-");
            label = new Date(Number(y), Number(m) - 1).toLocaleDateString("es-AR", { month: 'short', year: '2-digit' });
          } else if (groupBy === 'year') {
            label = e.period;
          }
          return {
            month: label, // We keep the key 'month' to avoid changing the recharts config below
            sortKey: e.period,
            total_earnings: e.ganancia ?? 0,
            total_orders: e.pedidos ?? 0,
          };
        });

        setMonthlyEarnings(formatted.sort((a: any, b: any) => a.sortKey.localeCompare(b.sortKey)));
      }
    } catch (err) {
      console.error("Error fetching earnings", err);
    } finally {
      setEarningsLoading(false);
    }
  }, [localId, API_BASE, earningsRange]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  // ⚡️ Reactividad en tiempo real vía WebSockets para recargar estadísticas, órdenes, gráfico y reseñas
  useEffect(() => {
    if (!socket || !localId) return;

    const handleRealTimeUpdate = (data: any) => {
      // Validar si el evento corresponde al local activo
      if (data && String(data.localId) === String(localId)) {
        console.log(`[Socket] Actualización en vivo recibida. Recargando Dashboard...`);
        fetchDashboardData(true);
        fetchEarnings(true);
      }
    };

    socket.on("new_order_local", handleRealTimeUpdate);
    socket.on("order_status_updated", handleRealTimeUpdate);
    socket.on("new_review_local", handleRealTimeUpdate);

    return () => {
      socket.off("new_order_local", handleRealTimeUpdate);
      socket.off("order_status_updated", handleRealTimeUpdate);
      socket.off("new_review_local", handleRealTimeUpdate);
    };
  }, [socket, localId, fetchDashboardData, fetchEarnings]);

  // ----------------------------------------------------------------------
  // Lógica de Paginación y Helpers
  // ----------------------------------------------------------------------
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

  const StatCard = ({ title, value, icon: Icon, color, subtitle, stepId }: {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    subtitle?: string;
    stepId: string;
  }) => (
    <div
      className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      data-tour-id={stepId}
    >
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

  const EarningsCard = useMemo(() => {
    const totalRevenue = monthlyEarnings.reduce((sum, item) => sum + (item.total_earnings ?? 0), 0);

    let growthPercentage = 0;
    if (previousPeriodEarnings > 0) {
      growthPercentage = ((totalRevenue - previousPeriodEarnings) / previousPeriodEarnings) * 100;
    } else if (totalRevenue > 0) {
      // If previous was 0 but we have revenue now, growth is functionally 100% (or infinite, we cap it at 100% for display)
      growthPercentage = 100;
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
      ?
      [
        { month: '', total_earnings: 0, isPlaceholder: true },
        { ...monthlyEarnings[0], isPlaceholder: false },
        { month: '', total_earnings: 0, isPlaceholder: true }
      ]
      : monthlyEarnings.map(item => ({ ...item, isPlaceholder: false }));

    return (
      <div
        className="rounded-2xl p-6 text-white overflow-hidden relative shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700"
        data-tour-id="earnings-chart"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg text-gray-300 font-semibold">Ganancias Totales</p>
            <select
              value={earningsRange}
              onChange={(e) => setEarningsRange(e.target.value as any)}
              className="bg-gray-800 text-sm text-gray-300 border border-gray-600 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
              <option value="6months">Últimos 6 Meses</option>
              <option value="year">Este Año</option>
            </select>
          </div>
          <div className="flex items-end mb-4">
            <h2 className="text-4xl lg:text-5xl font-bold mr-4">{formatCurrency(totalRevenue)}</h2>
            {monthlyEarnings.length > 1 && (
              <div className="flex items-center text-sm">
                <span className={`flex items-center px-2 py-1 rounded-full ${isPositiveGrowth ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  <TrendingUp className={`w-4 h-4 mr-1 ${!isPositiveGrowth && 'rotate-180'}`} />
                  {growthText}%
                </span>
                <p className="ml-2 text-gray-400 text-sm">vs período anterior</p>
              </div>
            )}
            {earningsLoading && <span className="ml-4 text-sm text-gray-400 animate-pulse">Cargando...</span>}
          </div>
          {monthlyEarnings.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"
                      stopColor="#8484E4" stopOpacity={0.8} />
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
                  labelFormatter={(label: any) => label ?
                    `${label}` : ''}
                  formatter={(value: any, _name: any, props: any) => {
                    if (props?.payload?.isPlaceholder) return ['', ''];
                    return [`Ingreso total\n${formatCurrencyShort(Number(value))}`, ''];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total_earnings"
                  stroke="#8484E4"
                  strokeWidth={monthlyEarnings.length === 1 ?
                    0 : 2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  dot={({ key, ...restProps }: any) => {
                    if (restProps.payload.isPlaceholder) return <></>;
                    return (
                      <Dot
                        key={key}
                        {...restProps}
                        r={monthlyEarnings.length === 1 ? 8 : 4}
                        fill="#8484E4"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={({ key, ...restProps }: any) => {
                    if (restProps.payload.isPlaceholder) return <></>;
                    return (
                      <Dot
                        key={key}
                        {...restProps}
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
  }, [monthlyEarnings, earningsRange, earningsLoading, previousPeriodEarnings]);

  const createEmptySlots = (currentItems: number, maxItems: number) => {
    const emptySlots = maxItems - currentItems;
    return Array.from({ length: Math.max(0, emptySlots) }, (_, index) => (
      <div key={`empty-${index}`} style={{ height: '64px' }} className="invisible" />
    ));
  };

  // ----------------------------------------------------------------------
  // Componente Modal Flotante del Tour
  // ----------------------------------------------------------------------
  const TourModal = () => {
    // Almacena las coordenadas del elemento objetivo RELATIVAS AL VIEWPORT
    const [bounds, setBounds] = useState<Bounds | null>(null);
    const modalRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!activeStep) return;

      const element = document.querySelector(activeStep.selector) as HTMLElement;
      if (!element) return;

      // 1. Desplazar la página si el elemento no está en la vista
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const updateBoundsAndPosition = () => {
        const rect = element.getBoundingClientRect();

        const padding = 10;

        // Las bounds son RELATIVAS AL VIEWPORT (posición fija)
        setBounds({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + 2 * padding,
          height: rect.height + 2 * padding,
        });

        // 2. Calcular la posición del MODAL (está fijo, por lo que usa coordenadas de la ventana)
        if (modalRef.current) {
          let modalStyle: React.CSSProperties = { top: 0, left: 0 };

          const OFFSET_DISTANCE = 25;
          const MODAL_WIDTH = 320;
          const MODAL_HEIGHT = 180; // Altura aproximada

          // Calcular la posición del modal usando coordenadas de la VENTANA (rect)
          switch (activeStep.placement) {
            case 'right':
              modalStyle.top = rect.top + (rect.height / 2) - (MODAL_HEIGHT / 2);
              modalStyle.left = rect.left + rect.width + OFFSET_DISTANCE;
              break;
            case 'left':
              modalStyle.top = rect.top + (rect.height / 2) - (MODAL_HEIGHT / 2);
              modalStyle.left = rect.left - MODAL_WIDTH - OFFSET_DISTANCE;
              break;
            case 'top':
              modalStyle.left = rect.left + (rect.width / 2) - (MODAL_WIDTH / 2);
              modalStyle.top = rect.top - MODAL_HEIGHT - OFFSET_DISTANCE;
              break;
            case 'bottom':
              modalStyle.left = rect.left + (rect.width / 2) - (MODAL_WIDTH / 2);
              modalStyle.top = rect.top + rect.height + OFFSET_DISTANCE;
              break;
          }

          // Aseguramos que el modal no se salga de los bordes de la ventana
          if (modalStyle.left && (modalStyle.left as number) + MODAL_WIDTH > window.innerWidth - 20) {
            modalStyle.left = window.innerWidth - MODAL_WIDTH - 20;
          }
          if (modalStyle.left && (modalStyle.left as number) < 20) {
            modalStyle.left = 20;
          }

          // Aplicar estilos directamente (necesario para el posicionamiento dinámico en un fixed container)
          modalRef.current.style.top = `${modalStyle.top}px`;
          modalRef.current.style.left = `${modalStyle.left}px`;
          modalRef.current.style.transform = `none`;
        }
      };

      // Pequeño retardo para dar tiempo al scroll 'smooth'
      const timeout = setTimeout(updateBoundsAndPosition, 350);

      updateBoundsAndPosition();
      window.addEventListener('resize', updateBoundsAndPosition);
      window.addEventListener('scroll', updateBoundsAndPosition);

      // Usamos un observer para detectar cambios de posición en el elemento (por ejemplo, si usa transform o flex)
      const observer = new MutationObserver(updateBoundsAndPosition);
      observer.observe(document.body, { attributes: true, childList: true, subtree: true });

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('resize', updateBoundsAndPosition);
        window.removeEventListener('scroll', updateBoundsAndPosition);
        observer.disconnect();
      };
    }, [activeStep]);

    if (!isTourOpen || !activeStep || !bounds) return null;

    const totalSteps = TOUR_STEPS.length;
    const isFirst = activeStep.id === 1;
    const isLast = activeStep.id === totalSteps;


    return (
      // Contenedor principal con posicionamiento FIXED (estable al scroll)
      <div className="fixed inset-0 z-[1000] pointer-events-none">

        {/* Overlay Oscuro (Dividido en 4 partes para crear el "agujero") */}
        <div className="absolute inset-0 bg-transparent">
          {/* Top Shade */}
          <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{
            top: 0, left: 0, right: 0, height: bounds.top,
          }}></div>
          {/* Bottom Shade */}
          <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{
            top: bounds.top + bounds.height, left: 0, right: 0, bottom: 0,
          }}></div>
          {/* Left Shade */}
          <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{
            top: bounds.top, left: 0, width: bounds.left, height: bounds.height,
          }}></div>
          {/* Right Shade */}
          <div className="bg-gray-900/80 transition-all duration-300 fixed" style={{
            top: bounds.top, left: bounds.left + bounds.width, right: 0, height: bounds.height,
          }}></div>
        </div>

        {/* Contenedor del modal (usando posición fija para que se quede en pantalla) */}
        <div
          ref={modalRef} // Referencia para aplicar estilos de posición
          className="fixed z-[1001] w-80 p-0 rounded-xl shadow-2xl transition-all duration-300"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="bg-gray-800 p-4 rounded-xl border border-purple-600 shadow-xl relative">
            {/* Botón de Cierre (Arriba a la derecha) */}
            <button
              onClick={closeTour}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700/50"
              aria-label="Cerrar tutorial"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-purple-400 mb-2 border-b border-gray-700 pb-2 pr-8">
              {activeStep.title}
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              {activeStep.text}
            </p>

            <div className="flex justify-between items-center pt-3 border-t border-gray-700">
              <div className="text-xs text-purple-400 font-medium">
                Paso {currentStep} de {totalSteps}
              </div>
              <div className="flex space-x-2">
                {/* Botón Anterior */}
                {!isFirst && (
                  <button
                    onClick={goToPrevStep}
                    className="px-3 py-1 text-sm rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                  >
                    Anterior
                  </button>
                )}

                {/* Botón Siguiente / Finalizar */}
                {!isLast ? (
                  <button
                    onClick={goToNextStep}
                    className="px-3 py-1 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                  >
                    {isFirst ? 'Comenzar' : 'Siguiente'}
                  </button>
                ) : (
                  <button
                    onClick={closeTour}
                    className="px-3 py-1 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
                  >
                    Finalizar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------------------------
  // Renderizado (Loading, Error, y Contenido Principal)
  // ----------------------------------------------------------------------
  if (loading || (!subscriptionChecked && !error)) return (
    <div className="BGLocal min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Cargando dashboard...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="BGLocal min-h-screen flex items-center justify-center">
      <div className="text-center p-6 bg-gray-800 rounded-xl shadow-lg border border-red-700 text-red-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="font-semibold text-lg mb-2">Error al cargar el panel de control</p>
        <p>{error}</p>
      </div>
    </div>
  );

  if (subscriptionChecked && !hasActiveSubscription) {
    return (
      <div className="BGLocal min-h-screen text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg text-center border border-gray-700">
          <div className="bg-amber-500/10 p-4 rounded-full inline-block mb-4 border border-amber-500/20">
            <Lock className="w-12 h-12 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Función Exclusiva PRO</h1>
          <p className="text-gray-400 mb-8">El Dashboard interactivo con estadísticas avanzadas es una herramienta exclusiva para los suscriptores del <span className="text-amber-400 font-semibold">Plan Mensual PRO</span>. ¡Potencia tu local hoy!</p>
          <button
            onClick={() => navigate('/business/subscription')}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-900 font-bold rounded-lg transition-all"
          >
            Ver Detalles del Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="BGLocal min-h-screen text-white relative">

      {/* Componente Modal del Tour */}
      <TourModal />

      {/* Botón de Ayuda "?" */}
      <button
        id="help-button" // ID para el tour
        onClick={isTourOpen ? closeTour : startTour}
        className={`fixed top-20 right-6 z-[1002] p-3 rounded-full 
                     ${isTourOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white 
                     shadow-lg transition-transform duration-300 transform hover:scale-110`}
        title={isTourOpen ? "Cerrar Tutorial" : "Mostrar Tutorial"}
      >
        {isTourOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
      </button>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl pt-12 font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400 mb-8">Panel de control del restaurante</p>

          {/* Contenedor de Tarjetas de Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="stats-container">
            <StatCard title="Pedidos" value={stats.totalOrders} icon={ShoppingBag} color="bg-blue-600" subtitle="Total de pedidos" stepId="stat-pedidos" />
            <StatCard title="Ingresos" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="bg-green-600" subtitle="Ingresos totales" stepId="stat-ingresos" />
            <StatCard title="Calificación" value={`${stats.averageRating}/5`} icon={Star} color="bg-yellow-600" subtitle={`${stats.totalReviews} reseñas`} stepId="stat-calificacion" />
            <StatCard title="Ingresos Hoy" value={formatCurrency(stats.totalTodayRevenue)} icon={Sun} color="bg-purple-600" subtitle="Ventas confirmadas del día" stepId="stat-ingresos-hoy" />
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
            {/* Histórico de Ingresos (Panel lateral) */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 lg:col-span-1" data-tour-id="earnings-history">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Histórico de ingresos</h3>
                <div className="flex items-center space-x-2">
                  <button
                    type='button'
                    title='Anterior'
                    onClick={() => setEarningsPage(prev => Math.max(0, prev -
                      1))}
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
            {/* Platos más Vendidos */}
            <div
              className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
              data-tour-id="top-foods-card"
            >
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
                <div className="grid grid-cols-4 gap-4 text-sm text-gray-400 
                    font-medium pb-2 border-b border-gray-700">
                  <span>Plato</span><span>Precio</span><span>Vendidos</span><span>Estado</span>
                </div>
                {paginationData.topFoods.data.length > 0 ? (
                  <>
                    {paginationData.topFoods.data.map(food => (
                      <div key={food.food_id} className="grid grid-cols-4 gap-4 items-center bg-gray-700 p-3 rounded-lg hover:ring-1 hover:ring-gray-600 transition-all">
                        <div className="flex items-center 
                            space-x-3">
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

            {/* Reseñas Recientes */}
            <div
              className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
              data-tour-id="recent-reviews-card"
            >
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
                        <div className="flex 
                            items-start space-x-3">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            {review.user?.avatar_url ? (
                              <img src={review.user.avatar_url} alt={review.user?.name ?? 'Usuario'} className="w-10 
                                  h-10 rounded-full object-cover" />
                            ) : (
                              <span className="text-gray-400 text-sm font-medium">{(review.user?.name?.charAt(0) ?? '?').toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-white">{review.user?.name ??
                                'Anónimo'}</span>
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

          {/* Pedidos Recientes */}
          <div
            className="mt-8 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
            data-tour-id="recent-orders-card"
          >
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
                            <td className="py-3 px-4"><span className="font-semibold 
                                text-white">{formatCurrency(order.total)}</span></td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <StatusIcon className="w-4 h-4 text-white" />
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4"><span className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString('es-AR')}</span></td>
                            <td className="py-3 px-4"><span className="text-sm text-gray-400">{order.order_items.reduce((sum, i) => sum + (i.quantity ??
                              0), 0)} items</span></td>
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