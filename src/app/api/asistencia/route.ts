
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Temporal } from 'temporal-polyfill';

// Comparar horas usando Temporal (HH:mm:ss)
function compararHoras(h1: string, h2: string): number {
  const t1 = Temporal.PlainTime.from(h1);
  const t2 = Temporal.PlainTime.from(h2);
  // Temporal.PlainTime.compare devuelve -1, 0, 1
  return Temporal.PlainTime.compare(t1, t2);
}

export async function POST(req: Request) {
  try {
    const { usuarioId } = await req.json()
    if (!usuarioId) {
      return NextResponse.json({ error: 'usuarioId es requerido' }, { status: 400 })
    }

  // Obtener fecha y hora actual en Lima
  const timeZone = 'America/Lima';
  const nowZdt = Temporal.Now.zonedDateTimeISO(timeZone);
  const fechaActual = nowZdt.toPlainDate().toString(); // YYYY-MM-DD
  const horaActual = nowZdt.toPlainTime().toString().slice(0, 8); // HH:mm:ss

    // Obtener configuración
    const { data: config, error: configError } = await supabase.from('configuracion').select('*').single()
    if (configError || !config) {
      return NextResponse.json({ error: 'No se pudo obtener la configuración' }, { status: 500 })
    }

    // Buscar si ya existe asistencia del día
    const { data: asistenciaExistente, error: asistenciaError } = await supabase
      .from('asistencia')
      .select('*')
      .eq('usuarioid', usuarioId)
      .eq('fecha', fechaActual)
      .maybeSingle()

    if (asistenciaError) {
      return NextResponse.json({ error: 'Error verificando asistencia existente' }, { status: 500 })
    }

    // Si ya existe -> segundo marcaje (salida)
    if (asistenciaExistente) {
      if (asistenciaExistente.hora_salida) {
        return NextResponse.json({ error: 'Ya registraste tu salida hoy' }, { status: 409 })
      }

      const { data, error } = await supabase
        .from('asistencia')
        .update({ hora_salida: horaActual })
        .eq('id', asistenciaExistente.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: 'Error al actualizar hora de salida' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Salida registrada', data })
    }

    // Si no existe -> primer marcaje (entrada)
    const horaEntrada = config.hora_entrada
    const horaFalta = config.hora_falta ?? config.hora_salida // fallback

    let estado: 'ASISTENCIA' | 'TARDANZA' | 'FALTA'

    if (compararHoras(horaActual, horaEntrada) <= 0) {
      estado = 'ASISTENCIA'
    } else if (compararHoras(horaActual, horaFalta) < 0) {
      estado = 'TARDANZA'
    } else {
      estado = 'TARDANZA' 
    }

    const { data, error } = await supabase
      .from('asistencia')
      .insert([
        {
          usuarioid: usuarioId,
          fecha: fechaActual,
          hora_llegada: horaActual,
          estado,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error al registrar asistencia:', error);
      return NextResponse.json({ error: error.message || 'Error al registrar asistencia' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Entrada registrada', data })
  } catch (err) {
    console.error('Error registrando asistencia:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
