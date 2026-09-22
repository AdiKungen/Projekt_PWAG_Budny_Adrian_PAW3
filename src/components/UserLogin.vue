<template>
  <div class="d-flex flex-column min-vw-100 min-vh-100 bg-secondary p-0">
    <nav class="navbar navbar-dark bg-dark border-bottom border-body">
      <div class="container-fluid">
        <span class="navbar-brand mb-0 h1">System Zarządzania Inwentarzem</span>
      </div>
    </nav>

    <div class="container flex-grow-1 d-flex justify-content-center align-items-center py-4">
      <div class="card bg-dark text-white p-4 shadow" style="max-width: 420px; width: 100%;">
        <h3 class="card-title text-center mb-4">Logowanie</h3>
        <form @submit.prevent="login">
          <div class="mb-3">
            <label for="email" class="form-label">Adres email</label>
            <input 
              type="email" 
              class="form-control" 
              id="email" 
              v-model="email" 
              placeholder="np. admin@test.pl" 
              required
            />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Hasło</label>
            <input 
              type="password" 
              class="form-control" 
              id="password" 
              v-model="password" 
              required
            />
          </div>
          <button type="submit" class="btn btn-primary w-100 mt-2" :disabled="loading">
            {{ loading ? 'Logowanie...' : 'Zaloguj się' }}
          </button>
          
          <div v-if="errorMessage" class="alert alert-danger mt-3 mb-0 py-2 text-center">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script>
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AppFooter from './AppFooter.vue';

export default {
  name: 'UserLogin',
  components: {
    AppFooter
  },
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      loading: false
    };
  },
  methods: {
    async login() {
      this.errorMessage = '';
      this.loading = true;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        const token = await user.getIdToken();
        localStorage.setItem('jwt', token);

        const userDoc = await getDoc(doc(db, "user", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : { role: 'user' };

        localStorage.setItem('user', JSON.stringify({ 
          email: user.email, 
          role: userData.role || 'user' 
        }));
        
        this.$router.push('/inventory');
      } catch (error) {
        this.errorMessage = 'Niepoprawny email lub hasło.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>