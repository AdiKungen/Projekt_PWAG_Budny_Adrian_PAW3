<template>
  <div class="d-flex flex-column min-vw-100 min-vh-100 bg-secondary p-0">
    <AppNavbar />

    <div class="container-fluid text-white p-4 flex-grow-1">
      <h3 class="mb-4">Rejestracja nowego użytkownika</h3>

      <div class="card bg-dark text-white p-4 col-md-6 shadow">
        <form @submit.prevent="registerUser">
          <div class="mb-3">
            <label for="email" class="form-label">Adres email</label>
            <input 
              type="email" 
              class="form-control" 
              id="email" 
              v-model="email" 
              placeholder="uzytkownik@domena.pl" 
              required
            />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Hasło (min. 6 znaków)</label>
            <input 
              type="password" 
              class="form-control" 
              id="password" 
              v-model="password" 
              required
            />
          </div>
          <div class="mb-3">
            <label for="role" class="form-label">Rola systemowa</label>
            <select id="role" v-model="role" class="form-select">
              <option value="user">User (Tylko odczyt)</option>
              <option value="admin">Admin (Pełny dostęp)</option>
            </select>
          </div>
          <div class="mt-4">
            <button type="submit" class="btn btn-primary me-2">Zarejestruj</button>
            <router-link to="/manage-users" class="btn btn-outline-light">Powrót do listy</router-link>
          </div>

          <div v-if="errorMessage" class="alert alert-danger mt-3 mb-0">{{ errorMessage }}</div>
          <div v-if="successMessage" class="alert alert-success mt-3 mb-0">{{ successMessage }}</div>
        </form>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script>
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import AppNavbar from './AppNavbar.vue';
import AppFooter from './AppFooter.vue';

export default {
  name: 'UserRegister',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      email: '',
      password: '',
      role: 'user',
      successMessage: '',
      errorMessage: ''
    };
  },
  methods: {
    async registerUser() {
      this.successMessage = '';
      this.errorMessage = '';
      
      const adminUser = JSON.parse(localStorage.getItem('user'));

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        
        await setDoc(doc(db, 'user', userCredential.user.uid), {
          email: this.email,
          role: this.role
        });

        if (adminUser) {
          localStorage.setItem('user', JSON.stringify(adminUser));
        }

        this.successMessage = `Użytkownik ${this.email} został pomyślnie zarejestrowany.`;
        this.email = '';
        this.password = '';
        this.role = 'user';
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = 'Podany adres email jest już zajęty.';
        } else if (error.code === 'auth/weak-password') {
          this.errorMessage = 'Hasło musi mieć co najmniej 6 znaków.';
        } else {
          this.errorMessage = 'Wystąpił problem podczas rejestracji użytkownika.';
        }
      }
    }
  }
};
</script>