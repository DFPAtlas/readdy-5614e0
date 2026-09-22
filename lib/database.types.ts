export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      acs_assessment_config: {
        Row: {
          acs_number: string | null
          assessment_type: string | null
          company_id: string
          created_at: string | null
          customer_score: number | null
          evidence_score: number | null
          governance_score: number | null
          hns_score: number | null
          id: string
          last_assessment_date: string | null
          last_audit_date: string | null
          last_audit_run_id: string | null
          next_assessment_date: string | null
          notes: string | null
          ops_score: number | null
          overall_readiness: number | null
          personnel_score: number | null
          site_score: number | null
          status: string | null
          training_score: number | null
          updated_at: string | null
        }
        Insert: {
          acs_number?: string | null
          assessment_type?: string | null
          company_id: string
          created_at?: string | null
          customer_score?: number | null
          evidence_score?: number | null
          governance_score?: number | null
          hns_score?: number | null
          id?: string
          last_assessment_date?: string | null
          last_audit_date?: string | null
          last_audit_run_id?: string | null
          next_assessment_date?: string | null
          notes?: string | null
          ops_score?: number | null
          overall_readiness?: number | null
          personnel_score?: number | null
          site_score?: number | null
          status?: string | null
          training_score?: number | null
          updated_at?: string | null
        }
        Update: {
          acs_number?: string | null
          assessment_type?: string | null
          company_id?: string
          created_at?: string | null
          customer_score?: number | null
          evidence_score?: number | null
          governance_score?: number | null
          hns_score?: number | null
          id?: string
          last_assessment_date?: string | null
          last_audit_date?: string | null
          last_audit_run_id?: string | null
          next_assessment_date?: string | null
          notes?: string | null
          ops_score?: number | null
          overall_readiness?: number | null
          personnel_score?: number | null
          site_score?: number | null
          status?: string | null
          training_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acs_assessment_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      acs_audit_findings: {
        Row: {
          assigned_to: string | null
          audit_run_id: string | null
          category: string
          company_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          finding: string
          finding_type: string | null
          id: string
          owner_user_id: string | null
          recommended_action: string | null
          related_record_id: string | null
          related_table: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string | null
          subcategory: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          audit_run_id?: string | null
          category: string
          company_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          finding: string
          finding_type?: string | null
          id?: string
          owner_user_id?: string | null
          recommended_action?: string | null
          related_record_id?: string | null
          related_table?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          subcategory?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          audit_run_id?: string | null
          category?: string
          company_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          finding?: string
          finding_type?: string | null
          id?: string
          owner_user_id?: string | null
          recommended_action?: string | null
          related_record_id?: string | null
          related_table?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          subcategory?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acs_af_audit_run_fk"
            columns: ["audit_run_id"]
            isOneToOne: false
            referencedRelation: "acs_audit_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acs_audit_findings_audit_run_id_fkey"
            columns: ["audit_run_id"]
            isOneToOne: false
            referencedRelation: "acs_audit_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      acs_audit_runs: {
        Row: {
          audit_name: string | null
          audit_type: string | null
          company_id: string
          completed_at: string | null
          created_at: string | null
          critical_count: number | null
          customer_service_score: number | null
          evidence_score: number | null
          findings_count: number | null
          governance_score: number | null
          health_safety_score: number | null
          high_count: number | null
          id: string
          initiated_by: string | null
          low_count: number | null
          medium_count: number | null
          overall_score: number | null
          personnel_score: number | null
          run_type: string | null
          site_score: number | null
          started_at: string | null
          started_by: string | null
          status: string | null
          summary: string | null
          training_score: number | null
          updated_at: string | null
        }
        Insert: {
          audit_name?: string | null
          audit_type?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          critical_count?: number | null
          customer_service_score?: number | null
          evidence_score?: number | null
          findings_count?: number | null
          governance_score?: number | null
          health_safety_score?: number | null
          high_count?: number | null
          id?: string
          initiated_by?: string | null
          low_count?: number | null
          medium_count?: number | null
          overall_score?: number | null
          personnel_score?: number | null
          run_type?: string | null
          site_score?: number | null
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          summary?: string | null
          training_score?: number | null
          updated_at?: string | null
        }
        Update: {
          audit_name?: string | null
          audit_type?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          critical_count?: number | null
          customer_service_score?: number | null
          evidence_score?: number | null
          findings_count?: number | null
          governance_score?: number | null
          health_safety_score?: number | null
          high_count?: number | null
          id?: string
          initiated_by?: string | null
          low_count?: number | null
          medium_count?: number | null
          overall_score?: number | null
          personnel_score?: number | null
          run_type?: string | null
          site_score?: number | null
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          summary?: string | null
          training_score?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      acs_company_documents: {
        Row: {
          category: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          document_name: string
          document_type: string
          evidence_vault_id: string | null
          expiry_date: string | null
          file_url: string | null
          id: string
          is_required: boolean | null
          issue_date: string | null
          notes: string | null
          owner_user_id: string | null
          review_date: string | null
          status: string | null
          storage_path: string | null
          updated_at: string | null
          updated_by: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          document_name: string
          document_type: string
          evidence_vault_id?: string | null
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          is_required?: boolean | null
          issue_date?: string | null
          notes?: string | null
          owner_user_id?: string | null
          review_date?: string | null
          status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          document_name?: string
          document_type?: string
          evidence_vault_id?: string | null
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          is_required?: boolean | null
          issue_date?: string | null
          notes?: string | null
          owner_user_id?: string | null
          review_date?: string | null
          status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acs_company_documents_evidence_vault_id_fkey"
            columns: ["evidence_vault_id"]
            isOneToOne: false
            referencedRelation: "evidence_files"
            referencedColumns: ["id"]
          },
        ]
      }
      acs_compliance_categories: {
        Row: {
          category_code: string | null
          category_name: string
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          notes: string | null
          overall_score: number | null
          sort_order: number | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category_code?: string | null
          category_name: string
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          overall_score?: number | null
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category_code?: string | null
          category_name?: string
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          overall_score?: number | null
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      acs_corrective_actions: {
        Row: {
          action_description: string | null
          action_title: string | null
          assigned_to: string | null
          company_id: string
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string | null
          criterion_id: string | null
          due_date: string | null
          evidence_id: string | null
          finding_id: string | null
          id: string
          issue: string
          owner: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          action_description?: string | null
          action_title?: string | null
          assigned_to?: string | null
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string | null
          criterion_id?: string | null
          due_date?: string | null
          evidence_id?: string | null
          finding_id?: string | null
          id?: string
          issue: string
          owner?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          action_description?: string | null
          action_title?: string | null
          assigned_to?: string | null
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string | null
          criterion_id?: string | null
          due_date?: string | null
          evidence_id?: string | null
          finding_id?: string | null
          id?: string
          issue?: string
          owner?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acs_ca_finding_fk"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "acs_audit_findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acs_corrective_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acs_corrective_actions_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "acs_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acs_corrective_actions_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "acs_evidence"
            referencedColumns: ["id"]
          },
        ]
      }
      acs_criteria: {
        Row: {
          acs_area: string
          company_id: string
          created_at: string | null
          criterion_code: string
          criterion_title: string
          due_date: string | null
          evidence_ids: string[] | null
          id: string
          indicator: string | null
          notes: string | null
          owner: string | null
          status: string | null
          sub_criterion: string | null
          updated_at: string | null
        }
        Insert: {
          acs_area: string
          company_id: string
          created_at?: string | null
          criterion_code: string
          criterion_title: string
          due_date?: string | null
          evidence_ids?: string[] | null
          id?: string
          indicator?: string | null
          notes?: string | null
          owner?: string | null
          status?: string | null
          sub_criterion?: string | null
          updated_at?: string | null
        }
        Update: {
          acs_area?: string
          company_id?: string
          created_at?: string | null
          criterion_code?: string
          criterion_title?: string
          due_date?: string | null
          evidence_ids?: string[] | null
          id?: string
          indicator?: string | null
          notes?: string | null
          owner?: string | null
          status?: string | null
          sub_criterion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acs_criteria_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      acs_evidence: {
        Row: {
          acs_area: string
          acs_criterion: string | null
          category: string | null
          company_id: string
          created_at: string | null
          expiry_date: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          notes: string | null
          owner: string | null
          review_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          acs_area: string
          acs_criterion?: string | null
          category?: string | null
          company_id: string
          created_at?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          review_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          acs_area?: string
          acs_criterion?: string | null
          category?: string | null
          company_id?: string
          created_at?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          review_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acs_evidence_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acs_evidence_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      acs_evidence_packs: {
        Row: {
          audit_run_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          file_url: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          included_sections: Json | null
          notes: string | null
          overall_score: number | null
          pack_name: string
          share_expires_at: string | null
          share_token: string | null
          status: string | null
          storage_path: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          audit_run_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          file_url?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          included_sections?: Json | null
          notes?: string | null
          overall_score?: number | null
          pack_name: string
          share_expires_at?: string | null
          share_token?: string | null
          status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          audit_run_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          file_url?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          included_sections?: Json | null
          notes?: string | null
          overall_score?: number | null
          pack_name?: string
          share_expires_at?: string | null
          share_token?: string | null
          status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acs_evidence_packs_audit_run_id_fkey"
            columns: ["audit_run_id"]
            isOneToOne: false
            referencedRelation: "acs_audit_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      acs_policies: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          content: string | null
          created_at: string | null
          file_url: string | null
          id: string
          owner: string | null
          policy_type: string | null
          review_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          owner?: string | null
          policy_type?: string | null
          review_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          owner?: string | null
          policy_type?: string | null
          review_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acs_policies_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acs_policies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      acs_policy_acknowledgements: {
        Row: {
          acknowledged_at: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          policy_id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          policy_id: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          policy_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acs_policy_acknowledgements_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "acs_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acs_policy_acknowledgements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      acs_site_compliance: {
        Row: {
          assignment_instructions_expiry: string | null
          assignment_instructions_url: string | null
          check_call_log_available: boolean | null
          client_review_notes: string | null
          client_sla_status: string | null
          company_id: string
          created_by: string | null
          dob_log_available: boolean | null
          dob_records_status: string | null
          emergency_procedures_status: string | null
          id: string
          incident_records_status: string | null
          incident_reports_count: number | null
          last_checked_at: string | null
          last_reviewed_at: string | null
          notes: string | null
          overall_score: number | null
          patrol_log_available: boolean | null
          patrol_route_status: string | null
          risk_assessment_expiry: string | null
          risk_assessment_url: string | null
          site_id: string
          sops_current: boolean | null
          status: string | null
          supervisor_audit_date: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assignment_instructions_expiry?: string | null
          assignment_instructions_url?: string | null
          check_call_log_available?: boolean | null
          client_review_notes?: string | null
          client_sla_status?: string | null
          company_id: string
          created_by?: string | null
          dob_log_available?: boolean | null
          dob_records_status?: string | null
          emergency_procedures_status?: string | null
          id?: string
          incident_records_status?: string | null
          incident_reports_count?: number | null
          last_checked_at?: string | null
          last_reviewed_at?: string | null
          notes?: string | null
          overall_score?: number | null
          patrol_log_available?: boolean | null
          patrol_route_status?: string | null
          risk_assessment_expiry?: string | null
          risk_assessment_url?: string | null
          site_id: string
          sops_current?: boolean | null
          status?: string | null
          supervisor_audit_date?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assignment_instructions_expiry?: string | null
          assignment_instructions_url?: string | null
          check_call_log_available?: boolean | null
          client_review_notes?: string | null
          client_sla_status?: string | null
          company_id?: string
          created_by?: string | null
          dob_log_available?: boolean | null
          dob_records_status?: string | null
          emergency_procedures_status?: string | null
          id?: string
          incident_records_status?: string | null
          incident_reports_count?: number | null
          last_checked_at?: string | null
          last_reviewed_at?: string | null
          notes?: string | null
          overall_score?: number | null
          patrol_log_available?: boolean | null
          patrol_route_status?: string | null
          risk_assessment_expiry?: string | null
          risk_assessment_url?: string | null
          site_id?: string
          sops_current?: boolean | null
          status?: string | null
          supervisor_audit_date?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acs_site_compliance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acs_site_compliance_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      acs_staff_compliance: {
        Row: {
          address_status: string | null
          company_id: string
          conflict_mgmt_status: string | null
          contract_status: string | null
          created_at: string | null
          created_by: string | null
          critical_missing_count: number | null
          disciplinary_records: Json | null
          emergency_contact_status: string | null
          employment_history_verified: boolean | null
          equipment_status: string | null
          fire_safety_status: string | null
          first_aid_status: string | null
          guard_id: string | null
          id: string
          last_appraisal_date: string | null
          last_checked_at: string | null
          manual_handling_status: string | null
          notes: string | null
          overall_score: number | null
          performance_review_status: string | null
          photo_id_status: string | null
          reference_file_url: string | null
          reference_status: string | null
          right_to_work_expiry: string | null
          right_to_work_file_url: string | null
          right_to_work_status: string | null
          sia_expiry: string | null
          sia_licence: string | null
          site_induction_date: string | null
          site_induction_status: string | null
          staff_name: string
          status: string | null
          training_records: Json | null
          uniform_status: string | null
          updated_at: string | null
          updated_by: string | null
          vetting_file_url: string | null
          vetting_status: string | null
          welfare_notes: string | null
        }
        Insert: {
          address_status?: string | null
          company_id: string
          conflict_mgmt_status?: string | null
          contract_status?: string | null
          created_at?: string | null
          created_by?: string | null
          critical_missing_count?: number | null
          disciplinary_records?: Json | null
          emergency_contact_status?: string | null
          employment_history_verified?: boolean | null
          equipment_status?: string | null
          fire_safety_status?: string | null
          first_aid_status?: string | null
          guard_id?: string | null
          id?: string
          last_appraisal_date?: string | null
          last_checked_at?: string | null
          manual_handling_status?: string | null
          notes?: string | null
          overall_score?: number | null
          performance_review_status?: string | null
          photo_id_status?: string | null
          reference_file_url?: string | null
          reference_status?: string | null
          right_to_work_expiry?: string | null
          right_to_work_file_url?: string | null
          right_to_work_status?: string | null
          sia_expiry?: string | null
          sia_licence?: string | null
          site_induction_date?: string | null
          site_induction_status?: string | null
          staff_name: string
          status?: string | null
          training_records?: Json | null
          uniform_status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vetting_file_url?: string | null
          vetting_status?: string | null
          welfare_notes?: string | null
        }
        Update: {
          address_status?: string | null
          company_id?: string
          conflict_mgmt_status?: string | null
          contract_status?: string | null
          created_at?: string | null
          created_by?: string | null
          critical_missing_count?: number | null
          disciplinary_records?: Json | null
          emergency_contact_status?: string | null
          employment_history_verified?: boolean | null
          equipment_status?: string | null
          fire_safety_status?: string | null
          first_aid_status?: string | null
          guard_id?: string | null
          id?: string
          last_appraisal_date?: string | null
          last_checked_at?: string | null
          manual_handling_status?: string | null
          notes?: string | null
          overall_score?: number | null
          performance_review_status?: string | null
          photo_id_status?: string | null
          reference_file_url?: string | null
          reference_status?: string | null
          right_to_work_expiry?: string | null
          right_to_work_file_url?: string | null
          right_to_work_status?: string | null
          sia_expiry?: string | null
          sia_licence?: string | null
          site_induction_date?: string | null
          site_induction_status?: string | null
          staff_name?: string
          status?: string | null
          training_records?: Json | null
          uniform_status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vetting_file_url?: string | null
          vetting_status?: string | null
          welfare_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acs_staff_compliance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acs_staff_compliance_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      acs_training_records: {
        Row: {
          certificate_url: string | null
          company_id: string
          course_name: string
          created_at: string | null
          created_by: string | null
          evidence_vault_id: string | null
          expiry_date: string | null
          guard_id: string
          id: string
          issue_date: string | null
          notes: string | null
          provider: string | null
          renewal_required: boolean | null
          status: string | null
          training_status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          certificate_url?: string | null
          company_id: string
          course_name: string
          created_at?: string | null
          created_by?: string | null
          evidence_vault_id?: string | null
          expiry_date?: string | null
          guard_id: string
          id?: string
          issue_date?: string | null
          notes?: string | null
          provider?: string | null
          renewal_required?: boolean | null
          status?: string | null
          training_status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          certificate_url?: string | null
          company_id?: string
          course_name?: string
          created_at?: string | null
          created_by?: string | null
          evidence_vault_id?: string | null
          expiry_date?: string | null
          guard_id?: string
          id?: string
          issue_date?: string | null
          notes?: string | null
          provider?: string | null
          renewal_required?: boolean | null
          status?: string | null
          training_status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acs_training_records_evidence_vault_id_fkey"
            columns: ["evidence_vault_id"]
            isOneToOne: false
            referencedRelation: "evidence_files"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_activity_log: {
        Row: {
          action: string
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_activity_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notes: {
        Row: {
          category: string
          company_id: string
          created_at: string | null
          created_by: string | null
          id: string
          note: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          note: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          note?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_repair_logs: {
        Row: {
          action_summary: string
          action_type: string
          after_data: Json | null
          approved_by: string | null
          before_data: Json | null
          company_id: string
          created_at: string
          id: string
          performed_by: string | null
          ticket_id: string
        }
        Insert: {
          action_summary: string
          action_type: string
          after_data?: Json | null
          approved_by?: string | null
          before_data?: Json | null
          company_id: string
          created_at?: string
          id?: string
          performed_by?: string | null
          ticket_id: string
        }
        Update: {
          action_summary?: string
          action_type?: string
          after_data?: Json | null
          approved_by?: string | null
          before_data?: Json | null
          company_id?: string
          created_at?: string
          id?: string
          performed_by?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_repair_logs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_repair_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_repair_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_repair_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_credentials_status: {
        Row: {
          agent_key: string
          created_at: string
          environment: string
          id: string
          last_checked_at: string | null
          note: string | null
          provider: string
          secret_reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_key: string
          created_at?: string
          environment?: string
          id?: string
          last_checked_at?: string | null
          note?: string | null
          provider: string
          secret_reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agent_key?: string
          created_at?: string
          environment?: string
          id?: string
          last_checked_at?: string | null
          note?: string | null
          provider?: string
          secret_reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_dead_letters: {
        Row: {
          agent_key: string
          attempt_count: number
          company_id: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          event_type: string | null
          execution_id: string | null
          id: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          safe_payload: Json | null
          status: string
        }
        Insert: {
          agent_key: string
          attempt_count?: number
          company_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          event_type?: string | null
          execution_id?: string | null
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          safe_payload?: Json | null
          status?: string
        }
        Update: {
          agent_key?: string
          attempt_count?: number
          company_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          event_type?: string | null
          execution_id?: string | null
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          safe_payload?: Json | null
          status?: string
        }
        Relationships: []
      }
      agent_execution_logs: {
        Row: {
          agent_key: string
          approval_status: string | null
          attempt_count: number
          client_id: string | null
          company_id: string | null
          completed_at: string | null
          correlation_id: string | null
          created_at: string
          duration_ms: number | null
          environment: string | null
          error_code: string | null
          error_message: string | null
          guard_id: string | null
          id: string
          idempotency_key: string | null
          max_attempts: number
          n8n_execution_ref: string | null
          owner_id: string | null
          priority: string
          request_payload: Json
          requested_feature: string | null
          requested_page: string | null
          response_payload: Json | null
          safe_input_summary: Json | null
          safe_output_summary: Json | null
          scheduled_at: string | null
          site_id: string | null
          source: string
          started_at: string | null
          status: string
          trigger_type: string | null
          triggering_record_id: string | null
          user_id: string | null
          version: string | null
        }
        Insert: {
          agent_key: string
          approval_status?: string | null
          attempt_count?: number
          client_id?: string | null
          company_id?: string | null
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          duration_ms?: number | null
          environment?: string | null
          error_code?: string | null
          error_message?: string | null
          guard_id?: string | null
          id?: string
          idempotency_key?: string | null
          max_attempts?: number
          n8n_execution_ref?: string | null
          owner_id?: string | null
          priority?: string
          request_payload?: Json
          requested_feature?: string | null
          requested_page?: string | null
          response_payload?: Json | null
          safe_input_summary?: Json | null
          safe_output_summary?: Json | null
          scheduled_at?: string | null
          site_id?: string | null
          source?: string
          started_at?: string | null
          status?: string
          trigger_type?: string | null
          triggering_record_id?: string | null
          user_id?: string | null
          version?: string | null
        }
        Update: {
          agent_key?: string
          approval_status?: string | null
          attempt_count?: number
          client_id?: string | null
          company_id?: string | null
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          duration_ms?: number | null
          environment?: string | null
          error_code?: string | null
          error_message?: string | null
          guard_id?: string | null
          id?: string
          idempotency_key?: string | null
          max_attempts?: number
          n8n_execution_ref?: string | null
          owner_id?: string | null
          priority?: string
          request_payload?: Json
          requested_feature?: string | null
          requested_page?: string | null
          response_payload?: Json | null
          safe_input_summary?: Json | null
          safe_output_summary?: Json | null
          scheduled_at?: string | null
          site_id?: string | null
          source?: string
          started_at?: string | null
          status?: string
          trigger_type?: string | null
          triggering_record_id?: string | null
          user_id?: string | null
          version?: string | null
        }
        Relationships: []
      }
      agent_health_checks: {
        Row: {
          agent_key: string | null
          check_type: string
          checked_at: string
          environment: string
          id: string
          safe_details: Json | null
          status: string
        }
        Insert: {
          agent_key?: string | null
          check_type: string
          checked_at?: string
          environment?: string
          id?: string
          safe_details?: Json | null
          status: string
        }
        Update: {
          agent_key?: string | null
          check_type?: string
          checked_at?: string
          environment?: string
          id?: string
          safe_details?: Json | null
          status?: string
        }
        Relationships: []
      }
      agent_registry: {
        Row: {
          agent_key: string
          agent_name: string
          category: string | null
          configuration: Json | null
          created_at: string
          description: string | null
          enabled_environment: string | null
          id: string
          is_active: boolean
          last_run_at: string | null
          last_status: string | null
          owner_id: string | null
          paused: boolean
          requires_approval: boolean | null
          risk_level: string | null
          schedule: string | null
          updated_at: string | null
          version: string | null
          webhook_path: string
        }
        Insert: {
          agent_key: string
          agent_name: string
          category?: string | null
          configuration?: Json | null
          created_at?: string
          description?: string | null
          enabled_environment?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          last_status?: string | null
          owner_id?: string | null
          paused?: boolean
          requires_approval?: boolean | null
          risk_level?: string | null
          schedule?: string | null
          updated_at?: string | null
          version?: string | null
          webhook_path: string
        }
        Update: {
          agent_key?: string
          agent_name?: string
          category?: string | null
          configuration?: Json | null
          created_at?: string
          description?: string | null
          enabled_environment?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          last_status?: string | null
          owner_id?: string | null
          paused?: boolean
          requires_approval?: boolean | null
          risk_level?: string | null
          schedule?: string | null
          updated_at?: string | null
          version?: string | null
          webhook_path?: string
        }
        Relationships: []
      }
      agent_replay_nonces: {
        Row: {
          expires_at: string
          nonce: string
          used_at: string
        }
        Insert: {
          expires_at: string
          nonce: string
          used_at?: string
        }
        Update: {
          expires_at?: string
          nonce?: string
          used_at?: string
        }
        Relationships: []
      }
      agent_schedules: {
        Row: {
          agent_key: string
          company_id: string | null
          created_at: string
          cron_expression: string | null
          enabled: boolean
          environment: string
          id: string
          next_run_at: string | null
          paused: boolean
          updated_at: string
        }
        Insert: {
          agent_key: string
          company_id?: string | null
          created_at?: string
          cron_expression?: string | null
          enabled?: boolean
          environment?: string
          id?: string
          next_run_at?: string | null
          paused?: boolean
          updated_at?: string
        }
        Update: {
          agent_key?: string
          company_id?: string | null
          created_at?: string
          cron_expression?: string | null
          enabled?: boolean
          environment?: string
          id?: string
          next_run_at?: string | null
          paused?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      agent_webhook_events: {
        Row: {
          agent_key: string
          client_id: string | null
          company_id: string | null
          created_at: string
          event_payload: Json
          event_type: string
          id: string
          last_error: string | null
          processed: boolean
          processed_at: string | null
          retry_count: number | null
          status: string | null
        }
        Insert: {
          agent_key: string
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          event_payload?: Json
          event_type: string
          id?: string
          last_error?: string | null
          processed?: boolean
          processed_at?: string | null
          retry_count?: number | null
          status?: string | null
        }
        Update: {
          agent_key?: string
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          event_payload?: Json
          event_type?: string
          id?: string
          last_error?: string | null
          processed?: boolean
          processed_at?: string | null
          retry_count?: number | null
          status?: string | null
        }
        Relationships: []
      }
      ai_activity_logs: {
        Row: {
          action_type: string
          company_id: string | null
          created_at: string | null
          details: Json | null
          guard_id: string | null
          id: string
          incident_id: string | null
        }
        Insert: {
          action_type: string
          company_id?: string | null
          created_at?: string | null
          details?: Json | null
          guard_id?: string | null
          id?: string
          incident_id?: string | null
        }
        Update: {
          action_type?: string
          company_id?: string | null
          created_at?: string | null
          details?: Json | null
          guard_id?: string | null
          id?: string
          incident_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_activity_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_activity_logs_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_activity_logs_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_automation_register: {
        Row: {
          approval_status: string
          bias_testing: string | null
          created_at: string
          data_used: string | null
          decision_type: string | null
          dpia_status: string | null
          explanation_available: boolean
          human_involvement: string | null
          id: string
          impact_on_individuals: string | null
          is_published: boolean
          last_review: string | null
          model_provider: string | null
          purpose: string | null
          system_name: string
          updated_at: string
        }
        Insert: {
          approval_status?: string
          bias_testing?: string | null
          created_at?: string
          data_used?: string | null
          decision_type?: string | null
          dpia_status?: string | null
          explanation_available?: boolean
          human_involvement?: string | null
          id?: string
          impact_on_individuals?: string | null
          is_published?: boolean
          last_review?: string | null
          model_provider?: string | null
          purpose?: string | null
          system_name: string
          updated_at?: string
        }
        Update: {
          approval_status?: string
          bias_testing?: string | null
          created_at?: string
          data_used?: string | null
          decision_type?: string | null
          dpia_status?: string | null
          explanation_available?: boolean
          human_involvement?: string | null
          id?: string
          impact_on_individuals?: string | null
          is_published?: boolean
          last_review?: string | null
          model_provider?: string | null
          purpose?: string | null
          system_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_rota_suggestions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          confidence: number | null
          created_at: string
          created_by: string | null
          id: string
          metadata: Json | null
          reasoning: string | null
          rejected_at: string | null
          rejected_by: string | null
          shift_id: string
          site_id: string | null
          status: string
          suggested_guard_id: string | null
          suggestion_type: string
          updated_at: string
          warnings: Json | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json | null
          reasoning?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          shift_id: string
          site_id?: string | null
          status?: string
          suggested_guard_id?: string | null
          suggestion_type: string
          updated_at?: string
          warnings?: Json | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json | null
          reasoning?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          shift_id?: string
          site_id?: string | null
          status?: string
          suggested_guard_id?: string | null
          suggestion_type?: string
          updated_at?: string
          warnings?: Json | null
        }
        Relationships: []
      }
      announcement_acknowledgments: {
        Row: {
          acknowledged_at: string | null
          announcement_id: string
          id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          announcement_id: string
          id?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          announcement_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_acknowledgments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "platform_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_acknowledgments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_access_logs: {
        Row: {
          company_id: string
          created_at: string | null
          credential_id: string | null
          duration_ms: number | null
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          response_code: number | null
          scopes_used: string[] | null
          user_agent: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          credential_id?: string | null
          duration_ms?: number | null
          endpoint: string
          id?: string
          ip_address?: string | null
          method: string
          response_code?: number | null
          scopes_used?: string[] | null
          user_agent?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          credential_id?: string | null
          duration_ms?: number | null
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          response_code?: number | null
          scopes_used?: string[] | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_access_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_access_logs_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "api_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      api_credentials: {
        Row: {
          allowed_ip_ranges: string[] | null
          client_id: string
          company_id: string
          created_at: string | null
          created_by: string | null
          environment: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          name: string
          rotation_group: string | null
          scopes: string[] | null
          secret_hash: string
          status: string
          updated_at: string | null
        }
        Insert: {
          allowed_ip_ranges?: string[] | null
          client_id: string
          company_id: string
          created_at?: string | null
          created_by?: string | null
          environment?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          rotation_group?: string | null
          scopes?: string[] | null
          secret_hash: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          allowed_ip_ranges?: string[] | null
          client_id?: string
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          environment?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          rotation_group?: string | null
          scopes?: string[] | null
          secret_hash?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_credentials_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_credentials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      application_documents: {
        Row: {
          application_id: string
          company_id: string
          document_type: string
          file_name: string | null
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          uploaded_at: string | null
        }
        Insert: {
          application_id: string
          company_id: string
          document_type: string
          file_name?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          uploaded_at?: string | null
        }
        Update: {
          application_id?: string
          company_id?: string
          document_type?: string
          file_name?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      application_stage_history: {
        Row: {
          application_id: string
          changed_by: string | null
          company_id: string
          created_at: string | null
          id: string
          new_stage: string
          notes: string | null
          previous_stage: string | null
        }
        Insert: {
          application_id: string
          changed_by?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          new_stage: string
          notes?: string | null
          previous_stage?: string | null
        }
        Update: {
          application_id?: string
          changed_by?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          new_stage?: string
          notes?: string | null
          previous_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_stage_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_stage_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_stage_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          answers: Json | null
          applicant_email: string
          applicant_token_hash: string
          assigned_reviewer_id: string | null
          company_id: string
          cover_letter: string | null
          created_at: string | null
          cv_file_path: string | null
          decision_at: string | null
          decision_by: string | null
          duplicate_warning: boolean | null
          first_name: string | null
          id: string
          internal_notes: string | null
          last_name: string | null
          phone: string | null
          privacy_acknowledged_at: string | null
          privacy_notice_version: string | null
          rejection_reason: string | null
          reviewer_rating: number | null
          stage_updated_at: string | null
          status: string | null
          updated_at: string | null
          vacancy_id: string
          withdrawn_at: string | null
        }
        Insert: {
          answers?: Json | null
          applicant_email: string
          applicant_token_hash: string
          assigned_reviewer_id?: string | null
          company_id: string
          cover_letter?: string | null
          created_at?: string | null
          cv_file_path?: string | null
          decision_at?: string | null
          decision_by?: string | null
          duplicate_warning?: boolean | null
          first_name?: string | null
          id?: string
          internal_notes?: string | null
          last_name?: string | null
          phone?: string | null
          privacy_acknowledged_at?: string | null
          privacy_notice_version?: string | null
          rejection_reason?: string | null
          reviewer_rating?: number | null
          stage_updated_at?: string | null
          status?: string | null
          updated_at?: string | null
          vacancy_id: string
          withdrawn_at?: string | null
        }
        Update: {
          answers?: Json | null
          applicant_email?: string
          applicant_token_hash?: string
          assigned_reviewer_id?: string | null
          company_id?: string
          cover_letter?: string | null
          created_at?: string | null
          cv_file_path?: string | null
          decision_at?: string | null
          decision_by?: string | null
          duplicate_warning?: boolean | null
          first_name?: string | null
          id?: string
          internal_notes?: string | null
          last_name?: string | null
          phone?: string | null
          privacy_acknowledged_at?: string | null
          privacy_notice_version?: string | null
          rejection_reason?: string | null
          reviewer_rating?: number | null
          stage_updated_at?: string | null
          status?: string | null
          updated_at?: string | null
          vacancy_id?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_assigned_reviewer_id_fkey"
            columns: ["assigned_reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_decision_by_fkey"
            columns: ["decision_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_logs: {
        Row: {
          clock_in: string | null
          clock_in_lat: number | null
          clock_in_lng: number | null
          clock_out: string | null
          clock_out_lat: number | null
          clock_out_lng: number | null
          company_id: string | null
          created_at: string | null
          guard_id: string | null
          id: string
          shift_id: string | null
        }
        Insert: {
          clock_in?: string | null
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_out?: string | null
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          company_id?: string | null
          created_at?: string | null
          guard_id?: string | null
          id?: string
          shift_id?: string | null
        }
        Update: {
          clock_in?: string | null
          clock_in_lat?: number | null
          clock_in_lng?: number | null
          clock_out?: string | null
          clock_out_lat?: number | null
          clock_out_lng?: number | null
          company_id?: string | null
          created_at?: string | null
          guard_id?: string | null
          id?: string
          shift_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "site_weekly_guard_cards"
            referencedColumns: ["shift_id"]
          },
        ]
      }
      automation_approvals: {
        Row: {
          company_id: string
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          expected_effect: Json | null
          expiry: string | null
          id: string
          reason: string | null
          requested_action: string
          requested_by: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          run_id: string
          safe_preview: Json | null
          status: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          expected_effect?: Json | null
          expiry?: string | null
          id?: string
          reason?: string | null
          requested_action: string
          requested_by?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          run_id: string
          safe_preview?: Json | null
          status?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          expected_effect?: Json | null
          expiry?: string | null
          id?: string
          reason?: string | null
          requested_action?: string
          requested_by?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          run_id?: string
          safe_preview?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_approvals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_approvals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_audit_log: {
        Row: {
          action: string
          actor: string | null
          agent_key: string | null
          company_id: string | null
          created_at: string | null
          id: string
          run_id: string | null
          safe_metadata: Json | null
        }
        Insert: {
          action: string
          actor?: string | null
          agent_key?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          run_id?: string | null
          safe_metadata?: Json | null
        }
        Update: {
          action?: string
          actor?: string | null
          agent_key?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          run_id?: string | null
          safe_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_audit_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          agent_id: string | null
          allowed_actions: Json | null
          approval_required: boolean | null
          company_id: string
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          enabled: boolean | null
          escalation_timing: Json | null
          id: string
          notification_recipients: Json | null
          quiet_hours: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          allowed_actions?: Json | null
          approval_required?: boolean | null
          company_id: string
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean | null
          escalation_timing?: Json | null
          id?: string
          notification_recipients?: Json | null
          quiet_hours?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          allowed_actions?: Json | null
          approval_required?: boolean | null
          company_id?: string
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean | null
          escalation_timing?: Json | null
          id?: string
          notification_recipients?: Json | null
          quiet_hours?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_disputes: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string
          currency: string
          evidence_due_by: string | null
          id: string
          is_charge_refundable: boolean | null
          raw: Json | null
          reason: string | null
          status: string
          stripe_charge_id: string | null
          stripe_dispute_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string
          currency?: string
          evidence_due_by?: string | null
          id?: string
          is_charge_refundable?: boolean | null
          raw?: Json | null
          reason?: string | null
          status: string
          stripe_charge_id?: string | null
          stripe_dispute_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string
          currency?: string
          evidence_due_by?: string | null
          id?: string
          is_charge_refundable?: boolean | null
          raw?: Json | null
          reason?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_dispute_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_disputes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          amount_due: number
          amount_paid: number
          amount_remaining: number
          attempt_count: number | null
          collection_method: string | null
          company_id: string | null
          created_at: string
          currency: string
          due_date: string | null
          hosted_invoice_url: string | null
          id: string
          invoice_date: string | null
          invoice_pdf_url: string | null
          next_payment_attempt: string | null
          number: string | null
          paid_at: string | null
          raw: Json | null
          status: string
          stripe_customer_id: string
          stripe_invoice_id: string
          stripe_subscription_id: string | null
          subtotal: number
          tax: number
          total: number
          updated_at: string
          voided_at: string | null
        }
        Insert: {
          amount_due?: number
          amount_paid?: number
          amount_remaining?: number
          attempt_count?: number | null
          collection_method?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_date?: string | null
          invoice_pdf_url?: string | null
          next_payment_attempt?: string | null
          number?: string | null
          paid_at?: string | null
          raw?: Json | null
          status: string
          stripe_customer_id: string
          stripe_invoice_id: string
          stripe_subscription_id?: string | null
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          voided_at?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          amount_remaining?: number
          attempt_count?: number | null
          collection_method?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_date?: string | null
          invoice_pdf_url?: string | null
          next_payment_attempt?: string | null
          number?: string | null
          paid_at?: string | null
          raw?: Json | null
          status?: string
          stripe_customer_id?: string
          stripe_invoice_id?: string
          stripe_subscription_id?: string | null
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_payments: {
        Row: {
          amount: number
          amount_captured: number | null
          amount_refunded: number | null
          card_brand: string | null
          card_country: string | null
          card_last4: string | null
          company_id: string | null
          created_at: string
          currency: string
          description: string | null
          failure_code: string | null
          failure_message: string | null
          id: string
          paid_at: string | null
          payment_method_type: string | null
          raw: Json | null
          receipt_url: string | null
          status: string
          stripe_charge_id: string | null
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          amount_captured?: number | null
          amount_refunded?: number | null
          card_brand?: string | null
          card_country?: string | null
          card_last4?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          paid_at?: string | null
          payment_method_type?: string | null
          raw?: Json | null
          receipt_url?: string | null
          status: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_captured?: number | null
          amount_refunded?: number | null
          card_brand?: string | null
          card_country?: string | null
          card_last4?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          paid_at?: string | null
          payment_method_type?: string | null
          raw?: Json | null
          receipt_url?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_refunds: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          raw: Json | null
          reason: string | null
          refunded_at: string | null
          status: string
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          raw?: Json | null
          reason?: string | null
          refunded_at?: string | null
          status: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          raw?: Json | null
          reason?: string | null
          refunded_at?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_refunds_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_run_lines: {
        Row: {
          adjustment_amount: number | null
          adjustment_reason: string | null
          billing_run_id: string
          calculation_trace: Json | null
          client_id: string
          company_id: string
          created_at: string
          description: string
          id: string
          net_amount: number
          quantity: number
          rate_card_id: string | null
          rate_version: number | null
          service_date: string
          site_id: string | null
          total_amount: number
          unit_rate: number
          vat_amount: number | null
          vat_rate: number | null
          work_record_id: string | null
        }
        Insert: {
          adjustment_amount?: number | null
          adjustment_reason?: string | null
          billing_run_id: string
          calculation_trace?: Json | null
          client_id: string
          company_id: string
          created_at?: string
          description: string
          id?: string
          net_amount: number
          quantity: number
          rate_card_id?: string | null
          rate_version?: number | null
          service_date: string
          site_id?: string | null
          total_amount: number
          unit_rate: number
          vat_amount?: number | null
          vat_rate?: number | null
          work_record_id?: string | null
        }
        Update: {
          adjustment_amount?: number | null
          adjustment_reason?: string | null
          billing_run_id?: string
          calculation_trace?: Json | null
          client_id?: string
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          net_amount?: number
          quantity?: number
          rate_card_id?: string | null
          rate_version?: number | null
          service_date?: string
          site_id?: string | null
          total_amount?: number
          unit_rate?: number
          vat_amount?: number | null
          vat_rate?: number | null
          work_record_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_run_lines_billing_run_id_fkey"
            columns: ["billing_run_id"]
            isOneToOne: false
            referencedRelation: "billing_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_run_lines_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_run_lines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_run_lines_rate_card_id_fkey"
            columns: ["rate_card_id"]
            isOneToOne: false
            referencedRelation: "client_charge_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_run_lines_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_run_lines_work_record_id_fkey"
            columns: ["work_record_id"]
            isOneToOne: false
            referencedRelation: "finance_work_records"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_runs: {
        Row: {
          approved_by: string | null
          client_id: string
          company_id: string
          contract_id: string | null
          created_at: string
          currency: string
          due_date: string | null
          gross_total: number | null
          id: string
          issue_date: string | null
          issued_by: string | null
          net_total: number | null
          notes: string | null
          period_end: string
          period_start: string
          po_reference: string | null
          prepared_by: string | null
          reference: string
          status: string
          updated_at: string
          vat_total: number | null
        }
        Insert: {
          approved_by?: string | null
          client_id: string
          company_id: string
          contract_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          gross_total?: number | null
          id?: string
          issue_date?: string | null
          issued_by?: string | null
          net_total?: number | null
          notes?: string | null
          period_end: string
          period_start: string
          po_reference?: string | null
          prepared_by?: string | null
          reference: string
          status?: string
          updated_at?: string
          vat_total?: number | null
        }
        Update: {
          approved_by?: string | null
          client_id?: string
          company_id?: string
          contract_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          gross_total?: number | null
          id?: string
          issue_date?: string | null
          issued_by?: string | null
          net_total?: number | null
          notes?: string | null
          period_end?: string
          period_start?: string
          po_reference?: string | null
          prepared_by?: string | null
          reference?: string
          status?: string
          updated_at?: string
          vat_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_runs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_runs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_runs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_runs_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "service_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_runs_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_runs_prepared_by_fkey"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_subscription_events: {
        Row: {
          cancel_at: string | null
          canceled_at: string | null
          company_id: string | null
          created_at: string
          event_type: string
          id: string
          new_plan: string | null
          new_status: string | null
          notes: string | null
          previous_plan: string | null
          previous_status: string | null
          raw: Json | null
          stripe_customer_id: string | null
          stripe_event_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          cancel_at?: string | null
          canceled_at?: string | null
          company_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          new_plan?: string | null
          new_status?: string | null
          notes?: string | null
          previous_plan?: string | null
          previous_status?: string | null
          raw?: Json | null
          stripe_customer_id?: string | null
          stripe_event_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          cancel_at?: string | null
          canceled_at?: string | null
          company_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          new_plan?: string | null
          new_status?: string | null
          notes?: string | null
          previous_plan?: string | null
          previous_status?: string | null
          raw?: Json | null
          stripe_customer_id?: string | null
          stripe_event_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscription_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_webhook_events: {
        Row: {
          error: string | null
          id: string
          livemode: boolean | null
          processed_at: string | null
          raw: Json | null
          received_at: string
          stripe_event_id: string
          type: string
        }
        Insert: {
          error?: string | null
          id?: string
          livemode?: boolean | null
          processed_at?: string | null
          raw?: Json | null
          received_at?: string
          stripe_event_id: string
          type: string
        }
        Update: {
          error?: string | null
          id?: string
          livemode?: boolean | null
          processed_at?: string | null
          raw?: Json | null
          received_at?: string
          stripe_event_id?: string
          type?: string
        }
        Relationships: []
      }
      built_sops: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          client_name: string | null
          company_id: string
          content_html: string | null
          content_json: Json | null
          created_at: string | null
          created_by: string | null
          emergency_contacts: Json | null
          equipment: Json | null
          escalation_procedure: string | null
          guard_acknowledgement_statement: string | null
          guard_role: string | null
          health_safety_notes: string | null
          id: string
          is_active: boolean | null
          ppe: string | null
          procedure_steps: Json | null
          published_at: string | null
          purpose: string | null
          reporting_requirements: string | null
          review_date: string | null
          risks_controls: Json | null
          roles: Json | null
          scope: string | null
          shift_type: string | null
          site_id: string | null
          sop_reference: string | null
          sop_type: string
          status: string
          title: string
          updated_at: string | null
          version_number: number
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          client_name?: string | null
          company_id: string
          content_html?: string | null
          content_json?: Json | null
          created_at?: string | null
          created_by?: string | null
          emergency_contacts?: Json | null
          equipment?: Json | null
          escalation_procedure?: string | null
          guard_acknowledgement_statement?: string | null
          guard_role?: string | null
          health_safety_notes?: string | null
          id?: string
          is_active?: boolean | null
          ppe?: string | null
          procedure_steps?: Json | null
          published_at?: string | null
          purpose?: string | null
          reporting_requirements?: string | null
          review_date?: string | null
          risks_controls?: Json | null
          roles?: Json | null
          scope?: string | null
          shift_type?: string | null
          site_id?: string | null
          sop_reference?: string | null
          sop_type: string
          status?: string
          title: string
          updated_at?: string | null
          version_number?: number
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          client_name?: string | null
          company_id?: string
          content_html?: string | null
          content_json?: Json | null
          created_at?: string | null
          created_by?: string | null
          emergency_contacts?: Json | null
          equipment?: Json | null
          escalation_procedure?: string | null
          guard_acknowledgement_statement?: string | null
          guard_role?: string | null
          health_safety_notes?: string | null
          id?: string
          is_active?: boolean | null
          ppe?: string | null
          procedure_steps?: Json | null
          published_at?: string | null
          purpose?: string | null
          reporting_requirements?: string | null
          review_date?: string | null
          risks_controls?: Json | null
          roles?: Json | null
          scope?: string | null
          shift_type?: string | null
          site_id?: string | null
          sop_reference?: string | null
          sop_type?: string
          status?: string
          title?: string
          updated_at?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "built_sops_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "built_sops_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "built_sops_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "built_sops_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      canned_responses: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          shortcut: string | null
          title: string
          updated_at: string | null
          use_count: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          shortcut?: string | null
          title: string
          updated_at?: string | null
          use_count?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          shortcut?: string | null
          title?: string
          updated_at?: string | null
          use_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "canned_responses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_access_log: {
        Row: {
          action: string
          client_id: string
          company_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          client_id: string
          company_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          client_id?: string
          company_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_access_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_access_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_access_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_announcements: {
        Row: {
          body: string
          category: string | null
          client_id: string | null
          company_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          published_at: string | null
          published_by: string | null
          site_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body: string
          category?: string | null
          client_id?: string | null
          company_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          published_at?: string | null
          published_by?: string | null
          site_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          category?: string | null
          client_id?: string | null
          company_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          published_at?: string | null
          published_by?: string | null
          site_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_announcements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_announcements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_announcements_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_announcements_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      client_branding: {
        Row: {
          accent_color: string | null
          client_id: string
          company_id: string
          created_at: string | null
          id: string
          logo_path: string | null
          primary_color: string | null
          report_footer: string | null
          report_header: string | null
          support_email: string | null
          support_phone: string | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          accent_color?: string | null
          client_id: string
          company_id: string
          created_at?: string | null
          id?: string
          logo_path?: string | null
          primary_color?: string | null
          report_footer?: string | null
          report_header?: string | null
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          accent_color?: string | null
          client_id?: string
          company_id?: string
          created_at?: string | null
          id?: string
          logo_path?: string | null
          primary_color?: string | null
          report_footer?: string | null
          report_header?: string | null
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_branding_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_branding_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_charge_rates: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          client_id: string | null
          company_id: string
          contract_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          effective_from: string
          effective_until: string | null
          id: string
          minimum_charge: number | null
          name: string
          notes: string | null
          priority: number
          rate_type: string
          role_requirement: string | null
          rounding_rule: string | null
          site_id: string | null
          status: string
          supersedes_id: string | null
          unit: string
          updated_at: string
          vat_category: string | null
          vat_rate: number | null
          version: number
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string | null
          company_id: string
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from: string
          effective_until?: string | null
          id?: string
          minimum_charge?: number | null
          name: string
          notes?: string | null
          priority?: number
          rate_type: string
          role_requirement?: string | null
          rounding_rule?: string | null
          site_id?: string | null
          status?: string
          supersedes_id?: string | null
          unit?: string
          updated_at?: string
          vat_category?: string | null
          vat_rate?: number | null
          version?: number
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string | null
          company_id?: string
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from?: string
          effective_until?: string | null
          id?: string
          minimum_charge?: number | null
          name?: string
          notes?: string | null
          priority?: number
          rate_type?: string
          role_requirement?: string | null
          rounding_rule?: string | null
          site_id?: string | null
          status?: string
          supersedes_id?: string | null
          unit?: string
          updated_at?: string
          vat_category?: string | null
          vat_rate?: number | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_charge_rates_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_charge_rates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_charge_rates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_charge_rates_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "service_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_charge_rates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_charge_rates_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_charge_rates_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "client_charge_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          client_id: string
          contact_type: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          job_title: string | null
          mobile: string | null
          name: string
          phone: string | null
          site_id: string | null
          sms_alerts: boolean | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          contact_type?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          job_title?: string | null
          mobile?: string | null
          name: string
          phone?: string | null
          site_id?: string | null
          sms_alerts?: boolean | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          contact_type?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          job_title?: string | null
          mobile?: string | null
          name?: string
          phone?: string | null
          site_id?: string | null
          sms_alerts?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_contacts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string | null
          document_category: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          is_public: boolean | null
          site_id: string | null
          storage_path: string
          updated_at: string | null
          upload_date: string | null
          uploaded_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          document_category?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          site_id?: string | null
          storage_path: string
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          document_category?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          site_id?: string | null
          storage_path?: string
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      client_invoice_disputes: {
        Row: {
          assigned_to: string | null
          client_id: string
          client_visible_response: string | null
          company_id: string
          created_at: string
          disputed_amount: number | null
          evidence_url: string | null
          id: string
          internal_notes: string | null
          invoice_id: string
          line_id: string | null
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          submitted_by: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id: string
          client_visible_response?: string | null
          company_id: string
          created_at?: string
          disputed_amount?: number | null
          evidence_url?: string | null
          id?: string
          internal_notes?: string | null
          invoice_id: string
          line_id?: string | null
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          submitted_by: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string
          client_visible_response?: string | null
          company_id?: string
          created_at?: string
          disputed_amount?: number | null
          evidence_url?: string | null
          id?: string
          internal_notes?: string | null
          invoice_id?: string
          line_id?: string | null
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          submitted_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_invoice_disputes_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoice_disputes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoice_disputes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoice_disputes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "client_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoice_disputes_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "billing_run_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoice_disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoice_disputes_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_invoices: {
        Row: {
          amount_paid: number
          approved_by: string | null
          balance_due: number | null
          billing_run_id: string | null
          client_address_snapshot: string | null
          client_email_snapshot: string | null
          client_id: string
          client_name_snapshot: string | null
          company_address_snapshot: string | null
          company_id: string
          company_name_snapshot: string | null
          company_vat_snapshot: string | null
          created_at: string
          currency: string
          due_date: string
          gross_total: number
          id: string
          invoice_number: string
          issue_date: string
          issued_by: string | null
          net_total: number
          payment_terms: string | null
          pdf_url: string | null
          po_reference: string | null
          prepared_by: string | null
          service_period_end: string | null
          service_period_start: string | null
          status: string
          updated_at: string
          vat_total: number
          version: number
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          amount_paid?: number
          approved_by?: string | null
          balance_due?: number | null
          billing_run_id?: string | null
          client_address_snapshot?: string | null
          client_email_snapshot?: string | null
          client_id: string
          client_name_snapshot?: string | null
          company_address_snapshot?: string | null
          company_id: string
          company_name_snapshot?: string | null
          company_vat_snapshot?: string | null
          created_at?: string
          currency?: string
          due_date: string
          gross_total?: number
          id?: string
          invoice_number: string
          issue_date: string
          issued_by?: string | null
          net_total?: number
          payment_terms?: string | null
          pdf_url?: string | null
          po_reference?: string | null
          prepared_by?: string | null
          service_period_end?: string | null
          service_period_start?: string | null
          status?: string
          updated_at?: string
          vat_total?: number
          version?: number
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          amount_paid?: number
          approved_by?: string | null
          balance_due?: number | null
          billing_run_id?: string | null
          client_address_snapshot?: string | null
          client_email_snapshot?: string | null
          client_id?: string
          client_name_snapshot?: string | null
          company_address_snapshot?: string | null
          company_id?: string
          company_name_snapshot?: string | null
          company_vat_snapshot?: string | null
          created_at?: string
          currency?: string
          due_date?: string
          gross_total?: number
          id?: string
          invoice_number?: string
          issue_date?: string
          issued_by?: string | null
          net_total?: number
          payment_terms?: string | null
          pdf_url?: string | null
          po_reference?: string | null
          prepared_by?: string | null
          service_period_end?: string | null
          service_period_start?: string | null
          status?: string
          updated_at?: string
          vat_total?: number
          version?: number
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_invoices_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_billing_run_id_fkey"
            columns: ["billing_run_id"]
            isOneToOne: false
            referencedRelation: "billing_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_prepared_by_fkey"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invoices_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_messages: {
        Row: {
          body: string | null
          client_id: string | null
          company_id: string | null
          created_at: string | null
          from_user_id: string | null
          id: string
          incident_id: string | null
          is_from_client: boolean | null
          read_at: string | null
          site_id: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          body?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          incident_id?: string | null
          is_from_client?: boolean | null
          read_at?: string | null
          site_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          body?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          incident_id?: string | null
          is_from_client?: boolean | null
          read_at?: string | null
          site_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_messages_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_messages_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_messages_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      client_payments: {
        Row: {
          amount: number
          client_id: string
          company_id: string
          created_at: string
          currency: string
          external_id: string | null
          id: string
          method: string | null
          payment_date: string
          payment_reference: string | null
          recorded_by: string | null
          source: string | null
          status: string
          unallocated_amount: number
          updated_at: string
          verified_by: string | null
        }
        Insert: {
          amount: number
          client_id: string
          company_id: string
          created_at?: string
          currency?: string
          external_id?: string | null
          id?: string
          method?: string | null
          payment_date: string
          payment_reference?: string | null
          recorded_by?: string | null
          source?: string | null
          status?: string
          unallocated_amount?: number
          updated_at?: string
          verified_by?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          company_id?: string
          created_at?: string
          currency?: string
          external_id?: string | null
          id?: string
          method?: string | null
          payment_date?: string
          payment_reference?: string | null
          recorded_by?: string | null
          source?: string | null
          status?: string
          unallocated_amount?: number
          updated_at?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_settings: {
        Row: {
          branding: Json | null
          client_id: string
          company_id: string
          created_at: string | null
          default_visibility: string | null
          enabled_modules: string[] | null
          id: string
          notification_preferences: Json | null
          report_schedule: string | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          branding?: Json | null
          client_id: string
          company_id: string
          created_at?: string | null
          default_visibility?: string | null
          enabled_modules?: string[] | null
          id?: string
          notification_preferences?: Json | null
          report_schedule?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          branding?: Json | null
          client_id?: string
          company_id?: string
          created_at?: string | null
          default_visibility?: string | null
          enabled_modules?: string[] | null
          id?: string
          notification_preferences?: Json | null
          report_schedule?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_settings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          client_id: string
          company_name: string
          company_registration_number: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          emergency_contact_number: string | null
          id: string
          logo_url: string | null
          main_contact_name: string | null
          main_office_address: string | null
          trading_name: string | null
          updated_at: string | null
          vat_number: string | null
        }
        Insert: {
          client_id: string
          company_name: string
          company_registration_number?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          emergency_contact_number?: string | null
          id?: string
          logo_url?: string | null
          main_contact_name?: string | null
          main_office_address?: string | null
          trading_name?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Update: {
          client_id?: string
          company_name?: string
          company_registration_number?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          emergency_contact_number?: string | null
          id?: string
          logo_url?: string | null
          main_contact_name?: string | null
          main_office_address?: string | null
          trading_name?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_report_templates: {
        Row: {
          brand_color: string | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          footer_text: string | null
          header_text: string | null
          id: string
          include_ai_recommendations: boolean | null
          include_dob_summary: boolean | null
          include_evidence_summary: boolean | null
          include_guard_attendance: boolean | null
          include_incidents: boolean | null
          include_missed_patrols: boolean | null
          include_patrol_completion: boolean | null
          include_site_summary: boolean | null
          include_support_tickets: boolean | null
          include_welfare_summary: boolean | null
          is_default: boolean | null
          template_name: string
          updated_at: string | null
        }
        Insert: {
          brand_color?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          include_ai_recommendations?: boolean | null
          include_dob_summary?: boolean | null
          include_evidence_summary?: boolean | null
          include_guard_attendance?: boolean | null
          include_incidents?: boolean | null
          include_missed_patrols?: boolean | null
          include_patrol_completion?: boolean | null
          include_site_summary?: boolean | null
          include_support_tickets?: boolean | null
          include_welfare_summary?: boolean | null
          is_default?: boolean | null
          template_name: string
          updated_at?: string | null
        }
        Update: {
          brand_color?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          include_ai_recommendations?: boolean | null
          include_dob_summary?: boolean | null
          include_evidence_summary?: boolean | null
          include_guard_attendance?: boolean | null
          include_incidents?: boolean | null
          include_missed_patrols?: boolean | null
          include_patrol_completion?: boolean | null
          include_site_summary?: boolean | null
          include_support_tickets?: boolean | null
          include_welfare_summary?: boolean | null
          is_default?: boolean | null
          template_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_report_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_site_access: {
        Row: {
          client_user_id: string
          company_id: string
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_level: string
          site_id: string
        }
        Insert: {
          client_user_id: string
          company_id: string
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_level?: string
          site_id: string
        }
        Update: {
          client_user_id?: string
          company_id?: string
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_level?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_site_access_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_site_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_site_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_site_access_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      client_sites: {
        Row: {
          client_contact_for_site: string | null
          client_id: string
          created_at: string | null
          created_by: string | null
          id: string
          opening_hours: string | null
          risk_level: string | null
          security_cover_hours: string | null
          site_address: string | null
          site_contact_person: string | null
          site_map_url: string | null
          site_name: string
          site_notes: string | null
          site_phone: string | null
          updated_at: string | null
        }
        Insert: {
          client_contact_for_site?: string | null
          client_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          opening_hours?: string | null
          risk_level?: string | null
          security_cover_hours?: string | null
          site_address?: string | null
          site_contact_person?: string | null
          site_map_url?: string | null
          site_name: string
          site_notes?: string | null
          site_phone?: string | null
          updated_at?: string | null
        }
        Update: {
          client_contact_for_site?: string | null
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          opening_hours?: string | null
          risk_level?: string | null
          security_cover_hours?: string | null
          site_address?: string | null
          site_contact_person?: string | null
          site_map_url?: string | null
          site_name?: string
          site_notes?: string | null
          site_phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_sites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          activated_at: string | null
          client_id: string | null
          company_id: string | null
          created_at: string | null
          id: string
          invitation_consumed_at: string | null
          invitation_expires_at: string | null
          invitation_token_hash: string | null
          invited_at: string | null
          last_access: string | null
          role: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          invitation_consumed_at?: string | null
          invitation_expires_at?: string | null
          invitation_token_hash?: string | null
          invited_at?: string | null
          last_access?: string | null
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          invitation_consumed_at?: string | null
          invitation_expires_at?: string | null
          invitation_token_hash?: string | null
          invited_at?: string | null
          last_access?: string | null
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          account_manager_id: string | null
          address: string | null
          billing_address: string | null
          company_id: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          portal_enabled: boolean | null
          reference: string | null
          status: string | null
          trading_name: string | null
          updated_at: string | null
        }
        Insert: {
          account_manager_id?: string | null
          address?: string | null
          billing_address?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          portal_enabled?: boolean | null
          reference?: string | null
          status?: string | null
          trading_name?: string | null
          updated_at?: string | null
        }
        Update: {
          account_manager_id?: string | null
          address?: string | null
          billing_address?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          portal_enabled?: boolean | null
          reference?: string | null
          status?: string | null
          trading_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          account_status: string | null
          address: string | null
          archived_at: string | null
          brand_color: string | null
          brand_color_secondary: string | null
          brand_font: string | null
          branding_updated_at: string | null
          cancelled_at: string | null
          city: string | null
          company_size: string | null
          contact_email: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email_from_name: string | null
          email_reply_to: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          name: string
          onboarding_status: string | null
          phone: string | null
          plan_name: string | null
          portal_domain: string | null
          portal_footer_text: string | null
          portal_welcome_message: string | null
          postal_code: string | null
          report_footer_html: string | null
          report_header_html: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_billing: string | null
          subscription_cancel_at: string | null
          subscription_period_end: string | null
          subscription_plan: string | null
          subscription_status: string | null
          suspended_at: string | null
          trial_ends_at: string | null
          updated_at: string | null
          vat_number: string | null
        }
        Insert: {
          account_status?: string | null
          address?: string | null
          archived_at?: string | null
          brand_color?: string | null
          brand_color_secondary?: string | null
          brand_font?: string | null
          branding_updated_at?: string | null
          cancelled_at?: string | null
          city?: string | null
          company_size?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email_from_name?: string | null
          email_reply_to?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          name: string
          onboarding_status?: string | null
          phone?: string | null
          plan_name?: string | null
          portal_domain?: string | null
          portal_footer_text?: string | null
          portal_welcome_message?: string | null
          postal_code?: string | null
          report_footer_html?: string | null
          report_header_html?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_billing?: string | null
          subscription_cancel_at?: string | null
          subscription_period_end?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          suspended_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Update: {
          account_status?: string | null
          address?: string | null
          archived_at?: string | null
          brand_color?: string | null
          brand_color_secondary?: string | null
          brand_font?: string | null
          branding_updated_at?: string | null
          cancelled_at?: string | null
          city?: string | null
          company_size?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email_from_name?: string | null
          email_reply_to?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          onboarding_status?: string | null
          phone?: string | null
          plan_name?: string | null
          portal_domain?: string | null
          portal_footer_text?: string | null
          portal_welcome_message?: string | null
          postal_code?: string | null
          report_footer_html?: string | null
          report_header_html?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_billing?: string | null
          subscription_cancel_at?: string | null
          subscription_period_end?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          suspended_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
      company_acs_records: {
        Row: {
          acs_status: string
          annual_assessment_date: string | null
          approval_reference: string | null
          approved_activities: string[] | null
          assessor: string | null
          authorised_at: string | null
          authorised_by: string | null
          company_id: string
          conditions: string | null
          created_at: string
          display_authorised: boolean
          effective_date: string | null
          evidence_ref: string | null
          expiry_date: string | null
          id: string
          renewal_notes: string | null
          updated_at: string
        }
        Insert: {
          acs_status?: string
          annual_assessment_date?: string | null
          approval_reference?: string | null
          approved_activities?: string[] | null
          assessor?: string | null
          authorised_at?: string | null
          authorised_by?: string | null
          company_id: string
          conditions?: string | null
          created_at?: string
          display_authorised?: boolean
          effective_date?: string | null
          evidence_ref?: string | null
          expiry_date?: string | null
          id?: string
          renewal_notes?: string | null
          updated_at?: string
        }
        Update: {
          acs_status?: string
          annual_assessment_date?: string | null
          approval_reference?: string | null
          approved_activities?: string[] | null
          assessor?: string | null
          authorised_at?: string | null
          authorised_by?: string | null
          company_id?: string
          conditions?: string | null
          created_at?: string
          display_authorised?: boolean
          effective_date?: string | null
          evidence_ref?: string | null
          expiry_date?: string | null
          id?: string
          renewal_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_ai_providers: {
        Row: {
          company_id: string
          created_at: string | null
          enabled: boolean
          id: string
          provider: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          enabled?: boolean
          id?: string
          provider: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          enabled?: boolean
          id?: string
          provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_ai_providers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_branding_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          company_id: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          company_id: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          company_id?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_branding_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_branding_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_enabled_modules: {
        Row: {
          company_id: string
          enabled: boolean | null
          enabled_at: string | null
          enabled_by: string | null
          id: string
          module_id: string
        }
        Insert: {
          company_id: string
          enabled?: boolean | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          module_id: string
        }
        Update: {
          company_id?: string
          enabled?: boolean | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_enabled_modules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_enabled_modules_enabled_by_fkey"
            columns: ["enabled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_enabled_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      company_integrations: {
        Row: {
          authorized_capabilities: string[] | null
          company_id: string
          connected_by: string | null
          created_at: string | null
          enabled: boolean
          encrypted_credential_ref: string | null
          environment: string
          external_organisation_id: string | null
          health_status: string
          id: string
          integration_key: string
          last_synced_at: string | null
          last_verified_at: string | null
          updated_at: string | null
        }
        Insert: {
          authorized_capabilities?: string[] | null
          company_id: string
          connected_by?: string | null
          created_at?: string | null
          enabled?: boolean
          encrypted_credential_ref?: string | null
          environment?: string
          external_organisation_id?: string | null
          health_status?: string
          id?: string
          integration_key: string
          last_synced_at?: string | null
          last_verified_at?: string | null
          updated_at?: string | null
        }
        Update: {
          authorized_capabilities?: string[] | null
          company_id?: string
          connected_by?: string | null
          created_at?: string | null
          enabled?: boolean
          encrypted_credential_ref?: string | null
          environment?: string
          external_organisation_id?: string | null
          health_status?: string
          id?: string
          integration_key?: string
          last_synced_at?: string | null
          last_verified_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_integrations_connected_by_fkey"
            columns: ["connected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      company_secrets: {
        Row: {
          company_id: string
          created_at: string | null
          encryption_version: number | null
          secret_name: string
          secret_value: string
          secret_value_encrypted: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          encryption_version?: number | null
          secret_name: string
          secret_value: string
          secret_value_encrypted?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          encryption_version?: number | null
          secret_name?: string
          secret_value?: string
          secret_value_encrypted?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_secrets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_setup_progress: {
        Row: {
          company_data: Json | null
          company_id: string
          completed_at: string | null
          compliance_data: Json | null
          created_at: string | null
          current_step: number
          guards_data: Json | null
          id: string
          is_completed: boolean | null
          rota_data: Json | null
          site_data: Json | null
          updated_at: string | null
        }
        Insert: {
          company_data?: Json | null
          company_id: string
          completed_at?: string | null
          compliance_data?: Json | null
          created_at?: string | null
          current_step?: number
          guards_data?: Json | null
          id?: string
          is_completed?: boolean | null
          rota_data?: Json | null
          site_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          company_data?: Json | null
          company_id?: string
          completed_at?: string | null
          compliance_data?: Json | null
          created_at?: string | null
          current_step?: number
          guards_data?: Json | null
          id?: string
          is_completed?: boolean | null
          rota_data?: Json | null
          site_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_setup_progress_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_assessments: {
        Row: {
          action_items: string | null
          assessment_date: string
          assessor_id: string | null
          company_id: string
          competency_name: string
          created_at: string | null
          evidence_file_path: string | null
          id: string
          notes: string | null
          outcome: string
          reassessment_date: string | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          action_items?: string | null
          assessment_date?: string
          assessor_id?: string | null
          company_id: string
          competency_name: string
          created_at?: string | null
          evidence_file_path?: string | null
          id?: string
          notes?: string | null
          outcome: string
          reassessment_date?: string | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          action_items?: string | null
          assessment_date?: string
          assessor_id?: string | null
          company_id?: string
          competency_name?: string
          created_at?: string | null
          evidence_file_path?: string | null
          id?: string
          notes?: string | null
          outcome?: string
          reassessment_date?: string | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competency_assessments_assessor_id_fkey"
            columns: ["assessor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_assessments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_assessments_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_documents: {
        Row: {
          company_id: string
          created_at: string | null
          document_title: string
          document_type: string
          entity_id: string
          entity_type: string
          expiry_date: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          issue_date: string | null
          rejection_reason: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          document_title: string
          document_type: string
          entity_id: string
          entity_type: string
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          rejection_reason?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          document_title?: string
          document_type?: string
          entity_id?: string
          entity_type?: string
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          rejection_reason?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_evidence: {
        Row: {
          company_id: string
          created_at: string
          evidence_type: string
          id: string
          notes: string | null
          reference_code: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          storage_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          evidence_type: string
          id?: string
          notes?: string | null
          reference_code?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          storage_path?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          evidence_type?: string
          id?: string
          notes?: string | null
          reference_code?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          storage_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_frameworks: {
        Row: {
          created_at: string
          description: string | null
          framework_type: string
          id: string
          is_published: boolean
          name: string
          notes: string | null
          owner_id: string | null
          review_due_at: string | null
          reviewed_at: string | null
          slug: string
          status: string
          updated_at: string
          version_label: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          framework_type?: string
          id?: string
          is_published?: boolean
          name: string
          notes?: string | null
          owner_id?: string | null
          review_due_at?: string | null
          reviewed_at?: string | null
          slug: string
          status?: string
          updated_at?: string
          version_label?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          framework_type?: string
          id?: string
          is_published?: boolean
          name?: string
          notes?: string | null
          owner_id?: string | null
          review_due_at?: string | null
          reviewed_at?: string | null
          slug?: string
          status?: string
          updated_at?: string
          version_label?: string | null
        }
        Relationships: []
      }
      compliance_review_tasks: {
        Row: {
          assignee_id: string | null
          category: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_notes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          credit_note_number: string
          credited_lines: Json | null
          id: string
          invoice_id: string
          issued_at: string | null
          net_amount: number
          prepared_by: string | null
          reason: string
          status: string
          total_amount: number
          updated_at: string
          vat_amount: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          credit_note_number: string
          credited_lines?: Json | null
          id?: string
          invoice_id: string
          issued_at?: string | null
          net_amount: number
          prepared_by?: string | null
          reason: string
          status?: string
          total_amount: number
          updated_at?: string
          vat_amount?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          credit_note_number?: string
          credited_lines?: Json | null
          id?: string
          invoice_id?: string
          issued_at?: string | null
          net_amount?: number
          prepared_by?: string | null
          reason?: string
          status?: string
          total_amount?: number
          updated_at?: string
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "client_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_prepared_by_fkey"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      data_breach_cases: {
        Row: {
          actions_taken: string | null
          approx_volume: number | null
          awareness_time: string | null
          cia_impact: string | null
          company_id: string
          containment: string | null
          created_at: string
          data_affected: string | null
          description: string | null
          discovery_time: string | null
          evidence: string | null
          final_review: string | null
          id: string
          individual_notification_decision: string | null
          owner_id: string | null
          processor_notifications: string | null
          reference: string | null
          regulator_notification_deadline: string | null
          reportability_assessment: string
          risk_to_individuals: string | null
          status: string
          subjects_affected: string | null
          updated_at: string
        }
        Insert: {
          actions_taken?: string | null
          approx_volume?: number | null
          awareness_time?: string | null
          cia_impact?: string | null
          company_id: string
          containment?: string | null
          created_at?: string
          data_affected?: string | null
          description?: string | null
          discovery_time?: string | null
          evidence?: string | null
          final_review?: string | null
          id?: string
          individual_notification_decision?: string | null
          owner_id?: string | null
          processor_notifications?: string | null
          reference?: string | null
          regulator_notification_deadline?: string | null
          reportability_assessment?: string
          risk_to_individuals?: string | null
          status?: string
          subjects_affected?: string | null
          updated_at?: string
        }
        Update: {
          actions_taken?: string | null
          approx_volume?: number | null
          awareness_time?: string | null
          cia_impact?: string | null
          company_id?: string
          containment?: string | null
          created_at?: string
          data_affected?: string | null
          description?: string | null
          discovery_time?: string | null
          evidence?: string | null
          final_review?: string | null
          id?: string
          individual_notification_decision?: string | null
          owner_id?: string | null
          processor_notifications?: string | null
          reference?: string | null
          regulator_notification_deadline?: string | null
          reportability_assessment?: string
          risk_to_individuals?: string | null
          status?: string
          subjects_affected?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      data_breach_events: {
        Row: {
          actor_id: string | null
          breach_case_id: string
          created_at: string
          description: string | null
          event_type: string
          id: string
        }
        Insert: {
          actor_id?: string | null
          breach_case_id: string
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
        }
        Update: {
          actor_id?: string | null
          breach_case_id?: string
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_breach_events_breach_case_id_fkey"
            columns: ["breach_case_id"]
            isOneToOne: false
            referencedRelation: "data_breach_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      data_processing_agreements: {
        Row: {
          agreement_type: string
          company_id: string
          counterparty_name: string
          created_at: string
          document_ref: string | null
          effective_date: string | null
          id: string
          notes: string | null
          owner_id: string | null
          review_date: string | null
          signed_storage_path: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agreement_type?: string
          company_id: string
          counterparty_name: string
          created_at?: string
          document_ref?: string | null
          effective_date?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          review_date?: string | null
          signed_storage_path?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agreement_type?: string
          company_id?: string
          counterparty_name?: string
          created_at?: string
          document_ref?: string | null
          effective_date?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          review_date?: string | null
          signed_storage_path?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assigned_to: string | null
          completed_at: string | null
          completion_evidence: string | null
          created_at: string | null
          created_by: string | null
          data_sources: string[] | null
          exemptions: string | null
          export_expires_at: string | null
          export_file_path: string | null
          id: string
          identity_verified: boolean | null
          redactions: string | null
          request_type: string
          requester_id: string | null
          scope: string | null
          status: string | null
          statutory_deadline: string | null
          target_tenant_id: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completion_evidence?: string | null
          created_at?: string | null
          created_by?: string | null
          data_sources?: string[] | null
          exemptions?: string | null
          export_expires_at?: string | null
          export_file_path?: string | null
          id?: string
          identity_verified?: boolean | null
          redactions?: string | null
          request_type: string
          requester_id?: string | null
          scope?: string | null
          status?: string | null
          statutory_deadline?: string | null
          target_tenant_id?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completion_evidence?: string | null
          created_at?: string | null
          created_by?: string | null
          data_sources?: string[] | null
          exemptions?: string | null
          export_expires_at?: string | null
          export_file_path?: string | null
          id?: string
          identity_verified?: boolean | null
          redactions?: string | null
          request_type?: string
          requester_id?: string | null
          scope?: string | null
          status?: string | null
          statutory_deadline?: string | null
          target_tenant_id?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_requests_target_tenant_id_fkey"
            columns: ["target_tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_requests_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      data_subject_request_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          request_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          request_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_subject_request_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "data_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      data_transfer_records: {
        Row: {
          created_at: string
          data_categories: string | null
          id: string
          notes: string | null
          owner_id: string | null
          review_date: string | null
          risk_assessment: string | null
          status: string
          subprocessor_id: string | null
          transfer_mechanism: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_categories?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          review_date?: string | null
          risk_assessment?: string | null
          status?: string
          subprocessor_id?: string | null
          transfer_mechanism?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_categories?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          review_date?: string | null
          risk_assessment?: string | null
          status?: string
          subprocessor_id?: string | null
          transfer_mechanism?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_transfer_records_subprocessor_id_fkey"
            columns: ["subprocessor_id"]
            isOneToOne: false
            referencedRelation: "subprocessors"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_records: {
        Row: {
          commit_sha: string | null
          created_at: string
          deployed_at: string
          deployed_by: string | null
          environment: string
          id: string
          notes: string | null
          rollback_to: string | null
          status: string
          version: string | null
        }
        Insert: {
          commit_sha?: string | null
          created_at?: string
          deployed_at?: string
          deployed_by?: string | null
          environment: string
          id?: string
          notes?: string | null
          rollback_to?: string | null
          status?: string
          version?: string | null
        }
        Update: {
          commit_sha?: string | null
          created_at?: string
          deployed_at?: string
          deployed_by?: string | null
          environment?: string
          id?: string
          notes?: string | null
          rollback_to?: string | null
          status?: string
          version?: string | null
        }
        Relationships: []
      }
      document_expiry_notifications: {
        Row: {
          company_id: string
          created_at: string | null
          document_id: string
          id: string
          message: string
          notification_type: string
          read_at: string | null
          sent_at: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          document_id: string
          id?: string
          message: string
          notification_type: string
          read_at?: string | null
          sent_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          document_id?: string
          id?: string
          message?: string
          notification_type?: string
          read_at?: string | null
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_expiry_notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_expiry_notifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "compliance_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_expiry_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_reviews: {
        Row: {
          company_id: string
          created_at: string | null
          document_id: string
          id: string
          notes: string | null
          rejection_reason: string | null
          review_status: string
          reviewed_by: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          document_id: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          review_status?: string
          reviewed_by?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          document_id?: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          review_status?: string
          reviewed_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_reviews_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "compliance_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      dpia_assessments: {
        Row: {
          additional_controls: string | null
          approval_status: string
          automated_decisions: boolean
          company_id: string | null
          consultation: string | null
          created_at: string
          data_flow: string | null
          data_sources: string | null
          dpo_advice: string | null
          escalation_recorded: boolean
          existing_controls: string | null
          id: string
          impact: string | null
          individuals_affected: string | null
          international_transfers: boolean
          is_template: boolean
          likelihood: string | null
          necessity_proportionality: string | null
          processing_description: string | null
          purpose_benefits: string | null
          residual_risk: string
          review_date: string | null
          reviewed_by: string | null
          sensitive_data: string | null
          systematic_monitoring: boolean
          threats: string | null
          title: string
          updated_at: string
        }
        Insert: {
          additional_controls?: string | null
          approval_status?: string
          automated_decisions?: boolean
          company_id?: string | null
          consultation?: string | null
          created_at?: string
          data_flow?: string | null
          data_sources?: string | null
          dpo_advice?: string | null
          escalation_recorded?: boolean
          existing_controls?: string | null
          id?: string
          impact?: string | null
          individuals_affected?: string | null
          international_transfers?: boolean
          is_template?: boolean
          likelihood?: string | null
          necessity_proportionality?: string | null
          processing_description?: string | null
          purpose_benefits?: string | null
          residual_risk?: string
          review_date?: string | null
          reviewed_by?: string | null
          sensitive_data?: string | null
          systematic_monitoring?: boolean
          threats?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          additional_controls?: string | null
          approval_status?: string
          automated_decisions?: boolean
          company_id?: string | null
          consultation?: string | null
          created_at?: string
          data_flow?: string | null
          data_sources?: string | null
          dpo_advice?: string | null
          escalation_recorded?: boolean
          existing_controls?: string | null
          id?: string
          impact?: string | null
          individuals_affected?: string | null
          international_transfers?: boolean
          is_template?: boolean
          likelihood?: string | null
          necessity_proportionality?: string | null
          processing_description?: string | null
          purpose_benefits?: string | null
          residual_risk?: string
          review_date?: string | null
          reviewed_by?: string | null
          sensitive_data?: string | null
          systematic_monitoring?: boolean
          threats?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_assets: {
        Row: {
          alt_text: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          public_url: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          public_url: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          public_url?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      evidence_access_logs: {
        Row: {
          action: string
          client_id: string | null
          company_id: string
          created_at: string | null
          document_id: string | null
          evidence_file_id: string | null
          id: string
          incident_id: string | null
          ip_address: string | null
          metadata: Json | null
          site_id: string | null
          source_route: string | null
          user_agent: string | null
          user_id: string
          user_role: string
        }
        Insert: {
          action: string
          client_id?: string | null
          company_id: string
          created_at?: string | null
          document_id?: string | null
          evidence_file_id?: string | null
          id?: string
          incident_id?: string | null
          ip_address?: string | null
          metadata?: Json | null
          site_id?: string | null
          source_route?: string | null
          user_agent?: string | null
          user_id: string
          user_role: string
        }
        Update: {
          action?: string
          client_id?: string | null
          company_id?: string
          created_at?: string | null
          document_id?: string | null
          evidence_file_id?: string | null
          id?: string
          incident_id?: string | null
          ip_address?: string | null
          metadata?: Json | null
          site_id?: string | null
          source_route?: string | null
          user_agent?: string | null
          user_id?: string
          user_role?: string
        }
        Relationships: []
      }
      evidence_files: {
        Row: {
          client_id: string | null
          company_id: string
          created_at: string | null
          file_name: string
          file_size_bytes: number | null
          file_type: string
          file_url: string
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          incident_id: string | null
          linked_to_incident: boolean | null
          linked_to_maintenance: boolean | null
          linked_to_ob: boolean | null
          linked_to_patrol: boolean | null
          linked_to_report: boolean | null
          linked_to_welfare: boolean | null
          review_status: string
          site_id: string | null
          storage_bucket: string | null
          storage_path: string | null
          updated_at: string | null
          uploaded_by: string | null
          uploaded_by_guard: string | null
          uploader_name: string | null
        }
        Insert: {
          client_id?: string | null
          company_id: string
          created_at?: string | null
          file_name: string
          file_size_bytes?: number | null
          file_type: string
          file_url: string
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          incident_id?: string | null
          linked_to_incident?: boolean | null
          linked_to_maintenance?: boolean | null
          linked_to_ob?: boolean | null
          linked_to_patrol?: boolean | null
          linked_to_report?: boolean | null
          linked_to_welfare?: boolean | null
          review_status?: string
          site_id?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          uploaded_by_guard?: string | null
          uploader_name?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string
          created_at?: string | null
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string
          file_url?: string
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          incident_id?: string | null
          linked_to_incident?: boolean | null
          linked_to_maintenance?: boolean | null
          linked_to_ob?: boolean | null
          linked_to_patrol?: boolean | null
          linked_to_report?: boolean | null
          linked_to_welfare?: boolean | null
          review_status?: string
          site_id?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          uploaded_by_guard?: string | null
          uploader_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_files_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_files_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_files_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_files_uploaded_by_guard_fkey"
            columns: ["uploaded_by_guard"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_links: {
        Row: {
          company_id: string
          created_at: string | null
          evidence_file_id: string
          id: string
          link_type: string
          linked_record_id: string
          linked_record_type: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          evidence_file_id: string
          id?: string
          link_type: string
          linked_record_id: string
          linked_record_type: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          evidence_file_id?: string
          id?: string
          link_type?: string
          linked_record_id?: string
          linked_record_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_links_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_links_evidence_file_id_fkey"
            columns: ["evidence_file_id"]
            isOneToOne: false
            referencedRelation: "evidence_files"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_reviews: {
        Row: {
          company_id: string
          created_at: string | null
          evidence_file_id: string
          id: string
          rejection_reason: string | null
          review_notes: string | null
          review_status: string
          reviewed_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          evidence_file_id: string
          id?: string
          rejection_reason?: string | null
          review_notes?: string | null
          review_status: string
          reviewed_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          evidence_file_id?: string
          id?: string
          rejection_reason?: string | null
          review_notes?: string | null
          review_status?: string
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_reviews_evidence_file_id_fkey"
            columns: ["evidence_file_id"]
            isOneToOne: false
            referencedRelation: "evidence_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flag_history: {
        Row: {
          change_type: string
          changed_by: string | null
          created_at: string | null
          flag_id: string
          id: string
          new_state: Json | null
          previous_state: Json | null
        }
        Insert: {
          change_type: string
          changed_by?: string | null
          created_at?: string | null
          flag_id: string
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          created_at?: string | null
          flag_id?: string
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flag_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_flag_history_flag_id_fkey"
            columns: ["flag_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          default_state: boolean | null
          description: string | null
          ends_at: string | null
          flag_key: string
          id: string
          is_active: boolean | null
          is_kill_switch: boolean | null
          owner: string | null
          requires_approval: boolean | null
          risk_level: string | null
          rollout_percentage: number | null
          starts_at: string | null
          target_rules: Json | null
          target_type: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          default_state?: boolean | null
          description?: string | null
          ends_at?: string | null
          flag_key: string
          id?: string
          is_active?: boolean | null
          is_kill_switch?: boolean | null
          owner?: string | null
          requires_approval?: boolean | null
          risk_level?: string | null
          rollout_percentage?: number | null
          starts_at?: string | null
          target_rules?: Json | null
          target_type?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          default_state?: boolean | null
          description?: string | null
          ends_at?: string | null
          flag_key?: string
          id?: string
          is_active?: boolean | null
          is_kill_switch?: boolean | null
          owner?: string | null
          requires_approval?: boolean | null
          risk_level?: string | null
          rollout_percentage?: number | null
          starts_at?: string | null
          target_rules?: Json | null
          target_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_flags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_flags_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_usage: {
        Row: {
          company_id: string
          current_value: number | null
          feature_key: string
          id: string
          max_value: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          current_value?: number | null
          feature_key: string
          id?: string
          max_value?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          current_value?: number | null
          feature_key?: string
          id?: string
          max_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_usage_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          company_id: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          reason: string | null
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_audit_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_work_records: {
        Row: {
          actual_end: string | null
          actual_hours: number | null
          actual_start: string | null
          assignment_id: string | null
          attendance_id: string | null
          billable_amount: number | null
          billable_hours: number | null
          billing_run_id: string | null
          break_minutes: number | null
          charge_rate_id: string | null
          client_id: string | null
          company_id: string
          contract_id: string | null
          correction_count: number | null
          created_at: string
          guard_id: string
          id: string
          notes: string | null
          pay_rate_id: string | null
          pay_run_id: string | null
          payable_amount: number | null
          payable_hours: number | null
          scheduled_end: string | null
          scheduled_hours: number | null
          scheduled_start: string | null
          shift_id: string | null
          site_id: string | null
          status: string
          time_zone: string | null
          updated_at: string
          work_date: string
        }
        Insert: {
          actual_end?: string | null
          actual_hours?: number | null
          actual_start?: string | null
          assignment_id?: string | null
          attendance_id?: string | null
          billable_amount?: number | null
          billable_hours?: number | null
          billing_run_id?: string | null
          break_minutes?: number | null
          charge_rate_id?: string | null
          client_id?: string | null
          company_id: string
          contract_id?: string | null
          correction_count?: number | null
          created_at?: string
          guard_id: string
          id?: string
          notes?: string | null
          pay_rate_id?: string | null
          pay_run_id?: string | null
          payable_amount?: number | null
          payable_hours?: number | null
          scheduled_end?: string | null
          scheduled_hours?: number | null
          scheduled_start?: string | null
          shift_id?: string | null
          site_id?: string | null
          status?: string
          time_zone?: string | null
          updated_at?: string
          work_date: string
        }
        Update: {
          actual_end?: string | null
          actual_hours?: number | null
          actual_start?: string | null
          assignment_id?: string | null
          attendance_id?: string | null
          billable_amount?: number | null
          billable_hours?: number | null
          billing_run_id?: string | null
          break_minutes?: number | null
          charge_rate_id?: string | null
          client_id?: string | null
          company_id?: string
          contract_id?: string | null
          correction_count?: number | null
          created_at?: string
          guard_id?: string
          id?: string
          notes?: string | null
          pay_rate_id?: string | null
          pay_run_id?: string | null
          payable_amount?: number | null
          payable_hours?: number | null
          scheduled_end?: string | null
          scheduled_hours?: number | null
          scheduled_start?: string | null
          shift_id?: string | null
          site_id?: string | null
          status?: string
          time_zone?: string | null
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_work_records_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "guard_site_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_work_records_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendance_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_work_records_charge_rate_id_fkey"
            columns: ["charge_rate_id"]
            isOneToOne: false
            referencedRelation: "client_charge_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_work_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_work_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_work_records_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "service_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_work_records_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_work_records_pay_rate_id_fkey"
            columns: ["pay_rate_id"]
            isOneToOne: false
            referencedRelation: "guard_pay_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_work_records_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_work_records_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "site_weekly_guard_cards"
            referencedColumns: ["shift_id"]
          },
          {
            foreignKeyName: "finance_work_records_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          company_id: string | null
          created_at: string
          form_type: string
          guard_id: string | null
          id: string
          site_id: string | null
          submission_data: Json
          submitted_by: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          form_type: string
          guard_id?: string | null
          id?: string
          site_id?: string | null
          submission_data?: Json
          submitted_by?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          form_type?: string
          guard_id?: string | null
          id?: string
          site_id?: string | null
          submission_data?: Json
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_availability: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          end_time: string | null
          guard_id: string | null
          id: string
          is_available: boolean | null
          start_time: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string | null
          guard_id?: string | null
          id?: string
          is_available?: boolean | null
          start_time?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string | null
          guard_id?: string | null
          id?: string
          is_available?: boolean | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_availability_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_certifications: {
        Row: {
          cert_name: string
          cert_type: string
          certificate_number: string | null
          company_id: string
          created_at: string | null
          document_url: string | null
          expiry_date: string | null
          guard_id: string
          id: string
          issue_date: string | null
          issuing_body: string | null
          reminder_sent_30d: boolean | null
          reminder_sent_90d: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cert_name: string
          cert_type: string
          certificate_number?: string | null
          company_id: string
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          guard_id: string
          id?: string
          issue_date?: string | null
          issuing_body?: string | null
          reminder_sent_30d?: boolean | null
          reminder_sent_90d?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cert_name?: string
          cert_type?: string
          certificate_number?: string | null
          company_id?: string
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          guard_id?: string
          id?: string
          issue_date?: string | null
          issuing_body?: string | null
          reminder_sent_30d?: boolean | null
          reminder_sent_90d?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_certifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_certifications_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_expenses: {
        Row: {
          amount: number
          business_reason: string
          category: string
          company_id: string
          created_at: string
          currency: string
          expense_date: string
          guard_id: string
          id: string
          mileage_quantity: number | null
          mileage_rate: number | null
          pay_run_id: string | null
          receipt_url: string | null
          review_note: string | null
          reviewed_by: string | null
          site_id: string | null
          status: string
          submitted_by: string
          updated_at: string
          work_record_id: string | null
        }
        Insert: {
          amount: number
          business_reason: string
          category: string
          company_id: string
          created_at?: string
          currency?: string
          expense_date: string
          guard_id: string
          id?: string
          mileage_quantity?: number | null
          mileage_rate?: number | null
          pay_run_id?: string | null
          receipt_url?: string | null
          review_note?: string | null
          reviewed_by?: string | null
          site_id?: string | null
          status?: string
          submitted_by: string
          updated_at?: string
          work_record_id?: string | null
        }
        Update: {
          amount?: number
          business_reason?: string
          category?: string
          company_id?: string
          created_at?: string
          currency?: string
          expense_date?: string
          guard_id?: string
          id?: string
          mileage_quantity?: number | null
          mileage_rate?: number | null
          pay_run_id?: string | null
          receipt_url?: string | null
          review_note?: string | null
          reviewed_by?: string | null
          site_id?: string | null
          status?: string
          submitted_by?: string
          updated_at?: string
          work_record_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_expenses_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_expenses_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_expenses_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_expenses_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_expenses_work_record_id_fkey"
            columns: ["work_record_id"]
            isOneToOne: false
            referencedRelation: "finance_work_records"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_pay_disputes: {
        Row: {
          assigned_to: string | null
          category: string
          company_id: string
          created_at: string
          description: string
          evidence_url: string | null
          guard_id: string
          id: string
          internal_notes: string | null
          pay_run_line_id: string | null
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          submitted_by: string
          updated_at: string
          work_record_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          company_id: string
          created_at?: string
          description: string
          evidence_url?: string | null
          guard_id: string
          id?: string
          internal_notes?: string | null
          pay_run_line_id?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          submitted_by: string
          updated_at?: string
          work_record_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          company_id?: string
          created_at?: string
          description?: string
          evidence_url?: string | null
          guard_id?: string
          id?: string
          internal_notes?: string | null
          pay_run_line_id?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          submitted_by?: string
          updated_at?: string
          work_record_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_pay_disputes_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_pay_disputes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_pay_disputes_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_pay_disputes_pay_run_line_id_fkey"
            columns: ["pay_run_line_id"]
            isOneToOne: false
            referencedRelation: "pay_run_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_pay_disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_pay_disputes_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_pay_disputes_work_record_id_fkey"
            columns: ["work_record_id"]
            isOneToOne: false
            referencedRelation: "finance_work_records"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_pay_rates: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          effective_from: string
          effective_until: string | null
          guard_id: string | null
          id: string
          minimum_charge: number | null
          name: string
          night_window_end: string | null
          night_window_start: string | null
          notes: string | null
          overtime_threshold_hours: number | null
          priority: number
          rate_type: string
          role_requirement: string | null
          rounding_rule: string | null
          site_id: string | null
          status: string
          supersedes_id: string | null
          unit: string
          updated_at: string
          version: number
          weekend_days: number[] | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from: string
          effective_until?: string | null
          guard_id?: string | null
          id?: string
          minimum_charge?: number | null
          name: string
          night_window_end?: string | null
          night_window_start?: string | null
          notes?: string | null
          overtime_threshold_hours?: number | null
          priority?: number
          rate_type: string
          role_requirement?: string | null
          rounding_rule?: string | null
          site_id?: string | null
          status?: string
          supersedes_id?: string | null
          unit?: string
          updated_at?: string
          version?: number
          weekend_days?: number[] | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_from?: string
          effective_until?: string | null
          guard_id?: string | null
          id?: string
          minimum_charge?: number | null
          name?: string
          night_window_end?: string | null
          night_window_start?: string | null
          notes?: string | null
          overtime_threshold_hours?: number | null
          priority?: number
          rate_type?: string
          role_requirement?: string | null
          rounding_rule?: string | null
          site_id?: string | null
          status?: string
          supersedes_id?: string | null
          unit?: string
          updated_at?: string
          version?: number
          weekend_days?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_pay_rates_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_pay_rates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_pay_rates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_pay_rates_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_pay_rates_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_pay_rates_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "guard_pay_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_performance_scores: {
        Row: {
          award_issued_at: string | null
          award_type: string | null
          badge_url: string | null
          commendations_count: number | null
          company_id: string
          created_at: string | null
          guard_id: string
          id: string
          incident_reports_score: number | null
          notes: string | null
          ob_entries_score: number | null
          overall_score: number | null
          patrol_completion_score: number | null
          period_end: string
          period_start: string
          punctuality_score: number | null
          rank_in_company: number | null
        }
        Insert: {
          award_issued_at?: string | null
          award_type?: string | null
          badge_url?: string | null
          commendations_count?: number | null
          company_id: string
          created_at?: string | null
          guard_id: string
          id?: string
          incident_reports_score?: number | null
          notes?: string | null
          ob_entries_score?: number | null
          overall_score?: number | null
          patrol_completion_score?: number | null
          period_end: string
          period_start: string
          punctuality_score?: number | null
          rank_in_company?: number | null
        }
        Update: {
          award_issued_at?: string | null
          award_type?: string | null
          badge_url?: string | null
          commendations_count?: number | null
          company_id?: string
          created_at?: string | null
          guard_id?: string
          id?: string
          incident_reports_score?: number | null
          notes?: string | null
          ob_entries_score?: number | null
          overall_score?: number | null
          patrol_completion_score?: number | null
          period_end?: string
          period_start?: string
          punctuality_score?: number | null
          rank_in_company?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_performance_scores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_performance_scores_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_site_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          block_reason: string | null
          company_id: string | null
          created_at: string | null
          guard_id: string | null
          id: string
          induction_date: string | null
          induction_status: string | null
          is_blocked: boolean | null
          last_worked_at: string | null
          notes: string | null
          site_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          block_reason?: string | null
          company_id?: string | null
          created_at?: string | null
          guard_id?: string | null
          id?: string
          induction_date?: string | null
          induction_status?: string | null
          is_blocked?: boolean | null
          last_worked_at?: string | null
          notes?: string | null
          site_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          block_reason?: string | null
          company_id?: string | null
          created_at?: string | null
          guard_id?: string | null
          id?: string
          induction_date?: string | null
          induction_status?: string | null
          is_blocked?: boolean | null
          last_worked_at?: string | null
          notes?: string | null
          site_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_site_assignments_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_site_assignments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_templates: {
        Row: {
          background_check_required: boolean | null
          benefits: string | null
          certifications: string | null
          company_id: string | null
          contract_type: string | null
          created_at: string | null
          default_shift: string | null
          department: string | null
          id: string
          medical_conditions: string | null
          minimum_experience: number | null
          photo_url: string | null
          position: string | null
          responsibilities: string | null
          salary: number | null
          sia_license_required: boolean | null
          skills_required: string | null
          status: string | null
          template_description: string | null
          template_name: string
          training_required: string | null
          uniform_required: boolean | null
          work_location: string | null
        }
        Insert: {
          background_check_required?: boolean | null
          benefits?: string | null
          certifications?: string | null
          company_id?: string | null
          contract_type?: string | null
          created_at?: string | null
          default_shift?: string | null
          department?: string | null
          id?: string
          medical_conditions?: string | null
          minimum_experience?: number | null
          photo_url?: string | null
          position?: string | null
          responsibilities?: string | null
          salary?: number | null
          sia_license_required?: boolean | null
          skills_required?: string | null
          status?: string | null
          template_description?: string | null
          template_name: string
          training_required?: string | null
          uniform_required?: boolean | null
          work_location?: string | null
        }
        Update: {
          background_check_required?: boolean | null
          benefits?: string | null
          certifications?: string | null
          company_id?: string | null
          contract_type?: string | null
          created_at?: string | null
          default_shift?: string | null
          department?: string | null
          id?: string
          medical_conditions?: string | null
          minimum_experience?: number | null
          photo_url?: string | null
          position?: string | null
          responsibilities?: string | null
          salary?: number | null
          sia_license_required?: boolean | null
          skills_required?: string | null
          status?: string | null
          template_description?: string | null
          template_name?: string
          training_required?: string | null
          uniform_required?: boolean | null
          work_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_time_off: {
        Row: {
          approved: boolean | null
          created_at: string | null
          end_date: string | null
          guard_id: string | null
          id: string
          reason: string | null
          start_date: string | null
          status: string
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          end_date?: string | null
          guard_id?: string | null
          id?: string
          reason?: string | null
          start_date?: string | null
          status?: string
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          end_date?: string | null
          guard_id?: string | null
          id?: string
          reason?: string | null
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "guard_time_off_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_vetting_records: {
        Row: {
          address_history_complete: boolean | null
          address_history_notes: string | null
          company_id: string
          created_at: string | null
          dbs_certificate_number: string | null
          dbs_check_type: string | null
          dbs_document_url: string | null
          dbs_issue_date: string | null
          dbs_verified_at: string | null
          employment_gaps_explained: boolean | null
          employment_history_complete: boolean | null
          employment_history_notes: string | null
          guard_id: string
          id: string
          id_document_type: string | null
          id_document_url: string | null
          id_verified: boolean | null
          id_verified_at: string | null
          id_verified_by: string | null
          notes: string | null
          reference_1_contact: string | null
          reference_1_name: string | null
          reference_1_verified: boolean | null
          reference_2_contact: string | null
          reference_2_name: string | null
          reference_2_verified: boolean | null
          rtw_document_type: string | null
          rtw_document_url: string | null
          rtw_expiry: string | null
          rtw_verified: boolean | null
          rtw_verified_at: string | null
          updated_at: string | null
          vetting_completed_at: string | null
          vetting_expires_at: string | null
          vetting_status: string | null
        }
        Insert: {
          address_history_complete?: boolean | null
          address_history_notes?: string | null
          company_id: string
          created_at?: string | null
          dbs_certificate_number?: string | null
          dbs_check_type?: string | null
          dbs_document_url?: string | null
          dbs_issue_date?: string | null
          dbs_verified_at?: string | null
          employment_gaps_explained?: boolean | null
          employment_history_complete?: boolean | null
          employment_history_notes?: string | null
          guard_id: string
          id?: string
          id_document_type?: string | null
          id_document_url?: string | null
          id_verified?: boolean | null
          id_verified_at?: string | null
          id_verified_by?: string | null
          notes?: string | null
          reference_1_contact?: string | null
          reference_1_name?: string | null
          reference_1_verified?: boolean | null
          reference_2_contact?: string | null
          reference_2_name?: string | null
          reference_2_verified?: boolean | null
          rtw_document_type?: string | null
          rtw_document_url?: string | null
          rtw_expiry?: string | null
          rtw_verified?: boolean | null
          rtw_verified_at?: string | null
          updated_at?: string | null
          vetting_completed_at?: string | null
          vetting_expires_at?: string | null
          vetting_status?: string | null
        }
        Update: {
          address_history_complete?: boolean | null
          address_history_notes?: string | null
          company_id?: string
          created_at?: string | null
          dbs_certificate_number?: string | null
          dbs_check_type?: string | null
          dbs_document_url?: string | null
          dbs_issue_date?: string | null
          dbs_verified_at?: string | null
          employment_gaps_explained?: boolean | null
          employment_history_complete?: boolean | null
          employment_history_notes?: string | null
          guard_id?: string
          id?: string
          id_document_type?: string | null
          id_document_url?: string | null
          id_verified?: boolean | null
          id_verified_at?: string | null
          id_verified_by?: string | null
          notes?: string | null
          reference_1_contact?: string | null
          reference_1_name?: string | null
          reference_1_verified?: boolean | null
          reference_2_contact?: string | null
          reference_2_name?: string | null
          reference_2_verified?: boolean | null
          rtw_document_type?: string | null
          rtw_document_url?: string | null
          rtw_expiry?: string | null
          rtw_verified?: boolean | null
          rtw_verified_at?: string | null
          updated_at?: string | null
          vetting_completed_at?: string | null
          vetting_expires_at?: string | null
          vetting_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_vetting_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_vetting_records_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_vetting_records_id_verified_by_fkey"
            columns: ["id_verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_wellbeing_checkins: {
        Row: {
          company_id: string
          concerns: string | null
          created_at: string | null
          fatigue_score: number | null
          flagged_for_review: boolean | null
          guard_id: string
          id: string
          manager_notes: string | null
          overall_score: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          safety_score: number | null
          shift_id: string | null
          site_id: string | null
          stress_score: number | null
        }
        Insert: {
          company_id: string
          concerns?: string | null
          created_at?: string | null
          fatigue_score?: number | null
          flagged_for_review?: boolean | null
          guard_id: string
          id?: string
          manager_notes?: string | null
          overall_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          safety_score?: number | null
          shift_id?: string | null
          site_id?: string | null
          stress_score?: number | null
        }
        Update: {
          company_id?: string
          concerns?: string | null
          created_at?: string | null
          fatigue_score?: number | null
          flagged_for_review?: boolean | null
          guard_id?: string
          id?: string
          manager_notes?: string | null
          overall_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          safety_score?: number | null
          shift_id?: string | null
          site_id?: string | null
          stress_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_wellbeing_checkins_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_wellbeing_checkins_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_wellbeing_checkins_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_wellbeing_checkins_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_wellbeing_checkins_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "site_weekly_guard_cards"
            referencedColumns: ["shift_id"]
          },
          {
            foreignKeyName: "guard_wellbeing_checkins_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      guards: {
        Row: {
          address: string | null
          availability: Json | null
          badge_number: string | null
          bank_account: string | null
          certifications: string | null
          company_id: string | null
          created_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          first_name: string | null
          hire_date: string | null
          hourly_rate: number | null
          id: string
          last_name: string | null
          medical_conditions: string | null
          ni_number: string | null
          phone: string | null
          photo_url: string | null
          position: string | null
          postcode: string | null
          reference_1_name: string | null
          reference_1_phone: string | null
          reference_2_name: string | null
          reference_2_phone: string | null
          salary: number | null
          sia_expiry: string | null
          sia_licence: string | null
          skills: string[] | null
          sort_code: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          availability?: Json | null
          badge_number?: string | null
          bank_account?: string | null
          certifications?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          first_name?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          last_name?: string | null
          medical_conditions?: string | null
          ni_number?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          postcode?: string | null
          reference_1_name?: string | null
          reference_1_phone?: string | null
          reference_2_name?: string | null
          reference_2_phone?: string | null
          salary?: number | null
          sia_expiry?: string | null
          sia_licence?: string | null
          skills?: string[] | null
          sort_code?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          availability?: Json | null
          badge_number?: string | null
          bank_account?: string | null
          certifications?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          first_name?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          last_name?: string | null
          medical_conditions?: string | null
          ni_number?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          postcode?: string | null
          reference_1_name?: string | null
          reference_1_phone?: string | null
          reference_2_name?: string | null
          reference_2_phone?: string | null
          salary?: number | null
          sia_expiry?: string | null
          sia_licence?: string | null
          skills?: string[] | null
          sort_code?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_article_feedback: {
        Row: {
          article_id: string
          comment: string | null
          created_at: string
          helpful: boolean
          id: string
          user_id: string | null
        }
        Insert: {
          article_id: string
          comment?: string | null
          created_at?: string
          helpful: boolean
          id?: string
          user_id?: string | null
        }
        Update: {
          article_id?: string
          comment?: string | null
          created_at?: string
          helpful?: boolean
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_article_feedback_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "help_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_article_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_article_versions: {
        Row: {
          article_id: string
          change_summary: string | null
          changed_by: string | null
          content: string
          created_at: string
          id: string
          summary: string | null
          title: string
          version: number
        }
        Insert: {
          article_id: string
          change_summary?: string | null
          changed_by?: string | null
          content: string
          created_at?: string
          id?: string
          summary?: string | null
          title: string
          version: number
        }
        Update: {
          article_id?: string
          change_summary?: string | null
          changed_by?: string | null
          content?: string
          created_at?: string
          id?: string
          summary?: string | null
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "help_article_versions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "help_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_article_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          audience: string
          author_id: string | null
          category_id: string | null
          category_slug: string | null
          content: string
          created_at: string
          effective_date: string | null
          helpful_count: number
          id: string
          is_featured: boolean
          not_helpful_count: number
          product_areas: string[] | null
          product_version: string | null
          published_at: string | null
          published_by: string | null
          review_date: string | null
          reviewer_id: string | null
          roles: string[] | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          summary: string | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          audience?: string
          author_id?: string | null
          category_id?: string | null
          category_slug?: string | null
          content: string
          created_at?: string
          effective_date?: string | null
          helpful_count?: number
          id?: string
          is_featured?: boolean
          not_helpful_count?: number
          product_areas?: string[] | null
          product_version?: string | null
          published_at?: string | null
          published_by?: string | null
          review_date?: string | null
          reviewer_id?: string | null
          roles?: string[] | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          audience?: string
          author_id?: string | null
          category_id?: string | null
          category_slug?: string | null
          content?: string
          created_at?: string
          effective_date?: string | null
          helpful_count?: number
          id?: string
          is_featured?: boolean
          not_helpful_count?: number
          product_areas?: string[] | null
          product_version?: string | null
          published_at?: string | null
          published_by?: string | null
          review_date?: string | null
          reviewer_id?: string | null
          roles?: string[] | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "help_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_articles_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_articles_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      help_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      identity_rtw_checks: {
        Row: {
          check_date: string
          check_type: string
          company_id: string
          created_at: string | null
          evidence_file_path: string | null
          expiry_date: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          official_reference: string | null
          outcome: string
          recheck_status: string | null
          restrictions: string | null
          review_method: string
          reviewer_id: string | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          check_date?: string
          check_type: string
          company_id: string
          created_at?: string | null
          evidence_file_path?: string | null
          expiry_date?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          official_reference?: string | null
          outcome: string
          recheck_status?: string | null
          restrictions?: string | null
          review_method: string
          reviewer_id?: string | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          check_date?: string
          check_type?: string
          company_id?: string
          created_at?: string | null
          evidence_file_path?: string | null
          expiry_date?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          official_reference?: string | null
          outcome?: string
          recheck_status?: string | null
          restrictions?: string | null
          review_method?: string
          reviewer_id?: string | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_rtw_checks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_rtw_checks_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_rtw_checks_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      implementation_projects: {
        Row: {
          assigned_contact: string | null
          company_id: string
          created_at: string
          go_live_target: string | null
          id: string
          name: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_contact?: string | null
          company_id: string
          created_at?: string
          go_live_target?: string | null
          id?: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_contact?: string | null
          company_id?: string
          created_at?: string
          go_live_target?: string | null
          id?: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "implementation_projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      implementation_tasks: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          owner_role: string | null
          project_id: string
          status: string
          title: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          owner_role?: string | null
          project_id: string
          status?: string
          title: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          owner_role?: string | null
          project_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "implementation_tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "implementation_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "implementation_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          incident_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          incident_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          incident_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_comments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_media: {
        Row: {
          client_visible: boolean | null
          created_at: string | null
          file_url: string
          filename: string | null
          id: string
          incident_id: string
          media_type: string
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          client_visible?: boolean | null
          created_at?: string | null
          file_url: string
          filename?: string | null
          id?: string
          incident_id: string
          media_type: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          client_visible?: boolean | null
          created_at?: string | null
          file_url?: string
          filename?: string | null
          id?: string
          incident_id?: string
          media_type?: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_media_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_timeline: {
        Row: {
          actor_user_id: string
          created_at: string | null
          event_type: string
          id: string
          incident_id: string
          metadata: Json | null
        }
        Insert: {
          actor_user_id: string
          created_at?: string | null
          event_type: string
          id?: string
          incident_id: string
          metadata?: Json | null
        }
        Update: {
          actor_user_id?: string
          created_at?: string | null
          event_type?: string
          id?: string
          incident_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_timeline_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          ai_rewritten_report: string | null
          attendance_log_id: string | null
          client_visible: boolean | null
          company_id: string | null
          created_at: string | null
          description: string | null
          follow_up_status: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          guard_id: string | null
          id: string
          incident_number: string | null
          incident_type: string | null
          linked_evidence_count: number | null
          location: string | null
          occurred_at: string | null
          pdf_report_id: string | null
          reported_at: string | null
          requires_follow_up: boolean | null
          resolved_at: string | null
          severity: string | null
          shift_id: string | null
          site_id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_rewritten_report?: string | null
          attendance_log_id?: string | null
          client_visible?: boolean | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          follow_up_status?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          guard_id?: string | null
          id?: string
          incident_number?: string | null
          incident_type?: string | null
          linked_evidence_count?: number | null
          location?: string | null
          occurred_at?: string | null
          pdf_report_id?: string | null
          reported_at?: string | null
          requires_follow_up?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          shift_id?: string | null
          site_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_rewritten_report?: string | null
          attendance_log_id?: string | null
          client_visible?: boolean | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          follow_up_status?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          guard_id?: string | null
          id?: string
          incident_number?: string | null
          incident_type?: string | null
          linked_evidence_count?: number | null
          location?: string | null
          occurred_at?: string | null
          pdf_report_id?: string | null
          reported_at?: string | null
          requires_follow_up?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          shift_id?: string | null
          site_id?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          company_id: string
          created_at: string | null
          id: string
          reason: string | null
          resource_id: string | null
          resource_type: string
          safe_new_values: Json | null
          safe_old_values: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          reason?: string | null
          resource_id?: string | null
          resource_type: string
          safe_new_values?: Json | null
          safe_old_values?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          reason?: string | null
          resource_id?: string | null
          resource_type?: string
          safe_new_values?: Json | null
          safe_old_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_audit_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_catalogue: {
        Row: {
          category: string
          configuration_schema: Json | null
          created_at: string | null
          description: string | null
          documentation_url: string | null
          id: string
          integration_key: string
          name: string
          required_plan: string | null
          status: string
          supported_capabilities: string[] | null
          updated_at: string | null
          version: string
        }
        Insert: {
          category: string
          configuration_schema?: Json | null
          created_at?: string | null
          description?: string | null
          documentation_url?: string | null
          id?: string
          integration_key: string
          name: string
          required_plan?: string | null
          status?: string
          supported_capabilities?: string[] | null
          updated_at?: string | null
          version?: string
        }
        Update: {
          category?: string
          configuration_schema?: Json | null
          created_at?: string | null
          description?: string | null
          documentation_url?: string | null
          id?: string
          integration_key?: string
          name?: string
          required_plan?: string | null
          status?: string
          supported_capabilities?: string[] | null
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      integration_connections: {
        Row: {
          company_integration_id: string
          config: Json | null
          connection_type: string
          created_at: string | null
          external_account_ref: string | null
          id: string
          refresh_status: string | null
          scopes: string[] | null
          token_expiry: string | null
          updated_at: string | null
        }
        Insert: {
          company_integration_id: string
          config?: Json | null
          connection_type: string
          created_at?: string | null
          external_account_ref?: string | null
          id?: string
          refresh_status?: string | null
          scopes?: string[] | null
          token_expiry?: string | null
          updated_at?: string | null
        }
        Update: {
          company_integration_id?: string
          config?: Json | null
          connection_type?: string
          created_at?: string | null
          external_account_ref?: string | null
          id?: string
          refresh_status?: string | null
          scopes?: string[] | null
          token_expiry?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_connections_company_integration_id_fkey"
            columns: ["company_integration_id"]
            isOneToOne: false
            referencedRelation: "company_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_errors: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          integration_key: string
          resolution_status: string
          resolved_at: string | null
          resource_ref: string | null
          retry_count: number | null
          retryable: boolean | null
          safe_message: string
          severity: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          integration_key: string
          resolution_status?: string
          resolved_at?: string | null
          resource_ref?: string | null
          retry_count?: number | null
          retryable?: boolean | null
          safe_message: string
          severity?: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          integration_key?: string
          resolution_status?: string
          resolved_at?: string | null
          resource_ref?: string | null
          retry_count?: number | null
          retryable?: boolean | null
          safe_message?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_errors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_mappings: {
        Row: {
          company_id: string
          created_at: string | null
          external_id: string
          external_resource_type: string | null
          id: string
          integration_key: string
          internal_id: string
          internal_resource_type: string
          mapping_version: string
          sync_state: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          external_id: string
          external_resource_type?: string | null
          id?: string
          integration_key: string
          internal_id: string
          internal_resource_type: string
          mapping_version?: string
          sync_state?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          external_id?: string
          external_resource_type?: string | null
          id?: string
          integration_key?: string
          internal_id?: string
          internal_resource_type?: string
          mapping_version?: string
          sync_state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_mappings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_sync_runs: {
        Row: {
          company_id: string
          completed_at: string | null
          correlation_id: string | null
          created_at: string | null
          direction: string
          id: string
          idempotency_key: string | null
          integration_key: string
          records_failed: number | null
          records_processed: number | null
          records_succeeded: number | null
          resource_type: string
          sanitized_error: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string | null
          direction: string
          id?: string
          idempotency_key?: string | null
          integration_key: string
          records_failed?: number | null
          records_processed?: number | null
          records_succeeded?: number | null
          resource_type: string
          sanitized_error?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string | null
          direction?: string
          id?: string
          idempotency_key?: string | null
          integration_key?: string
          records_failed?: number | null
          records_processed?: number | null
          records_succeeded?: number | null
          resource_type?: string
          sanitized_error?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_runs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_articles: {
        Row: {
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          helpful_count: number | null
          id: string
          not_helpful_count: number | null
          published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          updated_by: string | null
          view_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          helpful_count?: number | null
          id?: string
          not_helpful_count?: number | null
          published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          helpful_count?: number | null
          id?: string
          not_helpful_count?: number | null
          published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_articles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_articles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lawful_basis_records: {
        Row: {
          basis_type: string
          company_id: string | null
          decision_notes: string | null
          decision_owner_id: string | null
          id: string
          legitimate_interest_assessment: Json | null
          necessity_assessment: string | null
          processing_activity_id: string | null
          purpose: string | null
          recorded_at: string
        }
        Insert: {
          basis_type: string
          company_id?: string | null
          decision_notes?: string | null
          decision_owner_id?: string | null
          id?: string
          legitimate_interest_assessment?: Json | null
          necessity_assessment?: string | null
          processing_activity_id?: string | null
          purpose?: string | null
          recorded_at?: string
        }
        Update: {
          basis_type?: string
          company_id?: string | null
          decision_notes?: string | null
          decision_owner_id?: string | null
          id?: string
          legitimate_interest_assessment?: Json | null
          necessity_assessment?: string | null
          processing_activity_id?: string | null
          purpose?: string | null
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawful_basis_records_processing_activity_id_fkey"
            columns: ["processing_activity_id"]
            isOneToOne: false
            referencedRelation: "processing_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          blocked_reason: string | null
          company_id: string
          cover_guard_id: string | null
          cover_offer_expires_at: string | null
          created_at: string
          end_time: string
          guard_id: string
          id: string
          notes: string | null
          reason: string
          requested_by: string | null
          shift_id: string | null
          site_id: string | null
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          blocked_reason?: string | null
          company_id: string
          cover_guard_id?: string | null
          cover_offer_expires_at?: string | null
          created_at?: string
          end_time: string
          guard_id: string
          id?: string
          notes?: string | null
          reason?: string
          requested_by?: string | null
          shift_id?: string | null
          site_id?: string | null
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          blocked_reason?: string | null
          company_id?: string
          cover_guard_id?: string | null
          cover_offer_expires_at?: string | null
          created_at?: string
          end_time?: string
          guard_id?: string
          id?: string
          notes?: string | null
          reason?: string
          requested_by?: string | null
          shift_id?: string | null
          site_id?: string | null
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_cover_guard_id_fkey"
            columns: ["cover_guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "site_weekly_guard_cards"
            referencedColumns: ["shift_id"]
          },
          {
            foreignKeyName: "leave_requests_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_holds: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          company_id: string
          hold_reason: string
          id: string
          notes: string | null
          record_categories: string[]
          released_at: string | null
          released_by: string | null
          worker_id: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          company_id: string
          hold_reason: string
          id?: string
          notes?: string | null
          record_categories: string[]
          released_at?: string | null
          released_by?: string | null
          worker_id?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          company_id?: string
          hold_reason?: string
          id?: string
          notes?: string | null
          record_categories?: string[]
          released_at?: string | null
          released_by?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_holds_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_holds_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_holds_released_by_fkey"
            columns: ["released_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_holds_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_messages: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          message: string | null
          message_type: string | null
          read_at: string | null
          sender_id: string
          sender_type: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          message?: string | null
          message_type?: string | null
          read_at?: string | null
          sender_id: string
          sender_type: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          message?: string | null
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
          sender_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_sessions: {
        Row: {
          assigned_agent_id: string | null
          assigned_at: string | null
          channel: string | null
          client_id: string | null
          company_id: string
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          first_response_at: string | null
          id: string
          initial_message: string | null
          linked_ticket_id: string | null
          rated_at: string | null
          satisfaction_comment: string | null
          satisfaction_score: number | null
          started_at: string | null
          status: string | null
          topic: string | null
          user_id: string
          wait_time_seconds: number | null
        }
        Insert: {
          assigned_agent_id?: string | null
          assigned_at?: string | null
          channel?: string | null
          client_id?: string | null
          company_id: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          first_response_at?: string | null
          id?: string
          initial_message?: string | null
          linked_ticket_id?: string | null
          rated_at?: string | null
          satisfaction_comment?: string | null
          satisfaction_score?: number | null
          started_at?: string | null
          status?: string | null
          topic?: string | null
          user_id: string
          wait_time_seconds?: number | null
        }
        Update: {
          assigned_agent_id?: string | null
          assigned_at?: string | null
          channel?: string | null
          client_id?: string | null
          company_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          first_response_at?: string | null
          id?: string
          initial_message?: string | null
          linked_ticket_id?: string | null
          rated_at?: string | null
          satisfaction_comment?: string | null
          satisfaction_score?: number | null
          started_at?: string | null
          status?: string | null
          topic?: string | null
          user_id?: string
          wait_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_sessions_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_chat_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_chat_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_chat_sessions_linked_ticket_id_fkey"
            columns: ["linked_ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      location_tracking_configs: {
        Row: {
          background_tracking_enabled: boolean
          company_id: string
          contact_name: string | null
          created_at: string
          dpia_status: string
          emergency_rules: string | null
          id: string
          is_active: boolean
          lawful_basis: string | null
          precision_required: string | null
          purpose: string | null
          retention_days: number | null
          tracked_subjects: string | null
          tracking_start: string | null
          tracking_stop: string | null
          updated_at: string
          viewer_roles: string | null
          worker_notice_version: string | null
        }
        Insert: {
          background_tracking_enabled?: boolean
          company_id: string
          contact_name?: string | null
          created_at?: string
          dpia_status?: string
          emergency_rules?: string | null
          id?: string
          is_active?: boolean
          lawful_basis?: string | null
          precision_required?: string | null
          purpose?: string | null
          retention_days?: number | null
          tracked_subjects?: string | null
          tracking_start?: string | null
          tracking_stop?: string | null
          updated_at?: string
          viewer_roles?: string | null
          worker_notice_version?: string | null
        }
        Update: {
          background_tracking_enabled?: boolean
          company_id?: string
          contact_name?: string | null
          created_at?: string
          dpia_status?: string
          emergency_rules?: string | null
          id?: string
          is_active?: boolean
          lawful_basis?: string | null
          precision_required?: string | null
          purpose?: string | null
          retention_days?: number | null
          tracked_subjects?: string | null
          tracking_start?: string | null
          tracking_stop?: string | null
          updated_at?: string
          viewer_roles?: string | null
          worker_notice_version?: string | null
        }
        Relationships: []
      }
      lone_worker_checkins: {
        Row: {
          checked_in_at: string
          guard_id: string
          id: string
          lat: number | null
          lng: number | null
          method: string | null
          note: string | null
          session_id: string
        }
        Insert: {
          checked_in_at?: string
          guard_id: string
          id?: string
          lat?: number | null
          lng?: number | null
          method?: string | null
          note?: string | null
          session_id: string
        }
        Update: {
          checked_in_at?: string
          guard_id?: string
          id?: string
          lat?: number | null
          lng?: number | null
          method?: string | null
          note?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lone_worker_checkins_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lone_worker_checkins_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "lone_worker_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      lone_worker_sessions: {
        Row: {
          alarm_acknowledged_at: string | null
          alarm_acknowledged_by: string | null
          alarm_triggered_at: string | null
          check_in_interval_minutes: number
          company_id: string
          created_at: string | null
          escalation_level: number | null
          guard_id: string
          id: string
          last_check_in_at: string | null
          last_lat: number | null
          last_lng: number | null
          missed_check_ins: number | null
          next_check_in_due_at: string | null
          notes: string | null
          session_end: string | null
          session_start: string
          shift_id: string | null
          site_id: string | null
          status: string | null
          total_check_ins: number | null
        }
        Insert: {
          alarm_acknowledged_at?: string | null
          alarm_acknowledged_by?: string | null
          alarm_triggered_at?: string | null
          check_in_interval_minutes?: number
          company_id: string
          created_at?: string | null
          escalation_level?: number | null
          guard_id: string
          id?: string
          last_check_in_at?: string | null
          last_lat?: number | null
          last_lng?: number | null
          missed_check_ins?: number | null
          next_check_in_due_at?: string | null
          notes?: string | null
          session_end?: string | null
          session_start?: string
          shift_id?: string | null
          site_id?: string | null
          status?: string | null
          total_check_ins?: number | null
        }
        Update: {
          alarm_acknowledged_at?: string | null
          alarm_acknowledged_by?: string | null
          alarm_triggered_at?: string | null
          check_in_interval_minutes?: number
          company_id?: string
          created_at?: string | null
          escalation_level?: number | null
          guard_id?: string
          id?: string
          last_check_in_at?: string | null
          last_lat?: number | null
          last_lng?: number | null
          missed_check_ins?: number | null
          next_check_in_due_at?: string | null
          notes?: string | null
          session_end?: string | null
          session_start?: string
          shift_id?: string | null
          site_id?: string | null
          status?: string | null
          total_check_ins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lone_worker_sessions_alarm_acknowledged_by_fkey"
            columns: ["alarm_acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lone_worker_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lone_worker_sessions_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lone_worker_sessions_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lone_worker_sessions_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "site_weekly_guard_cards"
            referencedColumns: ["shift_id"]
          },
          {
            foreignKeyName: "lone_worker_sessions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          company_id: string
          created_at: string | null
          guard_id: string | null
          id: string
          message: string
          message_type: string | null
          read: boolean | null
          read_at: string | null
          receiver_id: string | null
          sender_id: string
          site_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          guard_id?: string | null
          id?: string
          message: string
          message_type?: string | null
          read?: boolean | null
          read_at?: string | null
          receiver_id?: string | null
          sender_id: string
          site_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          guard_id?: string | null
          id?: string
          message?: string
          message_type?: string | null
          read?: boolean | null
          read_at?: string | null
          receiver_id?: string | null
          sender_id?: string
          site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      notification_deliveries: {
        Row: {
          channel: string | null
          error: string | null
          id: string
          notification_id: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          channel?: string | null
          error?: string | null
          id?: string
          notification_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          channel?: string | null
          error?: string | null
          id?: string
          notification_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_jobs: {
        Row: {
          attempt_count: number | null
          company_id: string | null
          created_at: string | null
          deduplication_key: string | null
          error: string | null
          id: string
          last_attempt_at: string | null
          priority: string | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string | null
          template_key: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          attempt_count?: number | null
          company_id?: string | null
          created_at?: string | null
          deduplication_key?: string | null
          error?: string | null
          id?: string
          last_attempt_at?: string | null
          priority?: string | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string | null
          template_key: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          attempt_count?: number | null
          company_id?: string | null
          created_at?: string | null
          deduplication_key?: string | null
          error?: string | null
          id?: string
          last_attempt_at?: string | null
          priority?: string | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string | null
          template_key?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          email_address: string | null
          email_enabled: boolean | null
          in_app_enabled: boolean | null
          phone_number: string | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_enabled: boolean | null
          type_preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          email_address?: string | null
          email_enabled?: boolean | null
          in_app_enabled?: boolean | null
          phone_number?: string | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          type_preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          email_address?: string | null
          email_enabled?: boolean | null
          in_app_enabled?: boolean | null
          phone_number?: string | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          type_preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          company_id: string | null
          created_at: string | null
          id: string
          link: string | null
          read_at: string | null
          related_id: string | null
          related_type: string | null
          severity: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          severity?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          severity?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrence_books: {
        Row: {
          ai_summary: string | null
          attendance_log_id: string | null
          client_visible: boolean | null
          company_id: string | null
          created_at: string | null
          edited_at: string | null
          entry: string
          entry_type: string | null
          guard_id: string | null
          id: string
          occurred_at: string | null
          shift_id: string | null
          site_id: string | null
          title: string | null
          visibility: string | null
        }
        Insert: {
          ai_summary?: string | null
          attendance_log_id?: string | null
          client_visible?: boolean | null
          company_id?: string | null
          created_at?: string | null
          edited_at?: string | null
          entry: string
          entry_type?: string | null
          guard_id?: string | null
          id?: string
          occurred_at?: string | null
          shift_id?: string | null
          site_id?: string | null
          title?: string | null
          visibility?: string | null
        }
        Update: {
          ai_summary?: string | null
          attendance_log_id?: string | null
          client_visible?: boolean | null
          company_id?: string | null
          created_at?: string | null
          edited_at?: string | null
          entry?: string
          entry_type?: string | null
          guard_id?: string | null
          id?: string
          occurred_at?: string | null
          shift_id?: string | null
          site_id?: string | null
          title?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "occurrence_books_attendance_log_id_fkey"
            columns: ["attendance_log_id"]
            isOneToOne: false
            referencedRelation: "attendance_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_books_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_books_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_books_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrence_books_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "site_weekly_guard_cards"
            referencedColumns: ["shift_id"]
          },
          {
            foreignKeyName: "occurrence_books_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_checklists: {
        Row: {
          access_revoked_at: string | null
          approved_by: string | null
          checklist_version: number | null
          company_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          exit_interview_notes: string | null
          exit_reason: string | null
          final_pay_run_handoff: boolean | null
          id: string
          items: Json
          overall_status: string | null
          sessions_revoked: boolean | null
          started_at: string | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          access_revoked_at?: string | null
          approved_by?: string | null
          checklist_version?: number | null
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          exit_interview_notes?: string | null
          exit_reason?: string | null
          final_pay_run_handoff?: boolean | null
          id?: string
          items?: Json
          overall_status?: string | null
          sessions_revoked?: boolean | null
          started_at?: string | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          access_revoked_at?: string | null
          approved_by?: string | null
          checklist_version?: number | null
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          exit_interview_notes?: string | null
          exit_reason?: string | null
          final_pay_run_handoff?: boolean | null
          id?: string
          items?: Json
          overall_status?: string | null
          sessions_revoked?: boolean | null
          started_at?: string | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_checklists_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_checklists_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_checklists_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_blockers: {
        Row: {
          blocker_type: string
          company_id: string
          created_at: string
          description: string | null
          id: string
          resolved: boolean
          resolved_at: string | null
          severity: string
          step_id: string | null
          title: string
        }
        Insert: {
          blocker_type: string
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          step_id?: string | null
          title: string
        }
        Update: {
          blocker_type?: string
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          step_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_blockers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_blockers_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "onboarding_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_checklists: {
        Row: {
          checklist_version: number | null
          company_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          items: Json
          overall_status: string | null
          started_at: string | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          checklist_version?: number | null
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          items?: Json
          overall_status?: string | null
          started_at?: string | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          checklist_version?: number | null
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          items?: Json
          overall_status?: string | null
          started_at?: string | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checklists_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_programs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          target_roles: string[] | null
          version: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          target_roles?: string[] | null
          version?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          target_roles?: string[] | null
          version?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          company_id: string
          completed_at: string | null
          evidence: Json | null
          id: string
          program_id: string
          status: string
          step_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          evidence?: Json | null
          id?: string
          program_id: string
          status?: string
          step_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          evidence?: Json | null
          id?: string
          program_id?: string
          status?: string
          step_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_progress_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "onboarding_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "onboarding_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_steps: {
        Row: {
          created_at: string
          description: string | null
          feature_key: string
          help_article_slug: string | null
          id: string
          is_required: boolean
          program_id: string
          role_visibility: string[] | null
          step_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          feature_key: string
          help_article_slug?: string | null
          id?: string
          is_required?: boolean
          program_id: string
          role_visibility?: string[] | null
          step_order: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          feature_key?: string
          help_article_slug?: string | null
          id?: string
          is_required?: boolean
          program_id?: string
          role_visibility?: string[] | null
          step_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_steps_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "onboarding_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_error_events: {
        Row: {
          company_id: string | null
          context: Json | null
          correlation_id: string | null
          created_at: string
          environment: string | null
          event: string | null
          id: string
          ip: string | null
          message: string | null
          severity: string
          source: string | null
          stack: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          context?: Json | null
          correlation_id?: string | null
          created_at?: string
          environment?: string | null
          event?: string | null
          id?: string
          ip?: string | null
          message?: string | null
          severity?: string
          source?: string | null
          stack?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          context?: Json | null
          correlation_id?: string | null
          created_at?: string
          environment?: string | null
          event?: string | null
          id?: string
          ip?: string | null
          message?: string | null
          severity?: string
          source?: string | null
          stack?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ops_incidents: {
        Row: {
          correlation_id: string | null
          created_at: string
          description: string | null
          id: string
          owner_id: string | null
          post_incident_review: string | null
          provider: string | null
          resolved_at: string | null
          runbook_ref: string | null
          severity: string
          started_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string | null
          post_incident_review?: string | null
          provider?: string | null
          resolved_at?: string | null
          runbook_ref?: string | null
          severity?: string
          started_at?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string | null
          post_incident_review?: string | null
          provider?: string | null
          resolved_at?: string | null
          runbook_ref?: string | null
          severity?: string
          started_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      patrol_checkpoint_scans: {
        Row: {
          checkpoint_id: string | null
          company_id: string | null
          created_at: string | null
          id: string
          lat: number | null
          lng: number | null
          notes: string | null
          patrol_log_id: string | null
          scanned_at: string | null
        }
        Insert: {
          checkpoint_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          notes?: string | null
          patrol_log_id?: string | null
          scanned_at?: string | null
        }
        Update: {
          checkpoint_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          notes?: string | null
          patrol_log_id?: string | null
          scanned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrol_checkpoint_scans_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "patrol_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_checkpoint_scans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_checkpoint_scans_patrol_log_id_fkey"
            columns: ["patrol_log_id"]
            isOneToOne: false
            referencedRelation: "patrol_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      patrol_checkpoints: {
        Row: {
          allowed_radius_meters: number | null
          approved_at: string | null
          approved_by: string | null
          approved_gps_accuracy_meters: number | null
          approved_latitude: number | null
          approved_longitude: number | null
          checkpoint_code: string | null
          client_id: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          expected_radius_meters: number | null
          gps_capture_status: string | null
          id: string
          is_active: boolean | null
          lat: number | null
          lng: number | null
          location_label: string | null
          name: string
          order_index: number | null
          patrol_frequency: string | null
          patrol_time: string | null
          qr_code: string | null
          requires_comment: boolean | null
          requires_photo: boolean | null
          site_id: string | null
          sop_url: string | null
          updated_at: string | null
        }
        Insert: {
          allowed_radius_meters?: number | null
          approved_at?: string | null
          approved_by?: string | null
          approved_gps_accuracy_meters?: number | null
          approved_latitude?: number | null
          approved_longitude?: number | null
          checkpoint_code?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          expected_radius_meters?: number | null
          gps_capture_status?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          location_label?: string | null
          name: string
          order_index?: number | null
          patrol_frequency?: string | null
          patrol_time?: string | null
          qr_code?: string | null
          requires_comment?: boolean | null
          requires_photo?: boolean | null
          site_id?: string | null
          sop_url?: string | null
          updated_at?: string | null
        }
        Update: {
          allowed_radius_meters?: number | null
          approved_at?: string | null
          approved_by?: string | null
          approved_gps_accuracy_meters?: number | null
          approved_latitude?: number | null
          approved_longitude?: number | null
          checkpoint_code?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          expected_radius_meters?: number | null
          gps_capture_status?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          location_label?: string | null
          name?: string
          order_index?: number | null
          patrol_frequency?: string | null
          patrol_time?: string | null
          qr_code?: string | null
          requires_comment?: boolean | null
          requires_photo?: boolean | null
          site_id?: string | null
          sop_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrol_checkpoints_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_checkpoints_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      patrol_logs: {
        Row: {
          checkpoints_completed: number | null
          checkpoints_total: number | null
          comment_count: number | null
          company_id: string | null
          created_at: string | null
          duration_seconds: number | null
          end_time: string | null
          ended_at: string | null
          gps_verified_count: number | null
          guard_id: string | null
          id: string
          missed_checkpoints: number | null
          needs_review_count: number | null
          notes: string | null
          out_of_radius_count: number | null
          photo_count: number | null
          shift_id: string | null
          site_id: string | null
          start_time: string | null
          status: string | null
        }
        Insert: {
          checkpoints_completed?: number | null
          checkpoints_total?: number | null
          comment_count?: number | null
          company_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          ended_at?: string | null
          gps_verified_count?: number | null
          guard_id?: string | null
          id?: string
          missed_checkpoints?: number | null
          needs_review_count?: number | null
          notes?: string | null
          out_of_radius_count?: number | null
          photo_count?: number | null
          shift_id?: string | null
          site_id?: string | null
          start_time?: string | null
          status?: string | null
        }
        Update: {
          checkpoints_completed?: number | null
          checkpoints_total?: number | null
          comment_count?: number | null
          company_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          ended_at?: string | null
          gps_verified_count?: number | null
          guard_id?: string | null
          id?: string
          missed_checkpoints?: number | null
          needs_review_count?: number | null
          notes?: string | null
          out_of_radius_count?: number | null
          photo_count?: number | null
          shift_id?: string | null
          site_id?: string | null
          start_time?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrol_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_logs_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_logs_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_logs_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "site_weekly_guard_cards"
            referencedColumns: ["shift_id"]
          },
          {
            foreignKeyName: "patrol_logs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      patrol_scans: {
        Row: {
          approved_latitude: number | null
          approved_longitude: number | null
          attendance_log_id: string | null
          checkpoint_code: string | null
          checkpoint_id: string | null
          comment: string | null
          company_id: string | null
          created_at: string | null
          device_info: string | null
          device_user_agent: string | null
          distance_from_checkpoint: number | null
          gps_accuracy: number | null
          gps_latitude: number | null
          gps_longitude: number | null
          gps_status: string | null
          gps_verified: boolean | null
          guard_id: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          notes: string | null
          offline_sync_id: string | null
          patrol_log_id: string | null
          phone_gps_accuracy_meters: number | null
          phone_latitude: number | null
          phone_longitude: number | null
          photo_url: string | null
          rota_id: string | null
          scan_status: string | null
          scanned_at: string | null
          shift_id: string | null
          site_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          approved_latitude?: number | null
          approved_longitude?: number | null
          attendance_log_id?: string | null
          checkpoint_code?: string | null
          checkpoint_id?: string | null
          comment?: string | null
          company_id?: string | null
          created_at?: string | null
          device_info?: string | null
          device_user_agent?: string | null
          distance_from_checkpoint?: number | null
          gps_accuracy?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          gps_status?: string | null
          gps_verified?: boolean | null
          guard_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          notes?: string | null
          offline_sync_id?: string | null
          patrol_log_id?: string | null
          phone_gps_accuracy_meters?: number | null
          phone_latitude?: number | null
          phone_longitude?: number | null
          photo_url?: string | null
          rota_id?: string | null
          scan_status?: string | null
          scanned_at?: string | null
          shift_id?: string | null
          site_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          approved_latitude?: number | null
          approved_longitude?: number | null
          attendance_log_id?: string | null
          checkpoint_code?: string | null
          checkpoint_id?: string | null
          comment?: string | null
          company_id?: string | null
          created_at?: string | null
          device_info?: string | null
          device_user_agent?: string | null
          distance_from_checkpoint?: number | null
          gps_accuracy?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          gps_status?: string | null
          gps_verified?: boolean | null
          guard_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          notes?: string | null
          offline_sync_id?: string | null
          patrol_log_id?: string | null
          phone_gps_accuracy_meters?: number | null
          phone_latitude?: number | null
          phone_longitude?: number | null
          photo_url?: string | null
          rota_id?: string | null
          scan_status?: string | null
          scanned_at?: string | null
          shift_id?: string | null
          site_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrol_scans_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "patrol_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_scans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_scans_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_scans_rota_id_fkey"
            columns: ["rota_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_scans_rota_id_fkey"
            columns: ["rota_id"]
            isOneToOne: false
            referencedRelation: "site_weekly_guard_cards"
            referencedColumns: ["shift_id"]
          },
          {
            foreignKeyName: "patrol_scans_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pattern_applications: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          end_date: string
          guard_id: string | null
          id: string
          pattern_id: string
          pattern_name: string | null
          repeat_weeks: number
          site_id: string | null
          start_date: string
          status: string
          team_id: string | null
          total_shifts: number
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          end_date: string
          guard_id?: string | null
          id?: string
          pattern_id: string
          pattern_name?: string | null
          repeat_weeks?: number
          site_id?: string | null
          start_date: string
          status?: string
          team_id?: string | null
          total_shifts?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string
          guard_id?: string | null
          id?: string
          pattern_id?: string
          pattern_name?: string | null
          repeat_weeks?: number
          site_id?: string | null
          start_date?: string
          status?: string
          team_id?: string | null
          total_shifts?: number
        }
        Relationships: [
          {
            foreignKeyName: "pattern_applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pattern_applications_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pattern_applications_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      pay_run_lines: {
        Row: {
          adjustment_amount: number | null
          adjustment_reason: string | null
          calculation_trace: Json | null
          company_id: string
          created_at: string
          expense_id: string | null
          gross_amount: number
          guard_id: string
          id: string
          pay_run_id: string
          quantity: number
          rate_card_id: string | null
          rate_category: string
          rate_version: number | null
          unit_rate: number
          work_record_id: string | null
        }
        Insert: {
          adjustment_amount?: number | null
          adjustment_reason?: string | null
          calculation_trace?: Json | null
          company_id: string
          created_at?: string
          expense_id?: string | null
          gross_amount: number
          guard_id: string
          id?: string
          pay_run_id: string
          quantity: number
          rate_card_id?: string | null
          rate_category: string
          rate_version?: number | null
          unit_rate: number
          work_record_id?: string | null
        }
        Update: {
          adjustment_amount?: number | null
          adjustment_reason?: string | null
          calculation_trace?: Json | null
          company_id?: string
          created_at?: string
          expense_id?: string | null
          gross_amount?: number
          guard_id?: string
          id?: string
          pay_run_id?: string
          quantity?: number
          rate_card_id?: string | null
          rate_category?: string
          rate_version?: number | null
          unit_rate?: number
          work_record_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pay_run_lines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_run_lines_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "guard_expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_run_lines_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_run_lines_pay_run_id_fkey"
            columns: ["pay_run_id"]
            isOneToOne: false
            referencedRelation: "pay_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_run_lines_rate_card_id_fkey"
            columns: ["rate_card_id"]
            isOneToOne: false
            referencedRelation: "guard_pay_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_run_lines_work_record_id_fkey"
            columns: ["work_record_id"]
            isOneToOne: false
            referencedRelation: "finance_work_records"
            referencedColumns: ["id"]
          },
        ]
      }
      pay_runs: {
        Row: {
          adjustments_total: number | null
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          expenses_total: number | null
          export_checksum: string | null
          export_version: number | null
          exported_at: string | null
          exported_by: string | null
          gross_pay_total: number | null
          guard_count: number | null
          id: string
          marked_paid_at: string | null
          marked_paid_by: string | null
          net_total: number | null
          notes: string | null
          payment_date: string | null
          period_end: string
          period_start: string
          prepared_at: string | null
          prepared_by: string | null
          reference: string
          status: string
          updated_at: string
        }
        Insert: {
          adjustments_total?: number | null
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          expenses_total?: number | null
          export_checksum?: string | null
          export_version?: number | null
          exported_at?: string | null
          exported_by?: string | null
          gross_pay_total?: number | null
          guard_count?: number | null
          id?: string
          marked_paid_at?: string | null
          marked_paid_by?: string | null
          net_total?: number | null
          notes?: string | null
          payment_date?: string | null
          period_end: string
          period_start: string
          prepared_at?: string | null
          prepared_by?: string | null
          reference: string
          status?: string
          updated_at?: string
        }
        Update: {
          adjustments_total?: number | null
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          expenses_total?: number | null
          export_checksum?: string | null
          export_version?: number | null
          exported_at?: string | null
          exported_by?: string | null
          gross_pay_total?: number | null
          guard_count?: number | null
          id?: string
          marked_paid_at?: string | null
          marked_paid_by?: string | null
          net_total?: number | null
          notes?: string | null
          payment_date?: string | null
          period_end?: string
          period_start?: string
          prepared_at?: string | null
          prepared_by?: string | null
          reference?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pay_runs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_runs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_runs_exported_by_fkey"
            columns: ["exported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_runs_marked_paid_by_fkey"
            columns: ["marked_paid_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pay_runs_prepared_by_fkey"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_allocations: {
        Row: {
          allocated_by: string | null
          amount: number
          company_id: string
          created_at: string
          id: string
          invoice_id: string
          payment_id: string
        }
        Insert: {
          allocated_by?: string | null
          amount: number
          company_id: string
          created_at?: string
          id?: string
          invoice_id: string
          payment_id: string
        }
        Update: {
          allocated_by?: string | null
          amount?: number
          company_id?: string
          created_at?: string
          id?: string
          invoice_id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_allocated_by_fkey"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "client_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "client_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          key: string
          label: string
          module: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          key: string
          label: string
          module: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          key?: string
          label?: string
          module?: string
        }
        Relationships: []
      }
      plan_features: {
        Row: {
          created_at: string | null
          feature_key: string
          feature_name: string
          id: string
          included: boolean | null
          plan_id: string
        }
        Insert: {
          created_at?: string | null
          feature_key: string
          feature_name: string
          id?: string
          included?: boolean | null
          plan_id: string
        }
        Update: {
          created_at?: string | null
          feature_key?: string
          feature_name?: string
          id?: string
          included?: boolean | null
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          code: string | null
          created_at: string | null
          description: string | null
          has_ai_reports: boolean | null
          has_ai_rota: boolean | null
          has_api_access: boolean | null
          has_client_portal: boolean | null
          has_compliance: boolean | null
          has_dedicated_manager: boolean | null
          has_gps_tracking: boolean | null
          has_leave_automation: boolean | null
          has_patrol_management: boolean | null
          has_priority_support: boolean | null
          has_white_label: boolean | null
          id: string
          is_active: boolean | null
          is_contact_only: boolean | null
          max_ai_usage: number | null
          max_guards: number | null
          max_sites: number | null
          monthly_price: number | null
          name: string
          slug: string
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          stripe_product_id: string | null
          updated_at: string | null
          yearly_price: number | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          has_ai_reports?: boolean | null
          has_ai_rota?: boolean | null
          has_api_access?: boolean | null
          has_client_portal?: boolean | null
          has_compliance?: boolean | null
          has_dedicated_manager?: boolean | null
          has_gps_tracking?: boolean | null
          has_leave_automation?: boolean | null
          has_patrol_management?: boolean | null
          has_priority_support?: boolean | null
          has_white_label?: boolean | null
          id?: string
          is_active?: boolean | null
          is_contact_only?: boolean | null
          max_ai_usage?: number | null
          max_guards?: number | null
          max_sites?: number | null
          monthly_price?: number | null
          name: string
          slug: string
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
          yearly_price?: number | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          has_ai_reports?: boolean | null
          has_ai_rota?: boolean | null
          has_api_access?: boolean | null
          has_client_portal?: boolean | null
          has_compliance?: boolean | null
          has_dedicated_manager?: boolean | null
          has_gps_tracking?: boolean | null
          has_leave_automation?: boolean | null
          has_patrol_management?: boolean | null
          has_priority_support?: boolean | null
          has_white_label?: boolean | null
          id?: string
          is_active?: boolean | null
          is_contact_only?: boolean | null
          max_ai_usage?: number | null
          max_guards?: number | null
          max_sites?: number | null
          monthly_price?: number | null
          name?: string
          slug?: string
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
          yearly_price?: number | null
        }
        Relationships: []
      }
      platform_announcements: {
        Row: {
          body: string
          change_type: string
          created_at: string | null
          created_by: string | null
          display_type: string | null
          ends_at: string | null
          id: string
          is_dismissible: boolean | null
          is_maintenance: boolean | null
          is_published: boolean | null
          link_text: string | null
          link_url: string | null
          published_at: string | null
          published_by: string | null
          requires_acknowledgment: boolean | null
          severity: string | null
          starts_at: string | null
          target_audience: string[]
          target_tenants: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body: string
          change_type?: string
          created_at?: string | null
          created_by?: string | null
          display_type?: string | null
          ends_at?: string | null
          id?: string
          is_dismissible?: boolean | null
          is_maintenance?: boolean | null
          is_published?: boolean | null
          link_text?: string | null
          link_url?: string | null
          published_at?: string | null
          published_by?: string | null
          requires_acknowledgment?: boolean | null
          severity?: string | null
          starts_at?: string | null
          target_audience?: string[]
          target_tenants?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          change_type?: string
          created_at?: string | null
          created_by?: string | null
          display_type?: string | null
          ends_at?: string | null
          id?: string
          is_dismissible?: boolean | null
          is_maintenance?: boolean | null
          is_published?: boolean | null
          link_text?: string | null
          link_url?: string | null
          published_at?: string | null
          published_by?: string | null
          requires_acknowledgment?: boolean | null
          severity?: string | null
          starts_at?: string | null
          target_audience?: string[]
          target_tenants?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_announcements_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          correlation_id: string | null
          created_at: string | null
          effective_actor_id: string | null
          id: string
          ip_address: string | null
          new_state: Json | null
          previous_state: Json | null
          reason: string | null
          resource_id: string | null
          resource_type: string
          target_tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          correlation_id?: string | null
          created_at?: string | null
          effective_actor_id?: string | null
          id?: string
          ip_address?: string | null
          new_state?: Json | null
          previous_state?: Json | null
          reason?: string | null
          resource_id?: string | null
          resource_type: string
          target_tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          correlation_id?: string | null
          created_at?: string | null
          effective_actor_id?: string | null
          id?: string
          ip_address?: string | null
          new_state?: Json | null
          previous_state?: Json | null
          reason?: string | null
          resource_id?: string | null
          resource_type?: string
          target_tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_audit_log_effective_actor_id_fkey"
            columns: ["effective_actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_audit_log_target_tenant_id_fkey"
            columns: ["target_tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_role_assignments: {
        Row: {
          created_at: string | null
          expires_at: string | null
          grant_reason: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          mfa_verified_at: string | null
          platform_role_id: string
          starts_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          grant_reason?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          mfa_verified_at?: string | null
          platform_role_id: string
          starts_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          grant_reason?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          mfa_verified_at?: string | null
          platform_role_id?: string
          starts_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_role_assignments_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_role_assignments_platform_role_id_fkey"
            columns: ["platform_role_id"]
            isOneToOne: false
            referencedRelation: "platform_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_role_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_role_permissions: {
        Row: {
          created_at: string | null
          id: string
          level: string
          permission_key: string
          platform_role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: string
          permission_key: string
          platform_role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          permission_key?: string
          platform_role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_role_permissions_platform_role_id_fkey"
            columns: ["platform_role_id"]
            isOneToOne: false
            referencedRelation: "platform_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_security_events: {
        Row: {
          actor_id: string | null
          created_at: string | null
          description: string | null
          event_type: string
          false_positive: boolean | null
          id: string
          investigation_notes: string | null
          is_confirmed_incident: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          safe_metadata: Json | null
          severity: string | null
          target_tenant_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          description?: string | null
          event_type: string
          false_positive?: boolean | null
          id?: string
          investigation_notes?: string | null
          is_confirmed_incident?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          safe_metadata?: Json | null
          severity?: string | null
          target_tenant_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          description?: string | null
          event_type?: string
          false_positive?: boolean | null
          id?: string
          investigation_notes?: string | null
          is_confirmed_incident?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          safe_metadata?: Json | null
          severity?: string | null
          target_tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_security_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_security_events_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_security_events_target_tenant_id_fkey"
            columns: ["target_tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acceptances: {
        Row: {
          accepted_at: string
          accepted_by: string | null
          company_id: string
          id: string
          policy_id: string
          version_accepted: string | null
        }
        Insert: {
          accepted_at?: string
          accepted_by?: string | null
          company_id: string
          id?: string
          policy_id: string
          version_accepted?: string | null
        }
        Update: {
          accepted_at?: string
          accepted_by?: string | null
          company_id?: string
          id?: string
          policy_id?: string
          version_accepted?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_acceptances_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policy_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acknowledgments: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          company_id: string
          created_at: string | null
          id: string
          knowledge_check_passed: boolean | null
          knowledge_check_score: number | null
          policy_id: string
          policy_version: number
          viewed_at: string | null
          worker_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          knowledge_check_passed?: boolean | null
          knowledge_check_score?: number | null
          policy_id: string
          policy_version: number
          viewed_at?: string | null
          worker_id: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          knowledge_check_passed?: boolean | null
          knowledge_check_score?: number | null
          policy_id?: string
          policy_version?: number
          viewed_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_acknowledgments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "workforce_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgments_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_documents: {
        Row: {
          body: string | null
          category: string
          change_summary: string | null
          created_at: string
          effective_date: string | null
          id: string
          is_published: boolean
          owner_id: string | null
          review_due_date: string | null
          reviewed_date: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          body?: string | null
          category?: string
          change_summary?: string | null
          created_at?: string
          effective_date?: string | null
          id?: string
          is_published?: boolean
          owner_id?: string | null
          review_due_date?: string | null
          reviewed_date?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          body?: string | null
          category?: string
          change_summary?: string | null
          created_at?: string
          effective_date?: string | null
          id?: string
          is_published?: boolean
          owner_id?: string | null
          review_due_date?: string | null
          reviewed_date?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      processing_activities: {
        Row: {
          article9_condition: string | null
          company_id: string | null
          controller_role: string
          created_at: string
          criminal_offence_condition: string | null
          data_location: string | null
          data_subjects: string | null
          id: string
          joint_controller_note: string | null
          lawful_basis: string | null
          name: string
          owner_id: string | null
          personal_data_categories: string | null
          processor_role: string | null
          purpose: string | null
          recipients: string | null
          retention_period: string | null
          review_date: string | null
          security_controls: string | null
          sensitive_data_category: string | null
          slug: string | null
          status: string
          transfers: string | null
          updated_at: string
        }
        Insert: {
          article9_condition?: string | null
          company_id?: string | null
          controller_role?: string
          created_at?: string
          criminal_offence_condition?: string | null
          data_location?: string | null
          data_subjects?: string | null
          id?: string
          joint_controller_note?: string | null
          lawful_basis?: string | null
          name: string
          owner_id?: string | null
          personal_data_categories?: string | null
          processor_role?: string | null
          purpose?: string | null
          recipients?: string | null
          retention_period?: string | null
          review_date?: string | null
          security_controls?: string | null
          sensitive_data_category?: string | null
          slug?: string | null
          status?: string
          transfers?: string | null
          updated_at?: string
        }
        Update: {
          article9_condition?: string | null
          company_id?: string | null
          controller_role?: string
          created_at?: string
          criminal_offence_condition?: string | null
          data_location?: string | null
          data_subjects?: string | null
          id?: string
          joint_controller_note?: string | null
          lawful_basis?: string | null
          name?: string
          owner_id?: string | null
          personal_data_categories?: string | null
          processor_role?: string | null
          purpose?: string | null
          recipients?: string | null
          retention_period?: string | null
          review_date?: string | null
          security_controls?: string | null
          sensitive_data_category?: string | null
          slug?: string | null
          status?: string
          transfers?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          accepted_at: string | null
          client_address: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          company_id: string
          contract_duration_months: number | null
          contract_start_date: string | null
          contract_value: number | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          guard_grade: string | null
          guards_required: number | null
          hourly_rate_charge: number | null
          hourly_rate_cost: number | null
          hours_per_week: number
          id: string
          line_items: Json | null
          margin_pct: number | null
          notes: string | null
          pdf_url: string | null
          quote_number: string
          sent_at: string | null
          shift_pattern: string | null
          site_address: string | null
          site_name: string
          site_risk_level: string | null
          status: string | null
          terms_and_conditions: string | null
          updated_at: string | null
          weekly_charge: number | null
          weekly_cost: number | null
          weekly_margin: number | null
        }
        Insert: {
          accepted_at?: string | null
          client_address?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_id: string
          contract_duration_months?: number | null
          contract_start_date?: string | null
          contract_value?: number | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          guard_grade?: string | null
          guards_required?: number | null
          hourly_rate_charge?: number | null
          hourly_rate_cost?: number | null
          hours_per_week: number
          id?: string
          line_items?: Json | null
          margin_pct?: number | null
          notes?: string | null
          pdf_url?: string | null
          quote_number: string
          sent_at?: string | null
          shift_pattern?: string | null
          site_address?: string | null
          site_name: string
          site_risk_level?: string | null
          status?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          weekly_charge?: number | null
          weekly_cost?: number | null
          weekly_margin?: number | null
        }
        Update: {
          accepted_at?: string | null
          client_address?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_id?: string
          contract_duration_months?: number | null
          contract_start_date?: string | null
          contract_value?: number | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          guard_grade?: string | null
          guards_required?: number | null
          hourly_rate_charge?: number | null
          hourly_rate_cost?: number | null
          hours_per_week?: number
          id?: string
          line_items?: Json | null
          margin_pct?: number | null
          notes?: string | null
          pdf_url?: string | null
          quote_number?: string
          sent_at?: string | null
          shift_pattern?: string | null
          site_address?: string | null
          site_name?: string
          site_risk_level?: string | null
          status?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          weekly_charge?: number | null
          weekly_cost?: number | null
          weekly_margin?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      record_publications: {
        Row: {
          approved_snapshot: Json | null
          company_id: string
          created_at: string | null
          id: string
          published_at: string | null
          published_by: string | null
          record_id: string
          record_type: string
          updated_at: string | null
          visibility: string | null
          withdraw_reason: string | null
          withdrawn_at: string | null
          withdrawn_by: string | null
        }
        Insert: {
          approved_snapshot?: Json | null
          company_id: string
          created_at?: string | null
          id?: string
          published_at?: string | null
          published_by?: string | null
          record_id: string
          record_type: string
          updated_at?: string | null
          visibility?: string | null
          withdraw_reason?: string | null
          withdrawn_at?: string | null
          withdrawn_by?: string | null
        }
        Update: {
          approved_snapshot?: Json | null
          company_id?: string
          created_at?: string | null
          id?: string
          published_at?: string | null
          published_by?: string | null
          record_id?: string
          record_type?: string
          updated_at?: string | null
          visibility?: string | null
          withdraw_reason?: string | null
          withdrawn_at?: string | null
          withdrawn_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "record_publications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_publications_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_publications_withdrawn_by_fkey"
            columns: ["withdrawn_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      release_agent_readiness: {
        Row: {
          agent_key: string | null
          created_at: string
          credentials_configured: boolean
          enabled_environment: string
          human_approval_required: boolean
          id: string
          input_source: string | null
          last_failed: string | null
          last_success: string | null
          name: string
          output_action: string | null
          owner_id: string | null
          purpose: string | null
          readiness_status: string
          required_in_production: boolean
          retry_status: string
          schedule: string | null
          trigger_type: string | null
          updated_at: string
        }
        Insert: {
          agent_key?: string | null
          created_at?: string
          credentials_configured?: boolean
          enabled_environment?: string
          human_approval_required?: boolean
          id?: string
          input_source?: string | null
          last_failed?: string | null
          last_success?: string | null
          name: string
          output_action?: string | null
          owner_id?: string | null
          purpose?: string | null
          readiness_status?: string
          required_in_production?: boolean
          retry_status?: string
          schedule?: string | null
          trigger_type?: string | null
          updated_at?: string
        }
        Update: {
          agent_key?: string | null
          created_at?: string
          credentials_configured?: boolean
          enabled_environment?: string
          human_approval_required?: boolean
          id?: string
          input_source?: string | null
          last_failed?: string | null
          last_success?: string | null
          name?: string
          output_action?: string | null
          owner_id?: string | null
          purpose?: string | null
          readiness_status?: string
          required_in_production?: boolean
          retry_status?: string
          schedule?: string | null
          trigger_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      release_approvals: {
        Row: {
          approver_id: string | null
          area: string
          conditions: string | null
          created_at: string
          decided_at: string | null
          decision: string
          evidence_reviewed: string | null
          id: string
          version_id: string | null
        }
        Insert: {
          approver_id?: string | null
          area: string
          conditions?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string
          evidence_reviewed?: string | null
          id?: string
          version_id?: string | null
        }
        Update: {
          approver_id?: string | null
          area?: string
          conditions?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string
          evidence_reviewed?: string | null
          id?: string
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_approvals_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "release_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      release_audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          new_state: Json | null
          previous_state: Json | null
          resource_id: string | null
          resource_type: string | null
          version_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          version_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_audit_events_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "release_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      release_checklist_items: {
        Row: {
          checklist_id: string | null
          created_at: string
          evidence: string | null
          id: string
          is_blocker: boolean
          key: string | null
          notes: string | null
          owner_id: string | null
          status: string
          title: string
          updated_at: string
          verification_date: string | null
        }
        Insert: {
          checklist_id?: string | null
          created_at?: string
          evidence?: string | null
          id?: string
          is_blocker?: boolean
          key?: string | null
          notes?: string | null
          owner_id?: string | null
          status?: string
          title: string
          updated_at?: string
          verification_date?: string | null
        }
        Update: {
          checklist_id?: string | null
          created_at?: string
          evidence?: string | null
          id?: string
          is_blocker?: boolean
          key?: string | null
          notes?: string | null
          owner_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          verification_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "release_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      release_checklists: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      release_decisions: {
        Row: {
          conditions: string | null
          created_at: string
          decided_by: string | null
          decision: string
          id: string
          readiness_percentage: number | null
          reasons: Json | null
          version_id: string | null
        }
        Insert: {
          conditions?: string | null
          created_at?: string
          decided_by?: string | null
          decision: string
          id?: string
          readiness_percentage?: number | null
          reasons?: Json | null
          version_id?: string | null
        }
        Update: {
          conditions?: string | null
          created_at?: string
          decided_by?: string | null
          decision?: string
          id?: string
          readiness_percentage?: number | null
          reasons?: Json | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_decisions_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "release_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      release_defects: {
        Row: {
          accepted_risk_approver_id: string | null
          accepted_risk_reason: string | null
          actual_result: string | null
          affected_role: string | null
          affected_tenant: string | null
          created_at: string
          description: string | null
          environment: string
          evidence: string | null
          expected_result: string | null
          fix_version: string | null
          id: string
          is_tenant_data_leak: boolean
          linked_test_case_id: string | null
          owner_id: string | null
          reference: string | null
          resolved_at: string | null
          retest_result: string | null
          severity: string
          status: string
          steps_to_reproduce: string | null
          title: string
        }
        Insert: {
          accepted_risk_approver_id?: string | null
          accepted_risk_reason?: string | null
          actual_result?: string | null
          affected_role?: string | null
          affected_tenant?: string | null
          created_at?: string
          description?: string | null
          environment?: string
          evidence?: string | null
          expected_result?: string | null
          fix_version?: string | null
          id?: string
          is_tenant_data_leak?: boolean
          linked_test_case_id?: string | null
          owner_id?: string | null
          reference?: string | null
          resolved_at?: string | null
          retest_result?: string | null
          severity?: string
          status?: string
          steps_to_reproduce?: string | null
          title: string
        }
        Update: {
          accepted_risk_approver_id?: string | null
          accepted_risk_reason?: string | null
          actual_result?: string | null
          affected_role?: string | null
          affected_tenant?: string | null
          created_at?: string
          description?: string | null
          environment?: string
          evidence?: string | null
          expected_result?: string | null
          fix_version?: string | null
          id?: string
          is_tenant_data_leak?: boolean
          linked_test_case_id?: string | null
          owner_id?: string | null
          reference?: string | null
          resolved_at?: string | null
          retest_result?: string | null
          severity?: string
          status?: string
          steps_to_reproduce?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "release_defects_linked_test_case_id_fkey"
            columns: ["linked_test_case_id"]
            isOneToOne: false
            referencedRelation: "release_test_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      release_deployments: {
        Row: {
          backup_confirmed: boolean
          commit_sha: string | null
          completed_at: string | null
          created_at: string
          deployed_by: string | null
          environment: string
          id: string
          maintenance_window: boolean
          migration_reviewed: boolean
          monitoring_confirmed: boolean
          notes: string | null
          rollback_decision: string | null
          smoke_test_result: string | null
          started_at: string | null
          status: string
          version_id: string | null
        }
        Insert: {
          backup_confirmed?: boolean
          commit_sha?: string | null
          completed_at?: string | null
          created_at?: string
          deployed_by?: string | null
          environment?: string
          id?: string
          maintenance_window?: boolean
          migration_reviewed?: boolean
          monitoring_confirmed?: boolean
          notes?: string | null
          rollback_decision?: string | null
          smoke_test_result?: string | null
          started_at?: string | null
          status?: string
          version_id?: string | null
        }
        Update: {
          backup_confirmed?: boolean
          commit_sha?: string | null
          completed_at?: string | null
          created_at?: string
          deployed_by?: string | null
          environment?: string
          id?: string
          maintenance_window?: boolean
          migration_reviewed?: boolean
          monitoring_confirmed?: boolean
          notes?: string | null
          rollback_decision?: string | null
          smoke_test_result?: string | null
          started_at?: string | null
          status?: string
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_deployments_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "release_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      release_evidence: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          reference: string
          title: string
          type: string | null
          uploaded_by: string | null
          version_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          reference: string
          title: string
          type?: string | null
          uploaded_by?: string | null
          version_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          reference?: string
          title?: string
          type?: string | null
          uploaded_by?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_evidence_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "release_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      release_launch_metrics: {
        Row: {
          current_value: number | null
          escalation_threshold: string | null
          id: string
          metric_key: string
          metric_name: string
          notes: string | null
          owner_id: string | null
          status: string
          updated_at: string
          version_id: string | null
          watch_window: string
        }
        Insert: {
          current_value?: number | null
          escalation_threshold?: string | null
          id?: string
          metric_key: string
          metric_name: string
          notes?: string | null
          owner_id?: string | null
          status?: string
          updated_at?: string
          version_id?: string | null
          watch_window: string
        }
        Update: {
          current_value?: number | null
          escalation_threshold?: string | null
          id?: string
          metric_key?: string
          metric_name?: string
          notes?: string | null
          owner_id?: string | null
          status?: string
          updated_at?: string
          version_id?: string | null
          watch_window?: string
        }
        Relationships: [
          {
            foreignKeyName: "release_launch_metrics_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "release_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      release_rollbacks: {
        Row: {
          authoriser_id: string | null
          created_at: string
          db_recovery_approach: string | null
          deployment_id: string | null
          external_changes: string | null
          id: string
          incident_ref: string | null
          rollback_version: string | null
          trigger: string | null
          user_communication: string | null
          validation_results: string | null
          version_id: string | null
        }
        Insert: {
          authoriser_id?: string | null
          created_at?: string
          db_recovery_approach?: string | null
          deployment_id?: string | null
          external_changes?: string | null
          id?: string
          incident_ref?: string | null
          rollback_version?: string | null
          trigger?: string | null
          user_communication?: string | null
          validation_results?: string | null
          version_id?: string | null
        }
        Update: {
          authoriser_id?: string | null
          created_at?: string
          db_recovery_approach?: string | null
          deployment_id?: string | null
          external_changes?: string | null
          id?: string
          incident_ref?: string | null
          rollback_version?: string | null
          trigger?: string | null
          user_communication?: string | null
          validation_results?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_rollbacks_deployment_id_fkey"
            columns: ["deployment_id"]
            isOneToOne: false
            referencedRelation: "release_deployments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_rollbacks_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "release_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      release_test_cases: {
        Row: {
          component: string | null
          created_at: string
          display_order: number
          expected_result: string | null
          id: string
          name: string
          role: string | null
          steps: string | null
          suite_id: string | null
        }
        Insert: {
          component?: string | null
          created_at?: string
          display_order?: number
          expected_result?: string | null
          id?: string
          name: string
          role?: string | null
          steps?: string | null
          suite_id?: string | null
        }
        Update: {
          component?: string | null
          created_at?: string
          display_order?: number
          expected_result?: string | null
          id?: string
          name?: string
          role?: string | null
          steps?: string | null
          suite_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_test_cases_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "release_test_suites"
            referencedColumns: ["id"]
          },
        ]
      }
      release_test_results: {
        Row: {
          browser_device: string | null
          case_id: string | null
          correlation_id: string | null
          created_at: string
          environment: string
          id: string
          is_automated: boolean
          notes: string | null
          related_defect_id: string | null
          result: string
          run_id: string | null
          screenshot_ref: string | null
          tester_id: string | null
          updated_at: string
          version_id: string | null
        }
        Insert: {
          browser_device?: string | null
          case_id?: string | null
          correlation_id?: string | null
          created_at?: string
          environment?: string
          id?: string
          is_automated?: boolean
          notes?: string | null
          related_defect_id?: string | null
          result?: string
          run_id?: string | null
          screenshot_ref?: string | null
          tester_id?: string | null
          updated_at?: string
          version_id?: string | null
        }
        Update: {
          browser_device?: string | null
          case_id?: string | null
          correlation_id?: string | null
          created_at?: string
          environment?: string
          id?: string
          is_automated?: boolean
          notes?: string | null
          related_defect_id?: string | null
          result?: string
          run_id?: string | null
          screenshot_ref?: string | null
          tester_id?: string | null
          updated_at?: string
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_test_results_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "release_test_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_test_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "release_test_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_test_results_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "release_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      release_test_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          environment: string
          id: string
          name: string
          started_at: string | null
          status: string
          tester_id: string | null
          version_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          environment?: string
          id?: string
          name: string
          started_at?: string | null
          status?: string
          tester_id?: string | null
          version_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          environment?: string
          id?: string
          name?: string
          started_at?: string | null
          status?: string
          tester_id?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_test_runs_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "release_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      release_test_suites: {
        Row: {
          category: string
          component: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
          role: string | null
          slug: string | null
        }
        Insert: {
          category: string
          component?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name: string
          role?: string | null
          slug?: string | null
        }
        Update: {
          category?: string
          component?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          role?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      release_versions: {
        Row: {
          created_at: string
          environment: string
          id: string
          is_current: boolean
          owner_id: string | null
          release_notes: string | null
          status: string
          target_release_date: string | null
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          environment?: string
          id?: string
          is_current?: boolean
          owner_id?: string | null
          release_notes?: string | null
          status?: string
          target_release_date?: string | null
          updated_at?: string
          version: string
        }
        Update: {
          created_at?: string
          environment?: string
          id?: string
          is_current?: boolean
          owner_id?: string | null
          release_notes?: string | null
          status?: string
          target_release_date?: string | null
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      report_email_log: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string | null
          error_message: string | null
          file_url: string | null
          id: string
          period_end: string | null
          period_start: string | null
          recipient_count: number | null
          recipient_email: string | null
          report_schedule_id: string | null
          report_type: string
          sent_at: string | null
          sent_by: string | null
          site_id: string | null
          status: string
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          error_message?: string | null
          file_url?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          recipient_count?: number | null
          recipient_email?: string | null
          report_schedule_id?: string | null
          report_type?: string
          sent_at?: string | null
          sent_by?: string | null
          site_id?: string | null
          status?: string
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          error_message?: string | null
          file_url?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          recipient_count?: number | null
          recipient_email?: string | null
          report_schedule_id?: string | null
          report_type?: string
          sent_at?: string | null
          sent_by?: string | null
          site_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_email_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_email_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_email_log_report_schedule_id_fkey"
            columns: ["report_schedule_id"]
            isOneToOne: false
            referencedRelation: "weekly_report_schedule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_email_log_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          ai_summary: string | null
          client_id: string | null
          client_visible: boolean | null
          company_id: string | null
          file_url: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          period_end: string | null
          period_start: string | null
          reference_id: string | null
          report_type: string | null
          sent_at: string | null
          sent_by: string | null
          site_id: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          ai_summary?: string | null
          client_id?: string | null
          client_visible?: boolean | null
          company_id?: string | null
          file_url?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          reference_id?: string | null
          report_type?: string | null
          sent_at?: string | null
          sent_by?: string | null
          site_id?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          ai_summary?: string | null
          client_id?: string | null
          client_visible?: boolean | null
          company_id?: string | null
          file_url?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          reference_id?: string | null
          report_type?: string | null
          sent_at?: string | null
          sent_by?: string | null
          site_id?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_config: {
        Row: {
          id: string
          is_enabled: boolean
          legal_review_required: boolean
          notes: string | null
          record_category: string
          retention_days: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          is_enabled?: boolean
          legal_review_required?: boolean
          notes?: string | null
          record_category: string
          retention_days?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          is_enabled?: boolean
          legal_review_required?: boolean
          notes?: string | null
          record_category?: string
          retention_days?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      retention_rules: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          lawful_basis_note: string | null
          purpose: string | null
          record_category: string
          retention_months: number
          review_owner_id: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lawful_basis_note?: string | null
          purpose?: string | null
          record_category: string
          retention_months: number
          review_owner_id?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lawful_basis_note?: string | null
          purpose?: string | null
          record_category?: string
          retention_months?: number
          review_owner_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retention_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retention_rules_review_owner_id_fkey"
            columns: ["review_owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          level: string
          permission_key: string
          role_id: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          level?: string
          permission_key: string
          role_id: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          level?: string
          permission_key?: string
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_system: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      rota_conflicts: {
        Row: {
          company_id: string
          conflict_date: string | null
          conflict_type: string
          created_at: string
          description: string
          guard_id: string | null
          id: string
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          shift_id: string | null
          site_id: string | null
        }
        Insert: {
          company_id: string
          conflict_date?: string | null
          conflict_type: string
          created_at?: string
          description: string
          guard_id?: string | null
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          shift_id?: string | null
          site_id?: string | null
        }
        Update: {
          company_id?: string
          conflict_date?: string | null
          conflict_type?: string
          created_at?: string
          description?: string
          guard_id?: string | null
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          shift_id?: string | null
          site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rota_conflicts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_conflicts_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_conflicts_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rota_conflicts_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "site_weekly_guard_cards"
            referencedColumns: ["shift_id"]
          },
          {
            foreignKeyName: "rota_conflicts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      rota_published_weeks: {
        Row: {
          company_id: string
          id: string
          published_at: string | null
          published_by: string | null
          unpublished_at: string | null
          unpublished_by: string | null
          week_start: string
        }
        Insert: {
          company_id: string
          id?: string
          published_at?: string | null
          published_by?: string | null
          unpublished_at?: string | null
          unpublished_by?: string | null
          week_start: string
        }
        Update: {
          company_id?: string
          id?: string
          published_at?: string | null
          published_by?: string | null
          unpublished_at?: string | null
          unpublished_by?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "rota_published_weeks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_items: {
        Row: {
          approval_status: string | null
          assigned_reviewer_id: string | null
          company_id: string
          completed_at: string | null
          created_at: string | null
          discrepancy_notes: string | null
          evidence_file_path: string | null
          expiry_date: string | null
          id: string
          notes: string | null
          provider_name: string | null
          recheck_date: string | null
          requested_at: string | null
          requirement_id: string
          resolution: string | null
          resolution_approved_by: string | null
          status: string | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          approval_status?: string | null
          assigned_reviewer_id?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          discrepancy_notes?: string | null
          evidence_file_path?: string | null
          expiry_date?: string | null
          id?: string
          notes?: string | null
          provider_name?: string | null
          recheck_date?: string | null
          requested_at?: string | null
          requirement_id: string
          resolution?: string | null
          resolution_approved_by?: string | null
          status?: string | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          approval_status?: string | null
          assigned_reviewer_id?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          discrepancy_notes?: string | null
          evidence_file_path?: string | null
          expiry_date?: string | null
          id?: string
          notes?: string | null
          provider_name?: string | null
          recheck_date?: string | null
          requested_at?: string | null
          requirement_id?: string
          resolution?: string | null
          resolution_approved_by?: string | null
          status?: string | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_items_assigned_reviewer_id_fkey"
            columns: ["assigned_reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_items_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "screening_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_items_resolution_approved_by_fkey"
            columns: ["resolution_approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_items_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_requirements: {
        Row: {
          applies_to_engagement_types: string[] | null
          applies_to_roles: string[] | null
          check_category: string
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_mandatory: boolean | null
          name: string
          recheck_months: number | null
          requires_provider: boolean | null
          status: string | null
          updated_at: string | null
          validity_months: number | null
          version: number | null
        }
        Insert: {
          applies_to_engagement_types?: string[] | null
          applies_to_roles?: string[] | null
          check_category: string
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          name: string
          recheck_months?: number | null
          requires_provider?: boolean | null
          status?: string | null
          updated_at?: string | null
          validity_months?: number | null
          version?: number | null
        }
        Update: {
          applies_to_engagement_types?: string[] | null
          applies_to_roles?: string[] | null
          check_category?: string
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          name?: string
          recheck_months?: number | null
          requires_provider?: boolean | null
          status?: string | null
          updated_at?: string | null
          validity_months?: number | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "screening_requirements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sensitive_case_events: {
        Row: {
          case_id: string
          company_id: string
          description: string | null
          event_type: string
          evidence_file_path: string | null
          id: string
          is_internal_only: boolean | null
          recorded_at: string | null
          recorded_by: string | null
        }
        Insert: {
          case_id: string
          company_id: string
          description?: string | null
          event_type: string
          evidence_file_path?: string | null
          id?: string
          is_internal_only?: boolean | null
          recorded_at?: string | null
          recorded_by?: string | null
        }
        Update: {
          case_id?: string
          company_id?: string
          description?: string | null
          event_type?: string
          evidence_file_path?: string | null
          id?: string
          is_internal_only?: boolean | null
          recorded_at?: string | null
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensitive_case_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "sensitive_hr_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_case_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_case_events_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sensitive_case_members: {
        Row: {
          access_role: string | null
          case_id: string
          company_id: string
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          access_role?: string | null
          case_id: string
          company_id: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          access_role?: string | null
          case_id?: string
          company_id?: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensitive_case_members_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "sensitive_hr_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_case_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_case_members_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_case_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sensitive_hr_cases: {
        Row: {
          appeal_of_case_id: string | null
          assigned_to: string | null
          case_type: string
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_appeal: boolean | null
          opened_at: string | null
          opened_by: string | null
          priority: string | null
          resolution_summary: string | null
          resolved_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          appeal_of_case_id?: string | null
          assigned_to?: string | null
          case_type: string
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_appeal?: boolean | null
          opened_at?: string | null
          opened_by?: string | null
          priority?: string | null
          resolution_summary?: string | null
          resolved_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          appeal_of_case_id?: string | null
          assigned_to?: string | null
          case_type?: string
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_appeal?: boolean | null
          opened_at?: string | null
          opened_by?: string | null
          priority?: string | null
          resolution_summary?: string | null
          resolved_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensitive_hr_cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_hr_cases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_hr_cases_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_hr_cases_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_contract_versions: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          contract_id: string
          created_at: string | null
          id: string
          snapshot: Json | null
          version: number
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          contract_id: string
          created_at?: string | null
          id?: string
          snapshot?: Json | null
          version: number
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          contract_id?: string
          created_at?: string | null
          id?: string
          snapshot?: Json | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_contract_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_contract_versions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "service_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      service_contracts: {
        Row: {
          agreed_guarding_hours: Json | null
          approval_contact_ids: string[] | null
          approved_at: string | null
          approved_by: string | null
          client_id: string
          company_id: string
          contract_name: string
          created_at: string | null
          created_by: string | null
          document_paths: string[] | null
          end_date: string | null
          id: string
          linked_sites: string[] | null
          notice_period_days: number | null
          reference: string
          renewal_type: string | null
          reporting_frequency: string | null
          service_description: string | null
          sla_targets: Json | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          agreed_guarding_hours?: Json | null
          approval_contact_ids?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          client_id: string
          company_id: string
          contract_name: string
          created_at?: string | null
          created_by?: string | null
          document_paths?: string[] | null
          end_date?: string | null
          id?: string
          linked_sites?: string[] | null
          notice_period_days?: number | null
          reference: string
          renewal_type?: string | null
          reporting_frequency?: string | null
          service_description?: string | null
          sla_targets?: Json | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          agreed_guarding_hours?: Json | null
          approval_contact_ids?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string
          company_id?: string
          contract_name?: string
          created_at?: string | null
          created_by?: string | null
          document_paths?: string[] | null
          end_date?: string | null
          id?: string
          linked_sites?: string[] | null
          notice_period_days?: number | null
          reference?: string
          renewal_type?: string | null
          reporting_frequency?: string | null
          service_description?: string | null
          sla_targets?: Json | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_contracts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          assigned_to: string | null
          attachment_paths: string[] | null
          client_id: string
          closed_at: string | null
          company_id: string
          created_at: string | null
          description: string
          id: string
          internal_notes: string | null
          priority: string | null
          request_type: string
          requested_dates: Json | null
          requester_id: string
          resolution: string | null
          site_id: string | null
          sla_due_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachment_paths?: string[] | null
          client_id: string
          closed_at?: string | null
          company_id: string
          created_at?: string | null
          description: string
          id?: string
          internal_notes?: string | null
          priority?: string | null
          request_type: string
          requested_dates?: Json | null
          requester_id: string
          resolution?: string | null
          site_id?: string | null
          sla_due_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachment_paths?: string[] | null
          client_id?: string
          closed_at?: string | null
          company_id?: string
          created_at?: string | null
          description?: string
          id?: string
          internal_notes?: string | null
          priority?: string | null
          request_type?: string
          requested_dates?: Json | null
          requester_id?: string
          resolution?: string | null
          site_id?: string | null
          sla_due_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_cover_offers: {
        Row: {
          company_id: string
          created_at: string
          id: string
          leave_request_id: string
          offered_to_guard_id: string
          offered_to_user_id: string | null
          responded_at: string | null
          response_deadline: string
          response_note: string | null
          shift_id: string
          site_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          leave_request_id: string
          offered_to_guard_id: string
          offered_to_user_id?: string | null
          responded_at?: string | null
          response_deadline: string
          response_note?: string | null
          shift_id: string
          site_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          leave_request_id?: string
          offered_to_guard_id?: string
          offered_to_user_id?: string | null
          responded_at?: string | null
          response_deadline?: string
          response_note?: string | null
          shift_id?: string
          site_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_cover_offers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_cover_offers_leave_request_id_fkey"
            columns: ["leave_request_id"]
            isOneToOne: false
            referencedRelation: "leave_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_cover_offers_offered_to_guard_id_fkey"
            columns: ["offered_to_guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_cover_offers_offered_to_user_id_fkey"
            columns: ["offered_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_cover_offers_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_cover_offers_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "site_weekly_guard_cards"
            referencedColumns: ["shift_id"]
          },
          {
            foreignKeyName: "shift_cover_offers_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_pattern_templates: {
        Row: {
          company_id: string | null
          created_at: string | null
          cycle_length: number | null
          description: string | null
          id: string
          name: string
          pattern_type: string
          slots: Json
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          cycle_length?: number | null
          description?: string | null
          id?: string
          name: string
          pattern_type?: string
          slots?: Json
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          cycle_length?: number | null
          description?: string | null
          id?: string
          name?: string
          pattern_type?: string
          slots?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      shift_types: {
        Row: {
          break_duration_minutes: number
          code: string
          color: string
          company_id: string
          created_at: string
          end_time: string | null
          id: string
          is_active: boolean
          is_paid: boolean
          name: string
          notes: string | null
          sort_order: number
          start_time: string | null
          updated_at: string
        }
        Insert: {
          break_duration_minutes?: number
          code: string
          color?: string
          company_id: string
          created_at?: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          is_paid?: boolean
          name: string
          notes?: string | null
          sort_order?: number
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          break_duration_minutes?: number
          code?: string
          color?: string
          company_id?: string
          created_at?: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          is_paid?: boolean
          name?: string
          notes?: string | null
          sort_order?: number
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          end_time: string
          guard_id: string | null
          id: string
          notes: string | null
          shift_type: string | null
          site_id: string | null
          start_time: string
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          end_time: string
          guard_id?: string | null
          id?: string
          notes?: string | null
          shift_type?: string | null
          site_id?: string | null
          start_time: string
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          end_time?: string
          guard_id?: string | null
          id?: string
          notes?: string | null
          shift_type?: string | null
          site_id?: string | null
          start_time?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sia_licences: {
        Row: {
          alerts_enabled: boolean | null
          assignment_eligibility: string
          check_reference: string | null
          check_source: string | null
          checked_by: string | null
          company_id: string
          created_at: string | null
          evidence_file_path: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          last_checked_date: string | null
          licence_activity: string | null
          licence_number: string
          licence_type: string
          next_check_date: string | null
          notes: string | null
          review_notes: string | null
          status: string | null
          updated_at: string | null
          verification_method: string | null
          watchlist_status: string | null
          worker_id: string
        }
        Insert: {
          alerts_enabled?: boolean | null
          assignment_eligibility?: string
          check_reference?: string | null
          check_source?: string | null
          checked_by?: string | null
          company_id: string
          created_at?: string | null
          evidence_file_path?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          last_checked_date?: string | null
          licence_activity?: string | null
          licence_number: string
          licence_type: string
          next_check_date?: string | null
          notes?: string | null
          review_notes?: string | null
          status?: string | null
          updated_at?: string | null
          verification_method?: string | null
          watchlist_status?: string | null
          worker_id: string
        }
        Update: {
          alerts_enabled?: boolean | null
          assignment_eligibility?: string
          check_reference?: string | null
          check_source?: string | null
          checked_by?: string | null
          company_id?: string
          created_at?: string | null
          evidence_file_path?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          last_checked_date?: string | null
          licence_activity?: string | null
          licence_number?: string
          licence_type?: string
          next_check_date?: string | null
          notes?: string | null
          review_notes?: string | null
          status?: string | null
          updated_at?: string | null
          verification_method?: string | null
          watchlist_status?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sia_licences_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sia_licences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sia_licences_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_ai_summaries: {
        Row: {
          client_id: string
          created_at: string | null
          emergency_notes: string | null
          generated_by: string | null
          guard_briefing_summary: string | null
          id: string
          important_procedures: string | null
          key_contacts: string | null
          risks: string | null
          site_id: string
          site_overview: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          emergency_notes?: string | null
          generated_by?: string | null
          guard_briefing_summary?: string | null
          id?: string
          important_procedures?: string | null
          key_contacts?: string | null
          risks?: string | null
          site_id: string
          site_overview?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          emergency_notes?: string | null
          generated_by?: string | null
          guard_briefing_summary?: string | null
          id?: string
          important_procedures?: string | null
          key_contacts?: string | null
          risks?: string | null
          site_id?: string
          site_overview?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_ai_summaries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_ai_summaries_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_contacts: {
        Row: {
          client_id: string | null
          company_id: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          contact_type: string
          created_at: string | null
          created_by: string | null
          id: string
          is_primary: boolean | null
          notes: string | null
          site_id: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          contact_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          site_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          contact_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          site_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_contacts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_dashboard_configs: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          enabled_modules: Json | null
          id: string
          setup_status: string | null
          site_id: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          enabled_modules?: Json | null
          id?: string
          setup_status?: string | null
          site_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          enabled_modules?: Json | null
          id?: string
          setup_status?: string | null
          site_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_notice_reads: {
        Row: {
          id: string
          notice_id: string
          read_at: string
          site_id: string
          user_id: string
        }
        Insert: {
          id?: string
          notice_id: string
          read_at?: string
          site_id: string
          user_id: string
        }
        Update: {
          id?: string
          notice_id?: string
          read_at?: string
          site_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_notice_reads_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "active_site_notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_notice_reads_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "site_notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_notice_reads_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_notice_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_notices: {
        Row: {
          body: string
          category: string
          client_id: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          expiry_date: string | null
          id: string
          pinned: boolean
          priority: string
          site_id: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
          updated_by_name: string | null
        }
        Insert: {
          body: string
          category?: string
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          expiry_date?: string | null
          id?: string
          pinned?: boolean
          priority?: string
          site_id: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
          updated_by_name?: string | null
        }
        Update: {
          body?: string
          category?: string
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          expiry_date?: string | null
          id?: string
          pinned?: boolean
          priority?: string
          site_id?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          updated_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_notices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_notices_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_notices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_risk_scores: {
        Row: {
          acknowledged_recommendations: string[] | null
          ai_narrative: string | null
          company_id: string | null
          factors: Json | null
          generated_at: string | null
          id: string
          level: string | null
          period_end: string | null
          period_start: string | null
          recommendations: string[] | null
          score: number | null
          site_id: string | null
        }
        Insert: {
          acknowledged_recommendations?: string[] | null
          ai_narrative?: string | null
          company_id?: string | null
          factors?: Json | null
          generated_at?: string | null
          id?: string
          level?: string | null
          period_end?: string | null
          period_start?: string | null
          recommendations?: string[] | null
          score?: number | null
          site_id?: string | null
        }
        Update: {
          acknowledged_recommendations?: string[] | null
          ai_narrative?: string | null
          company_id?: string | null
          factors?: Json | null
          generated_at?: string | null
          id?: string
          level?: string | null
          period_end?: string | null
          period_start?: string | null
          recommendations?: string[] | null
          score?: number | null
          site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_risk_scores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_risk_scores_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_shift_patterns: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string | null
          day_of_week: number
          end_time: string
          guards_required: number
          id: string
          shift_type: string
          site_id: string
          start_time: string
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          day_of_week: number
          end_time?: string
          guards_required?: number
          id?: string
          shift_type?: string
          site_id: string
          start_time?: string
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          guards_required?: number
          id?: string
          shift_type?: string
          site_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_shift_patterns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_shift_patterns_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_status_tokens: {
        Row: {
          active: boolean | null
          client_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          label: string | null
          last_scanned_at: string | null
          scan_count: number | null
          site_id: string
          token: string
        }
        Insert: {
          active?: boolean | null
          client_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          label?: string | null
          last_scanned_at?: string | null
          scan_count?: number | null
          site_id: string
          token?: string
        }
        Update: {
          active?: boolean | null
          client_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          label?: string | null
          last_scanned_at?: string | null
          scan_count?: number | null
          site_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_status_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_status_tokens_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_status_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_status_tokens_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          access_instructions: string | null
          address: string | null
          alarm_response: string | null
          assignment_instructions: string | null
          banned_guard_ids: string[] | null
          check_call_interval: number | null
          client_contact_email: string | null
          client_contact_name: string | null
          client_id: string | null
          client_logo_url: string | null
          client_name: string | null
          company_id: string | null
          compliance_settings: Json | null
          created_at: string | null
          created_by: string | null
          emergency_contact: string | null
          emergency_procedures: string | null
          id: string
          keyholding_notes: string | null
          latitude: number | null
          longitude: number | null
          operating_hours: Json | null
          patrol_enabled: boolean | null
          patrol_interval: number | null
          patrol_settings: Json | null
          postcode: string | null
          preferred_guard_ids: string[] | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          region: string | null
          required_skills: string[] | null
          risk_level: string | null
          security_requirements: Json | null
          setup_completed: boolean | null
          setup_completed_at: string | null
          site_contact_email: string | null
          site_contact_name: string | null
          site_contact_phone: string | null
          site_name: string
          site_rules: string | null
          site_type: string | null
          status: string | null
          updated_by: string | null
        }
        Insert: {
          access_instructions?: string | null
          address?: string | null
          alarm_response?: string | null
          assignment_instructions?: string | null
          banned_guard_ids?: string[] | null
          check_call_interval?: number | null
          client_contact_email?: string | null
          client_contact_name?: string | null
          client_id?: string | null
          client_logo_url?: string | null
          client_name?: string | null
          company_id?: string | null
          compliance_settings?: Json | null
          created_at?: string | null
          created_by?: string | null
          emergency_contact?: string | null
          emergency_procedures?: string | null
          id?: string
          keyholding_notes?: string | null
          latitude?: number | null
          longitude?: number | null
          operating_hours?: Json | null
          patrol_enabled?: boolean | null
          patrol_interval?: number | null
          patrol_settings?: Json | null
          postcode?: string | null
          preferred_guard_ids?: string[] | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          region?: string | null
          required_skills?: string[] | null
          risk_level?: string | null
          security_requirements?: Json | null
          setup_completed?: boolean | null
          setup_completed_at?: string | null
          site_contact_email?: string | null
          site_contact_name?: string | null
          site_contact_phone?: string | null
          site_name: string
          site_rules?: string | null
          site_type?: string | null
          status?: string | null
          updated_by?: string | null
        }
        Update: {
          access_instructions?: string | null
          address?: string | null
          alarm_response?: string | null
          assignment_instructions?: string | null
          banned_guard_ids?: string[] | null
          check_call_interval?: number | null
          client_contact_email?: string | null
          client_contact_name?: string | null
          client_id?: string | null
          client_logo_url?: string | null
          client_name?: string | null
          company_id?: string | null
          compliance_settings?: Json | null
          created_at?: string | null
          created_by?: string | null
          emergency_contact?: string | null
          emergency_procedures?: string | null
          id?: string
          keyholding_notes?: string | null
          latitude?: number | null
          longitude?: number | null
          operating_hours?: Json | null
          patrol_enabled?: boolean | null
          patrol_interval?: number | null
          patrol_settings?: Json | null
          postcode?: string | null
          preferred_guard_ids?: string[] | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          region?: string | null
          required_skills?: string[] | null
          risk_level?: string | null
          security_requirements?: Json | null
          setup_completed?: boolean | null
          setup_completed_at?: string | null
          site_contact_email?: string | null
          site_contact_name?: string | null
          site_contact_phone?: string | null
          site_name?: string
          site_rules?: string | null
          site_type?: string | null
          status?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_metrics: {
        Row: {
          client_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          data_source: string | null
          description: string | null
          effective_from: string | null
          excluded_statuses: string[] | null
          formula: string
          id: string
          included_statuses: string[] | null
          is_active: boolean | null
          measurement_period: string | null
          metric_name: string
          rounding_rules: string | null
          site_id: string | null
          target: number | null
          timezone: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          client_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          data_source?: string | null
          description?: string | null
          effective_from?: string | null
          excluded_statuses?: string[] | null
          formula: string
          id?: string
          included_statuses?: string[] | null
          is_active?: boolean | null
          measurement_period?: string | null
          metric_name: string
          rounding_rules?: string | null
          site_id?: string | null
          target?: number | null
          timezone?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          client_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          data_source?: string | null
          description?: string | null
          effective_from?: string | null
          excluded_statuses?: string[] | null
          formula?: string
          id?: string
          included_statuses?: string[] | null
          is_active?: boolean | null
          measurement_period?: string | null
          metric_name?: string
          rounding_rules?: string | null
          site_id?: string | null
          target?: number | null
          timezone?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_metrics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_results: {
        Row: {
          actual_value: number | null
          client_id: string | null
          company_id: string
          computed_at: string | null
          data_snapshot: Json | null
          id: string
          is_estimate: boolean | null
          met: boolean | null
          metric_id: string
          period_end: string
          period_start: string
          site_id: string | null
          target_value: number | null
        }
        Insert: {
          actual_value?: number | null
          client_id?: string | null
          company_id: string
          computed_at?: string | null
          data_snapshot?: Json | null
          id?: string
          is_estimate?: boolean | null
          met?: boolean | null
          metric_id: string
          period_end: string
          period_start: string
          site_id?: string | null
          target_value?: number | null
        }
        Update: {
          actual_value?: number | null
          client_id?: string | null
          company_id?: string
          computed_at?: string | null
          data_snapshot?: Json | null
          id?: string
          is_estimate?: boolean | null
          met?: boolean | null
          metric_id?: string
          period_end?: string
          period_start?: string
          site_id?: string | null
          target_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_results_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_results_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_results_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "sla_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_results_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_notification_log: {
        Row: {
          channel: string | null
          company_id: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          message_body: string
          provider_message_id: string | null
          recipient_id: string | null
          recipient_name: string | null
          recipient_phone: string
          recipient_type: string
          sent_at: string | null
          status: string | null
          trigger_id: string | null
          trigger_type: string
        }
        Insert: {
          channel?: string | null
          company_id: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_body: string
          provider_message_id?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_phone: string
          recipient_type: string
          sent_at?: string | null
          status?: string | null
          trigger_id?: string | null
          trigger_type: string
        }
        Update: {
          channel?: string | null
          company_id?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_body?: string
          provider_message_id?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_phone?: string
          recipient_type?: string
          sent_at?: string | null
          status?: string | null
          trigger_id?: string | null
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_notification_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_acknowledgements: {
        Row: {
          acknowledged_at: string
          company_id: string
          created_at: string | null
          device_info: string | null
          guard_id: string
          id: string
          ip_address: string | null
          site_id: string | null
          sop_id: string
          version_number: number
        }
        Insert: {
          acknowledged_at?: string
          company_id: string
          created_at?: string | null
          device_info?: string | null
          guard_id: string
          id?: string
          ip_address?: string | null
          site_id?: string | null
          sop_id: string
          version_number?: number
        }
        Update: {
          acknowledged_at?: string
          company_id?: string
          created_at?: string | null
          device_info?: string | null
          guard_id?: string
          id?: string
          ip_address?: string | null
          site_id?: string | null
          sop_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "sop_acknowledgements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_acknowledgements_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_acknowledgements_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_acknowledgements_sop_id_fkey"
            columns: ["sop_id"]
            isOneToOne: false
            referencedRelation: "sop_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_acknowledgements_sop_id_fkey"
            columns: ["sop_id"]
            isOneToOne: false
            referencedRelation: "sop_version_history"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "sop_acknowledgements_sop_id_fkey"
            columns: ["sop_id"]
            isOneToOne: false
            referencedRelation: "sop_version_history"
            referencedColumns: ["version_id"]
          },
        ]
      }
      sop_chat_messages: {
        Row: {
          company_id: string | null
          content: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          retrieved_chunk_ids: string[] | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          retrieved_chunk_ids?: string[] | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          retrieved_chunk_ids?: string[] | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sop_chat_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_chunks: {
        Row: {
          chunk_index: number | null
          company_id: string | null
          content: string
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          chunk_index?: number | null
          company_id?: string | null
          content: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          chunk_index?: number | null
          company_id?: string | null
          content?: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sop_chunks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "sop_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "sop_version_history"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "sop_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "sop_version_history"
            referencedColumns: ["version_id"]
          },
        ]
      }
      sop_documents: {
        Row: {
          category: string | null
          change_notes: string | null
          company_id: string
          created_at: string | null
          description: string | null
          error_message: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_active: boolean | null
          is_current: boolean | null
          site_id: string
          status: string | null
          superseded_by_id: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          version_number: number | null
        }
        Insert: {
          category?: string | null
          change_notes?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          site_id: string
          status?: string | null
          superseded_by_id?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          version_number?: number | null
        }
        Update: {
          category?: string | null
          change_notes?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          site_id?: string
          status?: string | null
          superseded_by_id?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sop_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_documents_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_documents_superseded_by_id_fkey"
            columns: ["superseded_by_id"]
            isOneToOne: false
            referencedRelation: "sop_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_documents_superseded_by_id_fkey"
            columns: ["superseded_by_id"]
            isOneToOne: false
            referencedRelation: "sop_version_history"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "sop_documents_superseded_by_id_fkey"
            columns: ["superseded_by_id"]
            isOneToOne: false
            referencedRelation: "sop_version_history"
            referencedColumns: ["version_id"]
          },
          {
            foreignKeyName: "sop_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_gap_acknowledgments: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          company_id: string
          id: string
          question_text: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          company_id: string
          id?: string
          question_text: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          company_id?: string
          id?: string
          question_text?: string
        }
        Relationships: []
      }
      subprocessors: {
        Row: {
          contract_status: string
          created_at: string
          customer_notification_date: string | null
          data_processed: string | null
          effective_date: string | null
          id: string
          is_published: boolean
          processing_location: string | null
          provider_name: string
          replacement_date: string | null
          security_review_status: string
          service: string | null
          transfer_countries: string | null
          transfer_mechanism: string | null
          transfer_risk_assessment: string | null
          updated_at: string
        }
        Insert: {
          contract_status?: string
          created_at?: string
          customer_notification_date?: string | null
          data_processed?: string | null
          effective_date?: string | null
          id?: string
          is_published?: boolean
          processing_location?: string | null
          provider_name: string
          replacement_date?: string | null
          security_review_status?: string
          service?: string | null
          transfer_countries?: string | null
          transfer_mechanism?: string | null
          transfer_risk_assessment?: string | null
          updated_at?: string
        }
        Update: {
          contract_status?: string
          created_at?: string
          customer_notification_date?: string | null
          data_processed?: string | null
          effective_date?: string | null
          id?: string
          is_published?: boolean
          processing_location?: string | null
          provider_name?: string
          replacement_date?: string | null
          security_review_status?: string
          service?: string | null
          transfer_countries?: string | null
          transfer_mechanism?: string | null
          transfer_risk_assessment?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      support_access_logs: {
        Row: {
          access_level: string
          allowed_modules: string[] | null
          approved_by: string | null
          created_at: string | null
          customer_consent: boolean | null
          ended_at: string | null
          expires_at: string
          id: string
          pages_accessed: string[] | null
          platform_user_id: string
          reason: string
          started_at: string | null
          status: string | null
          support_case_id: string | null
          target_tenant_id: string
        }
        Insert: {
          access_level?: string
          allowed_modules?: string[] | null
          approved_by?: string | null
          created_at?: string | null
          customer_consent?: boolean | null
          ended_at?: string | null
          expires_at: string
          id?: string
          pages_accessed?: string[] | null
          platform_user_id: string
          reason: string
          started_at?: string | null
          status?: string | null
          support_case_id?: string | null
          target_tenant_id: string
        }
        Update: {
          access_level?: string
          allowed_modules?: string[] | null
          approved_by?: string | null
          created_at?: string | null
          customer_consent?: boolean | null
          ended_at?: string | null
          expires_at?: string
          id?: string
          pages_accessed?: string[] | null
          platform_user_id?: string
          reason?: string
          started_at?: string | null
          status?: string | null
          support_case_id?: string | null
          target_tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_access_logs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_access_logs_platform_user_id_fkey"
            columns: ["platform_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_access_logs_support_case_id_fkey"
            columns: ["support_case_id"]
            isOneToOne: false
            referencedRelation: "support_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_access_logs_target_tenant_id_fkey"
            columns: ["target_tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_agent_status: {
        Row: {
          active_chat_count: number | null
          agent_id: string
          company_id: string | null
          id: string
          is_online: boolean | null
          last_seen_at: string | null
          max_concurrent_chats: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          active_chat_count?: number | null
          agent_id: string
          company_id?: string | null
          id?: string
          is_online?: boolean | null
          last_seen_at?: string | null
          max_concurrent_chats?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          active_chat_count?: number | null
          agent_id?: string
          company_id?: string | null
          id?: string
          is_online?: boolean | null
          last_seen_at?: string | null
          max_concurrent_chats?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_agent_status_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_agent_status_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_case_events: {
        Row: {
          action: string
          actor_id: string | null
          case_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          new_status: string | null
          previous_status: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          case_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_status?: string | null
          previous_status?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          case_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_status?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_case_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_case_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "support_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      support_cases: {
        Row: {
          assigned_team: string | null
          assigned_to: string | null
          case_ref: string
          category: string
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          priority: string
          requester_id: string | null
          resolution: string | null
          resolved_at: string | null
          sla_breached: boolean | null
          sla_target_at: string | null
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          assigned_team?: string | null
          assigned_to?: string | null
          case_ref: string
          category?: string
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: string
          requester_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          sla_breached?: boolean | null
          sla_target_at?: string | null
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          assigned_team?: string | null
          assigned_to?: string | null
          case_ref?: string
          category?: string
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: string
          requester_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          sla_breached?: boolean | null
          sla_target_at?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_cases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_cases_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          attachment_paths: string[] | null
          case_id: string
          created_at: string | null
          id: string
          message: string
          sender_id: string | null
          visibility: string
        }
        Insert: {
          attachment_paths?: string[] | null
          case_id: string
          created_at?: string | null
          id?: string
          message: string
          sender_id?: string | null
          visibility?: string
        }
        Update: {
          attachment_paths?: string[] | null
          case_id?: string
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "support_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_sla_rules: {
        Row: {
          chat_support: boolean | null
          created_at: string | null
          first_response_hours: number
          id: string
          phone_support: boolean | null
          plan_name: string
          priority: string
          resolution_hours: number
        }
        Insert: {
          chat_support?: boolean | null
          created_at?: string | null
          first_response_hours: number
          id?: string
          phone_support?: boolean | null
          plan_name: string
          priority: string
          resolution_hours: number
        }
        Update: {
          chat_support?: boolean | null
          created_at?: string | null
          first_response_hours?: number
          id?: string
          phone_support?: boolean | null
          plan_name?: string
          priority?: string
          resolution_hours?: number
        }
        Relationships: []
      }
      support_ticket_actions: {
        Row: {
          action_summary: string
          action_type: string
          after_data: Json | null
          ai_check_id: string | null
          approved_by: string | null
          before_data: Json | null
          company_id: string
          created_at: string
          id: string
          performed_by: string | null
          ticket_id: string
        }
        Insert: {
          action_summary: string
          action_type: string
          after_data?: Json | null
          ai_check_id?: string | null
          approved_by?: string | null
          before_data?: Json | null
          company_id: string
          created_at?: string
          id?: string
          performed_by?: string | null
          ticket_id: string
        }
        Update: {
          action_summary?: string
          action_type?: string
          after_data?: Json | null
          ai_check_id?: string | null
          approved_by?: string | null
          before_data?: Json | null
          company_id?: string
          created_at?: string
          id?: string
          performed_by?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_actions_ai_check_id_fkey"
            columns: ["ai_check_id"]
            isOneToOne: false
            referencedRelation: "support_ticket_ai_checks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_actions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_actions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_actions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_actions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_ai_checks: {
        Row: {
          company_id: string
          created_at: string
          id: string
          likely_cause: string
          raw_data: Json | null
          recommended_action: string
          risk_level: string
          suggested_fix: string
          ticket_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          likely_cause: string
          raw_data?: Json | null
          recommended_action: string
          risk_level: string
          suggested_fix: string
          ticket_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          likely_cause?: string
          raw_data?: Json | null
          recommended_action?: string
          risk_level?: string
          suggested_fix?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_ai_checks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_ai_checks_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          message_id: string | null
          mime_type: string
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          message_id?: string | null
          mime_type: string
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          message_id?: string | null
          mime_type?: string
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "support_ticket_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          new_status: string | null
          previous_status: string | null
          ticket_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          previous_status?: string | null
          ticket_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          previous_status?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_events_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          affected_site_id: string | null
          affected_user_id: string | null
          assigned_to: string | null
          category: string
          closed_at: string | null
          company_id: string
          consent_given: boolean
          created_at: string
          created_by: string
          description: string
          first_response_at: string | null
          id: string
          linked_incident_id: string | null
          priority: string
          resolved_at: string | null
          satisfaction_rating: number | null
          sla_first_response_breached: boolean | null
          sla_first_response_due: string | null
          sla_resolution_breached: boolean | null
          sla_resolution_due: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          affected_site_id?: string | null
          affected_user_id?: string | null
          assigned_to?: string | null
          category: string
          closed_at?: string | null
          company_id: string
          consent_given?: boolean
          created_at?: string
          created_by: string
          description: string
          first_response_at?: string | null
          id?: string
          linked_incident_id?: string | null
          priority?: string
          resolved_at?: string | null
          satisfaction_rating?: number | null
          sla_first_response_breached?: boolean | null
          sla_first_response_due?: string | null
          sla_resolution_breached?: boolean | null
          sla_resolution_due?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          affected_site_id?: string | null
          affected_user_id?: string | null
          assigned_to?: string | null
          category?: string
          closed_at?: string | null
          company_id?: string
          consent_given?: boolean
          created_at?: string
          created_by?: string
          description?: string
          first_response_at?: string | null
          id?: string
          linked_incident_id?: string | null
          priority?: string
          resolved_at?: string | null
          satisfaction_rating?: number | null
          sla_first_response_breached?: boolean | null
          sla_first_response_due?: string | null
          sla_resolution_breached?: boolean | null
          sla_resolution_due?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_affected_site_id_fkey"
            columns: ["affected_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_affected_user_id_fkey"
            columns: ["affected_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_status_config: {
        Row: {
          admin_access: boolean | null
          billing_recovery: boolean | null
          client_access: boolean | null
          created_at: string | null
          data_preserved: boolean | null
          description: string | null
          display_message: string | null
          guard_access: boolean | null
          id: string
          is_reversible: boolean | null
          label: string
          requires_review: boolean | null
          status: string
        }
        Insert: {
          admin_access?: boolean | null
          billing_recovery?: boolean | null
          client_access?: boolean | null
          created_at?: string | null
          data_preserved?: boolean | null
          description?: string | null
          display_message?: string | null
          guard_access?: boolean | null
          id?: string
          is_reversible?: boolean | null
          label: string
          requires_review?: boolean | null
          status: string
        }
        Update: {
          admin_access?: boolean | null
          billing_recovery?: boolean | null
          client_access?: boolean | null
          created_at?: string | null
          data_preserved?: boolean | null
          description?: string | null
          display_message?: string | null
          guard_access?: boolean | null
          id?: string
          is_reversible?: boolean | null
          label?: string
          requires_review?: boolean | null
          status?: string
        }
        Relationships: []
      }
      ticket_satisfaction_ratings: {
        Row: {
          comment: string | null
          company_id: string
          id: string
          rated_at: string | null
          rated_by: string | null
          rating: number
          ticket_id: string
        }
        Insert: {
          comment?: string | null
          company_id: string
          id?: string
          rated_at?: string | null
          rated_by?: string | null
          rating: number
          ticket_id: string
        }
        Update: {
          comment?: string | null
          company_id?: string
          id?: string
          rated_at?: string | null
          rated_by?: string | null
          rating?: number
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_satisfaction_ratings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_satisfaction_ratings_rated_by_fkey"
            columns: ["rated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_satisfaction_ratings_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_corrections: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          evidence_url: string | null
          field_name: string
          id: string
          new_value: string
          original_value: string | null
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          work_record_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          evidence_url?: string | null
          field_name: string
          id?: string
          new_value: string
          original_value?: string | null
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          work_record_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          evidence_url?: string | null
          field_name?: string
          id?: string
          new_value?: string
          original_value?: string | null
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          work_record_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_corrections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_corrections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_corrections_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_corrections_work_record_id_fkey"
            columns: ["work_record_id"]
            isOneToOne: false
            referencedRelation: "finance_work_records"
            referencedColumns: ["id"]
          },
        ]
      }
      training_assessments: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean
          is_high_risk: boolean
          max_attempts: number
          module_id: string | null
          pass_mark: number
          question_version: number
          questions: Json | null
          title: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_high_risk?: boolean
          max_attempts?: number
          module_id?: string | null
          pass_mark?: number
          question_version?: number
          questions?: Json | null
          title: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_high_risk?: boolean
          max_attempts?: number
          module_id?: string | null
          pass_mark?: number
          question_version?: number
          questions?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_assessments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_assessments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_attempts: {
        Row: {
          answers: Json | null
          assessment_id: string
          attempt_number: number
          company_id: string | null
          completion_id: string | null
          created_at: string
          id: string
          passed: boolean | null
          score: number | null
          started_at: string
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          assessment_id: string
          attempt_number?: number
          company_id?: string | null
          completion_id?: string | null
          created_at?: string
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          assessment_id?: string
          attempt_number?: number
          company_id?: string | null
          completion_id?: string | null
          created_at?: string
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "training_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_attempts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_attempts_completion_id_fkey"
            columns: ["completion_id"]
            isOneToOne: false
            referencedRelation: "training_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      training_completions: {
        Row: {
          attempts: number | null
          certificate_url: string | null
          company_id: string
          completed_at: string | null
          created_at: string | null
          expires_at: string | null
          guard_id: string
          id: string
          module_id: string
          passed: boolean | null
          score: number | null
          started_at: string | null
        }
        Insert: {
          attempts?: number | null
          certificate_url?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          guard_id: string
          id?: string
          module_id: string
          passed?: boolean | null
          score?: number | null
          started_at?: string | null
        }
        Update: {
          attempts?: number | null
          certificate_url?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          guard_id?: string
          id?: string
          module_id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_completions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_completions_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_completions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          active: boolean | null
          category: string | null
          company_id: string | null
          content_type: string | null
          content_url: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_mandatory: boolean | null
          mandatory_for_roles: string[] | null
          pass_score: number | null
          quiz_questions: Json | null
          title: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          company_id?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          mandatory_for_roles?: string[] | null
          pass_score?: number | null
          quiz_questions?: Json | null
          title: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          company_id?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          mandatory_for_roles?: string[] | null
          pass_score?: number | null
          quiz_questions?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_modules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      uniform_equipment: {
        Row: {
          asset_id_tag: string | null
          asset_name: string
          asset_type: string
          company_id: string
          condition_status: string | null
          created_at: string | null
          damage_loss_notes: string | null
          deposit_amount: number | null
          id: string
          is_security_sensitive: boolean | null
          issued_by: string | null
          issued_date: string | null
          photo_file_path: string | null
          received_by: string | null
          returned_date: string | null
          serial_number: string | null
          site_id: string | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          asset_id_tag?: string | null
          asset_name: string
          asset_type: string
          company_id: string
          condition_status?: string | null
          created_at?: string | null
          damage_loss_notes?: string | null
          deposit_amount?: number | null
          id?: string
          is_security_sensitive?: boolean | null
          issued_by?: string | null
          issued_date?: string | null
          photo_file_path?: string | null
          received_by?: string | null
          returned_date?: string | null
          serial_number?: string | null
          site_id?: string | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          asset_id_tag?: string | null
          asset_name?: string
          asset_type?: string
          company_id?: string
          condition_status?: string | null
          created_at?: string | null
          damage_loss_notes?: string | null
          deposit_amount?: number | null
          id?: string
          is_security_sensitive?: boolean | null
          issued_by?: string | null
          issued_date?: string | null
          photo_file_path?: string | null
          received_by?: string | null
          returned_date?: string | null
          serial_number?: string | null
          site_id?: string | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uniform_equipment_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniform_equipment_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniform_equipment_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniform_equipment_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uniform_equipment_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          company_id: string
          id: string
          is_primary: boolean | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          company_id: string
          id?: string
          is_primary?: boolean | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          company_id?: string
          id?: string
          is_primary?: boolean | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_site_access: {
        Row: {
          access_type: string
          company_id: string
          created_at: string | null
          id: string
          region: string | null
          site_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_type?: string
          company_id: string
          created_at?: string | null
          id?: string
          region?: string | null
          site_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          company_id?: string
          created_at?: string | null
          id?: string
          region?: string | null
          site_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_site_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_site_access_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role: string
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vacancies: {
        Row: {
          application_questions: Json | null
          closed_at: string | null
          closing_date: string | null
          company_id: string
          created_at: string | null
          description: string | null
          engagement_type: string | null
          experience_requirements: string | null
          hiring_manager_id: string | null
          hours_pattern: string | null
          id: string
          location: string | null
          pay_display_text: string | null
          publication_channels: string[] | null
          published_at: string | null
          reference: string
          region: string | null
          required_licence_types: string[] | null
          required_training: string[] | null
          role_type: string | null
          sites: string[] | null
          status: string | null
          title: string
          updated_at: string | null
          vacancy_version: number | null
        }
        Insert: {
          application_questions?: Json | null
          closed_at?: string | null
          closing_date?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          engagement_type?: string | null
          experience_requirements?: string | null
          hiring_manager_id?: string | null
          hours_pattern?: string | null
          id?: string
          location?: string | null
          pay_display_text?: string | null
          publication_channels?: string[] | null
          published_at?: string | null
          reference: string
          region?: string | null
          required_licence_types?: string[] | null
          required_training?: string[] | null
          role_type?: string | null
          sites?: string[] | null
          status?: string | null
          title: string
          updated_at?: string | null
          vacancy_version?: number | null
        }
        Update: {
          application_questions?: Json | null
          closed_at?: string | null
          closing_date?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          engagement_type?: string | null
          experience_requirements?: string | null
          hiring_manager_id?: string | null
          hours_pattern?: string | null
          id?: string
          location?: string | null
          pay_display_text?: string | null
          publication_channels?: string[] | null
          published_at?: string | null
          reference?: string
          region?: string | null
          required_licence_types?: string[] | null
          required_training?: string[] | null
          role_type?: string | null
          sites?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vacancy_version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vacancies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacancies_hiring_manager_id_fkey"
            columns: ["hiring_manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_logs: {
        Row: {
          badge_number: string | null
          company_id: string | null
          company_name: string | null
          created_at: string | null
          guard_id: string | null
          id: string
          notes: string | null
          person_visiting: string | null
          purpose: string | null
          site_id: string | null
          time_in: string | null
          time_out: string | null
          vehicle_reg: string | null
          visitor_name: string
        }
        Insert: {
          badge_number?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string | null
          guard_id?: string | null
          id?: string
          notes?: string | null
          person_visiting?: string | null
          purpose?: string | null
          site_id?: string | null
          time_in?: string | null
          time_out?: string | null
          vehicle_reg?: string | null
          visitor_name: string
        }
        Update: {
          badge_number?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string | null
          guard_id?: string | null
          id?: string
          notes?: string | null
          person_visiting?: string | null
          purpose?: string | null
          site_id?: string | null
          time_in?: string | null
          time_out?: string | null
          vehicle_reg?: string | null
          visitor_name?: string
        }
        Relationships: []
      }
      webhook_debug_log: {
        Row: {
          body_len: number | null
          created_at: string | null
          detail: string | null
          id: number
          sig_header_prefix: string | null
          stage: string | null
          stripe_key_prefix: string | null
          webhook_secret_len: number | null
          webhook_secret_prefix: string | null
        }
        Insert: {
          body_len?: number | null
          created_at?: string | null
          detail?: string | null
          id?: never
          sig_header_prefix?: string | null
          stage?: string | null
          stripe_key_prefix?: string | null
          webhook_secret_len?: number | null
          webhook_secret_prefix?: string | null
        }
        Update: {
          body_len?: number | null
          created_at?: string | null
          detail?: string | null
          id?: never
          sig_header_prefix?: string | null
          stage?: string | null
          stripe_key_prefix?: string | null
          webhook_secret_len?: number | null
          webhook_secret_prefix?: string | null
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number | null
          completed_at: string | null
          created_at: string | null
          event_id: string
          event_type: string
          id: string
          last_attempt_at: string | null
          response_body: string | null
          response_code: number | null
          status: string
          webhook_endpoint_id: string
        }
        Insert: {
          attempt_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          event_id: string
          event_type: string
          id?: string
          last_attempt_at?: string | null
          response_body?: string | null
          response_code?: number | null
          status?: string
          webhook_endpoint_id: string
        }
        Update: {
          attempt_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          event_id?: string
          event_type?: string
          id?: string
          last_attempt_at?: string | null
          response_body?: string | null
          response_code?: number | null
          status?: string
          webhook_endpoint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_endpoint_id_fkey"
            columns: ["webhook_endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          enabled_events: string[] | null
          failure_count: number | null
          id: string
          last_delivery_at: string | null
          signing_secret_ref: string | null
          status: string
          updated_at: string | null
          url: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          enabled_events?: string[] | null
          failure_count?: number | null
          id?: string
          last_delivery_at?: string | null
          signing_secret_ref?: string | null
          status?: string
          updated_at?: string | null
          url: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          enabled_events?: string[] | null
          failure_count?: number | null
          id?: string
          last_delivery_at?: string | null
          signing_secret_ref?: string | null
          status?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_endpoints_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_report_schedule: {
        Row: {
          auto_email: boolean | null
          client_id: string | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          day_of_week: number | null
          email_recipients: string[] | null
          frequency: string
          id: string
          include_ai_recommendations: boolean | null
          include_dob_summary: boolean | null
          include_evidence_summary: boolean | null
          include_guard_attendance: boolean | null
          include_incidents: boolean | null
          include_missed_patrols: boolean | null
          include_patrol_completion: boolean | null
          include_site_summary: boolean | null
          include_support_tickets: boolean | null
          include_welfare_summary: boolean | null
          is_active: boolean | null
          report_template_id: string | null
          schedule_name: string
          site_id: string | null
          time_of_day: string | null
          updated_at: string | null
        }
        Insert: {
          auto_email?: boolean | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          day_of_week?: number | null
          email_recipients?: string[] | null
          frequency?: string
          id?: string
          include_ai_recommendations?: boolean | null
          include_dob_summary?: boolean | null
          include_evidence_summary?: boolean | null
          include_guard_attendance?: boolean | null
          include_incidents?: boolean | null
          include_missed_patrols?: boolean | null
          include_patrol_completion?: boolean | null
          include_site_summary?: boolean | null
          include_support_tickets?: boolean | null
          include_welfare_summary?: boolean | null
          is_active?: boolean | null
          report_template_id?: string | null
          schedule_name: string
          site_id?: string | null
          time_of_day?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_email?: boolean | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          day_of_week?: number | null
          email_recipients?: string[] | null
          frequency?: string
          id?: string
          include_ai_recommendations?: boolean | null
          include_dob_summary?: boolean | null
          include_evidence_summary?: boolean | null
          include_guard_attendance?: boolean | null
          include_incidents?: boolean | null
          include_missed_patrols?: boolean | null
          include_patrol_completion?: boolean | null
          include_site_summary?: boolean | null
          include_support_tickets?: boolean | null
          include_welfare_summary?: boolean | null
          is_active?: boolean | null
          report_template_id?: string | null
          schedule_name?: string
          site_id?: string | null
          time_of_day?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_report_schedule_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_report_schedule_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_report_schedule_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_references: {
        Row: {
          company_id: string
          created_at: string | null
          discrepancy_flags: string[] | null
          id: string
          notes: string | null
          referee_email: string | null
          referee_name: string
          referee_phone: string | null
          reference_type: string | null
          relationship: string | null
          relationship_period: string | null
          request_sent_at: string | null
          request_token_hash: string | null
          response_data: Json | null
          response_received_at: string | null
          reviewer_id: string | null
          reviewer_outcome: string | null
          token_expires_at: string | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          discrepancy_flags?: string[] | null
          id?: string
          notes?: string | null
          referee_email?: string | null
          referee_name: string
          referee_phone?: string | null
          reference_type?: string | null
          relationship?: string | null
          relationship_period?: string | null
          request_sent_at?: string | null
          request_token_hash?: string | null
          response_data?: Json | null
          response_received_at?: string | null
          reviewer_id?: string | null
          reviewer_outcome?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          discrepancy_flags?: string[] | null
          id?: string
          notes?: string | null
          referee_email?: string | null
          referee_name?: string
          referee_phone?: string | null
          reference_type?: string | null
          relationship?: string | null
          relationship_period?: string | null
          request_sent_at?: string | null
          request_token_hash?: string | null
          response_data?: Json | null
          response_received_at?: string | null
          reviewer_id?: string | null
          reviewer_outcome?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_references_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_references_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_references_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          company_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          reason: string | null
          resource_id: string | null
          resource_type: string
          worker_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          resource_id?: string | null
          resource_type: string
          worker_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          resource_id?: string | null
          resource_type?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workforce_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_audit_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_audit_log_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_policies: {
        Row: {
          applies_to_roles: string[] | null
          category: string
          company_id: string
          content_text: string | null
          created_at: string | null
          description: string | null
          file_path: string | null
          id: string
          is_mandatory: boolean | null
          published_at: string | null
          requires_reacknowledgment_on_update: boolean | null
          status: string | null
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          applies_to_roles?: string[] | null
          category: string
          company_id: string
          content_text?: string | null
          created_at?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          is_mandatory?: boolean | null
          published_at?: string | null
          requires_reacknowledgment_on_update?: boolean | null
          status?: string | null
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          applies_to_roles?: string[] | null
          category?: string
          company_id?: string
          content_text?: string | null
          created_at?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          is_mandatory?: boolean | null
          published_at?: string | null
          requires_reacknowledgment_on_update?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workforce_policies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_profiles: {
        Row: {
          company_id: string
          created_at: string | null
          department: string | null
          employment_status: string | null
          end_date: string | null
          engagement_type: string | null
          guard_id: string | null
          id: string
          job_title: string | null
          manager_id: string | null
          onboarding_status: string | null
          region: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string | null
          work_email: string | null
          work_phone: string | null
          worker_reference: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          department?: string | null
          employment_status?: string | null
          end_date?: string | null
          engagement_type?: string | null
          guard_id?: string | null
          id?: string
          job_title?: string | null
          manager_id?: string | null
          onboarding_status?: string | null
          region?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_email?: string | null
          work_phone?: string | null
          worker_reference?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          department?: string | null
          employment_status?: string | null
          end_date?: string | null
          engagement_type?: string | null
          guard_id?: string | null
          id?: string
          job_title?: string | null
          manager_id?: string | null
          onboarding_status?: string | null
          region?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_email?: string | null
          work_phone?: string | null
          worker_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workforce_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_profiles_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_status_history: {
        Row: {
          approved_by: string | null
          changed_by: string | null
          company_id: string
          created_at: string | null
          effective_date: string
          id: string
          new_status: string
          notes: string | null
          previous_status: string | null
          reason: string | null
          worker_id: string
        }
        Insert: {
          approved_by?: string | null
          changed_by?: string | null
          company_id: string
          created_at?: string | null
          effective_date?: string
          id?: string
          new_status: string
          notes?: string | null
          previous_status?: string | null
          reason?: string | null
          worker_id: string
        }
        Update: {
          approved_by?: string | null
          changed_by?: string | null
          company_id?: string
          created_at?: string | null
          effective_date?: string
          id?: string
          new_status?: string
          notes?: string | null
          previous_status?: string | null
          reason?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_status_history_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_status_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_status_history_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workforce_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_site_notices: {
        Row: {
          body: string | null
          category: string | null
          client_name: string | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          expiry_date: string | null
          id: string | null
          pinned: boolean | null
          priority: string | null
          site_id: string | null
          site_name: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_notices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_notices_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_notices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_weekly_guard_cards: {
        Row: {
          company_id: string | null
          end_time: string | null
          guard_email: string | null
          guard_id: string | null
          guard_name: string | null
          notes: string | null
          shift_id: string | null
          shift_type: string | null
          site_id: string | null
          site_name: string | null
          start_time: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_version_history: {
        Row: {
          category: string | null
          change_notes: string | null
          company_id: string | null
          document_id: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          is_active: boolean | null
          site_id: string | null
          title: string | null
          uploaded_by: string | null
          version_created_at: string | null
          version_id: string | null
          version_number: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sop_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_documents_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      v_billing_mrr_current: {
        Row: {
          active_subs: number | null
          at_risk_subs: number | null
          plan_name: string | null
          subscription_billing: string | null
          trialing_subs: number | null
        }
        Relationships: []
      }
      v_billing_overdue: {
        Row: {
          amount_due: number | null
          attempt_count: number | null
          company_id: string | null
          company_name: string | null
          contact_email: string | null
          currency: string | null
          due_date: string | null
          hosted_invoice_url: string | null
          id: string | null
          next_payment_attempt: string | null
          number: string | null
          status: string | null
          stripe_invoice_id: string | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      v_billing_revenue_monthly: {
        Row: {
          currency: string | null
          gross_pence: number | null
          invoice_count: number | null
          month: string | null
          net_pence: number | null
          vat_pence: number | null
        }
        Relationships: []
      }
      v_billing_tax_monthly: {
        Row: {
          currency: string | null
          effective_vat_pct: number | null
          gross_pence: number | null
          month: string | null
          net_pence: number | null
          vat_pence: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_shift_cover_offer: {
        Args: { p_offer_id: string; p_response_note?: string }
        Returns: Json
      }
      decline_shift_cover_offer: {
        Args: { p_offer_id: string; p_response_note?: string }
        Returns: Json
      }
      expire_shift_cover_offers: { Args: never; Returns: number }
      get_current_user_company: { Args: never; Returns: string }
      get_my_company_id: { Args: never; Returns: string }
      get_my_guard_id: { Args: never; Returns: string }
      get_my_role: { Args: never; Returns: string }
      guard_acknowledge_first_run_policy: {
        Args: { p_policy_id: string }
        Returns: boolean
      }
      guard_ensure_workforce_profile: { Args: never; Returns: string }
      guard_get_first_run_acknowledgements: {
        Args: never
        Returns: {
          acknowledged: boolean
          acknowledged_at: string
          category: string
          content_text: string
          description: string
          policy_id: string
          title: string
          version: number
        }[]
      }
      guard_is_free_for_shift: {
        Args: {
          p_end_time: string
          p_exclude_shift_id?: string
          p_guard_id: string
          p_start_time: string
        }
        Returns: boolean
      }
      guard_seed_first_run_policies: {
        Args: { p_company_id: string }
        Returns: undefined
      }
      has_permission: {
        Args: {
          p_company_id: string
          p_permission_key: string
          p_user_id: string
        }
        Returns: boolean
      }
      has_rota_edit_permission: { Args: never; Returns: boolean }
      has_site_access: { Args: { site_uuid: string }; Returns: boolean }
      is_company_member: {
        Args: { target_company_id: string }
        Returns: boolean
      }
      is_platform_staff: { Args: never; Returns: boolean }
      is_same_company: { Args: { target_company_id: string }; Returns: boolean }
      is_super_admin:
        | { Args: never; Returns: boolean }
        | { Args: { check_user_id: string }; Returns: boolean }
      match_sop_chunks:
        | {
            Args: {
              match_company_id: string
              match_count?: number
              match_site_id?: string
              match_threshold?: number
              query_embedding: string
            }
            Returns: {
              content: string
              document_id: string
              document_title: string
              id: string
              similarity: number
            }[]
          }
        | {
            Args: {
              company_filter: string
              match_count: number
              match_threshold: number
              query_embedding: string
            }
            Returns: {
              chunk_index: number
              content: string
              document_id: string
              document_title: string
              id: string
              similarity: number
            }[]
          }
      request_shift_leave: {
        Args: {
          p_notes?: string
          p_reason?: string
          p_response_minutes?: number
          p_shift_id: string
        }
        Returns: Json
      }
      sop_daily_queries: {
        Args: { p_company_id: string; p_since: string }
        Returns: {
          count: number
          day: string
        }[]
      }
      user_client_id: { Args: never; Returns: string }
      user_client_ids: { Args: never; Returns: string[] }
      user_company_id: { Args: never; Returns: string }
      user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
