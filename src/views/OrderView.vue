<script setup lang="ts">
import { useLogin } from '@/hooks/login.hook'
import type { PlantModel } from '@/models/plants.model'
import { PlantsService } from '@/services/plants.service'
import { UserService } from '@/services/user.service'
import { formatDate, getPotExtraPrice, showConfirm, showSuccess } from '@/utils'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const validateLogin = useLogin()
const id = Number(route.params.id)

const plant = ref<PlantModel | null>(null)

const form = reactive({
  quantity: 1,
  potType: 'standard' as 'standard' | 'ceramic' | 'self-watering',
  includeFertilizer: false,
  deliveryNote: ''
})

PlantsService.getPlantDetails(id).then(data => {
  plant.value = data
})

const totalPrice = computed(() => {
  if (!plant.value) return 0
  const potExtra = getPotExtraPrice(form.potType)
  const fertExtra = form.includeFertilizer ? 250 : 0
  return (plant.value.price + potExtra + fertExtra) * Math.max(1, form.quantity)
})

function submitReservation() {
  if (!validateLogin() || !plant.value) return

  showConfirm(`Da li želite da rezervišete biljku "${plant.value.name}"?`, () => {
    UserService.addOrder({
      orderId: `ORD-${Date.now()}`,
      plantId: plant.value!.id,
      plantName: plant.value!.name,
      latinName: plant.value!.latin_name,
      plantType: `${plant.value!.plant_type} (${plant.value!.category})`,
      intendedUse: plant.value!.intended_use,
      targetAudience: plant.value!.target_audience,
      productionDate: plant.value!.production_date,
      imageUrl: plant.value!.imageUrl,
      quantity: Math.max(1, form.quantity),
      potType: form.potType,
      includeFertilizer: form.includeFertilizer,
      deliveryNote: form.deliveryNote,
      pricePerUnit: plant.value!.price,
      status: 'rezervisano',
      rating: null,
      reviewComment: null,
      createdAt: new Date().toISOString(),
      paidAt: null,
      deletedAt: null
    })

    showSuccess(`Biljka "${plant.value!.name}" je uspešno rezervisana i dodata u vašu Korpu rezervacija!`)
    router.push('/cart')
  })
}

onMounted(() => {
  validateLogin()
})
</script>

<template>
  <div class="row my-4" v-if="plant">
    <div class="col-12 col-md-5 mb-3">
      <div class="card h-100 shadow-sm border-success-subtle text-center p-4">
        <img class="img-fluid mx-auto mb-3" style="max-height: 245px;" :src="plant.imageUrl" :alt="plant.name" />
        <h4 class="fw-bold text-success">{{ plant.name }}</h4>
        <p class="text-muted fst-italic mb-2">{{ plant.latin_name }}</p>
        <p class="small text-body-secondary">{{ plant.description }}</p>
        <div class="mt-auto pt-3 border-top text-start small">
          <div><strong>Tip:</strong> {{ plant.plant_type }} | {{ plant.season }}</div>
          <div><strong>Ciljna grupa:</strong> {{ plant.target_audience }}</div>
          <div><strong>Proizvedeno:</strong> {{ formatDate(plant.production_date) }}</div>
          <div><strong>Osnovna cena:</strong> {{ plant.price }},00 RSD</div>
        </div>
      </div>
    </div>

    <div class="col-12 col-md-7 mb-3">
      <div class="card shadow-sm border-success">
        <div class="card-header bg-success text-white fw-bold">
          <i class="fa-solid fa-calendar-check me-2"></i>Rezervacija biljke — {{ plant.name }}
        </div>
        <div class="card-body p-4">
          <div class="mb-3">
            <label class="form-label fw-semibold">Izaberite tip saksije:</label>
            <select class="form-select border-success" v-model="form.potType">
              <option value="standard">Standardna transportna saksija (+0 RSD)</option>
              <option value="ceramic">Keramička ukrasna saksija (+450 RSD po sadnici)</option>
              <option value="self-watering">Samozalivajuća pametna saksija (+750 RSD po sadnici)</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Količina sadnica:</label>
            <input type="number" class="form-control border-success" min="1" :max="plant.stock_quantity"
              v-model.number="form.quantity">
          </div>

          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="fertilizerCheck" v-model="form.includeFertilizer">
            <label class="form-check-label" for="fertilizerCheck">
              Dodaj organsku prihranu / đubrivo za sadnju (+250 RSD po sadnici)
            </label>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Napomena za pripremu / isporuku (opciono):</label>
            <textarea class="form-control border-success" rows="2"
              placeholder="Unesite posebne zahteve..." v-model="form.deliveryNote"></textarea>
          </div>

          <div class="alert alert-success d-flex justify-content-between align-items-center mb-0">
            <span class="fw-semibold">Ukupna cena rezervacije:</span>
            <span class="fs-4 fw-bold">{{ totalPrice }},00 RSD</span>
          </div>
        </div>

        <div class="card-footer d-flex justify-content-between">
          <RouterLink :to="`/details/${plant.id}`" class="btn btn-outline-secondary">
            Nazad na detalje
          </RouterLink>
          <button type="button" class="btn btn-success fw-bold px-4" @click="submitReservation">
            <i class="fa-solid fa-cart-shopping me-2"></i> Potvrdi rezervaciju i dodaj u korpu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
