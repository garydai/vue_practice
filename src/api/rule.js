import request from '@/utils/request'

export function getList() {
  return request({
    url: '/list',
    method: 'get'
  })
}

export function getVariables() {
  return request({
    url: '/variables',
    method: 'get'
  })
}

// todo refine
export function updateRule(data) {
  return request.formPost('/update', data)
}
