'use client';

import { useState } from 'react';

export interface ComplianceFormData {
  insurance_file?: File;
  assignment_instructions_file?: File;
  risk_assessment_file?: File;
  acs_evidence_file?: File;
  insurance_uploaded: boolean;
  assignment_instructions_uploaded: boolean;
  risk_assessment_uploaded: boolean;
  acs_evidence_uploaded: boolean;
  insurance_name: string;
  assignment_instructions_name: string;
  risk_assessment_name: string;
  acs_evidence_name: string;
}

interface ComplianceStepProps {
  data: ComplianceFormData;
  onChange: (data: ComplianceFormData) => void;
}

interface FileUploadRowProps {
  label: string;
  icon: string;
  description: string;
  uploaded: boolean;
  fileName: string;
  onFileChange: (file: File | undefined) => void;
  onRemove: () => void;
}

function FileUploadRow({ label, icon, description, uploaded, fileName, onFileChange, onRemove }: FileUploadRowProps) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        dragOver ? 'border-blue-500 bg-blue-600/5' : uploaded ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/5'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFileChange(file);
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <i className={`${icon} ${uploaded ? 'text-emerald-400' : 'text-gray-500'} text-lg`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-white">{label}</h4>
            {uploaded && (
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] text-emerald-400 font-medium">
                Ready
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          {uploaded && fileName && (
            <div className="flex items-center gap-2 mt-2">
              <i className="ri-file-text-line text-gray-500 text-xs" />
              <span className="text-xs text-gray-400 truncate">{fileName}</span>
              <button
                onClick={onRemove}
                className="text-xs text-red-400 hover:text-red-300 cursor-pointer ml-auto"
              >
                Remove
              </button>
            </div>
          )}
          {!uploaded && (
            <label className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-xs text-blue-400 cursor-pointer hover:bg-blue-600/30 transition-colors">
              <i className="ri-upload-2-line" />
              Choose File
              <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden" onChange={(e) => onFileChange(e.target.files?.[0])} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ComplianceStep({ data, onChange }: ComplianceStepProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
        <i className="ri-information-line text-amber-400 mt-0.5" />
        <p className="text-xs text-gray-400">
          These documents are optional during setup. You can upload them later from the Compliance section.
        </p>
      </div>

      <FileUploadRow
        label="Insurance Certificate"
        icon="ri-shield-check-line"
        description="Public liability and employer liability insurance (PDF or image)"
        uploaded={data.insurance_uploaded}
        fileName={data.insurance_name}
        onFileChange={(file) =>
          onChange({
            ...data,
            insurance_file: file,
            insurance_uploaded: !!file,
            insurance_name: file?.name || '',
          })
        }
        onRemove={() =>
          onChange({
            ...data,
            insurance_file: undefined,
            insurance_uploaded: false,
            insurance_name: '',
          })
        }
      />

      <FileUploadRow
        label="Assignment Instructions"
        icon="ri-file-list-3-line"
        description="Site-specific assignment instructions and SOPs"
        uploaded={data.assignment_instructions_uploaded}
        fileName={data.assignment_instructions_name}
        onFileChange={(file) =>
          onChange({
            ...data,
            assignment_instructions_file: file,
            assignment_instructions_uploaded: !!file,
            assignment_instructions_name: file?.name || '',
          })
        }
        onRemove={() =>
          onChange({
            ...data,
            assignment_instructions_file: undefined,
            assignment_instructions_uploaded: false,
            assignment_instructions_name: '',
          })
        }
      />

      <FileUploadRow
        label="Risk Assessment"
        icon="ri-alert-line"
        description="Site risk assessment document (PDF or image)"
        uploaded={data.risk_assessment_uploaded}
        fileName={data.risk_assessment_name}
        onFileChange={(file) =>
          onChange({
            ...data,
            risk_assessment_file: file,
            risk_assessment_uploaded: !!file,
            risk_assessment_name: file?.name || '',
          })
        }
        onRemove={() =>
          onChange({
            ...data,
            risk_assessment_file: undefined,
            risk_assessment_uploaded: false,
            risk_assessment_name: '',
          })
        }
      />

      <FileUploadRow
        label="ACS Evidence (Optional)"
        icon="ri-award-line"
        description="Approved Contractor Scheme evidence if applicable"
        uploaded={data.acs_evidence_uploaded}
        fileName={data.acs_evidence_name}
        onFileChange={(file) =>
          onChange({
            ...data,
            acs_evidence_file: file,
            acs_evidence_uploaded: !!file,
            acs_evidence_name: file?.name || '',
          })
        }
        onRemove={() =>
          onChange({
            ...data,
            acs_evidence_file: undefined,
            acs_evidence_uploaded: false,
            acs_evidence_name: '',
          })
        }
      />
    </div>
  );
}