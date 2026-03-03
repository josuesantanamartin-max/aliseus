import React, { useState, useEffect } from 'react';
import { useRetirementStore } from '../../../store/useRetirementStore';
import { retirementCalculator } from '../../../utils/retirementCalculator';
import { RetirementPlan } from '../../../types';
import { cn } from '../../../utils/cn';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calculator, TrendingUp, AlertCircle, Save, RefreshCw } from 'lucide-react';
import { useCurrency } from '../../../hooks/useCurrency';

export const RetirementSimulator: React.FC = () => {
    const { plans, createPlan, updatePlan, activePlanId, setActivePlan } = useRetirementStore();
    const { formatPrice, symbol } = useCurrency();

    // Local state for simulation (detached from store until saved)
    const [formData, setFormData] = useState({
        currentAge: 30,
        targetAge: 65,
        currentSavings: 10000,
        monthlyContribution: 500,
        expectedReturn: 7, // %
        inflationRate: 3, // %
        targetMonthlyIncome: 2000
    });

    const [projectionData, setProjectionData] = useState<any[]>([]);
    const [result, setResult] = useState<any>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [planName, setPlanName] = useState("Mi Plan de Jubilación");

    // Load active plan if exists
    useEffect(() => {
        if (activePlanId) {
            const plan = plans.find(p => p.id === activePlanId);
            if (plan) {
                setFormData({
                    currentAge: plan.currentAge,
                    targetAge: plan.targetAge,
                    currentSavings: plan.currentSavings,
                    monthlyContribution: plan.monthlyContribution,
                    expectedReturn: plan.expectedReturn,
                    inflationRate: plan.inflationRate,
                    targetMonthlyIncome: plan.targetMonthlyIncome
                });
                setPlanName(plan.name);
            }
        }
    }, [activePlanId, plans]);

    // Recalculate on change
    useEffect(() => {
        calculateProjection();
    }, [formData]);

    const calculateProjection = () => {
        const { currentAge, targetAge, currentSavings, monthlyContribution, expectedReturn, inflationRate, targetMonthlyIncome } = formData;

        // 1. Calculate Summary Metrics
        const projection = retirementCalculator.calculate(
            currentAge, targetAge, currentSavings, monthlyContribution, expectedReturn, inflationRate, targetMonthlyIncome
        );
        setResult(projection);

        // 2. Generate Chart Data (Year by Year but calculated Monthly)
        const years = [];
        const nominalRate = expectedReturn / 100;
        const inflation = inflationRate / 100;
        const realRate = (1 + nominalRate) / (1 + inflation) - 1;
        const monthlyRealRate = realRate / 12;

        let balance = currentSavings;

        // Accumulation Phase
        for (let age = currentAge; age <= targetAge; age++) {
            years.push({
                age,
                accumulation: Math.round(balance),
                drawdown: null,
                phase: 'Acumulación'
            });
            // 12 months of growth and contributions
            for (let m = 0; m < 12; m++) {
                balance = balance * (1 + monthlyRealRate) + monthlyContribution;
            }
        }

        // Decumulation Phase (Drawdown)
        let drawdownBalance = balance;
        // Limit to 100 years old or when money runs out
        for (let age = targetAge + 1; age <= 100; age++) {
            years.push({
                age,
                accumulation: null,
                drawdown: Math.round(drawdownBalance),
                phase: 'Retiro'
            });

            // 12 months of growth and withdrawals
            for (let m = 0; m < 12; m++) {
                // Withdraw at start of month (conservative) then grow remaining
                drawdownBalance = (drawdownBalance - targetMonthlyIncome) * (1 + monthlyRealRate);
                if (drawdownBalance < 0) {
                    drawdownBalance = 0;
                    break;
                }
            }

            if (drawdownBalance <= 0) break;
        }

        setProjectionData(years);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSave = async () => {
        if (activePlanId) {
            await updatePlan(activePlanId, { name: planName, ...formData });
        } else {
            await createPlan({ name: planName, ...formData });
        }
        setShowSaveModal(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-onyx-500" />
                        Planificador de Jubilación
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Simula tu futuro financiero con ajuste de inflación real.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSaveModal(true)}
                        className="bg-onyx-600 hover:bg-onyx-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {activePlanId ? 'Actualizar Plan' : 'Guardar Plan'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inputs */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-1 space-y-6">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 border-b pb-2 mb-4">Parámetros</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Edad Actual" name="currentAge" value={formData.currentAge} onChange={handleInputChange} min={18} max={100} />
                        <InputGroup label="Edad Retiro" name="targetAge" value={formData.targetAge} onChange={handleInputChange} min={formData.currentAge + 1} max={100} />
                    </div>

                    <InputGroup label="Ahorro Actual" name="currentSavings" value={formData.currentSavings} onChange={handleInputChange} prefix={symbol} step={100} />
                    <InputGroup label="Aportación Mensual" name="monthlyContribution" value={formData.monthlyContribution} onChange={handleInputChange} prefix={symbol} step={50} />

                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Retorno Esperado (%)" name="expectedReturn" value={formData.expectedReturn} onChange={handleInputChange} step={0.1} />
                        <InputGroup label="Inflación Estimada (%)" name="inflationRate" value={formData.inflationRate} onChange={handleInputChange} step={0.1} />
                    </div>

                    <InputGroup label="Ingreso Mensual Deseado (Valor Presente)" name="targetMonthlyIncome" value={formData.targetMonthlyIncome} onChange={handleInputChange} prefix={symbol} step={100} />

                    <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg text-sm text-cyan-700 dark:text-cyan-300 flex gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>Los cálculos usan "Valor Real" (poder adquisitivo de hoy), descontando la inflación automáticamente.</p>
                    </div>
                </div>

                {/* Visualization */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                            title="Capital Acumulado"
                            value={formatPrice(result?.totalSavings || 0, 0)}
                            subtitle="A la edad de retiro (Valor Real)"
                            icon={<TrendingUp className="text-green-500" />}
                        />
                        <MetricCard
                            title="Ingreso Mensual Sostenible"
                            value={formatPrice(result?.monthlyIncome || 0, 0)}
                            subtitle="Basado en la regla del 4%"
                            icon={<RefreshCw className={result?.monthlyIncome < formData.targetMonthlyIncome ? "text-red-500" : "text-emerald-500"} />}
                            highlight={result?.monthlyIncome < formData.targetMonthlyIncome}
                        />
                        <MetricCard
                            title="Años de Cobertura"
                            value={result?.yearsOfFunding >= 50 ? "Indefinido" : `${result?.yearsOfFunding} años`}
                            subtitle={`Extrayendo ${formatPrice(formData.targetMonthlyIncome, 0)}/mes`}
                            icon={result?.yearsOfFunding < 25 ? <AlertCircle className="text-red-500" /> : <Save className="text-emerald-500" />}
                            severity={result?.yearsOfFunding < 25 ? 'error' : 'success'}
                        />
                    </div>

                    {/* GAP ALERT SECTION */}
                    {result && result.monthlyIncome < formData.targetMonthlyIncome && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 p-6 rounded-2xl animate-pulse-slow">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl text-red-600 dark:text-red-400">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-black text-red-700 dark:text-red-400 uppercase tracking-tight">Brecha de Jubilación Detectada</h4>
                                    <p className="text-red-600/80 dark:text-red-400/80 font-bold text-sm mb-4">
                                        Tu plan actual genera un déficit de <span className="text-2xl font-black">{formatPrice(formData.targetMonthlyIncome - result.monthlyIncome)}</span> al mes respecto a tu objetivo.
                                    </p>

                                    <div className="bg-white/50 dark:bg-black/20 p-4 rounded-xl inline-block border border-red-200 dark:border-red-900/40">
                                        <p className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-widest mb-1">Acción Recomendada</p>
                                        <p className="text-sm font-black text-red-900 dark:text-red-200">
                                            Aumentar tu aportación en <span className="text-lg underline underline-offset-4">{formatPrice(Math.max(0, retirementCalculator.calculateRequiredContribution(formData.currentAge, formData.targetAge, formData.currentSavings, formData.expectedReturn, formData.inflationRate, formData.targetMonthlyIncome) - formData.monthlyContribution))}</span> más al mes para llegar a {formatPrice(formData.targetMonthlyIncome, 0)}.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comparativo de Escenarios */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-onyx-500" />
                            Escenarios Comparativos (Rendimiento Anual)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Conservador', rate: 5, color: 'text-amber-600', bg: 'bg-amber-50' },
                                { label: 'Moderado', rate: 7, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Optimista', rate: 9, color: 'text-sky-600', bg: 'bg-sky-50' }
                            ].map((s) => {
                                const scProj = retirementCalculator.calculate(
                                    formData.currentAge, formData.targetAge, formData.currentSavings, formData.monthlyContribution, s.rate, formData.inflationRate, formData.targetMonthlyIncome
                                );
                                const isActive = s.rate === formData.expectedReturn;
                                return (
                                    <div key={s.label} className={cn(
                                        "relative p-4 rounded-xl border-2 transition-all duration-500",
                                        isActive ? "border-onyx-500 bg-onyx-50/20 shadow-lg shadow-onyx-500/10 scale-[1.02] z-10" : "border-slate-50 bg-white dark:bg-gray-900/50 grayscale-[0.3]"
                                    )}>
                                        {isActive && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-onyx-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md z-20 whitespace-nowrap border-2 border-white dark:border-gray-800">
                                                TU PLAN ACTUAL
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mb-3">
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg", s.bg, s.color)}>{s.label}</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white">{s.rate}%</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sostenible/mes</p>
                                                <p className={cn("text-xl font-black", scProj.monthlyIncome < formData.targetMonthlyIncome ? "text-red-500" : "text-emerald-600")}>
                                                    {formatPrice(scProj.monthlyIncome, 0)}
                                                </p>
                                            </div>
                                            <div className="pt-2 border-t border-slate-100 dark:border-gray-800">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Aportación Necesaria</p>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                    {formatPrice(retirementCalculator.calculateRequiredContribution(formData.currentAge, formData.targetAge, formData.currentSavings, s.rate, formData.inflationRate, formData.targetMonthlyIncome), 0)}/mes
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-96">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Proyección Patrimonio</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={projectionData}>
                                <defs>
                                    <linearGradient id="colorAccumulation" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="age" label={{ value: 'Edad', position: 'insideBottomRight', offset: -5 }} stroke="#9CA3AF" />
                                <YAxis tickFormatter={(val) => `${val / 1000}k`} stroke="#9CA3AF" />
                                <Tooltip
                                    formatter={(val: any, name: any) => [
                                        formatPrice(val || 0),
                                        name === 'accumulation' ? 'Ahorro Acumulado' : 'Capital en Retiro'
                                    ]}
                                    labelFormatter={(label, payload) => {
                                        const phase = payload[0]?.payload?.phase;
                                        return `Edad: ${label} (${phase})`;
                                    }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="accumulation"
                                    stroke="#0891b2"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAccumulation)"
                                    name="accumulation"
                                    activeDot={{ r: 6 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="drawdown"
                                    stroke="#F59E0B"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorDrawdown)"
                                    name="drawdown"
                                    activeDot={{ r: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Recommendations */}
                    {result && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 tracking-tight uppercase text-xs">Análisis Inteligente Aura</h3>
                            <div className="space-y-3">
                                {retirementCalculator.getRecommendations(
                                    result,
                                    formData.targetMonthlyIncome,
                                    retirementCalculator.calculateRequiredContribution(formData.currentAge, formData.targetAge, formData.currentSavings, formData.expectedReturn, formData.inflationRate, formData.targetMonthlyIncome),
                                    formData.monthlyContribution
                                ).map((rec, i) => (
                                    <div key={i} className={cn(
                                        "p-4 rounded-xl text-sm font-medium flex gap-3 items-center",
                                        rec.type === 'error' ? "bg-red-50 text-red-700 border border-red-100" :
                                            rec.type === 'warning' ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                                "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    )}>
                                        {rec.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                                            rec.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                                                <TrendingUp className="w-5 h-5" />}
                                        {rec.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-cyan-950/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Guardar Plan</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Plan</label>
                                <input
                                    type="text"
                                    value={planName}
                                    onChange={(e) => setPlanName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-onyx-500 outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-onyx-600 text-white rounded-lg hover:bg-onyx-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputGroup = ({ label, name, value, onChange, prefix, ...props }: any) => (
    <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</label>
        <div className="relative">
            {prefix && <span className="absolute left-3 top-2.5 text-gray-400">{prefix}</span>}
            <input
                name={name}
                type="number"
                value={value}
                onChange={onChange}
                className={`w-full ${prefix ? 'pl-7' : 'px-3'} py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-onyx-500 outline-none transition-all`}
                {...props}
            />
        </div>
    </div>
);

const MetricCard = ({ title, value, subtitle, icon, highlight, severity }: any) => {
    const isError = severity === 'error' || highlight;
    const isSuccess = severity === 'success';

    return (
        <div className={cn(
            "p-4 rounded-xl border transition-all duration-300 shadow-sm hover:shadow-md",
            isError ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30" :
                isSuccess ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30" :
                    "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
        )}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">{title}</span>
                <div className={cn(
                    "p-1.5 rounded-lg",
                    isError ? "bg-red-100/50 text-red-600" :
                        isSuccess ? "bg-emerald-100/50 text-emerald-600" :
                            "bg-gray-100 dark:bg-gray-700 text-gray-400"
                )}>
                    {icon}
                </div>
            </div>
            <div className={cn(
                "text-2xl font-black mb-1 tracking-tight",
                isError ? "text-red-700 dark:text-red-400" :
                    isSuccess ? "text-emerald-700 dark:text-emerald-400" :
                        "text-gray-800 dark:text-white"
            )}>
                {value}
            </div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-tight">
                {subtitle}
            </div>
        </div>
    );
};
