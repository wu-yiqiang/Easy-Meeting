<template>
  <section class="Cover">
   <img :src="url" alt="">
  </section>
</template>
<script lang="ts" setup>
import { reactive, watch, computed, ref } from 'vue'
const props = defineProps({
  url: {
    type: String,
    required: true,
    default: () => ""
  }
})
</script>
<style scoped>
.Cover{
  flex: 1;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
