/**
 * Datos semilla (seed) del sistema.
 *  - Catálogo global de roles y permisos.
 *  - Empresa demo "Comercial Demo S.A.C.".
 *  - Un usuario por cada rol (Administrador, Editor, Visualizador).
 *  - Almacenes, tiendas, categorías, productos, inventario, proveedor y
 *    algunos movimientos de ejemplo.
 *
 * Es idempotente: puede ejecutarse varias veces sin duplicar datos.
 */
import { PrismaClient, TipoUbicacion, TipoMovimiento } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ROLES } from '../src/config/constantes';
import { inicializarCatalogos } from '../src/servicios/catalogoServicio';

const prisma = new PrismaClient();

const DEMO = {
  empresa: {
    razonSocial: 'Comercial Demo S.A.C.',
    ruc: '20123456789',
    direccion: 'Av. Ejemplo 123, Lima, Perú',
    telefono: '+51 1 555 1234',
    email: 'contacto@demo.com',
    moneda: 'PEN',
    zonaHoraria: 'America/Lima',
  },
  usuarios: [
    { nombres: 'Ana', apellidos: 'Administradora', email: 'admin@demo.com', password: 'Admin123!', rol: ROLES.ADMINISTRADOR },
    { nombres: 'Edgar', apellidos: 'Editor', email: 'editor@demo.com', password: 'Editor123!', rol: ROLES.EDITOR },
    { nombres: 'Vilma', apellidos: 'Visualizadora', email: 'visor@demo.com', password: 'Visor123!', rol: ROLES.VISUALIZADOR },
  ],
};

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed...');

  await inicializarCatalogos(prisma);
  console.log('   ✔ Roles y permisos');

  // --- Empresa demo ---
  const empresa = await prisma.empresa.upsert({
    where: { ruc: DEMO.empresa.ruc },
    update: { ...DEMO.empresa },
    create: { ...DEMO.empresa },
  });
  console.log(`   ✔ Empresa: ${empresa.razonSocial}`);

  // --- Usuarios (uno por rol) ---
  const roles = await prisma.rol.findMany();
  const mapaRoles = new Map(roles.map((r) => [r.nombre, r.id]));
  for (const u of DEMO.usuarios) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {
        nombres: u.nombres,
        apellidos: u.apellidos,
        rolId: mapaRoles.get(u.rol)!,
        empresaId: empresa.id,
        activo: true,
      },
      create: {
        nombres: u.nombres,
        apellidos: u.apellidos,
        email: u.email,
        passwordHash,
        rolId: mapaRoles.get(u.rol)!,
        empresaId: empresa.id,
      },
    });
  }
  console.log('   ✔ Usuarios demo (admin / editor / visor)');

  // --- Limpieza de datos operativos de la empresa demo (re-seed idempotente) ---
  await prisma.producto.deleteMany({ where: { empresaId: empresa.id } });
  await prisma.proveedor.deleteMany({ where: { empresaId: empresa.id } });
  await prisma.categoria.deleteMany({ where: { empresaId: empresa.id } });
  await prisma.almacen.deleteMany({ where: { empresaId: empresa.id } });
  await prisma.tienda.deleteMany({ where: { empresaId: empresa.id } });

  // --- Almacenes ---
  const almacenCentral = await prisma.almacen.create({
    data: { empresaId: empresa.id, nombre: 'Almacén Central', direccion: 'Av. Industrial 500, Lima', responsable: 'Carlos Ruiz', telefono: '+51 1 555 2000' },
  });
  const almacenNorte = await prisma.almacen.create({
    data: { empresaId: empresa.id, nombre: 'Almacén Norte', direccion: 'Carr. Panamericana Norte Km 25', responsable: 'María Torres' },
  });

  // --- Tiendas ---
  const tiendaMiraflores = await prisma.tienda.create({
    data: { empresaId: empresa.id, nombre: 'Tienda Miraflores', direccion: 'Av. Larco 800, Miraflores', responsable: 'Lucía Díaz' },
  });
  const tiendaSurco = await prisma.tienda.create({
    data: { empresaId: empresa.id, nombre: 'Tienda Surco', direccion: 'Av. Caminos del Inca 1200, Surco', responsable: 'Jorge Salas' },
  });
  console.log('   ✔ Almacenes y tiendas');

  // --- Categorías ---
  const catBebidas = await prisma.categoria.create({ data: { empresaId: empresa.id, nombre: 'Bebidas', descripcion: 'Bebidas frías y calientes' } });
  const catAbarrotes = await prisma.categoria.create({ data: { empresaId: empresa.id, nombre: 'Abarrotes', descripcion: 'Productos secos y enlatados' } });
  const catLimpieza = await prisma.categoria.create({ data: { empresaId: empresa.id, nombre: 'Limpieza', descripcion: 'Artículos de aseo y limpieza' } });
  const catTecnologia = await prisma.categoria.create({ data: { empresaId: empresa.id, nombre: 'Tecnología', descripcion: 'Accesorios electrónicos' } });

  // --- Proveedor ---
  const proveedor = await prisma.proveedor.create({
    data: { empresaId: empresa.id, razonSocial: 'Distribuidora Andina S.A.C.', ruc: '20567891234', contacto: 'Pedro Gómez', telefono: '+51 1 555 7777', email: 'ventas@andina.com', direccion: 'Av. Argentina 1500, Callao' },
  });
  console.log('   ✔ Categorías y proveedor');

  // --- Productos ---
  const productosData = [
    { sku: 'BEB-001', nombre: 'Agua mineral 625ml', categoriaId: catBebidas.id, unidadMedida: 'UNIDAD', precioCompra: 0.8, precioVenta: 1.5, stockMinimo: 50 },
    { sku: 'BEB-002', nombre: 'Gaseosa cola 500ml', categoriaId: catBebidas.id, unidadMedida: 'UNIDAD', precioCompra: 1.5, precioVenta: 3.0, stockMinimo: 40 },
    { sku: 'ABA-001', nombre: 'Arroz extra 1kg', categoriaId: catAbarrotes.id, unidadMedida: 'BOLSA', precioCompra: 3.2, precioVenta: 4.9, stockMinimo: 30 },
    { sku: 'ABA-002', nombre: 'Aceite vegetal 1L', categoriaId: catAbarrotes.id, unidadMedida: 'BOTELLA', precioCompra: 6.5, precioVenta: 9.9, stockMinimo: 20 },
    { sku: 'ABA-003', nombre: 'Atún en lata 170g', categoriaId: catAbarrotes.id, unidadMedida: 'LATA', precioCompra: 2.8, precioVenta: 4.5, stockMinimo: 25 },
    { sku: 'LIM-001', nombre: 'Detergente 900g', categoriaId: catLimpieza.id, unidadMedida: 'BOLSA', precioCompra: 5.0, precioVenta: 8.5, stockMinimo: 15 },
    { sku: 'LIM-002', nombre: 'Lejía 1L', categoriaId: catLimpieza.id, unidadMedida: 'BOTELLA', precioCompra: 2.0, precioVenta: 3.8, stockMinimo: 15 },
    { sku: 'TEC-001', nombre: 'Cable USB-C 1m', categoriaId: catTecnologia.id, unidadMedida: 'UNIDAD', precioCompra: 4.0, precioVenta: 12.0, stockMinimo: 10 },
    { sku: 'TEC-002', nombre: 'Audífonos básicos', categoriaId: catTecnologia.id, unidadMedida: 'UNIDAD', precioCompra: 8.0, precioVenta: 19.9, stockMinimo: 8 },
  ];

  const ubicaciones = [
    { tipo: TipoUbicacion.ALMACEN, id: almacenCentral.id },
    { tipo: TipoUbicacion.ALMACEN, id: almacenNorte.id },
    { tipo: TipoUbicacion.TIENDA, id: tiendaMiraflores.id },
    { tipo: TipoUbicacion.TIENDA, id: tiendaSurco.id },
  ];

  const productosCreados = [];
  for (const [indice, p] of productosData.entries()) {
    const producto = await prisma.producto.create({ data: { empresaId: empresa.id, ...p } });
    productosCreados.push(producto);
    await prisma.productoProveedor.create({ data: { productoId: producto.id, proveedorId: proveedor.id } });

    // Reparte stock entre ubicaciones; algunos quedan por debajo del mínimo a propósito.
    for (const [j, ubic] of ubicaciones.entries()) {
      const cantidad = Math.max(0, (indice + 1) * 10 - j * 7);
      await prisma.inventario.create({
        data: {
          empresaId: empresa.id,
          productoId: producto.id,
          ubicacionTipo: ubic.tipo,
          ubicacionId: ubic.id,
          cantidad,
        },
      });
    }
  }
  console.log(`   ✔ ${productosCreados.length} productos con inventario`);

  // --- Movimientos de ejemplo ---
  const admin = await prisma.usuario.findUniqueOrThrow({ where: { email: 'admin@demo.com' } });
  const prodAgua = productosCreados[0];
  await prisma.movimientoInventario.createMany({
    data: [
      {
        empresaId: empresa.id,
        tipo: TipoMovimiento.ENTRADA,
        productoId: prodAgua.id,
        cantidad: 100,
        motivo: 'Compra inicial',
        destinoTipo: TipoUbicacion.ALMACEN,
        destinoId: almacenCentral.id,
        usuarioId: admin.id,
        proveedorId: proveedor.id,
      },
      {
        empresaId: empresa.id,
        tipo: TipoMovimiento.SALIDA,
        productoId: prodAgua.id,
        cantidad: 10,
        motivo: 'Venta de mostrador',
        origenTipo: TipoUbicacion.TIENDA,
        origenId: tiendaMiraflores.id,
        usuarioId: admin.id,
      },
      {
        empresaId: empresa.id,
        tipo: TipoMovimiento.TRANSFERENCIA,
        productoId: prodAgua.id,
        cantidad: 20,
        motivo: 'Reposición de tienda',
        origenTipo: TipoUbicacion.ALMACEN,
        origenId: almacenCentral.id,
        destinoTipo: TipoUbicacion.TIENDA,
        destinoId: tiendaMiraflores.id,
        usuarioId: admin.id,
      },
    ],
  });
  console.log('   ✔ Movimientos de ejemplo');

  console.log('\n✅ Seed completado con éxito.');
  console.log('────────────────────────────────────────────');
  console.log('Credenciales demo (empresa: Comercial Demo S.A.C.)');
  console.log('  • Administrador → admin@demo.com  / Admin123!');
  console.log('  • Editor        → editor@demo.com / Editor123!');
  console.log('  • Visualizador  → visor@demo.com  / Visor123!');
  console.log('────────────────────────────────────────────');
}

main()
  .catch((error) => {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
