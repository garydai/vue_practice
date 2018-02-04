<template>
  <div class="dashboard-container">
    <el-button type="primary" size="mini" @click="handleAddRule()">增加规则
    </el-button>
    <el-button type="primary" size="mini" @click="handleUpdateRule()">提交修改
    </el-button>
    <el-row v-for="(item, index) in list" :key="index">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <el-input style="width: 150px;" class="filter-item" :placeholder="item.name" v-model="list[index].name">
          </el-input>
          <el-button type="danger" size="mini" @click="handleDeleteRule(index)">删除规则
          </el-button>      
        </div>
        <el-button size="mini" type="primary" @click="handleAddRelation(index)">增加表达式    
        </el-button>
        <el-button type="danger" size="mini" @click="handleDeleteRelation(index)">删除表达式
        </el-button>
        <div style="margin-bottom:50px;">
            <el-table :data="item.rule" style="width: 100%">
              <el-table-column width="180">
                <template slot-scope="scope">
                  <el-select v-if="scope.$index % 2 == 0" style="width: 150px" class="filter-item" v-model="list[index].rule[scope.$index].l">
                    <el-option v-for="item in Object.keys(variables)" :key="item" :label="variables[item].dsp" :value="variables[item].dsp">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column width="180">
                 <template slot-scope="scope">
                   <el-select style="width: 150px" class="filter-item" v-model="list[index].rule[scope.$index].o">
                    <el-option v-for="item in Object.keys(op[scope.$index % 2])" :key="item" :label="op[scope.$index % 2][item]" :value="op[scope.$index % 2][item]">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column>
                <template slot-scope="scope">
                  <el-input v-if="scope.$index % 2 == 0" style="width: 150px;" class="filter-item" :placeholder="list[index].rule[scope.$index].r" v-model="list[index].rule[scope.$index].r">
                  </el-input>
                </template>
              </el-table-column>
          </el-table>       
        </div>        
      </el-card>
    </el-row>
  
  </div>
</template>

<script>
import { getList } from '@/api/rule'
import { getVariables } from '@/api/rule'
import { updateRule } from '@/api/rule'
import { clone } from '@/utils/util'
const constant = require('@/utils/constant')

export default {
  name: 'dashboard',
  data() {
    return {
      list: [],
      variables: {},
      // todo refine
      listDisplay: [],
      mapper: {}, // chinese->english
      op: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getVariables().then(response => {
        this.variables = response.data
        for (var key in this.variables) {
          this.mapper[this.variables[key].dsp] = this.variables[key]
        }
        this.op = constant.opMap
        getList().then(response => {
          this.list = JSON.parse(response.data).rules
          this.list.forEach(function(element) {
            element.rule.forEach(function(ele) {
              if (ele.l in constant.m) {
                ele.l = constant.m[ele.l]
              }

              if (ele.o in constant.m) {
                ele.o = constant.m[ele.o]
              }
            }, this)
          }, this)
          this.listLoading = false
        })
      })
    },
    handleDeleteRelation(listIdx) {
      this.list[listIdx].rule.splice(-1, 1)
    },
    handleDeleteRule(listIdx) {
      this.list.splice(listIdx, 1)
    },
    handleUpdateRule() {
      // todo 增量修改
      var listCopy = clone(this.list)
      var result = {
        ver: constant.ruleVersion,
        rules: listCopy
      }
      var valid = true
      listCopy.forEach(function(element) {
        if (element.name === '') {
          valid = false
        }
        var rule = element.rule
        rule.forEach(function(element, index) {
          if (element.l in constant.m) {
            element.l = constant.m[element.l]
          }
          if (element.o in constant.m) {
            element.o = constant.m[element.o]
          }
          if (index % 2 === 0) {
            valid = (element.l !== '' && element.o !== '' && element.r !== '')
          }
          if (index % 2 === 1) {
            valid = (element.o !== '')
          }
        }, this)
        if (rule.length % 2 === 0) {
          valid = false
        }
      }, this)
      if (!valid) {
        this.$message('请填写完整')
        return
      }
      updateRule({ input: JSON.stringify(result) }).then(response => {
        this.$message('保存成功')
      })
    },
    handleAddRelation(listIdx) {
      var item = {
        l: '',
        o: '',
        r: ''
      }
      if (this.list[listIdx].rule.length % 2) {
        item.l = ''
        item.r = ''
      }
      this.list[listIdx].rule.push(item)
    },
    handleAddRule(listIdx) {
      var rule = {
        'name': '',
        'rule': [
          {
            'r': '',
            'l': '',
            'o': ''
          }
        ],
        'action': 'warn'
      }
      this.list.push(rule)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
