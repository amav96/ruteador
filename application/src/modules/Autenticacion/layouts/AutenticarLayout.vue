<template>
    <q-layout >
        <q-page-container>
            <router-view />
        </q-page-container>
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