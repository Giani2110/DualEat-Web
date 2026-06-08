import type { UploadableFile } from "@/interface/global.dto";
import {
  Bold,
  Strikethrough,
  List,
  ListOrdered,
  Undo,
  Redo,
  ImagePlus,
  Underline,
  ALargeSmall,
  Clapperboard,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CustomToolbarProps {
  editor: any;

  images: UploadableFile[];
  video: UploadableFile | null;

  handleFiles: (files: File[], type: "image" | "video") => void;
}

interface EditorToolbarProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

const useEditorState = (editor: any) => {
  const [state, setState] = useState({
    isBold: false,
    isStrike: false,
    isHeading1: false,
    isUnderline: false,
    isBulletList: false,
    isOrderedList: false,
    canUndo: false,
    canRedo: false,
  });

  useEffect(() => {
    if (!editor) return;

    const updateState = () => {
      setState({
        isBold: editor.isActive("bold"),
        isStrike: editor.isActive("strike"),
        isHeading1: editor.isActive("heading", { level: 1 }),
        isUnderline: editor.isActive("underline"),
        isBulletList: editor.isActive("bulletList"),
        isOrderedList: editor.isActive("orderedList"),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      });
    };

    updateState();

    editor.on("transaction", updateState);
    editor.on("selectionUpdate", updateState);
    editor.on("update", updateState);

    return () => {
      editor.off("transaction", updateState);
      editor.off("selectionUpdate", updateState);
      editor.off("update", updateState);
    };
  }, [editor]);

  return state;
};

export const CustomToolbar = ({
  editor,
  images,
  video,
  handleFiles,
}: CustomToolbarProps) => {
  const editorState = useEditorState(editor);

  const imageInputRef = useRef<any>(null);
  const videoInputRef = useRef<any>(null);

  const toggleBold = useCallback(
    () => editor?.chain().focus().toggleBold().run(),
    [editor],
  );
  const toggleStrike = useCallback(
    () => editor?.chain().focus().toggleStrike().run(),
    [editor],
  );
  const toggleHeading1 = useCallback(
    () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    [editor],
  );
  const toggleUnderline = useCallback(
    () => editor?.chain().focus().toggleUnderline().run(),
    [editor],
  );
  const toggleBulletList = useCallback(
    () => editor?.chain().focus().toggleBulletList().run(),
    [editor],
  );
  const toggleOrderedList = useCallback(
    () => editor?.chain().focus().toggleOrderedList().run(),
    [editor],
  );
  const undo = useCallback(
    () => editor?.chain().focus().undo().run(),
    [editor],
  );
  const redo = useCallback(
    () => editor?.chain().focus().redo().run(),
    [editor],
  );

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title,
  }: EditorToolbarProps) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={(e) => e.preventDefault()}
      disabled={disabled}
      title={title}
      className={`flex items-center cursor-pointer justify-center w-8 h-8 rounded transition-colors ${
        isActive
          ? "bg-[#e5a657] text-white"
          : "text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 py-1 px-2 border-b border-[#dbdbdb] bg-gray-50/50">
      {/* HISTORIAL */}
      <ToolbarButton
        onClick={undo}
        disabled={!editorState.canUndo}
        title="Deshacer"
      >
        <Undo size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={redo}
        disabled={!editorState.canRedo}
        title="Rehacer"
      >
        <Redo size={18} />
      </ToolbarButton>

      <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>

      {/* TÍTULOS */}
      <ToolbarButton
        onClick={toggleHeading1}
        isActive={editorState.isHeading1}
        title="Título 1"
      >
        <ALargeSmall size={22} />
      </ToolbarButton>

      <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>

      {/* FORMATO DE TEXTO */}
      <ToolbarButton
        onClick={toggleBold}
        isActive={editorState.isBold}
        title="Negrita"
      >
        <Bold size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={toggleUnderline}
        isActive={editorState.isUnderline}
        title="Subrayado"
      >
        <Underline size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={toggleStrike}
        isActive={editorState.isStrike}
        title="Tachado"
      >
        <Strikethrough size={18} />
      </ToolbarButton>

      <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>

      {/* LISTAS */}
      <ToolbarButton
        onClick={toggleBulletList}
        isActive={editorState.isBulletList}
        title="Lista de viñetas"
      >
        <List size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={toggleOrderedList}
        isActive={editorState.isOrderedList}
        title="Lista numerada"
      >
        <ListOrdered size={18} />
      </ToolbarButton>

      <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>

      <div className="flex-grow"></div>

      {/* MULTIMEDIA */}
      <button
        type="button"
        disabled={images.length >= 10 || video !== null}
        onClick={(e) => {
          e.preventDefault();
          imageInputRef.current?.click();
        }}
        onMouseDown={(e) => e.preventDefault()}
        onPointerDown={(e) => e.preventDefault()}
        className={`flex items-center cursor-pointer justify-center w-8 h-8 rounded transition-colors text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent ${images.length >= 10 || video !== null ? "opacity-50 cursor-not-allowed" : ""}`}
        title="Añadir Imagen"
      >
        <ImagePlus size={18} />
      </button>
      <button
        type="button"
        disabled={video !== null || images.length > 0}
        onClick={(e) => {
          e.preventDefault();
          videoInputRef.current?.click();
        }}
        onMouseDown={(e) => e.preventDefault()}
        onPointerDown={(e) => e.preventDefault()}
        className={`flex items-center cursor-pointer justify-center w-8 h-8 rounded transition-colors text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent ${video !== null || images.length > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        title="Añadir Video"
      >
        <Clapperboard size={18} />
      </button>

      {/* INPUT FILE */}
      <input
        type="file"
        ref={imageInputRef}
        multiple
        accept="image/jpeg, image/png, image/webp, image/jpg"
        onChange={(e) => {
          handleFiles(
            e.target.files ? Array.from(e.target.files) : [],
            "image",
          );
          e.target.value = "";
        }}
        className="hidden"
      />

      <input
        type="file"
        ref={videoInputRef}
        accept="video/mp4, video/quicktime, video/mov, video/avi"
        onChange={(e) => {
          handleFiles(
            e.target.files ? Array.from(e.target.files) : [],
            "video",
          );
          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
};
