
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import TechPackEditor from './components/TechPackEditor';
import InspectionEditor from './components/InspectionEditor';
import MaterialControl from './components/MaterialControl';
import PPMeeting from './components/PPMeeting';
import InvoiceEditor from './components/InvoiceEditor';
import PackingEditor from './components/PackingEditor';
import OrderSheetEditor from './components/OrderSheetEditor';
import { Project, UserRole, Inspection, PPMeeting as PPMeetingType, MaterialControlItem, PONumber, Invoice, PackingInfo, TechPackData, OrderSheet } from './types';
import { INITIAL_DATA } from './constants';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'dashboard' | 'editor' | 'inspection' | 'materialControl' | 'ppMeeting' | 'invoice' | 'packing' | 'orderSheet'>('login');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [bgVideoUrl, setBgVideoUrl] = useState<string | undefined>(undefined);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeInspection = activeProject?.inspections.find(i => i.id === activeInspectionId);
  const activeInvoice = activeProject?.invoices?.find(i => i.id === activeInvoiceId);

  const mapToDB = (proj: Partial<Project>) => {
    const dbObj: any = {};
    if (proj.id) dbObj.id = proj.id;
    if (proj.title) dbObj.title = proj.title;
    if (proj.status) dbObj.status = proj.status;
    if (proj.poNumbers) dbObj.po_numbers = proj.poNumbers;
    if (proj.updatedAt) dbObj.updated_at = proj.updatedAt;
    if (proj.techPackFiles) dbObj.tech_pack_files = proj.techPackFiles;
    if (proj.pages) dbObj.pages = proj.pages;
    if (proj.comments) dbObj.comments = proj.comments;
    if (proj.inspections) dbObj.inspections = proj.inspections;
    if (proj.ppMeetings) dbObj.pp_meetings = proj.ppMeetings;
    if (proj.materialControl) dbObj.material_control = proj.materialControl;
    if (proj.invoices) dbObj.invoices = proj.invoices;
    if (proj.packing) dbObj.packing = proj.packing;
    if (proj.orderSheet) dbObj.order_sheet = proj.orderSheet;
    if (proj.materialRemarks !== undefined) dbObj.material_remarks = proj.materialRemarks;
    if (proj.materialAttachments !== undefined) dbObj.material_attachments = proj.materialAttachments;
    if (proj.materialComments !== undefined) dbObj.material_comments = proj.materialComments;
    return dbObj;
  };

  const mapFromDB = (row: any): Project => ({
    id: row.id,
    title: row.title,
    poNumbers: row.po_numbers || [],
    status: row.status,
    updatedAt: row.updated_at,
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

  useEffect(() => {
    if (currentUserRole) {
      fetchProjects();
    }
  }, [currentUserRole]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []).map(mapFromDB));
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (role: UserRole) => {
    setCurrentUserRole(role);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentUserRole(null);
    setCurrentScreen('login');
    setActiveProjectId(null);
    setActiveInspectionId(null);
    setActiveInvoiceId(null);
  };

  const updateProjectInDB = async (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
    try {
      const dbUpdates = mapToDB({ ...updates, updatedAt: new Date().toISOString() });
      const { error } = await supabase.from('projects').update(dbUpdates).eq('id', projectId);
      if (error) throw error;
    } catch (err: any) {
      console.error("Database update failed:", err);
    }
  };

  const handleCreateTechPack = async () => {
    const styleName = prompt("Enter Style Name:");
    if (!styleName) return;

    const poNumber = prompt("Enter PO Number:");
    if (!poNumber) return;

    const initialPages: TechPackData[] = [JSON.parse(JSON.stringify(INITIAL_DATA))];
    if (initialPages[0]?.header) {
      initialPages[0].header.styleName = styleName;
    }

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: styleName,
      poNumbers: [{ id: `po-${Date.now()}`, number: poNumber }],
      status: 'DRAFT',
      updatedAt: new Date().toISOString(),
      techPackFiles: [],
      pages: initialPages,
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
      const { error } = await supabase.from('projects').insert(mapToDB(newProj));
      if (error) throw error;
      setProjects(prev => [newProj, ...prev]);
      setActiveProjectId(newProj.id);
      setCurrentScreen('editor');
    } catch (err: any) {
      console.error("Failed to create tech pack:", err);
      alert("Failed to create tech pack");
    }
  };

  const handleUpdateInspection = async (updatedInspection: Inspection) => {
    if (!activeProject) return;
    setActiveInspectionId(updatedInspection.id);
    const exists = activeProject.inspections.some(i => i.id === updatedInspection.id);
    const updatedInspections = exists 
      ? activeProject.inspections.map(i => i.id === updatedInspection.id ? updatedInspection : i)
      : [...activeProject.inspections, updatedInspection];
    await updateProjectInDB(activeProject.id, { inspections: updatedInspections });
  };

  const handleManageInspection = async (project: Project) => {
     setActiveProjectId(project.id);
     const existing = project.inspections.length > 0 ? project.inspections[project.inspections.length - 1] : null;
     if (existing) {
        setActiveInspectionId(existing.id);
     } else {
        const newInsp = createDefaultInspection(project.id, project.title, 'Inline');
        const updatedIns = [...project.inspections, newInsp];
        await updateProjectInDB(project.id, { inspections: updatedIns });
        setActiveInspectionId(newInsp.id);
     }
     setCurrentScreen('inspection');
  };

  const handleManageInvoice = async (project: Project) => {
    setActiveProjectId(project.id);
    const existing = project.invoices && project.invoices.length > 0 ? project.invoices[0] : null;
    if (existing) {
        setActiveInvoiceId(existing.id);
    } else {
        const newInvoice: Invoice = {
            id: `INV-${Date.now()}`,
            invoiceNo: `FC-${Date.now().toString().slice(-6)}`,
            invoiceDate: new Date().toISOString().split('T')[0],
            expNo: '', expDate: '', scNo: '', scDate: '',
            shipperName: 'FASHION COMFORT (BD) LTD',
            shipperAddress: 'Dhaka, Bangladesh',
            buyerName: '', buyerAddress: '', consigneeName: '', consigneeAddress: '',
            notifyParties: [],
            shipperBankDetails: 'Standard Bank Ltd.\nL/C Ref: TBD',
            portOfLoading: 'Chittagong, BD',
            finalDestination: '',
            paymentTerms: 'TT / LC',
            modeOfShipment: 'SEA',
            blNo: '', blDate: '',
            countryOfOrigin: 'Bangladesh',
            lineItems: [],
            netWeight: 0, grossWeight: 0, totalCbm: 0,
            rexDeclaration: 'The exporter declarations...',
            attachments: [],
            status: 'DRAFT',
            remarks: '',
            comments: []
        };
        const updated = [...(project.invoices || []), newInvoice];
        await updateProjectInDB(project.id, { invoices: updated });
        setActiveInvoiceId(newInvoice.id);
    }
    setCurrentScreen('invoice');
  };

  const handleManagePacking = (project: Project) => {
      setActiveProjectId(project.id);
      setCurrentScreen('packing');
  };

  const handleManageOrderSheet = (project: Project) => {
      setActiveProjectId(project.id);
      setCurrentScreen('orderSheet');
  };

  const handleDeleteInspection = async (id: string) => {
      if (!activeProject) return;
      const updatedIns = activeProject.inspections.filter(i => i.id !== id);
      await updateProjectInDB(activeProject.id, { inspections: updatedIns });
      if (activeInspectionId === id) {
          setActiveInspectionId(updatedIns[0]?.id || null);
      }
  };

  function createDefaultPacking(): PackingInfo {
      return {
          division: 'BLOQUE',
          section: 'SENORA',
          invoiceRef: '',
          deliveryNote: '',
          orderNumber: '',
          shipmentType: 'SEA',
          alarmedGoods: false,
          supplierCode: 'PROV-123',
          supplierName: 'FASHION COMFORT (BD) LTD',
          vatCode: 'VAT-BD-999',
          address: 'Dhaka',
          phone: '+880-123',
          fax: '',
          email: 'logistics@fashioncomfort.bd',
          destination: 'Barcelona',
          shipmentDate: '',
          arrivalDate: '',
          arrivalTime: '',
          boxDetails: [],
          grossWeight: 0,
          netWeight: 0,
          volume: 0,
          remarks: '',
          attachments: [],
          comments: []
      };
  }

  const createDefaultInspection = (projectId: string, title: string, type: string = 'Inline'): Inspection => {
    const preloadedMeasurements = ["Body length", "Chest width"];
    const defaultSizes = ['S', 'M', 'L']; 
    const groupConfigs = defaultSizes.map(size => ({
        id: `g-${size}-${Date.now()}`,
        size: size,
        colorCols: [{ id: `c-${Date.now()}`, color: 'Standard' }]
    }));
    const qcMeasurementRows = preloadedMeasurements.map((name, i) => {
        const rowGroups: any = {};
        groupConfigs.forEach(gc => {
            rowGroups[gc.id] = { id: gc.id, size: gc.size, actualValue: '', subColumns: [{ id: gc.colorCols[0].id, color: 'Standard', standardValue: '' }] };
        });
        return { id: `m-${i}`, point: (i + 1).toString(), name, tolerancePlus: '1.0', toleranceMinus: '1.0', groups: rowGroups, remarks: '' };
    });

    return {
        id: `INS-${Date.now()}`,
        projectId: projectId,
        type: type,
        status: 'DRAFT',
        data: {
            supplierName: 'FASHION COMFORT (BD) LTD',
            inspectionDate: new Date().toISOString().split('T')[0],
            styleName: title,
            composition: '100% Cotton',
            shipmentGroups: [],
            attachments: [],
            qcDefects: [],
            qcSummary: { majorFound: 0, maxAllowed: 4, criticalMaxAllowed: 0, minorMaxAllowed: 10 },
            overallResult: 'PENDING',
            qcMeasurementTable: { groups: groupConfigs, rows: qcMeasurementRows },
            globalMasterTolerance: '1.0',
            images: [],
            visibleSections: ['generalInfo', 'orderDetails', 'shipment', 'qcDefects', 'judgement', 'measurements'],
            sectionComments: {},
            supplierAddress: '', inspectionType: '', inspectorName: '', buyerName: '', styleNumber: '', orderNumber: '', totalOrderQuantity: 0, refNumber: '', colorName: '', gauges: '', weight: '', time: '', factoryName: '', factoryContact: '', countryOfProduction: '', measurementQty: 0, controlledQty: 0, judgementComments: '', additionalComments: '', maxToleranceColorVariation: 0, measurementComments: ''
        }
    };
  };

  return (
    <div className="min-h-screen">
      {currentScreen === 'login' && <LoginScreen onLogin={handleLogin} videoUrl={bgVideoUrl} />}
      
      {currentScreen === 'dashboard' && (
        <Dashboard 
          role={currentUserRole!} 
          projects={projects} 
          onSelectProject={(p) => { setActiveProjectId(p.id); setCurrentScreen('editor'); }} 
          onCreateTechPack={handleCreateTechPack} 
          onUploadTechPack={async (file) => {
             const fileUrl = URL.createObjectURL(file);
             const newProj: Project = {
                id: `proj-${Date.now()}`,
                title: file.name,
                poNumbers: [{ id: 'default', number: 'N/A' }],
                status: 'DRAFT',
                updatedAt: new Date().toISOString(),
                pages: [JSON.parse(JSON.stringify(INITIAL_DATA))],
                techPackFiles: [{ id: `f-${Date.now()}`, name: 'PDF Import', fileUrl, uploadDate: new Date().toISOString() }],
                invoices: [],
                inspections: [], 
                ppMeetings: [], 
                materialControl: [], 
                comments: [],
                packing: createDefaultPacking(),
                materialRemarks: '',
                materialAttachments: [],
                materialComments: []
             };
             try {
               const { error } = await supabase.from('projects').insert(mapToDB(newProj));
               if (error) throw error;
               setProjects(prev => [newProj, ...prev]);
             } catch (err: any) { console.error(err); }
          }}
          onLogout={handleLogout} 
          onDeleteProject={async (id) => { if(confirm("Delete Style?")) { await supabase.from('projects').delete().eq('id', id); setProjects(p => p.filter(x => x.id !== id)); } }}
          onRenameProject={(id, title) => updateProjectInDB(id, { title })}
          onManageInspection={handleManageInspection}
          onManageInvoice={handleManageInvoice}
          onManagePacking={handleManagePacking}
          onManageOrderSheet={handleManageOrderSheet}
          onManageMaterialControl={(p) => { setActiveProjectId(p.id); setCurrentScreen('materialControl'); }}
          onManagePPMeeting={(p) => { setActiveProjectId(p.id); setCurrentScreen('ppMeeting'); }}
          onUpdateProject={updateProjectInDB}
        />
      )}

      {currentScreen === 'editor' && activeProject && (
        <TechPackEditor 
          project={activeProject} 
          onUpdateProject={(p) => updateProjectInDB(p.id, p)}
          onBack={() => setCurrentScreen('dashboard')} 
          currentUserRole={currentUserRole!}
          onStatusChange={(s) => updateProjectInDB(activeProject.id, { status: s })} 
          onAddComment={(txt) => {
             const newComment = { id: Date.now().toString(), author: 'User', role: currentUserRole!, text: txt, timestamp: new Date().toISOString() };
             updateProjectInDB(activeProject.id, { comments: [...(activeProject.comments || []), newComment] });
          }}
        />
      )}

      {currentScreen === 'orderSheet' && activeProject && (
        <OrderSheetEditor 
          project={activeProject}
          onUpdate={(orderSheet) => updateProjectInDB(activeProject.id, { orderSheet })}
          onBack={() => setCurrentScreen('dashboard')}
          onSave={() => setCurrentScreen('dashboard')}
        />
      )}

      {currentScreen === 'invoice' && activeProject && activeInvoice && (
        <InvoiceEditor 
            project={activeProject} 
            invoice={activeInvoice} 
            onUpdate={(inv) => {
                const updated = activeProject.invoices.map(i => i.id === inv.id ? inv : i);
                updateProjectInDB(activeProject.id, { invoices: updated });
            }} 
            onBack={() => setCurrentScreen('dashboard')} 
            onSave={() => setCurrentScreen('dashboard')} 
        />
      )}

      {currentScreen === 'packing' && activeProject && (
          <PackingEditor 
            project={activeProject}
            onUpdate={(packing) => updateProjectInDB(activeProject.id, { packing })}
            onBack={() => setCurrentScreen('dashboard')}
            onSave={() => setCurrentScreen('dashboard')}
          />
      )}

      {currentScreen === 'inspection' && activeProject && activeInspection && (
        <InspectionEditor 
          project={activeProject} 
          inspection={activeInspection} 
          onUpdate={handleUpdateInspection}
          onBack={() => setCurrentScreen('dashboard')} 
          onSave={() => setCurrentScreen('dashboard')} 
          onDeleteInspection={handleDeleteInspection}
        />
      )}

      {currentScreen === 'materialControl' && activeProject && (
        <MaterialControl 
          project={activeProject}
          onUpdateProject={(updates) => updateProjectInDB(activeProject.id, updates)}
          onUpdate={(items) => updateProjectInDB(activeProject.id, { materialControl: items })}
          onBack={() => setCurrentScreen('dashboard')}
        />
      )}

      {currentScreen === 'ppMeeting' && activeProject && (
        <PPMeeting 
          project={activeProject}
          onUpdate={(meetings) => updateProjectInDB(activeProject.id, { ppMeetings: meetings })}
          onBack={() => setCurrentScreen('dashboard')}
        />
      )}

      {loading && <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}
    </div>
  );
};

export default App;
