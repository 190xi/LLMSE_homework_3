/**
 * 高德地图 SDK 加载器
 */

import AMapLoader from '@amap/amap-jsapi-loader';

declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: {
      securityJsCode: string;
    };
  }
}

let amapInstance: any = null;
let loadingPromise: Promise<any> | null = null;

/**
 * 加载高德地图 SDK
 */
export async function loadAMap(): Promise<any> {
  // 检查 API Key 是否配置
  const apiKey = process.env.NEXT_PUBLIC_AMAP_KEY;
  const securityCode = process.env.NEXT_PUBLIC_AMAP_SECRET;

  if (!apiKey) {
    console.error('高德地图 API Key 未配置');
    throw new Error(
      '高德地图 API Key 未配置，请在 .env.local 中设置 NEXT_PUBLIC_AMAP_KEY'
    );
  }

  // 高德地图2.0必须设置安全密钥
  if (typeof window !== 'undefined') {
    (window as any)._AMapSecurityConfig = {
      securityJsCode: securityCode || '',
    };
    console.log('高德地图安全密钥已设置');
  }

  // 如果已经加载，直接返回
  if (amapInstance) {
    return amapInstance;
  }

  // 如果正在加载，等待加载完成
  if (loadingPromise) {
    return loadingPromise;
  }

  // 开始加载
  loadingPromise = AMapLoader.load({
    key: apiKey,
    version: '2.0',
    plugins: [
      'AMap.Geocoder', // 地理编码
      'AMap.Marker', // 点标记
      'AMap.Polyline', // 折线
      'AMap.ToolBar', // 工具条
      'AMap.Scale', // 比例尺
    ],
  })
    .then((AMap) => {
      console.log('高德地图 SDK 加载成功');
      amapInstance = AMap;
      loadingPromise = null;
      return AMap;
    })
    .catch((error) => {
      console.error('高德地图 SDK 加载失败:', error);
      loadingPromise = null;
      throw new Error('地图加载失败，请检查网络连接或 API Key 配置');
    });

  return loadingPromise;
}

/**
 * 获取已加载的高德地图实例
 */
export function getAMap(): any {
  return amapInstance;
}

/**
 * 地理编码 - 将地址转换为坐标
 * @param address 地址字符串
 * @param timeout 超时时间（毫秒），默认5000ms
 * @param city 城市名称，用于限定搜索范围
 */
export async function geocodeAddress(
  address: string,
  timeout: number = 5000,
  city?: string
): Promise<{
  lng: number;
  lat: number;
} | null> {
  console.log(
    `[geocodeAddress] 开始处理: "${address}"${city ? ` (城市: ${city})` : ''}`
  );

  try {
    const AMap = await loadAMap();
    console.log(`[geocodeAddress] AMap实例获取成功`);

    let callbackFired = false;
    let timeoutFired = false;

    return await Promise.race([
      new Promise<{ lng: number; lat: number } | null>((resolve) => {
        try {
          console.log(`[geocodeAddress] 创建Geocoder...`);
          const geocoder = new AMap.Geocoder({
            city: city || '全国',
          });
          console.log(
            `[geocodeAddress] Geocoder创建成功，城市: ${city || '全国'}`
          );

          console.log(`[geocodeAddress] 调用getLocation("${address}")...`);
          geocoder.getLocation(address, (status: string, result: any) => {
            if (timeoutFired) {
              return;
            }

            callbackFired = true;
            console.log(`[geocodeAddress] 回调触发!`, {
              address,
              status,
              result,
            });

            if (status === 'complete' && result.info === 'OK') {
              if (result.geocodes && result.geocodes.length > 0) {
                const location = result.geocodes[0].location;
                console.log(`[geocodeAddress] 成功: ${address}`, {
                  lng: location.lng,
                  lat: location.lat,
                });
                resolve({
                  lng: location.lng,
                  lat: location.lat,
                });
              } else {
                console.warn(`[geocodeAddress] 无结果: ${address}`);
                resolve(null);
              }
            } else {
              console.warn(
                `[geocodeAddress] 失败: ${address} - status: ${status}`
              );
              resolve(null);
            }
          });
          console.log(`[geocodeAddress] getLocation已调用，等待回调...`);
        } catch (error) {
          console.error(`[geocodeAddress] Geocoder异常:`, error);
          resolve(null);
        }
      }),
      new Promise<null>((resolve) =>
        setTimeout(() => {
          timeoutFired = true;
          if (!callbackFired) {
            console.warn(`[geocodeAddress] 超时: ${address} - 回调未触发`);
          }
          resolve(null);
        }, timeout)
      ),
    ]);
  } catch (error) {
    console.error(`[geocodeAddress] 异常:`, error);
    return null;
  }
}

/**
 * 逆地理编码 - 将坐标转换为地址
 */
export async function reverseGeocode(
  lng: number,
  lat: number
): Promise<string | null> {
  const AMap = await loadAMap();

  return new Promise((resolve, reject) => {
    const geocoder = new AMap.Geocoder();

    geocoder.getAddress([lng, lat], (status: string, result: any) => {
      if (status === 'complete' && result.info === 'OK') {
        resolve(result.regeocode.formattedAddress);
      } else {
        console.error('逆地理编码失败:', status, result);
        resolve(null);
      }
    });
  });
}

/**
 * 计算两点之间的距离（米）
 */
export function calculateDistance(
  point1: { lng: number; lat: number },
  point2: { lng: number; lat: number }
): number {
  const AMap = getAMap();
  if (!AMap) return 0;

  const lngLat1 = new AMap.LngLat(point1.lng, point1.lat);
  const lngLat2 = new AMap.LngLat(point2.lng, point2.lat);

  return lngLat1.distance(lngLat2);
}
