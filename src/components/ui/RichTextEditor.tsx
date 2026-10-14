import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import ImageExtension from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ label, active = false, disabled = false, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
      active
        ? 'border-red-900 bg-red-950 text-white'
        : 'border-stone-200 bg-white text-stone-700 hover:border-red-900 hover:text-red-950'
    } disabled:cursor-not-allowed disabled:opacity-40`}
  >
    {children}
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escreva seu conteúdo...',
  height = '300px',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      ImageExtension,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'min-h-full px-4 py-3 text-sm leading-7 text-stone-800 outline-none prose prose-stone max-w-none',
        'aria-label': placeholder,
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const editLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Endereço do link', previousUrl || 'https://');

    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-stone-300 bg-white focus-within:border-red-900 focus-within:ring-2 focus-within:ring-red-950/10">
      <div className="flex flex-wrap items-center gap-1 border-b border-stone-200 bg-stone-50 p-2">
        <select
          aria-label="Formato do texto"
          value={
            editor.isActive('heading', { level: 2 })
              ? '2'
              : editor.isActive('heading', { level: 3 })
                ? '3'
                : 'paragraph'
          }
          onChange={(event) => {
            const selected = event.target.value;
            if (selected === '2') editor.chain().focus().toggleHeading({ level: 2 }).run();
            else if (selected === '3') editor.chain().focus().toggleHeading({ level: 3 }).run();
            else editor.chain().focus().setParagraph().run();
          }}
          className="mr-1 h-9 rounded-md border border-stone-200 bg-white px-2 text-sm text-stone-700 outline-none focus:border-red-900"
        >
          <option value="paragraph">Texto</option>
          <option value="2">Título</option>
          <option value="3">Subtítulo</option>
        </select>

        <ToolbarButton label="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Itálico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Sublinhado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Tachado" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Lista" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Citação" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Adicionar ou editar link" active={editor.isActive('link')} onClick={editLink}><Link className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Remover link" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}><Unlink className="h-4 w-4" /></ToolbarButton>
        <span className="mx-1 h-6 w-px bg-stone-200" aria-hidden="true" />
        <ToolbarButton label="Desfazer" disabled={!editor.can().chain().focus().undo().run()} onClick={() => editor.chain().focus().undo().run()}><Undo2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Refazer" disabled={!editor.can().chain().focus().redo().run()} onClick={() => editor.chain().focus().redo().run()}><Redo2 className="h-4 w-4" /></ToolbarButton>
      </div>

      <div style={{ minHeight: height }}>
        <EditorContent editor={editor} className="min-h-[inherit] [&_.ProseMirror]:min-h-[inherit]" />
      </div>
    </div>
  );
};
