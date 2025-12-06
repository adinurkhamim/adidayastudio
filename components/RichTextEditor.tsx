"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Code from "@tiptap/extension-code";
import Blockquote from "@tiptap/extension-blockquote";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code as CodeIcon,
  SquareCode,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";

type Props = {
  value?: string;
  onChange: (v: string) => void;
  onUploadImage: (file: File) => Promise<string>;
};

export default function RichTextEditor ({ value, onChange, onUploadImage }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  /* ---------------------------------------------------
   EDITOR INITIALIZATION
  --------------------------------------------------- */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        blockquote: false,
      }),

      Placeholder.configure({
        placeholder: "Write your story…",
      }),

      Underline,
      Blockquote,
      Code,

      TextAlign.configure({
        types: ["paragraph", "heading"],
      }),

      LinkExtension.configure({
        openOnClick: false,
      }),

      Image.configure({ inline: true }),
    ],

    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[260px] text-[15px] leading-relaxed focus:outline-none",
      },
    },

    immediatelyRender: false,
  });

  /* ---------------------------------------------------
   IMAGE HANDLING
  --------------------------------------------------- */
  async function handleChooseImage() {
    if (!onUploadImage) {
      return alert("Image upload handler missing.");
    }
    fileRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await onUploadImage(file);
      editor?.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (!editor) {
    return <p className="text-gray-400">Loading editor…</p>;
  }

  /* ---------------------------------------------------
   GENERIC BUTTON COMPONENT
  --------------------------------------------------- */
  const Btn = ({
    active,
    onClick,
    icon,
    disabled,
  }: {
    active?: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        p-2 rounded-lg ring-0 outline-none select-none
        transition 
        ${active ? "bg-white text-black" : "text-gray-300 hover:bg-white/10"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      {icon}
    </button>
  );

  /* ---------------------------------------------------
   UI
  --------------------------------------------------- */
  return (
    <div className="space-y-4">
      {/* ---------------------------------------------------
       TOOLBAR (sticky, premium UI)
      --------------------------------------------------- */}
      <div
        className="
        sticky top-0 z-20
        flex flex-wrap items-center gap-1
        bg-black/50 backdrop-blur-xl
        border border-white/10
        rounded-xl px-3 py-2
      "
      >
        <Btn
          icon={<Bold size={16} />}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />

        <Btn
          icon={<Italic size={16} />}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />

        <Btn
          icon={<UnderlineIcon size={16} />}
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />

        <Btn
          icon={<Heading2 size={16} />}
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />

        <Btn
          icon={<Heading3 size={16} />}
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />

        <Btn
          icon={<Quote size={16} />}
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />

        <Btn
          icon={<List size={16} />}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />

        <Btn
          icon={<ListOrdered size={16} />}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />

        <Btn
          icon={<Minus size={16} />}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />

        <Btn
          icon={<AlignLeft size={16} />}
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        />

        <Btn
          icon={<AlignCenter size={16} />}
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        />

        <Btn
          icon={<AlignRight size={16} />}
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        />

        <Btn
          icon={<CodeIcon size={16} />}
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />

        <Btn
          icon={<SquareCode size={16} />}
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />

        <Btn
          icon={<LinkIcon size={16} />}
          onClick={() => {
            const url = prompt("Enter URL");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
        />

        <Btn
          icon={<ImageIcon size={16} />}
          onClick={handleChooseImage}
          disabled={uploading}
        />
      </div>

      {/* ---------------------------------------------------
       HIDDEN FILE INPUT
      --------------------------------------------------- */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* ---------------------------------------------------
       EDITOR BOX
      --------------------------------------------------- */}
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
