/**
 * TEACHER OS — Business OS & Subscription Management Service
 */

const db = require('../../core/db');
const eventBus = require('../../core/events');
const SecurityEngine = require('../../core/security');

class BusinessOSService {
  /**
   * Create or renew a student subscription
   */
  async createSubscription(teacherId, { studentId, groupId, planType = 'MONTHLY', feeAmount = 600, durationDays = 30 }) {
    const student = db.findById('students', studentId);
    if (!student) throw new Error('Student not found');

    const startDate = new Date();
    const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const subscription = db.insert('subscriptions', {
      teacher_id: teacherId,
      student_id: studentId,
      group_id: groupId || null,
      plan_type: planType,
      fee_amount: Number(feeAmount),
      currency: 'EGP',
      status: 'ACTIVE',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });

    eventBus.emit('SUBSCRIPTION_CREATED', {
      teacherId,
      studentId,
      subscriptionId: subscription.id,
      amount: feeAmount
    });

    return subscription;
  }

  /**
   * Record a payment (Cash, InstaPay, Fawry)
   */
  async recordPayment(collectorUserId, { teacherId, studentId, subscriptionId, amount, paymentMethod = 'CASH', referenceId, notes }) {
    const validMethods = ['CASH', 'INSTAPAY', 'FAWRY', 'VODAFONE_CASH'];
    if (!validMethods.includes(paymentMethod)) {
      throw new Error(`Invalid payment method '${paymentMethod}'. Must be one of: ${validMethods.join(', ')}`);
    }

    const receiptNumber = 'REC-' + Math.floor(100000 + Math.random() * 900000);
    const payment = db.insert('payments', {
      teacher_id: teacherId,
      collector_user_id: collectorUserId,
      student_id: studentId,
      subscription_id: subscriptionId || null,
      amount: Number(amount),
      currency: 'EGP',
      payment_method: paymentMethod,
      reference_id: referenceId || null,
      receipt_number: receiptNumber,
      status: 'COMPLETED',
      notes: notes || null
    });

    // Automatically reactivate or extend student subscription upon settling payment
    const sub = subscriptionId 
      ? db.findById('subscriptions', subscriptionId) 
      : db.findOne('subscriptions', s => s.student_id === studentId);
    if (sub) {
      db.update('subscriptions', sub.id, {
        status: 'ACTIVE',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 86400000).toISOString()
      });
    }

    eventBus.emit('PAYMENT_RECORDED', {
      teacherId,
      collectorUserId,
      studentId,
      paymentId: payment.id,
      amount: Number(amount),
      paymentMethod,
      receiptNumber
    });

    return { ...payment, receiptNumber };
  }

  /**
   * Get teacher business overview & financial health metrics
   */
  async getBusinessOverview(teacherId, requestingUserRole = 'TEACHER') {
    // RBAC: Only TEACHER and ADMIN can view overall financial profit margins
    if (requestingUserRole === 'ASSISTANT') {
      const err = new Error('Access Forbidden: Assistants are not authorized to view aggregated business financial metrics.');
      err.statusCode = 403;
      throw err;
    }

    const subscriptions = db.find('subscriptions', s => s.teacher_id === teacherId);
    const payments = db.find('payments', p => p.teacher_id === teacherId);
    const groups = db.find('groups', g => g.teacher_id === teacherId);

    const now = new Date();
    const activeSubs = [];
    const expiringSubs = [];
    const expiredSubs = [];

    for (const sub of subscriptions) {
      const end = new Date(sub.end_date);
      const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      
      if (daysLeft < 0) {
        expiredSubs.push({ ...sub, daysLeft });
      } else if (daysLeft <= 5) {
        expiringSubs.push({ ...sub, daysLeft });
      } else {
        activeSubs.push({ ...sub, daysLeft });
      }
    }

    const totalRevenueEGP = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Group capacity stats
    let totalCapacity = 0;
    let totalEnrolled = 0;
    for (const g of groups) {
      const members = db.find('group_memberships', m => m.group_id === g.id && m.status === 'ACTIVE');
      totalCapacity += g.max_capacity;
      totalEnrolled += members.length;
    }

    return {
      financials: {
        totalRevenueEGP,
        totalPaymentsRecorded: payments.length,
        averagePaymentEGP: payments.length > 0 ? Math.round(totalRevenueEGP / payments.length) : 0
      },
      subscriptions: {
        totalActive: activeSubs.length,
        expiringWithin5Days: expiringSubs.length,
        expiredCount: expiredSubs.length,
        expiringList: expiringSubs.map(s => {
          const stu = db.findById('students', s.student_id);
          return {
            student_id: s.student_id,
            student_name: stu ? stu.full_name : '',
            parent_phone: stu ? stu.parent_phone : '',
            days_left: s.daysLeft,
            fee_amount: s.fee_amount
          };
        })
      },
      capacity: {
        totalSeats: totalCapacity,
        occupiedSeats: totalEnrolled,
        availableSeats: Math.max(0, totalCapacity - totalEnrolled),
        utilizationRatePct: totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0
      }
    };
  }
}

module.exports = new BusinessOSService();
