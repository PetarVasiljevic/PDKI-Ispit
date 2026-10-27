<script setup lang="ts">
import type { PlantModel } from '@/models/plants.model'
import { PlantsService } from '@/services/plants.service'
import { formatDate } from '@/utils'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const plants = ref<PlantModel[]>([])

PlantsService.getPlants().then(data => {
  plants.value = data
})

const salePlants = computed(() => plants.value.filter(p => p.isOnSale))
</script>

<template>
  <div class="my-4">
    <div
      class="p-4 mb-4 rounded-4 bg-success text-white shadow-sm d-flex flex-wrap justify-content-between align-items-center">
      <div>
        <h2 class="fw-bold mb-1"><i class="fa-solid fa-tags me-2"></i>Akcijska ponuda biljaka (-20%)</h2>
        <p class="mb-0">Iskoristite sezonsko sniženje na odabrane sadnice i sobne biljke!</p>
      </div>
      <RouterLink to="/" class="btn btn-light text-success fw-bold mt-2 mt-md-0">
        Sve biljke u katalogu
      </RouterLink>
    </div>

    <div class="row">
      <div class="col-12 col-md-4 mb-4" v-for="p in salePlants" :key="p.id">
        <div class="card plant-card text-left h-100 shadow-sm border-success-subtle">
          <div class="position-relative">
            <img :src="p.imageUrl" class="card-img-top p-3" style="height: 220px; object-fit: contain;" :alt="p.name">
            <span class="badge bg-danger position-absolute top-0 start-0 m-2">-20% POPUSTA</span>
            <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">★ {{ p.averageRating }}</span>
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
                  <strong class="text-success"><i class="fa-regular fa-comment-dots me-1"></i>{{ p.reviews[0]?.userName
                    }}</strong>
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
</template>
