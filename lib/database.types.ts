export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          subscription_plan: string | null
          contact_email: string | null
          phone: string | null
          address: string | null
          created_at: string | null
          brand_color: string | null
          company_size: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_billing: string | null
          subscription_period_end: string | null
          subscription_cancel_at: string | null
          created_by: string | null
          account_status: string | null
          onboarding_status: string | null
          trial_ends_at: string | null
          suspended_at: string | null
          cancelled_at: string | null
          archived_at: string | null
          plan_name: string | null
          brand_color_secondary: string | null
          brand_font: string | null
          favicon_url: string | null
          portal_domain: string | null
          portal_welcome_message: string | null
          portal_footer_text: string | null
          report_header_html: string | null
          report_footer_html: string | null
          email_from_name: string | null
          email_reply_to: string | null
          branding_updated_at: string | null
          city: string | null
          postal_code: string | null
          country: string | null
          vat_number: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['companies']['Row']>
        Update: Partial<Database['public']['Tables']['companies']['Row']>
      }
      users: {
        Row: {
          id: string
          company_id: string | null
          role: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          status: string | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['users']['Row']>
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      sites: {
        Row: {
          id: string
          company_id: string | null
          client_name: string | null
          site_name: string
          address: string | null
          latitude: number | null
          longitude: number | null
          risk_level: string | null
          check_call_interval: number | null
          created_at: string | null
          client_logo_url: string | null
          client_contact_email: string | null
          client_contact_name: string | null
          assignment_instructions: string | null
          site_contact_phone: string | null
          client_id: string | null
          required_skills: string[] | null
          preferred_guard_ids: string[] | null
          banned_guard_ids: string[] | null
          region: string | null
          site_contact_name: string | null
          site_contact_email: string | null
          emergency_contact: string | null
          patrol_enabled: boolean | null
          patrol_interval: number | null
          site_type: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          primary_contact_email: string | null
          operating_hours: Record<string, unknown> | null
          security_requirements: Record<string, unknown> | null
          patrol_settings: Record<string, unknown> | null
          compliance_settings: Record<string, unknown> | null
          setup_completed: boolean | null
          setup_completed_at: string | null
          created_by: string | null
          postcode: string | null
          status: string | null
          emergency_procedures: string | null
          access_instructions: string | null
          keyholding_notes: string | null
          alarm_response: string | null
          site_rules: string | null
          updated_by: string | null
        }
        Insert: Partial<Database['public']['Tables']['sites']['Row']>
        Update: Partial<Database['public']['Tables']['sites']['Row']>
      }
      guards: {
        Row: {
          id: string
          user_id: string | null
          company_id: string | null
          sia_licence: string | null
          sia_expiry: string | null
          hourly_rate: number | null
          availability: Record<string, unknown> | null
          skills: string[] | null
          created_at: string | null
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          status: string | null
          address: string | null
          postcode: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          position: string | null
          hire_date: string | null
          salary: number | null
          badge_number: string | null
          certifications: string | null
          medical_conditions: string | null
          reference_1_name: string | null
          reference_1_phone: string | null
          reference_2_name: string | null
          reference_2_phone: string | null
          bank_account: string | null
          sort_code: string | null
          ni_number: string | null
          photo_url: string | null
        }
        Insert: Partial<Database['public']['Tables']['guards']['Row']>
        Update: Partial<Database['public']['Tables']['guards']['Row']>
      }
      shifts: {
        Row: {
          id: string
          company_id: string | null
          site_id: string | null
          guard_id: string | null
          start_time: string
          end_time: string
          status: string | null
          shift_type: string | null
          created_at: string | null
          notes: string | null
          created_by: string | null
        }
        Insert: Partial<Database['public']['Tables']['shifts']['Row']>
        Update: Partial<Database['public']['Tables']['shifts']['Row']>
      }
      incidents: {
        Row: {
          id: string
          company_id: string | null
          site_id: string | null
          guard_id: string | null
          incident_type: string | null
          severity: string | null
          description: string | null
          ai_rewritten_report: string | null
          status: string | null
          created_at: string | null
          occurred_at: string | null
          resolved_at: string | null
          client_visible: boolean | null
          requires_follow_up: boolean | null
          follow_up_status: string | null
          linked_evidence_count: number | null
          shift_id: string | null
          attendance_log_id: string | null
          incident_number: string | null
          location: string | null
          title: string | null
          reported_at: string | null
          updated_at: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          user_id: string | null
          pdf_report_id: string | null
        }
        Insert: Partial<Database['public']['Tables']['incidents']['Row']>
        Update: Partial<Database['public']['Tables']['incidents']['Row']>
      }
      patrol_logs: {
        Row: {
          id: string
          company_id: string | null
          site_id: string | null
          shift_id: string | null
          guard_id: string | null
          start_time: string | null
          end_time: string | null
          status: string | null
          checkpoints_total: number | null
          checkpoints_completed: number | null
          notes: string | null
          created_at: string | null
          gps_verified_count: number | null
          out_of_radius_count: number | null
          needs_review_count: number | null
          missed_checkpoints: number | null
          duration_seconds: number | null
          photo_count: number | null
          comment_count: number | null
          ended_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['patrol_logs']['Row']>
        Update: Partial<Database['public']['Tables']['patrol_logs']['Row']>
      }
      patrol_scans: {
        Row: {
          id: string
          company_id: string | null
          site_id: string | null
          checkpoint_id: string | null
          guard_id: string | null
          rota_id: string | null
          scanned_at: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          gps_accuracy: number | null
          distance_from_checkpoint: number | null
          status: string | null
          device_info: string | null
          notes: string | null
          created_at: string | null
          checkpoint_code: string | null
          user_id: string | null
          shift_id: string | null
          attendance_log_id: string | null
          phone_latitude: number | null
          phone_longitude: number | null
          phone_gps_accuracy_meters: number | null
          approved_latitude: number | null
          approved_longitude: number | null
          gps_verified: boolean | null
          gps_status: string | null
          scan_status: string | null
          device_user_agent: string | null
          ip_address: string | null
          photo_url: string | null
          comment: string | null
          offline_sync_id: string | null
          metadata: Record<string, unknown> | null
          patrol_log_id: string | null
        }
        Insert: Partial<Database['public']['Tables']['patrol_scans']['Row']>
        Update: Partial<Database['public']['Tables']['patrol_scans']['Row']>
      }
      patrol_checkpoints: {
        Row: {
          id: string
          company_id: string | null
          site_id: string | null
          name: string
          description: string | null
          lat: number | null
          lng: number | null
          qr_code: string | null
          order_index: number | null
          created_at: string | null
          checkpoint_code: string | null
          allowed_radius_meters: number | null
          sop_url: string | null
          patrol_time: string | null
          patrol_frequency: string | null
          is_active: boolean | null
          requires_photo: boolean | null
          requires_comment: boolean | null
          location_label: string | null
          approved_latitude: number | null
          approved_longitude: number | null
          approved_gps_accuracy_meters: number | null
          approved_by: string | null
          approved_at: string | null
          gps_capture_status: string | null
          expected_radius_meters: number | null
          updated_at: string | null
          client_id: string | null
        }
        Insert: Partial<Database['public']['Tables']['patrol_checkpoints']['Row']>
        Update: Partial<Database['public']['Tables']['patrol_checkpoints']['Row']>
      }
      evidence_files: {
        Row: {
          id: string
          company_id: string
          file_name: string
          file_url: string
          file_type: string
          file_size_bytes: number | null
          storage_bucket: string | null
          storage_path: string | null
          uploaded_by: string | null
          uploaded_by_guard: string | null
          uploader_name: string | null
          site_id: string | null
          client_id: string | null
          linked_to_incident: boolean | null
          linked_to_patrol: boolean | null
          linked_to_ob: boolean | null
          linked_to_report: boolean | null
          linked_to_maintenance: boolean | null
          linked_to_welfare: boolean | null
          gps_latitude: number | null
          gps_longitude: number | null
          review_status: string
          created_at: string | null
          updated_at: string | null
          incident_id: string | null
        }
        Insert: Partial<Database['public']['Tables']['evidence_files']['Row']>
        Update: Partial<Database['public']['Tables']['evidence_files']['Row']>
      }
      evidence_reviews: {
        Row: {
          id: string
          company_id: string
          evidence_file_id: string
          reviewed_by: string | null
          review_status: string
          review_notes: string | null
          rejection_reason: string | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['evidence_reviews']['Row']>
        Update: Partial<Database['public']['Tables']['evidence_reviews']['Row']>
      }
      evidence_links: {
        Row: {
          id: string
          company_id: string
          evidence_file_id: string
          link_type: string
          linked_record_id: string
          linked_record_type: string
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['evidence_links']['Row']>
        Update: Partial<Database['public']['Tables']['evidence_links']['Row']>
      }
      incident_media: {
        Row: {
          id: string
          incident_id: string
          file_url: string
          media_type: string
          filename: string | null
          uploaded_by: string | null
          created_at: string | null
          client_visible: boolean | null
          storage_path: string | null
        }
        Insert: Partial<Database['public']['Tables']['incident_media']['Row']>
        Update: Partial<Database['public']['Tables']['incident_media']['Row']>
      }
      incident_comments: {
        Row: {
          id: string
          incident_id: string
          user_id: string
          comment: string
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['incident_comments']['Row']>
        Update: Partial<Database['public']['Tables']['incident_comments']['Row']>
      }
      incident_timeline: {
        Row: {
          id: string
          incident_id: string
          actor_user_id: string
          event_type: string
          metadata: Record<string, unknown> | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['incident_timeline']['Row']>
        Update: Partial<Database['public']['Tables']['incident_timeline']['Row']>
      }
      attendance_logs: {
        Row: {
          id: string
          company_id: string | null
          shift_id: string | null
          guard_id: string | null
          clock_in: string | null
          clock_out: string | null
          clock_in_lat: number | null
          clock_in_lng: number | null
          clock_out_lat: number | null
          clock_out_lng: number | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['attendance_logs']['Row']>
        Update: Partial<Database['public']['Tables']['attendance_logs']['Row']>
      }
      occurrence_books: {
        Row: {
          id: string
          company_id: string | null
          site_id: string | null
          guard_id: string | null
          entry: string
          entry_type: string | null
          ai_summary: string | null
          created_at: string | null
          occurred_at: string | null
          edited_at: string | null
          client_visible: boolean | null
          shift_id: string | null
          attendance_log_id: string | null
          title: string | null
          visibility: string | null
        }
        Insert: Partial<Database['public']['Tables']['occurrence_books']['Row']>
        Update: Partial<Database['public']['Tables']['occurrence_books']['Row']>
      }
      lone_worker_sessions: {
        Row: {
          id: string
          guard_id: string
          company_id: string
          site_id: string | null
          shift_id: string | null
          check_in_interval_minutes: number
          session_start: string
          session_end: string | null
          status: string | null
          last_check_in_at: string | null
          next_check_in_due_at: string | null
          total_check_ins: number | null
          missed_check_ins: number | null
          alarm_triggered_at: string | null
          alarm_acknowledged_at: string | null
          alarm_acknowledged_by: string | null
          escalation_level: number | null
          last_lat: number | null
          last_lng: number | null
          notes: string | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['lone_worker_sessions']['Row']>
        Update: Partial<Database['public']['Tables']['lone_worker_sessions']['Row']>
      }
      guard_wellbeing_checkins: {
        Row: {
          id: string
          guard_id: string
          company_id: string
          shift_id: string | null
          site_id: string | null
          stress_score: number | null
          fatigue_score: number | null
          safety_score: number | null
          overall_score: number | null
          concerns: string | null
          flagged_for_review: boolean | null
          reviewed_by: string | null
          reviewed_at: string | null
          manager_notes: string | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['guard_wellbeing_checkins']['Row']>
        Update: Partial<Database['public']['Tables']['guard_wellbeing_checkins']['Row']>
      }
      notifications: {
        Row: {
          id: string
          company_id: string | null
          user_id: string | null
          type: string
          title: string
          body: string | null
          link: string | null
          related_id: string | null
          related_type: string | null
          severity: string | null
          read_at: string | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['notifications']['Row']>
        Update: Partial<Database['public']['Tables']['notifications']['Row']>
      }
      support_tickets: {
        Row: {
          id: string
          company_id: string
          created_by: string
          subject: string
          category: string
          priority: string
          status: string
          affected_site_id: string | null
          affected_user_id: string | null
          description: string
          consent_given: boolean
          assigned_to: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
          first_response_at: string | null
          sla_first_response_due: string | null
          sla_resolution_due: string | null
          sla_first_response_breached: boolean | null
          sla_resolution_breached: boolean | null
          closed_at: string | null
          satisfaction_rating: number | null
        }
        Insert: Partial<Database['public']['Tables']['support_tickets']['Row']>
        Update: Partial<Database['public']['Tables']['support_tickets']['Row']>
      }
      client_messages: {
        Row: {
          id: string
          company_id: string | null
          client_id: string | null
          site_id: string | null
          incident_id: string | null
          from_user_id: string | null
          subject: string | null
          body: string | null
          is_from_client: boolean | null
          status: string | null
          created_at: string | null
          read_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['client_messages']['Row']>
        Update: Partial<Database['public']['Tables']['client_messages']['Row']>
      }
      clients: {
        Row: {
          id: string
          company_id: string | null
          name: string
          contact_person: string | null
          contact_email: string | null
          contact_phone: string | null
          billing_address: string | null
          notes: string | null
          status: string | null
          created_at: string | null
          address: string | null
          email: string | null
          phone: string | null
        }
        Insert: Partial<Database['public']['Tables']['clients']['Row']>
        Update: Partial<Database['public']['Tables']['clients']['Row']>
      }
      client_users: {
        Row: {
          id: string
          user_id: string
          client_id: string
          company_id: string
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['client_users']['Row']>
        Update: Partial<Database['public']['Tables']['client_users']['Row']>
      }
      client_profiles: {
        Row: {
          id: string
          client_id: string
          company_name: string
          trading_name: string | null
          company_registration_number: string | null
          vat_number: string | null
          main_office_address: string | null
          main_contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          emergency_contact_number: string | null
          logo_url: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['client_profiles']['Row']>
        Update: Partial<Database['public']['Tables']['client_profiles']['Row']>
      }
      client_sites: {
        Row: {
          id: string
          client_id: string
          site_name: string
          site_address: string | null
          site_contact_person: string | null
          site_phone: string | null
          client_contact_for_site: string | null
          opening_hours: string | null
          security_cover_hours: string | null
          site_notes: string | null
          site_map_url: string | null
          risk_level: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['client_sites']['Row']>
        Update: Partial<Database['public']['Tables']['client_sites']['Row']>
      }
      client_documents: {
        Row: {
          id: string
          client_id: string
          site_id: string | null
          file_name: string
          file_type: string | null
          document_category: string | null
          storage_path: string
          file_size: number | null
          uploaded_by: string | null
          upload_date: string | null
          is_public: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['client_documents']['Row']>
        Update: Partial<Database['public']['Tables']['client_documents']['Row']>
      }
      client_contacts: {
        Row: {
          id: string
          client_id: string
          site_id: string | null
          name: string
          job_title: string | null
          email: string | null
          phone: string | null
          mobile: string | null
          contact_type: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
          sms_alerts: boolean | null
        }
        Insert: Partial<Database['public']['Tables']['client_contacts']['Row']>
        Update: Partial<Database['public']['Tables']['client_contacts']['Row']>
      }
      site_ai_summaries: {
        Row: {
          id: string
          site_id: string
          client_id: string
          site_overview: string | null
          key_contacts: string | null
          important_procedures: string | null
          risks: string | null
          emergency_notes: string | null
          guard_briefing_summary: string | null
          generated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['site_ai_summaries']['Row']>
        Update: Partial<Database['public']['Tables']['site_ai_summaries']['Row']>
      }
      compliance_documents: {
        Row: {
          id: string
          company_id: string
          entity_type: string
          entity_id: string
          document_type: string
          document_title: string
          file_url: string | null
          file_name: string | null
          file_type: string | null
          file_size: number | null
          issue_date: string | null
          expiry_date: string | null
          status: string | null
          review_status: string | null
          rejection_reason: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          uploaded_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['compliance_documents']['Row']>
        Update: Partial<Database['public']['Tables']['compliance_documents']['Row']>
      }
      guard_certifications: {
        Row: {
          id: string
          guard_id: string
          company_id: string
          cert_type: string
          cert_name: string
          issuing_body: string | null
          certificate_number: string | null
          issue_date: string | null
          expiry_date: string | null
          document_url: string | null
          status: string | null
          reminder_sent_30d: boolean | null
          reminder_sent_90d: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['guard_certifications']['Row']>
        Update: Partial<Database['public']['Tables']['guard_certifications']['Row']>
      }
      guard_vetting_records: {
        Row: {
          id: string
          guard_id: string
          company_id: string
          id_verified: boolean | null
          id_document_type: string | null
          id_document_url: string | null
          id_verified_at: string | null
          id_verified_by: string | null
          rtw_verified: boolean | null
          rtw_document_type: string | null
          rtw_document_url: string | null
          rtw_expiry: string | null
          rtw_verified_at: string | null
          address_history_complete: boolean | null
          address_history_notes: string | null
          dbs_check_type: string | null
          dbs_certificate_number: string | null
          dbs_issue_date: string | null
          dbs_document_url: string | null
          dbs_verified_at: string | null
          employment_history_complete: boolean | null
          employment_gaps_explained: boolean | null
          employment_history_notes: string | null
          reference_1_name: string | null
          reference_1_contact: string | null
          reference_1_verified: boolean | null
          reference_2_name: string | null
          reference_2_contact: string | null
          reference_2_verified: boolean | null
          vetting_status: string | null
          vetting_completed_at: string | null
          vetting_expires_at: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['guard_vetting_records']['Row']>
        Update: Partial<Database['public']['Tables']['guard_vetting_records']['Row']>
      }
      acs_evidence: {
        Row: {
          id: string
          company_id: string
          title: string
          acs_area: string
          acs_criterion: string | null
          category: string | null
          owner: string | null
          file_url: string | null
          file_name: string | null
          file_type: string | null
          file_size: number | null
          review_date: string | null
          expiry_date: string | null
          version: string | null
          status: string | null
          notes: string | null
          uploaded_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['acs_evidence']['Row']>
        Update: Partial<Database['public']['Tables']['acs_evidence']['Row']>
      }
      roles: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          is_system: boolean | null
          is_default: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['roles']['Row']>
        Update: Partial<Database['public']['Tables']['roles']['Row']>
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          company_id: string
          permission_key: string
          level: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['role_permissions']['Row']>
        Update: Partial<Database['public']['Tables']['role_permissions']['Row']>
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          company_id: string
          assigned_at: string | null
          assigned_by: string | null
          is_primary: boolean | null
        }
        Insert: Partial<Database['public']['Tables']['user_roles']['Row']>
        Update: Partial<Database['public']['Tables']['user_roles']['Row']>
      }
      user_site_access: {
        Row: {
          id: string
          user_id: string
          company_id: string
          site_id: string | null
          access_type: string
          region: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['user_site_access']['Row']>
        Update: Partial<Database['public']['Tables']['user_site_access']['Row']>
      }
      permissions: {
        Row: {
          id: string
          key: string
          label: string
          module: string
          icon: string | null
          description: string | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['permissions']['Row']>
        Update: Partial<Database['public']['Tables']['permissions']['Row']>
      }
      company_setup_progress: {
        Row: {
          id: string
          company_id: string
          current_step: number
          company_data: Record<string, unknown> | null
          site_data: Record<string, unknown> | null
          guards_data: Record<string, unknown> | null
          rota_data: Record<string, unknown> | null
          compliance_data: Record<string, unknown> | null
          is_completed: boolean | null
          completed_at: string | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['company_setup_progress']['Row']>
        Update: Partial<Database['public']['Tables']['company_setup_progress']['Row']>
      }
      site_shift_patterns: {
        Row: {
          id: string
          site_id: string
          company_id: string | null
          day_of_week: number
          shift_type: string
          start_time: string
          end_time: string
          guards_required: number
          created_at: string | null
          client_id: string | null
        }
        Insert: Partial<Database['public']['Tables']['site_shift_patterns']['Row']>
        Update: Partial<Database['public']['Tables']['site_shift_patterns']['Row']>
      }
      site_notices: {
        Row: {
          id: string
          site_id: string
          company_id: string | null
          title: string
          body: string
          category: string
          priority: string
          status: string
          pinned: boolean
          created_by: string | null
          created_by_name: string | null
          updated_by: string | null
          updated_by_name: string | null
          expiry_date: string | null
          created_at: string
          updated_at: string
          client_id: string | null
        }
        Insert: Partial<Database['public']['Tables']['site_notices']['Row']>
        Update: Partial<Database['public']['Tables']['site_notices']['Row']>
      }
      site_contacts: {
        Row: {
          id: string
          site_id: string
          company_id: string | null
          client_id: string | null
          contact_type: string
          contact_name: string
          contact_phone: string | null
          contact_email: string | null
          notes: string | null
          is_primary: boolean | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['site_contacts']['Row']>
        Update: Partial<Database['public']['Tables']['site_contacts']['Row']>
      }
      site_risk_scores: {
        Row: {
          id: string
          company_id: string | null
          site_id: string | null
          score: number | null
          level: string | null
          factors: Record<string, unknown> | null
          ai_narrative: string | null
          recommendations: string[] | null
          generated_at: string | null
          period_start: string | null
          period_end: string | null
          acknowledged_recommendations: string[] | null
        }
        Insert: Partial<Database['public']['Tables']['site_risk_scores']['Row']>
        Update: Partial<Database['public']['Tables']['site_risk_scores']['Row']>
      }
      guard_availability: {
        Row: {
          id: string
          guard_id: string | null
          day_of_week: number | null
          start_time: string | null
          end_time: string | null
          is_available: boolean | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['guard_availability']['Row']>
        Update: Partial<Database['public']['Tables']['guard_availability']['Row']>
      }
      guard_time_off: {
        Row: {
          id: string
          guard_id: string | null
          start_date: string | null
          end_date: string | null
          reason: string | null
          approved: boolean | null
          created_at: string | null
          status: string
        }
        Insert: Partial<Database['public']['Tables']['guard_time_off']['Row']>
        Update: Partial<Database['public']['Tables']['guard_time_off']['Row']>
      }
      modules: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          is_enabled: boolean | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['modules']['Row']>
        Update: Partial<Database['public']['Tables']['modules']['Row']>
      }
      company_enabled_modules: {
        Row: {
          id: string
          company_id: string
          module_id: string
          enabled: boolean | null
          enabled_by: string | null
          enabled_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['company_enabled_modules']['Row']>
        Update: Partial<Database['public']['Tables']['company_enabled_modules']['Row']>
      }
      plans: {
        Row: {
          id: string
          name: string
          slug: string
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          max_guards: number | null
          max_sites: number | null
          has_ai_rota: boolean | null
          has_ai_reports: boolean | null
          has_client_portal: boolean | null
          has_patrol_management: boolean | null
          has_gps_tracking: boolean | null
          has_compliance: boolean | null
          has_priority_support: boolean | null
          has_white_label: boolean | null
          has_api_access: boolean | null
          has_dedicated_manager: boolean | null
          has_leave_automation: boolean | null
          max_ai_usage: number | null
          monthly_price: number | null
          yearly_price: number | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
          code: string | null
          description: string | null
          is_contact_only: boolean | null
          is_active: boolean | null
          stripe_product_id: string | null
        }
        Insert: Partial<Database['public']['Tables']['plans']['Row']>
        Update: Partial<Database['public']['Tables']['plans']['Row']>
      }
      plan_features: {
        Row: {
          id: string
          plan_id: string
          feature_key: string
          feature_name: string
          included: boolean | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['plan_features']['Row']>
        Update: Partial<Database['public']['Tables']['plan_features']['Row']>
      }
      guard_templates: {
        Row: {
          id: string
          company_id: string | null
          template_name: string
          template_description: string | null
          position: string | null
          salary: number | null
          certifications: string | null
          medical_conditions: string | null
          default_shift: string | null
          department: string | null
          training_required: string | null
          uniform_required: boolean | null
          background_check_required: boolean | null
          sia_license_required: boolean | null
          minimum_experience: number | null
          skills_required: string | null
          responsibilities: string | null
          work_location: string | null
          benefits: string | null
          contract_type: string | null
          photo_url: string | null
          status: string | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['guard_templates']['Row']>
        Update: Partial<Database['public']['Tables']['guard_templates']['Row']>
      }
      reports: {
        Row: {
          id: string
          company_id: string | null
          site_id: string | null
          title: string | null
          file_url: string | null
          status: string | null
          ai_summary: string | null
          generated_at: string | null
          period_start: string | null
          period_end: string | null
          report_type: string | null
          client_visible: boolean | null
          created_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['reports']['Row']>
        Update: Partial<Database['public']['Tables']['reports']['Row']>
      }
      sop_documents: {
        Row: {
          id: string
          company_id: string | null
          site_id: string | null
          title: string | null
          content: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['sop_documents']['Row']>
        Update: Partial<Database['public']['Tables']['sop_documents']['Row']>
      }
      notification_preferences: {
        Row: {
          id: string
          company_id: string
          email_alerts: boolean | null
          sms_alerts: boolean | null
          push_alerts: boolean | null
          incident_alert: boolean | null
          check_call_alert: boolean | null
          patrol_alert: boolean | null
          billing_alert: boolean | null
          system_alert: boolean | null
        }
        Insert: Partial<Database['public']['Tables']['notification_preferences']['Row']>
        Update: Partial<Database['public']['Tables']['notification_preferences']['Row']>
      }
    }
    Views: {
      v_billing_mrr_current: {
        Row: {
          subscription_billing: string | null
          active_subs: number | null
          trialing_subs: number | null
          at_risk_subs: number | null
        }
      }
      v_billing_revenue_monthly: {
        Row: {
          month: string | null
          gross_pence: number | null
        }
      }
      v_billing_overdue: {
        Row: {
          id: string | null
          name: string | null
        }
      }
      v_billing_tax_monthly: {
        Row: {
          month: string | null
          tax_pence: number | null
        }
      }
    }
    Functions: {
      accept_shift_cover_offer: {
        Args: { offer_id: string }
        Returns: Record<string, unknown>
      }
      decline_shift_cover_offer: {
        Args: { offer_id: string }
        Returns: Record<string, unknown>
      }
      is_super_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      match_sop_chunks: {
        Args: { query_embedding: string; match_count: number; match_threshold: number }
        Returns: unknown[]
      }
      request_shift_leave: {
        Args: { shift_id: string; reason: string }
        Returns: Record<string, unknown>
      }
      sop_daily_queries: {
        Args: { company_id_param: string; days: number }
        Returns: unknown[]
      }
    }
  }
}