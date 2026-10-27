<script setup lang="ts">
import { useLogin } from '@/hooks/login.hook'
import { PlantsService } from '@/services/plants.service'
import { UserService } from '@/services/user.service'
import { showConfirm, showError, showSuccess } from '@/utils'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const validateLogin = useLogin()
const router = useRouter()
const user = ref(UserService.getActiveUser())
const plantTypes = ref<string[]>([])

const profileForm = reactive({
  firstName: user.value?.firstName ?? '',
  lastName: user.value?.lastName ?? '',
  phone: user.value?.phone ?? '',
  address: user.value?.address ?? '',
  favoritePlantType: user.value?.favoritePlantType ?? ''
})

const passReset = reactive({
  currentPass: '',
  newPass: '',
  repeatPass: ''
})

onMounted(() => {
  if (!validateLogin()) return
  PlantsService.getPlantTypes().then(types => {
    plantTypes.value = types
  })
})

const reservedCount = computed(() =>
  user.value?.orders.filter(o => o.deletedAt == null && o.status === 'rezervisano').length ?? 0
)

const arrivedCount = computed(() =>
  user.value?.orders.filter(o => o.deletedAt == null && o.status === 'pristiglo').length ?? 0
)

function saveProfile() {
  showConfirm('Da li želite da sačuvate izmene ličnih podataka profila?', () => {
    UserService.updateProfile({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      phone: profileForm.phone,
      address: profileForm.address,
      favoritePlantType: profileForm.favoritePlantType
    })
    user.value = UserService.getActiveUser()
    showSuccess('Podaci profila su uspešno ažurirani!')
  })
}

function changePassword() {
  showConfirm('Da li ste sigurni da želite da promenite lozinku?', () => {
    if (passReset.newPass.length < 6) {
      showError('Nova lozinka mora imati najmanje 6 karaktera!')
      return
    }
    if (passReset.currentPass !== user.value?.password) {
      showError('Trenutna lozinka nije tačna!')
      return
    }
    if (passReset.newPass !== passReset.repeatPass) {
      showError('Nove lozinke se ne poklapaju!')
      return
    }

    UserService.changePassword(passReset.newPass)
    UserService.logout()
    showSuccess('Lozinka je uspešno promenjena! Prijavite se ponovo.')
    router.push('/login')
  })
}
</script>

<template>
  <div class="row my-4" v-if="user">
    <div class="col-12 col-lg-7 mb-4">
      <div class="card h-100 shadow-sm border-success-subtle">
        <div class="card-header bg-success text-white fw-bold d-flex align-items-center justify-content-between">
          <span><i class="fa-solid fa-id-card me-2"></i>Lični profil kupca (izmena podataka)</span>
          <span class="badge bg-light text-success">{{ user.email }}</span>
        </div>

        <div class="card-body p-4">
          <div class="d-flex align-items-center gap-3 mb-4">
            <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=198754&color=ffffff&size=128`"
              alt="Avatar" class="rounded-circle border border-success" width="76" height="76" />
            <div>
              <h4 class="fw-bold mb-1">{{ user.firstName }} {{ user.lastName }}</h4>
              <div class="d-flex flex-wrap gap-2">
                <span class="badge bg-warning text-dark">Rezervisano: {{ reservedCount }}</span>
                <span class="badge bg-success">Pristiglo: {{ arrivedCount }}</span>
              </div>
            </div>
          </div>

          <form @submit.prevent="saveProfile">
            <div class="row g-3">
              <div class="col-12 col-sm-6">
                <label class="form-label fw-semibold">Ime:</label>
                <input type="text" class="form-control border-success" v-model="profileForm.firstName" required>
              </div>
              <div class="col-12 col-sm-6">
                <label class="form-label fw-semibold">Prezime:</label>
                <input type="text" class="form-control border-success" v-model="profileForm.lastName" required>
              </div>
              <div class="col-12 col-sm-6">
                <label class="form-label fw-semibold">Telefon:</label>
                <input type="text" class="form-control border-success" v-model="profileForm.phone" required>
              </div>
              <div class="col-12 col-sm-6">
                <label class="form-label fw-semibold">Adresa:</label>
                <input type="text" class="form-control border-success" v-model="profileForm.address" required>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Omiljena vrsta biljaka:</label>
                <select class="form-select border-success" v-model="profileForm.favoritePlantType">
                  <option v-for="t in plantTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-4">
              <RouterLink to="/cart" class="btn btn-outline-success">
                <i class="fa-solid fa-cart-shopping me-1"></i> Otvori Korpu rezervacija
              </RouterLink>
              <button type="submit" class="btn btn-success fw-bold px-4">
                <i class="fa-solid fa-floppy-disk me-2"></i> Sačuvaj izmene profila
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="col-12 col-lg-5 mb-4">
      <div class="card h-100 shadow-sm border-success-subtle">
        <div class="card-header bg-success text-white fw-bold">
          <i class="fa-solid fa-lock me-2"></i>Podaci za prijavljivanje i promena lozinke
        </div>
        <div class="card-body p-4">
          <form @submit.prevent="changePassword">
            <div class="mb-3">
              <label class="form-label fw-semibold">Email za prijavu:</label>
              <input type="email" class="form-control" :value="user.email" disabled>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Trenutna lozinka:</label>
              <input type="password" class="form-control border-success" v-model="passReset.currentPass" required>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Nova lozinka:</label>
              <input type="password" class="form-control border-success" v-model="passReset.newPass" required>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Potvrdi novu lozinku:</label>
              <input type="password" class="form-control border-success" v-model="passReset.repeatPass" required>
            </div>
            <button type="submit" class="btn btn-success w-100 fw-bold mt-2">
              <i class="fa-solid fa-key me-2"></i> Promeni lozinku
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
