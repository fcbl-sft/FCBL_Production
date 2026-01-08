
import React, { useState, useMemo, useRef } from 'react';
import { Project, Invoice, InvoiceLineItem, FileAttachment, Comment } from '../types';
import { ArrowLeft, Save, Printer, FileDown, Plus, Trash2, Building2, Banknote, Ship, MapPin, CheckCircle2, ChevronRight, X, UserCircle2, Paperclip, FileText, Download, ExternalLink, Upload, MessageSquare, Edit3, UserCircle } from 'lucide-react';

// For PDF generation
declare var html2pdf: any;

interface InvoiceEditorProps {
  project: Project;
  invoice: Invoice;
  onUpdate: (updatedInvoice: Invoice) => void;
  onBack: () => void;
  onSave: () => void;
}

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ project, invoice, onUpdate, onBack, onSave }) => {
  const [viewMode, setViewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const updateField = (field: keyof Invoice, value: any) => {
    onUpdate({ ...invoice, [field]: value });
  };

  const handleAddLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: `LI-${Date.now()}`,
      marksAndNumber: 'FCBL / ' + (project.poNumbers?.[0]?.number || 'N/A'),
      description: project.title,
      composition: '100% COTTON KNITTED SWEATER',
      orderNo: project.poNumbers?.[0]?.number || '',
      styleNo: project.title,
      hsCode: '6110.20.00',
      quantity: 0,
      cartons: 0,
      unitPrice: 0,
      totalAmount: 0
    };
    updateField('lineItems', [...(invoice.lineItems || []), newItem]);
  };

  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    const updated = (invoice.lineItems || []).map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          newItem.totalAmount = (newItem.quantity || 0) * (newItem.unitPrice || 0);
        }
        return newItem;
      }
      return item;
    });
    updateField('lineItems', updated);
  };

  const deleteLineItem = (id: string) => {
    updateField('lineItems', (invoice.lineItems || []).filter(i => i.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      const newAttachment: FileAttachment = {
        id: `invatt-${Date.now()}`,
        fileName: file.name,
        fileUrl: fileUrl,
        uploadDate: new Date().toISOString()
      };
      updateField('attachments', [...(invoice.attachments || []), newAttachment]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteAttachment = (attId: string) => {
    if (!confirm("Delete this document?")) return;
    updateField('attachments', (invoice.attachments || []).filter(a => a.id !== attId));
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: `icomm-${Date.now()}`,
      author: 'Commercial Team',
      role: 'supplier',
      text: commentText,
      timestamp: new Date().toISOString()
    };
    updateField('comments', [...(invoice.comments || []), newComment]);
    setCommentText('');
  };

  const deleteComment = (id: string) => {
    if (!confirm("Delete this comment?")) return;
    updateField('comments', (invoice.comments || []).filter(c => c.id !== id));
  };

  const startEditComment = (c: Comment) => {
    setEditingCommentId(c.id);
    setCommentText(c.text);
  };

  const saveEditedComment = () => {
    if (!editingCommentId) return;
    const updated = (invoice.comments || []).map(c => c.id === editingCommentId ? { ...c, text: commentText, timestamp: new Date().toISOString() } : c);
    updateField('comments', updated);
    setEditingCommentId(null);
    setCommentText('');
  };

  const totals = useMemo(() => {
    return (invoice.lineItems || []).reduce((acc, curr) => ({
      qty: acc.qty + (curr.quantity || 0),
      cartons: acc.cartons + (curr.cartons || 0),
      amount: acc.amount + (curr.totalAmount || 0)
    }), { qty: 0, cartons: 0, amount: 0 });
  }, [invoice.lineItems]);

  const handleSave = () => {
    onSave();
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-preview-content');
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `CommercialInvoice_${invoice.invoiceNo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const inputClass = "w-full border border-slate-200 rounded-xl p-3 text-sm bg-[#DFEDF7] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-slate-800 transition-all";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 pl-1";

  return (
    <div className="flex flex-col h-screen bg-gray-50 print:bg-white">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm shrink-0 z-30 no-print">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-black text-xl text-slate-800 tracking-tight">Commercial Invoice Editor</h1>
            <div className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Doc Ref: {invoice.invoiceNo} | Project: {project.title}</div>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setViewMode(viewMode === 'EDIT' ? 'PREVIEW' : 'EDIT')} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all">
                {viewMode === 'EDIT' ? <FileDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />} {viewMode === 'EDIT' ? 'Technical Preview' : 'Technical Editor'}
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">
                <Save className="w-4 h-4" /> Save Record
            </button>
        </div>
      </header>

      {showSaveToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black uppercase tracking-widest text-xs z-[100] animate-bounce flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" /> Commercial Document Saved
        </div>
      )}

      <main className="flex-grow overflow-y-auto p-8 bg-slate-100/30 print:p-0 print:bg-white relative">
          <div className="w-full space-y-10 pb-32 no-print">
            
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <div><label className={labelClass}>Invoice Number</label><input className={inputClass} value={invoice.invoiceNo || ''} onChange={e => updateField('invoiceNo', e.target.value)} /></div>
               <div><label className={labelClass}>Invoice Date</label><input type="date" className={inputClass} value={invoice.invoiceDate || ''} onChange={e => updateField('invoiceDate', e.target.value)} /></div>
               <div><label className={labelClass}>EXP Number</label><input className={inputClass} value={invoice.expNo || ''} onChange={e => updateField('expNo', e.target.value)} /></div>
               <div><label className={labelClass}>S/C Number</label><input className={inputClass} value={invoice.scNo || ''} onChange={e => updateField('scNo', e.target.value)} /></div>
            </div>

            {/* PARTIES INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Building2 className="w-5 h-5" /></div>
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Shipper Details</h3>
                    </div>
                    <div className="space-y-6">
                        <div><label className={labelClass}>Company Name</label><input className={inputClass} value={invoice.shipperName || ''} onChange={e => updateField('shipperName', e.target.value)} /></div>
                        <div><label className={labelClass}>Office Address</label><textarea className={`${inputClass} h-32 resize-none`} value={invoice.shipperAddress || ''} onChange={e => updateField('shipperAddress', e.target.value)} /></div>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><UserCircle2 className="w-5 h-5" /></div>
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Buyer & Consignee</h3>
                    </div>
                    <div className="space-y-6">
                        <div><label className={labelClass}>Buyer Name</label><input className={inputClass} value={invoice.buyerName || ''} onChange={e => updateField('buyerName', e.target.value)} /></div>
                        <div><label className={labelClass}>Consignee Name (if different)</label><input className={inputClass} value={invoice.consigneeName || ''} onChange={e => updateField('consigneeName', e.target.value)} /></div>
                        <div><label className={labelClass}>Full Address</label><textarea className={`${inputClass} h-32 resize-none`} value={invoice.buyerAddress || ''} onChange={e => updateField('buyerAddress', e.target.value)} /></div>
                    </div>
                </div>
            </div>

            {/* LOGISTICS & BANKING */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Ship className="w-5 h-5" /></div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Logistics, Payment & Banking</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    <div><label className={labelClass}>Port of Loading</label><input className={inputClass} value={invoice.portOfLoading || ''} onChange={e => updateField('portOfLoading', e.target.value)} /></div>
                    <div><label className={labelClass}>Final Destination</label><input className={inputClass} value={invoice.finalDestination || ''} onChange={e => updateField('finalDestination', e.target.value)} /></div>
                    <div><label className={labelClass}>Mode of Shipment</label><select className={inputClass} value={invoice.modeOfShipment || 'SEA'} onChange={e => updateField('modeOfShipment', e.target.value)}><option value="SEA">SEA FREIGHT</option><option value="AIR">AIR FREIGHT</option><option value="LAND">LAND FREIGHT</option></select></div>
                    <div><label className={labelClass}>Payment Terms</label><input className={inputClass} value={invoice.paymentTerms || ''} onChange={e => updateField('paymentTerms', e.target.value)} /></div>
                    <div><label className={labelClass}>B/L Number</label><input className={inputClass} value={invoice.blNo || ''} onChange={e => updateField('blNo', e.target.value)} /></div>
                    <div><label className={labelClass}>Origin Country</label><input className={inputClass} value={invoice.countryOfOrigin || ''} onChange={e => updateField('countryOfOrigin', e.target.value)} /></div>
                </div>
                <div><label className={labelClass}>Full Banking Details & L/C Ref</label><textarea className={`${inputClass} h-32 resize-none font-mono`} value={invoice.shipperBankDetails || ''} onChange={e => updateField('shipperBankDetails', e.target.value)} /></div>
            </div>

            {/* LINE ITEMS TABLE */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Banknote className="w-5 h-5" /></div>
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">Commercial Line Items</h3>
                    </div>
                    <button onClick={handleAddLineItem} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2"><Plus className="w-4 h-4" /> Add Item</button>
                </div>
                <div className="overflow-x-auto rounded-[2rem] border border-slate-100">
                    <table className="w-full border-collapse">
                        <thead className="bg-slate-900 text-white">
                            <tr>
                                <th className="p-4 text-left text-[9px] font-black uppercase tracking-widest">Description / Composition</th>
                                <th className="p-4 text-center text-[9px] font-black uppercase tracking-widest w-24">Order No</th>
                                <th className="p-4 text-center text-[9px] font-black uppercase tracking-widest w-20">Qty</th>
                                <th className="p-4 text-center text-[9px] font-black uppercase tracking-widest w-20">Cartons</th>
                                <th className="p-4 text-center text-[9px] font-black uppercase tracking-widest w-24">Price (USD)</th>
                                <th className="p-4 text-center text-[9px] font-black uppercase tracking-widest w-28">Total</th>
                                <th className="p-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(invoice.lineItems || []).map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-2">
                                        <div className="flex flex-col gap-1">
                                            <input className="w-full bg-[#DFEDF7] border-none rounded-lg p-2 text-xs font-bold" value={item.description || ''} onChange={e => updateLineItem(item.id, 'description', e.target.value)} placeholder="Product Name" />
                                            <input className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] italic" value={item.composition || ''} onChange={e => updateLineItem(item.id, 'composition', e.target.value)} placeholder="Composition (e.g. 100% Cotton)" />
                                        </div>
                                    </td>
                                    <td className="p-2"><input className="w-full bg-[#DFEDF7] border-none rounded-lg p-2 text-xs text-center font-bold" value={item.orderNo || ''} onChange={e => updateLineItem(item.id, 'orderNo', e.target.value)} /></td>
                                    <td className="p-2"><input type="number" className="w-full bg-[#DFEDF7] border-none rounded-lg p-2 text-xs text-center font-black" value={item.quantity || ''} onChange={e => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                                    <td className="p-2"><input type="number" className="w-full bg-[#DFEDF7] border-none rounded-lg p-2 text-xs text-center font-bold" value={item.cartons || ''} onChange={e => updateLineItem(item.id, 'cartons', parseInt(e.target.value) || 0)} /></td>
                                    <td className="p-2"><input type="number" step="0.01" className="w-full bg-[#DFEDF7] border-none rounded-lg p-2 text-xs text-center font-black text-indigo-600" value={item.unitPrice || ''} onChange={e => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} /></td>
                                    <td className="p-4 text-center font-black text-slate-400 bg-slate-50">${(item.totalAmount || 0).toFixed(2)}</td>
                                    <td className="p-2 text-center"><button onClick={() => deleteLineItem(item.id)} className="text-slate-300 hover:text-red-500 p-2 transition-all"><Trash2 className="w-4 h-4" /></button></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-100 border-t-2 border-slate-900 font-black">
                            <tr>
                                <td className="p-4 text-right uppercase tracking-widest text-[10px]">Grand Totals:</td>
                                <td></td>
                                <td className="p-4 text-center text-sm">{totals.qty}</td>
                                <td className="p-4 text-center text-sm">{totals.cartons}</td>
                                <td></td>
                                <td className="p-4 text-center text-sm text-indigo-700">${totals.amount.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <div><label className={labelClass}>Net Weight (kg)</label><input type="number" className={inputClass} value={invoice.netWeight || ''} onChange={e => updateField('netWeight', parseFloat(e.target.value) || 0)} /></div>
                    <div><label className={labelClass}>Gross Weight (kg)</label><input type="number" className={inputClass} value={invoice.grossWeight || ''} onChange={e => updateField('grossWeight', parseFloat(e.target.value) || 0)} /></div>
                    <div><label className={labelClass}>Total CBM (m³)</label><input type="number" step="0.01" className={inputClass} value={invoice.totalCbm || ''} onChange={e => updateField('totalCbm', parseFloat(e.target.value) || 0)} /></div>
                 </div>
                 <div><label className={labelClass}>REX Declaration / Customs Statement</label><textarea className={`${inputClass} h-32 resize-none font-mono text-[11px]`} value={invoice.rexDeclaration || ''} onChange={e => updateField('rexDeclaration', e.target.value)} /></div>
            </div>

            {/* NEW: TECHNICAL COMMENTS & ATTACHMENTS SYSTEM FOOTER */}
            <div className="mt-12 pt-10 border-t-2 border-slate-200">
                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 mb-8 flex items-center gap-3">
                    <span className="w-8 h-8 bg-black text-white rounded flex items-center justify-center text-xs">CI</span>
                    Technical Comments & Documentation
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* COMMENTS PANEL */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-indigo-500" /> Commercial Remarks
                            </h4>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{(invoice.comments || []).length} Records</span>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto space-y-4 mb-6 pr-2">
                            {(invoice.comments || []).map((c) => (
                                <div key={c.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <UserCircle className="w-4 h-4 text-slate-400" />
                                            <span className="text-[10px] font-black uppercase text-slate-700">{c.author}</span>
                                            <span className="text-[9px] text-slate-400 font-bold">{new Date(c.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEditComment(c)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit3 className="w-3.5 h-3.5"/></button>
                                            <button onClick={() => deleteComment(c.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{c.text}</p>
                                </div>
                            ))}
                            {(invoice.comments || []).length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 italic">
                                    <MessageSquare className="w-8 h-8 opacity-20" />
                                    <p className="text-xs font-bold">No documentation notes</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto">
                            <textarea 
                                className="w-full bg-[#DFEDF7] border border-slate-200 rounded-2xl p-4 text-xs font-bold focus:bg-white outline-none mb-3 resize-none h-24"
                                placeholder="Add a new documentation comment..."
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                            />
                            <button 
                                onClick={editingCommentId ? saveEditedComment : addComment}
                                className="w-full bg-black text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            >
                                {editingCommentId ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                {editingCommentId ? 'Update Record' : 'Post Comment'}
                            </button>
                        </div>
                    </div>

                    {/* ATTACHMENTS PANEL */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-indigo-500" /> Technical Documents
                            </h4>
                            <div>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all"
                                >
                                    <Upload className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                            {(invoice.attachments || []).map((att) => (
                                <div key={att.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-white rounded-xl text-indigo-500 shadow-sm"><FileText className="w-5 h-5" /></div>
                                        <div className="truncate">
                                            <p className="text-xs font-black text-slate-800 truncate">{att.fileName}</p>
                                            <p className="text-[9px] font-bold text-slate-400">{new Date(att.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => window.open(att.fileUrl)} className="p-2 text-indigo-600 hover:bg-white rounded-xl transition-all" title="Preview"><ExternalLink className="w-4 h-4"/></button>
                                        <a href={att.fileUrl} download={att.fileName} className="p-2 text-emerald-600 hover:bg-white rounded-xl transition-all" title="Download"><Download className="w-4 h-4" /></a>
                                        <button onClick={() => deleteAttachment(att.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                            {(invoice.attachments || []).length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 italic">
                                    <Paperclip className="w-8 h-8 opacity-20" />
                                    <p className="text-xs font-bold">No documents attached</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <p className="text-[9px] font-black uppercase text-indigo-400 tracking-tighter mb-1">Commercial Note</p>
                            <p className="text-[10px] font-bold text-indigo-900 leading-relaxed italic">Attach B/L copies, EXP certificates, and L/C relevant documentation here.</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* PREVIEW CONTENT */}
          {viewMode === 'PREVIEW' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm print:relative print:p-0 print:bg-white no-print">
               <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col print:max-w-none print:max-h-none print:shadow-none">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-black text-lg uppercase tracking-tight text-slate-800">Commercial Document Preview</h2>
                    <div className="flex gap-2">
                      <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl">
                        <Printer className="w-4 h-4" /> Print Document
                      </button>
                      <button onClick={() => setViewMode('EDIT')} className="p-3 hover:bg-gray-200 rounded-2xl transition-all">
                        <X className="w-6 h-6 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div id="invoice-preview-content" className="p-12 overflow-y-auto bg-white flex-grow print:p-4 print:overflow-visible">
                    <div className="max-w-[210mm] mx-auto bg-white text-black font-sans min-h-[297mm] flex flex-col">
                        <div className="flex justify-between border-b-4 border-black pb-6 mb-8 items-end">
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-1">Commercial Invoice</h1>
                                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Fashion Comfort (BD) Ltd - Industrial Document</p>
                            </div>
                            <div className="text-right">
                                <div className="inline-block bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-2">Doc Ref: {invoice.invoiceNo || '-'}</div>
                                <div className="text-[10px] font-bold">Date: {invoice.invoiceDate || '-'}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 border-2 border-black mb-8 h-[70mm]">
                            <div className="border-r-2 border-black p-4 flex flex-col overflow-hidden">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 pb-1 flex items-center gap-1.5"><Building2 className="w-2.5 h-2.5" /> Exporter / Shipper</span>
                                <p className="font-black text-[13px] uppercase leading-tight mb-2">{invoice.shipperName || '-'}</p>
                                <p className="text-[10px] font-medium leading-relaxed whitespace-pre-wrap">{invoice.shipperAddress || '-'}</p>
                            </div>
                            <div className="p-4 flex flex-col overflow-hidden">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 pb-1 flex items-center gap-1.5"><UserCircle2 className="w-2.5 h-2.5" /> Importer / Consignee</span>
                                <p className="font-black text-[13px] uppercase leading-tight mb-2">{invoice.buyerName || '-'}</p>
                                <p className="text-[10px] font-medium leading-relaxed whitespace-pre-wrap">{invoice.buyerAddress || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 border-2 border-black border-t-0 mb-8 divide-x-2 divide-black text-[9px]">
                            <div className="p-3 bg-slate-50 flex flex-col justify-center gap-1">
                                <span className="font-black uppercase text-[7px] text-slate-400">EXP No. & Date</span>
                                <p className="font-black uppercase leading-none">{invoice.expNo || 'N/A'}</p>
                            </div>
                            <div className="p-3 flex flex-col justify-center gap-1">
                                <span className="font-black uppercase text-[7px] text-slate-400">S/C No. & Date</span>
                                <p className="font-black uppercase leading-none">{invoice.scNo || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-slate-50 flex flex-col justify-center gap-1">
                                <span className="font-black uppercase text-[7px] text-slate-400">Loading Port</span>
                                <p className="font-black uppercase leading-none">{invoice.portOfLoading || '-'}</p>
                            </div>
                            <div className="p-3 flex flex-col justify-center gap-1">
                                <span className="font-black uppercase text-[7px] text-slate-400">Terms of Pay</span>
                                <p className="font-black uppercase leading-none">{invoice.paymentTerms || '-'}</p>
                            </div>
                        </div>

                        <table className="w-full border-2 border-black border-collapse text-[9px] mb-8">
                            <thead className="bg-slate-100 font-black uppercase border-b-2 border-black text-center">
                                <tr>
                                    <th className="p-2 border-r-2 border-black text-left w-64">Description of Goods</th>
                                    <th className="p-2 border-r-2 border-black w-24">HS Code</th>
                                    <th className="p-2 border-r-2 border-black w-20">Quantity</th>
                                    <th className="p-2 border-r-2 border-black w-20">U/Price</th>
                                    <th className="p-2">Total USD</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(invoice.lineItems || []).map(item => (
                                    <tr key={item.id} className="border-b border-black last:border-b-0 font-bold">
                                        <td className="p-3 border-r-2 border-black leading-tight">
                                            <p className="uppercase font-black text-[10px] mb-0.5">{item.description}</p>
                                            <p className="text-[8px] opacity-70 italic mb-1">{item.composition}</p>
                                            <p className="text-[8px] font-black uppercase">Order No: {item.orderNo}</p>
                                        </td>
                                        <td className="p-3 border-r-2 border-black text-center align-middle font-mono">{item.hsCode}</td>
                                        <td className="p-3 border-r-2 border-black text-center align-middle">{item.quantity} PCS</td>
                                        <td className="p-3 border-r-2 border-black text-center align-middle font-black">${(item.unitPrice || 0).toFixed(2)}</td>
                                        <td className="p-3 text-center align-middle font-black bg-slate-50">${(item.totalAmount || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-black font-black bg-black text-white text-center">
                                <tr>
                                    <td className="p-3 text-right uppercase tracking-widest border-r-2 border-white pr-4">Total Net Amount:</td>
                                    <td className="border-r-2 border-white"></td>
                                    <td className="p-3 border-r-2 border-white">{totals.qty} PCS</td>
                                    <td className="border-r-2 border-white"></td>
                                    <td className="p-3 font-black text-sm">USD ${totals.amount.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="grid grid-cols-3 border-2 border-black mb-10 divide-x-2 divide-black text-center bg-slate-50 font-black uppercase text-[9px] py-4">
                            <div className="flex flex-col gap-1"><span className="text-slate-400 text-[7px]">Gross Weight</span><span>{invoice.grossWeight || 0} KGS</span></div>
                            <div className="flex flex-col gap-1"><span className="text-slate-400 text-[7px]">Net Weight</span><span>{invoice.netWeight || 0} KGS</span></div>
                            <div className="flex flex-col gap-1"><span className="text-slate-400 text-[7px]">Measurement</span><span>{invoice.totalCbm || 0} CBM</span></div>
                        </div>

                        <div className="border-2 border-black p-6 mb-10 bg-indigo-50/20">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-3 border-b border-indigo-100 pb-1">Technical Declarations & Origin Certification</span>
                            <p className="text-[10px] font-mono leading-relaxed whitespace-pre-wrap">{invoice.rexDeclaration || '-'}</p>
                        </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
      </main>
    </div>
  );
};

export default InvoiceEditor;
