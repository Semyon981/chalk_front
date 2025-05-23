import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

export default function TiptapEditor({
    initialContent,
    onUpdate,
    onBlur,
}: {
    initialContent: string;
    onUpdate: (content: string) => void;
    onBlur: () => void;
}) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Начните вводить текст...',
            }),
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: 'prose prose-invert focus:outline-none max-w-none h-full min-h-[4rem] p-2',
            },
        },
        onUpdate: ({ editor }) => {
            onUpdate(editor.getHTML());
        },
        onBlur,
    });

    useEffect(() => {
        if (editor) {
            editor.commands.focus('end');
        }
    }, [editor]);

    return <EditorContent editor={editor} />;
}