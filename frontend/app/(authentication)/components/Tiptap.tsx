'use client'

import { useEditor, EditorContent } from '@tiptap/react'
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
  showToolbar: boolean
}

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
    className={`p-2 rounded-lg transition-colors ${
      isActive ? 'bg-green-100 text-green-700' : 'text-stone-500 hover:bg-stone-100'
    }`}
  >
    {children}
  </button>
)

const Divider = () => <div className="w-px h-4 bg-stone-200 mx-1" />

const Tiptap = ({ content, onChange, showToolbar }: TiptapProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,       // covers bold, italic, strike, headings, lists, blockquote, hr, code, codeblock, history
      Underline,        // not in StarterKit
      Highlight,        // not in StarterKit
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rich-text w-full text-stone-600 text-[15px] leading-[1.85] outline-none min-h-[280px] focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <>
      {showToolbar && editor && (
        <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-2xl px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">

            {/* Headings */}
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
              <span className="text-xs font-bold w-4 text-center">H1</span>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
              <span className="text-xs font-bold w-4 text-center">H2</span>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
              <span className="text-xs font-bold w-4 text-center">H3</span>
            </ToolbarBtn>

            <Divider />

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

            <Divider />

            {/* Lists */}
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
              <List size={14} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
              <ListOrdered size={14} />
            </ToolbarBtn>

            <Divider />

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
        </div>
      )}

      <EditorContent editor={editor} />
    </>
  )
}

export default Tiptap