export default defineNuxtRouteMiddleware((to, from) => {
  // Solo se ejecuta en el cliente para redirecciones visuales, pero Nuxt 3 lo maneja global
  const authCookie = useCookie('admin_session');

  const protectedRoutes = ['/admin', '/dirigente', '/arbitro'];
  const isProtected = protectedRoutes.some(route => to.path.startsWith(route)) && to.path !== '/admin/login';

  if (isProtected) {
    if (!authCookie.value) {
      return navigateTo('/admin/login');
    }
  }

  // Si ya estamos logueados y tratamos de ir al login, redirigir al panel
  if (to.path === '/admin/login' && authCookie.value) {
    return navigateTo('/admin');
  }
});
