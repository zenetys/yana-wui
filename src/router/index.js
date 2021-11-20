import Vue from 'vue'
import VueRouter from 'vue-router'

import ViewEntityChooser from '../views/ViewEntityChooser.vue'
import ViewHost from '../views/ViewHost.vue'
import ViewInventory from '../views/ViewInventory.vue'
import ViewMain from '../views/ViewMain.vue'
import ViewOui from '../views/ViewOui.vue'
import ViewSwitch from '../views/ViewSwitch.vue'

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
        children: [
          {
            path: 'host/:id',
            name: 'ViewHost',
            component: ViewHost,
          },
          {
            path: 'switch/:id',
            name: 'ViewSwitch',
            component: ViewSwitch,
          },
        ],
      },
      {
        path: 'oui',
        name: 'ViewOui',
        component: ViewOui,
      },
    ]
  },
]

const router = new VueRouter({
  routes
})

export default router
