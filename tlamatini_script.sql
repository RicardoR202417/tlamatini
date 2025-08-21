
-- BASE DE DATOS TLAMATINI
create database if not exists tlamatini;
use tlamatini;

-- =========================
-- 1. USUARIOS Y ROLES
-- =========================

create table usuarios (
    id_usuario int auto_increment primary key,
    nombres varchar(100) not null,
    apellidos varchar(100) not null,
    correo varchar(100) not null unique,
    password varchar(255),
    google_uid varchar(100) unique,
    tipo_usuario enum('beneficiario','profesional','administrador') not null,
    validado boolean default false,
    fecha_registro datetime default current_timestamp
);

-- =========================
-- 2. PROFESIONALES
-- =========================

create table profesionales (
    id_profesional int primary key,
    especialidad varchar(100) not null,
    cedula_profesional varchar(50) not null,
    documento_url varchar(255),
    foreign key (id_profesional) references usuarios(id_usuario) on delete cascade
);

-- =========================
-- 3. REFRESH TOKENS
-- =========================

create table refresh_tokens (
    id_token bigint auto_increment primary key,
    id_usuario int not null,
    token varchar(255) not null unique,
    expiracion datetime not null,
    creado_en datetime default current_timestamp,
    revocado boolean default false,
    foreign key (id_usuario) references usuarios(id_usuario) on delete cascade
);

-- =========================
-- 4. RECUPERACIÓN DE CONTRASEÑA
-- =========================

create table password_resets (
    id_reset bigint auto_increment primary key,
    correo varchar(100) not null,
    token varchar(255) not null unique,
    expiracion datetime not null,
    creado_en datetime default current_timestamp
);

-- =========================
-- 5. CITAS Y CONSULTAS
-- =========================

create table citas (
    id_cita int auto_increment primary key,
    id_beneficiario int not null,
    id_profesional int not null,
    fecha_hora datetime not null,
    estado enum('pendiente','confirmada','cancelada') default 'pendiente',
    notas text,
    creado_en datetime default current_timestamp,
    foreign key (id_beneficiario) references usuarios(id_usuario) on delete cascade,
    foreign key (id_profesional) references profesionales(id_profesional) on delete cascade
);

create table consultas (
    id_consulta int auto_increment primary key,
    id_cita int not null,
    descripcion text not null,
    fecha datetime default current_timestamp,
    archivos_url text,
    foreign key (id_cita) references citas(id_cita) on delete cascade
);

-- =========================
-- 6. ACTIVIDADES Y PROGRAMAS
-- =========================

create table actividades (
    id_actividad int auto_increment primary key,
    titulo varchar(100) not null,
    descripcion text,
    tipo enum('banco_alimentos','senderismo_terapeutico','terapia_psicologica') not null,
    modalidad enum('presencial','distancia','mixta') default 'presencial',
    fecha datetime not null,
    cupo int default 0,
    creado_en datetime default current_timestamp
);

create table inscripciones (
    id_inscripcion int auto_increment primary key,
    id_usuario int not null,
    id_actividad int not null,
    fecha_inscripcion datetime default current_timestamp,
    confirmada boolean default false,
    unique key uk_usuario_actividad (id_usuario, id_actividad),
    foreign key (id_usuario) references usuarios(id_usuario) on delete cascade,
    foreign key (id_actividad) references actividades(id_actividad) on delete cascade
);

-- =========================
-- 7. DONACIONES Y FACTURACIÓN
-- =========================

create table donaciones (
    id_donacion int auto_increment primary key,
    id_usuario int not null,
    tipo enum('monetaria','deducible','especie') not null,
    monto decimal(10,2),
    descripcion text,
    evidencia_url varchar(255),
    fecha datetime default current_timestamp,
    validado boolean default false,
    foreign key (id_usuario) references usuarios(id_usuario) on delete cascade
);

create table facturas (
    id_factura int auto_increment primary key,
    id_donacion int not null,
    rfc varchar(13) not null,
    razon_social varchar(150),
    uso_cfdi varchar(10) not null,
    metodo_pago varchar(10),
    forma_pago varchar(10),
    fecha_emision datetime default current_timestamp,
    total decimal(10,2) not null,
    uuid varchar(50),
    xml_url text,
    pdf_url text,
    unique key uk_factura_donacion (id_donacion),
    foreign key (id_donacion) references donaciones(id_donacion) on delete cascade
);

-- =========================
-- 8. VOLUNTARIADO / SERVICIO SOCIAL
-- =========================

create table voluntariados (
    id_voluntariado int auto_increment primary key,
    id_usuario int not null,
    actividad_asignada varchar(100),
    horas_reportadas int default 0,
    validado boolean default false,
    fecha_inicio date,
    fecha_fin date,
    foreign key (id_usuario) references usuarios(id_usuario) on delete cascade
);

-- =========================
-- 9. MENSAJES DE CONTACTO
-- =========================

create table mensajes_contacto (
    id_mensaje int auto_increment primary key,
    id_usuario int null,
    nombre varchar(100),
    correo varchar(100),
    asunto varchar(150),
    mensaje text not null,
    atendido boolean default false,
    fecha datetime default current_timestamp,
    foreign key (id_usuario) references usuarios(id_usuario) on delete set null
);
