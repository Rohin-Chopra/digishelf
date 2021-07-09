exports.index = async (event, context) => {
  let response

  try {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Welcome to DigiShelf API'
      })
    }
  } catch (err) {
    console.log(err)
    return err
  }

  return response
}
