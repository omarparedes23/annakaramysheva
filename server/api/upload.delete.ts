import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!body?.path) {
    throw createError({ statusCode: 400, statusMessage: 'Path is required' })
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2SecretAccessKey,
    },
  })

  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: config.r2BucketName,
      Key: body.path,
    }))

    return { success: true }
  }
  catch (e: any) {
    if (e.name === 'NoSuchKey') {
      throw createError({ statusCode: 404, statusMessage: 'File not found' })
    }
    throw createError({ statusCode: 500, statusMessage: e.message })
  }
})
