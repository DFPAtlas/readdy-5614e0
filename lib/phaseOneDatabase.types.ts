// Generated from GuardianHub's verified schema; limited to Phase 1 tables.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type PhaseOneDatabase = {
  public: {
    Tables: {
      guards: {
        Row: {
          address: string | null;
          availability: Json | null;
          badge_number: string | null;
          bank_account: string | null;
          certifications: string | null;
          company_id: string | null;
          created_at: string | null;
          email: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relation: string | null;
          first_name: string | null;
          hire_date: string | null;
          hourly_rate: number | null;
          id: string;
          last_name: string | null;
          medical_conditions: string | null;
          ni_number: string | null;
          phone: string | null;
          photo_url: string | null;
          position: string | null;
          postcode: string | null;
          reference_1_name: string | null;
          reference_1_phone: string | null;
          reference_2_name: string | null;
          reference_2_phone: string | null;
          salary: number | null;
          sia_expiry: string | null;
          sia_licence: string | null;
          skills: string[] | null;
          sort_code: string | null;
          status: string | null;
          user_id: string | null;
        };
        Insert: {
          address?: string | null;
          availability?: Json | null;
          badge_number?: string | null;
          bank_account?: string | null;
          certifications?: string | null;
          company_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relation?: string | null;
          first_name?: string | null;
          hire_date?: string | null;
          hourly_rate?: number | null;
          id?: string;
          last_name?: string | null;
          medical_conditions?: string | null;
          ni_number?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          position?: string | null;
          postcode?: string | null;
          reference_1_name?: string | null;
          reference_1_phone?: string | null;
          reference_2_name?: string | null;
          reference_2_phone?: string | null;
          salary?: number | null;
          sia_expiry?: string | null;
          sia_licence?: string | null;
          skills?: string[] | null;
          sort_code?: string | null;
          status?: string | null;
          user_id?: string | null;
        };
        Update: {
          address?: string | null;
          availability?: Json | null;
          badge_number?: string | null;
          bank_account?: string | null;
          certifications?: string | null;
          company_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relation?: string | null;
          first_name?: string | null;
          hire_date?: string | null;
          hourly_rate?: number | null;
          id?: string;
          last_name?: string | null;
          medical_conditions?: string | null;
          ni_number?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          position?: string | null;
          postcode?: string | null;
          reference_1_name?: string | null;
          reference_1_phone?: string | null;
          reference_2_name?: string | null;
          reference_2_phone?: string | null;
          salary?: number | null;
          sia_expiry?: string | null;
          sia_licence?: string | null;
          skills?: string[] | null;
          sort_code?: string | null;
          status?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "guards_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "guards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      shifts: {
        Row: {
          company_id: string | null;
          created_at: string | null;
          created_by: string | null;
          end_time: string;
          guard_id: string | null;
          id: string;
          notes: string | null;
          shift_type: string | null;
          site_id: string | null;
          start_time: string;
          status: string | null;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          end_time: string;
          guard_id?: string | null;
          id?: string;
          notes?: string | null;
          shift_type?: string | null;
          site_id?: string | null;
          start_time: string;
          status?: string | null;
        };
        Update: {
          company_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          end_time?: string;
          guard_id?: string | null;
          id?: string;
          notes?: string | null;
          shift_type?: string | null;
          site_id?: string | null;
          start_time?: string;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shifts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shifts_guard_id_fkey";
            columns: ["guard_id"];
            isOneToOne: false;
            referencedRelation: "guards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shifts_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
        ];
      };
      sites: {
        Row: {
          access_instructions: string | null;
          address: string | null;
          alarm_response: string | null;
          assignment_instructions: string | null;
          banned_guard_ids: string[] | null;
          check_call_interval: number | null;
          client_contact_email: string | null;
          client_contact_name: string | null;
          client_id: string | null;
          client_logo_url: string | null;
          client_name: string | null;
          company_id: string | null;
          compliance_settings: Json | null;
          created_at: string | null;
          created_by: string | null;
          emergency_contact: string | null;
          emergency_procedures: string | null;
          id: string;
          keyholding_notes: string | null;
          latitude: number | null;
          longitude: number | null;
          operating_hours: Json | null;
          patrol_enabled: boolean | null;
          patrol_interval: number | null;
          patrol_settings: Json | null;
          postcode: string | null;
          preferred_guard_ids: string[] | null;
          primary_contact_email: string | null;
          primary_contact_name: string | null;
          primary_contact_phone: string | null;
          region: string | null;
          required_skills: string[] | null;
          risk_level: string | null;
          security_requirements: Json | null;
          setup_completed: boolean | null;
          setup_completed_at: string | null;
          site_contact_email: string | null;
          site_contact_name: string | null;
          site_contact_phone: string | null;
          site_name: string;
          site_rules: string | null;
          site_type: string | null;
          status: string | null;
          updated_by: string | null;
        };
        Insert: {
          access_instructions?: string | null;
          address?: string | null;
          alarm_response?: string | null;
          assignment_instructions?: string | null;
          banned_guard_ids?: string[] | null;
          check_call_interval?: number | null;
          client_contact_email?: string | null;
          client_contact_name?: string | null;
          client_id?: string | null;
          client_logo_url?: string | null;
          client_name?: string | null;
          company_id?: string | null;
          compliance_settings?: Json | null;
          created_at?: string | null;
          created_by?: string | null;
          emergency_contact?: string | null;
          emergency_procedures?: string | null;
          id?: string;
          keyholding_notes?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          operating_hours?: Json | null;
          patrol_enabled?: boolean | null;
          patrol_interval?: number | null;
          patrol_settings?: Json | null;
          postcode?: string | null;
          preferred_guard_ids?: string[] | null;
          primary_contact_email?: string | null;
          primary_contact_name?: string | null;
          primary_contact_phone?: string | null;
          region?: string | null;
          required_skills?: string[] | null;
          risk_level?: string | null;
          security_requirements?: Json | null;
          setup_completed?: boolean | null;
          setup_completed_at?: string | null;
          site_contact_email?: string | null;
          site_contact_name?: string | null;
          site_contact_phone?: string | null;
          site_name: string;
          site_rules?: string | null;
          site_type?: string | null;
          status?: string | null;
          updated_by?: string | null;
        };
        Update: {
          access_instructions?: string | null;
          address?: string | null;
          alarm_response?: string | null;
          assignment_instructions?: string | null;
          banned_guard_ids?: string[] | null;
          check_call_interval?: number | null;
          client_contact_email?: string | null;
          client_contact_name?: string | null;
          client_id?: string | null;
          client_logo_url?: string | null;
          client_name?: string | null;
          company_id?: string | null;
          compliance_settings?: Json | null;
          created_at?: string | null;
          created_by?: string | null;
          emergency_contact?: string | null;
          emergency_procedures?: string | null;
          id?: string;
          keyholding_notes?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          operating_hours?: Json | null;
          patrol_enabled?: boolean | null;
          patrol_interval?: number | null;
          patrol_settings?: Json | null;
          postcode?: string | null;
          preferred_guard_ids?: string[] | null;
          primary_contact_email?: string | null;
          primary_contact_name?: string | null;
          primary_contact_phone?: string | null;
          region?: string | null;
          required_skills?: string[] | null;
          risk_level?: string | null;
          security_requirements?: Json | null;
          setup_completed?: boolean | null;
          setup_completed_at?: string | null;
          site_contact_email?: string | null;
          site_contact_name?: string | null;
          site_contact_phone?: string | null;
          site_name?: string;
          site_rules?: string | null;
          site_type?: string | null;
          status?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sites_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sites_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      client_invoices: {
        Row: {
          amount_paid: number;
          approved_by: string | null;
          balance_due: number | null;
          billing_run_id: string | null;
          client_address_snapshot: string | null;
          client_email_snapshot: string | null;
          client_id: string;
          client_name_snapshot: string | null;
          company_address_snapshot: string | null;
          company_id: string;
          company_name_snapshot: string | null;
          company_vat_snapshot: string | null;
          created_at: string;
          currency: string;
          due_date: string;
          gross_total: number;
          id: string;
          invoice_number: string;
          issue_date: string;
          issued_by: string | null;
          net_total: number;
          payment_terms: string | null;
          pdf_url: string | null;
          po_reference: string | null;
          prepared_by: string | null;
          service_period_end: string | null;
          service_period_start: string | null;
          status: string;
          updated_at: string;
          vat_total: number;
          version: number;
          void_reason: string | null;
          voided_at: string | null;
          voided_by: string | null;
        };
        Insert: {
          amount_paid?: number;
          approved_by?: string | null;
          balance_due?: number | null;
          billing_run_id?: string | null;
          client_address_snapshot?: string | null;
          client_email_snapshot?: string | null;
          client_id: string;
          client_name_snapshot?: string | null;
          company_address_snapshot?: string | null;
          company_id: string;
          company_name_snapshot?: string | null;
          company_vat_snapshot?: string | null;
          created_at?: string;
          currency?: string;
          due_date: string;
          gross_total?: number;
          id?: string;
          invoice_number: string;
          issue_date: string;
          issued_by?: string | null;
          net_total?: number;
          payment_terms?: string | null;
          pdf_url?: string | null;
          po_reference?: string | null;
          prepared_by?: string | null;
          service_period_end?: string | null;
          service_period_start?: string | null;
          status?: string;
          updated_at?: string;
          vat_total?: number;
          version?: number;
          void_reason?: string | null;
          voided_at?: string | null;
          voided_by?: string | null;
        };
        Update: {
          amount_paid?: number;
          approved_by?: string | null;
          balance_due?: number | null;
          billing_run_id?: string | null;
          client_address_snapshot?: string | null;
          client_email_snapshot?: string | null;
          client_id?: string;
          client_name_snapshot?: string | null;
          company_address_snapshot?: string | null;
          company_id?: string;
          company_name_snapshot?: string | null;
          company_vat_snapshot?: string | null;
          created_at?: string;
          currency?: string;
          due_date?: string;
          gross_total?: number;
          id?: string;
          invoice_number?: string;
          issue_date?: string;
          issued_by?: string | null;
          net_total?: number;
          payment_terms?: string | null;
          pdf_url?: string | null;
          po_reference?: string | null;
          prepared_by?: string | null;
          service_period_end?: string | null;
          service_period_start?: string | null;
          status?: string;
          updated_at?: string;
          vat_total?: number;
          version?: number;
          void_reason?: string | null;
          voided_at?: string | null;
          voided_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_invoices_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_invoices_billing_run_id_fkey";
            columns: ["billing_run_id"];
            isOneToOne: false;
            referencedRelation: "billing_runs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_invoices_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_invoices_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_invoices_issued_by_fkey";
            columns: ["issued_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_invoices_prepared_by_fkey";
            columns: ["prepared_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_invoices_voided_by_fkey";
            columns: ["voided_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      billing_run_lines: {
        Row: {
          adjustment_amount: number | null;
          adjustment_reason: string | null;
          billing_run_id: string;
          calculation_trace: Json | null;
          client_id: string;
          company_id: string;
          created_at: string;
          description: string;
          id: string;
          net_amount: number;
          quantity: number;
          rate_card_id: string | null;
          rate_version: number | null;
          service_date: string;
          site_id: string | null;
          total_amount: number;
          unit_rate: number;
          vat_amount: number | null;
          vat_rate: number | null;
          work_record_id: string | null;
        };
        Insert: {
          adjustment_amount?: number | null;
          adjustment_reason?: string | null;
          billing_run_id: string;
          calculation_trace?: Json | null;
          client_id: string;
          company_id: string;
          created_at?: string;
          description: string;
          id?: string;
          net_amount: number;
          quantity: number;
          rate_card_id?: string | null;
          rate_version?: number | null;
          service_date: string;
          site_id?: string | null;
          total_amount: number;
          unit_rate: number;
          vat_amount?: number | null;
          vat_rate?: number | null;
          work_record_id?: string | null;
        };
        Update: {
          adjustment_amount?: number | null;
          adjustment_reason?: string | null;
          billing_run_id?: string;
          calculation_trace?: Json | null;
          client_id?: string;
          company_id?: string;
          created_at?: string;
          description?: string;
          id?: string;
          net_amount?: number;
          quantity?: number;
          rate_card_id?: string | null;
          rate_version?: number | null;
          service_date?: string;
          site_id?: string | null;
          total_amount?: number;
          unit_rate?: number;
          vat_amount?: number | null;
          vat_rate?: number | null;
          work_record_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "billing_run_lines_billing_run_id_fkey";
            columns: ["billing_run_id"];
            isOneToOne: false;
            referencedRelation: "billing_runs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "billing_run_lines_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "billing_run_lines_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "billing_run_lines_rate_card_id_fkey";
            columns: ["rate_card_id"];
            isOneToOne: false;
            referencedRelation: "client_charge_rates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "billing_run_lines_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "billing_run_lines_work_record_id_fkey";
            columns: ["work_record_id"];
            isOneToOne: false;
            referencedRelation: "finance_work_records";
            referencedColumns: ["id"];
          },
        ];
      };
      client_payments: {
        Row: {
          amount: number;
          client_id: string;
          company_id: string;
          created_at: string;
          currency: string;
          external_id: string | null;
          id: string;
          method: string | null;
          payment_date: string;
          payment_reference: string | null;
          recorded_by: string | null;
          source: string | null;
          status: string;
          unallocated_amount: number;
          updated_at: string;
          verified_by: string | null;
        };
        Insert: {
          amount: number;
          client_id: string;
          company_id: string;
          created_at?: string;
          currency?: string;
          external_id?: string | null;
          id?: string;
          method?: string | null;
          payment_date: string;
          payment_reference?: string | null;
          recorded_by?: string | null;
          source?: string | null;
          status?: string;
          unallocated_amount?: number;
          updated_at?: string;
          verified_by?: string | null;
        };
        Update: {
          amount?: number;
          client_id?: string;
          company_id?: string;
          created_at?: string;
          currency?: string;
          external_id?: string | null;
          id?: string;
          method?: string | null;
          payment_date?: string;
          payment_reference?: string | null;
          recorded_by?: string | null;
          source?: string | null;
          status?: string;
          unallocated_amount?: number;
          updated_at?: string;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_payments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_payments_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_payments_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_payments_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_allocations: {
        Row: {
          allocated_by: string | null;
          amount: number;
          company_id: string;
          created_at: string;
          id: string;
          invoice_id: string;
          payment_id: string;
        };
        Insert: {
          allocated_by?: string | null;
          amount: number;
          company_id: string;
          created_at?: string;
          id?: string;
          invoice_id: string;
          payment_id: string;
        };
        Update: {
          allocated_by?: string | null;
          amount?: number;
          company_id?: string;
          created_at?: string;
          id?: string;
          invoice_id?: string;
          payment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_allocations_allocated_by_fkey";
            columns: ["allocated_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_allocations_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_allocations_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "client_invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "client_payments";
            referencedColumns: ["id"];
          },
        ];
      };
      client_invoice_disputes: {
        Row: {
          assigned_to: string | null;
          client_id: string;
          client_visible_response: string | null;
          company_id: string;
          created_at: string;
          disputed_amount: number | null;
          evidence_url: string | null;
          id: string;
          internal_notes: string | null;
          invoice_id: string;
          line_id: string | null;
          reason: string;
          resolved_at: string | null;
          resolved_by: string | null;
          status: string;
          submitted_by: string;
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          client_id: string;
          client_visible_response?: string | null;
          company_id: string;
          created_at?: string;
          disputed_amount?: number | null;
          evidence_url?: string | null;
          id?: string;
          internal_notes?: string | null;
          invoice_id: string;
          line_id?: string | null;
          reason: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string;
          submitted_by: string;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          client_id?: string;
          client_visible_response?: string | null;
          company_id?: string;
          created_at?: string;
          disputed_amount?: number | null;
          evidence_url?: string | null;
          id?: string;
          internal_notes?: string | null;
          invoice_id?: string;
          line_id?: string | null;
          reason?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string;
          submitted_by?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_invoice_disputes_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_invoice_disputes_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_invoice_disputes_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_invoice_disputes_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "client_invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_invoice_disputes_line_id_fkey";
            columns: ["line_id"];
            isOneToOne: false;
            referencedRelation: "billing_run_lines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_invoice_disputes_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_invoice_disputes_submitted_by_fkey";
            columns: ["submitted_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      service_requests: {
        Row: {
          assigned_to: string | null;
          attachment_paths: string[] | null;
          client_id: string;
          closed_at: string | null;
          company_id: string;
          created_at: string | null;
          description: string;
          id: string;
          internal_notes: string | null;
          priority: string | null;
          request_type: string;
          requested_dates: Json | null;
          requester_id: string;
          resolution: string | null;
          site_id: string | null;
          sla_due_at: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          attachment_paths?: string[] | null;
          client_id: string;
          closed_at?: string | null;
          company_id: string;
          created_at?: string | null;
          description: string;
          id?: string;
          internal_notes?: string | null;
          priority?: string | null;
          request_type: string;
          requested_dates?: Json | null;
          requester_id: string;
          resolution?: string | null;
          site_id?: string | null;
          sla_due_at?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          attachment_paths?: string[] | null;
          client_id?: string;
          closed_at?: string | null;
          company_id?: string;
          created_at?: string | null;
          description?: string;
          id?: string;
          internal_notes?: string | null;
          priority?: string | null;
          request_type?: string;
          requested_dates?: Json | null;
          requester_id?: string;
          resolution?: string | null;
          site_id?: string | null;
          sla_due_at?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_requests_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
        ];
      };
      training_completions: {
        Row: {
          attempts: number | null;
          certificate_url: string | null;
          company_id: string;
          completed_at: string | null;
          created_at: string | null;
          expires_at: string | null;
          guard_id: string;
          id: string;
          module_id: string;
          passed: boolean | null;
          score: number | null;
          started_at: string | null;
        };
        Insert: {
          attempts?: number | null;
          certificate_url?: string | null;
          company_id: string;
          completed_at?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          guard_id: string;
          id?: string;
          module_id: string;
          passed?: boolean | null;
          score?: number | null;
          started_at?: string | null;
        };
        Update: {
          attempts?: number | null;
          certificate_url?: string | null;
          company_id?: string;
          completed_at?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          guard_id?: string;
          id?: string;
          module_id?: string;
          passed?: boolean | null;
          score?: number | null;
          started_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "training_completions_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "training_completions_guard_id_fkey";
            columns: ["guard_id"];
            isOneToOne: false;
            referencedRelation: "guards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "training_completions_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "training_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      training_modules: {
        Row: {
          active: boolean | null;
          category: string | null;
          company_id: string | null;
          content_type: string | null;
          content_url: string | null;
          created_at: string | null;
          description: string | null;
          duration_minutes: number | null;
          id: string;
          is_mandatory: boolean | null;
          mandatory_for_roles: string[] | null;
          pass_score: number | null;
          quiz_questions: Json | null;
          title: string;
        };
        Insert: {
          active?: boolean | null;
          category?: string | null;
          company_id?: string | null;
          content_type?: string | null;
          content_url?: string | null;
          created_at?: string | null;
          description?: string | null;
          duration_minutes?: number | null;
          id?: string;
          is_mandatory?: boolean | null;
          mandatory_for_roles?: string[] | null;
          pass_score?: number | null;
          quiz_questions?: Json | null;
          title: string;
        };
        Update: {
          active?: boolean | null;
          category?: string | null;
          company_id?: string | null;
          content_type?: string | null;
          content_url?: string | null;
          created_at?: string | null;
          description?: string | null;
          duration_minutes?: number | null;
          id?: string;
          is_mandatory?: boolean | null;
          mandatory_for_roles?: string[] | null;
          pass_score?: number | null;
          quiz_questions?: Json | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "training_modules_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      compliance_documents: {
        Row: {
          company_id: string;
          created_at: string | null;
          document_title: string;
          document_type: string;
          entity_id: string;
          entity_type: string;
          expiry_date: string | null;
          file_name: string | null;
          file_size: number | null;
          file_type: string | null;
          file_url: string | null;
          id: string;
          issue_date: string | null;
          rejection_reason: string | null;
          review_status: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string | null;
          updated_at: string | null;
          uploaded_by: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          document_title: string;
          document_type: string;
          entity_id: string;
          entity_type: string;
          expiry_date?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          file_url?: string | null;
          id?: string;
          issue_date?: string | null;
          rejection_reason?: string | null;
          review_status?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string | null;
          updated_at?: string | null;
          uploaded_by?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          document_title?: string;
          document_type?: string;
          entity_id?: string;
          entity_type?: string;
          expiry_date?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          file_url?: string | null;
          id?: string;
          issue_date?: string | null;
          rejection_reason?: string | null;
          review_status?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string | null;
          updated_at?: string | null;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "compliance_documents_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      incident_comments: {
        Row: {
          comment: string;
          created_at: string | null;
          id: string;
          incident_id: string;
          user_id: string;
        };
        Insert: {
          comment: string;
          created_at?: string | null;
          id?: string;
          incident_id: string;
          user_id: string;
        };
        Update: {
          comment?: string;
          created_at?: string | null;
          id?: string;
          incident_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "incident_comments_incident_id_fkey";
            columns: ["incident_id"];
            isOneToOne: false;
            referencedRelation: "incidents";
            referencedColumns: ["id"];
          },
        ];
      };
      incident_media: {
        Row: {
          client_visible: boolean | null;
          created_at: string | null;
          file_url: string;
          filename: string | null;
          id: string;
          incident_id: string;
          media_type: string;
          storage_path: string | null;
          uploaded_by: string | null;
        };
        Insert: {
          client_visible?: boolean | null;
          created_at?: string | null;
          file_url: string;
          filename?: string | null;
          id?: string;
          incident_id: string;
          media_type: string;
          storage_path?: string | null;
          uploaded_by?: string | null;
        };
        Update: {
          client_visible?: boolean | null;
          created_at?: string | null;
          file_url?: string;
          filename?: string | null;
          id?: string;
          incident_id?: string;
          media_type?: string;
          storage_path?: string | null;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "incident_media_incident_id_fkey";
            columns: ["incident_id"];
            isOneToOne: false;
            referencedRelation: "incidents";
            referencedColumns: ["id"];
          },
        ];
      };
      incident_timeline: {
        Row: {
          actor_user_id: string;
          created_at: string | null;
          event_type: string;
          id: string;
          incident_id: string;
          metadata: Json | null;
        };
        Insert: {
          actor_user_id: string;
          created_at?: string | null;
          event_type: string;
          id?: string;
          incident_id: string;
          metadata?: Json | null;
        };
        Update: {
          actor_user_id?: string;
          created_at?: string | null;
          event_type?: string;
          id?: string;
          incident_id?: string;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "incident_timeline_incident_id_fkey";
            columns: ["incident_id"];
            isOneToOne: false;
            referencedRelation: "incidents";
            referencedColumns: ["id"];
          },
        ];
      };
      incidents: {
        Row: {
          ai_rewritten_report: string | null;
          attendance_log_id: string | null;
          client_visible: boolean | null;
          company_id: string | null;
          created_at: string | null;
          description: string | null;
          follow_up_status: string | null;
          gps_latitude: number | null;
          gps_longitude: number | null;
          guard_id: string | null;
          id: string;
          incident_number: string | null;
          incident_type: string | null;
          linked_evidence_count: number | null;
          location: string | null;
          occurred_at: string | null;
          pdf_report_id: string | null;
          reported_at: string | null;
          requires_follow_up: boolean | null;
          resolved_at: string | null;
          severity: string | null;
          shift_id: string | null;
          site_id: string | null;
          status: string | null;
          title: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          ai_rewritten_report?: string | null;
          attendance_log_id?: string | null;
          client_visible?: boolean | null;
          company_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          follow_up_status?: string | null;
          gps_latitude?: number | null;
          gps_longitude?: number | null;
          guard_id?: string | null;
          id?: string;
          incident_number?: string | null;
          incident_type?: string | null;
          linked_evidence_count?: number | null;
          location?: string | null;
          occurred_at?: string | null;
          pdf_report_id?: string | null;
          reported_at?: string | null;
          requires_follow_up?: boolean | null;
          resolved_at?: string | null;
          severity?: string | null;
          shift_id?: string | null;
          site_id?: string | null;
          status?: string | null;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          ai_rewritten_report?: string | null;
          attendance_log_id?: string | null;
          client_visible?: boolean | null;
          company_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          follow_up_status?: string | null;
          gps_latitude?: number | null;
          gps_longitude?: number | null;
          guard_id?: string | null;
          id?: string;
          incident_number?: string | null;
          incident_type?: string | null;
          linked_evidence_count?: number | null;
          location?: string | null;
          occurred_at?: string | null;
          pdf_report_id?: string | null;
          reported_at?: string | null;
          requires_follow_up?: boolean | null;
          resolved_at?: string | null;
          severity?: string | null;
          shift_id?: string | null;
          site_id?: string | null;
          status?: string | null;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "incidents_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incidents_guard_id_fkey";
            columns: ["guard_id"];
            isOneToOne: false;
            referencedRelation: "guards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incidents_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          company_id: string | null;
          created_at: string | null;
          email: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          phone: string | null;
          role: string;
          status: string | null;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          phone?: string | null;
          role: string;
          status?: string | null;
        };
        Update: {
          company_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          phone?: string | null;
          role?: string;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance_logs: {
        Row: {
          clock_in: string | null;
          clock_in_lat: number | null;
          clock_in_lng: number | null;
          clock_out: string | null;
          clock_out_lat: number | null;
          clock_out_lng: number | null;
          company_id: string | null;
          created_at: string | null;
          guard_id: string | null;
          id: string;
          shift_id: string | null;
        };
        Insert: {
          clock_in?: string | null;
          clock_in_lat?: number | null;
          clock_in_lng?: number | null;
          clock_out?: string | null;
          clock_out_lat?: number | null;
          clock_out_lng?: number | null;
          company_id?: string | null;
          created_at?: string | null;
          guard_id?: string | null;
          id?: string;
          shift_id?: string | null;
        };
        Update: {
          clock_in?: string | null;
          clock_in_lat?: number | null;
          clock_in_lng?: number | null;
          clock_out?: string | null;
          clock_out_lat?: number | null;
          clock_out_lng?: number | null;
          company_id?: string | null;
          created_at?: string | null;
          guard_id?: string | null;
          id?: string;
          shift_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_logs_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_logs_guard_id_fkey";
            columns: ["guard_id"];
            isOneToOne: false;
            referencedRelation: "guards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_logs_shift_id_fkey";
            columns: ["shift_id"];
            isOneToOne: false;
            referencedRelation: "shifts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_logs_shift_id_fkey";
            columns: ["shift_id"];
            isOneToOne: false;
            referencedRelation: "site_weekly_guard_cards";
            referencedColumns: ["shift_id"];
          },
        ];
      };
      occurrence_books: {
        Row: {
          ai_summary: string | null;
          attendance_log_id: string | null;
          client_visible: boolean | null;
          company_id: string | null;
          created_at: string | null;
          edited_at: string | null;
          entry: string;
          entry_type: string | null;
          guard_id: string | null;
          id: string;
          occurred_at: string | null;
          shift_id: string | null;
          site_id: string | null;
          title: string | null;
          visibility: string | null;
        };
        Insert: {
          ai_summary?: string | null;
          attendance_log_id?: string | null;
          client_visible?: boolean | null;
          company_id?: string | null;
          created_at?: string | null;
          edited_at?: string | null;
          entry: string;
          entry_type?: string | null;
          guard_id?: string | null;
          id?: string;
          occurred_at?: string | null;
          shift_id?: string | null;
          site_id?: string | null;
          title?: string | null;
          visibility?: string | null;
        };
        Update: {
          ai_summary?: string | null;
          attendance_log_id?: string | null;
          client_visible?: boolean | null;
          company_id?: string | null;
          created_at?: string | null;
          edited_at?: string | null;
          entry?: string;
          entry_type?: string | null;
          guard_id?: string | null;
          id?: string;
          occurred_at?: string | null;
          shift_id?: string | null;
          site_id?: string | null;
          title?: string | null;
          visibility?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "occurrence_books_attendance_log_id_fkey";
            columns: ["attendance_log_id"];
            isOneToOne: false;
            referencedRelation: "attendance_logs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "occurrence_books_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "occurrence_books_guard_id_fkey";
            columns: ["guard_id"];
            isOneToOne: false;
            referencedRelation: "guards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "occurrence_books_shift_id_fkey";
            columns: ["shift_id"];
            isOneToOne: false;
            referencedRelation: "shifts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "occurrence_books_shift_id_fkey";
            columns: ["shift_id"];
            isOneToOne: false;
            referencedRelation: "site_weekly_guard_cards";
            referencedColumns: ["shift_id"];
          },
          {
            foreignKeyName: "occurrence_books_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
        ];
      };
      rota_published_weeks: {
        Row: {
          company_id: string;
          id: string;
          published_at: string | null;
          published_by: string | null;
          unpublished_at: string | null;
          unpublished_by: string | null;
          week_start: string;
        };
        Insert: {
          company_id: string;
          id?: string;
          published_at?: string | null;
          published_by?: string | null;
          unpublished_at?: string | null;
          unpublished_by?: string | null;
          week_start: string;
        };
        Update: {
          company_id?: string;
          id?: string;
          published_at?: string | null;
          published_by?: string | null;
          unpublished_at?: string | null;
          unpublished_by?: string | null;
          week_start?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rota_published_weeks_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };

      service_request_events: {
        Row: {
          id: string;
          company_id: string;
          request_id: string;
          actor_id: string | null;
          event_type: string;
          body: string | null;
          attachment_path: string | null;
          attachment_name: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      shift_history: {
        Row: {
          id: string;
          company_id: string;
          shift_id: string;
          actor_id: string | null;
          event_type: string;
          changes: Json;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      shift_acknowledgements: {
        Row: {
          id: string;
          company_id: string;
          shift_id: string;
          guard_id: string;
          acknowledged_at: string;
        };
        Insert: { company_id: string; shift_id: string; guard_id: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      client_invoice_queries: {
        Args: { p_invoice_id: string; p_reason?: string | null };
        Returns: Json;
      };
      client_service_request_action: {
        Args: {
          p_request_id: string;
          p_action: string;
          p_body?: string | null;
          p_attachment_path?: string | null;
          p_attachment_name?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};
