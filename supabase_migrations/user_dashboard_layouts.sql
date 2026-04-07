-- ============================================
-- TABLA: user_dashboard_layouts
-- Almacena las configuraciones de dashboard personalizadas por usuario
-- ============================================

CREATE TABLE IF NOT EXISTS user_dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  layout_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  widgets JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, layout_id)
);

-- ============================================
-- ÍNDICES para optimizar queries
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_layouts ON user_dashboard_layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_active_layout ON user_dashboard_layouts(user_id, is_active);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE user_dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo pueden ver sus propios layouts
DROP POLICY IF EXISTS "Users can view own layouts" ON user_dashboard_layouts;
CREATE POLICY "Users can view own layouts"
  ON user_dashboard_layouts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Los usuarios solo pueden insertar sus propios layouts
DROP POLICY IF EXISTS "Users can insert own layouts" ON user_dashboard_layouts;
CREATE POLICY "Users can insert own layouts"
  ON user_dashboard_layouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Los usuarios solo pueden actualizar sus propios layouts
DROP POLICY IF EXISTS "Users can update own layouts" ON user_dashboard_layouts;
CREATE POLICY "Users can update own layouts"
  ON user_dashboard_layouts FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Los usuarios solo pueden eliminar sus propios layouts
DROP POLICY IF EXISTS "Users can delete own layouts" ON user_dashboard_layouts;
CREATE POLICY "Users can delete own layouts"
  ON user_dashboard_layouts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER para actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_dashboard_layouts_updated_at ON user_dashboard_layouts;
CREATE TRIGGER update_user_dashboard_layouts_updated_at
  BEFORE UPDATE ON user_dashboard_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTARIOS para documentación
-- ============================================

COMMENT ON TABLE user_dashboard_layouts IS 'Almacena configuraciones personalizadas de dashboard por usuario';
COMMENT ON COLUMN user_dashboard_layouts.layout_id IS 'Identificador único del layout (ej: default, detailed, minimal, custom-123)';
COMMENT ON COLUMN user_dashboard_layouts.widgets IS 'Array JSON con configuración de widgets (posición, tamaño, etc)';
COMMENT ON COLUMN user_dashboard_layouts.is_active IS 'Indica si este es el layout actualmente seleccionado por el usuario';
