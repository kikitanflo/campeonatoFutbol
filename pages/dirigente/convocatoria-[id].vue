<template>
  <div class="container mt-4">
    <div class="header-actions">
      <h2>📋 Convocatoria de Partido</h2>
      <NuxtLink to="/dirigente" class="btn-secondary" style="padding: 0.5rem 1rem; text-decoration: none;">Volver</NuxtLink>
    </div>

    <div v-if="pendingJugadores || pendingPartido" class="text-center mt-4">Cargando...</div>
    
    <div v-else-if="jugadores" class="card mt-4">
      <div class="match-info mb-4" v-if="partidoInfo">
        <h3>{{ partidoInfo.local_nombre }} vs {{ partidoInfo.visitante_nombre }}</h3>
        <p class="text-muted">Jornada {{ partidoInfo.jornada }} - {{ partidoInfo.fecha ? new Date(partidoInfo.fecha).toLocaleString() : 'Fecha por definir' }}</p>
      </div>

      <p class="text-muted mb-4" v-if="partidoInfo && partidoInfo.estado !== 'Finalizado'">Selecciona los jugadores que participarán en este partido. Solo los jugadores marcados aparecerán en la planilla del árbitro.</p>
      <p class="text-muted mb-4" v-else-if="partidoInfo && partidoInfo.estado === 'Finalizado'">Este partido ha finalizado. Puedes revisar la planilla de jugadores que participaron.</p>
      
      <div v-if="mensaje" class="alert alert-success">{{ mensaje }}</div>

      <form @submit.prevent="guardarPlanilla">
        <div class="list-controls mb-3" v-if="partidoInfo && partidoInfo.estado !== 'Finalizado' && jugadores?.length > 0">
          <button type="button" @click="seleccionarTodos" class="btn-action">✅ Seleccionar Todos</button>
          <button type="button" @click="deseleccionarTodos" class="btn-action btn-outline">❌ Ninguno</button>
        </div>
        
        <div class="jugadores-list">
          <label v-for="jugador in jugadores" :key="jugador.id" class="jugador-item" :style="partidoInfo && partidoInfo.estado === 'Finalizado' ? 'cursor: not-allowed; opacity: 0.8;' : ''">
            <input type="checkbox" :value="jugador.id" v-model="seleccionados" class="mr-2" :disabled="partidoInfo && partidoInfo.estado === 'Finalizado'">
            <span class="dorsal">{{ jugador.dorsal }}</span>
            <span class="nombre">{{ jugador.nombre }}</span>
          </label>
        </div>

        <div class="action-footer mt-4">
          <span class="counter">Seleccionados: <strong>{{ seleccionados.length }}</strong> de {{ jugadores.length }}</span>
          <button v-if="partidoInfo && partidoInfo.estado !== 'Finalizado'" type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar Planilla' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' });
const route = useRoute();
const partidoId = route.params.id;

const seleccionados = ref([]);
const loading = ref(false);
const mensaje = ref('');

const authCookie = useCookie('admin_session');
let user = null;
if (authCookie.value) {
  user = typeof authCookie.value === 'string' 
    ? JSON.parse(decodeURIComponent(authCookie.value)) 
    : authCookie.value;
}

// Cargar jugadores del equipo
const { data: jugadores, pending: pendingJugadores } = await useFetch('/api/jugadores', {
  query: { equipo_id: user?.equipo_id }
});

// Cargar info del partido para ver cuáles ya estaban seleccionados
const { data: partidoInfo, pending: pendingPartido } = await useFetch(`/api/arbitro/partido/${partidoId}`);

watchEffect(() => {
  if (partidoInfo.value && jugadores.value?.length > 0) {
    let jugadoresEnPlanilla = [];
    if (partidoInfo.value.equipo_local_id === user?.equipo_id) {
      jugadoresEnPlanilla = partidoInfo.value.jugadores_local;
    } else {
      jugadoresEnPlanilla = partidoInfo.value.jugadores_visitante;
    }
    
    // Marcar los checkboxes de los que ya están convocados
    seleccionados.value = jugadoresEnPlanilla.map(j => j.id);
  }
});

function seleccionarTodos() {
  if (jugadores.value) {
    seleccionados.value = jugadores.value.map(j => j.id);
  }
}

function deseleccionarTodos() {
  seleccionados.value = [];
}

async function guardarPlanilla() {
  loading.value = true;
  mensaje.value = '';
  
  try {
    await $fetch('/api/dirigente/convocatoria', {
      method: 'POST',
      body: {
        partido_id: partidoId,
        jugadores_ids: seleccionados.value
      }
    });
    mensaje.value = '¡Planilla guardada con éxito! El árbitro ya puede ver a estos jugadores.';
    setTimeout(() => { mensaje.value = ''; }, 3000);
  } catch (error) {
    alert(error.data?.statusMessage || 'Error al guardar la planilla');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.header-actions { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-color); padding-bottom: 1rem; }
h2 { font-weight: 800; color: #111827; }
.btn-secondary { background-color: white; color: #111827; border: 1px solid #e5e7eb; border-radius: 6px; font-weight: 600; cursor: pointer; }

.match-info { background: #f3f4f6; padding: 1rem; border-radius: 8px; text-align: center; }
.match-info h3 { margin: 0; color: var(--primary-color); }

.list-controls { display: flex; gap: 0.5rem; }
.btn-action { background: #e5e7eb; color: #374151; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
.btn-action:hover { background: #d1d5db; }
.btn-outline { background: transparent; border: 1px solid #d1d5db; }
.btn-outline:hover { background: #f9fafb; }

.jugadores-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.jugador-item { display: flex; align-items: center; padding: 0.75rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
.jugador-item:hover { background: #f3f4f6; }
.jugador-item input { transform: scale(1.2); margin-right: 0.75rem; }

.dorsal { background: #374151; color: white; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 0.75rem; font-weight: 700; margin-right: 0.5rem; }
.nombre { font-weight: 600; color: #111827; }

.action-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e5e7eb; padding-top: 1.5rem; }
.btn-primary { padding: 0.75rem 2rem; background-color: var(--primary-color); color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 1rem; }
.alert-success { background-color: #d1fae5; color: #065f46; padding: 1rem; border-radius: 6px; text-align: center; font-weight: 700; margin-bottom: 1.5rem; }
</style>
