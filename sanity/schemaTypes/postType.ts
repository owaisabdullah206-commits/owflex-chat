import { defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: 'Used for the search snippet and social card. Aim for 150–160 characters.',
      validation: (r) => r.required().min(50).max(200),
    }),
    defineField({
      name: 'keyword',
      title: 'Primary keyword',
      type: 'string',
      description: 'The main search term this post targets (for your reference).',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'readingMinutes',
      title: 'Reading time (minutes)',
      type: 'number',
      validation: (r) => r.min(1).max(60),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Body (Markdown)',
      type: 'text',
      rows: 30,
      description: 'Write the article in Markdown. Supports headings (##), lists, tables, links, and bold.',
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    { title: 'Published, newest first', name: 'publishedDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt' },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString() : 'Unpublished',
      }
    },
  },
})
