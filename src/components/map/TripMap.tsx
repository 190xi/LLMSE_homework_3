'use client';

import React, { useEffect, useRef, useState } from 'react';
import { loadAMap } from '@/lib/map/amap-loader';
import type { MapMarker, MapRoute, MapOptions } from '@/types/map';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TripMapProps {
  /** 标记点集合 */
  markers?: MapMarker[];
  /** 路线集合 */
  routes?: MapRoute[];
  /** 地图配置 */
  options?: MapOptions;
  /** 地图容器高度 */
  height?: string;
  /** 点击标记回调 */
  onMarkerClick?: (marker: MapMarker) => void;
  /** 是否显示导航按钮 */
  showNavigation?: boolean;
  /** 选中的标记ID（用于高亮和定位） */
  selectedMarkerId?: string;
}

export function TripMap({
  markers = [],
  routes = [],
  options = {},
  height = '500px',
  onMarkerClick,
  showNavigation = true,
  selectedMarkerId,
}: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [AMap, setAMap] = useState<any>(null);

  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const markersDataRef = useRef<MapMarker[]>([]); // 存储标记数据

  // 初始化地图
  useEffect(() => {
    // 使用 setTimeout 确保 DOM 已经渲染
    const timer = setTimeout(() => {
      if (!mapContainer.current) {
        setError('地图容器初始化失败');
        setIsLoading(false);
        return;
      }

      const initMap = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const AMapInstance = await loadAMap();
          setAMap(AMapInstance);

          // 创建地图实例
          const mapInstance = new AMapInstance.Map(mapContainer.current, {
            zoom: options.zoom || 12,
            center: options.center || [116.397428, 39.90923], // 默认北京
            resizeEnable: true,
            mapStyle: 'amap://styles/normal', // 标准样式
          });

          // 添加控件
          if (options.showZoomControl !== false) {
            mapInstance.addControl(new AMapInstance.ToolBar());
          }

          if (options.showScaleControl !== false) {
            mapInstance.addControl(new AMapInstance.Scale());
          }

          // 创建信息窗口
          const infoWindow = new AMapInstance.InfoWindow({
            isCustom: false,
            offset: new AMapInstance.Pixel(0, -30),
          });
          infoWindowRef.current = infoWindow;

          setMap(mapInstance);
          setIsLoading(false);
        } catch (err) {
          console.error('地图初始化失败:', err);
          setError('地图加载失败，请刷新页面重试');
          setIsLoading(false);
        }
      };

      initMap();
    }, 0);

    // 清理函数
    return () => {
      clearTimeout(timer);
      if (map) {
        map.destroy();
      }
    };
  }, []);

  // 更新标记点
  useEffect(() => {
    if (!map || !AMap) return;

    // 清除旧标记
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    markersDataRef.current = []; // 清除标记数据

    // 如果没有标记，直接返回
    if (markers.length === 0) {
      console.log('[TripMap] 没有标记点数据');
      return;
    }

    console.log('[TripMap] 添加标记点:', markers.length);

    // 添加新标记
    const newMarkers: any[] = [];
    const bounds: any[] = [];

    markers.forEach((markerData, index) => {
      const position = new AMap.LngLat(markerData.lng, markerData.lat);
      bounds.push(position);

      // 根据类型选择图标
      let iconColor = '#1890ff';

      switch (markerData.type) {
        case 'hotel':
          iconColor = '#722ed1';
          break;
        case 'restaurant':
          iconColor = '#fa8c16';
          break;
        case 'attraction':
          iconColor = '#52c41a';
          break;
        default:
          iconColor = '#1890ff';
      }

      const marker = new AMap.Marker({
        position: position,
        title: markerData.name,
        // 使用 HTML 自定义标记样式
        content: `<div data-marker-id="${markerData.id}" style="
          background-color: ${iconColor};
          color: white;
          padding: 8px 12px;
          border-radius: 16px;
          font-size: 12px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer;
        ">${markerData.name}</div>`,
      });

      // 点击事件
      marker.on('click', () => {
        // 显示信息窗口
        if (infoWindowRef.current) {
          const content = `
            <div style="padding: 12px; min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
                ${markerData.name}
              </h4>
              ${
                markerData.address
                  ? `
                <p style="margin: 4px 0; font-size: 13px; color: #6b7280;">
                  📍 ${markerData.address}
                </p>
              `
                  : ''
              }
              ${
                markerData.description
                  ? `
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #374151;">
                  ${markerData.description}
                </p>
              `
                  : ''
              }
            </div>
          `;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(map, position);
        }

        // 调用回调
        onMarkerClick?.(markerData);
      });

      newMarkers.push(marker);
      // 存储标记数据，用于后续查找
      markersDataRef.current.push(markerData);
    });

    // 将标记添加到地图
    map.add(newMarkers);
    markersRef.current = newMarkers;

    console.log('[TripMap] 标记添加完成，调整视野');

    // 自动调整视野以显示所有标记
    if (bounds.length > 0) {
      map.setFitView(newMarkers, false, [50, 50, 50, 50]);
    }
  }, [map, AMap, markers, onMarkerClick]);

  // 更新地图中心点和缩放级别
  useEffect(() => {
    if (!map || !options) return;

    console.log('[TripMap] 更新地图中心和缩放:', options);

    if (options.center) {
      map.setCenter(options.center);
    }
    if (options.zoom) {
      map.setZoom(options.zoom);
    }
  }, [map, options]);

  // 更新路线
  useEffect(() => {
    if (!map || !AMap || routes.length === 0) return;

    // 清除旧路线
    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    // 添加新路线
    const newPolylines: any[] = [];

    routes.forEach((routeData) => {
      const path = routeData.path.map(
        (point) => new AMap.LngLat(point.lng, point.lat)
      );

      const polyline = new AMap.Polyline({
        path: path,
        strokeColor: routeData.color || '#1890ff',
        strokeWeight: routeData.width || 6,
        strokeOpacity: 0.8,
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 50,
      });

      newPolylines.push(polyline);
    });

    // 将路线添加到地图
    map.add(newPolylines);
    polylinesRef.current = newPolylines;
  }, [map, AMap, routes]);

  // 当选中标记改变时，定位并高亮显示
  useEffect(() => {
    if (!map || !AMap || !selectedMarkerId) return;

    console.log('[TripMap] 定位到标记:', selectedMarkerId);
    console.log(
      '[TripMap] 可用标记数据:',
      markersDataRef.current.map((m) => ({ id: m.id, name: m.name }))
    );

    // 通过存储的标记数据查找对应的 AMap 标记对象
    const markerIndex = markersDataRef.current.findIndex(
      (markerData) => markerData.id === selectedMarkerId
    );

    if (markerIndex === -1) {
      console.warn('[TripMap] 未找到标记数据:', selectedMarkerId);
      return;
    }

    const selectedMarker = markersRef.current[markerIndex];
    if (!selectedMarker) {
      console.warn(
        '[TripMap] 未找到标记对象:',
        selectedMarkerId,
        'index:',
        markerIndex
      );
      return;
    }

    console.log('[TripMap] 找到标记，准备定位');

    const position = selectedMarker.getPosition();

    // 先设置缩放级别和中心点
    map.setZoomAndCenter(16, position);

    // 延迟打开信息窗口，确保地图先定位完成
    setTimeout(() => {
      // 打开信息窗口
      if (infoWindowRef.current) {
        // 触发标记点击事件来显示信息窗口
        selectedMarker.emit('click');
      }

      // 信息窗口打开后，再次调整中心点以确保标记在屏幕中央
      setTimeout(() => {
        map.setCenter(position);
      }, 100);
    }, 300);
  }, [map, AMap, selectedMarkerId]);

  // 导航到第一个标记点
  const handleNavigate = () => {
    if (markers.length === 0) return;

    const firstMarker = markers[0];
    const destination = `${firstMarker.lat},${firstMarker.lng}`;

    // 打开高德地图导航
    window.open(
      `https://uri.amap.com/navigation?to=${destination},${encodeURIComponent(firstMarker.name)}&mode=car&policy=1&src=myapp&coordinate=gaode&callnative=1`,
      '_blank'
    );
  };

  return (
    <div className="relative" style={{ height }}>
      {/* 地图容器 - 始终渲染以便 ref 可以附加 */}
      <div ref={mapContainer} className="h-full w-full rounded-lg" />

      {/* 加载状态覆盖层 */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-gray-100">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-2 text-sm text-gray-600">加载地图中...</p>
          </div>
        </div>
      )}

      {/* 错误状态覆盖层 */}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-gray-100">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              重新加载
            </Button>
          </div>
        </div>
      )}

      {/* 导航按钮 */}
      {showNavigation && markers.length > 0 && (
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={handleNavigate}
            className="bg-indigo-600 shadow-lg hover:bg-indigo-700"
          >
            <Navigation className="mr-2 h-4 w-4" />
            开始导航
          </Button>
        </div>
      )}

      {/* 图例 */}
      {markers.length > 0 && (
        <div className="absolute left-4 top-4 rounded-lg bg-white p-3 shadow-lg">
          <div className="space-y-2 text-xs">
            {markers.some((m) => m.type === 'attraction') && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#52c41a]" />
                <span>景点</span>
              </div>
            )}
            {markers.some((m) => m.type === 'restaurant') && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#fa8c16]" />
                <span>餐厅</span>
              </div>
            )}
            {markers.some((m) => m.type === 'hotel') && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#722ed1]" />
                <span>酒店</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
