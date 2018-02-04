<template>
  <div class="dashboard-container">
    <el-row v-for="(item, index) in list" :key="item.name">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>{{item.name}}</span>
          <el-button type="danger" size="mini" @click="handleDeleteRelation(index)">删除规则
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
                    <el-option v-for="item in Object.keys(op)" :key="item" :label="op[item]" :value="op[item]">
                    </el-option>
                  </el-select>
                  <!--<span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.o}}</span>-->
                </template>
              </el-table-column>
              <el-table-column>
                <template slot-scope="scope">
                  <el-input v-if="scope.$index % 2 == 0" style="width: 150px;" class="filter-item" :placeholder="list[index].rule[scope.$index].r" v-model="list[index].rule[scope.$index].r">
                  </el-input>
                  <!--<span class="link-type" @click="handleUpdate(scope.row)">{{scope.row.r}}</span>-->
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
      op: {}
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
          this.list = response.data
          // this.listDisplay = [...this.list]
          this.list.forEach(function(element) {
            element.rule.forEach(function(ele) {
              if (ele.l in this.variables) {
                ele.l = this.variables[ele.l].dsp
              }
              if (ele.o in constant.opMap) {
                ele.o = constant.opMap[ele.o]
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
    handleAddRelation(listIdx) {
      var item = {
        l: '请输入',
        o: '请输入',
        r: '请输入'
      }
      if (this.list[listIdx].rule.length % 2) {
        item.l = ''
        item.r = ''
      }
      this.list[listIdx].rule.push(item)
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
