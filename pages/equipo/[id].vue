<template>
  <div class="page-wrapper">
    <div class="container pb-5">
      <div class="header-actions mt-5">
        <NuxtLink to="/posiciones" class="btn-back">⬅ Volver a Posiciones</NuxtLink>
      </div>

      <div v-if="pending" class="text-center mt-5">
        <div class="spinner">⚽</div>
        <p class="text-muted mt-2 font-weight-bold">Cargando perfil del equipo...</p>
      </div>

      <div v-else-if="!data || !data.success" class="empty-state mt-5">
        <div class="glass-card">
          <p>El equipo no existe o hubo un error al cargar.</p>
        </div>
      </div>

      <template v-else>
        <!-- Tarjeta del Perfil -->
        <div class="glass-card team-hero mb-4 mt-4">
          <div class="team-hero-content">
            <div class="team-logo-hero">
              <img v-if="equipo.logo" :src="equipo.logo" alt="Logo" class="logo-img" />
              <span v-else class="logo-placeholder">{{ equipo.nombre.charAt(0) }}</span>
            </div>
            <div class="team-details">
              <h1 class="team-name">{{ equipo.nombre }}</h1>
              <div class="team-stats-row">
                <div class="stat-pill"><span class="label">PTS</span> <span class="val">{{ equipo.puntos }}</span></div>
                <div class="stat-pill"><span class="label">PJ</span> <span class="val">{{ equipo.partidos_ganados + equipo.partidos_empatados + equipo.partidos_perdidos }}</span></div>
                <div class="stat-pill"><span class="label">GF</span> <span class="val">{{ equipo.goles_favor }}</span></div>
                <div class="stat-pill"><span class="label">GC</span> <span class="val">{{ equipo.goles_contra }}</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Historial de Partidos -->
        <h3 class="section-title mt-5 mb-4">🗓️ Historial de Partidos</h3>
        <div class="matches-list">
          <div v-for="partido in partidos" :key="partido.id" class="glass-card match-card">
            <div class="match-header">
              <span class="jornada-badge">Jornada {{ partido.jornada }}</span>
              <span class="fecha-text">{{ partido.fecha ? formatFecha(partido.fecha) : 'Por definir' }}</span>
            </div>
            
            <div class="match-teams">
              <div class="team-side" :class="{'is-this-team': partido.equipo_local_id === equipo.id}">
                <span class="t-name">{{ partido.local_nombre }}</span>
                <span v-if="partido.estado === 'Finalizado'" class="t-score" :class="{'winner': partido.goles_local > partido.goles_visitante}">{{ partido.goles_local }}</span>
              </div>
              <div class="vs-divider">
                <span v-if="partido.estado !== 'Finalizado'" class="vs-badge">VS</span>
                <span v-else class="vs-dash">-</span>
              </div>
              <div class="team-side right" :class="{'is-this-team': partido.equipo_visitante_id === equipo.id}">
                <span v-if="partido.estado === 'Finalizado'" class="t-score" :class="{'winner': partido.goles_visitante > partido.goles_local}">{{ partido.goles_visitante }}</span>
                <span class="t-name">{{ partido.visitante_nombre }}</span>
              </div>
            </div>

            <div class="match-footer">
              <span class="status-badge" :class="'status-' + partido.estado.replace(' ', '-').toLowerCase()">
                {{ partido.estado }}
              </span>
            </div>
          </div>
          <div v-if="partidos.length === 0" class="empty-state">
            Este equipo aún no tiene partidos programados.
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const teamId = route.params.id;

const { data, pending } = await useFetch(`/api/equipos/${teamId}`);

const equipo = computed(() => data.value?.equipo || {});
const partidos = computed(() => data.value?.partidos || []);

function formatFecha(dateString) {
  const d = new Date(dateString.replace(' ', 'T'));
  return d.toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.page-wrapper {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: calc(100vh - 64px);
  padding-top: 2rem;
}

.btn-back {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #334155;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-back:hover { background: #f8fafc; transform: translateX(-5px); }

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.team-hero {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: white;
  border: none;
}

.team-hero-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.team-logo-hero {
  width: 100px;
  height: 100px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 900;
  border: 3px solid rgba(255,255,255,0.2);
}
.logo-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

.team-name { font-size: 2.5rem; font-weight: 900; margin: 0 0 1rem 0; text-transform: uppercase; }

.team-stats-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.stat-pill { background: rgba(255,255,255,0.15); padding: 0.5rem 1rem; border-radius: 50px; display: flex; gap: 0.5rem; align-items: center; }
.stat-pill .label { font-size: 0.8rem; font-weight: 700; opacity: 0.8; }
.stat-pill .val { font-size: 1.1rem; font-weight: 900; }

.section-title { font-weight: 900; color: #1e293b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }

.matches-list { display: flex; flex-direction: column; gap: 1rem; }

.match-card { padding: 1rem 1.5rem; transition: transform 0.2s; }
.match-card:hover { transform: translateY(-3px); }

.match-header { display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem; color: #64748b; font-size: 0.9rem; font-weight: 700; }
.jornada-badge { background: #3b82f6; color: white; padding: 0.2rem 0.6rem; border-radius: 4px; }

.match-teams { display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
.team-side { flex: 1; display: flex; align-items: center; gap: 1rem; justify-content: flex-end; }
.team-side.right { justify-content: flex-start; }

.t-name { font-size: 1.1rem; font-weight: 800; color: #334155; }
.t-score { font-size: 1.5rem; font-weight: 900; background: #f1f5f9; padding: 0.2rem 0.8rem; border-radius: 8px; color: #1e293b; }
.t-score.winner { background: #10b981; color: white; }

.is-this-team .t-name { color: var(--primary-color); }

.vs-divider { margin: 0 1.5rem; font-weight: 900; color: #94a3b8; }
.vs-badge { background: #f1f5f9; padding: 0.4rem; border-radius: 50%; font-size: 0.8rem; }
.vs-dash { font-size: 1.5rem; }

.match-footer { text-align: center; }
.status-badge { display: inline-block; padding: 0.2rem 0.8rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
.status-pendiente { background: #fef3c7; color: #d97706; }
.status-programado { background: #dbeafe; color: #2563eb; }
.status-en-curso { background: #fee2e2; color: #dc2626; animation: pulse 2s infinite; }
.status-finalizado { background: #f3f4f6; color: #4b5563; }

@media (max-width: 768px) {
  .team-hero-content { flex-direction: column; text-align: center; gap: 1rem; }
  .team-stats-row { justify-content: center; }
  .match-teams { flex-direction: column; gap: 1rem; }
  .team-side { justify-content: center; width: 100%; }
  .team-side.right { justify-content: center; flex-direction: row-reverse; }
  .vs-divider { margin: 0.5rem 0; }
}
</style>
