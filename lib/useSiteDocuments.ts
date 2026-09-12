'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface SiteDocument {
  id: string;
  file_name: string;
  file_type: string;
  document_category: string;
  storage_path: string;
  file_size: number;
  upload_date: string;
}

export interface ComplianceDocument {
  id: string;
  document_type: string;
  document_title: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  issue_date: string | null;
  expiry_date: string | null;
  status: string;
}

export interface SiteDocumentsData {
  clientDocs: SiteDocument[];
  complianceDocs: ComplianceDocument[];
}

export function useSiteDocuments(siteId: string, companyId: string | null, clientId: string | null, enabled: boolean) {
  const [data, setData] = useState<SiteDocumentsData>({
    clientDocs: [],
    complianceDocs: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!siteId || !companyId) {
      setLoading(false);
      return;
    }

    try {
      const queries: Promise<any>[] = [
        supabase
          .from('client_documents')
          .select('id, file_name, file_type, document_category, storage_path, file_size, upload_date')
          .eq('site_id', siteId)
          .order('upload_date', { ascending: false })
          .limit(20),
      ];

      if (clientId) {
        queries.push(
          supabase
            .from('client_documents')
            .select('id, file_name, file_type, document_category, storage_path, file_size, upload_date')
            .eq('client_id', clientId)
            .is('site_id', null)
            .order('upload_date', { ascending: false })
            .limit(10)
        );
      }

      queries.push(
        supabase
          .from('compliance_documents')
          .select('id, document_type, document_title, file_url, file_name, file_type, file_size, issue_date, expiry_date, status')
          .eq('company_id', companyId)
          .eq('entity_type', 'site')
          .eq('entity_id', siteId)
          .order('created_at', { ascending: false })
          .limit(30)
      );

      const results = await Promise.allSettled(queries);

      let clientDocs: SiteDocument[] = [];
      let complianceDocs: ComplianceDocument[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && !result.value.error) {
          const docs = (result.value.data || []) as any[];
          if (index <= 1) {
            clientDocs = clientDocs.concat(docs.map((d: any) => ({
              id: d.id,
              file_name: d.file_name,
              file_type: d.file_type,
              document_category: d.document_category,
              storage_path: d.storage_path,
              file_size: d.file_size,
              upload_date: d.upload_date,
            })));
          } else {
            complianceDocs = docs.map((d: any) => ({
              id: d.id,
              document_type: d.document_type,
              document_title: d.document_title,
              file_url: d.file_url,
              file_name: d.file_name,
              file_type: d.file_type,
              file_size: d.file_size,
              issue_date: d.issue_date,
              expiry_date: d.expiry_date,
              status: d.status,
            }));
          }
        }
      });

      clientDocs.sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime());

      setData({ clientDocs, complianceDocs });
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [siteId, companyId, clientId]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    fetchDocuments();
  }, [enabled, fetchDocuments]);

  return { ...data, loading, error, refresh: fetchDocuments };
}