"use client";

import { useState, useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import Image from "@tiptap/extension-image";
import { FoliumTableExtension } from "@/extensions/FoliumTableExtension";
import EditorToolbar from "@/components/admin/EditorToolbar";
import EditorFullscreenModal from "@/components/admin/EditorFullscreenModal";
import TiptapImageUpload from "@/components/admin/TiptapImageUpload";

interface RichMarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    folderPath?: string;
    storageKey?: string;
    onEditorReady?: (editor: Editor) => void;
}

export default function RichMarkdownEditor({
    value,
    onChange,
    placeholder,
    disabled = false,
    folderPath,
    storageKey,
    onEditorReady,
}: RichMarkdownEditorProps) {
    const AUTOSAVE_KEY = `portare_autosave_editor_${storageKey ?? "default"}`;

    // 이미지 업로드 모달 상태
    const [imageUploadOpen, setImageUploadOpen] = useState(false);

    const initialContent = useMemo(() => {
        if (!value) return "";
        if (value.trimStart().startsWith("{")) {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                codeBlock: { languageClassPrefix: "language-" },
            }),
            Markdown.configure({ html: true, tightLists: true }),
            Image.configure({ inline: true, allowBase64: true }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Youtube.configure({ controls: false, nocookie: true }),
            Placeholder.configure({
                placeholder: placeholder ?? "Start writing...",
            }),
            FoliumTableExtension.configure({ resizable: false }),
        ],
        content: initialContent,
        editable: !disabled,
        onUpdate({ editor: e }) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const md = (e.storage as any).markdown.getMarkdown() as string;
            onChange(md);
        },
    });

    // editor 준비 콜백
    useEffect(() => {
        if (editor && onEditorReady) onEditorReady(editor);
    }, [editor, onEditorReady]);

    // --- Autosave (localStorage, 5-second interval) ---
    useEffect(() => {
        if (!editor || disabled) return;
        const id = setInterval(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const md = (editor.storage as any).markdown.getMarkdown() as string;
            if (md) {
                localStorage.setItem(
                    AUTOSAVE_KEY,
                    JSON.stringify({
                        content: md,
                        savedAt: new Date().toISOString(),
                    })
                );
            }
        }, 5000);
        return () => clearInterval(id);
    }, [editor, disabled, AUTOSAVE_KEY]);

    // --- Fullscreen ---
    const [isFullscreen, setIsFullscreen] = useState(false);
    const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

    return (
        <>
            {/* Normal inline mode */}
            <div className={isFullscreen ? "invisible" : ""}>
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                    <EditorToolbar
                        editor={editor}
                        isFullscreen={false}
                        onToggleFullscreen={toggleFullscreen}
                    />
                    {/* 이미지 삽입 버튼 바 */}
                    <div className="relative flex items-center gap-2 border-b border-zinc-200 px-3 py-1.5 dark:border-zinc-700">
                        <button
                            type="button"
                            onClick={() => setImageUploadOpen(true)}
                            className="flex items-center gap-1 rounded-lg border border-(--color-border) px-2.5 py-1 text-sm text-(--color-muted) hover:bg-(--color-surface-subtle)"
                            title="Insert Image"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect
                                    width="18"
                                    height="18"
                                    x="3"
                                    y="3"
                                    rx="2"
                                    ry="2"
                                />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                            <span>Image</span>
                        </button>
                    </div>
                    <div className="prose prose-base min-h-[300px] max-w-none p-6">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>

            {/* Fullscreen modal */}
            <EditorFullscreenModal
                isOpen={isFullscreen}
                onClose={() => setIsFullscreen(false)}
                editor={editor}
                toolbar={
                    <div className="relative flex items-center">
                        <EditorToolbar
                            editor={editor}
                            isFullscreen={true}
                            onToggleFullscreen={toggleFullscreen}
                        />
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            aria-label="Exit fullscreen"
                        >
                            ✕
                        </button>
                    </div>
                }
                autosaveBanner={
                    <>
                        {/* Fullscreen 이미지 삽입 버튼 바 */}
                        <div className="relative flex items-center gap-2 border-b border-zinc-200 px-3 py-1.5 dark:border-zinc-700">
                            <button
                                type="button"
                                onClick={() => setImageUploadOpen(true)}
                                className="flex items-center gap-1 rounded-lg border border-(--color-border) px-2.5 py-1 text-sm text-(--color-muted) hover:bg-(--color-surface-subtle)"
                                title="Insert Image"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        width="18"
                                        height="18"
                                        x="3"
                                        y="3"
                                        rx="2"
                                        ry="2"
                                    />
                                    <circle cx="9" cy="9" r="2" />
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                </svg>
                                <span>Image</span>
                            </button>
                        </div>
                    </>
                }
            >
                <EditorContent editor={editor} />
            </EditorFullscreenModal>

            {/* 이미지 업로드 모달 */}
            <TiptapImageUpload
                editor={editor}
                isOpen={imageUploadOpen}
                onClose={() => setImageUploadOpen(false)}
                folderPath={folderPath}
            />
        </>
    );
}
