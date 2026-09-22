<template>
  <div class="d-flex flex-column min-vw-100 min-vh-100 bg-secondary p-0">
    <AppNavbar />

    <div class="container-fluid text-white p-4 flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3>Zarządzanie użytkownikami</h3>
        <router-link to="/register" class="btn btn-primary">
          + Dodaj użytkownika
        </router-link>
      </div>

      <div class="table-responsive col-md-10">
        <table class="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>Adres Email</th>
              <th style="width: 180px;">Rola</th>
              <th class="text-end" style="width: 220px;">Akcje</th>
            </tr>
          </thead>
          <tbody class="table-group-divider" style="border-top-color: white">
            <tr v-for="user in users" :key="user.id">
              <td><strong>{{ user.email }}</strong></td>
              <td>
                <select v-model="user.role" class="form-select form-select-sm bg-secondary text-white border-0">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button type="button" class="btn btn-warning" @click="updateUserRole(user)">
                    Zapisz rolę
                  </button>
                  <button type="button" class="btn btn-danger" @click="deleteUser(user.id)">
                    Usuń
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="3" class="text-center text-muted py-3">Brak zarejestrowanych użytkowników.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script>
import { db } from '../firebase';
import { getDocs, updateDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import AppNavbar from './AppNavbar.vue';
import AppFooter from './AppFooter.vue';

export default {
  name: 'UserManagement',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      users: []
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, 'user'));
        this.users = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      } catch (error) {
        alert('Błąd podczas pobierania użytkowników');
      }
    },
    async updateUserRole(user) {
      try {
        await updateDoc(doc(db, 'user', user.id), { role: user.role });
        alert('Rola użytkownika została zaktualizowana.');
      } catch (error) {
        alert('Błąd podczas aktualizowania roli użytkownika');
      }
    },
    async deleteUser(userId) {
      if (!confirm('Czy na pewno chcesz usunąć tego użytkownika z bazy?')) return;
      try {
        await deleteDoc(doc(db, 'user', userId));
        this.users = this.users.filter(user => user.id !== userId);
        alert('Użytkownik został usunięty.');
      } catch (error) {
        alert('Błąd podczas usuwania użytkownika');
      }
    }
  },
  created() {
    this.fetchUsers();
  }
};
</script>