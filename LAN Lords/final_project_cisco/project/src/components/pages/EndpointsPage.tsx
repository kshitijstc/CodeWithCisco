import React from 'react';
import EndpointProfilesPanel from '../EndpointProfilesPanel';
import RemediationPanel from '../RemediationPanel';
import ActionCenter from '../ActionCenter';

const EndpointsPage: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Endpoint Profiles */}
      <div className="col-span-12 lg:col-span-6">
        <EndpointProfilesPanel />
      </div>
      
      {/* Automated Remediation */}
      <div className="col-span-12 lg:col-span-6">
        <RemediationPanel />
      </div>
      
      {/* Action Center */}
      <div className="col-span-12">
        <ActionCenter />
      </div>
    </div>
  );
};

export default EndpointsPage;