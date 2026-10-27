<script setup lang="ts">
import { PlantsService } from '@/services/plants.service'
import { UserService } from '@/services/user.service'
import { showError, showSuccess } from '@/utils'
import { onMounted, reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()
const plantTypes = ref<string[]>([])

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  favoritePlantType: '',
  password: '',
  confirmPassword: ''
})

onMounted(() => {
  PlantsService.getPlantTypes().then(types => {
    plantTypes.value = types
    form.favoritePlantType = types[0] ?? 'Sobne biljke'
  })
})

function signup() {
  if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.address || !form.favoritePlantType) {
    showError('Sva polja profila su obavezna prilikom registracije!')
    return
  }

  if (form.password !== form.confirmPassword) {
    showError('Lozinke se ne poklapaju!')
    return
  }

  const err = UserService.createUser({
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    address: form.address,
    favoritePlantType: form.favoritePlantType,
    password: form.password
  })

  if (err == null) {
    showSuccess('Nalog je uspešno kreiran! Sada se možete prijaviti.')
    router.push('/login')
    return
  }

  showError(err)
}
</script>

<template>
  <div class="row auth-row my-4">
    <div class="col-12">
      <div class="card shadow-sm border-success">
        <div class="card-header bg-success text-white fw-bold">
          <i class="fa-solid fa-user-plus me-2"></i>Registracija novog kupca
        </div>
        <div class="card-body p-4">
          <form @submit.prevent="signup">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold">Ime:</label>
                <input type="text" class="form-control border-success" v-model="form.firstName" placeholder="npr. Petar" required>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold">Prezime:</label>
                <input type="text" class="form-control border-success" v-model="form.lastName" placeholder="npr. Petrovic" required>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold">Email adresa:</label>
                <input type="email" class="form-control border-success" v-model="form.email" placeholder="kupac@email.com" required>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold">Broj telefona:</label>
                <input type="tel" class="form-control border-success" v-model="form.phone" placeholder="+381 64 123 4567" required>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold">Adresa za isporuku:</label>
                <input type="text" class="form-control border-success" v-model="form.address" placeholder="Ulica i broj, Grad" required>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold">Omiljena vrsta biljaka:</label>
                <select class="form-select border-success" v-model="form.favoritePlantType" required>
                  <option v-for="t in plantTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold">Lozinka (min. 6 karaktera):</label>
                <input type="password" class="form-control border-success" v-model="form.password" required>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold">Potvrdite lozinku:</label>
                <input type="password" class="form-control border-success" v-model="form.confirmPassword" required>
              </div>
            </div>

            <button type="submit" class="btn btn-success w-100 fw-bold mt-4">
              Kreiraj korisnički nalog
            </button>
          </form>

          <hr>
          <div class="text-center small">
            Već imate nalog?
            <RouterLink to="/login" class="text-success fw-bold">Prijavite se</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
