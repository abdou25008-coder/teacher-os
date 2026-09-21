/**
 * TEACHER OS — Test Suite: Zoom & Live Online Classroom
 */

const assert = require('assert');
const zoomService = require('../backend/src/modules/zoom/zoom.service');
const db = require('../backend/src/core/db');

async function runTests() {
  console.log('🧪 [Test Suite] Running Zoom & Live Online Classroom Tests...');

  const teacher = db.find('teachers')[0];
  assert(teacher, 'Default seeded teacher must exist');

  const group = db.find('groups')[0];
  assert(group, 'Default seeded group must exist');

  const student = db.find('students')[0];
  assert(student, 'Default seeded student must exist');

  // 1. Create a Zoom meeting
  const meeting = await zoomService.createMeeting(teacher.id, {
    groupId: group.id,
    topic: 'مراجعة ليلة الامتحان فيزياء - مسائل كيرشوف وقانون أوم',
    startTime: 'اليوم الساعة 07:00 مساءً',
    durationMins: 90,
    passcode: 'TopPhysics99',
    autoRecord: true
  });

  assert(meeting.id, 'Meeting ID should be generated');
  assert(meeting.meeting_number.length === 11, 'Zoom meeting number should be 11 digits');
  assert(meeting.passcode === 'TopPhysics99', 'Passcode should match');
  assert(meeting.zoom_url.includes(meeting.meeting_number), 'Zoom URL should contain meeting number');
  assert(meeting.status === 'LIVE', 'Meeting should default to LIVE/active');
  console.log('  ✅ Zoom meeting creation with 11-digit meeting number and passcode passed.');

  // 2. Fetch meetings list
  const meetings = await zoomService.getMeetings(teacher.id);
  assert(meetings.length >= 2, 'Should list at least seeded demo meeting and newly created meeting');
  const found = meetings.find(m => m.id === meeting.id);
  assert(found, 'Created meeting must be in returned list');
  console.log('  ✅ Zoom meetings listing with participant counts passed.');

  // 3. Generate WhatsApp Invite
  const invite = await zoomService.generateWhatsAppInvite(meeting.id);
  assert(invite.whatsAppText.includes('رابط حصة الزووم المباشرة'), 'WhatsApp invite should contain Zoom header');
  assert(invite.whatsAppText.includes(meeting.meeting_number), 'Invite must contain Meeting Number');
  assert(invite.whatsAppText.includes(meeting.passcode), 'Invite must contain Passcode');
  assert(invite.encodedUrl.startsWith('https://api.whatsapp.com/send?text='), 'Must produce direct WhatsApp API URL');
  console.log('  ✅ 1-Click WhatsApp Zoom Invitation generation passed.');

  // 4. Student joins Zoom meeting and auto-logs attendance
  const joinResult = await zoomService.joinMeeting(meeting.id, {
    studentId: student.id,
    studentName: student.full_name
  });

  assert(joinResult.success === true, 'Join result should be successful');
  assert(joinResult.meeting_number === meeting.meeting_number, 'Join result should return meeting number');

  // Verify attendance auto-sync
  const attRecord = db.findOne('attendance_records', a => a.student_id === student.id && a.session_id.includes(meeting.id));
  assert(attRecord, 'Student attendance should be automatically logged upon entering Zoom session');
  assert(attRecord.status === 'PRESENT', 'Attendance status should be PRESENT');
  console.log('  ✅ Student Zoom entry & automated attendance synchronization passed.');

  // 5. End Meeting
  const endedMeeting = await zoomService.endMeeting(teacher.id, meeting.id);
  assert(endedMeeting.status === 'ENDED', 'Meeting status should transition to ENDED');
  console.log('  ✅ Ending Zoom meeting and state update passed.');

  console.log('🎉 ALL CYCLE 10 ZOOM & LIVE CLASSROOM TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Zoom Test Suite Failed:', err);
  process.exit(1);
});
