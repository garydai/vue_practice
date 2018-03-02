import request from '@/utils/request'

export function getList() {
  return request({
    url: '/drl/list',
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

export function addRule(data) {
  return request.formPost('/add', data)
}

export function executeRule(data) {
  return request.formPost('/execute', data)
}

export function testRule(data) {
  return request.formPost('/test', data)
}

export function activateRule(data) {
  return request.formPost('/activate', data)
}

export function getDrl(id) {
  return request({
    url: '/drl/' + id,
    method: 'get'
  })
}

export function insertFlow(data) {
  return request.formPost('/workflow/add', data)
}

export function getFlow() {
  return request({
    url: '/workflow',
    method: 'get'
  })
}

