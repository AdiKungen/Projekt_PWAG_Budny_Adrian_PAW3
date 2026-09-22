<template>
  <div class="d-flex flex-column min-vw-100 min-vh-100 bg-secondary p-0">
    <AppNavbar />

    <div class="container-fluid text-white p-4 flex-grow-1">
      <h3 class="mb-4">Dodaj nowy rekord</h3>
      <form class="row g-3" @submit.prevent="addItem">
        <div class="col-md-4">
          <label for="category" class="form-label">Kategoria</label>
          <select id="category" v-model="item.category" class="form-select" required>
            <option value="" disabled>Wybierz kategorię...</option>
            <option v-for="category in categories" :key="category.id" :value="category.name">{{ category.name }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <label for="name" class="form-label">Nazwa</label>
          <input id="name" v-model="item.name" class="form-control" required />
        </div>
        <div class="col-md-4">
          <label for="model" class="form-label">Model</label>
          <input id="model" v-model="item.model" class="form-control" required />
        </div>
        <div class="col-md-6">
          <label for="price" class="form-label">Cena (zł)</label>
          <input id="price" v-model.number="item.price" type="number" step="0.01" class="form-control" required />
        </div>
        <div class="col-md-6">
          <label for="quantity" class="form-label">Ilość</label>
          <input id="quantity" v-model.number="item.quantity" type="number" class="form-control" required />
        </div>
        <div class="col-md-6">
          <label for="source" class="form-label">Źródło:</label>
          <select id="source" v-model="item.source" class="form-select" required>
            <option value="" disabled>Wybierz źródło...</option>
            <option v-for="source in sources" :key="source.id" :value="source.name">{{ source.name }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label for="status" class="form-label">Status</label>
          <select id="status" v-model="item.status" class="form-select" required>
            <option value="OK">OK</option>
            <option value="POŻYCZONY">POŻYCZONY</option>
            <option value="USZKODZONY">USZKODZONY</option>
          </select>
        </div>
        <div class="col-12">
          <label for="info" class="form-label">Informacja / Uwagi</label>
          <textarea id="info" v-model="item.info" class="form-control" rows="2"></textarea>
        </div>
        <div class="col-12">
          <label for="invoiceURL" class="form-label">Link do faktury / dokumentu (URL)</label>
          <input 
            id="invoiceURL" 
            v-model="item.invoiceURL" 
            type="url" 
            class="form-control" 
            placeholder="np. https://drive.google.com/... lub https://mojadomena.pl/skan.pdf" 
          />
        </div>
        <div class="col-12 mt-4">
          <button type="submit" class="btn btn-primary me-2">Dodaj rekord</button>
          <router-link to="/inventory" class="btn btn-outline-light">Anuluj</router-link>
        </div>
      </form>
    </div>

    <AppFooter />
  </div>
</template>

<script>
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import AppNavbar from './AppNavbar.vue';
import AppFooter from './AppFooter.vue';

export default {
  name: 'AddItem',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      item: {
        category: '',
        name: '',
        model: '',
        price: 0,
        quantity: 1,
        source: '',
        status: 'OK',
        info: '',
        invoiceURL: '',
        modifiedBy: '',
        modifiedAt: ''
      },
      sources: [],
      categories: []
    };
  },
  methods: {
    async fetchSources() {
      const querySnapshot = await getDocs(collection(db, 'sources'));
      this.sources = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async fetchCategories() {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      this.categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async addItem() {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      this.item.modifiedBy = user.email || 'Nieznany';
      this.item.modifiedAt = serverTimestamp();

      await addDoc(collection(db, 'inventory'), this.item);
      this.$router.push('/inventory');
    }
  },
  async created() {
    await this.fetchSources();
    await this.fetchCategories();
  }
};
</script>