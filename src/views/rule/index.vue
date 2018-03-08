<template>
  <div class="dashboard-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>checkpoints</span>
        <el-button style="right: 40px; position: absolute;" type="primary" size="small" @click="addCheckpoint()">新增checkpoint</el-button>
      </div>
      <el-table :data="list" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="id" label="编号"></el-table-column>
        <el-table-column prop="name" label="规则集名"></el-table-column>
        <el-table-column label="命中策略">
          <template slot-scope="scope">
            <span>{{actionArr[scope.row.action]}}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间">
           <template slot-scope="scope">
            <span>{{scope.row.createdTime / 1000 | moment("YYYY-MM-DD ss:mm") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button v-if="scope.row.enabled" type="danger" @click="disableDrl(scope.row)" size="mini" icon="el-icon-edit">关闭</el-button>
            <el-button v-else type="primary" @click="enableDrl(scope.row)" size="mini" icon="el-icon-edit">启用</el-button>
            <el-button type="primary" @click="modify(scope.row)" size="mini" icon="el-icon-edit">修改</el-button>
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
          :render-content="renderContent"
          :props="defaultProps">
        </el-tree>
      </div>      
      <el-dialog :visible.sync="dialogFormVisible">
        <el-form :model="form" ref="ruleForm" label-width="180px" class="demo-ruleForm">
          <el-form-item label="如果命中该drl，则运行" prop="variable">
            <el-select v-model="form.hit" placeholder="请选择规则集">
              <el-option v-for="t in filterList(list)" :key="t.id" :label="t.name" :value="t.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="否则，运行" prop="variable">
            <el-select v-model="form.nothit" placeholder="请选择规则集">
              <el-option v-for="t in filterList(list)" :key="t.id" :label="t.name" :value="t.id">
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
import { insertFlow, activateRule, getList } from '@/api/rule'
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
        hit: '',
        nothit: ''
      },
      flow: {
        id: ''
      },
      currentNode: {},
      nodeMap: {
      },
      defaultProps: {
      },
      actionArr: [
        '通过',
        '拒绝',
        '待审'
      ]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    append(data) {
      if (data.label === '') {
        this.$message('不能继续添加流程')
        return
      }
      this.currentNode = data
      this.form = { hit: '', nothit: '' }
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
        this.nodeMap = {
          '': '空'
        }
        this.list.forEach(function(element) {
          this.nodeMap[element.id] = element.name
        }, this)

        getFlow().then(flowResp => {
          this.data = JSON.parse(flowResp.data.workflow)
          this.defaultProps['nodeMap'] = this.nodeMap
        })
      })
    },
    modify(row) {
      this.$router.push('/engine/drl?id=' + row.id)
    },
    renderContent(h, { node, data, store }) {
      return (
        <span class='custom-tree-node'>
          <span>{store.props.nodeMap[data.label]}</span>
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
      const hitChild = { id: nid++, label: this.form.hit, children: [] }
      const nothitChild = { id: nid++, label: this.form.nothit, children: [] }
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
      const child = { id: nid++, label: this.flow.id, children: [] }
      this.data.push(child)
      this.flowVisible = false
    },
    enableDrl(data) {
      if (data.enabled) {
        this.$message('规则已启用')
      }
      activateRule({ id: data.id, enabled: 1 }).then(response => {
        this.$message('启用成功')
        this.fetchData()
      })
    },
    disableDrl(data) {
      if (!data.enabled) {
        this.$message('规则已关闭')
      }
      activateRule({ id: data.id, enabled: 0 }).then(response => {
        this.$message('关闭成功')
        this.fetchData()
      })
    },
    addCheckpoint() {
      this.$router.push('/engine/drl')
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