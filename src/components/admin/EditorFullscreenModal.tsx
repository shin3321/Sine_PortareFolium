"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";

interface EditorFullscreenModalProps {
    isOpen: boolean;
    onClose: () => void;
    editor: Editor | null;
    toolbar: React.ReactNode;
    children: React.ReactNode;
    autosaveBanner?: React.ReactNode;
}

export default function EditorFullscreenModal({
    isOpen,
    onClose,
    toolbar,
    children,
    autosaveBanner,
}: EditorFullscreenModalProps) {
    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    if (!isOpen || typeof window === "undefined") return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-100 dark:bg-zinc-950">
            {/* Sticky glassmorphism toolbar */}
            <div className="sticky top-0 z-50">{toolbar}</div>

            {/* Autosave restore banner */}
            {autosaveBanner}

            {/* Scrollable paper canvas */}
            <div className="flex-1 overflow-y-auto">
                <div className="prose prose-lg mx-auto my-8 min-h-[1100px] max-w-4xl rounded-xl bg-white p-16 shadow-2xl dark:bg-zinc-900">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
