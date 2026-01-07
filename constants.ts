import { Application, Project, City } from './types';

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'TRIP-2024-BJ001',
    title: '1月北京上海技术交流 (已批准)',
    date: '2024-01-04',
    trips: [
      { id: 101, from: '上海', to: '成都', startDate: '2024-01-05', startTime: '09:00', endDate: '2024-01-06', endTime: '12:00', days: 1, isHardship: false, mainTravelerId: 'U1', fellowTravelerIds: [], specificHardshipArea: '' },
      { id: 102, from: '成都', to: '喀什', startDate: '2024-01-06', startTime: '14:00', endDate: '2024-01-09', endTime: '18:00', days: 3, isHardship: true, mainTravelerId: 'U1', fellowTravelerIds: [], specificHardshipArea: '塔什库尔干县' }
    ],
    corpExpenses: [
      { id: 201, source: 'corp', category: '交通', type: '机票', date: '2024-01-05', invoiceAmount: 2500.00, reimbursableAmount: 2500.00, taxRate: 9, taxAmount: 206.42, payeeId: 'U1', desc: '上海-成都 (商旅预订)', policyStatus: 'ok', receipt: true },
      { id: 202, source: 'corp', category: '交通', type: '机票', date: '2024-01-06', invoiceAmount: 3600.00, reimbursableAmount: 3600.00, taxRate: 9, taxAmount: 297.25, payeeId: 'U1', desc: '成都-喀什 (旺季票价)', policyStatus: 'warn', msg: '需补充说明', receipt: true }
    ]
  },
  {
    id: 'TRIP-2024-SZ002',
    title: '2月深圳研发峰会 (常规城市)',
    date: '2024-02-10',
    trips: [
      { id: 103, from: '北京', to: '深圳', startDate: '2024-02-10', startTime: '10:00', endDate: '2024-02-12', endTime: '18:00', days: 2, isHardship: false, mainTravelerId: 'U1', fellowTravelerIds: [], specificHardshipArea: '' }
    ],
    corpExpenses: [
      { id: 203, source: 'corp', category: '住宿', type: '酒店', date: '2024-02-10', invoiceAmount: 1200.00, reimbursableAmount: 1200.00, taxRate: 6, taxAmount: 67.92, payeeId: 'U1', desc: '深圳湾万丽酒店', policyStatus: 'ok', receipt: true }
    ]
  }
];

export const HARDSHIP_LOCATIONS = [
  '策勒县', '于田县', '民丰县', '洛浦县', '皮山县', '墨玉县', '塔什库尔干县', '叶城县', '巴楚县', '伽师县', '岳普湖县',
  '改则县', '措勤县', '革吉县', '日土县', '札达县', '普兰县', '双湖县', '尼玛县', '申扎县', '班戈县', '治多县', '曲麻莱县'
];

export const MOCK_PROJECTS: Project[] = [
  { code: 'RD-2024-AI-001', name: '人工智能大模型预研' },
  { code: 'RD-2024-CLOUD-002', name: '云原生架构升级' },
  { code: 'MKT-2024-Q1-003', name: 'Q1市场推广专项' },
  { code: 'OP-2024-INT-004', name: '内部运营效率优化' }
];

export const CITIES: City[] = [
  { name: '北京', pinyin: 'beijing', hardship: false, tier: '一线' },
  { name: '上海', pinyin: 'shanghai', hardship: false, tier: '一线' },
  { name: '广州', pinyin: 'guangzhou', hardship: false, tier: '一线' },
  { name: '深圳', pinyin: 'shenzhen', hardship: false, tier: '一线' },
  { name: '成都', pinyin: 'chengdu', hardship: false, tier: '新一线' },
  { name: '喀什', pinyin: 'kashi', hardship: true, tier: '艰苦' },
  { name: '拉萨', pinyin: 'lasa', hardship: true, tier: '艰苦' },
  { name: '和田', pinyin: 'hetian', hardship: true, tier: '艰苦' },
  { name: '乌鲁木齐', pinyin: 'wulumuqi', hardship: false, tier: '省会' },
];

export const HOT_CITIES = ['北京', '上海', '广州', '深圳', '成都'];