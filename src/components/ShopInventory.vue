<template>
  <div class="d-flex flex-column min-vw-100 min-vh-100 bg-secondary p-0">
    <AppNavbar />
    
    <div class="container-fluid text-white p-4 flex-grow-1">
      <div class="row form-inline mb-3"> 
        <div class="col-md-4 text-start">
          <label for="categoryFilter" class="form-label">Filtruj według kategorii:</label>
          <select id="categoryFilter" v-model="selectedCategoryFilter" class="form-select">
            <option value="">Wszystkie kategorie</option>
            <option v-for="category in categories" :key="category.id" :value="category.name">{{ category.name }}</option>
          </select>
        </div>
        <div class="col-md-8 text-md-end pt-3 pt-md-4">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Wyszukaj po nazwie..." 
            class="form-control d-inline-block w-auto"
          />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th style="min-width: 140px;">Kategoria</th>
              <th style="min-width: 150px;">Nazwa</th>
              <th style="min-width: 160px;">Model</th>
              <th class="text-end text-nowrap">Cena</th>
              <th class="text-center text-nowrap">Ilość</th>
              <th class="text-end text-nowrap">Wartość</th>
              <th style="min-width: 130px;">Źródło</th>
              <th class="text-center text-nowrap">Status</th>
              <th style="min-width: 180px;">Informacja</th>
              <th v-if="isAdmin" class="text-nowrap">Zmodyfikowane przez</th>
              <th v-if="isAdmin" class="text-nowrap">Data modyfikacji</th>
              <th v-if="isAdmin" class="text-center text-nowrap">Faktura</th>
              <th v-if="isAdmin" class="text-center text-nowrap">Akcje</th>
            </tr>
          </thead>
          <tbody class="table-group-divider" style="border-top-color: white">
            <tr v-for="item in filteredInventory" :key="item.id">
              <td>{{ item.category }}</td>
              <td><strong>{{ item.name }}</strong></td>
              <td>{{ item.model }}</td>
              <td class="text-end text-nowrap">{{ Number(item.price).toFixed(2) }} zł</td>
              <td class="text-center text-nowrap">{{ item.quantity }} szt.</td>
              <td class="text-end text-nowrap fw-bold">{{ (item.price * item.quantity).toFixed(2) }} zł</td>
              <td>{{ item.source }}</td>
              <td class="text-center text-nowrap">
                <span :class="getStatusBadgeClass(item.status)">{{ item.status }}</span>
              </td>
              <td>{{ item.info }}</td>
              <td v-if="isAdmin" class="text-nowrap"><small>{{ item.modifiedBy }}</small></td>
              <td v-if="isAdmin" class="text-nowrap"><small>{{ formatDate(item.modifiedAt) }}</small></td>
              <td v-if="isAdmin" class="text-center text-nowrap">
                <a 
                  v-if="getInvoiceUrl(item.invoiceURL)" 
                  :href="getInvoiceUrl(item.invoiceURL)" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="btn btn-outline-info btn-sm text-nowrap"
                >
                  Otwórz 📄
                </a>
                <span v-else class="text-white-50">—</span>
              </td>
              <td v-if="isAdmin" class="text-center text-nowrap">
                <div class="btn-group btn-group-sm">
                  <router-link :to="{ name: 'EditItem', params: { id: item.id } }" class="btn btn-warning">
                    Edytuj
                  </router-link>
                  <button type="button" class="btn btn-danger" @click="deleteItem(item.id)">
                    Usuń
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredInventory.length === 0">
              <td :colspan="isAdmin ? 13 : 9" class="text-center py-4 text-white-50 fst-italic">
                Brak przedmiotów spełniających kryteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-3" v-if="isAdmin">
        <router-link to="/add" class="btn btn-primary">
          + Dodaj nowy rekord
        </router-link>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script>
import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import AppNavbar from './AppNavbar.vue';
import AppFooter from './AppFooter.vue';

export default {
  name: 'ShopInventory',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      inventory: [],
      isAdmin: false,
      searchQuery: '',
      selectedCategoryFilter: '',
      categories: []
    };
  },
  async created() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'admin') {
      this.isAdmin = true;
    }
    await this.fetchInventory();
    await this.fetchCategories();
  },
  computed: {
    filteredInventory() {
      let filtered = this.inventory;

      if (this.selectedCategoryFilter !== '') {
        filtered = filtered.filter(item => item.category === this.selectedCategoryFilter);
      }

      if (this.searchQuery) {
        filtered = filtered.filter(item => item.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
      }

      return filtered;
    }
  },
  methods: {
    async fetchInventory() {
      try {
        const q = query(collection(db, "inventory"), orderBy("modifiedAt", "desc"));
        const querySnapshot = await getDocs(q);
        this.inventory = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        alert("Błąd przy pobieraniu inwentarza");
      }
    },
    async fetchCategories() {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      this.categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async deleteItem(itemId) {
      if (!confirm('Czy na pewno chcesz usunąć ten rekord?')) return;
      try {
        await deleteDoc(doc(db, 'inventory', itemId));
        this.inventory = this.inventory.filter(item => item.id !== itemId);
      } catch (error) {
        alert('Błąd podczas usuwania przedmiotu');
      }
    },
    getInvoiceUrl(invoiceField) {
      if (!invoiceField) return '';
      if (typeof invoiceField === 'object' && invoiceField.url) return invoiceField.url;
      if (typeof invoiceField === 'string' && invoiceField.trim() !== '') return invoiceField;
      return '';
    },
    formatDate(timestamp) {
      if (!timestamp) return '—';
      if (timestamp.toDate) return timestamp.toDate().toLocaleString();
      return new Date(timestamp).toLocaleString();
    },
    getStatusBadgeClass(status) {
      if (status === 'OK') return 'badge bg-success';
      if (status === 'POŻYCZONY') return 'badge bg-warning text-dark';
      if (status === 'USZKODZONY') return 'badge bg-danger';
      return 'badge bg-secondary';
    }
  }
};
</script>