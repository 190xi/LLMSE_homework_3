/**
 * 地图相关类型定义
 */

/**
 * 地图位置点
 */
export interface MapLocation {
  /** 纬度 */
  lat: number;
  /** 经度 */
  lng: number;
  /** 位置名称 */
  name: string;
  /** 位置地址 */
  address?: string;
  /** 位置类型 */
  type?: 'hotel' | 'restaurant' | 'attraction' | 'other';
  /** 位置描述 */
  description?: string;
}

/**
 * 地图标记点
 */
export interface MapMarker extends MapLocation {
  /** 标记ID */
  id: string;
  /** 图标 URL 或类型 */
  icon?: string;
  /** 标签文字 */
  label?: string;
  /** 所属天数 */
  day?: number;
}

/**
 * 地图路线
 */
export interface MapRoute {
  /** 路线ID */
  id: string;
  /** 路线名称 */
  name: string;
  /** 路线点集合 */
  path: MapLocation[];
  /** 路线颜色 */
  color?: string;
  /** 路线宽度 */
  width?: number;
  /** 所属天数 */
  day?: number;
}

/**
 * 地图配置选项
 */
export interface MapOptions {
  /** 中心点 */
  center?: [number, number]; // [lng, lat]
  /** 缩放级别 */
  zoom?: number;
  /** 是否显示缩放控件 */
  showZoomControl?: boolean;
  /** 是否显示比例尺控件 */
  showScaleControl?: boolean;
  /** 地图类型 */
  mapType?: 'normal' | 'satellite';
}

/**
 * 导航选项
 */
export interface NavigationOptions {
  /** 起点 */
  origin: MapLocation;
  /** 终点 */
  destination: MapLocation;
  /** 导航方式 */
  mode?: 'driving' | 'walking' | 'transit';
}
