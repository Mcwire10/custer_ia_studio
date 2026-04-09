-- ============================================
-- MIGRACIÓN: Agregar user_id a tabla brands
-- Fecha: 2026-04-08
-- ============================================

-- 1. Agregar columna user_id a tabla brands
ALTER TABLE brands ADD COLUMN user_id INT NOT NULL DEFAULT 1 AFTER id;

-- 2. Agregar foreign key
ALTER TABLE brands ADD CONSTRAINT fk_brands_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Crear índice compuesto
CREATE INDEX idx_user_brands ON brands(user_id, updated_at DESC);
CREATE INDEX idx_user_brand_name ON brands(user_id, nombre);

-- 4. (Opcional) Agregar user_id a tabla visual_analysis si existe
ALTER TABLE visual_analysis ADD COLUMN user_id INT;
CREATE INDEX idx_visual_analysis_user ON visual_analysis(user_id);

-- 5. Verificación: contar brands por usuario
SELECT user_id, COUNT(*) as total_brands
FROM brands
GROUP BY user_id
ORDER BY total_brands DESC;

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
