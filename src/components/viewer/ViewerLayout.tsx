import { useEffect } from 'react';
import { useWebIfc } from '@/hooks/useWebIfc';
import { MainToolbar } from './MainToolbar';
import { HierarchyPanel } from './HierarchyPanel';
import { ViewportContainer } from './ViewportContainer';
import { PropertiesPanel } from './PropertiesPanel';
import { StatusBar } from './StatusBar';
import { useViewerStore } from '@/stores';

export function ViewerLayout() {
  const leftPanelCollapsed = useViewerStore((state) => state.leftPanelCollapsed);
  const rightPanelCollapsed = useViewerStore((state) => state.rightPanelCollapsed);
  const { initEngine } = useWebIfc();
  const contentClassName = [
    'viewer-content',
    leftPanelCollapsed ? 'viewer-content--left-collapsed' : '',
    rightPanelCollapsed ? 'viewer-content--right-collapsed' : '',
    leftPanelCollapsed && rightPanelCollapsed ? 'viewer-content--both-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    void initEngine();
  }, [initEngine]);

  return (
    <main className="viewer-shell">
      <MainToolbar />
      <div className={contentClassName}>
        {!leftPanelCollapsed && <HierarchyPanel />}
        <ViewportContainer />
        {!rightPanelCollapsed && <PropertiesPanel />}
      </div>
      <StatusBar />
    </main>
  );
}
