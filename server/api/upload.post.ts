import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  const fileField = formData.find(f => f.name === 'file')
  if (!fileField || !fileField.data || !fileField.filename) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  const collectionSlug = formData.find(f => f.name === 'collectionSlug')?.data?.toString() || ''
  const productSlug = formData.find(f => f.name === 'productSlug')?.data?.toString() || ''
  const position = formData.find(f => f.name === 'position')?.data?.toString() || '0'

  const file = fileField
  const ext = file.filename.split('.').pop()?.toLowerCase() || 'jpg'
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/quicktime']

  if (!file.type || !allowedTypes.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file type. Allowed: JPEG, PNG, WebP, AVIF, MP4' })
  }

  const isVideo = file.type.startsWith('video/')
  const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024

  if (file.data.length > maxSize) {
    const label = isVideo ? '100MB' : '10MB'
    throw createError({ statusCode: 413, statusMessage: `File too large. Maximum ${label}` })
  }

  const path = `${collectionSlug}/${productSlug}-${position}.${ext}`

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2SecretAccessKey,
    },
  })

  await s3.send(new PutObjectCommand({
    Bucket: config.r2BucketName,
    Key: path,
    Body: file.data,
    ContentType: file.type,
  }))

  const publicUrl = `${config.public.r2PublicUrl}/${path}`
  const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image'

  return { url: publicUrl, path, mediaType }
})
