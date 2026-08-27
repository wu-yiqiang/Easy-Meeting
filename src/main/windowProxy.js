export const windowManage = {}

export const saveWindow = (id, window) => {
  windowManage[id] = window
}
export const getWindow = (id) => {
  return windowManage[id]
}
export const delWindow = (id) => {
  delete windowManage[id]
}

export const getWindowmanage = () => {
  return windowManage
}