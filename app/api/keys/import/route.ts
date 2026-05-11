import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ApiKey from '@/lib/models/ApiKey';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keys, overwrite = false } = await request.json();

    if (!keys || !Array.isArray(keys)) {
      return NextResponse.json(
        { error: 'Invalid import data' },
        { status: 400 }
      );
    }

    await dbConnect();

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const keyData of keys) {
      try {
        if (!keyData.label || !keyData.encryptedKey) {
          errors.push(`Skipping key: missing label or encrypted key`);
          skipped++;
          continue;
        }

        // Check if key with same label already exists
        const existingKey = await ApiKey.findOne({
          userId: session.user.id,
          label: keyData.label,
        });

        if (existingKey && !overwrite) {
          errors.push(`Skipping key "${keyData.label}": already exists`);
          skipped++;
          continue;
        }

        if (existingKey && overwrite) {
          await ApiKey.findByIdAndUpdate(existingKey._id, {
            encryptedKey: keyData.encryptedKey,
            notes: keyData.notes || '',
            tags: keyData.tags || [],
            provider: keyData.provider || 'other',
            environment: keyData.environment || 'production',
          });
        } else {
          await ApiKey.create({
            userId: session.user.id,
            label: keyData.label,
            encryptedKey: keyData.encryptedKey,
            notes: keyData.notes || '',
            tags: keyData.tags || [],
            provider: keyData.provider || 'other',
            environment: keyData.environment || 'production',
          });
        }

        imported++;
      } catch (error) {
        errors.push(`Error importing key "${keyData.label}": ${error.message}`);
        skipped++;
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      errors,
      message: `Successfully imported ${imported} keys, skipped ${skipped}`,
    });
  } catch (error) {
    console.error('Error importing API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}