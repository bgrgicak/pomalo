<script setup lang="ts">
import Header from "./layout/Header.vue";
import Navigation from "./layout/Navigation.vue";
import LeftSidebar from "./layout/LeftSidebar.vue";
import RightSidebar from "./layout/RightSidebar.vue";
import Main from "./layout/Main.vue";
</script>

<template>
  <v-app>
    <Header />
    <Navigation />
    <LeftSidebar />
    <Main />
    <RightSidebar />
  </v-app>
</template>

<style scoped></style>
