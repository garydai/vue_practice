<template>
  <div class="dashboard-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>checkpoints</span>
      </div>
      <el-table :data="list" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="id" label="编号"></el-table-column>
        <el-table-column prop="name" label="规则集名"></el-table-column>
        <el-table-column label="更新时间">
           <template slot-scope="scope">
            <span>{{scope.row.createdTime / 1000 | moment("YYYY-MM-DD ss:mm") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否启用">
          <template slot-scope="scope">
            <span v-if="scope.row.enabled">已启用</span>
            <span v-else>未启用</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" @click="modify(scope.row)" size="small" icon="el-icon-edit">修改</el-button>
            <el-button type="danger" @click="remove(scope.row)" size="small" icon="el-icon-edit">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>workflow</span>
         <el-button style="right: 100px; position: absolute;" type="primary" size="small" @click="addFlow()">新增流程</el-button>
        <el-button style="right: 40px; position: absolute;" type="primary" size="small" @click="saveFlow()">保存</el-button>
      </div>
      <div class="block">
        <el-tree
          :data="data"
          default-expand-all
          :expand-on-click-node="false"
          :render-content="renderContent">
        </el-tree>
      </div>      
      <el-dialog :visible.sync="dialogFormVisible">
        <el-form :model="form" ref="ruleForm" label-width="150px" class="demo-ruleForm">
          <el-form-item label="如果命中该drl，则运行" prop="variable">
            <el-select v-model="form.hit" placeholder="请选择规则集">
              <el-option v-for="t in filterList(list)" :key="t.id" :label="t.name" :value="t.name">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="否则，运行" prop="variable">
            <el-select v-model="form.nothit" placeholder="请选择规则集">
              <el-option v-for="t in filterList(list)" :key="t.id" :label="t.name" :value="t.name">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="addChild()">保存</el-button>
        </div>
      </el-dialog>
      <el-dialog :visible.sync="flowVisible">
        <el-form :model="flow" ref="ruleForm" label-width="100px" class="demo-ruleForm">
          <el-form-item label="新流程" prop="variable">
            <el-select v-model="flow.id" placeholder="请选择规则集">
              <el-option v-for="t in filterList(list)" :key="t.id" :label="t.name" :value="t.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="flowVisible = false">取消</el-button>
          <el-button type="primary" @click="addFlowSave()">保存</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { getList } from '@/api/rule'
import { insertFlow } from '@/api/rule'
// import { clone } from '@/utils/util'
import { getFlow } from '@/api/rule'
let nid = 100
export default {
  name: 'dashboard',
  data() {
    return {
      list: [],
      data: [],
      dialogFormVisible: false,
      flowVisible: false,
      form: {
        hit: -1,
        nothit: -1
      },
      flow: {
        id: -1
      },
      currentNode: {},
      nodeMap: {}
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    append(data) {
      this.currentNode = data
      this.form = { hit: -1, nothit: -1 }
      this.dialogFormVisible = true
    },
    remove(node, data) {
      const parent = node.parent
      if (!(parent.data instanceof Array)) {
        this.$set(parent.data, 'children', [])
      } else {
        const children = parent.data
        const index = children.indexOf(data)
        // const index = children.findIndex(d => d.id === data.id)
        children.splice(index, 1)
      }
    },
    fetchData() {
      getList().then(response => {
        this.list = response.data
        this.nodeMap = {}
        this.list.forEach(function(element) {
          this.nodeMap[element.id] = element.name
        }, this)

        getFlow().then(flowResp => {
          if (flowResp.data.workflow.length === 0) {
            this.list.forEach(function(element) {
              if (element.enabled) {
                this.data.push({ id: nid++, label: element.id, children: [], name: '' })
              }
            }, this)
          } else {
            this.data = JSON.parse(flowResp.data.workflow)
          }
        })
      })
    },
    modify(row) {
      this.$router.push('/engine/drl?id=' + row.id)
    },
    renderContent(h, { node, data, store }) {
      return (
        <span class='custom-tree-node'>
          <span>{data.name}</span>
          <span>
            <el-button size='mini' type='text' on-click={ () => this.append(data) }>增加子流程</el-button>
            <el-button size='mini' type='text' on-click={ () => this.remove(node, data) }>删除该流程</el-button>
          </span>
        </span>)
    },
    filterList(list) {
      return list.filter(data => {
        return data.enabled === true
      })
    },
    addChild() {
      const hitChild = { id: nid++, label: this.form.hit, children: [], name: this.nodeMap[this.form.hit] }
      const nothitChild = { id: nid++, label: this.form.nothit, children: [], name: this.nodeMap[this.form.nothit] }
      this.$set(this.currentNode, 'children', [])
      this.currentNode.children.push(hitChild)
      this.currentNode.children.push(nothitChild)
      this.dialogFormVisible = false
    },
    saveFlow() {
      // var tmp = clone(this.data)
      // tmp.filter(ele => {
      //   return delete ele['id']
      // })
      insertFlow({ 'workflow': JSON.stringify(this.data) }).then(response => {
        this.$message('保存成功')
      })
    },
    addFlow() {
      this.flowVisible = true
    },
    addFlowSave() {
      const child = { id: nid++, label: this.flow.id, children: [], name: this.nodeMap[this.flow.id] }
      this.data.push(child)
      this.flowVisible = false
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
.enable_rule_button {
  right: 30px;
  position: absolute;
}
</style>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>