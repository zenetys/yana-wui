import Vue from 'vue'
import VueRouter from 'vue-router'

import ViewEntityChooser from '../views/ViewEntityChooser.vue'
import ViewMain from '../views/ViewMain.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: {
      name: 'ViewEntityChooser'
    }
  },
  {
    path: '/entity-chooser',
    name: 'ViewEntityChooser',
    component: ViewEntityChooser,
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
