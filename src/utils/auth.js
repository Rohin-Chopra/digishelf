import { Auth } from 'aws-amplify'

export const signUp = async (username, password, { email, name }) => {
  try {
    const { user } = await Auth.signUp({
      username,
      password,
      attributes: {
        email,
        name
      }
    })
    return user
  } catch (error) {
    return [null, error]
  }
}

export const verifyUser = async (username, code) => {
  try {
    await Auth.confirmSignUp(username, code)
    return true
  } catch (error) {
    return false
  }
}

export const signIn = async (username, password) => {
  try {
    const user = await Auth.signIn(username, password)
    return [user, null]
  } catch (error) {
    return [null, error]
  }
}

export const signOut = async () => {
  try {
    await Auth.signOut()
    return true
  } catch (error) {
    return false
  }
}

export const getCurrentUser = async () => {
  const user = await Auth.currentAuthenticatedUser()
  if (user === null) {
    return null
  }
  const token = user.signInUserSession.idToken.jwtToken
  return {
    user,
    token
  }
}
