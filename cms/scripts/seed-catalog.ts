import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { categories, products } from '../../src/data/catalog'

const payload = await getPayload({ config })

async function findBySlug(collection: 'categories' | 'products', slug: string) {
  const result = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return result.docs[0]
}

const categoryIds = new Map<string, number>()
for (const category of categories) {
  const existing = await findBySlug('categories', category.slug)
  if (existing) {
    categoryIds.set(category.slug, existing.id)
    continue
  }
  const saved = await payload.create({
    collection: 'categories',
    data: {
      slug: category.slug,
      title: category.title,
      direction: category.direction,
      note: category.note,
      description: category.description,
      application: category.application,
      selection: category.selection?.map((value) => ({ value })),
      published: false,
    },
  })
  categoryIds.set(category.slug, saved.id)
}

for (const category of categories) {
  if (!category.parentSlug) continue
  const id = categoryIds.get(category.slug)
  const parent = categoryIds.get(category.parentSlug)
  if (id && parent) {
    await payload.update({ collection: 'categories', id, data: { parent } })
  }
}

let imported = 0
for (const product of products) {
  if (await findBySlug('products', product.slug)) continue
  const category = categoryIds.get(product.categorySlug)
  if (!category) throw new Error(`No category for ${product.slug}: ${product.categorySlug}`)
  await payload.create({
    collection: 'products',
    data: {
      slug: product.slug,
      name: product.name,
      category,
      family: product.family,
      form: product.form,
      purpose: product.purpose,
      description: product.description,
      specifications: product.specifications,
      sourceUrl: product.sourceUrl,
      published: false,
    },
  })
  imported++
}

payload.logger.info(`Каталог: ${categories.length} разделов, ${products.length} изделий; добавлено ${imported} изделий.`)
await payload.destroy()
