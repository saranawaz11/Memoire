'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Highlighter,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  Code,
  Code2,
} from 'lucide-react'

type TiptapProps = {
  content: string
  onChange: (value: string) => void
  onReady?: (editor: Editor | null) => void
  editorClassName?: string
}

const Tiptap = ({ content, onChange, onReady, editorClassName }: TiptapProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          editorClassName ??
          'rich-text w-full text-stone-600 text-[15px] leading-[1.85] outline-none min-h-[280px] focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Hand the live editor instance up to whoever's rendering this,
  // so the toolbar can live anywhere (bottom bar, side rail, etc.)
  // instead of being hardcoded inside this component.
  useEffect(() => {
    onReady?.(editor ?? null)
    return () => onReady?.(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  return <EditorContent editor={editor} />
}

export default Tiptap

// ---- toolbar, exported separately so any page can position it ----

type ToolbarBtnProps = {
  onClick: () => void
  isActive: boolean
  title: string
  children: React.ReactNode
}

const ToolbarBtn = ({ onClick, isActive, title, children }: ToolbarBtnProps) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
      isActive
        ? 'bg-[var(--pine-deep)]/10 text-[var(--pine-deep)]'
        : 'text-[var(--ink-soft)] hover:bg-black/5 hover:text-[var(--ink)]'
    }`}
  >
    {children}
  </button>
)

type TiptapToolbarProps = {
  editor: Editor | null
  orientation?: 'horizontal' | 'vertical'
}

export function TiptapToolbar({ editor, orientation = 'horizontal' }: TiptapToolbarProps) {
  if (!editor) return null

  const isVertical = orientation === 'vertical'
  const listClass = isVertical
    ? 'flex flex-col items-center gap-0.5'
    : 'flex items-center gap-1'
  const dividerClass = isVertical
    ? 'w-6 h-px bg-[var(--rule)] my-1 self-center'
    : 'w-px h-4 bg-[var(--rule)] mx-1'

  return (
    <div className={listClass}>
      {/* Headings */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
        <span className="text-[11px] font-bold w-4 text-center">H1</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
        <span className="text-[11px] font-bold w-4 text-center">H2</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
        <span className="text-[11px] font-bold w-4 text-center">H3</span>
      </ToolbarBtn>

      <div className={dividerClass} />

      {/* Text formatting */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
        <BoldIcon size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
        <ItalicIcon size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
        <UnderlineIcon size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
        <Strikethrough size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
        <Highlighter size={14} />
      </ToolbarBtn>

      <div className={dividerClass} />

      {/* Lists */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
        <List size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
        <ListOrdered size={14} />
      </ToolbarBtn>

      <div className={dividerClass} />

      {/* Blocks */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
        <Quote size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
        <Code size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
        <Code2 size={14} />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} isActive={false} title="Horizontal Rule">
        <Minus size={14} />
      </ToolbarBtn>
    </div>
  )
}