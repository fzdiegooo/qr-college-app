import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { BulkStudentData, BulkCreateResponse } from '@/types/database.types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { alumnos } = await request.json() as { alumnos: BulkStudentData[] };

    if (!alumnos || !Array.isArray(alumnos) || alumnos.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron alumnos para crear' },
        { status: 400 }
      );
    }

    const result: BulkCreateResponse = {
      created: 0,
      skipped: 0,
      failed: 0,
      errors: [],
      createdStudents: [],
      skippedStudents: []
    };

    // Get grados and secciones mappings
    const { data: grados } = await supabase.from('grado').select('id, nombre');
    const { data: secciones } = await supabase.from('seccion').select('id, nombre');

    if (!grados || !secciones) {
      return NextResponse.json(
        { error: 'Error al obtener grados y secciones' },
        { status: 500 }
      );
    }

    // Process each student
    for (let i = 0; i < alumnos.length; i++) {
      const alumno = alumnos[i];
      const rowNumber = i + 2; // Excel row number (header is row 1)

      try {
        // Check if student already exists by documento
        const { data: existingStudent, error: checkError } = await supabase
          .from('usuarios')
          .select('id, nombre, documento')
          .eq('documento', alumno.nro_documento)
          .maybeSingle();

        // If there was an error checking (not just "not found"), log and continue
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing student:', checkError);
        }

        if (existingStudent) {
          result.skipped++;
          result.skippedStudents.push({
            documento: alumno.nro_documento,
            nombre: `${alumno.nombres} ${alumno.apellidos}`
          });
          continue;
        }

        // Find grado ID
        const grado = grados.find(g => g.id === Number(alumno.grado));
        if (!grado) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            documento: alumno.nro_documento,
            error: `Grado ${alumno.grado} no encontrado`
          });
          continue;
        }

        // Find seccion ID
        const seccion = secciones.find(s => 
          s.nombre.toUpperCase() === alumno.seccion.toUpperCase()
        );
        if (!seccion) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            documento: alumno.nro_documento,
            error: `Sección ${alumno.seccion} no encontrada`
          });
          continue;
        }

        // Create student
        const { data: newStudent, error: createError } = await supabase
          .from('usuarios')
          .insert({
            nombre: `${alumno.nombres} ${alumno.apellidos}`,
            documento: alumno.nro_documento,
            sexo: alumno.sexo,
            edad: alumno.edad,
            gradoid: grado.id,
            seccionid: seccion.id,
            rolid: 1 // Default role for students
          })
          .select('id, nombre')
          .single();

        if (createError) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            documento: alumno.nro_documento,
            error: createError.message
          });
          continue;
        }

        // Create contact info if provided
        if (newStudent && alumno.nombre_contacto) {
          await supabase
            .from('info_contacto')
            .insert({
              usuarioid: newStudent.id,
              nombre: alumno.nombre_contacto,
              correo: alumno.correo_contacto || null,
              telefono: alumno.telefono_contacto || null
            });
        }

        result.created++;
        result.createdStudents.push({
          id: newStudent.id,
          nombre: newStudent.nombre
        });

      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          documento: alumno.nro_documento,
          error: error.message || 'Error desconocido'
        });
      }
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in bulk create:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
