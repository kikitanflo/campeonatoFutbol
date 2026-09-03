<template>
  <div class="container mt-4 admin-dashboard">
    <div class="dashboard-header mb-4">
      <h2>⚙️ Editor de la Pantalla Principal</h2>
      <NuxtLink to="/admin" class="btn-secondary" style="padding: 0.5rem 1rem; text-decoration: none;">Volver al Panel</NuxtLink>
    </div>

    <div v-if="pending" class="text-center">Cargando configuraciones...</div>

    <div class="card" v-else>
      <p class="text-muted mb-4">Cambia los textos de la pantalla principal aquí. Los cambios se verán reflejados instantáneamente para los visitantes de la página.</p>

      <div v-if="mensaje" class="alert alert-success">{{ mensaje }}</div>

      <form @submit.prevent="guardar">
        <div class="form-group mb-3">
          <label><strong>Título Principal (Banner)</strong></label>
          <input type="text" v-model="form.hero_title" class="form-control" placeholder="Ej: CAMPEONATO LIGA PRO 2026" required>
        </div>

        <div class="form-group mb-3">
          <label><strong>Subtítulo (Debajo del Banner)</strong></label>
          <textarea v-model="form.hero_subtitle" class="form-control" rows="3" placeholder="Ej: Pasión, táctica y gloria en la cancha..."></textarea>
        </div>

        <div class="form-group mb-3">
          <label><strong>Texto del Cinta Móvil (Lo Último)</strong></label>
          <input type="text" v-model="form.ticker_label" class="form-control" placeholder="Ej: ⚽ LO ÚLTIMO" required>
        </div>

        <div class="row">
          <div class="col-md-6 form-group mb-3">
            <label><strong>Botón 1 (Texto)</strong></label>
            <input type="text" v-model="form.hero_btn1_text" class="form-control" placeholder="Ej: Ver Posiciones" required>
          </div>
          <div class="col-md-6 form-group mb-3">
            <label><strong>Botón 2 (Texto)</strong></label>
            <input type="text" v-model="form.hero_btn2_text" class="form-control" placeholder="Ej: Ver Equipos" required>
          </div>
        </div>

        <div class="form-group mb-3 mt-4 border-top pt-3">
          <label style="color: var(--primary-color);"><strong>📢 Avisos para Dirigentes (Opcional)</strong></label>
          <p class="text-muted small mb-2">Escribe noticias o anuncios que verán los dirigentes al entrar a su panel.</p>
          <textarea v-model="form.global_news" class="form-control" rows="3" placeholder="Ej: Las inscripciones cierran este viernes."></textarea>
        </div>

        <div class="mt-4">
          <button type="submit" class="btn-primary" :disabled="guardando" style="width: 100%; padding: 1rem; font-size: 1.1rem;">
            {{ guardando ? 'Guardando...' : '💾 Guardar Textos' }}
          </button>
        </div>
      </form>

      <!-- Nueva Sección para el Reglamento PDF -->
      <div class="mt-5 border-top pt-4">
        <h3 class="mb-3">📜 Subir Reglamento del Torneo</h3>
        <p class="text-muted mb-3">Sube el archivo PDF oficial. Esto reemplazará el reglamento anterior.</p>
        
        <form @submit.prevent="subirReglamento" class="pdf-upload-form">
          <input type="file" ref="fileInput" accept="application/pdf" class="form-control mb-3" required />
          <button type="submit" class="btn-secondary w-100" :disabled="subiendoPdf" style="padding: 0.75rem;">
            {{ subiendoPdf ? 'Subiendo archivo...' : '📤 Subir PDF' }}
          </button>
        </form>
        <div v-if="mensajePdf" class="alert mt-3" :class="errorPdf ? 'alert-error' : 'alert-success'">
          {{ mensajePdf }}
        </div>
      </div>

      <!-- Nueva Sección para el Carrusel Principal -->
      <div class="mt-5 border-top pt-4">
        <h3 class="mb-3">🖼️ Subir Imágenes para el Fondo (Carrusel Principal)</h3>
        <p class="text-muted mb-3">Sube varias imágenes (fotos de partidos, premiación) para usarlas de fondo animado en la sección superior de la página de inicio.</p>
        
        <form @submit.prevent="subirHero" class="pdf-upload-form">
          <input type="file" ref="heroInput" accept="image/png, image/jpeg, image/webp, image/gif" class="form-control mb-3" multiple required />
          <button type="submit" class="btn-secondary w-100" :disabled="subiendoHero" style="padding: 0.75rem;">
            {{ subiendoHero ? 'Subiendo imágenes...' : '📤 Subir Imágenes de Fondo' }}
          </button>
        </form>
        <div v-if="mensajeHero" class="alert mt-3" :class="errorHero ? 'alert-error' : 'alert-success'">
          {{ mensajeHero }}
        </div>
      </div>

      <!-- Nueva Sección para el Carrusel de Patrocinadores -->
      <div class="mt-5 border-top pt-4">
        <h3 class="mb-3">🤝 Subir Logos de Patrocinadores</h3>
        <p class="text-muted mb-3">Puedes seleccionar múltiples imágenes a la vez (mantén presionado Ctrl o arrastra). Estas imágenes formarán un carrusel animado en la página principal.</p>
        
        <form @submit.prevent="subirSponsor" class="pdf-upload-form">
          <input type="file" ref="sponsorInput" accept="image/png, image/jpeg, image/webp, image/gif" class="form-control mb-3" multiple required />
          <button type="submit" class="btn-secondary w-100" :disabled="subiendoSponsor" style="padding: 0.75rem;">
            {{ subiendoSponsor ? 'Subiendo logos...' : '📤 Subir Logos' }}
          </button>
        </form>
        <div v-if="mensajeSponsor" class="alert mt-3" :class="errorSponsor ? 'alert-error' : 'alert-success'">
          {{ mensajeSponsor }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' });
// Re-usamos el middleware auth que ya existe, pero aseguramos rol admin.
const authCookie = useCookie('admin_session');
let user = null;
if (authCookie.value) {
  user = typeof authCookie.value === 'string' 
    ? JSON.parse(decodeURIComponent(authCookie.value)) 
    : authCookie.value;
}
if (user?.rol !== 'admin') {
  throw createError({ statusCode: 403, statusMessage: 'Solo para administradores' });
}

const form = ref({
  hero_title: '',
  hero_subtitle: '',
  ticker_label: '',
  hero_btn1_text: '',
  hero_btn2_text: '',
  global_news: ''
});

const guardando = ref(false);
const mensaje = ref('');

// Variables para el PDF
const fileInput = ref(null);
const subiendoPdf = ref(false);
const mensajePdf = ref('');
const errorPdf = ref(false);

// Variables para el Patrocinador
const sponsorInput = ref(null);
const subiendoSponsor = ref(false);
const mensajeSponsor = ref('');
const errorSponsor = ref(false);

// Variables para el Hero Carrusel
const heroInput = ref(null);
const subiendoHero = ref(false);
const mensajeHero = ref('');
const errorHero = ref(false);

// Cargar la configuración actual desde el API público
const { pending } = await useAsyncData('config', async () => {
  const res = await $fetch('/api/public/home');
  if (res && res.configuracion) {
    form.value.hero_title = res.configuracion.hero_title || '';
    form.value.hero_subtitle = res.configuracion.hero_subtitle || '';
    form.value.ticker_label = res.configuracion.ticker_label || '';
    form.value.hero_btn1_text = res.configuracion.hero_btn1_text || '';
    form.value.hero_btn2_text = res.configuracion.hero_btn2_text || '';
    form.value.global_news = res.configuracion.global_news || '';
  }
  return true;
});

async function guardar() {
  guardando.value = true;
  mensaje.value = '';
  try {
    await $fetch('/api/admin/configuracion', {
      method: 'POST',
      body: form.value
    });
    // Forzar recarga completa hacia la página principal para garantizar que se vean los cambios
    window.location.href = '/';
  } catch (err) {
    alert(err.data?.statusMessage || 'Error al guardar');
  } finally {
    guardando.value = false;
  }
}

async function subirReglamento() {
  const file = fileInput.value.files[0];
  if (!file) return;

  subiendoPdf.value = true;
  mensajePdf.value = '';
  errorPdf.value = false;

  const formData = new FormData();
  formData.append('reglamento', file);

  try {
    const res = await $fetch('/api/admin/upload-reglamento', {
      method: 'POST',
      body: formData
    });
    mensajePdf.value = res.message;
    fileInput.value.value = ''; // Limpiar input
  } catch (err) {
    errorPdf.value = true;
    mensajePdf.value = err.data?.statusMessage || 'Error al subir el archivo';
  } finally {
    subiendoPdf.value = false;
  }
}

async function subirSponsor() {
  const files = sponsorInput.value.files;
  if (!files.length) return;

  subiendoSponsor.value = true;
  mensajeSponsor.value = '';
  errorSponsor.value = false;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('sponsor_images', files[i]);
  }

  try {
    const res = await $fetch('/api/admin/upload-sponsor', {
      method: 'POST',
      body: formData
    });
    mensajeSponsor.value = res.message;
    sponsorInput.value.value = ''; // Limpiar input
  } catch (err) {
    errorSponsor.value = true;
    mensajeSponsor.value = err.data?.statusMessage || 'Error al subir las imágenes';
  } finally {
    subiendoSponsor.value = false;
  }
}

async function subirHero() {
  const files = heroInput.value.files;
  if (!files.length) return;

  subiendoHero.value = true;
  mensajeHero.value = '';
  errorHero.value = false;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('hero_images', files[i]);
  }

  try {
    const res = await $fetch('/api/admin/upload-hero-images', {
      method: 'POST',
      body: formData
    });
    mensajeHero.value = res.message;
    heroInput.value.value = ''; // Limpiar input
  } catch (err) {
    errorHero.value = true;
    mensajeHero.value = err.data?.statusMessage || 'Error al subir las imágenes del hero';
  } finally {
    subiendoHero.value = false;
  }
}
</script>

<style scoped>
.dashboard-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-color); padding-bottom: 1rem; }
h2 { font-weight: 800; color: #111827; }
.btn-secondary { background-color: white; color: #111827; border: 1px solid #e5e7eb; border-radius: 6px; font-weight: 600; cursor: pointer; }
.card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.form-group label { display: block; margin-bottom: 0.5rem; color: #374151; }
.form-control { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; }
.form-control:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.btn-primary { background: var(--primary-color); color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }
.alert-success { background-color: #d1fae5; color: #065f46; padding: 1rem; border-radius: 6px; text-align: center; font-weight: 700; }
.alert-error { background-color: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 6px; text-align: center; font-weight: 700; }
.row { display: flex; gap: 1rem; flex-wrap: wrap; }
.col-md-6 { flex: 1; min-width: 250px; }
.pdf-upload-form { background: #f9fafb; padding: 1.5rem; border-radius: 8px; border: 1px dashed #d1d5db; }
.w-100 { width: 100%; }
</style>
