/**
 * TEACHER OS — EduSocial Community & Multi-Teacher Network Service
 * Handles academic social feed, polls, voice notes, follows, directory, and cross-teacher enrollment.
 */

const db = require('../../core/db');

class CommunityService {
  /**
   * Get EduSocial Academic Feed
   */
  async getFeed({ userId = null, userRole = null, subject = null } = {}) {
    let allPosts = db.find('posts');

    if (subject && subject !== 'ALL') {
      allPosts = allPosts.filter(p => p.subject && p.subject.includes(subject));
    }

    // Sort newest first
    allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const enrichedPosts = allPosts.map(post => {
      // Check user interaction
      let hasLiked = false;
      let userVotedOption = null;

      if (userId) {
        const likeInter = db.findOne('post_interactions', i => 
          i.post_id === post.id && i.user_id === userId && i.interaction_type === 'LIKE'
        );
        hasLiked = !!likeInter;

        const voteInter = db.findOne('post_interactions', i => 
          i.post_id === post.id && i.user_id === userId && i.interaction_type === 'VOTE'
        );
        if (voteInter && voteInter.metadata) {
          userVotedOption = voteInter.metadata.option_id;
        }
      }

      // Calculate total poll votes
      let totalVotes = 0;
      let optionsWithPct = [];
      if (post.post_type === 'POLL' && Array.isArray(post.poll_options)) {
        totalVotes = post.poll_options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
        optionsWithPct = post.poll_options.map(opt => ({
          ...opt,
          pct: totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0
        }));
      }

      // Fetch comments
      const comments = db.find('post_comments', c => c.post_id === post.id);
      comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      return {
        ...post,
        poll_options: optionsWithPct.length > 0 ? optionsWithPct : post.poll_options,
        total_votes: totalVotes,
        has_liked: hasLiked,
        user_voted_option: userVotedOption,
        comments
      };
    });

    return enrichedPosts;
  }

  /**
   * Create new post (Teachers Only)
   */
  async createPost({ teacherId, title, content, postType = 'POST', pollOptions = [], audioUrl = null, subject = null }) {
    const teacher = db.findById('teachers', teacherId);
    if (!teacher) {
      throw new Error('المعلم غير موجود أو غير مصرح له بالنشر');
    }

    let processedOptions = null;
    if (postType === 'POLL') {
      if (!Array.isArray(pollOptions) || pollOptions.length < 2) {
        throw new Error('سؤال التصويت يجب أن يحتوي على خيارين على الأقل');
      }
      processedOptions = pollOptions.map((opt, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        text: typeof opt === 'string' ? opt.trim() : opt.text,
        votes: 0
      }));
    }

    const post = db.insert('posts', {
      teacher_id: teacher.id,
      teacher_name: teacher.full_name,
      teacher_title: teacher.professional_title || 'أستاذ المادة',
      subject: subject || 'الفيزياء',
      post_type: postType,
      title: title || 'منشور تعليمي جديد',
      content: content || '',
      poll_options: processedOptions,
      audio_url: audioUrl,
      duration: postType === 'VOICE_NOTE' ? '1:00 دقيقة' : null,
      likes_count: 0,
      comments_count: 0
    });

    return post;
  }

  /**
   * Toggle Like or Cast Vote on Post
   */
  async interactPost({ postId, userId, userType = 'STUDENT', interactionType, metadata = {} }) {
    const post = db.findById('posts', postId);
    if (!post) {
      throw new Error('المنشور غير موجود');
    }

    if (interactionType === 'LIKE') {
      const existingLike = db.findOne('post_interactions', i => 
        i.post_id === postId && i.user_id === userId && i.interaction_type === 'LIKE'
      );

      if (existingLike) {
        // Unlike
        db.delete('post_interactions', existingLike.id);
        post.likes_count = Math.max(0, (post.likes_count || 1) - 1);
        db.update('posts', post.id, { likes_count: post.likes_count });
        return { action: 'UNLIKED', likes_count: post.likes_count };
      } else {
        // Like
        db.insert('post_interactions', {
          post_id: postId,
          user_id: userId,
          user_type: userType,
          interaction_type: 'LIKE'
        });
        post.likes_count = (post.likes_count || 0) + 1;
        db.update('posts', post.id, { likes_count: post.likes_count });
        return { action: 'LIKED', likes_count: post.likes_count };
      }
    }

    if (interactionType === 'VOTE') {
      const optionId = metadata.option_id;
      if (!optionId) {
        throw new Error('يجب تحديد خيار التصويت');
      }

      const existingVote = db.findOne('post_interactions', i => 
        i.post_id === postId && i.user_id === userId && i.interaction_type === 'VOTE'
      );
      if (existingVote) {
        throw new Error('لقد قمت بالتصويت بالفعل في هذا السؤال');
      }

      if (!Array.isArray(post.poll_options)) {
        throw new Error('هذا المنشور لا يحتوي على استطلاع رأي');
      }

      const option = post.poll_options.find(o => o.id === optionId);
      if (!option) {
        throw new Error('الخيار المحدد غير صالح');
      }

      option.votes = (option.votes || 0) + 1;
      db.update('posts', post.id, { poll_options: post.poll_options });

      db.insert('post_interactions', {
        post_id: postId,
        user_id: userId,
        user_type: userType,
        interaction_type: 'VOTE',
        metadata: { option_id: optionId }
      });

      return { action: 'VOTED', poll_options: post.poll_options };
    }

    throw new Error('نوع التفاعل غير مدعوم');
  }

  /**
   * Add comment to post
   */
  async addComment({ postId, userId, userName, userType = 'STUDENT', content }) {
    if (!content || !content.trim()) {
      throw new Error('نص التعليق لا يمكن أن يكون فارغاً');
    }

    const post = db.findById('posts', postId);
    if (!post) {
      throw new Error('المنشور غير موجود');
    }

    const comment = db.insert('post_comments', {
      post_id: postId,
      user_id: userId,
      user_name: userName || 'طالب متميز',
      user_type: userType,
      content: content.trim()
    });

    post.comments_count = (post.comments_count || 0) + 1;
    db.update('posts', post.id, { comments_count: post.comments_count });

    return comment;
  }

  /**
   * Get teacher directory with follow and enrollment status
   */
  async getTeacherDirectory({ studentId = null, gradeLevel = null, subject = null } = {}) {
    let teachers = db.find('teacher_directory');

    if (subject && subject !== 'ALL') {
      teachers = teachers.filter(t => t.subject && t.subject.includes(subject));
    }

    const result = teachers.map(t => {
      let isFollowing = false;
      let isEnrolled = false;

      if (studentId) {
        const follow = db.findOne('teacher_follows', f => f.student_id === studentId && f.teacher_id === t.id);
        isFollowing = !!follow;

        // Check if student is enrolled in any group of this teacher
        const memberships = db.find('group_memberships', m => m.student_id === studentId && m.status === 'ACTIVE');
        for (const m of memberships) {
          const grp = db.findById('groups', m.group_id);
          if (grp && grp.teacher_id === t.id) {
            isEnrolled = true;
            break;
          }
        }
      }

      return {
        ...t,
        is_following: isFollowing,
        is_enrolled: isEnrolled
      };
    });

    return result;
  }

  /**
   * Follow a teacher
   */
  async followTeacher({ studentId, teacherId }) {
    if (!studentId || !teacherId) throw new Error('studentId and teacherId are required');

    const existing = db.findOne('teacher_follows', f => f.student_id === studentId && f.teacher_id === teacherId);
    if (existing) {
      return { status: 'ALREADY_FOLLOWING' };
    }

    db.insert('teacher_follows', {
      student_id: studentId,
      teacher_id: teacherId
    });

    // Increment directory count if present
    const dir = db.findById('teacher_directory', teacherId);
    if (dir) {
      dir.followers_count = (dir.followers_count || 0) + 1;
      db.update('teacher_directory', dir.id, { followers_count: dir.followers_count });
    }

    return { status: 'FOLLOWED', followers_count: dir ? dir.followers_count : 0 };
  }

  /**
   * Unfollow a teacher
   */
  async unfollowTeacher({ studentId, teacherId }) {
    const existing = db.findOne('teacher_follows', f => f.student_id === studentId && f.teacher_id === teacherId);
    if (existing) {
      db.delete('teacher_follows', existing.id);
    }

    const dir = db.findById('teacher_directory', teacherId);
    if (dir) {
      dir.followers_count = Math.max(0, (dir.followers_count || 1) - 1);
      db.update('teacher_directory', dir.id, { followers_count: dir.followers_count });
    }

    return { status: 'UNFOLLOWED', followers_count: dir ? dir.followers_count : 0 };
  }

  /**
   * Enroll a student with a teacher in a specific group
   */
  async enrollStudent({ studentId, teacherId, groupId }) {
    const student = db.findById('students', studentId);
    if (!student) throw new Error('الطالب غير مسجل');

    const group = db.findById('groups', groupId);
    if (!group) throw new Error('المجموعة الدراسية غير موجودة');

    const teacher = db.findById('teachers', teacherId) || db.findById('teachers', group.teacher_id);
    if (!teacher) throw new Error('المعلم غير موجود');

    // Check existing membership
    const existingMem = db.findOne('group_memberships', m => m.student_id === studentId && m.group_id === groupId);
    if (existingMem) {
      return {
        status: 'ALREADY_ENROLLED',
        message: 'أنت مسجل بالفعل في هذه المجموعة',
        group_name: group.name,
        teacher_name: teacher.full_name
      };
    }

    // Insert membership
    const membership = db.insert('group_memberships', {
      group_id: group.id,
      student_id: student.id,
      status: 'ACTIVE'
    });

    // Create Subscription
    const subscription = db.insert('subscriptions', {
      teacher_id: teacher.id,
      student_id: student.id,
      group_id: group.id,
      plan_type: 'MONTHLY',
      fee_amount: group.session_fee * 4,
      currency: 'EGP',
      status: 'ACTIVE',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 86400000).toISOString()
    });

    // Auto-follow teacher
    await this.followTeacher({ studentId: student.id, teacherId: teacher.id });

    return {
      status: 'ENROLLED_SUCCESSFULLY',
      message: `تم الانضمام بنجاح لمجموعة ${group.name} مع ${teacher.full_name}`,
      membership,
      subscription
    };
  }
}

module.exports = new CommunityService();
