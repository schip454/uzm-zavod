import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Заявка', plural: 'Заявки' },
  admin: { useAsTitle: 'phone', defaultColumns: ['createdAt', 'phone', 'product', 'status'] },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'phone', label: 'Телефон', type: 'text', required: true },
    { name: 'email', label: 'Почта', type: 'email', required: true },
    { name: 'region', label: 'Регион', type: 'text', required: true },
    { name: 'inn', label: 'ИНН', type: 'text', required: true },
    { name: 'product', label: 'Изделие', type: 'text', required: true },
    { name: 'quantity', label: 'Количество', type: 'number', min: 1, required: true },
    { name: 'comment', label: 'Комментарий', type: 'textarea' },
    { name: 'attachment', label: 'Файл', type: 'upload', relationTo: 'media' },
    { name: 'status', label: 'Статус', type: 'select', defaultValue: 'new', required: true, options: [
      { label: 'Новая', value: 'new' },
      { label: 'В работе', value: 'processing' },
      { label: 'Закрыта', value: 'closed' },
    ] },
  ],
}
