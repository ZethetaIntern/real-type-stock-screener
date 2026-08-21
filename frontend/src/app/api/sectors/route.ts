import { NextResponse } from 'next/server';
import { SECTORS } from '@/types/stock';

const SECTOR_INDUSTRY_MAP: Record<string, string[]> = {
  IT: ['Software Services', 'IT Consulting', 'BPO', 'Hardware', 'Semiconductors'],
  Banking: ['Private Bank', 'Public Bank', 'NBFC', 'Insurance', 'Asset Management'],
  Pharma: ['Generic Drugs', 'API', 'Formulations', 'Biotech', 'Herbal'],
  FMCG: ['Personal Care', 'Food Products', 'Household Care', 'Beverages', 'Tobacco'],
  Auto: ['Automobiles', 'Auto Components', 'Two Wheelers', 'Commercial Vehicles', 'Tractors'],
  Metal: ['Steel', 'Aluminium', 'Copper', 'Mining', 'Ferro Alloys'],
  Energy: ['Oil & Gas', 'Power Generation', 'Power Distribution', 'Renewable Energy', 'Coal'],
  Realty: ['Real Estate', 'Construction', 'Infrastructure', 'Cement', 'Building Materials'],
  Telecom: ['Telecom Services', 'Tower Infrastructure', 'Network Equipment', 'Content Providers', 'Cable TV'],
  Infrastructure: ['EPC', 'Roads', 'Highways', 'Bridges', 'Urban Infrastructure'],
  Media: ['Media & Entertainment', 'Broadcasting', 'Publishing', 'Digital Media', 'Film Production'],
  Others: ['Diversified', 'Trading', 'Financial Services', 'Logistics', 'Textiles'],
};

export async function GET() {
  const data = SECTORS.map((sector) => ({
    sector,
    industries: SECTOR_INDUSTRY_MAP[sector] || [],
  }));

  return NextResponse.json({
    success: true,
    data,
    meta: { total: data.length, page: 1, pageSize: data.length, timestamp: new Date().toISOString(), executionTimeMs: 0 },
  });
}
