<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { UserService } from './services/user.service'
import { onMounted, ref, watch, computed } from 'vue'
import { showConfirm } from './utils'

const router = useRouter()
const route = useRoute()

const searchInput = ref<string>('')
const themeSwitch = ref<boolean>(false)
const activeUser = ref(UserService.getActiveUser())

watch(() => route.fullPath, () => {
  activeUser.value = UserService.getActiveUser()
})

const reservedCount = computed(() => {
  if (!activeUser.value) return 0
  return activeUser.value.orders.filter(o => o.deletedAt == null && o.status === 'rezervisano').length
})

watch(themeSwitch, () => {
  const theme = themeSwitch.value ? 'dark' : 'light'
  localStorage.setItem('theme', theme)
  document.body.setAttribute('data-bs-theme', theme)
})

function search() {
  router.push({
    path: '/',
    query: {
      ...route.query,
      search: searchInput.value.trim() || undefined
    }
  })
}

function toggleFiltersOnHome() {
  router.push({
    path: '/',
    query: {
      ...route.query,
      filters: route.query.filters === '1' ? undefined : '1'
    }
  })
}

function logout() {
  showConfirm('Da li ste sigurni da želite da se odjavite?', () => {
    UserService.logout()
    activeUser.value = null
    router.push('/login')
  })
}

onMounted(() => {
  const theme = localStorage.getItem('theme') ?? 'light'
  document.body.setAttribute('data-bs-theme', theme)
  themeSwitch.value = theme === 'dark'
})
</script>

<template>
  <nav class="navbar navbar-expand-lg mb-2 shadow-sm bg-body-tertiary">
    <div class="container-fluid px-4">
      <RouterLink class="navbar-brand d-flex align-items-center gap-2" to="/">
        <img src="../src/assets/logo_prodavnica_biljaka.png"
          style="max-height: 70px; width: auto;" alt="Logo Prodavnice Biljaka">
        <span class="fw-bold text-success d-none d-sm-inline">Digitalna Prodavnica Biljaka</span>
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse w-100" id="navbarSupportedContent">
        <form class="d-flex mx-auto my-2 my-lg-0 custom-search-form" role="search"
          style="max-width: 600px; width: 100%;" @submit.prevent="search">
          <input class="form-control rounded-pill px-3 shadow-none border-success" type="search"
            placeholder="Pretražite ime biljke (npr. monstera, kaktus...)" aria-label="Search"
            v-model="searchInput" />
          <button class="btn btn-success rounded-pill px-4 ms-2" type="submit">Pretraži</button>
        </form>

        <ul class="navbar-nav mb-2 mb-lg-0 align-items-lg-center">
          <li class="nav-item">
            <RouterLink class="nav-link fs-6 ms-2 fw-semibold text-success" to="/">
              <i class="fa-solid fa-house"></i> Početna
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link fs-6 ms-2 fw-semibold text-success" to="/sale">
              <i class="fa-solid fa-tags"></i> Akcije
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link fs-6 ms-2 fw-semibold text-success" to="/season">
              <i class="fa-brands fa-canadian-maple-leaf"></i> Sezonsko
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link fs-6 ms-2 fw-semibold text-success position-relative" to="/cart">
              <i class="fa-solid fa-cart-shopping"></i> Korpa
              <span v-if="reservedCount > 0"
                class="badge rounded-pill bg-danger ms-1">
                {{ reservedCount }}
              </span>
            </RouterLink>
          </li>

          <template v-if="activeUser">
            <li class="nav-item">
              <RouterLink class="nav-link fs-6 ms-2 fw-semibold text-success" to="/user">
                <i class="fa-solid fa-user-check"></i> {{ activeUser.firstName }}
              </RouterLink>
            </li>
            <li class="nav-item">
              <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="logout">
                <i class="fa-solid fa-right-from-bracket"></i> Odjava
              </button>
            </li>
          </template>

          <template v-else>
            <li class="nav-item">
              <RouterLink class="nav-link fs-6 ms-2 fw-semibold text-success" to="/login">
                <i class="fa-regular fa-user"></i> Prijava
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link fs-6 ms-2 fw-semibold text-success" to="/signup">
                <i class="fa-solid fa-user-plus"></i> Registracija
              </RouterLink>
            </li>
          </template>

          <li class="nav-item">
            <RouterLink class="nav-link fs-6 ms-2 fw-semibold text-success" to="/about">
              <i class="fa-solid fa-circle-info"></i> O nama
            </RouterLink>
          </li>

          <li class="nav-item ms-3 d-flex align-items-center">
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" role="switch" id="themeSwitchCheck"
                v-model="themeSwitch" />
              <label class="form-check-label text-success" for="themeSwitchCheck" title="Promeni temu">
                <i class="fa-solid fa-moon"></i>
              </label>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container pb-5">
    <RouterView :key="$route.fullPath" />
  </div>
</template>
