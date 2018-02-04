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
