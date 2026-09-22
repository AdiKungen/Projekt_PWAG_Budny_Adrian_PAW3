<template>
  <div class="d-flex flex-column min-vw-100 min-vh-100 bg-secondary p-0">
    <AppNavbar />

    <div class="container-fluid text-white p-4 flex-grow-1"> 
      <h3 class="mb-4">Zarządzaj źródłami</h3>

      <div class="card bg-dark text-white mb-4 p-3 col-md-6">
        <form @submit.prevent="addSource">
          <div class="mb-3">
            <label for="sourceName" class="form-label">Nazwa nowego źródła:</label>
            <input 
              type="text" 
              v-model="newSourceName" 
              class="form-control" 
              id="sourceName" 
              placeholder="np. Hurtownia ABC, Zakup własny..." 
              required
            />
          </div>
          <button type="submit" class="btn btn-primary">Dodaj źródło</button>
        </form>
      </div>
      
      <h4 class="mb-3">Lista źródeł:</h4>
      <div class="table-responsive col-md-8">
        <table class="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th class="text-end" style="width: 200px;">Akcje</th>
            </tr>
          </thead>
          <tbody class="table-group-divider" style="border-top-color: white">
            <tr v-for="source in sources" :key="source.id">
              <td><strong>{{ source.name }}</strong></td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button type="button" @click="editSource(source.id, source.name)" class="btn btn-warning">
                    Edytuj
                  </button>
                  <button type="button" @click="deleteSource(source.id)" class="btn btn-danger">
                    Usuń
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="sources.length === 0">
              <td colspan="2" class="text-center text-muted py-3">Brak zdefiniowanych źródeł.</td>
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
  name: 'EditSource',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      newSourceName: '',
      sources: []
    };
  },
  methods: {
    async fetchSources() {
      try {
        const querySnapshot = await getDocs(collection(db, 'sources'));
        this.sources = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        alert('Błąd podczas pobierania źródeł');
      }
    },
    async addSource() {
      if (!this.newSourceName.trim()) return;
      try {
        const docRef = await addDoc(collection(db, 'sources'), { name: this.newSourceName.trim() });
        this.sources.push({ id: docRef.id, name: this.newSourceName.trim() });
        this.newSourceName = '';
      } catch (error) {
        alert('Błąd podczas dodawania źródła');
      }
    },
    async deleteSource(id) {
      if (!confirm('Czy na pewno chcesz usunąć to źródło?')) return;
      try {
        await deleteDoc(doc(db, 'sources', id));
        this.sources = this.sources.filter(source => source.id !== id);
      } catch (error) {
        alert('Błąd podczas usuwania źródła');
      }
    },
    async editSource(id, name) {
      const newName = prompt('Edytuj nazwę źródła:', name);
      if (newName !== null && newName.trim() !== '') {
        try {
          await updateDoc(doc(db, 'sources', id), { name: newName.trim() });
          const index = this.sources.findIndex(source => source.id === id);
          if (index !== -1) {
            this.sources[index].name = newName.trim();
          }
        } catch (error) {
          alert('Błąd podczas aktualizowania źródła');
        }
      }
    }
  },
  created() {
    this.fetchSources();
  }
};
</script>