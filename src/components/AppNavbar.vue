<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary bg-dark border-bottom border-body" data-bs-theme="dark">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/inventory">System Zarządzania Inwentarzem</router-link>
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav" 
        aria-controls="navbarNav" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item" v-if="isAdmin">
            <router-link class="nav-link" to="/manage-users">Zarządzaj użytkownikami</router-link>
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link class="nav-link" to="/categories">Zarządzaj kategoriami</router-link>
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link class="nav-link" to="/sources">Zarządzaj źródłami</router-link>
          </li>
        </ul>
        <span v-if="currentUser" class="navbar-text text-white me-3">
          Zalogowano jako: {{ currentUser.email }}
        </span>
        <button @click="logout" class="btn btn-danger btn-sm">Wyloguj</button>
      </div>
    </div>
  </nav>
</template>

<script>
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default {
  name: 'AppNavbar',
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('user')) || null,
      isAdmin: false
    };
  },
  created() {
    if (this.currentUser && this.currentUser.role === 'admin') {
      this.isAdmin = true;
    }
  },
  methods: {
    async logout() {
      try {
        await signOut(auth);
      } catch (e) {
        console.error("Błąd podczas wylogowywania:", e);
      }
      localStorage.removeItem('user');
      localStorage.removeItem('jwt');
      this.$router.push('/login');
    }
  }
};
</script>