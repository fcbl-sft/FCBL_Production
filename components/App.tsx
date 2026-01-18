import React, { useState, useEffect } from 'react';
import LoginScreen from './LoginScreen';
import Dashboard from './Dashboard';
import TechPackEditor from './TechPackEditor';
import InspectionEditor from './InspectionEditor';
import MaterialControl from './MaterialControl';
import PPMeeting from './PPMeeting';
import InvoiceEditor from './InvoiceEditor';
import PackingEditor from './PackingEditor';
import OrderSheetEditor from './OrderSheetEditor';
import AdminPortal from './AdminPortal';
import { Project, UserRole, Inspection, PPMeeting as PPMeetingType, MaterialControlItem, PONumber, Invoice, PackingInfo, TechPackData, OrderSheet, ProjectStatus, Comment, AuthUser } from '../types';
import { INITIAL_DATA } from '../constants';
import { supabase } from '../lib/supabase';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'dashboard' | 'editor' | 'inspection' | 'materialControl' | 'ppMeeting' | 'invoice' | 'packing' | 'orderSheet' | 'admin'>('login');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'profile' | 'settings' | 'users' | 'logs'>('profile');
  const [loading, setLoading] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeInspection = activeProject?.inspections.find((i: Inspection) => i.id === activeInspectionId);
  const activeInvoice = activeProject?.invoices?.find((i: Invoice) => i.id === activeInvoiceId);

  useEffect(() => {
    const saved = localStorage.getItem('genpack_session');
    if (saved) {
      const session = JSON.parse(saved);
      if (new Date().getTime() < session.expiry) {
        setCurrentUser(session.user);
        setCurrentScreen('dashboard');
      } else {
        localStorage.removeItem('genpack_session');
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  const mapFromDB = (row: any): Project => ({
    id: row.id,
    title: row.title,
    poNumbers: row.po_numbers || [],
    status: row.status || 'DRAFT',
    updatedAt: row.updated_at,
    createdAt: row.created_at || row.updated_at || new Date().toISOString(),
    createdBy: row.created_by || 'system',
    creatorName: row.creator_name || 'System',
    techPackFiles: row.tech_pack_files || [],
    pages: row.pages || [],
    comments: row.comments || [],
    inspections: row.inspections || [],
    ppMeetings: row.pp_meetings || [],
    materialControl: row.material_control || [],
    invoices: row.invoices || [],
    packing: row.packing || createDefaultPacking(),
    orderSheet: row.order_sheet,
    materialRemarks: row.material_remarks || '',
    materialAttachments: row.material_attachments || [],
    materialComments: row.material_comments || []
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []).map(mapFromDB));
    } catch (err: any) {
      console.error("Error fetching projects:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user: AuthUser, remember: boolean) => {
    setCurrentUser(user);
    const duration = remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiry = new Date().getTime() + duration;
    localStorage.setItem('genpack_session', JSON.stringify({ user, expiry }));
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('genpack_session');
    setCurrentScreen('login');
    setActiveProjectId(null);
    setActiveInspectionId(null);
    setActiveInvoiceId(null);
  };

  const updateProjectInDB = async (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
    try {
      const mappedUpdates: any = {};
      if(updates.title !== undefined) mappedUpdates.title = updates.title;
      if(updates.status !== undefined) mappedUpdates.status = updates.status;
      if(updates.poNumbers !== undefined) mappedUpdates.po_numbers = updates.poNumbers;
      if(updates.techPackFiles !== undefined) mappedUpdates.tech_pack_files = updates.techPackFiles;
      if(updates.pages !== undefined) mappedUpdates.pages = updates.pages;
      if(updates.comments !== undefined) mappedUpdates.comments = updates.comments;
      if(updates.inspections !== undefined) mappedUpdates.inspections = updates.inspections;
      if(updates.ppMeetings !== undefined) mappedUpdates.pp_meetings = updates.ppMeetings;
      if(updates.materialControl !== undefined) mappedUpdates.material_control = updates.materialControl;
      if(updates.invoices !== undefined) mappedUpdates.invoices = updates.invoices;
      if(updates.packing !== undefined) mappedUpdates.packing = updates.packing;
      if(updates.orderSheet !== undefined) mappedUpdates.order_sheet = updates.orderSheet;
      
      mappedUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase.from('projects').update(mappedUpdates).eq('id', projectId);
      if (error) throw error;
    } catch (err: any) {
      console.error("Database update failed:", err.message || JSON.stringify(err));
    }
  };

  const handleCreateTechPack = async () => {
    if (!currentUser) return;
    const styleName = prompt("Enter Style Name:");
    if (!styleName) return;

    const poNumberStr = prompt("Enter PO Number:");
    if (!poNumberStr) return;

    const now = new Date().toISOString();
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: styleName,
      poNumbers: [{ id: `po-${Date.now()}`, number: poNumberStr }],
      status: 'DRAFT',
      updatedAt: now,
      createdAt: now,
      createdBy: currentUser.email,
      creatorName: currentUser.name,
      techPackFiles: [],
      pages: [JSON.parse(JSON.stringify(INITIAL_DATA))],
      comments: [],
      inspections: [],
      ppMeetings: [],
      materialControl: [],
      invoices: [],
      packing: createDefaultPacking(),
      materialRemarks: '',
      materialAttachments: [],
      materialComments: []
    };

    try {
      const dbObj = {
        id: newProj.id,
        title: newProj.title,
        po_numbers: newProj.poNumbers,
        status: newProj.status,
        updated_at: newProj.updatedAt,
        pages: newProj.pages,
        packing: newProj.packing
      };

      const { error } = await supabase.from('projects').insert(dbObj);
      if (error) throw error;
      setProjects(prev => [newProj, ...prev]);
      setActiveProjectId(newProj.id);
      setCurrentScreen('editor');
    } catch (err: any) {
      alert("Failed to create record: " + err.message);
    }
  };

  function createDefaultPacking(): PackingInfo {
    return {
      division: 'BLOQUE', section: 'SENORA', invoiceRef: '', deliveryNote: '', orderNumber: '',
      shipmentType: 'SEA', alarmedGoods: false, supplierCode: 'PROV-123',
      supplierName: 'FASHION COMFORT (BD) LTD', vatCode: 'VAT-BD-999', address: 'Dhaka',
      phone: '', fax: '', email: '', destination: '', shipmentDate: '',
      arrivalDate: '', arrivalTime: '', boxDetails: [], grossWeight: 0, netWeight: 0,
      volume: 0, remarks: '', attachments: [], comments: []
    };
  }

  const handleUpdateInspection = async (updatedInspection: Inspection) => {
    if (!activeProject) return;
    setActiveInspectionId(updatedInspection.id);
    const updatedInspections = activeProject.inspections.some((i: Inspection) => i.id === updatedInspection.id)
      ? activeProject.inspections.map((i: Inspection) => i.id === updatedInspection.id ? updatedInspection : i)
      : [...activeProject.inspections, updatedInspection];
    await updateProjectInDB(activeProject.id, { inspections: updatedInspections });
  };

  const handleManageInspection = async (project: Project) => {
     setActiveProjectId(project.id);
     const existing = project.inspections.length > 0 ? project.inspections[project.inspections.length - 1] : null;
     if (existing) {
        setActiveInspectionId(existing.id);
     } else {
        const newInsp = createDefaultInspection(project.id, project.title);
        await updateProjectInDB(project.id, { inspections: [...project.inspections, newInsp] });
        setActiveInspectionId(newInsp.id);
     }
     setCurrentScreen('inspection');
  };

  const createDefaultInspection = (projectId: string, title: string): Inspection => ({
    id: `INS-${Date.now()}`, projectId, type: 'Inline', status: 'DRAFT',
    data: {
      supplierName: 'FASHION COMFORT (BD) LTD', inspectionDate: new Date().toISOString().split('T')[0],
      styleName: title, composition: '100% Cotton', shipmentGroups: [], attachments: [], qcDefects: [],
      qcSummary: { majorFound: 0, maxAllowed: 4, criticalMaxAllowed: 0, minorMaxAllowed: 10 },
      overallResult: 'PENDING', qcMeasurementTable: { groups: [], rows: [] }, globalMasterTolerance: '1.0',
      images: [], visibleSections: ['generalInfo', 'orderDetails', 'shipment', 'qcDefects', 'judgement', 'measurements'],
      sectionComments: {}, supplierAddress: '', inspectionType: 'Inline', inspectorName: '', buyerName: '', styleNumber: '', orderNumber: '', totalOrderQuantity: 0, refNumber: '', colorName: '', gauges: '', weight: '', time: '', factoryName: '', factoryContact: '', countryOfProduction: '', measurementQty: 0, controlledQty: 0, judgementComments: '', additionalComments: '', maxToleranceColorVariation: 0, measurementComments: ''
    }
  });

  const handleManageInvoice = async (project: Project) => {
    setActiveProjectId(project.id);
    const existing = project.invoices && project.invoices.length > 0 ? project.invoices[0] : null;
    if (existing) {
        setActiveInvoiceId(existing.id);
    } else {
        const newInvoice: Invoice = {
            id: `INV-${Date.now()}`, invoiceNo: `FC-${Date.now().toString().slice(-6)}`,
            invoiceDate: new Date().toISOString().split('T')[0], expNo: '', expDate: '', scNo: '', scDate: '',
            shipperName: 'FASHION COMFORT (BD) LTD', shipperAddress: 'Dhaka, Bangladesh', buyerName: '', buyerAddress: '',
            consigneeName: '', consigneeAddress: '', notifyParties: [], shipperBankDetails: '', portOfLoading: '',
            finalDestination: '', paymentTerms: '', modeOfShipment: 'SEA', blNo: '', blDate: '',
            countryOfOrigin: 'Bangladesh', lineItems: [], netWeight: 0, grossWeight: 0, totalCbm: 0,
            rexDeclaration: '', attachments: [], status: 'DRAFT', remarks: '', comments: []
        };
        await updateProjectInDB(project.id, { invoices: [...(project.invoices || []), newInvoice] });
        setActiveInvoiceId(newInvoice.id);
    }
    setCurrentScreen('invoice');
  };

  const handleOpenAdmin = (tab: 'profile' | 'settings' | 'users' | 'logs') => {
    setActiveAdminTab(tab);
    setCurrentScreen('admin');
  };

  return (
    <div className="min-h-screen">
      {currentScreen === 'login' && <LoginScreen onLogin={handleLogin} />}
      
      {currentScreen === 'dashboard' && currentUser && (
        <Dashboard 
          role={currentUser.role} 
          user={currentUser}
          projects={projects} 
          onSelectProject={(p) => { setActiveProjectId(p.id); setCurrentScreen('editor'); }} 
          onCreateTechPack={handleCreateTechPack} 
          onUploadTechPack={async (file) => { /* simplified */ }}
          onLogout={handleLogout} 
          onOpenAdmin={handleOpenAdmin}
          onDeleteProject={async (id) => { if(confirm("Delete style?")) { await supabase.from('projects').delete().eq('id', id); setProjects(p => p.filter(x => x.id !== id)); } }}
          onRenameProject={(id, title) => updateProjectInDB(id, { title })}
          onManageInspection={handleManageInspection}
          onManageInvoice={handleManageInvoice}
          onManagePacking={(p) => { setActiveProjectId(p.id); setCurrentScreen('packing'); }}
          onManageOrderSheet={(p) => { setActiveProjectId(p.id); setCurrentScreen('orderSheet'); }}
          onManageMaterialControl={(p) => { setActiveProjectId(p.id); setCurrentScreen('materialControl'); }}
          onManagePPMeeting={(p) => { setActiveProjectId(p.id); setCurrentScreen('ppMeeting'); }}
          onUpdateProject={updateProjectInDB}
        />
      )}

      {currentScreen === 'admin' && currentUser && (
        <AdminPortal 
          user={currentUser} 
          onBack={() => setCurrentScreen('dashboard')} 
          initialTab={activeAdminTab} 
        />
      )}

      {currentScreen === 'editor' && activeProject && currentUser && (
        <TechPackEditor 
          project={activeProject} 
          onUpdateProject={(p) => updateProjectInDB(p.id, p)}
          onBack={() => setCurrentScreen('dashboard')} 
          currentUser={currentUser}
          onStatusChange={(s) => updateProjectInDB(activeProject.id, { status: s })} 
          onAddComment={(txt) => {
             const newComment = { id: Date.now().toString(), author: currentUser.name, role: currentUser.role, text: txt, timestamp: new Date().toISOString() };
             updateProjectInDB(activeProject.id, { comments: [...(activeProject.comments || []), newComment] });
          }}
        />
      )}

      {currentScreen === 'orderSheet' && activeProject && (
        <OrderSheetEditor project={activeProject} onUpdate={(orderSheet) => updateProjectInDB(activeProject.id, { orderSheet })} onBack={() => setCurrentScreen('dashboard')} onSave={() => setCurrentScreen('dashboard')} />
      )}

      {currentScreen === 'invoice' && activeProject && activeInvoice && (
        <InvoiceEditor project={activeProject} invoice={activeInvoice} onUpdate={(inv) => updateProjectInDB(activeProject.id, { invoices: activeProject.invoices.map(i => i.id === inv.id ? inv : i) })} onBack={() => setCurrentScreen('dashboard')} onSave={() => setCurrentScreen('dashboard')} />
      )}

      {currentScreen === 'packing' && activeProject && currentUser && (
          <PackingEditor project={activeProject} currentUser={currentUser} onUpdate={(packing) => updateProjectInDB(activeProject.id, { packing })} onBack={() => setCurrentScreen('dashboard')} onSave={() => setCurrentScreen('dashboard')} />
      )}

      {currentScreen === 'inspection' && activeProject && activeInspection && (
        <InspectionEditor project={activeProject} inspection={activeInspection} onUpdate={handleUpdateInspection} onBack={() => setCurrentScreen('dashboard')} onSave={() => setCurrentScreen('dashboard')} onDeleteInspection={async (id) => { const updatedIns = activeProject.inspections.filter(i => i.id !== id); await updateProjectInDB(activeProject.id, { inspections: updatedIns }); if (activeInspectionId === id) setActiveInspectionId(null); }} />
      )}

      {currentScreen === 'materialControl' && activeProject && (
        <MaterialControl project={activeProject} onUpdateProject={(updates) => updateProjectInDB(activeProject.id, updates)} onUpdate={(items) => updateProjectInDB(activeProject.id, { materialControl: items })} onBack={() => setCurrentScreen('dashboard')} />
      )}

      {currentScreen === 'ppMeeting' && activeProject && (
        <PPMeeting project={activeProject} onUpdate={(meetings) => updateProjectInDB(activeProject.id, { ppMeetings: meetings })} onBack={() => setCurrentScreen('dashboard')} />
      )}

      {loading && <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}
    </div>
  );
};

export default App;
