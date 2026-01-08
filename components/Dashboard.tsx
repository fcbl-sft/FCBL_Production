
import React, { useRef, useState } from 'react';
import { Project, UserRole, ProjectStatus, PONumber } from '../types';
import { Upload, Clock, CheckCircle, XCircle, FileText, AlertCircle, ChevronRight, ClipboardCheck, Trash2, Search, Filter, Edit2, Check, X, Plus, Package, Users, ReceiptText, LayoutPanelTop, ShoppingCart } from 'lucide-react';

interface DashboardProps {
  role: UserRole;
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onUploadTechPack: (file: File) => void;
  onCreateTechPack: () => void;
  onLogout: () => void;
  onManageInspection: (project: Project, type?: string) => void;
  onManageInvoice: (project: Project) => void;
  onManagePacking: (project: Project) => void;
  onManageOrderSheet: (project: Project) => void;
  onManageMaterialControl: (project: Project) => void;
  onManagePPMeeting: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newTitle: string) => void;
  onUpdateProject: (projectId: string, data: Partial<Project>) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    CHANGES_REQUESTED: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700', 
    ACCEPTED: 'bg-green-100 text-green-700 font-black', 
    REJECTED: 'bg-red-100 text-red-700 font-black',
    PENDING: 'bg-orange-100 text-orange-700',
  };

  const Icon = status === 'DRAFT' ? FileText : Clock;
  const style = styles[status] || 'bg-gray-100';

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${style}`}>
      <Icon className="w-3.5 h-3.5" />
      {status.replace('_', ' ')}
    </span>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ 
  role, projects, onSelectProject, onUploadTechPack, onCreateTechPack, 
  onLogout, onManageInspection, onManageInvoice, onManagePacking, 
  onManageOrderSheet, onManageMaterialControl, onManagePPMeeting, 
  onDeleteProject, onRenameProject, onUpdateProject 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const getLatestInspection = (project: Project) => {
     if (!project.inspections || project.inspections.length === 0) return null;
     return project.inspections[project.inspections.length - 1];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          onUploadTechPack(e.target.files[0]);
      }
  };

  const filteredProjects = projects.filter(project => {
      const latestInsp = getLatestInspection(project);
      const qcResult = latestInsp?.data?.overallResult || 'PENDING';
      const matchesSearch = (project.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (project.poNumbers || []).some(po => po.number.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchesFilter = true;
      if (statusFilter !== 'ALL') {
          if (['ACCEPTED', 'REJECTED', 'PENDING'].includes(statusFilter)) {
              matchesFilter = qcResult === statusFilter;
          } else {
              matchesFilter = project.status === statusFilter;
          }
      }
      return matchesSearch && matchesFilter;
  });

  const handleAddPO = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const newPo = prompt("Enter additional PO Number:");
    if (newPo) {
      const updatedPos = [...(project.poNumbers || []), { id: Math.random().toString(36).substr(2, 9), number: newPo.trim() }];
      onUpdateProject(projectId, { poNumbers: updatedPos });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-white rounded flex items-center justify-center font-bold text-xl">FC</div>
          <div>
            <h1 className="font-display font-bold text-xl text-gray-800 leading-none">Factory Portal</h1>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Fashion Comfort (BD) Ltd</span>
          </div>
        </div>
        <button onClick={onLogout} className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">Logout</button>
      </header>

      <main className="w-full p-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Active Styles</h2>
            <p className="text-gray-500 text-sm mt-1">Manage technical packs, inspections, and shipment documents.</p>
          </div>
          
          <div className="flex gap-3 items-center w-full md:w-auto">
              <div className="relative flex-grow">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search styles or PO..." 
                    className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm w-full bg-white shadow-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>

              <div className="relative">
                  <select 
                    className="pl-3 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm bg-white shadow-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                      <option value="ALL">All Status</option>
                      <option value="DRAFT">Project: Draft</option>
                      <option value="PENDING">QC: Pending</option>
                      <option value="ACCEPTED">QC: Accepted</option>
                      <option value="REJECTED">QC: Rejected</option>
                  </select>
              </div>

              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
              
              <button onClick={onCreateTechPack} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-md font-bold text-sm transition-all">
                <Plus className="w-4 h-4" /> Create Tech Pack
              </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Style & Identification</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Order Sheet</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">PP Meeting</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">MQ Control</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Commercial</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Packing</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">QC Inspect</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => {
                const latestInsp = getLatestInspection(project);
                const qcResult = latestInsp?.data?.overallResult || 'PENDING';
                
                let qcBtnClass = "bg-white border-2 border-slate-200 text-gray-700 hover:border-indigo-600 hover:text-indigo-600";
                if (qcResult === 'ACCEPTED') qcBtnClass = "bg-green-50 border-2 border-green-500 text-green-700 hover:bg-green-100";
                if (qcResult === 'REJECTED') qcBtnClass = "bg-red-50 border-2 border-red-500 text-red-700 hover:bg-red-100";
                if (qcResult === 'PENDING' && latestInsp) qcBtnClass = "bg-orange-50 border-2 border-orange-400 text-orange-700 hover:bg-orange-100";

                return (
                <tr key={project.id} className="hover:bg-indigo-50/30 cursor-pointer transition-colors group">
                  <td className="px-6 py-5" onClick={() => onSelectProject(project)}>
                    <div className="font-black text-gray-900 text-base">{project.title}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(project.poNumbers || []).map(po => (
                        <span key={po.id} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded border border-indigo-100">PO: {po.number}</span>
                      ))}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddPO(project.id); }}
                        className="px-1.5 py-0.5 bg-white border border-dashed border-gray-300 text-gray-400 text-[9px] font-black rounded hover:border-indigo-500 hover:text-indigo-500 transition-all"
                      >
                        + PO
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center"><StatusBadge status={project.status} /></td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(typeof onManageOrderSheet === 'function') onManageOrderSheet(project); }} 
                      className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-amber-50 text-amber-600 shadow-sm transition-all" 
                      title="Order Sheet (PO)"
                    >
                      <ShoppingCart className="w-4 h-4"/>
                    </button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button onClick={(e) => { e.stopPropagation(); onManagePPMeeting(project); }} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 text-indigo-600 shadow-sm transition-all" title="Meeting Log"><Users className="w-4 h-4"/></button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button onClick={(e) => { e.stopPropagation(); onManageMaterialControl(project); }} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 text-indigo-600 shadow-sm transition-all" title="Material tracking"><Package className="w-4 h-4"/></button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button onClick={(e) => { e.stopPropagation(); onManageInvoice(project); }} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-emerald-50 text-emerald-600 shadow-sm transition-all" title="Manage Invoices"><ReceiptText className="w-4 h-4"/></button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button onClick={(e) => { e.stopPropagation(); onManagePacking(project); }} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 text-blue-600 shadow-sm transition-all" title="Packing List"><LayoutPanelTop className="w-4 h-4"/></button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button onClick={(e) => { e.stopPropagation(); onManageInspection(project); }} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${qcBtnClass}`}>
                      <ClipboardCheck className="w-4 h-4" /> QC: {qcResult}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right flex items-center justify-end gap-3 h-full pt-8">
                    <button onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} className="p-2 text-gray-300 hover:text-red-600 transition-all"><Trash2 className="w-5 h-5" /></button>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-transform group-hover:translate-x-1" />
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
