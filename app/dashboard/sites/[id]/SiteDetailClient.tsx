'use client';

import { useState } from 'react';
import Link from 'next/link';
import StatusSummary from './StatusSummary';
import RecentCheckIns from './RecentCheckIns';
import SiteCards from './SiteCards';
import ActiveAlerts from './ActiveAlerts';
import GuardsOnDuty from './GuardsOnDuty';
import SiteInfoModal from './SiteInfoModal';
import NoticeWidget from './notices/components/NoticeWidget';

export default function SiteDetailClient({ siteId }: { siteId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const openModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
  };

  return (
    <div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="grid grid-cols-4 gap-6">
          {/* Left Column - Status Summary */}
          <div className="col-span-1 space-y-6">
            <StatusSummary siteId={siteId} />
            <RecentCheckIns siteId={siteId} />
          </div>

          {/* Center Column - Site Cards */}
          <div className="col-span-2">
            <SiteCards siteId={siteId} />
          </div>

          {/* Right Column - Guards and Alerts */}
          <div className="col-span-1 space-y-6">
            <GuardsOnDuty onOpenModal={openModal} siteId={siteId} />
            <NoticeWidget siteId={siteId} siteName="" />
            <ActiveAlerts siteId={siteId} />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SiteInfoModal 
          type={modalType} 
          onClose={closeModal} 
          siteId={siteId}
        />
      )}
    </div>
  );
}
