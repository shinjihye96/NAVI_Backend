import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationCategory,
  NotificationType,
} from '../entities/notification.entity';
import { QueryNotificationDto } from './dto/query-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(data: {
    userId: string;
    category: NotificationCategory;
    type: NotificationType;
    title: string;
    message: string;
    referenceId?: string;
    referenceType?: string;
  }) {
    const notification = this.notificationRepository.create(data);
    await this.notificationRepository.save(notification);

    return {
      id: notification.id,
      category: notification.category,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      referenceId: notification.referenceId,
      referenceType: notification.referenceType,
      createdAt: notification.createdAt,
    };
  }

  async findAll(userId: string, queryDto: QueryNotificationDto) {
    const { category, page = 1, limit = 20 } = queryDto;

    const where: Record<string, unknown> = { userId };
    if (category) {
      where.category = category;
    }

    const [notifications, totalCount] =
      await this.notificationRepository.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

    const items = notifications.map((notification) => ({
      id: notification.id,
      category: notification.category,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      referenceId: notification.referenceId,
      referenceType: notification.referenceType,
      createdAt: notification.createdAt,
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getUnreadCount(userId: string) {
    const total = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    const dailyShare = await this.notificationRepository.count({
      where: {
        userId,
        isRead: false,
        category: NotificationCategory.DAILY_SHARE,
      },
    });

    const community = await this.notificationRepository.count({
      where: {
        userId,
        isRead: false,
        category: NotificationCategory.COMMUNITY,
      },
    });

    const medicalSupport = await this.notificationRepository.count({
      where: {
        userId,
        isRead: false,
        category: NotificationCategory.MEDICAL_SUPPORT,
      },
    });

    return {
      total,
      dailyShare,
      community,
      medicalSupport,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    notification.isRead = true;
    await this.notificationRepository.save(notification);

    return {
      id: notification.id,
      isRead: notification.isRead,
    };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );

    return { message: '모든 알림을 읽음 처리했습니다.' };
  }

  async remove(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    await this.notificationRepository.remove(notification);

    return { message: '알림이 삭제되었습니다.' };
  }
}
