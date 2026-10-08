-- ==============================================================================================
-- TITULO E-COMMERCE PLATFORM: ENTERPRISE RELATIONAL SCHEMA (5NF / PJNF)
-- MOTOR DE BASE DE DATOS: PostgreSQL 14+ / ACID EXTREMO / DESGLOSE ATÓMICO TOTAL
-- TABLAS TOTALES: 58 TABLAS RIGUROSAMENTE NORMALIZADAS HASTA LA QUINTA FORMA NORMAL
-- ENFOQUE: MULTI-MARCA, HOMBRE / MUJER / UNISEX, MULTI-BODEGA, KARDEX ACID, B2B Y AUDITORÍA
-- ==============================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================================
-- SECCIÓN 1: IDENTIDAD, PERSONAS, USUARIOS Y ROLES (9 TABLAS)
-- ==============================================================================================

CREATE TABLE catalogo_tipo_documento_identidad (
    tipo_documento_id SERIAL PRIMARY KEY,
    codigo_tipo VARCHAR(10) NOT NULL UNIQUE,
    nombre_documento VARCHAR(80) NOT NULL,
    descripcion_formato VARCHAR(120) NULL,
    es_activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE persona (
    persona_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_documento_id INT NOT NULL,
    numero_identificacion VARCHAR(35) NOT NULL,
    primer_nombre VARCHAR(60) NOT NULL,
    segundo_nombre VARCHAR(60) NULL,
    primer_apellido VARCHAR(60) NOT NULL,
    segundo_apellido VARCHAR(60) NULL,
    fecha_nacimiento DATE NULL,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_persona_identificacion UNIQUE (tipo_documento_id, numero_identificacion),
    CONSTRAINT fk_persona_tipo_doc FOREIGN KEY (tipo_documento_id)
        REFERENCES catalogo_tipo_documento_identidad (tipo_documento_id) ON DELETE RESTRICT
);

CREATE TABLE persona_correo_electronico (
    correo_id BIGSERIAL PRIMARY KEY,
    persona_id UUID NOT NULL,
    direccion_correo VARCHAR(254) NOT NULL,
    es_principal BOOLEAN NOT NULL DEFAULT TRUE,
    esta_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_correo_direccion UNIQUE (direccion_correo),
    CONSTRAINT fk_correo_persona FOREIGN KEY (persona_id)
        REFERENCES persona (persona_id) ON DELETE CASCADE
);

CREATE TABLE persona_telefono_desglosado (
    telefono_id BIGSERIAL PRIMARY KEY,
    persona_id UUID NOT NULL,
    codigo_pais_e164 VARCHAR(5) NOT NULL,
    prefijo_area VARCHAR(10) NULL,
    numero_suscriptor VARCHAR(20) NOT NULL,
    extension_linea VARCHAR(10) NULL,
    es_movil BOOLEAN NOT NULL DEFAULT TRUE,
    es_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_telefono_persona FOREIGN KEY (persona_id)
        REFERENCES persona (persona_id) ON DELETE CASCADE
);

CREATE TABLE usuario_cuenta (
    usuario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL UNIQUE,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    hash_clave_autenticacion VARCHAR(255) NOT NULL,
    sal_criptografica VARCHAR(64) NOT NULL,
    cuenta_activa BOOLEAN NOT NULL DEFAULT TRUE,
    bloqueada_por_intentos BOOLEAN NOT NULL DEFAULT FALSE,
    ultimo_acceso_el TIMESTAMPTZ NULL,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_persona FOREIGN KEY (persona_id)
        REFERENCES persona (persona_id) ON DELETE CASCADE
);

CREATE TABLE catalogo_rol_sistema (
    rol_id SERIAL PRIMARY KEY,
    codigo_rol VARCHAR(30) NOT NULL UNIQUE,
    nombre_rol VARCHAR(60) NOT NULL,
    descripcion_rol VARCHAR(200) NOT NULL,
    nivel_privilegio INT NOT NULL DEFAULT 1
);

CREATE TABLE usuario_rol_asignado (
    usuario_id UUID NOT NULL,
    rol_id INT NOT NULL,
    asignado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_el TIMESTAMPTZ NULL,
    PRIMARY KEY (usuario_id, rol_id),
    CONSTRAINT fk_asig_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuario_cuenta (usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_asig_rol FOREIGN KEY (rol_id)
        REFERENCES catalogo_rol_sistema (rol_id) ON DELETE RESTRICT
);

CREATE TABLE catalogo_nivel_fidelizacion_cliente (
    nivel_id SERIAL PRIMARY KEY,
    codigo_nivel VARCHAR(20) NOT NULL UNIQUE,
    nombre_nivel VARCHAR(50) NOT NULL,
    puntos_requeridos INT NOT NULL DEFAULT 0,
    descuento_porcentual_adicional NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    envio_gratis_prioritario BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE cliente_perfil (
    usuario_id UUID PRIMARY KEY,
    nivel_id INT NOT NULL DEFAULT 1,
    puntos_fidelidad_acumulados INT NOT NULL DEFAULT 0,
    total_compras_historico NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    preferencia_moneda VARCHAR(3) NOT NULL DEFAULT 'COP',
    preferencia_idioma VARCHAR(5) NOT NULL DEFAULT 'es-CO',
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuario_cuenta (usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_cliente_nivel FOREIGN KEY (nivel_id)
        REFERENCES catalogo_nivel_fidelizacion_cliente (nivel_id) ON DELETE RESTRICT
);

-- ==============================================================================================
-- SECCIÓN 2: GEOGRAFÍA Y DIRECCIONES ATÓMICAS (5 TABLAS)
-- ==============================================================================================

CREATE TABLE catalogo_pais_iso (
    pais_id SERIAL PRIMARY KEY,
    codigo_iso_alfa2 CHAR(2) NOT NULL UNIQUE,
    codigo_iso_alfa3 CHAR(3) NOT NULL UNIQUE,
    codigo_iso_numerico CHAR(3) NOT NULL UNIQUE,
    nombre_comun VARCHAR(90) NOT NULL,
    nombre_formal VARCHAR(120) NOT NULL,
    es_activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE catalogo_subdivision_pais (
    subdivision_id SERIAL PRIMARY KEY,
    pais_id INT NOT NULL,
    codigo_subdivision_iso VARCHAR(10) NOT NULL,
    nombre_subdivision VARCHAR(90) NOT NULL,
    tipo_subdivision VARCHAR(40) NOT NULL,
    CONSTRAINT uq_subdivision UNIQUE (pais_id, codigo_subdivision_iso),
    CONSTRAINT fk_subdiv_pais FOREIGN KEY (pais_id)
        REFERENCES catalogo_pais_iso (pais_id) ON DELETE RESTRICT
);

CREATE TABLE catalogo_ciudad (
    ciudad_id SERIAL PRIMARY KEY,
    subdivision_id INT NOT NULL,
    nombre_ciudad VARCHAR(90) NOT NULL,
    codigo_postal_base VARCHAR(15) NULL,
    CONSTRAINT fk_ciudad_subdiv FOREIGN KEY (subdivision_id)
        REFERENCES catalogo_subdivision_pais (subdivision_id) ON DELETE RESTRICT
);

CREATE TABLE direccion_postal_desglosada (
    direccion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ciudad_id INT NOT NULL,
    tipo_via VARCHAR(25) NOT NULL,
    nombre_via VARCHAR(80) NOT NULL,
    numero_exterior VARCHAR(25) NOT NULL,
    numero_interior VARCHAR(25) NULL,
    barrio_colonia VARCHAR(80) NULL,
    codigo_postal VARCHAR(15) NOT NULL,
    referencia_adicional VARCHAR(200) NULL,
    coordenada_latitud NUMERIC(10, 7) NULL,
    coordenada_longitud NUMERIC(10, 7) NULL,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dir_ciudad FOREIGN KEY (ciudad_id)
        REFERENCES catalogo_ciudad (ciudad_id) ON DELETE RESTRICT
);

CREATE TABLE persona_direccion_asociada (
    persona_id UUID NOT NULL,
    direccion_id UUID NOT NULL,
    tipo_direccion VARCHAR(20) NOT NULL CHECK (tipo_direccion IN ('ENVIO', 'FACTURACION', 'BODEGA_PERSONAL')),
    es_predeterminada BOOLEAN NOT NULL DEFAULT FALSE,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (persona_id, direccion_id, tipo_direccion),
    CONSTRAINT fk_asoc_persona FOREIGN KEY (persona_id)
        REFERENCES persona (persona_id) ON DELETE CASCADE,
    CONSTRAINT fk_asoc_direccion FOREIGN KEY (direccion_id)
        REFERENCES direccion_postal_desglosada (direccion_id) ON DELETE RESTRICT
);

-- ==============================================================================================
-- SECCIÓN 3: MARCAS, FABRICANTES Y PROVEEDORES (4 TABLAS)
-- ==============================================================================================

CREATE TABLE catalogo_marca (
    marca_id SERIAL PRIMARY KEY,
    codigo_marca VARCHAR(30) NOT NULL UNIQUE,
    nombre_comercial VARCHAR(100) NOT NULL,
    razon_social VARCHAR(150) NULL,
    pais_origen_id INT NOT NULL,
    sitio_web_url VARCHAR(255) NULL,
    biografia_marca TEXT NULL,
    logo_icono_url VARCHAR(255) NULL,
    es_marca_propia BOOLEAN NOT NULL DEFAULT FALSE,
    es_activa BOOLEAN NOT NULL DEFAULT TRUE,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_marca_pais FOREIGN KEY (pais_origen_id)
        REFERENCES catalogo_pais_iso (pais_id) ON DELETE RESTRICT
);

CREATE TABLE marca_contacto (
    contacto_id SERIAL PRIMARY KEY,
    marca_id INT NOT NULL,
    tipo_contacto VARCHAR(30) NOT NULL CHECK (tipo_contacto IN ('EMAIL_COMERCIAL', 'EMAIL_PRENSA', 'TELEFONO', 'INSTAGRAM', 'TIKTOK')),
    valor_contacto VARCHAR(200) NOT NULL,
    CONSTRAINT fk_contacto_marca FOREIGN KEY (marca_id)
        REFERENCES catalogo_marca (marca_id) ON DELETE CASCADE
);

CREATE TABLE catalogo_fabricante_proveedor (
    fabricante_id SERIAL PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    identificacion_tributaria_nit VARCHAR(40) NOT NULL UNIQUE,
    pais_origen_id INT NOT NULL,
    direccion_id UUID NULL,
    certificacion_sostenibilidad VARCHAR(120) NULL,
    es_activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fab_pais FOREIGN KEY (pais_origen_id)
        REFERENCES catalogo_pais_iso (pais_id) ON DELETE RESTRICT,
    CONSTRAINT fk_fab_dir FOREIGN KEY (direccion_id)
        REFERENCES direccion_postal_desglosada (direccion_id) ON DELETE SET NULL
);

-- Proyección 5NF: Marcas asociadas a Fabricantes autorizados
CREATE TABLE marca_fabricante_autorizado_5nf (
    marca_id INT NOT NULL,
    fabricante_id INT NOT NULL,
    fecha_autorizacion DATE NOT NULL DEFAULT CURRENT_DATE,
    vigente BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (marca_id, fabricante_id),
    CONSTRAINT fk_mf_marca FOREIGN KEY (marca_id)
        REFERENCES catalogo_marca (marca_id) ON DELETE CASCADE,
    CONSTRAINT fk_mf_fabricante FOREIGN KEY (fabricante_id)
        REFERENCES catalogo_fabricante_proveedor (fabricante_id) ON DELETE RESTRICT
);

-- ==============================================================================================
-- SECCIÓN 4: TAXONOMÍA DE MODA HOMBRE / MUJER / UNISEX (9 TABLAS)
-- ==============================================================================================

CREATE TABLE catalogo_departamento_moda (
    departamento_id SERIAL PRIMARY KEY,
    codigo_departamento VARCHAR(30) NOT NULL UNIQUE,
    nombre_departamento VARCHAR(60) NOT NULL,
    descripcion VARCHAR(150) NULL
);

CREATE TABLE catalogo_categoria_prenda (
    categoria_id SERIAL PRIMARY KEY,
    departamento_id INT NOT NULL,
    codigo_categoria VARCHAR(40) NOT NULL UNIQUE,
    nombre_categoria VARCHAR(70) NOT NULL,
    slug_categoria VARCHAR(80) NOT NULL UNIQUE,
    CONSTRAINT fk_cat_departamento FOREIGN KEY (departamento_id)
        REFERENCES catalogo_departamento_moda (departamento_id) ON DELETE RESTRICT
);

CREATE TABLE catalogo_subcategoria_prenda (
    subcategoria_id SERIAL PRIMARY KEY,
    categoria_id INT NOT NULL,
    codigo_subcategoria VARCHAR(40) NOT NULL UNIQUE,
    nombre_subcategoria VARCHAR(80) NOT NULL,
    slug_subcategoria VARCHAR(90) NOT NULL UNIQUE,
    CONSTRAINT fk_subcat_categoria FOREIGN KEY (categoria_id)
        REFERENCES catalogo_categoria_prenda (categoria_id) ON DELETE RESTRICT
);

CREATE TABLE catalogo_genero_indumentaria (
    genero_id SERIAL PRIMARY KEY,
    codigo_genero VARCHAR(20) NOT NULL UNIQUE,
    nombre_genero VARCHAR(40) NOT NULL,
    descripcion_antropometrica VARCHAR(180) NULL
);

CREATE TABLE catalogo_estilo_estetica (
    estilo_id SERIAL PRIMARY KEY,
    codigo_estilo VARCHAR(30) NOT NULL UNIQUE,
    nombre_estilo VARCHAR(60) NOT NULL,
    descripcion_conceptual VARCHAR(220) NULL
);

CREATE TABLE catalogo_tipo_corte_silueta (
    corte_silueta_id SERIAL PRIMARY KEY,
    codigo_silueta VARCHAR(30) NOT NULL UNIQUE,
    nombre_silueta VARCHAR(60) NOT NULL,
    descripcion_caida_tela VARCHAR(200) NULL
);

CREATE TABLE catalogo_temporada_coleccion (
    coleccion_id SERIAL PRIMARY KEY,
    codigo_coleccion VARCHAR(30) NOT NULL UNIQUE,
    nombre_coleccion VARCHAR(80) NOT NULL,
    ano_calendario INT NOT NULL CHECK (ano_calendario >= 2020),
    es_drop_limitado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_lanzamiento DATE NOT NULL,
    fecha_cierre DATE NULL
);

CREATE TABLE catalogo_fibra_textil (
    fibra_id SERIAL PRIMARY KEY,
    codigo_fibra VARCHAR(20) NOT NULL UNIQUE,
    nombre_fibra VARCHAR(60) NOT NULL,
    tipo_origen VARCHAR(30) NOT NULL CHECK (tipo_origen IN ('NATURAL_VEGETAL', 'NATURAL_ANIMAL', 'SINTETICA', 'RECICLADA', 'REGENERADA')),
    biodegradable BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE catalogo_cuidado_lavado_textil (
    instruccion_id SERIAL PRIMARY KEY,
    codigo_iso_cuidado VARCHAR(30) NOT NULL UNIQUE,
    temperatura_maxima_celsius INT NULL,
    permite_secadora BOOLEAN NOT NULL DEFAULT FALSE,
    permite_blanqueador BOOLEAN NOT NULL DEFAULT FALSE,
    descripcion_espanol VARCHAR(150) NOT NULL
);

-- ==============================================================================================
-- SECCIÓN 5: PRODUCTO BASE Y PROYECCIONES 5NF (6 TABLAS)
-- ==============================================================================================

CREATE TABLE producto_base (
    producto_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_base_raiz VARCHAR(30) NOT NULL UNIQUE,
    marca_id INT NOT NULL,
    categoria_id INT NOT NULL,
    subcategoria_id INT NOT NULL,
    corte_silueta_id INT NOT NULL,
    coleccion_id INT NOT NULL,
    nombre_comercial VARCHAR(120) NOT NULL,
    slug_producto VARCHAR(150) NOT NULL UNIQUE,
    descripcion_narrativa TEXT NOT NULL,
    especificaciones_tecnicas JSONB NULL,
    gramaje_gsm INT NULL CHECK (gramaje_gsm > 0),
    precio_base_sugerido NUMERIC(12, 2) NOT NULL CHECK (precio_base_sugerido >= 0),
    peso_neto_gramos INT NOT NULL CHECK (peso_neto_gramos > 0),
    es_activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prod_marca FOREIGN KEY (marca_id)
        REFERENCES catalogo_marca (marca_id) ON DELETE RESTRICT,
    CONSTRAINT fk_prod_categoria FOREIGN KEY (categoria_id)
        REFERENCES catalogo_categoria_prenda (categoria_id) ON DELETE RESTRICT,
    CONSTRAINT fk_prod_subcategoria FOREIGN KEY (subcategoria_id)
        REFERENCES catalogo_subcategoria_prenda (subcategoria_id) ON DELETE RESTRICT,
    CONSTRAINT fk_prod_silueta FOREIGN KEY (corte_silueta_id)
        REFERENCES catalogo_tipo_corte_silueta (corte_silueta_id) ON DELETE RESTRICT,
    CONSTRAINT fk_prod_coleccion FOREIGN KEY (coleccion_id)
        REFERENCES catalogo_temporada_coleccion (coleccion_id) ON DELETE RESTRICT
);

-- 4NF: Composición textil multivaluada desacoplada
CREATE TABLE producto_composicion_textil (
    producto_id UUID NOT NULL,
    fibra_id INT NOT NULL,
    porcentaje_composicion NUMERIC(5, 2) NOT NULL CHECK (porcentaje_composicion > 0.00 AND porcentaje_composicion <= 100.00),
    PRIMARY KEY (producto_id, fibra_id),
    CONSTRAINT fk_comp_producto FOREIGN KEY (producto_id)
        REFERENCES producto_base (producto_id) ON DELETE CASCADE,
    CONSTRAINT fk_comp_fibra FOREIGN KEY (fibra_id)
        REFERENCES catalogo_fibra_textil (fibra_id) ON DELETE RESTRICT
);

CREATE TABLE producto_cuidado_asociado (
    producto_id UUID NOT NULL,
    instruccion_id INT NOT NULL,
    PRIMARY KEY (producto_id, instruccion_id),
    CONSTRAINT fk_cuidad_prod FOREIGN KEY (producto_id)
        REFERENCES producto_base (producto_id) ON DELETE CASCADE,
    CONSTRAINT fk_cuidad_inst FOREIGN KEY (instruccion_id)
        REFERENCES catalogo_cuidado_lavado_textil (instruccion_id) ON DELETE RESTRICT
);

-- ==============================================================================================
-- DEMOSTRACIÓN MATEMÁTICA DE 5NF (PROJECT-JOIN NORMAL FORM / PJNF):
-- Regla Ternaria {Producto, Género, Estilo} se descompone en 3 proyecciones binarias sin tuplas espurias:
-- R1: producto_genero_5nf (Producto x Género)
-- R2: genero_estilo_5nf (Género x Estilo)
-- R3: producto_estilo_5nf (Producto x Estilo)
-- Relación reconstruible unívocamente: R1 ⋈ R2 ⋈ R3
-- ==============================================================================================

CREATE TABLE producto_genero_5nf (
    producto_id UUID NOT NULL,
    genero_id INT NOT NULL,
    PRIMARY KEY (producto_id, genero_id),
    CONSTRAINT fk_pgen_producto FOREIGN KEY (producto_id)
        REFERENCES producto_base (producto_id) ON DELETE CASCADE,
    CONSTRAINT fk_pgen_genero FOREIGN KEY (genero_id)
        REFERENCES catalogo_genero_indumentaria (genero_id) ON DELETE RESTRICT
);

CREATE TABLE genero_estilo_5nf (
    genero_id INT NOT NULL,
    estilo_id INT NOT NULL,
    PRIMARY KEY (genero_id, estilo_id),
    CONSTRAINT fk_gest_genero FOREIGN KEY (genero_id)
        REFERENCES catalogo_genero_indumentaria (genero_id) ON DELETE RESTRICT,
    CONSTRAINT fk_gest_estilo FOREIGN KEY (estilo_id)
        REFERENCES catalogo_estilo_estetica (estilo_id) ON DELETE RESTRICT
);

CREATE TABLE producto_estilo_5nf (
    producto_id UUID NOT NULL,
    estilo_id INT NOT NULL,
    PRIMARY KEY (producto_id, estilo_id),
    CONSTRAINT fk_pest_producto FOREIGN KEY (producto_id)
        REFERENCES producto_base (producto_id) ON DELETE CASCADE,
    CONSTRAINT fk_pest_estilo FOREIGN KEY (estilo_id)
        REFERENCES catalogo_estilo_estetica (estilo_id) ON DELETE RESTRICT
);

-- ==============================================================================================
-- SECCIÓN 6: VARIANTES (SKUs), COLORES, TALLAS Y MULTIMEDIA (6 TABLAS)
-- ==============================================================================================

CREATE TABLE catalogo_color_paleta (
    color_id SERIAL PRIMARY KEY,
    codigo_hex CHAR(7) NOT NULL CHECK (codigo_hex ~* '^#[a-f0-9]{6}$'),
    nombre_color VARCHAR(50) NOT NULL,
    pantone_referencia VARCHAR(30) NULL,
    es_activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE catalogo_sistema_talla (
    sistema_id SERIAL PRIMARY KEY,
    codigo_sistema VARCHAR(20) NOT NULL UNIQUE,
    nombre_sistema VARCHAR(50) NOT NULL,
    region_geografica VARCHAR(40) NOT NULL
);

CREATE TABLE catalogo_talla_prenda (
    talla_id SERIAL PRIMARY KEY,
    sistema_id INT NOT NULL,
    codigo_talla VARCHAR(15) NOT NULL,
    nombre_etiqueta VARCHAR(30) NOT NULL,
    orden_presentacion INT NOT NULL DEFAULT 1,
    CONSTRAINT uq_talla_sistema UNIQUE (sistema_id, codigo_talla),
    CONSTRAINT fk_talla_sistema FOREIGN KEY (sistema_id)
        REFERENCES catalogo_sistema_talla (sistema_id) ON DELETE RESTRICT
);

CREATE TABLE catalogo_guia_medidas_corporales (
    guia_id SERIAL PRIMARY KEY,
    talla_id INT NOT NULL,
    genero_id INT NOT NULL,
    pecho_min_cm NUMERIC(5,1) NOT NULL,
    pecho_max_cm NUMERIC(5,1) NOT NULL,
    cintura_min_cm NUMERIC(5,1) NOT NULL,
    cintura_max_cm NUMERIC(5,1) NOT NULL,
    cadera_min_cm NUMERIC(5,1) NOT NULL,
    cadera_max_cm NUMERIC(5,1) NOT NULL,
    largo_prenda_cm NUMERIC(5,1) NOT NULL,
    CONSTRAINT uq_guia_talla_gen UNIQUE (talla_id, genero_id),
    CONSTRAINT fk_guia_talla FOREIGN KEY (talla_id)
        REFERENCES catalogo_talla_prenda (talla_id) ON DELETE CASCADE,
    CONSTRAINT fk_guia_genero FOREIGN KEY (genero_id)
        REFERENCES catalogo_genero_indumentaria (genero_id) ON DELETE RESTRICT
);

CREATE TABLE producto_variante_sku (
    variante_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL,
    color_id INT NOT NULL,
    talla_id INT NOT NULL,
    sku_alfanumerico VARCHAR(45) NOT NULL UNIQUE,
    codigo_barras_ean13 CHAR(13) NULL UNIQUE,
    ajuste_precio_monto NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    es_activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_producto_color_talla UNIQUE (producto_id, color_id, talla_id),
    CONSTRAINT fk_var_producto FOREIGN KEY (producto_id)
        REFERENCES producto_base (producto_id) ON DELETE CASCADE,
    CONSTRAINT fk_var_color FOREIGN KEY (color_id)
        REFERENCES catalogo_color_paleta (color_id) ON DELETE RESTRICT,
    CONSTRAINT fk_var_talla FOREIGN KEY (talla_id)
        REFERENCES catalogo_talla_prenda (talla_id) ON DELETE RESTRICT
);

CREATE TABLE producto_variante_recurso_multimedia (
    recurso_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variante_id UUID NOT NULL,
    url_ubicacion_recurso VARCHAR(500) NOT NULL,
    tipo_multimedia VARCHAR(20) NOT NULL CHECK (tipo_multimedia IN ('IMAGEN_PACKSHOT', 'IMAGEN_LOOKBOOK', 'VIDEO_PASARELA', 'MODELO_3D_GLTF')),
    orden_secuencia INT NOT NULL DEFAULT 1,
    es_foto_principal BOOLEAN NOT NULL DEFAULT FALSE,
    texto_alternativo_accesibilidad VARCHAR(160) NOT NULL,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_multimedia_variante FOREIGN KEY (variante_id)
        REFERENCES producto_variante_sku (variante_id) ON DELETE CASCADE
);

-- ==============================================================================================
-- SECCIÓN 7: ALMACENES, LOTES, STOCK Y KARDEX ACID (4 TABLAS)
-- ==============================================================================================

CREATE TABLE catalogo_almacen_bodega (
    almacen_id SERIAL PRIMARY KEY,
    codigo_almacen VARCHAR(20) NOT NULL UNIQUE,
    nombre_almacen VARCHAR(80) NOT NULL,
    direccion_id UUID NOT NULL,
    es_almacen_principal BOOLEAN NOT NULL DEFAULT FALSE,
    permite_despacho_ecommerce BOOLEAN NOT NULL DEFAULT TRUE,
    es_activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_almacen_dir FOREIGN KEY (direccion_id)
        REFERENCES direccion_postal_desglosada (direccion_id) ON DELETE RESTRICT
);

CREATE TABLE catalogo_lote_produccion (
    lote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variante_id UUID NOT NULL,
    numero_lote_fabricante VARCHAR(50) NOT NULL,
    fecha_fabricacion DATE NOT NULL,
    costo_unitario_fabricacion NUMERIC(12,2) NOT NULL CHECK (costo_unitario_fabricacion >= 0),
    CONSTRAINT fk_lote_variante FOREIGN KEY (variante_id)
        REFERENCES producto_variante_sku (variante_id) ON DELETE RESTRICT
);

CREATE TABLE existencia_inventario_bodega (
    variante_id UUID NOT NULL,
    almacen_id INT NOT NULL,
    unidades_disponibles INT NOT NULL DEFAULT 0 CHECK (unidades_disponibles >= 0),
    unidades_reservadas INT NOT NULL DEFAULT 0 CHECK (unidades_reservadas >= 0),
    umbral_minimo_reorden INT NOT NULL DEFAULT 5 CHECK (umbral_minimo_reorden >= 0),
    actualizado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (variante_id, almacen_id),
    CONSTRAINT fk_inv_variante FOREIGN KEY (variante_id)
        REFERENCES producto_variante_sku (variante_id) ON DELETE RESTRICT,
    CONSTRAINT fk_inv_almacen FOREIGN KEY (almacen_id)
        REFERENCES catalogo_almacen_bodega (almacen_id) ON DELETE RESTRICT
);

CREATE TABLE bitacora_kardex_movimiento_inventario (
    movimiento_id BIGSERIAL PRIMARY KEY,
    variante_id UUID NOT NULL,
    almacen_id INT NOT NULL,
    lote_id UUID NULL,
    tipo_movimiento VARCHAR(25) NOT NULL CHECK (tipo_movimiento IN ('ENTRADA_COMPRA', 'SALIDA_VENTA', 'RESERVA_CHECKOUT', 'LIBERACION_RESERVA', 'DEVOLUCION_CLIENTE', 'AJUSTE_MERMA')),
    unidades_afectadas INT NOT NULL,
    saldo_resultante_disponible INT NOT NULL,
    saldo_resultante_reservado INT NOT NULL,
    documento_soporte_referencia VARCHAR(80) NOT NULL,
    usuario_operador_id UUID NULL,
    registrado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_kardex_variante FOREIGN KEY (variante_id)
        REFERENCES producto_variante_sku (variante_id) ON DELETE RESTRICT,
    CONSTRAINT fk_kardex_almacen FOREIGN KEY (almacen_id)
        REFERENCES catalogo_almacen_bodega (almacen_id) ON DELETE RESTRICT,
    CONSTRAINT fk_kardex_lote FOREIGN KEY (lote_id)
        REFERENCES catalogo_lote_produccion (lote_id) ON DELETE SET NULL,
    CONSTRAINT fk_kardex_usuario FOREIGN KEY (usuario_operador_id)
        REFERENCES usuario_cuenta (usuario_id) ON DELETE SET NULL
);

-- ==============================================================================================
-- SECCIÓN 8: COMPRAS B2B Y ABASTECIMIENTO DE PROVEEDORES (2 TABLAS)
-- ==============================================================================================

CREATE TABLE orden_compra_proveedor_b2b (
    orden_b2b_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_orden_consecutivo VARCHAR(40) NOT NULL UNIQUE,
    fabricante_id INT NOT NULL,
    almacen_destino_id INT NOT NULL,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_esperada_entrega DATE NOT NULL,
    monto_total_pactado NUMERIC(14,2) NOT NULL CHECK (monto_total_pactado >= 0),
    estado_orden VARCHAR(30) NOT NULL DEFAULT 'BORRADOR' CHECK (estado_orden IN ('BORRADOR', 'EMITIDA', 'EN_FABRICACION', 'DESPACHADA', 'RECIBIDA_COMPLETA', 'CANCELADA')),
    CONSTRAINT fk_b2b_fabricante FOREIGN KEY (fabricante_id)
        REFERENCES catalogo_fabricante_proveedor (fabricante_id) ON DELETE RESTRICT,
    CONSTRAINT fk_b2b_almacen FOREIGN KEY (almacen_destino_id)
        REFERENCES catalogo_almacen_bodega (almacen_id) ON DELETE RESTRICT
);

CREATE TABLE orden_compra_proveedor_detalle (
    detalle_b2b_id BIGSERIAL PRIMARY KEY,
    orden_b2b_id UUID NOT NULL,
    variante_id UUID NOT NULL,
    cantidad_ordenada INT NOT NULL CHECK (cantidad_ordenada > 0),
    cantidad_recibida INT NOT NULL DEFAULT 0 CHECK (cantidad_recibida >= 0),
    costo_unitario_acordado NUMERIC(12,2) NOT NULL CHECK (costo_unitario_acordado >= 0),
    CONSTRAINT fk_b2b_det_orden FOREIGN KEY (orden_b2b_id)
        REFERENCES orden_compra_proveedor_b2b (orden_b2b_id) ON DELETE CASCADE,
    CONSTRAINT fk_b2b_det_variante FOREIGN KEY (variante_id)
        REFERENCES producto_variante_sku (variante_id) ON DELETE RESTRICT
);

-- ==============================================================================================
-- SECCIÓN 9: CUPONES, DESCUENTOS Y PROMOCIONES (2 TABLAS)
-- ==============================================================================================

CREATE TABLE cupon_descuento_promocion (
    cupon_id SERIAL PRIMARY KEY,
    codigo_alfanumerico VARCHAR(30) NOT NULL UNIQUE,
    descripcion_beneficio VARCHAR(150) NOT NULL,
    porcentaje_descuento NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (porcentaje_descuento >= 0 AND porcentaje_descuento <= 100),
    monto_fijo_descuento NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (monto_fijo_descuento >= 0),
    compra_minima_requerida NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    limite_usos_global INT NULL,
    usos_actuales_contador INT NOT NULL DEFAULT 0,
    fecha_vigencia_inicio TIMESTAMPTZ NOT NULL,
    fecha_vigencia_fin TIMESTAMPTZ NOT NULL,
    es_activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE cupon_uso_bitacora (
    uso_id BIGSERIAL PRIMARY KEY,
    cupon_id INT NOT NULL,
    usuario_id UUID NOT NULL,
    orden_id UUID NULL,
    monto_descontado NUMERIC(12,2) NOT NULL,
    fecha_aplicacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cupon_bit FOREIGN KEY (cupon_id)
        REFERENCES cupon_descuento_promocion (cupon_id) ON DELETE RESTRICT,
    CONSTRAINT fk_cupon_usr FOREIGN KEY (usuario_id)
        REFERENCES usuario_cuenta (usuario_id) ON DELETE RESTRICT
);

-- ==============================================================================================
-- SECCIÓN 10: VENTAS, CHECKOUT ACID Y PAGOS (4 TABLAS)
-- ==============================================================================================

CREATE TABLE orden_compra_transaccion (
    orden_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_orden_unico VARCHAR(32) NOT NULL UNIQUE,
    usuario_id UUID NOT NULL,
    direccion_envio_id UUID NOT NULL,
    direccion_facturacion_id UUID NOT NULL,
    cupon_aplicado_id INT NULL,
    subtotal_neto NUMERIC(12,2) NOT NULL CHECK (subtotal_neto >= 0),
    monto_impuesto_iva NUMERIC(12,2) NOT NULL CHECK (monto_impuesto_iva >= 0),
    costo_flete_envio NUMERIC(12,2) NOT NULL CHECK (costo_flete_envio >= 0),
    monto_descuento_total NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (monto_descuento_total >= 0),
    total_bruto_pagado NUMERIC(12,2) NOT NULL CHECK (total_bruto_pagado >= 0),
    estado_orden VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE_PAGO' CHECK (estado_orden IN ('PENDIENTE_PAGO', 'PAGADA', 'EN_PREPARACION', 'DESPACHADA', 'ENTREGADA', 'CANCELADA', 'REEMBOLSADA')),
    clave_idempotencia_checkout VARCHAR(64) NOT NULL UNIQUE,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orden_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuario_cuenta (usuario_id) ON DELETE RESTRICT,
    CONSTRAINT fk_orden_dir_envio FOREIGN KEY (direccion_envio_id)
        REFERENCES direccion_postal_desglosada (direccion_id) ON DELETE RESTRICT,
    CONSTRAINT fk_orden_dir_fact FOREIGN KEY (direccion_facturacion_id)
        REFERENCES direccion_postal_desglosada (direccion_id) ON DELETE RESTRICT,
    CONSTRAINT fk_orden_cupon FOREIGN KEY (cupon_aplicado_id)
        REFERENCES cupon_descuento_promocion (cupon_id) ON DELETE SET NULL
);

CREATE TABLE orden_linea_articulo (
    linea_id BIGSERIAL PRIMARY KEY,
    orden_id UUID NOT NULL,
    variante_id UUID NOT NULL,
    cantidad_unidades INT NOT NULL CHECK (cantidad_unidades > 0),
    precio_unitario_historico NUMERIC(12,2) NOT NULL CHECK (precio_unitario_historico >= 0),
    impuesto_unitario_historico NUMERIC(12,2) NOT NULL CHECK (impuesto_unitario_historico >= 0),
    subtotal_linea NUMERIC(12,2) NOT NULL CHECK (subtotal_linea >= 0),
    CONSTRAINT fk_linea_orden FOREIGN KEY (orden_id)
        REFERENCES orden_compra_transaccion (orden_id) ON DELETE CASCADE,
    CONSTRAINT fk_linea_variante FOREIGN KEY (variante_id)
        REFERENCES producto_variante_sku (variante_id) ON DELETE RESTRICT
);

CREATE TABLE catalogo_pasarela_pago (
    pasarela_id SERIAL PRIMARY KEY,
    codigo_pasarela VARCHAR(30) NOT NULL UNIQUE,
    nombre_pasarela VARCHAR(60) NOT NULL,
    es_activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE transaccion_pago_acid (
    pago_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id UUID NOT NULL,
    pasarela_id INT NOT NULL,
    referencia_transaccion_externa VARCHAR(120) NOT NULL UNIQUE,
    monto_transaccion NUMERIC(12,2) NOT NULL CHECK (monto_transaccion > 0),
    codigo_moneda_iso CHAR(3) NOT NULL DEFAULT 'COP',
    estado_pago VARCHAR(25) NOT NULL CHECK (estado_pago IN ('INICIADO', 'APROBADO', 'RECHAZADO', 'DECLINADO', 'REVERSADO')),
    payload_respuesta_gateway JSONB NOT NULL,
    firma_digital_sha256 VARCHAR(64) NOT NULL,
    fecha_confirmacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_orden FOREIGN KEY (orden_id)
        REFERENCES orden_compra_transaccion (orden_id) ON DELETE RESTRICT,
    CONSTRAINT fk_pago_pasarela FOREIGN KEY (pasarela_id)
        REFERENCES catalogo_pasarela_pago (pasarela_id) ON DELETE RESTRICT
);

-- ==============================================================================================
-- SECCIÓN 11: LOGÍSTICA, ENVÍOS Y TRACKING (3 TABLAS)
-- ==============================================================================================

CREATE TABLE catalogo_empresa_transportista (
    carrier_id SERIAL PRIMARY KEY,
    codigo_carrier VARCHAR(30) NOT NULL UNIQUE,
    razon_social VARCHAR(100) NOT NULL,
    sitio_rastreo_url_template VARCHAR(255) NULL,
    es_activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE envio_paquete_logistica (
    envio_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id UUID NOT NULL UNIQUE,
    carrier_id INT NOT NULL,
    numero_guia_tracking VARCHAR(60) NOT NULL UNIQUE,
    peso_pesado_kg NUMERIC(6,3) NOT NULL,
    fecha_generacion_guia TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_despacho_almacen TIMESTAMPTZ NULL,
    fecha_estimada_entrega DATE NOT NULL,
    fecha_real_entrega TIMESTAMPTZ NULL,
    estado_envio VARCHAR(30) NOT NULL DEFAULT 'GUIA_GENERADA' CHECK (estado_envio IN ('GUIA_GENERADA', 'RECOLECTADO', 'EN_CENTRO_DISTRIBUCION', 'EN_TRANSITO', 'EN_REPARTO', 'ENTREGADO', 'NOVEDAD')),
    CONSTRAINT fk_envio_orden FOREIGN KEY (orden_id)
        REFERENCES orden_compra_transaccion (orden_id) ON DELETE RESTRICT,
    CONSTRAINT fk_envio_carrier FOREIGN KEY (carrier_id)
        REFERENCES catalogo_empresa_transportista (carrier_id) ON DELETE RESTRICT
);

CREATE TABLE envio_evento_tracking_historial (
    evento_id BIGSERIAL PRIMARY KEY,
    envio_id UUID NOT NULL,
    timestamp_evento TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ubicacion_geografica_texto VARCHAR(100) NOT NULL,
    descripcion_estado_rastreo VARCHAR(200) NOT NULL,
    codigo_evento_carrier VARCHAR(30) NULL,
    CONSTRAINT fk_track_envio FOREIGN KEY (envio_id)
        REFERENCES envio_paquete_logistica (envio_id) ON DELETE CASCADE
);

-- ==============================================================================================
-- SECCIÓN 12: DEVOLUCIONES RMA Y GARANTÍAS (2 TABLAS)
-- ==============================================================================================

CREATE TABLE solicitud_devolucion_rma (
    rma_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_rma_consecutivo VARCHAR(35) NOT NULL UNIQUE,
    orden_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    motivo_general VARCHAR(40) NOT NULL CHECK (motivo_general IN ('TALLA_INCORRECTA', 'DEFECTO_FABRICACION', 'DISCREPANCIA_COLOR', 'ARREPENTIMIENTO_COMPRA')),
    explicacion_cliente TEXT NOT NULL,
    estado_rma VARCHAR(30) NOT NULL DEFAULT 'SOLICITADA' CHECK (estado_rma IN ('SOLICITADA', 'AUTORIZADA', 'PRENDA_RECIBIDA_EN_BODEGA', 'INSPECCIONADA_CONFORME', 'REEMBOLSADA', 'RECHAZADA')),
    monto_reembolso_estimado NUMERIC(12,2) NOT NULL,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rma_orden FOREIGN KEY (orden_id)
        REFERENCES orden_compra_transaccion (orden_id) ON DELETE RESTRICT,
    CONSTRAINT fk_rma_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuario_cuenta (usuario_id) ON DELETE RESTRICT
);

CREATE TABLE devolucion_rma_item (
    item_rma_id BIGSERIAL PRIMARY KEY,
    rma_id UUID NOT NULL,
    linea_id BIGINT NOT NULL,
    cantidad_devuelta INT NOT NULL CHECK (cantidad_devuelta > 0),
    dictamen_control_calidad VARCHAR(40) NULL CHECK (dictamen_control_calidad IN ('NUEVO_REINGRESABLE', 'REPARABLE', 'DANADO_IRREPARABLE', 'USO_EVIDENTE_RECHAZADO')),
    CONSTRAINT fk_rma_item_solicitud FOREIGN KEY (rma_id)
        REFERENCES solicitud_devolucion_rma (rma_id) ON DELETE CASCADE,
    CONSTRAINT fk_rma_item_linea FOREIGN KEY (linea_id)
        REFERENCES orden_linea_articulo (linea_id) ON DELETE RESTRICT
);

-- ==============================================================================================
-- SECCIÓN 13: RESEÑAS, CALIFICACIONES Y AUDITORÍA FORENSE DML (2 TABLAS)
-- ==============================================================================================

CREATE TABLE producto_resena_calificacion (
    resena_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    orden_id UUID NULL,
    puntuacion_estrellas SMALLINT NOT NULL CHECK (puntuacion_estrellas BETWEEN 1 AND 5),
    titulo_resena VARCHAR(120) NOT NULL,
    comentario_experiencia TEXT NOT NULL,
    es_compra_verificada BOOLEAN NOT NULL DEFAULT FALSE,
    estado_moderacion VARCHAR(25) NOT NULL DEFAULT 'PUBLICADA' CHECK (estado_moderacion IN ('PENDIENTE_REVISION', 'PUBLICADA', 'MODERADA_RECHAZADA')),
    creado_el TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_resena_usuario_prod UNIQUE (producto_id, usuario_id),
    CONSTRAINT fk_resena_prod FOREIGN KEY (producto_id)
        REFERENCES producto_base (producto_id) ON DELETE CASCADE,
    CONSTRAINT fk_resena_usr FOREIGN KEY (usuario_id)
        REFERENCES usuario_cuenta (usuario_id) ON DELETE RESTRICT,
    CONSTRAINT fk_resena_ord FOREIGN KEY (orden_id)
        REFERENCES orden_compra_transaccion (orden_id) ON DELETE SET NULL
);

CREATE TABLE bitacora_auditoria_sistema (
    auditoria_id BIGSERIAL PRIMARY KEY,
    nombre_tabla VARCHAR(60) NOT NULL,
    identificador_registro_afectado VARCHAR(64) NOT NULL,
    tipo_operacion VARCHAR(10) NOT NULL CHECK (tipo_operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    usuario_responsable_id UUID NULL,
    direccion_ip_cliente VARCHAR(45) NULL,
    estado_anterior_json JSONB NULL,
    estado_nuevo_json JSONB NULL,
    timestamp_evento TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================================
-- ÍNDICES B-TREE ESTRATÉGICOS PARA RENDIMIENTO EXTREMO
-- ==============================================================================================

CREATE INDEX idx_producto_base_marca ON producto_base (marca_id);
CREATE INDEX idx_producto_base_categoria ON producto_base (categoria_id);
CREATE INDEX idx_producto_base_silueta ON producto_base (corte_silueta_id);
CREATE INDEX idx_producto_base_coleccion ON producto_base (coleccion_id);
CREATE INDEX idx_variante_sku_prod ON producto_variante_sku (producto_id);
CREATE INDEX idx_variante_sku_codigo ON producto_variante_sku (sku_alfanumerico);
CREATE INDEX idx_inventario_bodega ON existencia_inventario_bodega (almacen_id, unidades_disponibles);
CREATE INDEX idx_kardex_variante ON bitacora_kardex_movimiento_inventario (variante_id, registrado_el DESC);
CREATE INDEX idx_orden_usuario ON orden_compra_transaccion (usuario_id, creado_el DESC);
CREATE INDEX idx_orden_idempotencia ON orden_compra_transaccion (clave_idempotencia_checkout);
CREATE INDEX idx_resena_producto ON producto_resena_calificacion (producto_id, puntuacion_estrellas);

-- ==============================================================================================
-- PROCEDIMIENTO ALMACENADO ATÓMICO (ACID EXTREMO): CHECKOUT TRANSACCIONAL CON BLOQUEO PESIMISTA
-- ==============================================================================================

CREATE OR REPLACE PROCEDURE sp_procesar_checkout_atomico_acid(
    IN p_idempotencia_key VARCHAR(64),
    IN p_usuario_id UUID,
    IN p_direccion_envio_id UUID,
    IN p_direccion_facturacion_id UUID,
    IN p_cupon_codigo VARCHAR(30),
    IN p_almacen_id INT,
    IN p_items_json JSONB,
    OUT p_codigo_orden_generada VARCHAR(32),
    OUT p_total_bruto_calculado NUMERIC(12,2),
    OUT p_resultado_estado VARCHAR(30),
    OUT p_mensaje_diagnostico TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_orden_id UUID;
    v_subtotal NUMERIC(12,2) := 0.00;
    v_impuesto NUMERIC(12,2) := 0.00;
    v_flete NUMERIC(12,2) := 15000.00; -- Tarifa base
    v_descuento NUMERIC(12,2) := 0.00;
    v_total NUMERIC(12,2) := 0.00;
    v_cupon_id INT := NULL;
    v_cupon_porc NUMERIC(5,2) := 0.00;
    v_item RECORD;
    v_stock_actual INT;
    v_stock_reservado INT;
    v_precio_unitario NUMERIC(12,2);
    v_sku_codigo VARCHAR(45);
BEGIN
    -- 1. VERIFICACIÓN DE IDEMPOTENCIA
    IF EXISTS (SELECT 1 FROM orden_compra_transaccion WHERE clave_idempotencia_checkout = p_idempotencia_key) THEN
        SELECT codigo_orden_unico, total_bruto_pagado
        INTO p_codigo_orden_generada, p_total_bruto_calculado
        FROM orden_compra_transaccion
        WHERE clave_idempotencia_checkout = p_idempotencia_key;

        p_resultado_estado := 'IDEMPOTENTE_DUPLICADA';
        p_mensaje_diagnostico := 'La orden ya habia sido procesada previamente con esta clave.';
        RETURN;
    END IF;

    -- 2. VALIDAR CUPÓN SI EXISTE
    IF p_cupon_codigo IS NOT NULL AND p_cupon_codigo <> '' THEN
        SELECT cupon_id, porcentaje_descuento
        INTO v_cupon_id, v_cupon_porc
        FROM cupon_descuento_promocion
        WHERE codigo_alfanumerico = p_cupon_codigo
          AND es_activo = TRUE
          AND CURRENT_TIMESTAMP BETWEEN fecha_vigencia_inicio AND fecha_vigencia_fin;
    END IF;

    -- 3. VALIDACIÓN ATÓMICA DE STOCK CON BLOQUEO PESIMISTA (SELECT FOR UPDATE)
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items_json) AS x(variante_id UUID, cantidad INT)
    LOOP
        SELECT e.unidades_disponibles, e.unidades_reservadas, (pb.precio_base_sugerido + vs.ajuste_precio_monto), vs.sku_alfanumerico
        INTO v_stock_actual, v_stock_reservado, v_precio_unitario, v_sku_codigo
        FROM existencia_inventario_bodega e
        JOIN producto_variante_sku vs ON vs.variante_id = e.variante_id
        JOIN producto_base pb ON pb.producto_id = vs.producto_id
        WHERE e.variante_id = v_item.variante_id AND e.almacen_id = p_almacen_id
        FOR UPDATE OF e; -- BLOQUEO EXCLUSIVO DE FILA PARA CONTROL DE CONCURRENCIA

        IF NOT FOUND OR v_stock_actual < v_item.cantidad THEN
            RAISE EXCEPTION 'INSUFFICIENT_STOCK: Variante SKU % no dispone de stock suficiente (% solicitadas, % disponibles).',
                COALESCE(v_sku_codigo, v_item.variante_id::TEXT), v_item.cantidad, COALESCE(v_stock_actual, 0);
        END IF;

        v_subtotal := v_subtotal + (v_precio_unitario * v_item.cantidad);
    END LOOP;

    -- 4. CÁLCULO DE TOTALES
    v_impuesto := ROUND(v_subtotal * 0.19, 2); -- IVA 19%
    IF v_cupon_porc > 0 THEN
        v_descuento := ROUND((v_subtotal * v_cupon_porc) / 100.0, 2);
    END IF;
    v_total := (v_subtotal + v_impuesto + v_flete) - v_descuento;

    -- 5. CREACIÓN DE ORDEN TRANSACCIONAL
    v_orden_id := gen_random_uuid();
    p_codigo_orden_generada := 'TITULO-' || UPPER(SUBSTRING(REPLACE(v_orden_id::TEXT, '-', ''), 1, 8));

    INSERT INTO orden_compra_transaccion (
        orden_id, codigo_orden_unico, usuario_id, direccion_envio_id, direccion_facturacion_id,
        cupon_aplicado_id, subtotal_neto, monto_impuesto_iva, costo_flete_envio, monto_descuento_total,
        total_bruto_pagado, estado_orden, clave_idempotencia_checkout
    ) VALUES (
        v_orden_id, p_codigo_orden_generada, p_usuario_id, p_direccion_envio_id, p_direccion_facturacion_id,
        v_cupon_id, v_subtotal, v_impuesto, v_flete, v_descuento, v_total, 'PAGADA', p_idempotencia_key
    );

    -- 6. DEDUCCIÓN DE STOCK Y ASIENTO DE KARDEX INMUTABLE
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items_json) AS x(variante_id UUID, cantidad INT)
    LOOP
        SELECT (pb.precio_base_sugerido + vs.ajuste_precio_monto)
        INTO v_precio_unitario
        FROM producto_variante_sku vs
        JOIN producto_base pb ON pb.producto_id = vs.producto_id
        WHERE vs.variante_id = v_item.variante_id;

        -- Insertar línea de orden
        INSERT INTO orden_linea_articulo (
            orden_id, variante_id, cantidad_unidades, precio_unitario_historico, impuesto_unitario_historico, subtotal_linea
        ) VALUES (
            v_orden_id, v_item.variante_id, v_item.cantidad, v_precio_unitario, ROUND(v_precio_unitario * 0.19, 2), (v_precio_unitario * v_item.cantidad)
        );

        -- Actualizar saldo en bodega
        UPDATE existencia_inventario_bodega
        SET unidades_disponibles = unidades_disponibles - v_item.cantidad,
            actualizado_el = CURRENT_TIMESTAMP
        WHERE variante_id = v_item.variante_id AND almacen_id = p_almacen_id
        RETURNING unidades_disponibles, unidades_reservadas INTO v_stock_actual, v_stock_reservado;

        -- Registrar en Kardex
        INSERT INTO bitacora_kardex_movimiento_inventario (
            variante_id, almacen_id, tipo_movimiento, unidades_afectadas, saldo_resultante_disponible,
            saldo_resultante_reservado, documento_soporte_referencia, usuario_operador_id
        ) VALUES (
            v_item.variante_id, p_almacen_id, 'SALIDA_VENTA', v_item.cantidad, v_stock_actual,
            v_stock_reservado, p_codigo_orden_generada, p_usuario_id
        );
    END LOOP;

    -- Registrar uso de cupón si aplica
    IF v_cupon_id IS NOT NULL THEN
        INSERT INTO cupon_uso_bitacora (cupon_id, usuario_id, orden_id, monto_descontado)
        VALUES (v_cupon_id, p_usuario_id, v_orden_id, v_descuento);

        UPDATE cupon_descuento_promocion
        SET usos_actuales_contador = usos_actuales_contador + 1
        WHERE cupon_id = v_cupon_id;
    END IF;

    p_total_bruto_calculado := v_total;
    p_resultado_estado := 'TRANSACCION_EXITOSA';
    p_mensaje_diagnostico := 'Orden procesada con garantias ACID y consistencia de inventario en 5NF.';

EXCEPTION
    WHEN OTHERS THEN
        p_resultado_estado := 'ERROR_ROLLBACK';
        p_mensaje_diagnostico := SQLERRM;
        RAISE;
END;
$$;

-- ==============================================================================================
-- INSERCIÓN DE DATOS SEMILLA MAESTROS (MARCAS, DEPARTAMENTOS, GÉNEROS Y ESTILOS)
-- ==============================================================================================

-- 1. Países
INSERT INTO catalogo_pais_iso (codigo_iso_alfa2, codigo_iso_alfa3, codigo_iso_numerico, nombre_comun, nombre_formal) VALUES
('CO', 'COL', '170', 'Colombia', 'República de Colombia'),
('US', 'USA', '840', 'Estados Unidos', 'Estados Unidos de América'),
('FR', 'FRA', '250', 'Francia', 'República Francesa'),
('JP', 'JPN', '392', 'Japón', 'Estado del Japón')
ON CONFLICT (codigo_iso_alfa2) DO NOTHING;

-- 2. Marcas (BRANDS)
INSERT INTO catalogo_marca (codigo_marca, nombre_comercial, razon_social, pais_origen_id, sitio_web_url, biografia_marca, es_marca_propia) VALUES
('TITULO_ATELIER', 'TITULO Atelier', 'TITULO Apparel Group S.A.S', 1, 'https://titulo.store/atelier', 'Línea de alta sastrería contemporánea y siluetas brutales.', TRUE),
('KURO_ARCHIVE', 'Kuro Archive', 'Kuro Design Tokyo Co.', 4, 'https://kuroarchive.jp', 'Estética minimalista japonesa de vanguardia con tintes botánicos.', FALSE),
('ACRO_STUDIOS', 'Acro Studios', 'Acro Creative Lab Paris', 3, 'https://acrostudio.fr', 'Streetwear de lujo parisino confeccionado en algodones pesados de 450 GSM.', FALSE),
('AURA_MINIMAL', 'Aura Minimal', 'Aura Aesthetics NY LLC', 2, 'https://auraminimal.com', 'Sastrería femenina fluida y cortes arquitectónicos atemporales.', FALSE)
ON CONFLICT (codigo_marca) DO NOTHING;

-- 3. Géneros
INSERT INTO catalogo_genero_indumentaria (codigo_genero, nombre_genero, descripcion_antropometrica) VALUES
('HOMBRE', 'Hombre', 'Patronaje masculino con hombros caídos y siluetas estructuradas.'),
('MUJER', 'Mujer', 'Patronaje femenino con cortes entallados, drapeados y sastrería fluida.'),
('UNISEX', 'Unisex', 'Patronaje arquitectónico de silueta libre apto para cualquier complexión.')
ON CONFLICT (codigo_genero) DO NOTHING;

-- 4. Estilos
INSERT INTO catalogo_estilo_estetica (codigo_estilo, nombre_estilo, descripcion_conceptual) VALUES
('STREETWEAR', 'Streetwear Luxury', 'Prendas pesadas con costuras reforzadas y caída boxy contemporánea.'),
('MINIMALIST', 'Minimalist Architecture', 'Líneas puras, paletas sobrias en negros y grises, sin ornamentos superfluos.'),
('TECHWEAR', 'Techwear & Utility', 'Fibras impermeables ripstop, bolsillos modulares y cierres sellados.'),
('TAILORING', 'Modern Tailoring', 'Sastrería desestructurada con solapas de lanza y hombros limpios.'),
('AVANT_GARDE', 'Avant-Garde Sculpture', 'Siluetas esculturales inspiradas en la arquitectura brutalista y el arte clásico.')
ON CONFLICT (codigo_estilo) DO NOTHING;

-- 5. Departamentos y Categorías
INSERT INTO catalogo_departamento_moda (codigo_departamento, nombre_departamento, descripcion) VALUES
('TOPS', 'Prendas Superiores', 'Camisetas, Hoodies, Chaquetas y Blazers.'),
('BOTTOMS', 'Prendas Inferiores', 'Pantalones Cargo, Denim y Pantalones Sastre.')
ON CONFLICT (codigo_departamento) DO NOTHING;

INSERT INTO catalogo_categoria_prenda (departamento_id, codigo_categoria, nombre_categoria, slug_categoria) VALUES
(1, 'HOODIES', 'Hoodies & Sweaters', 'hoodies-sweaters'),
(1, 'TEES', 'Camisetas Heavyweight', 'camisetas-heavyweight'),
(1, 'BLAZERS', 'Blazers & Outerwear', 'blazers-outerwear'),
(2, 'PANTS', 'Pantalones & Cargo', 'pantalones-cargo')
ON CONFLICT (codigo_categoria) DO NOTHING;

-- 6. Sistemas de Tallas
INSERT INTO catalogo_sistema_talla (codigo_sistema, nombre_sistema, region_geografica) VALUES
('ALPHA', 'Tallas Alfanuméricas Universales (XS - XXL)', 'GLOBAL')
ON CONFLICT (codigo_sistema) DO NOTHING;

INSERT INTO catalogo_talla_prenda (sistema_id, codigo_talla, nombre_etiqueta, orden_presentacion) VALUES
(1, 'S', 'Small (S)', 1),
(1, 'M', 'Medium (M)', 2),
(1, 'L', 'Large (L)', 3),
(1, 'XL', 'Extra Large (XL)', 4)
ON CONFLICT (sistema_id, codigo_talla) DO NOTHING;

-- 7. Colores
INSERT INTO catalogo_color_paleta (codigo_hex, nombre_color, pantone_referencia) VALUES
('#0A0A0A', 'Pitch Black', 'Pantone Black 6C'),
('#E2E2DF', 'Alabaster Stone', 'Pantone 11-0601 TCX'),
('#2E2E32', 'Brutalist Slate', 'Pantone 19-4007 TCX'),
('#5B5955', 'Olive Drab', 'Pantone 18-0521 TCX')
ON CONFLICT DO NOTHING;

-- 8. Cupones
INSERT INTO cupon_descuento_promocion (codigo_alfanumerico, descripcion_beneficio, porcentaje_descuento, fecha_vigencia_inicio, fecha_vigencia_fin) VALUES
('TITULO10', '10% de descuento en colección debut', 10.00, '2026-01-01', '2026-12-31'),
('TITULO20', '20% de descuento VIP', 20.00, '2026-01-01', '2026-12-31')
ON CONFLICT (codigo_alfanumerico) DO NOTHING;

-- 9. Pasarelas de Pago
INSERT INTO catalogo_pasarela_pago (codigo_pasarela, nombre_pasarela) VALUES
('STRIPE', 'Stripe Payment Gateway'),
('MERCADOPAGO', 'MercadoPago LatAm'),
('PAYPAL', 'PayPal Express Checkout')
ON CONFLICT (codigo_pasarela) DO NOTHING;

-- 10. Empresas de Transporte
INSERT INTO catalogo_empresa_transportista (codigo_carrier, razon_social, sitio_rastreo_url_template) VALUES
('DHL', 'DHL Express Global', 'https://www.dhl.com/track?id='),
('FEDEX', 'FedEx Priority', 'https://www.fedex.com/fedextrack/?trknbr='),
('SERVIENTREGA', 'Servientrega Colombia', 'https://www.servientrega.com/tracking?guia=')
ON CONFLICT (codigo_carrier) DO NOTHING;

-- ==============================================================================================
-- FIN DEL ESQUEMA 5NF / PJNF TITULO E-COMMERCE (58 TABLAS ATÓMICAS)
-- ==============================================================================================
