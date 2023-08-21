<script setup lang="ts">
import Header from './components/layout/Header.vue';
import Navigation from './components/layout/Navigation.vue';
import LeftSidebar from './components/layout/LeftSidebar.vue';
import RightSidebar from './components/layout/RightSidebar.vue';
import Main from './components/layout/Main.vue';
import Footer from './components/layout/Footer.vue';
</script>

<template>
  <v-app>
    <Header />
    <Navigation />
    <LeftSidebar />
    <Main />
    <RightSidebar />
    <Footer />
  </v-app>
</template>

<style scoped></style>
