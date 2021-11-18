import Vue from 'vue'
import VueRouter from 'vue-router'

import ViewEntityChooser from '../views/ViewEntityChooser.vue'
import ViewInventory from '../views/ViewInventory.vue'
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
    redirect: {
      name: 'ViewInventory',
    },
    children: [
      {
        path: 'inventory',
        name: 'ViewInventory',
        component: ViewInventory,
      },
    ]
  },
]

const router = new VueRouter({
  routes
})

export default router
