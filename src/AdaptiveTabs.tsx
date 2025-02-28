import React, { useState, useRef, useEffect } from 'react';
import { Tabs, Tab, Button, Menu, MenuItem } from '@mui/material';

interface TabItem {
  label: string;
  id: string;
}

interface AdaptiveTabsProps {
  tabs: TabItem[];
}

const AdaptiveTabs: React.FC<AdaptiveTabsProps> = ({ tabs }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visibleTabs, setVisibleTabs] = useState<TabItem[]>(tabs);
  const [hiddenTabs, setHiddenTabs] = useState<TabItem[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]?.id || '');

  const updateTabs = () => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    let availableWidth = containerWidth - 50;
    let tempVisible: TabItem[] = [];
    let tempHidden: TabItem[] = [];

    const tabWidths = tabs.map((tab) => ({
      id: tab.id,
      width: 100,
    }));

    for (let i = 0; i < tabWidths.length; i++) {
      if (availableWidth >= tabWidths[i].width) {
        tempVisible.push(tabs[i]);
        availableWidth -= tabWidths[i].width;
      } else {
        tempHidden = tabs.slice(i);
        break;
      }
    }

    setVisibleTabs(tempVisible);
    setHiddenTabs(tempHidden);
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateTabs);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [tabs]);

  return (
    <div ref={containerRef} style={{ width: '100%', overflow: 'hidden' }}>
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
      >
        {visibleTabs.map((tab) => (
          <Tab key={tab.id} label={tab.label} value={tab.id} />
        ))}
      </Tabs>

      {hiddenTabs.length > 0 && (
        <>
          <Button
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ minWidth: 40, padding: '6px 8px' }}
          >
            More
          </Button>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            {hiddenTabs.map((tab) => (
              <MenuItem key={tab.id} onClick={() => setSelectedTab(tab.id)}>
                {tab.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </div>
  );
};

export default AdaptiveTabs;
