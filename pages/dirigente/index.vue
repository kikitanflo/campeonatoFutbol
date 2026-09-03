<template>
  <div class="admin-dashboard container mt-4">
    <div class="dashboard-header">
      <h2>🏟️ Panel del Dirigente</h2>
      <button class="btn-logout" @click="logout">Cerrar Sesión</button>
    </div>

    <!-- Sección de Avisos Globales -->
    <div v-if="globalNews" class="global-news-alert mb-4">
      <h4>📢 AVISO IMPORTANTE</h4>
      <p>{{ globalNews }}</p>
    </div>

    <div class="dashboard-grid">
      <div class="card action-card">
        <h3>🏃 Mi Plantilla</h3>
        <p>Inscribe a tus jugadores para el torneo (Máximo 30).</p>
        <NuxtLink to="/dirigente/jugadores" class="btn-secondary" style="display: block; text-decoration: none;">Gestionar Jugadores</NuxtLink>
      </div>

      <div class="card action-card">
        <h3>📜 Reglamento</h3>
        <p>Reglas oficiales, sanciones y formato del torneo.</p>
        <a :href="`/reglamento.pdf?v=${new Date().getTime()}`" target="_blank" download="Reglamento_Torneo.pdf" class="btn-secondary" style="display: block; text-decoration: none;">Descargar / Leer PDF</a>
      </div>

      <div class="card">
        <h3 style="color: var(--primary-color); margin-bottom: 1rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem;">
          📅 Próximos Partidos
        </h3>
        <p class="text-muted small mb-4">Selecciona los jugadores que participarán en cada partido.</p>
        
        <div v-if="pending" class="text-center">Cargando...</div>
        
        <div v-else class="partidos-list">
          <div v-for="partido in partidos" :key="partido.id" class="partido-item">
            <div class="partido-info">
              <span class="jornada">Jornada {{ partido.jornada }}</span>
              <strong>{{ partido.local_nombre }} vs {{ partido.visitante_nombre }}</strong>
              <div class="small mt-1 text-muted">
                {{ partido.estado }} | {{ partido.convocados }} Jugadores Seleccionados
              </div>
            </div>
            <NuxtLink :to="`/dirigente/convocatoria-${partido.id}`" class="btn-sm" :class="partido.estado === 'Finalizado' ? 'btn-secondary' : 'btn-primary'" style="text-decoration: none;">
              Planilla
            </NuxtLink>
          </div>
          
          <div v-if="partidos.length === 0" class="text-muted text-center py-4">
            No tienes partidos programados.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' });
const router = useRouter();
const authCookie = useCookie('admin_session');

const { data: partidos, pending } = await useFetch('/api/dirigente/partidos');
const { data: homeData } = await useFetch('/api/public/home');

const globalNews = computed(() => {
  return homeData.value?.configuracion?.global_news || '';
});

function logout() {
  authCookie.value = null;
  router.push('/admin/login');
}
</script>

<style scoped>
.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
.dashboard-header h2 { font-weight: 800; color: #111827; }
.btn-logout { background-color: #f3f4f6; color: #374151; border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-logout:hover { background-color: #e5e7eb; }
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.action-card { text-align: center; padding: 2.5rem 2rem; display: flex; flex-direction: column; justify-content: center; }
.action-card h3 { font-size: 1.5rem; margin-bottom: 1rem; color: #111827; }
.action-card p { color: var(--text-muted); margin-bottom: 2rem; flex-grow: 1; }
.btn-secondary { width: 100%; padding: 0.75rem; background-color: white; color: #111827; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 1rem; font-weight: 700; cursor: pointer; }
.btn-secondary:hover:not(:disabled) { background-color: #f9fafb; }
.btn-secondary:disabled { background-color: #f3f4f6; color: #9ca3af; cursor: not-allowed; }

.partidos-list { display: flex; flex-direction: column; gap: 1rem; }
.partido-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb; }
.jornada { display: inline-block; background: #e5e7eb; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; margin-right: 0.5rem; }
.btn-sm { padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.85rem; font-weight: 700; }
.btn-primary { background: var(--primary-color); color: white; border: none; cursor: pointer; }
.btn-disabled { background: #d1d5db; color: #6b7280; pointer-events: none; }

.global-news-alert { background: linear-gradient(135deg, #fffbeb, #fef3c7); border-left: 4px solid #f59e0b; padding: 1.5rem; border-radius: 8px; color: #92400e; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.global-news-alert h4 { margin: 0 0 0.5rem 0; font-weight: 900; font-size: 1rem; color: #b45309; }
.global-news-alert p { margin: 0; font-size: 1.05rem; }
</style>
