"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useState } from "react";
import { updatePropertyAbout } from "./action";
import {
  Bold, Underline as UnderlineIcon, List, ListOrdered,
  Heading2, Pilcrow, Save, CheckCircle2, FileText
} from "lucide-react";

export default function AboutPropertyEditor({
  propertyId,
  initialValue,
}: {
  propertyId: number;
  initialValue: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]     = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialValue || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[180px] p-4 focus:outline-none text-[#0D0D0D] leading-relaxed",
      },
    },
  });

  async function saveAbout() {
    if (!editor) return;
    setLoading(true);
    await updatePropertyAbout(propertyId, editor.getHTML());
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!editor) return null;

  // Toolbar button helper
  const ToolBtn = ({
    onClick, active = false, children, title,
  }: {
    onClick: () => void; active?: boolean; children: React.ReactNode; title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all text-sm
        ${active
          ? "bg-[#0D0D0D] text-white shadow-sm"
          : "text-[#3A3A3A] hover:bg-[#EDEDED]"
        }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-[#0D0D0D] flex items-center justify-center">
          <FileText size={13} className="text-white" />
        </div>
        <h3 className="font-semibold text-[#0D0D0D] text-sm">About Property</h3>
      </div>

      {/* Hint */}
      <div className="flex items-start gap-2 bg-[#F7F7F7] border border-[#EDEDED] rounded-xl p-3">
        <div className="w-1 min-h-[16px] rounded-full bg-[#0D0D0D] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#B0B0B0] leading-relaxed">
          Write a rich description. This is rendered as HTML in the mobile app using the flutter_html package.
        </p>
      </div>

      {/* Editor container */}
      <div className="border border-[#EDEDED] rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#0D0D0D]/10 focus-within:border-[#0D0D0D] transition-all">

        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#EDEDED] bg-[#F7F7F7]">
          <ToolBtn
            title="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <Bold size={13} />
          </ToolBtn>
          <ToolBtn
            title="Underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          >
            <UnderlineIcon size={13} />
          </ToolBtn>
          <div className="w-px h-4 bg-[#EDEDED] mx-1" />
          <ToolBtn
            title="Heading"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 size={13} />
          </ToolBtn>
          <ToolBtn
            title="Paragraph"
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive("paragraph")}
          >
            <Pilcrow size={13} />
          </ToolBtn>
          <div className="w-px h-4 bg-[#EDEDED] mx-1" />
          <ToolBtn
            title="Bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            <List size={13} />
          </ToolBtn>
          <ToolBtn
            title="Ordered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <ListOrdered size={13} />
          </ToolBtn>

          {/* Character count */}
          <div className="ml-auto text-[10px] text-[#B0B0B0] pr-1">
            {editor.getText().length} chars
          </div>
        </div>

        {/* Editor content */}
        <EditorContent editor={editor} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={saveAbout}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D0D0D] text-white text-sm font-medium hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Save size={14} />
          {loading ? "Saving..." : saved ? "Saved ✓" : "Save About"}
        </button>

        {saved && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 size={13} />
            About property saved
          </span>
        )}
      </div>
    </div>
  );
}