import React, { useState, useMemo } from 'react';
import { 
  FileText, Plus, Trash2, Search, Zap, Wallet, 
  Building2, CalendarDays, ChevronRight,
  UserCheck, X, CheckCircle2,
  Users, CreditCard, Landmark, ArrowRight, MapPin, Info,
  Receipt, AlertTriangle, PieChart, Briefcase, User, Calendar, Calculator, Percent, UploadCloud, FileImage,
  Layers, Coins, RefreshCw
} from 'lucide-react';

import { MOCK_APPLICATIONS } from './constants';
import { Trip, Expense, Traveler, BasicInfo } from './types';
import CityPicker from './components/CityPicker';
import ProjectPicker from './components/ProjectPicker';
import FilterableHeader from './components/FilterableHeader';

const App = () => {
  const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  // 状态：数据带出加载动画
  const [isSyncing, setIsSyncing] = useState(false);
  // 状态：费用类别筛选
  const [categoryFilter, setCategoryFilter] = useState('all');

  // 1. 同行人员名册
  const [travelers, setTravelers] = useState<Traveler[]>([
    { id: 'U1', name: '张三', code: '001245', level: 'M2', isMain: true, bankAccount: '6222 0210 **** 8888', bankName: '招商银行北京分行' },
    { id: 'U2', name: '李四', code: '001246', level: 'P5', isMain: false, bankAccount: '6217 0001 **** 1234', bankName: '建设银行上海分行' }
  ]);

  // 2. 基本信息
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    docNo: 'BX202401058892', 
    docDate: '2024-01-05',   
    creator: '张三',         
    reimburser: '张三',      
    costOrg: '用友网络科技股份有限公司', 
    costDept: '技术研发中心 / AI项目组', 
    description: '', 
    requestId: '', 
    isProject: true, 
    projectType: '科研项目', 
    projectCode: '', 
    fundSource: '专项资金', 
    currency: 'CNY - 人民币'
  });

  // 3. 行程明细
  const [trips, setTrips] = useState<Trip[]>([]);

  // 4. 费用清单
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

  // --- 业务逻辑 ---
  const handleSelectApplication = (appId: string) => {
    if (!appId) return;
    setIsSyncing(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      const appData = MOCK_APPLICATIONS.find(app => app.id === appId);
      if (appData) {
        setBasicInfo(prev => ({ 
          ...prev, 
          requestId: appData.id, 
          description: appData.title 
        }));
        setTrips(appData.trips);
        setExpenses(prev => {
          const personalExpenses = prev.filter(e => e.source === 'personal');
          return [...personalExpenses, ...appData.corpExpenses];
        });
      }
      setIsSyncing(false);
    }, 600);
  };

  const updateTrip = (id: number | string, field: keyof Trip, value: any) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newTrip = { ...t, [field]: value };
      
      // 日期联动天数计算
      if (field === 'startDate' || field === 'endDate') {
        const start = new Date(field === 'startDate' ? value : newTrip.startDate);
        const end = new Date(field === 'endDate' ? value : newTrip.endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          start.setHours(0,0,0,0); end.setHours(0,0,0,0);
          const diffTime = end.getTime() - start.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          newTrip.days = diffDays > 0 ? diffDays : (diffDays === 0 ? 1 : 0);
        }
      }
      return newTrip;
    }));
  };

  const addTrip = () => setTrips([...trips, { id: Date.now(), from: '', to: '', startDate: '', startTime: '09:00', endDate: '', endTime: '18:00', days: 1, isHardship: false }]);
  const removeTrip = (id: number | string) => trips.length > 0 && setTrips(trips.filter(t => t.id !== id));
  
  const addTraveler = () => {
    const name = window.prompt("请输入同行人姓名:");
    if (name) setTravelers([...travelers, { id: `U${Date.now()}`, name, code: 'NEW', level: 'P5', isMain: false, bankAccount: '待录入', bankName: '待录入' }]);
  };
  
  const removeTraveler = (id: string) => {
    const traveler = travelers.find(t => t.id === id);
    if (traveler && !traveler.isMain) {
        setTravelers(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateExpense = (id: number | string, field: keyof Expense, value: any) => {
    setExpenses(prev => prev.map(e => {
      if (e.id !== id) return e;
      const newExp = { ...e, [field]: value };
      
      if (field === 'invoiceAmount') {
        const val = Number(value);
        if (newExp.category === '餐饮' && val > 100) {
          newExp.reimbursableAmount = 100;
          newExp.policyStatus = 'warn'; newExp.msg = '超标自动核减';
        } else {
          newExp.reimbursableAmount = val;
          newExp.policyStatus = 'ok'; newExp.msg = '';
        }
        if (Number(newExp.taxRate) > 0) newExp.taxAmount = Number((Number(newExp.invoiceAmount) / (1 + Number(newExp.taxRate) / 100) * (Number(newExp.taxRate) / 100)).toFixed(2));
      } else if (field === 'taxRate') {
        const rate = Number(value);
        newExp.taxAmount = Number((Number(newExp.invoiceAmount) / (1 + rate / 100) * (rate / 100)).toFixed(2));
      }
      return newExp;
    }));
  };

  const updateExpensePayee = (expId: number | string, payeeId: string) => setExpenses(expenses.map(e => e.id === expId ? { ...e, payeeId } : e));
  const removeExpense = (id: number | string) => setExpenses(prev => prev.filter(e => e.id !== id));

  // --- 核心计算 ---
  const totals = useMemo(() => {
    const hardshipDays = trips.filter(t => t.isHardship).reduce((acc, curr) => acc + (Number(curr.days) || 0), 0);
    const hardshipAllowance = hardshipDays * 200 * travelers.length;
    
    const settlementMap: Record<string, number> = {};
    travelers.forEach(t => settlementMap[t.id] = 0);
    expenses.filter(e => e.source === 'personal').forEach(e => {
      settlementMap[e.payeeId] = (settlementMap[e.payeeId] || 0) + Number(e.reimbursableAmount);
    });
    
    const mainId = travelers.find(t => t.isMain)?.id || travelers[0].id;
    settlementMap[mainId] += hardshipAllowance;

    const corpTotal = expenses.filter(e => e.source === 'corp').reduce((s, e) => s + Number(e.invoiceAmount), 0);
    const personalInvoiceTotal = expenses.filter(e => e.source === 'personal').reduce((s, e) => s + Number(e.invoiceAmount), 0);
    const personalReimbursableTotal = expenses.filter(e => e.source === 'personal').reduce((s, e) => s + Number(e.reimbursableAmount), 0);
    const allowanceTotal = hardshipAllowance;
    const grandTotal = corpTotal + personalInvoiceTotal + allowanceTotal;
    const totalPayable = personalReimbursableTotal + allowanceTotal;
    const totalTax = expenses.reduce((s, e) => s + (Number(e.taxAmount) || 0), 0);
    const warningCount = expenses.filter(e => e.policyStatus === 'warn').length;
    const missingReceiptCount = expenses.filter(e => e.source === 'personal' && !e.receipt).length;

    return { hardshipDays, settlementMap, grandTotal, totalPayable, corpTotal, personalInvoiceTotal, personalReimbursableTotal, allowanceTotal, totalTax, warningCount, missingReceiptCount, travelersCount: travelers.length };
  }, [travelers, trips, expenses]);

  const filteredPersonalExpenses = expenses.filter(e => e.source === 'personal' && (categoryFilter === 'all' || e.category === categoryFilter));
  const filteredCorpExpenses = expenses.filter(e => e.source === 'corp' && (categoryFilter === 'all' || e.category === categoryFilter));
  const uniqueCategories = Array.from(new Set(expenses.map(e => e.category)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 select-none">
      {/* 顶部工具栏 */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold shadow-blue-500/20 shadow-lg italic text-lg">U</div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 tracking-tight">国内出差报销单</h1>
            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">单据编号: <span className="font-mono text-slate-600">{basicInfo.docNo}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 text-xs font-bold border rounded-md hover:bg-slate-50 transition-all text-slate-600">存草稿</button>
          <button className="px-6 py-1.5 text-xs bg-blue-600 text-white rounded-md font-bold shadow-lg transition-all flex items-center gap-1 hover:bg-blue-700 active:scale-95">
            <CheckCircle2 size={12}/> 提交审批
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
        {/* 顶部仪表盘 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl border border-slate-800 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Calculator size={100} fill="currentColor"/></div>
            <div className="flex justify-between items-start z-10"><span className="text-[10px] font-black opacity-50 uppercase tracking-widest flex items-center gap-1"><PieChart size={12} className="text-blue-400"/> 总金额合计</span></div>
            <div className="mt-2 text-2xl font-black italic tracking-tighter text-white z-10">¥ {totals.grandTotal.toLocaleString()}</div>
            <p className="text-[10px] opacity-40 mt-1 z-10">商旅 {totals.corpTotal.toLocaleString()} + 垫付 {totals.personalInvoiceTotal.toLocaleString()} + 补贴</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between relative group ring-2 ring-indigo-50">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet size={80} className="text-green-600"/></div>
            <div className="flex justify-between items-start"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Wallet size={12} className="text-green-600"/> 应付员工合计</span></div>
            <div className="mt-2 text-2xl font-black text-green-600 tracking-tighter italic">¥ {totals.totalPayable.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">可报销垫付 ¥{totals.personalReimbursableTotal.toLocaleString()} + 艰苦补贴</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 shadow-sm flex flex-col justify-between relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Building2 size={80} className="text-blue-600"/></div>
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-1"><Building2 size={12} className="text-blue-600"/> 商旅支付</span>
            <div className="mt-2 text-2xl font-black text-blue-700 tracking-tighter italic">¥ {totals.corpTotal.toLocaleString()}</div>
            <p className="text-[10px] text-blue-400 mt-1 font-medium">公司直接结算</p>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 shadow-sm flex flex-col justify-between relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Percent size={80} className="text-indigo-600"/></div>
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1"><Receipt size={12} className="text-indigo-600"/> 进项税额汇总</span>
            <div className="mt-2 text-2xl font-black text-indigo-700 tracking-tighter italic">¥ {totals.totalTax.toLocaleString()}</div>
            <p className="text-[10px] text-indigo-400 mt-1 font-medium">专票/客票可抵扣总额</p>
          </div>
        </div>

        {/* 1. 基本信息 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-500 flex items-center gap-2 uppercase tracking-wider">
            <FileText size={14} className="text-blue-600"/> 单据基本信息
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
              <input className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none text-blue-600" value={basicInfo.reimburser} onChange={(e) => setBasicInfo({...basicInfo, reimburser: e.target.value})}/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">费用承担组织</label>
              <div className="flex items-center gap-2 border-b border-slate-100 py-1"><Building2 size={12} className="text-slate-400"/><input className="text-sm font-bold bg-transparent outline-none w-full truncate" value={basicInfo.costOrg} onChange={(e) => setBasicInfo({...basicInfo, costOrg: e.target.value})}/></div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">费用承担部门</label>
              <div className="flex items-center gap-2 border-b border-slate-100 py-1"><Briefcase size={12} className="text-slate-400"/><input className="text-sm font-bold bg-transparent outline-none w-full truncate" value={basicInfo.costDept} onChange={(e) => setBasicInfo({...basicInfo, costDept: e.target.value})}/></div>
            </div>

            {/* 项目管控区 */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">是否项目关联</label>
              <div className="flex items-center gap-3 py-1.5">
                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="isProject" checked={basicInfo.isProject} onChange={() => setBasicInfo({...basicInfo, isProject: true})} className="text-blue-600"/><span className="text-xs font-bold">是</span></label>
                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="isProject" checked={!basicInfo.isProject} onChange={() => setBasicInfo({...basicInfo, isProject: false, projectType: '非项目支出', projectCode: ''})} className="text-blue-600"/><span className="text-xs font-bold text-slate-500">否</span></label>
              </div>
            </div>

            {basicInfo.isProject && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Layers size={10}/> 项目类型</label>
                  <select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none cursor-pointer" value={basicInfo.projectType} onChange={(e) => setBasicInfo({...basicInfo, projectType: e.target.value})}>
                    <option value="科研项目">科研项目</option>
                    <option value="非科研项目">非科研项目</option>
                    <option value="非项目支出">非项目支出</option>
                  </select>
                </div>
                {basicInfo.projectType !== '非项目支出' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Coins size={10}/> 资金来源</label>
                      <select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none cursor-pointer" value={basicInfo.fundSource} onChange={(e) => setBasicInfo({...basicInfo, fundSource: e.target.value})}>
                        <option value="自筹">自筹资金</option>
                        <option value="专项资金">专项资金</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">选择关联项目</label>
                      <ProjectPicker value={basicInfo.projectCode} onChange={(val) => setBasicInfo({...basicInfo, projectCode: val})} placeholder="输入编号或名称..." />
                    </div>
                  </>
                )}
              </>
            )}

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">出差申请单 (单号) <Info size={10} className="text-blue-400"/></label>
              <div className="relative">
                <select className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none cursor-pointer text-indigo-600 appearance-none pr-6 focus:border-indigo-500 transition-colors" value={basicInfo.requestId} onChange={(e) => handleSelectApplication(e.target.value)}>
                  <option value="">请选择出差申请 (带出行程与商旅订单)</option>
                  {MOCK_APPLICATIONS.map(app => (<option key={app.id} value={app.id}>{app.id} - {app.title}</option>))}
                </select>
                {isSyncing ? <RefreshCw size={12} className="absolute right-0 top-1.5 text-indigo-500 animate-spin"/> : <Search size={12} className="absolute right-0 top-1.5 text-slate-400 pointer-events-none"/>}
              </div>
            </div>

            <div className="space-y-1 md:col-span-4">
              <label className="text-[10px] text-slate-400 font-bold uppercase">报销说明</label>
              <input className="w-full border-b border-slate-100 py-1 text-sm font-bold bg-transparent outline-none focus:border-blue-500 transition-colors" value={basicInfo.description} onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})} placeholder="请输入详细的报销事由..."/>
            </div>
          </div>
        </div>

        {/* 2. 差旅人员与行程 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 font-bold text-[10px] text-slate-500 flex justify-between items-center uppercase tracking-widest">
            <div className="flex items-center gap-2"><Users size={14} className="text-blue-600"/> 差旅人员与行程</div>
          </div>
          <div className="p-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400 font-black uppercase">同行人员名册 ({totals.travelersCount}人)</label>
                <div className="text-[9px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded">* 系统将根据职级 (Level) 自动匹配差旅标准</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {travelers.map(t => (
                  <div key={t.id} className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border text-xs ${t.isMain ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <div title={`职级: ${t.level}`} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black cursor-help ${t.isMain ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{t.level}</div>
                    <span className="font-bold">{t.name}</span>
                    {!t.isMain && <X size={12} className="opacity-40 hover:opacity-100 cursor-pointer" onClick={()=>removeTraveler(t.id)}/>}
                  </div>
                ))}
                <button onClick={addTraveler} className="flex items-center justify-center w-8 h-8 rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all"><Plus size={14}/></button>
              </div>
            </div>
            <div className="space-y-2">
              {trips.length === 0 && <div className="text-center py-4 text-xs text-slate-400">暂无行程，请选择出差申请单或手动添加</div>}
              {trips.map((trip, idx) => (
                <div key={trip.id} className="flex items-start md:items-center gap-4 p-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all rounded-lg overflow-visible">
                  <div className="w-6 text-center font-black text-slate-200 text-xs mt-2 md:mt-0">#{idx+1}</div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 relative z-20">
                      <MapPin size={12} className="text-slate-300"/>
                      <CityPicker value={trip.from} placeholder="出发城市" onChange={(val) => updateTrip(trip.id, 'from', val)}/>
                      <ArrowRight size={12} className="text-slate-300"/>
                      <CityPicker value={trip.to} placeholder="目的城市" onChange={(val) => updateTrip(trip.id, 'to', val)} autoHardshipCallback={(isHardship) => updateTrip(trip.id, 'isHardship', isHardship)}/>
                    </div>
                    <div className="flex flex-col gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 w-6 text-right">开始</span>
                        <input type="date" className="text-[10px] bg-white border border-slate-200 rounded px-1 w-20 outline-none focus:border-blue-400" value={trip.startDate} onChange={(e)=>updateTrip(trip.id, 'startDate', e.target.value)}/>
                        <select className="text-[10px] bg-white border border-slate-200 rounded px-1 w-14 outline-none focus:border-blue-400" value={trip.startTime} onChange={(e)=>updateTrip(trip.id, 'startTime', e.target.value)}>{HOURS.map(h => <option key={h} value={h}>{h}</option>)}</select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 w-6 text-right">结束</span>
                        <input type="date" className="text-[10px] bg-white border border-slate-200 rounded px-1 w-20 outline-none focus:border-blue-400" value={trip.endDate} onChange={(e)=>updateTrip(trip.id, 'endDate', e.target.value)}/>
                        <select className="text-[10px] bg-white border border-slate-200 rounded px-1 w-14 outline-none focus:border-blue-400" value={trip.endTime} onChange={(e)=>updateTrip(trip.id, 'endTime', e.target.value)}>{HOURS.map(h => <option key={h} value={h}>{h}</option>)}</select>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="flex items-center gap-1"><input type="number" className="text-sm bg-white border border-slate-200 rounded w-10 text-center font-bold text-blue-600 outline-none" value={trip.days} onChange={(e)=>updateTrip(trip.id, 'days', e.target.value)}/><span className="text-[9px] font-bold text-slate-400">天</span></div>
                    <div className="flex items-center gap-1 border border-slate-200 rounded px-1 py-0.5 bg-white">
                      <span className="text-[9px] text-slate-400">艰苦地区:</span>
                      <select className={`text-[10px] font-bold outline-none bg-transparent cursor-pointer ${trip.isHardship ? 'text-amber-600' : 'text-slate-600'}`} value={trip.isHardship ? 'yes' : 'no'} onChange={(e) => updateTrip(trip.id, 'isHardship', e.target.value === 'yes')}><option value="no">否</option><option value="yes">是</option></select>
                    </div>
                    <Trash2 size={14} className="text-slate-200 hover:text-red-400 cursor-pointer" onClick={() => removeTrip(trip.id)} />
                  </div>
                </div>
              ))}
              <button onClick={addTrip} className="w-full py-2 text-[10px] font-bold text-slate-400 border border-dashed border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-500 transition-all">+ 增加行程段</button>
            </div>
          </div>
        </div>

        {/* 3. 费用清单 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Wallet size={16} className="text-blue-600"/> 费用明细与税务抵扣</h3>
            <div className="flex gap-2 text-[10px]">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>合规</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>超标</div>
            </div>
          </div>

          <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl p-6 text-center hover:bg-indigo-50 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><UploadCloud size={24} className="text-indigo-500"/></div>
              <div className="space-y-1"><p className="text-sm font-bold text-indigo-700">拖拽上传发票 / 点击扫描</p><p className="text-[10px] text-slate-400">餐饮票、酒店票、打车票统一上传，系统自动核减超标餐饮费</p></div>
            </div>
          </div>

          {/* 个人报销列表 */}
          <div className="bg-white rounded-xl border border-indigo-200 shadow-md overflow-hidden">
            <div className="px-6 py-2 bg-indigo-50/30 border-b border-indigo-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-indigo-700 flex items-center gap-2 uppercase"><UserCheck size={14} /> 1. 员工报销 (个人垫付+补贴)</span>
              <div className="text-[10px] flex gap-3">
                <span className="text-slate-400 font-bold">发票总额: ¥ {totals.personalInvoiceTotal.toLocaleString()}</span>
                <span className="text-indigo-600 font-black">实报总额: ¥ {totals.personalReimbursableTotal.toLocaleString()}</span>
              </div>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 border-b border-slate-100 font-bold uppercase tracking-tighter">
                <tr>
                  <th className="p-3 w-10 text-center">票据</th>
                  <FilterableHeader title="类别" options={uniqueCategories} currentFilter={categoryFilter} onFilterChange={setCategoryFilter}/>
                  <th className="p-3">摘要说明</th>
                  <th className="p-3 w-24 text-indigo-600">收款人</th>
                  <th className="p-3 w-24 text-right bg-slate-50/50">发票含税</th>
                  <th className="p-3 w-20 text-right">抵扣税</th>
                  <th className="p-3 w-24 text-right bg-indigo-50/30 text-indigo-700">本次报销</th>
                  <th className="p-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPersonalExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-indigo-50/10 group">
                    <td className="p-3 text-center">
                      {!exp.receipt ? <div className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center mx-auto cursor-pointer animate-pulse hover:scale-110 transition-transform shadow-sm border border-red-200" title="点击上传发票"><UploadCloud size={14}/></div> : <div className="w-6 h-6 rounded bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-200"><FileImage size={14}/></div>}
                    </td>
                    <td className="p-3 font-bold text-indigo-600">{exp.type}</td>
                    <td className="p-3 text-slate-600 font-medium italic"><div className="truncate max-w-[180px]" title={exp.desc}>{exp.desc}</div></td>
                    <td className="p-3">
                      <select className="bg-white border border-indigo-100 rounded px-1 py-0.5 font-bold text-indigo-600 outline-none text-[10px] w-full cursor-pointer hover:border-indigo-400 transition-colors" value={exp.payeeId} onChange={(e) => updateExpensePayee(exp.id, e.target.value)}>
                        {travelers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-right bg-slate-50/30">
                      <div className="relative"><span className="absolute left-0 text-slate-300">¥</span><input type="number" className="w-full bg-transparent text-right font-bold text-slate-500 outline-none" value={exp.invoiceAmount} onChange={(e) => updateExpense(exp.id, 'invoiceAmount', e.target.value)}/></div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <select className="text-[9px] bg-slate-100 rounded px-1 py-0.5 outline-none text-slate-500 font-bold" value={exp.taxRate} onChange={(e) => updateExpense(exp.id, 'taxRate', e.target.value)}>
                          <option value="0">0%</option><option value="6">6%</option><option value="9">9%</option><option value="13">13%</option>
                        </select>
                      </div>
                      <div className="text-[9px] text-indigo-400 font-bold mt-0.5">¥ {exp.taxAmount}</div>
                    </td>
                    <td className="p-3 text-right bg-indigo-50/20">
                      <div className="relative border-b border-indigo-200"><span className="absolute left-0 text-indigo-300">¥</span><input type="number" className="w-full bg-transparent text-right font-black text-indigo-700 outline-none" value={exp.reimbursableAmount} onChange={(e) => updateExpense(exp.id, 'reimbursableAmount', e.target.value)}/></div>
                      {exp.policyStatus === 'warn' && <div className="text-[8px] text-orange-500 font-bold mt-0.5 text-right">{exp.msg}</div>}
                    </td>
                    <td className="p-3 text-center"><X size={12} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer" onClick={() => removeExpense(exp.id)}/></td>
                  </tr>
                ))}
                <tr className="bg-amber-50/50">
                  <td className="p-3 text-center"><Zap size={12} className="text-amber-500 mx-auto" fill="currentColor"/></td>
                  <td className="p-3 text-amber-600 font-bold italic" colSpan={2}>
                    <div className="flex flex-col"><span>艰苦地区津贴 (包干)</span><span className="text-[9px] font-normal opacity-70">公式: ¥200/天 × {totals.hardshipDays}天(艰苦段) × {totals.travelersCount}人</span></div>
                  </td>
                  <td className="p-3 font-bold text-amber-700 text-[10px] align-top pt-3">{travelers.find(t=>t.isMain)?.name} (主)</td>
                  <td className="p-3 text-right text-slate-300 font-mono text-[10px] bg-slate-50/30">—</td>
                  <td className="p-3 text-right text-slate-300 font-mono text-[10px]">—</td>
                  <td className="p-3 text-right font-black text-amber-700 bg-indigo-50/10 align-top pt-3">¥ {totals.allowanceTotal.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 公司统付列表 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-2 bg-blue-50/30 border-b border-blue-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-blue-700 flex items-center gap-2 uppercase"><Building2 size={14} /> 2. 公司统付 (商旅)</span>
              <span className="text-[10px] font-bold text-slate-400">小计: ¥ {totals.corpTotal.toLocaleString()}</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 border-b border-slate-100 font-bold uppercase tracking-tighter">
                <tr>
                  <th className="p-3 w-10">状态</th>
                  <FilterableHeader title="类别" options={uniqueCategories} currentFilter={categoryFilter} onFilterChange={setCategoryFilter}/>
                  <th className="p-3">说明</th>
                  <th className="p-3 w-24 text-right">发票含税额</th>
                  <th className="p-3 w-24 text-right">抵扣税额</th>
                  <th className="p-3 w-24 text-right">报销入账</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCorpExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-blue-50/10">
                    <td className="p-3 text-center">{exp.policyStatus === 'warn' ? <AlertTriangle size={14} className="text-orange-500 mx-auto" title={exp.msg}/> : <CheckCircle2 size={14} className="text-green-500 mx-auto"/>}</td>
                    <td className="p-3 text-slate-500 font-medium">{exp.date}</td>
                    <td className="p-3 font-bold text-slate-700">{exp.type}</td>
                    <td className="p-3 text-slate-500 flex flex-col justify-center"><span>{exp.desc}</span>{exp.policyStatus === 'warn' && <span className="text-[9px] text-orange-600 font-bold">{exp.msg}</span>}</td>
                    <td className="p-3 text-right font-medium text-slate-500">¥ {Number(exp.invoiceAmount).toFixed(2)}</td>
                    <td className="p-3 text-right text-indigo-500 text-[10px] font-bold">
                      <div className="flex flex-col items-end"><span>¥ {exp.taxAmount}</span><span className="text-[9px] opacity-60">{exp.taxRate}%</span></div>
                    </td>
                    <td className="p-3 text-right font-black text-slate-800">¥ {Number(exp.invoiceAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. 资金结算信息 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 font-bold text-[10px] text-slate-500 flex justify-between items-center uppercase tracking-widest">
            <div className="flex items-center gap-2"><Landmark size={14} className="text-blue-600"/> 资金结算信息 (推送四库系统)</div>
            <div className="flex items-center gap-1 text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100"><Zap size={10} fill="currentColor"/> 结构化数据已生成</div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 gap-3">
              {travelers.filter(t => (totals.settlementMap[t.id] || 0) > 0).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 shadow-sm">{t.name[0]}</div>
                    <div>
                      <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-700">{t.name}</span><span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">员工报销</span></div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5 font-mono"><span className="flex items-center gap-1"><CreditCard size={10}/> {t.bankAccount || '待录入'}</span><span className="flex items-center gap-1"><Building2 size={10}/> {t.bankName || '待录入'}</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-indigo-600 italic">¥ {totals.settlementMap[t.id]?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="text-[9px] text-slate-400 font-bold">实付金额</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400">结算笔数: {travelers.filter(t => (totals.settlementMap[t.id] || 0) > 0).length} 笔</span>
              <div className="flex items-baseline gap-2"><span className="text-xs font-bold text-slate-600">本次资金支出合计:</span><span className="text-xl font-black text-indigo-600">¥ {totals.totalPayable.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
            </div>
          </div>
        </div>

        {/* 5. 审批流 */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase size={12}/> 预计审批流程</p>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex flex-col items-center gap-1 opacity-50"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">张</div><span className="text-[9px] font-bold text-slate-400">发起人</span></div>
            <div className="h-0.5 w-8 bg-slate-200"></div>
            <div className="flex flex-col items-center gap-1"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 border border-blue-200">刘</div><span className="text-[9px] font-bold text-slate-600">项目经理</span></div>
            <div className="h-0.5 w-8 bg-slate-200"></div>
            <div className="flex flex-col items-center gap-1 opacity-50"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">财</div><span className="text-[9px] font-bold text-slate-400">财务初审</span></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;