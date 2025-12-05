import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for processing
})

export const inpaintImage = async (imageDataUrl, maskDataUrl, iterations = 1) => {
  // Convert data URLs to Blobs
  const imageBlob = dataURLToBlob(imageDataUrl)
  const maskBlob = dataURLToBlob(maskDataUrl)

  const formData = new FormData()
  formData.append('image', imageBlob, 'image.jpg')
  formData.append('mask', maskBlob, 'mask.png')
  formData.append('iterations', iterations.toString())

  const response = await api.post('/inpaint/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const getJobStatus = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/`)
  return response.data
}

// Utility function to convert data URL to Blob
function dataURLToBlob(dataURL) {
  const byteString = atob(dataURL.split(',')[1])
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  
  return new Blob([ab], { type: mimeString })
}