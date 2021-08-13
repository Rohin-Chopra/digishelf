import {
  CognitoUserPool,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js'

export default new CognitoUserPool({
  UserPoolId: 'ap-southeast-2_FAT5skTdu',
  ClientId: '6sfl1jfp2dddll499nrphtrhsm'
})

export const setUserAttribute = (key, val) => {
  return new CognitoUserAttribute({
    Name: key,
    Value: val
  })
}
