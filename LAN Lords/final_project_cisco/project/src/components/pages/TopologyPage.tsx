import React from 'react';
import TopologyMap from '../TopologyMap';
import NetworkStats from '../NetworkStats';

const TopologyPage: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Network Statistics */}
      <div className="col-span-12">
        <NetworkStats />
      </div>
      
      {/* Network Topology Map */}
      <div className="col-span-12">
        <TopologyMap />
      </div>
    </div>
  );
};

export default TopologyPage;