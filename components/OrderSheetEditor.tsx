
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Project, OrderSheet, ColorSizeRow, POAccessories } from '../types';
// Add missing icons: Package, LayoutPanelTop, Box, CheckSquare
import { ArrowLeft, Save, Printer, FileDown, Plus, Trash2, Building2, ShoppingCart, Truck, MapPin, CheckCircle2, Eye, Edit3, X, Image as ImageIcon, RotateCcw, Download, Package, LayoutPanelTop, Box, CheckSquare } from 'lucide-react';

// For PDF generation
declare var html2pdf: any;

interface OrderSheetEditorProps {
  project: Project;
  onUpdate: (updatedPO: OrderSheet) => void;
  onBack: () => void;
  onSave: () => void;
}

const INITIAL_PO: OrderSheet = {
  id: `PO-${Date.now()}`,
  companyName: 'FASHION COMFORT USA LLC',
  companyAddress: '123 Fashion Ave, New York, NY 10001, USA',
  companyEmail1: 'orders@fashioncomfort.com',
  companyEmail2: 'billing@fashioncomfort.com',
  poNumber: 'FC-US-2025-001',
  factoryName: 'ASDWA FASHION LTD',
  factoryAddress: 'Industrial Zone, Dhaka, Bangladesh',
  factoryBin: 'BIN-BD-12345678',
  buyerName: 'FASHION COMFORT USA LLC',
  buyerAddress: '123 Fashion Ave, New York, NY 10001, USA',
  consigneeName: 'FASHION COMFORT LOGISTICS',
  consigneeAddress: 'Warehouse 45, Port of New Jersey, USA',
  shipmentDate: new Date().toISOString().split('T')[0],
  incoterms: 'FOB Chittagong',
  paymentMethod: 'TT',
  poDate: new Date().toISOString().split('T')[0],
  season: 'SS26',
  currency: 'USD',
  contractNo: 'CONT-10293',
  paymentTerms: '60 Days after BL',
  rnNumber: 'RN# 998877',
  exFactoryDate: '',
  shipmentMethod: 'SEA',
  originCountry: 'Bangladesh',
  portOfLading: 'Chittagong',
  dischargePort: 'New Jersey',
  hsCode: '6110.20.00',
  styleName: 'CHILL THREAD',
  styleCode: 'CT-900',
  fabricWeight: '180 GSM',
  composition: '100% COTTON',
  gauge: '12GG',
  sizeRatio: '2:3:3:2:1',
  unitPrice: 17.00,
  productImageUrl: '',
  sizeRows: [
    { id: '1', colorCode: 'BLACK / 900', s: 12, m: 18, l: 18, xl: 12, xxl: 6, total: 66 }
  ],
  accessories: {
    mainLabel: '1 pc per garment',
    careLabel: '1 pc per garment',
    hangTag: '1 pc per garment',
    polybag: 'Individual poly',
    carton: 'Standard Export'
  },
  remarks: [
    'All garments must meet AQL 2.5 standards.',
    'Color matching must be within 5% tolerance of approved lab dip.',
    'Packing must strictly follow instructions provided in the packing manual.',
    'Shipping documents must reach the buyer 7 days before ETA.',
    'Notification of delay must be sent at least 15 days before ex-factory date.'
  ]
};

const OrderSheetEditor: React.FC<OrderSheetEditorProps> = ({ project, onUpdate, onBack, onSave }) => {
  const [viewMode, setViewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [formData, setFormData] = useState<OrderSheet>(project.orderSheet || INITIAL_PO);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const totals = useMemo(() => {
    const sTotal = formData.sizeRows.reduce((acc, row) => acc + (Number(row.s) || 0), 0);
    const mTotal = formData.sizeRows.reduce((acc, row) => acc + (Number(row.m) || 0), 0);
    const lTotal = formData.sizeRows.reduce((acc, row) => acc + (Number(row.l) || 0), 0);
    const xlTotal = formData.sizeRows.reduce((acc, row) => acc + (Number(row.xl) || 0), 0);
    const xxlTotal = formData.sizeRows.reduce((acc, row) => acc + (Number(row.xxl) || 0), 0);
    const qtyTotal = formData.sizeRows.reduce((acc, row) => acc + (Number(row.total) || 0), 0);
    const amountTotal = qtyTotal * (formData.unitPrice || 0);

    return { sTotal, mTotal, lTotal, xlTotal, xxlTotal, qtyTotal, amountTotal };
  }, [formData]);

  const updateField = (field: keyof OrderSheet, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAccessory = (field: keyof POAccessories, value: string) => {
    setFormData(prev => ({ ...prev, accessories: { ...prev.accessories, [field]: value } }));
  };

  const addSizeRow = () => {
    const newRow: ColorSizeRow = { id: Date.now().toString(), colorCode: '', s: 0, m: 0, l: 0, xl: 0, xxl: 0, total: 0 };
    updateField('sizeRows', [...formData.sizeRows, newRow]);
  };

  const updateSizeRow = (id: string, field: keyof ColorSizeRow, value: any) => {
    const updated = formData.sizeRows.map(row => {
      if (row.id === id) {
        const newRow = { ...row, [field]: value };
        if (['s', 'm', 'l', 'xl', 'xxl'].includes(field as string)) {
          newRow.total = (Number(newRow.s) || 0) + (Number(newRow.m) || 0) + (Number(newRow.l) || 0) + (Number(newRow.xl) || 0) + (Number(newRow.xxl) || 0);
        }
        return newRow;
      }
      return row;
    });
    updateField('sizeRows', updated);
  };

  const deleteSizeRow = (id: string) => {
    updateField('sizeRows', formData.sizeRows.filter(r => r.id !== id));
  };

  const addRemark = () => {
    updateField('remarks', [...formData.remarks, '']);
  };

  const updateRemark = (index: number, value: string) => {
    const updated = [...formData.remarks];
    updated[index] = value;
    updateField('remarks', updated);
  };

  const deleteRemark = (index: number) => {
    updateField('remarks', formData.remarks.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => updateField('productImageUrl', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    if (confirm("Reset form to default? All unsaved data will be lost.")) {
      setFormData(INITIAL_PO);
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    onSave();
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('po-preview-document');
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `PurchaseOrder_${formData.poNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => window.print();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const sectionLabel = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 pl-1";
  const inputClass = "w-full border border-slate-200 rounded-xl p-3 text-sm bg-[#DFEDF7] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-slate-800 transition-all shadow-sm";
  const previewBoxHeader = "bg-slate-900 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest";

  return (
    <div className="flex flex-col h-screen bg-gray-50 print:bg-white overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm shrink-0 z-30 no-print">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-xl text-slate-900 tracking-tight leading-none uppercase">Order Sheet (PO)</h1>
              <div className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mt-1">Purchase Order Management</div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={handleReset} className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-xs font-black hover:bg-red-50 transition-all">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={() => setViewMode(viewMode === 'EDIT' ? 'PREVIEW' : 'EDIT')} className="flex items-center gap-2 bg-white border border-indigo-200 text-indigo-600 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-50 transition-all shadow-sm">
                {viewMode === 'EDIT' ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />} {viewMode === 'EDIT' ? 'Preview PO' : 'Edit Form'}
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">
                <Save className="w-4 h-4" /> Save Record
            </button>
        </div>
      </header>

      {showSaveToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black uppercase tracking-widest text-xs z-[100] animate-bounce flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" /> Order Sheet Synchronized
        </div>
      )}

      <main className="flex-grow overflow-y-auto p-8 bg-slate-100/30 print:p-0 print:bg-white relative">
        {viewMode === 'EDIT' ? (
          <div className="w-full space-y-10 pb-32 no-print">
            {/* COMPANY & HEADER INFO */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2"><label className={sectionLabel}>Company Name</label><input className={inputClass} value={formData.companyName} onChange={e => updateField('companyName', e.target.value)} /></div>
               <div><label className={sectionLabel}>PO Number</label><input className={`${inputClass} border-indigo-300 bg-indigo-50`} value={formData.poNumber} onChange={e => updateField('poNumber', e.target.value)} /></div>
               <div className="lg:col-span-2"><label className={sectionLabel}>Company Address</label><input className={inputClass} value={formData.companyAddress} onChange={e => updateField('companyAddress', e.target.value)} /></div>
               <div className="flex gap-4">
                  <div className="flex-1"><label className={sectionLabel}>Email 1</label><input className={inputClass} value={formData.companyEmail1} onChange={e => updateField('companyEmail1', e.target.value)} /></div>
                  <div className="flex-1"><label className={sectionLabel}>Email 2</label><input className={inputClass} value={formData.companyEmail2} onChange={e => updateField('companyEmail2', e.target.value)} /></div>
               </div>
            </div>

            {/* TRADING PARTNERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 text-indigo-600">
                      <Building2 className="w-5 h-5" /><h3 className="font-black text-xs uppercase tracking-widest">Factory (Partner)</h3>
                  </div>
                  <div className="space-y-4">
                      <div><label className={sectionLabel}>Factory Name</label><input className={inputClass} value={formData.factoryName} onChange={e => updateField('factoryName', e.target.value)} /></div>
                      <div><label className={sectionLabel}>Factory BIN/VAT</label><input className={inputClass} value={formData.factoryBin} onChange={e => updateField('factoryBin', e.target.value)} /></div>
                      <div><label className={sectionLabel}>Factory Address</label><textarea className={`${inputClass} h-24 resize-none`} value={formData.factoryAddress} onChange={e => updateField('factoryAddress', e.target.value)} /></div>
                  </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 text-emerald-600">
                      <ShoppingCart className="w-5 h-5" /><h3 className="font-black text-xs uppercase tracking-widest">Buyer & Consignee</h3>
                  </div>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className={sectionLabel}>Buyer Name</label><input className={inputClass} value={formData.buyerName} onChange={e => updateField('buyerName', e.target.value)} /></div>
                        <div><label className={sectionLabel}>Consignee Name</label><input className={inputClass} value={formData.consigneeName} onChange={e => updateField('consigneeName', e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className={sectionLabel}>Buyer Address</label><textarea className={`${inputClass} h-24 resize-none`} value={formData.buyerAddress} onChange={e => updateField('buyerAddress', e.target.value)} /></div>
                        <div><label className={sectionLabel}>Consignee Address</label><textarea className={`${inputClass} h-24 resize-none`} value={formData.consigneeAddress} onChange={e => updateField('consigneeAddress', e.target.value)} /></div>
                      </div>
                  </div>
              </div>
            </div>

            {/* SHIPPING & ORDER DETAILS */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 text-indigo-600">
                    <Truck className="w-5 h-5" /><h3 className="font-black text-xs uppercase tracking-widest">Shipping & Logistics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div><label className={sectionLabel}>PO Date</label><input type="date" className={inputClass} value={formData.poDate} onChange={e => updateField('poDate', e.target.value)} /></div>
                    <div><label className={sectionLabel}>Shipment Date</label><input type="date" className={inputClass} value={formData.shipmentDate} onChange={e => updateField('shipmentDate', e.target.value)} /></div>
                    <div><label className={sectionLabel}>Ex-Factory Date</label><input type="date" className={inputClass} value={formData.exFactoryDate} onChange={e => updateField('exFactoryDate', e.target.value)} /></div>
                    <div>
                      <label className={sectionLabel}>Incoterms</label>
                      <select className={inputClass} value={formData.incoterms} onChange={e => updateField('incoterms', e.target.value)}>
                        <option value="FOB Chittagong">FOB Chittagong</option>
                        <option value="FOB Dhaka">FOB Dhaka</option>
                        <option value="CIF">CIF</option>
                        <option value="CFR">CFR</option>
                        <option value="EXW">EXW</option>
                      </select>
                    </div>
                    <div>
                      <label className={sectionLabel}>Payment Method</label>
                      <select className={inputClass} value={formData.paymentMethod} onChange={e => updateField('paymentMethod', e.target.value)}>
                        <option value="TT">TT</option>
                        <option value="LC">LC</option>
                        <option value="DP">DP</option>
                      </select>
                    </div>
                    <div><label className={sectionLabel}>Payment Terms</label><input className={inputClass} value={formData.paymentTerms} onChange={e => updateField('paymentTerms', e.target.value)} /></div>
                    <div><label className={sectionLabel}>Season</label><input className={inputClass} value={formData.season} onChange={e => updateField('season', e.target.value)} /></div>
                    <div><label className={sectionLabel}>Currency</label><input className={inputClass} value={formData.currency} onChange={e => updateField('currency', e.target.value)} /></div>
                    <div><label className={sectionLabel}>Contract No</label><input className={inputClass} value={formData.contractNo} onChange={e => updateField('contractNo', e.target.value)} /></div>
                    <div><label className={sectionLabel}>Shipment Method</label><select className={inputClass} value={formData.shipmentMethod} onChange={e => updateField('shipmentMethod', e.target.value as any)}><option value="SEA">SEA</option><option value="AIR">AIR</option><option value="SEA-AIR">SEA-AIR</option></select></div>
                    <div><label className={sectionLabel}>Port of Lading</label><input className={inputClass} value={formData.portOfLading} onChange={e => updateField('portOfLading', e.target.value)} /></div>
                    <div><label className={sectionLabel}>Discharge Port</label><input className={inputClass} value={formData.dischargePort} onChange={e => updateField('dischargePort', e.target.value)} /></div>
                </div>
            </div>

            {/* PRODUCT DETAILS */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 text-indigo-600">
                    <Package className="w-5 h-5" /><h3 className="font-black text-xs uppercase tracking-widest">Product Information</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className={sectionLabel}>Style Name</label><input className={inputClass} value={formData.styleName} onChange={e => updateField('styleName', e.target.value)} /></div>
                        <div><label className={sectionLabel}>Style Code</label><input className={inputClass} value={formData.styleCode} onChange={e => updateField('styleCode', e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div><label className={sectionLabel}>Fabric (GSM)</label><input className={inputClass} value={formData.fabricWeight} onChange={e => updateField('fabricWeight', e.target.value)} /></div>
                        <div><label className={sectionLabel}>Composition</label><input className={inputClass} value={formData.composition} onChange={e => updateField('composition', e.target.value)} /></div>
                        <div><label className={sectionLabel}>Gauge</label><input className={inputClass} value={formData.gauge} onChange={e => updateField('gauge', e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className={sectionLabel}>Size Ratio</label><input className={inputClass} value={formData.sizeRatio} onChange={e => updateField('sizeRatio', e.target.value)} /></div>
                        <div><label className={sectionLabel}>Unit Price ($)</label><input type="number" step="0.01" className={inputClass} value={formData.unitPrice || ''} onChange={e => updateField('unitPrice', parseFloat(e.target.value) || 0)} /></div>
                      </div>
                      <div><label className={sectionLabel}>HS Code</label><input className={inputClass} value={formData.hsCode} onChange={e => updateField('hsCode', e.target.value)} /></div>
                   </div>
                   <div className="relative border-4 border-dashed border-slate-100 rounded-3xl h-64 flex flex-col items-center justify-center bg-slate-50/50 group overflow-hidden">
                      {formData.productImageUrl ? (
                        <>
                          <img src={formData.productImageUrl} className="w-full h-full object-contain" />
                          <button onClick={() => updateField('productImageUrl', '')} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <button onClick={() => imageInputRef.current?.click()} className="flex flex-col items-center gap-3 text-slate-300 hover:text-indigo-600 transition-colors">
                          <ImageIcon className="w-12 h-12" />
                          <span className="font-black text-[10px] uppercase tracking-widest">Upload Product Image</span>
                        </button>
                      )}
                      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                   </div>
                </div>
            </div>

            {/* COLOR & SIZE BREAKDOWN */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                   <div className="flex items-center gap-3 text-indigo-600">
                      <LayoutPanelTop className="w-5 h-5" /><h3 className="font-black text-xs uppercase tracking-widest">Order Breakdown Table</h3>
                   </div>
                   <button onClick={addSizeRow} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all"><Plus className="w-3.5 h-3.5" /> Add Color Row</button>
                </div>
                <div className="overflow-x-auto rounded-3xl border border-slate-100">
                    <table className="w-full border-collapse">
                        <thead className="bg-slate-900 text-white">
                            <tr className="text-[10px] font-black uppercase tracking-widest">
                                <th className="p-4 text-left">Color / Code</th>
                                <th className="p-4 text-center">S</th>
                                <th className="p-4 text-center">M</th>
                                <th className="p-4 text-center">L</th>
                                <th className="p-4 text-center">XL</th>
                                <th className="p-4 text-center">XXL</th>
                                <th className="p-4 text-center bg-indigo-800">QTY</th>
                                <th className="p-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {formData.sizeRows.map(row => (
                                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-2"><input className="w-full bg-[#DFEDF7] border-none rounded-lg p-2 text-xs font-bold" value={row.colorCode} onChange={e => updateSizeRow(row.id, 'colorCode', e.target.value)} /></td>
                                    <td className="p-2"><input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-center font-bold" value={row.s || ''} onChange={e => updateSizeRow(row.id, 's', parseInt(e.target.value) || 0)} /></td>
                                    <td className="p-2"><input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-center font-bold" value={row.m || ''} onChange={e => updateSizeRow(row.id, 'm', parseInt(e.target.value) || 0)} /></td>
                                    <td className="p-2"><input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-center font-bold" value={row.l || ''} onChange={e => updateSizeRow(row.id, 'l', parseInt(e.target.value) || 0)} /></td>
                                    <td className="p-2"><input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-center font-bold" value={row.xl || ''} onChange={e => updateSizeRow(row.id, 'xl', parseInt(e.target.value) || 0)} /></td>
                                    <td className="p-2"><input type="number" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-center font-bold" value={row.xxl || ''} onChange={e => updateSizeRow(row.id, 'xxl', parseInt(e.target.value) || 0)} /></td>
                                    <td className="p-4 text-center font-black text-indigo-700 bg-indigo-50/50">{row.total}</td>
                                    <td className="p-2 text-center"><button onClick={() => deleteSizeRow(row.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-100 border-t-2 border-slate-900 font-black text-[10px] uppercase">
                            <tr>
                                <td className="p-4 text-right pr-6">Size Totals:</td>
                                <td className="p-4 text-center">{totals.sTotal}</td>
                                <td className="p-4 text-center">{totals.mTotal}</td>
                                <td className="p-4 text-center">{totals.lTotal}</td>
                                <td className="p-4 text-center">{totals.xlTotal}</td>
                                <td className="p-4 text-center">{totals.xxlTotal}</td>
                                <td className="p-4 text-center text-sm text-indigo-800">{totals.qtyTotal}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="mt-8 flex justify-end">
                    <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-100 flex items-center gap-12">
                        <div>
                           <span className="text-[10px] font-black uppercase opacity-60 tracking-widest block mb-1">Total Order Quantity</span>
                           <span className="text-3xl font-black">{totals.qtyTotal.toLocaleString()} PCS</span>
                        </div>
                        <div className="w-px h-12 bg-white/20"></div>
                        <div>
                           <span className="text-[10px] font-black uppercase opacity-60 tracking-widest block mb-1">Estimated Total Value</span>
                           <span className="text-3xl font-black">${totals.amountTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formData.currency}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACCESSORIES & REMARKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 text-indigo-600">
                      <Box className="w-5 h-5" /><h3 className="font-black text-xs uppercase tracking-widest">Trim & Accessories</h3>
                  </div>
                  <div className="space-y-4">
                      <div><label className={sectionLabel}>Main Label</label><input className={inputClass} value={formData.accessories.mainLabel} onChange={e => updateAccessory('mainLabel', e.target.value)} /></div>
                      <div><label className={sectionLabel}>Care Label</label><input className={inputClass} value={formData.accessories.careLabel} onChange={e => updateAccessory('careLabel', e.target.value)} /></div>
                      <div><label className={sectionLabel}>Hang Tag</label><input className={inputClass} value={formData.accessories.hangTag} onChange={e => updateAccessory('hangTag', e.target.value)} /></div>
                      <div><label className={sectionLabel}>Polybag</label><input className={inputClass} value={formData.accessories.polybag} onChange={e => updateAccessory('polybag', e.target.value)} /></div>
                      <div><label className={sectionLabel}>Carton Req.</label><input className={inputClass} value={formData.accessories.carton} onChange={e => updateAccessory('carton', e.target.value)} /></div>
                  </div>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3 text-amber-600">
                        <CheckSquare className="w-5 h-5" /><h3 className="font-black text-xs uppercase tracking-widest">Technical Remarks</h3>
                      </div>
                      <button onClick={addRemark} className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100 hover:bg-amber-100 transition-all"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3">
                      {formData.remarks.map((remark, idx) => (
                        <div key={idx} className="flex gap-2">
                           <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-[10px] font-black">{idx + 1}</div>
                           <input className="flex-1 bg-[#DFEDF7] border-none rounded-xl px-4 text-xs font-bold" value={remark} onChange={e => updateRemark(idx, e.target.value)} placeholder="Type remark..." />
                           <button onClick={() => deleteRemark(idx)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                  </div>
               </div>
            </div>
          </div>
        ) : (
          /* PREVIEW MODE */
          <div className="flex flex-col items-center gap-8 pb-32">
             <div className="flex gap-3 no-print">
                 <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95"><FileDown className="w-5 h-5" /> Download PDF</button>
                 <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95"><Printer className="w-5 h-5" /> Print Document</button>
             </div>
             
             {/* THE ACTUAL PO DOCUMENT TEMPLATE */}
             <div id="po-preview-document" className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[15mm] text-black font-sans box-border relative print:shadow-none print:m-0 print:w-full">
                {/* HEADER SECTION */}
                <div className="flex justify-between items-start mb-10 border-b-4 border-slate-900 pb-8">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter leading-none mb-3">{formData.companyName}</h2>
                        <p className="text-[11px] font-medium text-slate-500 w-80 mb-2 leading-relaxed">{formData.companyAddress}</p>
                        <div className="flex gap-4 text-[10px] font-black text-indigo-600">
                           <span>{formData.companyEmail1}</span>
                           <span>{formData.companyEmail2}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-5xl font-black tracking-tighter text-indigo-600 uppercase leading-none mb-4">Purchase Order</h1>
                        <div className="inline-block border-2 border-slate-900 px-6 py-2 rounded-lg">
                           <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest text-center mb-1">PO Number</span>
                           <span className="text-xl font-black">{formData.poNumber}</span>
                        </div>
                    </div>
                </div>

                {/* INFO BLOCKS (3 Columns) */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="border border-slate-200 overflow-hidden rounded-xl">
                        <div className={`${previewBoxHeader} bg-indigo-600`}>Trading Partner / Factory</div>
                        <div className="p-4 space-y-2">
                           <p className="text-[12px] font-black uppercase">{formData.factoryName}</p>
                           <p className="text-[10px] font-medium text-slate-500 leading-tight">{formData.factoryAddress}</p>
                           <div className="pt-2 border-t border-slate-100 text-[10px] font-black text-slate-400">BIN: <span className="text-slate-900 uppercase">{formData.factoryBin}</span></div>
                        </div>
                    </div>
                    <div className="border border-slate-200 overflow-hidden rounded-xl">
                        <div className={`${previewBoxHeader} bg-slate-900`}>Shipping & Payment Info</div>
                        <div className="p-4 space-y-3">
                           <div className="flex justify-between"><span className="text-[9px] font-black text-slate-400 uppercase">Ship Date:</span> <span className="text-[10px] font-black">{formatDate(formData.shipmentDate)}</span></div>
                           <div className="flex justify-between"><span className="text-[9px] font-black text-slate-400 uppercase">Incoterms:</span> <span className="text-[10px] font-black uppercase">{formData.incoterms}</span></div>
                           <div className="flex justify-between"><span className="text-[9px] font-black text-slate-400 uppercase">Method:</span> <span className="text-[10px] font-black uppercase">{formData.paymentMethod}</span></div>
                           <div className="flex justify-between pt-2 border-t border-slate-100"><span className="text-[9px] font-black text-slate-400 uppercase">Terms:</span> <span className="text-[10px] font-black">{formData.paymentTerms}</span></div>
                        </div>
                    </div>
                    <div className="border border-slate-200 overflow-hidden rounded-xl">
                        <div className={`${previewBoxHeader} bg-slate-900`}>Order Management</div>
                        <div className="p-4 space-y-3">
                           <div className="flex justify-between"><span className="text-[9px] font-black text-slate-400 uppercase">PO Date:</span> <span className="text-[10px] font-black">{formatDate(formData.poDate)}</span></div>
                           <div className="flex justify-between"><span className="text-[9px] font-black text-slate-400 uppercase">Season:</span> <span className="text-[10px] font-black uppercase">{formData.season}</span></div>
                           <div className="flex justify-between"><span className="text-[9px] font-black text-slate-400 uppercase">Currency:</span> <span className="text-[10px] font-black uppercase">{formData.currency}</span></div>
                           <div className="flex justify-between pt-2 border-t border-slate-100"><span className="text-[9px] font-black text-slate-400 uppercase">Contract:</span> <span className="text-[10px] font-black uppercase">{formData.contractNo}</span></div>
                        </div>
                    </div>
                </div>

                {/* CONTRACT DETAILS ROW */}
                <div className="grid grid-cols-4 border border-slate-200 divide-x divide-slate-200 mb-8 overflow-hidden rounded-xl text-center">
                    <div className="p-2"><span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Ship Via</span><span className="text-[10px] font-black uppercase">{formData.shipmentMethod}</span></div>
                    <div className="p-2"><span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Country of Origin</span><span className="text-[10px] font-black uppercase">{formData.originCountry}</span></div>
                    <div className="p-2"><span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Port of Lading</span><span className="text-[10px] font-black uppercase">{formData.portOfLading}</span></div>
                    <div className="p-2"><span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Discharge Port</span><span className="text-[10px] font-black uppercase">{formData.dischargePort}</span></div>
                    <div className="p-2 border-t border-slate-200"><span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">HS Code</span><span className="text-[10px] font-black">{formData.hsCode}</span></div>
                    <div className="p-2 border-t border-slate-200"><span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">RN Number</span><span className="text-[10px] font-black">{formData.rnNumber}</span></div>
                    <div className="p-2 border-t border-slate-200"><span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Ex-Factory Date</span><span className="text-[10px] font-black">{formatDate(formData.exFactoryDate)}</span></div>
                    <div className="p-2 border-t border-slate-200 bg-indigo-50"><span className="text-[8px] font-black uppercase text-indigo-400 block mb-0.5">Total Quantity</span><span className="text-[11px] font-black">{totals.qtyTotal.toLocaleString()} PCS</span></div>
                </div>

                {/* PRODUCT BOX */}
                <div className="flex border border-slate-900 mb-6 h-[50mm] rounded-xl overflow-hidden">
                    <div className="flex-1 p-6 border-r border-slate-900">
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            <div><span className="text-[9px] font-black uppercase text-slate-400 block">Style Name</span><span className="text-[14px] font-black uppercase">{formData.styleName}</span></div>
                            <div><span className="text-[9px] font-black uppercase text-slate-400 block">Style Code</span><span className="text-[14px] font-black uppercase">{formData.styleCode}</span></div>
                            <div className="col-span-2 grid grid-cols-3 gap-2">
                                <div><span className="text-[8px] font-black uppercase text-slate-400 block">Composition</span><span className="text-[10px] font-bold uppercase">{formData.composition}</span></div>
                                <div><span className="text-[8px] font-black uppercase text-slate-400 block">Weight</span><span className="text-[10px] font-bold uppercase">{formData.fabricWeight}</span></div>
                                <div><span className="text-[8px] font-black uppercase text-slate-400 block">Gauge</span><span className="text-[10px] font-bold uppercase">{formData.gauge}</span></div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-6 bg-slate-50 rounded-lg p-2">
                           <span className="text-[10px] font-black uppercase text-slate-400">Size Ratio:</span>
                           <span className="text-[16px] font-black tracking-widest text-indigo-600">{formData.sizeRatio}</span>
                        </div>
                    </div>
                    <div className="w-[60mm] bg-white flex items-center justify-center p-4">
                        {formData.productImageUrl ? <img src={formData.productImageUrl} className="max-h-full max-w-full object-contain" /> : <div className="text-[10px] font-black uppercase text-slate-200">No Image</div>}
                    </div>
                </div>

                {/* SIZE TABLE */}
                <table className="w-full border-2 border-slate-900 border-collapse mb-8 text-[11px]">
                    <thead className="bg-slate-900 text-white font-black uppercase text-center border-b-2 border-slate-900">
                        <tr>
                            <th className="p-3 border-r border-white/20 text-left">Color Description / Code</th>
                            <th className="p-3 border-r border-white/20 w-12">S</th>
                            <th className="p-3 border-r border-white/20 w-12">M</th>
                            <th className="p-3 border-r border-white/20 w-12">L</th>
                            <th className="p-3 border-r border-white/20 w-12">XL</th>
                            <th className="p-3 border-r border-white/20 w-12">XXL</th>
                            <th className="p-3 border-r border-white/20 w-24">QTY</th>
                            <th className="p-3 border-r border-white/20 w-20">PRICE</th>
                            <th className="p-3 w-32">AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody className="text-center font-bold">
                        {formData.sizeRows.map((row, idx) => (
                            <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-200`}>
                                <td className="p-3 border-r border-slate-200 text-left font-black uppercase">{row.colorCode}</td>
                                <td className="p-3 border-r border-slate-200">{row.s}</td>
                                <td className="p-3 border-r border-slate-200">{row.m}</td>
                                <td className="p-3 border-r border-slate-200">{row.l}</td>
                                <td className="p-3 border-r border-slate-200">{row.xl}</td>
                                <td className="p-3 border-r border-slate-200">{row.xxl}</td>
                                <td className="p-3 border-r border-slate-200 font-black">{row.total}</td>
                                <td className="p-3 border-r border-slate-200">${(formData.unitPrice || 0).toFixed(2)}</td>
                                <td className="p-3 font-black bg-indigo-50">${(row.total * (formData.unitPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-100 border-t-2 border-slate-900 font-black uppercase text-center">
                        <tr>
                            <td className="p-3 text-right pr-6 uppercase tracking-widest border-r border-slate-900">Order Totals:</td>
                            <td className="p-3 border-r border-slate-200">{totals.sTotal}</td>
                            <td className="p-3 border-r border-slate-200">{totals.mTotal}</td>
                            <td className="p-3 border-r border-slate-200">{totals.lTotal}</td>
                            <td className="p-3 border-r border-slate-200">{totals.xlTotal}</td>
                            <td className="p-3 border-r border-slate-200">{totals.xxlTotal}</td>
                            <td className="p-3 border-r border-slate-200 text-indigo-700">{totals.qtyTotal.toLocaleString()} PCS</td>
                            <td className="border-r border-slate-200"></td>
                            <td className="p-3 bg-indigo-600 text-white text-base">${totals.amountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* ACCESSORIES & REMARKS BOTTOM ROW */}
                <div className="grid grid-cols-2 gap-8 mb-16">
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className={`${previewBoxHeader} bg-indigo-600`}>Mandatory Trims & Packing</div>
                        <div className="p-4 space-y-3 text-[10px]">
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span>Main Label:</span> <strong className="uppercase">{formData.accessories.mainLabel}</strong></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span>Care Label:</span> <strong className="uppercase">{formData.accessories.careLabel}</strong></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span>Hang Tag:</span> <strong className="uppercase">{formData.accessories.hangTag}</strong></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span>Polybag:</span> <strong className="uppercase">{formData.accessories.polybag}</strong></div>
                            <div className="flex justify-between"><span>Carton Packing:</span> <strong className="uppercase">{formData.accessories.carton}</strong></div>
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className={`${previewBoxHeader} bg-amber-600`}>Conditions & Remarks</div>
                        <div className="p-4">
                            <ul className="list-decimal pl-5 space-y-1.5 text-[9px] font-bold leading-tight text-slate-700">
                                {formData.remarks.filter(r => r.trim() !== '').map((r, i) => (
                                    <li key={i}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* SIGNATURES */}
                <div className="grid grid-cols-4 gap-4 mt-auto mb-10 text-center">
                    <div className="border-t-2 border-slate-900 pt-3"><span className="text-[10px] font-black uppercase block leading-none">Merchandiser</span></div>
                    <div className="border-t-2 border-slate-900 pt-3"><span className="text-[10px] font-black uppercase block leading-none">Marketing Director</span></div>
                    <div className="border-t-2 border-slate-900 pt-3"><span className="text-[10px] font-black uppercase block leading-none">Operation Director</span></div>
                    <div className="border-t-2 border-slate-900 pt-3"><span className="text-[10px] font-black uppercase block leading-none">Executive Director</span></div>
                </div>

                {/* FOOTER */}
                <div className="absolute bottom-6 left-[15mm] right-[15mm] border-t border-slate-100 pt-4 flex justify-between items-center text-[9px] font-black text-slate-300 tracking-widest uppercase no-print">
                   <span>Page 1 of 1</span>
                   <span>Automated Order Sheet - {formData.poNumber}</span>
                   <span>Fashion Comfort industrial Systems</span>
                </div>
             </div>
          </div>
        )}
      </main>

      <style>{`
        @media print {
            aside, header, footer, .no-print { display: none !important; }
            main { padding: 0 !important; width: 100% !important; background: white !important; overflow: visible !important; }
            #po-preview-document { box-shadow: none !important; margin: 0 !important; border: none !important; width: 100% !important; height: auto !important; position: relative !important; }
        }
      `}</style>
    </div>
  );
};

export default OrderSheetEditor;
