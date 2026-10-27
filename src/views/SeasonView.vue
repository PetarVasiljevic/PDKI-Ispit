<script setup lang="ts">
import type { PlantModel } from '@/models/plants.model'
import { PlantsService } from '@/services/plants.service'
import { formatDate } from '@/utils'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import autumnBg from '@/assets/autumn-pattern.svg'
import springBg from '@/assets/spring-pattern.jpg'
import summerBg from '@/assets/summer-pattern.jpg'
import winterBg from '@/assets/winter-pattern.jpg'

const plants = ref<PlantModel[]>([])
const selectedSeason = ref<string>('all')

PlantsService.getPlants().then(data => {
  plants.value = data
})
const salePlants = computed(() => plants.value.filter(p => p.isOnSale))

const filteredBySeason = computed(() => {
  if (selectedSeason.value === 'all') return plants.value
  return plants.value.filter(p =>
    p.season.toLowerCase().includes(selectedSeason.value.toLowerCase())
  )
})

const backgroundStyle = computed(() => {
  let imgUrl = ''

  if (selectedSeason.value === 'prole') imgUrl = springBg
  else if (selectedSeason.value === 'leto') imgUrl = summerBg
  else if (selectedSeason.value === 'jesen') imgUrl = autumnBg
  else if (selectedSeason.value === 'zima') imgUrl = winterBg

  if (!imgUrl) return {}

  return {
    backgroundImage: `url("${imgUrl}")`,
    backgroundRepeat: 'repeat',
    backgroundAttachment: 'fixed',
    backgroundSize: '350px'
  }
})
</script>

<template>
  <div class="season-wrapper py-4" :style="backgroundStyle">
    <div class="container">
      <div class="card bg-body bg-opacity-90 shadow-sm border-success mb-4 p-3">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h3 class="fw-bold text-success mb-1">
              <i class="fa-brands fa-canadian-maple-leaf me-2"></i>Sezonska kolekcija biljaka
            </h3>
            <p class="mb-0 small text-body-secondary">
              Pregled biljaka prilagođenih različitim godišnjim dobima i uslovima.
            </p>
          </div>
          <div class="btn-group">
            <button type="button" class="btn btn-sm"
              :class="selectedSeason === 'all' ? 'btn-success' : 'btn-outline-success'" @click="selectedSeason = 'all'">
              Sve sezone
            </button>
            <button type="button" class="btn btn-sm"
              :class="selectedSeason === 'prole' ? 'btn-success' : 'btn-outline-success'"
              @click="selectedSeason = 'prole'">
              Proleće
            </button>
            <button type="button" class="btn btn-sm"
              :class="selectedSeason === 'leto' ? 'btn-success' : 'btn-outline-success'"
              @click="selectedSeason = 'leto'">
              Leto
            </button>
            <button type="button" class="btn btn-sm"
              :class="selectedSeason === 'jesen' ? 'btn-success' : 'btn-outline-success'"
              @click="selectedSeason = 'jesen'">
              Jesen
            </button>
            <button type="button" class="btn btn-sm"
              :class="selectedSeason === 'zima' ? 'btn-success' : 'btn-outline-success'"
              @click="selectedSeason = 'zima'">
              Zima
            </button>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-md-4 mb-4" v-for="p in filteredBySeason" :key="p.id">
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
                    <strong class="text-success"><i class="fa-regular fa-comment-dots me-1"></i>{{
                      p.reviews[0]?.userName }}</strong>
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
    </div>
  </div>

</template>

<style scoped>
.season-wrapper {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  min-height: 100vh;
}
</style>