'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Loader2,
  Sparkles,
  Edit,
  Wallet,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DayItinerary } from '@/components/map/ActivityCard';
import type { MapMarker, MapRoute } from '@/types/map';

// 动态导入地图组件
const TripMap = dynamic(
  () => import('@/components/map/TripMap').then((mod) => mod.TripMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    ),
  }
);

// 动态导入地图工具
const loadMapUtils = () =>
  import('@/lib/map/map-utils').then((mod) => ({
    extractMarkersFromItinerary: mod.extractMarkersFromItinerary,
    extractRoutesFromItinerary: mod.extractRoutesFromItinerary,
  }));

interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    description: string;
    estimatedCost?: number;
    duration?: string;
  }[];
  totalEstimatedCost: number;
  notes?: string;
}

interface Trip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  num_adults: number;
  num_children: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  preferences: Record<string, any>;
  itinerary: ItineraryDay[];
  created_at: string;
  updated_at: string;
}

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // 地图相关状态
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [mapRoutes, setMapRoutes] = useState<MapRoute[]>([]);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<
    string | undefined
  >();

  // 当前选中的天数
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTrip();
    }
  }, [status, params.id]);

  const fetchTrip = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/trips/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取行程详情失败');
      }

      setTrip(data.trip);
    } catch (err) {
      console.error('Error fetching trip:', err);
      setError(err instanceof Error ? err.message : '获取行程详情失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 从行程中提取地图数据
  useEffect(() => {
    let cancelled = false;

    const extractMapData = async () => {
      if (!trip?.itinerary || trip.itinerary.length === 0) {
        setMapMarkers([]);
        setMapRoutes([]);
        setIsLoadingMap(false);
        setMapError(null);
        return;
      }

      const destination = (trip.destination || '').toLowerCase();
      const isOverseas =
        destination.includes('日本') ||
        destination.includes('东京') ||
        destination.includes('大阪') ||
        destination.includes('韩国') ||
        destination.includes('泰国') ||
        destination.includes('新加坡') ||
        destination.includes('美国') ||
        destination.includes('英国') ||
        destination.includes('法国');

      if (isOverseas) {
        setMapError('地图功能目前仅支持中国境内目的地');
        setMapMarkers([]);
        setMapRoutes([]);
        setIsLoadingMap(false);
        return;
      }

      try {
        setIsLoadingMap(true);
        setMapError(null);

        const mapUtils = await loadMapUtils();
        if (cancelled) return;

        const markers = await mapUtils.extractMarkersFromItinerary(
          trip.itinerary,
          trip.destination
        );

        if (cancelled) return;

        const routes = await mapUtils.extractRoutesFromItinerary(
          trip.itinerary,
          markers
        );

        if (cancelled) return;

        setMapMarkers(markers);
        setMapRoutes(routes);

        if (markers.length === 0) {
          setMapError('未能从行程中提取到有效的地理位置信息');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('[地图加载] 错误:', err);
        const errorMessage =
          err instanceof Error ? err.message : '地图数据加载失败';
        setMapError(errorMessage);
        setMapMarkers([]);
        setMapRoutes([]);
      } finally {
        if (!cancelled) {
          setIsLoadingMap(false);
        }
      }
    };

    extractMapData();

    return () => {
      cancelled = true;
    };
  }, [trip?.itinerary, trip?.destination]);

  const handleGenerateItinerary = async () => {
    try {
      setIsGenerating(true);
      setGenerationError(null);

      const response = await fetch(`/api/trips/${params.id}/generate`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成行程失败');
      }

      setTrip(data.trip);
    } catch (err) {
      console.error('Error generating itinerary:', err);
      setGenerationError(
        err instanceof Error ? err.message : '生成行程失败，请稍后重试'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // 计算地图中心点
  const calculateMapCenter = (markers: MapMarker[]) => {
    if (markers.length === 0) {
      return {
        center: [116.397428, 39.90923] as [number, number],
        zoom: 12,
      };
    }

    if (markers.length === 1) {
      return {
        center: [markers[0].lng, markers[0].lat] as [number, number],
        zoom: 15,
      };
    }

    const sumLng = markers.reduce((sum, m) => sum + m.lng, 0);
    const sumLat = markers.reduce((sum, m) => sum + m.lat, 0);
    const centerLng = sumLng / markers.length;
    const centerLat = sumLat / markers.length;

    const lngSpan =
      Math.max(...markers.map((m) => m.lng)) -
      Math.min(...markers.map((m) => m.lng));
    const latSpan =
      Math.max(...markers.map((m) => m.lat)) -
      Math.min(...markers.map((m) => m.lat));
    const maxSpan = Math.max(lngSpan, latSpan);

    let zoom = 12;
    if (maxSpan > 10) zoom = 5;
    else if (maxSpan > 5) zoom = 7;
    else if (maxSpan > 1) zoom = 10;
    else if (maxSpan > 0.5) zoom = 12;
    else zoom = 14;

    return {
      center: [centerLng, centerLat] as [number, number],
      zoom,
    };
  };

  // 导航到指定活动
  const handleNavigateToActivity = (activity: any) => {
    const searchParams = new URLSearchParams({
      q: activity.location,
      src: 'AI旅行规划师',
    });
    window.open(
      `https://uri.amap.com/marker?${searchParams.toString()}`,
      '_blank'
    );
  };

  // 点击活动定位到地图
  const handleActivityClick = (activity: any, activityIndex: number) => {
    console.log('[TripDetailPage] 点击活动:', activity);
    console.log('[TripDetailPage] 所有标记:', mapMarkers);

    // 查找对应的地图标记
    const matchingMarker = mapMarkers.find((marker) => {
      const cleanedLocation = activity.location
        ?.split('→')[0]
        .trim()
        .replace(/附近|周边|一带/g, '')
        .trim();

      console.log('[TripDetailPage] 匹配尝试:', {
        markerName: marker.name,
        activityActivity: activity.activity,
        markerAddress: marker.address,
        cleanedLocation,
        originalLocation: activity.location,
      });

      return (
        marker.name === activity.activity ||
        marker.address === cleanedLocation ||
        marker.address === activity.location
      );
    });

    if (matchingMarker) {
      console.log('[TripDetailPage] 找到匹配标记:', matchingMarker);
      setSelectedMarkerId(matchingMarker.id);
    } else {
      console.warn('[TripDetailPage] 未找到匹配的地图标记:', activity);
      console.warn(
        '[TripDetailPage] 可用的标记:',
        mapMarkers.map((m) => ({ id: m.id, name: m.name, address: m.address }))
      );
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (error || !trip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600">{error || '行程不存在'}</p>
          <Button className="mt-4" onClick={() => router.push('/trips')}>
            返回行程列表
          </Button>
        </div>
      </div>
    );
  }

  const tripDuration =
    Math.ceil(
      (new Date(trip.end_date).getTime() -
        new Date(trip.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  // 当前选中天的数据
  const currentDayData = trip.itinerary?.find((d) => d.day === currentDay);

  // 根据当前天数筛选地图标记和路线
  const currentDayMarkers = currentDayData
    ? mapMarkers.filter((m) => m.day === currentDay)
    : mapMarkers;
  const currentDayRoutes = currentDayData
    ? mapRoutes.filter((r) => r.day === currentDay)
    : mapRoutes;

  // 调试日志
  console.log('[TripDetailPage] 地图状态:', {
    currentDay,
    totalMarkers: mapMarkers.length,
    currentDayMarkers: currentDayMarkers.length,
    totalRoutes: mapRoutes.length,
    currentDayRoutes: currentDayRoutes.length,
    isLoadingMap,
    mapError,
  });

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      {/* 顶部导航栏 - 移动端浮动，桌面端固定 */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md md:relative md:bg-white md:backdrop-blur-none">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/trips">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {trip.destination}
              </h1>
              <p className="hidden text-xs text-gray-600 md:block">
                {new Date(trip.start_date).toLocaleDateString('zh-CN')} -{' '}
                {new Date(trip.end_date).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100"
              onClick={() => router.push(`/trips/${params.id}/expenses`)}
            >
              <Wallet className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100"
            >
              <Edit className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容区域 - 响应式布局 */}
      <div className="flex h-[calc(100vh-60px)] flex-col md:h-[calc(100vh-68px)] md:flex-row">
        {/* 地图区域 */}
        <div className="relative h-1/2 bg-gray-100 md:h-full md:w-2/5 lg:w-1/2">
          {trip.itinerary && trip.itinerary.length > 0 ? (
            <>
              {isLoadingMap ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                    <p className="mt-2 text-sm text-gray-600">加载地图中...</p>
                  </div>
                </div>
              ) : mapError ? (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-md px-4 text-center">
                    <p className="text-sm text-gray-600">{mapError}</p>
                  </div>
                </div>
              ) : mapMarkers.length > 0 ? (
                <TripMap
                  markers={currentDayMarkers}
                  routes={currentDayRoutes}
                  options={calculateMapCenter(currentDayMarkers)}
                  height="100%"
                  showNavigation={false}
                  selectedMarkerId={selectedMarkerId}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-gray-600">未能提取地图数据</p>
                </div>
              )}

              {/* 移动端日期切换器 - 浮动在地图上 */}
              {trip.itinerary.length > 1 && (
                <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 md:hidden">
                  <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-lg">
                    <button
                      onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
                      disabled={currentDay <= 1}
                      className="rounded-full p-1.5 hover:bg-gray-100 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-700" />
                    </button>
                    <div className="flex flex-col items-center px-2">
                      <span className="text-sm font-bold text-gray-900">
                        第 {currentDay} 天
                      </span>
                      {trip.itinerary[currentDay - 1] && (
                        <span className="text-xs text-gray-500">
                          {trip.itinerary[currentDay - 1].date}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentDay(Math.min(tripDuration, currentDay + 1))
                      }
                      disabled={currentDay >= tripDuration}
                      className="rounded-full p-1.5 hover:bg-gray-100 disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* 未生成行程的空状态 */
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
              <div className="max-w-md px-6 text-center">
                <div className="mb-6 inline-flex rounded-full bg-white p-6 shadow-lg">
                  <Sparkles className="h-16 w-16 text-indigo-600" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">
                  还没有行程安排
                </h3>
                <p className="mb-6 text-gray-600">
                  点击下方按钮，让 AI 助手根据您的偏好生成个性化的旅行计划
                </p>
                {generationError && (
                  <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                    {generationError}
                  </div>
                )}
                <Button
                  size="lg"
                  onClick={handleGenerateItinerary}
                  disabled={isGenerating}
                  className="shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      生成 AI 行程
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 行程列表区域 */}
        {trip.itinerary && trip.itinerary.length > 0 && (
          <div className="flex h-1/2 flex-col overflow-hidden bg-white md:h-full md:w-3/5 lg:w-1/2">
            {/* 桌面端日期切换器 */}
            {trip.itinerary.length > 1 && (
              <div className="hidden items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 md:flex">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      第 {currentDay} 天 - {currentDayData?.title}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-600">
                      <span>{currentDayData?.date}</span>
                      {currentDayData?.totalEstimatedCost && (
                        <>
                          <span>·</span>
                          <span>预算 ¥{currentDayData.totalEstimatedCost}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
                    disabled={currentDay <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一天
                  </Button>
                  <span className="px-2 text-sm text-gray-600">
                    {currentDay} / {tripDuration}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentDay(Math.min(tripDuration, currentDay + 1))
                    }
                    disabled={currentDay >= tripDuration}
                  >
                    下一天
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 行程内容 - 可滚动 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
              {currentDayData ? (
                <DayItinerary
                  {...currentDayData}
                  onNavigate={handleNavigateToActivity}
                  onActivityClick={handleActivityClick}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <p>未找到该天的行程数据</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
