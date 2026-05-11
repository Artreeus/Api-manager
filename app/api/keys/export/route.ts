import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ApiKey from '@/lib/models/ApiKey';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const apiKeys = await ApiKey.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Remove sensitive server data, keep only what's needed for export
    const exportData = apiKeys.map(key => ({
      label: key.label,
      encryptedKey: key.encryptedKey,
      notes: key.notes,
      tags: key.tags,
      provider: key.provider,
      environment: key.environment,
      createdAt: key.createdAt,
    }));

    const exportPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      keys: exportData,
    };

    return NextResponse.json(exportPayload);
  } catch (error) {
    console.error('Error exporting API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}