-- ============================================================
-- ESQUEMA DE BASE DE DATOS - SISTEMA DE GESTION DE CITAS
-- Barberia Urbana Medellin
-- ============================================================
-- Responsabilidad: Definicion del esquema relacional completo
-- incluyendo tablas, claves primarias, foraneas, restricciones
-- e indices para garantizar integridad referencial y rendimiento.
-- ============================================================

-- Eliminar esquema si existe para recreacion limpia
DROP SCHEMA IF EXISTS barberia CASCADE;
CREATE SCHEMA barberia;
SET search_path TO barberia;

-- ============================================================
-- TABLA: roles
-- Responsabilidad: Catalogo de roles del sistema
-- (administrador, barbero, cliente)
-- ============================================================
CREATE TABLE roles (
    id_rol       SERIAL PRIMARY KEY,
    nombre_rol   VARCHAR(50) NOT NULL UNIQUE,
    descripcion  VARCHAR(255)
);

-- ============================================================
-- TABLA: usuarios
-- Responsabilidad: Almacenar credenciales y datos basicos
-- de todos los usuarios del sistema (clientes, barberos, admins)
-- ============================================================
CREATE TABLE usuarios (
    id_usuario   SERIAL PRIMARY KEY,
    id_rol       INT NOT NULL REFERENCES roles(id_rol) ON DELETE RESTRICT,
    nombre       VARCHAR(100) NOT NULL,
    apellido     VARCHAR(100) NOT NULL,
    correo       VARCHAR(150) NOT NULL UNIQUE,
    telefono     VARCHAR(20),
    contrasena   VARCHAR(255) NOT NULL,
    activo       BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: barberos
-- Responsabilidad: Informacion extendida del perfil de barbero
-- (especialidad, descripcion, foto, disponibilidad)
-- ============================================================
CREATE TABLE barberos (
    id_barbero       SERIAL PRIMARY KEY,
    id_usuario       INT NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    especialidad     VARCHAR(200),
    descripcion      TEXT,
    foto_url         VARCHAR(500),
    anos_experiencia INT DEFAULT 0,
    activo           BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: servicios
-- Responsabilidad: Catalogo de servicios ofrecidos por la
-- barberia (cortes, perfilados, tratamientos, etc.)
-- ============================================================
CREATE TABLE servicios (
    id_servicio   SERIAL PRIMARY KEY,
    nombre        VARCHAR(150) NOT NULL,
    descripcion   TEXT,
    precio        DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    duracion_min  INT NOT NULL CHECK (duracion_min > 0),
    imagen_url    VARCHAR(500),
    activo        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: horarios
-- Responsabilidad: Definir los horarios de atencion de la
-- barberia y de cada barbero individualmente.
-- ============================================================
CREATE TABLE horarios (
    id_horario    SERIAL PRIMARY KEY,
    id_barbero    INT NOT NULL REFERENCES barberos(id_barbero) ON DELETE CASCADE,
    dia_semana    INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
                                      -- 0=Domingo, 1=Lunes ... 6=Sabado
    hora_inicio   TIME NOT NULL,
    hora_fin      TIME NOT NULL,
    activo        BOOLEAN DEFAULT TRUE,
    CHECK (hora_inicio < hora_fin),
    UNIQUE (id_barbero, dia_semana)
);

-- ============================================================
-- TABLA: citas
-- Responsabilidad: Registro central del sistema. Almacena
-- cada reserva realizada por un cliente con un barbero.
-- Incluye codigo unico de reserva y estados posibles.
-- ============================================================
CREATE TABLE citas (
    id_cita        SERIAL PRIMARY KEY,
    codigo_reserva VARCHAR(20) NOT NULL UNIQUE,
    id_cliente     INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    id_barbero     INT NOT NULL REFERENCES barberos(id_barbero) ON DELETE RESTRICT,
    id_servicio    INT NOT NULL REFERENCES servicios(id_servicio) ON DELETE RESTRICT,
    fecha_cita     DATE NOT NULL,
    hora_inicio    TIME NOT NULL,
    hora_fin       TIME NOT NULL,
    estado         VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                   CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
    notas          TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (hora_inicio < hora_fin),
    CHECK (fecha_cita >= CURRENT_DATE)
);

-- ============================================================
-- INDICES
-- Responsabilidad: Optimizar consultas frecuentes del sistema
-- ============================================================

-- Buscar citas por barbero y fecha (agenda del barbero)
CREATE INDEX idx_citas_barbero_fecha
    ON citas(id_barbero, fecha_cita);

-- Buscar citas por cliente
CREATE INDEX idx_citas_cliente
    ON citas(id_cliente);

-- Buscar citas por codigo de reserva (consulta rapida)
CREATE INDEX idx_citas_codigo
    ON citas(codigo_reserva);

-- Buscar horarios por barbero
CREATE INDEX idx_horarios_barbero
    ON horarios(id_barbero, dia_semana);

-- Buscar servicios activos
CREATE INDEX idx_servicios_activo
    ON servicios(activo) WHERE activo = TRUE;

-- ============================================================
-- RESTRICCION DE EMPALME DE CITAS
-- Responsabilidad: Evitar que dos citas se programen en el
-- mismo barbero, misma fecha y con solapamiento de horario.
-- Se implementa via trigger en el backend (service layer).
-- ============================================================

-- ============================================================
-- DATOS INICIALES (SEED)
-- Responsabilidad: Poblar tablas de rol con los tipos de
-- usuario que maneja el sistema.
-- ============================================================
INSERT INTO roles (nombre_rol, descripcion) VALUES
    ('administrador', 'Gestiona el sistema, servicios, barberos y configuracion'),
    ('barbero',       'Gestiona su agenda y estados de citas'),
    ('cliente',       'Reserva y consulta sus citas');

-- ============================================================
-- FUNCION: Actualizar timestamp automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automaticamente
CREATE TRIGGER trg_usuarios_updated
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_citas_updated
    BEFORE UPDATE ON citas
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
