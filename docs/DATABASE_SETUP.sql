-- ===== TABLAS PARA CUSTER IA STUDIO =====

-- 1. TABLA DE USUARIOS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(4) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);

-- 2. TABLA DE LOGS (actividad del usuario)
CREATE TABLE logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,          -- 'generate', 'validate', 'copy', etc
  details JSON,                          -- datos adicionales
  result VARCHAR(20),                    -- 'success', 'error'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. TABLA DE PROYECTOS (para guardar trabajos del usuario)
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100),
  brain JSON,                            -- Brand Brain guardado
  carousel JSON,                         -- Carousel generado
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ===== DATOS DE PRUEBA =====

-- Usuarios de ejemplo (contraseña de 4 dígitos)
INSERT INTO users (username, password, email) VALUES
('demo', '1234', 'demo@example.com'),
('admin', '5678', 'admin@example.com'),
('user', '9999', 'user@example.com');

-- ===== ÍNDICES PARA OPTIMIZAR =====

CREATE INDEX idx_user_logs ON logs(user_id);
CREATE INDEX idx_user_projects ON projects(user_id);
CREATE INDEX idx_logs_created ON logs(created_at);
CREATE INDEX idx_projects_created ON projects(created_at);

-- ===== PARA VER LOS LOGS =====
-- SELECT u.username, l.action, l.result, l.created_at FROM logs l
-- JOIN users u ON l.user_id = u.id
-- ORDER BY l.created_at DESC LIMIT 20;
