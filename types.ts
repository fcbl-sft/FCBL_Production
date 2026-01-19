
export interface Measurement {
  id: string;
  code: string;
  labelEs: string;
  labelEn: string;
  values: string[];
  tolerance: string;
}

export interface HeaderInfo {
  season: string;
  year: string;
  styleName: string;
  date: string;
  designerName: string;
  designerEmail: string;
  department: string;
  garmentDetails: string;
}

export interface GarmentSpecs {
  supplier: string;
  referenceNumber: string;
  departmentType: string;
  garmentType: string;
  sampleDate: string;
  seasonCode: string;
  size: string;
}

export interface TechPackImage {
  url: string;
  label: string;
}

export type PageType = 'measurement' | 'fit';

export interface TechPackData {
  id: string;
  pageType: PageType;
  tabName: string;
  sectionTitle: string;
  leftPanelContent: string;
  measurementVersions: string[];
  header: HeaderInfo;
  specs: GarmentSpecs;
  measurements: Measurement[];
  images: TechPackImage[];
}

export type UserRole = 'buyer' | 'supplier';

export type ProjectStatus = 'DRAFT' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'ACCEPTED';

export interface Comment {
  id: string;
  author: string;
  role: UserRole;
  text: string;
  timestamp: string;
}

export type InspectionStatus = 'DRAFT' | 'SUBMITTED';

export interface ShipmentSizeRow {
  id: string;
  size: string;
  orderQty: number;
  shipQty: number;
  cartonCount: number;
}

export interface ShipmentGroup {
  id: string;
  color: string;
  rows: ShipmentSizeRow[];
}

export interface FileAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
}

export interface AttachmentItem {
  id: string;
  label: string;
  available: boolean;
  attachments: FileAttachment[];
  checked?: boolean;
}

export interface QCDefectRow {
  id: string;
  description: string;
  critical: number;
  major: number;
  minor: number;
}

export interface SectionComment {
  id: string;
  text: string;
  attachments: FileAttachment[];
}

export interface QCMeasurementSubColumn {
  id: string;
  color: string; 
  standardValue: string; 
}

export interface QCMeasurementGroup {
  id: string;
  size: string; 
  actualValue: string; 
  subColumns: QCMeasurementSubColumn[];
}

export interface QCMeasurementRow {
  id: string;
  point: string; 
  name: string;  
  tolerancePlus: string;
  toleranceMinus: string;
  groups: { [groupId: string]: QCMeasurementGroup }; 
  remarks: string;
}

export interface QCMeasurementTableData {
  groups: { id: string, size: string, colorCols: { id: string, color: string }[] }[];
  rows: QCMeasurementRow[];
}

export interface PackingBoxDetail {
  id: string;
  seqRange: string;
  totalBoxes: number;
  unitsPerBox: number;
  model: string;
  quality: string;
  colorRef: string;
  size: string;
  observation: string;
}

export interface PackingInfo {
  division: string;
  section: string;
  invoiceRef: string;
  deliveryNote: string;
  orderNumber: string;
  shipmentType: 'SEA' | 'AIR';
  alarmedGoods: boolean;
  supplierCode: string;
  supplierName: string;
  vatCode: string;
  address: string;
  phone: string;
  fax: string;
  email: string;
  destination: string;
  shipmentDate: string;
  arrivalDate: string;
  arrivalTime: string;
  boxDetails: PackingBoxDetail[];
  grossWeight: number;
  netWeight: number;
  volume: number;
  remarks: string;
  attachments: FileAttachment[];
  comments?: Comment[];
}

export interface InspectionData {
  supplierName: string;
  supplierAddress: string;
  inspectionType: string;
  inspectorName: string;
  inspectionDate: string;
  buyerName: string;
  styleName: string;
  styleNumber: string;
  orderNumber: string;
  totalOrderQuantity: number;
  refNumber: string;
  colorName: string;
  composition: string;
  gauges: string;
  weight: string;
  time: string;
  factoryName: string;
  factoryContact: string;
  countryOfProduction: string;
  shipmentGroups: ShipmentGroup[];
  measurementQty: number;
  controlledQty: number;
  attachments: AttachmentItem[];
  qcDefects: QCDefectRow[];
  qcSummary: {
      majorFound: number;
      maxAllowed: number;
      criticalMaxAllowed: number;
      minorMaxAllowed: number;
  };
  overallResult: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  judgementComments: string;
  additionalComments: string;
  qcMeasurementTable: QCMeasurementTableData;
  globalMasterTolerance: string;
  maxToleranceColorVariation: number;
  measurementComments: string;
  images: TechPackImage[];
  visibleSections: string[];
  sectionComments: { [sectionId: string]: SectionComment[] };
}

export interface Inspection {
  id: string;
  projectId: string;
  type: string;
  status: InspectionStatus;
  data: InspectionData;
}

export interface InvoiceLineItem {
  id: string;
  marksAndNumber: string;
  description: string;
  composition: string;
  orderNo: string;
  styleNo: string;
  hsCode: string;
  quantity: number;
  cartons: number;
  unitPrice: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  expNo: string;
  expDate: string;
  scNo: string;
  scDate: string;
  shipperName: string;
  shipperAddress: string;
  buyerName: string;
  buyerAddress: string;
  consigneeName: string;
  consigneeAddress: string;
  notifyParties: { id: string, name: string, address: string }[];
  shipperBankDetails: string;
  portOfLoading: string;
  finalDestination: string;
  paymentTerms: string;
  modeOfShipment: string;
  blNo: string;
  blDate: string;
  countryOfOrigin: string;
  lineItems: InvoiceLineItem[];
  netWeight: number;
  grossWeight: number;
  totalCbm: number;
  rexDeclaration: string;
  attachments: FileAttachment[];
  status: 'DRAFT' | 'SUBMITTED';
  remarks?: string;
  comments?: Comment[];
}

export interface ProductionDetail {
  id: string;
  knittingStartDate: string;
  color: string;
  numMachines: number;
  leadTimeDays: number;
  productionPerDay: number;
  remarks?: string;
  attachments: FileAttachment[];
}

export interface Milestone {
  id: string;
  label: string;
  date: string;
  remarks?: string;
  attachments: FileAttachment[];
}

export interface Approval {
  id: string;
  name: string;
  date: string;
  signatureUrl?: string;
  remarks?: string;
  attachments: FileAttachment[];
}

export interface PPMeeting {
  id: string;
  meetingType: string;
  meetingDate: string;
  styleNumber: string;
  orderNumber: string;
  orderQuantity: number;
  infoRemarks?: string;
  infoAttachments: FileAttachment[];
  productionDetails: ProductionDetail[];
  productionRemarks?: string;
  productionAttachments: FileAttachment[];
  milestones: Milestone[];
  milestoneRemarks?: string;
  milestoneAttachments: FileAttachment[];
  approvals: Approval[];
  approvalRemarks?: string;
  approvalAttachments: FileAttachment[];
  comments?: Comment[];
}

export interface MaterialAttachment extends FileAttachment {}

export interface MaterialControlItem {
  id: string;
  label: string;
  orderQty: number;
  receivedQty: number;
  totalWeight: number;
  weightPerProduction: number;
  deadline: string;
  receivedDate: string;
  actualQuality: string;
  receivedQuality: string;
  remark: string;
  attachments: MaterialAttachment[];
}

export interface UploadedTechPack {
  id: string;
  name: string; 
  fileUrl: string; 
  uploadDate: string;
}

export interface PONumber {
  id: string;
  number: string;
}

export interface ColorSizeRow {
  id: string;
  colorCode: string;
  s: number;
  m: number;
  l: number;
  xl: number;
  xxl: number;
  total: number;
}

export interface POAccessories {
  mainLabel: string;
  careLabel: string;
  hangTag: string;
  polybag: string;
  carton: string;
}

export interface OrderSheet {
  id: string;
  companyName: string;
  companyAddress: string;
  companyEmail1: string;
  companyEmail2: string;
  poNumber: string;
  factoryName: string;
  factoryAddress: string;
  factoryBin: string;
  buyerName: string;
  buyerAddress: string;
  consigneeName: string;
  consigneeAddress: string;
  shipmentDate: string;
  incoterms: string;
  paymentMethod: string;
  poDate: string;
  season: string;
  currency: string;
  contractNo: string;
  paymentTerms: string;
  rnNumber: string;
  exFactoryDate: string;
  shipmentMethod: 'SEA' | 'AIR' | 'SEA-AIR';
  originCountry: string;
  portOfLading: string;
  dischargePort: string;
  hsCode: string;
  styleName: string;
  styleCode: string;
  fabricWeight: string;
  composition: string;
  gauge: string;
  sizeRatio: string;
  unitPrice: number;
  productImageUrl: string;
  sizeRows: ColorSizeRow[];
  accessories: POAccessories;
  remarks: string[];
}

export interface Project {
  id: string;
  title: string;
  poNumbers: PONumber[];
  updatedAt: string;
  status: ProjectStatus;
  techPackFiles: UploadedTechPack[];
  pages: TechPackData[]; 
  comments: Comment[];
  inspections: Inspection[];
  ppMeetings: PPMeeting[];
  materialControl: MaterialControlItem[];
  invoices: Invoice[]; 
  packing: PackingInfo;
  orderSheet?: OrderSheet;
  materialRemarks?: string;
  materialAttachments?: FileAttachment[];
  materialComments?: Comment[];
}
