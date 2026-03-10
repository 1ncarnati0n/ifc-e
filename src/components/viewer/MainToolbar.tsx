import { useWebIfc } from '@/hooks/useWebIfc';
import { useViewerStore } from '@/stores';
import { useRef, type ChangeEvent } from 'react';

export function MainToolbar() {
  const toggleLeftPanel = useViewerStore((state) => state.toggleLeftPanel);
  const toggleRightPanel = useViewerStore((state) => state.toggleRightPanel);
  const { loadFile, resetSession, loading, initEngine, engineState } = useWebIfc();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      await loadFile(file);
    } catch (error) {
      console.error(error);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <header className="viewer-toolbar">
      <input
        ref={fileInputRef}
        type="file"
        accept=".ifc,.ifcz"
        className="viewer-hidden-input"
        onChange={(event) => {
          void handleFileChange(event);
        }}
      />
      <div className="viewer-toolbar__brand">
        <span className="viewer-toolbar__badge">ifc-e</span>
        <strong>IFC Viewer</strong>
      </div>
      <div className="viewer-toolbar__actions">
        <button type="button" onClick={toggleLeftPanel}>
          좌측 패널
        </button>
        <button type="button" onClick={toggleRightPanel}>
          우측 패널
        </button>
        <button
          type="button"
          onClick={() => void initEngine()}
          disabled={engineState === 'initializing' || engineState === 'ready'}
        >
          {engineState === 'ready' ? '엔진 준비 완료' : engineState === 'initializing' ? '엔진 초기화 중...' : '엔진 초기화'}
        </button>
        <button type="button" onClick={handleOpenFile} disabled={loading || engineState !== 'ready'}>
          {loading ? '로딩 중...' : 'IFC 열기'}
        </button>
        <button type="button" onClick={() => void resetSession()}>
          세션 초기화
        </button>
      </div>
    </header>
  );
}
