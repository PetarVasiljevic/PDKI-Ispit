<script setup lang="ts">
</script>

<template>
  <div class="container my-5">
    <div class="card shadow-sm border-success-subtle p-4">
      <div class="row align-items-center">
        <div class="col-12 col-md-7">
          <div class="card-body">
            <h2 class="card-title fw-bold text-success mb-3">O nama — Digitalna Prodavnica Biljaka</h2>
            <ul class="list-unstyled fs-6">
              <li class="mb-2"><i class="fa-solid fa-graduation-cap text-success me-2"></i><strong>Predmet:</strong> Programiranje i dizajn korisničkih interfejsa (PDKI)</li>
              <li class="mb-2"><i class="fa-solid fa-building-columns text-success me-2"></i><strong>Fakultet:</strong> 3. godina Tehničkog fakulteta Univerziteta Singidunum</li>
              <li class="mb-2"><i class="fa-solid fa-user-graduate text-success me-2"></i><strong>Student:</strong> Petar Vasiljević</li>
              <li class="mb-2"><i class="fa-solid fa-id-badge text-success me-2"></i><strong>Broj indeksa:</strong> 2024200206</li>
            </ul>
            <hr>
            <h6 class="fw-bold text-success">Korišćene tehnologije u prototipu:</h6>
            <div class="d-flex flex-wrap gap-2 mt-2">
              <span class="badge bg-success">Vue 3 (Composition API + TypeScript)</span>
              <span class="badge bg-success">Bootstrap 5.3</span>
              <span class="badge bg-success">Axios REST klijent</span>
              <span class="badge bg-success">SweetAlert2 dijalozi</span>
            </div>
            <p class="small text-muted mt-3 mb-0">
              Prototip simulira kompletnu pretragu, rezervaciju, upravljanje statusima porudžbina ('rezervisano', 'pristiglo', 'otkazano') i ocenjivanje biljaka u lokalnom skladištu pregledača (LocalStorage).
            </p>
          </div>
        </div>
        <div class="col-12 col-md-5 text-center">
          <img src="../assets/logo_prodavnica_biljaka.png" class="img-fluid logo-img" alt="Logo prodavnice biljaka">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo-img {
  max-width: 220px;
  width: 100%;
  height: auto;
}
</style>
