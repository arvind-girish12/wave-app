import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../utils/supabaseServerClient';

export async function POST(request) {
  try {
    const body = await request.json();
    const { unique_user_id, visits, login_email } = body;

    if (!unique_user_id) {
      return NextResponse.json(
        { success: false, error: 'unique_user_id is required' },
        { status: 400 }
      );
    }

    // First check if record exists
    const { data: existingRecord, error: fetchError } = await supabaseServer
      .from('page_visits')
      .select('*')
      .eq('unique_user_id', unique_user_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Prepare the data for update/insert
    let updateData = {
      unique_user_id,
      updated_at: new Date().toISOString()
    };

    // Add login_email if provided
    if (login_email) {
      updateData.login_email = login_email;
    }

    // Process visit increments
    if (visits && typeof visits === 'object') {
      const validColumns = [
        'login_visits',
        'onboarding_visits', 
        'dashboard_visits',
        'character_visits',
        'feedback_visits'
      ];

      for (const [column, increment] of Object.entries(visits)) {
        if (validColumns.includes(column) && typeof increment === 'number') {
          if (existingRecord) {
            // Increment existing value
            updateData[column] = (existingRecord[column] || 0) + increment;
          } else {
            // Set initial value for new record
            updateData[column] = increment;
          }
        }
      }
    }

    let result;
    if (existingRecord) {
      // Update existing record
      const { data, error } = await supabaseServer
        .from('page_visits')
        .update(updateData)
        .eq('unique_user_id', unique_user_id)
        .select();

      if (error) {
        throw error;
      }
      result = data;
    } else {
      // Create new record
      // Set default values for all visit columns
      const defaultData = {
        login_visits: 0,
        onboarding_visits: 0,
        dashboard_visits: 0,
        character_visits: 0,
        feedback_visits: 0,
        ...updateData
      };

      const { data, error } = await supabaseServer
        .from('page_visits')
        .insert([defaultData])
        .select();

      if (error) {
        throw error;
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: existingRecord ? 'Record updated successfully' : 'Record created successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}