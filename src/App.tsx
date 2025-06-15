import { useMemo, useState } from 'react';
import { SubnetDetails } from './components/SubnetDetails';
import { SubnetInput } from './components/SubnetInput';
import { SubnetList } from './components/SubnetList';
import { SubnetVisualizer } from './components/SubnetVisualizer';
import type { Subnet } from './types/subnet';
import { IPCalculator } from './utils/ipCalculator';
import './App.css';

function App() {
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);

  const conflicts = useMemo(() => {
    return IPCalculator.detectConflicts(subnets);
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
    <div className="app">
      <header className="app-header">
        <h1>IP サブネット可視化ツール</h1>
        <p>
          CIDR記法でサブネットを入力して、IPアドレス空間を視覚的に確認できます
        </p>
      </header>

      <main className="app-main">
        <section className="input-section">
          <SubnetInput
            onAddSubnet={handleAddSubnet}
            existingSubnets={subnets}
          />
        </section>

        <section className="visualization-section">
          <SubnetVisualizer
            subnets={subnets}
            conflicts={conflicts}
            onSelectSubnet={handleSelectSubnet}
            selectedSubnet={selectedSubnet}
          />
        </section>

        <div className="details-section">
          <div className="subnet-list-container">
            <SubnetList
              subnets={subnets}
              onRemoveSubnet={handleRemoveSubnet}
              onSelectSubnet={handleSelectSubnet}
              selectedSubnet={selectedSubnet}
            />
          </div>

          <div className="subnet-details-container">
            <SubnetDetails subnet={selectedSubnet} />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2024 IP サブネット可視化ツール</p>
      </footer>
    </div>
  );
}

export default App;
