<template>
  <div class="container mt-4">
    <div class="header-actions">
      <h2>⚖️ Panel del Árbitro ({{ session?.username }})</h2>
      <button class="btn-logout" @click="logout">Cerrar Sesión</button>
    </div>

    <div class="card mt-4">
      <h3>📅 Partidos Programados</h3>
      <p class="text-muted">Selecciona un partido para abrir la planilla virtual.</p>

      <div v-if="pending" class="text-center mt-4">Cargando partidos...</div>
      
      <div v-else class="partidos-grid mt-4">
        <div v-for="partido in partidos" :key="partido.id" class="partido-card">
          <div class="jornada-badge">Jornada {{ partido.jornada }}</div>
          <div class="partido-teams">
            <div class="team">
              <div class="team-logo-placeholder"></div>
              <span class="team-name">{{ partido.local_nombre }}</span>
            </div>
            <div class="vs">VS</div>
            <div class="team">
              <div class="team-logo-placeholder"></div>
              <span class="team-name">{{ partido.visitante_nombre }}</span>
            </div>
          </div>
          <div class="partido-footer">
            <span :class="['estado', partido.estado === 'En Curso' ? 'en-curso' : 'pendiente']">
              {{ partido.estado }}
            </span>
            <div class="action-buttons">
              <button v-if="!partido.arbitraje_pagado" class="btn-warning" @click="registrarPago(partido.id)" title="Registrar pago antes de abrir la planilla">
                💰 Pago de Arbitraje
              </button>
              <NuxtLink v-else :to="`/arbitro/partido-${partido.id}`" class="btn-primary" style="text-decoration: none; display: inline-block;">
                Abrir Planilla
              </NuxtLink>
            </div>
          </div>
        </div>

        <div v-if="!partidos || partidos.length === 0" class="empty-state">
          No hay partidos pendientes por arbitrar.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' });
const router = useRouter();
const authCookie = useCookie('admin_session');
const session = ref(authCookie.value || null);

function logout() {
  authCookie.value = null;
  router.push('/admin/login');
}

const { data: partidos, pending, refresh } = await useFetch('/api/arbitro/partidos');

async function registrarPago(partidoId) {
  if (!confirm('¿Confirmar que se ha recibido el pago de arbitraje para este partido?')) return;
  
  try {
    const { error } = await useFetch('/api/arbitro/pagar-arbitraje', {
      method: 'POST',
      body: { partido_id: partidoId }
    });
    
    if (error.value) {
      alert(error.value.data?.statusMessage || 'Error al registrar pago');
    } else {
      alert('Pago registrado correctamente. Ahora puede abrir la planilla.');
      await refresh();
    }
  } catch (err) {
    alert('Error inesperado al registrar el pago');
  }
}
</script>

<style scoped>
.header-actions { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-color); padding-bottom: 1rem; }
h2 { font-weight: 800; color: #111827; }
.btn-logout { background-color: #f3f4f6; color: #374151; border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; }

.partidos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.partido-card { background: white; border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.jornada-badge { display: inline-block; background: #e5e7eb; color: #374151; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; margin-bottom: 1rem; }
.partido-teams { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.team { text-align: center; flex: 1; }
.team-logo-placeholder { width: 48px; height: 48px; background: #f3f4f6; border-radius: 50%; margin: 0 auto 0.5rem auto; border: 1px dashed #d1d5db; }
.team-name { font-weight: 700; color: #111827; display: block; font-size: 0.95rem; }
.vs { font-weight: 900; color: var(--text-muted); font-size: 1.2rem; padding: 0 1rem; }

.partido-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f3f4f6; padding-top: 1rem; }
.estado { font-size: 0.85rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 4px; }
.estado.pendiente { background: #fef3c7; color: #92400e; }
.estado.en-curso { background: #d1fae5; color: #065f46; }
.action-buttons { display: flex; gap: 0.5rem; }
.btn-primary { padding: 0.5rem 1rem; background-color: var(--primary-color); color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
.btn-warning { padding: 0.5rem 1rem; background-color: #f59e0b; color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.9rem; transition: background-color 0.2s; }
.btn-warning:hover { background-color: #d97706; }
.btn-disabled { padding: 0.5rem 1rem; background-color: #e5e7eb; color: #9ca3af; border: none; border-radius: 6px; font-weight: 700; cursor: not-allowed; font-size: 0.9rem; }
.empty-state { grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted); background: #f9fafb; border-radius: 8px; border: 1px dashed #e5e7eb; }
</style>
