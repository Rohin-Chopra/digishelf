const dynamodb = require('aws-sdk/clients/dynamodb')
const docClient = new dynamodb.DocumentClient()
const slugify = require('slugify')

exports.addShelve = async (event, context) => {
  let res
  let statusCode

  try {
    const body = JSON.parse(event.body)

    const params = {
      TableName: 'DigishelfShelves',
      Item: {
        name: body.name,
        description: body.description,
        created_by: body.created_by,
        publicity: body.publicity || 'public',
        coverImg: body.coverImg,
        media: [],
        slug: slugify(body.name),
        createdAt: Date.now()
      }
    }

    const result = await docClient.put(params).promise()

    res = {
      status: 'success',
      data: {
        result
      }
    }
  } catch (error) {
    statusCode = 500
    res = {
      status: 'error',
      message: error.message
    }
  }

  return {
    statusCode,
    body: res
  }
}
