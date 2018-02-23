<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>输入</span>
      </div>
      <el-button size="mini" type="primary" @click="handleAddCondition()">增加条件    
      </el-button>
      <div style="margin-bottom:50px;">
        <el-table :data="inputs" style="width: 100%">
          <el-table-column width="180">
            <template slot-scope="scope">
              <el-select style="width: 150px" class="filter-item" v-model="scope.row.key">
                <el-option v-for="t in Object.keys(variables)" :key="t" :label="mapper[t]" :value="mapper[t]">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column width="180">
            <template slot-scope="scope">
              <el-input style="width: 150px;" class="filter-item" placeholder="请输入" v-model="scope.row.value">
              </el-input>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 30px">
          <el-button size="mini" type="primary" @click="onSubmit">发送</el-button>
        </div>
      </div>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>结果</span>
      </div>
      <div style="margin-bottom:50px;">
        <template>
          <span>{{result}}</span>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script>
import { executeRule } from '@/api/rule'
import { getVariables } from '@/api/rule'
const constant = require('@/utils/constant')

export default {
  data() {
    return {
      variables: '',
      inputs: [],
      result: ''
    }
  },
  created() {
    this.mapper = constant.m
    this.fetchData()
  },
  methods: {
    fetchData() {
      getVariables().then(response => {
        this.variables = response.data
        for (var key in this.variables) {
          this.mapper[this.variables[key].displayName] = key
          this.mapper[key] = this.variables[key].displayName
        }
      })
    },
    onSubmit() {
      var p = {}
      this.inputs.forEach(function(element) {
        if (element.key !== '' && element.value !== '') {
          p[this.mapper[element.key]] = element.value
        }
      }, this)
      executeRule(p).then(response => {
        this.result = response.data
      })
    },
    handleAddCondition() {
      var condition = {
        key: '',
        value: ''
      }
      this.inputs.push(condition)
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

