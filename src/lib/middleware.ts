import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

// Define route permissions by role
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/': ['ADMIN'],
  '/alumnos': ['ADMIN'],
  '/asistencias': ['ADMIN', 'PORTERO'],
  '/reportes': ['ADMIN'],
  '/configuracion': ['ADMIN'],
};

// Default redirect routes by role
const DEFAULT_ROUTES: Record<string, string> = {
  'ADMIN': '/',
  'PORTERO': '/asistencias',
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Redirect to login if no user and not on public routes
  if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/(auth)')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated
  if (user) {
    // Redirect authenticated users away from login page
    if (pathname.startsWith('/login') || pathname.startsWith('/(auth)')) {
      // Fetch user role to redirect to appropriate default route
      const { data: userData } = await supabase
        .from('usuarios')
        .select('rol(nombre)')
        .eq('id', user.id)
        .single();

      const roleName = (userData?.rol as any)?.nombre || 'ADMIN';
      const defaultRoute = DEFAULT_ROUTES[roleName] || '/';
      
      return NextResponse.redirect(new URL(defaultRoute, request.url));
    }

    // Check role-based route permissions for protected routes
    // Find matching route permission (check if pathname starts with any protected route)
    let matchedRoute: string | null = null;
    let allowedRoles: string[] | null = null;

    for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathname === route || pathname.startsWith(route + '/')) {
        matchedRoute = route;
        allowedRoles = roles;
        break;
      }
    }

    // If this is a protected route, check permissions
    if (matchedRoute && allowedRoles) {
      // Fetch user role from database
      const { data: userData } = await supabase
        .from('usuarios')
        .select('rol(nombre)')
        .eq('id', user.id)
        .single();

      const userRole = (userData?.rol as any)?.nombre;

      // If user doesn't have permission, redirect to their default route
      if (userRole && !allowedRoles.includes(userRole)) {
        const defaultRoute = DEFAULT_ROUTES[userRole] || '/asistencias';
        return NextResponse.redirect(new URL(defaultRoute, request.url));
      }
    }
  }

  return response;
}