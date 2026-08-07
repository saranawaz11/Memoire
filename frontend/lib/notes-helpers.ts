export default function stripHtml(raw: string): string {
  if (!raw) return ''
  const withoutTags = raw.replace(/<[^>]+>/g, ' ')
  const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null
  if (textarea) {
    textarea.innerHTML = withoutTags
    return textarea.value.replace(/\s+/g, ' ').trim()
  }
  return withoutTags.replace(/\s+/g, ' ').trim()
}