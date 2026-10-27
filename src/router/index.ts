import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import CartView from '@/views/CartView.vue'
import DetailsView from '@/views/DetailsView.vue'
import UserView from '@/views/UserView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import OrderView from '@/views/OrderView.vue'
import SaleView from '@/views/SaleView.vue'
import SeasonView from '@/views/SeasonView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
      meta: { title: 'Početna' }
    },
    {
      path: '/about',
      component: AboutView,
      meta: { title: 'O nama' }
    },
    {
      path: '/cart',
      component: CartView,
      meta: { title: 'Korpa rezervacija' }
    },
    {
      path: '/details/:id',
      component: DetailsView,
      meta: { title: 'Detalji biljke' }
    },
    {
      path: '/order/:id',
      component: OrderView,
      meta: { title: 'Rezervacija biljke' }
    },
    {
      path: '/user',
      component: UserView,
      meta: { title: 'Moj profil' }
    },
    {
      path: '/login',
      component: LoginView,
      meta: { title: 'Prijava' }
    },
    {
      path: '/signup',
      component: SignupView,
      meta: { title: 'Registracija' }
    },
    {
      path: '/sale',
      component: SaleView,
      meta: { title: 'Akcijska ponuda' }
    },
    {
      path: '/season',
      component: SeasonView,
      meta: { title: 'Sezonske biljke' }
    },
  ],
})

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} :: Prodavnica Biljaka`
  }
})

export default router
