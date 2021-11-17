<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<style>
html {
    overflow-y: auto !important;
}
* {
    transition: none !important;
}
a {
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>

<script>
export default {
  name: 'App',

  data: () => ({
    //
  }),
};
</script>
