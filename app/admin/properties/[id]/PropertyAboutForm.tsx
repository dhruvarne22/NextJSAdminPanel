"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useState } from "react";
import { updatePropertyAbout } from "./action";


export default function AboutPropertyEditor({
  propertyId,
  initialValue,
}: {
  propertyId: number;
  initialValue: string | null;
}) {
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialValue || "<p></p>",
     immediatelyRender: false, // ✅ FIX
  });

  async function saveAbout() {
    if (!editor) return;

    setLoading(true);
    const html = editor.getHTML();


    await updatePropertyAbout(propertyId, html);
    setLoading(false);

    alert("About Property saved");
  }

  if (!editor) return null;

  return (
    <div className="bg-background p-4 rounded border space-y-3">
      <h3 className="font-semibold">About Property</h3>

      {/* Toolbar */}
      <div className="flex gap-2 border p-2 rounded bg-muted">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          <b>B</b>
        </button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <u>U</u>
        </button>
        <button onClick={() => editor.chain().focus().setParagraph().run()}>
          P
        </button>
      </div>

      {/* Editor */}
      <div className="border rounded p-2 min-h-[150px]">
        <EditorContent editor={editor} />
      </div>

      <button
        onClick={saveAbout}
        disabled={loading}
        className="px-4 py-2 text-sm rounded bg-primary text-white"
      >
        {loading ? "Saving..." : "Save About Property"}
      </button>
    </div>
  );
}
