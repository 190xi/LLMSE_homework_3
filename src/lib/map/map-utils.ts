/**
 * 地图数据处理工具函数
 */

import type { MapMarker, MapRoute } from '@/types/map';
import { geocodeAddress } from './amap-loader';

/**
 * 简化和清理地址字符串
 */
function cleanAddress(address: string): string {
  // 移除箭头和其后内容（如 "南京南站 → 新街口附近酒店" -> "南京南站"）
  let cleaned = address.split('→')[0].trim();
  cleaned = cleaned.split('->')[0].trim();

  // 移除括号内容
  cleaned = cleaned.replace(/[（(].*?[)）]/g, '').trim();

  // 移除"附近"等模糊词
  cleaned = cleaned.replace(/附近|周边|一带/g, '').trim();

  return cleaned;
}

/**
 * 从地址中提取城市名称
 * 支持格式：上海外滩、杭州西湖、南京夫子庙等
 */
function extractCityFromAddress(address: string): string | null {
  // 中国主要城市列表（常见的旅游城市）
  const cities = [
    '北京',
    '上海',
    '天津',
    '重庆',
    '广州',
    '深圳',
    '杭州',
    '南京',
    '苏州',
    '成都',
    '武汉',
    '西安',
    '厦门',
    '青岛',
    '大连',
    '沈阳',
    '哈尔滨',
    '长春',
    '郑州',
    '济南',
    '合肥',
    '南昌',
    '长沙',
    '福州',
    '石家庄',
    '太原',
    '呼和浩特',
    '兰州',
    '西宁',
    '银川',
    '乌鲁木齐',
    '昆明',
    '贵阳',
    '南宁',
    '海口',
    '三亚',
    '拉萨',
    '香港',
    '澳门',
    '台北',
  ];

  // 检查地址开头是否包含城市名
  for (const city of cities) {
    if (address.startsWith(city)) {
      return city;
    }
  }

  return null;
}

/**
 * 从行程活动中提取地图标记（并发优化版本）
 * @param itinerary 行程数据
 * @param destination 目的地城市，用于地理编码时限定范围
 */
export async function extractMarkersFromItinerary(
  itinerary: any[],
  destination?: string
): Promise<MapMarker[]> {
  const markers: MapMarker[] = [];
  const processedLocations = new Set<string>();
  const geocodeTasks: Promise<void>[] = [];

  // 从目的地中提取城市名称（去除"市"等后缀）
  const city = destination
    ? destination.replace(/市|省|自治区|特别行政区/g, '').trim()
    : undefined;

  for (const day of itinerary) {
    if (!day.activities || !Array.isArray(day.activities)) continue;

    for (const activity of day.activities) {
      const rawLocation = activity.location;
      if (!rawLocation) continue;

      // 清理地址
      const location = cleanAddress(rawLocation);
      if (!location || processedLocations.has(location)) continue;

      processedLocations.add(location);

      // 并发处理，不要串行等待
      const task = (async () => {
        try {
          let coords: { lng: number; lat: number } | null = null;

          // 优先使用AI生成的坐标（如果存在且有效）
          if (
            activity.coordinates &&
            typeof activity.coordinates.lng === 'number' &&
            typeof activity.coordinates.lat === 'number' &&
            !isNaN(activity.coordinates.lng) &&
            !isNaN(activity.coordinates.lat)
          ) {
            coords = {
              lng: activity.coordinates.lng,
              lat: activity.coordinates.lat,
            };
          } else {
            // 没有坐标时，进行地理编码
            // 优先从地址中提取城市，如果没有再使用destination
            const addressToGeocode = activity.fullAddress || location;
            const addressCity = extractCityFromAddress(addressToGeocode);
            const geocodeCity = addressCity || city;

            // 传入城市参数，缩短超时到3秒
            coords = await geocodeAddress(addressToGeocode, 3000, geocodeCity);
          }

          if (coords) {
            // 根据活动内容判断类型
            let type: 'hotel' | 'restaurant' | 'attraction' | 'other' =
              'attraction';

            const activityLower = (activity.activity || '').toLowerCase();
            const descLower = (activity.description || '').toLowerCase();

            if (
              activityLower.includes('住宿') ||
              activityLower.includes('酒店') ||
              activityLower.includes('入住') ||
              descLower.includes('酒店') ||
              descLower.includes('宾馆')
            ) {
              type = 'hotel';
            } else if (
              activityLower.includes('午餐') ||
              activityLower.includes('晚餐') ||
              activityLower.includes('早餐') ||
              activityLower.includes('用餐') ||
              activityLower.includes('餐厅') ||
              descLower.includes('餐厅') ||
              descLower.includes('美食')
            ) {
              type = 'restaurant';
            }

            markers.push({
              id: `marker-${day.day}-${markers.length}`,
              name: activity.activity || location,
              lat: coords.lat,
              lng: coords.lng,
              address: location,
              type: type,
              description: activity.description,
              label: activity.activity || location,
            });
          } else {
            console.warn(`地理编码失败: ${location}`);
          }
        } catch (error) {
          console.error(`地理编码异常: ${location}`, error);
        }
      })();

      geocodeTasks.push(task);
    }
  }

  // 等待所有地理编码完成（并发执行）
  await Promise.all(geocodeTasks);

  return markers;
}

/**
 * 从行程中提取每日路线（基于已提取的标记）
 */
export async function extractRoutesFromItinerary(
  itinerary: any[],
  markers: MapMarker[]
): Promise<MapRoute[]> {
  const routes: MapRoute[] = [];

  // 创建地址到坐标的映射
  const locationMap = new Map<string, { lat: number; lng: number }>();
  markers.forEach((marker) => {
    if (marker.address) {
      locationMap.set(marker.address, { lat: marker.lat, lng: marker.lng });
    }
  });

  for (const day of itinerary) {
    if (!day.activities || !Array.isArray(day.activities)) continue;

    const dayLocations: any[] = [];

    for (const activity of day.activities) {
      const rawLocation = activity.location;
      if (!rawLocation) continue;

      const location = cleanAddress(rawLocation);
      if (!location) continue;

      // 直接从已有标记中查找坐标，不再重复地理编码
      const coords = locationMap.get(location);
      if (coords) {
        dayLocations.push({
          name: activity.activity || location,
          lat: coords.lat,
          lng: coords.lng,
          address: location,
        });
      }
    }

    if (dayLocations.length > 1) {
      // 为每一天创建一条路线
      const colors = [
        '#1890ff', // 蓝色
        '#52c41a', // 绿色
        '#fa8c16', // 橙色
        '#722ed1', // 紫色
        '#eb2f96', // 粉色
        '#13c2c2', // 青色
      ];

      routes.push({
        id: `route-day-${day.day}`,
        name: `第${day.day}天路线`,
        path: dayLocations,
        color: colors[(day.day - 1) % colors.length],
        width: 6,
      });
    }
  }

  return routes;
}

/**
 * 计算地图中心点和缩放级别
 */
export function calculateMapCenter(markers: MapMarker[]): {
  center: [number, number];
  zoom: number;
} {
  if (markers.length === 0) {
    return {
      center: [116.397428, 39.90923], // 默认北京
      zoom: 12,
    };
  }

  if (markers.length === 1) {
    return {
      center: [markers[0].lng, markers[0].lat],
      zoom: 15,
    };
  }

  // 计算所有点的中心
  const sumLng = markers.reduce((sum, m) => sum + m.lng, 0);
  const sumLat = markers.reduce((sum, m) => sum + m.lat, 0);

  const centerLng = sumLng / markers.length;
  const centerLat = sumLat / markers.length;

  // 计算跨度来决定缩放级别
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
    center: [centerLng, centerLat],
    zoom,
  };
}
