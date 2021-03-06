const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()


  return [year, month, day].map(formatNumber).join('-') 
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const formatTimeToLocalDate = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

module.exports = {
  formatTime: formatTime,
  formatTimeToLocalDate
}
