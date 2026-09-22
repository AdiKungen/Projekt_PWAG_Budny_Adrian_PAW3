<template>
  <router-view></router-view>
</template>

<script>
export default {
  computed: {
    currentUser() {
      return JSON.parse(localStorage.getItem('user'));
    }
  },
  name: 'App',
};
</script>