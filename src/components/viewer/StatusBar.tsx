import { useWebIfc } from '@/hooks/useWebIfc';
import { useViewerStore } from '@/stores';

export function StatusBar() {
  const selectedEntityId = useViewerStore((state) => state.selectedEntityId);
  const hiddenEntityIds = useViewerStore((state) => state.hiddenEntityIds);
  const { loading, progress, engineState, currentModelSchema } = useWebIfc();

  return (
    <footer className="viewer-statusbar">
      <span>상태: {loading ? progress : 'Mock engine contract 연결 완료'}</span>
      <span>엔진: {engineState}</span>
      <span>Schema: {currentModelSchema ?? '-'}</span>
      <span>선택: {selectedEntityId ?? '없음'}</span>
      <span>숨김: {hiddenEntityIds.size}</span>
      <span>테마: Light 기본값</span>
    </footer>
  );
}
