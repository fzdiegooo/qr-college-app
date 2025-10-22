import { createClient } from '@/lib/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Cerrar sesión
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 400 }
    );
  }

  // Redireccionar al login
  return NextResponse.redirect(new URL('/login', request.url));
}