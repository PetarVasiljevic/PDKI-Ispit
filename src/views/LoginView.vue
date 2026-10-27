<script setup lang="ts">
import { UserService } from '@/services/user.service'
import { showError } from '@/utils'
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const email = ref<string>('')
const password = ref<string>('')
const router = useRouter()

function login() {
  if (UserService.login(email.value, password.value)) {
    const to = sessionStorage.getItem('to')
    sessionStorage.removeItem('to')
    router.push(to ?? '/user')
    return
  }

  showError('Pogrešna email adresa ili lozinka! (Demo nalog: user@example.com / user1234)')
}
</script>

<template>
  <div class="row auth-row my-5">
    <div class="col-12 col-md-5 d-flex flex-column justify-content-center align-items-center bg-success bg-opacity-10 rounded-start p-4 border border-end-0 border-success-subtle">
      <img src="../assets/logo_prodavnica_biljaka.png" class="img-fluid mb-3" style="max-width: 160px;" alt="Logo">
      <h5 class="fw-bold text-success text-center">Digitalna Prodavnica Biljaka</h5>
      <p class="small text-muted text-center mb-0">
        Prijavite se kako biste rezervisali biljke, pristupili korpi rezervacija i ocenili pristigle sadnice.
      </p>
    </div>

    <div class="col-12 col-md-7 p-0">
      <div class="card h-100 border-success-subtle rounded-start-0 shadow-sm">
        <div class="card-header bg-success text-white fw-bold">
          <i class="fa-solid fa-right-to-bracket me-2"></i>Prijava korisnika
        </div>
        <div class="card-body p-4">
          <form @submit.prevent="login">
            <div class="mb-3">
              <label for="loginEmail" class="form-label fw-semibold">Email adresa:</label>
              <input type="email" class="form-control border-success" id="loginEmail"
                placeholder="primer: user@example.com" v-model="email" required>
            </div>
            <div class="mb-3">
              <label for="loginPassword" class="form-label fw-semibold">Lozinka:</label>
              <input type="password" class="form-control border-success" id="loginPassword"
                placeholder="Unesite lozinku (npr. user1234)" v-model="password" required>
            </div>
            <button type="submit" class="btn btn-success w-100 fw-bold">
              Uloguj se
            </button>
          </form>

          <hr>
          <div class="text-center small">
            Nemate nalog?
            <RouterLink to="/signup" class="text-success fw-bold">Registrujte se ovde</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
