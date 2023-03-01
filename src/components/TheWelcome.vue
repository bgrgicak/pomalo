<script setup>
import { useCounterStore } from '../stores/counter'
const store = useCounterStore()
</script>

<template>
  <div>
    <h1>Welcome to the Vue 3 Composition API</h1>
    <p>Counter: {{ store.count }}</p>
    <button @click="store.increment">Increment</button>
  </div>
</template>
