# TITULO E-Commerce Enterprise Architecture: 5NF, ACID, SOLID, DRY & Python Hexagonal

Este documento constituye la especificación técnica, matemática y de ingeniería de software para el sistema de comercio electrónico de indumentaria de alta gama **TITULO**.

---

## 1. Demostración Matemática de Normalización hasta Quinta Forma Normal (5NF / PJNF)

La base de datos relacional de **TITULO** está modelada en **58 tablas atómicas** que satisfacen rigurosamente los axiomas de normalización de E.F. Codd y Ronald Fagin:

### 1NF (Primera Forma Normal) - Atomicidad Extrema
- **Sin grupos repetitivos ni atributos multivaluados anidados**.
- Los nombres personales se desglosan en: `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`.
- Las direcciones se descomponen atómicamente: `pais_id`, `subdivision_id`, `ciudad_id`, `tipo_via`, `nombre_via`, `numero_exterior`, `numero_interior`, `barrio_colonia`, `codigo_postal`, `coordenada_latitud`, `coordenada_longitud`.
- Los números telefónicos siguen la norma E.164: `codigo_pais_e164`, `prefijo_area`, `numero_suscriptor`, `extension_linea`.

### 2NF (Segunda Forma Normal) - Dependencia Funcional Completa
- Toda relación está en 1NF.
- Todo atributo no clave depende funcionalmente de la totalidad de cada clave candidata ($X \rightarrow Y$), erradicando dependencias funcionales parciales en tablas con claves compuestas como `existencia_inventario_bodega (variante_id, almacen_id)`.

### 3NF (Tercera Forma Normal) - Ausencia de Dependencias Transitivas
- No existen dependencias transitivas entre columnas no clave ($A \rightarrow B \rightarrow C$).
- Ciudades, subdivisiones políticas y países se desglosan en jerarquías maestras (`catalogo_pais_iso` $\leftarrow$ `catalogo_subdivision_pais` $\leftarrow$ `catalogo_ciudad`), evitando que un cambio de nombre departamental afecte a miles de direcciones postales.

### BCNF (Forma Normal de Boyce-Codd)
- Para toda dependencia funcional no trivial $X \rightarrow A$, el determinante $X$ es una superclave de la relación.

### 4NF (Cuarta Forma Normal) - Desacoplamiento de Dependencias Multivaluadas (MVDs)
- Un producto puede poseer múltiples fibras textiles con diferentes porcentajes, independientes de las tallas o colores disponibles.
- La tabla `producto_composicion_textil` aísla la MVD: $Producto \twoheadrightarrow FibraTextil \times Porcentaje$, eliminando anomalías de redundancia cruzada.

### 5NF (Quinta Forma Normal / Project-Join Normal Form - PJNF)
Ocurre ante la presencia de una **Dependencia de Unión (Join Dependency - JD)** no reducible a dependencias funcionales ordinarias.
En la industria de la moda contemporánea, la relación ternaria:
$$\mathcal{T} = \{ \text{Producto}, \text{Género}, \text{Estilo} \}$$
está gobernada por la regla de completitud: *si una prenda está diseñada para un género antropométrico determinado, y ese género abraza un estilo estético específico, y la prenda implementa ese estilo, entonces la combinación tridimensional existe en el catálogo*.

Si intentáramos almacenar $\{ \text{producto\_id}, \text{genero\_id}, \text{estilo\_id} \}$ en una sola tabla, incurriríamos en redundancia masiva y riesgo de **tuplas espurias** al realizar proyecciones.

Por el Teorema de Fagin, la relación se normaliza en 5NF proyectándola en 3 relaciones binarias:
1. $R_1$: `producto_genero_5nf` $(\text{producto\_id}, \text{genero\_id})$
2. $R_2$: `genero_estilo_5nf` $(\text{genero\_id}, \text{estilo\_id})$
3. $R_3$: `producto_estilo_5nf` $(\text{producto\_id}, \text{estilo\_id})$

La unión natural sin pérdida (*lossless-join decomposition*):
$$\mathcal{T} = R_1 \bowtie R_2 \bowtie R_3$$
reconstituye la relación ternaria con exactitud matemática, sin anomalías de inserción, borrado ni modificación.

---

## 2. Inventario de las 58 Tablas Atómicas

| Sección | Tablas Atómicas | Propósito de Negocio |
| :--- | :--- | :--- |
| **1. Identidad & RBAC** | `catalogo_tipo_documento_identidad`, `persona`, `persona_correo_electronico`, `persona_telefono_desglosado`, `usuario_cuenta`, `catalogo_rol_sistema`, `usuario_rol_asignado`, `catalogo_nivel_fidelizacion_cliente`, `cliente_perfil` | Identidad federada, RBAC y fidelización por tiers (Bronze, Silver, Gold, TITULO Black). |
| **2. Geografía** | `catalogo_pais_iso`, `catalogo_subdivision_pais`, `catalogo_ciudad`, `direccion_postal_desglosada`, `persona_direccion_asociada` | Ubicación geoespacial atómica con latitud, longitud y código postal. |
| **3. Marcas & B2B** | `catalogo_marca`, `marca_contacto`, `catalogo_fabricante_proveedor`, `marca_fabricante_autorizado_5nf` | Multi-marca, marcas propias/externas, fabricantes auditados y contratos de confección. |
| **4. Moda Hombre/Mujer** | `catalogo_departamento_moda`, `catalogo_categoria_prenda`, `catalogo_subcategoria_prenda`, `catalogo_genero_indumentaria`, `catalogo_estilo_estetica`, `catalogo_tipo_corte_silueta`, `catalogo_temporada_coleccion`, `catalogo_fibra_textil`, `catalogo_cuidado_lavado_textil` | Taxonomía integral de moda, temporadas, siluetas y cuidados textiles. |
| **5. Producto & 5NF** | `producto_base`, `producto_composicion_textil`, `producto_cuidado_asociado`, `producto_genero_5nf`, `genero_estilo_5nf`, `producto_estilo_5nf` | Catálogo de prendas, gramajes GSM y proyecciones binarias PJNF. |
| **6. Variantes & SKUs** | `catalogo_color_paleta`, `catalogo_sistema_talla`, `catalogo_talla_prenda`, `catalogo_guia_medidas_corporales`, `producto_variante_sku`, `producto_variante_recurso_multimedia` | Variantes SKU (EAN-13), guías anatómicas en cm y assets multimedia. |
| **7. Bodegas & Kardex** | `catalogo_almacen_bodega`, `catalogo_lote_produccion`, `existencia_inventario_bodega`, `bitacora_kardex_movimiento_inventario` | Inventario multi-almacén y Kardex inmutable con control de saldos y merma. |
| **8. Compras B2B** | `orden_compra_proveedor_b2b`, `orden_compra_proveedor_detalle` | Abastecimiento mayorista y órdenes de compra con proveedores. |
| **9. Promociones** | `cupon_descuento_promocion`, `cupon_uso_bitacora` | Campañas promocionales, cupones con topes y bitácora de redención. |
| **10. Checkout & ACID** | `orden_compra_transaccion`, `orden_linea_articulo`, `catalogo_pasarela_pago`, `transaccion_pago_acid` | Checkout atómico con idempotencia, IVA y pagos criptográficos. |
| **11. Logística Envíos** | `catalogo_empresa_transportista`, `envio_paquete_logistica`, `envio_evento_tracking_historial` | Despachos, guías de rastreo y eventos cronológicos de entrega. |
| **12. Devoluciones RMA** | `solicitud_devolucion_rma`, `devolucion_rma_item` | Autorización de retorno de mercancía, control de calidad y reembolsos. |
| **13. Moderación & Audit**| `producto_resena_calificacion`, `bitacora_auditoria_sistema` | Reseñas verificadas de clientes y auditoría forense DML completa. |

---

## 3. Garantías ACID y Procedimiento Almacenado de Concurrencia

El procedimiento almacenado `sp_procesar_checkout_atomico_acid`:
1. **Atomicidad**: La orden, sus líneas, el cobro, el descuento de stock y el registro de Kardex ocurren en una sola transacción indivisible; un error en cualquier variante revierte la totalidad de la operación (`ROLLBACK`).
2. **Consistencia**: Restricciones de integridad referencial (`FOREIGN KEY`) e invariantes `CHECK (unidades_disponibles >= 0)`.
3. **Aislamiento**: Bloqueos pesimistas a nivel de fila (`SELECT ... FOR UPDATE OF e`) que impiden sobreventas en momentos de alta concurrencia (*drop* de colección).
4. **Durabilidad**: Registro anticipado en el log (WAL) y persistencia física en disco.
5. **Idempotencia Absoluta**: La clave `clave_idempotencia_checkout` garantiza que un reintento de red desde un dispositivo móvil no duplique transacciones ni cobros.

---

## 4. Taxonomía de Moda para Hombre y Mujer

### Géneros Antropométricos
1. **Hombre**: Cortes rectos, hombros estructurados, tiros de pantalón diseñados para anatomía masculina, cuellos amplios y caídas pesadas.
2. **Mujer**: Siluetas curvilíneas, cortes entallados, cropped tops, cinturas altas, drapeados asimétricos y pinzas de busto.
3. **Unisex (Genderless)**: Siluetas arquitectónicas de corte oversize / boxy que se adaptan naturalmente a cualquier anatomía.

### Estilos y Estéticas
- **Streetwear Luxury**: Algodones peinados de 380 a 480 GSM, hombros caídos (*drop shoulder*), ribetes reforzados en cuello y costuras dobles.
- **Minimalist Architecture**: Sin marcas visibles, paleta cromática neutra (negro carbón, pizarra brutalista, alabastro, oliva apagado), acabados termosellados.
- **Avant-Garde Sculpture**: Deconstrucción textil, solapas sobredimensionadas, cremalleras asimétricas YKK.
- **Techwear & Utility**: Telas técnicas impermeables de 3 capas (Cordura, Nylon Ripstop), bolsillos modulares y hebillas Fidlock.
- **Modern Tailoring**: Sastrería relajada en lana fría y viscosa para uso formal o casual contemporáneo.
