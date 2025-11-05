-- ============================================
-- AI Travel Planner - Database Schema
-- ============================================
-- Version: 1.0
-- Database: PostgreSQL (Supabase)
-- Created: 2025-11-05
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geospatial queries (optional - comment out if not needed)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Alternative: Enable cube and earthdistance for basic geo queries (optional)
-- CREATE EXTENSION IF NOT EXISTS cube;
-- CREATE EXTENSION IF NOT EXISTS earthdistance;

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  display_name VARCHAR(100),
  avatar_url TEXT,
  default_budget INTEGER DEFAULT 3000,
  default_city VARCHAR(100),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;

-- ============================================
-- 2. Trips Table
-- ============================================
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget INTEGER NOT NULL,
  num_adults INTEGER DEFAULT 1 CHECK (num_adults >= 1),
  num_children INTEGER DEFAULT 0 CHECK (num_children >= 0),
  preferences JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  itinerary JSONB NOT NULL DEFAULT '[]'::jsonb,
  shared BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for trips
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_start_date ON trips(start_date);
CREATE INDEX idx_trips_share_token ON trips(share_token) WHERE share_token IS NOT NULL;

-- Composite index for user's trips by date
CREATE INDEX idx_trips_user_date ON trips(user_id, start_date DESC);

-- ============================================
-- 3. Expenses Table
-- ============================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) DEFAULT 'CNY' NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('transport', 'accommodation', 'food', 'tickets', 'shopping', 'other')),
  description TEXT,
  receipt_url TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for expenses
CREATE INDEX idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_recorded_at ON expenses(recorded_at);

-- Composite index for trip expenses
CREATE INDEX idx_expenses_trip_recorded ON expenses(trip_id, recorded_at DESC);

-- ============================================
-- 4. Attractions Table (Optional - for caching)
-- ============================================
CREATE TABLE attractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  category VARCHAR(50),
  description TEXT,
  image_urls JSONB DEFAULT '[]'::jsonb,
  average_visit_time INTEGER, -- in minutes
  ticket_price DECIMAL(10, 2),
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for attractions
CREATE INDEX idx_attractions_city ON attractions(city);
CREATE INDEX idx_attractions_category ON attractions(category);
CREATE INDEX idx_attractions_rating ON attractions(rating DESC);

-- GiST index for location-based queries (OPTIONAL - requires earthdistance extension)
-- Uncomment the following lines after enabling cube and earthdistance extensions:
-- CREATE EXTENSION IF NOT EXISTS cube;
-- CREATE EXTENSION IF NOT EXISTS earthdistance;
-- CREATE INDEX idx_attractions_location ON attractions USING gist(
--   ll_to_earth(latitude::float8, longitude::float8)
-- );

-- Alternative: Simple composite index for city + coordinates (works without extensions)
CREATE INDEX idx_attractions_city_location ON attractions(city, latitude, longitude);

-- ============================================
-- 5. Restaurants Table (Optional - for caching)
-- ============================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  cuisine_type VARCHAR(50),
  average_cost DECIMAL(10, 2),
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  image_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for restaurants
CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_rating ON restaurants(rating DESC);

-- Simple composite index for city + coordinates
CREATE INDEX idx_restaurants_city_location ON restaurants(city, latitude, longitude);

-- ============================================
-- Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attractions_updated_at
  BEFORE UPDATE ON attractions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Trips policies
CREATE POLICY "Users can view own trips or shared trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id OR shared = true);

CREATE POLICY "Users can create trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view expenses of own trips"
  ON expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create expenses for own trips"
  ON expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses of own trips"
  ON expenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses of own trips"
  ON expenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Attractions policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view attractions"
  ON attractions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Restaurants policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view restaurants"
  ON restaurants FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- Views
-- ============================================

-- View for trip statistics
CREATE VIEW trip_statistics AS
SELECT
  t.id AS trip_id,
  t.user_id,
  t.destination,
  t.start_date,
  t.end_date,
  t.total_budget,
  COALESCE(SUM(e.amount), 0) AS total_spent,
  t.total_budget - COALESCE(SUM(e.amount), 0) AS remaining_budget,
  COUNT(e.id) AS expense_count,
  ROUND(
    (COALESCE(SUM(e.amount), 0) / NULLIF(t.total_budget, 0) * 100)::numeric, 2
  ) AS budget_usage_percentage
FROM trips t
LEFT JOIN expenses e ON t.id = e.trip_id
GROUP BY t.id;

-- View for expense breakdown by category
CREATE VIEW expense_breakdown AS
SELECT
  e.trip_id,
  e.category,
  COUNT(*) AS count,
  SUM(e.amount) AS total,
  AVG(e.amount) AS average,
  MIN(e.amount) AS min,
  MAX(e.amount) AS max
FROM expenses e
GROUP BY e.trip_id, e.category;

-- ============================================
-- Utility Functions
-- ============================================

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN encode(gen_random_bytes(25), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate trip duration
CREATE OR REPLACE FUNCTION calculate_trip_duration(start_d DATE, end_d DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN (end_d - start_d) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Sample Data (for development)
-- ============================================

-- Uncomment to insert sample data
/*
INSERT INTO attractions (name, city, address, latitude, longitude, category, description, average_visit_time, ticket_price, rating, tags)
VALUES
  ('故宫博物院', '北京', '北京市东城区景山前街4号', 39.916668, 116.397026, '历史', '中国明清两代的皇家宫殿，世界文化遗产', 180, 60, 4.8, '["历史", "文化", "建筑"]'),
  ('颐和园', '北京', '北京市海淀区新建宫门路19号', 39.999226, 116.275346, '园林', '中国现存规模最大的皇家园林', 150, 30, 4.7, '["园林", "历史", "自然"]'),
  ('天坛公园', '北京', '北京市东城区天坛路', 39.882578, 116.407362, '历史', '明清两代皇帝祭祀天地的场所', 120, 15, 4.6, '["历史", "建筑", "公园"]');

INSERT INTO restaurants (name, city, address, cuisine_type, average_cost, rating, image_urls)
VALUES
  ('全聚德烤鸭店', '北京', '北京市东城区前门大街30号', '北京菜', 150, 4.5, '[]'),
  ('东来顺饭庄', '北京', '北京市东城区王府井大街138号', '涮羊肉', 120, 4.4, '[]'),
  ('老北京炸酱面', '北京', '北京市西城区什刹海前海北沿', '北京小吃', 50, 4.3, '[]');
*/

-- ============================================
-- Database Comments
-- ============================================

COMMENT ON TABLE users IS '用户表 - 存储用户基本信息和偏好设置';
COMMENT ON TABLE trips IS '旅行计划表 - 存储用户创建的旅行计划';
COMMENT ON TABLE expenses IS '费用记录表 - 记录旅行中的各项花费';
COMMENT ON TABLE attractions IS '景点表 - 缓存景点信息（可选）';
COMMENT ON TABLE restaurants IS '餐厅表 - 缓存餐厅信息（可选）';

COMMENT ON COLUMN trips.itinerary IS '行程详情，存储为JSON格式，包含每日行程、景点、餐厅等信息';
COMMENT ON COLUMN trips.share_token IS '分享令牌，用于生成分享链接';
COMMENT ON COLUMN expenses.currency IS '货币代码，如CNY、USD、EUR等';

-- ============================================
-- End of Schema
-- ============================================
