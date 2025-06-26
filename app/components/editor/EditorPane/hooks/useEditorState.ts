import { useRef, useState } from 'react';
import { useVimMode } from "@/hooks/editor";
import { EditorState } from "../types/editorPane.types";

/**
 * Custom hook for managing editor state and vim integration
 */
export const useEditorState = (
  markdown: string,
  onChange: (value: string) => void,
  vimMode: boolean = false
): EditorState & {
  vim: ReturnType<typeof useVimMode>;
  setVimModeState: React.Dispatch<React.SetStateAction<'normal' | 'insert' | 'visual' | 'command'>>;
} => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [vimModeState, setVimModeState] = useState<'normal' | 'insert' | 'visual' | 'command'>('insert');

  // Vim mode integration
  const vim = useVimMode(textareaRef, markdown, onChange, {
    enabled: vimMode,
    onModeChange: setVimModeState,
  });

  return {
    vimModeState,
    textareaRef,
    vim,
    setVimModeState
  };
};
