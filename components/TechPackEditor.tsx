import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, Plus, Trash2 } from 'lucide-react';
import { Project, UserRole, ProjectStatus, UploadedTechPack } from '../types';

interface TechPackEditorProps {
  project: Project;
  currentUserRole: UserRole;
  onUpdateProject: (updatedProject: Project) => void;
  onBack: () => void;
  onStatusChange: (newStatus: ProjectStatus) => void;
  onAddComment: (text: string) => void;
}

const TechPackEditor: React.FC<TechPackEditorProps> = ({ 
  project, 
  onUpdateProject, 
  onBack 
}) => {
  const [activeFileId, setActiveFileId] = useState<string>(project.techPackFiles?.[0]?.id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFile = project.techPackFiles?.find(f => f.id === activeFileId);

  const handleUploadVersion = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const fileUrl = URL.createObjectURL(file);
          const name = prompt("Enter Name for this version (e.g. Fit 2):", `Fit ${project.techPackFiles.length + 1}`);
          
          if (name) {
              const newFile: UploadedTechPack = {
                  id: `file-${Date.now()}`,
                  name: name,
                  fileUrl: fileUrl,
                  uploadDate: new Date().toISOString()
              };
              
              const updatedProject = {
                  ...project,
                  techPackFiles: [...(project.techPackFiles || []), newFile]
              };
              
              onUpdateProject(updatedProject);
              setActiveFileId(newFile.id);
          }
      }
  };

  const handleDeleteVersion = (fileId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm("Delete this version?")) {
          const newFiles = project.techPackFiles.filter(f => f.id !== fileId);
          onUpdateProject({ ...project, techPackFiles: newFiles });
          if (activeFileId === fileId && newFiles.length > 0) {
              setActiveFileId(newFiles[0].id);
          }
      }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 flex-col">
      {/* Top Bar */}
      <div className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-4 shrink-0 z-30">
          <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                  <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                  <h1 className="font-bold text-gray-800 leading-tight">{project.title}</h1>
                  <span className="text-xs text-gray-500">PDF Viewer Mode</span>
              </div>
          </div>
          
          <div>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleUploadVersion} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-800"
              >
                  <Upload className="w-4 h-4" /> Upload New Version
              </button>
          </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-100 font-bold text-xs text-gray-500 uppercase tracking-wider">
                  Uploaded Files
              </div>
              <div className="flex-grow overflow-y-auto">
                  {(project.techPackFiles || []).map(file => (
                      <div 
                        key={file.id}
                        onClick={() => setActiveFileId(file.id)}
                        className={`p-3 border-b border-gray-100 cursor-pointer flex justify-between items-center group ${activeFileId === file.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}`}
                      >
                          <div className="flex items-center gap-3">
                              <FileText className={`w-5 h-5 ${activeFileId === file.id ? 'text-blue-500' : 'text-gray-400'}`} />
                              <div>
                                  <div className="text-sm font-bold text-gray-700">{file.name}</div>
                                  <div className="text-[10px] text-gray-400">{new Date(file.uploadDate).toLocaleDateString()}</div>
                              </div>
                          </div>
                          {project.techPackFiles.length > 1 && (
                              <button onClick={(e) => handleDeleteVersion(file.id, e)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1">
                                  <Trash2 className="w-3 h-3" />
                              </button>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-grow bg-gray-200 p-4 flex items-center justify-center">
              {activeFile ? (
                  <iframe 
                    src={activeFile.fileUrl} 
                    className="w-full h-full shadow-lg rounded bg-white"
                    title="PDF Viewer"
                  />
              ) : (
                  <div className="text-gray-400 font-bold">No PDF selected</div>
              )}
          </div>
      </div>
    </div>
  );
};

export default TechPackEditor;