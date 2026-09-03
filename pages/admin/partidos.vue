<template>
  <div class="container mt-4">
    <div class="header-actions">
      <h2>📝 Programación de Partidos</h2>
      <NuxtLink to="/admin" class="btn-secondary" style="padding: 0.5rem 1rem; text-decoration: none;">Volver al Panel</NuxtLink>
    </div>

    <div class="admin-grid">
      <!-- Formulario de Programación -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <h3 style="border: none; padding: 0; margin: 0;">Crear Partido Extra Manualmente</h3>
          <div style="display: flex; gap: 0.5rem;">
            <button @click="resetearTorneo" class="btn-danger" :disabled="loadingReset">
              {{ loadingReset ? 'Borrando...' : '⚠️ Resetear Torneo a Cero' }}
            </button>
            <button @click="autogenerarCalendario" class="btn-autogenerar" :disabled="loadingAuto">
              {{ loadingAuto ? 'Generando...' : '🤖 Autogenerar Calendario' }}
            </button>
          </div>
        </div>
        
        <form @submit.prevent="programarPartido" class="mt-4">
          
          <div class="form-group">
            <label>Equipo Local</label>
            <select v-model="form.equipo_local_id" class="form-control" required>
              <option value="" disabled>Seleccione un equipo</option>
              <option v-for="equipo in equipos" :key="equipo.id" :value="equipo.id">{{ equipo.nombre }}</option>
            </select>
          </div>

          <div class="form-group text-center">
            <span class="vs-badge">VS</span>
          </div>

          <div class="form-group">
            <label>Equipo Visitante</label>
            <select v-model="form.equipo_visitante_id" class="form-control" required>
              <option value="" disabled>Seleccione un equipo</option>
              <option v-for="equipo in equipos" :key="equipo.id" :value="equipo.id" :disabled="equipo.id === form.equipo_local_id">
                {{ equipo.nombre }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>Jornada / Fecha #</label>
              <input type="number" v-model="form.jornada" class="form-control" required min="1">
            </div>
            <div class="form-group half">
              <label>Fecha y Hora (Opcional)</label>
              <input type="datetime-local" v-model="form.fecha" class="form-control">
            </div>
          </div>

          <div v-if="mensaje" :class="['alert', errorForm ? 'alert-danger' : 'alert-success']">
            {{ mensaje }}
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Programar Partido' }}
          </button>
        </form>
      </div>

      <!-- Lista de Partidos -->
      <div class="card">
        <h3>Calendario del Torneo</h3>
        <div v-if="pending" class="text-center mt-4">Cargando...</div>
        <div v-else class="partidos-list mt-4">
          <div v-for="partido in partidos" :key="partido.id" class="partido-item">
            <div class="jornada-badge">Jornada {{ partido.jornada }}</div>
            <div class="partido-teams">
              <strong>{{ partido.local_nombre }}</strong>
              <span class="vs">vs</span>
              <strong>{{ partido.visitante_nombre }}</strong>
            </div>
            <div class="partido-footer">
              <span :class="['estado-badge', 'estado-' + partido.estado.replace(' ', '-').toLowerCase()]">
                {{ partido.estado }}
              </span>
              <div v-if="editingId === partido.id" class="fecha-edit">
                <input type="datetime-local" v-model="tempFecha" class="form-control" style="padding: 0.2rem; font-size: 0.8rem;" />
                <button @click="saveFecha(partido)" class="btn-icon save-icon" title="Guardar">✅</button>
                <button @click="cancelEdit()" class="btn-icon cancel-icon" title="Cancelar">❌</button>
              </div>
              <span v-else class="fecha">
                {{ partido.fecha ? new Date(partido.fecha).toLocaleString() : 'Sin fecha' }}
                <button @click="startEdit(partido)" class="btn-icon" title="Asignar o Editar Fecha">📅</button>
              </span>
            </div>
          </div>
          
          <div v-if="partidos.length === 0" class="text-center text-muted p-4">
            No hay partidos programados todavía.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' });

const form = ref({ equipo_local_id: '', equipo_visitante_id: '', jornada: 1, fecha: '' });
const loading = ref(false);
const loadingAuto = ref(false);
const loadingReset = ref(false);
const mensaje = ref('');
const errorForm = ref(false);

const editingId = ref(null);
const tempFecha = ref('');

const { data: apiData, pending, refresh } = await useFetch('/api/admin/partidos');
const equipos = computed(() => apiData.value?.equipos || []);
const partidos = computed(() => apiData.value?.partidos || []);

async function programarPartido() {
  loading.value = true;
  mensaje.value = '';
  errorForm.value = false;

  try {
    const { error } = await useFetch('/api/admin/partidos', {
      method: 'POST',
      body: form.value
    });

    if (error.value) {
      errorForm.value = true;
      mensaje.value = error.value.data?.statusMessage || 'Error al programar el partido';
    } else {
      mensaje.value = '¡Partido programado con éxito!';
      form.value.equipo_local_id = '';
      form.value.equipo_visitante_id = '';
      form.value.fecha = '';
      await refresh();
      setTimeout(() => { mensaje.value = ''; }, 3000);
    }
  } catch (err) {
    errorForm.value = true;
    mensaje.value = 'Error inesperado';
  } finally {
    loading.value = false;
  }
}

function startEdit(partido) {
  editingId.value = partido.id;
  // Format for datetime-local: YYYY-MM-DDTHH:mm
  if (partido.fecha) {
    const d = new Date(partido.fecha);
    const tzoffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d - tzoffset)).toISOString().slice(0, 16);
    tempFecha.value = localISOTime;
  } else {
    tempFecha.value = '';
  }
}

function cancelEdit() {
  editingId.value = null;
  tempFecha.value = '';
}

async function saveFecha(partido) {
  try {
    const { error } = await useFetch('/api/admin/partidos/update-fecha', {
      method: 'POST',
      body: {
        partido_id: partido.id,
        fecha: tempFecha.value || null
      }
    });

    if (error.value) {
      alert(error.value.data?.statusMessage || 'Error al actualizar fecha');
    } else {
      await refresh();
      cancelEdit();
    }
  } catch (err) {
    alert('Error inesperado al actualizar');
  }
}

async function autogenerarCalendario() {
  if (!confirm('¿Estás seguro? Esto borrará todos los partidos en estado "Pendiente" y creará un nuevo calendario de Todos contra Todos.')) return;
  
  loadingAuto.value = true;
  mensaje.value = '';
  errorForm.value = false;

  try {
    const { data, error } = await useFetch('/api/admin/partidos/autogenerar', {
      method: 'POST'
    });

    if (error.value) {
      errorForm.value = true;
      mensaje.value = error.value.data?.statusMessage || 'Error al generar el calendario';
    } else {
      mensaje.value = data.value.message || '¡Calendario autogenerado con éxito!';
      await refresh();
      setTimeout(() => { mensaje.value = ''; }, 4000);
    }
  } catch (err) {
    errorForm.value = true;
    mensaje.value = 'Error inesperado';
  } finally {
    loadingAuto.value = false;
  }
}

async function resetearTorneo() {
  if (!confirm('⚠️ ¡ADVERTENCIA PELIGROSA!\n\nEsto borrará TODOS los partidos y reiniciará los puntos, goles y tarjetas de todos los equipos a CERO.\n\n¿Estás absolutamente seguro de querer resetear el torneo?')) return;
  
  loadingReset.value = true;
  mensaje.value = '';
  errorForm.value = false;

  try {
    const { data, error } = await useFetch('/api/admin/reset-torneo', {
      method: 'POST'
    });

    if (error.value) {
      errorForm.value = true;
      mensaje.value = error.value.data?.statusMessage || 'Error al reiniciar el torneo';
    } else {
      mensaje.value = data.value.message || '¡Torneo reiniciado con éxito!';
      await refresh();
      setTimeout(() => { mensaje.value = ''; }, 4000);
    }
  } catch (err) {
    errorForm.value = true;
    mensaje.value = 'Error inesperado';
  } finally {
    loadingReset.value = false;
  }
}
</script>

<style scoped>
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
h2 { font-weight: 800; color: #111827; }
h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--primary-color); border-bottom: 2px solid var(--border-color); padding-bottom: 0.5rem; }

.admin-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 768px) { .admin-grid { grid-template-columns: 1fr 1.5fr; } }

.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; }
.form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; }
.form-row { display: flex; gap: 1rem; }
.half { flex: 1; }
.vs-badge { display: inline-block; background: #e5e7eb; padding: 0.5rem 1rem; border-radius: 50%; font-weight: 900; color: #6b7280; font-size: 0.9rem; }

.btn-primary { width: 100%; padding: 0.75rem; background-color: var(--primary-color); color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
.btn-secondary { background-color: white; color: #111827; border: 1px solid #e5e7eb; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-autogenerar { background-color: #8b5cf6; color: white; border: none; border-radius: 6px; padding: 0.5rem 1rem; font-weight: 700; cursor: pointer; transition: background-color 0.2s; }
.btn-autogenerar:hover:not(:disabled) { background-color: #7c3aed; }
.btn-autogenerar:disabled { background-color: #c4b5fd; cursor: not-allowed; }

.btn-danger { background-color: #ef4444; color: white; border: none; border-radius: 6px; padding: 0.5rem 1rem; font-weight: 700; cursor: pointer; transition: background-color 0.2s; }
.btn-danger:hover:not(:disabled) { background-color: #dc2626; }
.btn-danger:disabled { background-color: #fca5a5; cursor: not-allowed; }

.alert { padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; text-align: center; font-weight: 600; }
.alert-success { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.alert-danger { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

/* Lista de Partidos */
.partidos-list { display: flex; flex-direction: column; gap: 1rem; max-height: 600px; overflow-y: auto; padding-right: 0.5rem; }
.partido-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; }
.jornada-badge { background: #111827; color: white; display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; }
.partido-teams { font-size: 1.1rem; margin-bottom: 0.5rem; text-align: center; }
.vs { color: #9ca3af; margin: 0 0.5rem; font-size: 0.9rem; font-weight: bold; }
.partido-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #d1d5db; padding-top: 0.5rem; font-size: 0.85rem; }
.fecha { color: #6b7280; display: flex; align-items: center; gap: 0.5rem; }
.fecha-edit { display: flex; align-items: center; gap: 0.5rem; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0; transition: transform 0.1s; }
.btn-icon:hover { transform: scale(1.1); }
.save-icon { font-size: 1rem; }
.cancel-icon { font-size: 1rem; }
.estado-badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.75rem; }
.estado-pendiente { background: #fef3c7; color: #92400e; }
.estado-en-curso { background: #d1fae5; color: #065f46; }
.estado-finalizado { background: #e5e7eb; color: #374151; }
</style>
