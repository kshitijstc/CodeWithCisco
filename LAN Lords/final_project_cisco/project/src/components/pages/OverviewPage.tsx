import React from 'react';
import HeroPanel from '../HeroPanel';
import RealTimeChartsPanel from '../RealTimeChartsPanel';
import AnomalyControls from '../AnomalyControls';
import CopilotPanel from '../CopilotPanel';

const OverviewPage: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Network Health Overview */}
      <div className="col-span-12">
        <HeroPanel />
      </div>
      
      {/* Real-time Charts - 4 separate charts */}
      <div className="col-span-12">
        <RealTimeChartsPanel />
      </div>
      
      {/* Anomaly Controls and AI Co-pilot */}
      <div className="col-span-12 lg:col-span-4">
        <AnomalyControls />
      </div>
      
      <div className="col-span-12 lg:col-span-8">
        <CopilotPanel />
      </div>
    </div>
  );
};

export default OverviewPage;