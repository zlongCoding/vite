const WriteSocket = `
var ws = new WebSocket('ws://localhost:3030')
ws.onopen = function() {
  ws.send('socket 建立链接')
}
// 接收
ws.onmessage = function(msg) { 
  console.log(msg.data)
  const data = JSON.parse(msg.data)
  if (data.type){
    window.location.reload()
  }
  
}
`
module.exports = WriteSocket