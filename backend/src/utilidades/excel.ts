/**
 * Utilidad de exportación a Excel (ExcelJS). Genera libros con encabezados con
 * estilo, nombre de la empresa, título del reporte, fecha de generación y
 * formato de moneda configurable (por defecto soles).
 */
import { Response } from 'express';
import ExcelJS from 'exceljs';
import { formatearFechaHora, marcaDeTiempo } from './fechas';

export interface ColumnaExcel {
  encabezado: string;
  clave: string;
  ancho?: number;
  formato?: 'moneda' | 'numero' | 'texto';
}

export interface OpcionesExcel {
  titulo: string;
  empresa: string;
  moneda?: string;
  columnas: ColumnaExcel[];
  filas: Record<string, unknown>[];
  nombreHoja?: string;
}

function simboloMoneda(moneda: string): string {
  const mapa: Record<string, string> = { PEN: 'S/', USD: '$', EUR: '€' };
  return mapa[moneda] ?? moneda;
}

function letraColumna(indice: number): string {
  let n = indice;
  let letra = '';
  while (n > 0) {
    const resto = (n - 1) % 26;
    letra = String.fromCharCode(65 + resto) + letra;
    n = Math.floor((n - 1) / 26);
  }
  return letra || 'A';
}

export async function generarExcel(opciones: OpcionesExcel): Promise<ExcelJS.Buffer> {
  const { titulo, empresa, moneda = 'PEN', columnas, filas, nombreHoja = 'Datos' } = opciones;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Inventario SaaS';
  wb.created = new Date();
  const ws = wb.addWorksheet(nombreHoja, { views: [{ state: 'frozen', ySplit: 5 }] });

  const ultimaCol = letraColumna(columnas.length);

  // Encabezado del documento.
  ws.mergeCells(`A1:${ultimaCol}1`);
  const celEmpresa = ws.getCell('A1');
  celEmpresa.value = empresa;
  celEmpresa.font = { bold: true, size: 16, color: { argb: 'FF0F172A' } };

  ws.mergeCells(`A2:${ultimaCol}2`);
  const celTitulo = ws.getCell('A2');
  celTitulo.value = titulo;
  celTitulo.font = { bold: true, size: 12, color: { argb: 'FF334155' } };

  ws.mergeCells(`A3:${ultimaCol}3`);
  const celFecha = ws.getCell('A3');
  celFecha.value = `Generado: ${formatearFechaHora(new Date())}`;
  celFecha.font = { italic: true, size: 10, color: { argb: 'FF64748B' } };

  // Fila de encabezados (fila 5).
  const filaEnc = ws.getRow(5);
  columnas.forEach((col, i) => {
    const celda = filaEnc.getCell(i + 1);
    celda.value = col.encabezado;
    celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
    celda.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getColumn(i + 1).width = col.ancho ?? 18;
  });
  filaEnc.height = 20;

  // Filas de datos.
  filas.forEach((fila) => {
    const valores = columnas.map((c) => fila[c.clave] ?? '');
    const row = ws.addRow(valores);
    columnas.forEach((col, i) => {
      const celda = row.getCell(i + 1);
      if (col.formato === 'moneda') celda.numFmt = `"${simboloMoneda(moneda)}" #,##0.00`;
      else if (col.formato === 'numero') celda.numFmt = '#,##0.##';
    });
  });

  return wb.xlsx.writeBuffer();
}

/** Envía un buffer de Excel como descarga con cabeceras adecuadas. */
export function enviarExcel(res: Response, buffer: ExcelJS.Buffer, nombreBase: string): void {
  const nombre = `${nombreBase}_${marcaDeTiempo()}.xlsx`;
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
  res.end(Buffer.from(buffer as ArrayBuffer));
}
