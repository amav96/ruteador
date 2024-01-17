<template>
  <q-layout  view="lHh Lpr lFf" class="bg-grey-2 ">
    <q-header >
      <q-toolbar class="bg-grey-2 flex row justify-between no-border">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          color="deep-purple-13"
          @click="toggleLeftDrawer"
        />

        <q-img
          :src="logo"
          style="max-width: 100px"
        />
        
        <q-btn
          flat
          dense
          round
          color="deep-purple-13"
        />

        <!-- <div>Quasar v{{ $q.version }}</div> -->
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Modulos
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { EssentialLinkProps } from 'components/EssentialLink.vue';
import logo from 'src/assets/logo.jpg'

const essentialLinks: EssentialLinkProps[] = [
  // {
  //   title: 'Docs',
  //   caption: 'quasar.dev',
  //   icon: 'school',
  //   link: 'https://quasar.dev'
  // },
  // {
  //   title: 'Github',
  //   caption: 'github.com/quasarframework',
  //   icon: 'code',
  //   link: 'https://github.com/quasarframework'
  // },
  // {
  //   title: 'Discord Chat Channel',
  //   caption: 'chat.quasar.dev',
  //   icon: 'chat',
  //   link: 'https://chat.quasar.dev'
  // },
  // {
  //   title: 'Forum',
  //   caption: 'forum.quasar.dev',
  //   icon: 'record_voice_over',
  //   link: 'https://forum.quasar.dev'
  // },
  // {
  //   title: 'Twitter',
  //   caption: '@quasarframework',
  //   icon: 'rss_feed',
  //   link: 'https://twitter.quasar.dev'
  // },
  {
    title: 'Recorridos',
    // caption: '@QuasarFramework',
    icon: 'public',
    link: '/recorridos'
  },
  // {
  //   title: 'Quasar Awesome',
  //   caption: 'Community Quasar projects',
  //   icon: 'favorite',
  //   link: 'https://awesome.quasar.dev'
  // }
];

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style>
.q-layout__section--marginal{
  background-color: #fafafa !important;
}
.q-toolbar {
  padding: 0 9px;
}
</style>