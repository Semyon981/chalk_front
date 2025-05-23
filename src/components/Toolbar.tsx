import { Editor } from "@tiptap/react";
import { Bold, Italic, List, ListOrdered, Heading2, Undo, Redo } from "lucide-react";

export default function Toolbar({ editor }: { editor: Editor | null }) {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-1 p-1 border-b border-cgray-600 bg-cgray-800">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-cgray-600 ${editor.isActive("bold") ? "bg-cgray-600 text-white" : "text-gray-400"
                    }`}
            >
                <Bold className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-cgray-600 ${editor.isActive("italic") ? "bg-cgray-600 text-white" : "text-gray-400"
                    }`}
            >
                <Italic className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-cgray-600 ${editor.isActive("heading") ? "bg-cgray-600 text-white" : "text-gray-400"
                    }`}
            >
                <Heading2 className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-cgray-600 ${editor.isActive("bulletList") ? "bg-cgray-600 text-white" : "text-gray-400"
                    }`}
            >
                <List className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-cgray-600 ${editor.isActive("orderedList") ? "bg-cgray-600 text-white" : "text-gray-400"
                    }`}
            >
                <ListOrdered className="h-4 w-4" />
            </button>

            <div className="mx-2 border-r border-cgray-600" />

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                className="p-2 rounded text-gray-400 hover:bg-cgray-600"
            >
                <Undo className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                className="p-2 rounded text-gray-400 hover:bg-cgray-600"
            >
                <Redo className="h-4 w-4" />
            </button>
        </div>
    );
}