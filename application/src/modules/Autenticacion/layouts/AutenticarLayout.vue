<template>
    <q-layout class="AppRoot-fullPage" >
        <q-page-container class="AppMain__layer__PageAndTopBar">
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

