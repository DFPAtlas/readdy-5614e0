'use client';

import { useState, useRef } from 'react';
import { SOPFormData, useBuiltSOPs } from '@/lib/useBuiltSOPs';
import { generateSOPContent } from '../lib/generateSOPContent';
import { useAuth } from '@/lib/auth';
import StepIndicator from '../components/StepIndicator';
import StepType from '../components/StepType';
import StepClientSite from '../components/StepClientSite';
import StepPurposeScope from '../components/StepPurposeScope';
import StepRoles from '../components/StepRoles';
import StepEquipment from '../components/StepEquipment';
import StepProcedure from '../components/StepProcedure';
import StepRisks from '../components/StepRisks';
import StepEmergency from '../components/StepEmergency';
import StepEscalation from '../components/StepEscalation';
import StepReview from '../components/StepReview';
import StepGenerate from '../components/StepGenerate';
import Link from 'next/link';

const STEPS = [
  'Choose Type',
  'Client & Site',
  'Purpose & Scope',
  'Roles',
  'Equipment',
  'Procedure',
  'Risks & PPE',
  'Emergency Contacts',
  'Escalation',
  'Review & Ack',
  'Generate SOP',
];

const EMPTY_FORM: SOPFormData = {
  sop_type: '',
  site_id: null,
  client_name: '',
  title: '',
  purpose: '',
  scope: '',
  roles: [{ role: '', responsibility: '' }],
  equipment: [],
  procedure_steps: [{ step: 1, instruction: '', expectedOutcome: '' }],
  risks_controls: [{ risk: '', control: '' }],
  ppe: '',
  health_safety_notes: '',
  emergency_contacts: [{ name: '', role: '', phone: '' }],
  escalation_procedure: '',
  reporting_requirements: '',
  guard_acknowledgement_statement: '',
  review_date: '',
  guard_role: '',
  shift_type: '',
};

export default function SOPBuilderWizardPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SOPFormData>(EMPTY_FORM);
  const [generating, setGenerating] = useState(false);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { createSOP } = useBuiltSOPs();
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updateForm = (partial: Partial<SOPFormData>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const canProceed = () => {
    if (step === 1) return !!form.sop_type;
    if (step === 2) return !!form.title.trim();
    return true;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const { data, error } = await createSOP(form);
    if (error || !data) {
      setToast('Failed to generate SOP: ' + (error?.message || 'Unknown error'));
      setGenerating(false);
      setTimeout(() => setToast(null), 4000);
      return;
    }

    const content = generateSOPContent(form, {
      sopReference: data.sop_reference || '',
      version: data.version_number || 1,
      createdBy: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'GuardianHub',
      createdAt: data.created_at,
      status: 'Draft',
    });

    setGeneratedId(data.id);
    setGeneratedContent(content);
    setGenerating(false);
  };

  const handleNext = () => {
    if (step < STEPS.length) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleExportPDF = () => {
    if (!generatedContent) return;
    const blob = new Blob([generatedContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    if (typeof window !== 'undefined') {
      const w = window.open(url, '_blank');
      if (w) {
        w.addEventListener('load', () => {
          w.print();
        });
      }
    }
  };

  const handleDownloadHTML = () => {
    if (!generatedContent) return;
    const blob = new Blob([generatedContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title || 'SOP'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (generatedId && generatedContent) {
    return (
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">SOP Generated</h1>
            <p className="text-sm text-gray-400 mt-0.5">{form.title} &middot; Draft</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHTML}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 inline-flex items-center justify-center mr-1"><i className="ri-download-line text-xs"></i></div>
              Export HTML
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 inline-flex items-center justify-center mr-1"><i className="ri-file-pdf-line text-xs"></i></div>
              Print / PDF
            </button>
            <Link
              href={`/sop-builder/${generatedId}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 inline-flex items-center justify-center mr-1"><i className="ri-arrow-right-line text-xs"></i></div>
              Open Document
            </Link>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl overflow-hidden border border-gray-800">
          <iframe
            ref={iframeRef}
            srcDoc={generatedContent}
            className="w-full h-full min-h-[700px]"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-0 h-full -m-4 lg:-m-6">
      <StepIndicator steps={STEPS} current={step} onChange={setStep} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {step === 1 && <StepType data={form} onChange={updateForm} />}
            {step === 2 && <StepClientSite data={form} onChange={updateForm} />}
            {step === 3 && <StepPurposeScope data={form} onChange={updateForm} />}
            {step === 4 && <StepRoles data={form} onChange={updateForm} />}
            {step === 5 && <StepEquipment data={form} onChange={updateForm} />}
            {step === 6 && <StepProcedure data={form} onChange={updateForm} />}
            {step === 7 && <StepRisks data={form} onChange={updateForm} />}
            {step === 8 && <StepEmergency data={form} onChange={updateForm} />}
            {step === 9 && <StepEscalation data={form} onChange={updateForm} />}
            {step === 10 && <StepReview data={form} onChange={updateForm} />}
            {step === 11 && <StepGenerate data={form} onChange={updateForm} onGenerate={handleGenerate} generating={generating} />}
          </div>
        </div>

        <div className="border-t border-gray-800 p-4 flex items-center justify-between bg-[#111827]">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors disabled:opacity-20 cursor-pointer whitespace-nowrap"
          >
            Back
          </button>
          {step < 11 && (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Continue
              <div className="w-4 h-4 inline-flex items-center justify-center ml-1.5"><i className="ri-arrow-right-line text-xs"></i></div>
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2 z-50">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
          {toast}
        </div>
      )}
    </div>
  );
}