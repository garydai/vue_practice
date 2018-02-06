const mm = [
  ['and', '并且'],
  ['or', '或者'],
  ['>', '大于'],
  ['<', '小于'],
  ['>=', '大于等于'],
  ['<=', '小于等于'],
  ['==', '等于'],
  ['age', '年龄'],
  ['contact', '通讯录中的电话'],
  ['relativePhone', '亲戚电话'],
  ['true', '是'],
  ['false', '否'],
  ['isBlack', '黑名单']
]

// arr to obj ,such as { CN : "China", US : "USA" }
const mmm = mm.reduce((acc, cur) => {
  acc[cur[0]] = cur[1]
  acc[cur[1]] = cur[0]
  return acc
}, {})

module.exports = {
  relationMap: {
    and: '并且',
    or: '或者'
  },
  opMap: [
    {
      '>': '大于',
      '<': '小于',
      '>=': '大于等于',
      '<=': '小于等于',
      '==': '等于'
    },
    {
      'and': '并且',
      'or': '或者'
    }
  ],
  m: mmm,
  ruleVersion: 1
}