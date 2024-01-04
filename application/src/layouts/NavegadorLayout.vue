<template>
    <q-layout view="hHh lpR fFf">
  
      <q-page-container>
        <router-view />
      </q-page-container>
  
      <q-footer reveal bordered class="bg-grey-8 text-white">
        <q-tabs
        v-model="tab"
        class="bg-primary text-white shadow-2"
      >
        <q-tab name="mails" label="Mails" icon="mail" />
        <q-tab name="alarms" label="Alarms" icon="alarm" />
        
      </q-tabs>
      </q-footer>
  
    </q-layout>
  </template>

<script>
import { ref } from 'vue'

export default {
  setup () {
    return {
      tab: ref('mails')
    }
  }
}
</script>