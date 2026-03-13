const fs = require('fs');
const file = 'd:/Users/Josué/Desktop/Aliseus/components/features/finance/Budgets.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add imports
const newImports = `import { BudgetCategoryList } from './components/BudgetCategoryList';
import { BudgetSummaryCards } from './components/BudgetSummaryCards';
import { BudgetListItem } from './components/BudgetListItem';
import { BudgetAISuggestionModal } from './components/BudgetAISuggestionModal';
`;

content = content.replace(
    "import { useErrorHandler } from '../../../hooks/useErrorHandler';",
    "import { useErrorHandler } from '../../../hooks/useErrorHandler';\n" + newImports
);

content = content.replace(/interface SmartSuggestion \{[\s\S]*?mode: 'FIXED' \| 'PERCENTAGE';\n\}\n/, '');

content = content.replace(/const getCategoryIcon = \(catName: string\) => \{[\s\S]*?    \};\n/, '');

// Sidebar
content = content.replace(/\{\/\* 1\. SIDEBAR CATEGORY LIST \*\/\}\s*<div className="lg:col-span-4 space-y-4">[\s\S]*?\{\/\* 2\. MAIN CONTENT \(Detailed View\) \*\/\}/,
    `{/* 1. SIDEBAR CATEGORY LIST */}
                <BudgetCategoryList 
                    categoryStats={categoryStats as any} 
                    selectedCategoryName={selectedCategoryName} 
                    setSelectedCategoryName={setSelectedCategoryName} 
                    formatEUR={formatEUR} 
                />\n\n                {/* 2. MAIN CONTENT (Detailed View) */}`);

// Summary Cards
content = content.replace(/\{\/\* --- HEADER: UNIFIED STATS --- \*\/\}\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?\{\/\* --- LISTS SECTIONS --- \*\/\}/,
    `{/* --- HEADER: UNIFIED STATS --- */}
                                <BudgetSummaryCards 
                                    selectedDetails={selectedDetails as any} 
                                    formatEUR={formatEUR} 
                                />\n\n                            {/* --- LISTS SECTIONS --- */}`);

// Lists Section mapping (use BudgetListItem instead of old div)
content = content.replace(/<div className="bg-white p-5 rounded-2xl border border-onyx-100[\s\S]*?key=\{item\.id\}[\s\S]*?<\/div>/g,
    // wait, the BudgetListItem was already used in the code: <BudgetListItem key={item.id} item={item} onEdit={handleEditClick} onDelete={onDeleteBudget} />
    // I don't need to replace the lists section mapping because I kept the component name BudgetListItem in the extracted file!
    '');

// AI Suggestion Modal 
content = content.replace(/\{\/\* AI SUGGESTION MODAL \*\/\}\s*\{\s*isAutoModalOpen[\s\S]*?\{\/\* MODALS/m,
    `{/* AI SUGGESTION MODAL */}
            <BudgetAISuggestionModal 
                isAutoModalOpen={isAutoModalOpen}
                setIsAutoModalOpen={setIsAutoModalOpen}
                aiSensitivity={aiSensitivity}
                setAiSensitivity={setAiSensitivity}
                smartSuggestions={smartSuggestions as any}
                setSmartSuggestions={setSmartSuggestions as any}
                handleApplySuggestions={handleApplySuggestions}
                formatEUR={formatEUR}
            />\n\n            {/* MODALS`);

// Helper component at the bottom
let lastIndex = content.lastIndexOf('// Helper Component for List Item');
if (lastIndex !== -1) {
    let before = content.substring(0, lastIndex);
    let after = 'export default Budgets;\n';
    content = before + after;
}

fs.writeFileSync(file, content);
