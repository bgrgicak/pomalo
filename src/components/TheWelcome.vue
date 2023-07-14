<script setup>
import { useActivityStore } from '../stores/activities'
const store = useActivityStore()

store.getAllActivities()

const addActivity = () => {
  store.addActivity({
    _id: Math.random().toString(),
    title: 'New Activity',
    description: 'This is a new activity',
    type: 'task',
    completed: false
  })
}
</script>

<template>
  <header>
    <h1>Welcome to the Vue 3 Composition API</h1>
    <p>Counter: {{ store.activityCount }}</p>
    <button @click="addActivity">Add Activity</button>
  </header>
  <article>
    <ul>
      <li v-for="activity in store.activities" :key="activity._id">
        <input type="text" v-model="activity.title" />
        <button @click="store.updateActivity(activity)">Update</button>
        <button @click="store.removeActivity(activity._id)">Remove</button>
      </li>
    </ul>
  </article>
</template>
