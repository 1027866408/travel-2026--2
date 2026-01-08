import React, { useState, useMemo } from 'react';
import { 
  FileText, Plus, Trash2, Search, Zap, Wallet, 
  Building2, CalendarDays, ChevronRight,
  UserCheck, X, CheckCircle2,
  Users, CreditCard, Landmark, ArrowRight, MapPin, Info,
  Receipt, AlertTriangle, PieChart, Briefcase, User, Calendar, Calculator, Percent, UploadCloud, FileImage,
  Layers, Coins, RefreshCw, HandCoins, Gem, FileScan
} from 'lucide-react';

import { MOCK_APPLICATIONS, HARDSHIP_LOCATIONS } from './constants';
import { Trip, Expense, Traveler, BasicInfo, Loan } from './types';
import CityPicker from './components/CityPicker';
import ProjectPicker from './components/ProjectPicker';
import FilterableHeader from './components/FilterableHeader';

const App = () => {
  const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  // 状态
  const [isSyncing, setIsSyncing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // 人员库
  const [availableTravelers] = useState<Traveler[]>([
    { id: 'U1', name: '张三', code: '001245', level: 'M2', isMain: true, bankAccount: '6222 0210 **** 8888', bankName: '招商银行北京分行' },
    { id: 'U2', name: '李四', code: '001246', level: 'P5', isMain: false, bankAccount: '6217 0001 **** 1234', bankName: '建设银行上海分行' },
    { id: 'U3', name: '王五', code: '001247', level: 'P3', isMain: false, bankAccount: '6228 4801 **** 5678', bankName: '农业银行北京分行' }
  ]);

  // 基本信息
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    docNo: 'BX202401058892', 
    docDate: '2024-01-05',   
    creator: '张三',         
    reimburser: '张三',      
    costOrg: '用友网络科技股份有限公司', 
    costDept: '技术研发中心 / AI项目组', 
    description: '2024年1月西南西北地区技术调研差旅费', 
    requestId: '', 
    isProject: true, 
    projectType: '科研项目', 
    projectCode: 'RD-2024-AI-001 (人工智能大模型预研)', 
    fundSource: '专项资金'
  });

  // 行程明细
  const [trips, setTrips] = useState<Trip[]>([]);

  // 费用数据
  const [expenses, setExpenses] = useState<Expense[]>([
    { 
      id: 3, source: 'personal', category: '住宿', type: '酒店', date: '2024-01-06', 
      invoiceAmount: 900.00, reimbursableAmount: 800.00, taxRate: 6, taxAmount: 50.94, 
      payeeId: 'U2', desc: '喀什商务酒店(超标自付100)', policyStatus: 'ok', receipt: true 
    },
    { 
      id: 4, source: 'personal', category: '餐饮', type: '工作餐', date: '2024-01-07', 
      invoiceAmount: 450.00, reimbursableAmount: 450.00, taxRate: 0, taxAmount: 0,
      payeeId: 'U1', desc: '全组客户晚餐', policyStatus: 'ok', receipt: false 
    },
  ]);

  // 借款核销
  const [loans, setLoans] = useState<Loan[]>([
    { id: 'L1', orderNo: 'JK202312001', totalAmount: 5000, remainingAmount: 2000, clearingAmount: 1000 }
  ]);

  // --- 逻辑处理 ---
  const handleSelectApplication = (appId: string) => {
    if (!appId) return;
    setIsSyncing(true);
    setTimeout(() => {
      const appData = MOCK_APPLICATIONS.find(app => app.id === appId);
      if (appData) {
        setBasicInfo(prev => ({ ...prev, requestId: appData.id, description: appData.title }));
        setTrips(appData.trips.map(t => ({
          ...t,
          mainTravelerId: t.mainTravelerId || 'U1',
          fellowTravelerIds: t.fellowTravelerIds || [],
          specificHardshipArea: t.specificHardshipArea || ''
        })));
        setExpenses(prev => [...prev.filter(e => e.source === 'personal'), ...appData.corpExpenses]);
      }
      setIsSyncing(false);
    }, 600);
  };

  const updateTrip = (id: number | string, field: keyof Trip, value: any) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newTrip = { ...t, [field]: value };
      if (field === 'startDate' || field === 'endDate') {
        const start = new Date(field === 'startDate' ? value : newTrip.startDate);
        const end = new Date(field === 'endDate' ? value : newTrip.endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          start.setHours(0,0,0,0); end.setHours(0,0,0,0);
          const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          newTrip.days = diffDays >= 0 ? diffDays + 1 : 0;
        }
      }
      if (field === 'specificHardshipArea' && value !== '') newTrip.isHardship = true;
      return newTrip;
    }));
  };

  const addTrip = () => setTrips([...trips, { 
    id: Date.now(), from: '', to: '', startDate: '', startTime: '09:00', endDate: '', endTime: '18:00', 
    days: 1, isHardship: false, mainTravelerId: 'U1', fellowTravelerIds: [], specificHardshipArea: ''
  }]);

  const removeTrip = (id: number | string) => setTrips(prev => prev.filter(t => t.id !== id));

  const updateExpense = (id: number | string, field: keyof Expense, value: any) => {
    setExpenses(prev => prev.map(e => {
      if (e.id !== id) return e;
      const newExp = { ...e, [field]: value };
      if (field === 'invoiceAmount') {
        const val = Number(value);
        newExp.reimbursableAmount = (newExp.category === '餐饮' && val > 100) ? 100 : val;
        newExp.policyStatus = (newExp.category === '餐饮' && val > 100) ? 'warn' : 'ok';
        newExp.msg = newExp.policyStatus === 'warn' ? '超标自动核减' : '';
      }
      return newExp;
    }));
  };

  const totals = useMemo(() => {
    const settlementMap: Record<string, number> = {};
    availableTravelers.forEach(t => settlementMap[t.id] = 0);

    // 1. 艰苦补贴
    let totalHardshipAllowance = 0;
    trips.forEach(trip => {
      if (trip.isHardship) {
        const participantsCount = 1 + (trip.fellowTravelerIds?.length || 0);
        const allowance = Number(trip.days || 0) * 200 * participantsCount;
        totalHardshipAllowance += allowance;
        settlementMap[trip.mainTravelerId] = (settlementMap[trip.mainTravelerId] || 0) + allowance;
      }
    });

    // 2. 个人报销
    expenses.filter(e => e.source === 'personal').forEach(e => {
      settlementMap[e.payeeId] = (settlementMap[e.payeeId] || 0) + Number(e.reimbursableAmount || 0);
    });

    // 3. 扣除借款
    const totalCleared = loans.reduce((s, l) => s + Number(l.clearingAmount || 0), 0);
    const mainId = availableTravelers.find(t => t.name === basicInfo.reimburser)?.id || 'U1';
    settlementMap[mainId] = Math.max(0, (settlementMap[mainId] || 0) - totalCleared);

    const corpTotal = expenses.filter(e => e.source === 'corp').reduce((s, e) => s + Number(e.invoiceAmount || 0), 0);
    const persInvTotal = expenses.filter(e => e.source === 'personal').reduce((s, e) => s + Number(e.invoiceAmount || 0), 0);
    const persReimTotal = expenses.filter(e => e.source === 'personal').reduce((s, e) => s + Number(e.reimbursableAmount || 0), 0);
    const totalPayable = Object.values(settlementMap).reduce((a, b) => a + b, 0);

    return { 
      totalHardshipAllowance, 
      totalPayable, 
      corpTotal, 
      persInvTotal, 
      persReimTotal, 
      totalCleared, 
      grandTotal: corpTotal + persInvTotal + totalHardshipAllowance,
      settlementMap
    };
  }, [availableTravelers, trips, expenses, loans, basicInfo.reimburser]);

  const filteredPersonal = expenses.filter(e => e.source === 'personal' && (categoryFilter === 'all' || e.category === categoryFilter));
  const filteredCorp = expenses.filter(e => e.source === 'corp' && (categoryFilter === 'all' || e.category === categoryFilter));
  const uniqueCategories = Array.from(new Set(expenses.map(e => e.category)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 select-none">
      {/* 顶部工具栏 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-indigo-700 rounded-xl flex items-center justify-center text-white font-black shadow-indigo-500/20 shadow-xl italic text-xl">R</div>
          <div>
            <h1 className="text-sm font-black text-slate-800 tracking-tight">国内差旅报销结算</h1>
            <p className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-tighter">REF: {basicInfo.docNo}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">保存草稿</button>
          <button className="px-6 py-1.5 text-xs bg-indigo-600 text-white rounded-lg font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-1">
            <CheckCircle2 size={14}/> 提交审批
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 px-4 space-y-6">
        {/* 核心看板 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-2xl border border-slate-800 flex flex-col justify-between relative group">
            <div className="flex justify-between items-start z-10 text-indigo-400 uppercase text-[10px] font-black tracking-widest"><PieChart size={14}/> 总报销金额</div>
            <div className="mt-3 text-3xl font-black italic tracking-tighter z-10">¥ {totals.grandTotal.toLocaleString()}</div>
            <p className="text-[10px] opacity-40 mt-1 z-10">含统付 ¥{totals.corpTotal.toLocaleString()} + 个人 ¥{totals.persInvTotal.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm flex flex-col justify-between ring-2 ring-indigo-50/50">
            <div className="flex justify-between items-start text-indigo-600 uppercase text-[10px] font-black tracking-widest"><Wallet size={14}/> 应付员工合计</div>
            <div className="mt-3 text-3xl font-black text-indigo-700 tracking-tighter italic">¥ {totals.totalPayable.toLocaleString()}</div>
            <p className="text-[10px] text-indigo-400 mt-1 font-bold">补贴/垫付 - 借款核销</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 flex flex-col justify-between">
            <div className="flex justify-between items-start text-blue-600 uppercase text-[10px] font-black tracking-widest"><Building2 size={14}/> 公司统付总额</div>
            <div className="mt-3 text-3xl font-black text-blue-700 tracking-tighter italic">¥ {totals.corpTotal.toLocaleString()}</div>
            <p className="text-[10px] text-blue-400 mt-1 font-bold">商旅预订平台直接结算</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex flex-col justify-between">
            <div className="flex justify-between items-start text-amber-600 uppercase text-[10px] font-black tracking-widest"><HandCoins size={14}/> 本次核销借款</div>
            <div className="mt-3 text-3xl font-black text-amber-700 tracking-tighter italic">¥ {totals.totalCleared.toLocaleString()}</div>
            <p className="text-[10px] text-amber-400 mt-1 font-bold">自动从报销款中抵减</p>
          </div>
        </div>

        {/* 1. 基本信息 (已恢复详细字段) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 font-black text-[10px] text-slate-500 flex items-center gap-2 uppercase tracking-widest">
            <FileText size={14} className="text-indigo-600"/> 报销单基本属性
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">单据编号</label>
              <div className="border-b border-slate-100 py-1 text-sm font-bold text-slate-500 font-mono bg-slate-50 px-2 rounded-t">{basicInfo.docNo}</div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Calendar size={10}/> 单据日期</label>
              <input className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none" type="date" value={basicInfo.docDate} onChange={(e) => setBasicInfo({...basicInfo, docDate: e.target.value})}/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><User size={10}/> 创建人</label>
              <input className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none" value={basicInfo.creator} onChange={(e) => setBasicInfo({...basicInfo, creator: e.target.value})}/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><UserCheck size={10}/> 报销人</label>
              <select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none text-indigo-600 cursor-pointer" value={basicInfo.reimburser} onChange={(e) => setBasicInfo({...basicInfo, reimburser: e.target.value})}>
                {availableTravelers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase">费用承担组织 / 部门</label>
              <div className="flex items-center gap-2 border-b border-slate-100 py-1">
                <Building2 size={12} className="text-slate-400"/>
                <input className="text-sm font-bold bg-transparent outline-none w-full truncate" value={`${basicInfo.costOrg} / ${basicInfo.costDept}`} readOnly/>
              </div>
            </div>
             <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">出差申请单</label>
              <div className="relative">
                <select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none cursor-pointer text-indigo-600" value={basicInfo.requestId} onChange={(e) => handleSelectApplication(e.target.value)}>
                    <option value="">请选择申请单...</option>
                    {MOCK_APPLICATIONS.map(app => (<option key={app.id} value={app.id}>{app.title}</option>))}
                </select>
                {isSyncing && <RefreshCw size={10} className="absolute right-0 top-2 animate-spin text-indigo-500"/>}
              </div>
            </div>

            {/* 项目信息逻辑 */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">是否项目</label>
              <select 
                className={`w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none ${basicInfo.isProject ? 'text-indigo-600' : 'text-slate-500'}`}
                value={basicInfo.isProject ? 'yes' : 'no'} 
                onChange={(e) => setBasicInfo({...basicInfo, isProject: e.target.value === 'yes'})}
              >
                <option value="yes">是</option>
                <option value="no">否</option>
              </select>
            </div>

            {basicInfo.isProject && (
              <>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">关联项目</label>
                  <ProjectPicker value={basicInfo.projectCode} onChange={(val) => setBasicInfo({...basicInfo, projectCode: val})} placeholder="选择项目..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">项目类型</label>
                  <select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none" value={basicInfo.projectType} onChange={(e) => setBasicInfo({...basicInfo, projectType: e.target.value})}>
                    <option value="科研项目">科研项目</option>
                    <option value="非科研项目">非科研项目</option>
                    <option value="非项目支出">非项目支出</option>
                  </select>
                </div>
              </>
            )}

            <div className={`space-y-1 ${!basicInfo.isProject ? 'md:col-span-3' : 'md:col-span-1'}`}>
              <label className="text-[10px] text-slate-400 font-bold uppercase">资金来源</label>
              <select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none" value={basicInfo.fundSource} onChange={(e) => setBasicInfo({...basicInfo, fundSource: e.target.value})}>
                <option value="专项资金">专项资金</option>
                <option value="自筹">自筹</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-4">
              <label className="text-[10px] text-slate-400 font-bold uppercase">报销事由摘要</label>
              <input className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none" value={basicInfo.description} onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})} placeholder="请输入报销事由..."/>
            </div>
          </div>
        </div>

        {/* 2. 行程与人员 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 font-black text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={14} className="text-indigo-600"/> 差旅行程及参与人员
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-400 border-b border-slate-100 font-black uppercase text-[10px]">
                <tr>
                  <th className="p-4 w-10 text-center">序号</th>
                  <th className="p-4 w-40">行程路线</th>
                  <th className="p-4 w-60 text-center">日期段</th>
                  <th className="p-4 w-44 bg-amber-50/30">具体艰苦地区(县/镇)</th>
                  <th className="p-4 w-32">出行人 (主)</th>
                  <th className="p-4">同行人员</th>
                  <th className="p-4 w-20 text-center">艰苦</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {trips.map((trip, idx) => (
                  <tr key={trip.id} className="hover:bg-slate-50/50 group transition-all">
                    <td className="p-4 text-center font-black text-slate-300">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="p-4"><div className="flex items-center gap-2 font-black text-slate-700 relative z-40"><CityPicker value={trip.from} onChange={(v)=>updateTrip(trip.id, 'from', v)}/><ArrowRight size={10} className="text-slate-300"/><CityPicker value={trip.to} onChange={(v)=>updateTrip(trip.id, 'to', v)} autoHardshipCallback={(h)=>updateTrip(trip.id, 'isHardship', h)}/></div></td>
                    <td className="p-4"><div className="flex items-center justify-center gap-2 font-mono font-bold text-[10px] bg-white border border-slate-100 rounded-lg px-2 py-1 shadow-sm"><input type="date" className="bg-transparent outline-none w-24" value={trip.startDate} onChange={(e)=>updateTrip(trip.id, 'startDate', e.target.value)}/><span>~</span><input type="date" className="bg-transparent outline-none w-24" value={trip.endDate} onChange={(e)=>updateTrip(trip.id, 'endDate', e.target.value)}/></div></td>
                    <td className="p-4 bg-amber-50/10">
                      <div className="relative">
                        <select className={`w-full bg-white border rounded-lg px-2 py-1.5 font-bold outline-none appearance-none transition-all ${trip.specificHardshipArea ? 'border-amber-300 text-amber-700 ring-4 ring-amber-50' : 'border-slate-200 text-slate-400'}`} value={trip.specificHardshipArea} onChange={(e) => updateTrip(trip.id, 'specificHardshipArea', e.target.value)}>
                          <option value="">-- 选择艰苦地点 --</option>
                          {HARDSHIP_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                        {trip.specificHardshipArea && <Gem size={10} className="absolute right-2 top-2.5 text-amber-500"/>}
                      </div>
                    </td>
                    <td className="p-4">
                      <select className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-black text-slate-700 outline-none focus:border-indigo-400" value={trip.mainTravelerId} onChange={(e) => updateTrip(trip.id, 'mainTravelerId', e.target.value)}>
                        {availableTravelers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {availableTravelers.filter(t => t.id !== trip.mainTravelerId).map(t => (
                          <label key={t.id} className={`px-2 py-0.5 rounded-full border text-[9px] font-black cursor-pointer transition-all ${trip.fellowTravelerIds.includes(t.id) ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300'}`}>
                            <input type="checkbox" className="hidden" checked={trip.fellowTravelerIds.includes(t.id)} onChange={(e) => {
                              const newIds = e.target.checked ? [...trip.fellowTravelerIds, t.id] : trip.fellowTravelerIds.filter(id => id !== t.id);
                              updateTrip(trip.id, 'fellowTravelerIds', newIds);
                            }}/> {t.name}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button className={`p-2 rounded-xl border transition-all ${trip.isHardship ? 'bg-amber-100 border-amber-300 text-amber-600 shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-200'}`} onClick={() => updateTrip(trip.id, 'isHardship', !trip.isHardship)}>
                        <Zap size={14} fill={trip.isHardship ? "currentColor" : "none"}/>
                      </button>
                    </td>
                    <td className="p-4 text-center"><Trash2 size={16} className="text-slate-200 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-all" onClick={() => removeTrip(trip.id)}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addTrip} className="w-full py-3 text-[10px] font-black text-slate-400 bg-slate-50/50 hover:bg-slate-50 hover:text-indigo-600 border-t border-slate-100 uppercase tracking-widest transition-all">+ 新增行程段</button>
        </div>

        {/* 3. 费用模块 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Receipt size={16} className="text-indigo-600"/> 费用清单及税务抵扣</h3>
          </div>

          {/* 优化后的紧凑型发票上传工具栏 */}
          <div className="flex items-center justify-between bg-white border border-dashed border-indigo-200 rounded-xl px-4 py-3 shadow-sm hover:border-indigo-400 transition-all cursor-pointer group">
             <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <UploadCloud size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">点击上传或拖拽电子发票 (PDF/OFD/JPG)</span>
                  <span className="text-[10px] text-slate-400">系统将自动识别发票信息、查重并进行合规性校验</span>
                </div>
             </div>
             <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all">
                <FileScan size={12}/>
                启动智能扫描
             </button>
          </div>

          {/* 表1：员工报销 */}
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-xl overflow-hidden">
            <div className="px-6 py-3 bg-indigo-600 border-b border-indigo-700 flex justify-between items-center text-white">
              <span className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest"><UserCheck size={14} /> 1. 员工报销汇总 (个人垫付 + 补贴)</span>
              <div className="text-[10px] flex gap-4 font-black">
                <span className="opacity-70">垫付总额: ¥ {totals.persInvTotal.toLocaleString()}</span>
                <span className="bg-white/20 px-2 py-1 rounded">实报总额: ¥ {totals.persReimTotal.toLocaleString()}</span>
              </div>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 border-b border-slate-100 font-black uppercase text-[10px]">
                <tr>
                  <th className="p-4 w-12 text-center">票据</th>
                  <FilterableHeader title="类别" options={uniqueCategories} currentFilter={categoryFilter} onFilterChange={setCategoryFilter}/>
                  <th className="p-4">明细摘要</th>
                  <th className="p-4 w-24 text-indigo-600">收款人</th>
                  <th className="p-4 w-24 text-right">发票含税</th>
                  <th className="p-4 w-28 text-right bg-indigo-50/30 text-indigo-700">本次报销</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPersonal.map(exp => (
                  <tr key={exp.id} className="hover:bg-indigo-50/10 group transition-all">
                    <td className="p-4 text-center">
                      {!exp.receipt ? <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mx-auto border border-red-200 shadow-sm animate-pulse cursor-pointer"><UploadCloud size={14}/></div> : <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-200"><FileImage size={14}/></div>}
                    </td>
                    <td className="p-4 font-black text-indigo-600">{exp.type}</td>
                    <td className="p-4 text-slate-500 font-bold italic truncate max-w-[200px]">{exp.desc}</td>
                    <td className="p-4">
                      <select className="bg-white border border-indigo-100 rounded-lg px-1.5 py-1 font-black text-indigo-600 outline-none text-[10px] w-full" value={exp.payeeId} onChange={(e) => updateExpense(exp.id, 'payeeId', e.target.value)}>
                        {availableTravelers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-right text-slate-400 font-mono font-bold">¥ {Number(exp.invoiceAmount).toLocaleString()}</td>
                    <td className="p-4 text-right bg-indigo-50/20">
                      <div className="relative border-b-2 border-indigo-200"><span className="absolute left-0 text-indigo-300 font-black italic">¥</span><input type="number" className="w-full bg-transparent text-right font-black text-indigo-700 outline-none text-sm" value={exp.reimbursableAmount} onChange={(e) => updateExpense(exp.id, 'reimbursableAmount', e.target.value)}/></div>
                      {exp.policyStatus === 'warn' && <div className="text-[8px] text-orange-500 font-black mt-1 text-right tracking-tight">{exp.msg}</div>}
                    </td>
                    <td className="p-4 text-center"><X size={14} className="text-slate-200 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-all" onClick={() => setExpenses(expenses.filter(e => e.id !== exp.id))}/></td>
                  </tr>
                ))}
                <tr className="bg-amber-50/50">
                  <td className="p-4 text-center"><Zap size={14} className="text-amber-500 mx-auto" fill="currentColor"/></td>
                  <td className="p-4 text-amber-700 font-black italic" colSpan={2}>艰苦地区津贴 (包干) <span className="text-[8px] font-normal opacity-70 ml-2">根据行程自动计算</span></td>
                  <td className="p-4 font-black text-amber-600 text-[10px]">汇总至出行人</td>
                  <td className="p-4 text-right text-slate-300 text-[10px] font-mono">--</td>
                  <td className="p-4 text-right font-black text-amber-700 bg-indigo-50/10 text-sm italic">¥ {totals.totalHardshipAllowance.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 表2：公司统付 */}
          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden opacity-90">
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-blue-700 flex items-center gap-2 uppercase tracking-widest"><Building2 size={14} /> 2. 公司统付汇总 (商旅预订订单)</span>
              <span className="text-[10px] font-black text-blue-400">统付结算额: ¥ {totals.corpTotal.toLocaleString()}</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-300 border-b border-slate-100 font-black uppercase text-[10px]">
                <tr>
                  <th className="p-4 w-12 text-center">状态</th>
                  <th className="p-4 w-28">发生日期</th>
                  <th className="p-4 w-28">类别</th>
                  <th className="p-4">摘要信息</th>
                  <th className="p-4 w-24 text-right">发票金额</th>
                  <th className="p-4 w-24 text-right text-blue-600">入账金额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCorp.map(exp => (
                  <tr key={exp.id} className="hover:bg-blue-50/10 group">
                    <td className="p-4 text-center">{exp.policyStatus === 'warn' ? <AlertTriangle size={14} className="text-orange-400 mx-auto"/> : <CheckCircle2 size={14} className="text-green-500 mx-auto"/>}</td>
                    <td className="p-4 font-mono text-slate-400">{exp.date}</td>
                    <td className="p-4 font-black text-slate-700">{exp.type}</td>
                    <td className="p-4 text-slate-400 italic">{exp.desc}</td>
                    <td className="p-4 text-right font-bold text-slate-300">¥ {Number(exp.invoiceAmount).toLocaleString()}</td>
                    <td className="p-4 text-right font-black text-blue-700">¥ {Number(exp.invoiceAmount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. 核销借款 */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 font-black text-[10px] text-amber-700 flex justify-between items-center uppercase tracking-widest">
            <div className="flex items-center gap-2"><Landmark size={14} className="text-amber-600"/> 核销员工历史借款</div>
            <button className="text-[9px] bg-white text-amber-600 border border-amber-200 px-3 py-1 rounded-full font-black hover:bg-amber-600 hover:text-white transition-all shadow-sm">+ 调取借款单</button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-300 border-b border-slate-100 font-black uppercase tracking-tighter">
              <tr>
                <th className="p-4">借款单号</th>
                <th className="p-4 text-right">原始借款金额</th>
                <th className="p-4 text-right">当前未还余额</th>
                <th className="p-4 w-40 text-right text-amber-700 bg-amber-50/20">本次核销金额</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loans.map(loan => (
                <tr key={loan.id} className="hover:bg-amber-50/10 group">
                  <td className="p-4 font-mono font-black text-slate-500">{loan.orderNo}</td>
                  <td className="p-4 text-right font-bold text-slate-300">¥ {loan.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-right font-bold text-orange-400">¥ {loan.remainingAmount.toLocaleString()}</td>
                  <td className="p-4 text-right bg-amber-50/10">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-amber-300 font-black">¥</span>
                      <input type="number" className="w-28 text-right bg-transparent border-b-2 border-amber-200 font-black text-amber-700 outline-none text-sm" value={loan.clearingAmount} onChange={(e) => setLoans(loans.map(l => l.id === loan.id ? {...l, clearingAmount: Number(e.target.value)} : l))}/>
                    </div>
                  </td>
                  <td className="p-4 text-center"><X size={14} className="text-slate-200 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100" onClick={()=>setLoans(loans.filter(l=>l.id!==loan.id))}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. 资金结算明细 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mb-12">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 font-black text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <CreditCard size={14} className="text-indigo-600"/> 最终资金结算支付清单
          </div>
          <div className="p-6 space-y-4">
            {availableTravelers.filter(t => (totals.settlementMap[t.id] || 0) > 0).map(t => (
              <div key={t.id} className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:border-indigo-300 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200">{t.name[0]}</div>
                  <div>
                    <div className="flex items-center gap-3"><span className="text-base font-black text-slate-800">{t.name}</span><span className="text-[9px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-black">EMPLOYEE PAYABLE</span></div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono font-bold">{t.bankName} | {t.bankAccount}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-700 italic tracking-tighter">¥ {totals.settlementMap[t.id].toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">最终实付金额</div>
                </div>
              </div>
            ))}
            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end items-baseline gap-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">应付合计:</span>
              <span className="text-3xl font-black text-indigo-700 italic tracking-tighter">¥ {totals.totalPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;