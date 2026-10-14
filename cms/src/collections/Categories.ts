import type { CollectionConfig } from 'payload'

const signedIn = ({ req: { user } }: { req: { user: unknown } }) => Boolean(user)

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Раздел каталога', plural: 'Разделы каталога' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'direction', 'parent', 'published'] },
  access: {
    read: ({ req: { user } }) => user ? true : { published: { equals: true } },
    create: signedIn,
    update: signedIn,
    delete: signedIn,
  },
  fields: [
    { name: 'slug', label: 'Адрес страницы', type: 'text', required: true, unique: true, index: true },
    { name: 'title', label: 'Название', type: 'text', required: true },
    { name: 'direction', label: 'Направление', type: 'select', required: true, options: [
      { label: 'Металлоконструкции', value: 'metal' },
      { label: 'Опоры и освещение', value: 'lighting' },
    ] },
    { name: 'parent', label: 'Родительский раздел', type: 'relationship', relationTo: 'categories' },
    { name: 'note', label: 'Краткое описание', type: 'textarea' },
    { name: 'description', label: 'Описание раздела', type: 'textarea' },
    { name: 'application', label: 'Применение', type: 'textarea' },
    { name: 'selection', label: 'Данные для расчёта', type: 'array', fields: [
      { name: 'value', label: 'Параметр', type: 'text', required: true },
    ] },
    { name: 'image', label: 'Фотография', type: 'upload', relationTo: 'media' },
    { name: 'published', label: 'Опубликован', type: 'checkbox', defaultValue: false, required: true },
  ],
}
