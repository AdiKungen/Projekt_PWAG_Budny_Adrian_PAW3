import { createRouter, createWebHistory } from 'vue-router';
import UserLogin from '../components/UserLogin.vue';
import ShopInventory from '../components/ShopInventory.vue';
import UserRegister from '../components/UserRegister.vue';
import EditItem from '../components/EditItem.vue';
import UserManagement from '../components/UserManagement.vue';
import AddItem from '../components/AddItem.vue';
import EditSource from '../components/EditSource.vue';
import EditCategory from '../components/EditCategory.vue';

const routes = [
  { path: '/login', component: UserLogin },
  { path: '/inventory', component: ShopInventory, meta: { requiresAuth: true } },
  { path: '/register', component: UserRegister, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/edit/:id', name: 'EditItem', component: EditItem, meta: {requiresAuth: true, adminOnly: true } },
  { path: '/add', name: 'AddItem', component: AddItem, meta: { requiresAuth: true, adminOnly: true  } },
  { path: '/manage-users', component: UserManagement, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/sources', component: EditSource, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/categories', component: EditCategory, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/', redirect: '/inventory' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!user) {
      next('/login');
    } else {
      if (to.matched.some(record => record.meta.adminOnly)) {
        if (user.role !== 'admin') {
          next('/inventory');
        } else {
          next();
        }
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;