import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { read, utils } from 'xlsx';
import { Upload, X, ArrowRight, Check, AlertCircle, FileText, Settings, Database, Building2, AlertTriangle, CreditCard, ArrowRightLeft } from 'lucide-react';
import { Transaction } from '../../../../../types';
import { parseDate, normalizeAmount, detectDuplicates, validateTransactions, getTransactionStats, ValidationError, cleanDescription, mapCategory, detectSubCategory, calculateBalanceImpact, detectCategoryFromDescription } from '../../../../../utils/csvUtils';
import { getAllBankTemplates, getBankTemplate, BankTemplate } from '../../../../../config/bankTemplates';
import { useFinanceStore } from '../../../../../store/useFinanceStore';
import { useFinanceControllers } from '../../../../../hooks/useFinanceControllers';
import { parseTransactionsFromText } from '../../../../../services/geminiFinancial';
import { useToastStore } from '../../../../../store/toastStore';

interface CSVImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (transactions: Partial<Transaction>[]) => void;
}

interface ColumnMapping {
    date: string;
    amount: string;
    description: string;
    category: string;
    subCategory?: string;
    type?: string;
}

const STEPS = {
    UPLOAD: 0,
    BANK_SELECT: 1,
    ACCOUNT_SELECT: 2,
    MAPPING: 3,
    PREVIEW: 4,
};


// Keywords that identify a credit card statement payment in a bank CSV
const CREDIT_CARD_PAYMENT_KEYWORDS = [
    'pago tarjeta', 'liquidacion tarjeta', 'liquidaci\u00f3n tarjeta',
    'recibo tarjeta', 'cargo tarjeta', 'pago visa', 'pago mastercard',
    'pago amex', 'domiciliacion tarjeta', 'liq. tarjeta',
    'abono tarjeta', 'tarjeta credito', 'tarjeta cr\u00e9dito',
];

const isCreditCardPaymentRow = (description: string): boolean => {
    const lower = description.toLowerCase();
    return CREDIT_CARD_PAYMENT_KEYWORDS.some(kw => lower.includes(kw));
};

const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const { transactions: existingTransactions, accounts, categories } = useFinanceStore();
    const { transfer } = useFinanceControllers();
    const { addToast } = useToastStore();
    const [step, setStep] = useState(STEPS.UPLOAD);
    const [file, setFile] = useState<File | null>(null);
    const [rawData, setRawData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [selectedBank, setSelectedBank] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    // For credit card payment rows: which credit account to settle against
    const [creditCardPaymentAccount, setCreditCardPaymentAccount] = useState<string>('');
    const [mapping, setMapping] = useState<ColumnMapping>({
        date: '',
        amount: '',
        description: '',
        category: '',
        subCategory: '',
    });
    const [previewData, setPreviewData] = useState<Partial<Transaction>[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [duplicates, setDuplicates] = useState<{ index: number; matches: Transaction[] }[]>([]);
    const [showDuplicates, setShowDuplicates] = useState(true);
    const [balanceInfo, setBalanceInfo] = useState<{
        current: number;
        impact: number;
        finalBalance: number;
        incomeTotal: number;
        expenseTotal: number;
    } | null>(null);

    // New Smart Import State
    const [importMethod, setImportMethod] = useState<'FILE' | 'TEXT'>('FILE');
    const [rawText, setRawText] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            processFile(uploadedFile);
        }
    };

    const processFile = (file: File) => {
        const isExcel = file.name.match(/\.(xlsx|xls)$/i) ||
            file.type.includes('spreadsheetml') ||
            file.type.includes('excel');
        if (isExcel) {
            parseExcel(file);
        } else {
            parseCSV(file);
        }
    };

    const parseExcel = async (file: File) => {
        try {
            const data = await file.arrayBuffer();
            const workbook = read(data);
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Get raw JSON data as strings depending on format (header: 1 returns array of arrays)
            const jsonData = utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '', raw: false });

            if (jsonData.length > 0) {
                // First row is headers
                const sheetHeaders = jsonData[0] as string[];
                const validHeaders = sheetHeaders.map(h => h ? String(h).trim() : `Column_${Math.random().toString(36).substr(2, 5)}`);

                // Rest is data - map arrays to objects using headers
                const rows = jsonData.slice(1).map(row => {
                    const obj: any = {};
                    validHeaders.forEach((header, index) => {
                        obj[header] = row[index] !== undefined ? row[index] : '';
                    });
                    return obj;
                }).filter(row => Object.values(row).some(val => val !== '')); // Filter out empty rows

                setRawData(rows);
                setHeaders(validHeaders);
                setStep(STEPS.BANK_SELECT);
            }
        } catch (error) {
            console.error("Error parsing Excel file:", error);
        }
    };

    const parseCSV = (file: File, delimiter?: string) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            delimiter: delimiter,
            complete: (results) => {
                setRawData(results.data);
                if (results.meta.fields) {
                    setHeaders(results.meta.fields);
                }
                setStep(STEPS.BANK_SELECT);
            },
        });
    };

    const handleSmartExtract = async () => {
        if (!rawText.trim()) return;
        setIsExtracting(true);
        try {
            const parsed = await parseTransactionsFromText(rawText);
            if (parsed && parsed.length > 0) {
                // Pre-process extracted data for preview
                const withMeta = parsed.map(tx => ({
                    ...tx,
                    accountId: selectedAccount || '',
                    _autoDetected: true,
                    _isCreditCardPayment: isCreditCardPaymentRow(tx.description || ''),
                }));
                setPreviewData(withMeta);
                
                // If accounts available, go to account select, otherwise mapping (which will be skipped basically)
                if (accounts.length > 0) {
                    setStep(STEPS.ACCOUNT_SELECT);
                } else {
                    setStep(STEPS.PREVIEW);
                }
                addToast({ message: `Detectadas ${parsed.length} transacciones`, type: 'success' });
            } else {
                addToast({ message: "No pudimos extraer ninguna transacción del texto.", type: 'error' });
            }
        } catch (error) {
            console.error("AI Extraction Error:", error);
            addToast({ message: "Error al procesar el texto con IA.", type: 'error' });
        } finally {
            setIsExtracting(false);
        }
    };

    const handleBankSelect = (bankId: string | null) => {
        setSelectedBank(bankId);

        if (bankId) {
            const template = getBankTemplate(bankId);
            if (template) {
                applyBankTemplate(template);
            }
        } else {
            // Manual mapping
            autoMapColumns(headers);
        }

        // Auto-select account if there is only one
        if (accounts.length === 1) {
            setSelectedAccount(accounts[0].id);
            setStep(STEPS.MAPPING);
        } else {
            setStep(STEPS.ACCOUNT_SELECT);
        }
    };

    const handleAccountSelect = (accountId: string) => {
        setSelectedAccount(accountId);
        setStep(STEPS.MAPPING);
    };

    const applyBankTemplate = (template: BankTemplate) => {
        const findHeader = (templateVal: string | undefined): string => {
            if (!templateVal) return '';
            if (headers.includes(templateVal)) return templateVal;
            
            const lowerVal = templateVal.toLowerCase();
            const match = headers.find(h => 
                h.toLowerCase().includes(lowerVal) || lowerVal.includes(h.toLowerCase())
            );
            return match || templateVal;
        };

        const newMapping: ColumnMapping = {
            date: findHeader(template.columns.date),
            amount: findHeader(template.columns.amount),
            description: findHeader(template.columns.description),
            category: findHeader(template.columns.category) || '',
            subCategory: '',
            type: findHeader(template.columns.type),
        };
        setMapping(newMapping);
    };

    const autoMapColumns = (fields: string[]) => {
        const newMapping = { ...mapping };
        const lowerFields = fields.map(f => f.toLowerCase());

        const findMatch = (keywords: string[]) => {
            const index = lowerFields.findIndex(f => keywords.some(k => f.includes(k)));
            return index !== -1 ? fields[index] : '';
        };

        newMapping.date = findMatch(['date', 'fecha', 'time']);
        newMapping.amount = findMatch(['amount', 'cantidad', 'importe', 'monto', 'valor']);
        newMapping.description = findMatch(['description', 'descripción', 'concepto', 'memo', 'detail']);
        newMapping.category = findMatch(['category', 'categoría']);
        newMapping.subCategory = findMatch(['subcategory', 'subcategoría', 'subcat']);

        setMapping(newMapping);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            const isCsvOrExcel = droppedFile.type === 'text/csv' ||
                droppedFile.name.match(/\.(csv|xlsx|xls)$/i) ||
                droppedFile.type.includes('spreadsheetml') ||
                droppedFile.type.includes('excel');
            if (isCsvOrExcel) {
                setFile(droppedFile);
                processFile(droppedFile);
            }
        }
    };

    const processData = () => {
        const processed = rawData.map((row, index) => {
            const amountVal = normalizeAmount(row[mapping.amount]);
            const dateVal = parseDate(row[mapping.date]);
            const descriptionVal = cleanDescription(row[mapping.description]);

            // Map category from CSV or use intelligent mapping
            let categoryVal = 'Otros';
            let subCategoryVal: string | undefined;
            let autoDetected = false;

            if (mapping.category && row[mapping.category]) {
                const mapped = mapCategory(row[mapping.category], categories, descriptionVal);
                categoryVal = mapped.category;
                subCategoryVal = mapped.subCategory;
            } else {
                // If no category column is mapped, try to auto-detect purely from description
                const detected = detectCategoryFromDescription(descriptionVal);
                if (detected) {
                    categoryVal = detected.category;
                    subCategoryVal = detected.subCategory;
                    autoDetected = true;
                }
            }

            // If subcategory column exists, use it
            if (mapping.subCategory && row[mapping.subCategory]) {
                subCategoryVal = row[mapping.subCategory];
            }

            // Try to detect subcategory from description if not already set
            if (!subCategoryVal) {
                subCategoryVal = detectSubCategory(descriptionVal, categoryVal, categories);
            }

            // Log para debugging (solo en desarrollo)
            if (process.env.NODE_ENV === 'development') {
                console.log(`Row ${index + 1}:`, {
                    original: row[mapping.description],
                    cleaned: descriptionVal,
                    amount: amountVal,
                    date: dateVal,
                    category: categoryVal,
                    subCategory: subCategoryVal,
                    autoDetected
                });
            }

            return {
                date: dateVal,
                amount: Math.abs(amountVal),
                description: descriptionVal,
                category: categoryVal,
                subCategory: subCategoryVal,
                type: amountVal >= 0 ? 'INCOME' : 'EXPENSE',
                accountId: selectedAccount || undefined,
                isRecurring: false,
                _autoDetected: autoDetected,
                _isCreditCardPayment: isCreditCardPaymentRow(descriptionVal),
            } as any;
        });

        // Validate
        const errors = validateTransactions(processed);
        setValidationErrors(errors);

        // Detect duplicates
        const dupes = detectDuplicates(processed, existingTransactions);
        setDuplicates(dupes);

        // Calculate balance impact if account is selected
        if (selectedAccount) {
            const account = accounts.find(a => a.id === selectedAccount);
            if (account) {
                const balanceCalc = calculateBalanceImpact(processed, account.balance);
                setBalanceInfo({
                    current: account.balance,
                    ...balanceCalc
                });
            }
        }

        setPreviewData(processed);
        setStep(STEPS.PREVIEW);
    };

    const handleFinalImport = () => {
        // Filter out duplicates if user chose to skip them
        let toImport = previewData;

        if (!showDuplicates && duplicates.length > 0) {
            const duplicateIndices = new Set(duplicates.map(d => d.index));
            toImport = previewData.filter((_, index) => !duplicateIndices.has(index));
        }

        // Filter out transactions with errors
        if (validationErrors.length > 0) {
            const errorRows = new Set(validationErrors.map(e => e.row - 1));
            toImport = toImport.filter((_, index) => !errorRows.has(index));
        }

        // Separate credit card payment rows from regular transactions
        const creditCardRows = toImport.filter((r: any) => r._isCreditCardPayment);
        const regularRows = toImport.filter((r: any) => !r._isCreditCardPayment);

        // Import regular transactions
        onImport(regularRows);

        // Convert credit card payment rows into transfers: bank account → credit card account
        if (creditCardRows.length > 0 && selectedAccount && creditCardPaymentAccount) {
            creditCardRows.forEach((row: any) => {
                transfer(
                    selectedAccount,          // from: bank account
                    creditCardPaymentAccount, // to: credit card account (reduces debt)
                    row.amount,
                    row.date,
                    undefined,
                    row.description
                );
            });
        } else if (creditCardRows.length > 0) {
            // No CC account selected — import as regular expenses (fallback)
            onImport(creditCardRows);
        }

        // Update account balance if account was selected
        if (selectedAccount && balanceInfo) {
            const { updateAccountBalance } = useFinanceStore.getState();
            updateAccountBalance(selectedAccount, balanceInfo.impact);
        }

        onClose();
        resetState();
    };

    const resetState = () => {
        setStep(STEPS.UPLOAD);
        setFile(null);
        setRawData([]);
        setSelectedBank(null);
        setSelectedAccount(null);
        setCreditCardPaymentAccount('');
        setPreviewData([]);
        setValidationErrors([]);
        setDuplicates([]);
        setBalanceInfo(null);
        setRawText('');
        setImportMethod('FILE');
    };

    if (!isOpen) return null;

    const stats = getTransactionStats(previewData);
    const validCount = previewData.length - validationErrors.length;
    const duplicateCount = duplicates.length;
    const creditCardPaymentRows = previewData.filter((r: any) => r._isCreditCardPayment);
    const creditAccounts = accounts.filter(a => a.type === 'CREDIT');

    return (
        <div className="fixed inset-0 bg-cyan-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-aliseus-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-cyan-50 text-cyan-600`}>
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-cyan-900">Importar Transacciones</h2>
                            <p className="text-xs font-medium text-aliseus-400 mt-1 uppercase tracking-wider">
                                {step === STEPS.UPLOAD && '1. Sube tu archivo CSV o Excel'}
                                {step === STEPS.BANK_SELECT && '2. Selecciona tu banco'}
                                {step === STEPS.ACCOUNT_SELECT && '3. Selecciona la cuenta'}
                                {step === STEPS.MAPPING && '4. Asigna las columnas'}
                                {step === STEPS.PREVIEW && '5. Verifica y confirma'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-aliseus-50 rounded-full transition-colors text-aliseus-400 hover:text-cyan-900">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    {/* STEP 1: UPLOAD */}
                    {step === STEPS.UPLOAD && (
                        <div className="space-y-6">
                            {/* Tabs for Import Method */}
                            <div className="flex bg-aliseus-50 p-1 rounded-2xl w-fit mx-auto mb-4">
                                <button
                                    onClick={() => setImportMethod('FILE')}
                                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                                        importMethod === 'FILE' 
                                        ? 'bg-white text-cyan-600 shadow-sm' 
                                        : 'text-aliseus-400 hover:text-aliseus-600'
                                    }`}
                                >
                                    Archivo CSV/Excel
                                </button>
                                <button
                                    onClick={() => setImportMethod('TEXT')}
                                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                                        importMethod === 'TEXT' 
                                        ? 'bg-white text-cyan-600 shadow-sm' 
                                        : 'text-aliseus-400 hover:text-aliseus-600'
                                    }`}
                                >
                                    Pegar Texto / PDF ✨
                                </button>
                            </div>

                            {importMethod === 'FILE' ? (
                                <div
                                    className="border-2 border-dashed border-aliseus-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:border-cyan-500/50 hover:bg-cyan-50/10 transition-all cursor-pointer group"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    <div className="w-20 h-20 bg-aliseus-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                        <FileText className="w-10 h-10 text-aliseus-300 group-hover:text-cyan-600 transition-colors" />
                                    </div>
                                    <h3 className="text-lg font-bold text-cyan-900 mb-2">Arrastra tu archivo CSV o Excel aquí</h3>
                                    <p className="text-aliseus-500 mb-8 max-w-sm">O haz clic para seleccionar un archivo desde tu ordenador. Asegúrate de que tenga encabezados.</p>

                                    <label className="bg-cyan-900 hover:bg-aliseus-800 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-cyan-900/20 active:scale-95">
                                        Seleccionar Archivo
                                        <input type="file" onChange={handleFileUpload} accept=".csv, .xlsx, .xls" className="hidden" />
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100 flex items-start gap-4 mb-2">
                                        <div className="p-2 bg-cyan-100 rounded-lg">
                                            <Database className="w-4 h-4 text-cyan-600" />
                                        </div>
                                        <p className="text-xs text-cyan-800 leading-relaxed font-medium">
                                            Abre tu <b>PDF bancario</b>, selecciona el texto de los movimientos, cópialo y pégalo aquí debajo. 
                                            Nuestro sistema de <b>Inteligencia Artificial</b> extraerá los datos automáticamente.
                                        </p>
                                    </div>
                                    <textarea
                                        value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                        placeholder="Fecha - Concepto - Importe... Pega aquí el texto de tu banco."
                                        className="w-full h-64 p-6 bg-aliseus-50/50 border-2 border-aliseus-100 rounded-3xl outline-none focus:border-cyan-400 focus:bg-white transition-all text-sm font-medium resize-none custom-scrollbar"
                                    />
                                    <button
                                        onClick={handleSmartExtract}
                                        disabled={!rawText.trim() || isExtracting}
                                        className="w-full bg-cyan-900 hover:bg-aliseus-800 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-cyan-900/10 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                    >
                                        {isExtracting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Procesando con IA...
                                            </>
                                        ) : (
                                            <>
                                                Extraer Transacciones con IA ✨
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: BANK SELECT */}
                    {step === STEPS.BANK_SELECT && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-cyan-50/50 p-6 rounded-2xl border border-cyan-100 flex items-start gap-4">
                                <Building2 className="w-5 h-5 text-cyan-600 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-aliseus-900 text-sm">¿Tu banco está en la lista?</h4>
                                    <p className="text-xs text-aliseus-500 mt-1">Selecciona tu banco para mapear automáticamente las columnas, o continúa manualmente.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {getAllBankTemplates().map(bank => (
                                    <button
                                        key={bank.id}
                                        onClick={() => handleBankSelect(bank.id)}
                                        className="p-6 border-2 border-aliseus-200 rounded-2xl hover:border-cyan-500 hover:bg-cyan-50/30 transition-all text-center font-bold text-sm text-aliseus-900 hover:text-cyan-600"
                                    >
                                        {bank.name}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handleBankSelect(null)}
                                className="w-full p-4 border-2 border-dashed border-aliseus-300 rounded-2xl hover:border-aliseus-400 hover:bg-aliseus-50 transition-all text-center font-bold text-sm text-aliseus-600"
                            >
                                Mi banco no está en la lista (mapeo manual)
                            </button>
                        </div>
                    )}

                    {/* STEP 3: ACCOUNT SELECT */}
                    {step === STEPS.ACCOUNT_SELECT && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-cyan-50/50 p-6 rounded-2xl border border-cyan-100 flex items-start gap-4">
                                <Database className="w-5 h-5 text-cyan-600 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-aliseus-900 text-sm">Selecciona la cuenta bancaria</h4>
                                    <p className="text-xs text-aliseus-500 mt-1">Las transacciones se vincularán a esta cuenta y su saldo se actualizará automáticamente.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {accounts.map(account => (
                                    <button
                                        key={account.id}
                                        onClick={() => handleAccountSelect(account.id)}
                                        className="p-6 border-2 border-aliseus-200 rounded-2xl hover:border-cyan-500 hover:bg-cyan-50/30 transition-all text-left group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-bold text-aliseus-900 group-hover:text-cyan-600 transition-colors">{account.name}</h5>
                                                {account.bankName && (
                                                    <p className="text-xs text-aliseus-500 mt-1">{account.bankName}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-aliseus-400 uppercase tracking-wider">Saldo Actual</p>
                                                <p className="text-lg font-black text-aliseus-900 mt-1">{account.balance.toFixed(2)} €</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {accounts.length === 0 && (
                                <div className="text-center p-8 bg-aliseus-50 rounded-2xl">
                                    <p className="text-aliseus-500 text-sm">No tienes cuentas bancarias creadas. Por favor, crea una cuenta primero.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: MAPPING */}
                    {step === STEPS.MAPPING && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-cyan-50/50 p-6 rounded-2xl border border-cyan-100 flex items-start gap-4">
                                <Database className="w-5 h-5 text-cyan-600 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-aliseus-900 text-sm">Archivo detectado: {file?.name}</h4>
                                    <p className="text-xs text-aliseus-500 mt-1">{rawData.length} filas encontradas. {selectedBank ? `Plantilla ${getBankTemplate(selectedBank)?.name} aplicada.` : 'Asigna las columnas correspondientes.'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { key: 'date', label: 'Fecha *' },
                                    { key: 'amount', label: 'Cantidad / Monto *' },
                                    { key: 'description', label: 'Descripción *' },
                                    { key: 'category', label: 'Categoría (Opcional)' },
                                ].map((field) => (
                                    <div key={field.key} className="space-y-2">
                                        <label className="text-xs font-bold text-aliseus-500 uppercase tracking-wider">{field.label}</label>
                                        <select
                                            value={mapping[field.key as keyof ColumnMapping]}
                                            onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                                            className="w-full p-4 bg-aliseus-50 border border-aliseus-200 rounded-xl font-medium text-aliseus-900 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                                        >
                                            <option value="">-- Seleccionar Columna --</option>
                                            {headers.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 5: PREVIEW */}
                    {step === STEPS.PREVIEW && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Balance Info */}
                            {balanceInfo && selectedAccount && (
                                <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-6 rounded-2xl border border-cyan-200">
                                    <h4 className="font-bold text-aliseus-900 text-sm mb-4">Impacto en el Saldo</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-aliseus-500 uppercase tracking-wider">Saldo Actual</p>
                                            <p className="text-xl font-black text-aliseus-900 mt-1">{balanceInfo.current.toFixed(2)} €</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-aliseus-500 uppercase tracking-wider">Impacto</p>
                                            <p className={`text-xl font-black mt-1 ${balanceInfo.impact >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {balanceInfo.impact >= 0 ? '+' : ''}{balanceInfo.impact.toFixed(2)} €
                                            </p>
                                            <p className="text-[10px] text-aliseus-400 mt-1">
                                                +{balanceInfo.incomeTotal.toFixed(2)} / -{balanceInfo.expenseTotal.toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-aliseus-500 uppercase tracking-wider">Saldo Final</p>
                                            <p className="text-xl font-black text-cyan-600 mt-1">{balanceInfo.finalBalance.toFixed(2)} €</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Statistics */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Válidas</p>
                                    <p className="text-2xl font-black text-emerald-700 mt-1">{validCount}</p>
                                </div>
                                {validationErrors.length > 0 && (
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Errores</p>
                                        <p className="text-2xl font-black text-red-700 mt-1">{validationErrors.length}</p>
                                    </div>
                                )}
                                {duplicateCount > 0 && (
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Duplicados</p>
                                        <p className="text-2xl font-black text-amber-700 mt-1">{duplicateCount}</p>
                                    </div>
                                )}
                            </div>

                            {/* Credit Card Payment Banner */}
                            {creditCardPaymentRows.length > 0 && (
                                <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="p-2 bg-violet-100 rounded-xl flex-shrink-0">
                                        <CreditCard className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-violet-900 text-sm flex items-center gap-2">
                                            {creditCardPaymentRows.length} pago{creditCardPaymentRows.length > 1 ? 's' : ''} de tarjeta detectado{creditCardPaymentRows.length > 1 ? 's' : ''}
                                            <span className="text-[10px] font-black bg-violet-200 text-violet-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Auto</span>
                                        </h4>
                                        <p className="text-xs text-violet-700 mt-1">
                                            Estos movimientos son liquidaciones de tarjeta. Se importarán como <strong>transferencias</strong> del banco a la tarjeta (no como gastos), evitando duplicar los cargos ya registrados en la tarjeta.
                                        </p>
                                        {creditAccounts.length > 0 ? (
                                            <div className="mt-3 flex items-center gap-3">
                                                <ArrowRightLeft className="w-4 h-4 text-violet-500 flex-shrink-0" />
                                                <select
                                                    value={creditCardPaymentAccount}
                                                    onChange={e => setCreditCardPaymentAccount(e.target.value)}
                                                    className="flex-1 p-2.5 bg-white border border-violet-200 rounded-xl text-sm font-bold text-aliseus-900 focus:ring-2 focus:ring-violet-300 outline-none"
                                                >
                                                    <option value="">Seleccionar tarjeta de crédito que se liquida...</option>
                                                    {creditAccounts.map(a => (
                                                        <option key={a.id} value={a.id}>
                                                            {a.name} (deuda: {Math.abs(a.balance).toFixed(2)}€)
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-violet-600 mt-2 italic">No tienes tarjetas de crédito registradas. Los pagos se importarán como gastos.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Warnings */}
                            {(validationErrors.length > 0 || duplicateCount > 0) && (
                                <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200">
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-aliseus-900 text-sm">Atención requerida</h4>
                                            {validationErrors.length > 0 && (
                                                <p className="text-xs text-aliseus-600 mt-1">{validationErrors.length} transacciones tienen errores y serán omitidas.</p>
                                            )}
                                            {duplicateCount > 0 && (
                                                <div className="mt-2">
                                                    <label className="flex items-center gap-2 text-xs font-medium text-aliseus-700 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={!showDuplicates}
                                                            onChange={(e) => setShowDuplicates(!e.target.checked)}
                                                            className="rounded"
                                                        />
                                                        Omitir {duplicateCount} duplicados detectados
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preview Table */}
                            <div className="overflow-hidden border border-aliseus-200 rounded-2xl">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-aliseus-50 text-aliseus-500 font-bold uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Fecha</th>
                                            <th className="px-6 py-4">Descripción</th>
                                            <th className="px-6 py-4">Categoría</th>
                                            <th className="px-6 py-4 text-right">Cantidad</th>
                                            <th className="px-6 py-4">Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-aliseus-100">
                                        {previewData.slice(0, 10).map((row, idx) => {
                                            const hasError = validationErrors.some(e => e.row === idx + 1);
                                            const isDuplicate = duplicates.some(d => d.index === idx);
                                            const isCCPayment = (row as any)._isCreditCardPayment;

                                            return (
                                                <tr key={idx} className={`hover:bg-aliseus-50/50 transition-colors ${hasError ? 'bg-red-50' :
                                                    isDuplicate ? 'bg-amber-50' :
                                                        isCCPayment ? 'bg-violet-50' : ''
                                                    }`}>
                                                    <td className="px-6 py-4 text-aliseus-900">{row.date}</td>
                                                    <td className="px-6 py-4 text-aliseus-700">
                                                        <span className="flex items-center gap-2">
                                                            {isCCPayment && <CreditCard className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />}
                                                            {row.description}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-aliseus-600">
                                                        <span className="flex items-center gap-1.5">
                                                            {isCCPayment ? (
                                                                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-violet-100 text-violet-700">Pago Tarjeta</span>
                                                            ) : (
                                                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${(row as any)._autoDetected ? 'bg-cyan-100 text-cyan-700' : 'bg-aliseus-100'}`}>
                                                                    {row.category}
                                                                </span>
                                                            )}
                                                            {(row as any)._autoDetected && !isCCPayment && (
                                                                <span className="text-[10px] text-cyan-500 font-medium" title="Categorizado automáticamente">✨ IA</span>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-4 text-right font-bold ${row.type === 'INCOME' ? 'text-emerald-600' : 'text-aliseus-900'}`}>
                                                        {row.amount?.toFixed(2)} €
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {isCCPayment ? (
                                                            <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700">Transferencia</span>
                                                        ) : (
                                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${row.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                                {row.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {previewData.length > 10 && (
                                    <div className="px-6 py-4 bg-aliseus-50 text-center text-xs text-aliseus-500 font-medium border-t border-aliseus-100">
                                        ... y {previewData.length - 10} más
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-aliseus-100 bg-aliseus-50/30 flex justify-between items-center">
                    {step === STEPS.UPLOAD ? (
                        <div></div>
                    ) : (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-aliseus-500 hover:bg-aliseus-100 transition-all"
                        >
                            Atrás
                        </button>
                    )}

                    {step === STEPS.BANK_SELECT && <div></div>}

                    {step === STEPS.MAPPING && (
                        <button
                            onClick={processData}
                            disabled={!mapping.date || !mapping.amount}
                            className="bg-cyan-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-aliseus-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-cyan-900/10"
                        >
                            Continuar <ArrowRight className="w-4 h-4" />
                        </button>
                    )}

                    {step === STEPS.PREVIEW && (
                        <button
                            onClick={handleFinalImport}
                            disabled={validCount === 0}
                            className="bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/20"
                        >
                            Importar {validCount - creditCardPaymentRows.length} Transacciones
                            {creditCardPaymentRows.length > 0 && ` + ${creditCardPaymentRows.length} Transferencias`}
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CSVImportModal;
