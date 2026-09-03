<template>
  <div class="page-wrapper">
    <div class="container pb-5">
      <div class="glass-card mt-5">
        <div class="header-actions">
          <h2 class="premium-title">🏆 Tabla de Posiciones</h2>
          <div class="filters">
            <select class="premium-select">
              <option>Torneo 2026</option>
            </select>
          </div>
        </div>

        <div class="table-responsive mt-4">
          <table class="premium-table">
            <thead>
              <tr>
                <th class="col-rank">#</th>
                <th class="col-team">EQUIPO</th>
                <th class="col-points text-center">PTS</th>
                <th class="text-center">PJ</th>
                <th class="text-center" title="Diferencia de Goles">DG</th>
                <th class="text-center">G</th>
                <th class="text-center">E</th>
                <th class="text-center">P</th>
                <th class="text-center">GF</th>
                <th class="text-center">GC</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(team, index) in standings" :key="team.id" :class="{'top-team': index < 4}">
                <td class="col-rank">
                  <span v-if="index === 0" class="medal gold">🥇</span>
                  <span v-else-if="index === 1" class="medal silver">🥈</span>
                  <span v-else-if="index === 2" class="medal bronze">🥉</span>
                  <span v-else class="rank-number">{{ index + 1 }}</span>
                </td>
                <td class="col-team">
                  <div class="team-logo-placeholder">{{ team.name.charAt(0) }}</div>
                  <span class="team-name-text">{{ team.name }}</span>
                </td>
                <td class="col-points text-center">
                  <span class="points-badge">{{ team.pts }}</span>
                </td>
                <td class="text-center">{{ team.pj }}</td>
                <td class="text-center font-weight-bold" :class="team.dg > 0 ? 'text-success' : (team.dg < 0 ? 'text-danger' : '')">
                  {{ team.dg > 0 ? '+' : '' }}{{ team.dg }}
                </td>
                <td class="text-center">{{ team.g }}</td>
                <td class="text-center">{{ team.e }}</td>
                <td class="text-center">{{ team.p }}</td>
                <td class="text-center">{{ team.gf }}</td>
                <td class="text-center">{{ team.gc }}</td>
              </tr>
              <tr v-if="!standings || standings.length === 0">
                <td colspan="10" class="empty-state">No hay equipos registrados todavía.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: standings } = await useFetch('/api/equipos');
</script>

<style scoped>
.page-wrapper {
  background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%);
  min-height: calc(100vh - 64px);
  padding-top: 2rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  overflow: hidden;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 1rem;
}

.premium-title {
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.5px;
  background: linear-gradient(to right, var(--primary-color), #2563eb);
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
  transition: border-color 0.3s, box-shadow 0.3s;
}

.premium-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.premium-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  white-space: nowrap;
}

.premium-table th {
  padding: 1rem;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 800;
  text-transform: uppercase;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.premium-table th:first-child { border-top-left-radius: 8px; }
.premium-table th:last-child { border-top-right-radius: 8px; }

.premium-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-weight: 600;
  color: #334155;
  transition: background-color 0.2s;
}

.premium-table tbody tr {
  transition: transform 0.2s, box-shadow 0.2s;
}

.premium-table tbody tr:hover {
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transform: scale(1.01);
  border-radius: 8px;
  position: relative;
  z-index: 10;
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

.top-team .rank-number {
  background: #e0f2fe;
  color: #0284c7;
}

.col-team {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.team-logo-placeholder {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-color), #3b82f6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 1.1rem;
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
}

.team-name-text {
  font-weight: 800;
  color: #0f172a;
  font-size: 1.05rem;
}

.points-badge {
  background: #10b981;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.font-weight-bold { font-weight: 800; }
.text-success { color: #10b981; }
.text-danger { color: #ef4444; }

.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: #94a3b8;
  font-style: italic;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .glass-card { padding: 1rem; }
  .premium-title { font-size: 1.4rem; }
  .header-actions { flex-direction: column; text-align: center; }
}
</style>
