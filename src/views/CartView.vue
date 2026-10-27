<script setup lang="ts">
import InfoCard from '@/components/InfoCard.vue'
import { useLogin } from '@/hooks/login.hook'
import type { OrderModel, OrderStatus } from '@/models/order.model'
import { UserService } from '@/services/user.service'
import { formatDate, getPriceForOrder, showConfirm, showError, showSuccess } from '@/utils'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const validateLogin = useLogin()
const activeUser = ref(UserService.getActiveUser())
const filterStatus = ref<'all' | OrderStatus>('all')

const editingOrder = ref<OrderModel | null>(null)
const editForm = ref({
  quantity: 1,
  potType: 'standard' as 'standard' | 'ceramic' | 'self-watering',
  includeFertilizer: false,
  deliveryNote: ''
})

const ratingOrder = ref<OrderModel | null>(null)
const ratingForm = ref({
  rating: 5,
  comment: ''
})

function refreshUser() {
  activeUser.value = UserService.getActiveUser()
}

const activeOrders = computed(() => {
  if (!activeUser.value) return []
  return activeUser.value.orders.filter(o => o.deletedAt == null)
})

const filteredOrders = computed(() => {
  if (filterStatus.value === 'all') return activeOrders.value
  return activeOrders.value.filter(o => o.status === filterStatus.value)
})

const totalCartPrice = computed(() => {
  return activeOrders.value
    .filter(o => o.status !== 'otkazano')
    .reduce((sum, o) => sum + getPriceForOrder(o), 0)
})

function openEditModal(order: OrderModel) {
  if (order.status !== 'rezervisano') {
    showError('Samo biljke u statusu "rezervisano" mogu da se menjaju!')
    return
  }
  editingOrder.value = order
  editForm.value = {
    quantity: order.quantity,
    potType: order.potType,
    includeFertilizer: order.includeFertilizer,
    deliveryNote: order.deliveryNote
  }
}

function saveOrderChanges() {
  if (!editingOrder.value) return
  UserService.updateOrder(editingOrder.value.orderId, {
    quantity: Math.max(1, editForm.value.quantity),
    potType: editForm.value.potType,
    includeFertilizer: editForm.value.includeFertilizer,
    deliveryNote: editForm.value.deliveryNote
  })
  editingOrder.value = null
  refreshUser()
  showSuccess('Podaci rezervisane biljke su uspešno izmenjeni!')
}

function changeStatus(order: OrderModel, status: OrderStatus) {
  const statusLabels: Record<OrderStatus, string> = {
    rezervisano: 'Rezervisano',
    pristiglo: 'Pristiglo',
    otkazano: 'Otkazano'
  }
  showConfirm(`Promeniti status biljke "${order.plantName}" u "${statusLabels[status]}"?`, () => {
    UserService.changeOrderStatus(order.orderId, status)
    refreshUser()
    showSuccess(`Status biljke je promenjen u "${statusLabels[status]}".`)
  })
}

function deleteArrivedOrder(order: OrderModel) {
  if (order.status !== 'pristiglo') {
    showError('Brisanje iz korpe je dozvoljeno samo za biljke koje se nalaze u statusu "pristiglo"!')
    return
  }
  showConfirm(`Obrisati pristiglu biljku "${order.plantName}" iz korpe?`, () => {
    UserService.removeOrder(order.orderId)
    refreshUser()
    showSuccess('Biljka u statusu "pristiglo" je obrisana iz korpe.')
  })
}

function openRatingModal(order: OrderModel) {
  if (order.status !== 'pristiglo') {
    showError('Ocenjivanje je moguće samo za biljke u statusu "pristiglo"!')
    return
  }
  ratingOrder.value = order
  ratingForm.value = {
    rating: order.rating ?? 5,
    comment: order.reviewComment ?? ''
  }
}

function submitRating() {
  if (!ratingOrder.value) return
  UserService.rateOrder(ratingOrder.value.orderId, ratingForm.value.rating, ratingForm.value.comment)
  ratingOrder.value = null
  refreshUser()
  showSuccess('Vaša ocena i recenzija su uspešno sačuvane!')
}

function markAllArrived() {
  showConfirm('Potvrditi prijem i prebaciti sve rezervisane biljke u status "pristiglo"?', () => {
    UserService.markAllReservedAsArrived()
    refreshUser()
    showSuccess('Sve rezervisane biljke sada imaju status "pristiglo" i možete ih oceniti ili obrisati!')
  })
}

onMounted(() => {
  validateLogin()
})
</script>

<template>
  <div class="my-4" v-if="activeUser">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
      <div>
        <h2 class="fw-bold text-success mb-1">
          <i class="fa-solid fa-basket-shopping me-2"></i>Korpa rezervacija
        </h2>
        <p class="text-body-secondary mb-0 small">
          Pravila: Biljke u statusu <strong>rezervisano</strong> možete menjati ili otkazati. Biljke u statusu
          <strong>pristiglo</strong> možete oceniti (1–5 ★) i brisati iz korpe.
        </p>
      </div>

      <div class="btn-group">
        <button class="btn btn-sm" :class="filterStatus === 'all' ? 'btn-success' : 'btn-outline-success'"
          @click="filterStatus = 'all'">Sve ({{ activeOrders.length }})</button>
        <button class="btn btn-sm" :class="filterStatus === 'rezervisano' ? 'btn-success' : 'btn-outline-success'"
          @click="filterStatus = 'rezervisano'">Rezervisano</button>
        <button class="btn btn-sm" :class="filterStatus === 'pristiglo' ? 'btn-success' : 'btn-outline-success'"
          @click="filterStatus = 'pristiglo'">Pristiglo</button>
        <button class="btn btn-sm" :class="filterStatus === 'otkazano' ? 'btn-success' : 'btn-outline-success'"
          @click="filterStatus = 'otkazano'">Otkazano</button>
      </div>
    </div>

    <div class="card shadow-sm border-success-subtle mb-4" v-if="filteredOrders.length > 0">
      <div class="card-body table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-success">
            <tr>
              <th>Biljka</th>
              <th>Tip i ciljna grupa</th>
              <th>Proizvedeno</th>
              <th>Opcije i količina</th>
              <th>Ukupna cena</th>
              <th>Status</th>
              <th>Vaša ocena</th>
              <th class="text-end">Akcije</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ord in filteredOrders" :key="ord.orderId">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <img :src="ord.imageUrl" :alt="ord.plantName" width="48" height="48" class="rounded border p-1">
                  <div>
                    <RouterLink :to="`/details/${ord.plantId}`" class="fw-bold text-success text-decoration-none">
                      {{ ord.plantName }}
                    </RouterLink>
                    <small class="d-block text-muted fst-italic">{{ ord.latinName }}</small>
                  </div>
                </div>
              </td>
              <td class="small">
                <div>{{ ord.plantType }}</div>
                <span class="text-muted">Grupa: {{ ord.targetAudience }}</span>
              </td>
              <td class="small">{{ formatDate(ord.productionDate) }}</td>
              <td class="small">
                <div><strong>Količina:</strong> {{ ord.quantity }} kom.</div>
                <div>
                  <strong>Saksija:</strong>
                  <span v-if="ord.potType === 'standard'">Standardna</span>
                  <span v-else-if="ord.potType === 'ceramic'">Keramička (+450)</span>
                  <span v-else>Samozalivajuća (+750)</span>
                </div>
                <div v-if="ord.includeFertilizer" class="text-success">
                  <i class="fa-solid fa-check me-1"></i>Sa prihranom (+250)
                </div>
                <div v-if="ord.deliveryNote" class="text-muted fst-italic">
                  "{{ ord.deliveryNote }}"
                </div>
              </td>
              <td class="fw-bold text-success">{{ getPriceForOrder(ord) }},00 RSD</td>
              <td>
                <span v-if="ord.status === 'rezervisano'" class="badge bg-warning text-dark">
                  <i class="fa-regular fa-clock me-1"></i>rezervisano
                </span>
                <span v-else-if="ord.status === 'pristiglo'" class="badge bg-success">
                  <i class="fa-solid fa-truck-fast me-1"></i>pristiglo
                </span>
                <span v-else class="badge bg-secondary">
                  <i class="fa-solid fa-ban me-1"></i>otkazano
                </span>
              </td>
              <td>
                <div v-if="ord.status === 'pristiglo'">
                  <div v-if="ord.rating" class="text-warning fw-bold">
                    {{ '★'.repeat(ord.rating) }}{{ '☆'.repeat(5 - ord.rating) }} ({{ ord.rating }}/5)
                    <small class="d-block text-muted fw-normal">{{ ord.reviewComment }}</small>
                  </div>
                  <button v-else class="btn btn-sm btn-outline-warning text-dark" @click="openRatingModal(ord)">
                    <i class="fa-regular fa-star me-1"></i>Oceni biljku
                  </button>
                </div>
                <small v-else class="text-muted">Dostupno kad pristigne</small>
              </td>
              <td class="text-end">
                <div class="btn-group">
                  <!-- Izmena podataka dozvoljena samo u statusu 'rezervisano' -->
                  <button v-if="ord.status === 'rezervisano'" type="button" class="btn btn-sm btn-outline-primary"
                    title="Izmeni podatke rezervacije" @click="openEditModal(ord)">
                    <i class="fa-solid fa-pen-to-square"></i> Izmeni
                  </button>

                  <!-- Simulacija prelaska u 'pristiglo' -->
                  <button v-if="ord.status === 'rezervisano'" type="button" class="btn btn-sm btn-outline-success"
                    title="Označi kao pristiglo" @click="changeStatus(ord, 'pristiglo')">
                    <i class="fa-solid fa-check"></i> Pristiglo
                  </button>

                  <!-- Otkazivanje rezervacije -->
                  <button v-if="ord.status === 'rezervisano'" type="button" class="btn btn-sm btn-outline-secondary"
                    title="Otkaži rezervaciju" @click="changeStatus(ord, 'otkazano')">
                    <i class="fa-solid fa-xmark"></i> Otkaži
                  </button>

                  <!-- Ocenjivanje i Brisanje dozvoljeno samo u statusu 'pristiglo' -->
                  <button v-if="ord.status === 'pristiglo'" type="button" class="btn btn-sm btn-outline-warning text-dark"
                    title="Izmeni ocenu" @click="openRatingModal(ord)">
                    <i class="fa-solid fa-star"></i>
                  </button>

                  <button v-if="ord.status === 'pristiglo'" type="button" class="btn btn-sm btn-danger"
                    title="Obriši pristiglu biljku iz korpe" @click="deleteArrivedOrder(ord)">
                    <i class="fa-solid fa-trash-can"></i> Obriši
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card-footer d-flex flex-wrap justify-content-between align-items-center gap-3 py-3">
        <div>
          <span class="text-muted me-2">Ukupna cena aktivnih rezervacija (rezervisano + pristiglo):</span>
          <span class="fs-4 fw-bold text-success">{{ totalCartPrice }},00 RSD</span>
        </div>
        <button v-if="activeOrders.some(o => o.status === 'rezervisano')" type="button" class="btn btn-success fw-bold"
          @click="markAllArrived">
          <i class="fa-solid fa-box-open me-2"></i> Potvrdi prijem svih rezervisanih biljaka (status: Pristiglo)
        </button>
      </div>
    </div>

    <InfoCard title="Korpa je prazna" v-else>
      <p class="mb-3">Trenutno nemate nijednu biljku u izabranom statusu.</p>
      <RouterLink to="/" class="btn btn-success">
        <i class="fa-solid fa-seedling me-1"></i> Pregledaj katalog biljaka
      </RouterLink>
    </InfoCard>

    <div v-if="editingOrder" class="modal-backdrop-custom d-flex align-items-center justify-content-center">
      <div class="card shadow-lg border-success" style="max-width: 500px; width: 95%;">
        <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
          <strong><i class="fa-solid fa-pen-to-square me-2"></i>Izmena rezervacije: {{ editingOrder.plantName }}</strong>
          <button type="button" class="btn-close btn-close-white" @click="editingOrder = null"></button>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label fw-semibold">Količina:</label>
            <input type="number" class="form-control" min="1" v-model.number="editForm.quantity">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Tip saksije:</label>
            <select class="form-select" v-model="editForm.potType">
              <option value="standard">Standardna saksija (+0 RSD)</option>
              <option value="ceramic">Keramička saksija (+450 RSD)</option>
              <option value="self-watering">Samozalivajuća saksija (+750 RSD)</option>
            </select>
          </div>
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="editFert" v-model="editForm.includeFertilizer">
            <label class="form-check-label" for="editFert">Uključi prihranu (+250 RSD)</label>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Napomena:</label>
            <textarea class="form-control" rows="2" v-model="editForm.deliveryNote"></textarea>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-end gap-2">
          <button class="btn btn-secondary" @click="editingOrder = null">Otkaži</button>
          <button class="btn btn-success" @click="saveOrderChanges">Sačuvaj izmene</button>
        </div>
      </div>
    </div>

    <div v-if="ratingOrder" class="modal-backdrop-custom d-flex align-items-center justify-content-center">
      <div class="card shadow-lg border-warning" style="max-width: 480px; width: 95%;">
        <div class="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
          <strong><i class="fa-solid fa-star me-2"></i>Ocenite pristiglu biljku: {{ ratingOrder.plantName }}</strong>
          <button type="button" class="btn-close" @click="ratingOrder = null"></button>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label fw-semibold">Izaberite ocenu (1 do 5):</label>
            <select class="form-select" v-model.number="ratingForm.rating">
              <option :value="5">★★★★★ (5 - Odlično)</option>
              <option :value="4">★★★★☆ (4 - Veoma dobro)</option>
              <option :value="3">★★★☆☆ (3 - Dobro)</option>
              <option :value="2">★★☆☆☆ (2 - Loše)</option>
              <option :value="1">★☆☆☆☆ (1 - Veoma loše)</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Komentar / Recenzija:</label>
            <textarea class="form-control" rows="3" placeholder="Napišite vaše utiske o sadnici..."
              v-model="ratingForm.comment"></textarea>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-end gap-2">
          <button class="btn btn-secondary" @click="ratingOrder = null">Zatvori</button>
          <button class="btn btn-success" @click="submitRating">Potvrdi ocenu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1060;
}
</style>
