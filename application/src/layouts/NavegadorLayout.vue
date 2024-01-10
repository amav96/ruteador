<template>
  <div class="">
    <q-layout view="hHh lpR fFf" >
  
      
      <q-page-container>
        <router-view />
      </q-page-container>
  
    </q-layout>
    </div>
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