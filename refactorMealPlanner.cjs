const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'components/features/life/MealPlanner.tsx');
let content = fs.readFileSync(targetFile, 'utf-8');

// 1. the header part replace
const headerStartStr = `                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                            Smart Kitchen <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] px-3 py-1 rounded-full tracking-widest uppercase shadow-md">Pro</span>
                        </h2>`;

const headerEndStr = `                            <button onClick={() => setShoppingList([...shoppingList, { id: 'milk', name: 'Leche', category: 'Lácteos', quantity: 2, unit: 'L', purchased: false }])} className="bg-white text-gray-900 px-6 py-3 rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-gray-400" /> Lista de Compra
                            </button>
                        </div>
                    </div>
                </div>`;

const headerReplacement = `                <MealPlannerHeader 
                    currentDate={currentDate}
                    viewMode={viewMode}
                    onPrevWeek={handlePrevWeek}
                    onNextWeek={handleNextWeek}
                    onToday={handleToday}
                    onViewModeChange={setViewMode}
                    onShowAiPlanner={() => setShowAiPlanner(true)}
                    onClearPlan={() => {
                        if (confirm("¿Estás seguro de que quieres limpiar toda la planificación semanal?")) {
                            setWeeklyPlan({});
                        }
                    }}
                    onGenerateShoppingList={() => {}}
                />`;

const idxHeaderStart = content.indexOf(headerStartStr);
const idxHeaderEnd = content.indexOf(headerEndStr);

if (idxHeaderStart !== -1 && idxHeaderEnd !== -1) {
    content = content.substring(0, idxHeaderStart) + headerReplacement + content.substring(idxHeaderEnd + headerEndStr.length);
} else {
    console.log("Could not find header");
}

// 2. The sidebar
const sidebarStartStr = `                <div className="w-80 border-l border-gray-100 bg-white flex flex-col shrink-0">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3 mb-6">`;

const sidebarEndStr = `                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>`;

const sidebarReplacement = `                <RecipeSidebar 
                    recipes={recipes}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onOpenRecipe={onOpenRecipe}
                    onShowQuickAdd={() => setShowQuickAdd(true)}
                />`;

const idxSidebarStart = content.indexOf(sidebarStartStr);
// Need to find the exact end of the sidebar
const idxSidebarEnd = content.indexOf(sidebarEndStr, idxSidebarStart);

if (idxSidebarStart !== -1 && idxSidebarEnd !== -1) {
    content = content.substring(0, idxSidebarStart) + sidebarReplacement + content.substring(idxSidebarEnd + sidebarEndStr.length);
} else {
    console.log("Could not find sidebar");
}

// 3. AI Planner Modal
const aiPlannerStartStr = `            {/* AI Custom Planner Dialog */}
            {showAiPlanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">`;
const aiPlannerEndStr = `                            </button>
                        </div>
                    </div>
                </div>
            )}`;

const aiPlannerReplacement = `            <AiPlannerModal 
                isOpen={showAiPlanner}
                onClose={() => setShowAiPlanner(false)}
                onApplyPlan={applyAiPlan}
                language={language as any}
            />`;

const idxAiStart = content.indexOf(aiPlannerStartStr);
const idxAiEnd = content.indexOf(aiPlannerEndStr, idxAiStart);

if (idxAiStart !== -1 && idxAiEnd !== -1) {
    content = content.substring(0, idxAiStart) + aiPlannerReplacement + content.substring(idxAiEnd + aiPlannerEndStr.length);
} else {
    console.log("Could not find AI planner");
}

// 4. Quick Add Dialog
const quickAddStartStr = `            {/* Quick Search Dialog */}
            {showQuickAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">`;
const quickAddEndStr = `                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}`;

const quickAddReplacement = `            <QuickAddModal 
                isOpen={showQuickAdd}
                onClose={() => setShowQuickAdd(false)}
                isSearchingGemini={isSearchingGemini}
                quickSearchQuery={quickSearchQuery}
                setQuickSearchQuery={setQuickSearchQuery}
                onQuickSearch={handleQuickSearch}
                geminiSearchResults={geminiSearchResults}
                onSaveAlgorithmRecipe={handleSaveAlgorithmRecipe}
            />`;

const idxQuickStart = content.indexOf(quickAddStartStr);
const idxQuickEnd = content.indexOf(quickAddEndStr, idxQuickStart);

if (idxQuickStart !== -1 && idxQuickEnd !== -1) {
    content = content.substring(0, idxQuickStart) + quickAddReplacement + content.substring(idxQuickEnd + quickAddEndStr.length);
} else {
    console.log("Could not find Quick add planner");
}

fs.writeFileSync(targetFile, content);
console.log("MealPlanner refactored!");
