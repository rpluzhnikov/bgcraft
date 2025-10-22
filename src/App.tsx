import { Editor } from './pages/Editor';
import { EditorNew } from './pages/EditorNew';
import { ResponsiveEditor } from './components/editor/ResponsiveEditor';
import { ModernEditor } from './components/layout/ModernEditor';

// Feature flags
const USE_NEW_UI = true;
const USE_RESPONSIVE = true; // Enable responsive design
const USE_MODERN_LAYOUT = true; // Enable the new refactored layout

function App() {
  // New modern layout with top toolbar and bottom layers drawer
  if (USE_MODERN_LAYOUT) {
    return <ModernEditor />;
  }

  // Previous responsive layout
  if (USE_NEW_UI && USE_RESPONSIVE) {
    return <ResponsiveEditor />;
  }

  // Legacy layouts
  return USE_NEW_UI ? <EditorNew /> : <Editor />;
}

export default App;
