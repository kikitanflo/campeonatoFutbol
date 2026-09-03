<template>
  <div class="page-wrapper">
    <div class="container pb-5">
      <div class="header-actions mt-5">
        <h2 class="premium-title">📊 Estadísticas del Torneo</h2>
        <div class="filters">
          <select class="premium-select">
            <option>Torneo 2026</option>
          </select>
        </div>
      </div>

      <div v-if="pending" class="text-center mt-5">
        <div class="spinner">⚽</div>
        <p class="text-muted mt-2 font-weight-bold">Cargando datos en vivo...</p>
      </div>

      <div v-else-if="stats && stats.success" class="stats-grid mt-4">
        
        <!-- Tabla de Goleadores -->
        <div class="glass-card">
          <h3 class="section-title"><span class="icon">🔥</span> Tabla de Goleadores</h3>
          <div class="table-responsive">
            <table class="premium-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th class="col-team">JUGADOR</th>
                  <th class="text-center">GOLES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(scorer, index) in stats.goleadores" :key="scorer.id">
                  <td class="col-rank">
                    <span v-if="index === 0" class="medal gold">🥇</span>
                    <span v-else-if="index === 1" class="medal silver">🥈</span>
                    <span v-else-if="index === 2" class="medal bronze">🥉</span>
                    <span v-else class="rank-number">{{ index + 1 }}</span>
                  </td>
                  <td class="col-team">
                    <div class="player-info">
                      <span class="player-name">{{ scorer.name }}</span>
                      <span class="player-team">{{ scorer.team }}</span>
                    </div>
                  </td>
                  <td class="col-points text-center">
                    <span class="stat-badge blue">{{ scorer.goals }}</span>
                  </td>
                </tr>
                <tr v-if="!stats.goleadores || stats.goleadores.length === 0">
                  <td colspan="3" class="empty-state">No hay goles registrados aún.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabla de Malla Menos Vencida -->
        <div class="glass-card">
          <h3 class="section-title"><span class="icon">🧤</span> Malla Menos Vencida</h3>
          <div class="table-responsive">
            <table class="premium-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th class="col-team">EQUIPO</th>
                  <th class="text-center">GC</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(team, index) in stats.defensa" :key="team.id">
                  <td class="col-rank">
                    <span v-if="index === 0" class="medal shield">🛡️</span>
                    <span v-else class="rank-number">{{ index + 1 }}</span>
                  </td>
                  <td class="col-team">
                    <div class="team-logo-placeholder">{{ team.name.charAt(0) }}</div>
                    <span class="team-name-text">{{ team.name }}</span>
                  </td>
                  <td class="col-points text-center">
                    <span class="stat-badge green">{{ team.gc }}</span>
                  </td>
                </tr>
                <tr v-if="!stats.defensa || stats.defensa.length === 0">
                  <td colspan="3" class="empty-state">No hay datos de defensa aún.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Tabla Fair Play Inverso (Tarjetas) -->
        <div class="glass-card full-width">
          <h3 class="section-title"><span class="icon">🟨</span> Registro Disciplinario</h3>
          <div class="table-responsive">
            <table class="premium-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th class="col-team">JUGADOR</th>
                  <th class="text-center">AMARILLAS</th>
                  <th class="text-center">ROJAS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(jugador, index) in stats.tarjetas" :key="jugador.id">
                  <td class="col-rank"><span class="rank-number">{{ index + 1 }}</span></td>
                  <td class="col-team">
                    <div class="player-info">
                      <span class="player-name">{{ jugador.name }}</span>
                      <span class="player-team">{{ jugador.team }}</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <span v-if="jugador.amarillas > 0" class="card-badge yellow">{{ jugador.amarillas }}</span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td class="text-center">
                    <span v-if="jugador.rojas > 0" class="card-badge red">{{ jugador.rojas }}</span>
                    <span v-else class="text-muted">-</span>
                  </td>
                </tr>
                <tr v-if="!stats.tarjetas || stats.tarjetas.length === 0">
                  <td colspan="4" class="empty-state">No hay tarjetas registradas en el torneo. ¡Juego limpio!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
const { data: stats, pending } = await useFetch('/api/estadisticas');
</script>

<style scoped>
.page-wrapper {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: calc(100vh - 64px);
  padding-top: 2rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.premium-title {
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.5px;
  background: linear-gradient(to right, #0f172a, #334155);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  font-size: 1.8rem;
}

.premium-select {
  padding: 0.5rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 700;
  background-color: white;
  color: #334155;
  outline: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 992px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  overflow: hidden;
  transition: transform 0.3s;
}

.glass-card:hover {
  transform: translateY(-4px);
}

.glass-card.full-width {
  grid-column: 1 / -1;
}

.section-title {
  color: #1e293b;
  margin-bottom: 1.5rem;
  font-weight: 900;
  font-size: 1.2rem;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f1f5f9;
}

.section-title .icon { font-size: 1.5rem; }

.premium-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  white-space: nowrap;
}

.premium-table th {
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 800;
  text-transform: uppercase;
  border-bottom: 2px solid #e2e8f0;
}

.premium-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-weight: 600;
  color: #334155;
  transition: background-color 0.2s;
}

.premium-table tbody tr:hover {
  background-color: #f8fafc;
}

.col-rank {
  font-weight: 800;
  width: 50px;
  text-align: center;
}

.medal { font-size: 1.5rem; }
.rank-number {
  background: #f1f5f9;
  color: #64748b;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.9rem;
}

.col-team {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-info {
  display: flex;
  flex-direction: column;
}

.player-name {
  font-weight: 800;
  color: #0f172a;
  font-size: 1.05rem;
}

.player-team {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.team-logo-placeholder {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #475569, #1e293b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
}

.team-name-text {
  font-weight: 800;
  color: #0f172a;
}

.stat-badge {
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 800;
}
.stat-badge.blue { background: #3b82f6; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2); }
.stat-badge.green { background: #10b981; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2); }

.card-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 32px;
  border-radius: 4px;
  color: #111827;
  font-weight: 800;
  font-size: 0.9rem;
  box-shadow: 1px 2px 4px rgba(0,0,0,0.1);
}
.card-badge.yellow { background: #fef08a; border: 1px solid #facc15; }
.card-badge.red { background: #fca5a5; border: 1px solid #f87171; color: white; }

.empty-state {
  text-align: center;
  padding: 2rem !important;
  color: #94a3b8;
  font-style: italic;
}

@keyframes spin { 100% { transform: rotate(360deg); } }
.spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
  display: inline-block;
}
</style>
