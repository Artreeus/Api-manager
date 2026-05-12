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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const provider = searchParams.get('provider') || '';
    const environment = searchParams.get('environment') || '';
    const tags = searchParams.get('tags') || '';

    await dbConnect();

    interface ApiKeyQuery {
      userId: string;
      provider?: string;
      environment?: string;
      tags?: { $in: string[] | RegExp[] };
      $or?: Array<{ [key: string]: any }>;
    }

    let query: ApiKeyQuery = { userId: session.user.id };

    if (search) {
      query.$or = [
        { label: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (provider) {
      query.provider = provider;
    }

    if (environment) {
      query.environment = environment;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const apiKeys = await ApiKey.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { label, encryptedKey, notes, tags, provider, environment } = await request.json();

    if (!label || !encryptedKey) {
      return NextResponse.json(
        { error: 'Label and API key are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const apiKey = await ApiKey.create({
      userId: session.user.id,
      label,
      encryptedKey,
      notes: notes || '',
      tags: tags || [],
      provider: provider || 'other',
      environment: environment || 'production',
    });

    return NextResponse.json(apiKey, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}