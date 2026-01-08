import React from 'react';
import { Factory, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
  // Added optional videoUrl property to fix prop mismatch in App.tsx
  videoUrl?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, videoUrl }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background video support added to satisfy prop requirements and enhance UI if url is provided */}
      {videoUrl && (
        <video 
          autoPlay 
          muted 
          loop 
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden z-10">
        <div className="p-8 text-center border-b border-gray-100">
          <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            GP
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">GenPack System</h1>
          <p className="text-gray-500 text-sm">Garment Tech Pack & QC Management</p>
        </div>
        
        <div className="p-6 space-y-4">
          <button 
             onClick={() => onLogin('supplier')}
             className="w-full group relative flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-orange-100 text-brand-orange rounded-full flex items-center justify-center shrink-0 mr-4">
              <Factory className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-gray-900">Supplier / Factory Portal</h3>
              <p className="text-xs text-gray-500">Create packs, manage QC, generate reports.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand-orange" />
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 text-center text-xs text-gray-400">
          Supplier Access Only
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;