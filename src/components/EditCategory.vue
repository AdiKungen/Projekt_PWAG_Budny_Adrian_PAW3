<template>
  <div class="d-flex flex-column min-vw-100 min-vh-100 bg-secondary p-0">
    <AppNavbar />
    
    <div class="container-fluid text-white p-4 flex-grow-1">
      <h3 class="mb-4">Zarządzaj kategoriami</h3>

      <div class="card bg-dark text-white mb-4 p-3 col-md-6">
        <form @submit.prevent="addCategory">
          <div class="mb-3">
            <label for="categoryName" class="form-label">Nazwa nowej kategorii:</label>
            <input 
              type="text" 
              v-model="newCategoryName" 
              class="form-control" 
              id="categoryName" 
              placeholder="np. Laptopy, Akcesoria..." 
              required
            />
          </div>
          <button type="submit" class="btn btn-primary">Dodaj kategorię</button>
        </form>
      </div>
      
      <h4 class="mb-3">Lista kategorii:</h4>
      <div class="table-responsive col-md-8">
        <table class="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th class="text-end" style="width: 200px;">Akcje</th>
            </tr>
          </thead>
          <tbody class="table-group-divider" style="border-top-color: white">
            <tr v-for="category in categories" :key="category.id">
              <td><strong>{{ category.name }}</strong></td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button type="button" @click="editCategory(category.id, category.name)" class="btn btn-warning">
                    Edytuj
                  </button>
                  <button type="button" @click="deleteCategory(category.id)" class="btn btn-danger">
                    Usuń
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="2" class="text-center text-muted py-3">Brak zdefiniowanych kategorii.</td>
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
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import AppNavbar from './AppNavbar.vue';
import AppFooter from './AppFooter.vue';

export default {
  name: 'EditCategory',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      newCategoryName: '',
      categories: []
    };
  },
  methods: {
    async fetchCategories() {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        this.categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        alert('Błąd podczas pobierania kategorii');
      }
    },
    async addCategory() {
      if (!this.newCategoryName.trim()) return;
      try {
        const docRef = await addDoc(collection(db, 'categories'), { name: this.newCategoryName.trim() });
        this.categories.push({ id: docRef.id, name: this.newCategoryName.trim() });
        this.newCategoryName = '';
      } catch (error) {
        alert('Błąd podczas dodawania kategorii');
      }
    },
    async deleteCategory(id) {
      if (!confirm('Czy na pewno chcesz usunąć tę kategorię?')) return;
      try {
        await deleteDoc(doc(db, 'categories', id));
        this.categories = this.categories.filter(category => category.id !== id);
      } catch (error) {
        alert('Błąd podczas usuwania kategorii');
      }
    },
    async editCategory(id, name) {
      const newName = prompt('Edytuj nazwę kategorii:', name);
      if (newName !== null && newName.trim() !== '') {
        try {
          await updateDoc(doc(db, 'categories', id), { name: newName.trim() });
          const index = this.categories.findIndex(category => category.id === id);
          if (index !== -1) {
            this.categories[index].name = newName.trim();
          }
        } catch (error) {
          alert('Błąd podczas aktualizowania kategorii');
        }
      }
    }
  },
  created() {
    this.fetchCategories();
  }
};
</script>