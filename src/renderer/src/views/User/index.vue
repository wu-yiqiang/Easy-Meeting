<template>
  <section class="User">
   <div class="left-info">
      <div class="avatar">
        <img :src="user" alt="">
      </div>
      <div class="name">Sutter</div>
      <div class="slogon">哈哈哈哈哈哈哈哈哈哈哈哈哈哈</div>
   </div>
   <div class="right-info">用户信息，暂时省略</div>
  </section>
</template>
<script lang="ts" setup>
import { reactive, watch, computed, ref } from 'vue'
import user from '@/assets/electron.svg'
</script>
<style  scoped>
.User{
  flex: 1;
  display: flex;
  column-gap: 20px;
  justify-content: flex-start;
  .left-info {
    padding: 14px;
    width: 140px;
    .avatar {
      aspect-ratio: 1 / 1;
    }
    .name {
      font-size: 20px;
      font-weight: 500;
      text-align: center;
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .slogon {
      font-size: 14px;
      font-weight: 400;
      text-align: center;
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .right-info {
    flex: 1;
    padding: 14px;
    border-radius: 4px;
    overflow-y: auto;
  }
}
</style>
