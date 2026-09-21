/**
 * Unit & Integration Test Suite for EduSocial Community & Multi-Teacher Ecosystem
 */

const assert = require('assert');
const communityService = require('../backend/src/modules/community/community.service');
const studentService = require('../backend/src/modules/student/student.service');
const parentService = require('../backend/src/modules/parent/parent.service');
const db = require('../backend/src/core/db');

async function runTests() {
  console.log('🧪 [Test Suite] Running EduSocial Community & Multi-Teacher Tests...');

  // 1. Verify Feed Retrieval
  const feed = await communityService.getFeed({ userId: 'stu-demo-1', userRole: 'STUDENT' });
  assert(Array.isArray(feed), 'Feed must be an array');
  assert(feed.length >= 3, 'Feed should contain at least 3 seeded posts');
  console.log(`  ✅ Feed retrieved successfully with ${feed.length} posts.`);

  // 2. Verify Poll Structure & Percentage Calculation
  const pollPost = feed.find(p => p.post_type === 'POLL');
  assert(pollPost, 'Must have at least one poll post in feed');
  assert(Array.isArray(pollPost.poll_options), 'Poll must have options');
  assert(pollPost.poll_options.length >= 2, 'Poll must have at least 2 options');
  assert(typeof pollPost.total_votes === 'number' && pollPost.total_votes > 0, 'Total votes should be calculated');
  assert(pollPost.poll_options[0].pct !== undefined, 'Option should have calculated percentage');
  console.log(`  ✅ Poll calculation verified. Total votes: ${pollPost.total_votes}`);

  // 3. Cast Vote
  const optionToVote = pollPost.poll_options[0].id;
  const voteResult = await communityService.interactPost({
    postId: pollPost.id,
    userId: 'test-user-voter-1',
    userType: 'STUDENT',
    interactionType: 'VOTE',
    metadata: { option_id: optionToVote }
  });
  assert.strictEqual(voteResult.action, 'VOTED', 'Vote action should be VOTED');
  
  // Prevent duplicate voting
  await assert.rejects(
    async () => {
      await communityService.interactPost({
        postId: pollPost.id,
        userId: 'test-user-voter-1',
        userType: 'STUDENT',
        interactionType: 'VOTE',
        metadata: { option_id: optionToVote }
      });
    },
    /لقد قمت بالتصويت بالفعل/,
    'Should reject duplicate vote from same user'
  );
  console.log('  ✅ Interactive voting and duplicate prevention verified.');

  // 4. Like and Unlike Post
  const initialLikes = pollPost.likes_count;
  const likeResult = await communityService.interactPost({
    postId: pollPost.id,
    userId: 'test-user-liker-1',
    userType: 'STUDENT',
    interactionType: 'LIKE'
  });
  assert.strictEqual(likeResult.action, 'LIKED');
  assert.strictEqual(likeResult.likes_count, initialLikes + 1);

  const unlikeResult = await communityService.interactPost({
    postId: pollPost.id,
    userId: 'test-user-liker-1',
    userType: 'STUDENT',
    interactionType: 'LIKE'
  });
  assert.strictEqual(unlikeResult.action, 'UNLIKED');
  assert.strictEqual(unlikeResult.likes_count, initialLikes);
  console.log('  ✅ Post Like and Unlike toggle verified.');

  // 5. Add Comment
  const comment = await communityService.addComment({
    postId: pollPost.id,
    userId: 'stu-demo-1',
    userName: 'أحمد محمود',
    userType: 'STUDENT',
    content: 'استفسار مهم: هل تتغير شدة التيار في الفرع الثاني أيضاً؟'
  });
  assert(comment.id, 'Comment should have an ID');
  assert.strictEqual(comment.content, 'استفسار مهم: هل تتغير شدة التيار في الفرع الثاني أيضاً؟');
  console.log('  ✅ Comment posted and linked to post.');

  // 6. Teacher Creates Post
  const newPost = await communityService.createPost({
    teacherId: 'tch-tarek-001',
    title: '📢 إعلان مراجعة نهائية مجانية على زووم',
    content: 'سيتم عقد ورشة عمل تفاعلية لحل 50 مسألة متقدمة في الحث الكهرومغناطيسي يوم الجمعة القادم.',
    postType: 'POST',
    subject: 'فيزياء ثانوية عامة'
  });
  assert(newPost.id, 'New post should be created with ID');
  assert.strictEqual(newPost.teacher_id, 'tch-tarek-001');
  console.log('  ✅ Teacher post publication verified.');

  // 7. Teacher Directory & Follow / Unfollow
  const directory = await communityService.getTeacherDirectory({ studentId: 'stu-demo-1' });
  assert(Array.isArray(directory), 'Directory must be an array');
  assert(directory.length >= 3, 'Directory should have at least 3 teachers');
  const tarek = directory.find(t => t.id === 'tch-tarek-001');
  assert(tarek, 'Teacher Tarek must exist in directory');
  assert(tarek.is_following === true, 'Student 1 is following Teacher Tarek');

  // Follow Teacher Sherif
  const followResult = await communityService.followTeacher({ studentId: 'stu-demo-4', teacherId: 'tch-sherif-003' });
  assert(followResult.status === 'FOLLOWED' || followResult.status === 'ALREADY_FOLLOWING');

  const unfollowResult = await communityService.unfollowTeacher({ studentId: 'stu-demo-4', teacherId: 'tch-sherif-003' });
  assert.strictEqual(unfollowResult.status, 'UNFOLLOWED');
  console.log('  ✅ Teacher Directory & Follow / Unfollow engine verified.');

  // 8. Multi-Teacher Enrollment
  const enrollResult = await communityService.enrollStudent({
    studentId: 'stu-demo-3', // Youssef Karim
    teacherId: 'tch-khaled-002', // Chemistry
    groupId: 'grp-chem-001'
  });
  assert.strictEqual(enrollResult.status, 'ENROLLED_SUCCESSFULLY');
  assert(enrollResult.membership.id, 'Should create membership');
  assert(enrollResult.subscription.id, 'Should create subscription');
  console.log('  ✅ Multi-Teacher Cross-Enrollment verified.');

  // 9. Parent Portal Multi-Teacher View
  const parentPulse = await parentService.getChildPulse('stu-demo-1');
  assert(Array.isArray(parentPulse.enrolled_subjects), 'Parent pulse must include enrolled_subjects');
  assert(parentPulse.enrolled_subjects.length >= 2, 'Student 1 should be enrolled in multiple subjects/teachers');
  console.log(`  ✅ Parent Multi-Teacher View verified: Student enrolled in ${parentPulse.enrolled_subjects.length} subjects.`);

  // 10. Student Portal Multi-Teacher Day View
  const studentDay = await studentService.getMyLearningDay('stu-demo-1');
  assert(Array.isArray(studentDay.enrolled_teachers), 'Student day must include enrolled_teachers');
  assert(studentDay.enrolled_teachers.length >= 2, 'Student 1 should see all enrolled teachers');
  console.log(`  ✅ Student Multi-Teacher Learning Day verified: ${studentDay.enrolled_teachers.length} teachers linked.`);

  console.log('\n🎉 [EduSocial & Multi-Teacher Suite] ALL 10 TESTS PASSED WITH 100% SUCCESS!');
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
