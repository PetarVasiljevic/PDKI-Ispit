<script setup lang="ts">
import type { PlantModel } from '@/models/plants.model'
import { PlantsService } from '@/services/plants.service'
import { formatDate, formatDateTime, showLoading } from '@/utils'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()
const id = Number(route.params.id)

const details = ref<(PlantModel & { other: PlantModel[] }) | null>(null)

onMounted(() => {
  showLoading('Učitavanje detalja o biljci...')
  PlantsService.getPlantDetails(id).then(data => {
    details.value = data
    Swal.close()
  })
})
</script>

<template>
  <div v-if="details" class="my-4">
    <div class="card shadow-sm border-success-subtle mb-4">
      <div class="row g-0 align-items-stretch">
        <div class="col-12 col-md-5 d-flex flex-column justify-content-center align-items-center p-4 bg-body-tertiary">
          <img :src="details.imageUrl" class="img-fluid rounded mb-3" style="max-height: 360px;" :alt="details.name">
          <div class="text-center">
            <span class="badge bg-warning text-dark fs-6 px-3 py-2 shadow-sm">
              <i class="fa-solid fa-star"></i> Prosečna ocena: {{ details.averageRating }} / 5
              ({{ details.reviews.length }} recenzija)
            </span>
          </div>
        </div>

        <div class="col-12 col-md-7 d-flex flex-column">
          <div class="card-body p-4 flex-grow-1">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h2 class="card-title fw-bold text-success mb-1">{{ details.name }}</h2>
                <p class="text-muted fst-italic mb-2">{{ details.latin_name }} [latinski naziv]</p>
              </div>
              <span v-if="details.isOnSale" class="badge bg-danger fs-6">AKCIJA -20%</span>
            </div>

            <hr>

            <div class="mb-3">
              <p class="mb-2"><strong><i class="fa-solid fa-book-open text-success me-2"></i>O biljci:</strong> {{ details.description }}</p>
              <p class="mb-2"><strong><i class="fa-solid fa-trowel text-success me-2"></i>Način sađenja:</strong> {{ details.planting_instructions }}</p>
              <p class="mb-2"><strong><i class="fa-solid fa-hand-holding-droplet text-success me-2"></i>Način nege biljke:</strong> {{ details.care_instructions }}</p>
            </div>

            <hr>

            <div class="row g-2 small mb-3">
              <div class="col-12 col-sm-6">
                <strong>Tip biljke:</strong> {{ details.plant_type }}
              </div>
              <div class="col-12 col-sm-6">
                <strong>Ciljna grupa korisnika:</strong> {{ details.target_audience }}
              </div>
              <div class="col-12 col-sm-6">
                <strong>Neophodno osvetljenje:</strong> {{ details.light_requirement }}
              </div>
              <div class="col-12 col-sm-6">
                <strong>Tip navodnjavanja:</strong> {{ details.watering }}
              </div>
              <div class="col-12 col-sm-6">
                <strong>Namenjeno za:</strong> {{ details.intended_use }}
              </div>
              <div class="col-12 col-sm-6">
                <strong>Kategorija biljke:</strong> {{ details.category }}
              </div>
              <div class="col-12 col-sm-6">
                <strong>Vremensko okruženje (podneblje):</strong> {{ details.climate }}
              </div>
              <div class="col-12 col-sm-6">
                <strong>Sezona:</strong> {{ details.season }}
              </div>
              <div class="col-12 col-sm-6">
                <strong>Datum proizvodnje:</strong> {{ formatDate(details.production_date) }}
              </div>
              <div class="col-12 col-sm-6">
                <strong>Na stanju:</strong> {{ details.stock_quantity }} komada
              </div>
            </div>

            <hr>

            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <span class="text-muted d-block small">Cena po sadnici:</span>
                <span v-if="details.originalPrice" class="text-decoration-line-through text-muted me-2">
                  {{ details.originalPrice }},00 RSD
                </span>
                <span class="fs-3 fw-bold text-success">{{ details.price }},00 dinara</span>
              </div>

              <RouterLink :to="`/order/${details.id}`" class="btn btn-success btn-lg px-4 fw-bold shadow-sm">
                <i class="fa-solid fa-cart-shopping me-2"></i> Rezerviši biljku
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-success-subtle mb-4">
      <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold">
          <i class="fa-solid fa-star me-2"></i>Recenzije i ocene kupaca ({{ details.reviews.length }})
        </h5>
        <span class="badge bg-light text-success">
          Samo kupci kojima je biljka u statusu "pristiglo" mogu ocenjivati
        </span>
      </div>
      <div class="card-body">
        <div v-if="details.reviews.length > 0" class="row g-3">
          <div class="col-12 col-md-6" v-for="rev in details.reviews" :key="rev.id">
            <div class="border rounded p-3 h-100 bg-body-tertiary">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <strong class="text-success"><i class="fa-solid fa-user-check me-1"></i>{{ rev.userName }}</strong>
                  <small class="text-muted d-block">{{ formatDateTime(rev.createdAt) }}</small>
                </div>
                <div class="text-warning fs-5">
                  {{ '★'.repeat(rev.rating) }}{{ '☆'.repeat(5 - rev.rating) }}
                  <span class="badge bg-warning text-dark ms-1">{{ rev.rating }}/5</span>
                </div>
              </div>
              <p class="mb-0">{{ rev.comment }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-muted mb-0">Još uvek nema recenzija za ovu biljku.</p>
      </div>
    </div>

    <div v-if="details.other && details.other.length > 0">
      <h4 class="fw-bold text-success mb-3">
        <i class="fa-solid fa-seedling me-2"></i>Slične biljke iz iste kategorije ili sezone
      </h4>
      <div class="row g-3">
        <div class="col-12 col-sm-6 col-md-4 col-lg-2" v-for="otherPlant in details.other" :key="otherPlant.id">
          <div class="card h-100 text-center shadow-sm border-success-subtle">
            <img :src="otherPlant.imageUrl" class="card-img-top p-2" style="height: 120px; object-fit: contain;" :alt="otherPlant.name">
            <div class="card-body p-2 d-flex flex-column justify-content-between">
              <div>
                <h6 class="fw-bold mb-1">{{ otherPlant.name }}</h6>
                <small class="text-success fw-semibold d-block mb-2">{{ otherPlant.price }},00 RSD</small>
              </div>
              <div class="btn-group w-100">
                <RouterLink :to="`/details/${otherPlant.id}`" class="btn btn-sm btn-outline-success" title="Detalji">
                  <i class="fa-solid fa-circle-info"></i>
                </RouterLink>
                <RouterLink :to="`/order/${otherPlant.id}`" class="btn btn-sm btn-success" title="Rezerviši">
                  <i class="fa-solid fa-cart-plus"></i>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
