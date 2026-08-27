<template>
  <section class="Metting">
    <div class="mettingBox">
      <div class="addmetting">
        <el-icon :size="30">
          <Edit />
        </el-icon>
        <span> 加入会议 </span>
      </div>
      <div class="addmetting">
        <el-icon :size="30"> <Search /> </el-icon>快速会议
      </div>
      <div class="addmetting">
        <el-icon :size="30"> <Share /> </el-icon>预定会议
      </div>
      <div class="addmetting">
        <el-icon :size="30"> <Upload /> </el-icon>共享屏幕
      </div>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { reactive, watch, computed, ref } from 'vue'
import { Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'
</script>
<style scoped>
.Metting {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  .mettingBox {
    width: 300px;
    height: 300px;
    display: grid;
    place-items: center;
    grid-template-columns: repeat(2, 1fr);
    .addmetting {
      padding: 14px;
      border-radius: 4px;
      background-color: #409EFF;
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }
}
</style>
