const getBase64Image = async (file) =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    let result = null
    reader.onloadend = () => {
      result = {
        name: file.name,
        type: file.type,
        size: Math.round(file.size / 1000) + ' kB',
        base64: reader.result,
        file: file
      }
      resolve(result)
    }
  })

export default getBase64Image
