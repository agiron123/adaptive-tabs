import { render, screen, fireEvent } from '@testing-library/react';
import AdaptiveTabs from './AdaptiveTabs';

// Helper to get the Tab element by its text content, then check its aria-selected attribute
const isTabSelected = (tabText: string) => {
  const tabElement = screen.getByText(tabText, { selector: 'button[role="tab"]' });
  return tabElement.getAttribute('aria-selected') === 'true';
};

const isTabNotSelected = (tabText: string) => {
  const tabElement = screen.getByText(tabText, { selector: 'button[role="tab"]' });
  return tabElement.getAttribute('aria-selected') === 'false';
}

describe('AdaptiveTabs', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
    { id: 'tab3', label: 'Tab 3' },
    { id: 'tab4', label: 'Tab 4' },
    { id: 'tab5', label: 'Tab 5' },
  ];

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly with a given set of tabs', () => {
    // For this test, use a subset of tabs that will all be visible
    const currentTestTabs = mockTabs.slice(0, 3);
    // Mock clientWidth to be large enough for all 3 tabs (3 * 100 + 50 for "More" button buffer = 350)
    // No "More" button should appear.
    jest.spyOn(HTMLDivElement.prototype, 'clientWidth', 'get').mockReturnValue(350);
    jest.spyOn(HTMLButtonElement.prototype, 'clientWidth', 'get').mockReturnValue(100); // Used by Mui Tab for its own width calc

    render(<AdaptiveTabs tabs={currentTestTabs} />);

    currentTestTabs.forEach(tab => {
      expect(screen.getByText(tab.label)).toBeInTheDocument();
    });
    expect(screen.queryByText('More')).not.toBeInTheDocument();
  });

  it('shows the "More" button when there is not enough space for all tabs', () => {
    // Container width: 270px. "More" button allowance: 50px. Tab width: 100px.
    // Available for tabs = 270 - 50 = 220px. So, Tab 1, Tab 2 visible. Tab 3, 4, 5 hidden.
    jest.spyOn(HTMLDivElement.prototype, 'clientWidth', 'get').mockReturnValue(270);
    // The component's internal logic uses 100px per tab for calculation.
    // HTMLButtonElement.prototype.clientWidth is not directly used by the updateTabs function,
    // but good to keep for consistency if Mui Tab itself had adaptive width based on label.
    jest.spyOn(HTMLButtonElement.prototype, 'clientWidth', 'get').mockReturnValue(100);


    render(<AdaptiveTabs tabs={mockTabs} />); // 5 tabs total

    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.getByText('Tab 1')).toBeInTheDocument(); // Visible
    expect(screen.getByText('Tab 2')).toBeInTheDocument(); // Visible
    
    // Check that hidden tabs are not rendered as main tabs
    // They will be available in the "More" menu, but not as direct tab buttons.
    expect(screen.queryByText('Tab 3', { selector: 'button[role="tab"]' })).not.toBeInTheDocument();
    expect(screen.queryByText('Tab 4', { selector: 'button[role="tab"]' })).not.toBeInTheDocument();
    expect(screen.queryByText('Tab 5', { selector: 'button[role="tab"]' })).not.toBeInTheDocument();
  });

  it('clicking the "More" button opens a menu with hidden tabs', () => {
    // Container: 270px. Available for tabs: 220px. Tab width 100px.
    // Visible: Tab 1, Tab 2. Hidden: Tab 3, Tab 4, Tab 5.
    jest.spyOn(HTMLDivElement.prototype, 'clientWidth', 'get').mockReturnValue(270);
    jest.spyOn(HTMLButtonElement.prototype, 'clientWidth', 'get').mockReturnValue(100);

    render(<AdaptiveTabs tabs={mockTabs} />);

    // Initially, Tab 1 and Tab 2 are visible as tabs
    expect(screen.getByText('Tab 1', { selector: 'button[role="tab"]' })).toBeInTheDocument();
    expect(screen.getByText('Tab 2', { selector: 'button[role="tab"]' })).toBeInTheDocument();
    // Tab 3, 4, 5 are not visible as tabs
    expect(screen.queryByText('Tab 3', { selector: 'button[role="tab"]' })).not.toBeInTheDocument();
    expect(screen.queryByText('Tab 4', { selector: 'button[role="tab"]' })).not.toBeInTheDocument();
    expect(screen.queryByText('Tab 5', { selector: 'button[role="tab"]' })).not.toBeInTheDocument();

    const moreButton = screen.getByText('More');
    fireEvent.click(moreButton);

    // After clicking "More", the hidden tabs (Tab 3, Tab 4, Tab 5) should be visible as menu items.
    // The query for menu items usually involves role 'menuitem'.
    expect(screen.getByRole('menuitem', { name: 'Tab 3' })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'Tab 4' })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'Tab 5' })).toBeVisible();

    // The initially visible tabs (Tab 1, Tab 2) should still be there as tabs.
    expect(screen.getByText('Tab 1', { selector: 'button[role="tab"]' })).toBeInTheDocument();
    expect(screen.getByText('Tab 2', { selector: 'button[role="tab"]' })).toBeInTheDocument();
  });

  it('clicking a tab in the "More" menu selects that tab', () => {
    // Container: 270px. Visible: Tab 1, Tab 2. Hidden: Tab 3, Tab 4, Tab 5.
    // Tab 1 is selected by default.
    jest.spyOn(HTMLDivElement.prototype, 'clientWidth', 'get').mockReturnValue(270);
    jest.spyOn(HTMLButtonElement.prototype, 'clientWidth', 'get').mockReturnValue(100);

    render(<AdaptiveTabs tabs={mockTabs} />);

    // Verify initial state: Tab 1 is selected
    expect(isTabSelected('Tab 1')).toBe(true);
    expect(isTabNotSelected('Tab 2')).toBe(true);
    
    // Open the "More" menu
    const moreButton = screen.getByText('More');
    fireEvent.click(moreButton);

    // Click on "Tab 3" in the menu
    const tab3MenuItem = screen.getByRole('menuitem', { name: 'Tab 3' });
    fireEvent.click(tab3MenuItem);

    // Assertions:
    // 1. The menu should be closed, so the menu item for Tab 3 should no longer be in the document.
    expect(screen.queryByRole('menuitem', { name: 'Tab 3' })).not.toBeInTheDocument();
    
    // 2. Tab 1 (previously selected) should now be unselected.
    expect(isTabNotSelected('Tab 1')).toBe(true);
    
    // 3. Tab 2 (visible, but was not selected) should remain unselected.
    expect(isTabNotSelected('Tab 2')).toBe(true);

    // 4. "Tab 3" was selected. Since the current component design does not move it
    //    to the visible tabs, we cannot check its aria-selected state directly on a tab button.
    //    However, the `selectedTab` state in the component would be 'tab3'.
    //    The visible tabs (Tab 1, Tab 2) correctly reflect they are NOT 'tab3'.
    //    This implicitly tests that the selection changed from 'tab1' to 'tab3'.
    //    If content were displayed, we would check for Tab 3's content.
    //    For now, confirming other tabs are deselected is the main check.

    // Optional: To be more explicit, if we knew the default selected tab is always the first one
    // when the selected tab ID from "More" menu is not in visibleTabs, we could check that.
    // But the Material UI Tabs component might just have no tab selected visually in the tab bar
    // if its `value` prop doesn't match any of the `value` props of its child `Tab` components.
    // The current `AdaptiveTabs` component always renders visibleTabs. If `selectedTab` is
    // 'tab3' (hidden), then neither 'tab1' nor 'tab2' (visible) will match, so both will be `aria-selected="false"`.
    // This is what isTabNotSelected('Tab 1') and isTabNotSelected('Tab 2') correctly verify.
  });
});
