import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
    content?: string;
    onChange: (content: string) => void;
    editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-slate-900 border-b border-white/5 rounded-t-xl">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors ${editor.isActive('bold') ? 'bg-white/20 text-white' : ''}`}
                title="Negrito"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors ${editor.isActive('italic') ? 'bg-white/20 text-white' : ''}`}
                title="Itálico"
            >
                <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-white/20 text-white' : ''}`}
                title="Título 1"
            >
                <Heading1 className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white/20 text-white' : ''}`}
                title="Título 2"
            >
                <Heading2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1 self-center" />
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors ${editor.isActive('bulletList') ? 'bg-white/20 text-white' : ''}`}
                title="Lista com Marcadores"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors ${editor.isActive('orderedList') ? 'bg-white/20 text-white' : ''}`}
                title="Lista Numerada"
            >
                <ListOrdered className="w-4 h-4" />
            </button>
        </div>
    );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content = '', onChange, editable = true }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Escreva suas anotações ou o conteúdo do flashcard aqui...',
            })
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 font-mono text-sm text-slate-300',
            },
        },
    });

    return (
        <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
            {editable && <MenuBar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
};
