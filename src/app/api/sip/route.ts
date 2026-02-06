import { NextRequest, NextResponse } from 'next/server';
import { validateInputValues } from '@/lib/validation';
import { getDailyPrices } from '@/lib/marketData';
import { computeSipFromDaily } from '@/lib/sip';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { ok, errors, inputs } = validateInputValues({
    ticker: searchParams.get('ticker') ?? undefined,
    amount: searchParams.get('amount') ?? undefined,
    start: searchParams.get('start') ?? undefined,
    end: searchParams.get('end') ?? undefined,
    rule: searchParams.get('rule') ?? undefined
  });

  if (!ok || !inputs) {
    return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
  }

  try {
    const { data, source, warnings } = await getDailyPrices(inputs.ticker, inputs.start, inputs.end);
    const computed = computeSipFromDaily(inputs, data);
    const mergedWarnings = [...warnings, ...computed.warnings];

    return NextResponse.json({
      inputs,
      summary: computed.summary,
      monthly: computed.monthly,
      meta: {
        data_source: source,
        last_close_date: computed.summary.last_close_date,
        warnings: mergedWarnings
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || 'Failed to fetch market data.'
      },
      { status: 500 }
    );
  }
}
