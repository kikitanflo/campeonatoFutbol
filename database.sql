-- 1. CREAR LA BASE DE DATOS (Si no la creaste manual)
CREATE DATABASE IF NOT EXISTS campeonato_futbol DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campeonato_futbol;

-- 2. TABLA DE USUARIOS (Administradores, Árbitros, Dirigentes)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'arbitro', 'dirigente') NOT NULL,
    equipo_id INT DEFAULT NULL,
    telefono VARCHAR(20) DEFAULT NULL,
    activo BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE SET NULL
);

-- Insertar un admin por defecto (Contraseña: admin123)
INSERT INTO usuarios (username, password_hash, rol) VALUES ('admin', '$2b$10$wT6.E36y1R4Y1W3vL/54pOhvKqQ1zU5iH1/tJ4L6/0Y9G8S8A2/iO', 'admin');

-- 3. TABLA DE EQUIPOS
CREATE TABLE IF NOT EXISTS equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255) DEFAULT NULL,
    puntos INT DEFAULT 0,
    partidos_jugados INT DEFAULT 0,
    goles_favor INT DEFAULT 0,
    goles_contra INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA DE JUGADORES
CREATE TABLE IF NOT EXISTS jugadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    dorsal INT NOT NULL,
    posicion VARCHAR(50) DEFAULT 'Jugador',
    goles INT DEFAULT 0,
    amarillas INT DEFAULT 0,
    rojas INT DEFAULT 0,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);

-- 5. TABLA DE PARTIDOS
CREATE TABLE IF NOT EXISTS partidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_local_id INT NOT NULL,
    equipo_visitante_id INT NOT NULL,
    jornada INT NOT NULL,
    estado ENUM('Pendiente', 'En Curso', 'Finalizado') DEFAULT 'Pendiente',
    fecha DATETIME DEFAULT NULL,
    goles_local INT DEFAULT 0,
    goles_visitante INT DEFAULT 0,
    FOREIGN KEY (equipo_local_id) REFERENCES equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (equipo_visitante_id) REFERENCES equipos(id) ON DELETE CASCADE
);

-- 6. TABLA DE EVENTOS DE PARTIDO (Goles, Tarjetas)
CREATE TABLE IF NOT EXISTS eventos_partido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partido_id INT NOT NULL,
    jugador_id INT NOT NULL,
    tipo_evento ENUM('Gol', 'Amarilla', 'Roja') NOT NULL,
    minuto INT DEFAULT NULL,
    FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE,
    FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE
);

-- 7. TABLA DE CONVOCATORIAS (Planilla del dirigente)
CREATE TABLE IF NOT EXISTS convocatorias (
    partido_id INT NOT NULL,
    jugador_id INT NOT NULL,
    PRIMARY KEY (partido_id, jugador_id),
    FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE,
    FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE
);
