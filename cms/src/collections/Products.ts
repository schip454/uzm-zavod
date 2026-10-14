import type { CollectionConfig } from 'payload'

const signedIn = ({ req: { user } }: { req: { user: unknown } }) => Boolean(user)

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Изделие', plural: 'Изделия' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'category', 'family', 'published'] },
  access: {
    read: ({ req: { user } }) => user ? true : { published: { equals: true } },
    create: signedIn,
    update: signedIn,
    delete: signedIn,
  },
  fields: [
    { name: 'slug', label: 'Адрес карточки', type: 'text', required: true, unique: true, index: true },
    { name: 'name', label: 'Название / серия', type: 'text', required: true },
    { name: 'category', label: 'Раздел каталога', type: 'relationship', relationTo: 'categories', required: true, index: true },
    { name: 'family', label: 'Группа изделий', type: 'text' },
    { name: 'form', label: 'Форма / исполнение', type: 'text' },
    { name: 'purpose', label: 'Назначение', type: 'text' },
    { name: 'description', label: 'Описание', type: 'textarea' },
    { name: 'specifications', label: 'Характеристики', type: 'array', fields: [
      { name: 'label', label: 'Параметр', type: 'text', required: true },
      { name: 'value', label: 'Значение', type: 'text', required: true },
    ] },
    { name: 'image', label: 'Фотография изделия', type: 'upload', relationTo: 'media' },
    { name: 'drawing', label: 'Чертёж', type: 'upload', relationTo: 'media' },
    { name: 'sourceUrl', label: 'Источник данных', type: 'text', admin: { description: 'Служебная ссылка для сверки характеристик перед публикацией' } },
    { name: 'published', label: 'Опубликовано', type: 'checkbox', defaultValue: false, required: true },
  ],
}
