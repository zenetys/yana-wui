<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style lang="scss">
html {
  overflow-y: auto !important;
}
* {
  transition: none !important;
}
a {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
.nowrap {
  white-space: nowrap;
}
</style>

<script>
export default {
  name: 'App',

  data: () => ({}),
};
</script>
