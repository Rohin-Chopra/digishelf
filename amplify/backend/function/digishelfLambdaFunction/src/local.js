require('dotenv').config()
const app = require('./app')

const port = 5000

app.listen(port, () => {
  console.log(`Digishelf API listening on port ${port}`)
})
