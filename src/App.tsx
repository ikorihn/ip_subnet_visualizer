import { useMemo, useState } from 'react';
import { SubnetDetails } from './components/SubnetDetails';
import { SubnetInput } from './components/SubnetInput';
import { SubnetList } from './components/SubnetList';
import { SubnetVisualizer } from './components/SubnetVisualizer';
import { UnusedRanges } from './components/UnusedRanges';
import type { Subnet } from './types/subnet';
import { calculateUnusedRanges, detectConflicts } from './utils/ipCalculator';

function App() {
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);

  const conflicts = useMemo(() => {
    return detectConflicts(subnets);
  }, [subnets]);

  const unusedRanges = useMemo(() => {
    return calculateUnusedRanges(subnets);
  }, [subnets]);

  const handleAddSubnet = (subnet: Subnet) => {
    setSubnets((prev) => [...prev, subnet]);
  };

  const handleRemoveSubnet = (id: string) => {
    setSubnets((prev) => prev.filter((subnet) => subnet.id !== id));
    if (selectedSubnet?.id === id) {
      setSelectedSubnet(null);
    }
  };

  const handleSelectSubnet = (subnet: Subnet | null) => {
    setSelectedSubnet(subnet);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8 text-center shadow-lg">
        <h1 className="text-4xl font-bold mb-2">IP Subnet Visualizer</h1>
        <p className="text-lg opacity-90">
          Enter subnets in CIDR notation to visualize IP address space
        </p>
      </header>

      <main className="flex-1 max-w-7xl mx-auto p-8 w-full">
        <section className="mb-8">
          <SubnetInput
            onAddSubnet={handleAddSubnet}
            existingSubnets={subnets}
          />
        </section>

        <section className="mb-8">
          <SubnetVisualizer
            subnets={subnets}
            conflicts={conflicts}
            onSelectSubnet={handleSelectSubnet}
            selectedSubnet={selectedSubnet}
          />
          <UnusedRanges unusedRanges={unusedRanges} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <SubnetList
              subnets={subnets}
              onRemoveSubnet={handleRemoveSubnet}
              onSelectSubnet={handleSelectSubnet}
              selectedSubnet={selectedSubnet}
            />
          </div>

          <div>
            <SubnetDetails subnet={selectedSubnet} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
