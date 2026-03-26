// Tiptap editor context hook
// 전달된 editor 우선, 없으면 EditorContext에서 가져옴
import { useCurrentEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";

export function useTiptapEditor(providedEditor?: Editor | null): {
    editor: Editor | null;
} {
    const { editor: contextEditor } = useCurrentEditor();
    return { editor: providedEditor ?? contextEditor ?? null };
}
