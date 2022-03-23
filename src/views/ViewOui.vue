<template>
  <v-col cols="12" sm="12" md="6" lg="6" xl="6" class="pt-0 pl-0">
    <h2 class="pb-6">OUI lookup tool</h2>
    <div class="pb-2">
      Enter MAC addresses or prefixes to lookup vendors.<br />
    </div>
    <div class="pb-1 text-caption font-weight-bold">Examples:</div>
    <div class="pb-8 text-body-2 font-weight-light">
      08:00:20<br />98:FA-9B-63-0C-C4<br />00d9.d110.21f9<br />
    </div>
    <h4>OUI search:</h4>
    <v-textarea
      solo
      dense
      DISABLEflat
      spellcheck="false"
      placeholder="00:00:00:00:00:00
11:11:11:11:11:11
..."
      class="pb-4"
      hide-details="true"
      v-model="ouiSearch"
    ></v-textarea>
    <v-btn color="#17B8CE" class="white--text" @click="handleOuiLookupClick()">
      Find
    </v-btn>
    <div class="pt-8">
      <table v-if="typeof ouiResponse === 'object'">
        <tr v-for="(v, k) in ouiResponse" :key="k">
          <td class="pr-2">{{ k }}</td>
          <td>{{ v }}</td>
        </tr>
      </table>
      <p v-else>{{ ouiResponse }}</p>
    </div>
  </v-col>
</template>

<style scoped lang="scss">
::v-deep .v-textarea * {
  background: #e8e8e8d6 !important;

  textarea {
    line-height: 1.4em;
    font-weight: 300;
    height: 110px;
  }
}
</style>

<script>
export default {
  name: 'ViewOui',
  data() {
    return {
      ouiSearch: '',
      ouiResponse: '',
    };
  },
  methods: {
    handleOuiLookupClick() {
      if (!this.ouiSearch) {
        this.ouiResponse = 'Please enter MAC addresses to search';
        return;
      }
      const searchOptions = {
        params: {
          q: this.ouiSearch,
        },
        timeout: 5000,
      };

      this.$api
        .get('/oui', searchOptions)
        .then((response) => {
          if (this.isEmptyObject(response.data))
            this.ouiResponse = 'Nothing found';
          else this.ouiResponse = response.data;
        })
        .catch((e) => {
          this.ouiResponse = e.toString();
        });

      this.ouiResponse = 'Searching, please wait...';
    },
    isEmptyObject(o) {
      return Object.keys(o).length === 0;
    },
  },
};
</script>
