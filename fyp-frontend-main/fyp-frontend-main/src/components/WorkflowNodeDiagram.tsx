import React from 'react';
import { ArrowDown, GripVertical } from 'lucide-react';

interface WorkflowNodeDiagramProps {
  nodes: string[];
  activeNode: string | null;
  onResize: (e: React.MouseEvent) => void;
  isVisible: boolean; // Added to control visibility
}

export const WorkflowNodeDiagram: React.FC<WorkflowNodeDiagramProps> = ({ 
  nodes, 
  activeNode,
  onResize,
  isVisible
}) => {
  if (!isVisible) {
    return null; // Don't render if not visible
  }

  return (
    <div className="relative h-full group"> {/* Added group for hover effect on handle */}
      {/* Resize Handle */}
      <div 
        className="absolute -left-2.5 top-0 bottom-0 w-5 cursor-col-resize flex items-center justify-center z-10 group" // Adjusted width and positioning
        onMouseDown={onResize}
      >
        <div className="h-16 w-1.5 bg-gray-300 group-hover:bg-blue-500 rounded-full transition-colors duration-150" /> {/* Enhanced hover and transition */}
      </div>

      {/* Content */}
      <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col overflow-hidden"> {/* Added border and flex properties */}
        <div className="p-5 border-b border-gray-200"> {/* Adjusted padding */}
          <h3 className="text-base font-semibold text-gray-800">Workflow Progress</h3> {/* Adjusted text size and color */}
        </div>
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar"> {/* Adjusted padding */}
          {nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <p className="text-sm">No workflow steps initiated yet.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              {nodes.map((node, index) => (
                <React.Fragment key={index}>
                  <div 
                    className={`px-5 py-2.5 rounded-md font-medium transition-all duration-200 w-full text-sm shadow-sm ${ // Adjusted padding, added shadow
                      node === activeNode
                        ? 'bg-blue-500 border-2 border-blue-600 text-white scale-105' // Enhanced active state
                        : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200' // Enhanced default and hover state
                    }`}
                  >
                    {node}
                  </div>
                  {index < nodes.length - 1 && (
                    <div className="flex flex-col items-center my-1"> {/* Adjusted margin */}
                      <ArrowDown className={`h-5 w-5 ${node === activeNode || (nodes[index+1] === activeNode) ? 'text-blue-500 animate-pulse' : 'text-gray-300'}`} /> {/* Enhanced active arrow and animation */}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 