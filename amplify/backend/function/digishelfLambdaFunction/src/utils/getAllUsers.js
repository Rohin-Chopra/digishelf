const AWS = require('aws-sdk')
const cognitoProvider = new AWS.CognitoIdentityServiceProvider({
  region: 'ap-southeast-2'
})

module.exports = () => new Promise((resolve, reject) => {
  cognitoProvider.listUsers({
    UserPoolId: "ap-southeast-2_naYfZQIg6",
    AttributesToGet: ["name", 'email']
  }, (err, data) => {
    if (err) {
      console.log(err, err.stack)
      reject(err)
    } else {
      const users = data.Users.map((user) => ({
        name: user.Attributes[0].Value,
        email: user.Attributes[1].Value
      }))
      resolve(users)
    }
  })
})