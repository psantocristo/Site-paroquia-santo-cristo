import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { Eye, Users, TrendingUp, Calendar, Loader, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface AnalyticsData {
  todayViews: number;
  monthViews: number;
  totalViews: number;
  uniqueSessionsToday: number;
  uniqueSessionsMonth: number;
  topPages: Array<{ path: string; views: number }>;
  recentViews: Array<{
    page_path: string;
    created_at: string;
  }>;
}

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    todayViews: 0,
    monthViews: 0,
    totalViews: 0,
    uniqueSessionsToday: 0,
    uniqueSessionsMonth: 0,
    topPages: [],
    recentViews: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchAnalytics();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    // Setup realtime subscription para atualizações em tempo real
    const channel = supabase
      .channel('page-views-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'page_views'
        },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Visitas de hoje
      const { count: todayCount } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfToday.toISOString());

      // Visitas do mês
      const { count: monthCount } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Total de visitas
      const { count: totalCount } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true });

      // Sessões únicas hoje
      const { data: todaySessions } = await supabase
        .from('page_views')
        .select('session_id')
        .gte('created_at', startOfToday.toISOString());

      const uniqueSessionsToday = new Set(
        todaySessions?.map(v => v.session_id).filter(Boolean)
      ).size;

      // Sessões únicas do mês
      const { data: monthSessions } = await supabase
        .from('page_views')
        .select('session_id')
        .gte('created_at', startOfMonth.toISOString());

      const uniqueSessionsMonth = new Set(
        monthSessions?.map(v => v.session_id).filter(Boolean)
      ).size;

      // Top páginas do mês
      const { data: topPagesData } = await supabase
        .from('page_views')
        .select('page_path')
        .gte('created_at', startOfMonth.toISOString());

      const pageCount = topPagesData?.reduce((acc: Record<string, number>, view) => {
        acc[view.page_path] = (acc[view.page_path] || 0) + 1;
        return acc;
      }, {});

      const topPages = Object.entries(pageCount || {})
        .map(([path, views]) => ({ path, views: views as number }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Visitas recentes
      const { data: recentViewsData } = await supabase
        .from('page_views')
        .select('page_path, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      setAnalytics({
        todayViews: todayCount || 0,
        monthViews: monthCount || 0,
        totalViews: totalCount || 0,
        uniqueSessionsToday,
        uniqueSessionsMonth,
        topPages,
        recentViews: (recentViewsData || []).filter(v => v.created_at !== null) as Array<{
          page_path: string;
          created_at: string;
        }>
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchAnalytics();
  };

  const formatPath = (path: string) => {
    if (path === '/') return 'Página Inicial';
    return path.replace(/^\//, '').split('/').map(segment => 
      segment.charAt(0).toUpperCase() + segment.slice(1)
    ).join(' / ');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading && analytics.totalViews === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin text-red-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Estatísticas de Visitas</h2>
          <p className="text-sm text-gray-600">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Visitas Hoje</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {analytics.todayViews.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Visitas Este Mês</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {analytics.monthViews.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Visitas</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {analytics.totalViews.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Visitantes Únicos Hoje</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {analytics.uniqueSessionsToday.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos e Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Páginas */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Páginas Mais Visitadas (Este Mês)
          </h3>
          <div className="space-y-3">
            {analytics.topPages.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhuma visita registrada ainda
              </p>
            ) : (
              analytics.topPages.map((page, index) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700 truncate">
                      {formatPath(page.path)}
                    </span>
                  </div>
                  <span className="flex-shrink-0 text-sm font-semibold text-gray-800 ml-2">
                    {page.views} visitas
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Visitas Recentes */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Visitas Recentes (Tempo Real)
          </h3>
          <div className="space-y-2">
            {analytics.recentViews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhuma visita registrada ainda
              </p>
            ) : (
              analytics.recentViews.map((view, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border-l-2 border-green-400 pl-3"
                >
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {formatPath(view.page_path)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTime(view.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <div className="text-blue-600 flex-shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Atualizações em tempo real:</strong> As estatísticas são atualizadas automaticamente a cada 30 segundos e em tempo real quando novos visitantes acessam o site.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
