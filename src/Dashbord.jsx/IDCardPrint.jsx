import React, { useEffect, useState } from 'react';
import { FaPrint, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../api';
import { toast } from 'react-toastify';

export default function IDCardPrint({ roleType = 'teacher', staffId, onClose }) {
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGeneratedCard = async () => {
      setLoading(true);
      try {
        const res = await api.post('/api/staff-panel/id-card/generate', {
          role: roleType,
          staffIds: [staffId],
          studentIds: []
        });

        if (res.data.success) {
          setPreviewHtml(res.data.html);
        } else {
          toast.error("Failed to generate ID card");
        }
      } catch (err) {
        console.error('Error generating card:', err);
        toast.error("Error connecting to generator");
      } finally {
        setLoading(false);
      }
    };

    if (staffId) {
      fetchGeneratedCard();
    }
  }, [staffId, roleType]);

  const handlePrint = () => {
    if (!previewHtml) return;
    const printWindow = window.open('', '', 'height=800,width=1000');
    printWindow.document.write(`
      <html>
        <head>
          <title>${roleType.toUpperCase()} ID Card</title>
          <style>
            body { margin: 0; padding: 20px; background: #fff; }
            @media print { 
              body { padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              .id-card-wrapper { box-shadow: none !important; border: none !important; }
            }
            .id-card-wrapper { 
                margin: 10px; 
                display: inline-block; 
                vertical-align: top; 
                page-break-inside: avoid; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
            }
          </style>
        </head>
        <body>
          <div id="print-content">${previewHtml}</div>
          <script>
            window.onload = () => { 
                setTimeout(() => {
                    window.print(); 
                    window.close(); 
                }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest">{roleType} ID Card Preview</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Official Institution Credential</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-slate-50 flex justify-center items-start">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-20 text-slate-400">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
              <p className="text-xs font-black uppercase tracking-widest">Generating Identity Card...</p>
            </div>
          ) : previewHtml ? (
            <div className="scale-95 origin-top shadow-2xl rounded-lg overflow-hidden bg-white">
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
                <p className="font-black uppercase tracking-widest">No Design Found</p>
                <p className="text-[10px] mt-2">Please configure the template in ID Card Designer.</p>
            </div>
          )}
        </div>

        <div className="bg-white border-t p-6 flex gap-4 justify-end">
          <button 
            onClick={onClose} 
            className="px-8 py-3 border-2 border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 font-black text-xs uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handlePrint} 
            disabled={loading || !previewHtml}
            className="px-10 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            <FaPrint /> Print Official Card
          </button>
        </div>
      </div>
    </div>
  );
}
