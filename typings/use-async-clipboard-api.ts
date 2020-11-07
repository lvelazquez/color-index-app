interface ClipboardItem {
  new (input: { [contentType: string]: Blob }): ClipboardItem;
}

type AsyncClipboardWriteFunction = (input: ClipboardItem) => Promise<void>;

declare global {
  interface Window {
    ClipboardItem: ClipboardItem | undefined;
  }

  interface Clipboard {
    write?: AsyncClipboardWriteFunction;
  }
}

interface AsyncClipboard extends Clipboard {
  write: AsyncClipboardWriteFunction;
}

type ClipboardApi = {
  clipboard: AsyncClipboard;
  ClipboardItem: ClipboardItem;
};

export const getAsyncClipboardApi: () => ClipboardApi | null = () => {
  if (
    typeof window === "undefined" ||
    typeof window.navigator.clipboard === "undefined" ||
    typeof window.navigator.clipboard.write === "undefined" ||
    typeof window.ClipboardItem === "undefined"
  ) {
    return null;
  }
  return {
    ClipboardItem: window.ClipboardItem,
    clipboard: navigator.clipboard as AsyncClipboard,
  };
};