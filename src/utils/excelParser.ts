import * as XLSX from 'xlsx';
import { BulkStudentData } from '@/types/database.types';

export interface ParseResult {
  data: BulkStudentData[];
  errors: Array<{ row: number; error: string }>;
}

const REQUIRED_COLUMNS = [
  'nombres',
  'apellidos',
  'nro_documento',
  'sexo',
  'edad',
  'grado',
  'seccion',
  'nombre_contacto'
];

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          defval: '' 
        });

        const result: ParseResult = {
          data: [],
          errors: []
        };

        // Validate and parse each row
        jsonData.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // +2 because Excel rows start at 1 and we have header

          // Check required columns
          const missingColumns = REQUIRED_COLUMNS.filter(col => !row[col] || row[col].toString().trim() === '');
          
          if (missingColumns.length > 0) {
            result.errors.push({
              row: rowNumber,
              error: `Columnas requeridas faltantes: ${missingColumns.join(', ')}`
            });
            return;
          }

          // Validate sexo
          const sexo = row.sexo.toString().toUpperCase();
          if (sexo !== 'M' && sexo !== 'F') {
            result.errors.push({
              row: rowNumber,
              error: `Sexo inválido: debe ser M o F`
            });
            return;
          }

          // Validate edad
          const edad = parseInt(row.edad);
          if (isNaN(edad) || edad < 3 || edad > 25) {
            result.errors.push({
              row: rowNumber,
              error: `Edad inválida: debe ser un número entre 3 y 25`
            });
            return;
          }

          // Validate grado
          const grado = parseInt(row.grado);
          if (isNaN(grado) || grado < 1 || grado > 5) {
            result.errors.push({
              row: rowNumber,
              error: `Grado inválido: debe ser un número entre 1 y 5`
            });
            return;
          }

          // Parse data
          const studentData: BulkStudentData = {
            nombres: row.nombres.toString().trim(),
            apellidos: row.apellidos.toString().trim(),
            nro_documento: row.nro_documento.toString().trim(),
            sexo: sexo as 'M' | 'F',
            edad: edad,
            grado: grado,
            seccion: row.seccion.toString().trim().toUpperCase(),
            nombre_contacto: row.nombre_contacto.toString().trim(),
            correo_contacto: row.correo_contacto ? row.correo_contacto.toString().trim() : undefined,
            telefono_contacto: row.telefono_contacto ? row.telefono_contacto.toString().trim() : undefined
          };

          result.data.push(studentData);
        });

        resolve(result);
      } catch (error) {
        reject(new Error('Error al parsear el archivo Excel'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsBinaryString(file);
  });
}

export function validateExcelColumns(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = jsonData[0] as string[];

        const hasAllColumns = REQUIRED_COLUMNS.every(col => 
          headers.some(h => h.toLowerCase() === col.toLowerCase())
        );

        resolve(hasAllColumns);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsBinaryString(file);
  });
}
