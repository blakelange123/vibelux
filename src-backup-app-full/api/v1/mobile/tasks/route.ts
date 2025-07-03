// Mobile Tasks API
// Task management for mobile workforce

import { NextRequest, NextResponse } from 'next/server';
import { verifyMobileToken } from '@/lib/mobile-auth';

// Get tasks
export async function GET(request: NextRequest) {
  try {
    const user = await verifyMobileToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'today';
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');

    // Mock tasks data
    const tasks = [
      {
        id: 'task_1',
        title: 'Check pH levels',
        description: 'Test and adjust nutrient reservoir pH to 6.0',
        type: 'maintenance',
        priority: 'high',
        status: 'pending',
        roomId: 'room_1',
        roomName: 'Flower Room A',
        dueDate: new Date().toISOString(),
        dueTime: '10:00 AM',
        estimatedDuration: 15,
        assignedTo: user.userId,
        assignedBy: 'System',
        checklist: [
          { id: 'check_1', task: 'Test current pH', completed: false },
          { id: 'check_2', task: 'Add pH down if needed', completed: false },
          { id: 'check_3', task: 'Re-test after 10 minutes', completed: false },
          { id: 'check_4', task: 'Log final reading', completed: false }
        ],
        tools: ['pH meter', 'pH down solution'],
        notes: 'Target pH: 6.0, acceptable range: 5.8-6.2'
      },
      {
        id: 'task_2',
        title: 'Defoliation - Week 3',
        description: 'Remove lower fan leaves and any yellowing leaves',
        type: 'cultivation',
        priority: 'medium',
        status: 'in_progress',
        roomId: 'room_1',
        roomName: 'Flower Room A',
        dueDate: new Date().toISOString(),
        dueTime: '2:00 PM',
        estimatedDuration: 60,
        assignedTo: user.userId,
        assignedBy: 'Head Grower',
        checklist: [
          { id: 'check_5', task: 'Sanitize tools', completed: true },
          { id: 'check_6', task: 'Remove lower fan leaves', completed: false },
          { id: 'check_7', task: 'Remove yellowing leaves', completed: false },
          { id: 'check_8', task: 'Dispose of plant material', completed: false }
        ],
        tools: ['Pruning shears', 'Isopropyl alcohol', 'Collection bin'],
        notes: 'Focus on improving airflow and light penetration'
      },
      {
        id: 'task_3',
        title: 'Refill CO₂ tanks',
        description: 'Replace empty CO₂ tanks in Flower Room B',
        type: 'equipment',
        priority: 'high',
        status: 'pending',
        roomId: 'room_2',
        roomName: 'Flower Room B',
        dueDate: new Date().toISOString(),
        dueTime: '4:00 PM',
        estimatedDuration: 30,
        assignedTo: user.userId,
        assignedBy: 'System',
        checklist: [
          { id: 'check_9', task: 'Check current tank levels', completed: false },
          { id: 'check_10', task: 'Shut off CO₂ system', completed: false },
          { id: 'check_11', task: 'Replace empty tanks', completed: false },
          { id: 'check_12', task: 'Test system operation', completed: false }
        ],
        tools: ['Tank wrench', 'Leak detection solution'],
        notes: 'Ensure proper ventilation when handling CO₂'
      }
    ];

    // Apply filters
    let filteredTasks = tasks;
    
    if (filter === 'today') {
      const today = new Date().toDateString();
      filteredTasks = tasks.filter(t => 
        new Date(t.dueDate).toDateString() === today
      );
    } else if (filter === 'upcoming') {
      filteredTasks = tasks.filter(t => 
        new Date(t.dueDate) > new Date()
      );
    }
    
    if (roomId) {
      filteredTasks = filteredTasks.filter(t => t.roomId === roomId);
    }
    
    if (status) {
      filteredTasks = filteredTasks.filter(t => t.status === status);
    }

    return NextResponse.json({
      success: true,
      data: {
        tasks: filteredTasks,
        summary: {
          total: filteredTasks.length,
          pending: filteredTasks.filter(t => t.status === 'pending').length,
          inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
          completed: filteredTasks.filter(t => t.status === 'completed').length
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load tasks' },
      { status: 500 }
    );
  }
}

// Update task
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyMobileToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { taskId, updates } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID required' },
        { status: 400 }
      );
    }

    // Process updates
    const validUpdates = ['status', 'checklist', 'notes', 'timeSpent'];
    const processedUpdates: any = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (validUpdates.includes(key)) {
        processedUpdates[key] = value;
      }
    }

    // Log update
    const updateLog = {
      taskId,
      userId: user.userId,
      updates: processedUpdates,
      timestamp: new Date()
    };

    return NextResponse.json({
      success: true,
      data: {
        taskId,
        updates: processedUpdates,
        message: 'Task updated successfully'
      }
    });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// Create task note or completion report
export async function POST(request: NextRequest) {
  try {
    const user = await verifyMobileToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { taskId, type, content, photos } = body;

    if (!taskId || !type || !content) {
      return NextResponse.json(
        { success: false, error: 'Task ID, type, and content required' },
        { status: 400 }
      );
    }

    if (type === 'note') {
      const note = {
        id: `note_${Date.now()}`,
        taskId,
        userId: user.userId,
        content,
        timestamp: new Date()
      };

      return NextResponse.json({
        success: true,
        data: {
          note,
          message: 'Note added successfully'
        }
      });
    } else if (type === 'completion') {
      const report = {
        id: `report_${Date.now()}`,
        taskId,
        userId: user.userId,
        completedAt: new Date(),
        timeSpent: content.timeSpent,
        notes: content.notes,
        photos,
        checklist: content.checklist
      };

      return NextResponse.json({
        success: true,
        data: {
          report,
          message: 'Task completed successfully'
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Create task content error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}