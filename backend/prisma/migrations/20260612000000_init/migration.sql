-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TipoUbicacion" AS ENUM ('ALMACEN', 'TIENDA');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('STOCK_MINIMO', 'MOVIMIENTO', 'TRANSFERENCIA', 'USUARIO', 'MENSAJE', 'GENERAL');

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT NOT NULL,
    "logo" TEXT,
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "zonaHoraria" TEXT NOT NULL DEFAULT 'America/Lima',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "esSistema" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_permisos" (
    "rolId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,

    CONSTRAINT "roles_permisos_pkey" PRIMARY KEY ("rolId","permisoId")
);

-- CreateTable
CREATE TABLE "tokens_refresh" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_refresh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "almacenes" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "responsable" TEXT,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "almacenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tiendas" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "responsable" TEXT,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tiendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoriaId" TEXT,
    "unidadMedida" TEXT NOT NULL DEFAULT 'UNIDAD',
    "precioCompra" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "precioVenta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "stockMinimo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "ubicacionTipo" "TipoUbicacion" NOT NULL,
    "ubicacionId" TEXT NOT NULL,
    "cantidad" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" DECIMAL(14,2) NOT NULL,
    "motivo" TEXT,
    "origenTipo" "TipoUbicacion",
    "origenId" TEXT,
    "destinoTipo" "TipoUbicacion",
    "destinoId" TEXT,
    "usuarioId" TEXT,
    "proveedorId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT,
    "contacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_proveedores" (
    "productoId" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_proveedores_pkey" PRIMARY KEY ("productoId","proveedorId")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL DEFAULT 'GENERAL',
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "datos" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leidaEn" TIMESTAMP(3),

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "remitenteId" TEXT NOT NULL,
    "destinatarioId" TEXT NOT NULL,
    "asunto" TEXT,
    "cuerpo" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leidoEn" TIMESTAMP(3),

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_auditoria" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "detalles" JSONB,
    "ip" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_ruc_key" ON "empresas"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_empresaId_idx" ON "usuarios"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "permisos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_refresh_tokenHash_key" ON "tokens_refresh"("tokenHash");

-- CreateIndex
CREATE INDEX "tokens_refresh_usuarioId_idx" ON "tokens_refresh"("usuarioId");

-- CreateIndex
CREATE INDEX "almacenes_empresaId_idx" ON "almacenes"("empresaId");

-- CreateIndex
CREATE INDEX "tiendas_empresaId_idx" ON "tiendas"("empresaId");

-- CreateIndex
CREATE INDEX "categorias_empresaId_idx" ON "categorias"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_empresaId_nombre_key" ON "categorias"("empresaId", "nombre");

-- CreateIndex
CREATE INDEX "productos_empresaId_idx" ON "productos"("empresaId");

-- CreateIndex
CREATE INDEX "productos_categoriaId_idx" ON "productos"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "productos_empresaId_sku_key" ON "productos"("empresaId", "sku");

-- CreateIndex
CREATE INDEX "inventario_empresaId_idx" ON "inventario"("empresaId");

-- CreateIndex
CREATE INDEX "inventario_ubicacionTipo_ubicacionId_idx" ON "inventario"("ubicacionTipo", "ubicacionId");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_productoId_ubicacionTipo_ubicacionId_key" ON "inventario"("productoId", "ubicacionTipo", "ubicacionId");

-- CreateIndex
CREATE INDEX "movimientos_inventario_empresaId_idx" ON "movimientos_inventario"("empresaId");

-- CreateIndex
CREATE INDEX "movimientos_inventario_productoId_idx" ON "movimientos_inventario"("productoId");

-- CreateIndex
CREATE INDEX "movimientos_inventario_fecha_idx" ON "movimientos_inventario"("fecha");

-- CreateIndex
CREATE INDEX "proveedores_empresaId_idx" ON "proveedores"("empresaId");

-- CreateIndex
CREATE INDEX "notificaciones_empresaId_idx" ON "notificaciones"("empresaId");

-- CreateIndex
CREATE INDEX "notificaciones_usuarioId_leida_idx" ON "notificaciones"("usuarioId", "leida");

-- CreateIndex
CREATE INDEX "mensajes_empresaId_idx" ON "mensajes"("empresaId");

-- CreateIndex
CREATE INDEX "mensajes_destinatarioId_leido_idx" ON "mensajes"("destinatarioId", "leido");

-- CreateIndex
CREATE INDEX "registros_auditoria_empresaId_idx" ON "registros_auditoria"("empresaId");

-- CreateIndex
CREATE INDEX "registros_auditoria_entidad_entidadId_idx" ON "registros_auditoria"("entidad", "entidadId");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_refresh" ADD CONSTRAINT "tokens_refresh_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "almacenes" ADD CONSTRAINT "almacenes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiendas" ADD CONSTRAINT "tiendas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedores" ADD CONSTRAINT "proveedores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_proveedores" ADD CONSTRAINT "productos_proveedores_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_proveedores" ADD CONSTRAINT "productos_proveedores_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_remitenteId_fkey" FOREIGN KEY ("remitenteId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_auditoria" ADD CONSTRAINT "registros_auditoria_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_auditoria" ADD CONSTRAINT "registros_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

