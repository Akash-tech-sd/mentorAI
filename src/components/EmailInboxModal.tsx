import React, { useState } from 'react';
import { EmailNotification } from '../types';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Sparkles, 
  UserCheck, 
  Award, 
  ExternalLink,
  Send,
  Eye
} from 'lucide-react';

interface EmailInboxModalProps {
  notifications: EmailNotification[];
  isOpen: boolean;
  onClose: () => void;
  onResendNotification?: (notif: EmailNotification) => void;
}

export const EmailInboxModal: React.FC<EmailInboxModalProps> = ({
  notifications,
  isOpen,
  onClose,
  onResendNotification,
}) => {
  const [selectedNotif, setSelectedNotif] = useState<EmailNotification | null>(notifications[0] || null);

  if (!isOpen) return null;

  const getTypeIcon = (type: EmailNotification['type']) => {
    switch (type) {
      case 'task_assigned':
        return <Mail className="w-4 h-4 text-blue-400" />;
      case 'review_scheduled':
        return <Calendar className="w-4 h-4 text-indigo-400" />;
      case 'evaluation_feedback':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'official_approval':
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case 'internship_completed':
        return <Award className="w-4 h-4 text-yellow-400" />;
      default:
        return <Mail className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">
                  Automated Email Dispatches
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Secure Server Delivery
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Log of automated task explanations, review meeting invites, evaluation reports, and sign-offs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Split View */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          
          {/* Email List Column */}
          <div className="border-r border-slate-800 overflow-y-auto p-4 space-y-2 max-h-[70vh]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Sent Messages ({notifications.length})
            </span>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No emails recorded yet.</p>
            ) : (
              notifications.map((notif) => {
                const isSelected = selectedNotif?.id === notif.id;
                return (
                  <div
                    key={notif.id}
                    onClick={() => setSelectedNotif(notif)}
                    className={`p-3 rounded-xl border cursor-pointer transition text-xs space-y-1 ${
                      isSelected
                        ? 'bg-slate-800 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                        : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 font-semibold">
                        {getTypeIcon(notif.type)}
                        <span className="capitalize">{notif.type.replace('_', ' ')}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(notif.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h4 className="font-bold text-white line-clamp-1">
                      {notif.subject}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {notif.previewText}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>To: {notif.recipientEmail}</span>
                      <span className="text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{notif.status}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Email HTML Viewer Column */}
          <div className="md:col-span-2 overflow-y-auto p-5 sm:p-6 bg-slate-950/60 max-h-[70vh] flex flex-col">
            {selectedNotif ? (
              <div className="space-y-4">
                {/* Email Meta Bar */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <span className="font-bold text-sm text-white">
                      {selectedNotif.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Status: {selectedNotif.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 text-[11px]">
                    <div>
                      <span>To: </span>
                      <strong className="text-slate-200">
                        {selectedNotif.recipientName} ({selectedNotif.recipientEmail})
                      </strong>
                    </div>
                    <div>
                      <span>Date Dispatched: </span>
                      <strong className="text-slate-200">
                        {new Date(selectedNotif.sentAt).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Rendered HTML Sandbox View */}
                <div className="border border-slate-700/80 rounded-xl overflow-hidden shadow-lg bg-white">
                  <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Rendered Email Body (Intern View)</span>
                    </span>
                  </div>
                  <div
                    className="p-4 sm:p-6 text-slate-900"
                    dangerouslySetInnerHTML={{ __html: selectedNotif.htmlContent }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 text-xs">
                Select an email from the left column to preview its rendered HTML body.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>
            Email engine powered by server-side templates with Resend / SMTP support.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
