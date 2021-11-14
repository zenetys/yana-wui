import Vue from 'vue'
import VueRouter from 'vue-router'

import ViewMain from '../views/ViewMain.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: {
      name: 'ViewMain'
    }
  },
  {
    path: '/main',
    name: 'ViewMain',
    component: ViewMain,
  },
]

const router = new VueRouter({
  routes
})

export default router
