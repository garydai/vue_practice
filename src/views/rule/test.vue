<template>
  <el-card class="box-card">
    <div class="app-container">
        <el-form ref="form" :model="form" label-width="120px">
          <el-form-item label="输入">
            <el-input v-model="form.params" placeholder='"age":12'></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">发送</el-button>
          </el-form-item>
          <el-form-item label="结果"> 
            <span>{{form.result}}</span>
          </el-form-item>
        </el-form>
    </div>
  </el-card>
</template>

<script>
import { executeRule } from '@/api/rule'

export default {
  data() {
    return {
      form: {
        params: '',
        result: ''
      }
    }
  },
  methods: {
    onSubmit() {
      var p = '{' + this.form.params + '}'
      p = JSON.parse(p)
      executeRule(p).then(response => {
        this.form.result = response.data
      })
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

