-- ============================================
-- SCHEMA: Conversaciones y Análisis de Marca
-- Fecha: 2026-04-08
-- ============================================

-- ========== 1. TABLA: conversations ==========
-- Almacena mensajes entre usuario y agente
CREATE TABLE IF NOT EXISTS conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  brand_id INT NOT NULL,

  -- Tipo de mensaje
  type ENUM('user', 'agent') NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(100), -- 'text_question', 'image_upload', 'recommendation', 'agent_response', etc

  -- Contexto al momento del mensaje
  context JSON, -- {brand_state: {...}, analysis_result: {...}}

  -- Respuesta del agente (solo si type='agent')
  agent_response TEXT,
  tokens_used INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Índices
  KEY idx_user_brand (user_id, brand_id),
  KEY idx_created_at (created_at),
  KEY idx_type (type),

  -- Restricciones de integridad
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 2. TABLA: conversation_summaries ==========
-- Resumen automático de conversaciones por marca
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  brand_id INT NOT NULL,

  -- Resumen generado por IA
  summary TEXT,

  -- Insights clave extraídos
  key_insights JSON, -- [{insight: string, frequency: int, impact: string}]

  -- Estadísticas
  conversation_count INT DEFAULT 0,
  total_messages INT DEFAULT 0,
  last_message_date TIMESTAMP,

  -- Control
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Índices
  KEY idx_user_brand (user_id, brand_id),
  UNIQUE KEY unique_user_brand (user_id, brand_id),

  -- Restricciones
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 3. TABLA: conversation_context ==========
-- Historial de cambios en Brand Brain durante conversaciones
CREATE TABLE IF NOT EXISTS conversation_context (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  brand_id INT NOT NULL,
  conversation_id INT,

  -- Cambio de estado
  field_name VARCHAR(100), -- ej: 'color_primario', 'mision', 'audiencia'
  old_value TEXT,
  new_value TEXT,

  -- Contexto del cambio
  reason TEXT, -- Por qué cambió (sugerencia del agente, input manual, etc)
  triggered_by ENUM('user', 'agent', 'auto_analysis') DEFAULT 'user',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  KEY idx_user_brand (user_id, brand_id),
  KEY idx_conversation (conversation_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 4. TABLA: conversation_insights ==========
-- Insights extraídos de conversaciones para enriquecer recomendaciones
CREATE TABLE IF NOT EXISTS conversation_insights (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  brand_id INT NOT NULL,

  -- Insight
  insight_type VARCHAR(50), -- 'positioning', 'target_audience', 'differentiator', 'value_prop', etc
  insight_text TEXT NOT NULL,
  confidence DECIMAL(3, 2) DEFAULT 0.75, -- 0-1, qué tan seguro estamos

  -- Frecuencia: cuántas veces se mencionó
  mention_count INT DEFAULT 1,
  last_mentioned TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Metadata
  source VARCHAR(50), -- 'conversation', 'manual_input', 'analysis'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  KEY idx_user_brand (user_id, brand_id),
  KEY idx_insight_type (insight_type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== VISTAS ÚTILES ==========

-- Vista: Últimas conversaciones por marca
CREATE OR REPLACE VIEW vw_recent_conversations AS
SELECT
  c.id,
  c.user_id,
  c.brand_id,
  u.username,
  b.nombre as brand_name,
  c.type,
  c.message,
  c.created_at,
  ROW_NUMBER() OVER (PARTITION BY c.brand_id ORDER BY c.created_at DESC) as conversation_order
FROM conversations c
JOIN users u ON c.user_id = u.id
JOIN brands b ON c.brand_id = b.id;

-- Vista: Conversaciones sin respuesta del agente
CREATE OR REPLACE VIEW vw_unanswered_conversations AS
SELECT
  c.id,
  c.user_id,
  c.brand_id,
  c.message,
  c.created_at,
  DATEDIFF(NOW(), c.created_at) as hours_waiting
FROM conversations c
WHERE c.type = 'user' AND c.id NOT IN (
  SELECT conversation_id
  FROM (
    SELECT MAX(id) as conversation_id
    FROM conversations
    WHERE type = 'agent'
  ) agent_responses
)
ORDER BY c.created_at ASC;

-- ========== ÍNDICES ADICIONALES ==========
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversation_summaries_updated_at ON conversation_summaries(updated_at);
CREATE INDEX idx_conversation_context_field ON conversation_context(field_name);

-- ========== COMENTARIOS ==========
ALTER TABLE conversations COMMENT = 'Almacena todos los mensajes en conversaciones entre usuario y agente de IA';
ALTER TABLE conversation_summaries COMMENT = 'Resúmenes automáticos y insights de conversaciones por marca';
ALTER TABLE conversation_context COMMENT = 'Historial de cambios en Brand Brain durante conversaciones';
ALTER TABLE conversation_insights COMMENT = 'Insights extraídos de conversaciones para enriquecer el análisis';
