<script setup lang="ts">
import InfoCard from '@/components/InfoCard.vue'
import type { PlantModel } from '@/models/plants.model'
import { PlantsService } from '@/services/plants.service'
import { formatDate } from '@/utils'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const plants = ref<PlantModel[]>([])
const isLoading = ref(true)
const showAdvancedFilters = ref(true)

const filters = ref({
  name: (route.query.search as string) ?? '',
  descriptionAndCare: '',
  typeAndCategory: 'any',
  climateAndSeason: 'any',
  targetAudience: 'any',
  dateFrom: 'any',
  maxPrice: 5000,
  minRating: 0
})

PlantsService.getPlants().then(data => {
  plants.value = data
  isLoading.value = false
})

watch(() => route.query.search, (newVal) => {
  filters.value.name = (newVal as string) ?? ''
})

const availableTypes = computed(() => {
  const set = new Set<string>()
  plants.value.forEach(p => {
    if (p.plant_type) set.add(p.plant_type)
    if (p.category) set.add(p.category)
    if (p.intended_use) set.add(p.intended_use)
  })
  return Array.from(set)
})

const availableClimatesAndSeasons = computed(() => {
  const set = new Set<string>()
  plants.value.forEach(p => {
    if (p.climate) set.add(p.climate)
    if (p.season) set.add(p.season)
  })
  return Array.from(set)
})

const availableAudiences = computed(() => {
  const set = new Set<string>()
  plants.value.forEach(p => {
    if (p.target_audience) set.add(p.target_audience)
  })
  return Array.from(set)
})

const availableDates = computed(() => {
  const set = new Set<string>()
  plants.value.forEach(p => {
    if (p.production_date) set.add(p.production_date.split('T')[0]!)
  })
  return Array.from(set).sort()
})

const filteredPlants = computed(() => {
  return plants.value.filter(p => {
    if (filters.value.name.trim() !== '') {
      const q = filters.value.name.toLowerCase()
      const matchName = p.name.toLowerCase().includes(q) || p.latin_name.toLowerCase().includes(q)
      if (!matchName) return false
    }

    if (filters.value.descriptionAndCare.trim() !== '') {
      const q = filters.value.descriptionAndCare.toLowerCase()
      const combined = `${p.description} ${p.planting_instructions} ${p.care_instructions}`.toLowerCase()
      if (!combined.includes(q)) return false
    }

    if (filters.value.typeAndCategory !== 'any') {
      const t = filters.value.typeAndCategory
      if (p.plant_type !== t && p.category !== t && p.intended_use !== t) return false
    }

    if (filters.value.climateAndSeason !== 'any') {
      const cs = filters.value.climateAndSeason
      if (p.climate !== cs && p.season !== cs) return false
    }

    if (filters.value.targetAudience !== 'any') {
      if (p.target_audience !== filters.value.targetAudience) return false
    }

    if (filters.value.dateFrom !== 'any') {
      const plantTime = new Date(p.production_date).getTime()
      const fromTime = new Date(filters.value.dateFrom).getTime()
      if (plantTime < fromTime) return false
    }

    if (Number(p.price) > filters.value.maxPrice) {
      return false
    }

    if (filters.value.minRating > 0) {
      if (p.averageRating < filters.value.minRating) return false
    }

    return true
  })
})

function resetFilters() {
  filters.value = {
    name: '',
    descriptionAndCare: '',
    typeAndCategory: 'any',
    climateAndSeason: 'any',
    targetAudience: 'any',
    dateFrom: 'any',
    maxPrice: 5000,
    minRating: 0
  }
}
</script>

<template>
  <div class="card full-width-banner border-0 shadow-sm mb-4">
    <div class="banner-container position-relative">
      <img src="../assets/sale.png" class="w-100 object-fit-cover" style="max-height: 320px;" alt="Sniženje">
      <div class="card-img-overlay d-flex align-items-center px-4 px-md-5">
        <div class="left-side-text-wrapper bg-white bg-opacity-75 p-3 p-md-4 rounded-4 shadow-sm">
          <RouterLink class="text-decoration-none" to="/sale">
            <h1 class="card-title text-start mb-1 fw-bold" style="color: #198754; font-size: clamp(1.2rem, 3vw, 2.3rem);">
              Dobrodošli u Digitalnu Prodavnicu Biljaka
            </h1>
            <h4 class="card-content text-start mb-2" style="color: #146c43; font-size: clamp(0.9rem, 1.8vw, 1.3rem);">
              <u>Pogledajte naše najnovije akcije (-20%)</u>
            </h4>
          </RouterLink>
          <div class="d-flex gap-2 mt-2">
            <RouterLink to="/sale" class="btn btn-success btn-sm rounded-pill px-3">
              <i class="fa-solid fa-percent me-1"></i> Akcijska ponuda
            </RouterLink>
            <RouterLink to="/season" class="btn btn-outline-success btn-sm rounded-pill px-3">
              <i class="fa-brands fa-canadian-maple-leaf me-1"></i> Sezonske kolekcije
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card border-success shadow-sm mb-4">
    <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
      <span class="fw-bold">
        <i class="fa-solid fa-magnifying-glass me-2"></i>Pretraga i filtriranje biljaka po kriterijumima
      </span>
      <button class="btn btn-sm btn-light text-success fw-semibold" type="button"
        @click="showAdvancedFilters = !showAdvancedFilters">
        <i class="fa-solid" :class="showAdvancedFilters ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        {{ showAdvancedFilters ? 'Sakrij filtere' : 'Prikaži sve filtere' }}
      </button>
    </div>

    <div class="card-body" v-if="showAdvancedFilters">
      <div class="row g-3">
        <div class="col-12 col-md-4">
          <label class="form-label fw-semibold small mb-1">1. Naziv ili latinski naziv:</label>
          <input type="text" class="form-control border-success" placeholder="npr. Monstera, Fikus, Kaktus..."
            v-model="filters.name">
        </div>

        <div class="col-12 col-md-4">
          <label class="form-label fw-semibold small mb-1">2. Opis, sadnja i nega:</label>
          <input type="text" class="form-control border-success" placeholder="npr. ukrasna, aromaticna, dekorativna..."
            v-model="filters.descriptionAndCare">
        </div>

        <div class="col-12 col-md-4">
          <label class="form-label fw-semibold small mb-1">3. Tip biljke (vrsta / namena):</label>
          <select class="form-select border-success" v-model="filters.typeAndCategory">
            <option value="any">Svi tipovi i vrste biljaka</option>
            <option v-for="t in availableTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="col-12 col-md-3">
          <label class="form-label fw-semibold small mb-1">4. Podneblje i sezona:</label>
          <select class="form-select border-success" v-model="filters.climateAndSeason">
            <option value="any">Sva podneblja i sezone</option>
            <option v-for="cs in availableClimatesAndSeasons" :key="cs" :value="cs">{{ cs }}</option>
          </select>
        </div>

        <div class="col-12 col-md-3">
          <label class="form-label fw-semibold small mb-1">5. Ciljna grupa korisnika:</label>
          <select class="form-select border-success" v-model="filters.targetAudience">
            <option value="any">Sve ciljne grupe</option>
            <option v-for="aud in availableAudiences" :key="aud" :value="aud">{{ aud }}</option>
          </select>
        </div>

        <div class="col-12 col-md-2">
          <label class="form-label fw-semibold small mb-1">6. Datum proizvodnje (od):</label>
          <select class="form-select border-success" v-model="filters.dateFrom">
            <option value="any">Bilo koji datum</option>
            <option v-for="d in availableDates" :key="d" :value="d">{{ formatDate(d) }}</option>
          </select>
        </div>

        <div class="col-12 col-md-2">
          <label class="form-label fw-semibold small mb-1">
            7. Maks. cena: <strong>{{ filters.maxPrice }} RSD</strong>
          </label>
          <input type="range" class="form-range mt-2" min="300" max="5000" step="100" v-model.number="filters.maxPrice">
        </div>

        <div class="col-12 col-md-2">
          <label class="form-label fw-semibold small mb-1">8. Recenzije / Ocena:</label>
          <select class="form-select border-success" v-model.number="filters.minRating">
            <option :value="0">Sve ocene</option>
            <option :value="5">★★★★★ (Samo 5.0)</option>
            <option :value="4">★★★★☆ (4.0 i više)</option>
            <option :value="3">★★★☆☆ (3.0 i više)</option>
          </select>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
        <small class="text-body-secondary">
          Prikazano <strong>{{ filteredPlants.length }}</strong> od ukupno <strong>{{ plants.length }}</strong> biljaka
        </small>
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetFilters">
          <i class="fa-solid fa-rotate-left me-1"></i> Resetuj sve kriterijume
        </button>
      </div>
    </div>
  </div>

  <div class="row" v-if="filteredPlants.length > 0">
    <div class="col-12 col-md-6 col-lg-4 mb-4" v-for="p in filteredPlants" :key="p.id">
      <div class="card plant-card h-100 shadow-sm border-success-subtle">
        <div class="position-relative">
          <img :src="p.imageUrl" class="card-img-top p-3" style="height: 230px; object-fit: contain;" :alt="p.name">
          <span v-if="p.isOnSale" class="badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1">
            <i class="fa-solid fa-bolt me-1"></i>AKCIJA -20%
          </span>
          <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2 px-2 py-1 shadow-sm">
            <i class="fa-solid fa-star"></i> {{ p.averageRating }} ({{ p.reviews.length }})
          </span>
        </div>

        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 class="card-title text-center fw-bold mb-0">{{ p.name }}</h5>
            <p class="text-center text-muted fst-italic small mb-2">{{ p.latin_name }}</p>
            <hr class="my-2">

            <p class="small text-body-secondary mb-2">
              <strong>Opis i nega:</strong> {{ p.description.slice(0, 85) }}...
            </p>

            <ul class="list-unstyled small mb-3">
              <li class="mb-1">
                <i class="fa-solid fa-leaf text-success me-1"></i>
                <strong>Tip / Kategorija:</strong> {{ p.plant_type }} ({{ p.category }})
              </li>
              <li class="mb-1">
                <i class="fa-solid fa-sun text-warning me-1"></i>
                <strong>Podneblje / Sezona:</strong> {{ p.climate }} / {{ p.season }}
              </li>
              <li class="mb-1">
                <i class="fa-solid fa-users text-primary me-1"></i>
                <strong>Ciljna grupa:</strong> {{ p.target_audience }}
              </li>
              <li class="mb-1">
                <i class="fa-solid fa-house-chimney-window text-info me-1"></i>
                <strong>Namena:</strong> {{ p.intended_use }}
              </li>
              <li class="mb-1">
                <i class="fa-regular fa-calendar-check text-secondary me-1"></i>
                <strong>Proizvedeno:</strong> {{ formatDate(p.production_date) }}
              </li>
            </ul>

            <div v-if="p.reviews.length > 0" class="bg-body-tertiary rounded p-2 mb-3 small border">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <strong class="text-success"><i class="fa-regular fa-comment-dots me-1"></i>{{ p.reviews[0]?.userName }}</strong>
                <span class="text-warning">{{ '★'.repeat(p.reviews[0]?.rating ?? 5) }}</span>
              </div>
              <div class="text-muted fst-italic">"{{ p.reviews[0]?.comment }}"</div>
            </div>
          </div>

          <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span v-if="p.originalPrice" class="text-decoration-line-through text-muted small me-2">
                  {{ p.originalPrice }},00 RSD
                </span>
                <span class="fs-5 fw-bold text-success">{{ p.price }},00 RSD</span>
              </div>
              <span class="badge bg-success-subtle text-success border border-success">
                Na stanju: {{ p.stock_quantity }}
              </span>
            </div>

            <div class="d-flex gap-2">
              <RouterLink :to="`/details/${p.id}`" class="btn btn-outline-success w-50 fw-semibold">
                <i class="fa-solid fa-circle-info me-1"></i> Detalji
              </RouterLink>
              <RouterLink :to="`/order/${p.id}`" class="btn btn-success w-50 fw-semibold">
                <i class="fa-solid fa-cart-plus me-1"></i> Rezerviši
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <InfoCard title="Nema rezultata pretrage" v-if="!isLoading && filteredPlants.length === 0">
    <p class="mb-3">Nijedna biljka ne odgovara zadatim kriterijumima pretrage.</p>
    <button type="button" class="btn btn-success" @click="resetFilters">
      <i class="fa-solid fa-rotate-left me-1"></i> Poništi filtere
    </button>
  </InfoCard>

  <InfoCard title="Učitavanje kataloga" v-if="isLoading">
    <p class="mb-0">🌱 Učitavanje ponude biljaka... Molimo sačekajte.</p>
  </InfoCard>
</template>

<style scoped>
.full-width-banner {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}
</style>
