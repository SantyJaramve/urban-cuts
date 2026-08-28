-- ============================================================
-- ARCHIVO: db-schema.sql
-- RESPONSABILIDAD: Script completo de creacion de la base de
-- datos del Sistema de Gestion de Citas de la Barberia Urbana
-- Medellin. Crea el esquema, tablas, restricciones, indices,
-- triggers y los datos iniciales de prueba.
--
-- USO (PostgreSQL local o Supabase):
--   psql -U postgres -d postgres -f db-schema.sql
-- o desde el script Node (crear-base-datos.js)
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
-- (especialidad, descripcion, foto, disponibilidad diaria)
-- ============================================================
CREATE TABLE barberos (
    id_barbero       SERIAL PRIMARY KEY,
    id_usuario       INT NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    especialidad     VARCHAR(200),
    descripcion      TEXT,
    foto_url         VARCHAR(500),
    anos_experiencia INT DEFAULT 0,
    capacidad_diaria INT NOT NULL DEFAULT 10 CHECK (capacidad_diaria > 0),
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
CREATE INDEX idx_citas_barbero_fecha ON citas(id_barbero, fecha_cita);
CREATE INDEX idx_citas_cliente ON citas(id_cliente);
CREATE INDEX idx_citas_codigo ON citas(codigo_reserva);
CREATE INDEX idx_horarios_barbero ON horarios(id_barbero, dia_semana);
CREATE INDEX idx_servicios_activo ON servicios(activo) WHERE activo = TRUE;

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

CREATE TRIGGER trg_usuarios_updated
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_citas_updated
    BEFORE UPDATE ON citas
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================
-- DATOS INICIALES (SEED)
-- Responsabilidad: Poblar las tablas con datos de prueba
-- para que el sistema funcione de inmediato.
-- Las contrasenas son hashes bcrypt de: admin123 / barbero123
-- / cliente123 segun el rol del usuario.
-- ============================================================

-- Roles
INSERT INTO roles (nombre_rol, descripcion) VALUES
    ('administrador', 'Gestiona el sistema, servicios, barberos y configuracion'),
    ('barbero',       'Gestiona su agenda y estados de citas'),
    ('cliente',       'Reserva y consulta sus citas');

-- Usuarios (clave ejemplo: admin/admin123, juan/cliente123,
-- carlos/barbero123)
INSERT INTO usuarios (id_rol, nombre, apellido, correo, telefono, contrasena) VALUES
    (1, 'Admin',    'Sistema',   'admin@urbancuts.com',     NULL,          '$2a$12$RH4zijs.BpeK6MmU/593auMAdwYfFi6jp1dJ2RkD/SI.UtDR9OjGO'),
    (2, 'Carlos',   'Martinez',  'carlos@urbancuts.com',    '3001111111',  '$2a$12$UcKX5aOE/Bhpvx316SejfOgbmatXy2ICxdHRwVsIJ/TIPJ0aY4JL6'),
    (3, 'Juan',     'Perez',     'juan@email.com',          '3002222222',  '$2a$12$6zyKJtFHCN6e5S6hraKIzOncr4eCL9EjBH12zXA9Ta6J1rkbT3cv6'),
    (2, 'Andres',   'Lopez',     'andres@urbancuts.com',    '3003333333',  '$2a$12$sSo7AWNEnesdNj9jG3Kr0O0DXLT500zz3t7CVrmtVopKTA4x/NKve'),
    (3, 'SANTIAGO', 'JARAMILLO', 'jaramillovelasquezsantiago@gmail.com', '3196996435', '$2a$12$0W5DLb6NLx4QdKx60AQ8..BWNEZHv1ldgSnVD280KnIJB/5JOHbky'),
    (2, 'Pedro',    'Ramirez',   'pedro@email.com',         '3001234567',  '$2a$12$HyAUqTElkd.g/CdDbzKXceHzy5OM5EFUe7KZ.Yo4whmW7dVrqics.'),
    (2, 'Pedro',    'Ramirez',   'pedro2@email.com',        '3001234567',  '$2a$12$vtauUHZUDVFoFN2Iq8HUG.iR6i7uimQSKeCa4c/HM0gpb03TGBp/m'),
    (2, 'Edith',    'Velasquez', 'edith@gmail.com',         '3007494634',  '$2a$12$9HXsFhzQvR4rlhaC4FavAeL3fGzaSr6beS6o35cFH6S3n4sXdaHte'),
    (3, 'Pedro',    'Test',      'pedro@test.com',          '3009999999',  '$2a$12$AdNpBzmL9OCXwLdlx0tMQeLB0BOMrZ5Xf9jbjzMSakmdT.ASFnKXK'),
    (3, 'SANTIAGO', 'JARAMILLO', 'jaramillovelasquezsantiago@hotmail.com', '3196996435', '$2a$12$t/sQWbt9CT4n9eZRDR5BcO6XW9jbn97FV29ZUrXHZmXrsRTYPZ1Xy'),
    (2, 'Maria',    'Gomez',     'maria@test.com',          '3005555555',  '$2a$12$s2g1783UeQqjnn2Dx9qgqOiK37fVO15JluayJOYyJ8EV.PILunBTq'),
    (2, 'Edith',    'Velasquez', 'edith+example@gmail.com', '3000000000',  '$2a$12$5czXFT0jad.wfV9uyEhAjeaEiJzl3swAcs8JReRyjOg.4dim3rsSe');

-- Barberos
INSERT INTO barberos (id_usuario, especialidad, descripcion, anos_experiencia, capacidad_diaria) VALUES
    (2,  'Fade, Taper, Barba', 'Barbero especializado en cortes modernos y degradados con mas de 5 anos de experiencia', 7,  10),
    (4,  'Mullet, Diseno, Cejas', 'Barbero artesanal con enfoque en estilos atrevidos y disenos creativos', 4, 10),
    (6,  'Fade y barba', NULL, NULL, 10),
    (7,  'Fade', NULL, NULL, 10),
    (11, 'Cejas y Barba', NULL, 3, 8),
    (12, 'fade', NULL, NULL, 10);

-- Servicios
INSERT INTO servicios (nombre, descripcion, precio, duracion_min) VALUES
    ('Fade Classico',       'Corte degradado clasico con acabado limpio y moderno',               25000.00, 30),
    ('Taper Fade',          'Degradado taper con transicion suave y precisa',                     30000.00, 35),
    ('Mullet Moderno',      'Corte mullet contemporaneo con textura y estilo urbano',            35000.00, 40),
    ('Perfilado de Barba',  'Diseno y perfilado profesional de barba con navaja',                 20000.00, 20),
    ('Corte + Barba',       'Combo completo: corte degradado mas perfilado de barba',             45000.00, 50),
    ('Diseno de Cejas',     'Diseno y limpieza de cejas con navaja y cera',                       15000.00, 15),
    ('Afeitado Clasico',    'Afeitado tradicional con navaja y toalla caliente para una piel suave', 18000.00, 20),
    ('Tratamiento Capilar', 'Hidratacion y tratamiento profundo para reparar y fortalecer el cabello', 22000.00, 35);

-- Horarios (Lun-Vie 09:00-18:00, Sab 09:00-16:00 para cada barbero activo)
INSERT INTO horarios (id_barbero, dia_semana, hora_inicio, hora_fin)
SELECT b.id_barbero, d.dia, d.hi::time, d.hf::time
FROM barberos b
CROSS JOIN (
    VALUES (1,'09:00','18:00'),(2,'09:00','18:00'),(3,'09:00','18:00'),
           (4,'09:00','18:00'),(5,'09:00','18:00'),(6,'09:00','16:00')
) AS d(dia, hi, hf)
WHERE b.activo = TRUE;

-- Reiniciar secuencias para id coherentes
SELECT setval(pg_get_serial_sequence('roles',     'id_rol'),     (SELECT MAX(id_rol)     FROM roles),     true);
SELECT setval(pg_get_serial_sequence('usuarios',  'id_usuario'), (SELECT MAX(id_usuario) FROM usuarios),  true);
SELECT setval(pg_get_serial_sequence('barberos',  'id_barbero'), (SELECT MAX(id_barbero) FROM barberos),  true);
SELECT setval(pg_get_serial_sequence('servicios', 'id_servicio'),(SELECT MAX(id_servicio)FROM servicios), true);
SELECT setval(pg_get_serial_sequence('horarios',  'id_horario'), (SELECT MAX(id_horario) FROM horarios),  true);
